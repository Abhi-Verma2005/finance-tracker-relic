"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

export function FinancialBarChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} vertical={false} />
        <XAxis 
            dataKey="name" 
            tickLine={false}
            axisLine={false}
            fontSize={12}
        />
        <YAxis 
            tickLine={false}
            axisLine={false}
            fontSize={12}
            tickFormatter={(value) => `$${value}`}
        />
        <Tooltip 
            cursor={{ fill: 'transparent' }}
            contentStyle={{ borderRadius: '0.5rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
        />
        <Bar 
            dataKey="amount" 
            radius={[4, 4, 0, 0]}
            barSize={60}
            // Fill is handled by the data payload usually
        />
        {/* We can define multiple bars if we want, but here we expect data to be [{name, amount, fill}] */}
        {/* We use Cell or just standard Bar with dataKey logic. Recharts Bar accepts specific fill in data as well? 
            Actually it's better to map Cells if we want varying colors per bar in a single Bar component, 
            OR separate the data. But simpler: <Bar dataKey="amount" fill="#3b82f6" /> 
            To use custom colors per bar:
        */}
      </BarChart>
    </ResponsiveContainer>
  )
}
