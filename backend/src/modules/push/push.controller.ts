import { Controller, Post, Get, Body } from '@nestjs/common';
import { PushService } from './push.service';
import { SubscribeDto, SubscribeDenunciaDto } from './dto/subscribe.dto';
import { UnsubscribeDto } from './dto/unsubscribe.dto';

@Controller('push')
export class PushController {
  constructor(private readonly pushService: PushService) {}

  @Get('vapid-public-key')
  getVapidPublicKey() {
    return { publicKey: this.pushService.getVapidPublicKey() };
  }

  @Post('subscribe')
  subscribe(@Body() dto: SubscribeDto) {
    return this.pushService.saveSubscription(dto);
  }

  @Post('subscribe-denuncia')
  subscribeDenuncia(@Body() dto: SubscribeDenunciaDto) {
    if (!dto.denunciaId) return this.pushService.saveSubscription(dto);
    return this.pushService.saveSubscriptionForDenuncia(dto, dto.denunciaId);
  }

  @Post('unsubscribe')
  unsubscribe(@Body() dto: UnsubscribeDto) {
    return this.pushService.removeSubscription(dto);
  }
}
