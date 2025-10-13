import { IsEnum, IsOptional, IsString } from 'class-validator';
import { EquipmentStatus, EquipmentCategory } from '../enums/equipment.enum';
import { Type } from 'class-transformer';

export class SearchEquipmentDto {
  @IsOptional()
  @IsString()
  readonly name?: string;

  @IsOptional()
  @IsEnum(EquipmentCategory)
  readonly category?: EquipmentCategory;

  @IsOptional()
  @IsEnum(EquipmentStatus)
  readonly status?: EquipmentStatus;

  @IsOptional()
  @Type(() => Number)
  readonly limit?: number;

  @IsOptional()
  @Type(() => Number)
  readonly offset?: number;
}
