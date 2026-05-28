import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TouristsService }   from './tourists.service';
import { CreateTouristDto }  from './dto/create-tourist.dto';
import { JwtAuthGuard }      from '../auth/guards/jwt-auth.guard';
@ApiTags('tourists') @ApiBearerAuth() @UseGuards(JwtAuthGuard) @Controller('tourists')
export class TouristsController {
  constructor(private readonly tourists: TouristsService) {}
  @Post()   create(@Body() dto: CreateTouristDto)                           { return this.tourists.create(dto); }
  @Get()    findAll()                                                        { return this.tourists.findAll(); }
  @Get(':id') findOne(@Param('id') id: string)                              { return this.tourists.findOne(id); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: Partial<CreateTouristDto>) { return this.tourists.update(id, dto); }
  @Delete(':id') remove(@Param('id') id: string)                           { return this.tourists.remove(id); }
}
