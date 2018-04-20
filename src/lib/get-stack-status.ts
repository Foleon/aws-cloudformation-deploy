import * as AWS from 'aws-sdk';

export const getStackStatus = (stackName:AWS.CloudFormation.StackName) => (
  new AWS.CloudFormation().describeStacks({
    StackName: stackName
  })
  .promise()
  .then(_ => _.Stacks[0].StackStatus)
  .catch(() => 'UNAVAILABLE')
);