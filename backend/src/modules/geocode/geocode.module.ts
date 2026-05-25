import { Global, Module } from '@nestjs/common';
import { GeocodeService } from './geocode.service';

@Global()
@Module({
  providers: [GeocodeService],
  exports:   [GeocodeService],
})
export class GeocodeModule {}
