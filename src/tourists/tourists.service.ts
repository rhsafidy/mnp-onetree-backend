// src/tourists/tourists.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService }    from '../prisma/prisma.service';
import { CreateTouristDto } from './dto/create-tourist.dto';

@Injectable()
export class TouristsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateTouristDto) {
    return this.prisma.tourist.create({ data: dto });
  }

  findAll() {
    return this.prisma.tourist.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const t = await this.prisma.tourist.findUnique({
      where:   { id },
      include: { trees: { include: { photos: { take: 1, orderBy: { createdAt: 'desc' } } } } },
    });
    if (!t) throw new NotFoundException(`Tourist ${id} not found`);
    return t;
  }

  async update(id: string, dto: Partial<CreateTouristDto>) {
    await this.findOne(id);
    return this.prisma.tourist.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.tourist.delete({ where: { id } });
  }
}
