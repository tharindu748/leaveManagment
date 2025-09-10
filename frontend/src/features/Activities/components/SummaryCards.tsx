import SummaryCard from "./SummaryCard"; 

const cards = [
  { title: "Present Today", value: 40, desc: "124 People Remaining" },
  { title: "Late Entry", value: 26, desc: "12 People on Time" },
  { title: "On Leave", value: 4, desc: "Approved Leave" },
  { title: "Absent", value: 1, desc: "Without Informing" },
];

export default function SummaryCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, idx) => (
        <SummaryCard key={idx} {...card} />
      ))}
    </div>
  );
}

