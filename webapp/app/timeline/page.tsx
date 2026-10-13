"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API from "../../lib/api";
import { useAuth } from "../context/auth-context";
import CommentsSection from "../../components/CommentsSection";

interface Group {
  id: number;
  title: string;
  description: string;
  category_name: string;
  category_id: number;
  user_id: number;
  username: string;
  isSaved?: boolean;
  likesCount?: number;
  userLiked?: boolean;
}

interface Interest {
  category_id: number;
  name: string;
}

export default function TimelinePage() {
  const { user } = useAuth();
  const router = useRouter();

  const [groups, setGroups] = useState<Group[]>([]);
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [activeFilters, setActiveFilters] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingGroupIds, setSavingGroupIds] = useState<number[]>([]);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchTimeline = async () => {
      setLoading(true);
      setPageError("");

      try {
        const groupsRes = await API.get("/groups/public");

        if (cancelled) return;

        const publicGroups: Group[] = groupsRes.data;

        let savedGroupIds = new Set<number>();

        if (user) {
          const [interestsResult, savedResult] = await Promise.allSettled([
            API.get("/api/users/me"),
            API.get("/saved-groups/me"),
          ]);

          if (cancelled) return;

          if (interestsResult.status === "fulfilled") {
            const rawInterests = interestsResult.value.data.interests || [];

            const savedInterests: Interest[] = rawInterests.map(
              (item: any) => ({
                category_id: Number(item.category_id),
                name: item.name,
              }),
            );

            setInterests(savedInterests);
            setActiveFilters(savedInterests.map((item) => item.category_id));
          } else {
            console.error("Failed to load interests:", interestsResult.reason);
            setInterests([]);
            setActiveFilters([]);
          }

          if (savedResult.status === "fulfilled") {
            savedGroupIds = new Set<number>(
              (savedResult.value.data || []).map(
                (item: { group_id: number | string }) => Number(item.group_id),
              ),
            );
          } else {
            console.error("Failed to load saved groups:", savedResult.reason);
          }
        } else {
          setInterests([]);
          setActiveFilters([]);
        }

        const groupsWithSavedState = publicGroups.map((group) => ({
          ...group,
          isSaved: savedGroupIds.has(Number(group.id)),
        }));

        setAllGroups(groupsWithSavedState);
      } catch (err) {
        console.error("Failed to load timeline:", err);

        if (!cancelled) {
          setPageError("Could not load groups. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchTimeline();

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (activeFilters.length === 0) {
      setGroups(allGroups);
      return;
    }

    setGroups(
      allGroups.filter((group) =>
        activeFilters.includes(Number(group.category_id)),
      ),
    );
  }, [allGroups, activeFilters]);

  const toggleFilter = (categoryId: number) => {
    setActiveFilters((previous) =>
      previous.includes(categoryId)
        ? previous.filter((id) => id !== categoryId)
        : [...previous, categoryId],
    );
  };

  const handleLike = async (groupId: number) => {
    try {
      const response = await API.post(`/groups/${groupId}/like`);
      const { liked, likesCount } = response.data;

      const updateGroup = (group: Group): Group =>
        group.id === groupId
          ? {
              ...group,
              userLiked: Boolean(liked),
              likesCount: Number(likesCount),
            }
          : group;

      setAllGroups((previous) => previous.map(updateGroup));
    } catch (err) {
      console.error("Failed to update like:", err);
      alert("Could not update the like. Please try again.");
    }
  };

  const handleSave = async (groupId: number) => {
    if (!user || savingGroupIds.includes(groupId)) return;

    setSavingGroupIds((previous) => [...previous, groupId]);

    try {
      const response = await API.post(`/saved-groups/groups/${groupId}`);

      const isSaved = Boolean(response.data.saved);

      setAllGroups((previous) =>
        previous.map((group) =>
          group.id === groupId ? { ...group, isSaved } : group,
        ),
      );
    } catch (err) {
      console.error("Failed to update saved group:", err);
      alert("Could not update the saved group. Please try again.");
    } finally {
      setSavingGroupIds((previous) => previous.filter((id) => id !== groupId));
    }
  };

  if (loading) {
    return <p className="p-6">Loading timeline...</p>;
  }

  if (pageError) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600 mb-3">{pageError}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      {user && interests.length > 0 && (
        <section className="bg-white border rounded-lg p-4">
          <h2 className="font-bold text-lg mb-3">Filter by interest</h2>

          <div className="flex flex-wrap gap-2">
            {interests.map((interest) => {
              const isActive = activeFilters.includes(interest.category_id);

              return (
                <button
                  key={interest.category_id}
                  type="button"
                  onClick={() => toggleFilter(interest.category_id)}
                  aria-pressed={isActive}
                  className={`px-3 py-2 rounded-full border text-sm transition ${
                    isActive
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                  }`}
                >
                  {interest.name}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setActiveFilters([])}
              className="px-3 py-2 rounded-full border border-gray-300 text-sm hover:bg-gray-100"
            >
              Show all
            </button>
          </div>
        </section>
      )}

      {groups.length === 0 ? (
        <p className="p-6 text-gray-600">
          No groups to show for the selected filters.
        </p>
      ) : (
        groups.map((group) => (
          <div
            key={group.id}
            className={`bg-white shadow rounded p-4 border-2 ${
              group.user_id === user?.id ? "border-blue-500" : "border-gray-200"
            }`}
          >
            <h2 className="text-xl font-bold">{group.title}</h2>

            <p className="text-gray-600 mt-1">{group.description}</p>

            <p className="text-sm text-gray-400 mt-1">
              By: {group.username} | Category: {group.category_name}
            </p>

            <div className="flex justify-between mt-4 flex-wrap gap-2">
              <button
                type="button"
                className={`px-3 py-1 rounded ${
                  group.userLiked ? "bg-blue-500 text-white" : "bg-gray-200"
                }`}
                onClick={() => handleLike(group.id)}
              >
                Like ({group.likesCount || 0})
              </button>

              <button
                type="button"
                disabled={!user || savingGroupIds.includes(group.id)}
                className={`px-3 py-1 rounded disabled:opacity-50 ${
                  group.isSaved ? "bg-green-500 text-white" : "bg-gray-200"
                }`}
                onClick={() => handleSave(group.id)}
              >
                {!user
                  ? "Log in to save"
                  : savingGroupIds.includes(group.id)
                    ? "Saving..."
                    : group.isSaved
                      ? "Saved"
                      : "Save"}
              </button>

              <button
                type="button"
                className="px-3 py-1 bg-blue-600 text-white rounded"
                onClick={() => router.push(`/group/${group.id}`)}
              >
                View
              </button>
            </div>

            <CommentsSection groupId={group.id} />
          </div>
        ))
      )}
    </div>
  );
}
