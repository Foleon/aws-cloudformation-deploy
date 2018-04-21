import * as AWS from 'aws-sdk';
export declare const getStack: (stackName: string) => Promise<AWS.CloudFormation.Stack>;
