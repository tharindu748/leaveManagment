import { IsInt } from 'class-validator';

export class CancelLeaveRequestDto {
  @IsInt()
  requestId: number;
}
