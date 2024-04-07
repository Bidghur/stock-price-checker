import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class SymbolToUpper implements PipeTransform {
  transform(symbol: string, metadata: ArgumentMetadata) {
    return symbol.toUpperCase();
  }
}