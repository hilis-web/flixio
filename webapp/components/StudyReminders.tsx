"use client";

import { useEffect, useState } from "react";
import API from "../lib/api";
import { useAuth } from "../app/context/auth-context";

interface ReminderSettings {
  enabled: boolean;
  reminderTime: string;
  timezone: string;
}

const DEFAULT_SETTINGS: ReminderSettings = {
  enabled: false,
  reminderTime: "19:00",
  timezone: "Europe/Madrid",
};

export default function StudyReminders() {
  const { user } = useAuth();

  const [settings, setSettings] = useState<ReminderSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadSettings() {
      try {
        const response = await API.get<ReminderSettings>(
          "/api/study-reminders",
        );

        if (active) {
          setSettings(response.data);
        }
      } catch (err) {
        console.error("Failed to load study reminders:", err);

        if (active) {
          setError("Could not load your reminder settings.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadSettings();

    return () => {
      active = false;
    };
  }, []);

  const handleSave = async () => {
    setMessage("");
    setError("");

    if (settings.enabled && !("Notification" in window)) {
      setError("Your browser does not support notifications.");
      return;
    }

    if (settings.enabled && Notification.permission === "denied") {
      setError(
        "Notifications are blocked. Allow them in your browser settings first.",
      );
      return;
    }

    setSaving(true);

    try {
      if (settings.enabled && Notification.permission === "default") {
        const permission = await Notification.requestPermission();

        if (permission !== "granted") {
          setError("Please allow browser notifications to enable reminders.");
          return;
        }
      }

      const timezone =
        Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Madrid";

      const response = await API.put("/api/study-reminders", {
        enabled: settings.enabled,
        reminderTime: settings.reminderTime,
        timezone,
      });

      setSettings(response.data.settings);

      setMessage(
        settings.enabled
          ? "Study reminder enabled and settings saved!"
          : "Study reminder disabled and settings saved.",
      );
    } catch (err) {
      console.error("Failed to save study reminders:", err);
      setError("Could not save your settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-500">Loading study reminders...</p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-xl">
          🔔
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Study Reminders
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Set a daily reminder to keep your learning streak going.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 border-b border-gray-100 py-4">
        <div>
          <p className="font-medium text-gray-800">Daily reminder</p>
          <p className="mt-1 text-sm text-gray-500">
            Receive a browser notification at your chosen time.
          </p>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={settings.enabled}
          onClick={() => {
            setSettings((current) => ({
              ...current,
              enabled: !current.enabled,
            }));
            setMessage("");
            setError("");
          }}
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
            settings.enabled ? "bg-emerald-600" : "bg-gray-300"
          }`}
          aria-label="Toggle daily study reminder"
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
              settings.enabled ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>

      <div className="py-5">
        <label
          htmlFor="study-reminder-time"
          className="mb-2 block text-sm font-medium text-gray-800"
        >
          Reminder time
        </label>

        <input
          id="study-reminder-time"
          type="time"
          value={settings.reminderTime}
          onChange={(event) => {
            setSettings((current) => ({
              ...current,
              reminderTime: event.target.value,
            }));
            setMessage("");
            setError("");
          }}
          disabled={!settings.enabled || saving}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-800 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-gray-100 sm:w-48"
        />
      </div>

      <p className="mb-4 text-xs leading-5 text-gray-500">
        Reminders work while Flixio is open and your browser permits
        notifications. They are not guaranteed when the website is closed or the
        browser suspends background work.
      </p>

      {message && (
        <p
          role="status"
          className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800"
        >
          {message}
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? "Saving..." : "Save settings"}
      </button>
    </section>
  );
}
