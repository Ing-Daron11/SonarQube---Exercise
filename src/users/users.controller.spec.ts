import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from '../auth/entities/user.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const userMock: User = {
    id: '1',
    email: 'test@mail.com',
    name: 'Test',
    password: 'hashed',
    roles: ['admin'],
    isActive: true,
    equipment: [],
  };

  const mockService = {
    findAll: jest.fn().mockResolvedValue([userMock]),
    findOne: jest.fn().mockResolvedValue(userMock),
    remove: jest.fn().mockResolvedValue(undefined),
    getProfile: jest.fn().mockResolvedValue(userMock),
    update: jest.fn().mockResolvedValue({ ...userMock, name: 'Updated' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll returns array of users', async () => {
    const result = await controller.findAll();
    expect(result).toEqual([userMock]);
  });

  it('findOne returns a single user', async () => {
    const result = await controller.findOne('1');
    expect(result).toEqual(userMock);
  });

  it('getProfile returns current user', async () => {
    const result = await controller.getProfile(userMock);
    expect(result).toEqual(userMock);
  });

  it('remove deletes user', async () => {
    const result = await controller.remove('1');
    expect(result).toBeUndefined();
  });

  it('update updates a user', async () => {
    const result = await service.update('1', { name: 'Updated' });
    expect(result.name).toEqual('Updated');
  });
});
