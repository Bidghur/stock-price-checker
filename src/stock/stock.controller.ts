import { Controller, Get, Param } from "@nestjs/common";
import { StockService } from "./stock.service";
import { StockModel } from "./stock-model";

@Controller('stock')
export class StockController {
    constructor(private readonly stockService: StockService) {}

    @Get(':symbol')
    async getStock(@Param('symbol') symbol : string): Promise<StockModel> {
        return await this.stockService.getStockBySymbol(symbol)
    }

}