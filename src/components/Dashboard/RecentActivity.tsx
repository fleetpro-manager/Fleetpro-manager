import React from 'react';
import { Navigation, Fuel, Wrench, Clock, CheckCircle2 } from 'lucide-react';
import { Trip, FuelLog, MaintenanceRecord, FleetSettings } from '../../types/fleet';
import { formatCurrency, formatRelativeTime } from '../../utils/formatters';

interface RecentActivityProps {
  trips: Trip[];
  fuelLogs: FuelLog[];
  maintenance: MaintenanceRecord[];
  settings: FleetSettings;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
  trips,
  fuelLogs,
  maintenance,
  settings,
}) => {
  // Combine activity feed items
  const activities = [
    ...trips.map((t) => ({
      id: `trip-${t.id}`,
      type: 'dispatch',
      title: `Trip Dispatched: ${t.tripCode}`,
      detail: `${t.vehicleName} → ${t.destination}`,
      time: t.startTime,
      icon: Navigation,
      color: 'bg-blue-100 text-blue-700',
    })),
    ...fuelLogs.map((f) => ({
      id: `fuel-${f.id}`,
      type: 'fuel',
      title: `Fuel Logged: ${f.vehicleName}`,
      detail: `${f.liters}L refueled for ${formatCurrency(f.totalCost, settings.currency)}`,
      time: f.date,
      icon: Fuel,
      color: 'bg-emerald-100 text-emerald-700',
    })),
    ...maintenance.map((m) => ({
      id: `maint-${m.id}`,
      type: 'maintenance',
      title: `Maintenance (${m.priority.toUpperCase()}): ${m.vehicleName}`,
      detail: `${m.description} - ${formatCurrency(m.costAmount, settings.currency)}`,
      time: m.scheduledDate,
      icon: Wrench,
      color: 'bg-amber-100 text-amber-700',
    })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 6);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Recent Operational Logs</h3>
          <p className="text-xs text-slate-500">Live dispatch, fuel & maintenance updates</p>
        </div>
        <Clock className="w-4 h-4 text-slate-400" />
      </div>

      <div className="space-y-3">
        {activities.map((act) => {
          const Icon = act.icon;
          return (
            <div
              key={act.id}
              className="flex items-start gap-3 p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50/80 transition-colors"
            >
              <div className={`p-2 rounded-lg shrink-0 ${act.color}`}>
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-slate-900 text-xs truncate">{act.title}</p>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">
                    {formatRelativeTime(act.time)}
                  </span>
                </div>
                <p className="text-xs text-slate-600 truncate mt-0.5">{act.detail}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
