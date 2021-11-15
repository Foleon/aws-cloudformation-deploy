import * as AWS from 'aws-sdk';
declare type TerminationOptions = {
    stackName: AWS.CloudFormation.StackName;
    enableTerminationProtection: boolean;
};
export declare const updateTerminationProtection: ({ stackName, enableTerminationProtection }: TerminationOptions) => Promise<import("aws-sdk/lib/request").PromiseResult<AWS.CloudFormation.UpdateTerminationProtectionOutput, AWS.AWSError>>;
export {};
