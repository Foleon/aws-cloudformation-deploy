import * as AWS from 'aws-sdk';
declare type DeleteOptons = {
    changeSetName: AWS.CloudFormation.ChangeSetName;
};
export declare const deleteChangeSet: ({ changeSetName }: DeleteOptons) => Promise<{}>;
export {};
