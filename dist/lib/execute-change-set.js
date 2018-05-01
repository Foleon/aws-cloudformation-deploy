"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AWS = require("aws-sdk");
exports.executeChangeSet = ({ stackName, changeSetId, changeSetType }) => {
    const cfn = new AWS.CloudFormation();
    const waitForStatus = changeSetType === 'CREATE'
        ? 'stackCreateComplete'
        : 'stackUpdateComplete';
    return cfn.executeChangeSet({
        StackName: stackName,
        ChangeSetName: changeSetId
    })
        .promise()
        .then(_ => cfn.waitFor(waitForStatus, {
        StackName: stackName
    })
        .promise()
        .then(_ => _.Stacks[0])
        .then(_ => ({
        outputs: _.Outputs
    })));
};
