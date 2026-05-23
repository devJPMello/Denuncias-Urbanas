import { PartialType } from '@nestjs/mapped-types';
import { CreateDenunciaDto } from './create-denuncia.dto';

export class UpdateDenunciaDto extends PartialType(CreateDenunciaDto) {}
