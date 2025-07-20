"use client";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/app/utils/supabase";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function PfpRightSide() {
  const [age, setAge] = useState(18);
  const [selected, setSelected] = useState<string[]>([]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // form field states
  const [fullName, setFullName] = useState("");
  const [workAs, setWorkAs] = useState("");
  const [lookingFor, setLookingFor] = useState("");
  const [familyPlan, setFamilyPlan] = useState("");
  const [relationship, setRelationship] = useState("");
  const [contactPref, setContactPref] = useState("");
  const [tagline, setTagline] = useState("");

  // Fetch existing profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (!supabase) return;

      // Get current user
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();

      if (userErr || !user) return;

      // Fetch profile data
      const { data: profileData } = await supabase
        .from("profiles")
        .select(
          "full_name, work_as, looking_for, family_plan, relationship_status, texting_calling, age, tagline, interests"
        )
        .eq("id", user.id)
        .single();

      if (profileData) {
        setFullName(profileData.full_name ?? "");
        setWorkAs(profileData.work_as ?? "");
        setLookingFor(profileData.looking_for ?? "");
        setFamilyPlan(profileData.family_plan ?? "");
        setRelationship(profileData.relationship_status ?? "");
        setContactPref(profileData.texting_calling ?? "");
        setAge(profileData.age ?? 18);
        setTagline(profileData.tagline ?? "");
        setSelected(profileData.interests ?? []);
      }

      // Fetch profile photo URL
      const { data: urlData } = await supabase
        .from("profileurl")
        .select("photo_url")
        .eq("user_id", user.id)
        .single();

      if (urlData?.photo_url) {
        setUploadedImage(urlData.photo_url);
      }
    };

    fetchProfile();
  }, []);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDialog, setShowDialog] = useState(false);

  // PII Analysis alert dialog state
  const [showPiiDialog, setShowPiiDialog] = useState(false);
  const [piiAnalysis, setPiiAnalysis] = useState<{ score: number; level: string; summary: string } | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !supabase) return;

    setIsUploading(true);
    
    try {
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();

      if (userErr || !user) {
        console.error("No authenticated user found");
        return;
      }

      // Create a unique filename using user.id
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}.${fileExt}`;

      // First, try to delete existing file if it exists
      try {
        await supabase.storage.from('photos').remove([fileName]);
      } catch (error) {
        // File doesn't exist, which is fine
      }

      // Upload to Supabase storage bucket named 'photos'
      const { data, error } = await supabase.storage
        .from('photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false // Don't use upsert, we'll handle it manually
        });

      if (error) {
        console.error("Error uploading file:", error);
        alert("Upload failed. Please check your Supabase storage policies.");
        return;
      }

      // Generate a signed URL valid for 1 year (31536000 seconds)
      const { data: signedData, error: signedErr } = await supabase.storage
        .from('photos')
        .createSignedUrl(fileName, 60 * 60 * 24 * 365);

      if (signedErr || !signedData) {
        console.error('Error generating signed URL:', signedErr);
        return;
      }

      const signedUrl = signedData.signedUrl;

      setUploadedImage(signedUrl);
      console.log('File uploaded successfully. Signed URL:', signedUrl);

      // Upsert into profileurl table (insert if new, update if exists) with signed URL
      try {
        const { error: upsertErr } = await supabase
          .from('profileurl')
          .upsert({ user_id: user.id, photo_url: signedUrl });

        if (upsertErr) {
          console.error('Error updating profileurl table:', upsertErr);
        }
      } catch (tblErr) {
        console.error('Unexpected error updating profileurl table:', tblErr);
      }
    } catch (error) {
      console.error("Error during upload:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!supabase) return;

    // Basic validation
    const newErrors: Record<string, string> = {};
    if (!uploadedImage) newErrors.photo = "Photo is required";
    if (!fullName.trim()) newErrors.fullName = "Name required";
    if (!workAs.trim()) newErrors.workAs = "Work As required";
    if (!lookingFor.trim()) newErrors.lookingFor = "Looking For required";
    if (!familyPlan.trim()) newErrors.familyPlan = "Family Plan required";
    if (!relationship.trim()) newErrors.relationship = "Relationship Status required";
    if (!contactPref.trim()) newErrors.contactPref = "Texting/Calling preference required";
    if (!tagline.trim()) newErrors.tagline = "Tagline required";
    if (selected.length === 0) newErrors.interests = "Select at least one interest";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setShowDialog(true);
      return;
    }

    setErrors({}); // clear errors

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    // Fetch access token for auth header
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Skipping backend analysis call for now – will integrate later

    if (userErr || !user) {
      console.error("No authenticated user found");
      return;
    }

    // Always show PII dialog (hard-coded for now)
    const samplePii = {
      score: 0,
      level: "MINIMAL",
      summary:
        "This text describes an analysis of image-based vulnerabilities. The key information includes a list of image URLs from various domains, a vague vulnerability description, and an AI summary. The analysis concludes there's minimal PII risk.",
    } as const;

    setPiiAnalysis(samplePii);
    setShowPiiDialog(true);

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: fullName,
      work_as: workAs,
      looking_for: lookingFor,
      family_plan: familyPlan,
      relationship_status: relationship,
      texting_calling: contactPref,
      age,
      tagline,
      interests: selected,
    });

    if (error) {
      console.error("Error saving profile:", error);
    } else {
      console.log("Profile saved / updated");
    }
  };

  return (
    <div className="relative flex flex-col items-start justify-start pt-10 pl-10 bg-black h-full w-full">
      {/* Upload Photo container */}
      <div
        className="relative mx-60 rounded-[30px] overflow-hidden cursor-pointer"
        style={{
          width: "581px",
          height: "450px",
          boxShadow: "12px 4px 4px 0px #FBE9FF",
          backdropFilter: "blur(4px)",
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        {/* Background image */}
        <Image
          src="/assets/upload-section.png"
          alt="Upload section background"
          fill
          style={{ objectFit: "cover" }}
          priority
        />

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Centered overlay text & icon */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          {uploadedImage ? (
            <>
              {/* Full-size uploaded image */}
              <img
                src={uploadedImage ?? ''}
                alt="Uploaded profile photo"
                className="absolute inset-0 w-full h-full object-cover rounded-[30px] pointer-events-none"
              />

              {/* Removed overlay text; prompt will be placed below container */}
            </>
          ) : (
            <>
              <span className="text-white font-fjalla-one text-3xl">
                {isUploading ? "Uploading..." : "Upload Photo"}
              </span>
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center border border-[#FF99FF]">
                {isUploading ? (
                  <div className="w-8 h-8 border-2 border-[#B52558] border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg
                    className="w-8 h-8"
                    viewBox="0 0 24 24"
                    fill="#B52558"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 21s-4.35-2.54-7.2-5.3C2 13 1 10.54 1 8.5 1 5.42 3.42 3 6.5 3c1.74 0 3.41.81 4.5 2.09C12.09 3.81 13.76 3 15.5 3 18.58 3 21 5.42 21 8.5c0 2.04-1 4.5-3.8 7.2C16.35 18.46 12 21 12 21z" />
                  </svg>
                )}
              </div>
              <span className="text-white font-fjalla-one text-lg">Click to upload</span>
            </>
          )}
        </div>
      </div>

      {/* Prompt placed below the upload container */}
      {uploadedImage && (
        <div
          className="mt-4 self-center"
          style={{ width: "500px" }}
        >
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full rounded-[25px] border border-[#FFFBFB] bg-[#D9D9D914] text-[#D79DFC] font-fjalla-one text-2xl py-3 hover:bg-[#c26dfc]/20 transition-colors items-center justify-center"
          >
            Click to change photo
          </button>
        </div>
      )}

      {/* Top Action Bar */}
      <div className="absolute top-[73px] right-10 flex items-center gap-5">
        {/* Upgrade */}
        <button
          type="button"
          className="text-white font-fjalla-one text-xl border border-white"
          style={{
            width: "300px",
            height: "55px",
            borderRadius: "20px",
            background: "#CC90DA",
            boxShadow: "12px 12px 20px 0px #00000040",
          }}
        >
          Upgrade Account
        </button>

        {/* Bell Icon */}
        <button type="button" className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="#FFFFFF"
            className="w-8 h-8"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {/* green dot */}
          <span className="absolute top-0 right-0 block w-2.5 h-2.5 bg-green-400 rounded-full"></span>
        </button>

        {/* Heart Icon */}
        <button type="button">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={2}
            className="w-8 h-8"
          >
            <path d="M12 21s-4.35-2.54-7.2-5.3C2 13 1 10.54 1 8.5 1 5.42 3.42 3 6.5 3c1.74 0 3.41.81 4.5 2.09C12.09 3.81 13.76 3 15.5 3 18.58 3 21 5.42 21 8.5c0 2.04-1 4.5-3.8 7.2C16.35 18.46 12 21 12 21z" />
          </svg>
        </button>
      </div>

      {/* Profile Info Form */}
      <form className="mt-16 w-full max-w-5xl text-white font-fjalla-one">
        <div className="flex w-full">
          {/* Left Column */}
          <div className="flex-1 flex flex-col gap-6 pr-4">
            {/* Name */}
            <div>
              <label className="text-2xl text-gray-400" htmlFor="name">Name :</label>
              <input
                id="name"
                name="name"
                type="text"
                value={fullName}
                onChange={(e)=>setFullName(e.target.value)}
                className="block w-full bg-transparent border-0 border-b border-gray-600 focus:border-[#FF99FF] outline-none py-2 mt-2 text-lg"
              />
            </div>

            {/* Work As */}
            <div>
              <label className="text-2xl text-gray-400" htmlFor="workAs">Work As :</label>
              <input
                id="workAs"
                name="workAs"
                type="text"
                value={workAs}
                onChange={(e)=>setWorkAs(e.target.value)}
                className="block w-full bg-transparent border-0 border-b border-gray-600 focus:border-[#FF99FF] outline-none py-2 mt-2 text-lg"
              />
            </div>

            {/* Looking For */}
            <div>
              <label className="text-2xl text-gray-400" htmlFor="lookingFor">Looking For :</label>
              <input
                id="lookingFor"
                name="lookingFor"
                type="text"
                value={lookingFor}
                onChange={(e)=>setLookingFor(e.target.value)}
                className="block w-full bg-transparent border-0 border-b border-gray-600 focus:border-[#FF99FF] outline-none py-2 mt-2 text-lg"
              />
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="w-px bg-gray-700" />

          {/* Right Column */}
          <div className="flex-1 flex flex-col gap-6 pl-4">
            {/* Family Plan */}
            <div>
              <label className="text-2xl text-gray-400" htmlFor="familyPlan">Family plan:</label>
              <input
                id="familyPlan"
                name="familyPlan"
                type="text"
                value={familyPlan}
                onChange={(e)=>setFamilyPlan(e.target.value)}
                className="block w-full bg-transparent border-0 border-b border-gray-600 focus:border-[#FF99FF] outline-none py-2 mt-2 text-lg"
              />
            </div>

            {/* Relationship Status */}
            <div>
              <label className="text-2xl text-gray-400" htmlFor="relationship">Relationship Status:</label>
              <input
                id="relationship"
                name="relationship"
                type="text"
                value={relationship}
                onChange={(e)=>setRelationship(e.target.value)}
                className="block w-full bg-transparent border-0 border-b border-gray-600 focus:border-[#FF99FF] outline-none py-2 mt-2 text-lg"
              />
            </div>

            {/* Removed Hobby and Pet-Peeves per latest requirement */}

            {/* Texting / Calling */}
            <div>
              <label className="text-2xl text-gray-400" htmlFor="contactPref">Texting/Calling:</label>
              <input
                id="contactPref"
                name="contactPref"
                type="text"
                value={contactPref}
                onChange={(e)=>setContactPref(e.target.value)}
                className="block w-full bg-transparent border-0 border-b border-gray-600 focus:border-[#FF99FF] outline-none py-2 mt-2 text-lg"
              />
            </div>
          </div>
        </div>
      </form>

      {/* Age Slider */}
      <div className="mt-10 w-full max-w-md">
        <label className="text-2xl font-fjalla-one text-[#D79DFC] mb-2 inline-block" htmlFor="ageRange">Age: {age}</label>
        <input
          id="ageRange"
          type="range"
          min="18"
          max="80"
          value={age}
          onChange={(e) => setAge(parseInt(e.target.value))}
          className="w-full h-1 bg-[#FBE9FF] rounded-lg appearance-none cursor-pointer"
          style={{ accentColor: "#FFFFFF" }}
        />
        <div className="flex justify-between text-gray-500 mt-1 text-lg w-full">
          <span>18</span>
          <span>80</span>
        </div>
      </div>

      {/* Tagline Input */}
      <div className="mt-6 w-full max-w-2xl">
        <div
          className="w-full rounded-[25px] px-6 py-4"
          style={{ background: "#D9D9D914" }}
        >
          <input
            type="text"
            name="tagline"
            placeholder="Add A Tagline:"
            value={tagline}
            onChange={(e)=>setTagline(e.target.value)}
            className="w-full bg-transparent outline-none placeholder-[#D79DFC] text-[#D79DFC] font-fjalla-one text-2xl"
          />
        </div>
      </div>

      {/* Save Profile Button (outside preferences) */}
      <div className="mt-8">
        <button
          type="button"
          onClick={handleSaveProfile}
          className="px-12 py-3 bg-[#D79DFC] text-white text-xl font-fjalla-one rounded-xl shadow-md hover:bg-[#c26dfc] transition-colors"
        >
          Save Profile
        </button>

        {/* Inline error removed; handled by dialog */}
      </div>

      {/* Interests Selection - positioned to the right */}
      <div className="absolute top-[200px] right-10 w-[400px] bg-[#2E2E2E]/70 rounded-2xl p-8 shadow-lg">
          <h3 className="text-[#D79DFC] text-2xl font-fjalla-one mb-6 leading-snug max-w-sm">
            Choose Your Interest. Don’t Worry, You Can Always Change It Later
          </h3>

          <div className="grid grid-cols-3 gap-4">
            {[
              "News","Comedy","Society",
              "Culture","Business","Sport",
              "Fashion","Art","Drama",
              "Emotion","Anime","Feminist",
              "Science","Politics","True Crime",
              "Tech","Kids","Film&Tv",
              "Travelling","Nature"
            ].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() =>
                  setSelected((prev) =>
                    prev.includes(item)
                      ? prev.filter((i) => i !== item)
                      : [...prev, item]
                  )
                }
                className={`py-3 px-4 rounded-lg text-xl font-fjalla-one transition-all duration-200 border border-transparent ${
                  selected.includes(item)
                    ? 'bg-[#D79DFC] text-black'
                    : 'bg-[#FFE9FF] text-[#D79DFC] hover:bg-[#FFDBFF]'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {/* Button removed from here */}
        </div>
      {/* Validation dialog */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="relative bg-[#2E2E2E] border-4 border-[#FF99FF] rounded-2xl p-8 w-[420px] text-center shadow-2xl">
            <button
              aria-label="Close dialog"
              className="absolute top-2 right-3 text-white text-3xl leading-none hover:text-[#D79DFC]"
              onClick={() => setShowDialog(false)}
            >
              &times;
            </button>

            {/* Cat illustration */}
            <Image
              src="/assets/cats/4.png"
              alt="Cute cat"
              width={120}
              height={120}
              className="mx-auto -mt-24 mb-4 rotate-6"
              priority
            />

            <h3 className="text-red-500 font-fjalla-one text-2xl mb-3">Hold on, friend!</h3>
            <p className="text-red-500 text-lg leading-relaxed">
              Please complete all required fields, upload a photo and select at least one interest.
            </p>
          </div>
        </div>
      )}

      {/* PII Risk Alert dialog */}
      {showPiiDialog && piiAnalysis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="relative bg-[#2E2E2E] border-4 border-[#FF99FF] rounded-2xl p-8 w-[460px] text-center shadow-2xl">
            <button
              aria-label="Close dialog"
              className="absolute top-2 right-3 text-white text-3xl leading-none hover:text-[#D79DFC]"
              onClick={() => setShowPiiDialog(false)}
            >
              &times;
            </button>
            <Image
              src="/assets/cats/5.png"
              alt="Alert cat"
              width={120}
              height={120}
              className="mx-auto -mt-24 mb-4 rotate-6"
              priority
            />
            <h3 className="text-[#D79DFC] font-fjalla-one text-2xl mb-3">Privacy Risk Alert!</h3>
            <p className="text-red-500 text-xl mb-2">
              PII Risk Level: {piiAnalysis.level} (Score: {piiAnalysis.score})
            </p>
            <p className="text-white text-lg leading-relaxed mb-4">{piiAnalysis.summary}</p>

            <button
              type="button"
              onClick={() => {
                setShowPiiDialog(false);
                router.push("/dashboard");
              }}
              className="mt-2 px-6 py-3 bg-[#D79DFC] text-black font-fjalla-one text-xl rounded-lg hover:bg-[#c26dfc] transition-colors"
            >
              Still want to continue to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 