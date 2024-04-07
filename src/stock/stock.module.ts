import { Logger, Module } from "@nestjs/common";
import { StockController } from "./stock.controller";
import { StockService } from "./stock.service";
import { HttpModule } from "@nestjs/axios";
import { FinnhubStockModule } from "src/finnhub-stock/finnhub-stock.module";
import { FinnhubStockService } from "src/finnhub-stock/finnhub-stock.service";
import { APP_GUARD } from "@nestjs/core";
import { IsValidSymbol } from "src/guards/is-invalid-symbol.guard";

@Module({
    imports: [HttpModule, FinnhubStockModule],
    controllers: [StockController],
    providers: [
        StockService, 
        FinnhubStockService, 
        {
            provide: APP_GUARD,
            useClass: IsValidSymbol,
        },
        Logger
    ],
})
export class StockModule {}