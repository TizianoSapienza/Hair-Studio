import React from "react";
import { Image } from "@/components/ui/image";
import { SALON } from "@/lib/salonConfig";

export default function Logo({ withText = true, size = "md" }) {
  const box = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const text = size === "sm" ? "text-base" : "text-lg";
  return (
    <span className="flex shrink-0 items-center gap-2 whitespace-nowrap">
      <Image
        src={SALON.logo_url}
        alt={SALON.name}
        fittingType="fill"
        className={`${box} rounded-full overflow-hidden`}
      />
      {withText && (
        <span className={`font-heading ${text} font-semibold tracking-tight text-foreground`}>
          {SALON.name}
        </span>
      )}
    </span>
  );
}