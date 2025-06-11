
'use client';

import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/dashboard/Header';
import KpiBar from '@/components/dashboard/KpiBar';
import CityMap from '@/components/dashboard/CityMap';
import LiveAlerts from '@/components/dashboard/LiveAlerts';
import IncidentReportModal from '@/components/dashboard/IncidentReportModal';
import type { Incident, IncidentAction } from '@/lib/types';
import { generateMockIncident, getInitialMockIncidents, INITIAL_INCIDENTS_COUNT } from '@/lib/mockData';
import { generateIncidentSummary, type GenerateIncidentSummaryInput } from '@/ai/flows/summarize-incident';
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { ShieldAlert, AlertTriangle, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

const DEPARTMENTS_LIST = ['Police', 'Fireforce', 'MVD', 'EMS', 'Disaster Management', 'Event Security', 'City Transit Authority', 'Public Works', 'Animal Control'];

export default function DashboardPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [activeIncidentsCount, setActiveIncidentsCount] = useState(0);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingAiSummary, setIsLoadingAiSummary] = useState(false);
  const [newlyAddedIncidentIds, setNewlyAddedIncidentIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    setIncidents(getInitialMockIncidents());
  }, []);
  
  useEffect(() => {
    const count = incidents.filter(inc => inc.status !== 'Resolved').length;
    setActiveIncidentsCount(count);
  }, [incidents]);

  const getToastIcon = (status: Incident['status']): React.ReactNode => {
    switch (status) {
      case 'Critical':
        return <ShieldAlert className="h-5 w-5 text-destructive-foreground" />;
      case 'Warning':
        return <AlertTriangle className="h-5 w-5 text-accent" />;
      case 'New':
        return <Bell className="h-5 w-5 text-primary" />;
      default:
        return <Bell className="h-5 w-5 text-primary" />;
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const newIncident = generateMockIncident();
      setIncidents(prevIncidents => [newIncident, ...prevIncidents].slice(0, 50)); 
      
      if (newIncident.status !== 'Resolved') {
        toast({
          title: (
            <div className="flex items-center gap-2">
              {getToastIcon(newIncident.status)}
              <span>New Alert: {newIncident.title}</span>
            </div>
          ),
          description: `${newIncident.location}`,
          variant: newIncident.status === 'Critical' ? 'destructive' : 'default',
        });

        // For map pop-up effect
        setNewlyAddedIncidentIds(prev => {
          const next = new Set(prev);
          next.add(newIncident.id);
          return next;
        });
        setTimeout(() => {
          setNewlyAddedIncidentIds(prev => {
            const next = new Set(prev);
            next.delete(newIncident.id);
            return next;
          });
        }, 7000); // Pop effect lasts 7 seconds
      }
    }, Math.random() * 5000 + 10000); 

    return () => clearInterval(interval);
  }, [toast]);

  const handleViewReport = useCallback(async (incident: Incident) => {
    setSelectedIncident(incident);
    setIsModalOpen(true);

    if (!incident.generatedSummary) {
      setIsLoadingAiSummary(true);
      try {
        const input: GenerateIncidentSummaryInput = {
          eventTitle: incident.title,
          location: incident.location,
          timestamp: incident.timestamp.toISOString(),
          aiAnalysis: incident.initialAISystemAnalysis || "Initial sensor data received.",
          actionsTaken: incident.initialActionsTaken || "Automated alerts initiated."
        };
        const result = await generateIncidentSummary(input);
        
        const summaryText = result?.summary;

        if (summaryText) {
          setIncidents(prevIncidents =>
            prevIncidents.map(i =>
              i.id === incident.id ? { ...i, generatedSummary: summaryText } : i
            )
          );
          setSelectedIncident(prevSelected => prevSelected ? {...prevSelected, generatedSummary: summaryText} : null);
        } else {
          console.error("AI summary was not found in the result or result was malformed:", result);
          toast({
            title: "AI Summary Error",
            description: "AI analysis did not return a valid summary.",
            variant: "destructive",
          });
          const errorMessage = "AI summary could not be generated or was invalid.";
          setIncidents(prevIncidents =>
            prevIncidents.map(i =>
              i.id === incident.id ? { ...i, generatedSummary: errorMessage } : i
            )
          );
          setSelectedIncident(prevSelected => prevSelected ? {...prevSelected, generatedSummary: errorMessage} : null);
        }

      } catch (error) {
        console.error("Failed to generate AI summary:", error);
        const errorMessage = "Error generating AI summary for this incident.";
        toast({
          title: "AI Summary Error",
          description: "Could not generate AI summary for this incident.",
          variant: "destructive",
        });
         setIncidents(prevIncidents =>
            prevIncidents.map(i =>
              i.id === incident.id ? { ...i, generatedSummary: errorMessage } : i
            )
          );
        setSelectedIncident(prevSelected => prevSelected ? {...prevSelected, generatedSummary: errorMessage} : null);
      } finally {
        setIsLoadingAiSummary(false);
      }
    }
  }, [toast]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedIncident(null);
  };

  const handleRefreshAlerts = () => {
    const refreshedIncidents = getInitialMockIncidents().slice(0, INITIAL_INCIDENTS_COUNT);
    setIncidents(refreshedIncidents);
    toast({
      title: "Alerts Refreshed",
      description: "Showing the latest incident data.",
    });
  };

  const handleManualAssignIncident = useCallback((incidentId: string, department: string, actionDescription: string) => {
    const newAction: IncidentAction = {
      timestamp: format(new Date(), 'HH:mm:ss'),
      description: actionDescription,
      assignedToDepartment: department,
    };

    setIncidents(prevIncidents =>
      prevIncidents.map(inc =>
        inc.id === incidentId
          ? { ...inc, actionLog: [...(inc.actionLog || []), newAction] }
          : inc
      )
    );

    setSelectedIncident(prevSelected =>
      prevSelected && prevSelected.id === incidentId
        ? { ...prevSelected, actionLog: [...(prevSelected.actionLog || []), newAction] }
        : prevSelected
    );

    toast({
      title: "Task Assigned",
      description: `Incident assigned to ${department}.`,
    });
  }, [toast]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow pt-16 flex flex-col">
        <KpiBar activeIncidents={activeIncidentsCount} />
        
        <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 p-4 md:p-6 overflow-hidden">
          <div className="lg:col-span-2 h-[60vh] lg:h-auto min-h-[400px]">
            <CityMap incidents={incidents} newlyAddedIncidentIds={newlyAddedIncidentIds} />
          </div>

          <div className="lg:col-span-1 h-[60vh] lg:h-auto min-h-[400px]">
            <LiveAlerts incidents={incidents} onViewReport={handleViewReport} onRefresh={handleRefreshAlerts} />
          </div>
        </div>
      </main>

      {selectedIncident && (
        <IncidentReportModal
          incident={selectedIncident}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          isLoadingAiSummary={isLoadingAiSummary}
          onManualAssign={handleManualAssignIncident}
          assignableDepartments={DEPARTMENTS_LIST}
        />
      )}
    </div>
  );
}
