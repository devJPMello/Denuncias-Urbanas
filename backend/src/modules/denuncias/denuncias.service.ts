import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDenunciaDto } from './dto/create-denuncia.dto';
import { UpdateDenunciaDto } from './dto/update-denuncia.dto';

@Injectable()
export class DenunciasService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.denuncia.findMany({
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

  create(dto: CreateDenunciaDto & { autorId: string }) {
    return this.prisma.denuncia.create({
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
