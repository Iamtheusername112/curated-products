export function getSheinSearchReferralCode(): string {
  return (
    process.env.NEXT_PUBLIC_SHEIN_SEARCH_CODE?.trim() ||
    process.env.SHEIN_AFFILIATE_ID?.trim() ||
    process.env.SHEIN_AFFILIATE_SUB_ID?.trim() ||
    "shein_curator"
  );
}
