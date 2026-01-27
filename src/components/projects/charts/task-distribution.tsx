"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts"

const COLORS = ['#22c55e', '#3b82f6', '#94a3b8', '#f59e0b']; // Green, Blue, Slate, Amber

export function TaskDistributionChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill || COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
            contentStyle={{ borderRadius: '0.5rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
        />
        <Legend verticalAlign="bottom" height={36}/>
      </PieChart>
    </ResponsiveContainer>
  )
}
