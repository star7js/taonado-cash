import { ethers } from "hardhat";
import { config } from "../config";
import { getTAOBalance, getWTAOBalance } from "./balance";
import { convertH160ToSS58 } from "./address-utils";

async function main() {
  // Get the wallet with provider
  const wallet = new ethers.Wallet(config.ethPrivateKey, ethers.provider);
  console.log("EVM Wallet:", wallet.address);

  const ss58_address = convertH160ToSS58(wallet.address);
  console.log("ss58 equivalent:", ss58_address);

  const tao_balance = await getTAOBalance(wallet.address);
  console.log("TAO Balance (raw):", tao_balance);
  console.log("TAO Balance:", ethers.formatEther(tao_balance), "TAO");

  const wtao_balance = await getWTAOBalance(wallet);
  if (wtao_balance) {
    console.log("WTAO Balance (raw):", wtao_balance);
    console.log("WTAO Balance:", ethers.formatUnits(wtao_balance, 18), "WTAO");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
