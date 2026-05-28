// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService }    from '@nestjs/jwt';
import * as bcrypt       from 'bcrypt';
import { v4 as uuidv4 }  from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService }  from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma:   PrismaService,
    private readonly users:    UsersService,
    private readonly jwt:      JwtService,
  ) {}

  // ── Validate credentials (used by LocalStrategy) ─────────────────────────
  async validateUser(email: string, password: string) {
    const user = await this.users.findByEmail(email);
    if (!user || !user.isActive) return null;

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return null;

    const { passwordHash, ...safe } = user;
    return safe;
  }

  // ── Login → return access + refresh tokens ────────────────────────────────
  async login(user: { id: string; email: string; role: string; name: string }) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken  = this.jwt.sign(payload);
    const refreshToken = await this._createRefreshToken(user.id);

    return {
      accessToken,
      refreshToken,
      user: {
        id:    user.id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
    };
  }

  // ── Refresh access token ──────────────────────────────────────────────────
  async refreshToken(token: string) {
    const record = await this.prisma.refreshToken.findUnique({
      where:   { token },
      include: { user: true },
    });

    if (!record || record.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Rotate: delete old, issue new
    await this.prisma.refreshToken.delete({ where: { token } });

    const { passwordHash, ...user } = record.user;
    const payload      = { sub: user.id, email: user.email, role: user.role };
    const accessToken  = this.jwt.sign(payload);
    const refreshToken = await this._createRefreshToken(user.id);

    return { accessToken, refreshToken };
  }

  // ── Logout — invalidate refresh token ────────────────────────────────────
  async logout(token: string) {
    await this.prisma.refreshToken
      .delete({ where: { token } })
      .catch(() => {}); // ignore if not found
  }

  // ── Private ───────────────────────────────────────────────────────────────
  private async _createRefreshToken(userId: string): Promise<string> {
    const token     = uuidv4();
    const expiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    );
    await this.prisma.refreshToken.create({
      data: { token, userId, expiresAt },
    });
    return token;
  }
}
