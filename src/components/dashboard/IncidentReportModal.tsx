
'use client';
import type React from 'react';
import Image from 'next/image';
import type { Incident } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, CheckCircle, Info, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface IncidentReportModalProps {
  incident: Incident | null;
  isOpen: boolean;
  onClose: () => void;
  isLoadingAiSummary: boolean;
}

const IncidentReportModal: React.FC<IncidentReportModalProps> = ({ incident, isOpen, onClose, isLoadingAiSummary }) => {
  if (!incident) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="fixed top-0 left-0 w-screen h-screen max-w-none sm:rounded-none translate-x-0 translate-y-0 flex flex-col bg-background border-0 shadow-2xl p-0">
        <DialogHeader className="p-4 border-b border-border flex-shrink-0">
          <DialogTitle className="text-xl font-semibold text-primary">{incident.title}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {incident.location} - {new Date(incident.timestamp).toLocaleString()}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-grow overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
            {/* Left Column: Video Feed Placeholder & Action Log */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Camera Feed</h3>
                <div className="aspect-video bg-muted rounded-md overflow-hidden relative border border-border">
                  <Image 
                    src={incident.cameraImage || "https://placehold.co/600x400.png"} 
                    alt="Incident camera feed placeholder" 
                    layout="fill"
                    objectFit="cover"
                    data-ai-hint="street security camera"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Action Log</h3>
                <ScrollArea className="h-48 border border-border rounded-md p-3 bg-muted/30">
                  {incident.actionLog && incident.actionLog.length > 0 ? (
                    <ul className="space-y-2">
                      {incident.actionLog.map((action, index) => (
                        <li key={index} className="text-xs text-muted-foreground flex items-start">
                          <CheckCircle className="h-3 w-3 text-success mr-2 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-medium text-foreground/90">{action.timestamp}</span>: {action.description}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-muted-foreground">No actions logged yet.</p>
                  )}
                </ScrollArea>
              </div>
            </div>

            {/* Right Column: AI Analysis */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center">
                  <Info className="h-5 w-5 mr-2 text-primary" />
                  VUDA AI Analysis
                </h3>
                <div className="p-4 border border-border rounded-md bg-muted/30 min-h-[200px]">
                  {isLoadingAiSummary ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <div className="flex justify-center items-center pt-4">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <p className="ml-2 text-sm text-muted-foreground">Generating summary...</p>
                      </div>
                    </div>
                  ) : incident.generatedSummary ? (
                    <p className="text-sm text-foreground whitespace-pre-wrap">{incident.generatedSummary}</p>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                       <AlertTriangle className="h-8 w-8 text-accent mb-2" />
                      <p className="text-sm text-muted-foreground">AI summary not available or not yet generated for this incident.</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Incident Details</h3>
                <div className="p-4 border border-border rounded-md bg-muted/30 text-sm">
                  <p><span className="font-medium text-muted-foreground">Type:</span> {incident.type}</p>
                  <p><span className="font-medium text-muted-foreground">Status:</span> {incident.status}</p>
                  <p><span className="font-medium text-muted-foreground">Initial AI System Analysis:</span> {incident.initialAISystemAnalysis || "N/A"}</p>
                  <p><span className="font-medium text-muted-foreground">Initial Actions Taken:</span> {incident.initialActionsTaken || "N/A"}</p>
                </div>
              </div>

            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="p-4 border-t border-border flex-shrink-0">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default IncidentReportModal;
