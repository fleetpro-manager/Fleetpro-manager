import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Search,
  Filter,
  Grid,
  List,
  Wrench,
  Gauge,
  Fuel,
  User,
  MoreVertical,
  Calendar,
  ShieldAlert,
  ChevronRight,
  Trash2,
  Edit2,
  Eye,
} from 'lucide-react';
import { Vehicle, VehicleStatus, VehicleType, FleetSettings } from '../../types/fleet';
import { formatCurrency, formatDistance, formatEfficiency, formatDate } from '../../utils/formatters';

interface VehicleListProps {
  vehicles: Vehicle[];
  searchQuery: string;
  onOpenAddModal: () => void;
  onSelectVehicle: (v: Vehicle) => void;
  onEditVehicle: (v: Vehicle) => void;
  onDeleteVehicle: (id: string) => void;
  settings: FleetSettings;
}

export const VehicleList: React.FC<VehicleListProps> = ({
  vehicles,
  searchQuery,
  onOpenAddModal,
  onSelectVehicle,
  onEditVehicle,
  onDeleteVehicle,
  settings,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<VehicleType | 'all'>('all');

  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.vin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.model.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
    const matchesType = typeFilter === 'all' || v.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: VehicleStatus) => {
    switch (status) {
      case 'active':
        return <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200">Active</span>;
      case 'in_transit':
        return <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-bold text-xs border border-blue-200 animate-pulse">En Route</span>;
      case 'maintenance':
        return <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-xs border border-amber-200">In Workshop</span>;
      case 'idle':
        return <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200">Idle / Depot</span>;
      case 'out_of_service':
        return <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-bold text-xs border border-rose-200">Decommissioned</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-5">
      {/* Action Header & Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Left Status Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {(['all', 'active', 'in_transit', 'maintenance', 'idle'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors capitalize ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st === 'in_transit' ? 'En Route' : st}
            </button>
          ))}
        </div>

        {/* Right Type Filter & View Toggle */}
        <div className="flex items-center gap-3">
          {/* Type Dropdown */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as VehicleType | 'all')}
            className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-1.5 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">All Vehicle Types</option>
            <option value="truck">Heavy Trucks</option>
            <option value="van">Delivery Vans</option>
            <option value="pickup">Pickups</option>
            <option value="refrigerated">Cold Chain / Refrig</option>
            <option value="sedan">Executive / Admin</option>
          </select>

          {/* Grid/Table Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-white shadow-xs text-blue-600' : 'text-slate-500'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'table' ? 'bg-white shadow-xs text-blue-600' : 'text-slate-500'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Vehicle
          </button>
        </div>
      </div>

      {/* Vehicles Rendering */}
      {filteredVehicles.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Truck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-base">No Fleet Vehicles Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query or status filter to see registered vehicles.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredVehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
            >
              {/* Card Top Banner */}
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg shrink-0">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 text-sm truncate group-hover:text-blue-600 transition-colors">
                      {vehicle.name}
                    </h4>
                    <span className="inline-block bg-slate-800 text-slate-100 font-mono text-[11px] font-bold px-2 py-0.5 rounded-md mt-0.5">
                      {vehicle.plateNumber}
                    </span>
                  </div>
                </div>

                <div>{getStatusBadge(vehicle.status)}</div>
              </div>

              {/* Specs & Driver */}
              <div className="p-4 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div>
                    <span className="text-slate-400 text-[10px] block font-medium">TYPE & MAKE</span>
                    <span className="font-semibold text-slate-800 uppercase text-[11px]">
                      {vehicle.make} {vehicle.model}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block font-medium">YEAR & FUEL</span>
                    <span className="font-semibold text-slate-800 uppercase text-[11px]">
                      {vehicle.year} • {vehicle.fuelType}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-slate-500">
                      <User className="w-3.5 h-3.5 text-slate-400" /> Assigned Driver:
                    </span>
                    <span className="font-semibold text-slate-900 truncate">
                      {vehicle.assignedDriverName || 'Unassigned'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-slate-500">
                      <Gauge className="w-3.5 h-3.5 text-slate-400" /> Odometer:
                    </span>
                    <span className="font-semibold text-slate-900">
                      {formatDistance(vehicle.currentOdometerKm, settings.distanceUnit)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-slate-500">
                      <Fuel className="w-3.5 h-3.5 text-slate-400" /> Avg Efficiency:
                    </span>
                    <span className="font-semibold text-emerald-700">
                      {formatEfficiency(vehicle.avgEfficiencyKmpl, settings.distanceUnit, settings.fuelUnit)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> Next Service:
                    </span>
                    <span className="font-semibold text-slate-800">
                      {formatDate(vehicle.nextServiceDueDate)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectVehicle(vehicle)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 text-white font-medium text-xs hover:bg-slate-800 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" /> Specs & Logs
                </button>
                <button
                  onClick={() => onEditVehicle(vehicle)}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
                  title="Edit Vehicle"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDeleteVehicle(vehicle.id)}
                  className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Delete Vehicle"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                  <th className="py-3 px-4">Vehicle & Registration</th>
                  <th className="py-3 px-4">Type & Model</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Driver</th>
                  <th className="py-3 px-4">Odometer</th>
                  <th className="py-3 px-4">Efficiency</th>
                  <th className="py-3 px-4">Next Service</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{vehicle.name}</div>
                      <span className="font-mono text-[11px] bg-slate-800 text-slate-100 px-1.5 py-0.5 rounded-sm">
                        {vehicle.plateNumber}
                      </span>
                    </td>
                    <td className="py-3 px-4 uppercase font-semibold">
                      {vehicle.make} {vehicle.model} ({vehicle.type})
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(vehicle.status)}</td>
                    <td className="py-3 px-4 text-slate-900 font-semibold">
                      {vehicle.assignedDriverName || 'Unassigned'}
                    </td>
                    <td className="py-3 px-4">
                      {formatDistance(vehicle.currentOdometerKm, settings.distanceUnit)}
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-700">
                      {formatEfficiency(vehicle.avgEfficiencyKmpl, settings.distanceUnit, settings.fuelUnit)}
                    </td>
                    <td className="py-3 px-4">{formatDate(vehicle.nextServiceDueDate)}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectVehicle(vehicle)}
                          className="p-1.5 rounded-md bg-slate-900 text-white hover:bg-slate-800"
                          title="View Specs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEditVehicle(vehicle)}
                          className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteVehicle(vehicle.id)}
                          className="p-1.5 rounded-md border border-rose-200 text-rose-600 hover:bg-rose-50"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
