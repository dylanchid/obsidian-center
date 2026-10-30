const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'main.js'), 'utf8');
const moduleMock = { exports: {} };
vm.runInNewContext(source, {
  module: moduleMock,
  require: (name) => {
    assert.equal(name, 'obsidian');
    return { MarkdownView: class {}, Notice: class {}, Plugin: class {} };
  },
});
const CenterPlugin = moduleMock.exports;

class Editor {
  constructor(text, selection = null) {
    this.text = text;
    this.from = selection?.from ?? { line: 0, ch: 0 };
    this.to = selection?.to ?? this.from;
  }
  lines() { return this.text.split('\n'); }
  getLine(line) { return this.lines()[line]; }
  lastLine() { return this.lines().length - 1; }
  getCursor(which) { return which === 'to' ? this.to : this.from; }
  offset(pos) { return this.lines().slice(0, pos.line).join('\n').length + (pos.line ? 1 : 0) + pos.ch; }
  getRange(from, to) { return this.text.slice(this.offset(from), this.offset(to)); }
  getSelection() { return this.getRange(this.from, this.to); }
  replaceRange(value, from, to) {
    this.text = this.text.slice(0, this.offset(from)) + value + this.text.slice(this.offset(to));
  }
  setCursor(pos) { this.from = pos; this.to = pos; }
}

test('centers selected lines and removes the callout when toggled again', () => {
  const editor = new Editor('First\nSecond', { from: { line: 0, ch: 0 }, to: { line: 1, ch: 6 } });
  const plugin = new CenterPlugin();
  plugin.toggleCenter(editor);
  assert.equal(editor.text, '> [!center]\n> First\n> Second');
  plugin.toggleCenter(editor);
  assert.equal(editor.text, 'First\nSecond');
});

test('starts an empty centered block on a blank line', () => {
  const editor = new Editor('');
  new CenterPlugin().toggleCenter(editor);
  assert.equal(editor.text, '> [!center]\n> ');
  assert.equal(editor.getCursor('from').line, 1);
  assert.equal(editor.getCursor('from').ch, 2);
});
