"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AWS = require("aws-sdk");
exports.deleteStack = ({ stackName }) => {
    const cfn = new AWS.CloudFormation();
    return cfn.deleteStack({
        StackName: stackName
    })
        .promise()
        .then(_ => cfn.waitFor('stackDeleteComplete', {
        StackName: stackName
    })
        .promise()
        .then(_ => ({})));
};
