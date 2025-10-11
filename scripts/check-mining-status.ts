import { ethers } from "hardhat";
import { Keyring } from "@polkadot/keyring";
import { cryptoWaitReady } from "@polkadot/util-crypto";
import { config } from "../config";
import { Contracts } from "./contracts";
import { getDeployedContract } from "./store";
import {
  DepositTracker,
  DepositTracker__factory,
} from "../typechain-types";

async function main() {
  await cryptoWaitReady();

  const ss58hotkey = new Keyring({ type: "sr25519" }).addFromUri(
    config.subSeed
  );

  const evm_wallet = new ethers.Wallet(config.ethPrivateKey, ethers.provider);

  console.log("=== MINING STATUS CHECK ===\n");
  console.log("EVM Address:", evm_wallet.address);
  console.log("SS58 Hotkey:", ss58hotkey.address);

  // Get DepositTracker contract
  const depositTrackerDeployed = await getDeployedContract<DepositTracker>(
    Contracts.DEPOSIT_TRACKER
  );
  const depositTracker = DepositTracker__factory.connect(
    depositTrackerDeployed.target.toString(),
    evm_wallet
  );

  console.log("\nDepositTracker Contract:", depositTrackerDeployed.target.toString());

  // Check if EVM address is registered
  try {
    const isRegistered = await depositTracker.uniqueDepositors(
      evm_wallet.address
    );
    console.log("\n✓ EVM Address Registered:", isRegistered);

    if (isRegistered) {
      // Check if associated with current hotkey
      const isAssociated = await depositTracker.associationSet(
        ss58hotkey.publicKey,
        evm_wallet.address
      );
      console.log("✓ Associated with Current Hotkey:", isAssociated);

      if (isAssociated) {
        // Check total deposits for this hotkey
        const hotkeyDeposit = await depositTracker.hotkeys(
          ss58hotkey.publicKey
        );
        console.log(
          "\n✓ Total WTAO Deposits for this Hotkey:",
          ethers.formatUnits(hotkeyDeposit, 9),
          "WTAO"
        );
        console.log(
          "\n🎉 You are properly registered and should be earning emissions!"
        );
        console.log(
          "   Emissions accumulate in your native TAO balance over time."
        );
      } else {
        console.log(
          "\n❌ Your EVM address is registered but NOT associated with this hotkey!"
        );
        console.log(
          "   This means you deposited but did not complete the association step."
        );
        console.log("   Run: pnpm miner");
      }
    } else {
      console.log(
        "\n❌ Your EVM address is NOT registered in DepositTracker!"
      );
      console.log(
        "   This means you have not completed the miner registration process."
      );
      console.log(
        "   You have WTAO deposited, but you're NOT earning emissions yet."
      );
      console.log("\n📋 To start earning emissions:");
      console.log("   1. Run: pnpm miner");
      console.log(
        "   2. This will associate your EVM address with your SS58 hotkey"
      );
      console.log("   3. After association, emissions will start accumulating");
    }
  } catch (error: any) {
    console.log("\n❌ Error checking registration status:");
    console.log(error.message);
  }

  // Always show WTAO balance
  const wtaoDeployed = await getDeployedContract(Contracts.WTAO);
  const wtao = await ethers.getContractAt(
    "WTAO",
    wtaoDeployed.target.toString(),
    evm_wallet
  );
  const wtaoBalance = await wtao.balanceOf(evm_wallet.address);
  console.log(
    "\n💰 Current WTAO Balance:",
    ethers.formatUnits(wtaoBalance, 9),
    "WTAO"
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
