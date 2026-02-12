import { Progress } from "@/components/ui/progress";
import { UtahBadge } from "./utah-badge";

interface ScoreBreakdownProps {
  breakdown: {
    budget: number;
    sector: number;
    geography: number;
    timing: number;
  };
  finalScore: number;
  isUtah: boolean;
}

export function ScoreBreakdown({ breakdown, finalScore, isUtah }: ScoreBreakdownProps) {
  const items = [
    { label: "Budget", score: breakdown.budget, detail: "Est. value assessment" },
    { label: "Sector", score: breakdown.sector, detail: "Industry alignment" },
    { label: "Geography", score: breakdown.geography, detail: isUtah ? "Utah" : "Location fit" },
    { label: "Timing", score: breakdown.timing, detail: "Days until deadline" },
  ];

  const rawScore = Math.round(
    (breakdown.budget + breakdown.sector + breakdown.geography + breakdown.timing) / 4
  );

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-6">
      <h4 className="font-semibold mb-4">Score Breakdown</h4>
      <div className="space-y-4">
        {items.map(item => (
          <div key={item.label} className="flex items-center gap-4">
            <span className="w-24 text-sm font-medium text-zinc-600">{item.label}</span>
            <div className="flex-1">
              <Progress value={item.score} className="h-2" />
            </div>
            <span className="w-12 text-right font-mono text-sm">{item.score}</span>
            <span className="w-32 text-sm text-zinc-400 flex items-center gap-1">
              {item.detail}
              {item.label === "Geography" && isUtah && <UtahBadge className="ml-1" />}
            </span>
          </div>
        ))}
      </div>
      {isUtah && (
        <div className="mt-4 pt-4 border-t text-sm text-zinc-500">
          Raw Score: {rawScore} x Utah Multiplier (1.5x) =
          <span className="font-semibold text-zinc-900 ml-1">{finalScore}</span>
        </div>
      )}
    </div>
  );
}
