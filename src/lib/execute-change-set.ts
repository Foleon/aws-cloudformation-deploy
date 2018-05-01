import * as AWS from 'aws-sdk';

type ExecuteOptions = {
  stackName: AWS.CloudFormation.StackName, 
  changeSetId: AWS.CloudFormation.ChangeSetId,
  changeSetType: AWS.CloudFormation.ChangeSetType
};

export const executeChangeSet = ({
  stackName, 
  changeSetId,
  changeSetType
}: ExecuteOptions) => {
  const cfn = new AWS.CloudFormation();
  const waitForStatus = changeSetType === 'CREATE'
    ? 'stackCreateComplete'
    : 'stackUpdateComplete'

  return cfn.executeChangeSet({
    StackName: stackName,
    ChangeSetName: changeSetId
  })
  .promise()
  .then(_ => cfn.waitFor(waitForStatus as any, {
     StackName: stackName
    })
    .promise()
    .then(_ => _.Stacks[0])
    .then(_ => ({
      outputs: _.Outputs
    }))
  )
}