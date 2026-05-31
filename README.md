<div id="top" align="center">
    <br>
    <a href="https://github.com/CamelliaV/Background#readme">
        <img alt="logo" width="100" height="100" src="https://raw.githubusercontent.com/CamelliaV/Background/main/assets/icon.png">
    </a>
    <h3>Background Local</h3>
    <h4>A CamelliaV fork of the Background image extension for VSCode</h4>
    <h5>Windows + Mac + Linux</h5>
</div>

<br>

Add multiple background images for the window, editors, sidebars, or the panel. Load backgrounds from file, [glob](https://github.com/isaacs/node-glob#glob-primer), or URL. Transition between multiple background images.

This fork keeps the original `background.*` settings keys, but ships as the separate extension id `camelliav.code-background` with the command namespace `camelliaBackground.*`. It also adds commands for copying the currently displayed background URI and moving the active background slot to the next or previous image.

<div align="center">
    <img alt="editor background" src="https://raw.githubusercontent.com/CamelliaV/Background/main/assets/editor.gif">
</div>

## Installation

This fork is installed from a local VSIX package instead of the Visual Studio Marketplace.

1. Disable or uninstall the original Marketplace extension `katsute.code-background` before testing this fork. The fork has a separate extension id, but both extensions patch the VS Code workbench.
2. Build the VSIX:

   ```sh
   npm install
   npm run package
   ```

3. Install the generated package:

   ```sh
   code --install-extension code-background-5.0.1.vsix
   ```

   You can also use **Extensions: Install from VSIX...** in VS Code and select the generated `code-background-5.0.1.vsix` file.

4. Reload VS Code when prompted, then run <kbd>Background Local: Install</kbd>.

Customize using the <kbd>Background Local: Configuration</kbd> command or press the **Background Local** button in the bottom right to access the configuration menu.

Install using the <kbd>Background Local: Install</kbd> command or press the **Install** button in the configuration menu to install the background.

## Features

#### Multiple Backgrounds

Add background images for the whole window, editors, sidebars, or the panel. Transition between multiple background images.

<div align="center">
    <h6>Full Window</h6>
    <img src="https://raw.githubusercontent.com/CamelliaV/Background/main/assets/window.gif">
</div>
<br>
<div align="center">
    <h6>Editor, Sidebar, and Terminal</h6>
    <img src="https://raw.githubusercontent.com/CamelliaV/Background/main/assets/editor.gif">
</div>
<br>
<div align="center">
    <h6>Slideshow</h6>
    <img src="https://raw.githubusercontent.com/CamelliaV/Background/main/assets/transition.gif">
</div>

#### Configuration Menu

Use the <kbd>Background Local: Configuration</kbd> command or press the **Background Local** button in the bottom right to access the configuration menu.

<div align="center">
    <img src="https://raw.githubusercontent.com/CamelliaV/Background/main/assets/configuration.gif">
</div>

#### Glob, URL, and Environment Variable Support

Add background images by file, folder, or URL. Supports [glob](https://github.com/isaacs/node-glob#glob-primer) and [environment variables](#environment-variables).

<div align="center">
    <img src="https://raw.githubusercontent.com/CamelliaV/Background/main/assets/glob.gif">
</div>

#### Local Fork Commands

Copy the currently displayed background URI with <kbd>Background Local: Copy Current Background URI</kbd>. Local VS Code resource URIs are copied as directly openable `file:///...` URIs, while HTTPS backgrounds are copied unchanged.

Use <kbd>Background Local: Next Background</kbd> and <kbd>Background Local: Previous Background</kbd> to move the selected active background slot through its resolved image list without changing your settings.

<div align="right"><a href="#top"><code>▲</code></a></div>

## Commands

| Command | Description |
|:--|:--|
|<kbd>Background Local: Install</kbd>|Installs and enables the background|
|<kbd>Background Local: Uninstall</kbd>|Uninstalls and disables the background|
|<kbd>Background Local: Reload</kbd>|Randomizes the current background|
|<kbd>Background Local: Copy Current Background URI</kbd>|Copies the currently displayed background URI to the clipboard|
|<kbd>Background Local: Next Background</kbd>|Switches the selected active background slot to the next resolved image|
|<kbd>Background Local: Previous Background</kbd>|Switches the selected active background slot to the previous resolved image|
|<kbd>Background Local: Configuration</kbd>|Opens the configuration menu|
|<kbd>Background Local: Changelog</kbd>|Opens the changelog|

<div align="right"><a href="#top"><code>▲</code></a></div>

## Configuration

Use the <kbd>Background Local: Configuration</kbd> command or press the **Background Local** button in the bottom right to access the configuration menu.

|Background|Description|
|:--|:--|
|Window Backgrounds|The list of files or globs to use for the window background image|
|Editor Backgrounds|The list of files or globs to use for editor background images|
|Sidebar Backgrounds|The list of files or globs to use for the sidebar background images|
|Panel Backgrounds|The list of files or globs to use for the panel background image|
|||
|**Style Option**|**Description**|
|Alignment|Background alignment|
|Alignment Value|Background alignment (CSS)|
|Blur|Background blur (CSS)|
|Opacity|Background opacity, 1 is fully visible and 0 is invisible|
|Repeat|Background repeat|
|Size|Background size|
|Size Value|Background size (CSS)|
|Change Time|How often to change the background image in seconds, set to 0 to never change|
|||
|**Advanced Option**|**Description**|
|Auto Install|Automatically install backgrounds on startup|
|Render Text Above Background|Show text, code, browser, and iframes on top of the background|
|Use Inverted Opacity|Use an inverted opacity, so 0 is visible and 1 is invisible|
|Smooth Image Rendering|Use smooth image rendering when resizing images instead of pixelated|
|Setting Scope|Where to save background settings - Global or Workspace|
|CSS|Custom CSS|
|API|Toggles API access|

<div align="right"><a href="#top"><code>▲</code></a></div>

## Environment Variables

If the path is not working, add an additional `/` after the variable.

|Variable|Description|
|:--|:--|
|`${vscode:workspace}`|Current VSCode project folder|
|`${vscode:user}`|VSCode user directory, either `Code/User` or `data/user-data/User`|
|`${user:home}`|Current user's home directory|
|`${...}`|System environment variable|

<div align="right"><a href="#top"><code>▲</code></a></div>

## &nbsp;

### API

*Requires API setting to be turned on in the extension*

Add this extension to your `package.json`.

```json
{
    ...
    "extensionDependencies": [
        "camelliav.code-background"
    ]
    ...
}
```

Access the api by using:

```js
const background = vscode.extensions.getExtension("camelliav.code-background").exports;
```

 * `install(): void`

   Runs the `Background Local: Install` command.
 * `uninstall(): void`

   Runs the `Background Local: Uninstall` command.
 * `reload(): void`

   Runs the `Background Local: Reload` command.
 * `get(ui): string[]?`
   * `ui` : Background to get from; either `window`, `editor`, `sidebar`, `panel`.

   Returns an array of globs for the specified background.
 * `add(ui, glob): Promise<boolean>`
   * `ui` : Background to add to; either `window`, `editor`, `sidebar`, `panel`.
   * `glob`: Glob to add.

   Returns true if successful.
 * `replace(ui, old, glob): Promise<boolean>`
   * `ui` : Background to replace from; either `window`, `editor`, `sidebar`, `panel`.
   * `old`: Glob to replace.
   * `glob`: Updated glob.

   Returns true if successful.
 * `remove(ui, glob): Promise<boolean>`
   * `ui` : Background to remove from; either `window`, `editor`, `sidebar`, `panel`.
   * `glob`: Glob to remove.

   Returns true if successful.

<div align="right"><a href="#top"><code>▲</code></a></div>

## &nbsp;

This fork is based on [KatsuteDev/Background](https://github.com/KatsuteDev/Background) and is released under the [GNU General Public License (GPL) v2.0](LICENSE).
