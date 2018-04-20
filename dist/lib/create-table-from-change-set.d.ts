import * as AWS from 'aws-sdk';
export declare const createTableFromChangeSet: (changeSet: AWS.CloudFormation.DescribeChangeSetOutput) => string;
