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
exports.createChangeSet = ({ type, name, params }) => {
    const cfn = new AWS.CloudFormation();
    return cfn.createChangeSet(Object.assign({}, params, { ChangeSetType: type, ChangeSetName: `${name}ChangeSet${new Date().getTime()}` }))
        .promise()
        .then(changeSetRequest => {
        return cfn.describeChangeSet({
            ChangeSetName: changeSetRequest.Id,
            StackName: params.StackName
        })
            .promise()
            .then((_) => __awaiter(this, void 0, void 0, function* () {
            if (_.Status === 'FAILED') {
                yield cfn.deleteChangeSet({
                    ChangeSetName: _.ChangeSetId
                }).promise();
                throw new Error(_.StatusReason);
            }
            else {
                return changeSetRequest;
            }
        }));
    })
        .then(_ => cfn.waitFor('changeSetCreateComplete', {
        ChangeSetName: _.Id
    }).promise())
        .then(_ => cfn.describeChangeSet({
        ChangeSetName: _.ChangeSetId,
        StackName: params.StackName
    }).promise());
};
