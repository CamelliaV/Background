/*
 * Copyright (C) 2026 Katsute <https://github.com/Katsute>
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import { round } from "../lib/math";

import { get, getCSS, UI } from "./config";
import { sanitizeCSS } from "../lib/css";
import { resolve } from "../lib/glob";

const identifier: string = "CamelliaV/Background";

const partition: RegExp = new RegExp(`^\\/\\* ${identifier}-start \\*\\/$` +
                                     `[\\s\\S]*?` +
                                     `^\\/\\* ${identifier}-end \\*\\/$`, "gmi");

// extensions https://github.com/microsoft/vscode/blob/main/src/vs/platform/protocol/electron-main/protocolMainService.ts#L27

export const extensions: () => string[] = () => ["png", "jpg", "jpeg", "webp", "gif", "bmp", "svg"];

// inject

export const inject: (content: string) => string = (content: string) =>
    clean(content) + '\n' +
    `/* ${identifier}-start */` + '\n' +
    minifyJavaScript(getJavaScript()) + '\n' +
    `/* ${identifier}-end */`;

export const clean: (content: string) => string = (s: string) =>
    s.replace(partition, "").trim();

// javascript

const getJavaScript: () => string = () => {
    const images: {[key: string]: string[]} = {
        window:  resolve(get("windowBackgrounds")),
        editor:  resolve(get("editorBackgrounds")),
        sidebar: resolve(get("sidebarBackgrounds")),
        panel:   resolve(get("panelBackgrounds"))
    };

    const under: boolean = get("renderTextAboveBackground");

    const bodySel: string = under ? `::before` : ` > div[role=application] > div.monaco-grid-view::after`;
    const secSel: string  = under ? `::before` : `::after`;

    const opacity = (sec: UI) => under ? 1 : round(get("useInvertedOpacity") ? 1 - +getCSS("backgroundOpacity", sec) : +getCSS("backgroundOpacity", sec), 2);

    const filter = (sec: UI) => `blur(${getCSS("backgroundBlur", sec)}) ${!under ? "" : `brightness(${round(get("useInvertedOpacity") ? 1 - +getCSS("backgroundOpacity", sec) : +getCSS("backgroundOpacity", sec), 2)})`}`;

    return `(() => {` +
// shared background css
`
const bk_global = document.createElement("style");
bk_global.id = "${identifier}-global";
bk_global.setAttribute("type", "text/css");

bk_global.appendChild(document.createTextNode(\`

    ${!under ? "" :
    `body .split-view-view:nth-child(3) *:not(
        [role="tooltip"], .monaco-count-badge, .badge-content, .label, .action-item *, .monaco-button,
        .monaco-editor-overlaymessage, .monaco-editor-overlaymessage *, .context-view, .context-view *,
        .view-overlays *, .sticky-widget *, .lines-content *, .suggest-widget, .suggest-widget *, .suggest-details, .suggest-details *, .editor-widget, .editor-widget *,
        .monaco-tree-sticky-container, .monaco-tree-sticky-container *, .monaco-list-row.focused, .monaco-list-row.selected, .monaco-list-row:hover),
        body > div,
        .tabs-and-actions-container {
        background-color: unset !important;
    }

    .current-line {
        opacity: 0.5;
    }`
    }

    body[windowTransition="true"]${bodySel},
    body[editorTransition="true"] .split-view-view > .editor-group-container${secSel},
    body[sidebarTransition="true"] .split-view-view > .part.sidebar${secSel},
    body[sidebarTransition="true"] .split-view-view > .part.auxiliarybar${secSel},
    body[panelTransition="true"] .split-view-view > .part.panel${secSel} {

        opacity: 0;

    }

    body${bodySel},
    .split-view-view > .editor-group-container${secSel},
    .split-view-view > .part.sidebar${secSel},
    .split-view-view > .part.auxiliarybar${secSel},
    .split-view-view > .part.panel${secSel} {

        content: "";

        top: 0;

        width: 100%;
        height: 100%;

        position: absolute;

        pointer-events: none;

        transition: opacity 1s ease-in-out;

        image-rendering: ${get("smoothImageRendering") ? "auto" : "pixelated"};

        ${under ? "z-index: -1;" : ""}

    }
\`));
`
+ // background image cache
`
const windowBackgrounds = [${images.window.join(',')}];
const editorBackgrounds = [${images.editor.join(',')}];
const sidebarBackgrounds = [${images.sidebar.join(',')}];
const panelBackgrounds = [${images.panel.join(',')}];

const iWindowBackgrounds = [...Array(${images.window.length}).keys()];
const iEditorBackgrounds = [...Array(${images.editor.length}).keys()];
const iSidebarBackgrounds = [...Array(${images.sidebar.length}).keys()];
const iPanelBackgrounds = [...Array(${images.panel.length}).keys()];

const windowTime = ${get("backgroundChangeTime", {ui: "window"}) === 0 ? 0 : Math.max(round(get("backgroundChangeTime", {ui: "window"}), 2), 5)};
const editorTime = ${get("backgroundChangeTime", {ui: "editor"}) === 0 ? 0 : Math.max(round(get("backgroundChangeTime", {ui: "editor"}), 2), 5)};
const sidebarTime = ${get("backgroundChangeTime", {ui: "sidebar"}) === 0 ? 0 : Math.max(round(get("backgroundChangeTime", {ui: "sidebar"}), 2), 5)};
const panelTime = ${get("backgroundChangeTime", {ui: "panel"}) === 0 ? 0 : Math.max(round(get("backgroundChangeTime", {ui: "panel"}), 2), 5)};

const currentBackgrounds = {
    window: undefined,
    editor: [],
    sidebar: [],
    panel: undefined
};
`
+ // individual background css - window
`
if(windowBackgrounds.length > 0){
    bk_global.appendChild(document.createTextNode(\`
        body${bodySel} {

            background-position: ${getCSS("backgroundAlignment", "window")};
            background-repeat: ${getCSS("backgroundRepeat", "window")};
            background-size: ${getCSS("backgroundSize", "window")};

            opacity: ${opacity("window")};

            filter: ${filter("window")};

        }
    \`));
};
`
+ // individual background css - editor
`
if(editorBackgrounds.length > 0){
    bk_global.appendChild(document.createTextNode(\`
        .split-view-view > .editor-group-container${secSel} {

            background-position: ${getCSS("backgroundAlignment", "editor")};
            background-repeat: ${getCSS("backgroundRepeat", "editor")};
            background-size: ${getCSS("backgroundSize", "editor")};

            opacity: ${opacity("editor")};

            filter: ${filter("editor")};

        }
    \`));
};
`
+ // individual background css - sidebar
`
if(sidebarBackgrounds.length > 0){
    bk_global.appendChild(document.createTextNode(\`
        .split-view-view > .part.sidebar${secSel},
        .split-view-view > .part.auxiliarybar${secSel} {

            background-position: ${getCSS("backgroundAlignment", "sidebar")};
            background-repeat: ${getCSS("backgroundRepeat", "sidebar")};
            background-size: ${getCSS("backgroundSize", "sidebar")};

            opacity: ${opacity("sidebar")};

            filter: ${filter("sidebar")};

        }
    \`));
};
`
+ // individual background css - panel
`
if(panelBackgrounds.length > 0){
    bk_global.appendChild(document.createTextNode(\`
        .split-view-view > .part.panel${secSel} {

            background-position: ${getCSS("backgroundAlignment", "panel")};
            background-repeat: ${getCSS("backgroundRepeat", "panel")};
            background-size: ${getCSS("backgroundSize", "panel")};

            opacity: ${opacity("panel")};

            filter: ${filter("panel")};

        }
    \`));
};
`
+ // notification overrides
`
bk_global.appendChild(document.createTextNode(\`
    div.notification-toast:has(> div.notifications-list-container > div.monaco-list[aria-label*="Your Code installation appears to be corrupt. Please reinstall., notification"]),
    div.notification-toast:has(> div.notifications-list-container > div.monaco-list[aria-label*="Your Code - Insiders installation appears to be corrupt. Please reinstall., notification"]) {

        display: none;

    }

    div.monaco-list-row[aria-label$=", source: Background (Extension), notification"],
    div.monaco-list-row[aria-label$=", source: Background (Extension), notification"]:hover {

        background-color: #0098FF !important;
        color: white !important;

    }

    div.monaco-list-row[aria-label$=", source: Background (Extension), notification"] ::before {

        color: white;

    }
\`));
`
+ // custom user css
`
bk_global.appendChild(document.createTextNode("${sanitizeCSS(get("CSS"))}"));
`
+ // background image - window
`
const bk_window_image = document.createElement("style");
bk_window_image.id = "${identifier}-window-images";
bk_window_image.setAttribute("type", "text/css");

const setWindowBackground = (random = true) => {
    while(bk_window_image.firstChild){
        bk_window_image.removeChild(bk_window_image.firstChild);
    };
    currentBackgrounds.window = undefined;

    if(windowBackgrounds.length > 0){
        random && shuffle(iWindowBackgrounds);
        const uri = windowBackgrounds[iWindowBackgrounds[0]];

        bk_window_image.appendChild(document.createTextNode(\`
            body${bodySel} {

                background-image: url("\${uri.replace(/"/g, \`\\\\"\`)}");

            }
        \`));
        currentBackgrounds.window = uri;
    };
};
`
+ // background image - editor
`
const bk_editor_image = document.createElement("style");
bk_editor_image.id = "${identifier}-editor-images";
bk_editor_image.setAttribute("type", "text/css");

const setEditorBackground = (random = true) => {
    while(bk_editor_image.firstChild){
        bk_editor_image.removeChild(bk_editor_image.firstChild);
    };
    currentBackgrounds.editor = [];

    if(editorBackgrounds.length > 0){
        const len = Math.min(editorBackgrounds.length, 10);

        random && shuffle(iEditorBackgrounds);

        let buf = '';
        for(let i = 0; i < len; i++){
            const uri = editorBackgrounds[iEditorBackgrounds[i]];
            buf += \`
                .part.editor :not(.split-view-container) .split-view-container > .split-view-view:nth-child(\${len}n+\${i+1}) > .editor-group-container${secSel} {
                    background-image: url("\${uri.replace(/"/g, \`\\\\"\`)}");
                }
            \`;
            currentBackgrounds.editor.push(uri);
        };
        bk_editor_image.appendChild(document.createTextNode(buf));
    };
};
`
+ // background image - sidebar
`
const bk_sidebar_image = document.createElement("style");
bk_sidebar_image.id = "${identifier}-sidebar-images";
bk_sidebar_image.setAttribute("type", "text/css");

const setSidebarBackground = (random = true) => {
    while(bk_sidebar_image.firstChild){
        bk_sidebar_image.removeChild(bk_sidebar_image.firstChild);
    };
    currentBackgrounds.sidebar = [];

    if(sidebarBackgrounds.length > 0){
        random && shuffle(iSidebarBackgrounds);
        const sidebar = sidebarBackgrounds[iSidebarBackgrounds[0]];
        const auxiliarybar = sidebarBackgrounds[iSidebarBackgrounds[1]] ?? sidebar;

        bk_sidebar_image.appendChild(document.createTextNode(\`
            .split-view-view > .part.sidebar${secSel} {

                background-image: url("\${sidebar.replace(/"/g, \`\\\\"\`)}");

            }
            .split-view-view > .part.auxiliarybar${secSel} {

                background-image: url("\${auxiliarybar.replace(/"/g, \`\\\\"\`)}");

            }
        \`));
        currentBackgrounds.sidebar = [sidebar, auxiliarybar];
    };
};
`
+ // background image - panel
`
const bk_panel_image = document.createElement("style");
bk_panel_image.id = "${identifier}-panel-images";
bk_panel_image.setAttribute("type", "text/css");

const setPanelBackground = (random = true) => {
    while(bk_panel_image.firstChild){
        bk_panel_image.removeChild(bk_panel_image.firstChild);
    };
    currentBackgrounds.panel = undefined;

    if(panelBackgrounds.length > 0){
        random && shuffle(iPanelBackgrounds);
        const uri = panelBackgrounds[iPanelBackgrounds[0]];

        bk_panel_image.appendChild(document.createTextNode(\`
            .split-view-view > .part.panel${secSel} {

                background-image: url("\${uri.replace(/"/g, \`\\\\"\`)}");

            }
        \`));
        currentBackgrounds.panel = uri;
    };
};
`
+ // random
`
const shuffle = (arr) => {
    for(let i = arr.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * i);
        [arr[i], arr[j]] = [arr[j], arr[i]];
    };
};
`
+ // command
`
const backgroundNotify = (notificationService, type, message) => {
    if(notificationService && notificationService.notify && typeof ft !== "undefined"){
        notificationService.notify({
            severity: type === "error" ? ft.Error : type === "warning" ? ft.Warning : ft.Info,
            source: "Background",
            message
        });
        return;
    };
    const logger = type === "error" ? console.error : type === "warning" ? console.warn : console.log;
    logger(message);
};

const toCopyUri = (uri) => {
    const prefix = "vscode-file://vscode-app/";
    return uri.startsWith(prefix) ? "file:///" + uri.substring(prefix.length) : uri;
};

const getCurrentBackgroundEntries = () => {
    const entries = [];
    const push = (label, value, backgrounds, indexes, slot, render) => value && entries.push({
        label,
        description: toCopyUri(value),
        value,
        copyUri: toCopyUri(value),
        backgrounds,
        indexes,
        slot,
        render
    });

    push("$(window) Window", currentBackgrounds.window, windowBackgrounds, iWindowBackgrounds, 0, setWindowBackground);
    for(let i = 0; i < currentBackgrounds.editor.length; i++){
        push("$(multiple-windows) Editor " + (i + 1), currentBackgrounds.editor[i], editorBackgrounds, iEditorBackgrounds, i, setEditorBackground);
    };
    push("$(layout-sidebar-left) Sidebar", currentBackgrounds.sidebar[0], sidebarBackgrounds, iSidebarBackgrounds, 0, setSidebarBackground);
    push("$(layout-sidebar-right) Auxiliary Bar", currentBackgrounds.sidebar[1], sidebarBackgrounds, iSidebarBackgrounds, 1, setSidebarBackground);
    push("$(layout-panel) Panel", currentBackgrounds.panel, panelBackgrounds, iPanelBackgrounds, 0, setPanelBackground);

    return entries;
};

const pickCurrentBackgroundEntry = async (accessor, notificationService, placeHolder) => {
    const entries = getCurrentBackgroundEntries();
    if(entries.length === 0){
        backgroundNotify(notificationService, "warning", "No current background URI.");
        return;
    };

    if(entries.length === 1)
        return entries[0];

    if(typeof $e !== "undefined"){
        const quickInputService = accessor.get($e);
        return await quickInputService.pick(entries, {placeHolder});
    };

    backgroundNotify(notificationService, "warning", "Multiple background URIs are active; using the first one.");
    return entries[0];
};

const copyBackgroundText = async (accessor, text) => {
    if(typeof Bi !== "undefined"){
        try{
            const clipboardService = accessor.get(Bi);
            if(clipboardService && clipboardService.writeText){
                await clipboardService.writeText(text);
                return;
            }
        }catch(error){
            console.warn(error);
        }
    };
    if(typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText){
        try{
            await navigator.clipboard.writeText(text);
            return;
        }catch(error){
            console.warn(error);
        }
    };

    const input = document.createElement("textarea");
    input.value = text;
    input.setAttribute("readonly", "true");
    input.style.position = "fixed";
    input.style.opacity = "0";
    document.body.appendChild(input);
    input.select();
    const copied = document.execCommand("copy");
    input.remove();

    if(!copied)
        throw new Error("Clipboard service unavailable");
};

const advanceBackground = (entry, direction) => {
    if(entry.backgrounds.length < 2)
        return false;

    const currentIndex = entry.indexes[entry.slot] ?? 0;
    entry.indexes[entry.slot] = (currentIndex + direction + entry.backgrounds.length) % entry.backgrounds.length;
    entry.render(false);

    return true;
};

if(typeof Ge !== "undefined" && Ge.registerCommand){
    Ge.registerCommand("camelliaBackground._copyCurrentBackgroundUri", async (accessor) => {
        let notificationService;
        if(typeof Ne !== "undefined"){
            notificationService = accessor.get(Ne);
        };

        try{
            const selected = await pickCurrentBackgroundEntry(accessor, notificationService, "Select background URI to copy");
            if(!selected)
                return;

            await copyBackgroundText(accessor, selected.copyUri);
            backgroundNotify(notificationService, "info", "Copied current background URI.");
        }catch(error){
            backgroundNotify(notificationService, "error", "Failed to copy current background URI.");
            console.error(error);
        }
    });
    Ge.registerCommand("camelliaBackground._nextBackground", async (accessor) => {
        let notificationService;
        if(typeof Ne !== "undefined"){
            notificationService = accessor.get(Ne);
        };

        const selected = await pickCurrentBackgroundEntry(accessor, notificationService, "Select background to advance");
        if(!selected)
            return;

        if(advanceBackground(selected, 1))
            backgroundNotify(notificationService, "info", "Switched to next background.");
        else
            backgroundNotify(notificationService, "warning", "Selected background has no next image.");
    });
    Ge.registerCommand("camelliaBackground._previousBackground", async (accessor) => {
        let notificationService;
        if(typeof Ne !== "undefined"){
            notificationService = accessor.get(Ne);
        };

        const selected = await pickCurrentBackgroundEntry(accessor, notificationService, "Select background to rewind");
        if(!selected)
            return;

        if(advanceBackground(selected, -1))
            backgroundNotify(notificationService, "info", "Switched to previous background.");
        else
            backgroundNotify(notificationService, "warning", "Selected background has no previous image.");
    });
};
`
+ // install
`
document.getElementsByTagName("head")[0].appendChild(bk_global);
document.getElementsByTagName("head")[0].appendChild(bk_window_image);
document.getElementsByTagName("head")[0].appendChild(bk_editor_image);
document.getElementsByTagName("head")[0].appendChild(bk_sidebar_image);
document.getElementsByTagName("head")[0].appendChild(bk_panel_image);

for(const arr of [iWindowBackgrounds, iEditorBackgrounds, iSidebarBackgrounds, iPanelBackgrounds]){
    for(let i = arr.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    };
};

setWindowBackground();
setEditorBackground();
setSidebarBackground();
setPanelBackground();

if(windowTime > 0 && iWindowBackgrounds.length > 1){
    setInterval(() => {
        document.body.setAttribute("windowTransition", true);
        setTimeout(() => {
            setWindowBackground();
            document.body.setAttribute("windowTransition", false);
        }, 1 * 1000);
    }, windowTime * 1000);
};
if(editorTime > 0 && iEditorBackgrounds.length > 1){
    setInterval(() => {
        document.body.setAttribute("editorTransition", true);
        setTimeout(() => {
            setEditorBackground();
            document.body.setAttribute("editorTransition", false);
        }, 1 * 1000);
    }, editorTime * 1000);
};
if(sidebarTime > 0 && iSidebarBackgrounds.length > 1){
    setInterval(() => {
        document.body.setAttribute("sidebarTransition", true);
        setTimeout(() => {
            setSidebarBackground();
            document.body.setAttribute("sidebarTransition", false);
        }, 1 * 1000);
    }, sidebarTime * 1000);
};
if(panelTime > 0 && iPanelBackgrounds.length > 1){
    setInterval(() => {
        document.body.setAttribute("panelTransition", true);
        setTimeout(() => {
            setPanelBackground();
            document.body.setAttribute("panelTransition", false);
        }, 1 * 1000);
    }, panelTime * 1000);
};
` +
            `})();`;
}

const minifyJavaScript: (javascript: string) => string = (javascript: string) =>
    javascript
        .trim()
        .replace(/\/\/ .*$/gm, '')     // remove line // comments
        .replace(/\/\*.*?\*\//gms, '') // remove multiline /* */ comments
        .replace(/^ +/gm, '')          // remove trailing space
        .replace(/\r?\n/gm, '')        // remove newlines
