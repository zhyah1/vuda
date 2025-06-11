
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
  assignedToDepartment?: string; // Added optional field
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
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
  initialAISystemAnalysis?: string;
  initialActionsTaken?: string;
  generatedSummary?: string;
  actionLog?: IncidentAction[];
  chatHistory?: ChatMessage[];
}

