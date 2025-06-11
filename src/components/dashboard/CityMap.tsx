import type React from 'react';
import Image from 'next/image';
import { MapPin, Circle } from 'lucide-react'; // Using Circle for camera dots as requested
import type { Incident } from '@/lib/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CityMapProps {
  incidents: Incident[];
}

// Predefined camera locations for the demo
const cameraLocations = [
  { id: 'cam1', name: 'Civic Center Camera', lat: 34.055, lon: -118.245, initialIncidents: 0 },
  { id: 'cam2', name: 'Downtown Crossing', lat: 34.050, lon: -118.250, initialIncidents: 1 },
  { id: 'cam3', name: 'Suburbia Park Entrance', lat: 34.060, lon: -118.230, initialIncidents: 0 },
  { id: 'cam4', name: 'Riverside Bridge Cam', lat: 34.045, lon: -118.255, initialIncidents: 0 },
  { id: 'cam5', name: 'Industrial Zone 7', lat: 34.030, lon: -118.220, initialIncidents: 1 },
];


const CityMap: React.FC<CityMapProps> = ({ incidents }) => {
  // For demo purposes, we'll just place pins somewhat randomly within a bounding box
  // A real implementation would use actual coordinates and map library.
  const mapWidth = 800; // Corresponds to placeholder image width
  const mapHeight = 600; // Corresponds to placeholder image height

  const getPinPosition = (lat: number, lon: number) => {
    // Simplified conversion of lat/lon to x/y percentage for demo
    // These ranges are arbitrary for demonstration on a static image.
    const minLat = 34.020; const maxLat = 34.070;
    const minLon = -118.270; const maxLon = -118.210;

    const xPercent = ((lon - minLon) / (maxLon - minLon)) * 100;
    const yPercent = ((maxLat - lat) / (maxLat - minLat)) * 100; // Invert Y for screen coords

    return {
      left: `${Math.max(5, Math.min(95, xPercent))}%`, // Keep within 5-95% bounds
      top: `${Math.max(5, Math.min(95, yPercent))}%`,
    };
  };
  
  return (
    <Card className="shadow-xl h-full overflow-hidden">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">City Activity Map</CardTitle>
      </CardHeader>
      <CardContent className="p-0 relative h-[calc(100%-4rem)]"> {/* Adjust height based on header */}
        <Image
          src="https://placehold.co/1200x800.png"
          alt="City Map"
          layout="fill"
          objectFit="cover"
          className="opacity-50"
          data-ai-hint="city map aerial"
        />
        <TooltipProvider>
          {cameraLocations.map((camera) => {
            const activeIncidentAtCamera = incidents.find(
              (inc) => 
              inc.status !== 'Resolved' &&
              // Simple proximity check for demo
              Math.abs(inc.latitude - camera.lat) < 0.005 && 
              Math.abs(inc.longitude - camera.lon) < 0.005
            );
            const position = getPinPosition(camera.lat, camera.lon);
            const isAlert = !!activeIncidentAtCamera;

            return (
              <Tooltip key={camera.id}>
                <TooltipTrigger asChild>
                  <div
                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                    style={{ left: position.left, top: position.top }}
                  >
                    <Circle 
                      className={`h-4 w-4 animate-blink ${isAlert ? 'text-destructive fill-destructive/30' : 'text-primary fill-primary/30'}`} 
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-popover text-popover-foreground p-2 rounded-md shadow-lg">
                  <p className="text-xs font-medium">{camera.name}</p>
                  {activeIncidentAtCamera && <p className="text-xs text-destructive">{activeIncidentAtCamera.title}</p>}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </CardContent>
    </Card>
  );
};

// Dummy Card components if not imported globally or from ui
const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div className={`bg-card text-card-foreground rounded-lg border ${className}`} {...props}>{children}</div>
);
const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div className={`p-4 border-b ${className}`} {...props}>{children}</div>
);
const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className, children, ...props }) => (
  <h3 className={`text-lg font-semibold ${className}`} {...props}>{children}</h3>
);
const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div className={`p-4 ${className}`} {...props}>{children}</div>
);


export default CityMap;
