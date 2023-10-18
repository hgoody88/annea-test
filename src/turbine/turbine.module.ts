import { Module } from '@nestjs/common'
import { TurbineService } from './turbine.service'
import { TurbineController } from './turbine.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Turbine } from './entities/turbine.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Turbine])],
  controllers: [TurbineController],
  providers: [TurbineService],
})
export class TurbineModule {}
