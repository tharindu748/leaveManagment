interface SummaryCardProps {
  title: string;
  value: number;
  desc: string;
}

export default function SummaryCard({ title, value, desc }: SummaryCardProps) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
      <p className="text-gray-500 text-sm font-medium">{title}</p>
      <h2 className="text-3xl font-bold my-2 text-gray-800">{value}</h2>
      <span className="text-sm text-gray-400">{desc}</span>
    </div>
  );
}