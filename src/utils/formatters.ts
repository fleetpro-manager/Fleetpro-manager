import { FleetSettings } from '../types/fleet';

export const formatCurrency = (amount: number, currency: FleetSettings['currency'] = 'USD'): string => {
  const symbolMap: Record<string, string> = {
    USD: '$',
    BDT: '৳',
    EUR: '€',
    GBP: '£',
  };

  const symbol = symbolMap[currency] || '$';
  
  // Format with thousand separators
  const formattedNumber = amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  return `${symbol}${formattedNumber}`;
};

export const formatDistance = (km: number, unit: FleetSettings['distanceUnit'] = 'km'): string => {
  if (unit === 'mi') {
    const miles = km * 0.621371;
    return `${miles.toLocaleString(undefined, { maximumFractionDigits: 0 })} mi`;
  }
  return `${km.toLocaleString(undefined, { maximumFractionDigits: 0 })} km`;
};

export const formatFuelVolume = (liters: number, unit: FleetSettings['fuelUnit'] = 'L'): string => {
  if (unit === 'gal') {
    const gallons = liters * 0.264172;
    return `${gallons.toFixed(1)} gal`;
  }
  return `${liters.toFixed(1)} L`;
};

export const formatEfficiency = (
  kmpl: number,
  distUnit: FleetSettings['distanceUnit'] = 'km',
  fuelUnit: FleetSettings['fuelUnit'] = 'L'
): string => {
  if (distUnit === 'mi' && fuelUnit === 'gal') {
    // 1 km/L = ~2.35215 MPG
    const mpg = kmpl * 2.35215;
    return `${mpg.toFixed(1)} MPG`;
  }
  return `${kmpl.toFixed(1)} km/L`;
};

export const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  } catch (e) {
    return dateString;
  }
};

export const formatRelativeTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays}d ago`;
    return formatDate(dateString);
  } catch (e) {
    return dateString;
  }
};
