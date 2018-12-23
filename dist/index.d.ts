import { CloudFormation } from 'aws-sdk';
export declare const AwsCloudFormationDeploy: ({ stackName, templateBody, enableTerminationProtection, params }: {
    stackName: string;
    templateBody: string;
    enableTerminationProtection?: boolean;
    policyBody?: string;
    params?: {
        [key: string]: string;
    };
}) => {
    start: ({ assumeYes }?: {
        assumeYes?: boolean;
    }) => Promise<void | {
        outputs: CloudFormation.Output[];
        succeed: boolean;
    }>;
};
