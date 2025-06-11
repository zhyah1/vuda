
'use client';

import type React from 'react';
import { useState, useCallback, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { AlertTriangle } from 'lucide-react';
import type { Incident } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';

interface CityMapProps {
  incidents: Incident[];
}

// Predefined camera locations for Thiruvananthapuram (fictional)
const cameraLocations = [
  { id: 'cam1', name: 'Technopark Main Gate', lat: 8.556, lon: 76.825 },
  { id: 'cam2', name: 'East Fort Junction', lat: 8.483, lon: 76.946 },
  { id: 'cam3', name: 'Kowdiar Palace View', lat: 8.515, lon: 76.945 },
  { id: 'cam4', name: 'Shanghumugham Beach Front', lat: 8.479, lon: 76.907 },
  { id: 'cam5', name: 'Pattom Central', lat: 8.518, lon: 76.920 },
];

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

// Center of Thiruvananthapuram
const center = {
  lat: 8.5241, // Latitude for Thiruvananthapuram
  lng: 76.9366  // Longitude for Thiruvananthapuram
};

const CityMap: React.FC<CityMapProps> = ({ incidents }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const [selectedCamera, setSelectedCamera] = useState<(typeof cameraLocations[0] & { incident?: Incident }) | null>(null);

  const handleMarkerClick = useCallback((camera: typeof cameraLocations[0]) => {
    const activeIncidentAtCamera = incidents.find(
      (inc) => 
      inc.status !== 'Resolved' &&
      // Looser matching for incidents to camera locations
      Math.abs(inc.latitude - camera.lat) < 0.005 && 
      Math.abs(inc.longitude - camera.lon) < 0.005 
    );
    setSelectedCamera({ ...camera, incident: activeIncidentAtCamera });
  }, [incidents]);

  const onMapLoad = useCallback((mapInstance: google.maps.Map) => {
    // You can interact with the map instance here if needed
  }, []);

  const memoizedMarkers = useMemo(() => {
    if (!isLoaded) {
      return []; // Don't try to create markers if Google Maps API isn't loaded
    }
    return cameraLocations.map((camera) => {
      const activeIncidentAtCamera = incidents.find(
        (inc) => 
        inc.status !== 'Resolved' &&
        Math.abs(inc.latitude - camera.lat) < 0.005 && 
        Math.abs(inc.longitude - camera.lon) < 0.005
      );
      const isAlert = !!activeIncidentAtCamera;
      
      const iconUrl = isAlert ? 
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23E53E3E' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'%3E%3C/circle%3E%3Ccircle cx='12' cy='12' r='4' fill='%23E53E3E'%3E%3C/circle%3E%3C/svg%3E"
        : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2319F4E8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='6' fill='%2319F4E8' fill-opacity='0.3'%3E%3C/circle%3E%3Ccircle cx='12' cy='12' r='2' fill='%2319F4E8'%3E%3C/circle%3E%3C/svg%3E";

      return (
        <Marker
          key={camera.id}
          position={{ lat: camera.lat, lng: camera.lon }}
          onClick={() => handleMarkerClick(camera)}
          title={camera.name}
          icon={{
            url: iconUrl,
            scaledSize: new window.google.maps.Size(20, 20),
            anchor: new window.google.maps.Point(10, 10),
          }}
        />
      );
    });
  }, [incidents, handleMarkerClick, isLoaded]); // Added isLoaded to dependency array


  if (loadError) {
    return (
      <Card className="shadow-xl h-full overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">City Activity Map (Thiruvananthapuram)</CardTitle>
        </CardHeader>
        <CardContent className="p-0 relative h-[calc(100%-4rem)] flex items-center justify-center">
          <div className="text-center text-destructive">
            <AlertTriangle className="h-12 w-12 mx-auto mb-2" />
            <p>Error loading Google Maps.</p>
            <p className="text-xs text-muted-foreground">Please ensure the API key is correct and the API is enabled.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isLoaded) {
     return (
      <Card className="shadow-xl h-full overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">City Activity Map (Thiruvananthapuram)</CardTitle>
        </CardHeader>
        <CardContent className="p-0 relative h-[calc(100%-4rem)]">
          <Skeleton className="w-full h-full" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="shadow-xl h-full overflow-hidden" data-ai-hint="Thiruvananthapuram city map">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">City Activity Map (Thiruvananthapuram)</CardTitle>
      </CardHeader>
      <CardContent className="p-0 relative h-[calc(100%-4rem)]"> {/* Adjust height based on header */}
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={12}
          onLoad={onMapLoad}
          options={{ 
            streetViewControl: false, 
            mapTypeControl: false,
            fullscreenControl: false,
            // styles: mapStyles // Example for custom dark theme styles for map
          }}
        >
          {memoizedMarkers}

          {selectedCamera && isLoaded && ( // Ensure isLoaded for InfoWindow options too
            <InfoWindow
              position={{ lat: selectedCamera.lat, lng: selectedCamera.lon }}
              onCloseClick={() => setSelectedCamera(null)}
              options={{ pixelOffset: new window.google.maps.Size(0, -25) }}
            >
              <div className="p-1 bg-popover text-popover-foreground rounded-md shadow-lg max-w-xs">
                <h4 className="text-sm font-semibold mb-1">{selectedCamera.name}</h4>
                {selectedCamera.incident ? (
                  <div>
                    <p className="text-xs text-destructive font-medium">Active Alert:</p>
                    <p className="text-xs text-muted-foreground">{selectedCamera.incident.title}</p>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No active alerts.</p>
                )}
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </CardContent>
    </Card>
  );
};

export default CityMap;
