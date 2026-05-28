// src/parcels/dto/create-parcel.dto.ts
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateParcelDto {
  @ApiProperty()            @IsString()           name: string;
  @ApiProperty()            @IsString()           code: string;
  @ApiPropertyOptional()    @IsOptional() @IsString()  park?: string;
  @ApiPropertyOptional()    @IsOptional() @IsNumber()  areaHa?: number;
  @ApiPropertyOptional()    @IsOptional() @IsNumber()  latitude?: number;
  @ApiPropertyOptional()    @IsOptional() @IsNumber()  longitude?: number;
  @ApiPropertyOptional()    @IsOptional() @IsString()  notes?: string;
  @ApiPropertyOptional()    @IsOptional() @IsString()  shapefileName?: string;
}
