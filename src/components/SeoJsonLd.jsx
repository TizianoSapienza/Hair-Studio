import { useEffect } from "react";
import { scheduleApi } from "@/api/scheduleApi";
import useBusinessInfo from "@/hooks/useBusinessInfo";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function SeoJsonLd({ title, description }) {
  const { data: info } = useBusinessInfo();

  useEffect(() => {
    let cancelled = false;
    let scriptEl = null;

    (async () => {
      try {
        const { openingHours } = await scheduleApi.openingHours().catch(() => ({ openingHours: [] }));
        const specs = (openingHours || [])
          .filter((d) => d.isOpen && d.startTime && d.endTime)
          .map((d) => ({
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": DAY_NAMES[d.dayOfWeek],
            "opens": d.startTime,
            "closes": d.endTime,
          }));
        const name = info?.businessName || "Hair Studio";
        const address = info?.address || "";
        const phone = info?.phone || "";
        const jsonLd = {
          "@context": "https://schema.org",
          "@type": "HairSalon",
          "name": name,
          "address": {
            "@type": "PostalAddress",
            "streetAddress": address,
            "addressLocality": "Mascalucia",
            "addressRegion": "CT",
            "addressCountry": "IT",
          },
          "telephone": phone,
          "openingHoursSpecification": specs,
        };
        if (cancelled) return;
        scriptEl = document.createElement("script");
        scriptEl.type = "application/ld+json";
        scriptEl.text = JSON.stringify(jsonLd);
        document.head.appendChild(scriptEl);
      } catch (e) {
        console.warn("Impossibile generare il JSON-LD", e);
      }
    })();

    if (title) document.title = title;
    let metaDesc = null;
    if (description) {
      metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement("meta");
        metaDesc.name = "description";
        document.head.appendChild(metaDesc);
      }
      metaDesc.content = description;
    }

    return () => {
      cancelled = true;
      if (scriptEl && scriptEl.parentNode) scriptEl.parentNode.removeChild(scriptEl);
    };
  }, [info, title, description]);

  return null;
}