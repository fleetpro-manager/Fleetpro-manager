import React from 'react';
import {
  X,
  Truck,
  User,
  Gauge,
  Fuel,
  Wrench,
  Navigation,
  ShieldCheck,
  Calendar,
  MapPin,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { Vehicle, Trip, MaintenanceRecord, FuelLog, FleetSettings } from '../../types/fleet';
import { formatCurrency, formatDistance, formatEfficiency, formatDate } from '../../utils/formatters';

interface VehicleDetailModalProps {
  vehicle: Vehicle | null;
  onClose: () => void;
  trips: Trip[];
  maintenance: MaintenanceRecord[];
  fuelLogs: FuelLog[];
  settings: FleetSettings;
  onDispatchTrip: (v: Vehicle) => void;
  onLogFuel: (v: Vehicle) => void;
  onScheduleMaintenance: (v: Vehicle) => void;
}

export const VehicleDetailModal: React.FC<VehicleDetailModalProps> = ({
  vehicle,
  onClose,
  trips,
  maintenance,
  fuelLogs,
  settings,
  onDispatchTrip,
  onLogFuel,
  onScheduleMaintenance,
}) => {
  if (!vehicle) return null;

  const vehicleTrips = trips.filter((t) => t.vehicleId === vehicle.id);
  const vehicleMaintenance = maintenance.filter((m) => m.vehicleId === vehicle.id);
  const vehicleFuelLogs = fuelLogs.filter((f) => f.vehicleId === vehicle.id);

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600/30 border border-blue-500/40 text-blue-400 flex items-center justify-center font-bold">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-white">{vehicle.name}</h2>
                <span className="bg-slate-800 text-slate-200 font-mono text-xs px-2.5 py-0.5 rounded-md border border-slate-700 font-bold">
                  {vehicle.plateNumber}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                VIN: <span className="font-mono text-slate-300">{vehicle.vin}</span> • {vehicle.make} {vehicle.model} ({vehicle.year})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Quick Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600">Quick Operations:</span>
            <button
              onClick={() => {
                onClose();
                onDispatchTrip(vehicle);
              }}
              className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors flex items-center gap-1"
            >
              <Navigation className="w-3.5 h-3.5" /> Dispatch
            </button>
            <button
              onClick={() => {
                onClose();
                onLogFuel(vehicle);
              }}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors flex items-center gap-1"
            >
              <Fuel className="w-3.5 h-3.5" /> Refuel
            </button>
            <button
              onClick={() => {
                onClose();
                onScheduleMaintenance(vehicle);
              }}
              className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700 transition-colors flex items-center gap-1"
            >
              <Wrench className="w-3.5 h-3.5" /> Service Order
            </button>
          </div>

          <div className="text-slate-500 font-medium flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-blue-500" /> Current: <span className="font-bold text-slate-800">{vehicle.locationName}</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Top Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 font-medium block">CURRENT ODOMETER</span>
              <span className="text-base font-bold text-slate-900 mt-0.5 block">
                {formatDistance(vehicle.currentOdometerKm, settings.distanceUnit)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">AVG FUEL EFFICIENCY</span>
              <span className="text-base font-bold text-emerald-700 mt-0.5 block">
                {formatEfficiency(vehicle.avgEfficiencyKmpl, settings.distanceUnit, settings.fuelUnit)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">FUEL TANK CAPACITY</span>
              <span className="text-base font-bold text-slate-900 mt-0.5 block">
                {vehicle.tankCapacityLiters} Liters
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">INSURANCE EXPIRY</span>
              <span className="text-base font-bold text-slate-900 mt-0.5 block">
                {formatDate(vehicle.insuranceExpiry)}
              </span>
            </div>
          </div>

          {/* Assigned Driver & Service Alert */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <User className="w-4 h-4 text-blue-600" /> Assigned Driver
              </h4>
              {vehicle.assignedDriverName ? (
                <div className="flex items-center gap-3 mt-2">
                  <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm">
                    {vehicle.assignedDriverName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{vehicle.assignedDriverName}</p>
                    <p className="text-xs text-slate-500">ID: {vehicle.assignedDriverId || 'N/A'}</p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic mt-2">No active driver assigned to this vehicle.</p>
              )}
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-amber-600" /> Maintenance Schedule
              </h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Last Service Date:</span>
                  <span className="font-semibold">{formatDate(vehicle.lastServiceDate)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Next Due Date:</span>
                  <span className="font-semibold text-amber-700">{formatDate(vehicle.nextServiceDueDate)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Target Service Odometer:</span>
                  <span className="font-semibold">{formatDistance(vehicle.nextServiceOdometerKm, settings.distanceUnit)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Active / Recent Trips */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
              <Navigation className="w-4 h-4 text-blue-600" /> Trip & Dispatch History ({vehicleTrips.length})
            </h4>
            {vehicleTrips.length === 0 ? (
              <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-lg">No dispatch logs found for this vehicle.</p>
            ) : (
              <div className="space-y-2">
                {vehicleTrips.map((t) => (
                  <div key={t.id} className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{t.tripCode}</span>
                        <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full capitalize">
                          {t.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-1">
                        {t.startLocation} → <span className="font-semibold">{t.destination}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900 block">{t.estimatedDistanceKm} KM</span>
                      <span className="text-[10px] text-slate-400">{formatDate(t.startTime)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Maintenance Logs */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-amber-600" /> Service & Work Orders ({vehicleMaintenance.length})
            </h4>
            {vehicleMaintenance.length === 0 ? (
              <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-lg">No maintenance records logged.</p>
            ) : (
              <div className="space-y-2">
                {vehicleMaintenance.map((m) => (
                  <div key={m.id} className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{m.workOrderNumber}</span> - <span className="font-medium text-slate-700">{m.description}</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">Provider: {m.serviceProvider}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900 block">{formatCurrency(m.costAmount, settings.currency)}</span>
                      <span className="text-[10px] text-slate-400">{formatDate(m.scheduledDate)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
