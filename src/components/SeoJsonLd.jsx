import { useEffect } from "react";
import { base44 } from "@/api/base44Client";
import useBusinessInfo from "@/hooks/useBusinessInfo";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function SeoJsonLd({ title, description }) {
  const { data: info } = useBusinessInfo();

  useEffect(() => {
    let cancelled = false;
    let scriptEl = null;

    (async () => {
      try {
        const oh = await base44.entities.OpeningHours.list().catch(() => []);
        const ohRec = (oh || [])[0] || null;
        const days = (ohRec && ohRec.days) || [];
        const specs = days
          .filter((d) => d.open && d.start_time && d.end_time)
          .map((d) => ({
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": DAY_NAMES[d.day_of_week],
            "opens": d.start_time,
            "closes": d.end_time,
          }));
        const name = info?.nome_attivita || "Hair Studio";
        const address = info?.indirizzo || "";
        const phone = info?.telefono || "";
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
      } catch (e) { /* ignore */ }
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