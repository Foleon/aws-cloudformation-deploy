import { CloudFormation } from 'aws-sdk';
export declare const AwsCloudFormationDeploy: ({ stackName, templateBody, enableTerminationProtection, policyBody, params }: {
    stackName: string;
    templateBody: string;
    enableTerminationProtection?: boolean;
    policyBody?: string;
    params?: {
        [key: string]: string;
    };
}) => {
    start: () => Promise<{
        outputs: CloudFormation.Output[];
        succeed: boolean;
    }>;
};
