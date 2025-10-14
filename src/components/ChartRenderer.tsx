import React from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  ScatterChart,
  Scatter,
  ComposedChart,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts';
import type { ChartData } from '../types/chart';

// Color palette for charts
const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff7c7c',
];

interface ChartCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: string;
}

const ChartCard: React.FC<ChartCardProps> = ({
  title,
  description,
  children,
  footer,
}) => (
  <div className="chart-card">
    <div className="chart-header">
      <h3 className="chart-title">{title}</h3>
      <p className="chart-description">{description}</p>
    </div>
    <div className="chart-content">{children}</div>
    {footer && <div className="chart-footer">{footer}</div>}
  </div>
);

function BarChartComponent({ data }: { data: ChartData }) {
  // Find the numeric data key from the first data item
  const firstDataItem = data.data[0] || {};
  const dataKey = Object.keys(firstDataItem).find(
    (key) => key !== data.config.xAxisKey && typeof firstDataItem[key] === 'number'
  ) || Object.keys(data.chartConfig)[0];

  const color = data.chartConfig[dataKey]?.color || COLORS[0];

  return (
    <ChartCard
      title={data.config.title}
      description={data.config.description}
      footer={data.config.footer}
    >
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data.data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
            dataKey={data.config.xAxisKey}
            tick={{ fontSize: 12 }}
            tickFormatter={(value) =>
              value.length > 20 ? `${value.substring(0, 17)}...` : value
            }
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey={dataKey} fill={color} radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

function MultiBarChartComponent({ data }: { data: ChartData }) {
  return (
    <ChartCard
      title={data.config.title}
      description={data.config.description}
      footer={data.config.footer}
    >
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data.data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
            dataKey={data.config.xAxisKey}
            tick={{ fontSize: 12 }}
            tickFormatter={(value) =>
              value.length > 20 ? `${value.substring(0, 17)}...` : value
            }
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          {Object.keys(data.chartConfig).map((key, index) => (
            <Bar
              key={key}
              dataKey={key}
              fill={data.chartConfig[key]?.color || COLORS[index % COLORS.length]}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

function LineChartComponent({ data }: { data: ChartData }) {
  return (
    <ChartCard
      title={data.config.title}
      description={data.config.description}
      footer={data.config.footer}
    >
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data.data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
            dataKey={data.config.xAxisKey}
            tick={{ fontSize: 12 }}
            tickFormatter={(value) =>
              value.length > 20 ? `${value.substring(0, 17)}...` : value
            }
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          {Object.keys(data.chartConfig).map((key, index) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={data.chartConfig[key]?.color || COLORS[index % COLORS.length]}
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

function PieChartComponent({ data }: { data: ChartData }) {
  // Dynamically find the field names from the data
  const firstDataItem = data.data[0] || {};
  const keys = Object.keys(firstDataItem);

  // Find the numeric field (value) - look for number type or common value field names
  const valueKey = keys.find(
    (key) => typeof firstDataItem[key] === 'number'
  ) || keys.find(
    (key) => key.toLowerCase().includes('value') ||
             key.toLowerCase().includes('count') ||
             key.toLowerCase().includes('total')
  ) || 'value';

  // Find the label field (name/segment) - use the non-numeric field
  const nameKey = keys.find(
    (key) => key !== valueKey && typeof firstDataItem[key] === 'string'
  ) || keys.find(
    (key) => key.toLowerCase().includes('name') ||
             key.toLowerCase().includes('label') ||
             key.toLowerCase().includes('segment') ||
             key.toLowerCase().includes('type') ||
             key.toLowerCase().includes('category')
  ) || 'segment';

  const chartData = data.data.map((item, index) => ({
    ...item,
    fill: COLORS[index % COLORS.length],
  }));

  return (
    <ChartCard
      title={data.config.title}
      description={data.config.description}
      footer={data.config.footer}
    >
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey={valueKey}
            nameKey={nameKey}
            cx="50%"
            cy="50%"
            outerRadius={120}
            label={(entry) => entry[nameKey]}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

function AreaChartComponent({
  data,
  stacked,
}: {
  data: ChartData;
  stacked?: boolean;
}) {
  return (
    <ChartCard
      title={data.config.title}
      description={data.config.description}
      footer={data.config.footer}
    >
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={data.data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
            dataKey={data.config.xAxisKey}
            tick={{ fontSize: 12 }}
            tickFormatter={(value) =>
              value.length > 20 ? `${value.substring(0, 17)}...` : value
            }
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          {Object.keys(data.chartConfig).map((key, index) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stroke={data.chartConfig[key]?.color || COLORS[index % COLORS.length]}
              fill={data.chartConfig[key]?.color || COLORS[index % COLORS.length]}
              fillOpacity={0.6}
              stackId={stacked ? 'stack' : undefined}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

function HorizontalBarChartComponent({ data }: { data: ChartData }) {
  // Find the numeric data key from the first data item
  const firstDataItem = data.data[0] || {};
  const dataKey = Object.keys(firstDataItem).find(
    (key) => key !== data.config.xAxisKey && typeof firstDataItem[key] === 'number'
  ) || Object.keys(data.chartConfig)[0];

  const color = data.chartConfig[dataKey]?.color || COLORS[0];

  return (
    <ChartCard
      title={data.config.title}
      description={data.config.description}
      footer={data.config.footer}
    >
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data.data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis type="number" tick={{ fontSize: 12 }} />
          <YAxis
            dataKey={data.config.xAxisKey}
            type="category"
            tick={{ fontSize: 12 }}
            width={150}
            tickFormatter={(value) =>
              value.length > 20 ? `${value.substring(0, 17)}...` : value
            }
          />
          <Tooltip />
          <Bar dataKey={dataKey} fill={color} radius={[0, 8, 8, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

function StackedBarChartComponent({ data }: { data: ChartData }) {
  return (
    <ChartCard
      title={data.config.title}
      description={data.config.description}
      footer={data.config.footer}
    >
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data.data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
            dataKey={data.config.xAxisKey}
            tick={{ fontSize: 12 }}
            tickFormatter={(value) =>
              value.length > 20 ? `${value.substring(0, 17)}...` : value
            }
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          {Object.keys(data.chartConfig).map((key, index) => (
            <Bar
              key={key}
              dataKey={key}
              fill={data.chartConfig[key]?.color || COLORS[index % COLORS.length]}
              stackId="stack"
              radius={index === Object.keys(data.chartConfig).length - 1 ? [4, 4, 0, 0] : undefined}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

function ScatterChartComponent({ data }: { data: ChartData }) {
  // Find x and y axis keys
  const xAxisKey = data.config.xAxisKey || 'x';
  const yAxisKey = data.config.yAxisKey || 'y';

  // Find all numeric fields for potential scatter data
  const firstDataItem = data.data[0] || {};
  const numericKeys = Object.keys(firstDataItem).filter(
    (key) => typeof firstDataItem[key] === 'number'
  );

  // Use configured keys or fall back to first two numeric fields
  const xKey = numericKeys.includes(xAxisKey) ? xAxisKey : numericKeys[0] || 'x';
  const yKey = numericKeys.includes(yAxisKey) ? yAxisKey : numericKeys[1] || numericKeys[0] || 'y';

  return (
    <ChartCard
      title={data.config.title}
      description={data.config.description}
      footer={data.config.footer}
    >
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey={xKey} type="number" name={xKey} tick={{ fontSize: 12 }} />
          <YAxis dataKey={yKey} type="number" name={yKey} tick={{ fontSize: 12 }} />
          <ZAxis range={[60, 400]} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Legend />
          <Scatter name="Data Points" data={data.data} fill={COLORS[0]} />
        </ScatterChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

function DonutChartComponent({ data }: { data: ChartData }) {
  // Dynamically find the field names from the data (same logic as PieChart)
  const firstDataItem = data.data[0] || {};
  const keys = Object.keys(firstDataItem);

  const valueKey = keys.find(
    (key) => typeof firstDataItem[key] === 'number'
  ) || keys.find(
    (key) => key.toLowerCase().includes('value') ||
             key.toLowerCase().includes('count') ||
             key.toLowerCase().includes('total')
  ) || 'value';

  const nameKey = keys.find(
    (key) => key !== valueKey && typeof firstDataItem[key] === 'string'
  ) || keys.find(
    (key) => key.toLowerCase().includes('name') ||
             key.toLowerCase().includes('label') ||
             key.toLowerCase().includes('segment') ||
             key.toLowerCase().includes('type') ||
             key.toLowerCase().includes('category')
  ) || 'segment';

  const chartData = data.data.map((item, index) => ({
    ...item,
    fill: COLORS[index % COLORS.length],
  }));

  return (
    <ChartCard
      title={data.config.title}
      description={data.config.description}
      footer={data.config.footer}
    >
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey={valueKey}
            nameKey={nameKey}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={120}
            label={(entry) => entry[nameKey]}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

function ComposedChartComponent({ data }: { data: ChartData }) {
  return (
    <ChartCard
      title={data.config.title}
      description={data.config.description}
      footer={data.config.footer}
    >
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={data.data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
            dataKey={data.config.xAxisKey}
            tick={{ fontSize: 12 }}
            tickFormatter={(value) =>
              value.length > 20 ? `${value.substring(0, 17)}...` : value
            }
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          {Object.keys(data.chartConfig).map((key, index) => {
            const config = data.chartConfig[key];
            // Determine component type based on config or position
            // First series as bars, subsequent as lines
            if (index === 0) {
              return (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={config?.color || COLORS[index % COLORS.length]}
                  radius={[4, 4, 0, 0]}
                />
              );
            } else {
              return (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={config?.color || COLORS[index % COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              );
            }
          })}
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function ChartRenderer({ data }: { data: ChartData }) {
  try {
    switch (data.chartType) {
      case 'bar':
        return <BarChartComponent data={data} />;
      case 'multiBar':
        return <MultiBarChartComponent data={data} />;
      case 'line':
        return <LineChartComponent data={data} />;
      case 'pie':
        return <PieChartComponent data={data} />;
      case 'area':
        return <AreaChartComponent data={data} />;
      case 'stackedArea':
        return <AreaChartComponent data={data} stacked />;
      case 'horizontalBar':
        return <HorizontalBarChartComponent data={data} />;
      case 'stackedBar':
        return <StackedBarChartComponent data={data} />;
      case 'scatter':
        return <ScatterChartComponent data={data} />;
      case 'donut':
        return <DonutChartComponent data={data} />;
      case 'composed':
        return <ComposedChartComponent data={data} />;
      default:
        return (
          <div className="chart-error">
            Unknown chart type: {(data as any).chartType}
          </div>
        );
    }
  } catch (error) {
    console.error('Chart rendering error:', error);
    return (
      <div className="chart-error">
        Error rendering chart: {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    );
  }
}
