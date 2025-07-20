import React, { useEffect, useState } from "react";
// Loading mascot removed for MyProfile
import { supabase } from "@/app/utils/supabase";

interface Profile {
  full_name: string;
  age: number;
  tagline: string;
  interests: string[];
  work_as: string;
  looking_for: string;
  family_plan: string;
  relationship_status: string;
  texting_calling: string;
  photo_url?: string | null;
}

const MyProfile: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!supabase) return;

      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select(
          "full_name, age, tagline, interests, work_as, looking_for, family_plan, relationship_status, texting_calling"
        )
        .eq("id", user.id)
        .single();

      let photo_url: string | null | undefined = null;

      const { data: urlData } = await supabase
        .from("profileurl")
        .select("photo_url")
        .eq("user_id", user.id)
        .single();

      if (urlData?.photo_url) {
        photo_url = urlData.photo_url;
      }

      if (profileData) {
        setProfile({ ...profileData, photo_url });
      }

      setLoading(false);
    };

    fetchProfile();
  }, []);

  if (loading) {
    return null; // no visible loading state
  }

  if (!profile) {
    return <div className="flex-1 flex items-center justify-center text-white">No profile data found.</div>;
  }

  return (
    <div className="flex-1 flex justify-center p-8 overflow-y-auto">
      <div className="flex flex-col gap-8 max-w-4xl w-full ">
        {/* Header */}
        <div className="bg-white rounded-3xl overflow-hidden flex text-black min-h-[300px] relative">
          {/* photo */}
          {profile.photo_url && (
            <img
              src={profile.photo_url}
              alt="Profile"
              className="w-64 object-cover rounded-2xl"
            />
          )}

          {/* Name and tagline */}
          <div className="flex-1 p-8">
            <h2 className="text-4xl font-bold mb-4 font-league-spartan">
              {profile.full_name.toUpperCase()}
            </h2>
            {profile.tagline && (
              <p className="text-lg text-black font-semibold mb-6 font-league-spartan">"{profile.tagline}"</p>
            )}

            {/* Edit button */}
            <button
              onClick={() => window.location.href = "/pfpcreate?edit=true"}
              className="absolute top-4 right-4 px-4 py-2 bg-[#D79DFC] text-black rounded-lg shadow hover:bg-[#c26dfc] transition-colors font-league-spartan"
            >
              Edit Profile
            </button>

            {/* Interests */}
            <div className="flex flex-wrap gap-3">
              {profile.interests?.map((item) => (
                <span
                  key={item}
                  className="px-4 py-2 bg-[#FFE9FF] text-[#D79DFC] rounded-lg text-sm font-semibold font-league-spartan"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* About section */}
        <div className="bg-white rounded-3xl p-6 text-black font-bold font-league-spartan">
          <h3 className="text-2xl mb-4">About</h3>

          <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-lg font-semibold font-league-spartan">
            <div>
              <span className="text-[#D79DFC]">Work As:</span> {profile.work_as || "-"}
            </div>
            <div>
              <span className="text-[#D79DFC]">Age:</span> {profile.age || "-"}
            </div>
            <div>
              <span className="text-[#D79DFC]">Relationship:</span> {profile.relationship_status || "-"}
            </div>
            <div>
              <span className="text-[#D79DFC]">Looking For:</span> {profile.looking_for || "-"}
            </div>
            <div>
              <span className="text-[#D79DFC]">Family Plans:</span> {profile.family_plan || "-"}
            </div>
            <div>
              <span className="text-[#D79DFC]">Texting/Calling:</span> {profile.texting_calling || "-"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile; 