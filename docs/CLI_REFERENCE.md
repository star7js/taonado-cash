# Taonado CLI Command Reference

This document provides comprehensive examples and usage instructions for all Taonado CLI commands and scripts.

## Interactive CLI (`pnpm cli`)

The main CLI provides an interactive menu system for both WTAO operations and privacy mixer functionality.

### Basic Usage
```bash
# Launch interactive CLI
pnpm cli                    # Mainnet
pnpm cli-testnet           # Testnet
pnpm cli-local             # Local development
```

### CLI Menu Structure
```
🌪️ Taonado CLI
├── 💰 WTAO Operations
│   ├── 👁️ View Balances
│   ├── 📥 Wrap TAO (TAO → WTAO)
│   └── 📤 Unwrap TAO (WTAO → TAO)
└── 🕵️ Privacy Operations
    ├── 🔒 Privacy Deposit (WTAO → Pool)
    └── 🔓 Privacy Withdraw (Use Note)
```

### Command Line Arguments
```bash
# Non-interactive usage with arguments
pnpm cli --private-key 0x123... --amount 1.5 --recipient 0xabc...

# Available arguments:
--private-key    # Override config.ts private key
--amount         # Specify amount for operations
--recipient      # Target address for withdrawals
--note           # Secret note for privacy withdrawals
```

## WTAO Mining Commands

### Basic Mining Setup
```bash
# Standard mining with 1 TAO deposit
pnpm miner                 # Mainnet mining
pnpm miner-testnet        # Testnet mining
pnpm miner-local          # Local mining

# Example output:
# ✅ Deposited 1 TAO to WTAO
# ✅ Associated EVM address with hotkey
# 🎯 Mining setup complete!
```

### Custom Amount Deposits
```bash
# Deposit specific amount
pnpm deposit               # Interactive amount selection
pnpm deposit-testnet      # Testnet deposit
pnpm deposit-local        # Local deposit

# Example interactive flow:
# ? Enter amount of TAO to deposit: 2.5
# ? Confirm deposit of 2.5 TAO? Yes
# ✅ Transaction confirmed: 0xabc123...
```

### Balance Checking
```bash
# Check all balances
pnpm balance              # Mainnet balances
pnpm balance-testnet     # Testnet balances
pnpm balance-local       # Local balances

# Example output:
# 💰 TAO Balance: 10.5 TAO
# 💰 WTAO Balance: 5.0 WTAO
# 🔗 Association Status: ✅ Linked to hotkey
# ⛏️ Mining Status: Active (rank #42)
```

### Withdrawals
```bash
# Withdraw WTAO back to TAO
pnpm withdraw             # Mainnet withdrawal
pnpm withdraw-testnet    # Testnet withdrawal
pnpm withdraw-local      # Local withdrawal

# Example interactive flow:
# ? Enter amount to withdraw: 1.0
# ? Confirm withdrawal of 1.0 WTAO → TAO? Yes
# ✅ Withdrawal successful: 0xdef456...
```

## Validator Commands

### Weight Setting Operations
```bash
# Run validator script
pnpm vali                 # Mainnet validator
pnpm vali-testnet        # Testnet validator
pnpm vali-local          # Local validator

# Example output:
# 🏃 Starting validator operations...
# ⚖️ Setting weights for 192 miners
# 💰 Bounty earned: 0.001 TAO
# ⏰ Next weight setting in 113 blocks
```

### Validator Configuration
```typescript
// In config.ts - validator-specific settings
const config = {
  ethPrivateKey: "0x...",        // Validator EVM key
  subSeed: "//ValidatorSeed",    // Validator substrate seed
  env: "mainnet",
  netuid: "0x71"                 // Subnet 113
};
```

## Utility Commands

### Address Management
```bash
# Show your addresses
npx ts-node utils/address-helper.ts

# Example output:
# 🔑 EVM Address: 0x742d35Cc6BF4532A37687A97...
# 🔗 SS58 Mirror: 5F3sa2TJAWMqDhXG6jhV4N8kFJKr...
# 💡 Send TAO to SS58 Mirror for mining
```

### Fund Transfers
```bash
# Transfer from local Bittensor wallet to EVM
python3 utils/local-transfer.py WALLET_NAME EVM_ADDRESS AMOUNT

# Examples:
python3 utils/local-transfer.py mining 0x742d35Cc... 1.5
python3 utils/local-transfer.py validator 5F3sa2TJA... 0.5

# Verify transfer
npx ts-node utils/balance-checker.ts
```

### Test Mining
```bash
# Safe testing with small amounts
AUTO_CONFIRM=true npx ts-node utils/test-miner.ts

# Example output:
# 🔍 Detected 0.25 TAO available
# ⚠️ This will setup mining with available balance
# ✅ Mining setup complete with 0.25 TAO
```

### Mining Status
```bash
# Monitor mining performance
npx ts-node utils/mining-status.ts

# Example output:
# ⛏️ MINING STATUS ⛏️
# Status: Active
# Rank: #67 of 192
# Deposited: 2.5 TAO
# Estimated Daily: 0.015 TAO
# Last Weight Set: 5 blocks ago
```

## Advanced Commands

### Contract Interaction Scripts

#### Direct Balance Queries
```bash
# Get detailed balance information
npx ts-node scripts/get-balance.ts

# Example output:
# Native TAO: 12.5 TAO
# WTAO Balance: 3.0 WTAO
# Depositor Associations: 1
# Mining Weight: 3000000000000000000
```

#### Fund Transfers
```bash
# Transfer between EVM addresses
npx ts-node scripts/transfer.ts

# Interactive prompts:
# ? Recipient address: 0x123...
# ? Amount to transfer: 1.0
# ? Confirm transfer? Yes
```

### Build and Deployment

#### Contract Compilation
```bash
# Compile for different environments
pnpm build:substrate      # Substrate/Bittensor chains
pnpm build:ethereum       # Standard Ethereum chains
pnpm build:circuit        # zk-SNARK circuits

# Full compilation
pnpm build:contract:compile
```

#### Circuit Operations
```bash
# Download pre-built circuits and keys
pnpm download-keys

# Build circuits from source (requires circom)
pnpm build:circuit:compile

# Generate TypeScript types
pnpm generate-types
```

#### Deployment Commands
```bash
# Deploy to different networks
pnpm deploy               # Mainnet deployment
pnpm deploy-testnet      # Testnet deployment
pnpm deploy-local        # Local deployment

# Deployment with environment variables
VERIFIER_TYPE=substrate pnpm deploy-testnet
```

## Network-Specific Examples

### Mainnet Operations
```bash
# Complete mainnet mining setup
pnpm miner                           # Setup with 1 TAO
pnpm cli                            # Interactive operations
pnpm vali                           # Validator operations

# Monitor mainnet mining
npx ts-node utils/mining-status.ts  # Check performance
pnpm balance                        # Check balances
```

### Testnet Testing
```bash
# Safe testnet experimentation
pnpm miner-testnet                   # Test mining
pnpm cli-testnet                    # Test CLI operations
pnpm deposit-testnet                # Test deposits

# Testnet-specific utilities
AUTO_CONFIRM=true npx ts-node utils/test-miner.ts
```

### Local Development
```bash
# Local development workflow
pnpm deploy-local                    # Deploy contracts
pnpm miner-local                    # Test mining locally
pnpm test                           # Run test suite

# Local network management
npx hardhat node                    # Start local network
npx hardhat console --network local # Interactive console
```

## Error Handling and Debugging

### Common Command Patterns

#### Check Command Success
```bash
# Most commands provide clear success/failure indicators
if pnpm miner; then
  echo "✅ Mining setup successful"
else
  echo "❌ Mining setup failed"
  npx ts-node utils/mining-status.ts  # Debug information
fi
```

#### Environment Debugging
```bash
# Verify network configuration
npx ts-node -e "console.log(require('./config').config)"

# Test network connectivity
pnpm balance 2>/dev/null || echo "Network connection issue"

# Check contract deployments
npx ts-node -e "
  const hre = require('hardhat');
  console.log('Network:', hre.network.name);
  console.log('Chain ID:', hre.network.config.chainId);
"
```

#### Gas and Performance Issues
```bash
# Monitor gas usage
REPORT_GAS=true pnpm test            # Test suite gas report
npx ts-node utils/gas-monitor.ts     # Real-time gas monitoring

# Performance optimization
DEBUG=true pnpm miner               # Verbose debugging output
TIME_OPERATIONS=true pnpm cli       # Timing information
```

### Troubleshooting Commands

#### Network Issues
```bash
# Test all networks
for net in mainnet testnet local; do
  echo "Testing $net..."
  pnpm balance-$net >/dev/null 2>&1 && echo "✅ $net OK" || echo "❌ $net Failed"
done
```

#### Configuration Issues
```bash
# Verify configuration
npx ts-node -e "
  try {
    const config = require('./config').config;
    console.log('✅ Config loaded');
    console.log('Environment:', config.env);
    console.log('Network ID:', config.netuid);
  } catch(e) {
    console.log('❌ Config error:', e.message);
  }
"
```

#### Contract Issues
```bash
# Test contract connectivity
npx ts-node -e "
  const hre = require('hardhat');
  hre.ethers.provider.getBlockNumber()
    .then(n => console.log('✅ Connected, block:', n))
    .catch(e => console.log('❌ Connection failed:', e.message));
"
```

## Command Automation

### Scripted Operations
```bash
#!/bin/bash
# Automated mining setup script

echo "🚀 Starting automated mining setup..."

# 1. Check configuration
if ! npx ts-node -e "require('./config')" >/dev/null 2>&1; then
  echo "❌ Config error"
  exit 1
fi

# 2. Check balance
BALANCE=$(pnpm balance 2>/dev/null | grep "TAO Balance" | cut -d: -f2)
echo "💰 Available: $BALANCE"

# 3. Setup mining
if AUTO_CONFIRM=true npx ts-node utils/test-miner.ts; then
  echo "✅ Mining setup complete"
else
  echo "❌ Mining setup failed"
  exit 1
fi

# 4. Monitor status
npx ts-node utils/mining-status.ts
echo "🎯 Setup complete! Monitor with: npx ts-node utils/mining-status.ts"
```

### Monitoring Scripts
```bash
#!/bin/bash
# Continuous monitoring script

while true; do
  echo "$(date): Checking mining status..."
  npx ts-node utils/mining-status.ts

  # Alert on issues
  if ! pnpm balance >/dev/null 2>&1; then
    echo "🚨 Network connectivity issue!"
    # Send notification (implement your preferred method)
  fi

  sleep 300  # Check every 5 minutes
done
```

## Performance Optimization

### Batch Operations
```bash
# Process multiple operations efficiently
pnpm cli --amount 1.0 --operation deposit    # Non-interactive deposit
pnpm cli --amount 0.5 --operation withdraw   # Non-interactive withdrawal
```

### Parallel Execution
```bash
# Run operations in parallel (where safe)
pnpm balance &                   # Background balance check
pnpm mining-status &            # Background status check
wait                            # Wait for both to complete
```

This comprehensive CLI reference provides practical examples for all Taonado operations, from basic mining setup to advanced contract interactions and troubleshooting procedures.