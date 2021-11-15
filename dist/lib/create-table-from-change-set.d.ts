import * as AWS from 'aws-sdk';
declare type DescribeChangeSetOutput = AWS.CloudFormation.DescribeChangeSetOutput;
export declare const createTableFromChangeSet: (changeSet: DescribeChangeSetOutput) => string;
export {};
