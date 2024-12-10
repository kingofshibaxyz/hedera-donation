# Hedera hackathon contract

## Before all
 ```script
 cd packages/smart-contract
 ```
 
## To deploy (Skip it if you use our contracts)
```script
./flattens.sh
npx hardhat run ./scripts/d_ez_implement.ts --network testnet
```


## To run job
```script
yarn install
npx hardhat run ./worker/main.ts --network testnet
```


pip install solc-select
solc-select install 0.8.18
solc-select use 0.8.18
solc --version

./flattens.sh
npx hardhat test D:/hedera_hackathon/smart-contract/tests/DonationPlatform.test.ts
npx hardhat run D:/hedera_hackathon/smart-contract/scripts/deploy_hedera_token_manage.ts
npx hardhat run D:/hedera_hackathon/smart-contract/scripts/d_ez_implement.ts --network testnet
npx hardhat run D:/hedera_hackathon/smart-contract/scripts/worker.ts