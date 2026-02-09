import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useProviders } from '@/services';
import { ContentLoader } from '@/components/loaders';
import { KeenIcon } from '@/components';
import type { IProvider } from '@/services/provider.types';

interface ProviderSearchSelectProps {
  value?: string;
  onChange: (providerId: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

// Extended provider type to include raw backend fields
interface ExtendedProvider extends IProvider {
  public_id?: string;
  phone_number?: string;
}

export const ProviderSearchSelect = ({
  value,
  onChange,
  label = 'Provider',
  placeholder = 'Search provider by name...',
  required = false,
  disabled = false,
}: ProviderSearchSelectProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ExtendedProvider | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { providers, isLoading } = useProviders(
    {
      search: searchQuery,
      limit: 20,
      status: 'active',
    },
    {
      enabled: isOpen && searchQuery.length > 0,
    }
  );

  // Filter providers based on search query
  const filteredProviders = (providers as ExtendedProvider[]).filter((provider) => {
    if (!searchQuery) return false;
    const searchLower = searchQuery.toLowerCase();
    return (
      provider.name?.toLowerCase().includes(searchLower) ||
      provider.business_name?.toLowerCase().includes(searchLower) ||
      provider.public_id?.toLowerCase().includes(searchLower) ||
      provider.provider_id?.toLowerCase().includes(searchLower) ||
      provider.id?.toLowerCase().includes(searchLower) ||
      provider.phone?.includes(searchQuery) ||
      provider.phone_number?.includes(searchQuery)
    );
  });

  const handleSelectProvider = (provider: ExtendedProvider) => {
    setSelectedProvider(provider);
    // Use public_id if available, otherwise use provider_id or id
    const providerId = provider.public_id || provider.provider_id || provider.id;
    onChange(providerId);
    setSearchQuery(provider.business_name || provider.name || '');
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setIsOpen(true);
    if (!query) {
      setSelectedProvider(null);
      onChange('');
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <Label htmlFor="provider-search">{label} {required && <span className="text-danger">*</span>}</Label>
      <div className="relative mt-2">
        <Input
          id="provider-search"
          type="text"
          value={searchQuery || selectedProvider?.business_name || selectedProvider?.name || ''}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className="pr-10"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <KeenIcon icon="search" className="h-4 w-4 text-gray-400" />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {isLoading ? (
            <div className="p-4 text-center">
              <ContentLoader />
            </div>
          ) : filteredProviders.length > 0 ? (
            <ul className="py-1">
              {filteredProviders.map((provider) => {
                const providerId = provider.public_id || provider.provider_id || provider.id;
                const phone = provider.phone || provider.phone_number;
                
                return (
                  <li
                    key={providerId}
                    onClick={() => handleSelectProvider(provider)}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm text-gray-900">
                          {provider.business_name || provider.name || 'N/A'}
                        </div>
                        {phone && (
                          <div className="text-xs text-gray-500 mt-0.5">
                            {phone}
                          </div>
                        )}
                      </div>
                      {providerId && (
                        <div className="text-xs text-gray-400 font-mono">
                          {providerId}
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : searchQuery.length > 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              No providers found matching "{searchQuery}"
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-gray-500">
              Start typing to search for providers
            </div>
          )}
        </div>
      )}
    </div>
  );
};
