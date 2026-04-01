import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { IServiceArea, ICreateServiceAreaRequest, IUpdateServiceAreaRequest } from '@/services';
import axios from 'axios';
import { API_URL } from '@/config/api.config';

interface IAddEditServiceAreaFormProps {
  area: IServiceArea | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ICreateServiceAreaRequest | IUpdateServiceAreaRequest) => void;
  isLoading?: boolean;
}

const AddEditServiceAreaForm = ({
  area,
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: IAddEditServiceAreaFormProps) => {
  const isEdit = !!area;
  const [formState, setFormState] = React.useState<ICreateServiceAreaRequest | IUpdateServiceAreaRequest>({
    area_name: '',
    city: '',
    state: '',
    radius_km: 10,
    is_active: true,
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
        center_longitude: area.center_longitude != null ? Number(area.center_longitude) : undefined,
      } as any);
    } else {
      setFormState({
        area_name: '',
        city: '',
        state: '',
        radius_km: 10,
        is_active: true,
        center_latitude: undefined,
        center_longitude: undefined,
      } as any);
    }
  }, [area]);

  const handleChange = (field: keyof ICreateServiceAreaRequest, value: any) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formState);
  };

  const [isGeocoding, setIsGeocoding] = useState(false);

  const handleFetchCoordinates = async () => {
    const parts = [
      (formState as any).area_name,
      (formState as any).city,
      (formState as any).state,
      'India',
    ].filter(Boolean);

    if (parts.length === 0) {
      return;
    }

    const address = parts.join(', ');

    try {
      setIsGeocoding(true);
      const response = await axios.get(`${API_URL}/admin/location/geocode`, {
        params: { address },
      });
      const { latitude, longitude } = response.data.data || {};
      if (latitude && longitude) {
        // Store on the form state so backend gets proper coordinates
        setFormState((prev) => ({
          ...prev,
          center_latitude: Number(latitude),
          center_longitude: Number(longitude),
        } as any));
      }
    } catch (err) {
      // Swallow error; UI will just not auto-fill
      // You can add a toast here if you want
      console.error('Failed to fetch coordinates for service area', err);
    } finally {
      setIsGeocoding(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Edit Service Area' : 'Add Service Area'}</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4">
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
              <Label>Latitude &amp; Longitude</Label>
              <p className="text-xs text-gray-500">
                Enter manually or use the button to fetch from area name/city/state.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="center_latitude" className="text-xs">Latitude</Label>
                  <Input
                    id="center_latitude"
                    type="number"
                    step="any"
                    placeholder="e.g. 12.9716"
                    value={(formState as any).center_latitude ?? ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      handleChange('center_latitude' as any, v === '' ? undefined : Number(v));
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="center_longitude" className="text-xs">Longitude</Label>
                  <Input
                    id="center_longitude"
                    type="number"
                    step="any"
                    placeholder="e.g. 77.5946"
                    value={(formState as any).center_longitude ?? ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      handleChange('center_longitude' as any, v === '' ? undefined : Number(v));
                    }}
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleFetchCoordinates}
                disabled={isGeocoding}
              >
                {isGeocoding ? 'Fetching…' : 'Fetch from Location'}
              </Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="radius_km">Radius (km)</Label>
              <Input
                id="radius_km"
                type="number"
                min={1}
                max={50}
                value={formState.radius_km || 10}
                onChange={(e) => handleChange('radius_km', Number(e.target.value))}
              />
            </div>
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-1">
                <Label htmlFor="is_active">Active</Label>
                <p className="text-xs text-gray-500">
                  Inactive areas will not be used for new provider assignments.
                </p>
              </div>
              <Switch
                id="is_active"
                checked={!!formState.is_active}
                onCheckedChange={(checked) => handleChange('is_active', checked)}
              />
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

