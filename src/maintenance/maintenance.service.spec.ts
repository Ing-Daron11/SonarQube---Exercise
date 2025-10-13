import { Test, TestingModule } from '@nestjs/testing';
import { MaintenanceService } from './maintenance.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Maintenance } from './entities/maintenance.entity';
import { Equipment } from 'src/equipment/entities/equipment.entity';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';
import { BadRequestException, ConflictException, InternalServerErrorException, NotFoundException } from '@nestjs/common';

const mockMaintenance = {
  id: 'maint-123',
  description: 'Revisión general',
  date: new Date(),
  equipment: { id: 'eq-1', name: 'Laptop X' },
  technician: { id: 'tech-1', name: 'Juan', roles: ['technical'] },
};

const mockDto = {
  equipmentId: 'eq-1',
  technicianId: 'tech-1',
  description: 'Revisión general',
};

const mockRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  find: jest.fn(),
  preload: jest.fn(),
  remove: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([mockMaintenance]),
  })),
});

describe('MaintenanceService', () => {
  let service: MaintenanceService;
  let maintenanceRepo: ReturnType<typeof mockRepository>;
  let equipmentRepo: ReturnType<typeof mockRepository>;
  let userRepo: ReturnType<typeof mockRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MaintenanceService,
        { provide: getRepositoryToken(Maintenance), useFactory: mockRepository },
        { provide: getRepositoryToken(Equipment), useFactory: mockRepository },
        { provide: getRepositoryToken(User), useFactory: mockRepository },
      ],
    }).compile();

    service = module.get<MaintenanceService>(MaintenanceService);
    maintenanceRepo = module.get(getRepositoryToken(Maintenance));
    equipmentRepo = module.get(getRepositoryToken(Equipment));
    userRepo = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save maintenance', async () => {
      equipmentRepo.findOneBy.mockResolvedValue({ id: 'eq-1' });
      userRepo.findOneBy.mockResolvedValue({ id: 'tech-1', roles: ['technical'] });
      maintenanceRepo.create.mockReturnValue(mockMaintenance);
      maintenanceRepo.save.mockResolvedValue(mockMaintenance);

      const result = await service.create(mockDto as any);
      expect(result).toEqual(mockMaintenance);
    });

    it('should throw NotFoundException if equipment not found', async () => {
      equipmentRepo.findOneBy.mockResolvedValue(null);
      await expect(service.create(mockDto as any)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if technician not found', async () => {
      equipmentRepo.findOneBy.mockResolvedValue({ id: 'eq-1' });
      userRepo.findOneBy.mockResolvedValue(null);
      await expect(service.create(mockDto as any)).rejects.toThrow(NotFoundException);
    });

    it("should throw BadRequestException if user doesn't have technical role", async () => {
      equipmentRepo.findOneBy.mockResolvedValue({ id: 'eq-1' });
      userRepo.findOneBy.mockResolvedValue({ id: 'tech-1', roles: ['user'] });
      await expect(service.create(mockDto as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return list of maintenances', async () => {
      maintenanceRepo.find.mockResolvedValue([mockMaintenance]);
      const result = await service.findAll({ limit: 10, offset: 0 });
      expect(result).toEqual([mockMaintenance]);
    });
  });

  describe('findOne', () => {
    it('should return one maintenance', async () => {
      maintenanceRepo.findOne.mockResolvedValue(mockMaintenance);
      const result = await service.findOne('maint-123');
      expect(result).toEqual(mockMaintenance);
    });

    it('should throw NotFoundException if not found', async () => {
      maintenanceRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('not-found')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update maintenance', async () => {
      maintenanceRepo.preload.mockResolvedValue(mockMaintenance);
      maintenanceRepo.save.mockResolvedValue(mockMaintenance);

      const result = await service.update('maint-123', { description: 'Updated' } as any);
      expect(result).toEqual(mockMaintenance);
    });

    it('should throw NotFoundException if not found', async () => {
      maintenanceRepo.preload.mockResolvedValue(null);
      await expect(service.update('not-found', {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete maintenance', async () => {
      maintenanceRepo.findOne.mockResolvedValue(mockMaintenance);
      maintenanceRepo.remove.mockResolvedValue(mockMaintenance);
      await expect(service.remove('maint-123')).resolves.not.toThrow();
    });
  });

  describe('search', () => {
    it('should return filtered maintenances', async () => {
      const result = await service.search({ description: 'rev' } as any);
      expect(result).toEqual([mockMaintenance]);
    });
  });
});
