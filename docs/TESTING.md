# Taonado Testing Guide

This document provides comprehensive guidance for testing the Taonado protocol across all components and environments.

## Testing Overview

Taonado includes several test suites covering different aspects of the system:

| Test Suite | Purpose | Coverage |
|------------|---------|----------|
| **Unit Tests** | Individual contract functionality | Core contracts, libraries |
| **Integration Tests** | End-to-end workflows | Complete user flows |
| **Mock Tests** | Isolated component testing | External dependencies |
| **Gas Tests** | Performance optimization | Transaction costs |
| **Circuit Tests** | zk-SNARK verification | Privacy proofs |

## Test Structure

```
test/
├── evm-validator.test.ts    # EvmValidator contract tests
├── weights.test.ts          # WeightsV2 contract tests
├── deposit.test.ts          # DepositTracker tests
├── taonado.test.ts          # Privacy mixer tests
└── mock/
    ├── metagraph.mock.ts    # Mock Bittensor metagraph
    └── neuron.mock.ts       # Mock neuron precompile
```

## Prerequisites

### Environment Setup
```bash
# Install dependencies
pnpm install

# Ensure config.ts exists (for some tests)
cp config-example.ts config.ts

# Build contracts (required for tests)
pnpm build:ethereum
```

### Required Tools
- **Node.js**: v18+ recommended
- **Hardhat**: Included in dependencies
- **Ethers.js**: v6.x for contract interactions
- **Mocha/Chai**: Testing framework and assertions

## Running Tests

### Basic Test Execution

#### Run All Tests
```bash
# Complete test suite with gas reporting
pnpm test

# Equivalent command
REPORT_GAS=true hardhat test --network hardhat
```

#### Run Specific Test Files
```bash
# Individual test suites
npx hardhat test test/evm-validator.test.ts
npx hardhat test test/weights.test.ts
npx hardhat test test/taonado.test.ts
npx hardhat test test/deposit.test.ts
```

#### Run Specific Test Cases
```bash
# Run tests matching a pattern
npx hardhat test --grep "EvmValidator"
npx hardhat test --grep "weight calculation"
npx hardhat test --grep "privacy deposit"
```

### Advanced Test Options

#### Gas Reporting
```bash
# Enable detailed gas reporting
REPORT_GAS=true pnpm test

# Save gas report to file
REPORT_GAS=true pnpm test > gas-report.txt
```

#### Coverage Analysis
```bash
# Generate test coverage report
npx hardhat coverage

# View coverage in browser
open coverage/index.html
```

#### Verbose Output
```bash
# Detailed test output
npx hardhat test --verbose

# Show stack traces for failures
npx hardhat test --show-stack-traces
```

## Test Environments

### Local Hardhat Network (Default)
- **Purpose**: Fast, isolated testing
- **Features**: Automatic mining, unlimited ETH
- **Usage**: Default for all test commands
- **Chain ID**: 31337

### Forked Networks
```bash
# Test against mainnet fork
npx hardhat test --network hardhat-fork-mainnet

# Test against testnet fork
npx hardhat test --network hardhat-fork-testnet
```

## Test Categories

### 1. Core Contract Tests (`evm-validator.test.ts`)

**Coverage**:
- Weight setting functionality
- Bounty distribution system
- Access control mechanisms
- Upgrade procedures

**Key Test Cases**:
```typescript
describe("EvmValidator", function () {
  it("should set weights correctly")
  it("should pay bounties to callers")
  it("should enforce interval restrictions")
  it("should boost metagraph participants")
  it("should handle upgrades properly")
});
```

**Expected Gas Costs**:
- Weight setting: ~45,000 gas
- Bounty payment: ~21,000 gas
- Initialization: ~180,000 gas

### 2. Weight Calculation Tests (`weights.test.ts`)

**Coverage**:
- WTAO balance aggregation
- Weight normalization
- Burn mechanism for excess emissions
- Association limits

**Key Test Cases**:
```typescript
describe("Weights", function () {
  it("should calculate weights from WTAO balances")
  it("should normalize weights correctly")
  it("should burn excess emissions")
  it("should respect association limits")
});
```

**Critical Assertions**:
- Total weights sum to max uint16
- Burn weight calculation accuracy
- Association count limits enforced

### 3. Deposit Tracking Tests (`deposit.test.ts`)

**Coverage**:
- EVM address to hotkey associations
- One-time association enforcement
- Association enumeration

**Key Test Cases**:
```typescript
describe("DepositTracker", function () {
  it("should associate addresses with hotkeys")
  it("should prevent re-association")
  it("should track multiple depositors per hotkey")
});
```

### 4. Privacy Mixer Tests (`taonado.test.ts`)

**Coverage**:
- zk-SNARK proof generation
- Merkle tree operations
- Deposit/withdrawal flows
- Nullifier tracking

**Key Test Cases**:
```typescript
describe("ERC20Taonado", function () {
  it("should accept valid deposits")
  it("should verify withdrawal proofs")
  it("should prevent double spending")
  it("should maintain anonymity sets")
});
```

**Performance Requirements**:
- Proof generation: <30 seconds
- Proof verification: <500ms
- Merkle tree updates: <1 second

## Mock Components

### Mock Metagraph (`mock/metagraph.mock.ts`)
Simulates Bittensor metagraph functionality:
- Hotkey registration
- UID assignment
- Network state queries

### Mock Neuron (`mock/neuron.mock.ts`)
Simulates neuron precompile:
- Weight setting calls
- Parameter validation
- Event emission

## Test Data and Fixtures

### Standard Test Accounts
```typescript
// Automatically available in tests
const [deployer, miner1, miner2, user1, user2] = await ethers.getSigners();
```

### Common Test Values
```typescript
const netuid = "0x99";              // Test subnet ID
const pool_amount = ethers.parseEther("1");  // 1 TAO
const MERKLE_TREE_HEIGHT = 20;      // Standard tree height
```

### Fixture Functions
```typescript
// Deploy complete system
async function deployFixture() {
  // Returns: wtao, depositTracker, weights, evmValidator
}

// Create test deposit
function createTestDeposit(amount: bigint) {
  // Returns: deposit object with secret, commitment, nullifier
}
```

## Performance Benchmarks

### Expected Gas Costs (Hardhat Network)

| Operation | Gas Used | TAO Cost (Est.) |
|-----------|----------|-----------------|
| WTAO Deposit | ~46,000 | ~0.0008 |
| Address Association | ~28,000 | ~0.0005 |
| Weight Setting | ~65,000 | ~0.0011 |
| Privacy Deposit | ~180,000 | ~0.003 |
| Privacy Withdrawal | ~230,000 | ~0.004 |

### Performance Thresholds
- **Test Suite**: Must complete in <2 minutes
- **Individual Tests**: <30 seconds each
- **Gas Limits**: Must stay under 500,000 per transaction
- **Memory Usage**: <100MB for test runner

## Debugging Tests

### Common Test Failures

#### Contract Not Found
```bash
# Symptom: "Contract not deployed" errors
# Solution: Ensure contracts are compiled
pnpm build:ethereum
```

#### Gas Estimation Failures
```bash
# Symptom: "out of gas" errors
# Solution: Check gas limits in hardhat.config.ts
mocha: { timeout: 300000 }  // 5 minutes
```

#### Mock Setup Issues
```bash
# Symptom: "call to undefined method"
# Solution: Verify mock deployments in test fixtures
```

### Debug Utilities

#### Console Logging in Tests
```typescript
// Enable detailed logging
console.log("Test value:", await contract.someValue());

// Gas usage tracking
const tx = await contract.someMethod();
const receipt = await tx.wait();
console.log("Gas used:", receipt.gasUsed.toString());
```

#### Transaction Tracing
```bash
# Enable Hardhat tracing
npx hardhat test --trace

# Show internal calls
npx hardhat test --opcodes
```

## Continuous Integration

### GitHub Actions
```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: pnpm install
      - run: pnpm build:ethereum
      - run: pnpm test
```

### Pre-commit Hooks
```bash
# Install husky for git hooks
pnpm add -D husky

# Add pre-commit test runner
echo "pnpm test" > .husky/pre-commit
```

## Test Coverage Requirements

### Minimum Coverage Targets
- **Statements**: >90%
- **Branches**: >85%
- **Functions**: >95%
- **Lines**: >90%

### Coverage Commands
```bash
# Generate coverage report
npx hardhat coverage

# View specific file coverage
npx hardhat coverage --testfiles "test/evm-validator.test.ts"

# Generate lcov for CI integration
npx hardhat coverage --temp artifacts/coverage
```

## Writing New Tests

### Test Structure Template
```typescript
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("ContractName", function () {
  async function deployFixture() {
    // Setup code here
    return { contract, signers };
  }

  it("should perform expected behavior", async function () {
    const { contract } = await loadFixture(deployFixture);

    // Test execution
    await contract.someMethod();

    // Assertions
    expect(await contract.someValue()).to.equal(expectedValue);
  });
});
```

### Best Practices
1. **Use Fixtures**: Consistent test state with `loadFixture`
2. **Clear Naming**: Descriptive test and variable names
3. **Isolated Tests**: Each test should be independent
4. **Gas Monitoring**: Track gas usage for optimization
5. **Edge Cases**: Test boundary conditions and failure modes

## Integration Testing

### End-to-End Workflows
```typescript
// Complete mining setup flow
it("should complete full mining workflow", async function () {
  // 1. Deploy contracts
  // 2. Fund user account
  // 3. Deposit to WTAO
  // 4. Associate address
  // 5. Verify weight calculation
  // 6. Set weights
  // 7. Verify emissions
});

// Privacy mixer workflow
it("should complete anonymous transaction", async function () {
  // 1. Generate secret
  // 2. Create deposit
  // 3. Submit to mixer
  // 4. Wait for anonymity set
  // 5. Generate withdrawal proof
  // 6. Complete withdrawal
});
```

## Troubleshooting

### Common Issues

#### Timeout Errors
```bash
# Increase mocha timeout in hardhat.config.ts
mocha: { timeout: 600000 }  // 10 minutes
```

#### Memory Issues
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" pnpm test
```

#### Network Connection
```bash
# Test with local network only
npx hardhat test --network hardhat
```

This testing guide ensures comprehensive validation of all Taonado components while providing clear debugging and optimization strategies.