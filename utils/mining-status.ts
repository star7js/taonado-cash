#!/usr/bin/env ts-node

import { ethers } from "hardhat";
import { Keyring } from "@polkadot/keyring";
import { cryptoWaitReady } from "@polkadot/util-crypto";
import { config } from "../config";
import { getTAOBalance, getWTAOBalance } from "../scripts/balance";
import { getDeployedContract } from "../scripts/store";
import { Contracts } from "../scripts/contracts";
import { DepositTracker__factory } from "../typechain-types";

/**
 * Mining Status Checker - Monitor your Taonado mining operation
 * Safe for GitHub - uses config.ts which is gitignored
 */

async function main() {
  await cryptoWaitReady();

  console.log("🌪️ Taonado Mining Status Check 🌀");
  console.log("========================================\n");

  try {
    const evm_wallet = new ethers.Wallet(config.ethPrivateKey, ethers.provider);
    const ss58hotkey = new Keyring({ type: "sr25519" }).addFromUri(config.subSeed);

    console.log("📋 Wallet Information:");
    console.log(`   EVM Wallet: ${evm_wallet.address}`);
    console.log(`   Hotkey:     ${ss58hotkey.address}`);
    console.log(`   Environment: ${config.env}`);
    console.log(`   Subnet:     113 (Taonado)\n`);

    // Check balances
    console.log("💰 Balance Summary:");
    const taoBalance = await getTAOBalance(evm_wallet.address);
    const wtaoBalance = await getWTAOBalance(evm_wallet);

    console.log(`   TAO (available):  ${ethers.formatEther(taoBalance)} TAO`);
    console.log(`   WTAO (deposited): ${ethers.formatEther(wtaoBalance || 0)} WTAO\n`);

    // Check association
    console.log("🔗 Association Status:");
    const depositTracker = await getDeployedContract(Contracts.DEPOSIT_TRACKER);
    const contract = DepositTracker__factory.connect(
      depositTracker.target.toString(),
      evm_wallet
    );

    const isAssociated = await contract.associationSet(
      ss58hotkey.publicKey,
      evm_wallet.address
    );

    console.log(`   EVM ↔ Hotkey: ${isAssociated ? "✅ Linked" : "❌ Not linked"}\n`);

    // Mining status
    const wtaoAmount = parseFloat(ethers.formatEther(wtaoBalance || 0));

    if (isAssociated && wtaoAmount > 0) {
      console.log("🎯 Mining Status: ACTIVE");
      console.log(`   • Deposited amount: ${wtaoAmount.toFixed(6)} WTAO`);
      console.log("   • Earning proportional share of SN113 emissions");
      console.log("   • Competing with other miners for rewards");
      console.log("   • Can withdraw anytime\n");
    } else if (!isAssociated) {
      console.log("❌ Mining Status: INACTIVE - Not Associated");
      console.log("   • Need to associate EVM wallet with hotkey");
      console.log("   • Run: npx ts-node utils/test-miner.ts\n");
    } else {
      console.log("❌ Mining Status: INACTIVE - No Deposits");
      console.log("   • Need to deposit WTAO to start mining");
      console.log("   • Run: npx ts-node utils/test-miner.ts\n");
    }

    // Next steps
    console.log("📊 Monitoring Recommendations:");
    console.log("   • Run this script daily to check for rewards");
    console.log("   • Check subnet performance: https://taostats.io/subnets");
    console.log("   • Monitor for emission changes");
    console.log("   • Consider scaling up if profitable\n");

    console.log("🛠️  Available Commands:");
    console.log("   • Check status:    npx ts-node utils/mining-status.ts");
    console.log("   • Check balance:   npx ts-node utils/balance-checker.ts");
    console.log("   • Withdraw funds:  pnpm withdraw");
    console.log("   • Add more funds:  pnpm deposit (1 TAO default)");

    // Calculate rough mining info
    if (wtaoAmount > 0) {
      console.log("\n📈 Mining Economics (Estimates):");
      console.log("   • Daily SN113 emissions depend on subnet ranking");
      console.log("   • Your share = (your_deposit / total_deposits) × daily_emissions");
      console.log("   • Competition: ~192 miner slots maximum");
      console.log("   • Bottom performers get de-registered");
      console.log("   • Monitor taostats.io for actual performance data");
    }

  } catch (error) {
    console.error("❌ Error checking mining status:", error);
    console.log("\n💡 Troubleshooting:");
    console.log("   • Verify config.ts is properly set up");
    console.log("   • Check network connectivity");
    console.log("   • Ensure you're on the correct network");
    console.log("   • Make sure contracts are deployed");
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { main as checkMiningStatus };