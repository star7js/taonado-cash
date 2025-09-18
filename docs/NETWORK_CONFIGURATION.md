# Taonado Network Configuration Guide

This document provides authoritative network configuration information for all Taonado deployments.

## Network Overview

Taonado operates on three primary networks with different purposes:

| Network | Environment | Purpose | Chain ID | Subnet ID |
|---------|-------------|---------|----------|-----------|
| **Mainnet** | Production | Live operations with real TAO | 964 | 113 (0x71) |
| **Testnet** | Testing | Safe testing with test TAO | 964 | 347 (0x15B) |
| **Local** | Development | Local development environment | 2 | 2 (0x2) |

## Network Endpoints

### Mainnet (Production)
- **Primary RPC**: `https://lite.chain.opentensor.ai`
- **Explorer**: `https://evm.taostats.io`
- **Explorer API**: `https://evm.taostats.io/api`
- **Chain ID**: 964
- **Subnet ID**: 113 (0x71)
- **Environment Code**: `mainnet`

### Testnet (Staging)
- **Primary RPC**: `https://test.chain.opentensor.ai`
- **Explorer**: `https://evm.taostats.io` (same as mainnet)
- **Chain ID**: 964
- **Subnet ID**: 347 (0x15B)
- **Environment Code**: `testnet` or `subevm`

### Local Development
- **RPC**: `http://127.0.0.1:9944`
- **Chain ID**: 2 or 964 (depending on setup)
- **Subnet ID**: 2 (0x2)
- **Environment Code**: `local` or `substrate-local`

## Configuration Files

### config.ts Setup
```typescript
// Example mainnet configuration
const config = {
  ethPrivateKey: "YOUR_PRIVATE_KEY",
  env: "mainnet",           // "local", "testnet", "mainnet"
  netuid: "0x71",          // SN113 mainnet
  subSeed: "//YourSeed",
  MERKLE_TREE_HEIGHT: 20,
};
```

### Network-Specific Settings

#### Mainnet Production
```typescript
env: "mainnet"
netuid: "0x71"  // Subnet 113
```

#### Testnet
```typescript
env: "testnet"
netuid: "0x15B"  // Subnet 347
```

#### Local Development
```typescript
env: "local"
netuid: "0x2"  // Local subnet 2
```

## Hardhat Network Configuration

The project uses these network names in `hardhat.config.ts`:

```typescript
networks: {
  mainnet: {
    url: "https://lite.chain.opentensor.ai",
    accounts: [ethPrivateKey],
  },
  subevm: {  // Testnet alias
    url: "https://test.chain.opentensor.ai",
    accounts: [ethPrivateKey],
  },
  local: {
    url: "http://127.0.0.1:9944",
    accounts: [ethPrivateKey],
  },
  "substrate-local": {
    url: "http://127.0.0.1:9944",
    chainId: 964,
    accounts: [ethPrivateKey],
  }
}
```

## Command Examples by Network

### Mainnet Operations
```bash
# Mining
pnpm miner                    # Default to mainnet
pnpm cli                      # Interactive CLI

# Specific operations
pnpm deposit                  # Mainnet deposit
pnpm withdraw                 # Mainnet withdrawal
pnpm balance                  # Check mainnet balance
```

### Testnet Operations
```bash
# Mining
pnpm miner-testnet           # Testnet mining
pnpm cli-testnet             # Testnet CLI

# Specific operations
pnpm deposit-testnet         # Testnet deposit
pnpm withdraw-testnet        # Testnet withdrawal
pnpm balance-testnet         # Check testnet balance
```

### Local Development
```bash
# Mining
pnpm miner-local             # Local mining
pnpm cli-local               # Local CLI

# Specific operations
pnpm deposit-local           # Local deposit
pnpm withdraw-local          # Local withdrawal
pnpm balance-local           # Check local balance
```

## Contract Verification

### Mainnet/Testnet Verification
```bash
pnpm hardhat verify --network taostats CONTRACT_ADDRESS "CONSTRUCTOR_PARAM"
```

### Network-Specific Deployment
```bash
# Deploy to specific networks
pnpm deploy                  # Mainnet (default)
pnpm deploy-testnet         # Testnet
pnpm deploy-local           # Local
```

## Gas and Performance

### Typical Gas Costs (in TAO)
| Operation | Mainnet | Testnet | Local |
|-----------|---------|---------|-------|
| WTAO Deposit | ~0.001 | ~0.001 | ~0.001 |
| Association | ~0.0005 | ~0.0005 | ~0.0005 |
| Weight Setting | ~0.002 | ~0.002 | ~0.002 |
| Privacy Deposit | ~0.01 | ~0.01 | ~0.01 |
| Privacy Withdrawal | ~0.015 | ~0.015 | ~0.015 |

### Block Times
- **Mainnet**: ~12 seconds
- **Testnet**: ~12 seconds
- **Local**: ~2 seconds (configurable)

## Network-Specific Considerations

### Mainnet
- **Real TAO**: All operations use real TAO with economic value
- **Limited Mining Slots**: Only 192 active miners maximum
- **Competitive**: Bottom performers get removed from mining set
- **Irreversible**: Mistakes have real financial consequences

### Testnet
- **Test TAO**: No real economic value, safe for testing
- **Full Feature Set**: Same contracts and functionality as mainnet
- **Reset Periodically**: Balances and state may be reset
- **Ideal for Learning**: Perfect for testing before mainnet

### Local
- **Development Only**: For code development and testing
- **Mock Contracts**: May use simplified versions of some components
- **Fast Iteration**: Quick deployment and testing cycles
- **No Network Dependency**: Works offline

## Switching Networks

### Environment Variable Method
```bash
# Set in your shell
export TAONADO_ENV=testnet
export TAONADO_NETUID=0x15B

# Or per-command
TAONADO_ENV=testnet pnpm miner
```

### Config File Method
Edit your `config.ts`:
```typescript
// Change these values and restart
const env: string = "testnet";        // Target network
const netuid: BigNumberish = "0x15B"; // Corresponding subnet
```

## Troubleshooting Network Issues

### Common Problems

#### Wrong Network Configuration
```bash
# Symptoms: "Contract not found", "Invalid chain ID"
# Solution: Verify config.ts matches your intended network

# Check current config
npx ts-node -e "console.log(require('./config').config)"
```

#### RPC Connection Issues
```bash
# Test network connectivity
curl -X POST https://lite.chain.opentensor.ai \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
```

#### Chain ID Mismatches
```bash
# Expected responses:
# Mainnet/Testnet: {"result":"0x3c4"} (964 decimal)
# Local: {"result":"0x2"} (2 decimal) or {"result":"0x3c4"}
```

### Contract Address Verification

Each network has different deployed contract addresses. Use these commands to verify:

```bash
# Check deployed addresses
npx ts-node -e "
  const hre = require('hardhat');
  console.log('Current network:', hre.network.name);
  console.log('Chain ID:', hre.network.config.chainId);
"
```

## Security Considerations

### Private Key Management
- **Never commit** `config.ts` to version control
- **Use different keys** for each network when possible
- **Keep mainnet keys** especially secure

### Network Verification
- **Always verify** you're on the intended network before transactions
- **Check contract addresses** match expected deployments
- **Start with small amounts** when testing new networks

## Network Status Monitoring

### Health Check Commands
```bash
# Quick network connectivity test
npx ts-node utils/balance-checker.ts

# Full system status
npx ts-node utils/mining-status.ts

# Contract verification
pnpm hardhat verify --list-networks
```

### External Resources
- **Taostats Explorer**: Monitor transactions and contracts
- **Subnet Stats**: Track mining performance and emissions
- **Network Status**: Check for planned maintenance or issues

This configuration guide ensures consistent network setup across all Taonado operations and provides clear troubleshooting steps for common network-related issues.