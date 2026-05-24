import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateDenunciaDto } from './create-denuncia.dto';

export enum StatusDenuncia {
  ABERTO    = 'aberto',
  ANALISE   = 'analise',
  RESOLVIDO = 'resolvido',
  CANCELADO = 'cancelado',
}

export class UpdateDenunciaDto extends PartialType(CreateDenunciaDto) {
  @IsEnum(StatusDenuncia)
  @IsOptional()
  status?: StatusDenuncia;
}
