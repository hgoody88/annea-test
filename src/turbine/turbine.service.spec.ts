import { Test, TestingModule } from '@nestjs/testing'
import { TurbineService } from './turbine.service'
import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import {
  Between,
} from 'typeorm'
import { Turbine } from './entities/turbine.entity'
import { getRepositoryToken } from '@nestjs/typeorm'
import { CreateTurbineDto } from './dto/create-turbine.dto'
import { HourlyBucketsDto } from './dto/hourly-buckets.dto'

const mockTurbineRepository = {
  save: jest.fn(),
  findBy: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
  })),
  delete: jest.fn(),
}

describe('TurbineService', () => {
  let service: TurbineService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TurbineService,
        {
          provide: getRepositoryToken(Turbine),
          useValue: mockTurbineRepository,
        },
      ],
    }).compile()

    service = module.get<TurbineService>(TurbineService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('create', () => {
    it('should create a new turbine', async () => {
      // Arrange
      const createTurbineDto: CreateTurbineDto = {
        timestamp: new Date(),
        indicator: 42,
        turbine_id: 1,
        variable: 10,
      }
      const mockTurbine = new Turbine(
        createTurbineDto.timestamp,
        createTurbineDto.indicator,
        createTurbineDto.turbine_id,
        createTurbineDto.variable,
      )

      mockTurbineRepository.save.mockReturnValueOnce(
        Promise.resolve(mockTurbine),
      )

      // Act
      const result = await service.create(createTurbineDto)

      // Assert
      expect(result).toEqual(mockTurbine)
      expect(mockTurbineRepository.save).toHaveBeenCalledWith(mockTurbine)
    })
  })

  describe('getAllTurbinesInDateRange', () => {
    it('should retrieve turbines in a date range', async () => {
      // Arrange
      const startDate = new Date('2023-01-01')
      const endDate = new Date('2023-02-01')
      const mockTurbines = [
        new Turbine(new Date(), 1, 1, 1),
        new Turbine(new Date(), 2, 2, 2),
      ]

      mockTurbineRepository.findBy.mockReturnValueOnce(
        Promise.resolve(mockTurbines),
      )

      // Act
      const result = await service.getAllTurbinesInDateRange(startDate, endDate)

      // Assert
      expect(result).toEqual(mockTurbines)
      expect(mockTurbineRepository.findBy).toHaveBeenCalledWith({
        time: Between(startDate, endDate),
      })
    })

    it('should handle empty result', async () => {
      // Arrange
      const startDate = new Date('2023-01-01')
      const endDate = new Date('2023-02-01')

      mockTurbineRepository.findBy.mockReturnValueOnce(Promise.resolve([]))

      // Act
      const result = await service.getAllTurbinesInDateRange(startDate, endDate)

      // Assert
      expect(result).toEqual([])
      expect(mockTurbineRepository.findBy).toHaveBeenCalledWith({
        time: Between(startDate, endDate),
      })
    })
  })

  describe('getAllTurbinesInDateRangeById', () => {
    it('should retrieve turbines for a specific ID in a date range', async () => {
      // Arrange
      const id = 1
      const startDate = new Date('2023-01-01')
      const endDate = new Date('2023-02-01')
      const mockTurbines = [
        new Turbine(new Date(), 1, 1, 1),
        new Turbine(new Date(), 2, 2, 2),
      ]

      mockTurbineRepository.findBy.mockReturnValueOnce(
        Promise.resolve(mockTurbines),
      )

      // Act
      const result = await service.getAllTurbinesInDateRangeById(
        id,
        startDate,
        endDate,
      )

      // Assert
      expect(result).toEqual(mockTurbines)
      expect(mockTurbineRepository.findBy).toHaveBeenCalledWith({
        turbine_id: id,
        time: Between(startDate, endDate),
      })
    })
  })

  describe('getHourlyAverages', () => {
    it('should retrieve hourly averages for a specific turbine in a date range', async () => {
      // Arrange
      const turbineId = 1
      const startDate = new Date('2023-01-01')
      const endDate = new Date('2023-02-01')
      const mockHourlyAverages = [
        new HourlyBucketsDto(new Date(), 1, 1),
        new HourlyBucketsDto(new Date(), 2, 2),
      ]

      // Mock the createQueryBuilder function
      mockTurbineRepository.createQueryBuilder.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest
          .fn()
          .mockReturnValue(Promise.resolve(mockHourlyAverages)),
      })

      // Act
      const result = await service.getHourlyAverages(
        turbineId,
        startDate,
        endDate,
      )

      // Assert
      expect(result).toEqual(mockHourlyAverages)
      const queryBuilder = mockTurbineRepository.createQueryBuilder()
      expect(queryBuilder.select).toHaveBeenCalledWith([
        'time_bucket_gapfill(\'1 hour\', "time") AS hour_bucket',
        'interpolate(avg("indicator")) AS avg_indicator',
        'interpolate(avg("variable")) AS avg_variable',
      ])
      expect(queryBuilder.where).toHaveBeenCalledWith(
        'turbine.turbine_id = :turbineId',
        { turbineId: turbineId },
      )
      expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(
        1,
        'turbine.time >= :start',
        { start: startDate },
      )
      expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(
        2,
        'turbine.time < :end',
        { end: endDate },
      )
      expect(queryBuilder.groupBy).toHaveBeenCalledWith('hour_bucket')
      expect(queryBuilder.orderBy).toHaveBeenCalledWith('hour_bucket')
    })
  })
})
