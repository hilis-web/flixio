"use client";

import { useState } from "react";
import SideBar from "../../components/SideBar";
import Timeline from "../../components/Timeline";
import Discovery from "../../components/Discovery";
import Footer from "../../components/Footer";
import SearchBar from "../../components/SearchBar";

export default function Feed() {
  const [activeTab, setActiveTab] = useState<"timeline" | "discovery">(
    "timeline",
  );

  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-6 flex gap-6 items-start">
        <aside className="w-64 shrink-0 sticky top-6 h-fit">
          <SideBar />
        </aside>

        <main className="w-full flex flex-col gap-6">
          <div className="sticky top-6 z-20 bg-white rounded-xl border p-4 shadow-md">
            <SearchBar />
          </div>

          <div className="bg-white rounded-xl border shadow-md overflow-hidden">
            <div className="flex justify-center border-b bg-gray-50">
              <button
                className={`px-6 py-3 font-medium ${
                  activeTab === "timeline"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500"
                }`}
                onClick={() => setActiveTab("timeline")}
              >
                Timeline
              </button>

              <button
                className={`px-6 py-3 font-medium ${
                  activeTab === "discovery"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500"
                }`}
                onClick={() => setActiveTab("discovery")}
              >
                Discovery
              </button>
            </div>

            <div className="p-4">
              {activeTab === "timeline" && (
                <Timeline selectedCategories={selectedCategories} />
              )}

              {activeTab === "discovery" && <Discovery />}
            </div>
          </div>
        </main>

        <aside className="w-64 shrink-0 sticky top-6 h-fit">
          <Footer variant="sidebar" onCategoryChange={setSelectedCategories} />
        </aside>
      </div>
    </div>
  );
}
