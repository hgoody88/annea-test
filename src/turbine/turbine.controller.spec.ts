import { Test, TestingModule } from '@nestjs/testing'
import { TurbineController } from './turbine.controller'
import { TurbineService } from './turbine.service'
import { beforeEach, describe, expect, jest, it } from '@jest/globals'

describe('TurbineController', () => {
  let controller: TurbineController
  const mockTurbineService = jest.mock('./turbine.service')

  beforeEach(async () => {
    jest.resetAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TurbineController],
      providers: [
        {
          provide: TurbineService,
          useValue: mockTurbineService,
        },
      ],
    }).compile()

    controller = module.get<TurbineController>(TurbineController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
