# Laravel Debugbar Overlay in Dialog

A Tampermonkey userscript that moves the Laravel Debugbar and WireSpy panels into a dialog element, ensuring they always appear above other dialog elements. This is especially useful when working with Laravel applications that use the dialog element (Flux UI, I'm looking at you), as the debug tools can otherwise be obscured.

## Features

- Moves Laravel Debugbar and WireSpy into a dialog element when an application dialog is opened
- Ensures debug tools are always visible, even above modals
- Close button on overlay, or use `CTRL + I` hotkey
- Automatically re-inserts the overlay if dialogs are closed and reopened

## Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/) in your browser.
2. Create a new userscript and copy the contents of [`script.js`](./script.js) into it.
3. Save the script. It will run automatically on `http://localhost:*/*` (edit the `@match` line if needed).

## Usage

- When you open your Laravel app (on localhost), the Debugbar and WireSpy panels will appear over other opened dialogs.
- Use the × button in the top-left of the overlay to close it. It will reappear if new dialogs are opened.

## Bonus Bookmarklet
Add this bookmarklet to your bookmarks to toggle any dialog overlays:

```
javascript:(function(){  const dlg = document.getElementById('debug-overlay-dialog');  if (!dlg) {    alert('Debug overlay dialog not found.');    return;  }  if (typeof dlg.open === 'boolean' && dlg.open) {    dlg.close();  } else {    dlg.showModal();  }})();
```

## Customization

- To change the sites where the script runs, edit the `@match` line in the userscript header.

## Author

John Hobson

---
