const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const pkg = require(path.join(root, "package.json"));
const extension = fs.readFileSync(path.join(root, "src", "extension.ts"), "utf-8");
const inject = fs.readFileSync(path.join(root, "src", "extension", "inject.ts"), "utf-8");
const copyBackgroundText = inject.slice(
    inject.indexOf("const copyBackgroundText"),
    inject.indexOf("const advanceBackground")
);

const commands = pkg.contributes.commands.map(command => command.command);
const extensionId = `${pkg.publisher}.${pkg.name}`.toLowerCase();
const categories = new Set(pkg.contributes.commands.map(command => command.category));

assert.strictEqual(
    pkg.publisher,
    "CamelliaV",
    "publisher prefix is CamelliaV"
);

assert.notStrictEqual(
    extensionId,
    "katsute.code-background",
    "packaged extension id must not collide with the original Marketplace extension"
);

assert.deepStrictEqual(
    [...categories],
    ["Background Local"],
    "command palette category distinguishes this fork from the original extension"
);

assert(
    commands.includes("camelliaBackground.copyCurrentBackgroundUri"),
    "package.json contributes camelliaBackground.copyCurrentBackgroundUri"
);

assert(
    commands.includes("camelliaBackground.nextBackground"),
    "package.json contributes camelliaBackground.nextBackground"
);

assert(
    commands.includes("camelliaBackground.previousBackground"),
    "package.json contributes camelliaBackground.previousBackground"
);

assert(
    extension.includes('commands.registerCommand("camelliaBackground.copyCurrentBackgroundUri"'),
    "extension registers camelliaBackground.copyCurrentBackgroundUri"
);

assert(
    extension.includes('commands.registerCommand("camelliaBackground.nextBackground"'),
    "extension registers camelliaBackground.nextBackground"
);

assert(
    extension.includes('commands.registerCommand("camelliaBackground.previousBackground"'),
    "extension registers camelliaBackground.previousBackground"
);

assert(
    extension.includes('commands.executeCommand("camelliaBackground._copyCurrentBackgroundUri")'),
    "public command delegates to injected private command"
);

assert(
    extension.includes('commands.executeCommand("camelliaBackground._nextBackground")'),
    "public next command delegates to injected private command"
);

assert(
    extension.includes('commands.executeCommand("camelliaBackground._previousBackground")'),
    "public previous command delegates to injected private command"
);

assert(
    extension.includes('item.command = "camelliaBackground.config"'),
    "status bar command uses fork command namespace"
);

assert(
    inject.includes("const currentBackgrounds"),
    "injected script tracks current background state"
);

assert(
    inject.includes('const identifier: string = "CamelliaV/Background"'),
    "injected script marker is isolated from original extension"
);

assert(
    !inject.includes('const identifier: string = "KatsuteDev/Background"'),
    "injected script marker does not collide with original extension"
);

assert(
    inject.includes('Ge.registerCommand("camelliaBackground._copyCurrentBackgroundUri"'),
    "injected script registers private copy command"
);

assert(
    inject.includes('Ge.registerCommand("camelliaBackground._nextBackground"'),
    "injected script registers private next command"
);

assert(
    inject.includes('Ge.registerCommand("camelliaBackground._previousBackground"'),
    "injected script registers private previous command"
);

assert(
    inject.includes("const toCopyUri"),
    "injected script converts internal file URIs before copying"
);

assert(
    inject.includes("file:///"),
    "injected script emits directly openable file URIs"
);

assert(
    copyBackgroundText.includes("try{") && copyBackgroundText.includes("catch"),
    "copy helper falls back when the VS Code clipboard service rejects a value"
);

assert(
    copyBackgroundText.includes('document.execCommand("copy")'),
    "copy helper has a DOM clipboard fallback"
);

assert(
    inject.includes("const advanceBackground"),
    "injected script can advance active background slots"
);

console.log("copy-current-background-uri regression checks passed");
