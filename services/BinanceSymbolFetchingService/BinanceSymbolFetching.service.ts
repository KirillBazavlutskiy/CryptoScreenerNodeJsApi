import Binance, {DailyStatsResult} from 'binance-api-node';

export class BinanceSymbolFetchingService {
  private client;

  constructor() {
    this.client = Binance({
      proxy: "http://193.253.220.32:80"
    });
  }

  FetchAllSymbols = async (minVolume: number): Promise<DailyStatsResult[]> => {
    try {
      const tickers = await this.client.dailyStats().catch(error => {
        throw new Error(`Failed to fetch daily stats: ${error.message}`);
      });

      const futuresSymbolsInfo = await this.client.futuresExchangeInfo().catch(error => {
        throw new Error(`Failed to fetch futures exchange info: ${error.message}`);
      });
      const futuresSymbols = futuresSymbolsInfo.symbols.map(symbolInfo => symbolInfo.symbol);
      const tickersFixed: DailyStatsResult[] = JSON.parse(JSON.stringify(tickers));

      return tickersFixed
        .filter(tradingPair => !(tradingPair.symbol.includes('BTC') || tradingPair.symbol.includes('ETH') || tradingPair.symbol.includes('USDC') || tradingPair.symbol.includes('FTT') || tradingPair.symbol.includes('RAY')))
        .filter(tradingPair => futuresSymbols.includes(tradingPair.symbol))
        .filter(tradingPair => {
          return tradingPair.symbol.substring(tradingPair.symbol.length - 4, tradingPair.symbol.length) === "USDT"
        })
        .filter(tradingPair => parseFloat(tradingPair.quoteVolume) > minVolume)
        .sort((a, b) => parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent));
    } catch (e) {
      throw e;
    }
  };
}
