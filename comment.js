const github = require('@actions/github');
const core = require('@actions/core');



const bitriseForwardURL = process.env.BITRISE_FORWARD_URL;
const githubToken = process.env.GITHUB_TOKEN;
const appSlug = process.env.BITRISE_APP_SLUG;
const workflowId = process.env.BITRISE_WORKFLOW_ID;
const action = github.context.payload.action;
const repo = github.context.repo.repo;
const owner = github.context.repo.owner;
const pull_number = getPrNumber();
const branch = getBranch();
const commit_message = encodeURI(getPRTitle());

console.log({ githubToken, repo, owner, pull_number, commit_message });

if (action !== 'opened') {
  console.log(`PR action is "${action}", therefore not commenting`);
  return;
}

if (!pull_number) {
  console.log('Could not get pull request number from context, exiting');
  return;
}

const octokit = new github.GitHub(githubToken);

run();

async function run() {
  let comment = `[Create Bitrise Beta Build](${bitriseForwardURL}?branch=${branch}&workflow_id=${workflowId}&app_slug=${appSlug}&commit_message=${commit_message})`;
  try {
    await octokit.pulls.createReview({
      owner,
      repo,
      pull_number,
      event: 'COMMENT',
      body: comment,
    });
  } catch (error) {
    console.log(error);
  }

  console.log('success');
}

function getPrNumber() {
  const pullRequest = github.context.payload.pull_request;
  if (!pullRequest) {
    return undefined;
  }

  return pullRequest.number;
}

function getBranch() {
  const pullRequest = github.context.payload.pull_request;
  if (!pullRequest) {
    return undefined;
  }

  return pullRequest.head.ref;
}

function getPRTitle() {
  const pullRequest = github.context.payload.pull_request;
  if (!pullRequest) {
    return undefined;
  }

  return pullRequest.title;
}
