import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { TurbineModule } from './turbine/turbine.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DatabaseInitModule } from './database-init/database-init.module'

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'postgres',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false,
      installExtensions: true,
      extra: {
        timescaledb: true,
      },
    }),
    TurbineModule,
    DatabaseInitModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
