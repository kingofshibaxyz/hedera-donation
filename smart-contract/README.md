# Hedera Hackathon Contract

## Prerequisites

### Solidity Compiler Setup
```bash
pip install solc-select
solc-select install 0.8.18
solc-select use 0.8.18
solc --version
```

## Project Setup

1. Navigate to the smart contract directory:
```bash
cd packages/smart-contract
```

2. Install dependencies:
```bash
yarn install
```

## Deployment

### Flatten Contracts
```bash
./flattens.sh
```

### Deploy Contracts
Skip this step if you're using the existing contracts.

Deploy Hedera Token Management:
```bash
npx hardhat run scripts/deploy_hedera_token_manage.ts --network testnet
```

Deploy EZ Implementation:
```bash
npx hardhat run scripts/d_ez_implement.ts --network testnet
```

## Testing

Run tests:
```bash
npx hardhat test tests/DonationPlatform.test.ts
```

## Running Worker

Start the worker:
```bash
npx hardhat run worker/main.ts --network testnet
```


## Notes
- Ensure you have the necessary permissions to run shell scripts
- Make sure you have Hardhat and all required dependencies installed
- Verify network configurations in your Hardhat setup