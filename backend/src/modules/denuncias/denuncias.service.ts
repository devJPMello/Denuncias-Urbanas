import { Injectable } from '@nestjs/common';
import { CreateDenunciaDto } from './dto/create-denuncia.dto';
import { UpdateDenunciaDto } from './dto/update-denuncia.dto';

@Injectable()
export class DenunciasService {
  findAll() {
    return [];
  }

  findOne(id: number) {
    return { id };
  }

  create(createDenunciaDto: CreateDenunciaDto) {
    return createDenunciaDto;
  }

  update(id: number, updateDenunciaDto: UpdateDenunciaDto) {
    return { id, ...updateDenunciaDto };
  }

  remove(id: number) {
    return { id };
  }
}
