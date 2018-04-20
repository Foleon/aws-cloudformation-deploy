import * as AWS from 'aws-sdk';
export declare const deleteStack: ({ stackName }: {
    stackName: string;
}) => Promise<AWS.CloudFormation.DescribeStacksOutput & {
    $response: AWS.Response<AWS.CloudFormation.DescribeStacksOutput, AWS.AWSError>;
}>;
