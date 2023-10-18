import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsDate, IsNotEmpty } from 'class-validator'

export class DateTimeRangeDto {
  @IsNotEmpty({ message: 'Start date is required' })
  @IsDate({ message: 'Invalid date format for start date' })
  @ApiProperty({ example: '2017-01-03T00:00:00' })
  @Transform(({ value }) => new Date(value))
  start: Date

  @IsNotEmpty({ message: 'End date is required' })
  @IsDate({ message: 'Invalid date format for end date' })
  @ApiProperty({ example: '2017-01-03T23:59:59' })
  @Transform(({ value }) => new Date(value))
  end: Date
}
