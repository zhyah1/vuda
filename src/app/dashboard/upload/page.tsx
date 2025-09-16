
// src/app/dashboard/upload/page.tsx
'use client';

import type React from 'react';
import { useState, useRef, useEffect } from 'react';
import Header from '@/components/dashboard/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileVideo, Bot, Loader2, Play, AlertCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { analyzeVideoIncident } from '@/ai/flows/analyze-video-incident';
import type { AnalyzeVideoIncidentOutput } from '@/ai/flows/schemas/analyze-video-incident-schemas';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeVideoIncidentOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Cleanup the object URL when the component unmounts or file changes
    return () => {
      if (videoPreviewUrl) {
        URL.revokeObjectURL(videoPreviewUrl);
      }
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
      resetState();
      setFile(selectedFile);
      setVideoPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };
  
  const resetState = () => {
      setFile(null);
      if(videoPreviewUrl) {
          URL.revokeObjectURL(videoPreviewUrl);
      }
      setVideoPreviewUrl(null);
      setIsAnalyzing(false);
      setAnalysisResult(null);
      setError(null);
       if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
  }

  const handleAnalyzeClick = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);
    toast({ title: 'Analysis Started', description: 'The video is being sent to the AI for analysis.' });

    try {
      const reader = new FileReader();
      const analysisPromise = new Promise<AnalyzeVideoIncidentOutput>((resolve, reject) => {
        reader.onloadend = async () => {
          try {
            const base64data = reader.result as string;
            const result = await analyzeVideoIncident({ videoDataUri: base64data });

            if (!result || !result.report) {
              throw new Error('Analysis failed to produce a valid report.');
            }
            resolve(result);
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = () => reject(new Error('Failed to read video file.'));
      });

      reader.readAsDataURL(file);
      const result = await analysisPromise;
      setAnalysisResult(result);
      toast({ title: 'Analysis Complete', description: 'AI has finished analyzing the video.' });

    } catch (err: any) {
      console.error('Error analyzing video:', err);
      const errorMessage = err.message || 'An unexpected error occurred during analysis.';
      setError(errorMessage);
      toast({
        title: 'Analysis Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow pt-16 flex flex-col items-center justify-start p-4 md:p-6 space-y-6">
        
        {!file && (
          <Card className="w-full max-w-lg text-center p-8 border-dashed border-2">
            <CardHeader>
              <FileVideo className="mx-auto h-16 w-16 text-muted-foreground" />
              <CardTitle>Comprehensive Video Analysis</CardTitle>
              <CardDescription>Upload a video to perform a full analysis. The entire video will be processed at once for a quick, comprehensive report.</CardDescription>
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
                  <video key={videoPreviewUrl} src={videoPreviewUrl} controls autoPlay muted loop className="w-full h-full object-cover"/>
                )}
              </div>
              <Card>
                <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button onClick={handleAnalyzeClick} disabled={isAnalyzing}>
                           {isAnalyzing ? <><Loader2 className="mr-2 animate-spin" />Analyzing...</> : <><Play className="mr-2" /> Analyze Video</>}
                        </Button>
                         <Button onClick={resetState} variant="ghost">
                           <XCircle className="mr-2" /> Clear
                        </Button>
                    </div>
                     <div className="text-sm text-muted-foreground">
                        File: {file.name}
                    </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: AI Analysis */}
            <div className="flex flex-col h-[60vh] lg:h-auto">
              <Card className="bg-muted/30 flex-grow flex flex-col">
                <CardHeader className="py-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Bot className="h-5 w-5 text-primary" />
                    AI Analysis Report
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 flex-grow flex items-center justify-center">
                    {isAnalyzing && (
                         <div className="flex flex-col items-center text-muted-foreground animate-pulse text-center">
                          <Loader2 className="mr-2 h-8 w-8 animate-spin mb-3" />
                          <p className="font-semibold">Analyzing video...</p>
                          <p className="text-xs">This may take a moment.</p>
                        </div>
                    )}
                    {!isAnalyzing && error && (
                         <div className="flex flex-col items-center text-destructive text-center">
                           <AlertCircle className="h-8 w-8 mb-3" />
                           <p className="font-semibold">Analysis Failed</p>
                           <p className="text-xs">{error}</p>
                         </div>
                    )}
                     {!isAnalyzing && !analysisResult && !error && (
                        <div className="text-center text-muted-foreground">
                            <p>Click "Analyze Video" to generate a report.</p>
                        </div>
                    )}
                    {analysisResult && (
                        <div className="w-full space-y-4 text-sm">
                           <div className="p-3 rounded-md bg-background/50 border">
                             <h4 className="font-semibold text-foreground mb-1">Incident Type: {analysisResult.incidentType}</h4>
                           </div>
                             <div className="p-3 rounded-md bg-background/50 border">
                             <h4 className="font-semibold text-foreground mb-1">Summary Report</h4>
                             <p className="text-muted-foreground whitespace-pre-wrap">{analysisResult.report}</p>
                           </div>
                            <div className="p-3 rounded-md bg-background/50 border">
                             <h4 className="font-semibold text-foreground mb-1">Suggested Department</h4>
                             <p className="text-muted-foreground">{analysisResult.suggestedDepartment}</p>
                           </div>
                        </div>
                    )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
