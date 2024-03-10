import { Octokit } from "octokit";
import process from "process";

export const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});
