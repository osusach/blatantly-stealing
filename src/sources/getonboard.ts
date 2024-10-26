import type { Job } from "./schema";

export async function getGetonboardJobs(): Promise<Job[]> {
  const { meta } = await getJobsFromGetonboard({ page: 1 });
  const pages = numberToArray(meta.total_pages);
  const promises = pages.map(async (page) => fetchEntryLevelJobs({ page }));
  // fetch all pages at the same time, more efficient
  const jobs = (await Promise.all(promises)).flat(Infinity);
  return jobs as Job[];
}

async function getJobsFromGetonboard({ page }: { page: number }) {
  const res = await fetch(
    `https://www.getonbrd.com/api/v0/categories/programming/jobs?page=${page}&country_code=CL`
  );
  const data = await res.json();
  return data;
}

function numberToArray(number: number) {
  const array = [...Array(number + 1).keys()];
  array.shift(); // remove 0
  return array;
}

async function fetchEntryLevelJobs({ page }: { page: number }): Promise<Job[]> {
  const jobs = await getJobsFromGetonboard({ page });
  // modality 4 = internship, seniortiy 1 = no experience required
  const entryLevelJobs = jobs.data.filter(
    (job) =>
      job.attributes.modality.data.id === 4 ||
      job.attributes.seniority.data.id === 1
  );
  const formatted = entryLevelJobs.map((job) => ({
    id: job.id,
    date: new Date(job.attributes.published_at * 1000),
    content: `${job.attributes.title} <br /> ${job.attributes.description} <br /> ${job.attributes.functions} <br /> ${job.attributes.desirable} <br /> ${job.attributes.benefits}`,
    source: "GETONBOARD_CHILE",
  }));
  return formatted;
}
