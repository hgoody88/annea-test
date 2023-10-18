export class HourlyBucketsDto {
  hour_bucket: Date
  avg_indicator: number
  avg_variable: number

  constructor(hour_bucket: Date, avg_indicator: number, avg_variable: number) {
    this.hour_bucket = hour_bucket
    this.avg_indicator = avg_indicator
    this.avg_variable = avg_variable
  }
}
