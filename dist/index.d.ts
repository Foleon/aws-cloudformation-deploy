import * as AWS from "aws-sdk";
import { CloudFormation } from "aws-sdk";
declare type DeployOptions = {
    stackName: AWS.CloudFormation.StackName;
    templateBody: AWS.CloudFormation.TemplateBody;
    enableTerminationProtection?: AWS.CloudFormation.EnableTerminationProtection;
    policyBody?: AWS.CloudFormation.StackPolicyBody;
    params?: {
        [key: string]: string;
    };
};
export declare const AwsCloudFormationDeploy: ({ stackName, templateBody, enableTerminationProtection, params, }: DeployOptions) => {
    start: ({ assumeYes }?: {
        assumeYes?: boolean;
    }) => Promise<{
        outputs: CloudFormation.Outputs;
        succeed: boolean;
    }>;
};
export {};
