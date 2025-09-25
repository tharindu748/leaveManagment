import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Express } from 'express';
import { File as MulterFile } from 'multer';
import { UsersService } from './users.service';
import { CreateRegUserDto, UpdateRegUserDto } from './dto/users.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import path from 'path';
import { diskStorage } from 'multer';
import fs from 'fs';
import sharp from 'sharp';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.listUsers();
  }

  @Get(':employeeId')
  findOne(@Param('employeeId') employeeId: string) {
    return this.usersService.findUserByEmployeeId(employeeId);
  }

  @Post()
  create(@Body() dto: CreateRegUserDto) {
    return this.usersService.upsertRegUser(dto);
  }

  @Patch(':employeeId')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const userId = req.params.employeeId;
          const fileExtension = path.extname(file.originalname);
          const newFilename = `${userId}${fileExtension}`;
          callback(null, newFilename);
        },
      }),
    }),
  )
  async update(
    @Param('employeeId') employeeId: string,
    @Body() dto: UpdateRegUserDto,
    @UploadedFile() file: MulterFile,
  ) {
    const updateData = { ...dto };

    if (file) {
      const uploadsDir = './uploads';

      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const finalFilename = `${employeeId}.webp`;
      const finalPath = path.join(uploadsDir, finalFilename);

      await sharp(file.path)
        .resize({ width: 100 })
        .toFormat('webp')
        .toFile(finalPath);

      fs.unlinkSync(file.path);

      updateData.imagePath = `/uploads/${finalFilename}`;
    }

    return this.usersService.updateRegUserFields(employeeId, updateData);
  }
}
