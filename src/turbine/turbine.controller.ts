import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  ValidationPipe,
} from '@nestjs/common'
import { TurbineService } from './turbine.service'
import { CreateTurbineDto } from './dto/create-turbine.dto'
import {
  ApiOperation,
  ApiQuery,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger'
import { DateTimeRangeDto } from './dto/date-time-range.dto'
import { DateTimeRangePipe } from './validation/date-time-range.validation'

@ApiTags('Turbines')
@Controller('turbine')
export class TurbineController {
  constructor(private readonly turbineService: TurbineService) {}

  @Post()
  create(@Body() createTurbineDto: CreateTurbineDto) {
    return this.turbineService.create(createTurbineDto)
  }

  @Get('raw-date-range')
  @ApiOperation({
    summary: 'Get all turbines in a date range',
    description:
      'Retrieve data for all turbines within a specified date range.',
  })
  async getTurbinesInDateRange(
    @Query(new DateTimeRangePipe()) dateRange: DateTimeRangeDto,
  ) {
    const { start, end } = dateRange
    return await this.turbineService.getAllTurbinesInDateRange(start, end)
  }

  @Get('raw-date-range/:id')
  @ApiOperation({
    summary: 'Get turbines by ID in a date range',
    description:
      'Retrieve data for a specific turbine within a specified date range.',
  })
  @ApiParam({
    name: 'id',
    description: 'Turbine ID',
    type: Number,
    example: 41,
  })
  async getTurbinesInDateRangeById(
    @Query(new DateTimeRangePipe()) dateRange: DateTimeRangeDto,
    @Param('id') id: number,
  ) {
    const { start, end } = dateRange
    return await this.turbineService.getAllTurbinesInDateRangeById(
      id,
      start,
      end,
    )
  }

  @Get('hourly-averages')
  @ApiOperation({
    summary: 'Get hourly averages for a specific date range',
    description:
      'Retrieve hourly averages of indicator and variable for a specified date range and turbine.',
  })
  @ApiQuery({
    name: 'turbine_id',
    description: 'Turbine ID',
    type: Number,
    example: 41,
  })
  async getHourlyAverages(
    @Query('turbine_id', new ValidationPipe({ transform: true }))
    turbineId: number,
    @Query(new DateTimeRangePipe()) dateRange: DateTimeRangeDto,
  ) {
    const { start, end } = dateRange

    const hourlyAverages = await this.turbineService.getHourlyAverages(
      turbineId,
      start,
      end,
    )
    return hourlyAverages
  }

  @Get('average-indicator-variable')
  @ApiOperation({
    summary:
      'Get average indicator and variable for each turbine within a date range',
    description:
      'Retrieve the average indicator and variable for each turbine within a specified date range.',
  })
  @Get('average-indicator-variable')
  async getAverageIndicatorVariable(
    @Query(new DateTimeRangePipe()) dateRange: DateTimeRangeDto,
  ) {
    const { start, end } = dateRange
    const averageIndicatorVariablePerTurbine =
      this.turbineService.getAverageIndicatorVariable(start, end)
    return averageIndicatorVariablePerTurbine
  }

  @ApiQuery({
    name: 'turbine_id',
    description: 'ID of turbine entry to delete',
    type: Number,
    example: 41,
  })
  @ApiQuery({
    name: 'timestamp',
    description: 'Time of turbine entry to delete',
    type: Date,
    example: '2015-01-01T10:50:00',
  })
  @Delete('delete-turbines')
  async deleteTurbines(
    @Query('turbine_id') turbineId: number,
    @Query('timestamp') timestamp: Date,
  ) {
    const deleteResult = await this.turbineService.remove(turbineId, timestamp)
    const message = `Deleted ${deleteResult.affected} entries`
    return message
  }
}
