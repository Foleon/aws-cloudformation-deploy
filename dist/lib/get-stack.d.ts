import * as AWS from 'aws-sdk';
export declare const getStack: (stackName: AWS.CloudFormation.StackName) => Promise<AWS.CloudFormation.Stack>;
