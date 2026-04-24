import React, { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type {
  IServiceArea,
  ICreateServiceAreaRequest,
  IUpdateServiceAreaRequest
} from '@/services';
import axios from 'axios';
import { API_URL } from '@/config/api.config';
import { toast } from 'sonner';
import { Circle, MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface IAddEditServiceAreaFormProps {
  area: IServiceArea | null;
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line no-unused-vars
  onSubmit: (data: ICreateServiceAreaRequest | IUpdateServiceAreaRequest) => void;
  isLoading?: boolean;
}

const DEFAULT_CENTER: [number, number] = [20.5937, 78.9629];
const QUICK_RADIUS = [5, 10, 15, 20, 25];

const markerIcon = L.divIcon({
  html: '<span class="service-area-marker-dot" />',
  className: 'service-area-marker',
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

const MapViewport = ({ center, zoom = 12 }: { center: [number, number] | null; zoom?: number }) => {
  const map = useMap();

  useEffect(() => {
    if (!center) return;
    map.flyTo(center, zoom, { duration: 0.8 });
  }, [center, map, zoom]);

  return null;
};

const MapClickHandler = ({
  onPick
}: {
  // eslint-disable-next-line no-unused-vars
  onPick: (coords: { lat: number; lng: number }) => void;
}) => {
  useMapEvents({
    click: (e) => {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    }
  });

  return null;
};

const AddEditServiceAreaForm = ({
  area,
  isOpen,
  onClose,
  onSubmit,
  isLoading = false
}: IAddEditServiceAreaFormProps) => {
  const isEdit = !!area;
  const [formState, setFormState] = React.useState<
    ICreateServiceAreaRequest | IUpdateServiceAreaRequest
  >({
    area_name: '',
    city: '',
    state: '',
    radius_km: 10,
    is_active: true
  } as any);

  useEffect(() => {
    if (area) {
      setFormState({
        area_name: area.area_name || '',
        city: area.city || '',
        state: area.state || '',
        radius_km: area.radius_km ? Number(area.radius_km) : 10,
        is_active: area.is_active,
        center_latitude: area.center_latitude != null ? Number(area.center_latitude) : undefined,
        center_longitude: area.center_longitude != null ? Number(area.center_longitude) : undefined
      } as any);
    } else {
      setFormState({
        area_name: '',
        city: '',
        state: '',
        radius_km: 10,
        is_active: true,
        center_latitude: undefined,
        center_longitude: undefined
      } as any);
    }
  }, [area]);

  const handleChange = (field: keyof ICreateServiceAreaRequest, value: any) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = (formState as any).center_latitude;
    const lng = (formState as any).center_longitude;

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      toast.error('Please pick a location on the map');
      return;
    }

    onSubmit(formState);
  };

  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const reverseGeocodeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleFetchCoordinates = async () => {
    const parts = [
      (formState as any).area_name,
      (formState as any).city,
      (formState as any).state,
      'India'
    ].filter(Boolean);

    if (parts.length === 0) {
      return;
    }

    const address = parts.join(', ');

    try {
      setIsGeocoding(true);
      const response = await axios.get(`${API_URL}/admin/location/geocode`, {
        params: { address }
      });
      const { latitude, longitude } = response.data.data || {};
      if (latitude && longitude) {
        setFormState(
          (prev) =>
            ({
              ...prev,
              center_latitude: Number(latitude),
              center_longitude: Number(longitude)
            }) as any
        );
        toast.success('City located on map');
      } else {
        toast.error('Could not resolve location from city/state');
      }
    } catch (err) {
      console.error('Failed to fetch coordinates for service area', err);
      toast.error('Failed to fetch location');
    } finally {
      setIsGeocoding(false);
    }
  };

  const fetchLocationDetails = async (lat: number, lng: number) => {
    try {
      setIsReverseGeocoding(true);
      const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
        params: {
          format: 'jsonv2',
          lat,
          lon: lng,
          addressdetails: 1
        }
      });

      const address = response?.data?.address || {};
      const resolvedCity =
        address.city || address.town || address.village || address.municipality || address.county || '';
      const resolvedState = address.state || address.region || address.state_district || '';
      const resolvedArea =
        address.suburb ||
        address.neighbourhood ||
        address.city_district ||
        address.road ||
        response?.data?.name ||
        '';

      setFormState(
        (prev) =>
          ({
            ...prev,
            area_name: resolvedArea || (prev as any).area_name || '',
            city: resolvedCity || (prev as any).city || '',
            state: resolvedState || (prev as any).state || ''
          }) as any
      );
    } catch (err) {
      console.error('Failed to reverse geocode service area location', err);
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  const centerLat = (formState as any).center_latitude;
  const centerLng = (formState as any).center_longitude;
  const hasCenter = typeof centerLat === 'number' && typeof centerLng === 'number';
  const mapCenter: [number, number] = hasCenter ? [centerLat, centerLng] : DEFAULT_CENTER;
  const radiusKm = Number(formState.radius_km || 10);
  const circleAnimationKey = `${mapCenter[0]}-${mapCenter[1]}-${radiusKm}`;

  const handleMapPick = (
    coords: { lat: number; lng: number },
    options?: { autoFillDetails?: boolean }
  ) => {
    setFormState(
      (prev) =>
        ({
          ...prev,
          center_latitude: Number(coords.lat.toFixed(6)),
          center_longitude: Number(coords.lng.toFixed(6))
        }) as any
    );

    if (reverseGeocodeTimerRef.current) {
      clearTimeout(reverseGeocodeTimerRef.current);
      reverseGeocodeTimerRef.current = null;
    }

    if (options?.autoFillDetails === false) {
      return;
    }

    reverseGeocodeTimerRef.current = setTimeout(() => {
      fetchLocationDetails(Number(coords.lat.toFixed(6)), Number(coords.lng.toFixed(6)));
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (reverseGeocodeTimerRef.current) {
        clearTimeout(reverseGeocodeTimerRef.current);
      }
    };
  }, []);

  const handleRadiusChange = (value: number) => {
    const nextRadius = Math.max(1, Math.min(50, value || 1));
    handleChange('radius_km', nextRadius);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Edit Service Area' : 'Add Service Area'}</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px,1fr]">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="area_name">Name</Label>
                  <Input
                    id="area_name"
                    value={formState.area_name || ''}
                    onChange={(e) => handleChange('area_name', e.target.value)}
                    placeholder="e.g. Bengaluru Urban"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={(formState as any).city || ''}
                    onChange={(e) => handleChange('city' as any, e.target.value)}
                    placeholder="e.g. Bengaluru"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={(formState as any).state || ''}
                    onChange={(e) => handleChange('state' as any, e.target.value)}
                    placeholder="e.g. Karnataka"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Label htmlFor="radius_km">Service Radius</Label>
                    <span className="text-xs font-medium text-muted-foreground">{radiusKm} km</span>
                  </div>
                  <Input
                    id="radius_km"
                    type="range"
                    min={1}
                    max={50}
                    value={radiusKm}
                    onChange={(e) => handleRadiusChange(Number(e.target.value))}
                  />
                  <div className="flex flex-wrap gap-2">
                    {QUICK_RADIUS.map((value) => (
                      <Button
                        key={value}
                        type="button"
                        size="sm"
                        variant={radiusKm === value ? 'default' : 'outline'}
                        onClick={() => handleRadiusChange(value)}
                      >
                        {value} km
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="rounded-md border border-border bg-surface-1 px-3 py-2 text-xs text-muted-foreground">
                  <div>
                    <span className="font-medium">Latitude:</span>{' '}
                    {hasCenter ? Number(centerLat).toFixed(6) : 'Not selected'}
                  </div>
                  <div>
                    <span className="font-medium">Longitude:</span>{' '}
                    {hasCenter ? Number(centerLng).toFixed(6) : 'Not selected'}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleFetchCoordinates}
                    disabled={isGeocoding}
                  >
                    {isGeocoding ? 'Locating city...' : 'Locate City on Map'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleMapPick(
                        { lat: DEFAULT_CENTER[0], lng: DEFAULT_CENTER[1] },
                        { autoFillDetails: false }
                      )
                    }
                  >
                    Reset to India
                  </Button>
                </div>

                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-1">
                    <Label htmlFor="is_active">Active</Label>
                    <p className="text-xs text-muted-foreground">
                      Inactive areas will not be used for new provider assignments.
                    </p>
                  </div>
                  <Switch
                    id="is_active"
                    checked={!!formState.is_active}
                    onCheckedChange={(checked) => handleChange('is_active', checked)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Pick Service Area on Map</Label>
                <p className="text-xs text-muted-foreground">
                  Click anywhere on the map or drag the marker. Radius circle animates and updates
                  live.
                </p>
                <div className="overflow-hidden rounded-lg border border-border">
                  <MapContainer
                    center={mapCenter}
                    zoom={hasCenter ? 12 : 5}
                    scrollWheelZoom
                    className="h-[420px] w-full"
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapViewport center={hasCenter ? mapCenter : null} zoom={hasCenter ? 12 : 5} />
                    <MapClickHandler onPick={handleMapPick} />
                    <Marker
                      position={mapCenter}
                      icon={markerIcon}
                      draggable
                      eventHandlers={{
                        dragend: (event) => {
                          const marker = event.target;
                          const pos = marker.getLatLng();
                          handleMapPick({ lat: pos.lat, lng: pos.lng });
                        }
                      }}
                    />
                    <Circle
                      key={circleAnimationKey}
                      center={mapCenter}
                      radius={Math.max(1, radiusKm) * 1000}
                      className="service-area-radius-circle"
                      pathOptions={{
                        color: '#0ea5e9',
                        fillColor: '#0ea5e9',
                        fillOpacity: 0.15,
                        weight: 2
                      }}
                    />
                  </MapContainer>
                </div>
                <div className="flex items-center justify-between rounded-md bg-surface-1 px-3 py-2 text-xs text-muted-foreground">
                  <span>Click map to place center pin</span>
                  <span>{isReverseGeocoding ? 'Auto-filling location...' : `${radiusKm} km coverage`}</span>
                </div>
              </div>
            </div>
          </DialogBody>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Service Area'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export { AddEditServiceAreaForm };
