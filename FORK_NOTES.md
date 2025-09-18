# Fork Information and Maintenance

## About This Fork

This is a **community utilities fork** of the original [Taonado project](https://github.com/taonado/taonado-cash), created to provide user-friendly tools and documentation for safe testing and mining operations.

### Why This Fork Exists

**Problem Solved**: The original Taonado project is excellent for privacy mixing and core functionality, but new users often struggle with:
- Testing with small amounts before committing significant funds
- Understanding the difference between mining deposits and privacy deposits
- Setting up mining operations safely
- Managing address conversions between EVM and Bittensor formats

**Solution Provided**: This fork adds a `utils/` directory with generalized scripts that make Taonado more accessible to new users while maintaining all the original functionality.

## What's Different From Upstream

### Additions in This Fork

1. **`utils/` Directory** - User-friendly utilities:
   - `address-helper.ts` - Display EVM and SS58 addresses
   - `balance-checker.ts` - Check TAO balances
   - `local-transfer.py` - Transfer TAO from local wallet to EVM
   - `test-miner.ts` - Setup mining with custom amounts
   - `mining-status.ts` - Monitor mining operations

2. **Enhanced Documentation**:
   - `utils/README.md` - Complete workflow guide
   - `docs/DEPOSIT_SECRETS.md` - Explains mining vs privacy deposits
   - `DEVELOPMENT_GUIDE.md` - Developer reference (renamed from CLAUDE.md)

3. **Safety Improvements**:
   - Enhanced `.gitignore` to protect personal files
   - Scripts use config.ts instead of hardcoded addresses
   - Clear separation of test scripts from production code

### Original Project Unchanged

- All core Taonado functionality remains identical
- Smart contracts are unchanged
- Original scripts (`pnpm miner`, `pnpm cli`, etc.) work exactly the same
- Privacy mixing features are unchanged

## Maintaining This Fork

### Syncing with Upstream

To keep this fork updated with the original project:

```bash
# Add upstream remote (one time setup)
git remote add upstream https://github.com/taonado/taonado-cash.git

# Sync with upstream
git fetch upstream
git checkout main
git merge upstream/main

# Update your utilities branch
git checkout test-mining-scripts
git rebase main
```

### Handling Conflicts

If upstream changes conflict with our utilities:
1. **Core files**: Prefer upstream changes (they know the protocol best)
2. **Utils directory**: Keep our changes (they're additive)
3. **Documentation**: Merge carefully, preserving our community focus

### Contributing Back

Consider contributing useful utilities back to upstream:
- Propose utilities that would benefit all users
- Follow their contribution guidelines
- Keep utilities general and well-documented

## Version Management

### Tracking Upstream
- **Upstream version**: Track in commit messages or tags
- **Our additions**: Clearly marked in commit messages
- **Breaking changes**: Document any changes that affect our utilities

### Release Strategy
- Tag releases that work well together
- Document which upstream version each release is based on
- Provide migration guides for breaking changes

## Community Guidelines

### Issues and Support
- **Core Taonado issues**: Direct users to upstream repository
- **Utilities issues**: Handle in this fork
- **Feature requests**: Consider if they belong upstream or here

### Contribution
- Utilities should be safe and well-documented
- No hardcoded addresses or private keys
- Follow the security patterns established in existing utils
- Test with small amounts before documenting workflows

### Code Quality
- Use TypeScript for consistency
- Follow existing code style
- Add comprehensive error handling
- Include usage examples in documentation

## Security Considerations

### What's Safe to Share
- ✅ All utility scripts (no hardcoded addresses)
- ✅ Documentation and guides
- ✅ Example configurations (config-example.ts)

### What Must Stay Private
- ❌ config.ts (contains private keys)
- ❌ Personal test scripts with actual addresses
- ❌ Any files with real transaction data

### User Safety
- Scripts require explicit confirmation for operations
- Clear warnings about risks and amounts
- Comprehensive documentation about mining vs privacy deposits
- Encourage testing with small amounts

## Future Plans

### Potential Enhancements
- GUI wrapper for common operations
- Better monitoring and alerting
- Integration with popular wallets
- Automated testing scripts

### Upstream Integration
- Monitor upstream for adoption of similar utilities
- Offer to contribute mature utilities back
- Coordinate to avoid duplication of effort

## Contact and Community

### Getting Help
- Check documentation first (`utils/README.md`, `docs/`)
- Search existing issues
- Create issue with clear reproduction steps

### Contributing
- Fork this repository
- Create feature branch
- Add utilities following existing patterns
- Submit pull request with documentation

This fork aims to make Taonado more accessible while maintaining the excellent security and privacy features of the original project.