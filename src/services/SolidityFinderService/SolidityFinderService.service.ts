import Binance, {Bid, DailyStatsResult, OrderBook} from "binance-api-node";
import {LimitType, SolidityModel, SolidityTicket} from "../../models/SolidityFinderModels.model";
import {
  BinanceSymbolFetchingService
} from "../BinanceSymbolFetchingService/BinanceSymbolFetching.service";
import {CandleAnalyzeService} from "../CandleAnalyzeService/CandleAnalyzeService.service";
import {BinanceOrdersCalculatingKit} from "../BinanceOrdersCalculationKit/BinanceOrdersCalculationKit.service";

export class SolidityFinderService {
  private client;
  binanceOrdersCalculatingKit: BinanceOrdersCalculatingKit;

  constructor() {
    this.client = Binance();
    this.binanceOrdersCalculatingKit = new BinanceOrdersCalculatingKit();
  }

  FindSolidity = async (ticket: DailyStatsResult): Promise<SolidityModel | null> => {
    try {
      let orderBook: OrderBook = await this.client.book({ symbol: ticket.symbol });;

      const calculateMaxValue = (orders: Bid[]) => {
        return orders.reduce((acc, order) => {
          const volume = parseFloat(order.quantity);
          acc.sum += volume;
          if (acc.max < volume) {
            acc.max = volume;
            acc.maxPrice = parseFloat(order.price);
          }
          return acc;
        }, { sum: 0, max: 0, maxPrice: 0 });
      };

      const bindNAsks = [ ...orderBook.asks, ...orderBook.bids ];

      const { sum: sumOrders, max: maxOrder, maxPrice: maxOrderPrice } = calculateMaxValue(bindNAsks);

      const upToPrice = parseFloat(ticket.lastPrice) / maxOrderPrice;

      const solidityRatio = maxOrder / (sumOrders / 100);

      let solidityType: LimitType = 'bids';

      if (orderBook.asks.findIndex(bid => parseFloat(bid.price) === maxOrderPrice) !== -1) {
        solidityType = 'asks';
      }

      const solidityTicket: SolidityTicket = {
        Type: solidityType,
        Price: maxOrderPrice,
        Quantity: maxOrder,
        MaxQuantity: maxOrder,
        Ratio: solidityRatio,
        UpToPrice: this.binanceOrdersCalculatingKit.CalcSimplifiedRatio(upToPrice, solidityType) * 100
      };

      return {
        Symbol: ticket.symbol,
        Price: parseFloat(ticket.lastPrice),
        QuoteVolume: parseFloat(ticket.quoteVolume),
        Solidity: solidityTicket
      }
    } catch (e) {
      return null;
    }
  };

  FindAllSolidity = async (minVolume: number, ratioAccess: number, upToPriceAccess: number, checkReachingPriceDuration: number):  Promise<SolidityModel[]> => {
    let symbolsWithSolidity: SolidityModel[] = [];

    const BSFS = new BinanceSymbolFetchingService();
    const CAS = new CandleAnalyzeService();

    try {
      const symbols = await BSFS.FetchAllSymbols(minVolume);
      const symbolsGroupLength = 30;

      for (let i = 0; i < symbols.length; i += symbolsGroupLength) {
        const symbolsGroup =
          symbols.length - i > symbolsGroupLength ? symbols.slice(i, i + symbolsGroupLength) : symbols.slice(i, symbols.length);

        await Promise.all(
          symbolsGroup.map(async (symbolTicket) => {
            const solidityInfo = await this.FindSolidity(symbolTicket);
            if (solidityInfo !== null) {
              if (
                solidityInfo.Solidity.Ratio > ratioAccess &&
                (
                  upToPriceAccess === 0 ||
                  this.binanceOrdersCalculatingKit.CalcSimplifiedRatio(solidityInfo.Solidity.UpToPrice, solidityInfo.Solidity.Type) < upToPriceAccess / 100
                )
              ) {
                symbolsWithSolidity.push(solidityInfo);
              }
            }
          })
        );
      }

      if (checkReachingPriceDuration !== 0) {
        let filteredSymbolsWithSolidity: SolidityModel[] = [];

        await Promise.all(
          symbolsWithSolidity.map(async (symbolWithSolidity) => {
            const result = !(await CAS.CheckPriceTouchingOnPeriod(symbolWithSolidity.Symbol, symbolWithSolidity.Solidity.Price, checkReachingPriceDuration));
            if (result) {
              filteredSymbolsWithSolidity.push(symbolWithSolidity);
            }
          })
        );

        symbolsWithSolidity = filteredSymbolsWithSolidity;
      }

    } catch (e) {
      throw e;
    }
    return symbolsWithSolidity;
  };
}
