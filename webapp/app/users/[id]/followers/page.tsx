"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import API from "../../../../lib/api";

interface FollowUser {
  id: number;
  username: string;
}

export default function FollowersPage() {
  const params = useParams<{ id: string }>();
  const userId = Number(params.id);

  const [users, setUsers] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadFollowers = async () => {
      try {
        const response = await API.get(`/api/follows/${userId}/followers`);

        if (!cancelled) {
          setUsers(response.data.followers ?? []);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.response?.data?.message ?? "Failed to load followers");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (!Number.isInteger(userId) || userId <= 0) {
      setError("Invalid user ID");
      setLoading(false);
    } else {
      loadFollowers();
    }

    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (loading) {
    return <main className="p-6">Loading followers...</main>;
  }

  if (error) {
    return <main className="p-6 text-red-600">{error}</main>;
  }

  return (
    <main className="max-w-xl mx-auto p-6">
      <Link href={`/users/${userId}`} className="text-blue-600 hover:underline">
        ← Back to profile{" "}
      </Link>
      <h1 className="text-2xl font-bold mt-4 mb-6">
        Followers ({users.length})
      </h1>
      {users.length === 0 ? (
        <p className="text-gray-500">No followers yet.</p>
      ) : (
        <ul className="space-y-3">
          {users.map((item) => (
            <li key={item.id} className="border rounded-lg p-4">
              <Link
                href={`/users/${item.id}`}
                className="font-medium hover:text-blue-600"
              >
                {item.username}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
