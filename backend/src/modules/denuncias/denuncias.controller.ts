import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { DenunciasService } from './denuncias.service';
import { CreateDenunciaDto } from './dto/create-denuncia.dto';
import { UpdateDenunciaDto } from './dto/update-denuncia.dto';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { AdminGuard }     from '../auth/guards/admin.guard';
import { CurrentUser }    from '../auth/decorators/current-user.decorator';
import type { Usuario }   from '@prisma/client';

@Controller('denuncias')
export class DenunciasController {
  constructor(private readonly denunciasService: DenunciasService) {}

  /** Lista pública com paginação opcional (?limit=100&page=1). */
  @Get()
  findAll(
    @Query('limit') limit?: string,
    @Query('page')  page?: string,
  ) {
    return this.denunciasService.findAll({
      limit: limit ? Math.min(+limit, 500) : 100,
      page:  page  ? +page : 1,
    });
  }

  /** Retorna apenas as denúncias do usuário autenticado.
   *  DEVE ficar antes de :id para não ser capturado como parâmetro. */
  @UseGuards(ClerkAuthGuard)
  @Get('mine')
  findMine(@CurrentUser() user: Usuario) {
    return this.denunciasService.findByAutorId(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.denunciasService.findOne(id);
  }

  @UseGuards(ClerkAuthGuard)
  @Post()
  create(@Body() dto: CreateDenunciaDto, @CurrentUser() user: Usuario) {
    return this.denunciasService.create({ ...dto, autorId: user.id });
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDenunciaDto) {
    return this.denunciasService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.denunciasService.remove(id);
  }
}
