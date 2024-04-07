import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { StockModel } from "./stock-model";
import { FinnhubStockService } from "../finnhub-stock/finnhub-stock.service";


@Injectable()
export class StockService {
    private readonly subscribedSymbols: Record<string, number[]> = {}

    constructor(private readonly finnHubStockService: FinnhubStockService, private readonly logger: Logger) {}

    @Cron(CronExpression.EVERY_5_SECONDS)
    private async getNewDataForSymbols(): Promise<void> {
        for(const key in this.subscribedSymbols) {
            const stocks = this.subscribedSymbols[key]
            const newStock  = await this.getStockBySymbol(key)
            if(stocks.length >= 10) {
                stocks.shift()
            }
            stocks.push(newStock.movingAverage)

        }
        this.logger.log(`Getting stocks for: ${Object.keys(this.subscribedSymbols)}`)
    }

    async getStockBySymbol(symbol: string): Promise<StockModel>  {
        const finnHubResponse  = await this.finnHubStockService.getFinnHubResponseBySymbol(symbol)

        //If there would be more then these fields in the long run an automapper implementation would be nice
        const stock: StockModel = {
            currentPrice: finnHubResponse.c,
            lastUpdated: this.generateDateFormat(finnHubResponse.t * 1000),
            /*
            If we already added that symbol to our subscribed array,
            we can calculate moving average if not we are just using the current value 
            */
            movingAverage: this.subscribedSymbols[symbol]?.length > 0 ? 
                                    this.calculateTheMovingAverage(symbol, finnHubResponse.c) : 
                                    finnHubResponse.c
        }
        return stock
    }

    async addNewSymbol(symbol: string): Promise<string> {
        if(!Object.keys(this.subscribedSymbols).includes(symbol)) {
            this.subscribedSymbols[symbol] = []
            this.logger.log(`Adding new symbol: ${symbol} to subscribed array.`)
            return `Successfully updated the subscribed array with: ${symbol} symbol.`
        }

        return `${symbol} is already added to the subscribed list.`
    }

    private calculateTheMovingAverage(symbol: string, currentPrice: number): number {
        const averagePrices = this.subscribedSymbols[symbol]
        const lastAvg = averagePrices.at(-1)
        if(!lastAvg) {
            return 0
        }
        const newAverage = lastAvg * (averagePrices.length - 1) / averagePrices.length + (currentPrice / averagePrices.length)
        return newAverage
    }

    private generateDateFormat(timeStamp: number): string {
        const date = new Date(timeStamp)
        //Looked into more clever or cleaner way to format the date, but to be honest it is the cleanest way.
        return date.toLocaleString([], { timeZone: 'America/New_York' }).replace('. ', '-').replace('. ', '-')
    }
}