import { IsArray, ArrayNotEmpty, IsString, IsOptional } from 'class-validator';

export class DeleteUserDto {
  @IsArray()
  @ArrayNotEmpty()
  devices!: string[]; // e.g. ["192.168.1.50","door1.local"]

  @IsOptional()
  @IsString()
  httpScheme?: 'http' | 'https';

  @IsOptional()
  port?: number;
}
