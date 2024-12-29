import { match } from "ts-pattern";
import { Offer, OfferSchema } from "../lib/db";
import { fromAsyncThrowable } from "neverthrow";
import { unknown } from "zod";

export async function getGetonboardEntryLevelOffers() {
  const [programmingOffers, designOffers] = await Promise.all([
    getEntryLevelJobsByCategory("programming"),
    getEntryLevelJobsByCategory("design-ux"),
  ]);
  return [...programmingOffers, ...designOffers];
}

async function getEntryLevelJobsByCategory(
  category: "design-ux" | "programming"
): Promise<Offer[]> {
  const { meta } = await fetchOffersByPage(1, category);
  const totalPages = [...Array(meta.total_pages + 1).keys()];
  totalPages.shift(); // removes index 0

  const everyEntryLevelOFferByPagePromise = totalPages.map(async (page) => {
    const jobs = await fetchOffersByPage(page, category);
    // modality 4 intern
    // seniority 1 no experience
    // seniority 2 junior
    const entryLevel = jobs.data
      .filter(
        (job: any) =>
          (job.attributes.modality.data.id === 4 ||
            job.attributes.seniority.data.id === 1 ||
            job.attributes.seniority.data.id === 2) &&
          (job.attributes.countries.includes("Chile") ||
            job.attributes.remote_modality === "fully_remote")
      )
      .map(async (job: any) => {
        const companyName = await fromAsyncThrowable(getCompanyName)(
          job.attributes.company.data.id
        );
        if (companyName.isErr()) return { ...job, fetched_company_name: null };
        return { ...job, fetched_company_name: companyName.value };
      });
    return Promise.all(entryLevel);
  });
  const entryLevelOffers = (
    await Promise.all(everyEntryLevelOFferByPagePromise)
  ).flat(Infinity);
  const validFormattedOffers = entryLevelOffers.map((job) => {
    const url =
      (job.attributes.category_name === "Programming"
        ? "https://www.getonbrd.com/jobs/programming/"
        : "https://www.getonbrd.com/jobs/design-ux/") + job.id;
    const offer = OfferSchema.safeParse({
      id: job.id,
      published_at: new Date(job.attributes.published_at * 1000),
      source: "GETONBOARD",
      title: job.attributes.title,
      company: job.fetched_company_name,
      url,
      ...(job.attributes.min_salary || job.attributes.max_salary
        ? {
            salary:
              job.attributes.min_salary === job.attributes.max_salary
                ? `$${job.attributes.min_salary} USD`
                : `Entre $${job.attributes.min_salary} y $${job.attributes.max_salary} USD`,
          }
        : {}),
      seniority: match<{ modality: number; seniority: number; title: string }>({
        modality: job.attributes.modality.data.id,
        seniority: job.attributes.seniority.data.id,
        title: job.attributes.title,
      })
        .when(
          ({ title }) =>
            title.match(
              /(Práctica|Practica|Practicante|Intern|Internship|Pasante|Trainee)/i
            ),
          () => "INTERNSHIP"
        )
        .with({ modality: 4 }, () => "NOEXPERIENCE")
        .with({ seniority: 1 }, () => "NOEXPERIENCE")
        .with({ seniority: 2 }, () => "JUNIOR")
        .otherwise(() => unknown),
      location:
        job.attributes.remote_modality == "fully_remote" ? "REMOTE" : "ONSITE",
    });
    return offer.success ? offer.data : null;
  });
  return validFormattedOffers.filter((offer) => offer !== null);
}

async function fetchOffersByPage(
  page: number = 1,
  category: "programming" | "design-ux" = "programming"
) {
  const res = await fetch(
    `https://www.getonbrd.com/api/v0/categories/${category}/jobs?remote=true&page=${page}`
  );
  return res.json();
}

async function getCompanyName(id: string) {
  const res = await fetch("https://www.getonbrd.com/api/v0/companies/" + id);
  const data = await res.json();
  return data.data.attributes.name;
}
