import Binance, {CandleChartInterval} from "binance-api-node";

export class CandleAnalyzeService {
  private client;

  constructor() {
    this.client = Binance({
      proxy: "http://86.190.139.131:80"
    });
  }

  CheckPriceTouchingOnPeriod = async (symbol: string, targetPrice: number, durationMinutes: number) => {
    try {
      const candles = await this.client.candles({
        symbol,
        interval: CandleChartInterval.ONE_MINUTE,
        limit: durationMinutes,
      });

      let checkResult = false;

      candles.forEach(candle => {
        const result = parseFloat(candle.low) < targetPrice && targetPrice < parseFloat(candle.high);
        if (result) checkResult = true;
      });

      return checkResult;
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
