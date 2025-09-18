import * as React from "react";
import { ChartContainer } from "@mui/x-charts/ChartContainer";
import { BarPlot } from "@mui/x-charts/BarChart";
import { ChartsXAxis } from "@mui/x-charts/ChartsXAxis";
import { ChartsYAxis } from "@mui/x-charts/ChartsYAxis";

const uData: number[] = [4000, 3000, 2000, 2780, 1890, 2390, 3490];
const xLabels: string[] = [
  "Page A",
  "Page B",
  "Page C",
  "Page D",
  "Page E",
  "Page F",
  "Page G",
];

const BarChart: React.FC = () => {
  return (
    <ChartContainer
      width={500}
      height={300}
      series={[
        {
          data: uData,
          label: "UV",
          type: "bar",
          color: "#4CAF50", // ✅ keep bar color
        },
      ]}
      xAxis={[
        {
          scaleType: "band",
          data: xLabels,
          label: "Pages",
          tickLabelStyle: {
            fontSize: 12,
            fill: "#555",
            fontWeight: 500,
          },
        },
      ]}
      yAxis={[
        {
          label: "Users",
          tickLabelStyle: {
            fontSize: 12,
            fill: "#333",
            fontWeight: 500,
          },
        },
      ]}
    >
      <BarPlot />
      <ChartsXAxis />
      <ChartsYAxis />
    </ChartContainer>
  );
};

export default BarChart;
