const CATEGORY_MOOD_COPY: Record<string, string> = {
  "y2k-aesthetic": "Main character energy, circa 2000",
  "minimalist-office": "Soft power dressing, zero noise",
  streetwear: "Off-duty fits that hit every time",
  "date-night": "Turn heads without trying too hard",
  "vacation-resort": "Poolside polish, passport ready",
  "dance-wear": "Move freely, look unreal",
};

export function getCategoryMoodLine(slug: string): string {
  return (
    CATEGORY_MOOD_COPY[slug] ??
    "Curated pieces for your next outfit obsession"
  );
}
