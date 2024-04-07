import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { StockModule } from './stock/stock.module';
import { ConfigModule } from '@nestjs/config';
import { FinnhubStockModule } from './finnhub-stock/finnhub-stock.module';

@Module({
  imports: [
    StockModule,
    FinnhubStockModule,
    ConfigModule.forRoot(),
    ScheduleModule.forRoot()
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
