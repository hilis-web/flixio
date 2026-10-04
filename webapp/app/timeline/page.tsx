"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API from "../../lib/api";
import { useAuth } from "../context/auth-context";

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

export default function TimelinePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  // --------------------------
  // Fetch timeline
  // --------------------------
  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        let userInterests: number[] = [];

        // إذا في user → جلب اهتمامات المستخدم
        if (user) {
          const interestsRes = await API.get(`api/users/${user.id}`);
          userInterests = interestsRes.data.interests.map(
            (i: any) => i.category_id
          );
          console.log("user interests:", userInterests);
        }

        // جلب جميع المجموعات العامة
        const resGroups = await API.get("/groups/public");
        console.log("public groups:", resGroups.data);

        // إذا في user → فلترة حسب الاهتمامات، إذا لا → عرض الكل
        const finalGroups = user
          ? resGroups.data.filter((g: Group) =>
              userInterests.includes(g.category_id)
            )
          : resGroups.data;

        setGroups(finalGroups);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTimeline();
  }, [user]);

  // --------------------------
  // Handlers
  // --------------------------
  const handleLike = async (groupId: number) => {
    try {
      await API.post(`/groups/${groupId}/like`);
      setGroups((prev) =>
        prev.map((g) =>
          g.id === groupId
            ? {
                ...g,
                userLiked: !g.userLiked,
                likesCount: g.likesCount
                  ? g.likesCount + (g.userLiked ? -1 : 1)
                  : 1,
              }
            : g
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (groupId: number) => {
    try {
      await API.post(`/saved-groups/groups/${groupId}`, {
        user_id: user?.id,
      });
      setGroups((prev) =>
        prev.map((g) => (g.id === groupId ? { ...g, isSaved: !g.isSaved } : g))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleComment = (groupId: number) => {
    console.log("Comment on group:", groupId);
    // لاحقًا فتح modal للتعليقات
  };

  // --------------------------
  // Render
  // --------------------------
  if (loading) return <p className="p-6">Loading timeline...</p>;
  if (groups.length === 0) return <p className="p-6">No groups to show.</p>;

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      {groups.map((group) => (
        <div
          key={group.id}
          className={`bg-white shadow rounded p-4 border-2 ${
            group.user_id === user?.id ? "border-blue-500" : "border-gray-200"
          }`}
        >
          {/* Group Header */}
          <h2 className="text-xl font-bold">{group.title}</h2>
          <p className="text-gray-600 mt-1">{group.description}</p>
          <p className="text-sm text-gray-400 mt-1">
            By: {group.username} | Category: {group.category_name}
          </p>

          {/* Actions */}
          <div className="flex justify-between mt-4 flex-wrap gap-2">
            {/* Like */}
            <button
              className={`px-3 py-1 rounded ${
                group.userLiked ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
              onClick={() => handleLike(group.id)}
            >
              Like ({group.likesCount || 0})
            </button>

            {/* Comment */}
            <button
              className="px-3 py-1 bg-gray-200 rounded"
              onClick={() => handleComment(group.id)}
            >
              Comment
            </button>

            {/* Save */}
            <button
              className={`px-3 py-1 rounded ${
                group.isSaved ? "bg-green-500 text-white" : "bg-gray-200"
              }`}
              onClick={() => handleSave(group.id)}
            >
              {group.isSaved ? "Saved" : "Save"}
            </button>

            {/* View Details */}
            <button
              className="px-3 py-1 bg-blue-600 text-white rounded"
              onClick={() => router.push(`/group/${group.id}`)}
            >
              View
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
