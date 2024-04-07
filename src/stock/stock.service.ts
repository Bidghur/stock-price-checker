import { HttpService } from "@nestjs/axios";
import { Injectable, NotFoundException } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { StockModel } from "./stock-model";
import { FinnhubStockService } from "src/finnhub-stock/finnhub-stock.service";
import { AxiosError } from "axios";

@Injectable()
export class StockService {
    private readonly interestedSymbols: Record<string, StockModel[]> = {}

    constructor(private readonly finnHubStockService: FinnhubStockService) {}

    @Cron(CronExpression.EVERY_10_SECONDS)
    private testFunction() {
        console.log('mükszik')
    }

    async getStockBySymbol(symbol: string): Promise<StockModel>  {
        const finnHubResponse  = await this.finnHubStockService.getFinnHubResponseBySymbol(symbol)
        //If there would be more then these fields in the long run an automapper implementation would be nice
        const response: StockModel = {
            currentPrice: finnHubResponse.c,
            lastUpdated: this.generateDateFormat(finnHubResponse.t * 1000),
            movingAverage: 0
        }
        return response
    }

    async addNewSymbol(symbol: string): Promise<string> {
        if(!Object.keys(this.interestedSymbols).includes(symbol)) {
            this.interestedSymbols[symbol] = []
            return `Successfully updated the look up array with: ${symbol} symbol.`
        }

        return `${symbol} is already added to the look up list.`
    }

    

    private generateDateFormat(timeStamp: number): string {
        const date = new Date(timeStamp)
        const getMonth = date.getMonth() < 10 ? '0' + date.getMonth() : date.getMonth()
        return `${date.getFullYear()}-${getMonth}-${date.getDay()} ${date.getHours()}:${date.getMinutes()}:${date.getMilliseconds()}`
    }
}