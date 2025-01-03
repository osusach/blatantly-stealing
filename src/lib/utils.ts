const NO_EXPERIENCE_KEYWORDS = [
  "intern",
  "internship",
  "new grad",
  "new graduate",
  "graduate",
  "no experience",
  "entry level",
  "apprenticeship",
  "apprentice",
  "fresh graduate",
];

export function doesTitleImplyNoExperience(title?: string) {
  if (!title) return false;
  return NO_EXPERIENCE_KEYWORDS.some((word) =>
    title.toLowerCase().includes(word)
  );
}

export function shorten(content: string, length: number): string {
  return content.length > length
    ? content.substring(0, length) + "..."
    : content;
}

/** sources like japandev add description in their company title */
export function formatCompanyName(company: string | null) {
  if (!company) return null;
  return company.split(/・| - /)[0].trim();
}
