import React, { useMemo, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandItem } from "@/components/ui/commands";
import { cn } from "@/lib/utils";
import { getPhoneCountries, flagFromIso } from "@/lib/phoneCountries";

export default function CountryCodeSelect({ value, onChange, disabled, triggerClassName = "" }) {
  const [open, setOpen] = useState(false);
  const countries = useMemo(() => getPhoneCountries(), []);

  // Più paesi possono condividere lo stesso prefisso (es. +1 = USA/Canada/territori
  // caraibici): se il prefisso selezionato non identifica un paese univoco, mostra 🌐
  // invece di una bandiera arbitraria e potenzialmente fuorviante.
  const matches = useMemo(() => countries.filter((c) => c.callingCode === value), [countries, value]);
  const flag = matches.length === 1 ? flagFromIso(matches[0].iso) : "🌐";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex h-9 w-[112px] shrink-0 items-center justify-between gap-1 rounded-md border border-input bg-transparent px-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            triggerClassName
          )}
          aria-label="Prefisso nazionale"
        >
          <span className="flex items-center gap-2 truncate">
            <span className="text-base leading-none">{flag}</span>
            <span className="font-medium">{value}</span>
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <Command>
          <CommandInput placeholder="Cerca per nome, ISO o prefisso..." />
          <CommandList className="max-h-72">
            <CommandEmpty>Nessun paese trovato</CommandEmpty>
            {countries.map((c) => (
              <CommandItem
                key={c.iso}
                value={`${c.name} ${c.iso} ${c.callingCode}`}
                onSelect={() => { onChange(c.callingCode); setOpen(false); }}
              >
                <span className="text-base">{flagFromIso(c.iso)}</span>
                <span className="font-medium">{c.callingCode}</span>
                <span className="truncate">{c.name}</span>
                {c.callingCode === value && <Check className="ml-auto h-4 w-4 shrink-0" />}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
