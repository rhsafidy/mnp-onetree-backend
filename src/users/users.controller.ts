import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService }   from './users.service';
import { CreateUserDto }  from './dto/create-user.dto';
import { UpdateUserDto }  from './dto/update-user.dto';
import { JwtAuthGuard }   from '../auth/guards/jwt-auth.guard';
import { RolesGuard }     from '../auth/guards/roles.guard';
import { Roles }          from '../auth/decorators/roles.decorator';
import { CurrentUser }    from '../auth/decorators/current-user.decorator';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new MNP user (admin only)' })
  create(@Body() dto: CreateUserDto) { return this.users.create(dto); }

  @Get()
  @Roles('admin')
  findAll() { return this.users.findAll(); }

  @Get('me')
  @ApiOperation({ summary: 'Get current authenticated user' })
  getMe(@CurrentUser() user: any) { return user; }

  @Get(':id')
  @Roles('admin')
  findOne(@Param('id') id: string) { return this.users.findById(id); }

  @Patch(':id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) { return this.users.update(id, dto); }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) { return this.users.remove(id); }
}
