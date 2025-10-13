import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Not } from 'typeorm';

import { Reservation } from './entities/reservation.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { SearchReservationDto } from './dto/search-reservation.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Equipment } from 'src/equipment/entities/equipment.entity';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
  ) {}

  async create(dto: CreateReservationDto): Promise<Reservation> {
    const { equipmentId, userId, startDate, endDate } = dto;

    if (startDate >= endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    const equipment = await this.reservationRepository.manager.findOne(Equipment, {
      where: { id: equipmentId },
    });
    if (!equipment) {
      throw new NotFoundException(`Equipment with id ${equipmentId} not found`);
    }

    const user = await this.reservationRepository.manager.findOne(User, {
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    // Validar solapamiento
    const overlapping = await this.reservationRepository
      .createQueryBuilder('reservation')
      .where('reservation.equipment.id = :equipmentId', { equipmentId })
      .andWhere(
        '(reservation.startDate < :endDate AND reservation.endDate > :startDate)',
        { startDate, endDate },
      )
      .getOne();

    if (overlapping) {
      throw new BadRequestException('This equipment is already reserved during the selected time');
    }

    const reservation = this.reservationRepository.create({
      equipment,
      user,
      startDate,
      endDate,
    });

    try {
      await this.reservationRepository.save(reservation);
      return this.findOne(reservation.id); // Retorna con relaciones
    } catch (error) {
      throw new InternalServerErrorException('Error creating reservation');
    }
  }

  async findAll(pagination: PaginationDto): Promise<Reservation[]> {
    const { limit = 10, offset = 0 } = pagination;
    return this.reservationRepository.find({
      take: limit,
      skip: offset,
      order: { createdAt: 'DESC' },
      relations: ['equipment', 'user'],
    });
  }

  async findOne(id: string): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
      relations: ['equipment', 'user'],
    });

    if (!reservation) {
      throw new NotFoundException(`Reservation with id ${id} not found`);
    }

    return reservation;
  }

  async update(id: string, dto: UpdateReservationDto): Promise<Reservation> {
    const reservation = await this.findOne(id);

    if (dto.startDate && dto.endDate && dto.startDate >= dto.endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    if (dto.equipmentId) {
      const equipment = await this.reservationRepository.manager.findOne(Equipment, {
        where: { id: dto.equipmentId },
      });
      if (!equipment) {
        throw new NotFoundException(`Equipment with id ${dto.equipmentId} not found`);
      }
      reservation.equipment = equipment;
    }

    if (dto.userId) {
      const user = await this.reservationRepository.manager.findOne(User, {
        where: { id: dto.userId },
      });
      if (!user) {
        throw new NotFoundException(`User with id ${dto.userId} not found`);
      }
      reservation.user = user;
    }

    if (dto.startDate) reservation.startDate = dto.startDate;
    if (dto.endDate) reservation.endDate = dto.endDate;

    // Validar solapamiento en actualización
    if (reservation.equipment && reservation.startDate && reservation.endDate) {
      const overlapping = await this.reservationRepository
        .createQueryBuilder('r')
        .where('r.equipment.id = :equipmentId', {
          equipmentId: reservation.equipment.id,
        })
        .andWhere(
          '(r.startDate < :endDate AND r.endDate > :startDate)',
          { startDate: reservation.startDate, endDate: reservation.endDate },
        )
        .andWhere('r.id != :id', { id })
        .getOne();

      if (overlapping) {
        throw new BadRequestException('This equipment is already reserved during the selected time');
      }
    }

    try {
      await this.reservationRepository.save(reservation);
      return this.findOne(id);
    } catch (error) {
      throw new InternalServerErrorException('Error updating reservation');
    }
  }

  async remove(id: string): Promise<void> {
    const reservation = await this.findOne(id);
    try {
      await this.reservationRepository.remove(reservation);
    } catch (error) {
      throw new InternalServerErrorException('Error deleting reservation');
    }
  }

  async search(filters: SearchReservationDto): Promise<Reservation[]> {
    const { userId, equipmentId, startDate, endDate, limit = 10, offset = 0 } = filters;

    const query = this.reservationRepository.createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.user', 'user')
      .leftJoinAndSelect('reservation.equipment', 'equipment');

    if (userId) {
      query.andWhere('user.id = :userId', { userId });
    }

    if (equipmentId) {
      query.andWhere('equipment.id = :equipmentId', { equipmentId });
    }

    if (startDate) {
      query.andWhere('reservation.startDate >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('reservation.endDate <= :endDate', { endDate });
    }

    return query
      .take(limit)
      .skip(offset)
      .orderBy('reservation.createdAt', 'DESC')
      .getMany();
  }
}
