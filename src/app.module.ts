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
      host: 'q5d0mkr989.a5o026nr1p.tsdb.cloud.timescale.com', // 'localhost',
      port: 33775, // 5432,
      username: 'tsdbadmin', // 'postgres',
      password: 'egcovkqkyxd27ml0', // 'postgres',
      database: 'tsdb',
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
