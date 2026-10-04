"use client";

import { useEffect, useState } from "react";
import API from "../../lib/api";
import GroupCard from "../../components/GroupCard";
import { useAuth } from "../context/auth-context";

interface Card {
  id: number;
  front_text: string;
  back_text: string;
}

interface Group {
  id: number;
  title: string;
  description: string;
  cards?: Card[];
}

export default function Saved() {
  const { user } = useAuth();
  console.log("user111", user);
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchSaved = async () => {
      try {
        console.log("userId", user);
        const res = await API.get(`/saved-groups/user/${user.id}`);
        console.group("Saved res ", res);
        setGroups(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchSaved();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Saved Groups</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {groups.map((group) => (
          <GroupCard key={group.id} group={group} />
        ))}
      </div>
    </div>
  );
}
