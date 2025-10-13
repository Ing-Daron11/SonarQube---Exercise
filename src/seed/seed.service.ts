import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async onApplicationBootstrap() {
    // Verificar si ya existen usuarios en la base de datos
    const existingUser = await this.userRepository.findOneBy({ email: 'daron@gmail.com' });
     if (existingUser) {
      console.log('El admin ya existe, no se ejecuta el seeder.');
      return;
    }

    // Crear un usuario inicial con roles
    const hashedPassword = await bcrypt.hash('daron123', 10);
    const adminUser = this.userRepository.create({
      name: 'daron',
      email: 'daron@gmail.com',
      password: hashedPassword,
      roles: ['admin'],
    });
    

    await this.userRepository.save(adminUser);
    console.log('Usuario administrador creado.');
  }
}