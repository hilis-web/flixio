"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import API from "../../../lib/api";
import { useAuth } from "../../context/auth-context";
import Link from "next/link";

interface ProfileUser {
  id: number;
  username: string;
}

export default function PublicProfilePage() {
  const params = useParams<{ id: string }>();
  const { user } = useAuth();

  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  const profileId = Number(params.id);
  const isOwnProfile = Number(user?.id) === profileId;

  useEffect(() => {
    if (!Number.isInteger(profileId) || profileId <= 0) {
      setError("Invalid user ID");
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadProfile = async () => {
      setLoading(true);
      setError("");

      try {
        const [userRes, countsRes] = await Promise.all([
          API.get(`/api/users/${profileId}`),
          API.get(`/api/follows/${profileId}/counts`),
        ]);

        if (cancelled) return;

        const profileData = userRes.data.user ?? userRes.data;

        setProfile({
          id: Number(profileData.id),
          username: profileData.username,
        });

        setFollowersCount(countsRes.data.followersCount);
        setFollowingCount(countsRes.data.followingCount);

        if (user && !isOwnProfile) {
          const statusRes = await API.get(`/api/follows/${profileId}/status`);

          if (!cancelled) {
            setIsFollowing(statusRes.data.following);
          }
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(
            err.response?.status === 404
              ? "User not found"
              : "Failed to load profile",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [profileId, user, isOwnProfile]);

  const handleFollowToggle = async () => {
    if (!user || !profile || updating || isOwnProfile) return;

    setUpdating(true);

    try {
      if (isFollowing) {
        await API.delete(`/api/follows/${profile.id}`);
        setIsFollowing(false);
        setFollowersCount((count) => Math.max(0, count - 1));
      } else {
        await API.post(`/api/follows/${profile.id}`);
        setIsFollowing(true);
        setFollowersCount((count) => count + 1);
      }
    } catch (err: any) {
      alert(err.response?.data?.message ?? "Failed to update follow status");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <p className="p-6">Loading profile...</p>;
  }

  if (error || !profile) {
    return <p className="p-6">{error || "User not found"}</p>;
  }

  return (
    <main className="max-w-xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">{profile.username}</h1>

      <div className="flex gap-6 mb-6">
        <Link
          href={`/users/${profile.id}/followers`}
          className="hover:text-blue-600 hover:underline"
        >
          <strong>{followersCount}</strong> Followers
        </Link>

        <Link
          href={`/users/${profile.id}/following`}
          className="hover:text-blue-600 hover:underline"
        >
          <strong>{followingCount}</strong> Following
        </Link>
      </div>

      {user && !isOwnProfile && (
        <button
          type="button"
          onClick={handleFollowToggle}
          disabled={updating}
          className={`px-4 py-2 rounded text-white disabled:opacity-50 ${
            isFollowing ? "bg-gray-600" : "bg-blue-600"
          }`}
        >
          {updating ? "Please wait..." : isFollowing ? "Following" : "Follow"}
        </button>
      )}

      {!user && (
        <p className="text-gray-600">Please login to follow this user.</p>
      )}
    </main>
  );
}
