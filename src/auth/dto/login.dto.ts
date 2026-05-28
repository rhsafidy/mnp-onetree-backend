import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class LoginDto {
  @ApiProperty({ example: 'agent@mnp.mg' }) @IsEmail() email: string;
  @ApiProperty({ example: 'MNP@2026' }) @IsString() @MinLength(6) password: string;
}
