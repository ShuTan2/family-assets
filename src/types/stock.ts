export interface StockIndex {
  name: string;
  code: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: string;
}

export interface StockInfo {
  name: string;
  code: string;
  price: number;
  change: number;
  changePercent: number;
  open?: number;
  high?: number;
  low?: number;
  volume?: string;
  turnover?: string;
}

export interface MarketNews {
  id: string;
  title: string;
  source: string;
  time: string;
  url: string;
  summary?: string;
}

export interface MarketData {
  indices: StockIndex[];
  hotStocks: StockInfo[];
  news: MarketNews[];
  lastUpdate: string;
}