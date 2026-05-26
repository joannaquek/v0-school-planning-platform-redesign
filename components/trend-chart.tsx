'use client';

import {
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  LabelList,
  Customized,
  ReferenceLine,
} from 'recharts';
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppStore } from '@/lib/store';
import { phases } from '@/lib/filter-options';
import type { YearlyData } from '@/lib/types';

function normalizePhase(phase: string): '2A' | '2B' | '2C' {
  if (phase === '2A' || phase === '2B' || phase === '2C') return phase;
  return '2C';
}

type FormattedBarItem = {
  item?: { props?: { dataKey?: string } };
  props?: {
    data?: Array<{ x: number; y: number; width: number; height: number }>;
  };
};

const RATIO_HIGHLIGHT_BG = '#DBEEEC';
const RATIO_HIGHLIGHT_TEXT = '#0F766E';
const RATIO_ALERT_BG = '#FEE2E2';
const RATIO_ALERT_TEXT = '#B91C1C';

/**
 * Ratio labels: horizontally in the gap between vacancy and registered bars for that year,
 * vertically above both bars (still aligned with each year along the x-axis).
 */
function TrendGapRatioLabels({
  formattedGraphicalItems,
  rows,
}: {
  formattedGraphicalItems?: FormattedBarItem[];
  rows: Array<{ year: string; ratioLabel: string }>;
}) {
  if (!formattedGraphicalItems?.length) return null;
  const vacItem = formattedGraphicalItems.find((gi) => gi.item?.props?.dataKey === 'vacancies');
  const regItem = formattedGraphicalItems.find((gi) => gi.item?.props?.dataKey === 'registered');
  const vacData = vacItem?.props?.data;
  const regData = regItem?.props?.data;
  if (!vacData?.length || !regData?.length || vacData.length !== regData.length) return null;

  return (
    <g className="recharts-layer trend-gap-ratio-labels" style={{ pointerEvents: 'none' }}>
      {vacData.map((vacRect, i) => {
        const regRect = regData[i];
        const row = rows[i];
        if (!regRect || !row?.ratioLabel) return null;
        const gapCenterX =
          vacRect.x + vacRect.width + (regRect.x - (vacRect.x + vacRect.width)) / 2;
        const topY = Math.min(vacRect.y, regRect.y);
        const labelY = topY - 14;
        const text = row.ratioLabel;
        const isOversubscribed = (row.ratioNumeric ?? 0) > 1;
        const textWidth = Math.max(18, text.length * 7);
        const rectX = gapCenterX - textWidth / 2 - 6;
        const rectY = labelY - 8;
        const rectWidth = textWidth + 12;
        const rectHeight = 16;
        return (
          <g key={row.year}>
            <rect
              x={rectX}
              y={rectY}
              width={rectWidth}
              height={rectHeight}
              rx={4}
              ry={4}
              fill={isOversubscribed ? RATIO_ALERT_BG : RATIO_HIGHLIGHT_BG}
            />
            <text
              x={gapCenterX}
              y={labelY}
              fill={isOversubscribed ? RATIO_ALERT_TEXT : RATIO_HIGHLIGHT_TEXT}
              fontSize={11}
              fontWeight={700}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {text}
            </text>
          </g>
        );
      })}
    </g>
  );
}

/** Darker, more vivid red as oversubscription ratio increases (hue aligned with --destructive). */
function ratioOversubscriptionFill(ratio: number): string {
  if (!Number.isFinite(ratio) || ratio <= 1) return 'var(--muted-foreground)';
  const t = Math.min((ratio - 1) / 2.25, 1);
  const L = 0.54 - t * 0.2;
  const C = 0.12 + t * 0.12;
  const H = 22;
  return `oklch(${L} ${C} ${H})`;
}

interface TrendChartProps {
  data: YearlyData[];
}

export function TrendChart({ data }: TrendChartProps) {
  const { filters, setFilters } = useAppStore();
  const phase = normalizePhase(filters.phase);
  const filtered = data.filter((d) => d.phase === phase);
  const chartData = [...filtered].reverse().map((d) => {
    const ratioRaw = d.vacancies > 0 ? d.registered / d.vacancies : null;
    const ratioRounded =
      ratioRaw != null ? Math.round(ratioRaw * 10) / 10 : null;
    return {
      year: d.year.toString(),
      vacancies: d.vacancies,
      registered: d.registered,
      ratioLabel: ratioRounded != null ? ratioRounded.toFixed(1) : '',
      ratioNumeric: ratioRaw,
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Historical Trends</CardTitle>
        <CardDescription>
          <span className="block">{`Vacancies vs registered applicants by year for Phase ${filters.phase}.`}</span>
          <span className="block">
            <span
              className="rounded px-1.5 py-0.5 font-semibold"
              style={{ backgroundColor: RATIO_HIGHLIGHT_BG, color: RATIO_HIGHLIGHT_TEXT }}
            >
              Ratio
            </span>{' '}
            shows the proportion of registered to vacancies; &gt;1 means oversubscribed and
            balloting is required.
          </span>
        </CardDescription>
        <CardAction>
          <div className="flex flex-col items-end gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">Phase</span>
            <Select value={filters.phase} onValueChange={(value) => setFilters({ phase: value })}>
              <SelectTrigger id="trend-chart-phase" className="w-[9rem]">
                <SelectValue placeholder="Phase" />
              </SelectTrigger>
              <SelectContent align="end">
                {phases.map((p) => (
                  <SelectItem key={p} value={p}>
                    Phase {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 28, right: 10, left: 28, bottom: 5 }}
              barGap={14}
              barCategoryGap="18%"
            >
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
                allowDecimals={false}
              />
              <Legend
                wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }}
                formatter={(value) => (value === 'vacancies' ? 'Vacancies' : 'Registered')}
              />
              <Bar
                dataKey="vacancies"
                name="vacancies"
                fill="var(--trend-bar-vacancies)"
                radius={[4, 4, 0, 0]}
                maxBarSize={48}
              >
                <LabelList
                  dataKey="vacancies"
                  position="insideTop"
                  offset={10}
                  fill="var(--foreground)"
                  fontSize={11}
                  fontWeight={600}
                />
              </Bar>
              <Bar
                dataKey="registered"
                name="registered"
                fill="var(--trend-bar-registered)"
                radius={[4, 4, 0, 0]}
                maxBarSize={48}
              >
                <LabelList
                  dataKey="registered"
                  position="insideTop"
                  offset={10}
                  fill="var(--background)"
                  fontSize={11}
                  fontWeight={600}
                />
              </Bar>
              <Customized
                component={(chartProps: { formattedGraphicalItems?: FormattedBarItem[] }) => (
                  <TrendGapRatioLabels
                    formattedGraphicalItems={chartProps.formattedGraphicalItems}
                    rows={chartData}
                  />
                )}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

interface BallotChartProps {
  data: YearlyData[];
}

export function BallotChart({ data }: BallotChartProps) {
  const { filters } = useAppStore();
  const phase = normalizePhase(filters.phase);
  const filtered = data.filter((d) => d.phase === phase);
  const chartData = [...filtered].reverse().map((d) => ({
    year: d.year.toString(),
    ballotRate: d.ballotRate || 100,
    balloted: d.balloted,
  }));

  const maxRate = chartData.reduce((max, row) => Math.max(max, row.ballotRate), 100);
  const yMax = Math.max(120, Math.ceil(maxRate / 10) * 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Phase subscription rate</CardTitle>
        <CardDescription>
          <span className="block">{`Registered applicants as a share of vacancies for Phase ${phase}.`}</span>
          <span className="block">{`Subscription rate = registered ÷ vacancies × 100%. Above 100% means oversubscribed.`}</span>
        </CardDescription>
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
                domain={[0, yMax]}
                tickFormatter={(value) => `${value}%`}
              />
              <ReferenceLine
                y={100}
                stroke="#ef4444"
                strokeOpacity={0.9}
                strokeWidth={2.5}
                isFront
                ifOverflow="extendDomain"
                label={{
                  value: '100%',
                  position: 'insideTopRight',
                  fill: '#ef4444',
                  fontSize: 10,
                }}
              />
              <Bar
                dataKey="ballotRate"
                name="Subscription rate"
                fill="var(--trend-bar-vacancies)"
                radius={[4, 4, 0, 0]}
              >
                <LabelList
                  dataKey="ballotRate"
                  position="insideTop"
                  offset={10}
                  fill="var(--foreground)"
                  fontSize={11}
                  fontWeight={600}
                  formatter={(value: number) => `${value}%`}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
