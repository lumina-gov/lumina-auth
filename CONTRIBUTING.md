

## Internal Contribution Notes

### Publishing a new version

1. Run `pnpm build` to ensure that the packages are built
1. Run `pnpm changeset` to create a new changeset
2. Run `pnpm changeset version` to create a new version
3. Run `pnpm changeset publish` to publish the new version