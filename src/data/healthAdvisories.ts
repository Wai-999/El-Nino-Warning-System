import { z } from "zod";
export const WHO_MYANMAR = "a0e5642e-870d-4764-ae64-c53e63267f4a";
export const WHO_DON = "https://www.who.int/api/news/diseaseoutbreaknews";
const stamp = z.string().datetime();
const item = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(400),
  url: z
    .string()
    .url()
    .refine((s) =>
      /^https:\/\/www\.who\.int\/emergencies\/disease-outbreak-news\/item\/[a-zA-Z0-9_-]+$/.test(
        s,
      ),
    ),
  issuedAt: stamp,
  sourceModifiedAt: stamp,
  country: z.literal("MM"),
  expiresAt: z.null(),
  kind: z.literal("official-health-bulletin"),
});
export const healthAdvisoriesSchema = z
  .object({
    version: z.literal(1),
    coverage: z.literal("who-don-only"),
    checkedAt: stamp,
    retrievedAt: stamp.nullable(),
    ok: z.boolean(),
    error: z.string().max(240).nullable(),
    items: item.array().max(10),
  })
  .superRefine((d, c) => {
    if (
      new Set(d.items.map((i) => i.id)).size !== d.items.length ||
      d.items.some(
        (i) =>
          !d.retrievedAt ||
          Date.parse(i.issuedAt) > Date.parse(d.retrievedAt) ||
          Date.parse(i.sourceModifiedAt) > Date.parse(d.retrievedAt),
      ) ||
      (d.retrievedAt && Date.parse(d.retrievedAt) > Date.parse(d.checkedAt))
    )
      c.addIssue({
        code: "custom",
        message: "Invalid health bulletin identity or chronology",
      });
  });
export type HealthAdvisories = z.infer<typeof healthAdvisoriesSchema>;
export const emptyHealthAdvisories: HealthAdvisories = {
  version: 1,
  coverage: "who-don-only",
  checkedAt: new Date(0).toISOString(),
  retrievedAt: null,
  ok: false,
  error: null,
  items: [],
};
export function validateHealthAdvisories(raw: unknown, now = Date.now()) {
  const result = healthAdvisoriesSchema.parse(raw);
  if (Date.parse(result.checkedAt) > now + 60000)
    throw Error("Future health retrieval");
  return result;
}
export function healthFeedUrl() {
  const url = new URL(WHO_DON);
  url.searchParams.set("sf_culture", "en");
  url.searchParams.set(
    "$filter",
    `regionscountries/any(x:x eq ${WHO_MYANMAR})`,
  );
  url.searchParams.set(
    "$select",
    "Id,Title,PublicationDateAndTime,regionscountries,ItemDefaultUrl,LastModified",
  );
  url.searchParams.set("$orderby", "PublicationDateAndTime desc");
  url.searchParams.set("$top", "10");
  return url;
}
export function parseHealthAdvisories(raw: unknown, retrievedAt: string) {
  const input = z
    .object({
      value: z
        .array(
          z.object({
            Id: z.string(),
            Title: z.string(),
            PublicationDateAndTime: stamp,
            LastModified: stamp,
            regionscountries: z.string().array(),
            ItemDefaultUrl: z.string().regex(/^\/[a-zA-Z0-9_-]+$/),
          }),
        )
        .max(10),
    })
    .parse(raw);
  if (input.value.some((i) => !i.regionscountries.includes(WHO_MYANMAR)))
    throw Error("Foreign or missing WHO country tag");
  return validateHealthAdvisories(
    {
      version: 1,
      coverage: "who-don-only",
      checkedAt: retrievedAt,
      retrievedAt,
      ok: true,
      error: null,
      items: input.value
        .map((i) => ({
          id: i.Id,
          title: i.Title,
          url: `https://www.who.int/emergencies/disease-outbreak-news/item${i.ItemDefaultUrl}`,
          issuedAt: i.PublicationDateAndTime,
          sourceModifiedAt: i.LastModified,
          country: "MM",
          expiresAt: null,
          kind: "official-health-bulletin",
        }))
        .sort((a, b) => Date.parse(b.issuedAt) - Date.parse(a.issuedAt)),
    },
    Date.parse(retrievedAt),
  );
}
export function healthFeedFresh(d: HealthAdvisories, now = Date.now()) {
  return (
    !!d.retrievedAt &&
    now >= Date.parse(d.retrievedAt) &&
    now - Date.parse(d.retrievedAt) < 18 * 3600000
  );
}
export function recentHealthItems(d: HealthAdvisories, now = Date.now()) {
  // A recency display policy, never an invented bulletin expiry or active status.
  return d.items.filter(
    (i) =>
      Date.parse(i.issuedAt) <= now &&
      now - Date.parse(i.issuedAt) <= 30 * 86400000,
  );
}
