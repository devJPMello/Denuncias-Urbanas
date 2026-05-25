import { Transform } from 'class-transformer';
import { IsString, IsNotEmpty, IsEnum, IsOptional, IsNumber } from 'class-validator';

export enum CategoriaDenuncia {
  BURACO     = 'buraco',
  ILUMINACAO = 'iluminacao',
  LIXO       = 'lixo',
  CALCADA    = 'calcada',
  VANDALISMO = 'vandalismo',
  OUTROS     = 'outros',
}

export class CreateDenunciaDto {
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsString()
  @IsNotEmpty()
  descricao: string;

  @IsEnum(CategoriaDenuncia)
  categoria: CategoriaDenuncia;

  @IsString()
  @IsNotEmpty()
  endereco: string;

  @Transform(({ value }) => {
    if (value === '' || value === undefined || value === null) return undefined;
    const n = Number(value);
    return Number.isFinite(n) ? n : undefined;
  })
  @IsNumber()
  @IsOptional()
  lat?: number;

  @Transform(({ value }) => {
    if (value === '' || value === undefined || value === null) return undefined;
    const n = Number(value);
    return Number.isFinite(n) ? n : undefined;
  })
  @IsNumber()
  @IsOptional()
  lng?: number;

  /** Preenchido pelo controller — não enviar no body */
  autorId?: string;
  imagemBytes?: Buffer;
  imagemMime?: string;
}
