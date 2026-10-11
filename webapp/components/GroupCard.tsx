"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FaTrash, FaEdit, FaHeart } from "react-icons/fa";
import API from "../lib/api";
import { useRouter } from "next/navigation";

interface GroupCardData {
  id: number;
  title: string;
  description: string;
  category_name?: string;
  image_url?: string;
  is_public?: boolean;
  isSaved?: boolean;
  cards?: { id: number; front_text: string; back_text: string }[];
}

interface GroupCardProps {
  group: GroupCardData;
  editable?: boolean;
  onSavedChange?: (groupId: number, saved: boolean) => void;
  onDeleted?: (groupId: number) => void;
}

export default function GroupCard({
  group,
  editable = false,
  onSavedChange,
  onDeleted,
}: GroupCardProps) {
  const router = useRouter();
  const [saved, setSaved] = useState(Boolean(group.isSaved));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSave = async () => {
    if (saving) return;

    setSaving(true);

    try {
      const response = await API.post(`/saved-groups/groups/${group.id}`);

      const isSaved = Boolean(response.data.saved);

      setSaved(isSaved);
      onSavedChange?.(group.id, isSaved);
    } catch (err) {
      console.error("Failed to save or unsave group:", err);
      alert("Could not update the saved group. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleting) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this group?",
    );

    if (!confirmed) return;

    setDeleting(true);

    try {
      await API.delete(`/groups/${group.id}`);
      onDeleted?.(group.id);
      alert("Group deleted successfully.");
    } catch (err) {
      console.error("Failed to delete group:", err);
      alert("Could not delete the group. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = () => {
    // Editing is not implemented yet.
    alert("The edit feature is not implemented yet.");
  };

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
      whileHover={{ scale: 1.02 }}
    >
      <div className="relative h-40 w-full">
        <img
          src={group.image_url || "/placeholder.jpg"}
          alt={group.title || "Group image"}
          className="h-full w-full object-cover"
        />

        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full flex items-center gap-2 shadow">
          <span className="text-xs font-medium text-gray-700">
            {group.is_public ? "Public" : "Private"}
          </span>

          <input
            type="checkbox"
            checked={Boolean(group.is_public)}
            readOnly
            aria-label={group.is_public ? "Public group" : "Private group"}
            className="accent-blue-600"
          />
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3">
        <div className="flex justify-between items-start gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-gray-800">
              {group.title || "Untitled Group"}
            </h2>

            <span className="text-xs text-gray-500">
              {group.category_name || "Uncategorized"}
            </span>
          </div>

          <div className="flex gap-3 shrink-0">
            {editable && (
              <button
                type="button"
                onClick={handleEdit}
                aria-label="Edit group"
                title="Edit group"
                className="text-blue-600 hover:text-blue-800"
              >
                <FaEdit />
              </button>
            )}

            {editable && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                aria-label="Delete group"
                title="Delete group"
                className="text-red-600 hover:text-red-800 disabled:opacity-50"
              >
                <FaTrash />
              </button>
            )}

            {!editable && (
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                aria-label={saved ? "Unsave group" : "Save group"}
                title={saved ? "Unsave group" : "Save group"}
                className={`disabled:opacity-50 ${
                  saved
                    ? "text-red-500 hover:text-red-700"
                    : "text-gray-500 hover:text-red-500"
                }`}
              >
                <FaHeart />
              </button>
            )}
          </div>
        </div>

        <p className="text-gray-700">{group.description || "No description"}</p>

        {group.cards && group.cards.length > 0 && (
          <p className="text-sm text-gray-500">{group.cards.length} cards</p>
        )}

        <button
          type="button"
          onClick={() => router.push(`/group/${group.id}`)}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          View Group
        </button>
      </div>
    </motion.div>
  );
}
