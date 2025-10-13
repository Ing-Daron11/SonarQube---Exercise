import {
  IsUUID,
  IsDate,
  IsNotEmpty,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Type } from 'class-transformer';

@ValidatorConstraint({ name: 'IsStartBeforeEnd', async: false })
class IsStartBeforeEndConstraint implements ValidatorConstraintInterface {
  validate(startDate: Date, args: ValidationArguments) {
    const object: any = args.object;
    return startDate && object.endDate && startDate < object.endDate;
  }

  defaultMessage(args: ValidationArguments) {
    return 'startDate must be before endDate';
  }
}

export class CreateReservationDto {
  @IsUUID()
  @IsNotEmpty()
  readonly equipmentId: string;

  @IsUUID()
  @IsNotEmpty()
  readonly userId: string;

  @Type(() => Date)
  @IsDate()
  @Validate(IsStartBeforeEndConstraint)
  readonly startDate: Date;

  @Type(() => Date)
  @IsDate()
  readonly endDate: Date;
}
