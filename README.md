# markdown-it-link-to-html

The link changes to HTML

`[me](https://me.me)`

`<a href="https://me.me">me</a>` into `<RouterLink to="https://me.me">me</RouterLink>`

## Install

```
npm i -D markdown-it-link-to-html
```

## Usage

1. For HTTPS，Change to ReplaceLink

```js
import MarkdownIt from "markdown-it";
import LinkToHtml from "markdown-it-link-to-html";

const md = MarkdownIt();

md.use(LinkToHtml, {
    replaceLink: (href) => {
        if (href.startsWith("https")) {
            /// href is https, return ReplaceLink
            return {
                tag: "ReplaceLink",
                isInline: false,
            };
        }
        /// href is no https, don't change
        return undefined;
    },
});
```

2. All change to RouterLink

```js
import MarkdownIt from "markdown-it";
import LinkToHtml from "markdown-it-link-to-html";

const md = MarkdownIt();

md.use(LinkToHtml, {
    replaceLink: (href) => {
        return {
            tag: "RouterLink",
            href: "to",
            isInline: true,
        };
    },
});
```

[MIT](./LICENSE) License
