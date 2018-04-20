"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Table = require('tty-table');
exports.createTableFromChangeSet = (changeSet) => {
    const header = [
        { value: 'Type' },
        { value: 'ResourceType' },
        { value: 'LogicalResourceId' },
        { value: 'Action' },
        { value: 'Replacement' }
    ];
    const rows = changeSet.Changes.reduce((acc, change) => {
        acc.push([
            change.Type,
            change.ResourceChange.ResourceType,
            change.ResourceChange.LogicalResourceId,
            change.ResourceChange.Action,
            change.ResourceChange.Replacement || 'False',
        ]);
        return acc;
    }, []);
    return Table(header, rows).render();
};
