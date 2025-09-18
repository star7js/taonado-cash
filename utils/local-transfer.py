#!/usr/bin/env python3

import bittensor as bt
import sys
import os

"""
Local TAO Transfer - Transfer TAO from local Bittensor wallet to EVM mirror
Safe for GitHub - requires wallet name as parameter

This script transfers TAO from your local Bittensor wallet to your EVM wallet's
SS58 mirror address, enabling you to use TAO for mining operations.

Usage: python3 utils/local-transfer.py <wallet_name> <evm_mirror_address> [amount]
"""

def main():
    if len(sys.argv) < 3:
        print("🌪️ Local TAO Transfer Helper 🌀")
        print("=" * 40)
        print("\nUsage: python3 utils/local-transfer.py <wallet_name> <evm_mirror_address> [amount]")
        print("\nExample:")
        print("  python3 utils/local-transfer.py your_wallet 5ABC...xyz123 0.5")
        print("\nGet your EVM mirror address with:")
        print("  npx ts-node utils/address-helper.ts")
        return

    wallet_name = sys.argv[1]
    evm_mirror_address = sys.argv[2]

    # Optional amount parameter
    if len(sys.argv) > 3:
        try:
            specified_amount = float(sys.argv[3])
        except ValueError:
            print("❌ Invalid amount. Please provide a number.")
            return
    else:
        specified_amount = None

    print("🌪️ Local TAO Transfer Helper 🌀")
    print("=" * 40)
    print(f"\nWallet: {wallet_name}")
    print(f"Target EVM Mirror: {evm_mirror_address}")

    try:
        # Create wallet and subtensor instances
        wallet = bt.wallet(name=wallet_name)
        subtensor = bt.subtensor(network="finney")  # mainnet

        print(f"From address: {wallet.coldkey.ss58_address}")

        # Check current balance
        balance = subtensor.get_balance(wallet.coldkey.ss58_address)
        print(f"Current balance: {balance.tao:.4f} TAO")

        if balance.tao < 0.1:
            print("❌ Insufficient TAO balance. Need at least 0.1 TAO to proceed.")
            return

        # Determine transfer amount
        if specified_amount:
            if specified_amount > balance.tao:
                print(f"❌ Insufficient balance. You have {balance.tao:.4f} TAO")
                return
            amount = specified_amount
        else:
            # Use most of balance, leaving small amount for potential fees
            amount = max(0.1, balance.tao - 0.01)

        print(f"\n📤 Transferring {amount:.4f} TAO...")
        print("⚠️  This action will transfer TAO to your EVM wallet for mining")

        # For safety, require confirmation unless AUTO_CONFIRM is set
        if os.getenv('AUTO_CONFIRM') != 'true':
            confirm = input("\nProceed with transfer? (y/N): ").lower().strip()
            if confirm != 'y':
                print("Transfer cancelled.")
                return

        # Execute the transfer
        success = subtensor.transfer(
            wallet=wallet,
            dest=evm_mirror_address,
            amount=bt.Balance.from_tao(amount),
            wait_for_inclusion=True,
            wait_for_finalization=True
        )

        if success:
            print("✅ Transfer successful!")
            print("\n🎯 Next steps:")
            print("1. Wait 1-2 minutes for confirmation")
            print("2. Run: npx ts-node utils/balance-checker.ts")
            print("3. If balance shows up, run: npx ts-node utils/test-miner.ts")
        else:
            print("❌ Transfer failed!")

    except Exception as e:
        print(f"❌ Error: {e}")
        print("\n💡 Troubleshooting:")
        print(f"   • Make sure wallet '{wallet_name}' exists")
        print("   • Verify you have sufficient TAO balance")
        print("   • Check network connectivity")
        print("   • Ensure the EVM mirror address is correct")

if __name__ == "__main__":
    main()