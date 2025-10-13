import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { OneToMany } from 'typeorm';
import { Equipment } from 'src/equipment/entities/equipment.entity';


@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { unique: true })
  email: string;

  @Column('text', { select: false })
  password: string;

  @Column('text')
  name: string;

  @Column('text', { array: true, default: [] })
  roles: string[];

  @Column('bool', { default: true })
  isActive: boolean;

  @OneToMany(() => Equipment, (equipment) => equipment.user)
  equipment: Equipment[];

}
