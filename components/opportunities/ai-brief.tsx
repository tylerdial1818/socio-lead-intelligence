import { formatDistanceToNow } from "date-fns";
import { Check, AlertCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIBriefProps {
  brief: {
    summary: string;
    fitAnalysis: string;
    strengths: string[];
    concerns: string[];
    recommendation: "PURSUE" | "CONSIDER" | "PASS";
  };
  generatedAt: string | null;
}

export function AIBrief({ brief, generatedAt }: AIBriefProps) {
  const recommendationStyles = {
    PURSUE: "bg-green-100 text-green-700 border-green-200",
    CONSIDER: "bg-yellow-100 text-yellow-700 border-yellow-200",
    PASS: "bg-zinc-100 text-zinc-600 border-zinc-200",
  };

  return (
    <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-6 my-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          AI Intelligence Brief
        </h4>
        {generatedAt && (
          <span className="text-xs text-zinc-400">
            Generated {formatDistanceToNow(new Date(generatedAt))} ago
          </span>
        )}
      </div>
      <div className="space-y-4">
        <div>
          <h5 className="text-sm font-medium text-zinc-500 mb-1">Summary</h5>
          <p className="text-zinc-700">{brief.summary}</p>
        </div>
        <div>
          <h5 className="text-sm font-medium text-zinc-500 mb-1">Fit Analysis</h5>
          <p className="text-zinc-700">{brief.fitAnalysis}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h5 className="text-sm font-medium text-zinc-500 mb-2">Strengths</h5>
            <ul className="space-y-1">
              {brief.strengths.map((s, i) => (
                <li key={i} className="text-sm text-zinc-700 flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="text-sm font-medium text-zinc-500 mb-2">Concerns</h5>
            <ul className="space-y-1">
              {brief.concerns.map((c, i) => (
                <li key={i} className="text-sm text-zinc-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="pt-4 border-t">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-zinc-500">Recommendation:</span>
            <span className={cn(
              "px-3 py-1 rounded-full text-sm font-medium border",
              recommendationStyles[brief.recommendation]
            )}>
              {brief.recommendation}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
