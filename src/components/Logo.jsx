import React from "react";
import { Image } from "@/components/ui/image";
import { SALON } from "@/lib/salonConfig";
import useBusinessInfo from "@/hooks/useBusinessInfo";

const BOX_SIZES = { sm: "h-8 w-8", md: "h-12 w-12", lg: "h-16 w-16" };
const TEXT_SIZES = { sm: "text-base", md: "text-lg", lg: "text-2xl" };
const BAR_SIZES = { sm: "h-0.5 w-6", md: "h-0.5 w-7", lg: "h-1 w-9" };

export default function Logo({ withText = true, size = "md" }) {
  const { data: businessInfo } = useBusinessInfo();
  const name = businessInfo?.businessName || SALON.name;
  const box = BOX_SIZES[size] || BOX_SIZES.md;
  const text = TEXT_SIZES[size] || TEXT_SIZES.md;
  const bar = BAR_SIZES[size] || BAR_SIZES.md;
  return (
    <span className="flex shrink-0 items-center gap-2 whitespace-nowrap">
      <Image
        src={businessInfo?.logoUrl || SALON.logo_url}
        alt={name}
        fittingType="fill"
        className={`${box} rounded-full overflow-hidden`}
      />
      {withText && (
        <span className="flex flex-col">
          <span className={`font-heading ${text} font-semibold tracking-tight text-foreground`}>
            {name}
          </span>
          <span className={`${bar} mt-0.5 rounded-full bg-primary`} />
        </span>
      )}
    </span>
  );
}