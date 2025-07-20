import React, { useEffect, useState } from "react";
import { supabase } from "@/app/utils/supabase";

const Matches: React.FC = () => {
  const [matches, setMatches] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [details, setDetails] = useState<any | null>(null);

  const fetchDetails = async (matchObj: any) => {
    setDetails({
      full_name: matchObj.name,
      age: matchObj.age,
      interests: matchObj.interests,
      work_as: matchObj.work,
      photo_url: matchObj.photo,
      tagline: matchObj.tagline ?? "",
      looking_for: matchObj.looking_for ?? "",
      family_plan: matchObj.family_plan ?? "",
      relationship_status: matchObj.relationship_status ?? "",
      texting_calling: matchObj.texting_calling ?? "",
    });

    if (!supabase) return;

    const { data: profile, error } = await supabase
      .from("profiles")
      .select(
        "full_name, age, tagline, interests, work_as, looking_for, family_plan, relationship_status, texting_calling"
      )
      .eq("id", matchObj.id)
      .single();

    if (error) {
      console.warn("[Matches] Couldn't fetch profile details", error);
      return;
    }

    const { data: urlRow } = await supabase
      .from("profileurl")
      .select("photo_url")
      .eq("user_id", matchObj.id)
      .single();

    setDetails({
      ...profile,
      photo_url: urlRow?.photo_url || matchObj.photo,
    });
  };

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("matches") || "[]");
      setMatches(stored);
    } catch {
      setMatches([]);
    }
  }, []);

  return (
    <div className="flex-1 p-12 text-white font-fjalla-one overflow-y-auto">
      <h2 className="text-3xl mb-8 text-[#D79DFC]">Your Matches</h2>

      {matches.length === 0 ? (
        <p className="text-gray-300">No matches yet.</p>
      ) : (
        <div className="space-y-4 max-w-md">
          {matches.map((m) => (
            <div
              key={m.id}
              className="bg-white p-4 rounded-2xl shadow flex items-center gap-4"
            >
              <img
                src={m.photo}
                alt={m.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="flex-1">
                <p className="text-black font-bold text-lg">{m.name}</p>
              </div>
              <button
                onClick={() => {
                  setSelected(m);
                  fetchDetails(m);
                }}
                className="px-4 py-2 bg-[#D79DFC] text-black rounded-lg hover:bg-[#c26dfc] transition-colors text-sm font-semibold"
              >
                View Profile
              </button>
            </div>
          ))}
        </div>
      )}
    {/* Modal */}
    {selected && (
      <div
        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
        onClick={() => {
          setSelected(null);
          setDetails(null);
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl p-8 w-[90vw] max-w-2xl text-black relative overflow-y-auto max-h-[90vh]"
        >
          <button
            onClick={() => {
              setSelected(null);
              setDetails(null);
            }}
            className="absolute top-4 right-4 text-gray-500 hover:text-black"
          >
            ✕
          </button>

          {details ? (
            <>
              {details.photo_url && (
                <img
                  src={details.photo_url}
                  alt={details.full_name}
                  className="w-full h-60 object-cover rounded-2xl mb-6"
                />
              )}
              <h2 className="text-3xl font-bold mb-2 font-league-spartan">
                {details.full_name}
              </h2>
              {details.tagline && <p className="mb-4 italic">"{details.tagline}"</p>}

              <div className="grid grid-cols-2 gap-4 text-sm font-league-spartan mb-6">
                <div><span className="text-[#D79DFC]">Age:</span> {details.age || "-"}</div>
                <div><span className="text-[#D79DFC]">Work As:</span> {details.work_as || "-"}</div>
                <div><span className="text-[#D79DFC]">Relationship:</span> {details.relationship_status || "-"}</div>
                <div><span className="text-[#D79DFC]">Looking For:</span> {details.looking_for || "-"}</div>
                <div><span className="text-[#D79DFC]">Family Plan:</span> {details.family_plan || "-"}</div>
                <div><span className="text-[#D79DFC]">Texting/Calling:</span> {details.texting_calling || "-"}</div>
              </div>

              {details.interests && details.interests.length > 0 && (
                <>
                  <h3 className="text-xl font-bold mb-2">Interests</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {details.interests.map((i: string) => (
                      <span key={i} className="px-3 py-1 bg-[#FFE9FF] text-[#D79DFC] rounded-full text-xs font-semibold">
                        {i}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </div>
    )}
    </div>
  );
};

export default Matches; 