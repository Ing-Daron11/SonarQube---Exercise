import { IsOptional, IsString, IsUUID, IsDate, IsIn } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class SearchMaintenanceDto {
  @IsOptional()
  @IsUUID()
  readonly equipmentId?: string;

  @IsOptional()
  @IsUUID()
  readonly technicianId?: string;

  @IsOptional()
  @IsString()
  readonly equipmentName?: string;

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

  @IsOptional()
  @IsString()
  readonly sortBy?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  readonly sortOrder?: 'asc' | 'desc';

  /**
   * Campo principal de búsqueda, que puede venir como 'description', 'term' o 'search'.
   * Esta propiedad es la que debe usarse dentro del service para hacer el filtro real.
   */
  @IsOptional()
  @Transform(({ obj }) => obj.term ?? obj.search ?? obj.description ?? undefined)
  @IsString()
  readonly description?: string;

  /**
   * Estos se mantienen solo para permitir su uso desde el frontend
   * sin causar errores de validación, pero no deben usarse directamente.
   */
  @IsOptional()
  @IsString()
  readonly term?: string;

  @IsOptional()
  @IsString()
  readonly search?: string;
}
