/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

async function main(params) {

    let gateway;

    try {

        // Load network configuration
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

        // Get network
        const network =
            await gateway.getNetwork('mychannel');

        // Get contract
        const contract =
            network.getContract('fabcar');


        const employeeId =
            params.employeeId;

        const newStatus =
            params.clearanceStatus;


        // Submit status update
        await contract.submitTransaction(
            'updateClearanceStatus',
            employeeId,
            newStatus
        );

        console.log(
            'Clearance status update transaction submitted'
        );

        return true;

    } catch (error) {

        console.error(
            `Failed to update clearance status: ${error}`
        );

        throw error;

    } finally {

        if (gateway) {
            await gateway.disconnect();
        }
    }
}

module.exports = { main };