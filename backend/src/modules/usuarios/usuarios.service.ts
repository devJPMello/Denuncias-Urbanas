import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: string) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id } });
    if (!usuario) throw new NotFoundException(`Usuário #${id} não encontrado`);
    return usuario;
  }

  findByEmail(email: string) {
    return this.prisma.usuario.findUnique({ where: { email } });
  }

  create(data: Prisma.UsuarioCreateInput) {
    return this.prisma.usuario.create({ data });
  }

  update(id: string, data: Prisma.UsuarioUpdateInput) {
    return this.prisma.usuario.update({ where: { id }, data });
  }
}
