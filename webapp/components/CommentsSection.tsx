"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import API from "../lib/api";
import { useAuth } from "../app/context/auth-context";

interface Comment {
  id: number;
  user_id: number;
  group_id: number;
  content: string;
  created_at: string;
  username?: string;
}

interface CommentsSectionProps {
  groupId: number;
  defaultOpen?: boolean;
}

export default function CommentsSection({
  groupId,
  defaultOpen = false,
}: CommentsSectionProps) {
  const { user, loading: authLoading } = useAuth();

  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const loadComments = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await API.get(`/comments/group/${groupId}`);
      setComments(response.data);
    } catch (err) {
      console.error("Failed to load comments:", err);
      setError("Could not load comments. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  // Load comments on mount so the count and first comment are visible.
  useEffect(() => {
    void loadComments();
  }, [loadComments]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedContent = content.trim();

    if (!trimmedContent || submitting) return;

    setSubmitting(true);
    setError("");

    try {
      const response = await API.post("/comments", {
        group_id: groupId,
        content: trimmedContent,
      });

      // Show the new comment immediately.
      if (response.data.comment) {
        setComments((previous) => [
          ...previous,
          response.data.comment as Comment,
        ]);
      } else {
        await loadComments();
      }

      setContent("");
      setIsOpen(true);
    } catch (err: any) {
      console.error("Failed to add comment:", err);
      setError(
        err?.response?.data?.error ||
          "Could not post your comment. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: number) => {
    if (deletingId !== null) return;

    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    setDeletingId(commentId);
    setError("");

    try {
      await API.delete(`/comments/${commentId}`);

      setComments((previous) =>
        previous.filter((comment) => comment.id !== commentId),
      );
    } catch (err: any) {
      console.error("Failed to delete comment:", err);
      setError(
        err?.response?.data?.error ||
          "Could not delete your comment. Please try again.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const renderComment = (comment: Comment, compact = false) => {
    const isAuthor =
      user != null && Number(user.id) === Number(comment.user_id);

    return (
      <article key={comment.id} className="flex gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
          {(comment.username || "U").charAt(0).toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">
          <div className="rounded-2xl bg-gray-100 px-4 py-3">
            <p className="text-sm font-semibold text-gray-900">
              {comment.username || "User"}
            </p>

            <p className="mt-1 whitespace-pre-wrap break-words text-sm text-gray-800">
              {comment.content}
            </p>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-3 px-2 text-xs text-gray-500">
            <span>{new Date(comment.created_at).toLocaleString()}</span>

            {isAuthor && (
              <button
                type="button"
                onClick={() => void handleDelete(comment.id)}
                disabled={deletingId !== null}
                className="font-semibold hover:underline disabled:opacity-50"
              >
                {deletingId === comment.id ? "Deleting..." : "Delete"}
              </button>
            )}
          </div>
        </div>
      </article>
    );
  };

  const firstComment = comments[0];

  return (
    <section className="mt-3 border-t border-gray-200 pt-3">
      {/* Facebook-style comment counter */}
      <button
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-sm text-gray-600 hover:bg-gray-50"
      >
        <span className="font-medium">
          💬 {loading ? "Loading comments..." : `${comments.length} comments`}
        </span>

        <span className="text-blue-600">
          {isOpen ? "Hide comments ▲" : "View comments ▼"}
        </span>
      </button>

      {/* Always show the first comment below the group */}
      {!loading && !error && !isOpen && firstComment && (
        <div className="mt-2">
          {renderComment(firstComment, true)}

          {comments.length > 1 && (
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="ml-12 mt-2 text-sm font-semibold text-gray-500 hover:underline"
            >
              View all {comments.length} comments
            </button>
          )}
        </div>
      )}

      {error && (
        <div role="alert" className="mt-2 text-sm text-red-600">
          {error}
          <button
            type="button"
            onClick={() => void loadComments()}
            className="ml-2 font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Expanded comments and comment form */}
      {isOpen && (
        <div className="mt-4 space-y-4">
          {loading ? (
            <p className="text-sm text-gray-500">Loading comments...</p>
          ) : comments.length === 0 ? (
            <p className="text-sm text-gray-500">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => renderComment(comment))}
            </div>
          )}

          {authLoading ? null : user ? (
            <form onSubmit={handleSubmit} className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                {(user.username || "U").charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0 flex-1">
                <textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder="Write a comment..."
                  rows={2}
                  maxLength={2000}
                  required
                  className="w-full resize-y rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:bg-white"
                />

                <div className="mt-2 flex items-center justify-between gap-3">
                  <span className="text-xs text-gray-400">
                    {content.length}/2000
                  </span>

                  <button
                    type="submit"
                    disabled={!content.trim() || submitting}
                    className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting ? "Posting..." : "Comment"}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <p className="text-sm text-gray-600">
              <a
                href="/auth/login"
                className="font-semibold text-blue-600 hover:underline"
              >
                Log in
              </a>{" "}
              to write a comment.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
