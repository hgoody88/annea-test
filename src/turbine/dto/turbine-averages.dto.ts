export class TurbineAveragesDto {
  turbine_id: number
  avg_indicator: number
  avg_variable: number

  constructor(turbineId: number, avgIndicator: number, avgVariable: number) {
    this.turbine_id = turbineId
    this.avg_indicator = avgIndicator
    this.avg_variable = avgVariable
  }
}
