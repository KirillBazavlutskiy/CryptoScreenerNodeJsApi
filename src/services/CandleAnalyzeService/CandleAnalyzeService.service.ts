import Binance, {CandleChartInterval} from "binance-api-node";

export class CandleAnalyzeService {
  private client;

  constructor() {
    this.client = Binance();
  }

  GetNonConcernPeriod = async (symbol: string, targetPrice: number) => {
    try {
      const candles = await this.client.candles({
        symbol,
        interval: CandleChartInterval.FIFTEEN_MINUTES,
        limit: 1000,
      });

      let nonConcernPeriod: number = 0;
      let candleTouches: number = 0;

      try {
        candles.reverse().forEach(candle => {
          const result = targetPrice < Number(candle.low) || Number(candle.high) < targetPrice;
          if (result) {
            nonConcernPeriod++;
            if (Number(candle.low) === targetPrice || Number(candle.high) === targetPrice) {
              candleTouches++;
            }
          } else {
            throw new Error("Non-concern period has been ended!")
          }
        });
      } catch (e) {}

      return {
        nonConcernPeriod,
        candleTouches
      };
    } catch (e) {
      throw e;
    }
  }

  CheckForAcceptablePriceChange = async (symbol: string, durationMinutes: number, acceptablePriceChange: number) => {
    const priceChange = await this.GetPriceChange(symbol, durationMinutes);
    return ({ access: Math.abs(priceChange)  <= acceptablePriceChange, priceChange: priceChange });
  }

  GetPriceChange = async (symbol: string, durationMinutes: number): Promise<number> =>  {
    const candles = await this.client.candles({
      symbol,
      interval: CandleChartInterval.ONE_MINUTE,
      limit: durationMinutes
    });

    const lastCandles = candles.slice(-durationMinutes);

    const firstCandle = lastCandles[0];
    const lastCandle = lastCandles[lastCandles.length - 1];

    return ((parseFloat(lastCandle.close) - parseFloat(firstCandle.open)) / parseFloat(firstCandle.open)) * 100;
  }

  GetVolumeOnPeriod = async (symbol: string, durationMinutes: number) => {
    try {
      const candles = await this.client.candles({
        symbol,
        interval: CandleChartInterval.ONE_MINUTE,
        limit: durationMinutes,
      });

      return candles.reduce(
        (sumVolume, candle) => sumVolume + parseFloat(candle.volume),
        0
      )
    } catch (e) {
      throw e;
    }
  }
}
