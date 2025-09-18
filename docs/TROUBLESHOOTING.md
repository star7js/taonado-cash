# Taonado Troubleshooting Guide

This guide provides solutions to common issues encountered when using the Taonado protocol, from basic setup problems to advanced debugging scenarios.

## Quick Diagnosis

### System Health Check
```bash
# Run comprehensive system check
npx ts-node -e "
  console.log('🔍 Taonado System Health Check');
  console.log('================================');

  // Check config
  try {
    const config = require('./config').config;
    console.log('✅ Config loaded');
    console.log('   Environment:', config.env);
    console.log('   Network ID:', config.netuid);
  } catch(e) {
    console.log('❌ Config error:', e.message);
  }

  // Check network connectivity
  const hre = require('hardhat');
  hre.ethers.provider.getBlockNumber()
    .then(n => console.log('✅ Network connected, block:', n))
    .catch(e => console.log('❌ Network error:', e.message));
"
```

### Common Issue Checklist
- [ ] `config.ts` exists and is properly configured
- [ ] Network connectivity is working
- [ ] Private keys are funded with TAO
- [ ] Contracts are compiled and deployed
- [ ] Dependencies are installed correctly

## Configuration Issues

### Problem: "Cannot find module './config'"

**Symptoms**:
```
Error: Cannot find module './config'
    at Function.Module._resolveFilename
```

**Solution**:
```bash
# Copy the example configuration
cp config-example.ts config.ts

# Edit with your actual values
vim config.ts

# Verify the file structure
cat config.ts | head -10
```

**Required config.ts structure**:
```typescript
const ethPrivateKey: string = "0x...";  // Your EVM private key
const subSeed: string = "//YourSeed";    // Your substrate seed
const env: string = "mainnet";           // Or "testnet", "local"
const netuid: BigNumberish = "0x71";     // SN113 for mainnet

export const config = {
  ethPrivateKey,
  env,
  netuid,
  subSeed,
  MERKLE_TREE_HEIGHT: 20,
};
```

### Problem: "Invalid private key format"

**Symptoms**:
```
Error: invalid private key
invalid hexlify value
```

**Solutions**:

#### For EVM Private Key
```bash
# Correct format (66 characters with 0x prefix)
ethPrivateKey: "0x1234567890abcdef..."

# Common mistakes:
# - Missing 0x prefix
# - Wrong length (should be 64 hex chars + 0x)
# - Using public key instead of private key

# Generate new key if needed
npx ts-node -e "
  const wallet = require('ethers').Wallet.createRandom();
  console.log('Private Key:', wallet.privateKey);
  console.log('Address:', wallet.address);
"
```

#### For Substrate Seed
```bash
# Correct format
subSeed: "//YourSeed"  # With // prefix

# Or mnemonic phrase
subSeed: "word1 word2 word3 ..." # 12-24 words

# Check if seed is valid
npx ts-node -e "
  const { Keyring } = require('@polkadot/keyring');
  const keyring = new Keyring({ type: 'sr25519' });
  try {
    const pair = keyring.addFromUri('//YourSeed');
    console.log('✅ Valid seed, address:', pair.address);
  } catch(e) {
    console.log('❌ Invalid seed:', e.message);
  }
"
```

### Problem: "Network configuration mismatch"

**Symptoms**:
```
Error: network mismatch
Error: invalid chain id
```

**Diagnosis**:
```bash
# Check current network configuration
npx ts-node -e "
  const hre = require('hardhat');
  const config = require('./config').config;

  console.log('Hardhat network:', hre.network.name);
  console.log('Config environment:', config.env);
  console.log('Config netuid:', config.netuid);

  hre.ethers.provider.getNetwork()
    .then(n => console.log('Actual chain ID:', n.chainId))
    .catch(e => console.log('Network error:', e.message));
"
```

**Solutions**:
```bash
# Ensure config.ts matches your intended network

# For mainnet:
env: "mainnet"
netuid: "0x71"  # Subnet 113

# For testnet:
env: "testnet"
netuid: "0x15B"  # Subnet 347

# For local:
env: "local"
netuid: "0x2"   # Local subnet 2
```

## Network Connectivity Issues

### Problem: "Connection timeout" / "ECONNREFUSED"

**Symptoms**:
```
Error: network timeout
Error: connect ECONNREFUSED
```

**Diagnosis**:
```bash
# Test each network endpoint
for endpoint in \
  "https://lite.chain.opentensor.ai" \
  "https://test.chain.opentensor.ai" \
  "http://127.0.0.1:9944"; do

  echo "Testing $endpoint..."
  curl -s --max-time 5 -X POST $endpoint \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' \
    && echo " ✅ OK" || echo " ❌ Failed"
done
```

**Solutions**:

#### Network Connectivity
```bash
# Check internet connection
ping -c 3 google.com

# Check DNS resolution
nslookup lite.chain.opentensor.ai

# Try alternative endpoints
# (Check Bittensor Discord for current endpoints)
```

#### Firewall/Proxy Issues
```bash
# Test with different network settings
export HTTP_PROXY=""
export HTTPS_PROXY=""

# Or configure proxy in hardhat.config.ts
networks: {
  mainnet: {
    url: "https://lite.chain.opentensor.ai",
    timeout: 60000,  // Increase timeout
    httpHeaders: {   // Add headers if needed
      "User-Agent": "Taonado/1.0"
    }
  }
}
```

#### Local Network Issues
```bash
# For local development, ensure local network is running
npx hardhat node  # In separate terminal

# Check if local network is accessible
curl http://127.0.0.1:9944
```

### Problem: "Gas estimation failed"

**Symptoms**:
```
Error: cannot estimate gas
Error: execution reverted
Error: insufficient funds for gas
```

**Diagnosis**:
```bash
# Check account balance
npx ts-node -e "
  const hre = require('hardhat');
  const config = require('./config').config;
  const wallet = new hre.ethers.Wallet(config.ethPrivateKey, hre.ethers.provider);

  wallet.provider.getBalance(wallet.address)
    .then(b => console.log('Balance:', hre.ethers.formatEther(b), 'TAO'))
    .catch(e => console.log('Error:', e.message));
"

# Check gas price
npx ts-node -e "
  const hre = require('hardhat');
  hre.ethers.provider.getFeeData()
    .then(f => console.log('Gas price:', f.gasPrice?.toString()))
    .catch(e => console.log('Error:', e.message));
"
```

**Solutions**:
```bash
# Ensure sufficient TAO balance (minimum 0.1 TAO recommended)
pnpm balance

# If balance is low, transfer more TAO:
python3 utils/local-transfer.py wallet_name evm_address amount

# Or send to SS58 mirror address from mobile wallet
npx ts-node utils/address-helper.ts  # Get mirror address
```

## Contract Interaction Issues

### Problem: "Contract not deployed" / "Contract call reverted"

**Symptoms**:
```
Error: call revert exception
Error: contract not deployed
TypeError: Cannot read properties of undefined
```

**Diagnosis**:
```bash
# Check if contracts are deployed
npx ts-node -e "
  const hre = require('hardhat');

  // Check common contract addresses
  const addresses = {
    WTAO: '0x9Dc08C6e2BF0F1eeD1E00670f80Df39145529F81',
    // Add other known addresses
  };

  for (const [name, addr] of Object.entries(addresses)) {
    hre.ethers.provider.getCode(addr)
      .then(code => {
        console.log(\`\${name} (\${addr}): \${code === '0x' ? '❌ Not deployed' : '✅ Deployed'}\`);
      })
      .catch(e => console.log(\`\${name}: Error checking deployment\`));
  }
"
```

**Solutions**:

#### Redeploy Contracts
```bash
# For local development
pnpm deploy-local

# For testnet
pnpm deploy-testnet

# Verify deployment
npx ts-node -e "
  console.log('Checking recent deployments...');
  // Check deployment logs or addresses
"
```

#### Update Contract Addresses
```bash
# If using outdated addresses, update in:
# - scripts/contracts.ts
# - Deployment configuration files
# - Test files
```

### Problem: "Transaction failed" / "Revert without reason"

**Symptoms**:
```
Error: transaction failed
Error: revert
Error: execution reverted without reason
```

**Advanced Debugging**:
```bash
# Enable detailed error reporting
npx ts-node -e "
  const hre = require('hardhat');

  // Example transaction with detailed error handling
  async function debugTransaction() {
    try {
      const tx = await contract.someMethod();
      await tx.wait();
    } catch (error) {
      console.log('Error details:', error);

      if (error.transaction) {
        console.log('Transaction hash:', error.transaction.hash);
      }

      if (error.reason) {
        console.log('Revert reason:', error.reason);
      }

      // Try to decode error
      if (error.data) {
        console.log('Error data:', error.data);
      }
    }
  }
"
```

## Mining and Association Issues

### Problem: "Association failed"

**Symptoms**:
```
Error: execution reverted: "Address already associated"
Error: invalid hotkey format
```

**Diagnosis**:
```bash
# Check current associations
npx ts-node -e "
  const config = require('./config').config;
  console.log('EVM Address:', new (require('ethers')).Wallet(config.ethPrivateKey).address);
  console.log('Substrate Seed:', config.subSeed);

  // Check if already associated
  // (Add contract call to check association status)
"
```

**Solutions**:

#### Address Already Associated
```bash
# If address is already associated with a different hotkey:
# 1. Use a different EVM address, OR
# 2. Withdraw funds and start fresh

# Generate new EVM key pair
npx ts-node -e "
  const wallet = require('ethers').Wallet.createRandom();
  console.log('New Private Key:', wallet.privateKey);
  console.log('New Address:', wallet.address);
  console.log('Update config.ts with new private key');
"
```

#### Invalid Hotkey Format
```bash
# Ensure hotkey is in correct SS58 format
npx ts-node -e "
  const { Keyring } = require('@polkadot/keyring');
  const keyring = new Keyring({ type: 'sr25519' });

  try {
    const pair = keyring.addFromUri('//YourSeed');
    console.log('✅ Valid hotkey:', pair.address);
  } catch(e) {
    console.log('❌ Invalid hotkey format');
    console.log('Use format: //YourSeed or mnemonic phrase');
  }
"
```

### Problem: "Mining not earning rewards"

**Symptoms**:
- Mining setup appears successful
- No emissions received
- Low mining rank

**Diagnosis**:
```bash
# Check mining status
npx ts-node utils/mining-status.ts

# Verify WTAO balance
pnpm balance

# Check subnet statistics
# (Use external tools or Taostats)
```

**Common Issues**:

#### Insufficient Deposit
```bash
# Check minimum competitive deposit amount
# Current subnet may require larger deposits to rank well

# Increase deposit
pnpm deposit  # Add more TAO to improve ranking
```

#### Network Competition
```bash
# Mining is competitive - only top 192 miners earn rewards
# Check current ranking and consider:
# 1. Increasing deposit size
# 2. Timing entry during lower competition
# 3. Running validator operations for bonus
```

## Privacy Mixer Issues

### Problem: "Secret note lost" / "Invalid withdrawal proof"

**Symptoms**:
```
Error: invalid proof
Error: nullifier already spent
Cannot generate withdrawal proof
```

**Important**: Privacy mixer funds cannot be recovered without the secret note.

**Prevention**:
```bash
# ALWAYS backup secret notes securely
# Example secure storage:
echo "YOUR_SECRET_NOTE" | gpg --encrypt --armor -r your@email.com > note-backup.asc

# Store in multiple locations:
# - Encrypted local file
# - Password manager
# - Hardware wallet (if supported)
# - Secure cloud storage
```

**Verification Before Large Deposits**:
```bash
# Test with small amounts first
pnpm cli-testnet  # Use testnet for testing

# Verify note storage and retrieval process
# Complete full deposit → withdrawal cycle on testnet
```

### Problem: "Proof generation failed"

**Symptoms**:
```
Error: witness generation failed
Error: circuit constraints not satisfied
Memory allocation error
```

**Solutions**:

#### Memory Issues
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=8192" pnpm cli

# For systems with limited RAM:
# Use smaller batch sizes
# Close other applications
# Consider using swap space
```

#### Circuit Issues
```bash
# Ensure circuits are properly compiled
pnpm download-keys  # Use pre-built circuits

# Or recompile if needed
pnpm build:circuit

# Verify circuit files exist
ls -la artifacts/circuits/
# Should contain:
# - withdraw.json
# - withdraw_proving_key.bin
# - withdraw_verification_key.json
```

## Build and Compilation Issues

### Problem: "Compilation failed" / "TypeScript errors"

**Symptoms**:
```
Error: Cannot find module '@typechain/ethers-v6'
Error: TS2304: Cannot find name 'BigNumberish'
Compilation error in contracts
```

**Solutions**:

#### Dependency Issues
```bash
# Clean install
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Rebuild typechain types
pnpm generate-types

# Full clean build
pnpm build:contract:compile
```

#### TypeScript Configuration
```bash
# Ensure TypeScript is properly configured
npx tsc --noEmit  # Check for TS errors

# Update typechain types if contracts changed
rm -rf typechain-types/
pnpm generate-types
```

### Problem: "Circuit compilation failed"

**Symptoms**:
```
Error: circom: command not found
Error: circuit compilation failed
Error: constraint generation failed
```

**Solutions**:

#### Install Circom
```bash
# Install circom globally
npm install -g circom

# Verify installation
circom --version

# If installation fails, try building from source:
git clone https://github.com/iden3/circom.git
cd circom
cargo build --release
cargo install --path .
```

#### Use Pre-built Circuits
```bash
# Skip compilation, use trusted circuits
pnpm download-keys

# This is recommended for most users
# Compilation is only needed for circuit development
```

## Performance Issues

### Problem: "Slow transaction processing"

**Symptoms**:
- Long confirmation times
- High gas costs
- Timeouts

**Solutions**:

#### Gas Optimization
```bash
# Check current gas prices
npx ts-node -e "
  const hre = require('hardhat');
  hre.ethers.provider.getFeeData()
    .then(f => {
      console.log('Gas price:', f.gasPrice?.toString());
      console.log('Priority fee:', f.maxPriorityFeePerGas?.toString());
    });
"

# Adjust gas settings in hardhat.config.ts if needed
networks: {
  mainnet: {
    gasPrice: 20000000000,  // 20 gwei
    gasMultiplier: 1.2,     // 20% buffer
  }
}
```

#### Network Congestion
```bash
# Monitor network status
# Check block times and transaction volumes
# Consider using different networks during high congestion
```

### Problem: "Memory usage too high"

**Symptoms**:
```
JavaScript heap out of memory
FATAL ERROR: Reached heap limit
```

**Solutions**:
```bash
# Increase Node.js memory
export NODE_OPTIONS="--max-old-space-size=8192"

# Use more efficient operations
# Batch transactions where possible
# Minimize concurrent operations
```

## Emergency Procedures

### Fund Recovery (WTAO Mining Only)

If you lose access to your EVM private key but still have your substrate seed:

```bash
# Hotkey ownership proof (if supported in future updates)
# Contact support with:
# 1. Substrate signature proving hotkey ownership
# 2. Original association transaction hash
# 3. Deposit amounts and timestamps

# Note: This is not currently automated
# Keep your private keys secure!
```

### System Recovery

For complete system issues:

```bash
# Fresh installation
git clone https://github.com/taonado/taonado-cash
cd taonado-cash
pnpm install

# Restore configuration
cp /backup/config.ts ./config.ts

# Verify system
pnpm build:substrate
pnpm test

# Check balances
pnpm balance
```

## Getting Help

### Information Gathering

Before seeking help, gather this information:

```bash
# System information
echo "OS: $(uname -a)"
echo "Node: $(node --version)"
echo "PNPM: $(pnpm --version)"

# Taonado information
git rev-parse HEAD  # Git commit hash
cat config.ts | grep -E "(env|netuid)" | head -2

# Error details
# Include full error messages and stack traces
# Specify exact steps to reproduce
```

### Support Channels

1. **GitHub Issues**: Technical bugs and feature requests
2. **Discord**: Community support and discussions
3. **Documentation**: Check all docs/ files first
4. **Code Review**: For complex issues, provide minimal reproduction case

### Security Issues

For security vulnerabilities:
- **Email**: taonado@proton.me
- **Include**: Detailed description, reproduction steps
- **Do not**: Publicly disclose until coordinated

This troubleshooting guide covers the most common issues encountered with Taonado. Keep this reference handy and always start with the quick diagnosis section for efficient problem resolution.