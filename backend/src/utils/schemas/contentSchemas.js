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
  businessName: z.string().trim().min(1).max(200),
  address: z.string().trim().min(1).max(300),
  phone: z.string().trim().min(1).max(30),
  email: optionalEmail,
  instagramUrl: optionalUrl,
  facebookUrl: optionalUrl,
  whatsappUrl: optionalUrl,
  googleMapsUrl: optionalUrl,
  googleReviewUrl: optionalUrl,
  logoUrl: optionalUrl,
  openingHoursDisplay: z
    .array(
      z.object({
        giorno: z.string().max(50),
        orario: z.string().max(100).optional(),
        chiuso: z.boolean().optional(),
        noteOrari: z.string().max(200).optional(),
      })
    )
    .max(7)
    .optional(),
});

const shortText = z.string().max(300).optional();
const longText = z.string().max(5000).optional();

export const homepageContentSchema = z.object({
  heroTitle: shortText,
  heroSubtitle: shortText,
  chiSiamoTitolo: shortText,
  chiSiamoTesto: longText,
  card1Numero: z.string().max(20).optional(),
  card1Testo: shortText,
  card2Numero: z.string().max(20).optional(),
  card2Testo: shortText,
  card3Numero: z.string().max(20).optional(),
  card3Testo: shortText,
  footerDescription: longText,
  aboutChiSiamo: longText,
  aboutComeFunziona: longText,
  aboutTeam: longText,
  heroImageUrl: optionalUrl,
  aboutImageUrl: optionalUrl,
  gallery1ImageUrl: optionalUrl,
  gallery2ImageUrl: optionalUrl,
  gallery3ImageUrl: optionalUrl,
});
