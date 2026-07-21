import React, { useState, useEffect } from 'react';
import { X, Truck, Save } from 'lucide-react';
import { Vehicle, VehicleType, VehicleStatus, FuelType, Driver } from '../../types/fleet';

interface VehicleFormModalProps {
  vehicle?: Vehicle | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (v: Partial<Vehicle>) => void;
  drivers: Driver[];
}

export const VehicleFormModal: React.FC<VehicleFormModalProps> = ({
  vehicle,
  isOpen,
  onClose,
  onSave,
  drivers,
}) => {
  const [formData, setFormData] = useState<Partial<Vehicle>>({
    name: '',
    plateNumber: '',
    vin: '',
    type: 'truck',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    status: 'active',
    fuelType: 'diesel',
    tankCapacityLiters: 300,
    currentOdometerKm: 10000,
    assignedDriverId: '',
    assignedDriverName: '',
    locationName: 'Central Logistics Hub',
    coordinates: { lat: 23.8103, lng: 90.4125 },
    lastServiceDate: new Date().toISOString().split('T')[0],
    nextServiceDueDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
    nextServiceOdometerKm: 15000,
    avgEfficiencyKmpl: 8.5,
    insuranceExpiry: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
  });

  useEffect(() => {
    if (vehicle) {
      setFormData(vehicle);
    } else {
      setFormData({
        name: '',
        plateNumber: `DHAKA-METRO-TA-${Math.floor(10 + Math.random() * 89)}-${Math.floor(1000 + Math.random() * 8999)}`,
        vin: `VIN${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
        type: 'truck',
        make: 'Volvo',
        model: 'FH16',
        year: 2023,
        status: 'active',
        fuelType: 'diesel',
        tankCapacityLiters: 400,
        currentOdometerKm: 25000,
        assignedDriverId: '',
        assignedDriverName: '',
        locationName: 'Central Freight Depot, Dhaka',
        coordinates: { lat: 23.8103, lng: 90.4125 },
        lastServiceDate: '2026-06-01',
        nextServiceDueDate: '2026-09-01',
        nextServiceOdometerKm: 35000,
        avgEfficiencyKmpl: 8.5,
        insuranceExpiry: '2027-04-15',
      });
    }
  }, [vehicle, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleDriverChange = (driverId: string) => {
    const selected = drivers.find((d) => d.id === driverId);
    setFormData((prev) => ({
      ...prev,
      assignedDriverId: driverId,
      assignedDriverName: selected ? selected.name : '',
    }));
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden my-8">
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">{vehicle ? 'Edit Vehicle Specifications' : 'Register New Fleet Vehicle'}</h2>
              <p className="text-xs text-slate-400">Enter vehicle registration, motor specs & telematics</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Vehicle Name / Alias *</label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Volvo FH16 Heavy Hauler"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">License Plate Number *</label>
              <input
                type="text"
                required
                value={formData.plateNumber || ''}
                onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                placeholder="e.g. DHAKA-METRO-TA-11-2041"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 font-mono font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Make / Brand</label>
              <input
                type="text"
                value={formData.make || ''}
                onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                placeholder="e.g. Volvo"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Model</label>
              <input
                type="text"
                value={formData.model || ''}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="e.g. FH16 750"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Year</label>
              <input
                type="number"
                value={formData.year || 2023}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || 2023 })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Vehicle Category</label>
              <select
                value={formData.type || 'truck'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as VehicleType })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 font-medium"
              >
                <option value="truck">Heavy Truck</option>
                <option value="van">Delivery Van</option>
                <option value="pickup">Utility Pickup</option>
                <option value="refrigerated">Cold Chain / Refrigerated</option>
                <option value="sedan">Executive Sedan</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Initial Operational Status</label>
              <select
                value={formData.status || 'active'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as VehicleStatus })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 font-medium"
              >
                <option value="active">Active Depot</option>
                <option value="in_transit">En Route / Dispatched</option>
                <option value="maintenance">In Workshop</option>
                <option value="idle">Idle / Standby</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Fuel Type</label>
              <select
                value={formData.fuelType || 'diesel'}
                onChange={(e) => setFormData({ ...formData, fuelType: e.target.value as FuelType })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 font-medium"
              >
                <option value="diesel">Diesel</option>
                <option value="gasoline">Gasoline / Octane</option>
                <option value="electric">Electric (EV)</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Current Odometer (KM)</label>
              <input
                type="number"
                value={formData.currentOdometerKm || 0}
                onChange={(e) => setFormData({ ...formData, currentOdometerKm: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tank Capacity (Liters)</label>
              <input
                type="number"
                value={formData.tankCapacityLiters || 0}
                onChange={(e) => setFormData({ ...formData, tankCapacityLiters: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Avg Efficiency (KM/L)</label>
              <input
                type="number"
                step="0.1"
                value={formData.avgEfficiencyKmpl || 8.5}
                onChange={(e) => setFormData({ ...formData, avgEfficiencyKmpl: parseFloat(e.target.value) || 8.5 })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 font-bold text-emerald-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Assign Driver</label>
              <select
                value={formData.assignedDriverId || ''}
                onChange={(e) => handleDriverChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900"
              >
                <option value="">-- Unassigned --</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.licenseClass})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Current Base Location</label>
              <input
                type="text"
                value={formData.locationName || ''}
                onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                placeholder="e.g. Central Depot, Tejgaon"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Next Service Due Date</label>
              <input
                type="date"
                value={formData.nextServiceDueDate || ''}
                onChange={(e) => setFormData({ ...formData, nextServiceDueDate: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Insurance Expiry Date</label>
              <input
                type="date"
                value={formData.insuranceExpiry || ''}
                onChange={(e) => setFormData({ ...formData, insuranceExpiry: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-2 shadow-md shadow-blue-600/20"
            >
              <Save className="w-4 h-4" />
              Save Vehicle Specs
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
