import { IsOptional, IsUUID, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchReservationDto {
  @IsOptional()
  @IsUUID()
  readonly equipmentId?: string;

  @IsOptional()
  @IsUUID()
  readonly userId?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  readonly startDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  readonly endDate?: Date;

  @IsOptional()
  @Type(() => Number)
  readonly limit?: number;

  @IsOptional()
  @Type(() => Number)
  readonly offset?: number;
}
