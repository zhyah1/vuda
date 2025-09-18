
// src/app/dashboard/monitoring/page.tsx
'use client';

import type React from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import Header from '@/components/dashboard/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload, Video, Loader2, Bot, Send, AlertTriangle, MessageSquare, ShieldAlert, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { analyzeVideoIncident } from '@/ai/flows/analyze-video-incident';
import type { AnalyzeVideoIncidentOutput } from '@/ai/flows/schemas/analyze-video-incident-schemas';
import { chatWithFeed, type ChatWithFeedInput } from '@/ai/flows/chat-with-feed-flow';
import type { ChatMessage, Incident } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface VideoFile {
  id: string;
  file: File;
  previewUrl: string;
  analysisResult: AnalyzeVideoIncidentOutput | null;
  error: string | null;
  status: 'pending' | 'analyzing' | 'analyzed' | 'error';
  chatHistory: ChatMessage[];
}

type IncidentPriority = 'Critical' | 'High' | 'Medium';

const incidentPriorities: { [key: string]: IncidentPriority } = {
  // Critical
  'Weapon_Visible': 'Critical', 'Hostage_Situation': 'Critical', 'Person_Collapsed': 'Critical',
  'Unconscious_Person': 'Critical', 'Explosion_Or_Smoke': 'Critical', 'Arson': 'Critical',
  'Child_Abduction_Attempt': 'Critical', 'Building_Collapse_Risk': 'Critical', 'Active_Shooter': 'Critical',
  'Hit_And_Run': 'Critical', 'Fire_Outbreak': 'Critical',

  // High
  'Physical_Assault': 'High', 'Fighting': 'High', 'Seizure_Activity': 'High',
  'Crowd_Stampede': 'High', 'Riots_Or_Protest_Violence': 'High', 'Reckless_Driving': 'High',
  'Accident_With_Injuries': 'High', 'Burglary_In_Progress': 'High', 'Robbery': 'High',
  'Elderly_Person_Fallen': 'High', 'Gas_Leak_Suspected': 'High', 'Electrical_Spark_Hazard': 'High',

  // Medium
  'Vandalism_In_Progress': 'Medium', 'Loitering_With_Intent': 'Medium', 'Unauthorized_Access': 'Medium',
  'Shoplifting': 'Medium', 'Pedestrian_In_Danger': 'Medium', 'Public_Intoxication': 'Medium',
  'Harassment': 'Medium', 'Lost_Child': 'Medium'
};


// Main Page Component
export default function MonitoringPage() {
  const [videoFiles, setVideoFiles] = useState<VideoFile[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoFile | null>(null);
  const [currentChatMessage, setCurrentChatMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatScrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatScrollAreaRef.current) {
      const scrollElement = chatScrollAreaRef.current.querySelector('div > div'); 
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [selectedVideo?.chatHistory]);

  const addMessageToChat = (video: VideoFile, message: Omit<ChatMessage, 'id' | 'timestamp'>): VideoFile => {
    const newMessage: ChatMessage = {
      ...message,
      id: `${message.sender}-${Date.now()}`,
      timestamp: new Date(),
    };
    return { ...video, chatHistory: [...video.chatHistory, newMessage] };
  };

  const updateVideoFile = (updatedVideo: VideoFile) => {
    setVideoFiles(prev => prev.map(v => v.id === updatedVideo.id ? updatedVideo : v));
    if (selectedVideo?.id === updatedVideo.id) {
      setSelectedVideo(updatedVideo);
    }
  };

  const getToastInfo = (incidentType: string): { variant: 'destructive' | 'accent' | 'default', icon: React.ReactNode } => {
    const priority = incidentPriorities[incidentType] || 'Medium';
    switch (priority) {
      case 'Critical':
        return { variant: 'destructive', icon: <ShieldAlert className="h-5 w-5" /> };
      case 'High':
        return { variant: 'accent', icon: <AlertTriangle className="h-5 w-5" /> };
      default: // Medium
        return { variant: 'default', icon: <Info className="h-5 w-5" /> };
    }
  };

  const handleAnalyze = useCallback(async (videoToAnalyze: VideoFile) => {
    let video = { ...videoToAnalyze, status: 'analyzing' as const, error: null };
    video = addMessageToChat(video, { sender: 'ai', text: `Analyzing video: ${video.file.name}` });
    updateVideoFile(video);
    setSelectedVideo(video); // Make sure the selected video reflects the analyzing state.

    try {
      const reader = new FileReader();
      const analysisPromise = new Promise<AnalyzeVideoIncidentOutput>((resolve, reject) => {
        reader.onloadend = async () => {
          try {
            const base64data = reader.result as string;
            const result = await analyzeVideoIncident({ videoDataUri: base64data });
             if (!result || typeof result.isSignificant !== 'boolean' || typeof result.incidentType !== 'string') {
                throw new Error('The AI model returned an invalid data structure.');
            }
            resolve(result);
          } catch (err) { reject(err); }
        };
        reader.onerror = () => reject(new Error('Failed to read video file.'));
        reader.readAsDataURL(video.file);
      });
      
      const result = await analysisPromise;

      let analyzedVideo = { ...video, status: 'analyzed' as const, analysisResult: result };
      
      if(result.isSignificant) {
        const { variant, icon } = getToastInfo(result.incidentType);
        toast({ 
            title: (
              <div className="flex items-center gap-2">
                {icon}
                <span>New Alert: {result.incidentType.replace(/_/g, ' ')}</span>
              </div>
            ), 
            description: `From video: ${analyzedVideo.file.name}`,
            variant: variant as 'destructive' | 'accent' | 'default',
        });
        analyzedVideo = addMessageToChat(analyzedVideo, { sender: 'ai', text: `Anomaly Detected: ${result.incidentType.replace(/_/g, ' ')}` });
      } else {
         analyzedVideo = addMessageToChat(analyzedVideo, { sender: 'ai', text: `Analysis complete. No significant anomalies detected.` });
      }
      updateVideoFile(analyzedVideo);
      setSelectedVideo(analyzedVideo);

    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred during analysis.';
      let errorVideo = { ...video, status: 'error' as const, error: errorMessage };
      errorVideo = addMessageToChat(errorVideo, { sender: 'ai', text: `Error: ${errorMessage}` });
      updateVideoFile(errorVideo);
      setSelectedVideo(errorVideo);
      toast({ title: `Analysis Error`, description: errorMessage, variant: 'destructive' });
    }
  }, [toast]);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    
    // Check file type
    if (!file.type.startsWith('video/')) {
        toast({ title: 'Invalid File Type', description: 'Please select a valid video file.', variant: 'destructive' });
        return;
    }
    
    const newVideoId = `vid-${Date.now()}`;
    const newVideoFile: VideoFile = {
      id: newVideoId,
      file,
      previewUrl: URL.createObjectURL(file),
      analysisResult: null,
      error: null,
      status: 'pending',
      chatHistory: [],
    };

    setVideoFiles(prev => [...prev, newVideoFile]);
    handleAnalyze(newVideoFile);

  }, [toast, handleAnalyze]);

  const handleSendChatMessage = async () => {
    if (!currentChatMessage.trim() || !selectedVideo || isChatLoading) return;

    const userMessage: Omit<ChatMessage, 'id' | 'timestamp'> = {
      sender: 'user',
      text: currentChatMessage.trim(),
    };
    let videoWithUserMessage = addMessageToChat(selectedVideo, userMessage);
    updateVideoFile(videoWithUserMessage);
    setCurrentChatMessage('');
    setIsChatLoading(true);

    try {
        const reader = new FileReader();
        const videoDataUriPromise = new Promise<string>((resolve, reject) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error('Failed to read video file.'));
            reader.readAsDataURL(selectedVideo.file);
        });

        const videoDataUri = await videoDataUriPromise;

        const incidentContext = {
            title: `Video Analysis: ${selectedVideo.file.name}`,
            location: "Uploaded Video",
            timestamp: new Date().toISOString(),
            initialAISystemAnalysis: selectedVideo.analysisResult ? `Anomaly: ${selectedVideo.analysisResult.incidentType}` : "None",
        };

        const input: ChatWithFeedInput = {
            userQuestion: userMessage.text,
            incidentContext: incidentContext,
            chatHistory: videoWithUserMessage.chatHistory.map(msg => ({ sender: msg.sender, text: msg.text })),
            videoDataUri: videoDataUri, // Pass the video data
        };

        const result = await chatWithFeed(input);
        
        const aiResponse = result?.aiResponse || "I'm sorry, I couldn't process that request.";
        const videoWithAiResponse = addMessageToChat(videoWithUserMessage, { sender: 'ai', text: aiResponse });
        updateVideoFile(videoWithAiResponse);

    } catch (error) {
        console.error('Chat error:', error);
        const errorMessage = "Could not get a response from the AI. Please try again.";
        const videoWithError = addMessageToChat(videoWithUserMessage, { sender: 'ai', text: errorMessage });
        updateVideoFile(videoWithError);
        toast({ title: "Chat Error", description: errorMessage, variant: "destructive" });
    } finally {
        setIsChatLoading(false);
        // We update the selected video state from the potentially modified video list
        setVideoFiles(currentFiles => {
            const updatedSelected = currentFiles.find(v => v.id === selectedVideo.id);
            if (updatedSelected) {
                setSelectedVideo(updatedSelected);
            }
            return currentFiles;
        });
    }
  };


  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow pt-16 flex overflow-hidden">
        {/* Left Sidebar: Chat/Log */}
        <div className="w-80 flex-shrink-0 bg-card border-r border-border p-4 flex flex-col gap-4">
          <Card className="flex-1 flex flex-col h-full">
            <CardHeader className="p-3 border-b">
                <CardTitle className="text-base font-semibold flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                AI Chat & Log
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-grow overflow-hidden">
                <ScrollArea className="h-full p-3" ref={chatScrollAreaRef}>
                  <div className="space-y-4">
                    {selectedVideo ? (
                      selectedVideo.chatHistory.map((msg) => (
                        <div
                          key={msg.id}
                          className={cn(
                            "flex items-start gap-3 text-sm",
                            msg.sender === 'user' && 'justify-end'
                          )}
                        >
                          {msg.sender === 'ai' && <Bot className="h-5 w-5 text-primary shrink-0"/>}
                          <div
                            className={cn(
                              "p-2 rounded-lg max-w-xs whitespace-pre-wrap",
                              msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                            )}
                          >
                           {msg.text}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground h-full flex items-center justify-center">
                        <p>Upload a video to begin analysis.</p>
                      </div>
                    )}
                    {isChatLoading && (
                      <div className="flex items-start gap-3 text-sm">
                        <Bot className="h-5 w-5 text-primary shrink-0"/>
                        <div className="p-2 rounded-lg bg-muted text-muted-foreground flex items-center">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" /> Thinking...
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
            </CardContent>
            {selectedVideo && ( // Show chat input if any video is selected, not just analyzed
              <div className="p-3 border-t border-border">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Ask about this video..."
                    value={currentChatMessage}
                    onChange={(e) => setCurrentChatMessage(e.target.value)}
                    onKeyPress={(e) => { if (e.key === 'Enter' && !isChatLoading) { handleSendChatMessage(); } }}
                    disabled={isChatLoading || !selectedVideo}
                    className="flex-grow"
                  />
                  <Button onClick={handleSendChatMessage} disabled={isChatLoading || !currentChatMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Main Content: Video Player */}
        <div className="flex-grow p-6 flex flex-col items-center gap-6">
           <h2 className="text-xl font-semibold text-foreground">Current Video</h2>
           <Card className="w-full max-w-4xl aspect-video bg-muted flex items-center justify-center border-border shadow-lg">
             {selectedVideo ? (
                <video key={selectedVideo.previewUrl} src={selectedVideo.previewUrl} controls autoPlay muted className="w-full h-full object-contain rounded-md" />
             ) : (
                <div className="text-muted-foreground flex flex-col items-center">
                  <Video className="h-16 w-16 mb-4"/>
                  <p>No video selected</p>
                </div>
             )}
           </Card>
           <Card className="w-full max-w-4xl">
              <CardHeader>
                <CardTitle>Video Information</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <p><span className="font-semibold">Filename:</span> {selectedVideo?.file.name ?? 'N/A'}</p>
                <p><span className="font-semibold">Status:</span> <span className={cn(
                  selectedVideo?.status === 'analyzing' && 'text-primary',
                  selectedVideo?.status === 'analyzed' && 'text-green-400',
                  selectedVideo?.status === 'error' && 'text-destructive'
                )}>{selectedVideo?.status ?? 'N/A'}</span></p>
                 <p><span className="font-semibold">Anomalies:</span> {selectedVideo?.analysisResult?.isSignificant ? selectedVideo.analysisResult.incidentType.replace(/_/g, ' ') : 'None detected'}</p>
              </CardContent>
           </Card>
        </div>

        {/* Right Sidebar: Upload & Video List */}
        <div className="w-80 flex-shrink-0 bg-card border-l border-border p-4 flex flex-col gap-4">
             <h3 className="text-lg font-semibold">Upload Video</h3>
             <div 
                className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50"
                onClick={() => fileInputRef.current?.click()}
             >
                <Upload className="h-10 w-10 text-muted-foreground mb-2"/>
                <p className="text-sm text-muted-foreground">Drop video here or click to browse</p>
                <p className="text-xs text-muted-foreground mt-1">MP4, WebM, MOV</p>
             </div>
             <input type="file" ref={fileInputRef} onChange={(e) => handleFileSelect(e.target.files)} className="hidden" accept="video/mp4,video/webm,video/mov" />

            <h3 className="text-lg font-semibold mt-4">Video History</h3>
            <ScrollArea className="flex-1 -mx-4">
              <div className="px-4 space-y-2">
                {videoFiles.length > 0 ? videoFiles.slice().reverse().map(video => (
                  <Card 
                    key={video.id} 
                    className={cn(
                      "p-2 flex items-center gap-3 cursor-pointer hover:border-primary",
                      selectedVideo?.id === video.id && 'border-primary'
                    )}
                    onClick={() => setSelectedVideo(video)}
                  >
                    <div className="w-20 h-12 bg-muted rounded-md overflow-hidden shrink-0">
                      <video src={video.previewUrl} muted className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-medium truncate">{video.file.name}</p>
                      <p className={cn("text-xs",
                         video.status === 'analyzing' && 'text-primary animate-pulse',
                         video.status === 'analyzed' && video.analysisResult?.isSignificant && 'text-amber-400',
                         video.status === 'analyzed' && !video.analysisResult?.isSignificant && 'text-green-400',
                         video.status === 'error' && 'text-destructive',
                      )}>
                        {video.status === 'analyzed' ? video.analysisResult?.incidentType.replace(/_/g, ' ') : video.status}
                      </p>
                    </div>
                  </Card>
                )) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No videos uploaded yet.</p>
                )}
              </div>
            </ScrollArea>
        </div>
      </main>
    </div>
  );
}
