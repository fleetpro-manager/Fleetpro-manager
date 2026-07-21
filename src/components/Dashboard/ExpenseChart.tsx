import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { FleetSettings } from '../../types/fleet';
import { formatCurrency } from '../../utils/formatters';

interface ExpenseChartProps {
  settings: FleetSettings;
}

export const ExpenseChart: React.FC<ExpenseChartProps> = ({ settings }) => {
  const chartData = [
    { month: 'Feb', fuel: 2400, maintenance: 650, insurance: 400 },
    { month: 'Mar', fuel: 2800, maintenance: 820, insurance: 400 },
    { month: 'Apr', fuel: 3100, maintenance: 450, insurance: 400 },
    { month: 'May', fuel: 2950, maintenance: 1200, insurance: 400 },
    { month: 'Jun', fuel: 3400, maintenance: 880, insurance: 400 },
    { month: 'Jul', fuel: 3120, maintenance: 720, insurance: 400 },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Fleet Operational Costs</h3>
          <p className="text-xs text-slate-500">Monthly breakdown of fuel vs maintenance</p>
        </div>
        <div className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
          Past 6 Months
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
            <Tooltip
              formatter={(value: number) => [formatCurrency(value, settings.currency), 'Cost']}
              contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            <Bar dataKey="fuel" name="Fuel Expense" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="maintenance" name="Maintenance & Repair" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            <Bar dataKey="insurance" name="Insurance & Fixed" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
