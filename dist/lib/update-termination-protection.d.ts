import * as AWS from 'aws-sdk';
export declare const updateTerminationProtection: ({ stackName, enableTerminationProtection }: {
    stackName: string;
    enableTerminationProtection: boolean;
}) => Promise<AWS.CloudFormation.UpdateTerminationProtectionOutput & {
    $response: AWS.Response<AWS.CloudFormation.UpdateTerminationProtectionOutput, AWS.AWSError>;
}>;
