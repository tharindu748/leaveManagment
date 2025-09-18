import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PieChart } from "@mui/x-charts/PieChart";

interface StatProps {
  title: string;
  percentage: number;
  count: number;
  color?: string;
}

const StatCard = ({ title, percentage, count, color }: StatProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <span className="text-sm text-gray-500">{percentage}%</span>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          {/* Left side: Number */}
          <div className={`text-2xl font-bold ${color ?? "text-gray-800"}`}>
            {count}
          </div>

          {/* Right side: Donut chart */}
          <div className="w-16 h-16">
            <PieChart
              width={64}
              height={64}
              series={[
                {
                  innerRadius: 20, // makes it donut
                  outerRadius: 30,
                  data: [
                    { id: 0, value: percentage, color: color ?? "#4CAF50" },
                    { id: 1, value: 100 - percentage, color: "#E5E7EB" },
                  ],
                },
              ]}
              // ✅ TS-safe way to remove legend
              slotProps={{
                legend: { hidden: true } as any,
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
