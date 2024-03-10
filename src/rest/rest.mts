import { octokit } from "./client.mts";

const MAX_PER_PAGE = 100;

function buildLinks(headerLink: string) {
  const linkRegex = /<([^>]*)>/g;
  const queryParameterRegex = /<[^?]*\?[^>]*page=(\d+)[^>]*>/g;

  const templateString = linkRegex.exec(headerLink)![1];
  const matches = [...headerLink.matchAll(queryParameterRegex)];

  const [from, to] = matches.map((match) => {
    return +match[1];
  });

  return Array.from({ length: to - from + 1 }, (_, index) => index + from).map(
    (index) => templateString.replace(/&page=\d+/, `&page=${index}`),
  );
}

async function fetchContributorBatch(links: string[]) {
  const batchedContributors = await Promise.all(
    links.map((link) => octokit.request(link)),
  );
  return batchedContributors
    .map((response) => response.data)
    .flatMap((array) => array);
}
// we will take contributors with batch request since GitHub api does allow it
export async function getContributors(
  owner: string,
  repository: string,
): Promise<{ login: string }[]> {
  const { headers, data } = await octokit.rest.repos.listContributors({
    owner: owner,
    repo: repository,
    per_page: MAX_PER_PAGE,
  });

  if (!headers.link) {
    return [...data].filter((user) => user.type === "User") as {
      login: string;
    }[];
  }

  const links = buildLinks(headers.link);
  const batchedContributors = await fetchContributorBatch(links);

  return [...data, ...batchedContributors].filter(
    (user) => user.type === "User",
  );
}
