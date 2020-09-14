"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const issuebot_1 = require("../issuebot");
const discord_harmony_1 = require("discord-harmony");
const config_1 = require("../config");
class IssueCommand extends discord_harmony_1.Command {
    execute() {
        if (!this.args) {
            return;
        }
        if (!this.isAuthenticated()) {
            this.message.reply(AUTH_TEMPLATE);
            return;
        }
        if (!isNaN(this.args[2])) {
            this.message.channel.fetchMessage(this.args[2])
                .then(message => {
                this.doIt(message.author.username, this.args[1], this.args[0], message.content, this.message.channel.name);
            })
                .catch(error => {
                this.message.reply(FETCH_ERROR_TEMPLATE.replace("{PLACEHOLDER}", error.toString()));
            });
        }
        else {
            this.doIt(this.message.author.username, this.args[1], this.args[0], this.args[2], this.message.channel.name);
        }
    }
    doIt(author, title, repo, description, channel) {
        let issueBody = ISSUE_TEMPLATE
            .replace("{PLACEHOLDER}", description || "_No content_")
            .replace("{CHANNEL}", channel)
            .replace("{USER}", author);
        issuebot_1.default.gitHub.api.issues.create({
            owner: config_1.config.githubName,
            repo: repo,
            title: title,
            body: issueBody
        }, (error, response) => this.handleGithubResponse(error, response));
    }
    handleGithubResponse(error, response) {
        if (error) {
            let formattedError = JSON.stringify(error, null, 4);
            let reply = ERROR_TEMPLATE.replace('{PLACEHOLDER}', formattedError);
            this.message.reply(reply);
            return;
        }
        let reply = SUCCESS_TEMPLATE.replace('{PLACEHOLDER}', response.html_url);
        this.message.reply(reply);
    }
    isAuthenticated() {
        return this.message.member.roles.find(r => r.name === "Sunkern User");
    }
}
exports.IssueCommand = IssueCommand;
const ISSUE_TEMPLATE = `
{PLACEHOLDER}

---
Beep, boop, I'm [a bot](https://github.com/Parakoopa/IssueBot)! This issue was created by \`@{USER}\` in \`#{CHANNEL}\`.
`;
const ERROR_TEMPLATE = `
Command should be: !issue {Repository} {Title} {Message / Message ID}
Example: !issue "GameServer" "Make a beginner bot AI script" "Make a game script to control a bot champion. Buy items, go to lane, try to beat Nexus."
An error occurred while creating the issue.
Details:
\`\`\`
{PLACEHOLDER}
\`\`\`
`;
const FETCH_ERROR_TEMPLATE = `
Could not find the message with this ID.
Details:
\`\`\`
{PLACEHOLDER}
\`\`\`
`;
const AUTH_TEMPLATE = `
You are not authenticated to use this Bot. You need the role "Sunkern User".
`;
const SUCCESS_TEMPLATE = `
Issue created successfully! {PLACEHOLDER}
`;
