import {
  Vehicle,
  Driver,
  Trip,
  MaintenanceRecord,
  FuelLog,
  FleetAlert,
  FleetSettings,
} from '../types/fleet';
import {
  INITIAL_VEHICLES,
  INITIAL_DRIVERS,
  INITIAL_TRIPS,
  INITIAL_MAINTENANCE,
  INITIAL_FUEL_LOGS,
  INITIAL_ALERTS,
  INITIAL_SETTINGS,
} from '../data/mockData';

const STORAGE_KEYS = {
  VEHICLES: 'fleetpro_vehicles_v1',
  DRIVERS: 'fleetpro_drivers_v1',
  TRIPS: 'fleetpro_trips_v1',
  MAINTENANCE: 'fleetpro_maintenance_v1',
  FUEL_LOGS: 'fleetpro_fuel_v1',
  ALERTS: 'fleetpro_alerts_v1',
  SETTINGS: 'fleetpro_settings_v1',
};

export const getStoredVehicles = (): Vehicle[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.VEHICLES);
    return data ? JSON.parse(data) : INITIAL_VEHICLES;
  } catch (e) {
    console.error('Error reading vehicles from localStorage', e);
    return INITIAL_VEHICLES;
  }
};

export const saveStoredVehicles = (vehicles: Vehicle[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles));
  } catch (e) {
    console.error('Error saving vehicles', e);
  }
};

export const getStoredDrivers = (): Driver[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.DRIVERS);
    return data ? JSON.parse(data) : INITIAL_DRIVERS;
  } catch (e) {
    return INITIAL_DRIVERS;
  }
};

export const saveStoredDrivers = (drivers: Driver[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(drivers));
  } catch (e) {
    console.error('Error saving drivers', e);
  }
};

export const getStoredTrips = (): Trip[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TRIPS);
    return data ? JSON.parse(data) : INITIAL_TRIPS;
  } catch (e) {
    return INITIAL_TRIPS;
  }
};

export const saveStoredTrips = (trips: Trip[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(trips));
  } catch (e) {
    console.error('Error saving trips', e);
  }
};

export const getStoredMaintenance = (): MaintenanceRecord[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.MAINTENANCE);
    return data ? JSON.parse(data) : INITIAL_MAINTENANCE;
  } catch (e) {
    return INITIAL_MAINTENANCE;
  }
};

export const saveStoredMaintenance = (records: MaintenanceRecord[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.MAINTENANCE, JSON.stringify(records));
  } catch (e) {
    console.error('Error saving maintenance', e);
  }
};

export const getStoredFuelLogs = (): FuelLog[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.FUEL_LOGS);
    return data ? JSON.parse(data) : INITIAL_FUEL_LOGS;
  } catch (e) {
    return INITIAL_FUEL_LOGS;
  }
};

export const saveStoredFuelLogs = (logs: FuelLog[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.FUEL_LOGS, JSON.stringify(logs));
  } catch (e) {
    console.error('Error saving fuel logs', e);
  }
};

export const getStoredAlerts = (): FleetAlert[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ALERTS);
    return data ? JSON.parse(data) : INITIAL_ALERTS;
  } catch (e) {
    return INITIAL_ALERTS;
  }
};

export const saveStoredAlerts = (alerts: FleetAlert[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
  } catch (e) {
    console.error('Error saving alerts', e);
  }
};

export const getStoredSettings = (): FleetSettings => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : INITIAL_SETTINGS;
  } catch (e) {
    return INITIAL_SETTINGS;
  }
};

export const saveStoredSettings = (settings: FleetSettings): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings', e);
  }
};

export const resetAllFleetData = (): void => {
  try {
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
  } catch (e) {
    console.error('Error resetting data', e);
  }
};
