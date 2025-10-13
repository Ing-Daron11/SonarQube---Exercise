import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MaintenanceController } from './maintenance.controller';
import { MaintenanceService } from './maintenance.service';
import { Maintenance } from './entities/maintenance.entity';
import { Equipment } from 'src/equipment/entities/equipment.entity';
import { User } from 'src/auth/entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from 'src/auth/auth.module';
import { EquipmentModule } from 'src/equipment/equipment.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Maintenance, Equipment, User]), 
    PassportModule.register({ defaultStrategy: 'jwt' }),
    AuthModule,
    EquipmentModule, 
  ],
  controllers: [MaintenanceController],
  providers: [MaintenanceService],
  exports: [TypeOrmModule],
})
export class MaintenanceModule {}
