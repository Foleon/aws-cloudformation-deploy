import * as AWS from 'aws-sdk';
declare type ExecuteOptions = {
    stackName: AWS.CloudFormation.StackName;
    changeSetId: AWS.CloudFormation.ChangeSetId;
    changeSetType: AWS.CloudFormation.ChangeSetType;
};
export declare const executeChangeSet: ({ stackName, changeSetId, changeSetType }: ExecuteOptions) => Promise<{
    outputs: AWS.CloudFormation.Outputs;
}>;
export {};
