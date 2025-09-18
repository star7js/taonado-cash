#!/usr/bin/env ts-node

import { ethers } from "hardhat";
import { Keyring } from "@polkadot/keyring";
import { cryptoWaitReady } from "@polkadot/util-crypto";
import { ss58ToH160, publicKeyToHex, convertH160ToSS58 } from "../scripts/address-utils";
import { config } from "../config";
import { deposit } from "../scripts/deposit";
import { getTAOBalance } from "../scripts/balance";
import { Contracts } from "../scripts/contracts";
import { getDeployedContract } from "../scripts/store";
import {
  DepositTracker,
  DepositTracker__factory,
} from "../typechain-types";

/**
 * Test Miner - Set up mining with small amounts for testing
 * Safe for GitHub - uses config.ts which is gitignored
 *
 * This script:
 * 1. Checks your available TAO balance
 * 2. Deposits most of it (leaving some for gas)
 * 3. Associates your EVM wallet with your Bittensor hotkey
 * 4. Sets you up to earn mining emissions on Subnet 113
 */

async function main() {
  await cryptoWaitReady();

  console.log("🌪️ Taonado Test Mining Setup 🌀");
  console.log("==================================\n");

  try {
    const ss58hotkey = new Keyring({ type: "sr25519" }).addFromUri(config.subSeed);
    const evm_wallet = new ethers.Wallet(config.ethPrivateKey, ethers.provider);
    const evm_mirror_ss58 = convertH160ToSS58(evm_wallet.address);

    console.log("📋 Wallet Information:");
    console.log(`   Bittensor Hotkey:   ${ss58hotkey.address}`);
    console.log(`   EVM Wallet:         ${evm_wallet.address}`);
    console.log(`   SS58 Mirror:        ${evm_mirror_ss58}`);

    // Check current balance
    const currentBalance = await getTAOBalance(evm_wallet.address);
    const balanceInTAO = parseFloat(ethers.formatUnits(currentBalance));
    console.log(`   Current Balance:    ${balanceInTAO.toFixed(6)} TAO\n`);

    if (balanceInTAO < 0.1) {
      console.log("❌ Insufficient balance for test mining");
      console.log("   Need at least 0.1 TAO to proceed");
      console.log(`   Please send TAO to: ${evm_mirror_ss58}`);
      return;
    }

    // Calculate deposit amount (leave some for gas)
    const gasReserve = Math.min(0.05, balanceInTAO * 0.1); // Reserve 5% or 0.05 TAO for gas
    const availableForDeposit = balanceInTAO - gasReserve;

    if (availableForDeposit <= 0) {
      console.log("❌ Balance too low after reserving gas fees");
      return;
    }

    const amountToDeposit = ethers.parseEther(availableForDeposit.toString());

    console.log("💰 Deposit Plan:");
    console.log(`   Amount to deposit:  ${availableForDeposit.toFixed(6)} TAO`);
    console.log(`   Reserved for gas:   ${gasReserve.toFixed(6)} TAO`);
    console.log(`   Environment:        ${config.env}`);
    console.log(`   Subnet:             113 (Taonado)\n`);

    // Confirm before proceeding
    console.log("⚠️  This will:");
    console.log("   • Deposit your TAO into the WTAO contract");
    console.log("   • Associate your EVM wallet with your Bittensor hotkey");
    console.log("   • Start earning mining emissions on Subnet 113");
    console.log("   • You can withdraw anytime using the withdraw scripts\n");

    // For safety in automated runs, require manual confirmation
    if (process.env.AUTO_CONFIRM !== "true") {
      console.log("💡 To proceed automatically, set AUTO_CONFIRM=true environment variable");
      console.log("   Or run the individual steps manually");
      return;
    }

    console.log("🚀 Proceeding with test mining setup...\n");

    // Make the deposit
    console.log("📤 Step 1: Depositing TAO into WTAO contract...");
    await deposit(evm_wallet, amountToDeposit);
    console.log("✅ Deposit successful!\n");

    // Set up association
    console.log("🔗 Step 2: Associating EVM wallet with Bittensor hotkey...");
    const depositTracker = await getDeployedContract<DepositTracker>(Contracts.DEPOSIT_TRACKER);
    const contract = DepositTracker__factory.connect(
      depositTracker.target.toString(),
      evm_wallet
    );

    const associationExists = await contract.uniqueDepositors(evm_wallet.address);
    if (associationExists) {
      const association = await contract.associationSet(
        ss58hotkey.publicKey,
        evm_wallet.address
      );
      if (association) {
        console.log("✅ EVM wallet already correctly associated");
      } else {
        console.log("ℹ️  EVM wallet is associated with a different hotkey");
      }
    } else {
      const tx = await contract.associate(ss58hotkey.publicKey);
      await tx.wait();
      console.log("✅ Successfully associated EVM wallet with hotkey");
    }

    console.log("\n🎉 Test mining setup complete!");
    console.log("\n📊 What happens next:");
    console.log("   • Your TAO is now deposited and earning potential rewards");
    console.log("   • Rewards are distributed based on subnet emissions");
    console.log("   • You can monitor progress with: npx ts-node utils/mining-status.ts");
    console.log("   • You can withdraw anytime with: pnpm withdraw");

    console.log("\n⚠️  Remember:");
    console.log("   • This is a test amount for learning the system");
    console.log("   • Monitor daily for emission rewards");
    console.log("   • Consider adding more TAO if test is successful");
    console.log("   • Mining is competitive - rewards not guaranteed");

  } catch (error) {
    console.error("❌ Error during test mining setup:", error);
    console.log("\n💡 Troubleshooting:");
    console.log("   • Check your config.ts setup");
    console.log("   • Ensure you have sufficient TAO balance");
    console.log("   • Verify network connectivity");
    console.log("   • Make sure you're on the correct network");
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { main as setupTestMining };