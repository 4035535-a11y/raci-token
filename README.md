# RACI Token

Minimal fixed-supply ERC-20 token built on OpenZeppelin.

## Token parameters

- Name: `RACI Token`
- Symbol: `RACI`
- Decimals: `18`
- Max supply at deployment: `100,000,000,000 RACI`
- Additional minting: `No`
- Burn: `Yes`, token holders can burn their own balance
- Permit: `Yes`, supports gasless approvals via ERC-2612 signatures

## Contract layout

- `contracts/RACI.sol`: main token contract
- `test/RACI.js`: Hardhat test suite
- `scripts/deploy.js`: local deployment script for Hardhat
- `assets/logo.png`: original project logo
- `assets/token-icon-512.png`: square token icon for wallets, token lists, and branding
- `tokenlists/raci.tokenlist.json`: token list template for wallets and DEX integrations
- `tests/RACI_test.sol`: legacy Remix test file
- `scripts/deploy_with_ethers.ts` and `scripts/deploy_with_web3.ts`: legacy Remix deployment scripts

## Branding assets

- Use `assets/logo.png` for docs, website, and marketing materials.
- Use `assets/token-icon-512.png` as the default token icon for wallets and token lists.
- If an exchange or wallet asks for a larger square icon, upscale or export from the original source rather than from the 512x512 file.
- `docs/` contains a ready-to-publish GitHub Pages site with the token icon and contract address.

## Token list

A starter token list is available at `tokenlists/raci.tokenlist.json`.

Before publishing it, replace:

- `address` with the deployed token contract address
- `chainId` with the target network ID if you are not using BNB Chain mainnet
- `logoURI` with a public HTTPS or IPFS URL for `assets/token-icon-512.png`
- `timestamp` and `version` when you publish updates

## GitHub Pages

The `docs/` folder is ready for GitHub Pages publishing.

After pushing this project to GitHub:

1. Open repository `Settings -> Pages`
2. Set `Build and deployment` source to `Deploy from a branch`
3. Select the main branch and `/docs` folder
4. Save and wait for the site to publish

Then your token icon URL will be:

`https://<github-username>.github.io/<repository-name>/assets/token-icon-512.png`

## Local setup

Install Node.js 18+ and then run:

```bash
npm install
npm test
```

Compile only:

```bash
npm run compile
```

Deploy to a local Hardhat network:

```bash
npm run deploy:local
```

To deploy with a custom recipient for the full supply:

```bash
INITIAL_HOLDER=0xYourAddressHere npm run deploy:local
```

To deploy with separate holder and contract owner:

```bash
INITIAL_HOLDER=0xTokenHolder INITIAL_OWNER=0xContractOwner npm run deploy:local
```

## BNB Chain deployment

The project is preconfigured for `BNB Chain Mainnet` with `chainId = 56`.

1. Copy `.env.example` to `.env`
2. Fill in `BSC_RPC_URL`
3. Fill in `PRIVATE_KEY` for the deployer wallet
4. Confirm `INITIAL_HOLDER=0x5D8b4DEeDE9cC751ac792B8B367deeff2fE1f7E1`
5. Set `INITIAL_OWNER` if contract ownership should stay on another wallet
6. Run:

```bash
npm install
npx hardhat run scripts/deploy.js --network bsc
```

Important:

- `INITIAL_HOLDER` is the wallet that receives all `100,000,000,000 RACI`
- `INITIAL_OWNER` is the wallet recorded as the contract owner
- this is not the token contract address
- after deployment, put the new contract address into `tokenlists/raci.tokenlist.json`
