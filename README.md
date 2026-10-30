# Center

Center text in an Obsidian Markdown note. The plugin stores centered text as a `center` callout, so the note remains readable if the plugin is disabled.

## Use

Select one or more lines and run **Center** from the command palette, the editor context menu, or the ribbon button. Run it again while the cursor is in the centered block to remove the formatting. With no selection, the command centers the current line; on a blank line it starts a new centered block.

The resulting Markdown looks like this:

```md
> [!center]
> A centered line
```

The plugin's `styles.css` hides the callout title and centers its contents in Reading view.

## Install manually

Copy `manifest.json`, `main.js`, and `styles.css` into `<vault>/.obsidian/plugins/center/`, then enable Center under **Settings → Community plugins**.

## Development

`main.js` is the readable JavaScript source. Run `node --test` for the editor behavior tests and `node --check main.js` for syntax validation. No build step is required.

## License

MIT. See [LICENSE](LICENSE).
