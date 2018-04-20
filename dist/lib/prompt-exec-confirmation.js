"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const readline = require("readline");
exports.promptExecConfirmation = () => new Promise((resolve, reject) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question('Are you sure you want to execute this change set? [y/n]:', answer => {
        if (answer.length === 0) {
            return exports.promptExecConfirmation();
        }
        resolve(/^y/i.test(answer));
        rl.close();
    });
});
