'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { YearlyData } from '@/lib/types';

interface TrendChartProps {
  data: YearlyData[];
  schoolName: string;
  phase?: '2A' | '2B' | '2C';
}

export function TrendChart({ data, schoolName, phase = '2C' }: TrendChartProps) {
  const filtered = data.filter((d) => d.phase === phase);
  const chartData = [...filtered].reverse().map((d) => ({
    year: d.year.toString(),
    vacancies: d.vacancies,
    registered: d.registered,
    ballotRate: d.ballotRate || 0,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Historical Trends</CardTitle>
        <CardDescription>Registration data over the past 5 years</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis 
                dataKey="year" 
                tick={{ fontSize: 12 }} 
                className="text-muted-foreground"
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }} 
                className="text-muted-foreground"
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend
                wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }}
              />
              <Line
                type="monotone"
                dataKey="vacancies"
                name="Vacancies"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--chart-1))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="registered"
                name="Registered"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--chart-2))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

interface BallotChartProps {
  data: YearlyData[];
  phase?: '2A' | '2B' | '2C';
}

export function BallotChart({ data, phase = '2C' }: BallotChartProps) {
  const filtered = data.filter((d) => d.phase === phase);
  const chartData = [...filtered].reverse().map((d) => ({
    year: d.year.toString(),
    ballotRate: d.ballotRate || 100,
    balloted: d.balloted,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Ballot Success Rate</CardTitle>
        <CardDescription>Chance of securing a place through ballot</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
              <XAxis 
                dataKey="year" 
                tick={{ fontSize: 12 }} 
                className="text-muted-foreground"
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }} 
                className="text-muted-foreground"
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value: number, name: string) => [
                  `${value}%`,
                  'Ballot Rate',
                ]}
              />
              <Bar
                dataKey="ballotRate"
                name="Ballot Rate"
                fill="hsl(var(--chart-1))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
