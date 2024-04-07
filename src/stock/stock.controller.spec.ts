import { Test } from "@nestjs/testing"
import { StockController } from "./stock.controller"
import { StockService } from "./stock.service"
import { HttpModule } from "@nestjs/axios"
import { Logger } from "@nestjs/common"
import { StockModel } from "./stock-model"
import { FinnhubStockService } from "../finnhub-stock/finnhub-stock.service"

describe('Stock controller', () => {
    let stockController: StockController
    let stockService: StockService

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            imports: [HttpModule],
            controllers: [StockController],
            providers: [StockService, Logger, FinnhubStockService],
          }).compile();
    
        stockController = module.get<StockController>(StockController);
        stockService = module.get<StockService>(StockService);
    })

    it('Should return stock by symbol', async () => {
        const mockedResponse: StockModel = {
            currentPrice: 123,
            lastUpdated: 'test',
            movingAverage: 324
        }
        jest.spyOn(stockService, 'getStockBySymbol').mockResolvedValue(mockedResponse)

        const stock = await stockController.getStock('test')
        expect(stock).toEqual(mockedResponse)
    })

    it('Should successfully add new symbol to the subscribed array', async () => {
        jest.spyOn(stockService, 'addNewSymbol').mockResolvedValue('Test added')

        const response = await stockController.addNewStock('test')
        expect(response).toEqual('Test added')
    })
})