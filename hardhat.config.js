require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const { BSC_RPC_URL, PRIVATE_KEY, BSCSCAN_API_KEY, ETHERSCAN_API_KEY } = process.env;

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    bsc: {
      url: BSC_RPC_URL || "",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : []
    }
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY || BSCSCAN_API_KEY || ""
  }
};
