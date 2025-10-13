import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
  } from 'typeorm';
  import { Equipment } from 'src/equipment/entities/equipment.entity';
  import { User } from 'src/auth/entities/user.entity';
  
  @Entity()
  export class Reservation {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @ManyToOne(() => Equipment, { eager: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'equipment_id' })
    equipment: Equipment;
  
    @ManyToOne(() => User, { eager: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'user_id' })
    user: User;
  
    @Column({ type: 'timestamp' })
    startDate: Date;
  
    @Column({ type: 'timestamp' })
    endDate: Date;
  
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
  }
  