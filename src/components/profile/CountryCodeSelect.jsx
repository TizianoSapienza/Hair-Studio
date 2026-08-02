import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";

const COUNTRIES = [
  { code: "+39", flag: "🇮🇹", label: "Italia" },
  { code: "+1", flag: "🇺🇸", label: "USA / Canada" },
  { code: "+44", flag: "🇬🇧", label: "Regno Unito" },
  { code: "+49", flag: "🇩🇪", label: "Germania" },
  { code: "+33", flag: "🇫🇷", label: "Francia" },
  { code: "+34", flag: "🇪🇸", label: "Spagna" },
  { code: "+351", flag: "🇵🇹", label: "Portogallo" },
  { code: "+31", flag: "🇳🇱", label: "Olanda" },
  { code: "+32", flag: "🇧🇪", label: "Belgio" },
  { code: "+41", flag: "🇨🇭", label: "Svizzera" },
  { code: "+43", flag: "🇦🇹", label: "Austria" },
  { code: "+352", flag: "🇱🇺", label: "Lussemburgo" },
  { code: "+356", flag: "🇲🇹", label: "Malta" },
  { code: "+353", flag: "🇮🇪", label: "Irlanda" },
  { code: "+30", flag: "🇬🇷", label: "Grecia" },
  { code: "+46", flag: "🇸🇪", label: "Svezia" },
  { code: "+47", flag: "🇳🇴", label: "Norvegia" },
  { code: "+45", flag: "🇩🇰", label: "Danimarca" },
  { code: "+358", flag: "🇫🇮", label: "Finlandia" },
  { code: "+48", flag: "🇵🇱", label: "Polonia" },
  { code: "+420", flag: "🇨🇿", label: "Repubblica Ceca" },
  { code: "+36", flag: "🇭🇺", label: "Ungheria" },
  { code: "+40", flag: "🇷🇴", label: "Romania" },
  { code: "+385", flag: "🇭🇷", label: "Croazia" },
  { code: "+386", flag: "🇸🇮", label: "Slovenia" },
  { code: "+381", flag: "🇷🇸", label: "Serbia" },
  { code: "+359", flag: "🇧🇬", label: "Bulgaria" },
  { code: "+370", flag: "🇱🇹", label: "Lituania" },
  { code: "+371", flag: "🇱🇻", label: "Lettonia" },
  { code: "+372", flag: "🇪🇪", label: "Estonia" },
  { code: "+7", flag: "🇷🇺", label: "Russia" },
  { code: "+380", flag: "🇺🇦", label: "Ucraina" },
  { code: "+90", flag: "🇹🇷", label: "Turchia" },
  { code: "+212", flag: "🇲🇦", label: "Marocco" },
  { code: "+213", flag: "🇩🇿", label: "Algeria" },
  { code: "+216", flag: "🇹🇳", label: "Tunisia" },
  { code: "+20", flag: "🇪🇬", label: "Egitto" },
  { code: "+234", flag: "🇳🇬", label: "Nigeria" },
  { code: "+27", flag: "🇿🇦", label: "Sudafrica" },
  { code: "+55", flag: "🇧🇷", label: "Brasile" },
  { code: "+54", flag: "🇦🇷", label: "Argentina" },
  { code: "+52", flag: "🇲🇽", label: "Messico" },
  { code: "+57", flag: "🇨🇴", label: "Colombia" },
  { code: "+56", flag: "🇨🇱", label: "Cile" },
  { code: "+58", flag: "🇻🇪", label: "Venezuela" },
  { code: "+61", flag: "🇦🇺", label: "Australia" },
  { code: "+64", flag: "🇳🇿", label: "Nuova Zelanda" },
  { code: "+81", flag: "🇯🇵", label: "Giappone" },
  { code: "+82", flag: "🇰🇷", label: "Corea del Sud" },
  { code: "+86", flag: "🇨🇳", label: "Cina" },
  { code: "+91", flag: "🇮🇳", label: "India" },
  { code: "+92", flag: "🇵🇰", label: "Pakistan" },
  { code: "+971", flag: "🇦🇪", label: "Emirati Arabi Uniti" },
  { code: "+966", flag: "🇸🇦", label: "Arabia Saudita" },
  { code: "+972", flag: "🇮🇱", label: "Israele" },
  { code: "+965", flag: "🇰🇼", label: "Kuwait" },
  { code: "+974", flag: "🇶🇦", label: "Qatar" },
  { code: "+62", flag: "🇮🇩", label: "Indonesia" },
  { code: "+60", flag: "🇲🇾", label: "Malesia" },
  { code: "+63", flag: "🇵🇭", label: "Filippine" },
  { code: "+66", flag: "🇹🇭", label: "Thailandia" },
  { code: "+84", flag: "🇻🇳", label: "Vietnam" },
  { code: "+880", flag: "🇧🇩", label: "Bangladesh" },
];

export function splitPhone(raw) {
  if (!raw) return { code: "+39", number: "" };
  const str = String(raw).trim();
  const m = str.match(/^(\+\d{1,4})\s*(.*)$/);
  if (m) {
    const found = COUNTRIES.find((c) => c.code === m[1]);
    return { code: found ? found.code : m[1], number: m[2] };
  }
  return { code: "+39", number: str };
}

export default function CountryCodeSelect({ value, onChange, disabled, triggerClassName = "" }) {
  const selected = COUNTRIES.find((c) => c.code === value) || { code: value, flag: "🌐" };
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className={`h-9 w-[112px] shrink-0 gap-1 px-2 ${triggerClassName}`} aria-label="Prefisso nazionale">
        <span className="flex items-center gap-2 truncate">
          <span className="text-base leading-none">{selected.flag}</span>
          <span className="font-medium">{selected.code}</span>
        </span>
      </SelectTrigger>
      <SelectContent className="max-h-72 overflow-y-auto">
        {COUNTRIES.map((c) => (
          <SelectItem key={c.code + c.label} value={c.code}>
            <span className="flex items-center gap-2"><span className="text-base">{c.flag}</span><span className="font-medium">{c.code}</span> {c.label}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}