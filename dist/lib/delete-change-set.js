"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AWS = require("aws-sdk");
exports.deleteChangeSet = ({ changeSetName }) => {
    const cfn = new AWS.CloudFormation();
    return cfn.deleteChangeSet({
        ChangeSetName: changeSetName
    })
        .promise();
};
