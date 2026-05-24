import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { PushService } from './push.service';
import { SubscribeDto } from './dto/subscribe.dto';
import { UnsubscribeDto } from './dto/unsubscribe.dto';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Usuario } from '@prisma/client';

@Controller('push')
export class PushController {
  constructor(private readonly pushService: PushService) {}

  /** Retorna a chave pública VAPID — chamada pelo frontend antes de subscribar. */
  @Get('vapid-public-key')
  getVapidPublicKey() {
    return { publicKey: this.pushService.getVapidPublicKey() };
  }

  /** Salva a subscription do dispositivo para o usuário autenticado. */
  @Post('subscribe')
  @UseGuards(ClerkAuthGuard)
  subscribe(@CurrentUser() user: Usuario, @Body() dto: SubscribeDto) {
    return this.pushService.saveSubscription(user.id, dto);
  }

  /** Remove a subscription (logout ou revogação de permissão). */
  @Post('unsubscribe')
  @UseGuards(ClerkAuthGuard)
  unsubscribe(@Body() dto: UnsubscribeDto) {
    return this.pushService.removeSubscription(dto);
  }
}
