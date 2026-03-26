const { ethers } = require("hardhat");

async function main() {
  const [defaultHolder] = await ethers.getSigners();
  const initialHolder = process.env.INITIAL_HOLDER || defaultHolder.address;
  const initialOwner = process.env.INITIAL_OWNER || initialHolder;

  const RACI = await ethers.getContractFactory("RACI");
  const token = await RACI.deploy(initialHolder, initialOwner);
  await token.waitForDeployment();

  console.log(`RACI deployed to: ${await token.getAddress()}`);
  console.log(`Initial holder: ${initialHolder}`);
  console.log(`Contract owner: ${initialOwner}`);
  console.log(`Max supply: ${await token.MAX_SUPPLY()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
