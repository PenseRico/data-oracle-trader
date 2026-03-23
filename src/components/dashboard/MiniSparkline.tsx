import { ResponsiveContainer, LineChart, Line } from "recharts";

interface MiniSparklineProps {
  data: number[];
  positive: boolean;
}

export function MiniSparkline({ data, positive }: MiniSparklineProps) {
  const chartData = data.map((value, index) => ({ index, value }));

  return (
    <div className="h-8 w-20">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={positive ? "hsl(174, 62%, 47%)" : "hsl(0, 72%, 51%)"}
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
