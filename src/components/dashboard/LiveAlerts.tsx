import type React from 'react';
import type { Incident } from '@/lib/types';
import IncidentCard from './IncidentCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LiveAlertsProps {
  incidents: Incident[];
  onViewReport: (incident: Incident) => void;
  onRefresh?: () => void; // Optional refresh handler
}

const LiveAlerts: React.FC<LiveAlertsProps> = ({ incidents, onViewReport, onRefresh }) => {
  return (
    <div className="h-full flex flex-col bg-card shadow-xl rounded-lg p-1">
      <div className="flex items-center justify-between p-3 border-b">
        <h2 className="text-lg font-semibold text-foreground">Live Alerts</h2>
        {onRefresh && (
          <Button variant="ghost" size="icon" onClick={onRefresh} aria-label="Refresh alerts">
            <RefreshCw className="h-4 w-4 text-primary animate-spin_slowly_if_needed" /> {/* Placeholder for loading animation */}
          </Button>
        )}
      </div>
      <ScrollArea className="flex-grow p-3">
        {incidents.length === 0 ? (
          <p className="text-center text-muted-foreground py-10">No active alerts.</p>
        ) : (
          <div className="space-y-3">
            {incidents.map((incident) => (
              <IncidentCard key={incident.id} incident={incident} onViewReport={onViewReport} />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default LiveAlerts;
