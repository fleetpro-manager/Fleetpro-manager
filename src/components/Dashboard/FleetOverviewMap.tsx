import React, { useState } from 'react';
import {
  MapPin,
  Truck,
  Navigation,
  Activity,
  Maximize2,
  Clock,
  User,
  Gauge,
  Zap,
} from 'lucide-react';
import { Vehicle } from '../../types/fleet';

interface FleetOverviewMapProps {
  vehicles: Vehicle[];
  onSelectVehicle: (v: Vehicle) => void;
}

export const FleetOverviewMap: React.FC<FleetOverviewMapProps> = ({
  vehicles,
  onSelectVehicle,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'in_transit' | 'active' | 'maintenance'>('all');
  const [selectedPinId, setSelectedPinId] = useState<string | null>(vehicles[0]?.id || null);

  const filteredVehicles = vehicles.filter((v) => {
    if (filterStatus === 'all') return true;
    return v.status === filterStatus;
  });

  const selectedVehicle = vehicles.find((v) => v.id === selectedPinId) || filteredVehicles[0] || vehicles[0];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Live Fleet Telematics & GPS Map</h3>
            <p className="text-xs text-slate-500">Real-time vehicle coordinates & route tracking</p>
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 text-xs">
          {(['all', 'in_transit', 'active', 'maintenance'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1 rounded-md font-medium transition-colors capitalize ${
                filterStatus === st
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st === 'in_transit' ? 'En Route' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Map Graphic Canvas Simulation */}
      <div className="relative min-h-[380px] bg-slate-950 overflow-hidden flex flex-col justify-between p-6 select-none">
        {/* Geographic Grid Lines Pattern overlay */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px]" />
        
        {/* Animated GPS Radar Pulse */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-blue-500/20 rounded-full animate-ping pointer-events-none opacity-40" />

        {/* Top Floating Telemetry Overlay */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-300">
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Tracking {filteredVehicles.length} Vehicles Online</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-300">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>GPS Frequency: 5s Interval</span>
          </div>
        </div>

        {/* Map Pins Grid Simulation */}
        <div className="relative z-10 my-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {filteredVehicles.slice(0, 8).map((vehicle, idx) => {
            const isSelected = vehicle.id === selectedPinId;
            const isTransit = vehicle.status === 'in_transit';
            const isMaintenance = vehicle.status === 'maintenance';

            return (
              <div
                key={vehicle.id}
                onClick={() => setSelectedPinId(vehicle.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer backdrop-blur-md relative ${
                  isSelected
                    ? 'bg-blue-900/40 border-blue-500 shadow-lg shadow-blue-500/20 ring-2 ring-blue-500/30'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    {vehicle.plateNumber.split('-').slice(-2).join('-')}
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isTransit
                        ? 'bg-indigo-400 animate-pulse'
                        : isMaintenance
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                    }`}
                  />
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-slate-300 shrink-0" />
                  <span className="font-semibold text-slate-100 text-xs truncate">
                    {vehicle.name}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 mt-1 truncate flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-blue-400 shrink-0" />
                  {vehicle.locationName}
                </p>

                <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                  <span>{vehicle.coordinates.lat.toFixed(3)}, {vehicle.coordinates.lng.toFixed(3)}</span>
                  <span className="text-blue-400 font-semibold">{isTransit ? '68 km/h' : '0 km/h'}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Vehicle Detail Banner */}
        {selectedVehicle && (
          <div className="relative z-10 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 text-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-white text-sm">{selectedVehicle.name}</h4>
                  <span className="text-xs bg-slate-800 px-2 py-0.5 rounded-full text-slate-300 font-mono">
                    {selectedVehicle.plateNumber}
                  </span>
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  Driver: <span className="text-slate-200 font-medium">{selectedVehicle.assignedDriverName || 'Unassigned'}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs text-slate-300">
              <div>
                <span className="text-slate-500 text-[10px] block">CURRENT LOCATION</span>
                <span className="font-medium text-slate-100 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-400" />
                  {selectedVehicle.locationName}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">ODOMETER</span>
                <span className="font-medium text-slate-100 flex items-center gap-1">
                  <Gauge className="w-3 h-3 text-emerald-400" />
                  {selectedVehicle.currentOdometerKm.toLocaleString()} KM
                </span>
              </div>
              <button
                onClick={() => onSelectVehicle(selectedVehicle)}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors flex items-center gap-1 shadow-xs"
              >
                View Full Spec <Maximize2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
