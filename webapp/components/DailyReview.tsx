"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API from "../lib/api";
import { useAuth } from "../app/context/auth-context";
import { FaBrain, FaPlay, FaRedo } from "react-icons/fa";

interface ReviewGroup {
  groupId: number;
  title: string;
  newCards: number;
  dueCards: number;
  isSaved: boolean;
}

interface UserGroup {
  id: number;
  group_id?: number;
  title: string;
}

interface ReviewCard {
  id: number;
  is_new: boolean;
}

interface DueCardsResponse {
  groupId: number;
  totalDue: number;
  cards: ReviewCard[];
}

export default function DailyReview() {
  const router = useRouter();
  const { user } = useAuth();

  const [groups, setGroups] = useState<ReviewGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDailyReview = useCallback(async () => {
    if (!user?.id) {
      setGroups([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [ownedResponse, savedResponse] = await Promise.all([
        API.get<UserGroup[]>("/groups/me"),
        API.get<UserGroup[]>("/saved-groups/me"),
      ]);

      const ownedGroups = Array.isArray(ownedResponse.data)
        ? ownedResponse.data
        : [];

      const savedGroups = Array.isArray(savedResponse.data)
        ? savedResponse.data
        : [];

      // Combine owned and saved groups, keeping each group only once.
      const uniqueGroups = new Map<
        number,
        { id: number; title: string; isSaved: boolean }
      >();

      for (const group of ownedGroups) {
        const id = Number(group.id);

        if (Number.isInteger(id) && id > 0) {
          uniqueGroups.set(id, {
            id,
            title: group.title,
            isSaved: false,
          });
        }
      }

      for (const group of savedGroups) {
        const id = Number(group.group_id ?? group.id);

        if (Number.isInteger(id) && id > 0) {
          const existing = uniqueGroups.get(id);

          if (existing) {
            // An owned group remains classified as owned.
            continue;
          }

          uniqueGroups.set(id, {
            id,
            title: group.title,
            isSaved: true,
          });
        }
      }

      const results = await Promise.all(
        Array.from(uniqueGroups.values()).map(async (group) => {
          try {
            const reviewResponse = await API.get<DueCardsResponse>(
              `/api/reviews/group/${group.id}`,
            );

            const cards = reviewResponse.data.cards ?? [];

            return {
              groupId: group.id,
              title: group.title,
              newCards: cards.filter((card) => card.is_new).length,
              dueCards: cards.filter((card) => !card.is_new).length,
              isSaved: group.isSaved,
            };
          } catch (err) {
            console.error(
              `Failed to load review cards for group ${group.id}:`,
              err,
            );

            return null;
          }
        }),
      );

      setGroups(
        results.filter(
          (group): group is ReviewGroup =>
            group !== null && (group.newCards > 0 || group.dueCards > 0),
        ),
      );
    } catch (err) {
      console.error("Failed to load daily review:", err);
      setError("Could not load your daily review. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void loadDailyReview();
  }, [loadDailyReview]);

  const totalNew = groups.reduce((total, group) => total + group.newCards, 0);

  const totalDue = groups.reduce((total, group) => total + group.dueCards, 0);

  if (!user?.id) {
    return (
      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <FaBrain className="text-2xl text-blue-600" />
          <div>
            <h2 className="text-lg font-bold text-gray-900">Daily Review</h2>
            <p className="text-sm text-gray-600">
              Sign in to track your flashcard review progress.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-lg bg-blue-100 p-3 text-blue-700">
          <FaBrain className="text-xl" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900">Daily Review</h2>
          <p className="text-sm text-gray-500">
            Keep your memory strong, one card at a time.
          </p>
        </div>
      </div>

      {loading ? (
        <p className="py-4 text-sm text-gray-500">
          Loading your review cards...
        </p>
      ) : error ? (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => void loadDailyReview()}
            className="mt-3 inline-flex items-center gap-2 font-semibold hover:underline"
          >
            <FaRedo />
            Try again
          </button>
        </div>
      ) : (
        <>
          <div className="mb-5 grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-blue-50 p-4">
              <p className="text-sm text-blue-700">New cards</p>
              <p className="mt-1 text-2xl font-bold text-blue-900">
                {totalNew}
              </p>
            </div>

            <div className="rounded-lg bg-orange-50 p-4">
              <p className="text-sm text-orange-700">Due for review</p>
              <p className="mt-1 text-2xl font-bold text-orange-900">
                {totalDue}
              </p>
            </div>
          </div>

          {groups.length === 0 ? (
            <div className="rounded-lg bg-gray-50 p-5 text-center">
              <p className="font-semibold text-gray-800">
                You&apos;re all caught up!
              </p>
              <p className="mt-1 text-sm text-gray-500">
                You have no new or due cards in your owned or saved groups.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {groups.map((group) => (
                <div
                  key={group.groupId}
                  className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {group.title}
                    </h3>

                    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                      <span>
                        {group.newCards} new · {group.dueCards} due
                      </span>

                      {group.isSaved && (
                        <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                          Saved group
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => router.push(`/group/${group.groupId}`)}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    <FaPlay className="text-xs" />
                    Start Review
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
