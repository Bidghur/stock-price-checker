import { Controller, Get, Param, Put, UseGuards } from "@nestjs/common";
import { StockService } from "./stock.service";
import { StockModel } from "./stock-model";
import { IsValidSymbol } from "src/guards/symbol.guard";

@UseGuards(IsValidSymbol)
@Controller('stock')
export class StockController {
    constructor(private readonly stockService: StockService) {}

    @Get(':symbol')
    async getStock(@Param('symbol') symbol : string): Promise<StockModel> {
        return await this.stockService.getStockBySymbol(symbol)
    }

    @Put(':symbol')
    async addNewStock(@Param('symbol') symbol : string): Promise<string> {
        return await this.stockService.addNewSymbol(symbol)
    }

}