import { Controller, Post, Body, Get, Query, Param, Patch, Delete } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { BadRequestException } from '@nestjs/common/exceptions';


import { EquipmentService } from './equipment.service';
import { Equipment } from './entities/equipment.entity';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ValidRoles } from 'src/auth/interfaces/valid-roles';
import { EquipmentStatus } from './enums/equipment.enum';
import { SearchEquipmentDto } from './dto/search-equipment.dto';
import { UpdateEquipmentStatusDto } from './dto/update-equipment-status.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/entities/user.entity';

@Controller('equipment')
export class EquipmentController {

    constructor(private readonly equipmentService: EquipmentService) { }

    @Post()
    @ApiResponse({
        status: 201,
        description: 'Equipment created successfully',
        type: Equipment,
    })
    @ApiResponse({
        status: 400,
        description: 'Bad Request',
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized',
    })
    @Auth(ValidRoles.admin)
    create(@Body() equipmentDto: CreateEquipmentDto): Promise<Equipment> {
        try {
            return this.equipmentService.create(equipmentDto);
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    @Get()
    @ApiResponse({
        status: 200,
        description: 'List of all equipment',
        type: Equipment,
        isArray: true,
    })
    findAll(@Query() pagination: PaginationDto): Promise<Equipment[]> {
        try {
            return this.equipmentService.findAll(pagination);
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    // GET /equipment/rented
    @Get('rented')
    @Auth()
    async findRentedByUser(@GetUser() user: User): Promise<Equipment[]> {
        return this.equipmentService.findRentedByUser(user.id);
    }


    @Get('search')
    @ApiResponse({
        status: 200,
        description: 'Search for equipment by term',
        type: Equipment,
        isArray: true,
    })
    @ApiResponse({
        status: 400,
        description: 'Bad Request',
    })
    search(@Query() filters: SearchEquipmentDto): Promise<Equipment[]> {
        try {
            return this.equipmentService.search(filters);
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }


    @Get(':term')
    findOne(@Param('term') term: string): Promise<Equipment> {
        try {
            return this.equipmentService.findOne(term);
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    @Patch(':id')
    @ApiResponse({
        status: 200,
        description: 'Equipment updated successfully',
        type: Equipment,
    })
    @ApiResponse({
        status: 400,
        description: 'Bad Request',
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized',
    })
    @Auth(ValidRoles.admin)
    update(@Param('id') id: string, @Body() dto: UpdateEquipmentDto): Promise<Equipment> {
        try {
            return this.equipmentService.update(id, dto);
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    @Delete(':id')
    @ApiResponse({
        status: 200,
        description: 'Equipment deleted successfully',
        type: Equipment,
    })
    @ApiResponse({
        status: 400,
        description: 'Bad Request',
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized',
    })
    @Auth(ValidRoles.admin)
    async remove(@Param('id') id: string): Promise<{ message: string; equipmentId: string }> {
        try {
            const equipment = await this.equipmentService.findOne(id);

            await this.equipmentService.remove(id);

            return {
                message: `Equipment with ID ${id} was deleted successfully`,
                equipmentId: id
            };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }


    @Patch('status/:id')
    @ApiResponse({
        status: 200,
        description: 'Equipment status updated successfully',
        type: Equipment,
    })
    @ApiResponse({
        status: 400,
        description: 'Bad Request',
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized',
    })

    @Auth(ValidRoles.admin, ValidRoles.technical)
    async updateStatus(
        @Param('id') id: string,
        @Body() status: UpdateEquipmentStatusDto,
        @GetUser() user: User,
    ): Promise<Equipment> {
        const { status: newStatus } = status;
        
        switch (newStatus) {
            case EquipmentStatus.AVAILABLE:
                return this.equipmentService.markAsAvailable(id);
            case EquipmentStatus.RENTED:
                return this.equipmentService.markAsRented(id, user);
            case EquipmentStatus.MAINTENANCE:
                return this.equipmentService.markInMaintenance(id);
            default:
                throw new BadRequestException(`Invalid status: ${newStatus}`);
        }

        
    }

    @Patch(':id/release')
    @Auth()
    @ApiResponse({
        status: 200,
        description: 'Equipment released successfully',
        type: Equipment,
    })
    async releaseEquipment(@Param('id') id: string): Promise<Equipment> {
        return this.equipmentService.releaseEquipment(id);
    }

}

