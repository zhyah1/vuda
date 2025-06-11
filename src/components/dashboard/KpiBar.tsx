import type React from 'react';
import KpiCard from './KpiCard';
import { TrendingDown, ShieldOff, Activity, Wifi } from 'lucide-react';

interface KpiBarProps {
  activeIncidents: number;
}

const KpiBar: React.FC<KpiBarProps> = ({ activeIncidents }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 p-4 md:p-6">
      <KpiCard 
        title="Avg. Response Time" 
        value="-70%" 
        subtitle="AI-Assisted Dispatch" 
        icon={<TrendingDown className="h-5 w-5" />} 
        valueClassName="text-success"
      />
      <KpiCard 
        title="False Alarms" 
        value="-50%" 
        subtitle="Reduced Inaccuracies" 
        icon={<ShieldOff className="h-5 w-5" />} 
        valueClassName="text-success"
      />
      <KpiCard 
        title="Active Incidents" 
        value={activeIncidents} 
        icon={<Activity className="h-5 w-5" />} 
      />
      <KpiCard 
        title="System Status" 
        value="Online" 
        isStatus={true} 
        icon={<Wifi className="h-5 w-5 text-success" />}
        valueClassName="text-success"
      />
    </div>
  );
};

export default KpiBar;
