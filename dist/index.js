"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AwsCloudFormationDeploy = void 0;
const AWS = __importStar(require("aws-sdk"));
const ora_1 = __importDefault(require("ora"));
const chalk_1 = __importDefault(require("chalk"));
const lib_1 = require("./lib");
const uuid = (_) => _
    ? (_ ^ ((Math.random() * 16) >> (_ / 4))).toString(16)
    : ("" + 1e7 + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, uuid);
const oraPromise = (message, promise) => {
    const indicator = (0, ora_1.default)(message);
    indicator.start();
    return promise
        .then((_) => {
        indicator.succeed();
        return _;
    })
        .catch((_) => {
        indicator.fail();
        throw _;
    });
};
const AwsCloudFormationDeploy = ({ stackName, templateBody, enableTerminationProtection = true, params, }) => {
    const setTerminationProtection = () => __awaiter(void 0, void 0, void 0, function* () {
        yield oraPromise(`${enableTerminationProtection ? "Enable" : "Disable"} Termination Protection...`, (0, lib_1.updateTerminationProtection)({
            stackName,
            enableTerminationProtection,
        }));
    });
    const deployTemplate = (location, assumeYes = false) => __awaiter(void 0, void 0, void 0, function* () {
        const stack = yield (0, lib_1.getStack)(stackName);
        const stackStatus = stack ? stack.StackStatus : "UNAVAILABLE";
        let changeSetType;
        switch (stackStatus) {
            case "CREATE_COMPLETE":
            case "UPDATE_COMPLETE":
            case "UPDATE_ROLLBACK_COMPLETE":
                changeSetType = "UPDATE";
                break;
            case "UNAVAILABLE":
                changeSetType = "CREATE";
                break;
            default:
                throw new Error(`Cannot proceed with stack status '${stackStatus}'`);
        }
        const parsedParams = Object.keys(params || {}).reduce((acc, key) => {
            acc.push({
                ParameterKey: key,
                ParameterValue: params[key],
            });
            return acc;
        }, []);
        const stackParams = {
            StackName: stackName,
            TemplateURL: location,
            Parameters: parsedParams,
            Capabilities: ["CAPABILITY_NAMED_IAM"],
        };
        const changeSet = yield oraPromise("Creating CloudFormation Change Set...", (0, lib_1.createChangeSet)({
            type: changeSetType,
            name: stackName,
            params: stackParams,
        })).catch((_) => __awaiter(void 0, void 0, void 0, function* () {
            if (stack &&
                stack.EnableTerminationProtection !== enableTerminationProtection) {
                yield setTerminationProtection();
            }
            throw _;
        }));
        const executeFn = () => __awaiter(void 0, void 0, void 0, function* () {
            return oraPromise("Deploying CloudFormation Template...", (0, lib_1.executeChangeSet)({
                stackName,
                changeSetId: changeSet.ChangeSetId,
                changeSetType,
            })).then((_) => __awaiter(void 0, void 0, void 0, function* () {
                if (changeSetType === "CREATE") {
                    yield setTerminationProtection();
                }
                return {
                    outputs: _.outputs,
                    succeed: true,
                };
            }));
        });
        if (changeSet.Changes.length > 0) {
            console.log((0, lib_1.createTableFromChangeSet)(changeSet));
            if (assumeYes || (yield (0, lib_1.promptChangesConfirmation)())) {
                return executeFn();
            }
            else {
                const result = yield oraPromise("Deleting CloudFormation Change Set...", (() => {
                    if (changeSetType === "CREATE") {
                        return (0, lib_1.deleteStack)({
                            stackName,
                        });
                    }
                    else {
                        return (0, lib_1.deleteChangeSet)({
                            changeSetName: changeSet.ChangeSetId,
                        });
                    }
                })()).then((_) => ({
                    succeed: false,
                    outputs: [],
                }));
                console.log(chalk_1.default.yellow("Deployment of CloudFormation template canceled"));
                return result;
            }
        }
        else {
            return executeFn();
        }
    });
    const start = ({ assumeYes } = {}) => __awaiter(void 0, void 0, void 0, function* () {
        AWS.config.update(new AWS.Config());
        const s3 = new AWS.S3();
        const sts = new AWS.STS();
        const accountId = (yield sts.getCallerIdentity().promise()).Account;
        const bucketName = `aws-cloudformation-deploy-${accountId}-${AWS.config.region}`;
        const keyName = `${uuid().replace(/-/g, "")}-${stackName}`;
        yield s3
            .headBucket({
            Bucket: bucketName,
        })
            .promise()
            .catch((e) => {
            if (e.statusCode === 404) {
                return s3
                    .createBucket({
                    Bucket: bucketName,
                })
                    .promise();
            }
            throw e;
        });
        const template = yield s3
            .upload({
            Bucket: bucketName,
            Key: keyName,
            Body: templateBody,
        })
            .promise();
        const deployResult = yield deployTemplate(template.Location, assumeYes);
        return deployResult;
    });
    return {
        start,
    };
};
exports.AwsCloudFormationDeploy = AwsCloudFormationDeploy;
