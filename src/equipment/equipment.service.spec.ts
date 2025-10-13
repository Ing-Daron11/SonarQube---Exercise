import { Test, TestingModule } from '@nestjs/testing';
import { EquipmentService } from './equipment.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Equipment } from './entities/equipment.entity';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { EquipmentCategory, EquipmentStatus } from './enums/equipment.enum';

const mockEquipment = {
  id: 'uuid-123',
  name: 'Test Laptop',
  model: 'HP 15',
  description: 'desc',
  category: EquipmentCategory.LAPTOP,
  status: EquipmentStatus.AVAILABLE,
};

const mockRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  preload: jest.fn(),
  remove: jest.fn(),
  find: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    andWhere: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([mockEquipment]),
  })),
});

describe('EquipmentService', () => {
  let service: EquipmentService;
  let repo: ReturnType<typeof mockRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EquipmentService,
        {
          provide: getRepositoryToken(Equipment),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    service = module.get<EquipmentService>(EquipmentService);
    repo = module.get(getRepositoryToken(Equipment));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save new equipment', async () => {
      repo.findOne.mockResolvedValue(undefined);
      repo.create.mockReturnValue(mockEquipment);
      repo.save.mockResolvedValue(mockEquipment);

      const result = await service.create(mockEquipment as any);
      expect(result).toEqual(mockEquipment);
      expect(repo.create).toHaveBeenCalledWith(mockEquipment);
    });

    it('should throw ConflictException if equipment exists', async () => {
      repo.findOne.mockResolvedValue(mockEquipment);

      await expect(service.create(mockEquipment as any)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return paginated list', async () => {
      repo.find.mockResolvedValue([mockEquipment]);
      const result = await service.findAll({ limit: 5, offset: 0 });
      expect(result).toEqual([mockEquipment]);
    });
  });

  describe('findOne', () => {
    it('should return one equipment by ID', async () => {
      repo.findOneBy.mockResolvedValue(mockEquipment);
      const result = await service.findOne('uuid-123');
      expect(result).toEqual(mockEquipment);
    });

    it('should throw NotFoundException if not found', async () => {
      repo.findOneBy.mockResolvedValue(null);
      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update equipment if found', async () => {
      repo.preload.mockResolvedValue(mockEquipment);
      repo.save.mockResolvedValue(mockEquipment);
      repo.findOneBy.mockResolvedValue(mockEquipment);

      const result = await service.update('uuid-123', { name: 'New name' } as any);
      expect(result).toEqual(mockEquipment);
    });

    it('should throw NotFoundException if not found', async () => {
      repo.preload.mockResolvedValue(null);
      await expect(service.update('not-found', {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove equipment', async () => {
      repo.findOneBy.mockResolvedValue(mockEquipment);
      repo.remove.mockResolvedValue(mockEquipment);
      await expect(service.remove('uuid-123')).resolves.not.toThrow();
    });
  });

  describe('search', () => {
    it('should return filtered equipment list', async () => {
      const result = await service.search({ name: 'Test' } as any);
      expect(result).toEqual([mockEquipment]);
    });
  });

  describe('status changes', () => {
    it('should mark as RENTED', async () => {
      repo.findOneBy.mockResolvedValue({ ...mockEquipment, status: EquipmentStatus.AVAILABLE });
      repo.save.mockResolvedValue({ ...mockEquipment, status: EquipmentStatus.RENTED });
      const result = await service.markAsRented('uuid-123');
      expect(result.status).toBe(EquipmentStatus.RENTED);
    });

    it('should throw BadRequestException on invalid transition', async () => {
      repo.findOneBy.mockResolvedValue({ ...mockEquipment, status: EquipmentStatus.MAINTENANCE });
      await expect(service.markAsRented('uuid-123')).rejects.toThrow(BadRequestException);
    });
  });
});
