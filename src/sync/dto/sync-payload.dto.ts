// src/sync/dto/sync-payload.dto.ts
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SyncEntryDto {
  @ApiProperty({ enum: ['CREATE','UPDATE','UPLOAD_PHOTO','DELETE'] })
  @IsString() typeAction: string;

  @ApiProperty({ enum: ['trees','tourists','parcels'] })
  @IsString() tableTarget: string;

  @ApiProperty() @IsString() entityId: string;

  @ApiProperty({ description: 'JSON string of the entity payload' })
  @IsString() payloadJson: string;
}

export class SyncPayloadDto {
  @ApiProperty({ description: 'Device/agent identifier from mobile' })
  @IsString() deviceId: string;

  @ApiProperty({ type: [SyncEntryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncEntryDto)
  entries: SyncEntryDto[];
}

export class SyncResultDto {
  synced:  number;
  failed:  number;
  errors:  { entityId: string; error: string }[];
  syncedAt: string;
}
