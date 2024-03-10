import { getContributors } from "./rest/rest.mts";
import { getUserContributionsPagination } from "./graphql/graphql.mts";
import process from "process";

function rankRepositories(contributions: { url: string }[][]) {
  const ranking: { [key: string]: number } = {};

  for (const contributionRecord of contributions as any) {
    for (const { url } of contributionRecord) {
      ranking[url] = (ranking[url] || 0) + 1;
    }
  }

  const sortedEntries = [...Object.entries(ranking)].sort(
    (a, b) => b[1] - a[1],
  );

  return sortedEntries;
}

function splitGitHubUrl(url: string) {
  const parts = url.split("/");
  const user = parts[3];
  const repo = parts[4];

  return { user, repo };
}

function makeResponse(rankings: [string, number][]) {
  let finalHTML = "";
  for (let [url, count] of rankings) {
    finalHTML += `
        <li class="text-left">
            <a href="${url}" class="font-medium text-blue-600 dark:text-blue-500 hover:underline">${url}</a>
            <span class="text-gray-500 ml-2">${count}</span>
        </li>
    `;
  }

  return finalHTML;
}

const server = Bun.serve({
  port: process.env.PORT || 3000,
  async fetch(request) {
    const { method } = request;
    const { pathname } = new URL(request.url);

    if (method === "GET" && pathname === "/") {
      return new Response(Bun.file("./src/frontend/index.html"));
    }

    if (method === "POST" && pathname === "/rankings") {
      const data = await request.formData();
      const gitHubUrl = data.get("ghUrl")!.toString();
      const { user, repo } = splitGitHubUrl(gitHubUrl);

      console.time("contributors");
      const contributors = await getContributors(user, repo);
      console.timeEnd("contributors");

      console.time("repos contribution");
      const repos = contributors.map((user) =>
        getUserContributionsPagination(user.login),
      );
      const reposByContribution = await Promise.all(repos);
      console.timeEnd("repos contribution");

      const rankings = rankRepositories(reposByContribution)
        .filter(([url, _]) => url !== gitHubUrl)
        .slice(0, 5);

      const responseHTML = makeResponse(rankings);
      return new Response(responseHTML);
    }

    return new Response(`Bun`);
  },
  error(error) {
    console.error(error);
    return new Response("Something went wrong :(");
  },
});

console.log(`Listening on ${server.url}`);
