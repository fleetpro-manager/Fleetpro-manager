import React from 'react';
import { StatsCards } from './StatsCards';
import { FleetOverviewMap } from './FleetOverviewMap';
import { ExpenseChart } from './ExpenseChart';
import { RecentActivity } from './RecentActivity';
import { AlertsPanel } from './AlertsPanel';
import { Vehicle, Trip, MaintenanceRecord, FuelLog, FleetAlert, FleetSettings } from '../../types/fleet';

interface DashboardViewProps {
  vehicles: Vehicle[];
  trips: Trip[];
  maintenance: MaintenanceRecord[];
  fuelLogs: FuelLog[];
  alerts: FleetAlert[];
  settings: FleetSettings;
  onSelectVehicle: (v: Vehicle) => void;
  onMarkAlertRead: (id: string) => void;
  onNavigateTab: (tab: 'vehicles' | 'drivers' | 'maintenance' | 'trips' | 'fuel') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  vehicles,
  trips,
  maintenance,
  fuelLogs,
  alerts,
  settings,
  onSelectVehicle,
  onMarkAlertRead,
  onNavigateTab,
}) => {
  return (
    <div className="space-y-6">
      {/* KPI Stats Bar */}
      <StatsCards
        vehicles={vehicles}
        trips={trips}
        maintenance={maintenance}
        fuelLogs={fuelLogs}
        settings={settings}
      />

      {/* Main Grid: Telematics Map (2 cols) & Alerts (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <FleetOverviewMap vehicles={vehicles} onSelectVehicle={onSelectVehicle} />
        </div>
        <div>
          <AlertsPanel
            alerts={alerts}
            onMarkAlertRead={onMarkAlertRead}
            onNavigateTab={onNavigateTab}
          />
        </div>
      </div>

      {/* Bottom Row: Expense Chart & Recent Operational Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExpenseChart settings={settings} />
        <RecentActivity
          trips={trips}
          fuelLogs={fuelLogs}
          maintenance={maintenance}
          settings={settings}
        />
      </div>
    </div>
  );
};
