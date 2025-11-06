import { useState, useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';
import { Card } from '../components/ui/card';

interface NodeLocation {
  id: string;
  name: string;
  ipAddress: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  status: 'online' | 'offline' | 'away';
}

export function HomePage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [nodes] = useState<NodeLocation[]>([
    {
      id: '1',
      name: 'Node 1',
      ipAddress: '192.168.1.101',
      city: 'San Francisco',
      country: 'USA',
      lat: 37.7749,
      lng: -122.4194,
      status: 'online',
    },
    {
      id: '2',
      name: 'Node 2',
      ipAddress: '192.168.1.102',
      city: 'New York',
      country: 'USA',
      lat: 40.7128,
      lng: -74.006,
      status: 'online',
    },
    {
      id: '3',
      name: 'Node 3',
      ipAddress: '192.168.1.103',
      city: 'London',
      country: 'UK',
      lat: 51.5074,
      lng: -0.1278,
      status: 'away',
    },
    {
      id: '4',
      name: 'Node 4',
      ipAddress: '192.168.1.104',
      city: 'Tokyo',
      country: 'Japan',
      lat: 35.6762,
      lng: 139.6503,
      status: 'offline',
    },
    {
      id: '5',
      name: 'Node 5',
      ipAddress: '192.168.1.105',
      city: 'Sydney',
      country: 'Australia',
      lat: -33.8688,
      lng: 151.2093,
      status: 'online',
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return '#10b981';
      case 'away':
        return '#f59e0b';
      case 'offline':
        return '#6b7280';
      default:
        return '#4D7A82';
    }
  };

  useEffect(() => {
    // Load Google Maps API
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (mapRef.current && window.google) {
        // Calculate center point
        const centerLat = nodes.reduce((sum, node) => sum + node.lat, 0) / nodes.length;
        const centerLng = nodes.reduce((sum, node) => sum + node.lng, 0) / nodes.length;

        const map = new window.google.maps.Map(mapRef.current, {
          center: { lat: centerLat, lng: centerLng },
          zoom: 2,
          styles: [
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{ color: '#C5D9DD' }],
            },
            {
              featureType: 'landscape',
              elementType: 'geometry',
              stylers: [{ color: '#F4F8F9' }],
            },
          ],
        });

        // Add markers for each node
        nodes.forEach((node) => {
          const marker = new window.google.maps.Marker({
            position: { lat: node.lat, lng: node.lng },
            map: map,
            title: `${node.name} - ${node.city}`,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: getStatusColor(node.status),
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            },
          });

          // Create info window
          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="padding: 8px; font-family: system-ui, -apple-system, sans-serif;">
                <h3 style="margin: 0 0 8px 0; color: #2D464D; font-size: 14px; font-weight: 600;">${node.name}</h3>
                <p style="margin: 4px 0; color: #6B9AA4; font-size: 12px;">${node.ipAddress}</p>
                <p style="margin: 4px 0; color: #89B2BA; font-size: 12px;">${node.city}, ${node.country}</p>
                <p style="margin: 4px 0; font-size: 12px;">
                  <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: ${getStatusColor(node.status)}; margin-right: 4px;"></span>
                  <span style="color: #4D7A82; text-transform: capitalize;">${node.status}</span>
                </p>
              </div>
            `,
          });

          marker.addListener('click', () => {
            infoWindow.open(map, marker);
          });
        });
      }
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup script if needed
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [nodes]);

  return (
    <div className="flex flex-col h-full p-6 bg-white overflow-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl mb-2" style={{ color: '#2D464D' }}>
          Network Overview
        </h1>
        <p style={{ color: '#4D7A82' }}>Monitor all connected nodes and their locations</p>
      </div>

      {/* Network Statistics */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card className="p-4 border" style={{ borderColor: '#C5D9DD' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wide" style={{ color: '#6B9AA4' }}>
              Total Nodes
            </span>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#4D7A82' }} />
          </div>
          <div className="text-3xl mb-1" style={{ color: '#2D464D' }}>
            {nodes.length}
          </div>
          <p className="text-xs" style={{ color: '#89B2BA' }}>
            Network capacity
          </p>
        </Card>

        <Card className="p-4 border" style={{ borderColor: '#C5D9DD' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wide" style={{ color: '#6B9AA4' }}>
              Online
            </span>
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <div className="text-3xl mb-1" style={{ color: '#10b981' }}>
            {nodes.filter((n) => n.status === 'online').length}
          </div>
          <p className="text-xs" style={{ color: '#89B2BA' }}>
            {((nodes.filter((n) => n.status === 'online').length / nodes.length) * 100).toFixed(0)}%
            connected
          </p>
        </Card>

        <Card className="p-4 border" style={{ borderColor: '#C5D9DD' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wide" style={{ color: '#6B9AA4' }}>
              Offline
            </span>
            <div className="w-2 h-2 rounded-full bg-gray-400" />
          </div>
          <div className="text-3xl mb-1" style={{ color: '#6b7280' }}>
            {nodes.filter((n) => n.status === 'offline' || n.status === 'away').length}
          </div>
          <p className="text-xs" style={{ color: '#89B2BA' }}>
            {(
              (nodes.filter((n) => n.status === 'offline' || n.status === 'away').length /
                nodes.length) *
              100
            ).toFixed(0)}
            % disconnected
          </p>
        </Card>

        <Card className="p-4 border" style={{ borderColor: '#C5D9DD' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wide" style={{ color: '#6B9AA4' }}>
              Locations
            </span>
            <MapPin className="w-3 h-3" style={{ color: '#4D7A82' }} />
          </div>
          <div className="text-3xl mb-1" style={{ color: '#2D464D' }}>
            {new Set(nodes.map((n) => n.country)).size}
          </div>
          <p className="text-xs" style={{ color: '#89B2BA' }}>
            Countries covered
          </p>
        </Card>
      </div>

      {/* Node Lists - Online and Offline */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Online Nodes */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <h2 style={{ color: '#2D464D' }}>
              Online Nodes ({nodes.filter((n) => n.status === 'online').length})
            </h2>
          </div>
          <div className="space-y-2">
            {nodes
              .filter((n) => n.status === 'online')
              .map((node) => (
                <div
                  key={node.id}
                  className="flex items-center gap-3 p-3 rounded-lg border"
                  style={{ borderColor: '#C5D9DD', backgroundColor: '#F4F8F9' }}
                >
                  <div
                    className="flex items-center justify-center w-10 h-10 rounded-full"
                    style={{ backgroundColor: '#E8F0F2' }}
                  >
                    <MapPin className="w-5 h-5" style={{ color: '#10b981' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span style={{ color: '#2D464D' }}>{node.name}</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                    <p className="text-xs truncate" style={{ color: '#6B9AA4' }}>
                      {node.ipAddress}
                    </p>
                    <p className="text-xs truncate" style={{ color: '#89B2BA' }}>
                      {node.city}, {node.country}
                    </p>
                  </div>
                </div>
              ))}
            {nodes.filter((n) => n.status === 'online').length === 0 && (
              <div className="text-center py-8" style={{ color: '#89B2BA' }}>
                <p className="text-sm">No online nodes</p>
              </div>
            )}
          </div>
        </div>

        {/* Offline Nodes */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-gray-400" />
            <h2 style={{ color: '#2D464D' }}>
              Offline Nodes (
              {nodes.filter((n) => n.status === 'offline' || n.status === 'away').length})
            </h2>
          </div>
          <div className="space-y-2">
            {nodes
              .filter((n) => n.status === 'offline' || n.status === 'away')
              .map((node) => (
                <div
                  key={node.id}
                  className="flex items-center gap-3 p-3 rounded-lg border"
                  style={{ borderColor: '#E8F0F2', backgroundColor: '#FAFAFA' }}
                >
                  <div
                    className="flex items-center justify-center w-10 h-10 rounded-full"
                    style={{ backgroundColor: '#F4F4F5' }}
                  >
                    <MapPin className="w-5 h-5" style={{ color: '#9ca3af' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span style={{ color: '#6B7280' }}>{node.name}</span>
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getStatusColor(node.status) }}
                      />
                    </div>
                    <p className="text-xs truncate" style={{ color: '#9ca3af' }}>
                      {node.ipAddress}
                    </p>
                    <p className="text-xs truncate" style={{ color: '#d1d5db' }}>
                      {node.city}, {node.country}
                    </p>
                  </div>
                </div>
              ))}
            {nodes.filter((n) => n.status === 'offline' || n.status === 'away').length === 0 && (
              <div className="text-center py-8" style={{ color: '#89B2BA' }}>
                <p className="text-sm">All nodes are online</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Map Container */}
      <Card className="p-6 border shadow-lg" style={{ borderColor: '#C5D9DD' }}>
        <div className="mb-4">
          <h2 className="mb-1" style={{ color: '#2D464D' }}>
            Node Locations Map
          </h2>
          <p className="text-sm" style={{ color: '#6B9AA4' }}>
            Click on markers to view node details
          </p>
        </div>

        <div
          ref={mapRef}
          className="w-full h-96 rounded-lg overflow-hidden border"
          style={{ borderColor: '#C5D9DD', backgroundColor: '#E8F0F2' }}
        />
      </Card>
    </div>
  );
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    google: any;
  }
}
