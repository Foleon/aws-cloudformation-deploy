import * as AWS from 'aws-sdk';
export declare const executeChangeSet: ({ stackName, changeSetId, changeSetType }: {
    stackName: string;
    changeSetId: string;
    changeSetType: string;
}) => Promise<{
    outputs: AWS.CloudFormation.Output[];
}>;
