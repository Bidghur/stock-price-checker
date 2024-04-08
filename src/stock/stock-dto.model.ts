import { ApiProperty } from "@nestjs/swagger"

export class StockDto {
    @ApiProperty({example: 168.3})
    currentPrice: number
    @ApiProperty({example: '2024-03-5 22:0'})
    lastUpdated: string
    @ApiProperty({example: 234.2})
    movingAverage: number
}