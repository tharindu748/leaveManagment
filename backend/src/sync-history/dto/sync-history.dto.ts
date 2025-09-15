import { IsInt, Min, IsString, IsIn } from 'class-validator';

export class CreateSyncHistoryDto {
  @IsInt()
  @Min(0)
  totalUsers: number;

  @IsInt()
  @Min(0)
  newUsers: number;

  @IsInt()
  @Min(0)
  updatedUsers: number;

  @IsString()
  @IsIn(['PENDING', 'IN_PROGRESS', 'SUCCESS', 'FAILED'])
  status: string;
}
