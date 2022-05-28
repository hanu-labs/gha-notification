const core = require('@actions/core');
const { context } = require('@actions/github');
const axios = require('axios');
// const octokit = github.getOctokit(GITHUB_TOKEN);

// const { context = {} } = github;

const SLACK_WEBHOOK = core.getInput('SLACK_WEBHOOK');
const SLACK_BOT_NAME = core.getInput('SLACK_BOT_NAME');
const FIELDS = core.getInput('FIELDS');
const SLACK_CHANNEL = core.getInput('SLACK_CHANNEL');
const MESSAGE = core.getInput('MESSAGE');
const TARGET = core.getInput('TARGET');
const BRANCH = core.getInput('BRANCH');
const ENVIRONMENT = core.getInput('ENVIRONMENT');

async function run() {
  if (SLACK_WEBHOOK) {
    const blocks = [];
    const fields = {};
    const textParts = []

    if (TARGET) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '[`' + TARGET +  '`]',
        }
      });
      textParts.push('[`' + TARGET +  '`]');
    }

    if (MESSAGE) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: MESSAGE,
        }
      });
      textParts.push(MESSAGE);
    }

    if (FIELDS) {
      const parsed = JSON.parse(FIELDS);
      Object.assign(fields, parsed);
    }

    Object.assign(fields, {
      Branch: BRANCH || fields.Branch || context.ref,
    });

    if (context.actor) Object.assign(fields, {
      Author: fields.Author || context.actor,
    });

    Object.assign(fields, {
      Environment: ENVIRONMENT || fields.Environment,
    });

    const elements = [
      ...Object.keys(fields).map(key => ({
        type: 'mrkdwn',
        text: `_${key}_\t\n*${fields[key]}*`
      })),
    ];

    blocks.push({
      type: 'context',
      elements,
    });

    if (fields.Branch) {
      textParts.push(`${fields.Branch}`);
    }
    if (fields.Environment) {
      textParts.push(`to *${fields.Environment}*`);
    }
    if (fields.Author) {
      textParts.push(`by *${fields.Author}*`);
    }
    const body = {
      text: textParts.join(' '),
      blocks,
    };

    if (SLACK_CHANNEL) Object.assign(body, {
      channel: SLACK_CHANNEL,
    });

    if (SLACK_BOT_NAME) Object.assign(body, {
      name: SLACK_BOT_NAME,
    });
    try {
      await axios.post(SLACK_WEBHOOK, body);
    } catch (err) {
      console.log(err);
    }
  }
}

run();
