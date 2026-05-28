// src/trees/trees.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { TreesService }   from './trees.service';
import { CreateTreeDto }  from './dto/create-tree.dto';
import { JwtAuthGuard }   from '../auth/guards/jwt-auth.guard';
import { CurrentUser }    from '../auth/decorators/current-user.decorator';

@ApiTags('trees')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('trees')
export class TreesController {
  constructor(private readonly trees: TreesService) {}

  @Post()
  @ApiOperation({ summary: 'Create / plant a tree' })
  create(@Body() dto: CreateTreeDto, @CurrentUser() user: any) {
    return this.trees.create({ ...dto, plantedByUserId: dto.plantedByUserId ?? user.id });
  }

  @Get()
  @ApiOperation({ summary: 'List trees with optional filters' })
  @ApiQuery({ name: 'parcelId',     required: false })
  @ApiQuery({ name: 'healthStatus', required: false })
  @ApiQuery({ name: 'touristId',    required: false })
  findAll(
    @Query('parcelId')     parcelId?: string,
    @Query('healthStatus') healthStatus?: string,
    @Query('touristId')    touristId?: string,
  ) {
    return this.trees.findAll({ parcelId, healthStatus, touristId });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Tree counts grouped by health status' })
  getStats() { return this.trees.getStats(); }

  @Get('qr/:externalId')
  @ApiOperation({ summary: 'Find tree by QR code external ID' })
  findByQR(@Param('externalId') externalId: string) {
    return this.trees.findByExternalId(externalId);
  }

  @Get(':id') findOne(@Param('id') id: string) { return this.trees.findOne(id); }

  @Patch(':id')
  @ApiOperation({ summary: 'Update tree (monthly monitoring, replanting, etc.)' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateTreeDto>) {
    return this.trees.update(id, dto);
  }

  @Delete(':id') remove(@Param('id') id: string) { return this.trees.remove(id); }
}
