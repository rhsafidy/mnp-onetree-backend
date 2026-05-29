// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
} from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import { RegisterDeviceDto } from './dto/register-device.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: 'Login with email + password → returns JWT tokens' })
  login(@Request() req: any, @Body() _dto: LoginDto) {
    return this.auth.login(req.user);
  }

  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  refresh(@Body() dto: RefreshDto) {
    return this.auth.refreshToken(dto.refreshToken);
  }

  @Post('logout')
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Invalidate refresh token' })
  logout(@Body() dto: RefreshDto) {
    return this.auth.logout(dto.refreshToken);
  }

  // src/auth/auth.controller.ts — ajouter cette route

  @Post('device/register')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Register a mobile device and get a long-lived device token',
  })
  async registerDevice(
    @Body() dto: RegisterDeviceDto,
    @CurrentUser() user: any,
  ) {
    return this.auth.registerDevice(user.id, dto);
  }
}
