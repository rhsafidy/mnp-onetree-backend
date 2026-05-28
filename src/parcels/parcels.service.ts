// src/parcels/parcels.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService }   from '../prisma/prisma.service';
import { CreateParcelDto } from './dto/create-parcel.dto';

@Injectable()
export class ParcelsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateParcelDto) {
    const exists = await this.prisma.parcel.findUnique({ where: { code: dto.code } });
    if (exists) throw new ConflictException(`Parcel code ${dto.code} already exists`);
    return this.prisma.parcel.create({ data: dto });
  }

  findAll() {
    return this.prisma.parcel.findMany({
      orderBy: { code: 'asc' },
      include: { _count: { select: { trees: true } } },
    });
  }

  async findOne(id: string) {
    const p = await this.prisma.parcel.findUnique({
      where:   { id },
      include: { _count: { select: { trees: true } } },
    });
    if (!p) throw new NotFoundException(`Parcel ${id} not found`);
    return p;
  }

  async update(id: string, dto: Partial<CreateParcelDto>) {
    await this.findOne(id);
    return this.prisma.parcel.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.parcel.delete({ where: { id } });
  }
}
