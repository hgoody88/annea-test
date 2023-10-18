import { Injectable, OnModuleInit } from '@nestjs/common'
import { join, resolve } from 'path'
import { EntityManager, QueryRunner } from 'typeorm'

@Injectable()
export class DatabaseInitialisationService implements OnModuleInit {
  constructor(private readonly entityManager: EntityManager) {}

  async onModuleInit() {
    console.log('Initializing database...')
    const queryRunner = this.entityManager.connection.createQueryRunner()
    this.runMigrations(queryRunner)
  }

  private async runMigrations(queryRunner: QueryRunner) {
    const queryRows: { count: string }[] = await queryRunner.query(
      'SELECT COUNT(*) FROM turbine;',
    )
    const rowCount = queryRows[0].count
    if (rowCount !== '0') {
      console.log(`Table already populated with ${rowCount} rows.`)
      return
    }

    try {
      // Create the TimescaleDB extension
      await queryRunner.query('CREATE EXTENSION IF NOT EXISTS timescaledb;')

      // Create the "turbine" table
      await queryRunner.query(`
                CREATE TABLE IF NOT EXISTS turbine (
                    time timestamptz,
                    indicator numeric(18, 10),
                    turbine_id integer,
                    variable integer
                );
            `)

      // TODO: sort in dockerfile
      const csvFilePath = resolve(__dirname, 'example_indicator.csv') // Adjust the path as needed
      const maybePath = join(process.cwd(), 'example_indicator.csv')

      // Read and execute the CSV data import
      await queryRunner.query(`
                SELECT create_hypertable('turbine', 'time');
                COPY turbine FROM '${maybePath}' DELIMITER ',' CSV HEADER;
            `)
      console.log('database setup')
    } catch (error) {
      console.log('errored')
      console.log(error)
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      console.log('finally')
      if (queryRunner.isTransactionActive) {
        await queryRunner.release()
      }
    }
  }
}
