export type VehicleStatus = 'active' | 'in_transit' | 'maintenance' | 'idle' | 'out_of_service';

export type VehicleType = 'truck' | 'van' | 'sedan' | 'pickup' | 'cargo_bus' | 'refrigerated';

export type FuelType = 'diesel' | 'gasoline' | 'electric' | 'hybrid';

export interface Vehicle {
  id: string;
  name: string;
  plateNumber: string;
  vin: string;
  type: VehicleType;
  make: string;
  model: string;
  year: number;
  status: VehicleStatus;
  fuelType: FuelType;
  tankCapacityLiters: number;
  currentOdometerKm: number;
  assignedDriverId?: string;
  assignedDriverName?: string;
  locationName: string;
  coordinates: { lat: number; lng: number };
  lastServiceDate: string;
  nextServiceDueDate: string;
  nextServiceOdometerKm: number;
  avgEfficiencyKmpl: number;
  insuranceExpiry: string;
  image?: string;
}

export type DriverStatus = 'available' | 'on_duty' | 'off_duty' | 'suspended';

export interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseClass: string;
  licenseExpiry: string;
  status: DriverStatus;
  assignedVehicleId?: string;
  assignedVehicleName?: string;
  rating: number; // 1 to 5
  totalTripsCompleted: number;
  totalDistanceKm: number;
  joinedDate: string;
  avatarUrl?: string;
}

export type TripStatus = 'scheduled' | 'en_route' | 'completed' | 'cancelled';

export interface Trip {
  id: string;
  tripCode: string;
  vehicleId: string;
  vehicleName: string;
  vehiclePlate: string;
  driverId: string;
  driverName: string;
  startLocation: string;
  destination: string;
  cargoDescription: string;
  cargoWeightKg: number;
  estimatedDistanceKm: number;
  status: TripStatus;
  startTime: string;
  estimatedEndTime: string;
  actualEndTime?: string;
  progressPercent: number;
  notes?: string;
}

export type MaintenanceType = 'oil_change' | 'tire_replacement' | 'brake_service' | 'engine_repair' | 'inspection' | 'scheduled_service';
export type MaintenancePriority = 'low' | 'medium' | 'high' | 'critical';
export type MaintenanceStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface MaintenanceRecord {
  id: string;
  workOrderNumber: string;
  vehicleId: string;
  vehicleName: string;
  vehiclePlate: string;
  type: MaintenanceType;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  description: string;
  serviceProvider: string;
  costAmount: number;
  scheduledDate: string;
  completedDate?: string;
  odometerKmAtService: number;
  notes?: string;
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  vehicleName: string;
  vehiclePlate: string;
  driverId?: string;
  driverName?: string;
  date: string;
  liters: number;
  totalCost: number;
  pricePerLiter: number;
  odometerKm: number;
  stationName: string;
  isFullTank: boolean;
  calculatedKmpl?: number;
}

export interface FleetAlert {
  id: string;
  type: 'maintenance_due' | 'license_expiring' | 'insurance_expiring' | 'fuel_anomaly' | 'trip_delay';
  severity: 'low' | 'medium' | 'high';
  title: string;
  message: string;
  date: string;
  relatedEntityId?: string;
  isRead: boolean;
}

export interface FleetSettings {
  currency: 'USD' | 'BDT' | 'EUR' | 'GBP';
  distanceUnit: 'km' | 'mi';
  fuelUnit: 'L' | 'gal';
  companyName: string;
  maintenanceAlertThresholdDays: number;
  licenseAlertThresholdDays: number;
}
