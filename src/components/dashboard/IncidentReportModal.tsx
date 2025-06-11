
'use client';
import type React from 'react';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import type { Incident, ChatMessage } from '@/lib/types';
import { chatWithFeed, type ChatWithFeedInput } from '@/ai/flows/chat-with-feed-flow';
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, CheckCircle, Info, Loader2, Send, MessageSquare } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface IncidentReportModalProps {
  incident: Incident | null;
  isOpen: boolean;
  onClose: () => void;
  isLoadingAiSummary: boolean;
}

const IncidentReportModal: React.FC<IncidentReportModalProps> = ({ incident, isOpen, onClose, isLoadingAiSummary }) => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentChatMessage, setCurrentChatMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const { toast } = useToast();
  const chatScrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (incident?.chatHistory) {
      setChatMessages(incident.chatHistory);
    } else {
      setChatMessages([]);
    }
    setCurrentChatMessage('');
  }, [incident]);

  useEffect(() => {
    if (chatScrollAreaRef.current) {
      const scrollElement = chatScrollAreaRef.current.querySelector('div > div'); 
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [chatMessages]);

  const handleSendChatMessage = async () => {
    if (!currentChatMessage.trim() || !incident) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: currentChatMessage.trim(),
      timestamp: new Date(),
    };
    setChatMessages(prev => [...prev, userMessage]);
    setCurrentChatMessage('');
    setIsChatLoading(true);

    try {
      const input: ChatWithFeedInput = {
        userQuestion: userMessage.text,
        incidentContext: {
          title: incident.title,
          location: incident.location,
          timestamp: incident.timestamp.toISOString(),
          initialAISystemAnalysis: incident.initialAISystemAnalysis,
          generatedSummary: incident.generatedSummary,
        },
        chatHistory: chatMessages.map(msg => ({ sender: msg.sender, text: msg.text })),
      };

      const result = await chatWithFeed(input);
      
      if (result && result.aiResponse) {
        const aiMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: result.aiResponse,
          timestamp: new Date(),
        };
        setChatMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error("AI did not return a valid response.");
      }
    } catch (error) {
      console.error("Failed to get chat response from AI:", error);
      toast({
        title: "Chat Error",
        description: "Could not get a response from the AI. Please try again.",
        variant: "destructive",
      });
      const errorMessage: ChatMessage = {
        id: `ai-error-${Date.now()}`,
        sender: 'ai',
        text: "I'm sorry, I encountered an error and can't respond right now.",
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };
  
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
          <div className="p-4">
            {/* Top Section: Camera Feed, Action Log, AI Analysis, Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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

              {/* Right Column: AI Analysis & Details */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center">
                    <Info className="h-5 w-5 mr-2 text-primary" />
                    VUDA AI Analysis
                  </h3>
                  <div className="p-4 border border-border rounded-md bg-muted/30 min-h-[150px] text-sm">
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
                      <p className="text-foreground whitespace-pre-wrap">{incident.generatedSummary}</p>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                         <AlertTriangle className="h-8 w-8 text-accent mb-2" />
                        <p className="text-muted-foreground">AI summary not available or not yet generated for this incident.</p>
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

            {/* Bottom Section: Chat Interface */}
            <div>
              <Card className="flex flex-col shadow-md bg-card/80 border border-border h-[calc(50vh-5rem)] sm:h-[calc(40vh-4rem)] md:h-[calc(100vh-28rem)] max-h-[500px] min-h-[300px]"> {/* Adjusted height */}
                <CardHeader className="p-3 border-b border-border">
                  <CardTitle className="text-base font-semibold flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                    Chat with AI Assistant
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex-grow overflow-hidden">
                  <ScrollArea className="h-full p-3" ref={chatScrollAreaRef}>
                    <div className="space-y-3">
                      {chatMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={cn(
                            "flex flex-col text-sm",
                            msg.sender === 'user' ? 'items-end' : 'items-start'
                          )}
                        >
                          <div
                            className={cn(
                              "p-2 rounded-lg max-w-[80%]",
                              msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                            )}
                          >
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                          </div>
                           <p className="text-xs text-muted-foreground/70 mt-1">
                              {format(new Date(msg.timestamp), "p")}
                            </p>
                        </div>
                      ))}
                      {isChatLoading && (
                        <div className="flex items-start space-x-2">
                           <div className="p-2 rounded-lg bg-muted text-muted-foreground flex items-center">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" /> Thinking...
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
                <div className="p-3 border-t border-border">
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Ask about this incident..."
                      value={currentChatMessage}
                      onChange={(e) => setCurrentChatMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !isChatLoading) {
                          handleSendChatMessage();
                        }
                      }}
                      disabled={isChatLoading}
                      className="flex-grow"
                    />
                    <Button onClick={handleSendChatMessage} disabled={isChatLoading || !currentChatMessage.trim()}>
                      <Send className="h-4 w-4" />
                      <span className="sr-only">Send</span>
                    </Button>
                  </div>
                </div>
              </Card>
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

    