import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDenunciaDto } from './dto/create-denuncia.dto';
import { UpdateDenunciaDto } from './dto/update-denuncia.dto';
import {
  QUEUE_COMPLAINT_ASSIGNMENT,
  JOB_ASSIGN_COMPLAINT,
  AssignComplaintJob,
} from '../queue/queue.constants';

@Injectable()
export class DenunciasService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(QUEUE_COMPLAINT_ASSIGNMENT) private readonly assignmentQueue: Queue,
  ) {}

  findAll() {
    return this.prisma.denuncia.findMany({
      include: { autor: { select: { id: true, nome: true, email: true } } },
      orderBy: { criadoEm: 'desc' },
    });
  }

  findByAutorId(autorId: string) {
    return this.prisma.denuncia.findMany({
      where: { autorId },
      include: { autor: { select: { id: true, nome: true, email: true } } },
      orderBy: { criadoEm: 'desc' },
    });
  }

  async findOne(id: string) {
    const denuncia = await this.prisma.denuncia.findUnique({
      where: { id },
      include: { autor: { select: { id: true, nome: true, email: true } } },
    });
    if (!denuncia) throw new NotFoundException(`Denúncia #${id} não encontrada`);
    return denuncia;
  }

  async create(dto: CreateDenunciaDto & { autorId: string }) {
    const denuncia = await this.prisma.denuncia.create({
      data: {
        titulo:    dto.titulo,
        descricao: dto.descricao,
        categoria: dto.categoria,
        endereco:  dto.endereco,
        imagemUrl: dto.imagemUrl,
        lat:       dto.lat,
        lng:       dto.lng,
        autorId:   dto.autorId,
      },
    });

    // Enfileira para atribuição automática (muda status + notifica o autor)
    await this.assignmentQueue.add(
      JOB_ASSIGN_COMPLAINT,
      { denunciaId: denuncia.id } satisfies AssignComplaintJob,
      {
        attempts:         3,
        backoff:          { type: 'exponential', delay: 3_000 },
        removeOnComplete: true,
      },
    );

    return denuncia;
  }

  async update(id: string, dto: UpdateDenunciaDto) {
    await this.findOne(id);
    return this.prisma.denuncia.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.denuncia.delete({ where: { id } });
  }
}
