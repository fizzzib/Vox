# Vox

Vox is an Obsidian plugin that enhances your note-taking with voice transcription and AI capabilities. Record your voice, transcribe it, and apply custom AI prompts to the transcription.

## Features

- **Voice Recording**: A mic icon will appear in your note, which you can press to record.
- **Transcription**: Automatically transcribes your voice recordings using the [OpenAI Whisper API](https://openai.com/index/whisper/) along with Groq.
- **Custom Prompts**: Apply custom prompts to the transcription to summarize, extract to-dos, or other actions.
- **Audio Playback**: Embeds the audio file in your note for easy access.
- **Embedded Output**: Transcriptions and AI-generated outputs are embedded in your notes as callouts wherever your cursor is.

## Installation

1. Download the Vox plugin from Community Plugins.
2. Enable the plugin from the Obsidian settings by toggling it on.
3. Input your OpenAI and/or Groq API Key (instructions below).
4. Choose a folder to save the Recordings.
5. Turn on the Floating Button Mic (optional), or otherwise use the toolbar icon or command pallette to start a recording.

## API Key Setup

If you need to obtain an OpenAI API key, follow the steps below:

### Steps to Get an API Key

1. **Create an Account**:
    - Visit the [OpenAI website](https://platform.openai.com) and sign up for an account.
    - Or visit the [Groq website](https://console.groq.com/) to get an account there.

2. **Access API Keys**:
    - Log in to your account.
    - **OpenAI**: Click on the ⚙️ in the top right corner and select "API Keys" from the dropdown menu.
    - **Groq**: Click "API Keys" on the left sidebar.

3. **Create a New Key**:
    - On the API Keys page, click "Create new secret key."

4. **Secure Your API Key**:
    - Copy the newly generated API key into the `🔑 Api Keys` accordion in the Vox Settings. Treat this key like a password and do not share it with anyone.

5. **Billing Information**:
    - You need to add billing information to your OpenAI account to make API calls.
    - Groq is currently free.

## Development

### Prerequisites

- Node.js (version 16 or higher)
- npm

### Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development build: `npm run dev`
   - This will start ESBuild in watch mode, automatically rebuilding when files change

### Building the Plugin

To build the plugin manually:

```bash
npm run build
```

This will create the following files in the root directory:
- `main.js` - The bundled JavaScript file
- `manifest.json` - The plugin manifest
- `styles.css` - The plugin styles

### Automated Builds with GitHub Actions

This plugin uses GitHub Actions to automate the build process. See [GITHUB_ACTIONS.md](GITHUB_ACTIONS.md) for details on how the automated build and release process works.

## Contribution

Contributions are welcome! Please fork the repository, make your changes, and open a pull request.

## Support

For support or to report issues, use the GitHub Issues page for this repository.

## Acknowledgments

Special thanks to:
- **James Griffing** (GitHub: [Forgetabyteit](https://github.com/Forgetabyteit))
- **David Youngblood** (GitHub: [LouminAI](https://github.com/thedavidyoungblood))
