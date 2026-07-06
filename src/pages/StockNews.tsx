import { useEffect, useState, useRef } from 'react';
import { RefreshCw, TrendingUp, TrendingDown, Newspaper, Clock, ChevronRight, Sparkles } from 'lucide-react';
import { useStockStore } from '../hooks/useStock';

export function StockNews() {
  const { indices, hotStocks, news, goldPrice, isLoading, lastUpdate, fetchMarketData } = useStockStore();
  const [activeTab, setActiveTab] = useState<'market' | 'news'>('market');
  const autoRefreshRef = useRef<number | null>(null);

  useEffect(() => {
    fetchMarketData();
    autoRefreshRef.current = window.setInterval(() => {
      fetchMarketData();
    }, 60 * 60 * 1000);

    return () => {
      if (autoRefreshRef.current) {
        clearInterval(autoRefreshRef.current);
      }
    };
  }, [fetchMarketData]);

  const formatPrice = (price: number) => {
    return price.toFixed(2);
  };

  const isMarketOpen = () => {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const day = now.getDay();
    
    if (day === 0 || day === 6) return false;
    
    return (hour === 9 && minute >= 30) || 
           (hour > 9 && hour < 11) ||
           (hour === 11 && minute <= 30) ||
           (hour === 13 && minute >= 0) ||
           (hour > 13 && hour < 15) ||
           (hour === 14 && minute <= 59);
  };

  const marketStatus = isMarketOpen() ? '交易中' : '休市';
  const marketStatusColor = isMarketOpen() ? 'text-green-500' : 'text-gray-400';

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24">
      <header className="bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] text-white px-4 py-5 rounded-b-3xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-semibold">市场资讯</h1>
            <p className="text-xs text-blue-200 mt-0.5">实时掌握股票市场动态</p>
          </div>
          <button
            onClick={fetchMarketData}
            disabled={isLoading}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className={`px-2 py-1 rounded-full bg-white/10 ${marketStatusColor}`}>
            {marketStatus}
          </span>
          <span className="text-blue-200">
            数据更新于 {lastUpdate || '--:--'}
          </span>
        </div>
      </header>

      <div className="px-4 -mt-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('market')}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'market'
                  ? 'bg-[#1E3A5F] text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              市场行情
            </button>
            <button
              onClick={() => setActiveTab('news')}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'news'
                  ? 'bg-[#1E3A5F] text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              财经资讯
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'market' ? (
        <div className="px-4 mt-4 space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h2 className="text-sm font-semibold text-[#2C3E50] mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              大盘指数
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {indices.map((index) => (
                <div
                  key={index.code}
                  className="bg-gradient-to-br rounded-xl p-3"
                  style={{
                    background: index.change >= 0
                      ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05))'
                      : 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05))',
                  }}
                >
                  <p className="text-xs text-gray-500 mb-1">{index.name}</p>
                  <p className="text-xl font-bold text-[#2C3E50]">{formatPrice(index.price)}</p>
                  <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${
                    index.change >= 0 ? 'text-red-500' : 'text-green-500'
                  }`}>
                    {index.change >= 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    <span>{index.change >= 0 ? '+' : ''}{formatPrice(index.change)}</span>
                    <span>({index.change >= 0 ? '+' : ''}{index.changePercent.toFixed(2)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h2 className="text-sm font-semibold text-[#2C3E50] mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              黄金价格
            </h2>
            <div
              className="bg-gradient-to-br rounded-xl p-4"
              style={{
                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(212, 175, 55, 0.05))',
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{goldPrice.name}</p>
                  <p className="text-2xl font-bold text-[#2C3E50]">
                    {formatPrice(goldPrice.price)}
                    <span className="text-xs text-gray-400 font-normal ml-1">{goldPrice.unit}</span>
                  </p>
                </div>
                <div className={`flex flex-col items-end ${
                  goldPrice.change >= 0 ? 'text-red-500' : 'text-green-500'
                }`}>
                  {goldPrice.change >= 0 ? (
                    <TrendingUp className="w-5 h-5" />
                  ) : (
                    <TrendingDown className="w-5 h-5" />
                  )}
                  <p className="text-sm font-bold">
                    {goldPrice.change >= 0 ? '+' : ''}{formatPrice(goldPrice.change)}
                  </p>
                  <p className="text-xs">
                    ({goldPrice.change >= 0 ? '+' : ''}{goldPrice.changePercent.toFixed(2)}%)
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h2 className="text-sm font-semibold text-[#2C3E50] mb-3 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-[#4A90D9]" />
              热门股票
            </h2>
            <div className="space-y-3">
              {hotStocks.map((stock) => (
                <div
                  key={stock.code}
                  className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#2C3E50] truncate">{stock.name}</span>
                      <span className="text-xs text-gray-400">{stock.code}</span>
                    </div>
                    {stock.volume && (
                      <span className="text-xs text-gray-400">成交量: {stock.volume}</span>
                    )}
                  </div>
                  <div className="text-right ml-3">
                    <p className="text-sm font-semibold text-[#2C3E50]">{formatPrice(stock.price)}</p>
                    <div className={`flex items-center gap-1 text-xs font-medium ${
                      stock.change >= 0 ? 'text-red-500' : 'text-green-500'
                    }`}>
                      {stock.change >= 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      <span>{stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="px-4 mt-4 space-y-3">
          {news.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.url && item.url !== '#') {
                  window.open(item.url, '_blank', 'noopener,noreferrer');
                }
              }}
              className="w-full bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-[#4A90D9] transition-all relative text-left"
            >
              <h3 className="text-sm font-medium text-[#2C3E50] leading-relaxed mb-2">
                {item.title}
              </h3>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Newspaper className="w-3 h-3" />
                  {item.source}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {item.time}
                </span>
              </div>
              <ChevronRight className={`w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${
                item.url && item.url !== '#' ? 'text-[#4A90D9]' : 'text-gray-300'
              }`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}