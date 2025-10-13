import { IsString, MaxLength, MinLength } from 'class-validator';

export class LoginUserDto {
  @IsString({ message: 'El email es obligario' })
  @MinLength(3)
  @MaxLength(20)
  readonly email: string;

  @IsString({ message: 'La contraseña es obligaria' })
  @MinLength(6)
  @MaxLength(20)
  readonly password: string;
}
