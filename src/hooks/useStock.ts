import { create } from 'zustand';
import { StockIndex, StockInfo, MarketNews, GoldPrice } from '../types/stock';

const JUHE_API_KEY = '68465a756f087dd03198ed764d44641e';

interface StockStore {
  indices: StockIndex[];
  hotStocks: StockInfo[];
  news: MarketNews[];
  goldPrice: GoldPrice;
  isLoading: boolean;
  lastUpdate: string;
  fetchMarketData: () => Promise<void>;
  fetchGoldPrice: () => Promise<void>;
}

const mockIndices: StockIndex[] = [
  { name: '上证指数', code: 'sh000001', price: 3100.00, change: 15.23, changePercent: 0.49 },
  { name: '深证成指', code: 'sz399001', price: 10200.00, change: -28.56, changePercent: -0.28 },
  { name: '沪深300', code: 'sh000300', price: 3850.00, change: 8.92, changePercent: 0.23 },
  { name: '创业板指', code: 'sz399006', price: 2100.00, change: -12.34, changePercent: -0.58 },
];

const mockHotStocks: StockInfo[] = [
  { name: '贵州茅台', code: '600519', price: 1680.00, change: 8.50, changePercent: 0.51, volume: '12.5万' },
  { name: '宁德时代', code: '300750', price: 218.00, change: -3.20, changePercent: -1.45, volume: '89.2万' },
  { name: '比亚迪', code: '002594', price: 285.00, change: 5.80, changePercent: 2.07, volume: '56.8万' },
  { name: '东方财富', code: '300059', price: 18.50, change: 0.45, changePercent: 2.49, volume: '125.6万' },
  { name: '招商银行', code: '600036', price: 35.20, change: -0.35, changePercent: -0.99, volume: '34.2万' },
  { name: '美的集团', code: '000333', price: 58.90, change: 1.20, changePercent: 2.08, volume: '22.1万' },
  { name: '五粮液', code: '000858', price: 148.50, change: -2.10, changePercent: -1.39, volume: '18.3万' },
  { name: '紫金矿业', code: '601899', price: 12.80, change: 0.35, changePercent: 2.79, volume: '98.5万' },
];

const mockNews: MarketNews[] = [
  { id: '1', title: '央行宣布下调存款准备金率0.25个百分点', source: '财经头条', time: '刚刚', url: 'https://finance.sina.com.cn/stock/' },
  { id: '2', title: '新能源板块集体走强，多股涨停', source: '证券时报', time: '10分钟前', url: 'https://finance.sina.com.cn/stock/' },
  { id: '3', title: 'A股三大指数高开低走，市场情绪谨慎', source: '上海证券报', time: '25分钟前', url: 'https://finance.sina.com.cn/stock/' },
  { id: '4', title: '科技股迎来政策利好，半导体板块发力', source: '中国证券网', time: '35分钟前', url: 'https://finance.sina.com.cn/stock/' },
  { id: '5', title: '北向资金净流入超50亿，外资持续加仓', source: '每日经济新闻', time: '45分钟前', url: 'https://finance.sina.com.cn/stock/' },
  { id: '6', title: '医药板块异动，创新药概念领涨', source: '第一财经', time: '1小时前', url: 'https://finance.sina.com.cn/stock/' },
  { id: '7', title: '房地产政策暖风频吹，板块强势反弹', source: '界面新闻', time: '1小时前', url: 'https://finance.sina.com.cn/stock/' },
];

const mockGoldPrice: GoldPrice = {
  name: '黄金(Au99.99)',
  price: 428.50,
  change: 2.58,
  changePercent: 0.61,
  unit: '元/克',
};

export const useStockStore = create<StockStore>((set, get) => ({
  indices: mockIndices,
  hotStocks: mockHotStocks,
  news: mockNews,
  goldPrice: mockGoldPrice,
  isLoading: false,
  lastUpdate: new Date().toLocaleTimeString('zh-CN'),

  fetchMarketData: async () => {
    set({ isLoading: true });
    try {
      await get().fetchGoldPrice();
      set({ lastUpdate: new Date().toLocaleTimeString('zh-CN') });
    } catch (error) {
      console.error('Failed to fetch market data:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchGoldPrice: async () => {
    try {
      const response = await fetch(
        `https://web.juhe.cn:8080/finance/gold/shgold?key=${JUHE_API_KEY}&v=1`
      );
      const data = await response.json();

      if (data.resultcode === '200' && data.result && data.result.length > 0) {
        const goldItem = data.result.find((item: any) =>
          item.variety && item.variety.includes('Au99.99')
        ) || data.result[0];

        if (goldItem) {
          const price = parseFloat(goldItem.latestpri) || 0;
          const yesPrice = parseFloat(goldItem.yespri) || 0;
          const change = parseFloat((price - yesPrice).toFixed(2));
          const changePercent = yesPrice > 0 ? parseFloat(((change / yesPrice) * 100).toFixed(2)) : 0;

          set({
            goldPrice: {
              name: goldItem.variety || '黄金',
              price,
              change,
              changePercent,
              unit: '元/克',
            },
          });
        }
      } else {
        console.warn('Gold price API error:', data.reason || data.resultcode);
      }
    } catch (error) {
      console.error('Failed to fetch gold price:', error);
    }
  },
}));