import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { ReservationController } from './reservation.controller';
import { ReservationService } from './reservation.service';
import { Reservation } from './entities/reservation.entity';
import { AuthModule } from 'src/auth/auth.module';
import { User } from 'src/auth/entities/user.entity';
import { Equipment } from 'src/equipment/entities/equipment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reservation, User, Equipment]),
    PassportModule,
    AuthModule,
  ],
  controllers: [ReservationController],
  providers: [ReservationService],
  exports: [TypeOrmModule],
})
export class ReservationModule {}
