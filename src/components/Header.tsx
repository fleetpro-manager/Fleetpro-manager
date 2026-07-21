import React, { useState } from 'react';
import {
  Bell,
  Search,
  Plus,
  Truck,
  Fuel,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  Building2,
} from 'lucide-react';
import { FleetAlert, FleetSettings } from '../types/fleet';
import { formatRelativeTime } from '../utils/formatters';

interface HeaderProps {
  title: string;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  alerts: FleetAlert[];
  onMarkAlertRead: (id: string) => void;
  onOpenDispatchModal: () => void;
  onOpenFuelModal: () => void;
  onOpenVehicleModal: () => void;
  settings: FleetSettings;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  searchQuery,
  setSearchQuery,
  alerts,
  onMarkAlertRead,
  onOpenDispatchModal,
  onOpenFuelModal,
  onOpenVehicleModal,
  settings,
}) => {
  const [showAlertsMenu, setShowAlertsMenu] = useState(false);
  const unreadAlerts = alerts.filter((a) => !a.isRead);

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-xs">
      {/* Title & Company */}
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
          <p className="text-xs text-slate-500 flex items-center gap-1 font-medium">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            {settings.companyName}
          </p>
        </div>
      </div>

      {/* Center Search Bar */}
      <div className="flex-1 max-w-md mx-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search vehicles, registration, drivers, trips, orders..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Quick Dispatch & Fuel Buttons */}
        <div className="hidden sm:flex items-center gap-2 border-r border-slate-200 pr-3">
          <button
            onClick={onOpenDispatchModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium text-xs shadow-xs transition-colors"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Dispatch Trip</span>
          </button>
          <button
            onClick={onOpenFuelModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-medium text-xs shadow-xs transition-colors"
          >
            <Fuel className="w-3.5 h-3.5" />
            <span>Log Fuel</span>
          </button>
          <button
            onClick={onOpenVehicleModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-slate-500" />
            <span>Add Vehicle</span>
          </button>
        </div>

        {/* Currency/Unit Tag */}
        <div className="hidden md:flex items-center px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold">
          {settings.currency} • {settings.distanceUnit.toUpperCase()}
        </div>

        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowAlertsMenu(!showAlertsMenu)}
            className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors focus:outline-hidden"
            aria-label="Alerts"
          >
            <Bell className="w-5 h-5" />
            {unreadAlerts.length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-500 rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>

          {showAlertsMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 text-sm">System Alerts</h3>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                  {unreadAlerts.length} new
                </span>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {alerts.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">No alerts at present</div>
                ) : (
                  alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-3 hover:bg-slate-50 transition-colors text-xs ${
                        !alert.isRead ? 'bg-amber-50/50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        {alert.severity === 'high' ? (
                          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        ) : alert.severity === 'medium' ? (
                          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        ) : (
                          <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-900">{alert.title}</span>
                            <span className="text-[10px] text-slate-400">
                              {formatRelativeTime(alert.date)}
                            </span>
                          </div>
                          <p className="text-slate-600 mt-0.5 leading-relaxed">{alert.message}</p>
                          {!alert.isRead && (
                            <button
                              onClick={() => onMarkAlertRead(alert.id)}
                              className="mt-1 text-[11px] text-blue-600 hover:underline font-medium flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3 h-3" /> Mark read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Manager User Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            FM
          </div>
          <div className="hidden lg:block text-xs">
            <p className="font-semibold text-slate-900">Fleet Dispatcher</p>
            <p className="text-slate-500 text-[11px]">Operations Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
};
