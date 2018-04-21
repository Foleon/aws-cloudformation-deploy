import * as AWS from 'aws-sdk';

export const getStack = (stackName:AWS.CloudFormation.StackName) => (
  new AWS.CloudFormation().describeStacks({
    StackName: stackName
  })
  .promise()
  .then(_ => _.Stacks[0])
  .catch(() => undefined as AWS.CloudFormation.Stack)
);