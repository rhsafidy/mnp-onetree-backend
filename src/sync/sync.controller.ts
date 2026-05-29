// src/sync/sync.controller.ts
//
// CORRECTIF : suppression du @UseGuards(JwtAuthGuard) au niveau classe.
// Il bloquait toutes les requêtes mobiles AVANT que DeviceTokenGuard ne s'exécute.
// Un seul guard suffit : DeviceTokenGuard, qui attache req.user lui-même.

import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { SyncService } from './sync.service';
import { SyncPayloadDto } from './dto/sync-payload.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { DeviceTokenGuard } from '../auth/guards/device-token.guard';

@ApiTags('sync')
@ApiBearerAuth()
@UseGuards(DeviceTokenGuard) // ← seul guard, gère auth ET injection de req.user
@Controller('sync')
export class SyncController {
  constructor(private readonly sync: SyncService) {}

  @Post('push')
  @ApiOperation({ summary: 'Push offline queue' })
  push(@Body() dto: SyncPayloadDto, @CurrentUser() user: any) {
    return this.sync.processBatch(dto, user.id);
  }

  @Get('pull')
  @ApiQuery({ name: 'since', required: false })
  @ApiOperation({ summary: 'Pull latest data since a given timestamp' })
  pull(@Query('since') since?: string) {
    return this.sync.getPullData(since);
  }
}
