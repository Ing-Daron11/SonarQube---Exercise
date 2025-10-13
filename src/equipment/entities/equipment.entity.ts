import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { EquipmentCategory, EquipmentStatus } from '../enums/equipment.enum';
import { User } from 'src/auth/entities/user.entity';
import { ManyToOne } from 'typeorm';

@Entity()
export class Equipment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', { unique: true })
    name: string;

    @Column('text')
    model: string;

    @Column('text')
    description: string;

    @Column('enum', { enum: EquipmentCategory })
    category: EquipmentCategory;

    @Column('enum', { enum: EquipmentStatus, default: EquipmentStatus.AVAILABLE })
    status: EquipmentStatus;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @ManyToOne(() => User, (user) => user.equipment, { eager: true, nullable: true })
    user: User | null;
}
