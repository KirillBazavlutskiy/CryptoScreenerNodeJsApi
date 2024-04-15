import {Request, Response} from "express";
import Binance, {CandleChartInterval_LT} from "binance-api-node";

export async function GetKlinesHandler(req: Request, res: Response) {
    const symbol = req.query.symbol as string;
    const interval = req.query.interval as CandleChartInterval_LT;
    const limit = parseInt(req.query.limit as string, 10);

    const client = Binance();
    const klines = await client.candles({
        symbol: symbol.toUpperCase(),
        interval: interval,
        limit: limit
    })

    res.send(klines);
}