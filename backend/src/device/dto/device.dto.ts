import { IsIP, IsString, MinLength } from 'class-validator';

export class DeviceCredentialsDto {
  @IsIP()
  ip: string;

  @IsString()
  username: string;

  @IsString()
  @MinLength(6)
  password: string;
}
