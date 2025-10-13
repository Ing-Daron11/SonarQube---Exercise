import { IsString, IsNotEmpty, IsOptional, Min, MinLength, MaxLength, IsEnum } from 'class-validator';
import { Equipment } from '../entities/equipment.entity';
import { EquipmentCategory, EquipmentStatus } from '../enums/equipment.enum';

export class CreateEquipmentDto {
     @IsString()
     @IsNotEmpty()
     @MinLength(3)
     @MaxLength(50)
     name: string;
     
     @IsString()
     @IsNotEmpty()
     model: string;

     @IsString()
     @IsNotEmpty()
     description?: string;
     
     @IsEnum(EquipmentCategory)
     @IsNotEmpty()
     category?: EquipmentCategory;

     @IsEnum(EquipmentStatus)
     @IsOptional()
     status?: EquipmentStatus;

}