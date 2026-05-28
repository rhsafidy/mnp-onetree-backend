// src/app.module.ts
import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ParcelsModule } from './parcels/parcels.module';
import { TreesModule } from './trees/trees.module';
import { TouristsModule } from './tourists/tourists.module';
import { PhotosModule } from './photos/photos.module';
import { SyncModule } from './sync/sync.module';

@Module({
  imports: [
    // Rate limiting: 100 requests per minute per IP
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),

    PrismaModule,
    AuthModule,
    UsersModule,
    ParcelsModule,
    TreesModule,
    TouristsModule,
    PhotosModule,
    SyncModule,
  ],
})
export class AppModule {}
