import { graphql } from "gql.tada";

export const userContributionsQuery = graphql(`
  query getRepositoriesContributedTo(
    $login: String!
    $maxPerPage: Int!
    $afterCursor: String
  ) {
    user(login: $login) {
      repositoriesContributedTo(
        first: $maxPerPage
        after: $afterCursor
        contributionTypes: [
          COMMIT
          ISSUE
          PULL_REQUEST
          PULL_REQUEST_REVIEW
          REPOSITORY
        ]
      ) {
        nodes {
          url
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`);
