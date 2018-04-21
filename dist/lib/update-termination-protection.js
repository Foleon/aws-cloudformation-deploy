"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AWS = require("aws-sdk");
exports.updateTerminationProtection = ({ stackName, enableTerminationProtection }) => {
    const cfn = new AWS.CloudFormation();
    return cfn.updateTerminationProtection({
        StackName: stackName,
        EnableTerminationProtection: enableTerminationProtection
    })
        .promise();
};
