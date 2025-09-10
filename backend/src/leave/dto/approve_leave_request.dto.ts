import { IsInt, IsString } from 'class-validator';

export class ApproveLeaveRequestDto {
  @IsInt()
  requestId: number;

  @IsString()
  approvedBy: string;
}
