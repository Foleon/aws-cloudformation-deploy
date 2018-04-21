import * as AWS from 'aws-sdk';

type TerminationOptions = { 
  stackName: AWS.CloudFormation.StackName,
  enableTerminationProtection: boolean
};

export const updateTerminationProtection = ({
  stackName,
  enableTerminationProtection
}: TerminationOptions) => {
  const cfn = new AWS.CloudFormation();

  return cfn.updateTerminationProtection({
    StackName: stackName,
    EnableTerminationProtection: enableTerminationProtection
  })
  .promise();
};