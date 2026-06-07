import { IsString, IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUsuarioDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  senha: string;
}
