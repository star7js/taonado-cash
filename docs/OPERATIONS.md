# Taonado Operational Procedures

This document provides operational guidance for deploying, maintaining, and monitoring Taonado protocol infrastructure.

## Emergency Procedures

### Critical Issues Response

#### Contract Vulnerability Discovered
1. **Immediate Actions** (0-1 hour)
   ```bash
   # Stop all automated operations
   killall node ts-node

   # Assess impact scope
   npx ts-node tools/emergency-assessment.ts

   # Notify stakeholders
   echo "CRITICAL: Vulnerability found in contract X" | mail -s "Taonado Alert" ops@taonado.cash
   ```

2. **Impact Assessment** (1-4 hours)
   - Identify affected contracts and functions
   - Calculate potential fund exposure
   - Determine if pause/upgrade is needed
   - Document vulnerability details

3. **Mitigation** (4-24 hours)
   - Deploy fixed contracts if possible
   - Execute upgrade procedures if contracts are upgradeable
   - Coordinate with miners/validators for migration

#### Network Connectivity Issues
```bash
# Test all network endpoints
for network in mainnet testnet local; do
  echo "Testing $network..."
  npx ts-node -e "
    const hre = require('hardhat');
    hre.changeNetwork('$network');
    hre.ethers.provider.getBlockNumber()
      .then(n => console.log('✅ Block:', n))
      .catch(e => console.log('❌ Error:', e.message));
  "
done
```

#### Fund Recovery Procedures
For users who lose access to their accounts:

**WTAO Mining Funds** (Recoverable):
```bash
# User provides proof of hotkey ownership
npx ts-node tools/verify-hotkey-ownership.ts --hotkey $HOTKEY --signature $SIGNATURE

# If verified, assist with key recovery
npx ts-node tools/fund-recovery-assistant.ts --hotkey $HOTKEY
```

**Privacy Mixer Funds** (Non-recoverable):
- No recovery possible by design
- Direct users to backup documentation
- Log attempt for analytics

## Deployment Procedures

### New Network Deployment

#### Prerequisites Checklist
- [ ] Network configuration verified
- [ ] Private keys secured and funded
- [ ] Contract compilation successful
- [ ] Test suite passes on target network
- [ ] Gas price monitoring in place

#### Deployment Steps
```bash
# 1. Environment preparation
export DEPLOYMENT_NETWORK=mainnet  # or testnet
export VERIFIER_TYPE=substrate     # or ethereum

# 2. Pre-deployment verification
pnpm build:contract:compile
pnpm test
npx ts-node tools/pre-deployment-checks.ts --network $DEPLOYMENT_NETWORK

# 3. Deploy contracts
pnpm deploy-$DEPLOYMENT_NETWORK

# 4. Post-deployment verification
npx ts-node tools/post-deployment-verification.ts --network $DEPLOYMENT_NETWORK

# 5. Update documentation
npx ts-node tools/update-deployment-docs.ts --network $DEPLOYMENT_NETWORK
```

#### Contract Verification
```bash
# Verify all deployed contracts
for contract in WTAO DepositTracker WeightsV2 EvmValidator; do
  pnpm hardhat verify --network taostats $CONTRACT_ADDRESS
done

# Generate verification report
npx ts-node tools/generate-verification-report.ts
```

### Contract Upgrades

#### EvmValidator Upgrade (UUPS Proxy)
```bash
# 1. Deploy new implementation
npx ts-node scripts/upgrade-evm-validator.ts --dry-run

# 2. Test upgrade on fork
npx ts-node scripts/test-upgrade-fork.ts

# 3. Execute upgrade
npx ts-node scripts/upgrade-evm-validator.ts --execute

# 4. Verify upgrade success
npx ts-node scripts/verify-upgrade.ts --contract EvmValidator
```

#### Non-upgradeable Contract Migration
```bash
# 1. Deploy new contract version
pnpm deploy --contract-type WeightsV3

# 2. Update EvmValidator to point to new contract
npx ts-node scripts/update-weights-contract.ts --new-address $NEW_WEIGHTS_ADDRESS

# 3. Verify migration
npx ts-node scripts/verify-migration.ts
```

## Monitoring and Alerting

### System Health Monitoring

#### Key Metrics Dashboard
```bash
# Create monitoring dashboard
npx ts-node tools/create-dashboard.ts

# Key metrics to track:
# - Active miners count
# - Total WTAO deposited
# - Weight setting frequency
# - Gas price trends
# - Contract interaction errors
```

#### Automated Health Checks
```bash
# Setup cron job for health monitoring
echo "*/5 * * * * cd /opt/taonado && npx ts-node tools/health-check.ts" | crontab -

# Health check script monitors:
# - Network connectivity
# - Contract responsiveness
# - Unusual transaction patterns
# - Gas price spikes
```

### Alerting Configuration

#### Critical Alerts
```bash
# Contract interaction failures
ALERT_WEBHOOK="https://hooks.slack.com/your-webhook"

# Monitor for failed transactions
npx ts-node tools/monitor-failed-txs.ts --webhook $ALERT_WEBHOOK

# Monitor for unusual gas usage
npx ts-node tools/monitor-gas-anomalies.ts --threshold 2000000
```

#### Performance Alerts
- Transaction success rate < 95%
- Average gas price > 50 gwei equivalent
- Weight setting interval > 120 blocks
- WTAO balance discrepancies

## Maintenance Procedures

### Regular Maintenance Tasks

#### Daily Tasks
```bash
# System health check
npx ts-node tools/daily-health-check.ts

# Gas price analysis
npx ts-node tools/gas-price-analysis.ts

# Mining performance review
npx ts-node tools/mining-performance-report.ts
```

#### Weekly Tasks
```bash
# Full system audit
npx ts-node tools/weekly-audit.ts

# Dependency updates check
npm audit
pnpm outdated

# Backup verification
npx ts-node tools/verify-backups.ts
```

#### Monthly Tasks
```bash
# Performance optimization review
npx ts-node tools/performance-review.ts

# Security audit
npx ts-node tools/security-audit.ts

# Documentation updates
npx ts-node tools/update-docs.ts
```

### Database Maintenance

#### Local Database Cleanup
```bash
# Clean old transaction records
npx ts-node tools/cleanup-db.ts --older-than 30d

# Compact database
npx ts-node tools/compact-db.ts

# Backup database
npx ts-node tools/backup-db.ts --destination /backups/taonado-$(date +%Y%m%d).db
```

## Performance Optimization

### Gas Optimization

#### Monitoring Gas Usage
```bash
# Generate gas usage report
REPORT_GAS=true pnpm test > reports/gas-usage-$(date +%Y%m%d).txt

# Analyze gas trends
npx ts-node tools/analyze-gas-trends.ts --days 30
```

#### Optimization Strategies
1. **Batch Operations**: Combine multiple calls where possible
2. **Storage Optimization**: Minimize SSTORE operations
3. **Circuit Efficiency**: Optimize zk-SNARK circuits
4. **Weight Calculation**: Cache common calculations

### Network Performance

#### Load Testing
```bash
# Simulate high transaction volume
npx ts-node tools/load-test.ts --transactions 1000 --concurrent 50

# Test weight setting under load
npx ts-node tools/test-weight-setting-load.ts
```

#### Bottleneck Analysis
```bash
# Identify performance bottlenecks
npx ts-node tools/bottleneck-analysis.ts

# Common bottlenecks:
# - RPC endpoint limits
# - Gas price estimation delays
# - Merkle tree updates
# - Proof generation time
```

## Security Procedures

### Access Control

#### Key Management
```bash
# Rotate operational keys (quarterly)
npx ts-node tools/rotate-keys.ts --env production

# Verify key security
npx ts-node tools/verify-key-security.ts

# Backup keys securely
npx ts-node tools/backup-keys.ts --encrypted
```

#### Multi-signature Setup
```bash
# For critical operations requiring multiple approvals
npx ts-node tools/setup-multisig.ts --signers 3 --threshold 2

# Execute multi-sig transaction
npx ts-node tools/execute-multisig.ts --proposal-id $PROPOSAL_ID
```

### Audit Procedures

#### Code Review Process
1. **Automated Scanning**: Run security scanners
2. **Manual Review**: Expert code review
3. **Test Coverage**: Ensure >90% test coverage
4. **Documentation**: Update security documentation

#### External Audits
```bash
# Prepare for external audit
npx ts-node tools/prepare-audit-package.ts

# Generate audit report
npx ts-node tools/generate-audit-report.ts
```

## Incident Response

### Incident Classification

#### Severity Levels
- **P0 Critical**: Funds at risk, service unavailable
- **P1 High**: Functionality impaired, minor fund risk
- **P2 Medium**: Performance degraded, no fund risk
- **P3 Low**: Minor issues, cosmetic problems

#### Response Times
- **P0**: Immediate response (< 15 minutes)
- **P1**: Urgent response (< 1 hour)
- **P2**: Standard response (< 4 hours)
- **P3**: Scheduled response (< 24 hours)

### Incident Workflow

#### Initial Response
```bash
# 1. Assess severity
npx ts-node tools/assess-incident.ts --incident-id $INCIDENT_ID

# 2. Notify stakeholders
npx ts-node tools/notify-stakeholders.ts --severity $SEVERITY

# 3. Begin mitigation
npx ts-node tools/incident-mitigation.ts --incident-id $INCIDENT_ID
```

#### Documentation
```bash
# Create incident report
npx ts-node tools/create-incident-report.ts --incident-id $INCIDENT_ID

# Post-mortem analysis
npx ts-node tools/post-mortem.ts --incident-id $INCIDENT_ID
```

## Backup and Recovery

### Backup Procedures

#### Critical Data Backup
```bash
# Daily automated backup
#!/bin/bash
BACKUP_DIR="/backups/taonado/$(date +%Y%m%d)"
mkdir -p $BACKUP_DIR

# Configuration files
cp config.ts $BACKUP_DIR/config.ts.backup

# Database snapshots
npx ts-node tools/create-db-snapshot.ts --output $BACKUP_DIR/db-snapshot.json

# Contract state backup
npx ts-node tools/backup-contract-state.ts --output $BACKUP_DIR/contract-state.json
```

#### Backup Verification
```bash
# Test backup integrity
npx ts-node tools/verify-backup.ts --backup-path $BACKUP_DIR

# Test restore procedure
npx ts-node tools/test-restore.ts --backup-path $BACKUP_DIR --dry-run
```

### Disaster Recovery

#### Recovery Procedures
```bash
# Complete system recovery
npx ts-node tools/disaster-recovery.ts --backup-date $BACKUP_DATE

# Partial recovery (specific components)
npx ts-node tools/partial-recovery.ts --component database --backup-date $BACKUP_DATE
```

#### Recovery Testing
```bash
# Quarterly recovery drill
npx ts-node tools/recovery-drill.ts --scenario complete-failure

# Document recovery time objectives (RTO)
# Target RTO: 4 hours for complete system recovery
# Target RPO: 1 hour maximum data loss
```

## Compliance and Reporting

### Regulatory Compliance

#### Transaction Monitoring
```bash
# Monitor for suspicious patterns
npx ts-node tools/compliance-monitoring.ts

# Generate compliance reports
npx ts-node tools/generate-compliance-report.ts --period monthly
```

#### Data Retention
```bash
# Implement data retention policies
npx ts-node tools/apply-retention-policy.ts --policy 7years

# Secure data deletion
npx ts-node tools/secure-delete.ts --data-type logs --older-than 1year
```

### Operational Reporting

#### Performance Reports
```bash
# Monthly operational report
npx ts-node tools/generate-ops-report.ts --month $(date +%Y-%m)

# Include metrics:
# - Uptime percentage
# - Transaction volume
# - Gas cost optimization
# - Incident summary
```

This operational guide ensures reliable, secure, and efficient operation of the Taonado protocol infrastructure.