/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class FabCar extends Contract {

    // Initialize ledger with sample employee identities
    async initLedger(ctx) {

        console.info(
            '============= START : Initialize Employee Ledger ==========='
        );

        const employees = [
            {
                employee_id: 'EMP001',
                employee_name: 'Abdullah',
                department: 'IT',
                role: 'Developer',
                clearance_status: 'Active',
                docType: 'employee'
            },
            {
                employee_id: 'EMP002',
                employee_name: 'Rahim',
                department: 'HR',
                role: 'Manager',
                clearance_status: 'Active',
                docType: 'employee'
            },
            {
                employee_id: 'EMP003',
                employee_name: 'Karim',
                department: 'Finance',
                role: 'Accountant',
                clearance_status: 'Active',
                docType: 'employee'
            },
            {
                employee_id: 'EMP004',
                employee_name: 'Nusrat',
                department: 'IT',
                role: 'System Admin',
                clearance_status: 'Suspended',
                docType: 'employee'
            },
            {
                employee_id: 'EMP005',
                employee_name: 'Sadia',
                department: 'HR',
                role: 'HR Executive',
                clearance_status: 'Revoked',
                docType: 'employee'
            }
        ];

        for (const employee of employees) {

            const employeeId = employee.employee_id;

            await ctx.stub.putState(
                employeeId,
                Buffer.from(JSON.stringify(employee))
            );

            console.info('Added employee:', employee);
        }

        console.info(
            '============= END : Initialize Employee Ledger ==========='
        );
    }


    // CREATE EMPLOYEE
    async createEmployee(
        ctx,
        employeeId,
        employeeName,
        department,
        role,
        clearanceStatus
    ) {

        console.info(
            '============= START : Create Employee ==========='
        );

        if (
            !employeeId ||
            !employeeName ||
            !department ||
            !role ||
            !clearanceStatus
        ) {
            throw new Error('All employee fields are required');
        }

        const validStatuses = [
            'Active',
            'Suspended',
            'Revoked'
        ];

        if (!validStatuses.includes(clearanceStatus)) {

            throw new Error(
                'Invalid clearance status. Use Active, Suspended, or Revoked'
            );
        }

        const existingEmployee =
            await ctx.stub.getState(employeeId);

        if (
            existingEmployee &&
            existingEmployee.length > 0
        ) {

            throw new Error(
                `Employee ${employeeId} already exists`
            );
        }

        const employee = {

            employee_id: employeeId,

            employee_name: employeeName,

            department: department,

            role: role,

            clearance_status: clearanceStatus,

            docType: 'employee'
        };

        await ctx.stub.putState(
            employeeId,
            Buffer.from(JSON.stringify(employee))
        );

        console.info(
            'Created employee:',
            employee
        );

        console.info(
            '============= END : Create Employee ==========='
        );

        return JSON.stringify(employee);
    }


    // READ ONE EMPLOYEE
    async queryEmployee(ctx, employeeId) {

        const employeeAsBytes =
            await ctx.stub.getState(employeeId);

        if (
            !employeeAsBytes ||
            employeeAsBytes.length === 0
        ) {

            throw new Error(
                `Employee ${employeeId} does not exist`
            );
        }

        return employeeAsBytes.toString();
    }


    // READ ALL EMPLOYEES
    async queryAllEmployees(ctx) {

        const startKey = '';
        const endKey = '';

        const allResults = [];

        for await (
            const { key, value }
            of ctx.stub.getStateByRange(
                startKey,
                endKey
            )
        ) {

            const strValue =
                Buffer.from(value).toString('utf8');

            let record;

            try {

                record = JSON.parse(strValue);

            } catch (err) {

                console.log(err);

                record = strValue;
            }

            if (
                record &&
                record.docType === 'employee'
            ) {

                allResults.push({
                    Key: key,
                    Record: record
                });
            }
        }

        return JSON.stringify(allResults);
    }


    // UPDATE CLEARANCE STATUS
    async updateClearanceStatus(
        ctx,
        employeeId,
        newStatus
    ) {

        console.info(
            '============= START : Update Clearance Status ==========='
        );

        const employeeAsBytes =
            await ctx.stub.getState(employeeId);

        if (
            !employeeAsBytes ||
            employeeAsBytes.length === 0
        ) {

            throw new Error(
                `Employee ${employeeId} does not exist`
            );
        }

        const employee =
            JSON.parse(
                employeeAsBytes.toString()
            );

        const validStatuses = [
            'Active',
            'Suspended',
            'Revoked'
        ];

        if (!validStatuses.includes(newStatus)) {

            throw new Error(
                'Invalid clearance status. Use Active, Suspended, or Revoked'
            );
        }

        employee.clearance_status = newStatus;

        await ctx.stub.putState(
            employeeId,
            Buffer.from(
                JSON.stringify(employee)
            )
        );

        console.info(
            `Employee ${employeeId} status changed to ${newStatus}`
        );

        console.info(
            '============= END : Update Clearance Status ==========='
        );

        return JSON.stringify(employee);
    }


    // SEARCH BY DEPARTMENT
    async queryEmployeesByDepartment(
        ctx,
        department
    ) {

        const queryString = {

            selector: {

                docType: 'employee',

                department: department

            }

        };

        return await this._queryEmployees(
            ctx,
            queryString
        );
    }


    // SEARCH BY CLEARANCE STATUS
    async queryEmployeesByStatus(
        ctx,
        clearanceStatus
    ) {

        const queryString = {

            selector: {

                docType: 'employee',

                clearance_status: clearanceStatus

            }

        };

        return await this._queryEmployees(
            ctx,
            queryString
        );
    }


    // SEARCH BY DEPARTMENT AND STATUS
    async queryEmployeesByDepartmentAndStatus(
        ctx,
        department,
        clearanceStatus
    ) {

        const queryString = {

            selector: {

                docType: 'employee',

                department: department,

                clearance_status: clearanceStatus

            }

        };

        return await this._queryEmployees(
            ctx,
            queryString
        );
    }


    // INTERNAL COUCHDB QUERY HELPER
    async _queryEmployees(
        ctx,
        queryString
    ) {

        const iterator =
            await ctx.stub.getQueryResult(
                JSON.stringify(queryString)
            );

        const allResults = [];

        try {

            while (true) {

                const result =
                    await iterator.next();

                if (
                    result.value &&
                    result.value.value
                ) {

                    const strValue =
                        Buffer.from(
                            result.value.value
                        ).toString('utf8');

                    let record;

                    try {

                        record =
                            JSON.parse(strValue);

                    } catch (err) {

                        console.log(err);

                        record = strValue;
                    }

                    allResults.push({
                        Key: result.value.key,
                        Record: record
                    });
                }

                if (result.done) {
                    break;
                }
            }

        } finally {

            await iterator.close();

        }

        return JSON.stringify(allResults);
    }
}

module.exports = FabCar;