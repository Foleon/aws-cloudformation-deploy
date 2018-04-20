"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const readline = require("readline");
exports.promptChangesConfirmation = () => (new Promise((resolve, reject) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question('Are you sure you want to execute this change set? [y/N]:', _ => {
        const answer = _.length === 0 ? 'n' : _;
        console.log();
        resolve(/^y/i.test(answer));
        rl.close();
    });
}));
