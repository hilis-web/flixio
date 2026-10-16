"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import API from "../lib/api";
import { useAuth } from "../app/context/auth-context";
import CommentsSection from "../components/CommentsSection";

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

interface FollowingProps {
  selectedCategories: number[];
}

export default function Following({ selectedCategories }: FollowingProps) {
  const { user } = useAuth();
  const router = useRouter();

  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchFollowingGroups = async () => {
      setLoading(true);

      try {
        const savedRes = await API.get("/saved-groups/me");
        const savedGroups: number[] = savedRes.data.map((g: any) =>
          Number(g.group_id),
        );

        const res = await API.get("/groups/following");

        if (cancelled) return;

        const followingGroups: Group[] = res.data.map((g: Group) => ({
          ...g,
          category_id: Number(g.category_id),
          isSaved: savedGroups.includes(Number(g.id)),
        }));

        setGroups(followingGroups);
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to fetch following groups:", err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    if (user) {
      fetchFollowingGroups();
    } else {
      setGroups([]);
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [user]);

  const filteredGroups = useMemo(() => {
    if (selectedCategories.length === 0) {
      return groups;
    }

    return groups.filter((group) =>
      selectedCategories.includes(Number(group.category_id)),
    );
  }, [groups, selectedCategories]);

  const handleLike = async (groupId: number) => {
    try {
      await API.post(`/groups/${groupId}/like`);

      setGroups((prev) =>
        prev.map((group) =>
          group.id === groupId
            ? {
                ...group,
                userLiked: !group.userLiked,
                likesCount: Math.max(
                  0,
                  (group.likesCount || 0) + (group.userLiked ? -1 : 1),
                ),
              }
            : group,
        ),
      );
    } catch (err) {
      console.error("Failed to like group:", err);
    }
  };

  const handleSave = async (groupId: number) => {
    try {
      await API.post(`/saved-groups/groups/${groupId}`);

      setGroups((prev) =>
        prev.map((group) =>
          group.id === groupId ? { ...group, isSaved: !group.isSaved } : group,
        ),
      );
    } catch (err) {
      console.error("Failed to save group:", err);
    }
  };

  if (loading) {
    return <p className="p-6">Loading following feed...</p>;
  }

  if (!user) {
    return (
      <p className="p-6 text-gray-500">
        Please log in to see groups from accounts you follow.
      </p>
    );
  }

  if (filteredGroups.length === 0) {
    return (
      <p className="p-6 text-gray-500">
        {selectedCategories.length > 0
          ? "No groups found for the selected interests."
          : "No groups from accounts you follow yet."}
      </p>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {filteredGroups.map((group) => (
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
            {group.user_id !== user?.id && (
              <button
                className={`px-3 py-1 rounded ${
                  group.userLiked ? "bg-blue-500 text-white" : "bg-gray-200"
                }`}
                onClick={() => handleLike(group.id)}
              >
                Like ({group.likesCount || 0})
              </button>
            )}

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
      ))}
    </div>
  );
}
