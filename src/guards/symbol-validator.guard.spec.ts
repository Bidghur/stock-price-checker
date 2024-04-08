import { Test } from "@nestjs/testing";
import { SymbolValidator } from "./symbol-validator.guard"
import { HttpModule } from "@nestjs/axios";
import { StockController } from "../stock/stock.controller";
import { FinnhubStockService } from "../finnhub-stock/finnhub-stock.service";
import { ExecutionContext, Logger, NotFoundException } from "@nestjs/common";
import { StockService } from "../stock/stock.service";
import { APP_GUARD } from "@nestjs/core";
import { FinnhubStockResponse } from "../finnhub-stock/finnhub-stock-response.model";
import { PrismaService } from "../prisma/prisma.service";

describe('Symbol validator', () => {
    let symbolValidator: SymbolValidator
    let finnhubStockService: FinnhubStockService

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            imports: [HttpModule],
            controllers: [StockController],
            providers: [
                FinnhubStockService, 
                Logger, 
                StockService,
                {
                    provide: APP_GUARD,
                    useClass: SymbolValidator,
                },
                {
                    provide: PrismaService,
                    useValue: {}
                }
            ],
          }).compile();
    
          symbolValidator = module.get<SymbolValidator>(SymbolValidator);
          finnhubStockService = module.get<FinnhubStockService>(FinnhubStockService);
    });

    const mockedContext: ExecutionContext = {
        switchToHttp: jest.fn(() => {
            return {
                getRequest: jest.fn(() => {
                    return {
                        params: {
                            symbol: 'test'
                        }
                    }
                })
            } 
        }),
    } as any as ExecutionContext

    it('Should be truthy if symbol is valid', async () => {
        jest.spyOn(finnhubStockService, 'isSymbolValid').mockResolvedValue(true)

        const response = await symbolValidator.canActivate(mockedContext)

        expect(response).toBeTruthy()
    })

    it('Should throw an error if symbol is not valid', async () => {
        const mockedresponse: FinnhubStockResponse = {
            c: 0,
            d: 0.76,
            dp: 0.4502,
            h: 170.38,
            l: 168.95,
            o: 169.5,
            pc: 168.82,
            t: 1712347201
        }
        const expectedError = new NotFoundException("Stock doesn't exists with: test symbol.")
        jest.spyOn(finnhubStockService, 'getFinnHubResponseBySymbol').mockResolvedValue(mockedresponse)

        expect(symbolValidator.canActivate(mockedContext)).rejects.toEqual(expectedError)
    })
})