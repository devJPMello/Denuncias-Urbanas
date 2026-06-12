import { IsOptional, IsString, IsUrl, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class PushKeysDto {
  @IsString()
  p256dh: string;

  @IsString()
  auth: string;
}

export class SubscribeDto {
  @IsUrl()
  endpoint: string;

  @ValidateNested()
  @Type(() => PushKeysDto)
  keys: PushKeysDto;
}

export class SubscribeDenunciaDto extends SubscribeDto {
  @IsString()
  @IsOptional()
  denunciaId?: string;
}
