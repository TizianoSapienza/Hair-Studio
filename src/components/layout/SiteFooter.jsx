import React from "react";
import { MapPin, Phone, Instagram, Facebook } from "lucide-react";
import { Link } from "react-router-dom";
import { SALON } from "@/lib/salonConfig";
import useBusinessInfo from "@/hooks/useBusinessInfo";
import useHomepageContent from "@/hooks/useHomepageContent";
import Logo from "@/components/Logo";

export default function SiteFooter() {
  const { data: info } = useBusinessInfo();
  const { data: home } = useHomepageContent();
  const name = info?.nome_attivita || SALON.name;
  const address = info?.indirizzo || SALON.address;
  const phone = info?.telefono || SALON.phone;
  const instagram = info?.instagram_url || SALON.instagram;
  const description = home?.footer_description || SALON.tagline;

  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <Logo size="sm" />
          <p className="mt-3 text-sm text-muted-foreground">{description}</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground">Seguici</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4 shrink-0 text-primary" />{phone}</li>
            {info?.facebook_link && (
              <li>
                <a href={info.facebook_link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-md px-2 py-1 -mx-2 text-muted-foreground transition-colors hover:bg-secondary">
                  <Facebook className="h-4 w-4 shrink-0 text-primary" /> Facebook
                </a>
              </li>
            )}
            {instagram && (
              <li>
                <a href={instagram} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-md px-2 py-1 -mx-2 text-muted-foreground transition-colors hover:bg-secondary">
                  <Instagram className="h-4 w-4 shrink-0 text-primary" /> Instagram
                </a>
              </li>
            )}
            {info?.google_maps_link && (
              <li>
                <a href={info.google_maps_link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-md px-2 py-1 -mx-2 text-muted-foreground transition-colors hover:bg-secondary">
                  <MapPin className="h-4 w-4 shrink-0 text-primary" /> Google
                </a>
              </li>
            )}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground">Naviga</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li><a href="/#servizi" className="text-muted-foreground hover:text-foreground">Servizi</a></li>
            <li><Link to="/about" className="text-muted-foreground hover:text-foreground">Chi siamo</Link></li>
            <li><Link to="/contact" className="text-muted-foreground hover:text-foreground">Contatti</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {name}. Tutti i diritti riservati.
      </div>
    </footer>
  );
}