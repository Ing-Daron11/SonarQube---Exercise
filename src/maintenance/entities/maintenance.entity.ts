import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Equipment } from 'src/equipment/entities/equipment.entity';
import { User } from 'src/auth/entities/user.entity'; 

@Entity()
export class Maintenance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Equipment, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'equipment_id' })
  equipment: Equipment;

  @ManyToOne(() => User, { eager: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'technician_id' })
  technician: User;

  @Column('text')
  description: string;

  @CreateDateColumn({ name: 'date' })
  date: Date;
}
