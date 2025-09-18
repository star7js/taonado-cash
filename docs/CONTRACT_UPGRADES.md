# Contract Upgrade Procedures

This document provides comprehensive guidance for upgrading Taonado smart contracts, including planning, testing, execution, and rollback procedures.

## Upgrade Architecture Overview

Taonado uses a mixed architecture for contract upgradeability:

| Contract | Upgrade Pattern | Reason |
|----------|----------------|---------|
| **EvmValidator** | UUPS Proxy | Configuration updates, bug fixes |
| **WTAO** | Immutable | Critical fund custody, security |
| **DepositTracker** | Immutable | Association integrity |
| **WeightsV2** | Replaceable | Algorithm improvements |
| **Verifier** | Immutable | Cryptographic integrity |

### UUPS (Universal Upgradeable Proxy Standard)

The EvmValidator contract uses OpenZeppelin's UUPS pattern:

```solidity
contract EvmValidator is OwnableUpgradeable, UUPSUpgradeable {
    function _authorizeUpgrade(address newImplementation)
        internal override onlyOwner {}
}
```

**Benefits**:
- Owner-controlled upgrades
- Gas efficient
- No external proxy admin needed
- Upgrade authorization built into implementation

## Upgrade Planning

### When to Upgrade

#### EvmValidator Upgrade Scenarios
1. **Bug Fixes**: Critical security issues
2. **Feature Additions**: New functionality (bounty adjustments, etc.)
3. **Gas Optimizations**: Performance improvements
4. **Parameter Updates**: Configuration changes

#### Non-Upgradeable Contract Replacement
1. **Algorithm Changes**: New weight calculation logic
2. **Major Refactors**: Significant architectural changes
3. **Deprecation**: Replacing old contracts with new versions

### Pre-Upgrade Assessment

#### Impact Analysis
```bash
# Assess upgrade impact
npx ts-node tools/upgrade-impact-analysis.ts \
  --contract EvmValidator \
  --new-implementation $NEW_IMPL_ADDRESS

# Check:
# - Storage layout compatibility
# - Function signature changes
# - State variable modifications
# - External dependency changes
```

#### Risk Assessment Matrix
| Risk Level | Criteria | Mitigation |
|------------|----------|------------|
| **Low** | Bug fixes, gas optimizations | Standard testing |
| **Medium** | New features, parameter changes | Extended testing, staged rollout |
| **High** | Storage changes, major refactors | Comprehensive testing, emergency procedures |

## Upgrade Testing

### Development Testing

#### Local Upgrade Testing
```bash
# 1. Deploy original contract to local network
pnpm deploy-local

# 2. Deploy new implementation
npx ts-node scripts/deploy-upgrade-implementation.ts --network local

# 3. Test upgrade process
npx ts-node scripts/test-upgrade.ts --network local --dry-run

# 4. Verify upgrade functionality
npx ts-node scripts/verify-upgrade.ts --network local
```

#### Upgrade Test Script Example
```typescript
// scripts/test-upgrade.ts
import { ethers, upgrades } from "hardhat";

async function testUpgrade() {
  // Get current proxy address
  const proxyAddress = "0x..."; // Current EvmValidator proxy

  // Deploy new implementation
  const NewImplementation = await ethers.getContractFactory("MockUpgradedEvmValidator");

  // Test upgrade (dry run)
  console.log("Testing upgrade compatibility...");
  await upgrades.validateUpgrade(proxyAddress, NewImplementation);

  // Execute upgrade
  console.log("Executing upgrade...");
  const upgraded = await upgrades.upgradeProxy(proxyAddress, NewImplementation);
  await upgraded.waitForDeployment();

  // Verify new functionality
  if (upgraded.newFunction) {
    const result = await upgraded.newFunction();
    console.log("New function result:", result);
  }

  console.log("✅ Upgrade test completed successfully");
}
```

### Testnet Testing

#### Comprehensive Testnet Validation
```bash
# 1. Deploy to testnet
pnpm deploy-testnet

# 2. Run full test suite
pnpm test --network subevm

# 3. Execute upgrade on testnet
npx ts-node scripts/execute-upgrade.ts --network subevm

# 4. Validate all functionality
npx ts-node scripts/validate-upgrade.ts --network subevm

# 5. Performance testing
npx ts-node scripts/upgrade-performance-test.ts --network subevm
```

#### State Migration Testing
```bash
# Test with realistic state
npx ts-node scripts/setup-realistic-test-state.ts --network subevm

# Include:
# - Multiple miners with deposits
# - Various weight settings
# - Bounty configurations
# - Historical transaction data
```

## Upgrade Execution

### Pre-Execution Checklist

#### Technical Verification
- [ ] New implementation deployed and verified
- [ ] Storage layout compatibility confirmed
- [ ] All tests passing on testnet
- [ ] Gas costs estimated and acceptable
- [ ] Rollback plan prepared

#### Operational Verification
- [ ] Stakeholder approval obtained
- [ ] Maintenance window scheduled
- [ ] Monitoring systems prepared
- [ ] Communication plan activated

### Upgrade Scripts

#### EvmValidator Upgrade Script
```typescript
// scripts/upgrade-evm-validator.ts
import { ethers, upgrades } from "hardhat";
import { config } from "../config";

async function upgradeEvmValidator() {
  console.log("🔄 Starting EvmValidator upgrade...");

  // Get current proxy address (from deployment records)
  const proxyAddress = getDeployedAddress("EvmValidator", config.env);

  // Get owner wallet
  const owner = new ethers.Wallet(config.ethPrivateKey, ethers.provider);

  // Deploy new implementation
  console.log("📦 Deploying new implementation...");
  const NewEvmValidator = await ethers.getContractFactory("EvmValidatorV2", owner);

  // Validate upgrade compatibility
  console.log("🔍 Validating upgrade compatibility...");
  await upgrades.validateUpgrade(proxyAddress, NewEvmValidator);

  // Execute upgrade
  console.log("⚡ Executing upgrade...");
  const upgraded = await upgrades.upgradeProxy(proxyAddress, NewEvmValidator);
  await upgraded.waitForDeployment();

  // Verify upgrade
  console.log("✅ Verifying upgrade...");
  const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
  console.log("New implementation:", implementationAddress);

  // Test basic functionality
  console.log("🧪 Testing basic functionality...");
  const tx = await upgraded.setVersionKey(1);
  await tx.wait();

  console.log("🎉 Upgrade completed successfully!");

  return {
    proxy: proxyAddress,
    implementation: implementationAddress,
    txHash: tx.hash
  };
}
```

#### Step-by-Step Execution
```bash
# 1. Final preparation
export UPGRADE_ENV=mainnet
export NEW_IMPLEMENTATION_HASH=0xabc...

# 2. Pre-flight checks
npx ts-node scripts/pre-upgrade-checks.ts --env $UPGRADE_ENV

# 3. Execute upgrade
npx ts-node scripts/upgrade-evm-validator.ts \
  --env $UPGRADE_ENV \
  --implementation $NEW_IMPLEMENTATION_HASH \
  --confirm

# 4. Post-upgrade validation
npx ts-node scripts/post-upgrade-validation.ts --env $UPGRADE_ENV

# 5. Monitor system health
npx ts-node scripts/monitor-post-upgrade.ts --duration 1h
```

### Non-Upgradeable Contract Replacement

For contracts that cannot be upgraded (WTAO, DepositTracker, etc.):

#### Replacement Strategy
```bash
# 1. Deploy new contract version
npx ts-node scripts/deploy-weights-v3.ts --network mainnet

# 2. Update EvmValidator to use new contract
npx ts-node scripts/update-weights-contract.ts \
  --new-address $NEW_WEIGHTS_ADDRESS \
  --network mainnet

# 3. Verify migration
npx ts-node scripts/verify-contract-migration.ts --network mainnet

# 4. Update documentation and monitoring
npx ts-node scripts/update-deployment-docs.ts --network mainnet
```

## Post-Upgrade Procedures

### Immediate Validation

#### Functionality Testing
```bash
# Test all critical functions
npx ts-node scripts/post-upgrade-function-test.ts

# Functions to test:
# - setWeights()
# - Weight calculation
# - Bounty distribution
# - Access controls
# - Event emission
```

#### Performance Monitoring
```bash
# Monitor gas usage
npx ts-node scripts/monitor-gas-usage.ts --duration 24h

# Monitor transaction success rates
npx ts-node scripts/monitor-tx-success.ts --duration 24h

# Monitor weight setting frequency
npx ts-node scripts/monitor-weight-frequency.ts --duration 24h
```

### Extended Monitoring

#### 24-Hour Monitoring
- Weight setting operations continue normally
- Bounty distribution functions correctly
- No unexpected errors or reverts
- Gas costs remain within expected ranges

#### 7-Day Assessment
- Performance metrics stable
- All miners continue earning rewards
- No reported issues from users
- System operates within normal parameters

## Rollback Procedures

### When to Rollback

#### Immediate Rollback Triggers
- Critical functionality broken
- Security vulnerability discovered
- Significant performance degradation
- Data corruption or loss

#### Rollback Decision Matrix
| Issue Severity | Time to Rollback | Authorization Required |
|----------------|------------------|----------------------|
| Critical | Immediate | Technical lead |
| High | < 1 hour | Technical + business lead |
| Medium | < 4 hours | Full stakeholder review |

### Rollback Execution

#### Emergency Rollback
```bash
# Emergency rollback to previous implementation
npx ts-node scripts/emergency-rollback.ts \
  --contract EvmValidator \
  --previous-implementation $PREVIOUS_IMPL_ADDRESS \
  --confirm-emergency

# This script:
# 1. Validates previous implementation
# 2. Executes immediate rollback
# 3. Verifies functionality
# 4. Notifies stakeholders
```

#### Standard Rollback
```bash
# Planned rollback procedure
npx ts-node scripts/planned-rollback.ts \
  --contract EvmValidator \
  --target-version v1.2.0 \
  --reason "Performance issues" \
  --schedule "2024-01-15T10:00:00Z"
```

### Post-Rollback Procedures

#### Immediate Actions
```bash
# 1. Verify system functionality
npx ts-node scripts/verify-rollback.ts

# 2. Monitor for stability
npx ts-node scripts/monitor-post-rollback.ts --duration 2h

# 3. Analyze failure cause
npx ts-node scripts/analyze-upgrade-failure.ts

# 4. Update incident documentation
npx ts-node scripts/update-incident-log.ts
```

#### Root Cause Analysis
1. **Technical Analysis**: What went wrong?
2. **Process Review**: How could it be prevented?
3. **Testing Gaps**: What wasn't caught in testing?
4. **Monitoring Improvements**: Better detection needed?

## Upgrade Governance

### Approval Process

#### Technical Review
- [ ] Code review completed
- [ ] Security audit (for major changes)
- [ ] Test coverage >95%
- [ ] Performance impact assessed

#### Business Review
- [ ] Feature requirements validated
- [ ] Risk assessment completed
- [ ] Stakeholder approval obtained
- [ ] Communication plan approved

#### Final Authorization
- [ ] Technical lead sign-off
- [ ] Business lead sign-off
- [ ] Operational readiness confirmed

### Communication Protocol

#### Pre-Upgrade Communication
```bash
# Notify miners and validators
npx ts-node scripts/notify-upgrade.ts \
  --target miners,validators \
  --schedule "2024-01-15T10:00:00Z" \
  --duration "30 minutes" \
  --changes "Performance improvements"
```

#### During Upgrade
- Real-time status updates
- ETA for completion
- Any issues encountered

#### Post-Upgrade
- Successful completion notification
- New features or changes summary
- Support contact information

## Security Considerations

### Upgrade Authorization

#### Multi-Signature Setup (Future Enhancement)
```solidity
// Future: Multi-sig upgrade authorization
contract MultiSigUpgradeController {
    function authorizeUpgrade(
        address proxy,
        address newImplementation,
        bytes[] calldata signatures
    ) external {
        // Verify required signatures
        // Execute upgrade
    }
}
```

#### Current Security Measures
- Single owner authorization (EvmValidator)
- Time-lock mechanisms (future enhancement)
- Upgrade validation before execution
- Rollback capabilities

### Audit Requirements

#### When Audits Are Required
- Major functionality changes
- Storage layout modifications
- Security-sensitive updates
- External dependency changes

#### Audit Checklist
- [ ] Storage layout compatibility
- [ ] Access control verification
- [ ] Reentrancy protection
- [ ] Integer overflow protection
- [ ] External call safety

## Monitoring and Alerting

### Upgrade-Specific Monitoring

#### Key Metrics
```bash
# Set up upgrade monitoring
npx ts-node scripts/setup-upgrade-monitoring.ts

# Monitor:
# - Implementation address changes
# - Upgrade transaction status
# - Function call success rates
# - Gas usage patterns
# - Event emission patterns
```

#### Alert Configuration
```bash
# Configure alerts for upgrade events
npx ts-node scripts/configure-upgrade-alerts.ts

# Alert on:
# - Unexpected implementation changes
# - Upgrade transaction failures
# - Functionality degradation
# - Security event detection
```

## Documentation and Compliance

### Upgrade Documentation

#### Required Documentation
- [ ] Upgrade specification
- [ ] Risk assessment
- [ ] Test results
- [ ] Execution log
- [ ] Post-upgrade validation

#### Template Structure
```markdown
# Upgrade Documentation: EvmValidator v1.3.0

## Summary
- Version: 1.2.0 → 1.3.0
- Date: 2024-01-15
- Changes: Gas optimization, new bounty algorithm

## Testing
- Local tests: ✅ Passed
- Testnet validation: ✅ Passed
- Performance testing: ✅ Passed

## Execution
- Start time: 10:00 UTC
- End time: 10:15 UTC
- Downtime: None
- Issues: None

## Validation
- All functions working: ✅
- Performance improved: ✅
- Monitoring stable: ✅
```

This comprehensive upgrade guide ensures safe, reliable, and well-documented contract upgrades for the Taonado protocol.