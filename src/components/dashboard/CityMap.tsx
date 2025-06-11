
import type React from 'react';
import Image from 'next/image';
import { MapPin, Circle } from 'lucide-react';
import type { Incident } from '@/lib/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface CityMapProps {
  incidents: Incident[];
}

// Predefined camera locations for Thiruvananthapuram (fictional)
const cameraLocations = [
  { id: 'cam1', name: 'Technopark Main Gate', lat: 8.545, lon: 76.915, initialIncidents: 0 },
  { id: 'cam2', name: 'East Fort Junction', lat: 8.483, lon: 76.946, initialIncidents: 1 },
  { id: 'cam3', name: 'Kowdiar Palace View', lat: 8.512, lon: 76.935, initialIncidents: 0 },
  { id: 'cam4', name: 'Shanghumugham Beach Front', lat: 8.475, lon: 76.880, initialIncidents: 0 },
  { id: 'cam5', name: 'Pattom Central', lat: 8.505, lon: 76.900, initialIncidents: 1 },
];


const CityMap: React.FC<CityMapProps> = ({ incidents }) => {
  const mapWidth = 800; // Corresponds to placeholder image width
  const mapHeight = 600; // Corresponds to placeholder image height

  const getPinPosition = (lat: number, lon: number) => {
    // Simplified conversion of lat/lon to x/y percentage for Thiruvananthapuram (fictional bounds)
    const minLat = 8.450; const maxLat = 8.550; // Approx 0.1 degree span
    const minLon = 76.870; const maxLon = 76.960; // Approx 0.09 degree span

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
        <CardTitle className="text-lg font-semibold text-foreground">City Activity Map (Thiruvananthapuram)</CardTitle>
      </CardHeader>
      <CardContent className="p-0 relative h-[calc(100%-4rem)]"> {/* Adjust height based on header */}
        <Image
          src="https://placehold.co/1200x800.png"
          alt="Thiruvananthapuram City Map"
          layout="fill"
          objectFit="cover"
          className="opacity-50"
          data-ai-hint="Thiruvananthapuram city map"
        />
        <TooltipProvider>
          {cameraLocations.map((camera) => {
            const activeIncidentAtCamera = incidents.find(
              (inc) => 
              inc.status !== 'Resolved' &&
              // Simple proximity check for demo (adjust sensitivity if needed for new coord system)
              Math.abs(inc.latitude - camera.lat) < 0.003 && 
              Math.abs(inc.longitude - camera.lon) < 0.003
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

export default CityMap;
