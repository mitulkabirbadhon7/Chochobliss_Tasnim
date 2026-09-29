/**
 * Utilities for masking sensitive customer data on the frontend
 * in compliance with data privacy standards and Phase 5C requirements.
 */

export function maskPhone(phone?: string | null): string {
  if (!phone) return "—";
  const cleaned = phone.trim();
  if (cleaned.length <= 4) return "••••";
  const start = cleaned.slice(0, 4);
  const end = cleaned.slice(-4);
  return `${start} •••• ${end}`;
}

export function maskEmail(email?: string | null): string {
  if (!email) return "—";
  const parts = email.split("@");
  if (parts.length !== 2) return "••••@••••";
  const [name, domain] = parts;
  if (name.length <= 2) {
    return `${name[0]}•@${domain}`;
  }
  return `${name[0]}${"•".repeat(Math.min(name.length - 2, 5))}${name.slice(-1)}@${domain}`;
}

export function maskStreet(street?: string | null): string {
  if (!street) return "—";
  const words = street.split(" ");
  if (words.length <= 2) return street;
  // Keep first word and last word, obscure middle words
  return words
    .map((w, idx) => (idx === 0 || idx === words.length - 1 ? w : "••••"))
    .join(" ");
}

export function maskCardNumber(last4?: string | null): string {
  if (!last4) return "•••• •••• •••• ••••";
  return `•••• •••• •••• ${last4}`;
}
