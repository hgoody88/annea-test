import { Injectable, NotFoundException } from '@nestjs/common'
import { CreateTurbineDto } from './dto/create-turbine.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Turbine } from './entities/turbine.entity'
import { Between, DeleteResult, Repository } from 'typeorm'
import { TurbineAveragesDto } from './dto/turbine-averages.dto'
import { HourlyBucketsDto } from './dto/hourly-buckets.dto'
import { plainToClass, plainToInstance } from 'class-transformer'

interface averageTurbineInfo {
  turbine_turbine_id: number
  avg_indicator: string
  avg_variable: string
}

@Injectable()
export class TurbineService {
  constructor(
    @InjectRepository(Turbine)
    private readonly turbineRepository: Repository<Turbine>,
  ) {}

  async create(createTurbineDto: CreateTurbineDto): Promise<Turbine> {
    const turbine = new Turbine(
      createTurbineDto.timestamp,
      createTurbineDto.indicator,
      createTurbineDto.turbine_id,
      createTurbineDto.variable,
    )
    return await this.turbineRepository.save(turbine)
  }

  // TODO: test start == end (controller)
  //       test start > end
  //       test start < end
  async getAllTurbinesInDateRange(start: Date, end: Date) {
    return await this.turbineRepository.findBy({
      time: Between(start, end),
    })
  }

  async getAllTurbinesInDateRangeById(id: number, start: Date, end: Date) {
    return await this.turbineRepository.findBy({
      turbine_id: id,
      time: Between(start, end),
    })
  }

  async getHourlyAverages(
    turbineId: number,
    start: Date,
    end: Date,
  ): Promise<HourlyBucketsDto[]> {
    const hourlyAverages = await this.turbineRepository
      .createQueryBuilder('turbine')
      .select([
        'time_bucket_gapfill(\'1 hour\', "time") AS hour_bucket',
        'interpolate(avg("indicator")) AS avg_indicator',
        'interpolate(avg("variable")) AS avg_variable',
      ])
      .where('turbine.turbine_id = :turbineId', { turbineId })
      .andWhere('turbine.time >= :start', { start })
      .andWhere('turbine.time < :end', { end })
      .groupBy('hour_bucket')
      .orderBy('hour_bucket')
      .getRawMany()

    return plainToInstance(HourlyBucketsDto, hourlyAverages)
  }

  async getAverageIndicatorVariable(
    start: Date,
    end: Date,
  ): Promise<TurbineAveragesDto[]> {
    const averageData: averageTurbineInfo[] = await this.turbineRepository
      .createQueryBuilder('turbine')
      .select([
        'turbine.turbine_id',
        'AVG(turbine.indicator) as avg_indicator',
        'AVG(turbine.variable) as avg_variable',
      ])
      .where('turbine.time >= :start', { start })
      .andWhere('turbine.time < :end', { end })
      .groupBy('turbine.turbine_id')
      .getRawMany()

    return averageData.map((info) => {
      const turbineId = info.turbine_turbine_id
      const avgIndicator = parseFloat(info.avg_indicator)
      const avgVariable = parseFloat(info.avg_variable)

      return new TurbineAveragesDto(turbineId, avgIndicator, avgVariable)
    })
  }

  async remove(id: number, timestamp: Date): Promise<DeleteResult> {
    const deleteResult = await this.turbineRepository.delete({
      turbine_id: id,
      time: timestamp,
    })
    if (deleteResult.affected == 0) {
      throw new NotFoundException('No matching entries to delete')
    } else {
      return deleteResult
    }
  }
}
