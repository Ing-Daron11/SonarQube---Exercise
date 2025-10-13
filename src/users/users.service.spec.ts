import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../auth/entities/user.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let repo: Repository<User>;

  const userArray = [
    { id: '1', name: 'Test1', email: 'test1@mail.com', roles: ['admin'], isActive: true },
    { id: '2', name: 'Test2', email: 'test2@mail.com', roles: ['user'], isActive: true },
  ];

  const mockRepository = {
    find: jest.fn().mockResolvedValue(userArray),
    findOneBy: jest.fn().mockImplementation(({ id }) =>
      userArray.find(user => user.id === id) || null,
    ),
    remove: jest.fn().mockResolvedValue(undefined),
    merge: jest.fn((u, dto) => ({ ...u, ...dto })),
    save: jest.fn().mockImplementation(user => Promise.resolve(user)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return users', async () => {
    const result = await service.findAll();
    expect(result).toEqual(userArray);
    expect(repo.find).toHaveBeenCalled();
  });

  it('findOne should return a user', async () => {
    const result = await service.findOne('1');
    expect(result).toEqual(userArray[0]);
  });

  it('findOne throws NotFound if not found', async () => {
    await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
  });

  // it('remove should call remove', async () => {
  //   const result = await service.remove('1');
  //   expect(result).toBeUndefined();
  //   expect(repo.remove).toHaveBeenCalled();
  // });

  it('update should return updated user', async () => {
    const dto = { name: 'Updated' };
    const result = await service.update('1', dto);
    expect(result.name).toBe('Updated');
    expect(repo.save).toHaveBeenCalled();
  });

  it('getProfile should return user', async () => {
    const result = await service.getProfile('1');
    expect(result).toEqual(userArray[0]);
  });
});
