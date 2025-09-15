// src/app/dashboard/upload/page.tsx
'use client';

import type React from 'react';
import { useState, useRef } from 'react';
import Header from '@/components/dashboard/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Upload, Loader2, FileVideo, AlertCircle, Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { analyzeVideoIncident } from '@/ai/flows/analyze-video-incident';
import type { AnalyzeVideoIncidentInput, AnalyzeVideoIncidentOutput } from '@/ai/flows/schemas/analyze-video-incident-schemas';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeVideoIncidentOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      setFile(selectedFile);
      setAnalysisResult(null);
      setError(null);
    }
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
            toast({
              title: 'Analysis Complete',
              description: 'The video has been successfully analyzed.',
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
      <main className="flex-grow pt-16 flex items-center justify-center p-4 md:p-6">
        <Card className="w-full max-w-2xl shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Upload className="text-primary" />
              Upload & Analyze Incident Video
            </CardTitle>
            <CardDescription>
              Select a video file from your device. The AI will analyze it to generate a report and suggest the appropriate response department.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex-col items-stretch gap-4">
            <Button onClick={handleAnalyzeClick} disabled={isLoading || !file} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Video...
                </>
              ) : (
                'Analyze Video'
              )}
            </Button>
            
            {analysisResult && (
              <Card className="mt-4 bg-muted/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                     <Bot className="h-6 w-6 text-primary" />
                    AI Analysis Report
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
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
              </Card>
            )}
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
