
'use client';

import type React from 'react';
import { useState, useCallback, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, TrafficLayer } from '@react-google-maps/api';
import { AlertTriangle, WifiOff } from 'lucide-react';
import type { Incident } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';

interface CityMapProps {
  incidents: Incident[];
  newlyAddedIncidentIds: Set<string>;
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

const getMarkerIconConfig = (
  incident: Incident | undefined,
  isNewlyAdded: boolean,
  googleMapsLoaded: boolean
): google.maps.Icon | undefined => {
  if (!googleMapsLoaded || !window.google?.maps?.Size || !window.google?.maps?.Point) {
    return undefined;
  }

  const criticalColorHex = 'E53E3E'; // Destructive Red HSL(0, 72%, 51%)
  const warningColorHex = 'FFBF00';   // Accent Amber HSL(45, 100%, 50%)
  const newColorHex = '19F4E8';       // Primary Teal HSL(183, 100%, 55%)
  const defaultCameraColorHex = '19F4E8'; // Primary Teal for normal cameras
  const popOutlineColorHex = 'FFFFFF'; // White for pop effect outline

  let fillColor = defaultCameraColorHex;
  let strokeColor = defaultCameraColorHex; // For standard active incidents
  let svgContent: string;
  let baseSize = 20; // Standard size

  if (incident && incident.status !== 'Resolved') {
    fillColor = newColorHex; // Default for 'New' status incidents
    strokeColor = newColorHex;

    switch (incident.status) {
      case 'Critical':
        fillColor = criticalColorHex;
        strokeColor = criticalColorHex;
        break;
      case 'Warning':
        fillColor = warningColorHex;
        strokeColor = warningColorHex;
        break;
    }

    if (isNewlyAdded) {
      baseSize = 30; // Larger size for "pop" effect
      svgContent = `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'>
        <circle cx='12' cy='12' r='11' fill='hsla(0,0%,100%,0.3)' /> 
        <circle cx='12' cy='12' r='8' stroke='%23${popOutlineColorHex}' stroke-width='2' fill='none' />
        <circle cx='12' cy='12' r='5' fill='%23${fillColor}' />
      </svg>`;
    } else {
      svgContent = `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23${strokeColor}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='12' r='10'></circle><circle cx='12' cy='12' r='4' fill='%23${fillColor}'></circle></svg>`;
    }
  } else {
     svgContent = `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23${defaultCameraColorHex}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='12' r='6' fill='%23${defaultCameraColorHex}' fill-opacity='0.3'></circle><circle cx='12' cy='12' r='2' fill='%23${defaultCameraColorHex}'></circle></svg>`;
  }
  
  return {
    url: `data:image/svg+xml,${encodeURIComponent(svgContent)}`,
    scaledSize: new window.google.maps.Size(baseSize, baseSize),
    anchor: new window.google.maps.Point(baseSize / 2, baseSize / 2),
  };
};


const CityMap: React.FC<CityMapProps> = ({ incidents, newlyAddedIncidentIds }) => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const isApiKeyMissing = !apiKey;
  const isApiKeyPlaceholder = apiKey === "REPLACE_THIS_WITH_YOUR_ACTUAL_GOOGLE_MAPS_API_KEY";

  if (isApiKeyMissing || isApiKeyPlaceholder) {
    return (
      <Card className="shadow-xl h-full overflow-hidden flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="text-lg font-semibold text-foreground">City Activity Map (Thiruvananthapuram)</CardTitle>
        </CardHeader>
        <CardContent className="p-0 relative flex-grow flex items-center justify-center">
          <div className="text-center text-destructive p-4">
            <WifiOff className="h-12 w-12 mx-auto mb-3 text-destructive" />
            <p className="font-semibold text-lg">Google Maps API Key Error</p>
            {isApiKeyMissing && <p className="text-sm">The Google Maps API key (<code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code>) is missing.</p>}
            {isApiKeyPlaceholder && <p className="text-sm">The placeholder Google Maps API key needs to be replaced with a valid one.</p>}
            <p className="text-xs text-muted-foreground mt-3">
              Please ensure <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> is correctly set in your <code>.env</code> file.
              You must restart your development server after updating the <code>.env</code> file.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey, 
  });

  const [selectedCamera, setSelectedCamera] = useState<(typeof cameraLocations[0] & { incident?: Incident }) | null>(null);

  const handleMarkerClick = useCallback((camera: typeof cameraLocations[0]) => {
    const activeIncidentAtCamera = incidents.find(
      (inc) => 
      inc.status !== 'Resolved' &&
      Math.abs(inc.latitude - camera.lat) < 0.01 && 
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
      
      const isNewlyAdded = !!activeIncidentAtCamera && newlyAddedIncidentIds.has(activeIncidentAtCamera.id);
      const iconConfig = getMarkerIconConfig(activeIncidentAtCamera, isNewlyAdded, isLoaded && !!window.google?.maps?.Size);

      return (
        <Marker
          key={camera.id}
          position={{ lat: camera.lat, lng: camera.lon }}
          onClick={() => handleMarkerClick(camera)}
          title={camera.name}
          icon={iconConfig}
          zIndex={isNewlyAdded ? 1000 : undefined} 
        />
      );
    });
  }, [incidents, handleMarkerClick, isLoaded, newlyAddedIncidentIds]);


  if (loadError) {
    return (
      <Card className="shadow-xl h-full overflow-hidden flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="text-lg font-semibold text-foreground">City Activity Map (Thiruvananthapuram)</CardTitle>
        </CardHeader>
        <CardContent className="p-0 relative flex-grow flex items-center justify-center">
          <div className="text-center text-destructive p-4">
            <AlertTriangle className="h-12 w-12 mx-auto mb-3" />
            <p className="font-semibold text-lg">Error Loading Google Maps</p>
            <p className="text-sm">The map service could not be loaded. This might be due to an invalid API key, incorrect API configuration in Google Cloud Console, or network issues.</p>
            <p className="text-xs text-muted-foreground mt-2">Please check your <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code>, ensure the Maps JavaScript API is enabled, and verify your billing status with Google Cloud.</p>
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
            styles: [ // Adding dark mode styles for the map
              { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
              { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
              { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
              {
                featureType: "administrative.locality",
                elementType: "labels.text.fill",
                stylers: [{ color: "#d59563" }],
              },
              {
                featureType: "poi",
                elementType: "labels.text.fill",
                stylers: [{ color: "#d59563" }],
              },
              {
                featureType: "poi.park",
                elementType: "geometry",
                stylers: [{ color: "#263c3f" }],
              },
              {
                featureType: "poi.park",
                elementType: "labels.text.fill",
                stylers: [{ color: "#6b9a76" }],
              },
              {
                featureType: "road",
                elementType: "geometry",
                stylers: [{ color: "#38414e" }],
              },
              {
                featureType: "road",
                elementType: "geometry.stroke",
                stylers: [{ color: "#212a37" }],
              },
              {
                featureType: "road",
                elementType: "labels.text.fill",
                stylers: [{ color: "#9ca5b3" }],
              },
              {
                featureType: "road.highway",
                elementType: "geometry",
                stylers: [{ color: "#746855" }],
              },
              {
                featureType: "road.highway",
                elementType: "geometry.stroke",
                stylers: [{ color: "#1f2835" }],
              },
              {
                featureType: "road.highway",
                elementType: "labels.text.fill",
                stylers: [{ color: "#f3d19c" }],
              },
              {
                featureType: "transit",
                elementType: "geometry",
                stylers: [{ color: "#2f3948" }],
              },
              {
                featureType: "transit.station",
                elementType: "labels.text.fill",
                stylers: [{ color: "#d59563" }],
              },
              {
                featureType: "water",
                elementType: "geometry",
                stylers: [{ color: "#17263c" }],
              },
              {
                featureType: "water",
                elementType: "labels.text.fill",
                stylers: [{ color: "#515c6d" }],
              },
              {
                featureType: "water",
                elementType: "labels.text.stroke",
                stylers: [{ color: "#17263c" }],
              },
            ]
          }}
        >
          <TrafficLayer autoUpdate />
          {memoizedMarkers}

          {selectedCamera && isLoaded && ( 
            <InfoWindow
              position={{ lat: selectedCamera.lat, lng: selectedCamera.lon }}
              onCloseClick={() => setSelectedCamera(null)}
              options={isLoaded && window.google?.maps?.Size ? { pixelOffset: new window.google.maps.Size(0, -25) } : undefined}
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
