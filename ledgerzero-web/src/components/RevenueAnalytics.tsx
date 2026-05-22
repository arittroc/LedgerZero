"use client";

import { useMemo } from "react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { TrendingUp, DollarSign, Clock, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/utils/format";

interface AnalyticsProps {
  invoices: any[];
}

export function RevenueAnalytics({ invoices }: AnalyticsProps) {
  const stats = useMemo(() => {
    const total = invoices.reduce((sum, inv) => sum + Number(inv.total_amount || inv.amount || 0), 0);
    const paid = invoices.filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + Number(inv.total_amount || inv.amount || 0), 0);
    const pending = total - paid;
    
    // Group by month for the area chart
    const monthlyData: { [key: string]: number } = {};
    invoices.forEach(inv => {
      const date = new Date(inv.created_at);
      const month = date.toLocaleString('default', { month: 'short' });
      monthlyData[month] = (monthlyData[month] || 0) + Number(inv.total_amount || inv.amount || 0);
    });

    const chartData = Object.entries(monthlyData).map(([name, value]) => ({ name, value }));
    const pieData = [
      { name: "Paid", value: paid, color: "var(--success)" },
      { name: "Pending", value: pending, color: "var(--accent)" }
    ];

    return { total, paid, pending, chartData, pieData };
  }, [invoices]);

  if (invoices.length === 0) return null;

  return (
    <section className="relative mx-auto mt-12 w-full max-w-[1240px] animate-in fade-in slide-in-from-top-4 duration-1000">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* KPI Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.02] p-8 backdrop-blur-xl group hover:bg-white/[0.04] transition-all duration-500">
            <div className="absolute -top-12 -right-12 size-32 bg-accent/10 blur-[40px] rounded-full" />
            <DollarSign className="size-6 text-accent mb-4" />
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Revenue</p>
            <h3 className="text-3xl font-black text-white tracking-tighter">{formatCurrency(stats.total)}</h3>
          </div>

          <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.02] p-8 backdrop-blur-xl group hover:bg-white/[0.04] transition-all duration-500">
            <div className="absolute -top-12 -right-12 size-32 bg-success/10 blur-[40px] rounded-full" />
            <CheckCircle2 className="size-6 text-success mb-4" />
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Collected</p>
            <h3 className="text-3xl font-black text-white tracking-tighter">{formatCurrency(stats.paid)}</h3>
          </div>

          <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.02] p-8 backdrop-blur-xl group hover:bg-white/[0.04] transition-all duration-500">
            <div className="absolute -top-12 -right-12 size-32 bg-amber-500/10 blur-[40px] rounded-full" />
            <Clock className="size-6 text-amber-500 mb-4" />
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Outstanding</p>
            <h3 className="text-3xl font-black text-white tracking-tighter">{formatCurrency(stats.pending)}</h3>
          </div>

          {/* Area Chart */}
          <div className="md:col-span-3 relative h-[300px] rounded-[40px] border border-white/10 bg-white/[0.01] p-8 backdrop-blur-md">
            <div className="flex items-center justify-between mb-8">
               <h4 className="text-sm font-bold text-white flex items-center gap-2">
                 <TrendingUp className="size-4 text-accent" /> Revenue Velocity
               </h4>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#666', fontSize: 10, fontWeight: 'bold' }} 
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(10,10,10,0.9)', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '16px',
                    backdropFilter: 'blur(10px)'
                  }}
                  itemStyle={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="var(--accent)" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="relative rounded-[40px] border border-white/10 bg-white/[0.02] p-10 backdrop-blur-2xl flex flex-col items-center justify-center">
          <h4 className="text-sm font-bold text-white mb-6 uppercase tracking-widest">Collection Ratio</h4>
          <div className="relative size-full">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={stats.pieData}
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                  animationDuration={1500}
                >
                  {stats.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black text-white tracking-tighter">
                {Math.round((stats.paid / stats.total) * 100) || 0}%
              </span>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Paid</span>
            </div>
          </div>
          
          <div className="mt-8 grid grid-cols-2 gap-8 w-full">
             <div className="flex flex-col items-center">
                <div className="size-2 bg-success rounded-full mb-2" />
                <span className="text-xs font-bold text-white">{formatCurrency(stats.paid)}</span>
                <span className="text-[10px] text-gray-500 font-bold">Paid</span>
             </div>
             <div className="flex flex-col items-center">
                <div className="size-2 bg-accent rounded-full mb-2" />
                <span className="text-xs font-bold text-white">{formatCurrency(stats.pending)}</span>
                <span className="text-[10px] text-gray-500 font-bold">Pending</span>
             </div>
          </div>
        </div>

      </div>
    </section>
  );
}
