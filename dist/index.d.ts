export declare const AwsCloudFormationDeploy: ({ stackName, templateBody, enableTerminationProtection, policyBody, params }: {
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
    }) => Promise<void>;
};
