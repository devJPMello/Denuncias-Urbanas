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

  @IsString()
  @IsOptional()
  imagemUrl?: string;

  @IsNumber()
  @IsOptional()
  lat?: number;

  @IsNumber()
  @IsOptional()
  lng?: number;

  /** Preenchido pelo guard JWT — não expor no body */
  autorId?: string;
}
