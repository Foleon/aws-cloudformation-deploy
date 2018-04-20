"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AWS = require("aws-sdk");
exports.checkStackAlreadyExists = (stackName) => {
    return new AWS.CloudFormation().describeStacks({
        StackName: stackName
    })
        .promise()
        .then(_ => true)
        .catch(_ => false);
};
