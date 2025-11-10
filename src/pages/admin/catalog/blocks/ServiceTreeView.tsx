import { useState } from 'react';
import { KeenIcon } from '@/components';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface IServiceCategory {
  id: string;
  name: string;
  icon: string;
  status: 'active' | 'inactive';
  image: string;
  subServices: ISubService[];
}

interface ISubService {
  id: string;
  name: string;
  estimatedPrice: number;
  duration: string;
  status: 'active' | 'inactive';
  popularity: number;
  image: string;
  addOns: IAddOn[];
}

interface IAddOn {
  id: string;
  name: string;
  price: number;
  status: 'active' | 'inactive';
}

const ServiceTreeView = () => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['electrical', 'plumbing']);

  // Mock data - in real app, this would come from API
  const serviceCategories: IServiceCategory[] = [
    {
      id: 'electrical',
      name: 'Electrical Services',
      icon: 'element-11',
      status: 'active',
      image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=300&h=200&fit=crop&crop=center',
      subServices: [
        {
          id: 'electrical-wiring',
          name: 'Electrical Wiring',
          estimatedPrice: 500,
          image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=300&h=200&fit=crop&crop=center',
          duration: '2-3 hours',
          status: 'active',
          popularity: 95,
          addOns: [
            { id: 'extra-outlet', name: 'Extra Power Outlet', price: 200, status: 'active' },
            { id: 'switch-upgrade', name: 'Switch Upgrade', price: 150, status: 'active' }
          ]
        },
        {
          id: 'switch-repair',
          name: 'Switch Board Repair',
          image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=300&h=200&fit=crop',
          estimatedPrice: 300,
          duration: '1-2 hours',
          status: 'active',
          popularity: 88,
          addOns: [
            { id: 'safety-check', name: 'Safety Check', price: 100, status: 'active' }
          ]
        },
        {
          id: 'fan-installation',
          name: 'Fan Installation',
          image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop',
          estimatedPrice: 400,
          duration: '1 hour',
          status: 'active',
          popularity: 75,
          addOns: []
        }
      ]
    },
    {
      id: 'plumbing',
      name: 'Plumbing Services',
      icon: 'water-drop',
      status: 'active',
      image: 'https://images.unsplash.com/photo-1581578731548-c6a0c3f2fcc0?w=300&h=200&fit=crop&crop=center',
      subServices: [
        {
          id: 'pipe-repair',
          name: 'Pipe Repair',
          estimatedPrice: 600,
          image: 'https://images.unsplash.com/photo-1581578731548-c6a0c3f2fcc0?w=300&h=200&fit=crop&crop=center',
          duration: '2-4 hours',
          status: 'active',
          popularity: 92,
          addOns: [
            { id: 'pipe-replacement', name: 'Pipe Replacement', price: 300, status: 'active' },
            { id: 'leak-detection', name: 'Leak Detection', price: 200, status: 'active' }
          ]
        },
        {
          id: 'tap-repair',
          name: 'Tap Repair',
          image: 'https://images.unsplash.com/photo-1581578731548-c6a0c3f2fcc0?w=300&h=200&fit=crop',
          estimatedPrice: 250,
          duration: '30 minutes',
          status: 'active',
          popularity: 85,
          addOns: [
            { id: 'tap-upgrade', name: 'Tap Upgrade', price: 150, status: 'active' }
          ]
        }
      ]
    },
    {
      id: 'ac',
      name: 'AC Services',
      icon: 'air-conditioner-2',
      status: 'active',
      image: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=300&h=200&fit=crop&crop=center',
      subServices: [
        {
          id: 'ac-service',
          name: 'AC Service & Repair',
          estimatedPrice: 800,
          image: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=300&h=200&fit=crop&crop=center',
          duration: '2-3 hours',
          status: 'active',
          popularity: 90,
          addOns: [
            { id: 'gas-topup', name: 'Gas Top-up', price: 400, status: 'active' },
            { id: 'filter-replacement', name: 'Filter Replacement', price: 200, status: 'active' }
          ]
        }
      ]
    },
    {
      id: 'cleaning',
      name: 'Cleaning Services',
      icon: 'broom-2',
      status: 'active',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop&crop=center',
      subServices: [
        {
          id: 'home-cleaning',
          name: 'Home Cleaning',
          estimatedPrice: 300,
          image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop&crop=center',
          duration: '3-4 hours',
          status: 'active',
          popularity: 82,
          addOns: [
            { id: 'deep-cleaning', name: 'Deep Cleaning', price: 200, status: 'active' },
            { id: 'window-cleaning', name: 'Window Cleaning', price: 150, status: 'active' }
          ]
        }
      ]
    },
    {
      id: 'carpentry',
      name: 'Carpentry Services',
      icon: 'hammer-2',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=200&fit=crop',
      status: 'active',
      subServices: [
        {
          id: 'furniture-repair',
          name: 'Furniture Repair',
          image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=200&fit=crop',
          estimatedPrice: 400,
          duration: '2-3 hours',
          status: 'active',
          popularity: 78,
          addOns: [
            { id: 'polishing', name: 'Wood Polishing', price: 150, status: 'active' }
          ]
        },
        {
          id: 'door-repair',
          name: 'Door Repair',
          image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop',
          estimatedPrice: 350,
          duration: '1-2 hours',
          status: 'active',
          popularity: 72,
          addOns: []
        }
      ]
    },
    {
      id: 'appliance',
      name: 'Appliance Services',
      icon: 'setting-2',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop',
      status: 'active',
      subServices: [
        {
          id: 'washing-machine',
          name: 'Washing Machine Repair',
          image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop',
          estimatedPrice: 600,
          duration: '2-3 hours',
          status: 'active',
          popularity: 85,
          addOns: [
            { id: 'motor-repair', name: 'Motor Repair', price: 300, status: 'active' }
          ]
        }
      ]
    }
  ];

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: 'default', className: 'bg-success text-white', text: 'Active' },
      inactive: { variant: 'destructive', className: '', text: 'Inactive' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { variant: 'secondary', className: '', text: status };
    return <Badge variant={config.variant as any} className={config.className}>{config.text}</Badge>;
  };

  const getPopularityBadge = (popularity: number) => {
    if (popularity >= 90) return { variant: 'default', className: 'bg-success text-white', text: 'Very Popular' };
    if (popularity >= 80) return { variant: 'default', className: 'bg-info text-white', text: 'Popular' };
    if (popularity >= 70) return { variant: 'default', className: 'bg-warning text-white', text: 'Moderate' };
    return { variant: 'secondary', className: '', text: 'Low' };
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Service Catalog Tree</h3>
        <p className="text-sm text-gray-600">Category → Sub-Service → Add-ons</p>
      </div>
      <div className="card-body">
        <div className="space-y-4">
          {serviceCategories.map((category) => (
            <div key={category.id} className="border border-gray-200 rounded-lg">
              <Collapsible
                open={expandedCategories.includes(category.id)}
                onOpenChange={() => toggleCategory(category.id)}
              >
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <img 
                          src={category.image} 
                          alt={category.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop&crop=center';
                          }}
                        />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{category.name}</h4>
                        <p className="text-sm text-gray-600">
                          {category.subServices.length} sub-services
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(category.status)}
                      <KeenIcon 
                        icon={expandedCategories.includes(category.id) ? "arrow-up" : "arrow-down"} 
                        className="text-gray-400" 
                      />
                    </div>
                  </div>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <div className="border-t border-gray-200 p-4 space-y-4">
                    {category.subServices.map((subService) => (
                      <div key={subService.id} className="ml-6 border border-gray-100 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              <img 
                                src={subService.image} 
                                alt={subService.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop&crop=center';
                                }}
                              />
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900">{subService.name}</h5>
                              <p className="text-sm text-gray-600">
                                ₹{subService.estimatedPrice} • {subService.duration}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={getPopularityBadge(subService.popularity).variant as any} className={getPopularityBadge(subService.popularity).className}>
                              {getPopularityBadge(subService.popularity).text}
                            </Badge>
                            {getStatusBadge(subService.status)}
                          </div>
                        </div>
                        
                        {subService.addOns.length > 0 && (
                          <div className="ml-4 space-y-2">
                            <p className="text-sm font-medium text-gray-700">Add-ons:</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {subService.addOns.map((addOn) => (
                                <div key={addOn.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                  <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                                    <span className="text-sm text-gray-700">{addOn.name}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">₹{addOn.price}</span>
                                    {getStatusBadge(addOn.status)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export { ServiceTreeView };
