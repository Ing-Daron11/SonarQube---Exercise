import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          let token = null;
          if (req && req.cookies) {
            token = req.cookies['token']; // ← aquí leemos la puta cookie
          }
          return token;
        },
        ExtractJwt.fromAuthHeaderAsBearerToken(), // ← este es pal postman
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'secret',
    });

    // console.log('Validando con JWT_SECRET:', configService.get('JWT_SECRET'));
  }

  async validate(payload: any) {
    // console.log('Payload recibido:', payload);
    const id = payload.user_id;

    const user = await this.userRepository.findOneBy({ id: payload.user_id });
    // console.log('Usuario encontrado:', user);

    if (!user) throw new UnauthorizedException('invalid token');

    if (!user.isActive) throw new UnauthorizedException('inactive user');

    return user;
  }
}
