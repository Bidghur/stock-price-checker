import { Controller, Get, Param, Put, UseGuards } from "@nestjs/common";
import { StockService } from "./stock.service";
import { StockModel } from "./stock-model";
import { IsValidSymbol } from "src/guards/is-invalid-symbol.guard";
import { ApiOkResponse, ApiParam, ApiResponse } from "@nestjs/swagger";

@Controller('stock')
@UseGuards(IsValidSymbol)
export class StockController {
    constructor(private readonly stockService: StockService) {}

    @Get(':symbol')
    @ApiOkResponse({
        type: StockModel,
        description: "Get stock informations by symbol."
    })
    async getStock(@Param('symbol') symbol : string): Promise<StockModel> {
        return await this.stockService.getStockBySymbol(symbol)
    }

    @Put(':symbol')
    @ApiOkResponse({
        description: "Get stock informations by symbol."
    })
    async addNewStock(@Param('symbol') symbol : string): Promise<string> {
        return await this.stockService.addNewSymbol(symbol)
    }

}