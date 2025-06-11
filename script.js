// ==UserScript==
// @name         Laravel Debugbar Overlay in Dialog
// @namespace    DC_Laravel_Debugbar_Overlay
// @version      0.3
// @description  Move Laravel Debugbar and WireSpy into a dialog so they appear above other dialogs
// @author       John Hobson
// @match        http://localhost:*/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    let debugDialog;
    let hasWrapped = false;

    const ensureDebugDialog = () => {
        if (debugDialog && document.body.contains(debugDialog)) return debugDialog;

        debugDialog = document.createElement('dialog');
        debugDialog.setAttribute('id', 'debug-overlay-dialog');
        debugDialog.style.position = 'fixed';
        debugDialog.style.top = '0';
        debugDialog.style.left = '0';
        debugDialog.style.width = '100vw';
        debugDialog.style.height = 'auto';
        debugDialog.style.zIndex = '2147483647'; // Max z-index
        debugDialog.style.background = 'transparent';
        debugDialog.style.border = 'none';
        debugDialog.style.padding = '0';
        debugDialog.setAttribute('wire:ignore', '');

        document.body.appendChild(debugDialog);

        return debugDialog;
    };

    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '5px';
    closeBtn.style.left = '10px';
    closeBtn.style.zIndex = '2147483648'; // Higher than dialog content
    closeBtn.style.fontSize = '20px';
    closeBtn.style.border = 'none';
    closeBtn.style.background = 'rgba(0, 0, 0, 0.5)';
    closeBtn.style.color = '#fff';
    closeBtn.style.padding = '2px 8px';
    closeBtn.style.borderRadius = '4px';
    closeBtn.style.cursor = 'pointer';

    closeBtn.addEventListener('click', () => {
        debugDialog.close();
        hasWrapped = false; // Reset so it can be re-inserted later
    });


    const moveDebugToolsToDialog = () => {
        console.log('moving dialogs');
        if (hasWrapped) return;

        const phpBar = document.querySelector('.phpdebugbar');
        const wireSpy = document.querySelector('.wire-spy');

        const phpBarIsClosed = !phpBar || phpBar.classList.contains('phpdebugbar-closed')

        const wireSpyIsClosed = () => {
            console.log('in wireSPyIsClosed');
            if (!wireSpy) return true;

            const firstDiv = wireSpy.querySelector('div');

            if (firstDiv) {
                return (parseFloat(window.getComputedStyle(firstDiv).height) === 0)
            }

            return true;
        }

        if (phpBarIsClosed && wireSpyIsClosed()) return;

        const dialog = ensureDebugDialog();

        if (phpBar
            && !dialog.contains(phpBar)
            && !phpBarIsClosed) {
            dialog.appendChild(phpBar);
        }

        if (wireSpy && !dialog.contains(wireSpy)) dialog.appendChild(wireSpy);

        dialog.appendChild(closeBtn);

        dialog.close();
        dialog.showModal();

        hasWrapped = true;
    };

    const restoreDebugToolsToBody = () => {
        const phpBar = document.querySelector('.phpdebugbar');
        const wireSpy = document.querySelector('.wire-spy');

        if (phpBar) document.body.appendChild(phpBar);
        if (wireSpy) document.body.appendChild(wireSpy);

        if (debugDialog && debugDialog.open) {
            debugDialog.close();
        }

        hasWrapped = false;
    };

    // Check when dialogs open
    const observer = new MutationObserver((mutations) => {
        const openDialogs = document.querySelectorAll('dialog[open]');
        const dialogJustClosed = mutations.some(m =>
            m.type === 'attributes' &&
            m.target.tagName === 'DIALOG' &&
            !m.target.hasAttribute('open')
        );

        // If no dialogs remain open, restore debug tools
        if (dialogJustClosed && openDialogs.length === 0) {
            restoreDebugToolsToBody();
            return;
        }

        for (const m of mutations) {
            for (const node of m.addedNodes) {
                if (node.nodeType === 1 && node.tagName === 'DIALOG' && node.hasAttribute('open')) {
                    console.log('found node with open attribute');
                    moveDebugToolsToDialog();
                }
            }

            if (m.type === 'attributes' && m.target.tagName === 'DIALOG' && m.target.hasAttribute('open')) {
                console.log('found node with open attribute 2');
                moveDebugToolsToDialog();
            }
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['open']
    });

    // Keyboard shortcut: Ctrl+D to toggle the debug overlay dialog
    document.addEventListener('keydown', (e) => {
        // Avoid conflicts with browser bookmarks
        if (e.ctrlKey && e.key.toLowerCase() === 'i') {
            e.preventDefault();

            const dlg = document.getElementById('debug-overlay-dialog');
            if (!dlg) {
                console.warn('Debug overlay dialog not found.');
                return;
            }

            if (dlg.open) {
                dlg.close();
            } else {
                dlg.showModal();
            }
        }
    });


    // Fallback: run once on load
    setTimeout(() => {
        if (document.querySelector('dialog[open]')) {
            moveDebugToolsToDialog();
        }
    }, 500);

    ensureDebugDialog();

})();
