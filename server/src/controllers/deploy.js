const User = require('../models/User');
const mongoose = require('mongoose');

const {
    CasperClient,
    DeployUtil,
} = require("casper-js-sdk");

let client;

try {
    client = new CasperClient(process.env.RPC);
} catch (error) {
    console.error('Error initializing CasperClient:', error);
    process.exit(1);
}

exports.deploy = async (req, res) => {
    let signedDeployJSON = req.body;
    try {
        const signedDeploy = DeployUtil.deployFromJson(signedDeployJSON).unwrap();
        let deploy_hash = await client.putDeploy(signedDeploy);
        res.status(200).send({deployHash: deploy_hash});
    } catch (error) {
        console.error(`Error while deploying from root: ${error}`);
        res.status(500).send({ error: error.message });
    }
};
