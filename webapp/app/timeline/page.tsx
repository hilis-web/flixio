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

  // Fetch public groups and saved user interests
  useEffect(() => {
    let cancelled = false;

    const fetchTimeline = async () => {
      setLoading(true);

      try {
        const [groupsRes, interestsRes] = await Promise.all([
          API.get("/groups/public"),
          user ? API.get("/api/users/me") : Promise.resolve(null),
        ]);

        if (cancelled) return;

        const publicGroups: Group[] = groupsRes.data;
        setAllGroups(publicGroups);

        if (user && interestsRes) {
          const savedInterests: Interest[] = interestsRes.data.interests.map(
            (item: any) => ({
              category_id: Number(item.category_id),
              name: item.name,
            }),
          );

          setInterests(savedInterests);

          // Initially show posts from all saved interests
          setActiveFilters(savedInterests.map((item) => item.category_id));
        } else {
          setInterests([]);
          setActiveFilters([]);
        }
      } catch (err) {
        console.error("Failed to load timeline:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchTimeline();

    return () => {
      cancelled = true;
    };
  }, [user]);

  // Apply temporary timeline filters only
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

  // Toggle a temporary filter; does not update the database
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

      // Update the original list used by the filters
      setAllGroups((previous) => previous.map(updateGroup));

      // Update the currently displayed list
      setGroups((previous) => previous.map(updateGroup));
    } catch (err) {
      console.error("Failed to update like:", err);
    }
  };

  const handleSave = async (groupId: number) => {
    try {
      await API.post(`/saved-groups/groups/${groupId}`);

      setGroups((previous) =>
        previous.map((group) =>
          group.id === groupId ? { ...group, isSaved: !group.isSaved } : group,
        ),
      );
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <p className="p-6">Loading timeline...</p>;
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      {/* Temporary interest filters */}
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
                className={`px-3 py-1 rounded ${
                  group.userLiked ? "bg-blue-500 text-white" : "bg-gray-200"
                }`}
                onClick={() => handleLike(group.id)}
              >
                Like ({group.likesCount || 0})
              </button>

              {/* <button
                type="button"
                className="px-3 py-1 bg-gray-200 rounded"
                onClick={() => router.push(`/group/${group.id}?comments=open`)}
              >
                Comment
              </button> */}

              <button
                className={`px-3 py-1 rounded ${
                  group.isSaved ? "bg-green-500 text-white" : "bg-gray-200"
                }`}
                onClick={() => handleSave(group.id)}
              >
                {group.isSaved ? "Saved" : "Save"}
              </button>

              <button
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
