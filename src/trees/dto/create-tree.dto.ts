// src/trees/dto/create-tree.dto.ts
import { IsDateString, IsIn, IsInt, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTreeDto {
  @ApiProperty({ example: 'QR-00001' })
  @IsString() externalId: string;

  @ApiPropertyOptional() @IsOptional() @IsString()  speciesScientific?: string;
  @ApiPropertyOptional() @IsOptional() @IsString()  speciesVernacular?: string;
  @ApiPropertyOptional() @IsOptional() @IsString()  planterName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString()  planterFunction?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() plantationDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString()  area?: string;
  @ApiPropertyOptional() @IsOptional() @IsString()  family?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt()     heightCm?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt()     holeNumber?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber()  latitude?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber()  longitude?: number;
  @ApiPropertyOptional() @IsOptional() @IsString()  notes?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID()    parcelId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID()    touristId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID()    plantedByUserId?: string;

  @ApiPropertyOptional({ enum: ['pending','planted','monitored','dead','replaced'] })
  @IsOptional()
  @IsIn(['pending','planted','monitored','dead','replaced'])
  healthStatus?: string;
}
