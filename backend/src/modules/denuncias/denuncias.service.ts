import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Prisma, StatusDenuncia } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDenunciaDto } from './dto/create-denuncia.dto';
import { UpdateDenunciaDto } from './dto/update-denuncia.dto';
import { mapDenunciaPublica, DenunciaPublica } from './denuncia.mapper';
import {
  QUEUE_PUSH_NOTIFICATION,
  JOB_SEND_PUSH,
  SendPushJob,
} from '../queue/queue.constants';
import { GeocodeService } from '../geocode/geocode.service';
import { NotificationsService } from '../notifications/notifications.service';

const DENUNCIA_LIST_INCLUDE = {
  autor: { select: { id: true, nome: true, email: true } },
} satisfies Prisma.DenunciaInclude;

/** Select sem imagemBytes — listagens não carregam o binário. */
const DENUNCIA_LIST_SELECT = {
  id: true,
  titulo: true,
  descricao: true,
  categoria: true,
  endereco: true,
  imagemUrl: true,
  imagemMime: true,
  status: true,
  lat: true,
  lng: true,
  autorId: true,
  criadoEm: true,
  atualizadoEm: true,
  autor: { select: { id: true, nome: true, email: true } },
} satisfies Prisma.DenunciaSelect;

@Injectable()
export class DenunciasService {
  private readonly logger = new Logger(DenunciasService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly geocode: GeocodeService,
    private readonly notifications: NotificationsService,
    @InjectQueue(QUEUE_PUSH_NOTIFICATION) private readonly pushQueue: Queue,
  ) {}

  findAll({ limit = 100, page = 1 }: { limit?: number; page?: number } = {}) {
    return this.prisma.denuncia
      .findMany({
        select: DENUNCIA_LIST_SELECT,
        orderBy: { criadoEm: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      })
      .then((rows) => rows.map((r) => mapDenunciaPublica({ ...r, imagemBytes: null })));
  }

  findByAutorId(autorId: string) {
    return this.prisma.denuncia
      .findMany({
        where: { autorId },
        select: DENUNCIA_LIST_SELECT,
        orderBy: { criadoEm: 'desc' },
      })
      .then((rows) => rows.map((r) => mapDenunciaPublica({ ...r, imagemBytes: null })));
  }

  async findOne(id: string): Promise<DenunciaPublica> {
    const denuncia = await this.prisma.denuncia.findUnique({
      where: { id },
      include: DENUNCIA_LIST_INCLUDE,
    });
    if (!denuncia) throw new NotFoundException(`Denúncia #${id} não encontrada`);

    return mapDenunciaPublica(denuncia);
  }

  /** Retorna bytes da imagem armazenada no banco (ou null). */
  async geocodeAddress(address: string) {
    const coords = await this.geocode.resolve(address);
    if (!coords) {
      throw new BadRequestException('Endereço não encontrado em Palmas. Tente "305 Sul" ou "103 Norte".');
    }
    return coords;
  }

  async getImagem(id: string): Promise<{ buffer: Buffer; mime: string } | null> {
    const row = await this.prisma.denuncia.findUnique({
      where: { id },
      select: { imagemBytes: true, imagemMime: true, imagemUrl: true },
    });
    if (!row) return null;

    if (row.imagemBytes && row.imagemBytes.length > 0) {
      return {
        buffer: Buffer.from(row.imagemBytes),
        mime:   row.imagemMime ?? 'image/jpeg',
      };
    }

    // Legado: arquivo em backend/uploads/ (antes de guardar no banco)
    if (row.imagemUrl?.startsWith('/uploads/')) {
      const filePath = join(__dirname, '..', '..', '..', row.imagemUrl);
      if (existsSync(filePath)) {
        const buffer = await readFile(filePath);
        const ext = row.imagemUrl.split('.').pop()?.toLowerCase();
        const mime =
          ext === 'png'  ? 'image/png'
          : ext === 'webp' ? 'image/webp'
          : ext === 'gif'  ? 'image/gif'
          : 'image/jpeg';
        return { buffer, mime };
      }
    }

    return null;
  }

  async create(dto: CreateDenunciaDto & { autorId?: string }): Promise<DenunciaPublica> {
    const coords = await this.resolveCoordinates(dto.endereco, dto.lat, dto.lng);

    const denuncia = await this.prisma.denuncia.create({
      data: {
        titulo:      dto.titulo,
        descricao:   dto.descricao,
        categoria:   dto.categoria,
        endereco:    dto.endereco,
        lat:         coords.lat,
        lng:         coords.lng,
        autorId:     dto.autorId ?? null,
        imagemBytes: dto.imagemBytes,
        imagemMime:  dto.imagemMime,
        imagemUrl:   null,
      },
      include: DENUNCIA_LIST_INCLUDE,
    });

    this.notifications.emitComplaintCreated(denuncia.id);
    if (denuncia.autorId) await this.notifyCitizenRegistered(denuncia as { id: string; titulo: string; autorId: string; criadoEm: Date });

    return mapDenunciaPublica(denuncia);
  }

  async update(id: string, dto: UpdateDenunciaDto) {
    const before = await this.prisma.denuncia.findUnique({ where: { id } });
    if (!before) throw new NotFoundException(`Denúncia #${id} não encontrada`);

    const updated = await this.prisma.denuncia.update({
      where: { id },
      data: dto,
      include: DENUNCIA_LIST_INCLUDE,
    });

    if (dto.status && dto.status !== before.status && updated.autorId) {
      await this.notifyCitizenOnStatusChange(updated as { id: string; titulo: string; autorId: string; status: StatusDenuncia; atualizadoEm: Date }, dto.status);
    }

    return mapDenunciaPublica({ ...updated, imagemBytes: null });
  }

  /** Cidadão: denúncia criada em aberto (sem passar automático para análise). */
  private async notifyCitizenRegistered(denuncia: {
    id: string;
    titulo: string;
    autorId: string;
    criadoEm: Date;
  }): Promise<void> {
    const title = '📋 Denúncia registrada';
    const body  =
      `Sua denúncia "${denuncia.titulo}" foi registrada e aguarda análise da prefeitura.`;

    this.notifications.emitComplaintUpdate(
      denuncia.autorId,
      denuncia.id,
      'aberto',
      denuncia.criadoEm,
    );
    this.notifications.emitNotification(
      denuncia.autorId,
      title,
      body,
      denuncia.id,
    );

    this.enqueuePush({
      usuarioId: denuncia.autorId,
      titulo:    title,
      mensagem:  body,
      url:       '/',
    });
  }

  /** WebSocket + sino + push quando o status muda no painel municipal. */
  private async notifyCitizenOnStatusChange(
    denuncia: {
      id: string;
      titulo: string;
      autorId: string;
      status: StatusDenuncia;
      atualizadoEm: Date;
    },
    status: StatusDenuncia,
  ): Promise<void> {
    this.notifications.emitComplaintUpdate(
      denuncia.autorId,
      denuncia.id,
      status,
      denuncia.atualizadoEm,
    );

    const messages: Partial<
      Record<StatusDenuncia, { title: string; body: string }>
    > = {
      resolvido: {
        title: '✅ Denúncia resolvida',
        body:  `Sua denúncia "${denuncia.titulo}" foi concluída pela equipe municipal.`,
      },
      cancelado: {
        title: 'Denúncia encerrada',
        body:  `Sua denúncia "${denuncia.titulo}" foi encerrada.`,
      },
      analise: {
        title: '📋 Denúncia em análise',
        body:  `Sua denúncia "${denuncia.titulo}" está em análise.`,
      },
      aberto: {
        title: 'Denúncia reaberta',
        body:  `Sua denúncia "${denuncia.titulo}" voltou para a fila.`,
      },
    };

    const msg = messages[status];
    if (!msg) return;

    this.notifications.emitNotification(
      denuncia.autorId,
      msg.title,
      msg.body,
      denuncia.id,
    );

    const pushPayload: SendPushJob = {
      usuarioId: denuncia.autorId,
      titulo:    msg.title,
      mensagem:  msg.body,
      url:       '/',
    };

    this.enqueuePush(pushPayload);
  }

  /** Push em background — não bloqueia a API (sino usa WebSocket imediato). */
  private enqueuePush(payload: SendPushJob): void {
    void this.pushQueue
      .add(JOB_SEND_PUSH, payload, {
        attempts:         3,
        backoff:          { type: 'exponential', delay: 2_000 },
        removeOnComplete: true,
      })
      .catch((err: Error) =>
        this.logger.warn(`Push enfileirado falhou (Redis?): ${err.message}`),
      );
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.denuncia.delete({ where: { id } });
  }

  /**
   * Coordenadas vêm do endereço (geocoding no servidor).
   * lat/lng do cliente só entram se o usuário ajustou o pin no mapa (ambos enviados).
   */
  private async resolveCoordinates(
    endereco: string,
    clientLat?: number,
    clientLng?: number,
  ): Promise<{ lat: number; lng: number }> {
    const geocoded = await this.geocode.resolve(endereco);

    const hasClientPin =
      clientLat != null &&
      clientLng != null &&
      Number.isFinite(clientLat) &&
      Number.isFinite(clientLng);

    if (geocoded) {
      if (hasClientPin) {
        const dLat = Math.abs(geocoded.lat - clientLat);
        const dLng = Math.abs(geocoded.lng - clientLng);
        if (dLat > 0.002 || dLng > 0.002) {
          return { lat: clientLat, lng: clientLng };
        }
      }
      return { lat: geocoded.lat, lng: geocoded.lng };
    }

    if (hasClientPin) {
      return { lat: clientLat, lng: clientLng };
    }

    throw new BadRequestException(
      'Não foi possível localizar o endereço no mapa. Use o pin no mapa ou inclua quadra e setor (ex: 305 Sul, Palmas).',
    );
  }
}
