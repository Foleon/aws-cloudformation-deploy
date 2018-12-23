"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const AWS = require("aws-sdk");
const ora = require("ora");
const chalk_1 = require("chalk");
const lib_1 = require("./lib");
const uuid = (_) => _
    ? (_ ^ ((Math.random() * 16) >> (_ / 4))).toString(16)
    : ('' + 1e7 + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, uuid);
const oraPromise = (message, promise) => {
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
};
exports.AwsCloudFormationDeploy = ({ stackName, templateBody, enableTerminationProtection = true, params }) => {
    const setTerminationProtection = () => __awaiter(this, void 0, void 0, function* () {
        yield oraPromise(`${enableTerminationProtection ? 'Enable' : 'Disable'} Termination Protection...`, lib_1.updateTerminationProtection({
            stackName,
            enableTerminationProtection
        }));
    });
    const deployTemplate = (location, assumeYes = false) => __awaiter(this, void 0, void 0, function* () {
        const stack = (yield lib_1.getStack(stackName));
        const stackStatus = stack ? stack.StackStatus : 'UNAVAILABLE';
        let changeSetType;
        switch (stackStatus) {
            case 'CREATE_COMPLETE':
            case 'UPDATE_COMPLETE':
            case 'UPDATE_ROLLBACK_COMPLETE':
                changeSetType = 'UPDATE';
                break;
            case 'UNAVAILABLE':
                changeSetType = 'CREATE';
                break;
            default:
                throw new Error(`Cannot proceed with stack status '${stackStatus}'`);
        }
        const parsedParams = Object.keys(params || {}).reduce(((acc, key) => {
            acc.push({
                ParameterKey: key,
                ParameterValue: params[key]
            });
            return acc;
        }), []);
        const stackParams = {
            StackName: stackName,
            TemplateURL: location,
            Parameters: parsedParams,
            Capabilities: ['CAPABILITY_NAMED_IAM']
        };
        const changeSet = yield oraPromise('Creating CloudFormation Change Set...', lib_1.createChangeSet({
            type: changeSetType,
            name: stackName,
            params: stackParams
        }))
            .catch((_) => __awaiter(this, void 0, void 0, function* () {
            if (stack && stack.EnableTerminationProtection !== enableTerminationProtection) {
                yield setTerminationProtection();
            }
            throw _;
        }));
        const executeFn = () => __awaiter(this, void 0, void 0, function* () {
            return oraPromise('Deploying CloudFormation Template...', lib_1.executeChangeSet({
                stackName,
                changeSetId: changeSet.ChangeSetId,
                changeSetType
            }))
                .then((_) => __awaiter(this, void 0, void 0, function* () {
                if (changeSetType === 'CREATE') {
                    yield setTerminationProtection();
                }
                return {
                    outputs: _.outputs,
                    succeed: true
                };
            }));
        });
        if (changeSet.Changes.length > 0) {
            console.log(lib_1.createTableFromChangeSet(changeSet));
            if (assumeYes || (yield lib_1.promptChangesConfirmation())) {
                return executeFn();
            }
            else {
                const result = yield oraPromise('Deleting CloudFormation Change Set...', (() => {
                    if (changeSetType === 'CREATE') {
                        return lib_1.deleteStack({
                            stackName
                        });
                    }
                    else {
                        return lib_1.deleteChangeSet({
                            changeSetName: changeSet.ChangeSetId
                        });
                    }
                })()).then(_ => ({
                    succeed: false,
                    outputs: []
                }));
                console.log(chalk_1.default.yellow('Deployment of CloudFormation template canceled'));
                return result;
            }
        }
        else {
            return executeFn();
        }
    });
    const start = ({ assumeYes } = {}) => __awaiter(this, void 0, void 0, function* () {
        AWS.config.update(new AWS.Config());
        const s3 = new AWS.S3();
        const sts = new AWS.STS();
        const accountId = (yield sts.getCallerIdentity().promise()).Account;
        const bucketName = `aws-cloudformation-deploy-${accountId}-${AWS.config.region}`;
        const keyName = `${uuid().replace(/-/g, '')}-${stackName}`;
        yield s3.headBucket({
            Bucket: bucketName
        }).promise().catch(e => {
            if (e.statusCode === 404) {
                return s3.createBucket({
                    Bucket: bucketName
                }).promise();
            }
            throw e;
        });
        const template = yield s3.upload({
            Bucket: bucketName,
            Key: keyName,
            Body: templateBody,
        }).promise();
        const deployResult = yield deployTemplate(template.Location, assumeYes);
        return deployResult;
    });
    return {
        start
    };
};
