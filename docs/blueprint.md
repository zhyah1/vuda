# **App Name**: VUDA Dashboard

## Core Features:

- KPI Dashboard: Display real-time KPIs related to public safety, such as average response time, false alarm rates, and the number of active incidents.
- Interactive City Map: Display an interactive city map with blinking dot icons representing security cameras. The color of the icons will change based on incident status.
- Live Incident Feed: Show a live-updating feed of incoming incident alerts with details such as event type, location, timestamp, and status.
- Incident Report Modal: Show a modal containing the video feed from a security camera plus an AI-synthesized summary report of a specific incident. Display an action log to show the timeline of events and actions taken.
- AI-Powered Incident Analysis: Generate a concise summary of the incident, its potential impact, and recommended actions using a generative AI tool. This feature provides real-time, actionable intelligence for field units and operations center staff.
- Real-time Data Simulation: Simulate a real-time environment by adding new incidents to the Live Alerts feed periodically and updating the Active Incidents KPI.

## Style Guidelines:

- Primary color: Electric blue (#7DF9FF) for highlights and interactive elements, suggesting technological sophistication.
- Background color: Dark gray (#2E3440) to provide contrast and a modern feel.
- Accent color: Amber (#FFBF00) for warnings to indicate caution and potential issues.
- Body and headline font: 'Inter' (sans-serif) for a crisp, legible, and modern look.
- Use icons from the lucide-react library, ensuring consistency and clarity across the dashboard.
- Implement a responsive grid layout with a fixed header, KPI bar, and a two-column structure for the city map and live incident feed.
- Employ subtle loading spinners and CSS animations to provide a dynamic, 'live' feel when new data arrives, enhancing user experience.