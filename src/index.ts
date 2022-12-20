import type MarkdownIt from "markdown-it";
import Token from "markdown-it/lib/token";

type ReplaceLink = (href: string, info: { linkify: boolean, title: string }) =>
    | {
          tag: keyof HTMLElementTagNameMap | string;
          hrefName?: string,
          href?: string,
          title?: string,
          block?: boolean;
          attrs?: {
            [key: string]: string
          }
      }
    | undefined;

interface Options {
    linkify?: boolean,
    replaceLink: ReplaceLink;
}

function linkOpenToHtml(
    replaceLink: ReplaceLink,
    lineOpen: Token
): [Token, Token] | null {
    let href = "",
        title = "";
    if (lineOpen.attrs) {
        for (let attr of lineOpen.attrs) {
            switch (attr[0]) {
                case "href":
                    href = attr[1];
                    break;
                case "title":
                    title = attr[1];
                    break;
            }
        }
    }
    let htmlInfo = replaceLink(href, { linkify: lineOpen.markup === "linkify", title });
    if (!htmlInfo) return null;
    let { tag, block = false, hrefName = "href", href: hrefValue, title: titleValue, attrs } = htmlInfo;

    if (hrefValue !== undefined) href = hrefValue;
    if (titleValue !== undefined) title = titleValue
    
    let type = block ? "html_inline" : "html_inline";
    let openToken = new Token(type, "", 1);
    let closeToken = new Token(type, "", -1);

    openToken.block = block;
    closeToken.block = block;

    openToken.content = title ? `<${tag} ${hrefName}="${href}" title="${title}"`: `<${tag} ${hrefName}="${href}"`;
    if (attrs !== undefined) {
        Object.entries(attrs).forEach(value => {
            if (value[0] === hrefName || value[0] === "title") {
                return;
            }
            openToken.content += ` ${value[0]}="${value[1]}"`
        })
    }
    openToken.content += ">";
    closeToken.content = `</${tag}>`;

    return [openToken, closeToken];
}

const MarkdownItLinkToHtml: MarkdownIt.PluginWithOptions<Options> = (
    markdownit,
    options
) => {
    if (!options || !options.replaceLink) {
        return;
    }
    markdownit.core.ruler.after("inline", "replack-link-to-html", (state) => {
        state.tokens.forEach((token) => {
            if (token.type === "inline" && token.children) {
                if (options.linkify) {
                    let children: Token[] = [];
                    let shielding = false;
                    let html: [Token, Token] | null = null;
                    token.children.forEach((t) => {
                        if (t.type === "link_open") {
                            html = linkOpenToHtml(options.replaceLink, t);
                            if (html) {
                                children.push(html[0]);
                                if (t.markup === "linkify") shielding = true;
                            } else {
                                children.push(t);
                            }
                        } else if (t.type === "link_close") {
                            children.push(html![1]);
                            shielding = false;
                        } else if (!shielding){
                            children.push(t);
                        }
                    })
                    token.children = children;
                } else {
                    let html: [Token, Token] | null = null;
                    let len = token.children.length;
                    for (let index = 0; index < len; index++) {
                        let t = token.children[index];
                        if (t.type === "link_open" && t.markup !== "linkify") {
                            html = linkOpenToHtml(options.replaceLink, t);
                            if (html) {
                                token.children[index] = html[0];
                            }
                        } else if (t.type === "link_close" && t.markup !== "linkify") {
                            if (html) {
                                token.children[index] = html[1];
                            }
                        }
                    }
                }
            }
        });
    });
};

export default MarkdownItLinkToHtml;
