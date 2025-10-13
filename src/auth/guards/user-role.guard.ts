import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { META_ROLES } from '../decorators/role-protected.decorator';
import { User } from '../entities/user.entity';

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const validRoles: string[] = this.reflector.get<string[]>(
      META_ROLES,
      context.getHandler(),
    );

    if (!validRoles || validRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    console.log(request);

    const user = request.user as User;
    if (!user) {
      throw new BadRequestException('User not found');
    }

    for (const role of user.roles) {
      if (validRoles.includes(role)) return true;
    }

    throw new ForbiddenException('user does not have the required role');
  }
}
