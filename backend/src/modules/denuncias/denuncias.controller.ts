import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  UseGuards, UseInterceptors, UploadedFile, BadRequestException, NotFoundException, Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Response } from 'express';
import { DenunciasService } from './denuncias.service';
import { CreateDenunciaDto } from './dto/create-denuncia.dto';
import { UpdateDenunciaDto } from './dto/update-denuncia.dto';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { Usuario } from '@prisma/client';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

@Controller('denuncias')
export class DenunciasController {
  constructor(private readonly denunciasService: DenunciasService) {}

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

  @UseGuards(ClerkAuthGuard)
  @Get('mine')
  findMine(@CurrentUser() user: Usuario) {
    return this.denunciasService.findByAutorId(user.id);
  }

  @Get(':id/imagem')
  async getImagem(@Param('id') id: string, @Res() res: Response) {
    const img = await this.denunciasService.getImagem(id);
    if (!img) throw new NotFoundException('Imagem não encontrada');
    res.setHeader('Content-Type', img.mime);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(img.buffer);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.denunciasService.findOne(id);
  }

  @UseGuards(ClerkAuthGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor('imagem', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_IMAGE_BYTES },
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new BadRequestException('Apenas imagens são permitidas'), false);
        }
        cb(null, true);
      },
    }),
  )
  create(
    @Body() dto: CreateDenunciaDto,
    @UploadedFile() file: Express.Multer.File | undefined,
    @CurrentUser() user: Usuario,
  ) {
    return this.denunciasService.create({
      ...dto,
      autorId: user.id,
      imagemBytes: file?.buffer,
      imagemMime:  file?.mimetype,
    });
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
