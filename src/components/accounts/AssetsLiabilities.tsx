import { formatCurrency } from "@/lib/utils/formatcurrency";
import { Card, CardContent } from "@/components/ui/card";

type BreakdownItem = {
  label: string;
  value: number;
  color: string;
};

// Placeholder data — replaced with real breakdown once accounts are
// linked to transactions and categorized
const ASSET_ITEMS: BreakdownItem[] = [
  { label: "Investments", value: 541793.51, color: "#06B6D4" },
  { label: "Real Estate", value: 300816.71, color: "#8B5CF6" },
  { label: "Cash", value: 65755.47, color: "#10B981" },
  { label: "Vehicles", value: 20071.06, color: "#F97316" },
];

const LIABILITY_ITEMS: BreakdownItem[] = [
  { label: "Loans", value: 239377.23, color: "#F59E0B" },
  { label: "Credit Cards", value: 2511.55, color: "#EF4444" },
];

function sumItems(items: BreakdownItem[]): number {
  return items.reduce((sum, i) => sum + i.value, 0);
}

function BreakdownSection({
  title,
  items,
}: {
  title: string;
  items: BreakdownItem[];
}) {
  const total = sumItems(items);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-fintrak-text-primary">
          {title}
        </span>
        <span className="text-sm font-semibold text-fintrak-text-primary">
          {formatCurrency(total)}
        </span>
      </div>

      {/* Stacked bar */}
      <div className="flex h-2.5 w-full rounded-full overflow-hidden">
        {items.map((item) => (
          <div
            key={item.label}
            style={{
              width: `${(item.value / total) * 100}%`,
              backgroundColor: item.color,
            }}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-fintrak-text-secondary">
                {item.label}
              </span>
            </div>
            <span className="text-sm font-medium text-fintrak-text-primary">
              {formatCurrency(item.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AssetsLiabilities() {
  const totalAssets = sumItems(ASSET_ITEMS);
  const totalLiabilities = sumItems(LIABILITY_ITEMS);
  const netWorth = totalAssets - totalLiabilities;

  const liquidAssets = ASSET_ITEMS.find((i) => i.label === "Cash")?.value ?? 0;
  const debtToAssetRatio = Math.round((totalLiabilities / totalAssets) * 100);

  return (
    <Card className="border-fintrak-border shadow-sm">
      <CardContent className="space-y-6 pt-6">
        {/* Net worth */}
        <div className="space-y-1 pb-4 border-b border-fintrak-border">
          <p className="text-xs font-medium text-fintrak-text-secondary uppercase tracking-wide">
            Net Worth
          </p>
          <p className="text-2xl font-bold text-fintrak-text-primary">
            {formatCurrency(netWorth)}
          </p>
        </div>

        <BreakdownSection title="Assets" items={ASSET_ITEMS} />

        <div className="h-px bg-fintrak-border" />

        <BreakdownSection title="Liabilities" items={LIABILITY_ITEMS} />

        <div className="h-px bg-fintrak-border" />

        {/* Quick insights */}
        <div className="space-y-3">
          <span className="text-sm font-semibold text-fintrak-text-primary">
            Quick Insights
          </span>
          <div className="flex items-center justify-between">
            <span className="text-sm text-fintrak-text-secondary">
              Liquid assets
            </span>
            <span className="text-sm font-medium text-fintrak-text-primary">
              {formatCurrency(liquidAssets)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-fintrak-text-secondary">
              Debt-to-asset ratio
            </span>
            <span className="text-sm font-medium text-fintrak-text-primary">
              {debtToAssetRatio}%
            </span>
          </div>
        </div>

        <p className="text-xs text-fintrak-text-secondary text-center pt-1">
          Placeholder data
        </p>
      </CardContent>
    </Card>
  );
}
