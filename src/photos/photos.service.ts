// src/photos/photos.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import * as path from 'path';
import * as fs   from 'fs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PhotosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    file: Express.Multer.File,
    treeId: string,
    type: string,
    uploadedByUserId: string,
  ) {
    // Build accessible URL
    const url = `/uploads/${file.filename}`;

    return this.prisma.photo.create({
      data: { url, type, treeId, uploadedByUserId },
    });
  }

  findByTree(treeId: string) {
    return this.prisma.photo.findMany({
      where:   { treeId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(id: string) {
    const photo = await this.prisma.photo.findUnique({ where: { id } });
    if (!photo) throw new NotFoundException(`Photo ${id} not found`);

    // Delete physical file
    const filePath = path.join(process.cwd(), photo.url);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    return this.prisma.photo.delete({ where: { id } });
  }
}
