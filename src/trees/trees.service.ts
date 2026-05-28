// src/trees/trees.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService }  from '../prisma/prisma.service';
import { CreateTreeDto }  from './dto/create-tree.dto';

@Injectable()
export class TreesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTreeDto) {
    const exists = await this.prisma.tree.findUnique({
      where: { externalId: dto.externalId },
    });
    if (exists) throw new ConflictException(`Tree ${dto.externalId} already exists`);

    return this.prisma.tree.create({
      data: {
        ...dto,
        plantationDate: dto.plantationDate ? new Date(dto.plantationDate) : undefined,
      },
      include: { parcel: true, tourist: true, plantedBy: { select: { id: true, name: true } } },
    });
  }

  findAll(filters?: { parcelId?: string; healthStatus?: string; touristId?: string }) {
    return this.prisma.tree.findMany({
      where:   {
        parcelId:     filters?.parcelId     ?? undefined,
        healthStatus: filters?.healthStatus ?? undefined,
        touristId:    filters?.touristId    ?? undefined,
      },
      include: {
        parcel:    { select: { id: true, name: true, code: true } },
        tourist:   { select: { id: true, name: true, email: true } },
        plantedBy: { select: { id: true, name: true } },
        photos:    { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const tree = await this.prisma.tree.findUnique({
      where:   { id },
      include: {
        parcel:    true,
        tourist:   true,
        plantedBy: { select: { id: true, name: true, email: true } },
        photos:    { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!tree) throw new NotFoundException(`Tree ${id} not found`);
    return tree;
  }

  async findByExternalId(externalId: string) {
    const tree = await this.prisma.tree.findUnique({
      where:   { externalId },
      include: {
        parcel:  { select: { id: true, name: true, code: true } },
        tourist: true,
        photos:  { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!tree) throw new NotFoundException(`QR code ${externalId} not found`);
    return tree;
  }

  async update(id: string, dto: Partial<CreateTreeDto>) {
    await this._assertExists(id);
    return this.prisma.tree.update({
      where: { id },
      data:  {
        ...dto,
        plantationDate: dto.plantationDate ? new Date(dto.plantationDate) : undefined,
      },
      include: { parcel: true, tourist: true },
    });
  }

  async remove(id: string) {
    await this._assertExists(id);
    return this.prisma.tree.delete({ where: { id } });
  }

  // Stats for dashboard
  async getStats() {
    const counts = await this.prisma.tree.groupBy({
      by:    ['healthStatus'],
      _count: { id: true },
    });
    return counts.reduce((acc, r) => {
      acc[r.healthStatus] = r._count.id;
      return acc;
    }, {} as Record<string, number>);
  }

  private async _assertExists(id: string) {
    const t = await this.prisma.tree.findUnique({ where: { id } });
    if (!t) throw new NotFoundException(`Tree ${id} not found`);
    return t;
  }
}
