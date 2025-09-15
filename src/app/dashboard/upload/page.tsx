
// src/app/dashboard/upload/page.tsx
'use client';

import type React from 'react';
import { useState, useRef, useEffect } from 'react';
import Header from '@/components/dashboard/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Upload, Loader2, FileVideo, AlertCircle, Bot, Siren } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { analyzeVideoIncident } from '@/ai/flows/analyze-video-incident';
import type { AnalyzeVideoIncidentInput, AnalyzeVideoIncidentOutput } from '@/ai/flows/schemas/analyze-video-incident-schemas';
import type { Incident, IncidentAction } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';


// This is a simplified context/store for sharing state between pages.
// In a larger app, consider Zustand or React Context with a provider in the layout.
let lastUploadedIncident: Incident | null = null;
export const setLastUploadedIncident = (incident: Incident | null) => {
  lastUploadedIncident = incident;
};
export const getLastUploadedIncident = () => {
    const incident = lastUploadedIncident;
    lastUploadedIncident = null; // Consume the incident
    return incident;
};


export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeVideoIncidentOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();
  const router = useRouter();


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
          description: 'Please select a video file smaller than 20MB.',
          variant: 'destructive',
        });
        setFile(null);
        setVideoPreviewUrl(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      setFile(selectedFile);
      setAnalysisResult(null);
      setError(null);
      
      const url = URL.createObjectURL(selectedFile);
      setVideoPreviewUrl(url);
    }
  };

  const createIncidentFromAnalysis = (analysis: AnalyzeVideoIncidentOutput): Incident => {
    return {
      id: `vid-upload-${Date.now()}`,
      type: analysis.incidentType as Incident['type'],
      title: `Uploaded Video: ${analysis.incidentType}`,
      location: 'Uploaded Video Analysis',
      timestamp: new Date(),
      status: 'Critical', // Assume all uploaded videos are critical for now
      latitude: 8.5241 + (Math.random() - 0.5) * 0.1, // Randomize coords around Thiruvananthapuram
      longitude: 76.9366 + (Math.random() - 0.5) * 0.1,
      cameraImage: 'https://placehold.co/600x400.png?text=From+Upload', // Placeholder
      initialAISystemAnalysis: analysis.report,
      initialActionsTaken: 'Manual analysis initiated via video upload.',
      actionLog: [{ timestamp: new Date().toLocaleTimeString(), description: 'Incident created from video upload.' }],
    };
  };

  const handleDispatchPolice = () => {
    if (!analysisResult) return;

    // Here you would typically call another function to actually dispatch police.
    // For this demo, we'll just show a toast.
    toast({
        title: "Police Dispatched",
        description: `Alert sent to Police department for incident: ${analysisResult.incidentType}`,
    });

    const incident = createIncidentFromAnalysis(analysisResult);
    const policeAction: IncidentAction = {
        timestamp: new Date().toLocaleTimeString(),
        description: 'Operator dispatched Police unit.',
        assignedToDepartment: 'Police',
    };
    incident.actionLog?.push(policeAction);

    setLastUploadedIncident(incident);
    router.push('/dashboard');
};

  const handleAnalyzeClick = async () => {
    if (!file) {
      toast({
        title: 'No File Selected',
        description: 'Please select a video file to analyze.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    const reader = new FileReader();
    
    reader.onloadend = async () => {
        try {
            const base64data = reader.result as string;
            
            const input: AnalyzeVideoIncidentInput = {
              videoDataUri: base64data,
            };

            const result = await analyzeVideoIncident(input);

            if (!result || !result.report) {
                throw new Error('Analysis failed to produce a valid report.');
            }

            setAnalysisResult(result);

            // Create a new incident and navigate back to the dashboard
            const newIncident = createIncidentFromAnalysis(result);
            setLastUploadedIncident(newIncident); // "send" it to the dashboard page
            
            toast({
              title: 'Analysis Complete & Alert Raised',
              description: 'The incident has been added to the Live Alerts feed.',
              action: (
                <Button variant="outline" size="sm" onClick={() => router.push('/dashboard')}>
                    View Dashboard
                </Button>
              ),
            });

        } catch (err: any) {
            console.error('Analysis error:', err);
            const errorMessage = err.message || 'An unexpected error occurred during analysis.';
            setError(errorMessage);
            toast({
              title: 'Analysis Failed',
              description: errorMessage,
              variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    reader.onerror = () => {
        console.error('File reading error');
        setError('Failed to read the file.');
        toast({
            title: 'File Read Error',
            description: 'Could not read the selected file.',
            variant: 'destructive',
        });
        setIsLoading(false);
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow pt-16 flex items-start justify-center p-4 md:p-6">
        <Card className="w-full max-w-4xl shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Upload className="text-primary" />
              Upload & Analyze Incident Video
            </CardTitle>
            <CardDescription>
              Select a video file to simulate a live feed. The AI will analyze it to generate a report, suggest a response, and create an alert on the dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Upload and Preview */}
            <div className="space-y-4">
               <div className="space-y-2">
                <Label htmlFor="video-upload">Video File</Label>
                <Input
                  id="video-upload"
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  className="file:text-primary-foreground file:bg-primary hover:file:bg-primary/90"
                  disabled={isLoading}
                />
              </div>
              
              <div className="aspect-video bg-muted rounded-md overflow-hidden relative border border-border">
                {videoPreviewUrl ? (
                    <video ref={videoRef} src={videoPreviewUrl} controls autoPlay muted loop className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <FileVideo className="h-12 w-12" />
                    </div>
                )}
              </div>
              
              {file && (
                <Alert variant="default" className="flex items-center gap-4">
                  <FileVideo className="h-6 w-6 text-primary" />
                  <div>
                    <AlertTitle>{file.name}</AlertTitle>
                    <AlertDescription>
                      {(file.size / 1024 / 1024).toFixed(2)} MB - Ready for analysis.
                    </AlertDescription>
                  </div>
                </Alert>
              )}
            </div>

            {/* Right Column: Analysis Results */}
            <div className="flex flex-col">
              <Button onClick={handleAnalyzeClick} disabled={isLoading || !file} className="w-full mb-4">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing Video...
                  </>
                ) : (
                  'Analyze and Create Alert'
                )}
              </Button>
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {analysisResult && (
                <Card className="mt-4 bg-muted/30 flex-grow flex flex-col">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                       <Bot className="h-6 w-6 text-primary" />
                      AI Analysis Report
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm flex-grow">
                     <div>
                      <h4 className="font-semibold text-foreground">Incident Type</h4>
                      <p className="text-muted-foreground">{analysisResult.incidentType}</p>
                     </div>
                     <Separator />
                     <div>
                      <h4 className="font-semibold text-foreground">Generated Report</h4>
                      <p className="text-muted-foreground whitespace-pre-wrap">{analysisResult.report}</p>
                     </div>
                     <Separator />
                     <div>
                      <h4 className="font-semibold text-foreground">Suggested Department</h4>
                      <Badge variant="secondary" className="text-base">{analysisResult.suggestedDepartment}</Badge>
                     </div>
                  </CardContent>
                   <CardFooter>
                    <Button variant="destructive" className="w-full" onClick={handleDispatchPolice}>
                        <Siren className="mr-2 h-4 w-4" />
                        Dispatch Police
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
