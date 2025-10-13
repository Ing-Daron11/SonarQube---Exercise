import { IsEnum } from 'class-validator';
import { EquipmentStatus } from '../enums/equipment.enum';

export class UpdateEquipmentStatusDto {
  @IsEnum(EquipmentStatus, {
    message: `Invalid equipment status. Valid options: ${Object.values(EquipmentStatus).join(', ')}`,
  })
  status: EquipmentStatus;
}
