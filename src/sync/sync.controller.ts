// src/sync/sync.controller.ts
import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SyncService }      from './sync.service';
import { SyncPayloadDto }   from './dto/sync-payload.dto';
import { JwtAuthGuard }     from '../auth/guards/jwt-auth.guard';
import { CurrentUser }      from '../auth/decorators/current-user.decorator';

@ApiTags('sync')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sync')
export class SyncController {
  constructor(private readonly sync: SyncService) {}

  /**
   * PUSH — Mobile sends its pending queue entries to the server.
   * The server processes each entry (upsert trees, tourists, etc.)
   * and returns a result summary.
   */
  @Post('push')
  @ApiOperation({
    summary: 'Push pending offline data from mobile to server',
    description:
      'Mobile sends its sync_queue entries. Server processes them and returns synced/failed counts.',
  })
  push(@Body() dto: SyncPayloadDto, @CurrentUser() user: any) {
    return this.sync.processBatch(dto, user.id);
  }

  /**
   * PULL — Mobile fetches all records updated since a given timestamp.
   * Used on first launch or after a long offline period.
   */
  @Get('pull')
  @ApiOperation({
    summary: 'Pull latest data from server to mobile',
    description:
      'Returns trees, parcels and tourists updated since the given timestamp.',
  })
  @ApiQuery({
    name:        'since',
    required:    false,
    description: 'ISO 8601 timestamp. Returns records updated after this date.',
    example:     '2026-04-01T00:00:00.000Z',
  })
  pull(@Query('since') since?: string) {
    return this.sync.getPullData(since);
  }
}
