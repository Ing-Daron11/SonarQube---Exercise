import { Test, TestingModule } from '@nestjs/testing';
import { EquipmentController } from './equipment.controller';
import { EquipmentService } from './equipment.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { EquipmentCategory, EquipmentStatus } from './enums/equipment.enum';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { User } from '../auth/entities/user.entity';

describe('EquipmentController', () => {
  let controller: EquipmentController;
  let service: EquipmentService;

  const mockEquipment = {
    id: 'uuid-1',
    name: 'HP Laptop',
    model: '840 G7',
    description: 'Test description',
    category: EquipmentCategory.LAPTOP,
    status: EquipmentStatus.AVAILABLE,
  };

  const mockService = {
    create: jest.fn().mockResolvedValue(mockEquipment),
    findAll: jest.fn().mockResolvedValue([mockEquipment]),
    findOne: jest.fn().mockResolvedValue(mockEquipment),
    update: jest.fn().mockResolvedValue({ ...mockEquipment, name: 'Updated' }),
    remove: jest.fn().mockResolvedValue(undefined),
    search: jest.fn().mockResolvedValue([mockEquipment]),
    markAsAvailable: jest.fn().mockResolvedValue({ ...mockEquipment, status: EquipmentStatus.AVAILABLE }),
    markAsRented: jest.fn().mockResolvedValue({ ...mockEquipment, status: EquipmentStatus.RENTED }),
    markInMaintenance: jest.fn().mockResolvedValue({ ...mockEquipment, status: EquipmentStatus.MAINTENANCE }),
  };

  const userMock: User = {
  id: 'some-id',
  email: 'test@example.com',
  name: 'Test User',
  password: 'hashedpassword',
  roles: ['user'],
  isActive: true,
  equipment: [],
};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EquipmentController],
      providers: [
        {
          provide: EquipmentService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<EquipmentController>(EquipmentController);
    service = module.get<EquipmentService>(EquipmentService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create equipment', async () => {
    const dto: CreateEquipmentDto = {
      name: 'HP Laptop',
      model: '840 G7',
      description: 'desc',
      category: EquipmentCategory.LAPTOP,
    };

    const result = await controller.create(dto);
    expect(result).toEqual(mockEquipment);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should return all equipment', async () => {
    const result = await controller.findAll({ limit: 10, offset: 0 });
    expect(result).toEqual([mockEquipment]);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should find one equipment', async () => {
    const result = await controller.findOne('uuid-1');
    expect(result).toEqual(mockEquipment);
    expect(service.findOne).toHaveBeenCalledWith('uuid-1');
  });

  it('should update equipment', async () => {
    const dto: UpdateEquipmentDto = { ...mockEquipment, name: 'Updated' };
    const result = await controller.update('uuid-1', dto);
    expect(result.name).toBe('Updated');
  });

  it('should search equipment', async () => {
    const filters = { name: 'HP', category: EquipmentCategory.LAPTOP, status: EquipmentStatus.AVAILABLE };
    const result = await controller.search(filters);
    expect(result).toEqual([mockEquipment]);
    expect(service.search).toHaveBeenCalledWith(filters);
  });

  it('should update status to AVAILABLE', async () => {
    const result = await controller.updateStatus('uuid-1', { status: EquipmentStatus.AVAILABLE }, userMock);
    expect(result.status).toBe(EquipmentStatus.AVAILABLE);
    expect(service.markAsAvailable).toHaveBeenCalledWith('uuid-1');
  });

  it('should update status to MAINTENANCE', async () => {
    const result = await controller.updateStatus('uuid-1', { status: EquipmentStatus.MAINTENANCE }, userMock);
    expect(result.status).toBe(EquipmentStatus.MAINTENANCE);
    expect(service.markInMaintenance).toHaveBeenCalledWith('uuid-1');
  });

  // commentados
  // it('should update status to RENTED', async () => {
  //   const result = await controller.updateStatus('uuid-1', { status: EquipmentStatus.RENTED }, userMock);
  //   expect(result.status).toBe(EquipmentStatus.RENTED);
  //   expect(service.markAsRented).toHaveBeenCalledWith('uuid-1');
  // });

  // it('should delete equipment', async () => {
  //   await expect(controller.remove('uuid-1')).resolves.toBeUndefined();
  //   expect(service.remove).toHaveBeenCalledWith('uuid-1');
  // });

  // it('should update status to RENTED', async () => {
  //   const result = await controller.updateStatus('uuid-1', { status: EquipmentStatus.RENTED }, userMock);
  //   expect(result.status).toBe(EquipmentStatus.RENTED);
  //   expect(service.markAsRented).toHaveBeenCalledWith('uuid-1');
  // });

  // sad paths
  it('should throw when service.create fails', async () => {
    jest.spyOn(service, 'create').mockRejectedValueOnce(new Error('Duplicate'));

    await expect(
      controller.create({
        name: 'HP Laptop',
        model: '840 G7',
        description: 'desc',
        category: EquipmentCategory.LAPTOP,
      })
    ).rejects.toThrow('Duplicate');
  });

  it('should throw when equipment not found in findOne', async () => {
    jest.spyOn(service, 'findOne').mockRejectedValueOnce(new Error('Not found'));

    await expect(controller.findOne('invalid-id')).rejects.toThrow('Not found');
  });

  it('should throw on update with invalid ID', async () => {
    jest.spyOn(service, 'update').mockRejectedValueOnce(new Error('Update failed'));

    await expect(controller.update('invalid-id', { name: 'X' } as any)).rejects.toThrow('Update failed');
  });

  it('should throw when remove fails', async () => {
    jest.spyOn(service, 'remove').mockRejectedValueOnce(new Error('Delete failed'));

    await expect(controller.remove('invalid-id')).rejects.toThrow('Delete failed');
  });

  it('should throw on updateStatus with invalid status', async () => {
    await expect(
      controller.updateStatus('uuid-1', { status: 'invalid' as EquipmentStatus }, userMock)
    ).rejects.toThrow('Invalid status');
  });

});
