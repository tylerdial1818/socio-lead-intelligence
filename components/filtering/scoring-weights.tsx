"use client";

import { useState, useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useScoringConfig, useUpdateScoringConfig } from "@/hooks/use-scoring-config";
import { toast } from "sonner";

const DEFAULTS = {
  budgetWeight: 25,
  sectorWeight: 25,
  geographyWeight: 25,
  timingWeight: 25,
  utahMultiplier: 1.5,
};

const DIMENSIONS = [
  {
    key: "budgetWeight" as const,
    label: "Budget",
    description: "How much the estimated contract value influences the score. Higher weight prioritizes larger contracts.",
  },
  {
    key: "sectorWeight" as const,
    label: "Sector",
    description: "How much industry/sector alignment matters. Higher weight favors health, social services, and education opportunities.",
  },
  {
    key: "geographyWeight" as const,
    label: "Geography",
    description: "How much location proximity matters. Higher weight prioritizes Utah and neighboring state opportunities.",
  },
  {
    key: "timingWeight" as const,
    label: "Timing",
    description: "How much deadline timing affects the score. Higher weight favors opportunities with comfortable timelines.",
  },
];

type WeightKey = "budgetWeight" | "sectorWeight" | "geographyWeight" | "timingWeight";

export function ScoringWeights() {
  const { data: config, isLoading } = useScoringConfig();
  const updateConfig = useUpdateScoringConfig();

  const [weights, setWeights] = useState(DEFAULTS);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (config) {
      setWeights({
        budgetWeight: config.budgetWeight,
        sectorWeight: config.sectorWeight,
        geographyWeight: config.geographyWeight,
        timingWeight: config.timingWeight,
        utahMultiplier: config.utahMultiplier,
      });
    }
  }, [config]);

  useEffect(() => {
    if (config) {
      const changed =
        weights.budgetWeight !== config.budgetWeight ||
        weights.sectorWeight !== config.sectorWeight ||
        weights.geographyWeight !== config.geographyWeight ||
        weights.timingWeight !== config.timingWeight ||
        weights.utahMultiplier !== config.utahMultiplier;
      setHasChanges(changed);
    }
  }, [weights, config]);

  const totalWeight =
    weights.budgetWeight + weights.sectorWeight + weights.geographyWeight + weights.timingWeight;

  const handleWeightChange = (key: WeightKey, value: number[]) => {
    setWeights((prev) => ({ ...prev, [key]: value[0] }));
  };

  const handleSave = () => {
    updateConfig.mutate(weights, {
      onSuccess: () => toast.success("Scoring weights saved"),
      onError: () => toast.error("Failed to save scoring weights"),
    });
  };

  const handleReset = () => {
    setWeights(DEFAULTS);
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center">
        <p className="text-sm text-zinc-500">Loading scoring configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Weight Sliders */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6">
        <h3 className="font-semibold text-zinc-900 mb-1">Dimension Weights</h3>
        <p className="text-sm text-zinc-500 mb-6">
          Adjust how much each dimension contributes to the overall ICP score. Higher values mean more influence.
        </p>

        <div className="space-y-6">
          {DIMENSIONS.map((dim) => {
            const value = weights[dim.key];
            const pct = totalWeight > 0 ? Math.round((value / totalWeight) * 100) : 25;

            return (
              <div key={dim.key}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-sm font-medium text-zinc-900">{dim.label}</span>
                    <p className="text-xs text-zinc-500">{dim.description}</p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <span className="text-lg font-mono font-bold text-zinc-900">{value}</span>
                    <span className="text-xs text-zinc-400 ml-1">({pct}%)</span>
                  </div>
                </div>
                <Slider
                  value={[value]}
                  onValueChange={(v) => handleWeightChange(dim.key, v)}
                  min={0}
                  max={50}
                  step={1}
                  className="w-full"
                />
              </div>
            );
          })}
        </div>

        {/* Distribution Bar */}
        <div className="mt-6 pt-4 border-t border-zinc-100">
          <p className="text-xs font-medium text-zinc-500 mb-2">Weight Distribution</p>
          <div className="flex h-3 rounded-full overflow-hidden bg-zinc-100">
            {totalWeight > 0 ? (
              <>
                <div
                  className="bg-blue-500 transition-all"
                  style={{ width: `${(weights.budgetWeight / totalWeight) * 100}%` }}
                  title={`Budget: ${Math.round((weights.budgetWeight / totalWeight) * 100)}%`}
                />
                <div
                  className="bg-emerald-500 transition-all"
                  style={{ width: `${(weights.sectorWeight / totalWeight) * 100}%` }}
                  title={`Sector: ${Math.round((weights.sectorWeight / totalWeight) * 100)}%`}
                />
                <div
                  className="bg-amber-500 transition-all"
                  style={{ width: `${(weights.geographyWeight / totalWeight) * 100}%` }}
                  title={`Geography: ${Math.round((weights.geographyWeight / totalWeight) * 100)}%`}
                />
                <div
                  className="bg-purple-500 transition-all"
                  style={{ width: `${(weights.timingWeight / totalWeight) * 100}%` }}
                  title={`Timing: ${Math.round((weights.timingWeight / totalWeight) * 100)}%`}
                />
              </>
            ) : (
              <div className="w-full bg-zinc-200" />
            )}
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" /> Budget
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Sector
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Geography
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-500" /> Timing
            </span>
          </div>
        </div>
      </div>

      {/* Utah Multiplier */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="font-semibold text-zinc-900">Utah Multiplier</h3>
            <p className="text-sm text-zinc-500">
              Bonus multiplier applied to the final score for Utah-based opportunities.
            </p>
          </div>
          <span className="text-lg font-mono font-bold text-zinc-900">
            {weights.utahMultiplier.toFixed(1)}x
          </span>
        </div>
        <Slider
          value={[weights.utahMultiplier]}
          onValueChange={(v) => setWeights((prev) => ({ ...prev, utahMultiplier: Math.round(v[0] * 10) / 10 }))}
          min={1}
          max={3}
          step={0.1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-zinc-400 mt-1">
          <span>1.0x (no bonus)</span>
          <span>3.0x (strong bonus)</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handleReset}
          className="gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Reset to Defaults
        </Button>
        <Button
          onClick={handleSave}
          disabled={!hasChanges || updateConfig.isPending}
        >
          {updateConfig.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
