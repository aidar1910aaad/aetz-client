'use client';

import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  Dot,
} from 'recharts';

interface PricePoint {
  date: Date;
  price: number;
}

interface Props {
  data: PricePoint[];
}

export default function PriceHistoryChart({ data }: Props) {
  const sortedData = [...data]
    .map((point) => ({
      ...point,
      date: point.date instanceof Date ? point.date.getTime() : new Date(point.date).getTime(),
    }))
    .sort((a, b) => a.date - b.date);
  
  // Находим минимальное и максимальное значения для градиента
  const minPrice = Math.min(...sortedData.map(d => d.price));
  const maxPrice = Math.max(...sortedData.map(d => d.price));
  const priceRange = maxPrice - minPrice;
  
  return (
    <div className="bg-gradient-to-br from-white to-[#8eba1e]/5 p-6 rounded-2xl shadow-xl mb-6 border border-[#8eba1e]/20">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-[#8eba1e] rounded-xl flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#8eba1e]">График изменения цены</h2>
          <p className="text-sm text-gray-600">История изменения стоимости материала</p>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={350}>
        <AreaChart
          data={sortedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8eba1e" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#8eba1e" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#e5e7eb" 
            strokeOpacity={0.6}
          />
          
          <XAxis
            dataKey="date"
            tickFormatter={(value: number) =>
              new Date(value).toLocaleString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })
            }
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={{ stroke: '#d1d5db' }}
            tickLine={{ stroke: '#d1d5db' }}
          />
          
          <YAxis
            width={100}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k ₸`}
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={{ stroke: '#d1d5db' }}
            tickLine={{ stroke: '#d1d5db' }}
          />
          
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #8eba1e',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              padding: '12px 16px',
            }}
            formatter={(value: number) => [
              `${value.toLocaleString('ru-RU')} ₸`,
              'Цена'
            ]}
            labelFormatter={(label: number) =>
              `📅 ${new Date(label).toLocaleString('ru-RU', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}`
            }
            labelStyle={{ 
              color: '#374151', 
              fontWeight: '600',
              marginBottom: '8px'
            }}
          />
          
          <Area
            type="monotone"
            dataKey="price"
            stroke="#8eba1e"
            strokeWidth={3}
            fill="url(#priceGradient)"
            connectNulls
            dot={{
              fill: '#8eba1e',
              stroke: '#ffffff',
              strokeWidth: 3,
              r: 6,
            }}
            activeDot={{
              r: 8,
              stroke: '#8eba1e',
              strokeWidth: 3,
              fill: '#ffffff',
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
      
      {/* Статистика */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-[#8eba1e]/10 rounded-xl border border-[#8eba1e]/20">
          <div className="text-sm text-gray-600 mb-1">Минимальная цена</div>
          <div className="text-lg font-bold text-[#8eba1e]">
            {minPrice.toLocaleString('ru-RU')} ₸
          </div>
        </div>
        <div className="text-center p-3 bg-[#8eba1e]/10 rounded-xl border border-[#8eba1e]/20">
          <div className="text-sm text-gray-600 mb-1">Максимальная цена</div>
          <div className="text-lg font-bold text-[#8eba1e]">
            {maxPrice.toLocaleString('ru-RU')} ₸
          </div>
        </div>
        <div className="text-center p-3 bg-[#8eba1e]/10 rounded-xl border border-[#8eba1e]/20">
          <div className="text-sm text-gray-600 mb-1">Разброс цен</div>
          <div className="text-lg font-bold text-[#8eba1e]">
            {priceRange.toLocaleString('ru-RU')} ₸
          </div>
        </div>
      </div>
    </div>
  );
}
