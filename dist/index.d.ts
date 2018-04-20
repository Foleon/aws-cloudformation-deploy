export declare const AwsCloudFormationDeploy: ({ stackName, templateBody, policyBody, params }: {
    stackName: string;
    templateBody: string;
    policyBody?: string;
    params?: {
        [key: string]: string;
    };
}) => {
    start: () => Promise<void>;
};
