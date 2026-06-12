import React, { useState } from 'react';
import { Settings as SettingsIcon, Moon, Sun, User } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label } from '@/components/ui';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import { getApiErrorMessage } from '@/lib/utils';

export function SettingsPage(): React.JSX.Element {
  const { darkMode, toggleDarkMode } = useUIStore();
  const { user } = useAuthStore();
  const [name, setName] = useState(user?.name ?? '');
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  const handleSaveProfile = async (): Promise<void> => {
    setSaving(true);
    try {
      await api.put('/users/profile', { name });
      setSavedMsg('Profile updated successfully');
      setTimeout(() => setSavedMsg(''), 3000);
    } catch (err) {
      setSavedMsg(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout title="Settings">
      <div className="max-w-2xl space-y-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-primary" aria-hidden="true" />
            Settings
          </h2>
          <p className="text-muted-foreground text-sm mt-1">Manage your account and preferences</p>
        </div>

        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4" aria-hidden="true" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="profile-name">Display name</Label>
              <Input
                id="profile-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-describedby={savedMsg ? 'profile-save-msg' : undefined}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="profile-email">Email address</Label>
              <Input id="profile-email" value={user?.email} disabled aria-readonly="true" />
              <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
            </div>
            {savedMsg && (
              <p id="profile-save-msg" className={`text-sm ${savedMsg.includes('success') ? 'text-green-600' : 'text-destructive'}`} role="status" aria-live="polite">
                {savedMsg}
              </p>
            )}
            <Button onClick={() => void handleSaveProfile()} loading={saving} aria-label="Save profile changes">
              Save Profile
            </Button>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              {darkMode ? <Moon className="h-4 w-4" aria-hidden="true" /> : <Sun className="h-4 w-4" aria-hidden="true" />}
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Dark Mode</p>
                <p className="text-xs text-muted-foreground mt-0.5">Toggle between light and dark theme</p>
              </div>
              <button
                role="switch"
                aria-checked={darkMode}
                aria-label="Toggle dark mode"
                onClick={toggleDarkMode}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                  ${darkMode ? 'bg-primary' : 'bg-muted'}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-1'}`}
                  aria-hidden="true"
                />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Account info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Role</dt>
                <dd className="font-medium capitalize">{user?.role?.toLowerCase()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Account ID</dt>
                <dd className="font-mono text-xs text-muted-foreground">{user?.id}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
