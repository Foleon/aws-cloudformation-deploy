import * as AWS from 'aws-sdk';

type DeleteOptons = {
  changeSetName: AWS.CloudFormation.ChangeSetName
};

export const deleteChangeSet = ({ changeSetName }: DeleteOptons ) => {
  const cfn = new AWS.CloudFormation();
  return cfn.deleteChangeSet({
    ChangeSetName: changeSetName
  })
  .promise()
  .then(_ => ({}));
};