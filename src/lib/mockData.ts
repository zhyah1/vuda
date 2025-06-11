
import type { Incident, IncidentType, IncidentStatus, IncidentAction } from './types';

const titles: Record<IncidentType, string[]> = {
  'Violent Crime': ['Assault Reported', 'Robbery in Progress', 'Public Disturbance'],
  'Medical Emergency': ['Cardiac Arrest', 'Fall Detected', 'Unresponsive Person'],
  'Fire Alert': ['Smoke Detected in Building', 'Structure Fire Reported', 'Vehicle Fire'],
  'Traffic Accident': ['Multi-vehicle Collision', 'Pedestrian Struck', 'Road Blockage Major Intersection'],
  'Suspicious Activity': ['Loitering Detected', 'Unattended Package', 'Trespassing Alert'],
  'Public Safety Threat': ['Large Crowd Forming', 'Vandalism Spree', 'Potential Riot Conditions', 'Street Fight Erupting'],
};

// Updated locations for Thiruvananthapuram (fictional context)
const locations: string[] = [
  'Technopark Phase 1', 'East Fort Junction', 'Kowdiar Avenue',
  'Pattom Main Road', 'Shanghumugham Beach Rd', 'Statue Junction',
  'Medical College Campus', 'Museum Road', 'Peroorkada Market', 'Ulloor Crossing'
];

// Updated initialAnalyses to reflect AI video understanding with anomaly tags
const initialAnalyses: Record<IncidentType, string[]> = {
  'Violent Crime': [
    "Video feed shows two individuals in a physical altercation near the ATM. One individual pushed the other to the ground. (Detected Anomalies: Physical_Assault, Fighting)",
    "Video analytics detect an individual forcibly taking a handbag from another person and fleeing towards the East street. (Detected Anomalies: Robbery, Theft)",
  ],
  'Medical Emergency': [
    "A person is observed collapsing suddenly near the bus stop on MG Road. No immediate assistance visible. (Detected Anomalies: Person_Collapsed, Medical_Emergency)",
    "Individual appears to be having a seizure on public sidewalk. (Detected Anomalies: Seizure_Activity)",
  ],
  'Fire Alert': [
    "Thermal imaging from Camera 4B indicates a significant heat signature emanating from the ground floor of the residential building. Smoke visible from a window. (Detected Anomalies: Fire_Outbreak, Smoke)",
    "Visible flames and smoke from a commercial kitchen exhaust. (Detected Anomalies: Fire_Outbreak, Commercial_Fire)",
  ],
  'Traffic Accident': [
    "Vehicle (Red Sedan, KL-01-XX-1234) ran a red light at high speed at Pattom Junction, narrowly avoiding pedestrians. (Detected Anomalies: Reckless_Driving, Pedestrian_In_Danger)",
    "Two vehicles involved in a collision at intersection, blocking traffic. (Detected Anomalies: Accident_With_Injuries, Road_Blockage_Hazard)",
    "Motorcycle accident, rider down on road. (Detected Anomalies: Accident_With_Injuries, Medical_Emergency)",
  ],
  'Suspicious Activity': [
    "An unidentified backpack has been left unattended near the main entrance of the mall for over 15 minutes. Area is moderately crowded. (Detected Anomalies: Abandoned_Baggage, Suspicious_Activity)",
    "Individual seen scaling the perimeter fence of the restricted power substation. (Detected Anomalies: Unauthorized_Access, Trespassing_Alert)",
  ],
  'Public Safety Threat': [
    "Large, agitated crowd forming at City Center. Objects thrown. (Detected Anomalies: Riots_Or_Protest_Violence, Unlawful_Assembly)",
    "Multiple individuals breaking shop windows on Main Street. (Detected Anomalies: Vandalism_In_Progress, Property_Damage)",
    "Reports of panicked crowd movement near transit station. (Detected Anomalies: Crowd_Stampede, Public_Panic)",
    "Group of individuals involved in a large street brawl. (Detected Anomalies: Fighting, Public_Disturbance, Weapon_Visible)"
  ]
};


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

const incidentTypes: IncidentType[] = [
  'Violent Crime', 
  'Medical Emergency', 
  'Fire Alert', 
  'Traffic Accident', 
  'Suspicious Activity',
  'Public Safety Threat'
];

// Give higher weight to Public Safety Threat and Traffic Accident
const preferredIncidentTypes: IncidentType[] = ['Public Safety Threat', 'Traffic Accident'];

export const generateMockIncident = (): Incident => {
  incidentIdCounter++;
  
  let randomType: IncidentType;
  // Increase probability for preferred types
  if (Math.random() < 0.5) { // 50% chance to pick a preferred type
    randomType = preferredIncidentTypes[Math.floor(Math.random() * preferredIncidentTypes.length)];
  } else {
    const nonPreferredTypes = incidentTypes.filter(type => !preferredIncidentTypes.includes(type));
    randomType = nonPreferredTypes[Math.floor(Math.random() * nonPreferredTypes.length)];
  }
  
  const randomStatus = ['Critical', 'Warning', 'New'][Math.floor(Math.random() * 3)] as IncidentStatus;

  const isResolved = Math.random() < 0.1; // Lower chance of being resolved for new incidents
  const status = isResolved ? 'Resolved' : randomStatus;

  const hasGeneratedSummary = Math.random() < 0.3;

  const baseLat = 8.50;
  const baseLon = 76.91; 
  const latSpread = 0.05; 
  const lonSpread = 0.05; 

  const specificAnalyses = initialAnalyses[randomType];
  const chosenAnalysis = specificAnalyses[Math.floor(Math.random() * specificAnalyses.length)];

  return {
    id: `inc-${incidentIdCounter}-${Date.now()}`,
    type: randomType,
    title: titles[randomType][Math.floor(Math.random() * titles[randomType].length)],
    location: locations[Math.floor(Math.random() * locations.length)],
    timestamp: new Date(Date.now() - Math.floor(Math.random() * 300000)), // Within last 5 mins for more "live" feel
    status: status,
    latitude: baseLat + (Math.random() - 0.5) * 2 * latSpread, 
    longitude: baseLon + (Math.random() - 0.5) * 2 * lonSpread,
    cameraImage: `https://placehold.co/600x400.png?text=${encodeURIComponent(randomType.replace(/\s/g, '+'))}`,
    initialAISystemAnalysis: chosenAnalysis,
    initialActionsTaken: initialActions[Math.floor(Math.random() * initialActions.length)],
    generatedSummary: hasGeneratedSummary ? `AI-generated summary: ${chosenAnalysis.substring(0,100)}... Further details are being processed.` : undefined,
    actionLog: actionLogSamples[Math.floor(Math.random() * actionLogSamples.length)].map(action => ({
      ...action,
      timestamp: `${new Date().getHours().toString().padStart(2, '0')}:${(new Date().getMinutes() - Math.floor(Math.random()*5)).toString().padStart(2, '0')}:${new Date().getSeconds().toString().padStart(2, '0')}`
    })),
  };
};

export const INITIAL_INCIDENTS_COUNT = 7; // Slightly increased for more variety with new type

export const getInitialMockIncidents = (): Incident[] => {
  return Array.from({ length: INITIAL_INCIDENTS_COUNT }, generateMockIncident)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};
