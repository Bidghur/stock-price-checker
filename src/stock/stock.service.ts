import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { lastValueFrom } from "rxjs";
import { FINNHUB_URL } from "src/config/config";
import { FinnhubStockResponse } from "./finnhub-stock-response.model";
import { StockModel } from "./stock-model";

@Injectable()
export class StockService {
    constructor(private readonly httpService: HttpService) {}

    async getStockBySymbol(symbol: string): Promise<StockModel>  {
        const { data } = await lastValueFrom(
            this.httpService.get<FinnhubStockResponse>(this.generateUrl(symbol), {
                headers: {
                    'X-Finnhub-Token': process.env.FINNHUB_TOKEN
                }
            })
        )
        //If there would be more then these fields in the long run an automapper implementation would be nice
        const response: StockModel = {
            currentPrice: data.c,
            lastUpdated: this.generateDateFormat(data.t * 1000),
            movingAverage: 0
        }
        
        return response
    }

    private generateUrl(symbol: string): string {
        return `${FINNHUB_URL}/quote?symbol=${symbol}`
    }

    private generateDateFormat(timeStamp: number): string {
        const date = new Date(timeStamp)
        const getMonth = date.getMonth() < 10 ? '0' + date.getMonth() : date.getMonth()
        return `${date.getFullYear()}-${getMonth}-${date.getDay()} ${date.getHours()}:${date.getMinutes()}:${date.getMilliseconds()}`
    }

    @Cron(CronExpression.EVERY_10_SECONDS)
    private testFunction() {
        console.log('mükszik')
    }
}