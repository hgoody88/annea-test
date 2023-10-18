import {
  Entity,
  Column,
  PrimaryColumn,
} from 'typeorm'

@Entity('turbine')
export class Turbine {
  @PrimaryColumn({ type: 'timestamptz', nullable: false })
  time: Date

  @Column('numeric', { precision: 18, scale: 10 })
  indicator: number

  @Column()
  turbine_id: number

  @Column()
  variable: number

  constructor(
    time: Date,
    indicator: number,
    turbine_id: number,
    variable: number,
  ) {
    this.time = time
    this.indicator = indicator
    this.turbine_id = turbine_id
    this.variable = variable
  }
}
