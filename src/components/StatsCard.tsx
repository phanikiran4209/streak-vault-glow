
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  className?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}

export function StatsCard({
  title,
  value,
  description,
  className,
  icon,
  trend,
  trendValue,
}: StatsCardProps) {
  return (
    <Card className={cn("overflow-hidden transition-all hover:shadow-lg", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 bg-gradient-to-r from-primary-50 to-transparent dark:from-primary-900/20 dark:to-transparent">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && <div className="text-primary-500">{icon}</div>}
      </CardHeader>
      <CardContent className="p-6">
        <div className="text-3xl font-bold bg-gradient-to-br from-primary-800 to-primary-500 dark:from-primary-300 dark:to-primary-500 bg-clip-text text-transparent">
          {value}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div className={cn(
            "flex items-center mt-3 text-xs font-medium",
            trend === "up" ? "text-green-500" : 
            trend === "down" ? "text-red-500" : "text-yellow-500"
          )}>
            <span className={cn(
              "mr-1 h-4 w-4 flex items-center justify-center rounded-full",
              trend === "up" ? "bg-green-100 dark:bg-green-900/30" : 
              trend === "down" ? "bg-red-100 dark:bg-red-900/30" : "bg-yellow-100 dark:bg-yellow-900/30"
            )}>
              {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"}
            </span>
            {trendValue}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
