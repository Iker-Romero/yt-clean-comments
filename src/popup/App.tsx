import { useEffect, useState } from 'react';

import { DEFAULT_SETTINGS, loadSettings, saveSettings, type Settings } from '@/lib/settings';
import { Label } from '@/popup/components/ui/label';
import { Switch } from '@/popup/components/ui/switch';

export function App() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void loadSettings().then((loaded) => {
      setSettings(loaded);
      setReady(true);
    });
  }, []);

  const update = (patch: Partial<Settings>) => {
    setSettings((current) => ({ ...current, ...patch }));
    void saveSettings(patch);
  };

  return (
    <main className="flex flex-col gap-4 p-4">
      <header>
        <h1 className="text-sm font-semibold">Clean Comments</h1>
        <p className="text-muted-foreground text-xs">
          Replaces every YouTube comment profile picture with a neutral letter avatar.
        </p>
      </header>

      <div className="border-border flex items-center justify-between gap-3 rounded-lg border p-3">
        <Label htmlFor="enabled" className="text-xs font-normal">
          Replace profile pictures
        </Label>
        <Switch
          id="enabled"
          checked={settings.enabled}
          disabled={!ready}
          onCheckedChange={(enabled) => update({ enabled })}
        />
      </div>

      <p className="text-muted-foreground text-[11px] leading-relaxed">
        Applies to every commenter without exception, so no profile is ever singled out.
        Reload an open YouTube tab after changing this.
      </p>
    </main>
  );
}
