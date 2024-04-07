import { Injectable, NotFoundException } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { StockModel } from "./stock-model";
import { FinnhubStockService } from "src/finnhub-stock/finnhub-stock.service";


@Injectable()
export class StockService {
    private readonly interestedSymbols: Record<string, StockModel[]> = {}

    constructor(private readonly finnHubStockService: FinnhubStockService) {}

    @Cron(CronExpression.EVERY_5_SECONDS)
    private async getNewDataForSymbols(): Promise<void> {
        for(const key in this.interestedSymbols) {
            const stocks = this.interestedSymbols[key]
            const newStock  = await this.getStockBySymbol(key)
            if(stocks.length >= 10) {
                stocks.shift()
            }
            stocks.push(newStock)

        }
        console.log('mükszik', this.interestedSymbols)
    }

    async getStockBySymbol(symbol: string): Promise<StockModel>  {
        const finnHubResponse  = await this.finnHubStockService.getFinnHubResponseBySymbol(symbol)

        //If there would be more then these fields in the long run an automapper implementation would be nice
        const stock: StockModel = {
            currentPrice: finnHubResponse.c,
            lastUpdated: this.generateDateFormat(finnHubResponse.t * 1000),
            /*
            If we already added that symbol to our looked up array,
            we can calculate moving average if not we are just using the current value 
            */
            movingAverage: this.interestedSymbols[symbol]?.length > 0 ? this.calculateTheMovingAverage(symbol) : finnHubResponse.c
        }
        return stock
    }

    async addNewSymbol(symbol: string): Promise<string> {
        if(!Object.keys(this.interestedSymbols).includes(symbol)) {
            this.interestedSymbols[symbol] = []
            return `Successfully updated the look up array with: ${symbol} symbol.`
        }

        return `${symbol} is already added to the look up list.`
    }

    private calculateTheMovingAverage(symbol: string): number {
        const stocks = this.interestedSymbols[symbol]
        const lastStock = stocks.at(-1)
        if(!lastStock) {
            return 0
        }
        const newAverage = lastStock.movingAverage * (stocks.length - 1) / stocks.length + (lastStock.currentPrice / stocks.length)
        return newAverage
    }

    private generateDateFormat(timeStamp: number): string {
        const date = new Date(timeStamp)
        const styledMonth = date.getMonth() < 10 ? '0' + date.getMonth() : date.getMonth()
        return `${date.getFullYear()}-${styledMonth}-${date.getDay()} ${date.getHours()}:${date.getMinutes()}`
    }
}