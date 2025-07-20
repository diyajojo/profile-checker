import Image from "next/image";

export default function LoadingMascot({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex items-center gap-3">
      <Image src="/assets/cats/2.png" alt="PixelPaws loading" width={32} height={32} priority className="animate-bounce" />
      <span className="text-[#D79DFC] font-fjalla-one text-xl">{message}</span>
    </div>
  );
} 