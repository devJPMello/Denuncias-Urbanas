import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';

export enum CategoriaDenuncia {
  BURACO = 'buraco',
  ILUMINACAO = 'iluminacao',
  LIXO = 'lixo',
  VANDALISMO = 'vandalismo',
  OUTROS = 'outros',
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
}
