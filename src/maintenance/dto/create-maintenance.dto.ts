import { IsUUID, IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreateMaintenanceDto {
  @IsUUID()
  @IsNotEmpty()
  equipmentId: string;

  @IsUUID()
  @IsNotEmpty()
  technicianId: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  description: string;
}
