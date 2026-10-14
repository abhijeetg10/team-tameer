import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  Calendar, 
  ShieldCheck, 
  Users, 
  Mail, 
  Phone, 
  MapPin, 
  History,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { EventSettings, AuditLog } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const EventSettingsPage: React.FC = () => {
  const { user, role } = useAuth();
  const [settings, setSettings] = useState<EventSettings | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const s = await api.getEventSettings();
        setSettings(s);
        const logs = await api.getAuditLogs();
        setAuditLogs(logs);
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
    };
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings || !user) return;
    try {
      setIsSaving(true);
      setSaveError(null);
      setSaveSuccess(false);
      const updated = await api.updateEventSettings(settings, user);
      setSettings(updated);
      setSaveSuccess(true);
      const logs = await api.getAuditLogs();
      setAuditLogs(logs);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (!settings) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading event configuration...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Event Settings & System Administration
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure registration deadlines, participating school quotas, and view audit trail.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
            <Settings className="w-5 h-5 text-blue-600" />
            <span>Championship Operational Parameters</span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-700">
              Registration Portal Active:
            </label>
            <input
              type="checkbox"
              checked={settings.registration_open}
              onChange={(e) => setSettings({ ...settings, registration_open: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2">
            <Input
              label="Official Event Title"
              value={settings.event_name}
              onChange={(e) => setSettings({ ...settings, event_name: e.target.value })}
            />
          </div>

          <div>
            <Input
              label="Event Date / Conclave Date"
              value={settings.event_date}
              onChange={(e) => setSettings({ ...settings, event_date: e.target.value })}
            />
          </div>

          <div>
            <Input
              label="Registration Deadline Date"
              type="date"
              value={settings.registration_deadline ? settings.registration_deadline.slice(0, 10) : ''}
              onChange={(e) => setSettings({ ...settings, registration_deadline: new Date(e.target.value).toISOString() })}
            />
          </div>

          <div>
            <Input
              label="Maximum School Delegation Quota"
              type="number"
              value={settings.maximum_schools}
              onChange={(e) => setSettings({ ...settings, maximum_schools: parseInt(e.target.value) || 30 })}
            />
          </div>

          <div>
            <Input
              label="Official Secretariat Support Email"
              type="email"
              value={settings.support_email}
              onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
            />
          </div>

          <div className="sm:col-span-2">
            <Input
              label="Secretariat Contact Telephones"
              value={settings.contact_phone}
              onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
            />
          </div>

          <div className="sm:col-span-2">
            <Input
              label="Event Venue & Physical Address"
              value={settings.venue}
              onChange={(e) => setSettings({ ...settings, venue: e.target.value })}
            />
          </div>
        </div>

        {saveSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Event configuration updated successfully!</span>
          </div>
        )}

        {saveError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{saveError}</span>
          </div>
        )}

        <div className="flex items-center justify-end pt-4 border-t border-slate-100">
          <Button
            type="submit"
            size="md"
            variant="primary"
            isLoading={isSaving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Event Settings
          </Button>
        </div>
      </form>

      {/* Audit Logs Trail */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
          <History className="w-4 h-4 text-blue-600" />
          System & Document Access Audit Log
        </h3>
        <p className="text-xs text-slate-500">
          All status updates, configuration changes, and document preview inspections are logged for compliance.
        </p>

        <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
          {auditLogs.map((log) => (
            <div key={log.id} className="py-2.5 flex items-center justify-between text-xs gap-3">
              <div className="min-w-0">
                <span className="font-mono font-bold text-slate-800">{log.action}</span>
                <span className="text-slate-400 mx-2">•</span>
                <span className="text-slate-600 truncate">{log.actor_email}</span>
                {log.details && (
                  <span className="text-[11px] text-slate-400 block font-mono">
                    {JSON.stringify(log.details)}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-400 font-mono shrink-0">
                {new Date(log.timestamp).toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
