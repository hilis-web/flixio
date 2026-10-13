"use client";

import { useCallback, useEffect, useState } from "react";
import API from "../lib/api";
import { FaCalendarCheck, FaFire, FaRedo, FaTrophy } from "react-icons/fa";

interface LearningStreakData {
  currentStreak: number;
  longestStreak: number;
  activeDays: number;
}

export default function LearningStreak() {
  const [streak, setStreak] = useState<LearningStreakData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStreak = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await API.get<LearningStreakData>("/api/reviews/streak");

      setStreak(response.data);
    } catch (err) {
      console.error("Failed to load learning streak:", err);
      setError("Could not load your learning streak.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStreak();
  }, [loadStreak]);

  if (loading) {
    return (
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-500">Loading your learning streak...</p>
      </section>
    );
  }

  if (!streak) {
    return (
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">Learning Streak</h2>

        <p role="alert" className="mt-3 text-sm text-red-600">
          {error || "Your learning streak is unavailable."}
        </p>

        <button
          type="button"
          onClick={() => void loadStreak()}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <FaRedo />
          Try again
        </button>
      </section>
    );
  }

  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));

    return {
      key: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
      label: date.toLocaleDateString("en", { weekday: "short" }),
    };
  });

  const activeDayCount = Math.min(7, streak.activeDays);
  const hasActivity = streak.activeDays > 0;

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-orange-100 p-3 text-orange-600">
          <FaFire className="text-xl" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900">Learning Streak</h2>
          <p className="mt-1 text-sm text-gray-500">
            Build a daily learning habit.
          </p>
        </div>
      </div>

      {/* Main streak */}
      <div className="mt-6 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-100 p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-orange-800">
              Current streak
            </p>

            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-5xl font-extrabold text-gray-900">
                {streak.currentStreak}
              </span>

              <span className="text-sm font-semibold text-gray-600">
                {streak.currentStreak === 1 ? "day" : "days"}
              </span>
            </div>

            <p className="mt-2 text-sm text-gray-600">
              {streak.currentStreak === 0
                ? "Review a card today to start your streak."
                : streak.currentStreak === 1
                  ? "Great start! Come back tomorrow."
                  : "Keep going and protect your streak!"}
            </p>
          </div>

          <div className="flex size-20 shrink-0 items-center justify-center rounded-full bg-white/80 text-orange-500 shadow-sm">
            <FaFire className="text-4xl" />
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
          <div className="flex items-center gap-2 text-purple-600">
            <FaTrophy />
            <span className="text-sm font-medium text-gray-600">
              Best streak
            </span>
          </div>

          <p className="mt-3 text-2xl font-bold text-gray-900">
            {streak.longestStreak}
            <span className="ml-1 text-sm font-medium text-gray-500">days</span>
          </p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
          <div className="flex items-center gap-2 text-green-600">
            <FaCalendarCheck />
            <span className="text-sm font-medium text-gray-600">
              Active days
            </span>
          </div>

          <p className="mt-3 text-2xl font-bold text-gray-900">
            {streak.activeDays}
            <span className="ml-1 text-sm font-medium text-gray-500">/ 7</span>
          </p>
        </div>
      </div>

      {/* Weekly activity indicator */}
      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="font-bold text-gray-900">Last 7 days</h3>

          <span className="text-sm text-gray-500">
            {activeDayCount} active days
          </span>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, index) => {
            // This is a visual placeholder until the API returns
            // activity for each individual date.
            const active = hasActivity && index >= 7 - activeDayCount;

            return (
              <div
                key={day.key}
                className="flex min-w-0 flex-col items-center gap-2"
              >
                <div
                  className={`flex size-9 items-center justify-center rounded-full ${
                    active
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-400"
                  }`}
                  aria-label={`${day.label}: ${
                    active ? "activity indicator" : "no activity indicator"
                  }`}
                >
                  {active ? (
                    <FaCalendarCheck className="text-sm" />
                  ) : (
                    <span className="text-xs">—</span>
                  )}
                </div>

                <span className="text-xs text-gray-500">{day.label}</span>
              </div>
            );
          })}
        </div>

        <p className="mt-3 text-xs leading-5 text-gray-500">
          Your streak counts consecutive calendar days with at least one
          recorded review. The weekly indicators summarize your active-day count
          until daily activity data is available.
        </p>
      </div>

      {/* Refresh */}
      <button
        type="button"
        onClick={() => void loadStreak()}
        className="mt-5 inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
      >
        <FaRedo />
        Refresh streak
      </button>
    </section>
  );
}
