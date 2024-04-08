import { Test } from "@nestjs/testing";
import { StockService } from "./stock.service";
import { FinnhubStockService } from "../finnhub-stock/finnhub-stock.service";
import { Logger } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { FinnhubStockResponse } from "../finnhub-stock/finnhub-stock-response.model";
import { StockDto } from "./stock-dto.model";
import { PrismaService } from "../prisma/prisma.service";
import { Prisma, Stock } from "@prisma/client";

describe('Stock Service', () => {
    let stockService: StockService
    let finnhubStockService: FinnhubStockService
    let logger: Logger
    let prismaService: PrismaService

    const mockedFindManyStocks: Stock[] = [
      {
        id: 1,
        currentPrice: 123,
        symbol: 'AAPL',
        movingAverage: 123,
        updatedAt: new Date().toDateString()
      },
      {
        id: 2,
        currentPrice: 12344,
        symbol: 'MSFT',
        movingAverage: 556,
        updatedAt: new Date().toDateString()
      }
    ]

    const mockedFindFirstStock: Stock = {
      id: 2,
      currentPrice: 12344,
      symbol: 'MSFT',
      movingAverage: 556,
      updatedAt: new Date().toDateString()
    }

    const mockedPrismaService = jest.fn(() => ({
      stock: {
        findMany: async (query: Prisma.StockFindManyArgs): Promise<Stock[]> => {
          return mockedFindManyStocks.filter(stock => stock.symbol === query.where?.symbol)
        },
        findFirst: async (query: Prisma.StockFindFirstArgs): Promise<Stock | null> => {
          return mockedFindFirstStock.symbol === query.where?.symbol? mockedFindFirstStock : null
        },
        create: async (query: Prisma.StockCreateArgs): Promise<string> => 'Created!'
      } as unknown as Prisma.StockDelegate
    }));

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            imports: [HttpModule],
            providers: [
              StockService, 
              FinnhubStockService, 
              Logger,
              {
                provide: PrismaService,
                useClass: mockedPrismaService
              }
            ],
          }).compile();
    
          stockService = module.get<StockService>(StockService);
          finnhubStockService = module.get<FinnhubStockService>(FinnhubStockService);
          logger = module.get<Logger>(Logger)
          prismaService = module.get<PrismaService>(PrismaService)

      });

      it('Should fetch new stock with unsaved symbol', async () => {
        const mockedresponse: FinnhubStockResponse = {
            c: 169.58,
            d: 0.76,
            dp: 0.4502,
            h: 170.38,
            l: 168.95,
            o: 169.5,
            pc: 168.82,
            t: 1712347201
        }
        jest.spyOn(finnhubStockService, 'getFinnHubResponseBySymbol').mockResolvedValue(mockedresponse)
        const loggerSpy = jest.spyOn(logger, 'log')

        const expectedStock: StockDto = {
            currentPrice: 169.58,
            lastUpdated: '2024-04-05. 16:00:01',
            movingAverage: 169.58
        }

        const stock = await stockService.getStockBySymbol('test')
        expect(loggerSpy).toHaveBeenCalledWith('Fetching new stock.')
        expect(stock).toEqual(expectedStock)
      })

      it('Should receive stock from DB', async () => {
        const loggerSpy = jest.spyOn(logger, 'log')

        const expectedStock: StockDto = {
          currentPrice: 12344,
          movingAverage: 556,
          lastUpdated: new Date().toDateString()
        }

        const stock = await stockService.getStockBySymbol('MSFT')
        expect(loggerSpy).toHaveBeenCalledWith('Cached stock is returned.')
        expect(stock).toEqual(expectedStock)
      })

      it('Should successfully add a new symbol to the subscribed array', async () => {
        const loggerspy = jest.spyOn(logger, 'log')

        const response = await stockService.addNewSymbol('testSymbol')

        expect(response).toEqual('Successfully updated the subscribed array with: testSymbol symbol.')
        expect(loggerspy).toHaveBeenCalledWith('Adding new symbol: testSymbol to subscribed array.')
      })

      it('Should notify the user that symbol is already added into the subscribed array', async () => {
        const loggerspy = jest.spyOn(logger, 'log')

        await stockService.addNewSymbol('testSymbol')
        const response = await stockService.addNewSymbol('testSymbol')

        expect(response).toEqual('testSymbol is already added to the subscribed list.')
        expect(loggerspy).toHaveBeenCalledTimes(1)
        expect(loggerspy).not.toHaveBeenCalledTimes(2)
      })
})