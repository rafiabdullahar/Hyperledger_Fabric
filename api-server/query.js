/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

async function main(queryData = {}) {

    let gateway;

    try {

        // Load the network configuration
        const ccpPath = path.resolve(
            __dirname,
            '..',
            '..',
            'test-network',
            'organizations',
            'peerOrganizations',
            'org1.example.com',
            'connection-org1.json'
        );

        const ccp = JSON.parse(
            fs.readFileSync(ccpPath, 'utf8')
        );

        // Create wallet
        const walletPath =
            path.join(process.cwd(), 'wallet');

        const wallet =
            await Wallets.newFileSystemWallet(walletPath);

        console.log(`Wallet path: ${walletPath}`);

        // Check application user
        const identity =
            await wallet.get('appUser');

        if (!identity) {
            throw new Error(
                'Identity "appUser" does not exist. Run registerUser.js first.'
            );
        }

        // Connect to gateway
        gateway = new Gateway();

        await gateway.connect(
            ccp,
            {
                wallet,
                identity: 'appUser',
                discovery: {
                    enabled: true,
                    asLocalhost: true
                }
            }
        );

        // Get channel
        const network =
            await gateway.getNetwork('mychannel');

        // Get contract
        const contract =
            network.getContract('fabcar');


        /*
         * SEARCH BY EMPLOYEE ID
         */
        if (queryData.key) {

            const result =
                await contract.evaluateTransaction(
                    'queryEmployee',
                    queryData.key
                );

            return result.toString();
        }


        /*
         * SEARCH BY DEPARTMENT
         */
        if (queryData.department && !queryData.status) {

            const result =
                await contract.evaluateTransaction(
                    'queryEmployeesByDepartment',
                    queryData.department
                );

            return result.toString();
        }


        /*
         * SEARCH BY STATUS
         */
        if (queryData.status && !queryData.department) {

            const result =
                await contract.evaluateTransaction(
                    'queryEmployeesByStatus',
                    queryData.status
                );

            return result.toString();
        }


        /*
         * SEARCH BY DEPARTMENT + STATUS
         */
        if (
            queryData.department &&
            queryData.status
        ) {

            const result =
                await contract.evaluateTransaction(
                    'queryEmployeesByDepartmentAndStatus',
                    queryData.department,
                    queryData.status
                );

            return result.toString();
        }


        /*
         * READ ALL EMPLOYEES
         */
        const result =
            await contract.evaluateTransaction(
                'queryAllEmployees'
            );

        return result.toString();

    } catch (error) {

        console.error(
            `Failed to evaluate transaction: ${error}`
        );

        throw error;

    } finally {

        if (gateway) {
            await gateway.disconnect();
        }
    }
}

module.exports = { main };