import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Maintenance } from './entities/maintenance.entity';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto';
import { SearchMaintenanceDto } from './dto/search-maintenance.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Equipment } from 'src/equipment/entities/equipment.entity';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class MaintenanceService {
  constructor(
    @InjectRepository(Maintenance)
    private readonly maintenanceRepository: Repository<Maintenance>,

    @InjectRepository(Equipment)
    private readonly equipmentRepository: Repository<Equipment>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(dto: CreateMaintenanceDto): Promise<Maintenance> {
    const equipment = await this.equipmentRepository.findOneBy({ id: dto.equipmentId });
    if (!equipment) {
      throw new NotFoundException(`Equipment with id ${dto.equipmentId} not found`);
    }

    const technician = await this.userRepository.findOneBy({ id: dto.technicianId });
    if (!technician) {
      throw new NotFoundException(`Technician with id ${dto.technicianId} not found`);
    }

    if (!technician.roles.includes('technical')) {
      throw new BadRequestException(
        `User with id ${dto.technicianId} does not have the 'technical' role`,
      );
    }

    const maintenance = this.maintenanceRepository.create({
      equipment,
      technician,
      description: dto.description,
    });

    try {
      return await this.maintenanceRepository.save(maintenance);
    } catch (error) {
      throw new InternalServerErrorException(`Error creating maintenance: ${error.message}`);
    }
  }

  async findAll(pagination: PaginationDto): Promise<Maintenance[]> {
    const { limit = 10, offset = 0 } = pagination;

    return this.maintenanceRepository.find({
      take: limit,
      skip: offset,
      order: { date: 'DESC' },
      relations: ['equipment', 'technician'],
    });
  }

  async findOne(id: string): Promise<Maintenance> {
    const maintenance = await this.maintenanceRepository.findOne({
      where: { id },
      relations: ['equipment', 'technician'],
    });

    if (!maintenance) {
      throw new NotFoundException(`Maintenance with id ${id} not found`);
    }

    return maintenance;
  }

  async update(id: string, dto: UpdateMaintenanceDto): Promise<Maintenance> {
    const maintenance = await this.maintenanceRepository.preload({
      id,
      ...dto,
    });

    if (!maintenance) {
      throw new NotFoundException(`Maintenance with id ${id} not found`);
    }

    try {
      return await this.maintenanceRepository.save(maintenance);
    } catch (error) {
      throw new InternalServerErrorException(`Error updating maintenance: ${error.message}`);
    }
  }

  async remove(id: string): Promise<void> {
    const maintenance = await this.findOne(id);

    try {
      await this.maintenanceRepository.remove(maintenance);
    } catch (error) {
      throw new InternalServerErrorException(`Error deleting maintenance: ${error.message}`);
    }
  }

  async search(filters: SearchMaintenanceDto): Promise<Maintenance[]> {
    const {
      description,
      equipmentId,
      technicianId,
      equipmentName,
      startDate,
      endDate,
      limit = 10,
      offset = 0,
      sortBy = 'maintenance.date',
      sortOrder = 'DESC',
    } = filters;

    const query = this.maintenanceRepository.createQueryBuilder('maintenance')
      .leftJoinAndSelect('maintenance.equipment', 'equipment')
      .leftJoinAndSelect('maintenance.technician', 'technician');

    // Filtro por búsqueda general
    if (description) {
      query.andWhere(
        '(maintenance.description ILIKE :term OR equipment.name ILIKE :term)',
        { term: `%${description}%` },
      );
    }

    if (equipmentId) {
      query.andWhere('equipment.id = :equipmentId', { equipmentId });
    }

    if (technicianId) {
      query.andWhere('technician.id = :technicianId', { technicianId });
    }

    if (equipmentName) {
      query.andWhere('equipment.name ILIKE :equipmentName', {
        equipmentName: `%${equipmentName}%`,
      });
    }

    if (startDate) {
      query.andWhere('maintenance.date >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('maintenance.date <= :endDate', { endDate });
    }

    // Validar columnas permitidas para evitar SQL Injection en sortBy
    const allowedSortFields = [
      'maintenance.date',
      'maintenance.description',
      'equipment.name',
      'technician.name',
    ];
    const orderField = allowedSortFields.includes(sortBy) ? sortBy : 'maintenance.date';
    const orderDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query
      .orderBy(orderField, orderDirection)
      .skip(offset)
      .take(limit);

    try {
      return await query.getMany();
    } catch (error) {
      throw new InternalServerErrorException(`Error searching maintenances: ${error.message}`);
    }
  }
}
