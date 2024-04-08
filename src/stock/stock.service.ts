import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { StockDto } from "./stock-dto.model";
import { FinnhubStockService } from "../finnhub-stock/finnhub-stock.service";
import { PrismaService } from "../prisma/prisma.service";
import { Stock } from "@prisma/client";


@Injectable()
export class StockService {
    private readonly subscribedSymbols: string[] = []
    constructor(
        private readonly finnHubStockService: FinnhubStockService, 
        private readonly logger: Logger,
        private readonly prismaService: PrismaService
    ) {}

    @Cron(CronExpression.EVERY_5_SECONDS)
    private async getNewStockDataForSymbols(): Promise<void> {
        for(const key of this.subscribedSymbols) {
            const newStock  = await this.fetchNewStock(key)
            await this.prismaService.stock.create({
                data: {
                    currentPrice: newStock.currentPrice,
                    movingAverage: newStock.movingAverage,
                    updatedAt: newStock.lastUpdated,
                    symbol: key
                }
            })
        }
        this.logger.log(`Getting stocks for: ${this.subscribedSymbols.join(',')}`)
    }

    //If the queried stock is in our DB and its updatedAt is not older then 1 day ago, then we are sending back from the DB
    async getStockBySymbol(symbol: string): Promise<StockDto>  {
        const latestStock = await this.getLatestStockFromDbBySymbol(symbol)
        if(latestStock && await this.isStockStillValid(latestStock)) {
            const stock: StockDto = {
                currentPrice: latestStock.currentPrice,
                lastUpdated: latestStock.updatedAt,
                movingAverage: latestStock.movingAverage
            }
            this.logger.log('Cached stock is returned.')
            return stock
        }
        this.logger.log('Fetching new stock.')
        return await this.fetchNewStock(symbol)
        
    }

    async addNewSymbol(symbol: string): Promise<string> {
        if(!this.subscribedSymbols.includes(symbol)) {
            this.logger.log(`Adding new symbol: ${symbol} to subscribed array.`)
            this.subscribedSymbols.push(symbol)
            return `Successfully updated the subscribed array with: ${symbol} symbol.`
        }

        return `${symbol} is already added to the subscribed list.`
    }

    private async fetchNewStock(symbol: string): Promise<StockDto> {
        const finnHubResponse  = await this.finnHubStockService.getFinnHubResponseBySymbol(symbol)

        const stock: StockDto = {
            currentPrice: finnHubResponse.c,
            lastUpdated: this.generateDateFormat(finnHubResponse.t * 1000),
            /*
                If we already saved some stocks into our DB with the requested symbol (at least 2), then calculate the moving average,
                if not just use the new current price
            */
            movingAverage: (await this.getLastTenStocksBySymbol(symbol)).length > 1 ? 
                                await this.calculateTheMovingAverage(symbol, finnHubResponse.c) : 
                                finnHubResponse.c
        }

        return stock
    }

    private async isStockStillValid(latestStock: Stock): Promise<boolean> {
        const latestUpdated = new Date(latestStock.updatedAt)
        return latestUpdated.setDate(latestUpdated.getDate() + 1) >= Date.now()
    }

    private async getLatestStockFromDbBySymbol(symbol: string): Promise<Stock | null> {
        return await this.prismaService.stock.findFirst({
            where: {
                symbol: symbol
            },
            orderBy: {
                id: 'desc'
            }
        })
    }

    private async getLastTenStocksBySymbol(symbol: string): Promise<Stock[]> {
        return await this.prismaService.stock.findMany({
            where: {
                symbol: symbol
            },
            take: 10,
            orderBy: {
                id: "desc"
            }
        })
    }

    private async calculateTheMovingAverage(symbol: string, currentPrice: number): Promise<number> {
        const stocks = await this.getLastTenStocksBySymbol(symbol)

        const lastAvg = stocks.at(-1)?.movingAverage
        if(!lastAvg) {
            return 0
        }
        const newAverage = lastAvg * (stocks.length - 1) / stocks.length + (currentPrice / stocks.length)
        return newAverage
    }

    private generateDateFormat(timeStamp: number): string {
        const date = new Date(timeStamp)
        //Looked into more clever or cleaner way to format the date, but to be honest it is the cleanest way.
        return date.toLocaleString([], { timeZone: 'America/New_York' }).replace('. ', '-').replace('. ', '-')
    }
}