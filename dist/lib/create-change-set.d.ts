import * as AWS from 'aws-sdk';
declare type CreateOptions = {
    type: AWS.CloudFormation.ChangeSetType;
    name: AWS.CloudFormation.ChangeSetName;
    params: {
        StackName: AWS.CloudFormation.StackName;
        TemplateURL: AWS.CloudFormation.TemplateURL;
        Parameters: AWS.CloudFormation.Parameters;
        Capabilities: AWS.CloudFormation.Capabilities;
    };
};
export declare const createChangeSet: ({ type, name, params }: CreateOptions) => Promise<import("aws-sdk/lib/request").PromiseResult<AWS.CloudFormation.DescribeChangeSetOutput, AWS.AWSError>>;
export {};
