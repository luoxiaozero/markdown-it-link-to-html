# markdown-it-link-to-html

## Install

```
npm i -D markdown-it-link-to-html
```

## Usage

```js
import MarkdownIt from "markdown-it";
import LinkToHtml from "markdown-it-link-to-html";

const md = MarkdownIt();

md.use(LinkToHtml, {
    replaceLink: (href) => {
        return {
            tag: "ReplaceLink",
            isInline: false,
        };
    },
});
```
