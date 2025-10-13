import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  SetMetadata,
  Request,
  Req,
  Param,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { RoleProtected } from './decorators/role-protected.decorator';
import { GetUser } from './decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { UserRoleGuard } from './guards/user-role.guard';
import { ValidRoles } from './interfaces/valid-roles';
import { Auth } from './decorators/auth.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
    async loginUser(
      @Body() loginUserDto: LoginUserDto,
      @Res({ passthrough: true }) res: Response
    ) {
      const loginResult = await this.authService.loginUser(loginUserDto);

      res.cookie('token', loginResult.token, {
        httpOnly: false,         // o true si no necesitas acceder desde JS
        secure: true,            // obligatorio en producción (HTTPS)
        sameSite: 'none',        // para que funcione entre Railway + localhost
      });

    return loginResult;
  }


  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.createUser(createUserDto);
  }

  @Get('protected')
  @UseGuards(AuthGuard())
  protected1() {
    return 'esto es una ruta protegida';
  }

  @Get('private')
  @UseGuards(AuthGuard())
  testingPrivateRoute(
    @Req() request: Express.Request,
    @GetUser() user: User,
    @GetUser('email') userEmail: string,
  ) {
    // console.log(request);

    return {
      ok: true,
      message: 'Hola Mundo Private',
      user,
      userEmail,
    };
  }

  @Get('protected2/:id')
  //@SetMetadata('roles', ['admin','user'])
  @UseGuards(AuthGuard(), UserRoleGuard)
  @RoleProtected(ValidRoles.admin, ValidRoles.user)
  protected2(@GetUser() user: User, @Param('id') id: string) {
    return {
      id,
      user,
      message: 'OK',
    };
  }

  @Get('protected3')
  @Auth(ValidRoles.technical, ValidRoles.admin)
  protected3(@GetUser() user: User) {
    return {
      user,
      message: 'OK',
    };
  }
}
