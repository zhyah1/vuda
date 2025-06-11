import type React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  valueClassName?: string;
  isStatus?: boolean;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, subtitle, icon, valueClassName, isStatus = false }) => {
  return (
    <Card className="shadow-lg hover:shadow-primary/20 transition-shadow duration-300 flex-1 min-w-[200px]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon && <div className="text-primary">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className={cn("text-3xl font-bold", valueClassName)}>
          {isStatus && typeof value === 'string' && value.toLowerCase() === 'online' ? (
             <div className="flex items-center gap-2">
              <span>Online</span>
              <div className="glowing-dot"></div>
            </div>
          ) : (
            value
          )}
        </div>
        {subtitle && <p className="text-xs text-muted-foreground pt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );
};

export default KpiCard;
