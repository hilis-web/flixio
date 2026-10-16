"use client";
import { useEffect, useState } from "react";
import API from "../../lib/api";
import { useAuth } from "../context/auth-context";
import StudyReminders from "../../components/StudyReminders";
interface Category {
  id: number;
  name: string;
}

interface User {
  id: number;
  username: string;
  email: string;
}

export default function UserProfilePage() {
  const { user } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  // --------------------------
  // Fetch user info + interests + all categories
  // --------------------------
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const res = await API.get("/api/users/me");
        const countsRes = await API.get(
          `/api/follows/${res.data.user.id}/counts`,
        );

        setFollowersCount(countsRes.data.followersCount);
        setFollowingCount(countsRes.data.followingCount);
        setUsername(res.data.user.username);
        setEmail(res.data.user.email);
        // فقط فئات صالحة
        setSelectedCategories(
          res.data.interests
            .map((c: { category_id: number }) => Number(c.category_id))
            .filter((id: number) => id > 0),
        );

        const catsRes = await API.get("/categories");
        setAllCategories(catsRes.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [user]);

  // --------------------------
  // Toggle interest selection
  // --------------------------
  const handleToggleCategory = (catId: number) => {
    if (catId <= 0) return; // تجاهل أي فئة غير صالحة
    if (selectedCategories.includes(catId)) {
      setSelectedCategories(selectedCategories.filter((id) => id !== catId));
    } else {
      setSelectedCategories([...selectedCategories, catId]);
    }
  };

  // --------------------------
  // Save profile & interests
  // --------------------------

  const handleSave = async () => {
    if (!user) return;

    try {
      // Update the authenticated user's profile
      await API.put("/api/users/me", {
        username,
        email,
      });

      // Update the authenticated user's interests
      await API.put("/api/users/me/interests", {
        interests: selectedCategories.filter((id) => id > 0),
      });

      alert("Profile updated!");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    }
  };

  if (!user) return <p className="p-6">Please login to view your profile.</p>;

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">My Profile</h1>

      <div className="flex gap-6 mb-6">
        <div>
          <span className="font-bold">{followersCount}</span>{" "}
          <span className="text-gray-600">Followers</span>
        </div>

        <div>
          <span className="font-bold">{followingCount}</span>{" "}
          <span className="text-gray-600">Following</span>
        </div>
      </div>
      {/* Username */}
      <div className="mb-4">
        <label className="block mb-1 font-semibold">Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border p-2 w-full rounded"
        />
      </div>

      {/* Email */}
      <div className="mb-4">
        <label className="block mb-1 font-semibold">Email</label>
        <input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full rounded"
        />
      </div>

      {/* Interests */}
      <div className="mb-4">
        <label className="block mb-1 font-semibold">Interests</label>
        <div className="flex flex-wrap gap-2">
          {allCategories.map((cat) => (
            <button
              key={cat.id}
              className={`px-3 py-1 rounded ${
                selectedCategories.includes(cat.id)
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200"
              }`}
              onClick={() => handleToggleCategory(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>
      {/* Study Reminders */}
      <div className="mt-8">
        <StudyReminders />
      </div>
      <button
        className="bg-green-600 text-white px-4 py-2 rounded"
        onClick={handleSave}
      >
        Save Changes
      </button>
    </div>
  );
}
