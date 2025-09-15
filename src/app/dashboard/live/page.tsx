
// src/app/dashboard/live/page.tsx
'use client';

import type React from 'react';
import { useState, useEffect, useRef } from 'react';
import Header from '@/components/dashboard/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Youtube, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

// Simulated real-time AI observations for the new video
const SIMULATED_AI_LOGS = [
  { time: 2, text: "AI System Initializing... Analyzing traffic camera feed.", tags: ['System'] },
  { time: 5, text: "Multiple vehicles detected: buses, cars, and auto-rickshaws.", tags: ['Vehicle', 'Traffic'] },
  { time: 8, text: "Pedestrian crosswalk is active. High foot traffic detected.", tags: ['Crowd', 'Pedestrian'] },
  { time: 12, text: "Vehicle detected: Red public bus (KL-15 registration) stopping at the bus stop.", tags: ['Vehicle', 'Public Transport'] },
  { time: 16, text: "Anomaly detected: A motorcycle is attempting to bypass traffic by driving on the shoulder.", tags: ['Traffic', 'Warning'] },
  { time: 21, text: "Traffic flow is currently heavy but moving. Monitoring for potential gridlock.", tags: ['Traffic'] },
  { time: 26, text: "Audio analysis: Normal city traffic sounds, horns, and chatter.", tags: ['Audio'] },
  { time: 31, text: "Motorcycle has merged back into traffic. Anomaly resolved.", tags: ['Traffic', 'Resolved'] },
  { time: 36, text: "Subject detected waiting at crosswalk for an extended period.", tags: ['Pedestrian'] },
  { time: 42, text: "Vehicle detected: White car, changing lanes without signaling.", tags: ['Vehicle', 'Minor Infraction'] },
  { time: 48, text: "Monitoring intersection for red light violations. None detected.", tags: ['System', 'Traffic'] },
  { time: 54, text: "A group of pedestrians is crossing against the signal.", tags: ['Pedestrian', 'Warning'] },
  { time: 60, text: "No collisions occurred. Pedestrians have crossed safely. Situation normal.", tags: ['Pedestrian', 'Resolved'] },
  { time: 68, text: "Bus has departed from the bus stop. Traffic flow resuming.", tags: ['Public Transport'] },
  { time: 75, text: "System check: All camera inputs are nominal. Weather: Clear skies.", tags: ['System'] },
  { time: 83, text: "Another bus approaching the intersection.", tags: ['Vehicle', 'Public Transport'] },
  { time: 92, text: "Analysis segment complete. Continuing to monitor live feed.", tags: ['System'] },
];

const getTagBadgeVariant = (tag: string) => {
  switch (tag.toLowerCase()) {
    case 'warning':
    case 'minor infraction':
      return 'destructive';
    case 'resolved':
      return 'default'; // Using primary color for resolved
    case 'system':
      return 'secondary';
    default:
      return 'outline';
  }
};

export default function LiveAnalysisPage() {
  const [logs, setLogs] = useState<{ text: string, tags: string[], timestamp: string }[]>([]);
  const [isClient, setIsClient] = useState(false);
  const logIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentLogIndexRef = useRef(0);
  const analysisScrollAreaRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    setIsClient(true);

    const startStreamingLogs = () => {
      if (logIntervalRef.current) clearInterval(logIntervalRef.current);

      logIntervalRef.current = setInterval(() => {
        if (currentLogIndexRef.current < SIMULATED_AI_LOGS.length) {
          const newLog = SIMULATED_AI_LOGS[currentLogIndexRef.current];
          setLogs(prevLogs => [...prevLogs, { 
            ...newLog,
            timestamp: new Date().toLocaleTimeString()
           }]);
          currentLogIndexRef.current++;
        } else {
          if (logIntervalRef.current) clearInterval(logIntervalRef.current);
        }
      }, 3000); // Add a new log every 3 seconds
    };

    // Delay start to simulate connection time
    const startTimeout = setTimeout(startStreamingLogs, 2000);

    return () => {
      clearTimeout(startTimeout);
      if (logIntervalRef.current) {
        clearInterval(logIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Auto-scroll the analysis log
     if (analysisScrollAreaRef.current) {
      const scrollElement = analysisScrollAreaRef.current.querySelector('div > div');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [logs]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow pt-16 flex items-start justify-center p-4 md:p-6">
        <Card className="w-full max-w-7xl shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Youtube className="text-primary" />
              Live Stream Analysis
            </CardTitle>
            <CardDescription>
              Simulating real-time AI analysis of a live video feed. The AI logs events and anomalies as they are detected.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: YouTube Video */}
            <div className="lg:col-span-2 space-y-4">
              <div className="aspect-video bg-muted rounded-md overflow-hidden relative border-2 border-primary">
                {isClient ? (
                  <iframe
                    width="100%"
                    height="100%"
                    src="https://www.youtube.com/embed/xIT71VDGM6o?autoplay=1&mute=1&controls=0&loop=1&playlist=xIT71VDGM6o"
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                     <Loader2 className="h-12 w-12 animate-spin" />
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: AI Analysis Log */}
            <div className="lg:col-span-1 flex flex-col">
              <Card className="bg-muted/30 flex-grow flex flex-col h-[60vh] lg:h-auto">
                <CardHeader className="py-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Bot className="h-5 w-5 text-primary" />
                    Real-Time AI Log
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex-grow overflow-hidden">
                  <ScrollArea className="h-full p-3" ref={analysisScrollAreaRef}>
                    <div className="space-y-4 text-sm">
                      {logs.map((log, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="text-muted-foreground font-mono text-xs pt-0.5">{log.timestamp}</div>
                          <div className="flex-1">
                            <p className="text-foreground">{log.text}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {log.tags.map(tag => (
                                <Badge key={tag} variant={getTagBadgeVariant(tag)} className="text-xs px-1.5 py-0.5">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                       {logs.length === 0 && (
                         <div className="flex items-center justify-center h-full text-muted-foreground">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Establishing connection to AI...
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

