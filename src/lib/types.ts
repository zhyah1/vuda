export type IncidentStatus = 'Critical' | 'Warning' | 'Resolved' | 'New';
export type IncidentType = 
  | 'Violent Crime' 
  | 'Medical Emergency' 
  | 'Fire Alert' 
  | 'Traffic Accident' 
  | 'Suspicious Activity'
  | 'Public Safety Threat';

export interface IncidentAction {
  timestamp: string;
  description: string;
}

export interface Incident {
  id: string;
  type: IncidentType;
  title: string;
  location: string;
  timestamp: Date;
  status: IncidentStatus;
  latitude: number; 
  longitude: number;
  cameraImage?: string; 
  youtubeVideoId?: string; // Added for embedding YouTube videos
  initialAISystemAnalysis?: string;
  initialActionsTaken?: string;
  generatedSummary?: string;
  actionLog?: IncidentAction[];
}
