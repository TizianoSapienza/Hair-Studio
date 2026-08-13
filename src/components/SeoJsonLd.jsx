import { useEffect } from "react";
import { scheduleApi } from "@/api/scheduleApi";
import useBusinessInfo from "@/hooks/useBusinessInfo";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function SeoJsonLd({ description }) {
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
          ...(address && {
            "address": {
              "@type": "PostalAddress",
              "streetAddress": address,
              "addressCountry": "IT",
            },
          }),
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

    let metaDesc = null;
    let createdMeta = false;
    let previousContent = null;
    if (description) {
      metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement("meta");
        metaDesc.name = "description";
        document.head.appendChild(metaDesc);
        createdMeta = true;
      } else {
        previousContent = metaDesc.content;
      }
      metaDesc.content = description;
    }

    return () => {
      cancelled = true;
      if (scriptEl && scriptEl.parentNode) scriptEl.parentNode.removeChild(scriptEl);
      //Senza questo, il meta description di una pagina resta in <head> quando si naviga
      //verso una pagina che non passa `description` (o non renderizza SeoJsonLd affatto).
      if (metaDesc) {
        if (createdMeta) metaDesc.parentNode?.removeChild(metaDesc);
        else metaDesc.content = previousContent || "";
      }
    };
  }, [info, description]);

  return null;
}