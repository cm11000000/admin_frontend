import React from 'react';
import { Card } from '@/components/ui/card';
import { Combobox } from '@/components/ui/combobox';
import { Loader2 } from 'lucide-react';

export interface ClientOption {
  value: string;
  label: string;
}

export interface TabContentWrapperProps {
  description: string;
  clients: ClientOption[];
  selectedClient: string;
  onClientChange: (code: string) => void;
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  showClientSelector?: boolean;
}

const TabContentWrapper: React.FC<TabContentWrapperProps> = ({
  description,
  clients,
  selectedClient,
  onClientChange,
  isLoading = false,
  loadingText = 'Loading data...',
  children,
  showClientSelector = true,
}) => {
  return (
    <Card className="p-4 md:p-6 space-y-4">
      <p className="text-xs text-gray-600">{description}</p>

      {showClientSelector && (
        <div className="grid gap-3 md:grid-cols-[minmax(0,360px)_minmax(0,1fr)] md:items-center">
          <div>
            <label className="text-xs font-semibold text-gray-700">
              Select Client Code
            </label>
            <Combobox
              className="mt-2"
              options={clients}
              value={selectedClient}
              onValueChange={onClientChange}
              placeholder="Select client code..."
              searchPlaceholder="Search client code..."
              emptyText="No client code found."
            />
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center gap-2 text-gray-600 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{loadingText}</span>
        </div>
      ) : (
        children
      )}
    </Card>
  );
};

export default TabContentWrapper;
