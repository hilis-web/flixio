"use client";

import { useCallback, useEffect, useState } from "react";
import API from "../lib/api";
import {
  FaBullseye,
  FaCheckCircle,
  FaEdit,
  FaFire,
  FaRedo,
  FaSave,
  FaTimes,
} from "react-icons/fa";

interface DailyGoalData {
  targetReviews: number;
  completed: number;
  remaining: number;
  progressPercent: number;
}

export default function DailyLearningGoal() {
  const [goal, setGoal] = useState<DailyGoalData | null>(null);
  const [target, setTarget] = useState(20);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadGoal = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await API.get<DailyGoalData>("/api/daily-goal");

      setGoal(response.data);
      setTarget(response.data.targetReviews);
    } catch (err) {
      console.error("Failed to load daily goal:", err);
      setError("Could not load your daily goal.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadGoal();
  }, [loadGoal]);

  const saveGoal = async () => {
    if (!Number.isInteger(target) || target < 5 || target > 200) {
      setError("Choose a goal between 5 and 200 reviews.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      await API.put("/api/daily-goal", {
        targetReviews: target,
      });

      setEditing(false);
      setMessage("Your daily goal has been updated.");

      // Reload the goal and current progress.
      await loadGoal();
    } catch (err) {
      console.error("Failed to update daily goal:", err);
      setError("Could not save your goal. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-500">Loading your daily goal...</p>
      </section>
    );
  }

  if (!goal) {
    return (
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">Daily Learning Goal</h2>

        <p className="mt-3 text-sm text-red-600">
          {error || "Your daily goal is unavailable."}
        </p>

        <button
          type="button"
          onClick={() => void loadGoal()}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <FaRedo />
          Try again
        </button>
      </section>
    );
  }

  const completedGoal = goal.completed >= goal.targetReviews;

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-amber-100 p-3 text-amber-600">
            <FaBullseye className="text-xl" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Daily Learning Goal
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Small steps, consistent progress.
            </p>
          </div>
        </div>

        {!editing && (
          <button
            type="button"
            onClick={() => {
              setTarget(goal.targetReviews);
              setEditing(true);
              setError("");
              setMessage("");
            }}
            aria-label="Edit daily learning goal"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <FaEdit />
            <span className="hidden sm:inline">Edit goal</span>
          </button>
        )}
      </div>

      {/* Goal editor */}
      {editing && (
        <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
          <label
            htmlFor="daily-review-target"
            className="block text-sm font-semibold text-gray-800"
          >
            Reviews per day
          </label>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <input
              id="daily-review-target"
              type="number"
              min={5}
              max={200}
              step={5}
              value={target}
              onChange={(event) => {
                setTarget(Number(event.target.value));
                setError("");
              }}
              className="w-28 rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <button
              type="button"
              onClick={() => void saveGoal()}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FaSave />
              {saving ? "Saving..." : "Save"}
            </button>

            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setTarget(goal.targetReviews);
                setError("");
              }}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              <FaTimes />
              Cancel
            </button>
          </div>

          <p className="mt-2 text-xs text-gray-500">
            Choose a goal between 5 and 200 reviews.
          </p>
        </div>
      )}

      {/* Feedback */}
      {error && (
        <p role="alert" className="mt-4 text-sm text-red-600">
          {error}
        </p>
      )}

      {message && (
        <p role="status" className="mt-4 text-sm text-green-700">
          {message}
        </p>
      )}

      {/* Progress summary */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-sm text-gray-500">Completed today</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {goal.completed}
            <span className="ml-1 text-base font-medium text-gray-400">
              / {goal.targetReviews}
            </span>
          </p>
        </div>

        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-sm text-gray-500">Remaining</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {goal.remaining}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {goal.remaining === 1 ? "review left" : "reviews left"}
          </p>
        </div>

        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-sm text-gray-500">Daily progress</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {goal.progressPercent}%
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {completedGoal ? "Goal achieved!" : "Keep going!"}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="text-sm font-semibold text-gray-700">
            Today's progress
          </span>

          <span className="text-sm text-gray-500">{goal.progressPercent}%</span>
        </div>

        <div
          className="h-3 overflow-hidden rounded-full bg-gray-100"
          role="progressbar"
          aria-label="Daily learning goal progress"
          aria-valuenow={goal.progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              completedGoal ? "bg-green-500" : "bg-blue-500"
            }`}
            style={{ width: `${goal.progressPercent}%` }}
          />
        </div>
      </div>

      {/* Completion message */}
      {completedGoal ? (
        <div className="mt-5 flex items-start gap-3 rounded-xl bg-green-50 p-4">
          <FaCheckCircle className="mt-0.5 shrink-0 text-green-600" />
          <div>
            <p className="font-semibold text-green-800">
              Congratulations! You reached your daily goal.
            </p>
            <p className="mt-1 text-sm text-green-700">
              You can keep reviewing to strengthen your memory.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-5 flex items-start gap-3 rounded-xl bg-amber-50 p-4">
          <FaFire className="mt-0.5 shrink-0 text-amber-600" />
          <div>
            <p className="font-semibold text-gray-800">You can do it!</p>
            <p className="mt-1 text-sm text-gray-600">
              Complete {goal.remaining} more{" "}
              {goal.remaining === 1 ? "review" : "reviews"} to reach your daily
              goal.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
