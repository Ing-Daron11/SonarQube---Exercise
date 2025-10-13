import { Test, TestingModule } from '@nestjs/testing';
import { ReservationService } from './reservation.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { Equipment } from '../equipment/entities/equipment.entity';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';

const mockReservation = {
  id: 'res-123',
  startDate: new Date('2025-06-01'),
  endDate: new Date('2025-06-02'),
  createdAt: new Date(),
  equipment: { id: 'eq-123', name: 'Laptop' },
  user: { id: 'user-1', name: 'Miguel', roles: ['technical'] },
};

const mockDto = {
  startDate: new Date('2025-06-01'),
  endDate: new Date('2025-06-02'),
  equipmentId: 'eq-123',
  userId: 'user-1',
};

const mockRepository = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
  remove: jest.fn(),
  manager: {
    findOne: jest.fn(),
  },
  createQueryBuilder: jest.fn(),
});

describe('ReservationService', () => {
  let service: ReservationService;
  let reservationRepo: ReturnType<typeof mockRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationService,
        { provide: getRepositoryToken(Reservation), useFactory: mockRepository },
        { provide: getRepositoryToken(Equipment), useFactory: mockRepository },
        { provide: getRepositoryToken(User), useFactory: mockRepository },
      ],
    }).compile();

    service = module.get<ReservationService>(ReservationService);
    reservationRepo = module.get(getRepositoryToken(Reservation));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save reservation', async () => {
      reservationRepo.manager.findOne.mockImplementation((entity, opts) => {
        if (entity === Equipment && opts.where.id === 'eq-123') {
          return Promise.resolve(mockReservation.equipment);
        }
        if (entity === User && opts.where.id === 'user-1') {
          return Promise.resolve(mockReservation.user);
        }
        return null;
      });

      const qb = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        setParameter: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };
      reservationRepo.createQueryBuilder.mockReturnValue(qb);
      reservationRepo.create.mockReturnValue(mockReservation);
      reservationRepo.save.mockResolvedValue(mockReservation);
      reservationRepo.findOne.mockResolvedValue(mockReservation);

      const result = await service.create(mockDto as any);
      expect(result).toEqual(mockReservation);
    });

    it('should throw if overlapping reservation exists', async () => {
      reservationRepo.manager.findOne.mockResolvedValue(mockReservation.equipment);
      reservationRepo.manager.findOne.mockResolvedValueOnce(mockReservation.equipment);
      reservationRepo.manager.findOne.mockResolvedValueOnce(mockReservation.user);

      const qb = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        setParameter: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockReservation),
      };
      reservationRepo.createQueryBuilder.mockReturnValue(qb);

      await expect(service.create(mockDto as any)).rejects.toThrow(
        'This equipment is already reserved during the selected time',
      );
    });

    it('should throw NotFoundException if equipment not found', async () => {
      reservationRepo.manager.findOne.mockResolvedValueOnce(null);
      await expect(
        service.create({ ...mockDto, equipmentId: 'missing' } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if user not found', async () => {
      reservationRepo.manager.findOne.mockResolvedValueOnce(mockReservation.equipment);
      reservationRepo.manager.findOne.mockResolvedValueOnce(null);
      await expect(
        service.create({ ...mockDto, userId: 'missing' } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if startDate >= endDate', async () => {
      await expect(
        service.create({ ...mockDto, startDate: new Date('2025-06-03'), endDate: new Date('2025-06-02') } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw InternalServerErrorException if save fails', async () => {
      reservationRepo.manager.findOne.mockResolvedValue(mockReservation.equipment);
      reservationRepo.manager.findOne.mockResolvedValueOnce(mockReservation.equipment);
      reservationRepo.manager.findOne.mockResolvedValueOnce(mockReservation.user);

      const qb = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        setParameter: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };
      reservationRepo.createQueryBuilder.mockReturnValue(qb);
      reservationRepo.create.mockReturnValue(mockReservation);
      reservationRepo.save.mockRejectedValue(new Error('DB error'));

      await expect(service.create(mockDto as any)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findAll', () => {
    it('should return paginated reservations', async () => {
      reservationRepo.find.mockResolvedValue([mockReservation]);
      const result = await service.findAll({ limit: 10, offset: 0 });
      expect(result).toEqual([mockReservation]);
    });
  });

  describe('findOne', () => {
    it('should return a reservation by id', async () => {
      reservationRepo.findOne.mockResolvedValue(mockReservation);
      const result = await service.findOne('res-123');
      expect(result).toEqual(mockReservation);
    });

    it('should throw NotFoundException if not found', async () => {
      reservationRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('invalid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should throw NotFoundException if reservation not found', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());
      await expect(service.update('missing', {} as any)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if startDate >= endDate', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockReservation as any);
      await expect(
        service.update('res-123', {
          startDate: new Date('2025-06-04'),
          endDate: new Date('2025-06-02'),
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if new equipment not found', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue({ ...mockReservation } as any);
      reservationRepo.manager.findOne.mockResolvedValue(null);
      await expect(
        service.update('res-123', { equipmentId: 'non-existent' } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if new user not found', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue({ ...mockReservation } as any);

      reservationRepo.manager.findOne
        .mockResolvedValueOnce(mockReservation.equipment) // first call: equipment
        .mockResolvedValueOnce(null); // second call: user not found

      await expect(
        service.update('res-123', { equipmentId: 'eq-1', userId: 'non-existent' } as any),
      ).rejects.toThrow(NotFoundException);
    });


    it('should throw BadRequestException if overlapping reservation exists in update', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue({ ...mockReservation } as any);
      reservationRepo.manager.findOne.mockResolvedValue(mockReservation.equipment);

      const qb = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockReservation),
      };
      reservationRepo.createQueryBuilder.mockReturnValue(qb);

      await expect(service.update('res-123', {
        startDate: mockDto.startDate,
        endDate: mockDto.endDate,
        equipmentId: mockReservation.equipment.id,
      } as any)).rejects.toThrow(BadRequestException);
    });

    it('should throw InternalServerErrorException if save fails during update', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue({ ...mockReservation } as any);
      reservationRepo.manager.findOne.mockResolvedValue(mockReservation.equipment);

      const qb = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };
      reservationRepo.createQueryBuilder.mockReturnValue(qb);
      reservationRepo.save.mockRejectedValue(new Error('fail'));

      await expect(service.update('res-123', {
        startDate: mockDto.startDate,
        endDate: mockDto.endDate,
        equipmentId: mockReservation.equipment.id,
      } as any)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('remove', () => {
    it('should remove a reservation', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockReservation as any);
      await service.remove('res-123');
      expect(reservationRepo.remove).toHaveBeenCalledWith(mockReservation);
    });

    it('should throw NotFoundException if reservation not found', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());
      await expect(service.remove('not-exist')).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException if remove fails', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockReservation as any);
      reservationRepo.remove.mockRejectedValue(new Error('delete error'));
      await expect(service.remove('res-123')).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('search', () => {
    it('should return filtered reservations', async () => {
      const qb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockReservation]),
      };

      reservationRepo.createQueryBuilder.mockReturnValue(qb);

      const filters = {
        equipmentId: 'eq-123',
        userId: 'user-1',
        startDate: new Date('2025-06-01'),
        endDate: new Date('2025-06-02'),
        limit: 10,
        offset: 0,
      };

      const result = await service.search(filters as any);
      expect(result).toEqual([mockReservation]);
    });
  });
});
