import * as AWS from 'aws-sdk';

type ExecuteOptions = {
  stackName: AWS.CloudFormation.StackName, 
  changeSetId: AWS.CloudFormation.ChangeSetId,
  changeSetType: AWS.CloudFormation.ChangeSetType
};

export const executeChangeSet = async ({
  stackName, 
  changeSetId,
  changeSetType
}: ExecuteOptions) => {
  const cfn = new AWS.CloudFormation();
  const waitForStatus = changeSetType === 'CREATE'
    ? 'stackCreateComplete'
    : 'stackUpdateComplete'

  await cfn.executeChangeSet({
    StackName: stackName,
    ChangeSetName: changeSetId
  })
  .promise()
  .then(_ => cfn.waitFor(waitForStatus as any, {
    StackName: stackName
  }).promise());
}