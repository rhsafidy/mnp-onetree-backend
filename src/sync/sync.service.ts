// src/sync/sync.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService }    from '../prisma/prisma.service';
import { TreesService }     from '../trees/trees.service';
import { TouristsService }  from '../tourists/tourists.service';
import { SyncPayloadDto, SyncResultDto } from './dto/sync-payload.dto';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    private readonly prisma:    PrismaService,
    private readonly trees:     TreesService,
    private readonly tourists:  TouristsService,
  ) {}

  async processBatch(
    payload: SyncPayloadDto,
    agentId: string,
  ): Promise<SyncResultDto> {
    let synced = 0;
    const errors: { entityId: string; error: string }[] = [];

    for (const entry of payload.entries) {
      try {
        const data = JSON.parse(entry.payloadJson);

        switch (`${entry.typeAction}:${entry.tableTarget}`) {

          // ── Trees ────────────────────────────────────────────────────
          case 'CREATE:trees':
            await this._upsertTree(data, agentId);
            break;

          case 'UPDATE:trees':
            await this._updateTree(entry.entityId, data);
            break;

          // ── Tourists ─────────────────────────────────────────────────
          case 'CREATE:tourists':
            await this._upsertTourist(data);
            break;

          case 'UPDATE:tourists':
            await this.tourists.update(entry.entityId, data);
            break;

          // ── Parcels (read-only from mobile, no sync needed) ───────────
          case 'CREATE:parcels':
          case 'UPDATE:parcels':
            this.logger.warn(`Parcel sync ignored (managed server-side): ${entry.entityId}`);
            break;

          default:
            this.logger.warn(`Unknown sync action: ${entry.typeAction}:${entry.tableTarget}`);
        }

        synced++;
      } catch (e: any) {
        this.logger.error(`Sync failed for ${entry.entityId}: ${e.message}`);
        errors.push({ entityId: entry.entityId, error: e.message });
      }
    }

    // ── Log sync session ──────────────────────────────────────────────────
    await this.prisma.syncLog.create({
      data: {
        deviceId:    payload.deviceId,
        recordCount: payload.entries.length,
        actions:     [...new Set(payload.entries.map(e => e.typeAction))].join(','),
        status:      errors.length === 0 ? 'success' : errors.length < payload.entries.length ? 'partial' : 'failed',
      },
    });

    return { synced, failed: errors.length, errors, syncedAt: new Date().toISOString() };
  }

  // ── Get latest data for mobile to pull (full refresh) ─────────────────────
  async getPullData(since?: string) {
    const sinceDate = since ? new Date(since) : new Date(0);

    const [trees, parcels, tourists] = await Promise.all([
      this.prisma.tree.findMany({
        where:   { updatedAt: { gt: sinceDate } },
        include: { photos: true, tourist: true },
        orderBy: { updatedAt: 'asc' },
      }),
      this.prisma.parcel.findMany({
        where:   { updatedAt: { gt: sinceDate } },
        orderBy: { updatedAt: 'asc' },
      }),
      this.prisma.tourist.findMany({
        where:   { createdAt: { gt: sinceDate } },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    return {
      trees,
      parcels,
      tourists,
      pulledAt: new Date().toISOString(),
    };
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private async _upsertTree(data: any, agentId: string) {
    const { id, syncPending, sync_pending, createdAt, updatedAt, ...rest } = data;

    return this.prisma.tree.upsert({
      where:  { externalId: rest.external_id ?? rest.externalId },
      create: {
        id:               id,
        externalId:       rest.external_id ?? rest.externalId,
        speciesScientific: rest.species_scientific ?? rest.speciesScientific,
        speciesVernacular: rest.species_vernacular ?? rest.speciesVernacular,
        planterName:      rest.planter_name ?? rest.planterName,
        planterFunction:  rest.planter_function ?? rest.planterFunction,
        plantationDate:   rest.plantation_date ? new Date(rest.plantation_date) : rest.plantationDate ? new Date(rest.plantationDate) : null,
        heightCm:         rest.height_cm ?? rest.heightCm,
        holeNumber:       rest.hole_number ?? rest.holeNumber,
        healthStatus:     rest.health_status ?? rest.healthStatus ?? 'pending',
        latitude:         rest.latitude,
        longitude:        rest.longitude,
        notes:            rest.notes,
        parcelId:         rest.parcel_id ?? rest.parcelId,
        touristId:        rest.tourist_id ?? rest.touristId,
        plantedByUserId:  rest.planted_by_user_id ?? rest.plantedByUserId ?? agentId,
      },
      update: {
        heightCm:        rest.height_cm ?? rest.heightCm,
        healthStatus:    rest.health_status ?? rest.healthStatus,
        latitude:        rest.latitude,
        longitude:       rest.longitude,
        notes:           rest.notes,
        plantationDate:  rest.plantation_date ? new Date(rest.plantation_date) : undefined,
        touristId:       rest.tourist_id ?? rest.touristId,
        plantedByUserId: rest.planted_by_user_id ?? rest.plantedByUserId ?? agentId,
      },
    });
  }

  private async _updateTree(id: string, data: any) {
    const exists = await this.prisma.tree.findUnique({ where: { id } });
    if (!exists) return this._upsertTree({ id, ...data }, data.plantedByUserId ?? '');

    return this.prisma.tree.update({
      where: { id },
      data:  {
        heightCm:     data.height_cm ?? data.heightCm,
        healthStatus: data.health_status ?? data.healthStatus,
        latitude:     data.latitude,
        longitude:    data.longitude,
        notes:        data.notes,
        touristId:    data.tourist_id ?? data.touristId,
      },
    });
  }

  private async _upsertTourist(data: any) {
    const { id, syncPending, sync_pending, createdAt, ...rest } = data;
    return this.prisma.tourist.upsert({
      where:  { id: id ?? 'nonexistent' },
      create: {
        id,
        name:        rest.name,
        email:       rest.email,
        nationality: rest.nationality,
        phone:       rest.phone,
      },
      update: {
        name:        rest.name,
        email:       rest.email,
        nationality: rest.nationality,
        phone:       rest.phone,
      },
    });
  }
}
