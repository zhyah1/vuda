
'use client';

import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/dashboard/Header';
import KpiBar from '@/components/dashboard/KpiBar';
import CityMap from '@/components/dashboard/CityMap';
import LiveAlerts from '@/components/dashboard/LiveAlerts';
import IncidentReportModal from '@/components/dashboard/IncidentReportModal';
import type { Incident } from '@/lib/types';
import { generateMockIncident, getInitialMockIncidents, INITIAL_INCIDENTS_COUNT } from '@/lib/mockData';
import { generateIncidentSummary, type GenerateIncidentSummaryInput } from '@/ai/flows/summarize-incident';
import { useToast } from "@/hooks/use-toast";

export default function DashboardPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [activeIncidentsCount, setActiveIncidentsCount] = useState(0);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingAiSummary, setIsLoadingAiSummary] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIncidents(getInitialMockIncidents());
  }, []);
  
  useEffect(() => {
    const count = incidents.filter(inc => inc.status !== 'Resolved').length;
    setActiveIncidentsCount(count);
  }, [incidents]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newIncident = generateMockIncident();
      setIncidents(prevIncidents => [newIncident, ...prevIncidents].slice(0, 50)); // Keep max 50 incidents
       if (newIncident.status !== 'Resolved') {
        toast({
          title: `New Alert: ${newIncident.title}`,
          description: `${newIncident.location}`,
          variant: newIncident.status === 'Critical' ? 'destructive' : 'default',
        });
      }
    }, Math.random() * 5000 + 10000); // 10-15 seconds

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
        
        setIncidents(prevIncidents =>
          prevIncidents.map(i =>
            i.id === incident.id ? { ...i, generatedSummary: result.summary } : i
          )
        );
        setSelectedIncident(prevSelected => prevSelected ? {...prevSelected, generatedSummary: result.summary} : null);

      } catch (error) {
        console.error("Failed to generate AI summary:", error);
        toast({
          title: "AI Summary Error",
          description: "Could not generate AI summary for this incident.",
          variant: "destructive",
        });
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
    // Simulate refreshing data, e.g., by re-fetching or re-generating a few
    const refreshedIncidents = getInitialMockIncidents().slice(0, INITIAL_INCIDENTS_COUNT);
    setIncidents(refreshedIncidents);
    toast({
      title: "Alerts Refreshed",
      description: "Showing the latest incident data.",
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow pt-16 flex flex-col"> {/* pt-16 for fixed header height */}
        <KpiBar activeIncidents={activeIncidentsCount} />
        
        <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 p-4 md:p-6 overflow-hidden">
          {/* Left Column: City Map */}
          <div className="lg:col-span-2 h-[60vh] lg:h-auto min-h-[400px]">
            <CityMap incidents={incidents} />
          </div>

          {/* Right Column: Live Incident Feed */}
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
        />
      )}
    </div>
  );
}
