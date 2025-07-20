"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/app/utils/supabase";
import { useRouter } from "next/navigation";

interface MatchProfile {
  id: string;
  name: string;
  age?: number;
  photo: string;
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<MatchProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchMatches = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth");
        return;
      }

      // Fetch matched user ids
      const { data: matchRows } = await supabase
        .from("matches")
        .select("matched_user_id")
        .eq("user_id", user.id);

      const matchedIds = matchRows?.map((row: any) => row.matched_user_id) || [];

      if (!matchedIds.length) {
        setLoading(false);
        return;
      }

      // Fetch profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, age")
        .in("id", matchedIds);

      // Fetch images
      const { data: urls } = await supabase
        .from("profileurl")
        .select("user_id, photo_url")
        .in("user_id", matchedIds);

      const photoMap: Record<string, string> = {};
      urls?.forEach((row: any) => {
        photoMap[row.user_id] = row.photo_url;
      });

      const mapped: MatchProfile[] = (profiles || []).map((p: any) => ({
        id: p.id,
        name: p.full_name || "Unknown",
        age: p.age,
        photo: photoMap[p.id] || "/assets/cats/1.png",
      }));

      setMatches(mapped);
      setLoading(false);
    };

    fetchMatches();
  }, [router]);

  return (
    <div className="flex-1 p-12 text-white font-fjalla-one flex flex-col items-center">
      <h2 className="text-3xl mb-8 text-[#D79DFC]">Your Matches</h2>

      {loading ? null : matches.length === 0 ? (
        <p>No matches yet. Start liking people!</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 w-full max-w-md">
          {matches.map((m) => (
            <div
              key={m.id}
              className="bg-white rounded-2xl shadow-lg p-4 flex items-center gap-4"
            >
              <img
                src={m.photo}
                alt={m.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="flex-1 text-black">
                <h3 className="text-lg font-bold font-league-spartan">
                  {m.name}
                </h3>
                {m.age && (
                  <p className="text-sm text-gray-600 font-league-spartan">
                    {m.age}
                  </p>
                )}
              </div>
              <button
                onClick={() => router.push(`/profile/${m.id}`)}
                className="px-4 py-2 bg-[#D79DFC] text-white rounded-lg hover:bg-[#c26dfc] transition-colors font-league-spartan text-sm"
              >
                View Profile
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 