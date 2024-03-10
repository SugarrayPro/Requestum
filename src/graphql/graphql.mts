import { gqlClient } from "./client.mts";
import { userContributionsQuery } from "./operations.mts";

const MAX_PER_PAGE = 100;

type repoContributedTo = {
  nodes: { url: string }[];
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  };
};

export async function getUserContributions(
  login: string,
  afterCursor: string | null,
): Promise<repoContributedTo> {
  const { data, error } = await gqlClient.query(userContributionsQuery, {
    login: login,
    maxPerPage: MAX_PER_PAGE,
    afterCursor: afterCursor,
  });

  if (error) {
    console.error(error);
  }

  return data!.user!.repositoriesContributedTo as repoContributedTo;
}

export async function getUserContributionsPagination(
  login: string,
): Promise<{ url: string }[]> {
  let hasNextPage = true;
  let afterCursor: string | null = null;
  let contributionData: { url: string }[] = [];

  while (hasNextPage) {
    const { nodes, pageInfo }: repoContributedTo = await getUserContributions(
      login,
      afterCursor,
    );
    contributionData.push(...nodes!);

    hasNextPage = pageInfo.hasNextPage;
    afterCursor = pageInfo.endCursor;
  }

  return contributionData;
}
