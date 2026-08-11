//Integrazione Resend. Finché RESEND_API_KEY non è configurata (fase di sviluppo,
//vedi CLAUDE.md), l'invio viene solo loggato invece di fallire: le funzionalità
//di auth non devono bloccarsi per l'assenza di un secret non ancora emesso.
const RESEND_API_URL = "https://api.resend.com/emails";

export async function sendEmail({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    console.warn(`[email] RESEND non configurato, email non inviata a ${to}: ${subject}`);
    return;
  }

  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error(`[email] invio fallito a ${to}: ${response.status} ${body}`);
  }
}
