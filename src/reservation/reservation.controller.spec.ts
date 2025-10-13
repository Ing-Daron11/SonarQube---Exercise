import { Test, TestingModule } from '@nestjs/testing';
import { ReservationController } from './reservation.controller';
import { ReservationService } from './reservation.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { SearchReservationDto } from './dto/search-reservation.dto';
import { Reservation } from './entities/reservation.entity';

describe('ReservationController', () => {
  let controller: ReservationController;
  let service: ReservationService;

  const mockReservation: Reservation = {
    id: 'res-123',
    startDate: new Date('2025-06-01'),
    endDate: new Date('2025-06-02'),
    createdAt: new Date('2025-05-12T04:46:30.243Z'),
    equipment: { id: 'eq-123', name: 'Test Laptop' } as any,
    user: { id: 'user-1', name: 'Carlos', roles: ['technical'] } as any,
  };

  const mockService = {
    create: jest.fn().mockResolvedValue(mockReservation),
    findAll: jest.fn().mockResolvedValue([mockReservation]),
    search: jest.fn().mockResolvedValue([mockReservation]),
    findOne: jest.fn().mockResolvedValue(mockReservation),
    update: jest.fn().mockResolvedValue({ ...mockReservation, endDate: new Date('2025-06-03') }),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationController],
      providers: [{ provide: ReservationService, useValue: mockService }],
    }).compile();

    controller = module.get<ReservationController>(ReservationController);
    service = module.get<ReservationService>(ReservationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a reservation', async () => {
    const dto: CreateReservationDto = {
      startDate: new Date('2025-06-01'),
      endDate: new Date('2025-06-02'),
      equipmentId: 'eq-123',
      userId: 'user-1',
    };
    const result = await controller.create(dto);
    expect(result).toEqual(mockReservation);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should return all reservations', async () => {
    const result = await controller.findAll({ limit: 10, offset: 0 });
    expect(result).toEqual([mockReservation]);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should search reservations', async () => {
    const filters: SearchReservationDto = { userId: 'user-1' };
    const result = await controller.search(filters);
    expect(result).toEqual([mockReservation]);
    expect(service.search).toHaveBeenCalledWith(filters);
  });

  it('should return one reservation by id', async () => {
    const result = await controller.findOne('res-123');
    expect(result).toEqual(mockReservation);
    expect(service.findOne).toHaveBeenCalledWith('res-123');
  });

  it('should update reservation', async () => {
    const dto: UpdateReservationDto = { endDate: new Date('2025-06-03') };
    const result = await controller.update('res-123', dto);
    expect(result.endDate).toEqual(new Date('2025-06-03'));
    expect(service.update).toHaveBeenCalledWith('res-123', dto);
  });

  it('should delete a reservation', async () => {
    await expect(controller.remove('res-123')).resolves.toBeUndefined();
    expect(service.remove).toHaveBeenCalledWith('res-123');
  });

  // Sad paths
  it('should throw when create fails', async () => {
    jest.spyOn(service, 'create').mockRejectedValueOnce(new Error('Create error'));
    await expect(controller.create({} as any)).rejects.toThrow('Create error');
  });

  it('should throw when findOne fails', async () => {
    jest.spyOn(service, 'findOne').mockRejectedValueOnce(new Error('Not found'));
    await expect(controller.findOne('bad-id')).rejects.toThrow('Not found');
  });

  it('should throw when update fails', async () => {
    jest.spyOn(service, 'update').mockRejectedValueOnce(new Error('Update error'));
    await expect(controller.update('bad-id', {} as any)).rejects.toThrow('Update error');
  });

  it('should throw when remove fails', async () => {
    jest.spyOn(service, 'remove').mockRejectedValueOnce(new Error('Delete error'));
    await expect(controller.remove('bad-id')).rejects.toThrow('Delete error');
  });
});
