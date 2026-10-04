"use client";

import { useEffect, useState } from "react";
import API from "../../lib/api";
import { useAuth } from "../context/auth-context";
import GroupCard from "../../components/GroupCard";

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

export default function MyGroups() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  // const userId = 2; // لاحقًا من Auth

  useEffect(() => {
    if (!user) return;

    const fetchMyGroups = async () => {
      try {
        const res = await API.get(`/groups/user/${user.id}`);
        console.log(res.data);
        setGroups(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMyGroups();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">My Groups</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {groups.map((group) => (
          <GroupCard key={group.id} group={group} editable />
        ))}
      </div>
    </div>
  );
}
