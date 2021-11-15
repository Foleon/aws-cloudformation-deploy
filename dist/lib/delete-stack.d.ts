import * as AWS from 'aws-sdk';
declare type DeleteOptions = {
    stackName: AWS.CloudFormation.StackName;
};
export declare const deleteStack: ({ stackName }: DeleteOptions) => Promise<{}>;
export {};
