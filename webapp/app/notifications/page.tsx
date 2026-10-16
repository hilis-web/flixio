"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import API from "../../lib/api";

interface Notification {
  id: number;
  recipient_id: number;
  actor_id: number | null;
  actor_username: string | null;
  type: "follow" | "like" | "comment";
  entity_id: number | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

const getNotificationIcon = (type: Notification["type"]) => {
  switch (type) {
    case "follow":
      return "👤";
    case "like":
      return "❤️";
    case "comment":
      return "💬";
    default:
      return "🔔";
  }
};

const getNotificationLink = (notification: Notification): string | null => {
  if (notification.type === "follow" && notification.actor_id) {
    return `/users/${notification.actor_id}`;
  }

  if (
    (notification.type === "like" || notification.type === "comment") &&
    notification.entity_id
  ) {
    return `/group/${notification.entity_id}`;
  }

  return null;
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [markingAll, setMarkingAll] = useState(false);
  const [markingId, setMarkingId] = useState<number | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setError("");

      const response = await API.get("/api/notifications");

      setNotifications(response.data.notifications || []);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      setError("Failed to load notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (notificationId: number) => {
    try {
      setMarkingId(notificationId);

      await API.patch(`/api/notifications/${notificationId}/read`);

      setNotifications((previous) =>
        previous.map((notification) =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification,
        ),
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
      setError("Failed to update notification. Please try again.");
    } finally {
      setMarkingId(null);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    const link = getNotificationLink(notification);

    if (!link) return;

    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    window.location.href = link;
  };

  const markAllAsRead = async () => {
    try {
      setMarkingAll(true);
      setError("");

      await API.patch("/api/notifications/read-all");

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          is_read: true,
        })),
      );
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
      setError("Failed to mark all notifications as read.");
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read,
  ).length;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/feeds"
              className="mb-3 inline-block text-sm text-blue-600 hover:underline"
            >
              ← Back to Feed
            </Link>

            <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>

            <p className="mt-2 text-sm text-slate-500">
              Stay updated with your Flixio activity.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              disabled={markingAll}
              className="rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {markingAll ? "Updating..." : "Mark all as read"}
            </button>
          )}
        </div>

        {/* Unread count */}
        {!loading && !error && (
          <div className="mb-4 text-sm text-slate-600">
            You have{" "}
            <span className="font-semibold text-blue-600">{unreadCount}</span>{" "}
            unread {unreadCount === 1 ? "notification" : "notifications"}.
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <p>{error}</p>

            <button
              type="button"
              onClick={fetchNotifications}
              className="mt-2 font-semibold underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="rounded-xl border bg-white p-8 text-center text-slate-500 shadow-sm">
            Loading notifications...
          </div>
        ) : notifications.length === 0 && !error ? (
          /* Empty state */
          <div className="rounded-xl border bg-white px-6 py-16 text-center shadow-sm">
            <div className="mb-4 text-5xl">🔔</div>

            <h2 className="text-xl font-semibold text-slate-800">
              No notifications yet
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              When someone follows you, likes your group, or comments on it, you
              will see it here.
            </p>

            <Link
              href="/feeds"
              className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Explore Feed
            </Link>
          </div>
        ) : (
          /* Notification list */
          <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start gap-4 border-b border-slate-100 p-4 transition last:border-b-0 sm:p-5 ${
                  notification.is_read ? "bg-white" : "bg-blue-50/70"
                }`}
              >
                {/* Icon */}
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xl">
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Content */}
                <button
                  type="button"
                  onClick={() => handleNotificationClick(notification)}
                  disabled={!getNotificationLink(notification)}
                  className="min-w-0 flex-1 cursor-pointer text-left disabled:cursor-default"
                >
                  <p className="break-words text-sm leading-6 text-slate-800">
                    <span className="font-semibold">
                      {notification.actor_username || "Someone"}
                    </span>{" "}
                    {notification.message}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {new Date(notification.created_at).toLocaleString()}
                  </p>

                  {!notification.is_read && (
                    <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-blue-600">
                      <span className="h-2 w-2 rounded-full bg-blue-600" />
                      Unread
                    </span>
                  )}
                </button>

                {/* Mark as read */}
                {!notification.is_read && (
                  <button
                    type="button"
                    onClick={() => markAsRead(notification.id)}
                    disabled={markingId === notification.id || markingAll}
                    className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {markingId === notification.id
                      ? "Updating..."
                      : "Mark read"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default NotificationsPage;
