// Small stat card (e.g. predicted total, due this week, study hours this week).
// Used by: app/(app)/dashboard/page.tsx

import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: string;
  detail?: string;
}

export function StatCard({ label, value, detail }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-3xl font-semibold tracking-tight">{value}</p>
        {detail && <p className="text-xs text-muted-foreground">{detail}</p>}
      </CardContent>
    </Card>
  );
}
