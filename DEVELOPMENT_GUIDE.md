# Taonado Development Guide

This file provides development guidance for working with the Taonado codebase.

## Project Overview

**Taonado-Cash** is a zero-knowledge privacy mixer for TAO tokens on the Bittensor network. It uses zk-SNARKs to enable anonymous deposits and withdrawals while maintaining network incentives through a novel validation mechanism.

**Tech Stack:** TypeScript, Hardhat, Solidity, zk-SNARKs (Circom), Bittensor EVM

## Essential Commands

### Setup
```bash
pnpm install
cp config-example.ts config.ts  # Configure before running
```

### Build Commands
- `pnpm build:contract:compile` - Compile contracts and generate TypeScript types
- `pnpm build:substrate` - Build for Substrate environment
- `pnpm build:ethereum` - Build for Ethereum environment
- `pnpm build:circuit:compile` - Compile zk-SNARK circuits
- `pnpm build:circuit` - Build circuits with directory setup

### Testing
- `pnpm test` - Run test suite with gas reporting (requires local hardhat network)
- Test files located in `test/` directory with mock contracts in `test/mock/`

### Deployment
- `pnpm deploy-local` - Deploy to local network
- `pnpm deploy-testnet` - Deploy to Subnet EVM testnet
- `pnpm deploy` - Deploy to mainnet

### Core Operations
- `pnpm cli-local` - Run CLI for local network
- `pnpm cli-testnet` - Run CLI for testnet
- `pnpm cli` - Run CLI for mainnet
- `pnpm miner-local` / `pnpm miner-testnet` - Run miner scripts
- `pnpm vali-local` / `pnpm vali-testnet` - Run validator scripts

### Transaction Operations
- `pnpm deposit-local` / `pnpm deposit-testnet` - Make deposits
- `pnpm withdraw-local` / `pnpm withdraw-testnet` - Make withdrawals
- `pnpm balance-local` / `pnpm balance-testnet` - Check balances
- `pnpm transfer-local` / `pnpm transfer-testnet` - Transfer funds between addresses

## Architecture Overview

The system uses a modular smart contract architecture with clear separation of concerns:

### Core Contracts
1. **WTAO (Wrapped TAO)** - Handles user funds and ERC20 functionality
2. **DepositTracker** - Associates depositor addresses with miner hotkeys
3. **WeightsV2** - Calculates normalized weights based on deposits
4. **EvmValidator** - Manages weight setting and bounty distribution
5. **Taonado** - Core mixer contract implementing zk-SNARK proof verification
6. **MerkleTreeWithHistory** - Manages commitment tree for privacy proofs
7. **Verifier** - Smart contract wrapper for zk-SNARK proof verification

### Key Design Principles
- **Fund Isolation**: Only WTAO contract holds user funds
- **Permissionless Validation**: Any EVM wallet can call weight setting functions
- **Incentivized Participation**: TAO bounties for network contributors
- **Zero-Knowledge Privacy**: zk-SNARK proofs for anonymous transactions

### Miner Operations Flow
1. Deposit TAO into WTAO contract
2. Associate EVM address with SS58 hotkey in DepositTracker
3. Earn emissions based on deposit size and duration
4. Optional: Run validator script for additional rewards

### Network Configuration
- **Local**: Hardhat local network
- **Testnet**: Subnet EVM testnet (`https://test.chain.opentensor.ai`)
- **Mainnet**: Bittensor mainnet (`https://lite.chain.opentensor.ai`)

## Key Development Notes

### Configuration Management
- Always use `config.ts` (copied from `config-example.ts`) for environment configuration
- Never commit `config.ts` - it contains private keys and network endpoints
- Set `env`, `netuid`, `ethPrivateKey`, and `subSeed` in config.ts before running

### Circuit Development
- Circuit compilation requires `circom` and `snarkjs` dependencies
- Circuits are located in `circuits/` directory (withdraw.circom, merkleTree.circom)
- Use `pnpm build:circuit` to compile with proper directory setup
- Compiled circuits output to `artifacts/circuits/` directory
- zk-SNARK proving keys and verification keys managed through circuit build process

### Contract Verification
- Can verify contracts on taostats explorer using `hardhat verify`
- Example: `pnpm hardhat verify --network taostats 0xDEPLOYED_CONTRACT_ADDRESS "CONSTRUCTOR_PARAM_0"`
- The system uses custom BN128 precompile addresses (different from Ethereum)

### Key Architectural Constraints
- DepositTracker uses one-to-many relationship (hotkey to multiple depositors)
- Fund isolation: only WTAO holds user funds, other contracts have read-only access
- Weight calculations are completely isolated from fund management
- EVM addresses cannot be reassociated once linked to an SS58 hotkey

### Security Considerations
- Never commit private keys or sensitive configuration
- WTAO contract maintains full custody of user funds
- zk-SNARK proofs ensure transaction anonymity
- System designed for permissionless operation with minimal trust requirements

## Development Tools and Utilities

### Key Script Files
- `scripts/deploy.ts` - Contract deployment script with environment configuration
- `scripts/miner.ts` - Miner operations script for depositing and associating addresses
- `scripts/vali.ts` - Validator operations script for weight setting
- `core/cli.ts` - Interactive CLI for user deposit/withdrawal operations
- `tools/generate-types.ts` - TypeScript type generation from compiled contracts

### Community Utilities
- `utils/` - User-friendly mining utilities for testing and monitoring
- See `utils/README.md` for comprehensive usage guide

### File Structure
- `contracts/` - Solidity smart contracts (core mixer contracts in `contracts/core/`)
- `circuits/` - Circom zk-SNARK circuit definitions
- `test/` - Test suite with mock contracts for local development
- `artifacts/` - Compiled contract artifacts and circuit outputs
- `tasks/` - Hardhat tasks for specialized operations

### Development Environment Setup
- Use `config-example.ts` as template for `config.ts`
- Environment values: "local", "testnet", "mainnet"
- Network IDs: local=0x2, testnet=0x15B, mainnet=0x71 (SN113)
- Private keys support both environment variables (`ETH_PRIVATE_KEY`) and config file

### Architecture Documentation
See `ARCHITECTURE.md` for detailed system design, including contract interaction diagrams and fund isolation principles.