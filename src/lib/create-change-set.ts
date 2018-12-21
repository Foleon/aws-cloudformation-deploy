import * as AWS from 'aws-sdk';

type CreateOptions = {
  type: AWS.CloudFormation.ChangeSetType,
  name: AWS.CloudFormation.ChangeSetName, 
  params:{
    StackName: AWS.CloudFormation.StackName,
    TemplateURL: AWS.CloudFormation.TemplateURL,
    Parameters: AWS.CloudFormation.Parameters,
    Capabilities: AWS.CloudFormation.Capabilities
  }
}

export const createChangeSet = ({
  type,
  name,
  params
}: CreateOptions) => {
  const cfn = new AWS.CloudFormation();
  return cfn.createChangeSet({
    ...params,
    ChangeSetType: type,
    ChangeSetName: `${name}ChangeSet${new Date().getTime()}`
  })
  .promise()
  .then(changeSetRequest => {
    return cfn.describeChangeSet({
      ChangeSetName: changeSetRequest.Id,
      StackName: params.StackName
    })
    .promise()
    .then(async _ => {
      if(_.Status === 'FAILED'){
        await cfn.deleteChangeSet({
          ChangeSetName: _.ChangeSetId
        }).promise();

        throw new Error(_.StatusReason);
      } else {
        return changeSetRequest;
      }
    });
  })
  .then(_ => cfn.waitFor('changeSetCreateComplete', {
    ChangeSetName: _.Id
  }).promise())
  .then(_ => cfn.describeChangeSet({
    ChangeSetName: _.ChangeSetId,
    StackName: params.StackName
  }).promise())
};