"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/auth-context";
import API from "../../lib/api";
import GroupCard from "../../components/GroupCard";

interface SavedGroupResponse {
  id: number;
  group_id: number;
  title: string;
  description: string;
  category_id: number;
  image_url?: string;
  is_public: boolean;
  username: string;
}

interface Group {
  id: number;
  title: string;
  description: string;
  category_name?: string;
  category_id?: number;
  image_url?: string;
  is_public?: boolean;
  isSaved: boolean;
}

export default function Saved() {
  const { user } = useAuth();

  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchSaved = async () => {
      if (!user) {
        setGroups([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await API.get("/saved-groups/me");

        if (cancelled) return;

        const savedGroups: SavedGroupResponse[] = response.data;

        const mappedGroups: Group[] = savedGroups.map((item) => ({
          // GroupCard needs the actual group ID, not the saved-row ID.
          id: Number(item.group_id),
          title: item.title,
          description: item.description || "",
          category_id: Number(item.category_id),
          image_url: item.image_url,
          is_public: item.is_public,
          isSaved: true,
        }));

        setGroups(mappedGroups);
      } catch (err) {
        console.error("Failed to fetch saved groups:", err);

        if (!cancelled) {
          setError("Could not load saved groups. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchSaved();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleSavedChange = (groupId: number, saved: boolean) => {
    if (!saved) {
      setGroups((previous) => previous.filter((group) => group.id !== groupId));
    }
  };

  if (loading) {
    return <p className="p-6">Loading saved groups...</p>;
  }

  if (!user) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">Saved Groups</h1>
        <p>Please log in to view your saved groups.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Saved Groups</h1>

      {error ? (
        <div className="text-center py-8">
          <p className="text-red-600 mb-3">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Retry
          </button>
        </div>
      ) : groups.length === 0 ? (
        <p className="text-gray-600">You haven't saved any groups yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {groups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              onSavedChange={handleSavedChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}
