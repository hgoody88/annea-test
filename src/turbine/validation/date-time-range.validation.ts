import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common'
import { DateTimeRangeDto } from '../dto/date-time-range.dto'

@Injectable()
export class DateTimeRangePipe
  implements PipeTransform<DateTimeRangeDto, DateTimeRangeDto>
{
  transform(
    value: DateTimeRangeDto,
    _metadata: ArgumentMetadata,
  ): DateTimeRangeDto {
    const { start, end } = value
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
      throw new BadRequestException('Invalid date range')
    }

    return { start, end }
  }
}
