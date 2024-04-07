import { HttpService } from "@nestjs/axios"
import { Injectable, NotFoundException } from "@nestjs/common"
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

    async isSymbolValid(symbol: string): Promise<boolean> {
        /*
        Because our API provider doesn't have any validator and it giving back a OK response for invalid symbol, 
        we need to validate it by the data itself 
        */
       const finnHubResponse = await this.getFinnHubResponseBySymbol(symbol)
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

    private generateUrl(symbol: string): string {
        return `${FINNHUB_URL}/quote?symbol=${symbol}`
    }
}