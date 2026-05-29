// src/auth/guards/device-token.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DeviceTokenGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const token = req.headers['x-device-token'] as string;

    if (!token) throw new UnauthorizedException('Device token required');

    // Token est stocké en DB lors de l'enregistrement de l'appareil
    const device = await (this.prisma as any).deviceToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!device || !device.isActive) {
      throw new UnauthorizedException('Invalid or revoked device token');
    }

    // Injecter l'agent dans la requête (comme JWT)
    req.user = {
      id: device.user.id,
      email: device.user.email,
      role: device.user.role,
      name: device.user.name,
    };

    // Mettre à jour la dernière utilisation
    await (this.prisma as any).deviceToken.update({
      where: { token },
      data: { lastUsedAt: new Date() },
    });

    return true;
  }
}
