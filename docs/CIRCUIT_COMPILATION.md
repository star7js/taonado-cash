# zk-SNARK Circuit Compilation Guide

This document provides comprehensive guidance for compiling, verifying, and working with zk-SNARK circuits in the Taonado protocol.

## Overview

Taonado uses zk-SNARKs (Zero-Knowledge Succinct Non-Interactive Arguments of Knowledge) to enable anonymous transactions. The circuit compilation process generates the cryptographic proofs required for privacy-preserving operations.

### Circuit Architecture

```
circuits/
├── withdraw.circom          # Main withdrawal circuit
├── merkleTree.circom       # Merkle tree verification circuit
└── (generated)
    ├── withdraw.json       # Compiled circuit
    ├── withdraw_proving_key.bin     # Proving key
    ├── withdraw_verification_key.json   # Verification key
    └── Verifier.sol        # Solidity verifier contract
```

## Circuit Components

### 1. Withdrawal Circuit (`withdraw.circom`)

**Purpose**: Proves that a user knows a valid secret for a commitment in the Merkle tree without revealing the secret.

**Key Components**:
```circom
template Withdraw(levels) {
    // Public inputs (visible on-chain)
    signal input root;           // Merkle tree root
    signal input nullifierHash;  // Prevents double-spending
    signal input recipient;      // Withdrawal destination
    signal input relayer;        // Optional relayer address
    signal input fee;           // Relayer fee
    signal input refund;        // Gas refund amount

    // Private inputs (kept secret)
    signal private input nullifier;     // Secret nullifier
    signal private input secret;        // Secret value
    signal private input pathElements[levels];  // Merkle proof
    signal private input pathIndices[levels];   // Merkle path
}
```

**Security Features**:
- **Commitment Verification**: Proves knowledge of secret without revealing it
- **Merkle Proof**: Verifies inclusion in deposit tree
- **Nullifier System**: Prevents double-spending
- **Parameter Binding**: Cryptographically links public parameters

### 2. Merkle Tree Circuit (`merkleTree.circom`)

**Purpose**: Verifies Merkle tree inclusion proofs using MiMC hash function.

**Key Components**:
```circom
template MerkleTreeChecker(levels) {
    signal input leaf;              // Commitment to verify
    signal input root;              // Expected tree root
    signal input pathElements[levels];    // Sibling hashes
    signal input pathIndices[levels];     // Left/right indicators
}
```

**Hash Function**: Uses MiMCSponge for efficiency in zk-SNARKs

## Compilation Process

### Prerequisites

#### Required Tools
```bash
# Install circom compiler
npm install -g circom

# Install snarkjs for proof generation
npm install -g snarkjs

# Verify installations
circom --version    # Should show v2.0.0+
snarkjs --version   # Should show v0.6.0+
```

#### System Requirements
- **RAM**: Minimum 8GB, recommended 16GB+
- **Storage**: 2GB+ for compiled circuits and keys
- **CPU**: Multi-core recommended for faster compilation
- **OS**: Linux, macOS, or Windows with WSL

### Quick Setup (Recommended)

#### Download Pre-built Circuits
```bash
# Download trusted setup keys and compiled circuits
pnpm download-keys

# This downloads:
# - withdraw.json (compiled circuit)
# - withdraw_proving_key.bin (trusted setup proving key)
# - withdraw_verification_key.json (verification key)
# - Verifier.sol (Solidity verifier contract)
```

**Security Note**: The pre-built keys use the same trusted setup as Tornado Cash, which underwent a public ceremony. This is secure for production use.

### Manual Compilation (Advanced)

#### Compile from Source
```bash
# Ensure circuits directory exists
mkdir -p artifacts/circuits

# Compile the main withdrawal circuit
pnpm build:circuit:compile

# Equivalent to:
circom circuits/withdraw.circom -o artifacts/circuits/withdraw.json
```

#### Generate Trusted Setup (Development Only)
```bash
# ⚠️ WARNING: This is NOT secure for production!
# Use only for development and testing

# Generate proving key (takes 5-20 minutes)
snarkjs powersoftau new bn128 20 pot20_0000.ptau -v

# Contribute to ceremony (development only)
snarkjs powersoftau contribute pot20_0000.ptau pot20_0001.ptau \
  --name="Dev contribution" -v

# Finalize ceremony
snarkjs powersoftau prepare phase2 pot20_0001.ptau pot20_final.ptau -v

# Generate circuit-specific keys
snarkjs groth16 setup artifacts/circuits/withdraw.json pot20_final.ptau \
  withdraw_proving_key.bin withdraw_verification_key.json

# Generate Solidity verifier
snarkjs zkey export solidityverifier withdraw_verification_key.json Verifier.sol
```

### Build Process Integration

#### Automated Compilation
```bash
# Full circuit build process
pnpm build:circuit

# This process:
# 1. Creates necessary directories
# 2. Compiles circuits with circom
# 3. Validates circuit constraints
# 4. Generates intermediate files
```

#### Network-Specific Compilation
```bash
# Compile for Substrate networks (Bittensor)
VERIFIER_TYPE=substrate pnpm build:contract:compile

# Compile for Ethereum networks
VERIFIER_TYPE=ethereum pnpm build:contract:compile
```

The verifier type affects the BN128 precompile addresses used in the Solidity verifier contract.

## Circuit Parameters

### Key Configuration

#### Merkle Tree Height
```typescript
// In config.ts
const MERKLE_TREE_HEIGHT = 20;  // Supports 2^20 = ~1M deposits

// Circuit instantiation
component main = Withdraw(20);
```

**Trade-offs**:
- **Higher depth**: More deposits supported, larger proofs
- **Lower depth**: Faster proofs, limited deposit capacity

#### Constraint Counts
| Circuit | Constraints | Description |
|---------|------------|-------------|
| MerkleTreeChecker(20) | ~43,000 | Merkle proof verification |
| CommitmentHasher | ~1,000 | Commitment generation |
| Total Withdraw(20) | ~44,000 | Complete withdrawal circuit |

### Performance Metrics

#### Proof Generation Times (Development Machine)
- **Circuit Compilation**: 10-30 seconds
- **Proving Key Generation**: 5-20 minutes (one-time)
- **Proof Generation**: 5-15 seconds per proof
- **Proof Verification**: <1 second

#### Memory Requirements
- **Circuit Compilation**: ~1GB RAM
- **Proof Generation**: ~4GB RAM
- **Key Storage**: ~500MB disk space

## Verifier Configuration

### Network-Specific Setup

#### Precompile Address Configuration
```typescript
// tools/compile-variants.ts defines network-specific settings
const variants = [
  {
    name: "substrate",
    description: "TAO Substrate-compatible EVM chains",
    precompileAddr: "0x6",        // Substrate precompile address
    targetChains: [964],          // Bittensor chain ID
  },
  {
    name: "ethereum",
    description: "Standard Ethereum chains",
    precompileAddr: "0x6",        // Ethereum precompile address
    targetChains: [1, 3, 4, 5],   // Ethereum networks
  }
];
```

#### Automatic Configuration
The build process automatically configures the verifier based on the target network:

```bash
# Auto-detects network and configures appropriate precompile
pnpm build:substrate    # Configures for Bittensor networks
pnpm build:ethereum     # Configures for Ethereum networks
```

### Verifier Contract Generation

#### Solidity Verifier
```solidity
// Generated Verifier.sol structure
contract Verifier {
    function verifyProof(
        uint[2] memory _pA,
        uint[2][2] memory _pB,
        uint[2] memory _pC,
        uint[7] memory _pubSignals
    ) public view returns (bool);
}
```

**Public Signals Order**:
1. `root` - Merkle tree root
2. `nullifierHash` - Nullifier hash
3. `recipient` - Withdrawal recipient
4. `relayer` - Relayer address
5. `fee` - Relayer fee
6. `refund` - Gas refund amount

## Development Workflow

### Circuit Development Cycle

#### 1. Modify Circuit
```bash
# Edit circuits/withdraw.circom or circuits/merkleTree.circom
vim circuits/withdraw.circom
```

#### 2. Compile and Test
```bash
# Compile circuit
pnpm build:circuit:compile

# Test with sample inputs
npx ts-node tools/test-circuit.ts
```

#### 3. Generate Test Proofs
```bash
# Generate proof with test data
npx ts-node tools/generate-test-proof.ts

# Verify proof
npx ts-node tools/verify-test-proof.ts
```

#### 4. Integration Testing
```bash
# Test circuit in full system
pnpm test test/taonado.test.ts

# Performance testing
pnpm test test/circuit-performance.test.ts
```

### Debugging Circuits

#### Common Issues

##### Constraint Violations
```bash
# Symptoms: "constraints not satisfied"
# Debug with verbose circom output
circom circuits/withdraw.circom --r1cs --wasm --sym --verbose

# Check constraint satisfaction
snarkjs wtns check withdraw.r1cs witness.wtns
```

##### Invalid Witness Generation
```bash
# Symptoms: "witness generation failed"
# Test with simplified inputs
npx ts-node tools/debug-witness.ts --simple-inputs

# Validate input ranges and constraints
npx ts-node tools/validate-circuit-inputs.ts
```

##### Performance Issues
```bash
# Profile constraint usage
snarkjs info -c artifacts/circuits/withdraw.json

# Optimize critical paths
npx ts-node tools/analyze-circuit-performance.ts
```

## Security Considerations

### Trusted Setup

#### Production Keys
- **Source**: Use keys from established ceremonies (Tornado Cash)
- **Verification**: Verify key authenticity using checksums
- **Storage**: Securely store and backup proving keys

#### Key Verification
```bash
# Verify downloaded keys match expected checksums
npx ts-node tools/verify-circuit-keys.ts

# Expected checksums (example):
# withdraw_proving_key.bin: sha256:abc123...
# withdraw_verification_key.json: sha256:def456...
```

### Circuit Security

#### Critical Properties
1. **Soundness**: Invalid proofs cannot be generated
2. **Zero-Knowledge**: Proofs reveal no secret information
3. **Completeness**: Valid secrets always generate valid proofs

#### Security Testing
```bash
# Test with invalid inputs
npx ts-node tools/test-invalid-proofs.ts

# Verify zero-knowledge property
npx ts-node tools/test-zero-knowledge.ts

# Test constraint enforcement
npx ts-node tools/test-constraint-violations.ts
```

## Production Deployment

### Pre-deployment Checklist

#### Circuit Validation
- [ ] Circuits compile without errors
- [ ] All tests pass
- [ ] Proof generation works
- [ ] Verifier contract deploys successfully
- [ ] Gas costs are reasonable

#### Security Verification
- [ ] Trusted setup keys verified
- [ ] Circuit constraints reviewed
- [ ] Security audit completed
- [ ] Test vectors validated

### Deployment Process

#### 1. Compile for Target Network
```bash
# Compile for mainnet deployment
VERIFIER_TYPE=substrate pnpm build:contract:compile
```

#### 2. Deploy Verifier Contract
```bash
# Deploy verifier as part of system deployment
pnpm deploy-mainnet
```

#### 3. Verify Deployment
```bash
# Test proof verification on deployed contract
npx ts-node tools/test-deployed-verifier.ts --network mainnet

# Verify contract on block explorer
pnpm hardhat verify --network taostats VERIFIER_ADDRESS
```

## Maintenance and Updates

### Circuit Updates

#### Version Management
```bash
# Tag circuit versions
git tag -a circuit-v1.0 -m "Production circuit v1.0"

# Track breaking changes
# - Constraint modifications
# - Public input changes
# - Hash function updates
```

#### Backward Compatibility
- **Breaking Changes**: Require new trusted setup
- **Compatible Changes**: Minor optimizations
- **Verification**: Old proofs must remain valid

### Performance Monitoring

#### Metrics to Track
- Proof generation time
- Verification gas costs
- Circuit constraint count
- Memory usage patterns

#### Optimization Strategies
1. **Constraint Reduction**: Minimize unnecessary operations
2. **Hash Function**: Use zk-SNARK friendly hashes
3. **Circuit Structure**: Optimize critical paths
4. **Batch Operations**: Combine multiple proofs

This comprehensive guide ensures secure and efficient zk-SNARK circuit compilation for Taonado's privacy features.