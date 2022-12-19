import type MarkdownIt from "markdown-it";
import Token from "markdown-it/lib/token";
export { blockElements, inlineElements } from "./element";

type ReplaceLink = (href: string) => {
    tag: keyof HTMLElementTagNameMap | string;
    isInline: boolean;
};

interface Options {
    replaceLink: (href: string) => {
        tag: keyof HTMLElementTagNameMap | string;
        isInline: boolean;
    };
}

function linkOpenToHtml(
    replaceLink: ReplaceLink,
    lineOpen: Token
): [Token, Token] {
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
    let { tag, isInline } = replaceLink(href);
    let openToken: Token, closeToken: Token;
    if (isInline) {
        openToken = new Token("html_inline", "", 1);
        openToken.block = false;
        closeToken = new Token("html_inline", "", -1);
        closeToken.block = false;
    } else {
        openToken = new Token("html_block", "", 1);
        openToken.block = true;
        closeToken = new Token("html_block", "", -1);
        closeToken.block = true;
    }
    openToken.content = `<${tag} href="${href}" title="${title}">`;
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
        state.tokens.forEach((token, index) => {
            if (token.type === "inline" && token.children) {
                let linkOpenIndexList: number[] = [];
                let linkCloseIndexList: number[] = [];

                token.children.forEach((token, index) => {
                    if (token.type == "link_open") {
                        linkOpenIndexList.push(index);
                    } else if (token.type == "link_close") {
                        linkCloseIndexList.push(index);
                    }
                });

                if (linkOpenIndexList.length == 0) {
                    return;
                }

                let children: Token[] = [];
                linkOpenIndexList.forEach((linkOpenIndex, index) => {
                    let afterChildren: Token[];
                    if (index == 0) {
                        afterChildren = token.children!.slice(0, linkOpenIndex);
                    } else {
                        afterChildren = token.children!.slice(
                            linkCloseIndexList[linkOpenIndex - 1] + 1,
                            linkOpenIndex
                        );
                    }
                    children.push(...afterChildren);
                    let html = linkOpenToHtml(
                        options.replaceLink,
                        token.children![linkOpenIndex]
                    );
                    children.push(html[0]);

                    let contentChildren = token.children!.slice(
                        linkOpenIndex + 1,
                        linkCloseIndexList[index]
                    );
                    children.push(...contentChildren);
                    children.push(html[1]);
                });

                if (
                    linkCloseIndexList[linkCloseIndexList.length - 1] + 1 <
                    token.children.length
                ) {
                    let lastChildren = token.children!.slice(
                        linkCloseIndexList[linkCloseIndexList.length - 1] + 1
                    );
                    children.push(...lastChildren);
                }

                token.children = children;
            }
        });
    });
};

export default MarkdownItLinkToHtml;