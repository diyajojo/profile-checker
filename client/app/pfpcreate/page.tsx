"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/app/utils/supabase";
import LeftSide from "./components/left";
import RightSide from "./components/right";
import MascotDialog from "@/app/components/mascot/MascotDialog";

function PfpCreateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEdit = searchParams.get('edit') === 'true';
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkProfile = async () => {
      if (!supabase) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Log the access token if available
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.access_token) {
        console.log('Access token:', session.access_token);
      }

      if (!user) {
        // No logged-in user, send to auth page
        router.push("/auth");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      if (profile) {
        if (isEdit) {
          // stay on page to edit profile
          setChecking(false);
        } else {
          router.push("/dashboard");
        }
      } else {
        setChecking(false); // stay on page to complete profile
      }
    };

    checkProfile();
  }, [router]);

  if (checking) {
    return (
      <div className="flex w-full h-screen">
        <LeftSide />
        <div className="flex-1 bg-black flex items-center justify-center">
          <MascotDialog
            open
            imageSrc="/assets/cats/2.png"
            title="Preparing your profile..."
            showSpinner
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full h-screen">
      {/* Sidebar */}
      <LeftSide />

      {/* Right section */}
      <RightSide />
    </div>
  );
}

export default function PfpCreate() {
  return (
    <Suspense fallback={
      <div className="flex w-full h-screen">
        <LeftSide />
        <div className="flex-1 bg-black flex items-center justify-center">
          <MascotDialog
            open
            imageSrc="/assets/cats/2.png"
            title="Loading..."
            showSpinner
          />
        </div>
      </div>
    }>
      <PfpCreateContent />
    </Suspense>
  );
}   