// src/sync/sync.module.ts
import { Module }         from '@nestjs/common';
import { SyncService }    from './sync.service';
import { SyncController } from './sync.controller';
import { TreesModule }    from '../trees/trees.module';
import { TouristsModule } from '../tourists/tourists.module';

@Module({
  imports:     [TreesModule, TouristsModule],
  controllers: [SyncController],
  providers:   [SyncService],
})
export class SyncModule {}
