import { Client, fetchExchange } from "urql";
import process from "process";

const GITHUB_GQL_URL = "https://api.github.com/graphql";
const headers = new Headers({
  Authorization: `bearer ${process.env.GITHUB_TOKEN}`,
});

export const gqlClient = new Client({
  url: GITHUB_GQL_URL,
  exchanges: [fetchExchange],
  fetchOptions: { headers },
});
