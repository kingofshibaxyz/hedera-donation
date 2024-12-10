# Function to compile and flatten a contract

# install solc firstly
# pip install solc-select
# solc-select install 0.8.18
# solc-select use 0.8.18
# solc --version

# https://verify.hashscan.io/#/verifier
compile_and_flatten() {
  local contract_name=$1
  local contract_path=$2
  local output_dir=$3

  mkdir -p $output_dir
  npx hardhat flatten $contract_path > $output_dir/${contract_name}_flatten.sol
  solc --bin --abi --metadata --overwrite --via-ir --optimize --optimize-runs 200 -o $output_dir $output_dir/${contract_name}_flatten.sol
}

# Flatten and compile ERC20Token contract
compile_and_flatten "ERC20Token" "./contracts/tokens/ERC20Token.sol" "./contract-flattens/tokens/ERC20Token"

# Flatten and compile DonationPlatform contract
compile_and_flatten "DonationPlatform" "./contracts/DonationPlatform.sol" "./contract-flattens/DonationPlatform"

# Flatten and compile HederaERC20TokenManage contract
compile_and_flatten "HederaERC20TokenManage" "./contracts/HederaERC20TokenManage.sol" "./contract-flattens/HederaERC20TokenManage"