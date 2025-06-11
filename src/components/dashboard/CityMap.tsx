
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
  { id: 'cam6', name: 'Kazhakootam Junction', lat: 8.568, lon: 76.873 },
  { id: 'cam7', name: 'Museum Complex', lat: 8.508, lon: 76.952 },
  { id: 'cam8', name: 'Thampanoor Railway Station', lat: 8.488, lon: 76.950 },
  { id: 'cam9', name: 'Secretariat North Gate', lat: 8.495, lon: 76.945 },
  { id: 'cam10', name: 'Vellayambalam Square', lat: 8.511, lon: 76.958 },
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

const getMarkerIconUrl = (incident?: Incident): string => {
  const criticalColorHex = 'E53E3E'; // Destructive Red from HSL(0, 72%, 51%)
  const warningColorHex = 'FFBF00';   // Accent Amber from HSL(45, 100%, 50%)
  const newColorHex = '19F4E8';       // Primary Teal from HSL(183, 100%, 55%)
  const defaultCameraColorHex = '19F4E8'; // Primary Teal for normal cameras

  if (incident && incident.status !== 'Resolved') {
    let fillColor = newColorHex; 
    let strokeColor = newColorHex;

    switch (incident.status) {
      case 'Critical':
        fillColor = criticalColorHex;
        strokeColor = criticalColorHex;
        break;
      case 'Warning':
        fillColor = warningColorHex;
        strokeColor = warningColorHex;
        break;
      // 'New' uses newColorHex by default
    }
    // Active incident marker: filled inner circle, same color stroke outer circle
    return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23${strokeColor}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='12' r='10'></circle><circle cx='12' cy='12' r='4' fill='%23${fillColor}'></circle></svg>`)}`;
  }
  
  // Default camera icon (no active, non-resolved incident)
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23${defaultCameraColorHex}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='12' r='6' fill='%23${defaultCameraColorHex}' fill-opacity='0.3'></circle><circle cx='12' cy='12' r='2' fill='%23${defaultCameraColorHex}'></circle></svg>`)}`;
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
      Math.abs(inc.latitude - camera.lat) < 0.01 && // Looser matching for demo
      Math.abs(inc.longitude - camera.lon) < 0.01 
    );
    setSelectedCamera({ ...camera, incident: activeIncidentAtCamera });
  }, [incidents]);

  const onMapLoad = useCallback((mapInstance: google.maps.Map) => {
    // You can interact with the map instance here if needed
  }, []);

  const memoizedMarkers = useMemo(() => {
    if (!isLoaded) { 
      return []; 
    }
    return cameraLocations.map((camera) => {
      const activeIncidentAtCamera = incidents.find(
        (inc) => 
        inc.status !== 'Resolved' &&
        Math.abs(inc.latitude - camera.lat) < 0.01 && 
        Math.abs(inc.longitude - camera.lon) < 0.01
      );
      
      const iconUrl = getMarkerIconUrl(activeIncidentAtCamera);

      return (
        <Marker
          key={camera.id}
          position={{ lat: camera.lat, lng: camera.lon }}
          onClick={() => handleMarkerClick(camera)}
          title={camera.name}
          icon={isLoaded ? { // Ensure window.google.maps is available
            url: iconUrl,
            scaledSize: new window.google.maps.Size(20, 20),
            anchor: new window.google.maps.Point(10, 10),
          } : undefined}
        />
      );
    });
  }, [incidents, handleMarkerClick, isLoaded]);


  if (loadError) {
    return (
      <Card className="shadow-xl h-full overflow-hidden flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="text-lg font-semibold text-foreground">City Activity Map (Thiruvananthapuram)</CardTitle>
        </CardHeader>
        <CardContent className="p-0 relative flex-grow flex items-center justify-center">
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
      <Card className="shadow-xl h-full overflow-hidden flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="text-lg font-semibold text-foreground">City Activity Map (Thiruvananthapuram)</CardTitle>
        </CardHeader>
        <CardContent className="p-0 relative flex-grow">
          <Skeleton className="w-full h-full" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="shadow-xl h-full overflow-hidden flex flex-col" data-ai-hint="Thiruvananthapuram city map">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="text-lg font-semibold text-foreground">City Activity Map (Thiruvananthapuram)</CardTitle>
      </CardHeader>
      <CardContent className="p-0 relative flex-grow">
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

          {selectedCamera && isLoaded && ( 
            <InfoWindow
              position={{ lat: selectedCamera.lat, lng: selectedCamera.lon }}
              onCloseClick={() => setSelectedCamera(null)}
              options={isLoaded ? { pixelOffset: new window.google.maps.Size(0, -25) } : undefined}
            >
              <div className="p-2 bg-popover text-popover-foreground rounded-md shadow-lg max-w-xs">
                <h4 className="text-sm font-semibold mb-1">{selectedCamera.name}</h4>
                {selectedCamera.incident ? (
                  <div>
                    <p className="text-xs text-destructive font-medium">Active Alert:</p>
                    <p className="text-xs font-semibold">{selectedCamera.incident.title}</p>
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
