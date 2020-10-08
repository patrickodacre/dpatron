// const web3 = require('web3')
const TokenFarm = artifacts.require('TokenFarm')

module.exports = async function(callback) {
    const tokenFarm = await TokenFarm.deployed()
    const res = await tokenFarm.issueTokens()

    console.log("Tokens issued!", res)
    callback()
}
