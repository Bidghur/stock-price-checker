import { Injectable, CanActivate, ExecutionContext, Inject } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { FinnhubStockService } from 'src/finnhub-stock/finnhub-stock.service';

interface RequestParams {
    symbol: string
}

@Injectable()
export class IsValidSymbol implements CanActivate {
    constructor(@Inject(FinnhubStockService) private finnHubService: FinnhubStockService) {}

    canActivate(
        context: ExecutionContext,
      ): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest<Request<RequestParams>>();
        return this.validateRequest(request);
      }

        private validateRequest(request: Request<RequestParams>): boolean | Promise<boolean> | Observable<boolean> {
            return this.finnHubService.isSymbolValid(request.params.symbol)
      }
}