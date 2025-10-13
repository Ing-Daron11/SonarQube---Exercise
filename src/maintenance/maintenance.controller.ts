import { Controller, Post, Body, Get, Query, Param, Patch, Delete } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { BadRequestException } from '@nestjs/common/exceptions';

import { MaintenanceService } from './maintenance.service';
import { Maintenance } from './entities/maintenance.entity';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto';
import { SearchMaintenanceDto } from './dto/search-maintenance.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ValidRoles } from 'src/auth/interfaces/valid-roles';

@Controller('maintenance')
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Post()
  @Auth(ValidRoles.admin, ValidRoles.technical)
  @ApiResponse({
    status: 201,
    description: 'Maintenance record created successfully',
    type: Maintenance,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  create(@Body() dto: CreateMaintenanceDto): Promise<Maintenance> {
    try {
      return this.maintenanceService.create(dto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get()
  @Auth(ValidRoles.admin, ValidRoles.technical)
  @ApiResponse({
    status: 200,
    description: 'List of all maintenance records',
    type: Maintenance,
    isArray: true,
  })
  findAll(@Query() pagination: PaginationDto): Promise<Maintenance[]> {
    try {
      return this.maintenanceService.findAll(pagination);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('search')
  @Auth(ValidRoles.admin, ValidRoles.technical)
  @ApiResponse({
    status: 200,
    description: 'Search maintenance records by filters',
    type: Maintenance,
    isArray: true,
  })
  search(@Query() filters: SearchMaintenanceDto): Promise<Maintenance[]> {
    try {
      return this.maintenanceService.search(filters);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get(':id')
  @Auth(ValidRoles.admin, ValidRoles.technical)
  @ApiResponse({
    status: 200,
    description: 'Get maintenance record by ID',
    type: Maintenance,
  })
  findOne(@Param('id') id: string): Promise<Maintenance> {
    try {
      return this.maintenanceService.findOne(id);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Patch(':id')
  @Auth(ValidRoles.admin, ValidRoles.technical)
  @ApiResponse({
    status: 200,
    description: 'Maintenance record updated successfully',
    type: Maintenance,
  })
  update(@Param('id') id: string, @Body() dto: UpdateMaintenanceDto): Promise<Maintenance> {
    try {
      return this.maintenanceService.update(id, dto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Delete(':id')
  @Auth(ValidRoles.admin, ValidRoles.technical)
  @ApiResponse({
    status: 200,
    description: 'Maintenance record deleted successfully',
  })
  remove(@Param('id') id: string): Promise<void> {
    try {
      return this.maintenanceService.remove(id);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
