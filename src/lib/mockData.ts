
import type { Incident, IncidentType, IncidentStatus, IncidentAction } from './types';

const titles: Record<IncidentType, string[]> = {
  'Violent Crime': ['Assault Reported', 'Robbery in Progress', 'Public Disturbance'],
  'Medical Emergency': ['Cardiac Arrest', 'Fall Detected', 'Unresponsive Person'],
  'Fire Alert': ['Smoke Detected in Building', 'Structure Fire Reported', 'Vehicle Fire'],
  'Traffic Accident': ['Multi-vehicle Collision', 'Pedestrian Struck', 'Road Blockage'],
  'Suspicious Activity': ['Loitering Detected', 'Unattended Package', 'Trespassing Alert'],
};

// Updated locations for Thiruvananthapuram (fictional context)
const locations: string[] = [
  'Technopark Phase 1', 'East Fort Junction', 'Kowdiar Avenue',
  'Pattom Main Road', 'Shanghumugham Beach Rd', 'Statue Junction',
  'Medical College Campus', 'Museum Road', 'Peroorkada Market', 'Ulloor Crossing'
];

const initialAnalyses: string[] = [
  "Motion detected, audio sensors picked up shouting.",
  "Thermal imaging shows elevated heat signature.",
  "Facial recognition matched a person of interest.",
  "License plate reader flagged a suspicious vehicle.",
  "Crowd density analysis indicates unusual gathering."
];

const initialActions: string[] = [
  "Camera automatically panned and zoomed to event.",
  "Local police patrol notified via automated alert.",
  "Emergency medical services pre-alerted.",
  "Traffic management system rerouting vehicles.",
  "Security drone dispatched for aerial surveillance."
];

const actionLogSamples: IncidentAction[][] = [
  [
    { timestamp: "14:32:15", description: "Threat Detected via Camera Feed" },
    { timestamp: "14:32:18", description: "AI Context Analyzed: Potential Violent Crime" },
    { timestamp: "14:32:20", description: "Law Enforcement Dispatched (Unit TVM-07)" },
    { timestamp: "14:32:25", description: "AI Report Sent to Field Units" },
    { timestamp: "14:33:00", description: "Medical Support Team En Route (ETA 3 min)" },
  ],
  [
    { timestamp: "08:15:30", description: "Medical Alert Triggered by Device" },
    { timestamp: "08:15:35", description: "Vitals Transmitted: Abnormal Heart Rate" },
    { timestamp: "08:15:40", description: "EMS Dispatched to Location" },
    { timestamp: "08:16:00", description: "Emergency Contact Notified by AI" },
  ]
];


let incidentIdCounter = 0;

export const generateMockIncident = (): Incident => {
  incidentIdCounter++;
  const randomType = Object.keys(titles)[Math.floor(Math.random() * Object.keys(titles).length)] as IncidentType;
  const randomStatus = ['Critical', 'Warning', 'New'][Math.floor(Math.random() * 3)] as IncidentStatus;

  const isResolved = Math.random() < 0.2;
  const status = isResolved ? 'Resolved' : randomStatus;

  const hasGeneratedSummary = Math.random() < 0.3;

  // Fictional coordinates around Thiruvananthapuram (approx 8.5° N, 76.9° E)
  // Centered around: Lat 8.50, Lon 76.92
  // Range: Lat [8.45, 8.55], Lon [8.87, 8.97] - careful, longitude was too far east previously
  const baseLat = 8.50;
  const baseLon = 76.91; // Adjusted to be more central Kerala
  const latSpread = 0.05; // +/- 0.05 degrees latitude
  const lonSpread = 0.05; // +/- 0.05 degrees longitude

  return {
    id: `inc-${incidentIdCounter}-${Date.now()}`,
    type: randomType,
    title: titles[randomType][Math.floor(Math.random() * titles[randomType].length)],
    location: locations[Math.floor(Math.random() * locations.length)],
    timestamp: new Date(Date.now() - Math.floor(Math.random() * 600000)), // Within last 10 mins
    status: status,
    latitude: baseLat + (Math.random() - 0.5) * 2 * latSpread, 
    longitude: baseLon + (Math.random() - 0.5) * 2 * lonSpread,
    cameraImage: `https://placehold.co/600x400.png?text=${encodeURIComponent(randomType)}`,
    initialAISystemAnalysis: initialAnalyses[Math.floor(Math.random() * initialAnalyses.length)],
    initialActionsTaken: initialActions[Math.floor(Math.random() * initialActions.length)],
    generatedSummary: hasGeneratedSummary ? "AI-generated summary: This is a placeholder summary indicating that an event of significance occurred, requiring attention. Further details are being processed by the VUDA system to provide actionable intelligence." : undefined,
    actionLog: actionLogSamples[Math.floor(Math.random() * actionLogSamples.length)].map(action => ({
      ...action,
      timestamp: `${new Date().getHours().toString().padStart(2, '0')}:${(new Date().getMinutes() - Math.floor(Math.random()*5)).toString().padStart(2, '0')}:${new Date().getSeconds().toString().padStart(2, '0')}`
    })),
  };
};

export const INITIAL_INCIDENTS_COUNT = 5;

export const getInitialMockIncidents = (): Incident[] => {
  return Array.from({ length: INITIAL_INCIDENTS_COUNT }, generateMockIncident)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};
