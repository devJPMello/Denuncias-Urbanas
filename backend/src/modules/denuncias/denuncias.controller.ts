import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { DenunciasService } from './denuncias.service';
import { CreateDenunciaDto } from './dto/create-denuncia.dto';
import { UpdateDenunciaDto } from './dto/update-denuncia.dto';

@Controller('denuncias')
export class DenunciasController {
  constructor(private readonly denunciasService: DenunciasService) {}

  @Get()
  findAll() {
    return this.denunciasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.denunciasService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateDenunciaDto) {
    // autorId virá do JWT guard em epic futuro; placeholder por enquanto
    return this.denunciasService.create({ ...dto, autorId: dto.autorId ?? '' });
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
