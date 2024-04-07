import { HttpService } from "@nestjs/axios";
import { Injectable, NotFoundException } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { StockModel } from "./stock-model";
import { FinnhubStockService } from "src/finnhub-stock/finnhub-stock.service";

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
        if(!(await this.isSymbolValid(symbol))) throw new NotFoundException(`Can't find ${symbol} symbol.`)

        if(!Object.keys(this.interestedSymbols).includes(symbol)) {
            this.interestedSymbols[symbol] = []
            return `Successfully updated the look up array with: ${symbol} symbol.`
        }

        return `${symbol} is already added to the look up list.`
    }

    private async isSymbolValid(symbol: string): Promise<boolean> {
        /*
        Because our API provider doesn't have any validator and it giving back a OK response for invalid symbol, 
        we need to validate it by the data itself 
        */
        const finnHubResponse  = await this.finnHubStockService.getFinnHubResponseBySymbol(symbol)
        return (
            finnHubResponse.c !== 0 &&
            finnHubResponse.d !== null &&
            finnHubResponse.dp !== null &&
            finnHubResponse.h !== 0 &&
            finnHubResponse.l !== 0 &&
            finnHubResponse.o !== 0 &&
            finnHubResponse.pc !== 0 &&
            finnHubResponse.t !== 0
        )
    }

    private generateDateFormat(timeStamp: number): string {
        const date = new Date(timeStamp)
        const getMonth = date.getMonth() < 10 ? '0' + date.getMonth() : date.getMonth()
        return `${date.getFullYear()}-${getMonth}-${date.getDay()} ${date.getHours()}:${date.getMinutes()}:${date.getMilliseconds()}`
    }
}