import { Test } from "@nestjs/testing";
import { StockService } from "./stock.service";
import { FinnhubStockService } from "../finnhub-stock/finnhub-stock.service";
import { Logger } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { FinnhubStockResponse } from "../finnhub-stock/finnhub-stock-response.model";
import { StockModel } from "./stock-model";

describe('Stock Service', () => {
    let stockService: StockService
    let finnhubStockService: FinnhubStockService
    let logger: Logger

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            imports: [HttpModule],
            providers: [StockService, FinnhubStockService, Logger],
          }).compile();
    
          stockService = module.get<StockService>(StockService);
          finnhubStockService = module.get<FinnhubStockService>(FinnhubStockService);
          logger = module.get<Logger>(Logger)
      });

      it('Should get back a stock by symbol', async () => {
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

        const expectedStock: StockModel = {
            currentPrice: 169.58,
            lastUpdated: '2024-04-05. 16:00:01',
            movingAverage: 169.58
        }

        const stock = await stockService.getStockBySymbol('test')
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