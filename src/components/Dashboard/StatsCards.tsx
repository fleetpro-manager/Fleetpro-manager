import React from 'react';
import { Truck, Navigation, Wrench, Fuel, Gauge, AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Vehicle, Trip, MaintenanceRecord, FuelLog, FleetSettings } from '../../types/fleet';
import { formatCurrency, formatEfficiency } from '../../utils/formatters';

interface StatsCardsProps {
  vehicles: Vehicle[];
  trips: Trip[];
  maintenance: MaintenanceRecord[];
  fuelLogs: FuelLog[];
  settings: FleetSettings;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  vehicles,
  trips,
  maintenance,
  fuelLogs,
  settings,
}) => {
  const activeVehicles = vehicles.filter((v) => v.status === 'active' || v.status === 'in_transit');
  const inMaintenance = vehicles.filter((v) => v.status === 'maintenance');
  const enRouteTrips = trips.filter((t) => t.status === 'en_route');

  const totalFuelCost = fuelLogs.reduce((acc, curr) => acc + curr.totalCost, 0);

  // Calculate average fuel efficiency across active logs
  const validKmplLogs = fuelLogs.filter((l) => l.calculatedKmpl && l.calculatedKmpl > 0);
  const avgEfficiencyKmpl = validKmplLogs.length > 0
    ? validKmplLogs.reduce((acc, l) => acc + (l.calculatedKmpl || 0), 0) / validKmplLogs.length
    : 8.5;

  const urgentMaintenance = maintenance.filter(
    (m) => m.status === 'scheduled' || m.status === 'in_progress'
  );

  const stats = [
    {
      title: 'Active Fleet Vehicles',
      value: `${activeVehicles.length} / ${vehicles.length}`,
      subtitle: `${((activeVehicles.length / (vehicles.length || 1)) * 100).toFixed(0)}% Fleet Active`,
      icon: Truck,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      trend: '+2 vehicles',
      trendUp: true,
    },
    {
      title: 'Vehicles En Route',
      value: enRouteTrips.length,
      subtitle: `${trips.filter((t) => t.status === 'scheduled').length} Scheduled Trips`,
      icon: Navigation,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      trend: 'Live Dispatches',
      trendUp: true,
    },
    {
      title: 'Under Maintenance',
      value: inMaintenance.length,
      subtitle: `${urgentMaintenance.length} Open Work Orders`,
      icon: Wrench,
      color: 'bg-amber-500',
      textColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
      trend: inMaintenance.length > 1 ? 'Needs Action' : 'Optimal',
      trendUp: false,
    },
    {
      title: 'Total Fuel Expense',
      value: formatCurrency(totalFuelCost, settings.currency),
      subtitle: `${fuelLogs.length} Refueling Entries`,
      icon: Fuel,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      trend: '-4% vs prev week',
      trendUp: true,
    },
    {
      title: 'Avg Fleet Efficiency',
      value: formatEfficiency(avgEfficiencyKmpl, settings.distanceUnit, settings.fuelUnit),
      subtitle: 'Optimal range 8-12 km/L',
      icon: Gauge,
      color: 'bg-teal-500',
      textColor: 'text-teal-600',
      bgColor: 'bg-teal-50',
      trend: '+0.4 km/L improvement',
      trendUp: true,
    },
    {
      title: 'Maintenance Alert',
      value: urgentMaintenance.length,
      subtitle: 'Pending inspections',
      icon: AlertCircle,
      color: 'bg-rose-500',
      textColor: 'text-rose-600',
      bgColor: 'bg-rose-50',
      trend: 'High Priority',
      trendUp: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 tracking-tight">
                {stat.title}
              </span>
              <div className={`p-2 rounded-lg ${stat.bgColor} ${stat.textColor}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-3">
              <div className="text-xl font-bold text-slate-900">{stat.value}</div>
              <p className="text-[11px] text-slate-500 mt-0.5">{stat.subtitle}</p>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-medium">Status</span>
              <span
                className={`font-semibold flex items-center gap-0.5 ${
                  stat.trendUp ? 'text-emerald-600' : 'text-amber-600'
                }`}
              >
                {stat.trendUp ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {stat.trend}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
