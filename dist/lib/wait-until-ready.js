"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AWS = require("aws-sdk");
exports.waitUntilReady = ({ stackName }) => {
    return new AWS.CloudFormation().describeStacks({
        StackName: stackName
    })
        .promise()
        .then(_ => {
        console.log(_);
        return _;
    })
        .then(_ => {
        if (['CREATE_COMPLETE', 'UPDATE_COMPLETE'].includes(_.Stacks[0].StackStatus)) {
            return {
                forType: 'UPDATE'
            };
        }
        else if (_.Stacks[0].StackStatus === 'REVIEW_IN_PROGRESS') {
            return {
                forType: undefined
            };
        }
    })
        .catch(_ => {
        return {
            forType: 'CREATE'
        };
    })
        .then(_ => {
        return !_.forType ? exports.waitUntilReady({ stackName }) : Promise.resolve(_);
    });
};
