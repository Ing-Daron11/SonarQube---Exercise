import { Controller, Post, Body, Get, Query, Param, Patch, Delete } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { BadRequestException } from '@nestjs/common/exceptions';

import { ReservationService } from './reservation.service';
import { Reservation } from './entities/reservation.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { SearchReservationDto } from './dto/search-reservation.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';

@Controller('reservations')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post()
  @Auth()
  @ApiResponse({
    status: 201,
    description: 'Reservation created successfully',
    type: Reservation,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  create(@Body() dto: CreateReservationDto): Promise<Reservation> {
    try {
      return this.reservationService.create(dto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get()
  @Auth()
  @ApiResponse({
    status: 200,
    description: 'List of all reservations',
    type: Reservation,
    isArray: true,
  })
  findAll(@Query() pagination: PaginationDto): Promise<Reservation[]> {
    try {
      return this.reservationService.findAll(pagination);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('search')
  @Auth()
  @ApiResponse({
    status: 200,
    description: 'Search reservation records by filters',
    type: Reservation,
    isArray: true,
  })
  search(@Query() filters: SearchReservationDto): Promise<Reservation[]> {
    try {
      return this.reservationService.search(filters);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get(':id')
  @Auth()
  @ApiResponse({
    status: 200,
    description: 'Get reservation by ID',
    type: Reservation,
  })
  findOne(@Param('id') id: string): Promise<Reservation> {
    try {
      return this.reservationService.findOne(id);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Patch(':id')
  @Auth()
  @ApiResponse({
    status: 200,
    description: 'Reservation updated successfully',
    type: Reservation,
  })
  update(@Param('id') id: string, @Body() dto: UpdateReservationDto): Promise<Reservation> {
    try {
      return this.reservationService.update(id, dto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Delete(':id')
  @Auth()
  @ApiResponse({
    status: 200,
    description: 'Reservation deleted successfully',
  })
  remove(@Param('id') id: string): Promise<void> {
    try {
      return this.reservationService.remove(id);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}


