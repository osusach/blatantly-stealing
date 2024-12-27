import { Offer, OfferSchema } from "../lib/db";
import { shorten } from "../lib/shorten";

export async function getGetonboardEntryLevelOffers({
  mode,
}: {
  mode: "CHILE" | "REMOTE";
}): Promise<Offer[]> {
  const { meta } = await fetchOffers({ mode });
  const pages = [...Array(meta.total_pages + 1).keys()];
  pages.shift(); // removes index 0

  const offerPromises = pages.map(async (page) => {
    const jobs = await fetchOffers({ page, mode });
    // modality 4 = internship, seniortiy 1 = no experience required
    const entryLevel = jobs.data
      .filter(
        (job: any) =>
          job.attributes.modality.data.id === 4 ||
          job.attributes.seniority.data.id === 1
      )
      .map(async (job: any) => {
        const companyId = job.attributes.company.data.id;
        const res = await fetch(
          "https://www.getonbrd.com/api/v0/companies/" + companyId
        );
        const data = await res.json();
        return { ...job, fetched_company_name: data.data.attributes.name };
      });
    return Promise.all(entryLevel);
  });
  const formattedOffers = (await Promise.all(offerPromises)).flat(Infinity);
  const entryLevelOffers = formattedOffers.map((job) => {
    // design offers hav a different url
    // job.data.attributes.category_name == "Programming" means /jobs/programacion/
    const url = "https://www.getonbrd.cl/jobs/programacion/" + job.id;
    let location: string | null = null;
    if (job.attributes.remote_modality == "fully_remote") {
      location = "REMOTE";
    } else if (job.attributes.countries == "Chile") {
      location = "ONSITE";
    }
    const offer = OfferSchema.safeParse({
      id: job.id,
      date: new Date(job.attributes.published_at * 1000),
      content: shorten(job.attributes.description, 128),
      source: "GETONBOARD",
      title: job.attributes.title,
      company: job.fetched_company_name,
      url,
      type: job.attributes.modality.data.id ? "INTERNSHIP" : "NEWGRAD",
      location:
        job.attributes.remote_modality == "fully_remote" ? "REMOTE" : "ONSITE",
    });
    return offer.success ? offer.data : null;
  });
  return entryLevelOffers.filter((offer) => offer !== null);
}

async function fetchOffers(args: { page?: number; mode: "CHILE" | "REMOTE" }) {
  const queryParams = new URLSearchParams();

  if (args.page) queryParams.append("page", args.page.toString());

  if (args.mode === "REMOTE") {
    queryParams.append("remote", "true");
  } else {
    queryParams.append("country_code", "CL");
  }

  const url = `https://www.getonbrd.com/api/v0/categories/programming/jobs?${queryParams}`;
  const res = await fetch(url);
  return res.json();
}

(async () => {
  // TODO: merge this 2, can have repeated offers but ids are unique, filter them.
  // TODO: implement design offers
  const offers1 = await getGetonboardEntryLevelOffers({ mode: "CHILE" });
  const offers2 = await getGetonboardEntryLevelOffers({ mode: "REMOTE" });
  console.log(offers1);
  console.log(offers2);
})();
