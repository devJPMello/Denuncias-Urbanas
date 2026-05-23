import { Injectable } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';

@Injectable()
export class UsuariosService {
  findOne(id: number) {
    return { id };
  }

  create(createUsuarioDto: CreateUsuarioDto) {
    return createUsuarioDto;
  }
}
