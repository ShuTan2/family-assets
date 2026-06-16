# 家庭资产记账APP - 技术架构文档

## 1. 技术栈

| 层级 | 技术选型 |
|------|----------|
| 前端框架 | React 18 + TypeScript |
| 构建工具 | Vite |
| 样式方案 | TailwindCSS |
| 图表库 | Recharts |
| 路由管理 | React Router DOM v6 |
| 数据存储 | LocalStorage |
| 日期处理 | Day.js |

## 2. 项目架构

```
src/
├── components/          # 通用组件
│   ├── Card.tsx         # 卡片组件
│   ├── Chart*.tsx       # 图表组件
│   └── DepositItem.tsx  # 存款列表项
├── pages/               # 页面组件
│   ├── Home.tsx         # 首页/资产总览
│   ├── DepositList.tsx  # 存款列表
│   └── AddEditDeposit.tsx # 添加/编辑存款
├── hooks/               # 自定义Hooks
│   └── useDeposits.ts  # 存款数据管理
├── utils/               # 工具函数
│   ├── calculations.ts  # 收益计算
│   └── dateUtils.ts     # 日期处理
├── types/               # TypeScript类型定义
│   └── index.ts
├── App.tsx              # 应用入口
└── main.tsx             # React渲染入口
```

## 3. 路由设计

| 路径 | 页面 | 说明 |
|------|------|------|
| / | Home | 首页/资产总览 |
| /deposits | DepositList | 存款列表 |
| /add | AddEditDeposit | 添加存款 |
| /edit/:id | AddEditDeposit | 编辑存款 |

## 4. 数据模型

### 4.1 存款记录类型

```typescript
interface Deposit {
  id: string;                    // 唯一标识
  bankName: string;              // 银行名称
  type: 'fixed' | 'current';     // 定期/活期
  amount: number;                // 存款金额
  annualRate: number;            // 年化利率 (%)
  termMonths: number;            // 存期（月）
  startDate: string;             // 起存日期 (YYYY-MM-DD)
  expectedReturn: number;        // 预计到期收益
}
```

### 4.2 到期计算

- 到期日期 = 起存日期 + 存期月数
- 预计到期收益 = 金额 × (年化利率 / 12) × 存期月数

## 5. 核心计算逻辑

### 5.1 到期高亮判断

```typescript
function getExpireStatus(startDate: string, termMonths: number) {
  const endDate = addMonths(startDate, termMonths);
  const daysUntilExpire = differenceInDays(endDate, today());

  if (daysUntilExpire < 0) return 'expired';
  if (daysUntilExpire <= 30) return 'red';      // 30天内
  if (daysUntilExpire <= 90) return 'orange';   // 30-90天
  return 'normal';
}
```

### 5.2 收益计算

```typescript
function calculateReturn(amount: number, annualRate: number, termMonths: number) {
  return amount * (annualRate / 100 / 12) * termMonths;
}
```

## 6. 组件设计

### 6.1 Home（首页）
- 总资产概览卡片
- 活期/定期总额统计
- 即将到期笔数
- Recharts饼图：银行分布、类型分布
- Recharts柱状图：存期分布

### 6.2 DepositList（存款列表）
- 按到期日期排序（由近到远）
- 高亮显示即将到期项
- 滑动删除

### 6.3 AddEditDeposit（添加/编辑）
- 表单字段验证
- 自动计算到期收益
- 保存到LocalStorage

## 7. 数据持久化

- 使用LocalStorage存储存款数组
- Key: `family_assets_deposits`
- 格式: `JSON.stringify(Deposit[])`

---

## 8. 移动端适配

- 移动端优先设计
- 底部Tab导航
- 触摸友好的按钮尺寸（44px+）
- 响应式图表尺寸
