"use client";

import { useCallback, useEffect, useState } from "react";
import API from "../lib/api";
import {
  FaBrain,
  FaChartBar,
  FaCheckCircle,
  FaLayerGroup,
  FaRedo,
} from "react-icons/fa";

interface ReviewSummary {
  totalReviews: number;
  uniqueCardsReviewed: number;
  successfulReviews: number;
  difficultReviews: number;
  accuracyPercent: number;
}

interface RatingCounts {
  again: number;
  hard: number;
  good: number;
  easy: number;
}

interface DailyActivity {
  date: string;
  reviews: number;
}

interface ReviewStatsResponse {
  summary: ReviewSummary;
  ratingCounts: RatingCounts;
  dailyActivity: DailyActivity[];
}

const ratingStyles = {
  again: {
    label: "Again",
    color: "bg-red-500",
    text: "text-red-700",
    background: "bg-red-50",
  },
  hard: {
    label: "Hard",
    color: "bg-orange-500",
    text: "text-orange-700",
    background: "bg-orange-50",
  },
  good: {
    label: "Good",
    color: "bg-green-500",
    text: "text-green-700",
    background: "bg-green-50",
  },
  easy: {
    label: "Easy",
    color: "bg-blue-500",
    text: "text-blue-700",
    background: "bg-blue-50",
  },
} as const;

export default function ReviewStatistics() {
  const [stats, setStats] = useState<ReviewStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await API.get<ReviewStatsResponse>("/api/reviews/stats");

      setStats(response.data);
    } catch (err) {
      console.error("Failed to load review statistics:", err);
      setError("Could not load your statistics. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  if (loading) {
    return (
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <FaBrain className="text-xl text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">Review Statistics</h2>
        </div>
        <p className="mt-5 text-sm text-gray-500">Loading your statistics...</p>
      </section>
    );
  }

  if (error || !stats) {
    return (
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">Review Statistics</h2>
        <p className="mt-3 text-sm text-red-600">
          {error || "Statistics are unavailable."}
        </p>
        <button
          type="button"
          onClick={() => void loadStats()}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <FaRedo />
          Try again
        </button>
      </section>
    );
  }

  const { summary, ratingCounts, dailyActivity } = stats;

  const ratingTotal =
    ratingCounts.again +
    ratingCounts.hard +
    ratingCounts.good +
    ratingCounts.easy;

  const maxDailyReviews = Math.max(
    1,
    ...dailyActivity.map((day) => day.reviews),
  );

  const formatDay = (date: string) => {
    const parsedDate = new Date(`${date}T12:00:00`);
    return parsedDate.toLocaleDateString("en", {
      weekday: "short",
    });
  };

  return (
    <section className="space-y-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
          <FaChartBar className="text-xl" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900">Review Statistics</h2>
          <p className="text-sm text-gray-500">
            Track your progress and keep learning.
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">Total reviews</p>
            <FaBrain className="text-blue-600" />
          </div>
          <p className="mt-3 text-3xl font-bold text-gray-900">
            {summary.totalReviews}
          </p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">Cards reviewed</p>
            <FaLayerGroup className="text-purple-600" />
          </div>
          <p className="mt-3 text-3xl font-bold text-gray-900">
            {summary.uniqueCardsReviewed}
          </p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">Success rate</p>
            <FaCheckCircle className="text-green-600" />
          </div>
          <p className="mt-3 text-3xl font-bold text-gray-900">
            {summary.accuracyPercent}%
          </p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">Difficult reviews</p>
            <FaRedo className="text-orange-600" />
          </div>
          <p className="mt-3 text-3xl font-bold text-gray-900">
            {summary.difficultReviews}
          </p>
        </div>
      </div>

      {/* Rating distribution */}
      <div className="rounded-xl border border-gray-100 p-4 sm:p-5">
        <div className="mb-5">
          <h3 className="font-bold text-gray-900">Rating Distribution</h3>
          <p className="mt-1 text-sm text-gray-500">
            How you rated your cards.
          </p>
        </div>

        <div className="space-y-4">
          {(Object.keys(ratingStyles) as Array<keyof RatingCounts>).map(
            (rating) => {
              const style = ratingStyles[rating];
              const count = ratingCounts[rating];
              const percentage =
                ratingTotal > 0 ? (count / ratingTotal) * 100 : 0;

              return (
                <div key={rating}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span
                      className={`rounded-md px-2 py-1 text-xs font-semibold ${style.background} ${style.text}`}
                    >
                      {style.label}
                    </span>
                    <span className="text-sm font-semibold text-gray-700">
                      {count} ({percentage.toFixed(0)}%)
                    </span>
                  </div>

                  <div
                    className="h-2.5 overflow-hidden rounded-full bg-gray-100"
                    role="progressbar"
                    aria-label={`${style.label} ratings`}
                    aria-valuenow={count}
                    aria-valuemin={0}
                    aria-valuemax={ratingTotal}
                  >
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${style.color}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            },
          )}
        </div>
      </div>

      {/* Weekly activity */}
      <div className="rounded-xl border border-gray-100 p-4 sm:p-5">
        <div className="mb-6">
          <h3 className="font-bold text-gray-900">Weekly Activity</h3>
          <p className="mt-1 text-sm text-gray-500">
            Your reviews over the last 7 days.
          </p>
        </div>

        <div className="flex h-44 items-end justify-between gap-2 sm:gap-4">
          {dailyActivity.map((day) => {
            const height =
              day.reviews > 0
                ? Math.max(8, (day.reviews / maxDailyReviews) * 100)
                : 0;

            return (
              <div
                key={day.date}
                className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
              >
                <span className="text-xs font-semibold text-gray-700">
                  {day.reviews}
                </span>

                <div className="flex h-28 w-full items-end justify-center">
                  <div
                    className={`w-full max-w-10 rounded-t-md transition-all duration-500 ${
                      day.reviews > 0
                        ? "bg-blue-500 hover:bg-blue-600"
                        : "bg-gray-100"
                    }`}
                    style={{
                      height: `${day.reviews > 0 ? height : 4}%`,
                    }}
                    title={`${day.reviews} reviews`}
                  />
                </div>

                <span className="text-xs text-gray-500">
                  {formatDay(day.date)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-xs leading-5 text-gray-500">
        Success rate is based on Good and Easy ratings. It reflects your
        self-assessment, not an independently verified answer accuracy score.
      </p>
    </section>
  );
}
