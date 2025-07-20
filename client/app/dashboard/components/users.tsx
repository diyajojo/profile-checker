import React, { useState, useEffect } from "react";
// Loading mascot removed for users component
import { supabase } from "@/app/utils/supabase";

const Users: React.FC = () => {
  // State to hold profiles fetched from Supabase
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch profiles (excluding current user) on mount
  useEffect(() => {
    const fetchProfiles = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }

      // Get current logged-in user
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, work_as, age, interests")
        .neq("id", currentUser.id);

      if (!error && data) {
        // Fetch profile photos in batch
        const ids = data.map((p: any) => p.id);
        let photoMap: Record<string, string> = {};

        if (ids.length) {
          const { data: urlRows } = await supabase
            .from('profileurl')
            .select('user_id, photo_url')
            .in('user_id', ids);

          if (urlRows) {
            photoMap = urlRows.reduce((acc: any, row: any) => {
              acc[row.user_id] = row.photo_url;
              return acc;
            }, {});
          }
        }

        // Map DB fields to UI expected fields
        const mapped = data.map((p: any) => ({
          id: p.id,
          name: p.full_name || "Unknown",
          age: p.age || "",
          work: p.work_as || "",
          interests: p.interests || [],
          photo: photoMap[p.id] || "/assets/cats/1.png", // fallback image
        }));
        setUsers(mapped);
      }

      setLoading(false);
    };

    fetchProfiles();
  }, []);

  const [currentIndex, setCurrentIndex] = useState(0);

  const currentProfile = users[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => prev + 1);
  };

  const handleAccept = () => {
    if (currentProfile) {
      try {
        const existing = JSON.parse(localStorage.getItem("matches") || "[]");
        // avoid duplicates by id
        const exists = existing.find((m: any) => m.id === currentProfile.id);
        if (!exists) {
          localStorage.setItem("matches", JSON.stringify([...existing, currentProfile]));
        }
      } catch (err) {
        console.error("Unable to save match to localStorage", err);
      }
    }
    handleNext();
  };

  const handleReject = () => {
    // TODO: perform pass logic here
    handleNext();
  };

  return (
    <div className="relative flex-1 p-8 flex flex-col items-center justify-center overflow-hidden">
        {/* Background spotlight + decorative icons */}
      <div
        className="absolute inset-0 pointer-events-none -z-20"
        style={{
          background:
            "radial-gradient(circle at center, rgba(215,157,252,0.18) 0%, rgba(0,0,0,1) 70%)",
        }}
      />

      {/* Floating icons */}
      <svg
        className="absolute top-16 right-40 w-12 h-12 text-[#D79DFC] opacity-15 animate-pulse -z-10"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>

      {/* extra hearts */}
      <svg
        className="absolute top-32 left-60 w-8 h-8 text-[#D79DFC] opacity-10 animate-pulse -z-10"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>

      <svg
        className="absolute bottom-40 right-24 w-14 h-14 text-[#D79DFC] opacity-10 animate-pulse -z-10"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
      <svg
        className="absolute bottom-24 left-32 w-10 h-10 text-[#FF5B5B] opacity-10 rotate-12 animate-pulse -z-10"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>

      {/* extra crosses */}
      <svg
        className="absolute top-12 left-20 w-8 h-8 text-[#FF5B5B] opacity-10 -rotate-6 animate-pulse -z-10"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>

      <svg
        className="absolute bottom-10 right-64 w-12 h-12 text-[#FF5B5B] opacity-10 rotate-3 animate-pulse -z-10"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
      <svg
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 text-[#FFE9FF] opacity-5 -z-10"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12 17.27L18.18 21 16.545 13.97 22 9.24 14.82 8.63 12 2 9.18 8.63 2 9.24 7.455 13.97 5.82 21z" />
      </svg>
      <h2 className="text-3xl mb-8 text-[#D79DFC] font-fjalla-one">Find Your Perfect Match</h2>

      {loading ? null : currentProfile ? (
        <>
          {/* Card */}
          <div className="w-[28rem] bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Photo */}
            <img
              src={currentProfile.photo}
              alt={currentProfile.name}
              className="w-full h-80 object-cover" />

            {/* Info section */}
            <div className="p-6 text-black font-league-spartan">
              <h3 className="text-2xl font-bold">
                {currentProfile.name}
              </h3>
              {currentProfile.age && (
                <p className="text-lg text-gray-700 mb-1">{currentProfile.age}</p>
              )}
              {currentProfile.work && (
                <p className="text-sm text-gray-500 mb-4">{currentProfile.work}</p>
              )}

              {/* Interests */}
              {currentProfile.interests && currentProfile.interests.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {currentProfile.interests.map((interest: string) => (
                    <span
                      key={interest}
                      className="px-3 py-1 bg-[#FFE9FF] text-[#D79DFC] rounded-full text-xs font-semibold"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-10 mt-8">
            <button
              onClick={handleReject}
              className="w-20 h-20 flex items-center justify-center bg-[#FFE9FF] text-[#FF5B5B] rounded-full shadow-lg hover:bg-[#FFDBE0] transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-7 h-7"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <button
              onClick={handleAccept}
              className="w-20 h-20 flex items-center justify-center bg-[#D79DFC] text-white rounded-full shadow-xl hover:bg-[#c26dfc] transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
                className="w-9 h-9"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </button>
          </div>
        </>
      ) : (
        <p className="text-white font-league-spartan text-lg">No more users nearby!</p>
      )}
    </div>
  );
};

export default Users; 