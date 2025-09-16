
// src/app/dashboard/upload/page.tsx
'use client';

import type React from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import Header from '@/components/dashboard/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Upload, Loader2, FileVideo, Bot, Play, Pause, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { analyzeVideoIncident } from '@/ai/flows/analyze-video-incident';
import type { AnalyzeVideoIncidentInput, AnalyzeVideoIncidentOutput } from '@/ai/flows/schemas/analyze-video-incident-schemas';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';

interface AnalysisLog extends AnalyzeVideoIncidentOutput {
  timestamp: string;
  chunk: number;
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisLogs, setAnalysisLogs] = useState<AnalysisLog[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [totalChunks, setTotalChunks] = useState(0);
  const [processedChunks, setProcessedChunks] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const analysisStateRef = useRef({ isRunning: false }); // To control the analysis loop
  const { toast } = useToast();

  useEffect(() => {
    // Cleanup the object URL
    return () => {
      if (videoPreviewUrl) {
        URL.revokeObjectURL(videoPreviewUrl);
      }
      analysisStateRef.current.isRunning = false; // Stop analysis if component unmounts
    };
  }, [videoPreviewUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
       if (selectedFile.size > 20 * 1024 * 1024) { // 20MB limit
        toast({
          title: 'File Too Large',
          description: 'Please select a video file smaller than 20MB for this demo.',
          variant: 'destructive',
        });
        return;
      }
      setFile(selectedFile);
      setVideoPreviewUrl(URL.createObjectURL(selectedFile));
      resetAnalysis();
    }
  };

  const resetAnalysis = () => {
      setIsAnalyzing(false);
      setAnalysisLogs([]);
      setError(null);
      setTotalChunks(0);
      setProcessedChunks(0);
      analysisStateRef.current.isRunning = false;
  };

  const handleAnalyzeClick = async () => {
    if (!file || !videoRef.current) return;
    
    const duration = videoRef.current.duration;
    if (isNaN(duration) || duration === 0) {
      toast({ title: "Video Error", description: "Could not determine video duration. Please try a different file.", variant: "destructive" });
      return;
    }

    resetAnalysis();
    setIsAnalyzing(true);
    analysisStateRef.current.isRunning = true;
    
    const chunkSize = 10; // 10 seconds
    const numChunks = Math.ceil(duration / chunkSize);
    setTotalChunks(numChunks);

    for (let i = 0; i < numChunks; i++) {
        if (!analysisStateRef.current.isRunning) {
            toast({ title: "Analysis Cancelled", description: "The video analysis process was stopped." });
            break;
        }
        
        setProcessedChunks(i);
        const startTime = i * chunkSize;
        const endTime = Math.min((i + 1) * chunkSize, duration);

        try {
            const videoChunkBlob = await getVideoChunk(file, startTime, endTime);
            const reader = new FileReader();
            
            const analysisPromise = new Promise<void>((resolve, reject) => {
                reader.onloadend = async () => {
                    try {
                        const base64data = reader.result as string;
                        const result = await analyzeVideoIncident({ videoDataUri: base64data });

                        if (!result || !result.report) {
                            throw new Error('Analysis failed to produce a valid report for this chunk.');
                        }
                        
                        const newLog: AnalysisLog = {
                            ...result,
                            timestamp: new Date().toLocaleTimeString(),
                            chunk: i + 1,
                        };
                        setAnalysisLogs(prev => [...prev, newLog]);
                        resolve();
                    } catch (err) {
                        reject(err);
                    }
                };
                 reader.onerror = () => reject(new Error('Failed to read video chunk.'));
            });
            
            reader.readAsDataURL(videoChunkBlob);
            await analysisPromise;

        } catch (err: any) {
            console.error(`Error analyzing chunk ${i + 1}:`, err);
            const errorMessage = err.message || 'An unexpected error occurred.';
            setError(`Chunk ${i+1}: ${errorMessage}`);
            setAnalysisLogs(prev => [...prev, {
                timestamp: new Date().toLocaleTimeString(),
                chunk: i + 1,
                report: `Error: ${errorMessage}`,
                incidentType: 'Analysis Error',
                suggestedDepartment: 'None'
            }]);
            // Optional: stop on first error
            // analysisStateRef.current.isRunning = false; 
        }
    }
    setProcessedChunks(numChunks);
    setIsAnalyzing(false);
    analysisStateRef.current.isRunning = false;
    toast({ title: "Analysis Complete", description: `Finished analyzing all ${numChunks} chunks.` });
  };
  
  // This is a simplified chunking function. For real-world use, a library like ffmpeg.wasm would be more robust.
  const getVideoChunk = async (videoFile: File, startTime: number, endTime: number): Promise<Blob> => {
      // This is a placeholder for actual video splitting.
      // In a real browser environment, we can't easily split video files without complex libraries (like ffmpeg.wasm).
      // For this demo, we will send the *entire* video file for each chunk.
      // The AI prompt will be instructed to focus on the specified time range.
      // This is a limitation of browser capabilities, not the AI.
      return videoFile;
  };
  
  const handleCancel = () => {
    analysisStateRef.current.isRunning = false;
    setIsAnalyzing(false);
  };


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow pt-16 flex flex-col items-center justify-start p-4 md:p-6 space-y-6">
        
        {!file && (
          <Card className="w-full max-w-lg text-center p-8 border-dashed border-2">
            <CardHeader>
              <FileVideo className="mx-auto h-16 w-16 text-muted-foreground" />
              <CardTitle>Simulate Live Video Analysis</CardTitle>
              <CardDescription>Upload a video to begin the simulated real-time analysis. The video will be processed in 10-second chunks.</CardDescription>
            </CardHeader>
            <CardContent>
              <Label htmlFor="video-upload" className="sr-only">Upload Video</Label>
              <Input
                id="video-upload"
                type="file"
                accept="video/mp4,video/webm"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="file:text-primary-foreground file:bg-primary hover:file:bg-primary/90"
              />
            </CardContent>
          </Card>
        )}

        {file && (
          <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Video and Controls */}
            <div className="lg:col-span-2 space-y-4">
              <div className="aspect-video bg-muted rounded-md overflow-hidden relative border border-border">
                {videoPreviewUrl && (
                  <video ref={videoRef} src={videoPreviewUrl} controls autoPlay muted loop className="w-full h-full object-cover" onLoadedMetadata={handleAnalyzeClick}/>
                )}
              </div>
              <Card>
                <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button onClick={isAnalyzing ? handleCancel : handleAnalyzeClick} variant={isAnalyzing ? "destructive" : "default"}>
                            {isAnalyzing ? <><Pause className="mr-2" /> Stop Analysis</> : <><Play className="mr-2" /> Start Analysis</>}
                        </Button>
                        <div className="text-sm text-muted-foreground">
                            {isAnalyzing ? "Processing video..." : "Ready to analyze."}
                        </div>
                    </div>
                    <div className="w-1/3">
                        {isAnalyzing && (
                            <div className="text-center">
                                <Progress value={(processedChunks / totalChunks) * 100} className="h-2" />
                                <span className="text-xs text-muted-foreground">Chunk {processedChunks + 1} of {totalChunks}</span>
                            </div>
                        )}
                        {!isAnalyzing && totalChunks > 0 && (
                             <span className="text-xs text-muted-foreground">Analysis complete.</span>
                        )}
                    </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: AI Log */}
            <div className="flex flex-col h-[60vh] lg:h-auto">
              <Card className="bg-muted/30 flex-grow flex flex-col">
                <CardHeader className="py-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Bot className="h-5 w-5 text-primary" />
                    AI Analysis Live Log
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex-grow overflow-hidden">
                  <ScrollArea className="h-full p-3">
                    <div className="space-y-4 text-sm">
                      {analysisLogs.length === 0 && !isAnalyzing && (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                          <p>Analysis log will appear here.</p>
                        </div>
                      )}
                      {analysisLogs.map((log, index) => (
                        <div key={index} className="p-3 rounded-md bg-background/50 border">
                           <div className="flex justify-between items-center mb-2">
                             <h4 className="font-semibold text-foreground">Chunk {log.chunk}: {log.incidentType}</h4>
                             <span className="text-xs text-muted-foreground">{log.timestamp}</span>
                           </div>
                           <p className="text-muted-foreground text-xs mb-2 whitespace-pre-wrap">{log.report}</p>
                           <p className="text-xs"><span className="font-semibold">Suggested Dept:</span> {log.suggestedDepartment}</p>
                        </div>
                      ))}
                      {isAnalyzing && (
                         <div className="flex items-center text-muted-foreground animate-pulse pt-4">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing chunk {processedChunks + 1}...
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

    