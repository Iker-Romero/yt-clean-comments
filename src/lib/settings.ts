import { ext } from './ext';

export interface Settings {
  /** Master switch. When off, the content script leaves the page untouched. */
  enabled: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  enabled: true,
};

const STORAGE_AREA = 'sync' as const;

export async function loadSettings(): Promise<Settings> {
  try {
    const stored = await ext.storage[STORAGE_AREA].get(DEFAULT_SETTINGS);
    return { ...DEFAULT_SETTINGS, ...(stored as Partial<Settings>) };
  } catch {
    // Storage can be unavailable in a private window or a locked-down profile.
    // Defaulting to enabled fails closed: avatars stay hidden.
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(patch: Partial<Settings>): Promise<void> {
  await ext.storage[STORAGE_AREA].set(patch);
}

export function onSettingsChanged(listener: (settings: Settings) => void): void {
  ext.storage.onChanged.addListener((changes, area) => {
    if (area !== STORAGE_AREA) return;
    const patch: Partial<Settings> = {};
    for (const key of Object.keys(DEFAULT_SETTINGS) as (keyof Settings)[]) {
      const change = changes[key];
      if (change) patch[key] = change.newValue as never;
    }
    if (Object.keys(patch).length > 0) {
      listener({ ...DEFAULT_SETTINGS, ...patch });
    }
  });
}
