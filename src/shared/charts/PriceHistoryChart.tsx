'use client';

import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface PricePoint {
  date: Date;
  price: number;
}

interface Props {
  data: PricePoint[];
}

export default function PriceHistoryChart({ data }: Props) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <h2 className="text-lg font-semibold mb-4">График изменения цены (₸)</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={[...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={(value) =>
              new Date(value).toLocaleString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })
            }
          />
          <YAxis
            width={80}
            tickFormatter={(v) => `${v.toLocaleString()} ₸`}
            tick={{ fontSize: 11 }}
          />{' '}
          <Tooltip
            formatter={(value: number) => `${value.toLocaleString()} ₸`}
            labelFormatter={(label: Date) =>
              `Дата: ${label.toLocaleString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}`
            }
          />
          <Line type="monotone" dataKey="price" stroke="#3A55DF" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
