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
            };
        },
    });

    let tokes = mdIt.parse("[me](https://me.me 'title')", env);
    let html = mdIt.renderer.render(tokes, {}, env);

    expect(html).toEqual(
        `<p><ReplaceLink href="https://me.me" title="title">me</ReplaceLink></p>\n`
    );
});

describe("test autolink", () => {
    it("test autolink", () => {
        const env = "test";
        let mdIt = new MarkdownIt({
            html: true,
            linkify: true
        });

        mdIt.use(MarkdownItLinkToHtml, {
            replaceLink: (href) => {
                return {
                    tag: "ReplaceLink",
                };
            },
        });

        let tokes = mdIt.parse("https://me.me", env);
        let html = mdIt.renderer.render(tokes, {}, env);
        
        expect(html).toEqual(
            `<p><a href="https://me.me">https://me.me</a></p>\n`
        );
    });
    it("test autolink linkify enabled", () => {
        const env = "test";
        let mdIt = new MarkdownIt({
            html: true,
            linkify: true
        });

        mdIt.use(MarkdownItLinkToHtml, {
            linkify: true,
            replaceLink: (href) => {
                return {
                    tag: "ReplaceLink",
                };
            },
        });

        let tokes = mdIt.parse("https://me.me", env);
        let html = mdIt.renderer.render(tokes, {}, env);

        expect(html).toEqual(
            `<p><ReplaceLink href="https://me.me"></ReplaceLink></p>\n`
        );
    });
});

it("test href", () => {
    const env = "test";
    let mdIt = new MarkdownIt({
        html: true,
    });

    mdIt.use(MarkdownItLinkToHtml, {
        replaceLink: (href) => {
            return {
                tag: "ReplaceLink",
                hrefName: "to"
            };
        },
    });

    let tokes = mdIt.parse("[me](https://me.me 'title')", env);
    let html = mdIt.renderer.render(tokes, {}, env);

    expect(html).toEqual(
        `<p><ReplaceLink to="https://me.me" title="title">me</ReplaceLink></p>\n`
    );
});

describe("test replaceLink", () => {
    it("test replaceLink", () => {
        const env = "test";
        let mdIt = new MarkdownIt({
            html: true,
        });

        mdIt.use(MarkdownItLinkToHtml, {
            replaceLink: (href) => {
                if (href.startsWith("https")) {
                    return {
                        tag: "ReplaceLink",
                    };
                }
                return undefined;
            },
        });

        // HTTPS
        let tokes = mdIt.parse("[me](https://me.me 'title')", env);
        let html = mdIt.renderer.render(tokes, {}, env);

        expect(html).toEqual(
            `<p><ReplaceLink href="https://me.me" title="title">me</ReplaceLink></p>\n`
        );
    });

    it("test replaceLink undefined", () => {
        const env = "test";
        let mdIt = new MarkdownIt({
            html: true,
        });

        mdIt.use(MarkdownItLinkToHtml, {
            replaceLink: (href) => {
                if (href.startsWith("https")) {
                    return {
                        tag: "ReplaceLink",
                    };
                }
                return undefined;
            },
        });

        // HTTP
        let tokes = mdIt.parse("[me](http://me.me 'title')", env);
        let html = mdIt.renderer.render(tokes, {}, env);

        expect(html).toEqual(
            `<p><a href="http://me.me" title="title">me</a></p>\n`
        );
    });
});
