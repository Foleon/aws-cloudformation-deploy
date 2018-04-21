import * as AWS from 'aws-sdk';
import * as ora from 'ora';
import chalk from 'chalk';

import { 
  promptChangesConfirmation, 
  createChangeSet,
  deleteChangeSet,
  deleteStack,
  executeChangeSet,
  getStack,
  createTableFromChangeSet,
  updateTerminationProtection
} from './lib';
import { CloudFormation } from 'aws-sdk';

type DeployOptions = {
  stackName: AWS.CloudFormation.StackName,
  templateBody: AWS.CloudFormation.TemplateBody,
  enableTerminationProtection?: AWS.CloudFormation.EnableTerminationProtection,
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
  enableTerminationProtection = true, 
  policyBody, 
  params 
}: DeployOptions) => {
  const setTerminationProtection = async () => {
    await (oraPromise(
      `${enableTerminationProtection ? 'Enable' : 'Disable'} Termination Protection...`,
      updateTerminationProtection({
        stackName,
        enableTerminationProtection
      })
    ) as ReturnType<typeof updateTerminationProtection>);  
  }

  const start = async () => {
    const cfn = new AWS.CloudFormation();
    const stack = (await getStack(stackName));
    const stackStatus = stack ? stack.StackStatus : 'UNAVAILABLE';
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
    ) as ReturnType<typeof createChangeSet>)
    .catch(async _ => {
      // Update Termination Protection when needed
      if(stack && stack.EnableTerminationProtection !== enableTerminationProtection) {
        await setTerminationProtection();
      }

      throw _;
    });

    // Function to execute change set
    const executeFn = async () => {
      await oraPromise(
        'Deploying CloudFormation Template...',
        executeChangeSet({
          stackName,
          changeSetId: changeSet.ChangeSetId,
          changeSetType
        })
      ) as ReturnType<typeof executeChangeSet>
      
      // Set Termination Protection
      if(changeSetType === 'CREATE'){
        await setTerminationProtection();
      }
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