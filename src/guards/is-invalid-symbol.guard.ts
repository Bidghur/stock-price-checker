import { Injectable, CanActivate, ExecutionContext, Inject, NotFoundException } from '@nestjs/common';
import { Request } from 'express';
import { FinnhubStockService } from '../finnhub-stock/finnhub-stock.service';

interface RequestParams {
    symbol: string
}

@Injectable()
export class IsValidSymbol implements CanActivate {
    constructor(@Inject(FinnhubStockService) private finnHubService: FinnhubStockService) {}

    async canActivate(
        context: ExecutionContext,
      ): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request<RequestParams>>();

        const symbol = request.params.symbol
        if(!(await this.finnHubService.isSymbolValid(symbol))) throw new NotFoundException(`Stock doesn't exists with: ${symbol} symbol.`)

        return true
      }
}