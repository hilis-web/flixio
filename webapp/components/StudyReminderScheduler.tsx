"use client";

import { useEffect } from "react";
import API from "../lib/api";
import { useAuth } from "../app/context/auth-context";

interface ReminderSettings {
  enabled: boolean;
  reminderTime: string;
  timezone: string;
}

function getDateInTimezone(timezone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );

  return `${values.year}-${values.month}-${values.day}`;
}

function getTimeInTimezone(timezone: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );

  return `${values.hour}:${values.minute}`;
}

export default function StudyReminderScheduler() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading || !user?.id) return;

    let active = true;
    let settings: ReminderSettings | null = null;
    let checking = false;

    const checkReminder = () => {
      if (!active || checking || !settings?.enabled) return;
      if (typeof window === "undefined") return;
      if (!("Notification" in window)) return;
      if (Notification.permission !== "granted") return;

      checking = true;

      try {
        const timezone = settings.timezone || "Europe/Madrid";
        const currentTime = getTimeInTimezone(timezone);

        if (currentTime < settings.reminderTime) return;

        const date = getDateInTimezone(timezone);
        const storageKey = `flixio-study-reminder-${user.id}-${date}`;

        if (localStorage.getItem(storageKey) === "sent") return;

        const notification = new Notification("Time to study! 📚", {
          body: "Take a few minutes to review your flashcards and keep your learning streak going.",
          icon: "/logo-fit.png",
          tag: storageKey,
        });

        localStorage.setItem(storageKey, "sent");

        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      } catch (error) {
        console.error("Study reminder error:", error);
      } finally {
        checking = false;
      }
    };

    const loadSettings = async () => {
      try {
        const response = await API.get<ReminderSettings>(
          "/api/study-reminders",
        );

        if (!active) return;

        settings = response.data;
        checkReminder();
      } catch (error) {
        console.error("Could not load study reminders:", error);
      }
    };

    void loadSettings();

    const intervalId = window.setInterval(() => {
      if (!settings) {
        void loadSettings();
      } else {
        checkReminder();
      }
    }, 15000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        if (!settings) {
          void loadSettings();
        } else {
          checkReminder();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    window.addEventListener("focus", checkReminder);

    return () => {
      active = false;
      window.clearInterval(intervalId);

      document.removeEventListener("visibilitychange", handleVisibilityChange);

      window.removeEventListener("focus", checkReminder);
    };
  }, [user?.id, loading]);

  return null;
}
