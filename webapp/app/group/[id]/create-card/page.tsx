"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Layers, FileText } from "lucide-react";
import API from "../../../../lib/api";
import { useAuth } from "../../../context/auth-context";

type CardDraft = {
  id: string;
  front_text: string;
  back_text: string;
};

type Mode = "single" | "bulk";

export default function CreateCardPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();

  const rawId = params.id;
  const groupId = Array.isArray(rawId) ? rawId[0] : rawId;

  const [mode, setMode] = useState<Mode>("single");
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [cards, setCards] = useState<CardDraft[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const createDraftId = () =>
    `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const resetMessages = () => {
    setError("");
    setSuccess("");
  };

  const handleSingleSubmit = async (addAnother = false) => {
    resetMessages();

    if (!front.trim() || !back.trim()) {
      setError("Please enter both the front and back text.");
      return;
    }

    if (!groupId || !Number.isInteger(Number(groupId))) {
      setError("Invalid group ID.");
      return;
    }

    setLoading(true);

    try {
      await API.post("/cards", {
        group_id: Number(groupId),
        front_text: front.trim(),
        back_text: back.trim(),
      });

      if (addAnother) {
        setFront("");
        setBack("");
        setSuccess("Card created successfully. You can add another one.");
      } else {
        router.push(`/group/${groupId}`);
      }
    } catch (err) {
      console.error("Create card error:", err);
      setError("Failed to create the card. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const parseBulkText = () => {
    resetMessages();

    const lines = bulkText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      setError("Enter at least one card.");
      return;
    }

    const parsedCards: CardDraft[] = [];
    const invalidLines: number[] = [];

    lines.forEach((line, index) => {
      const separatorIndex = line.indexOf("|");

      if (separatorIndex === -1) {
        invalidLines.push(index + 1);
        return;
      }

      const frontText = line.slice(0, separatorIndex).trim();
      const backText = line.slice(separatorIndex + 1).trim();

      if (!frontText || !backText) {
        invalidLines.push(index + 1);
        return;
      }

      parsedCards.push({
        id: createDraftId(),
        front_text: frontText,
        back_text: backText,
      });
    });

    if (invalidLines.length > 0) {
      setError(
        `Please check these lines: ${invalidLines.join(", ")}. Each line must use Front | Back.`,
      );
      return;
    }

    if (parsedCards.length > 100) {
      setError("You can add up to 100 cards at a time.");
      return;
    }

    setCards(parsedCards);
    setSuccess(`${parsedCards.length} cards ready for review.`);
  };

  const updateDraft = (
    id: string,
    field: "front_text" | "back_text",
    value: string,
  ) => {
    setCards((current) =>
      current.map((card) =>
        card.id === id ? { ...card, [field]: value } : card,
      ),
    );
  };

  const deleteDraft = (id: string) => {
    setCards((current) => current.filter((card) => card.id !== id));
  };

  const handleBulkSubmit = async () => {
    resetMessages();

    if (!groupId || !Number.isInteger(Number(groupId))) {
      setError("Invalid group ID.");
      return;
    }

    if (cards.length === 0) {
      setError("Please prepare at least one card first.");
      return;
    }

    if (
      cards.some((card) => !card.front_text.trim() || !card.back_text.trim())
    ) {
      setError("Every card must have both front and back text.");
      return;
    }

    setLoading(true);

    try {
      await API.post("/cards/bulk", {
        group_id: Number(groupId),
        cards: cards.map((card) => ({
          front_text: card.front_text.trim(),
          back_text: card.back_text.trim(),
        })),
      });

      router.push(`/group/${groupId}`);
    } catch (err) {
      console.error("Bulk create cards error:", err);
      setError("Failed to save the cards. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <p>Please login to create cards.</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={() => router.push(`/group/${groupId}`)}
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 transition hover:text-gray-900"
        >
          <ArrowLeft size={18} />
          Back to group
        </button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Create Cards
          </h1>
          <p className="mt-2 text-gray-600">
            Add a single card or prepare multiple cards at once.
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 rounded-xl bg-white p-2 shadow-sm">
          <button
            type="button"
            onClick={() => {
              setMode("single");
              resetMessages();
            }}
            className={`flex items-center justify-center gap-2 rounded-lg px-4 py-3 font-medium transition ${
              mode === "single"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <FileText size={18} />
            Single Card
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("bulk");
              resetMessages();
            }}
            className={`flex items-center justify-center gap-2 rounded-lg px-4 py-3 font-medium transition ${
              mode === "bulk"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Layers size={18} />
            Bulk Add
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700"
          >
            {success}
          </div>
        )}

        {mode === "single" ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSingleSubmit(false);
            }}
            className="space-y-5 rounded-xl bg-white p-6 shadow-sm"
          >
            <div>
              <label
                htmlFor="front"
                className="mb-2 block text-sm font-semibold text-gray-800"
              >
                Front Text
              </label>
              <textarea
                id="front"
                value={front}
                onChange={(e) => setFront(e.target.value)}
                rows={3}
                maxLength={5000}
                placeholder="Enter a question or a word..."
                className="w-full rounded-lg border border-gray-300 p-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                required
              />
            </div>

            <div>
              <label
                htmlFor="back"
                className="mb-2 block text-sm font-semibold text-gray-800"
              >
                Back Text
              </label>
              <textarea
                id="back"
                value={back}
                onChange={(e) => setBack(e.target.value)}
                rows={3}
                maxLength={5000}
                placeholder="Enter the answer or meaning..."
                className="w-full rounded-lg border border-gray-300 p-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                required
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Saving..." : "Save Card"}
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => void handleSingleSubmit(true)}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Plus size={18} />
                Save & Add Another
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <section className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">
                Enter Multiple Cards
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                Enter one card per line using this format:
              </p>

              <div className="my-3 rounded-lg bg-gray-100 p-3 font-mono text-sm text-gray-800">
                Apple | تفاحة
                <br />
                Book | كتاب
                <br />
                House | بيت
              </div>

              <p className="mb-3 text-sm text-gray-500">
                Use the vertical bar <strong>|</strong> to separate the front
                and back. You can prepare up to 100 cards per batch.
              </p>

              <textarea
                value={bulkText}
                onChange={(e) => {
                  setBulkText(e.target.value);
                  setError("");
                  setSuccess("");
                }}
                rows={8}
                placeholder={"Apple | تفاحة\nBook | كتاب\nHouse | بيت"}
                className="w-full rounded-lg border border-gray-300 p-3 font-mono text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <button
                type="button"
                onClick={parseBulkText}
                className="mt-4 w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                Preview Cards
              </button>
            </section>

            {cards.length > 0 && (
              <section className="rounded-xl bg-white p-6 shadow-sm">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Review & Edit
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      {cards.length} card{cards.length !== 1 ? "s" : ""} ready
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setCards([]);
                      resetMessages();
                    }}
                    className="text-sm text-gray-500 hover:text-red-600"
                  >
                    Clear preview
                  </button>
                </div>

                <div className="space-y-4">
                  {cards.map((card, index) => (
                    <div
                      key={card.id}
                      className="rounded-lg border border-gray-200 p-4"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-500">
                          Card {index + 1}
                        </span>

                        <button
                          type="button"
                          onClick={() => deleteDraft(card.id)}
                          aria-label={`Delete card ${index + 1}`}
                          className="rounded-md p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label
                            htmlFor={`front-${card.id}`}
                            className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500"
                          >
                            Front
                          </label>
                          <textarea
                            id={`front-${card.id}`}
                            value={card.front_text}
                            onChange={(e) =>
                              updateDraft(card.id, "front_text", e.target.value)
                            }
                            rows={3}
                            className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor={`back-${card.id}`}
                            className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500"
                          >
                            Back
                          </label>
                          <textarea
                            id={`back-${card.id}`}
                            value={card.back_text}
                            onChange={(e) =>
                              updateDraft(card.id, "back_text", e.target.value)
                            }
                            rows={3}
                            className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => void handleBulkSubmit()}
                  disabled={loading || cards.length === 0}
                  className="mt-6 w-full rounded-lg bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Saving Cards..." : `Save ${cards.length} Cards`}
                </button>
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
