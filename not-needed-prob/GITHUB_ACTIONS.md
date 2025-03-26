# GitHub Actions for Vox Plugin

This document explains how the GitHub Actions workflow is set up to automate the build process for the Vox Obsidian plugin.

## Build Workflow

The workflow file `.github/workflows/build.yml` automates the following:

1. **Triggered by**:
   - Pushes to the `main` branch (excluding changes to markdown files and GitHub workflow files)
   - Pull requests to the `main` branch
   - Manual triggers via the GitHub Actions interface

2. **Build Job**:
   - Sets up Node.js environment
   - Installs dependencies using `npm ci`
   - Runs the build process using `npm run build`
   - Uploads the built files (`main.js`, `manifest.json`, and `styles.css`) as artifacts

3. **Release Job** (only runs when a tag is pushed):
   - Downloads the build artifacts
   - Creates a GitHub release with the built files

## How to Use

### For Regular Development

1. Make changes to your code
2. Push to the `main` branch
3. GitHub Actions will automatically build your plugin
4. You can download the built files from the Actions tab if needed

### To Create a Release

1. Update the version number in `package.json`
2. Run `npm run version` to update the version in manifest.json and versions.json
3. Commit these changes: `git commit -am "Bump version to x.y.z"`
4. Create a tag: `git tag -a x.y.z -m "Version x.y.z"`
5. Push both the commit and the tag:
   ```
   git push
   git push --tags
   ```
6. GitHub Actions will automatically:
   - Build the plugin
   - Create a GitHub release with the built files

## Checking Build Status

You can check the status of your builds in the "Actions" tab of your GitHub repository.

## Manually Triggering a Build

If you want to manually trigger a build:

1. Go to the "Actions" tab in your GitHub repository
2. Select the "Build Obsidian Plugin" workflow
3. Click "Run workflow"
4. Select the branch you want to build from
5. Click "Run workflow"

## Understanding the Build Process

The build process uses ESBuild to bundle your TypeScript files into a single JavaScript file (`main.js`), which is the deployable file for Obsidian plugins. The configuration for this is in `esbuild.config.mjs`.

The build process:
1. Runs TypeScript type checking without emitting files (`tsc -noEmit -skipLibCheck`)
2. Uses ESBuild to bundle the code into `main.js`

This creates a single file that contains all your code and dependencies, ready to be used by Obsidian.