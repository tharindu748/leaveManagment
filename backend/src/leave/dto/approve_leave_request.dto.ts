import { IsInt } from 'class-validator';

export class ApproveLeaveRequestDto {
  @IsInt()
  requestId: number;

  @IsInt()
  approvedBy?: number;
}
