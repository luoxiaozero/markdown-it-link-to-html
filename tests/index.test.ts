import MarkdownItLinkToHtml from "../src";
import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";

it("test base", () => {
    const env = "test";
    let mdIt = new MarkdownIt({
        html: true,
    });

    mdIt.use(MarkdownItLinkToHtml, {
        replaceLink: (href) => {
            return {
                tag: "ReplaceLink",
                isInline: false,
            };
        },
    });

    let tokes = mdIt.parse("[ss](/ss/ss 'title')", env);
    let html = mdIt.renderer.render(tokes, {}, env);

    expect(html).toEqual(
        `<p><ReplaceLink href="/ss/ss" title="title">ss</ReplaceLink></p>\n`
    );
});
