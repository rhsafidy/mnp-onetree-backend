import { Controller, Post, Get, Delete, Param, UseGuards, UseInterceptors, UploadedFile, Body, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage }     from 'multer';
import { extname }         from 'path';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { PhotosService }  from './photos.service';
import { JwtAuthGuard }   from '../auth/guards/jwt-auth.guard';
import { CurrentUser }    from '../auth/decorators/current-user.decorator';

const storage = diskStorage({
  destination: (_, __, cb) => {
    const dir = process.env.UPLOAD_DIR ?? './uploads';
    require('fs').mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${extname(file.originalname)}`);
  },
});

@ApiTags('photos') @ApiBearerAuth() @UseGuards(JwtAuthGuard) @Controller('photos')
export class PhotosController {
  constructor(private readonly photos: PhotosService) {}

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a tree photo (plantation | monthly | replanting)' })
  @UseInterceptors(FileInterceptor('file', { storage, limits: { fileSize: 5 * 1024 * 1024 } }))
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('treeId') treeId: string,
    @Body('type')   type: string = 'monthly',
    @CurrentUser()  user: any,
  ) {
    return this.photos.create(file, treeId, type, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get photos for a tree' })
  findByTree(@Query('treeId') treeId: string) { return this.photos.findByTree(treeId); }

  @Delete(':id') remove(@Param('id') id: string) { return this.photos.remove(id); }
}
