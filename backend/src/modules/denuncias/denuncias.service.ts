import { Injectable, NotFoundException } from '@nestjs/common';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDenunciaDto } from './dto/create-denuncia.dto';
import { UpdateDenunciaDto } from './dto/update-denuncia.dto';
import { mapDenunciaPublica, DenunciaPublica } from './denuncia.mapper';
import {
  QUEUE_COMPLAINT_ASSIGNMENT,
  JOB_ASSIGN_COMPLAINT,
  AssignComplaintJob,
} from '../queue/queue.constants';

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
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(QUEUE_COMPLAINT_ASSIGNMENT) private readonly assignmentQueue: Queue,
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

  async create(dto: CreateDenunciaDto & { autorId: string }): Promise<DenunciaPublica> {
    const denuncia = await this.prisma.denuncia.create({
      data: {
        titulo:      dto.titulo,
        descricao:   dto.descricao,
        categoria:   dto.categoria,
        endereco:    dto.endereco,
        lat:         dto.lat,
        lng:         dto.lng,
        autorId:     dto.autorId,
        imagemBytes: dto.imagemBytes,
        imagemMime:  dto.imagemMime,
        imagemUrl:   null,
      },
      include: DENUNCIA_LIST_INCLUDE,
    });

    await this.assignmentQueue.add(
      JOB_ASSIGN_COMPLAINT,
      { denunciaId: denuncia.id } satisfies AssignComplaintJob,
      {
        attempts:         3,
        backoff:          { type: 'exponential', delay: 3_000 },
        removeOnComplete: true,
      },
    );

    return mapDenunciaPublica(denuncia);
  }

  async update(id: string, dto: UpdateDenunciaDto) {
    await this.findOne(id);
    const updated = await this.prisma.denuncia.update({
      where: { id },
      data: dto,
      include: DENUNCIA_LIST_INCLUDE,
    });
    return mapDenunciaPublica({ ...updated, imagemBytes: null });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.denuncia.delete({ where: { id } });
  }
}
