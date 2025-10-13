import { Test, TestingModule } from '@nestjs/testing';
import { MaintenanceController } from './maintenance.controller';
import { MaintenanceService } from './maintenance.service';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto';
import { SearchMaintenanceDto } from './dto/search-maintenance.dto';
import { Maintenance } from './entities/maintenance.entity';


describe('MaintenanceController', () => {
  let controller: MaintenanceController;
  let service: MaintenanceService;

  const mockMaintenance: Maintenance = {
    id: 'uuid-1',
    date: new Date(),
    description: 'Test maintenance',
    equipment: { id: 'eq-1' } as any,
    technician: { id: 'tech-1', roles: ['technical'] } as any,
  };

  const mockService = {
    create: jest.fn().mockResolvedValue(mockMaintenance),
    findAll: jest.fn().mockResolvedValue([mockMaintenance]),
    findOne: jest.fn().mockResolvedValue(mockMaintenance),
    update: jest.fn().mockResolvedValue({ ...mockMaintenance, description: 'Updated' }),
    remove: jest.fn().mockResolvedValue(undefined),
    search: jest.fn().mockResolvedValue([mockMaintenance]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MaintenanceController],
      providers: [
        {
          provide: MaintenanceService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<MaintenanceController>(MaintenanceController);
    service = module.get<MaintenanceService>(MaintenanceService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a maintenance record', async () => {
    const dto: CreateMaintenanceDto = {
      description: 'Test maintenance',
      equipmentId: 'eq-1',
      technicianId: 'tech-1',
    };
    const result = await controller.create(dto);
    expect(result).toEqual(mockMaintenance);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should return all maintenance records', async () => {
    const result = await controller.findAll({ limit: 10, offset: 0 });
    expect(result).toEqual([mockMaintenance]);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should search maintenance records', async () => {
    const filters: SearchMaintenanceDto = { description: 'Test' };
    const result = await controller.search(filters);
    expect(result).toEqual([mockMaintenance]);
    expect(service.search).toHaveBeenCalledWith(filters);
  });

  it('should return one maintenance record by id', async () => {
    const result = await controller.findOne('uuid-1');
    expect(result).toEqual(mockMaintenance);
    expect(service.findOne).toHaveBeenCalledWith('uuid-1');
  });

  it('should update maintenance', async () => {
    const dto: UpdateMaintenanceDto = { description: 'Updated' };
    const result = await controller.update('uuid-1', dto);
    expect(result.description).toBe('Updated');
    expect(service.update).toHaveBeenCalledWith('uuid-1', dto);
  });

  it('should delete a maintenance record', async () => {
    await expect(controller.remove('uuid-1')).resolves.toBeUndefined();
    expect(service.remove).toHaveBeenCalledWith('uuid-1');
  });

  // sad paths
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
    await expect(controller.update('bad-id', { description: 'X' } as any)).rejects.toThrow('Update error');
  });

  it('should throw when remove fails', async () => {
    jest.spyOn(service, 'remove').mockRejectedValueOnce(new Error('Delete error'));
    await expect(controller.remove('bad-id')).rejects.toThrow('Delete error');
  });
});
