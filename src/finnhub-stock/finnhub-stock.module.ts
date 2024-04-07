import { Global, Logger, Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { FinnhubStockService } from "./finnhub-stock.service";

@Global()
@Module({
    imports: [HttpModule],
    providers: [FinnhubStockService, Logger],
})
export class FinnhubStockModule {}