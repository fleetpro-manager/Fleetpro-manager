import React from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle2, ChevronRight, Calendar, Bell } from 'lucide-react';
import { FleetAlert } from '../../types/fleet';
import { formatRelativeTime } from '../../utils/formatters';

interface AlertsPanelProps {
  alerts: FleetAlert[];
  onMarkAlertRead: (id: string) => void;
  onNavigateTab: (tab: 'vehicles' | 'drivers' | 'maintenance') => void;
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({
  alerts,
  onMarkAlertRead,
  onNavigateTab,
}) => {
  const unreadAlerts = alerts.filter((a) => !a.isRead);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-500" />
          <h3 className="font-bold text-slate-900 text-sm">Actionable Warnings</h3>
        </div>
        <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
          {unreadAlerts.length} Unresolved
        </span>
      </div>

      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-lg">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
            All vehicle inspections & driver licenses are up to date!
          </div>
        ) : (
          alerts.slice(0, 4).map((alert) => (
            <div
              key={alert.id}
              className={`p-3 rounded-xl border transition-all text-xs ${
                alert.severity === 'high'
                  ? 'bg-rose-50/60 border-rose-200 text-rose-950'
                  : alert.severity === 'medium'
                  ? 'bg-amber-50/60 border-amber-200 text-amber-950'
                  : 'bg-blue-50/60 border-blue-200 text-blue-950'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 font-bold">
                  <AlertTriangle
                    className={`w-4 h-4 shrink-0 ${
                      alert.severity === 'high'
                        ? 'text-rose-600'
                        : alert.severity === 'medium'
                        ? 'text-amber-600'
                        : 'text-blue-600'
                    }`}
                  />
                  <span>{alert.title}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium">
                  {formatRelativeTime(alert.date)}
                </span>
              </div>

              <p className="mt-1 text-slate-700 leading-relaxed">{alert.message}</p>

              <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                <button
                  onClick={() => {
                    if (alert.type === 'maintenance_due') onNavigateTab('maintenance');
                    else if (alert.type === 'license_expiring') onNavigateTab('drivers');
                    else onNavigateTab('vehicles');
                  }}
                  className="font-semibold text-blue-700 hover:underline flex items-center gap-1"
                >
                  Resolve Now <ChevronRight className="w-3 h-3" />
                </button>

                {!alert.isRead && (
                  <button
                    onClick={() => onMarkAlertRead(alert.id)}
                    className="text-slate-500 hover:text-slate-800 font-medium"
                  >
                    Dismiss
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
