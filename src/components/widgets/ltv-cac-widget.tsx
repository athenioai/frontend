'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface LtvCacEntry {
  name: string;
  ltv: number;
}

interface LtvCacWidgetProps {
  data: LtvCacEntry[];
  ltvCacRatio: number;
}

export function LtvCacWidget({ data, ltvCacRatio }: LtvCacWidgetProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">LTV / CAC</CardTitle>
        <p className="text-2xl font-bold">{ltvCacRatio.toFixed(1)}x</p>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, 'LTV']}
                contentStyle={{ background: '#1a1a2e', border: 'none', borderRadius: '8px' }}
                labelStyle={{ color: '#a0aec0' }}
              />
              <Bar dataKey="ltv" fill="#4FD1C5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
