import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EquipmentController } from './equipment.controller';
import { EquipmentService } from './equipment.service';
import { Equipment } from './entities/equipment.entity';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    TypeOrmModule.forFeature([Equipment]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [EquipmentController],
  providers: [EquipmentService],
  exports: [TypeOrmModule]
})
export class EquipmentModule { }
