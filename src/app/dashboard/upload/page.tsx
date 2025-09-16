// src/app/dashboard/upload/page.tsx
'use client';

import type React from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import Header from '@/components/dashboard/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileVideo, Bot, Loader2, Play, AlertCircle, Upload, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { analyzeVideoIncident } from '@/ai/flows/analyze-video-incident';
import type { AnalyzeVideoIncidentOutput } from '@/ai/flows/schemas/analyze-video-incident-schemas';
import { cn } from '@/lib/utils';


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

// Component for a single video analysis slot
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
        "h-full flex flex-col transition-all duration-300",
        slot.status === 'empty' && 'cursor-pointer hover:border-primary',
        slot.status === 'analyzing' && 'border-primary shadow-lg',
        slot.status === 'analyzed' && 'border-green-500',
        slot.status === 'error' && 'border-destructive'
      )}
      onClick={handleCardClick}
    >
      <CardContent className="p-2 flex-grow flex flex-col">
        <div className="aspect-video bg-muted/50 rounded-md overflow-hidden relative flex-grow">
          {slot.previewUrl ? (
            <video key={slot.previewUrl} src={slot.previewUrl} muted autoPlay loop className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
              <Upload className="h-10 w-10 mb-2" />
              <p className="text-sm font-semibold">Upload Video Feed</p>
              <p className="text-xs">Click to select a file</p>
            </div>
          )}
        </div>
        <div className="mt-2 p-2 rounded-md bg-background/50 border min-h-[100px] text-xs flex flex-col justify-center">
          {slot.status === 'analyzing' && (
            <div className="flex items-center text-muted-foreground animate-pulse">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <div>
                <p className="font-semibold">Analyzing...</p>
                <p className="text-xs">AI is processing the feed.</p>
              </div>
            </div>
          )}
          {slot.status === 'error' && (
            <div className="flex items-center text-destructive">
              <AlertCircle className="mr-2 h-4 w-4" />
              <div>
                <p className="font-semibold">Analysis Failed</p>
                <p className="text-xs truncate">{slot.error}</p>
              </div>
            </div>
          )}
           {slot.status === 'analyzed' && slot.analysisResult && (
            <div className="space-y-1">
                <p className="font-semibold text-foreground flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    Analysis Complete
                </p>
                <p><span className="font-medium text-muted-foreground">Type:</span> {slot.analysisResult.incidentType}</p>
                <p><span className="font-medium text-muted-foreground">Dept:</span> {slot.analysisResult.suggestedDepartment}</p>
                 <p className="truncate"><span className="font-medium text-muted-foreground">Report:</span> {slot.analysisResult.report}</p>
            </div>
          )}
          {(slot.status === 'empty' || slot.status === 'ready') && (
            <div className="text-muted-foreground text-center">
                <p className="font-semibold">{slot.status === 'empty' ? 'Awaiting Video' : 'Ready for Analysis'}</p>
                 <p className="text-xs">{slot.status === 'empty' ? 'Upload a video to begin.' : 'Analysis will start automatically.'}</p>
            </div>
          )}
        </div>
      </CardContent>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="video/mp4,video/webm"
      />
    </Card>
  );
};


export default function MultiCamAnalysisPage() {
  const [videoSlots, setVideoSlots] = useState<VideoSlot[]>(initialSlots);
  const { toast } = useToast();
  
  useEffect(() => {
    // This effect handles triggering the analysis when a slot becomes 'ready'
    const readySlot = videoSlots.find(slot => slot.status === 'ready' && slot.file);
    if (readySlot) {
      handleAnalyze(readySlot.id, readySlot.file);
    }
  }, [videoSlots]);

  useEffect(() => {
    // Clean up object URLs on unmount
    return () => {
      videoSlots.forEach(slot => {
        if (slot.previewUrl) {
          URL.revokeObjectURL(slot.previewUrl);
        }
      });
    };
  }, []); // Empty dependency array is correct here to run only on unmount.

  const handleFileSelect = useCallback((id: number, file: File) => {
    setVideoSlots(prevSlots => {
      const newSlots = [...prevSlots];
      const slotIndex = newSlots.findIndex(s => s.id === id);

      if (slotIndex !== -1) {
        // Revoke old URL if it exists to prevent memory leaks
        if (newSlots[slotIndex].previewUrl) {
          URL.revokeObjectURL(newSlots[slotIndex].previewUrl!);
        }

        newSlots[slotIndex] = {
          ...newSlots[slotIndex],
          file: file,
          previewUrl: URL.createObjectURL(file),
          status: 'ready', // Set status to 'ready' to trigger the useEffect
          error: null,
          analysisResult: null,
        };
      }
      return newSlots;
    });
  }, []);

  const handleAnalyze = async (id: number, file: File) => {
    // Set status to 'analyzing' immediately to prevent re-triggering
    setVideoSlots(prev => prev.map(s => s.id === id ? { ...s, status: 'analyzing' } : s));
    toast({ title: `Analysis Started for Feed ${id + 1}`, description: 'The video is being sent to the AI.' });

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
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = () => reject(new Error('Failed to read the video file.'));
        reader.onabort = () => reject(new Error('File reading was aborted.'));
      });

      reader.readAsDataURL(file);
      const result = await analysisPromise;

      setVideoSlots(prev => prev.map(s => s.id === id ? { ...s, status: 'analyzed', analysisResult: result } : s));
      toast({ title: `Analysis Complete for Feed ${id + 1}`, description: 'AI has finished analyzing the video.' });

    } catch (err: any) {
      console.error(`Error analyzing video for slot ${id}:`, err);
      const errorMessage = err.message || 'An unexpected error occurred.';
      setVideoSlots(prev => prev.map(s => s.id === id ? { ...s, status: 'error', error: errorMessage } : s));
      toast({
        title: `Analysis Error for Feed ${id + 1}`,
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow pt-16 flex flex-col p-4 md:p-6 space-y-6">
        <Card className='bg-card/50'>
            <CardHeader>
                <CardTitle>Multi-Camera Live Analysis</CardTitle>
                <CardDescription>Upload up to four video feeds for simultaneous AI analysis. Analysis begins automatically after upload.</CardDescription>
            </CardHeader>
        </Card>
        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {videoSlots.map(slot => (
            <VideoAnalysisSlot key={slot.id} slot={slot} onFileSelect={handleFileSelect} />
          ))}
        </div>
      </main>
    </div>
  );
}
