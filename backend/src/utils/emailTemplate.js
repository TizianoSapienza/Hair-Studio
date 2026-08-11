export function renderEmailLayout({ title, bodyHtml, ctaText, ctaUrl }) {
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background-color:#F6F5F3;font-family:'Segoe UI',Helvetica,Arial,sans-serif;color:#1A1A1A;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
      <tr><td align="center">
        <table role="presentation" width="100%" style="max-width:480px;">
          <tr><td align="center" style="padding-bottom:24px;">
            <span style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:bold;color:#1A1A1A;">Hair Studio</span>
          </td></tr>
          <tr><td style="background-color:#FFFFFF;border:1px solid #E7E1DA;border-radius:12px;padding:32px;">
            <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:20px;margin:0 0 16px;color:#1A1A1A;">${title}</h1>
            <div style="font-size:15px;line-height:1.6;color:#1A1A1A;">${bodyHtml}</div>
            ${ctaUrl ? `<div style="margin-top:24px;"><a href="${ctaUrl}" style="display:inline-block;background-color:#D58D20;color:#FFFFFF;text-decoration:none;font-weight:600;padding:10px 24px;border-radius:6px;">${ctaText}</a></div>` : ""}
          </td></tr>
          <tr><td align="center" style="padding-top:20px;">
            <span style="font-size:12px;color:#6E665E;">Hair Studio — questa email è stata generata automaticamente.</span>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body></html>`;
}
