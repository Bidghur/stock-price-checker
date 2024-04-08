import { Controller, Get, Param, Put, UseGuards } from "@nestjs/common";
import { StockService } from "./stock.service";
import { StockDto } from "./stock-dto.model";
import { SymbolValidator } from "../guards/symbol-validator.guard";
import { ApiOkResponse, ApiParam } from "@nestjs/swagger";
import { SymbolToUpper } from "../pipes/symbol-to-upper.pipe";

@Controller('stock')
@UseGuards(SymbolValidator)
export class StockController {
    constructor(private readonly stockService: StockService) {}

    @Get(':symbol')
    @ApiOkResponse({
        type: StockDto,
        description: "Get stock informations by symbol."
    })
    @ApiParam({
        name: 'symbol',
        example: 'AAPL',
        required: true
    })
    async getStock(@Param('symbol', SymbolToUpper) symbol: string): Promise<StockDto> {
        return await this.stockService.getStockBySymbol(symbol)
    }

    @Put(':symbol')
    @ApiOkResponse({
        description: "Add new symbol to the subsribed symbols array."
    })
    @ApiParam({
        name: 'symbol',
        example: 'AAPL',
        required: true
    })
    async addNewStock(@Param('symbol', SymbolToUpper) symbol: string): Promise<string> {
        return await this.stockService.addNewSymbol(symbol)
    }

}