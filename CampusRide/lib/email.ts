/**
 * EmailJS integration — sends support emails automatically, with NO backend.
 *
 * ── ONE-TIME SETUP (≈5 min, free) ──────────────────────────────────────────
 * 1. Create a free account at https://www.emailjs.com
 * 2. "Email Services" → Add New Service → connect the inbox that will SEND
 *    (e.g. a Gmail). Copy its Service ID.
 * 3. "Email Templates" → Create New Template. In the template:
 *      - Set "To Email" to:  mohansanka5182@gmail.com
 *      - Use these variables in the subject/body:
 *          {{from_name}}, {{from_email}}, {{subject}}, {{message}}
 *      Copy the Template ID.
 * 4. "Account" → copy your Public Key.
 * 5. Paste all three values below. That's it — reports now email automatically.
 *
 * Until these are filled in, the app falls back to opening the user's mail app.
 */
export const EMAILJS_SERVICE_ID = 'service_odsk0lo';
export const EMAILJS_TEMPLATE_ID = 'template_fqh494r';
export const EMAILJS_PUBLIC_KEY = 'EKjb23zYLN1aMH23d';

export function isEmailConfigured(): boolean {
  return (
    !EMAILJS_SERVICE_ID.startsWith('YOUR_') &&
    !EMAILJS_TEMPLATE_ID.startsWith('YOUR_') &&
    !EMAILJS_PUBLIC_KEY.startsWith('YOUR_')
  );
}

export interface SupportEmailParams {
  from_name: string;
  from_email: string;
  subject: string;
  message: string;
}

/** Send a support email via EmailJS REST API (browser/web flow). */
export async function sendSupportEmail(params: SupportEmailParams): Promise<void> {
  const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: EMAILJS_SERVICE_ID,
      template_id: EMAILJS_TEMPLATE_ID,
      user_id: EMAILJS_PUBLIC_KEY,
      template_params: params,
    }),
  });
  if (!res.ok) {
    throw new Error(`EmailJS failed: ${res.status} ${await res.text()}`);
  }
}
