"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import API from "../lib/api";
import { useAuth } from "../app/context/auth-context";

interface Comment {
  id: number;
  user_id: number;
  group_id: number;
  content: string;
  parent_comment_id: number | null;
  created_at: string;
  username?: string;
  likesCount?: number;
  userLiked?: boolean;
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
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [likingIds, setLikingIds] = useState<number[]>([]);
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
        parent_comment_id: replyTo?.id ?? null,
      });

      if (response.data.comment) {
        setComments((previous) => [...previous, response.data.comment]);
      } else {
        await loadComments();
      }

      setContent("");
      setReplyTo(null);
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

  const handleLike = async (comment: Comment) => {
    if (!user || likingIds.includes(comment.id)) return;

    setLikingIds((previous) => [...previous, comment.id]);
    setError("");

    try {
      const response = await API.post(`/comments/${comment.id}/like`);

      setComments((previous) =>
        previous.map((item) =>
          item.id === comment.id
            ? {
                ...item,
                userLiked: response.data.liked,
                likesCount: response.data.likesCount,
              }
            : item,
        ),
      );
    } catch (err: any) {
      console.error("Failed to like comment:", err);
      setError(
        err?.response?.data?.error ||
          "Could not update your like. Please try again.",
      );
    } finally {
      setLikingIds((previous) => previous.filter((id) => id !== comment.id));
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
        previous.filter(
          (comment) =>
            comment.id !== commentId && comment.parent_comment_id !== commentId,
        ),
      );

      if (replyTo?.id === commentId) {
        setReplyTo(null);
      }
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

  const renderComment = (comment: Comment, isReply = false) => {
    const isAuthor =
      user != null && Number(user.id) === Number(comment.user_id);

    const isLiking = likingIds.includes(comment.id);
    const isLiked = Boolean(comment.userLiked);
    const likesCount = Number(comment.likesCount || 0);

    return (
      <article
        key={comment.id}
        className={`flex gap-3 ${isReply ? "ml-8 border-l-2 border-gray-200 pl-3 sm:ml-12" : ""}`}
      >
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

            {user ? (
              <button
                type="button"
                onClick={() => void handleLike(comment)}
                disabled={isLiking}
                aria-pressed={isLiked}
                className={`font-semibold hover:underline disabled:opacity-50 ${
                  isLiked ? "text-red-600" : "text-gray-500"
                }`}
              >
                {isLiked ? "❤️ Liked" : "🤍 Like"} ({likesCount})
              </button>
            ) : (
              <span>
                🤍 {likesCount} {likesCount === 1 ? "like" : "likes"}
              </span>
            )}

            {user && !isReply && (
              <button
                type="button"
                onClick={() => {
                  setReplyTo(comment);
                  setContent("");
                  setIsOpen(true);
                }}
                className="font-semibold text-blue-600 hover:underline"
              >
                Reply
              </button>
            )}

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

          {!isReply &&
            comments
              .filter((item) => item.parent_comment_id === comment.id)
              .map((reply) => (
                <div key={reply.id} className="mt-3">
                  {renderComment(reply, true)}
                </div>
              ))}
        </div>
      </article>
    );
  };

  const topLevelComments = comments.filter(
    (comment) => comment.parent_comment_id == null,
  );

  const firstComment = topLevelComments[0];

  return (
    <section className="mt-3 border-t border-gray-200 pt-3">
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

      {!loading && !error && !isOpen && firstComment && (
        <div className="mt-2">
          {renderComment(firstComment)}

          {topLevelComments.length > 1 && (
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="ml-12 mt-2 text-sm font-semibold text-gray-500 hover:underline"
            >
              View all {topLevelComments.length} comments
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

      {isOpen && (
        <div className="mt-4 space-y-4">
          {loading ? (
            <p className="text-sm text-gray-500">Loading comments...</p>
          ) : topLevelComments.length === 0 ? (
            <p className="text-sm text-gray-500">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            <div className="space-y-4">
              {topLevelComments.map((comment) => renderComment(comment))}
            </div>
          )}

          {authLoading ? null : user ? (
            <form onSubmit={handleSubmit} className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                {(user.username || "U").charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0 flex-1">
                {replyTo && (
                  <div className="mb-2 flex items-center justify-between rounded-lg bg-blue-50 px-3 py-2 text-sm">
                    <span className="text-blue-700">
                      Replying to <strong>{replyTo.username || "User"}</strong>
                    </span>

                    <button
                      type="button"
                      onClick={() => setReplyTo(null)}
                      className="font-semibold text-gray-500 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                <textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder={
                    replyTo ? "Write a reply..." : "Write a comment..."
                  }
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
                    {submitting ? "Posting..." : replyTo ? "Reply" : "Comment"}
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
