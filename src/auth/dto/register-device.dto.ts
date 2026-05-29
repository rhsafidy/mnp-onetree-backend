// src/auth/dto/register-device.dto.ts
import { IsString, IsOptional } from 'class-validator';
export class RegisterDeviceDto {
  @IsString() deviceId: string; // Android ID
  @IsOptional() @IsString() deviceName?: string;
}
