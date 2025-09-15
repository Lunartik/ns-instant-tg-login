// ==UserScript==
// @name         One-Click Login For Recruitment
// @version      1.1
// @namespace    thisismoon
// @description  Allows for immediate switching to another nation after recruitment TG has been sent
// @author       Moon
// @downloadURL  https://github.com/Lunartik/ns-instant-tg-login/raw/main/switcher.user.js
// @updateURL    https://github.com/Lunartik/ns-instant-tg-login/raw/main/switcher.user.js
// @match        https://www.nationstates.net/*page=compose_telegram*
// @match        https://www.nationstates.net/page=blank/asperta_switcher
// @icon         https://www.google.com/s2/favicons?sz=64&domain=nationstates.net
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// ==/UserScript==

function toTitleCase(str) {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function injectSwitcher(regions) {
    const headerContent = document.getElementsByTagName('h1')[0];

    const params = new URLSearchParams(window.location.search);
    const tgto = params.get('tgto');
    const message = params.get('message');

    const templateBtn = document.querySelector("a.button, button");

    const btnClasses = templateBtn.className;
    const btnStyles = templateBtn.getAttribute("style");

    const header = document.querySelector("h1");
    if (!header) return;

    const container = document.createElement("div");
    container.style.marginTop = "0.5em";

    regions.forEach(({ region, nation, password }) => {
        const btn = document.createElement("a");
        btn.textContent = `Switch to ${toTitleCase(region.replace(/_/g, " "))}`;

        const url = new URL(window.location.origin + "/page=compose_telegram");
        url.searchParams.set("tgto", tgto);
        url.searchParams.set("message", message);
        url.searchParams.set("logging_in", 1);
        url.searchParams.set("nation", nation);
        url.searchParams.set("password", password);
        btn.href = url.toString();

        btn.className = btnClasses;
        btn.setAttribute("style", btnStyles);
        btn.style.marginRight = "0.5em";

        container.appendChild(btn);
    });

    header.insertAdjacentElement("afterend", container);
}

function injectSettingsPage(regions) {
    if (!regions || regions.length === 0) {
        regions = [
            { region: "", nation: "", password: "" },
            { region: "", nation: "", password: "" }
        ];
    }

    document.body.innerHTML = `
        <h1>Configure Region Buttons</h1>
        <p>Edit the JSON below and press "Save" to store your region configuration.</p>
        <textarea id="configArea" style="width:100%;height:300px;">${JSON.stringify(regions, null, 2)}</textarea>
        <br><button id="saveConfig">Save</button>
        <p id="status" style="color:green;"></p>
    `;

    const btn = document.getElementById('saveConfig');
    btn.addEventListener('click', () => {
        try {
            const newConfig = JSON.parse(document.getElementById('configArea').value);
            GM_setValue('regions', newConfig);
            document.getElementById('status').textContent = "Configuration saved! Reload other pages to apply.";
            document.getElementById('status').style.color = "green";
        } catch (e) {
            document.getElementById('status').textContent = "Error: Invalid JSON - " + e.message;
            document.getElementById('status').style.color = "red";
        }
    });
}

(async function() {
    'use strict';

    let regions = GM_getValue('regions');

    const url = window.location.href;

    if (url.includes("/page=compose_telegram")) {
        injectSwitcher(regions);
    } else if (url.includes("/page=blank/asperta_switcher")) {
        injectSettingsPage(regions);
    }

    GM_registerMenuCommand("Set Regions", () => {
        window.location.href = 'https://www.nationstates.net/page=blank/asperta_switcher';
    });
})();