import { IsString, MaxLength, MinLength } from 'class-validator';
import { IsArray, ArrayMinSize, ArrayMaxSize } from 'class-validator';

export class CreateUserDto {
  @IsString({ message: 'El nombre es obligario' })
  @MinLength(3)
  @MaxLength(20)
  readonly name: string;

  @IsString({ message: 'El email es obligario' })
  @MinLength(3)
  @MaxLength(20)
  readonly email: string;

  @IsString({ message: 'La contraseña es obligaria' })
  @MinLength(6)
  @MaxLength(20)
  readonly password: string;
}
