import * as AWS from 'aws-sdk';

type DeleteOptions = { 
  stackName: AWS.CloudFormation.StackName 
};

export const deleteStack = ({ stackName }: DeleteOptions) => {
  const cfn = new AWS.CloudFormation();

  return cfn.deleteStack({
    StackName: stackName
  })
  .promise()
  .then(_ => cfn.waitFor('stackDeleteComplete', {
      StackName: stackName
    })
    .promise()
    .then(_ => ({}))
  );
};