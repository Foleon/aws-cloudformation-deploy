import * as AWS from 'aws-sdk';
import * as ora from 'ora';
import chalk from 'chalk';

import { 
  promptChangesConfirmation, 
  createChangeSet,
  deleteChangeSet,
  deleteStack,
  executeChangeSet,
  getStackStatus,
  createTableFromChangeSet
} from './lib';
import { CloudFormation } from 'aws-sdk';

type DeployOptions = {
  stackName: AWS.CloudFormation.StackName,
  templateBody: AWS.CloudFormation.TemplateBody,
  policyBody?: AWS.CloudFormation.StackPolicyBody,
  params?: {[key: string]: string}
}

const oraPromise = (message:string, promise:Promise<any>) => {
  const indicator = ora(message);

  indicator.start();

  return promise
    .then(_ => {
      indicator.succeed();
      return _;
    })
    .catch(_ => {
      indicator.fail();
      throw _;
    });
}

export const AwsCloudFormationDeploy = ({ 
  stackName, 
  templateBody, 
  policyBody, 
  params 
}: DeployOptions) => {
  const start = async () => {
    const cfn = new AWS.CloudFormation();
    const stackStatus = await getStackStatus(stackName);
    let changeSetType: AWS.CloudFormation.ChangeSetType;

    switch(stackStatus){
      case 'CREATE_COMPLETE':
      case 'UPDATE_COMPLETE':
        changeSetType = 'UPDATE';
        break;
      case 'UNAVAILABLE':
        changeSetType = 'CREATE';
        break;
      default:
        throw new Error(`Cannot proceed with stack status '${stackStatus}'`);
    }

    const parsedParams = Object.keys(params || {}).reduce(
      ((acc:AWS.CloudFormation.Parameters, key:string) => {
        acc.push({
          ParameterKey: key,
          ParameterValue: params[key]
        });

        return acc;
      }), []);
    
    const stackParams = {
      StackName: stackName,
      TemplateBody: templateBody,
      Parameters: parsedParams,
      Capabilities: ['CAPABILITY_NAMED_IAM']
    };

    // Create Change Set
    const changeSet = await (oraPromise(
      'Creating CloudFormation Change Set...',
      createChangeSet({
        type: changeSetType,
        name: stackName,
        params: stackParams
      })
    ) as ReturnType<typeof createChangeSet>);

    // Function to execute change set
    const executeFn = () => {
      return oraPromise(
        'Deploying CloudFormation Template...',
        executeChangeSet({
          stackName,
          changeSetId: changeSet.ChangeSetId,
          changeSetType
        })
      ) as ReturnType<typeof executeChangeSet>
    };
    
    // Show table of changes and ask for confirmation of the change
    if(changeSet.Changes.length > 0){
      console.log(createTableFromChangeSet(changeSet));
      
      if(await promptChangesConfirmation()){
        await executeFn();
      } else {
        // Delete either the new to be create stack or the change 
        // set of a current stack.
        await oraPromise(
          'Deleting CloudFormation Change Set...',
          (() => {
            if(changeSetType === 'CREATE'){
              return deleteStack({
                stackName
              })
            } else {
              return deleteChangeSet({
                changeSetName: changeSet.ChangeSetId
              })
            }
          })()
        )

        console.log(
          chalk.yellow('Deployment of CloudFormation template canceled')
        )
      }
    } else {
      await executeFn();
    }
  }
  
  return {
    start
  }
}