const { MarkdownView, Notice, Plugin } = require("obsidian");

const CENTER_HEADER = /^>\s*\[!center\](?:[+-])?\s*$/i;
const QUOTE_LINE = /^> ?/;

module.exports = class CenterPlugin extends Plugin {
  onload() {
    this.addCommand({
      id: "center",
      name: "Center",
      editorCallback: (editor) => this.toggleCenter(editor),
    });

    this.addRibbonIcon("align-center", "Center", () => {
      const view = this.app.workspace.getActiveViewOfType(MarkdownView);
      if (!view) {
        new Notice("Open a Markdown note to center text.");
        return;
      }
      this.toggleCenter(view.editor);
      view.editor.focus();
    });

    this.registerEvent(
      this.app.workspace.on("editor-menu", (menu, editor) => {
        menu.addItem((item) =>
          item
            .setTitle("Center")
            .setIcon("align-center")
            .onClick(() => this.toggleCenter(editor)),
        );
      }),
    );
  }

  toggleCenter(editor) {
    const cursor = editor.getCursor("from");
    const centeredBlock = this.findCenteredBlock(editor, cursor.line);

    if (centeredBlock) {
      this.unwrapBlock(editor, centeredBlock);
      return;
    }

    const selection = editor.getSelection();
    if (selection.length > 0) {
      const from = editor.getCursor("from");
      const to = editor.getCursor("to");
      const endLine = to.ch === 0 && to.line > from.line ? to.line - 1 : to.line;
      const endText = editor.getLine(endLine);
      const selectedLines = editor.getRange(
        { line: from.line, ch: 0 },
        { line: endLine, ch: endText.length },
      );

      if (CENTER_HEADER.test(selectedLines.split("\n")[0])) {
        editor.replaceRange(
          this.unwrapText(selectedLines),
          { line: from.line, ch: 0 },
          { line: endLine, ch: endText.length },
        );
        return;
      }

      editor.replaceRange(
        this.wrapText(selectedLines),
        { line: from.line, ch: 0 },
        { line: endLine, ch: endText.length },
      );
      editor.setCursor({ line: from.line + 1, ch: 2 });
      return;
    }

    const line = cursor.line;
    const text = editor.getLine(line);
    if (text.trim().length === 0) {
      editor.replaceRange("> [!center]\n> ", { line, ch: 0 }, { line, ch: text.length });
      editor.setCursor({ line: line + 1, ch: 2 });
      return;
    }

    editor.replaceRange(
      this.wrapText(text),
      { line, ch: 0 },
      { line, ch: text.length },
    );
    editor.setCursor({ line: line + 1, ch: cursor.ch + 2 });
  }

  wrapText(text) {
    const quoted = text.split("\n").map((line) => `> ${line}`).join("\n");
    return `> [!center]\n${quoted}`;
  }

  unwrapText(text) {
    const lines = text.split("\n");
    if (CENTER_HEADER.test(lines[0])) lines.shift();
    return lines.map((line) => line.replace(QUOTE_LINE, "")).join("\n");
  }

  findCenteredBlock(editor, line) {
    let start = line;
    while (start > 0 && QUOTE_LINE.test(editor.getLine(start - 1))) start -= 1;

    if (!CENTER_HEADER.test(editor.getLine(start))) return null;

    let end = start;
    const lastLine = editor.lastLine();
    while (end < lastLine && QUOTE_LINE.test(editor.getLine(end + 1))) end += 1;
    return { start, end };
  }

  unwrapBlock(editor, block) {
    const lines = [];
    for (let line = block.start + 1; line <= block.end; line += 1) {
      lines.push(editor.getLine(line).replace(QUOTE_LINE, ""));
    }

    const endText = editor.getLine(block.end);
    editor.replaceRange(
      lines.join("\n"),
      { line: block.start, ch: 0 },
      { line: block.end, ch: endText.length },
    );
    editor.setCursor({ line: block.start, ch: 0 });
  }
};
