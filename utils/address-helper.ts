#!/usr/bin/env ts-node

import { ethers } from "ethers";
import { convertH160ToSS58 } from "../scripts/address-utils";
import { config } from "../config";

/**
 * Address Helper - Display EVM and SS58 addresses for Taonado operations
 * Safe for GitHub - uses config.ts which is gitignored
 */

async function main() {
  console.log("🌪️ Taonado Address Helper 🌀");
  console.log("=====================================\n");

  try {
    // Get your EVM wallet from config
    const evmWallet = new ethers.Wallet(config.ethPrivateKey);

    // Convert to SS58 mirror address
    const ss58Mirror = convertH160ToSS58(evmWallet.address);

    console.log("Your Addresses:");
    console.log("---------------");
    console.log(`🔑 EVM Wallet Address:  ${evmWallet.address}`);
    console.log(`🏠 SS58 Mirror Address: ${ss58Mirror}`);
    console.log("");
    console.log("💡 How to Add TAO:");
    console.log("------------------");
    console.log("1. Copy the SS58 Mirror Address above");
    console.log("2. Send TAO to that address using:");
    console.log("   - btcli wallet transfer");
    console.log("   - Polkadot.js wallet");
    console.log("   - NOVA wallet");
    console.log("   - Any Bittensor wallet that supports transfers");
    console.log("");
    console.log("3. Once TAO arrives at the SS58 address,");
    console.log("   it will be available to your EVM wallet!");
    console.log("");
    console.log("⚠️  IMPORTANT: Make sure you're sending to the correct network!");
    console.log(`   Current environment: ${config.env}`);
    console.log(`   Network ID: ${config.netuid}`);
    console.log("");
    console.log("📋 Next Steps:");
    console.log("   • Send TAO to the SS58 Mirror Address");
    console.log("   • Run: npx ts-node utils/balance-checker.ts");
    console.log("   • If balance shows up, run mining scripts");

  } catch (error) {
    console.error("❌ Error:", error);
    console.log("\n💡 Make sure you have:");
    console.log("   • Copied config-example.ts to config.ts");
    console.log("   • Set your ethPrivateKey and subSeed in config.ts");
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { main as showAddresses };