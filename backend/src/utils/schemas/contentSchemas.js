import { z } from "zod";

//Campi opzionali inviati dal form come stringa vuota quando non compilati:
//"" viene trattato come "assente" invece di far fallire la validazione URL/email.
//Schema ristretto a http/https: z.string().url() da solo accetta qualunque schema
//sintatticamente valido, incluso "javascript:" — questi URL finiscono in un href
//renderizzato a ogni visitatore del sito (footer, pagina contatti), quindi vanno
//validati qui, non solo lato frontend (che è solo difesa in profondità).
const optionalUrl = z.preprocess(
  (v) => (v === "" ? undefined : v),
  z
    .string()
    .url()
    .refine((v) => /^https?:\/\//i.test(v), { message: "L'URL deve iniziare con http:// o https://" })
    .optional()
);
const optionalEmail = z.preprocess((v) => (v === "" ? undefined : v), z.string().email().optional());

export const businessInfoSchema = z.object({
  businessName: z.string().trim().min(1),
  address: z.string().trim().min(1),
  phone: z.string().trim().min(1),
  email: optionalEmail,
  instagramUrl: optionalUrl,
  facebookUrl: optionalUrl,
  whatsappUrl: optionalUrl,
  googleMapsUrl: optionalUrl,
  googleReviewUrl: optionalUrl,
  openingHoursDisplay: z
    .array(
      z.object({
        giorno: z.string(),
        orario: z.string().optional(),
        chiuso: z.boolean().optional(),
        noteOrari: z.string().optional(),
      })
    )
    .optional(),
});

export const homepageContentSchema = z.object({
  heroTitle: z.string().optional(),
  heroSubtitle: z.string().optional(),
  chiSiamoTitolo: z.string().optional(),
  chiSiamoTesto: z.string().optional(),
  card1Numero: z.string().optional(),
  card1Testo: z.string().optional(),
  card2Numero: z.string().optional(),
  card2Testo: z.string().optional(),
  card3Numero: z.string().optional(),
  card3Testo: z.string().optional(),
  footerDescription: z.string().optional(),
  aboutChiSiamo: z.string().optional(),
  aboutComeFunziona: z.string().optional(),
  aboutTeam: z.string().optional(),
});
