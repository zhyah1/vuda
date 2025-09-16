// src/app/dashboard/monitoring/page.tsx
'use client';

import type React from 'react';
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import Header from '@/components/dashboard/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { FileVideo, Bot, Loader2, Play, AlertCircle, Upload, CheckCircle, Map, BarChart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { analyzeVideoIncident } from '@/ai/flows/analyze-video-incident';
import type { AnalyzeVideoIncidentOutput } from '@/ai/flows/schemas/analyze-video-incident-schemas';
import { cn } from '@/lib/utils';
import CityMap from '@/components/dashboard/CityMap';
import type { Incident } from '@/lib/types';
import { getInitialMockIncidents } from '@/lib/mockData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock chart data
const initialChartData = [
  { time: '10:00', anomalies: 0 },
  { time: '10:05', anomalies: 0 },
  { time: '10:10', anomalies: 0 },
  { time: '10:15', anomalies: 0 },
  { time: '10:20', anomalies: 0 },
  { time: '10:25', anomalies: 0 },
];

interface VideoSlot {
  id: number;
  file: File | null;
  previewUrl: string | null;
  analysisResult: AnalyzeVideoIncidentOutput | null;
  error: string | null;
  status: 'empty' | 'ready' | 'analyzing' | 'analyzed' | 'error';
}

const initialSlots: VideoSlot[] = Array.from({ length: 4 }, (_, i) => ({
  id: i,
  file: null,
  previewUrl: null,
  analysisResult: null,
  error: null,
  status: 'empty',
}));

// Video Slot Component
const VideoAnalysisSlot: React.FC<{
  slot: VideoSlot;
  onFileSelect: (id: number, file: File) => void;
}> = ({ slot, onFileSelect }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 20 * 1024 * 1024) { // 20MB limit
         alert('File is too large. Please select a file smaller than 20MB.');
        return;
      }
      onFileSelect(slot.id, selectedFile);
    }
  };

  const handleCardClick = () => {
    if (slot.status === 'empty') {
      fileInputRef.current?.click();
    }
  };

  return (
    <Card 
      className={cn(
        "h-full w-full flex flex-col transition-all duration-300 relative aspect-video",
        slot.status === 'empty' && 'cursor-pointer hover:border-primary',
        slot.status === 'analyzing' && 'border-primary shadow-lg',
        slot.status === 'analyzed' && 'border-green-500',
        slot.status === 'error' && 'border-destructive'
      )}
      onClick={handleCardClick}
    >
      <div className="w-full h-full bg-muted/50 rounded-md overflow-hidden relative flex items-center justify-center">
        {slot.previewUrl ? (
          <video key={slot.previewUrl} src={slot.previewUrl} muted autoPlay loop className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center justify-center text-muted-foreground">
            <Upload className="h-8 w-8 mb-1" />
            <p className="text-xs font-semibold">Upload Feed</p>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-1.5 text-white text-xs">
          {slot.status === 'analyzing' && <p className="animate-pulse">Analyzing...</p>}
          {slot.status === 'error' && <p className="text-destructive-foreground">Error</p>}
          {slot.status === 'analyzed' && slot.analysisResult && <p className="truncate text-green-300">{slot.analysisResult.incidentType}</p>}
          {(slot.status === 'empty' || slot.status === 'ready') && <p>Awaiting Video</p>}
        </div>

      </div>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="video/mp4,video/webm" />
    </Card>
  );
};


// Main Page Component
export default function MonitoringPage() {
  const [videoSlots, setVideoSlots] = useState<VideoSlot[]>(initialSlots);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [chartData, setChartData] = useState(initialChartData);
  const { toast } = useToast();

  useEffect(() => {
    setIncidents(getInitialMockIncidents());
  }, []);

  const handleAnalyze = useCallback(async (id: number, file: File) => {
    setVideoSlots(prev => prev.map(s => s.id === id ? { ...s, status: 'analyzing' } : s));
    toast({ title: `Analysis Started for Feed ${id + 1}` });

    try {
      const reader = new FileReader();
      const analysisPromise = new Promise<AnalyzeVideoIncidentOutput>((resolve, reject) => {
        reader.onloadend = async () => {
          try {
            const base64data = reader.result as string;
            const result = await analyzeVideoIncident({ videoDataUri: base64data });
            if (!result || !result.report) {
              throw new Error('AI analysis failed to produce a valid report.');
            }
            resolve(result);
          } catch (err) { reject(err); }
        };
        reader.onerror = () => reject(new Error('Failed to read video file.'));
        reader.readAsDataURL(file);
      });
      
      const result = await analysisPromise;

      setVideoSlots(prev => prev.map(s => s.id === id ? { ...s, status: 'analyzed', analysisResult: result } : s));
      
      if(result.incidentType !== 'Normal') {
          toast({ 
              title: `Alert from Feed ${id + 1}: ${result.incidentType}`, 
              description: result.report,
              variant: 'destructive'
          });
           // Update chart data
          const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
          setChartData(prev => [...prev.slice(-5), { time, anomalies: (prev.at(-1)?.anomalies ?? 0) + 1 }]);
      } else {
         toast({ title: `Analysis Complete for Feed ${id + 1}`, description: 'No significant events detected.' });
         const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
         setChartData(prev => [...prev.slice(-5), { time, anomalies: prev.at(-1)?.anomalies ?? 0 }]);
      }

    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred during analysis.';
      setVideoSlots(prev => prev.map(s => s.id === id ? { ...s, status: 'error', error: errorMessage } : s));
      toast({ title: `Analysis Error for Feed ${id + 1}`, description: errorMessage, variant: 'destructive' });
    }
  }, [toast]);

  useEffect(() => {
    const readySlot = videoSlots.find(slot => slot.status === 'ready' && slot.file);
    if (readySlot) {
      handleAnalyze(readySlot.id, readySlot.file as File);
    }
  }, [videoSlots, handleAnalyze]);

  const handleFileSelect = useCallback((id: number, file: File) => {
    setVideoSlots(prevSlots => {
      const newSlots = [...prevSlots];
      const slotIndex = newSlots.findIndex(s => s.id === id);

      if (slotIndex !== -1) {
        if (newSlots[slotIndex].previewUrl) {
          URL.revokeObjectURL(newSlots[slotIndex].previewUrl!);
        }
        newSlots[slotIndex] = {
          ...newSlots[slotIndex],
          file: file,
          previewUrl: URL.createObjectURL(file),
          status: 'ready',
          error: null,
          analysisResult: null,
        };
      }
      return newSlots;
    });
  }, []);

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow pt-16 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-64 flex-shrink-0 bg-card border-r border-border p-4 flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Controls</h3>
            <Calendar
                mode="single"
                selected={new Date()}
                className="rounded-md border"
            />
            <div className="space-y-2">
                <Label>Time</Label>
                <div className="flex gap-2">
                    <Input type="time" defaultValue="00:00:00" />
                    <Input type="time" defaultValue="23:59:59" />
                </div>
            </div>
             <div className="space-y-2">
                <Label>Video Type</Label>
                <RadioGroup defaultValue="normal">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="normal" id="r1" />
                        <Label htmlFor="r1">Normal</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="alarm" id="r2" />
                        <Label htmlFor="r2">Alarm</Label>
                    </div>
                </RadioGroup>
            </div>
             <div className="space-y-2">
                <Label>Search Device</Label>
                <Input placeholder="Device ID..." />
            </div>
            <Button>Search</Button>
        </div>

        {/* Main Content */}
        <div className="flex-grow p-4 grid grid-cols-2 grid-rows-2 gap-4">
           {videoSlots.map(slot => (
            <VideoAnalysisSlot key={slot.id} slot={slot} onFileSelect={handleFileSelect} />
          ))}
        </div>

        {/* Right Sidebar */}
        <div className="w-80 flex-shrink-0 bg-card border-l border-border p-4 flex flex-col gap-4">
            <Card className="flex-[2_2_0%] flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg"><Map className="h-5 w-5"/> Map</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow p-0">
                    <CityMap incidents={incidents} newlyAddedIncidentIds={new Set()} />
                </CardContent>
            </Card>
             <Card className="flex-[1_1_0%] flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg"><BarChart className="h-5 w-5"/> Analysis</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}/>
                      <Line type="monotone" dataKey="anomalies" stroke="hsl(var(--primary))" strokeWidth={2} name="Anomalies" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
