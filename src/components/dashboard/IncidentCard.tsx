
import type React from 'react';
import type { Incident } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ShieldAlert, HeartPulse, Flame, Car, Eye, AlertTriangle, Tags } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IncidentCardProps {
  incident: Incident;
  onViewReport: (incident: Incident) => void;
}

const getIncidentIcon = (type: Incident['type']) => {
  switch (type) {
    case 'Violent Crime': return <ShieldAlert className="h-5 w-5 text-destructive" />;
    case 'Medical Emergency': return <HeartPulse className="h-5 w-5 text-blue-400" />;
    case 'Fire Alert': return <Flame className="h-5 w-5 text-orange-500" />;
    case 'Traffic Accident': return <Car className="h-5 w-5 text-yellow-500" />;
    case 'Suspicious Activity': return <Eye className="h-5 w-5 text-purple-400" />;
    default: return <AlertTriangle className="h-5 w-5 text-foreground" />;
  }
};

const getStatusBadgeVariant = (status: Incident['status']): string => {
  switch (status) {
    case 'Critical': return 'bg-status-critical';
    case 'Warning': return 'bg-status-warning';
    case 'Resolved': return 'bg-status-resolved';
    case 'New': return 'bg-status-new';
    default: return 'bg-secondary';
  }
};

const extractAnomalyTags = (analysis: string | undefined): string[] => {
  if (!analysis) return [];
  const match = analysis.match(/\(Detected Anomalies: ([^)]+)\)/);
  if (match && match[1]) {
    return match[1].split(',').map(tag => tag.trim()).slice(0, 3); // Show up to 3 tags
  }
  return [];
};

const IncidentCard: React.FC<IncidentCardProps> = ({ incident, onViewReport }) => {
  const anomalyTags = extractAnomalyTags(incident.initialAISystemAnalysis);

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3 pt-4 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getIncidentIcon(incident.type)}
            <CardTitle className="text-base font-semibold leading-none tracking-tight">{incident.title}</CardTitle>
          </div>
          <Badge className={cn("text-xs px-2 py-1", getStatusBadgeVariant(incident.status))}>
            {incident.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground pb-3 pt-0 px-4">
        <p>Location: {incident.location}</p>
        <p>Time: {formatDistanceToNow(new Date(incident.timestamp), { addSuffix: true })}</p>
        {anomalyTags.length > 0 && (
          <div className="mt-2">
            <div className="flex items-center text-xs text-muted-foreground mb-1">
              <Tags className="h-3 w-3 mr-1" />
              Key Anomalies:
            </div>
            <div className="flex flex-wrap gap-1">
              {anomalyTags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0.5 bg-muted hover:bg-muted/80">
                  {tag.replace(/_/g, ' ')}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="pb-4 px-4">
        <Button variant="outline" size="sm" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground" onClick={() => onViewReport(incident)}>
          View Report
        </Button>
      </CardFooter>
    </Card>
  );
};

export default IncidentCard;
