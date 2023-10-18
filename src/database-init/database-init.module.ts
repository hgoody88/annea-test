import { Module } from '@nestjs/common'
import { DatabaseInitialisationService } from './database-init.service'

@Module({
  providers: [DatabaseInitialisationService],
})
export class DatabaseInitModule {}
