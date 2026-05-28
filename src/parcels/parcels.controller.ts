// src/parcels/parcels.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ParcelsService }  from './parcels.service';
import { CreateParcelDto } from './dto/create-parcel.dto';
import { JwtAuthGuard }    from '../auth/guards/jwt-auth.guard';
import { RolesGuard }      from '../auth/guards/roles.guard';
import { Roles }           from '../auth/decorators/roles.decorator';

@ApiTags('parcels')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('parcels')
export class ParcelsController {
  constructor(private readonly parcels: ParcelsService) {}

  @Post()
  @UseGuards(RolesGuard) @Roles('admin')
  @ApiOperation({ summary: 'Create a parcel (admin only)' })
  create(@Body() dto: CreateParcelDto) { return this.parcels.create(dto); }

  @Get()
  @ApiOperation({ summary: 'List all parcels with tree count' })
  findAll() { return this.parcels.findAll(); }

  @Get(':id') findOne(@Param('id') id: string) { return this.parcels.findOne(id); }

  @Patch(':id') @UseGuards(RolesGuard) @Roles('admin')
  update(@Param('id') id: string, @Body() dto: Partial<CreateParcelDto>) {
    return this.parcels.update(id, dto);
  }

  @Delete(':id') @UseGuards(RolesGuard) @Roles('admin')
  remove(@Param('id') id: string) { return this.parcels.remove(id); }
}
