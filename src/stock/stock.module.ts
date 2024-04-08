import { Logger, Module } from "@nestjs/common";
import { StockController } from "./stock.controller";
import { StockService } from "./stock.service";
import { HttpModule } from "@nestjs/axios";
import { FinnhubStockModule } from "../finnhub-stock/finnhub-stock.module";
import { FinnhubStockService } from "../finnhub-stock/finnhub-stock.service";
import { APP_GUARD } from "@nestjs/core";
import { SymbolValidator } from "../guards/symbol-validator.guard";
import { PrismaService } from "../prisma/prisma.service";

@Module({
    imports: [HttpModule, FinnhubStockModule],
    controllers: [StockController],
    providers: [
        StockService, 
        FinnhubStockService, 
        {
            provide: APP_GUARD,
            useClass: SymbolValidator,
        },
        Logger,
        PrismaService
    ],
})
export class StockModule {}