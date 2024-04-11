import { LimitType } from "../../models/SolidityFinderModels.model";

export class BinanceOrdersCalculatingKit {
  CalcSimplifiedRatio = (UpToPrice: number, LimitType: LimitType, fractionDigits: number = 0): number => {
    let ratio;
    if (LimitType === 'asks') {
      ratio = 1 - UpToPrice;
    } else {
      ratio = UpToPrice - 1;
    }

    if (fractionDigits !== 0) ratio = this.RoundUp(ratio, fractionDigits);
    return ratio;
  }

  CalcRealRatio = (UpToPrice: number, LimitType: LimitType): number => {
    if (LimitType === 'asks') {
      return 1 - UpToPrice;
    } else {
      return UpToPrice + 1;
    }
  }

  RoundUp = (num: number, fractionDigits: number) => {
    const floatMultiplier = 10 ** fractionDigits;
    return Math.round(num * floatMultiplier) / floatMultiplier;
  }

  GetFractionDigitsLength = (number: number) => {
    const numIndex = number.toFixed(15).lastIndexOf("1");
    return numIndex === 0 ? 0 : numIndex - 1;
  }

  FindClosestLimitOrder = (price: number, tickSize: number): number => {
    const floatLength = this.GetFractionDigitsLength(tickSize);
    return this.RoundUp(price, floatLength);
  }
}
