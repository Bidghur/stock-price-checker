import { HttpService } from "@nestjs/axios"
import { Injectable } from "@nestjs/common"
import { catchError, lastValueFrom, retry } from "rxjs"
import { FinnhubStockResponse } from "./finnhub-stock-response.model"
import { AxiosError } from "axios"
import { FINNHUB_URL } from "src/config/config"

@Injectable()
export class FinnhubStockService {
    constructor(private readonly httpService: HttpService) {}

    async getFinnHubResponseBySymbol(symbol: string): Promise<FinnhubStockResponse> {
        const { data } = await lastValueFrom(
            this.httpService.get<FinnhubStockResponse>(this.generateUrl(symbol), {
                headers: {
                    'X-Finnhub-Token': process.env.FINNHUB_TOKEN
                }
            }).pipe(
                retry(2),
                catchError((error: AxiosError) => {
                    console.log(`Error while fetching Finnhub response: ${error.response?.data}`)
                    throw new Error('Error while fetching Finnhub response.')
                })
            )
        )
    
        return data
    }

    private generateUrl(symbol: string): string {
        return `${FINNHUB_URL}/quote?symbol=${symbol}`
    }
}