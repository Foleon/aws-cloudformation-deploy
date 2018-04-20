import * as AWS from 'aws-sdk';
export declare const createChangeSet: ({ type, name, params }: {
    type: string;
    name: string;
    params: {
        StackName: string;
        TemplateBody: string;
        Parameters: AWS.CloudFormation.Parameter[];
        Capabilities: string[];
    };
}) => Promise<AWS.CloudFormation.DescribeChangeSetOutput & {
    $response: AWS.Response<AWS.CloudFormation.DescribeChangeSetOutput, AWS.AWSError>;
}>;
