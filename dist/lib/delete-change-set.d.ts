import * as AWS from 'aws-sdk';
export declare const deleteChangeSet: ({ changeSetName }: {
    changeSetName: string;
}) => Promise<AWS.CloudFormation.DeleteChangeSetOutput & {
    $response: AWS.Response<AWS.CloudFormation.DeleteChangeSetOutput, AWS.AWSError>;
}>;
