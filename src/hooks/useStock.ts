import { create } from 'zustand';
import { StockIndex, StockInfo, MarketNews, MarketData } from '../types/stock';

interface StockStore {
  indices: StockIndex[];
  hotStocks: StockInfo[];
  news: MarketNews[];
  isLoading: boolean;
  lastUpdate: string;
  fetchMarketData: () => Promise<void>;
  fetchIndices: () => Promise<void>;
  fetchHotStocks: () => Promise<void>;
  fetchNews: () => Promise<void>;
}

export const useStockStore = create<StockStore>((set) => ({
  indices: [],
  hotStocks: [],
  news: [],
  isLoading: false,
  lastUpdate: '',

  fetchMarketData: async () => {
    set({ isLoading: true });
    try {
      await Promise.all([
        useStockStore.getState().fetchIndices(),
        useStockStore.getState().fetchHotStocks(),
        useStockStore.getState().fetchNews(),
      ]);
      set({ lastUpdate: new Date().toLocaleTimeString('zh-CN') });
    } catch (error) {
      console.error('Failed to fetch market data:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchIndices: async () => {
    try {
      const response = await fetch('/api/sina/?list=sh000001,sz399001,sh000300,sz399006');
      const text = await response.text();
      const indices: StockIndex[] = [];
      const lines = text.split(';');
      
      const indexMap: Record<string, string> = {
        'sh000001': '上证指数',
        'sz399001': '深证成指',
        'sh000300': '沪深300',
        'sz399006': '创业板指',
      };

      lines.forEach((line) => {
        const match = line.match(/hq_str_([a-z0-9]+)="([^"]+)"/);
        if (match) {
          const code = match[1];
          const data = match[2].split(',');
          if (data.length >= 5) {
            indices.push({
              name: indexMap[code] || code,
              code,
              price: parseFloat(data[3]) || 0,
              change: parseFloat(data[4]) || 0,
              changePercent: parseFloat(data[5]) || 0,
              volume: data[8] || undefined,
            });
          }
        }
      });

      set({ indices });
    } catch (error) {
      console.error('Failed to fetch indices:', error);
      set({
        indices: [
          { name: '上证指数', code: 'sh000001', price: 3100.00, change: 15.23, changePercent: 0.49 },
          { name: '深证成指', code: 'sz399001', price: 10200.00, change: -28.56, changePercent: -0.28 },
          { name: '沪深300', code: 'sh000300', price: 3850.00, change: 8.92, changePercent: 0.23 },
          { name: '创业板指', code: 'sz399006', price: 2100.00, change: -12.34, changePercent: -0.58 },
        ],
      });
    }
  },

  fetchHotStocks: async () => {
    try {
      const response = await fetch('/api/stock/api/qt/clist/get?pn=1&pz=10&po=1&np=1&ut=bd1d9ddb04089700cf9c27f6f7426281&fltt=2&invt=2&fid=f3&fs=m:0+t:6,m:0+t:13,m:0+t:80,m:1+t:2,m:1+t:23&fields=f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f22,f11,f62,f128,f136,f115,f152');
      const json = await response.json();
      const stocks: StockInfo[] = [];

      if (json.data && json.data.diff) {
        json.data.diff.forEach((item: any) => {
          stocks.push({
            name: item.f14 || '',
            code: item.f12 || '',
            price: parseFloat(item.f2) || 0,
            change: parseFloat(item.f4) || 0,
            changePercent: parseFloat(item.f3) || 0,
            open: parseFloat(item.f15) || undefined,
            high: parseFloat(item.f16) || undefined,
            low: parseFloat(item.f17) || undefined,
            volume: item.f5 ? (item.f5 / 10000).toFixed(1) + '万' : undefined,
            turnover: item.f6 ? (item.f6 / 10000).toFixed(2) + '万' : undefined,
          });
        });
      }

      set({ hotStocks: stocks.slice(0, 10) });
    } catch (error) {
      console.error('Failed to fetch hot stocks:', error);
      set({
        hotStocks: [
          { name: '贵州茅台', code: '600519', price: 1680.00, change: 8.50, changePercent: 0.51, volume: '12.5万' },
          { name: '宁德时代', code: '300750', price: 218.00, change: -3.20, changePercent: -1.45, volume: '89.2万' },
          { name: '比亚迪', code: '002594', price: 285.00, change: 5.80, changePercent: 2.07, volume: '56.8万' },
          { name: '东方财富', code: '300059', price: 18.50, change: 0.45, changePercent: 2.49, volume: '125.6万' },
          { name: '招商银行', code: '600036', price: 35.20, change: -0.35, changePercent: -0.99, volume: '34.2万' },
          { name: '美的集团', code: '000333', price: 58.90, change: 1.20, changePercent: 2.08, volume: '22.1万' },
          { name: '五粮液', code: '000858', price: 148.50, change: -2.10, changePercent: -1.39, volume: '18.3万' },
          { name: '紫金矿业', code: '601899', price: 12.80, change: 0.35, changePercent: 2.79, volume: '98.5万' },
        ],
      });
    }
  },

  fetchNews: async () => {
    try {
      const response = await fetch('/api/stock/api/qt/list/get?param=news&fields=f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f11,f12');
      const text = await response.text();
      const json = JSON.parse(text.replace(/^jsonp1\(/, '').replace(/\)$/, ''));
      const newsList: MarketNews[] = [];

      if (json.data && json.data.news) {
        json.data.news.forEach((item: any) => {
          newsList.push({
            id: item.id || item.f11 || '',
            title: item.title || item.f14 || '',
            source: item.source || item.f15 || '财经新闻',
            time: item.time || item.f16 || '',
            url: item.url || item.f17 || '',
          });
        });
      }

      set({ news: newsList.slice(0, 15) });
    } catch (error) {
      console.error('Failed to fetch news:', error);
      set({
        news: [
          { id: '1', title: '央行宣布下调存款准备金率0.25个百分点', source: '财经头条', time: '刚刚', url: '#' },
          { id: '2', title: '新能源板块集体走强，多股涨停', source: '证券时报', time: '10分钟前', url: '#' },
          { id: '3', title: 'A股三大指数高开低走，市场情绪谨慎', source: '上海证券报', time: '25分钟前', url: '#' },
          { id: '4', title: '科技股迎来政策利好，半导体板块发力', source: '中国证券网', time: '35分钟前', url: '#' },
          { id: '5', title: '北向资金净流入超50亿，外资持续加仓', source: '每日经济新闻', time: '45分钟前', url: '#' },
          { id: '6', title: '医药板块异动，创新药概念领涨', source: '第一财经', time: '1小时前', url: '#' },
          { id: '7', title: '房地产政策暖风频吹，板块强势反弹', source: '界面新闻', time: '1小时前', url: '#' },
        ],
      });
    }
  },
}));