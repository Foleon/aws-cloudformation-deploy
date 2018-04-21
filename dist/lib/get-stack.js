"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AWS = require("aws-sdk");
exports.getStack = (stackName) => (new AWS.CloudFormation().describeStacks({
    StackName: stackName
})
    .promise()
    .then(_ => _.Stacks[0])
    .catch(() => undefined));
