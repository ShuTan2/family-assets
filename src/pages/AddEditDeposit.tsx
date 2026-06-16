import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, RotateCcw, Trash2 } from 'lucide-react';
import { useDepositStore } from '../hooks/useDeposits';
import { DepositType, DepositWithExtras } from '../types';
import { calculateReturn, getEndDate, enrichDeposit } from '../utils/calculations';
import dayjs from 'dayjs';

export function AddEditDeposit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { deposits, addDeposit, updateDeposit, deleteDeposit } = useDepositStore();

  const isEdit = Boolean(id);
  const [isExpired, setIsExpired] = useState(false);

  const [formData, setFormData] = useState({
    bankName: '',
    type: 'fixed' as DepositType,
    amount: '',
    annualRate: '',
    termMonths: '',
    startDate: dayjs().format('YYYY-MM-DD'),
  });

  const [expectedReturn, setExpectedReturn] = useState(0);
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (isEdit && id) {
      const deposit = deposits.find((d) => d.id === id);
      if (deposit) {
        setFormData({
          bankName: deposit.bankName,
          type: deposit.type,
          amount: deposit.amount.toString(),
          annualRate: deposit.annualRate.toString(),
          termMonths: deposit.termMonths.toString(),
          startDate: deposit.startDate,
        });

        // Check if this deposit is expired
        const enriched: DepositWithExtras = enrichDeposit(deposit);
        setIsExpired(enriched.expireStatus === 'expired');
      }
    }
  }, [isEdit, id, deposits]);

  useEffect(() => {
    const amount = parseFloat(formData.amount) || 0;
    const rate = parseFloat(formData.annualRate) || 0;
    const term = parseInt(formData.termMonths) || 0;

    if (formData.type === 'current') {
      setExpectedReturn(0);
      setEndDate('随时可取');
    } else if (amount > 0 && rate > 0 && term > 0) {
      setExpectedReturn(calculateReturn(amount, rate, term));
      setEndDate(getEndDate(formData.startDate, term));
    } else {
      setExpectedReturn(0);
      setEndDate('');
    }
  }, [formData.amount, formData.annualRate, formData.termMonths, formData.startDate, formData.type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const amount = parseFloat(formData.amount);
    const annualRate = parseFloat(formData.annualRate);
    const termMonths = parseInt(formData.termMonths);

    if (!formData.bankName || !amount || !annualRate) {
      alert('请填写所有必填项');
      return;
    }

    if (formData.type === 'fixed' && (!termMonths || termMonths <= 0)) {
      alert('请选择存期');
      return;
    }

    if (formData.type === 'current' && termMonths < 0) {
      alert('存期不能为负数');
      return;
    }

    const depositData = {
      bankName: formData.bankName,
      type: formData.type,
      amount,
      annualRate,
      termMonths,
      startDate: formData.startDate,
      expectedReturn,
    };

    if (isEdit && id) {
      updateDeposit(id, depositData);
    } else {
      addDeposit(depositData);
    }

    navigate('/deposits');
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRollOver = () => {
    // 转存：把起存日期改为今天，继续存同样的期限
    const today = dayjs().format('YYYY-MM-DD');
    const newTermMonths = parseInt(formData.termMonths) || 12;

    if (confirm(`确定要将这笔存款转存吗？\n新起存日期：${today}\n存期：${newTermMonths}个月\n银行：${formData.bankName}\n金额：${formData.amount}元`)) {
      const depositData = {
        bankName: formData.bankName,
        type: formData.type,
        amount: parseFloat(formData.amount),
        annualRate: parseFloat(formData.annualRate),
        termMonths: newTermMonths,
        startDate: today,
        expectedReturn: calculateReturn(parseFloat(formData.amount), parseFloat(formData.annualRate), newTermMonths),
      };

      if (isEdit && id) {
        deleteDeposit(id); // 删除旧的
      }
      addDeposit(depositData); // 添加新的
      navigate('/deposits');
    }
  };

  const handleWithdraw = () => {
    if (confirm('确定要将这笔存款标记为已取出吗？记录将被删除。')) {
      if (isEdit && id) {
        deleteDeposit(id);
      }
      navigate('/deposits');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20">
      <header className="bg-white px-4 py-4 border-b border-gray-100 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[#2C3E50]" />
        </button>
        <h1 className="text-lg font-semibold text-[#2C3E50]">
          {isEdit ? (isExpired ? '已到期存款' : '编辑存款') : '添加存款'}
        </h1>
      </header>

      {isExpired && (
        <div className="mx-4 mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm text-amber-800 font-medium mb-3">这笔存款已到期</p>
          <div className="flex gap-2">
            <button
              onClick={handleRollOver}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#1E3A5F] text-white rounded-xl font-medium text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              转存
            </button>
            <button
              onClick={handleWithdraw}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white border border-red-200 text-red-500 rounded-xl font-medium text-sm"
            >
              <Trash2 className="w-4 h-4" />
              已取出
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="px-4 py-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-[#2C3E50] mb-2">
            银行名称
          </label>
          <input
            type="text"
            value={formData.bankName}
            onChange={(e) => handleChange('bankName', e.target.value)}
            placeholder="例如：中国工商银行"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#4A90D9] focus:ring-2 focus:ring-[#4A90D9] focus:ring-opacity-20 outline-none transition-all text-[#2C3E50]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2C3E50] mb-2">
            存款类型
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleChange('type', 'fixed')}
              className={`py-3 rounded-xl font-medium text-sm transition-all ${
                formData.type === 'fixed'
                  ? 'bg-[#1E3A5F] text-white'
                  : 'bg-white border border-gray-200 text-[#2C3E50]'
              }`}
            >
              定期存款
            </button>
            <button
              type="button"
              onClick={() => handleChange('type', 'current')}
              className={`py-3 rounded-xl font-medium text-sm transition-all ${
                formData.type === 'current'
                  ? 'bg-[#1E3A5F] text-white'
                  : 'bg-white border border-gray-200 text-[#2C3E50]'
              }`}
            >
              活期存款
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2C3E50] mb-2">
            存款金额 (元)
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => handleChange('amount', e.target.value)}
            placeholder="请输入存款金额"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#4A90D9] focus:ring-2 focus:ring-[#4A90D9] focus:ring-opacity-20 outline-none transition-all text-[#2C3E50]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2C3E50] mb-2">
            年化利率 (%)
          </label>
          <input
            type="number"
            step="0.001"
            value={formData.annualRate}
            onChange={(e) => handleChange('annualRate', e.target.value)}
            placeholder="例如：2.10"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#4A90D9] focus:ring-2 focus:ring-[#4A90D9] focus:ring-opacity-20 outline-none transition-all text-[#2C3E50]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2C3E50] mb-2">
            存期 (月)
          </label>
          {formData.type === 'fixed' ? (
            <div className="grid grid-cols-4 gap-2">
              {[1, 3, 6, 12, 24, 36, 60].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleChange('termMonths', m.toString())}
                  className={`py-2.5 rounded-lg font-medium text-sm transition-all ${
                    formData.termMonths === m.toString()
                      ? 'bg-[#1E3A5F] text-white'
                      : 'bg-white border border-gray-200 text-[#2C3E50]'
                  }`}
                >
                  {m < 12 ? `${m}月` : `${m / 12}年`}
                </button>
              ))}
            </div>
          ) : (
            <input
              type="number"
              value={formData.termMonths}
              onChange={(e) => handleChange('termMonths', e.target.value)}
              placeholder="活期填0"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#4A90D9] focus:ring-2 focus:ring-[#4A90D9] focus:ring-opacity-20 outline-none transition-all text-[#2C3E50]"
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2C3E50] mb-2">
            起存日期
          </label>
          <div className="relative">
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#4A90D9] focus:ring-2 focus:ring-[#4A90D9] focus:ring-opacity-20 outline-none transition-all text-[#2C3E50]"
              required
            />
            <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {expectedReturn > 0 && (
          <div className="bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] rounded-xl p-4 text-white">
            <p className="text-sm opacity-90 mb-1">
              {formData.type === 'fixed' ? '预计到期收益' : '预计收益'}
            </p>
            <p className="text-2xl font-bold">
              ¥{expectedReturn.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            {endDate && (
              <p className="text-sm opacity-80 mt-1">到期日：{endDate}</p>
            )}
          </div>
        )}

        {!isExpired && (
          <div className="pt-4">
            <button
              type="submit"
              className="w-full py-4 bg-[#1E3A5F] text-white rounded-xl font-semibold text-base active:scale-[0.98] transition-transform"
            >
              {isEdit ? '保存修改' : '确认添加'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
