import React from "react";
import Image from "next/image";

export type MascotDialogProps = {
  open: boolean;
  imageSrc: string;
  title: string;
  message?: string;
  showSpinner?: boolean;
  onClose?: () => void;
  children?: React.ReactNode;
};

export default function MascotDialog({
  open,
  imageSrc,
  title,
  message,
  showSpinner,
  onClose,
  children,
}: MascotDialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="relative bg-[#2E2E2E] border-4 border-[#FF99FF] rounded-2xl p-8 w-[420px] text-center shadow-2xl">
        {onClose && (
          <button
            aria-label="Close dialog"
            className="absolute top-2 right-3 text-white text-3xl leading-none hover:text-[#D79DFC]"
            onClick={onClose}
          >
            &times;
          </button>
        )}
        <Image
          src={imageSrc}
          alt="PixelPaws mascot"
          width={120}
          height={120}
          className="mx-auto -mt-24 mb-4 rotate-6"
          priority
        />
        <h3 className="text-[#D79DFC] font-fjalla-one text-2xl mb-3">{title}</h3>
        {message && (
          <p className="text-white text-lg leading-relaxed mb-4">{message}</p>
        )}
        {showSpinner && (
          <div className="w-8 h-8 border-4 border-[#D79DFC] border-t-transparent rounded-full mx-auto animate-spin mb-4"></div>
        )}
        {children}
      </div>
    </div>
  );
} 