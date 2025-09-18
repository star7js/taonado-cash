#!/usr/bin/env ts-node

import { ethers } from "hardhat";
import { getTAOBalance } from "../scripts/balance";
import { convertH160ToSS58 } from "../scripts/address-utils";
import { config } from "../config";

/**
 * Balance Checker - Verify TAO balance in EVM wallet
 * Safe for GitHub - uses config.ts which is gitignored
 */

async function main() {
  console.log("🌪️ Checking Your TAO Balance 🌀");
  console.log("=================================\n");

  try {
    const evmWallet = new ethers.Wallet(config.ethPrivateKey, ethers.provider);
    const ss58Mirror = convertH160ToSS58(evmWallet.address);

    console.log(`EVM Address: ${evmWallet.address}`);
    console.log(`SS58 Mirror: ${ss58Mirror}\n`);

    const balance = await getTAOBalance(evmWallet.address);
    const balanceInTAO = ethers.formatEther(balance);

    console.log(`💰 Your TAO Balance: ${balanceInTAO} TAO`);

    if (parseFloat(balanceInTAO) > 0) {
      console.log("✅ Great! You have TAO available.");
      console.log(`   Environment: ${config.env}`);

      if (parseFloat(balanceInTAO) >= 1.0) {
        console.log("   You can run: pnpm miner (standard mining)");
      } else if (parseFloat(balanceInTAO) >= 0.1) {
        console.log("   You can run: npx ts-node utils/test-miner.ts (custom small amount)");
      } else {
        console.log("   Balance too low - need at least 0.1 TAO for testing");
      }
    } else {
      console.log("❌ No TAO found. Please send TAO to your SS58 mirror address:");
      console.log(`   ${ss58Mirror}`);
      console.log("\n💡 Use: npx ts-node utils/address-helper.ts for transfer instructions");
    }

  } catch (error) {
    console.error("❌ Error checking balance:", error);
    console.log("\n💡 Make sure you have:");
    console.log("   • Copied config-example.ts to config.ts");
    console.log("   • Set your ethPrivateKey and subSeed in config.ts");
    console.log("   • Connected to the correct network");
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { main as checkBalance };