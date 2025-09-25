import { IsString, IsOptional, IsISO8601, MinLength } from 'class-validator';

export class CreateRegUserDto {
  @IsString()
  employeeId: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  cardNumber?: string;

  @IsOptional()
  @IsISO8601({}, { message: 'validFrom must be a valid ISO date string' })
  validFrom?: string;

  @IsOptional()
  @IsISO8601({}, { message: 'validTo must be a valid ISO date string' })
  validTo?: string;

  @IsOptional()
  @IsString()
  epfNo?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsString()
  nic?: string;

  @IsOptional()
  @IsString()
  jobPosition?: string;
}

export class UpdateRegUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  cardNumber?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsISO8601({}, { message: 'validFrom must be a valid ISO date string' })
  validFrom?: string;

  @IsOptional()
  @IsISO8601({}, { message: 'validTo must be a valid ISO date string' })
  validTo?: string;

  @IsOptional()
  @IsString()
  epfNo?: string;

  @IsOptional()
  @IsString()
  nic?: string;

  @IsOptional()
  @IsString()
  jobPosition?: string;

  @IsOptional()
  @IsString()
  imagePath?: string;
}
