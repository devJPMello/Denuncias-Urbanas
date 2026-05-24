import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: string) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id } });
    if (!usuario) throw new NotFoundException(`Usuário #${id} não encontrado`);
    return usuario;
  }

  findByClerkId(clerkId: string) {
    return this.prisma.usuario.findUnique({ where: { clerkId } });
  }

  create(dto: CreateUsuarioDto) {
    return this.prisma.usuario.create({ data: dto });
  }

  /** Retorna o usuário existente ou cria um novo na primeira autenticação. */
  async findOrCreate(dto: CreateUsuarioDto) {
    const existing = await this.findByClerkId(dto.clerkId);
    if (existing) return existing;
    return this.create(dto);
  }
}
