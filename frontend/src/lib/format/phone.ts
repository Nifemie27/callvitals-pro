/**
 * The CDR sample mixes phone formats freely — "999.986.4609",
 * "(568) 464-8029 x6936", "1-796-718-3810 x621". Normalize to one
 * consistent look; fall back to the original string when a number doesn't
 * cleanly resolve to a 10-digit US number, rather than mangling it.
 */
export function formatPhoneNumber(raw: string): string {
  const [numberPart, extensionPart] = raw.split(/x(?=\d)/i);
  const digits = numberPart.replace(/\D/g, "");

  const tenDigits =
    digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;

  if (tenDigits.length !== 10) return raw;

  const area = tenDigits.slice(0, 3);
  const prefix = tenDigits.slice(3, 6);
  const line = tenDigits.slice(6);
  const extension = extensionPart?.trim();

  return extension
    ? `(${area}) ${prefix}-${line} ext. ${extension}`
    : `(${area}) ${prefix}-${line}`;
}
