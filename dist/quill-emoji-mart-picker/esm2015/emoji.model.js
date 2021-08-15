import unicodeRe from "emoji-regex";
import Quill from "quill";
const Delta = Quill.import("delta");
export class Emoji {
    static toCodePoint(unicodeSurrogates, sep) {
        const r = [];
        let c = 0;
        let p = 0;
        let i = 0;
        while (i < unicodeSurrogates.length) {
            c = unicodeSurrogates.charCodeAt(i++);
            if (p) {
                // tslint:disable-next-line:no-bitwise
                r.push((0x10000 + ((p - 0xd800) << 10) + (c - 0xdc00)).toString(16));
                p = 0;
            }
            else if (0xd800 <= c && c <= 0xdbff) {
                p = c;
            }
            else {
                r.push(c.toString(16));
            }
        }
        return r.join(sep || "-");
    }
    static unicodeToEmoji(unicode) {
        return Emoji.getEmojiDataFromUnified(Emoji.toCodePoint(unicode));
    }
    static emoticonToEmoji(emoticon) {
        return Emoji.getEmojiDataFromEmoticon(emoticon);
    }
    static shortNameToEmoji(shortName) {
        return Emoji.getEmojiDataFromShortName(shortName);
    }
    static getEmojiDataFromUnified(unified) {
        const emoji = Emoji.unified[unified.toUpperCase()];
        return emoji ? emoji : null;
    }
    static getEmojiDataFromEmoticon(emoticon) {
        const emoji = Emoji.emoticons[emoticon];
        return emoji ? emoji : null;
    }
    static getEmojiDataFromShortName(shortName) {
        const emoji = Emoji.shortNames[(shortName.includes(":")
            ? shortName.split(":")[1]
            : shortName).toLowerCase()];
        console.debug(shortName);
        return emoji ? emoji : null;
    }
    static uncompress(list, options) {
        list.map((emoji) => {
            const emojiRef = (Emoji.unified[emoji.unified] = {
                unified: emoji.unified,
                id: emoji.shortName,
                sheet: emoji.sheet,
                emoticons: emoji.emoticons,
            });
            Emoji.shortNames[emoji.shortName] = emojiRef;
            // Additional shortNames
            if (emoji.shortNames) {
                for (const d of emoji.shortNames) {
                    Emoji.shortNames[d] = emojiRef;
                }
            }
            if (options.convertEmoticons && emoji.emoticons) {
                for (const d of emoji.emoticons) {
                    Emoji.emoticons[d] = emojiRef;
                }
            }
            if (emoji.skinVariations) {
                for (const d of emoji.skinVariations) {
                    Emoji.unified[d.unified] = {
                        unified: d.unified,
                        id: emojiRef.id,
                        sheet: d.sheet,
                        emoticons: emojiRef.emoticons,
                    };
                }
            }
        });
        if (options.customEmojiData) {
            for (let customEmoji of options.customEmojiData) {
                if (customEmoji.shortNames) {
                    customEmoji = Object.assign(Object.assign({}, customEmoji), { id: customEmoji.shortNames[0] });
                    Emoji.shortNames[customEmoji.id] = customEmoji;
                }
            }
        }
    }
    static unifiedToNative(unified) {
        const codePoints = unified.split("-").map((u) => parseInt(`0x${u}`, 16));
        return String.fromCodePoint(...codePoints);
    }
    static emojiSpriteStyles(sheet, set, backgroundImageFn, size = 24, sheetSize = 64, sheetColumns = 52) {
        return {
            width: `${size}px`,
            height: `${size}px`,
            display: "inline-block",
            "background-image": `url(${backgroundImageFn(set, sheetSize)})`,
            "background-size": `${100 * sheetColumns}%`,
            "background-position": Emoji.getSpritePosition(sheet, sheetColumns),
        };
    }
    static getSpritePosition(sheet, sheetColumns) {
        const [sheetX, sheetY] = sheet;
        const multiply = 100 / (sheetColumns - 1);
        return `${multiply * sheetX}% ${multiply * sheetY}%`;
    }
    static toHex(str) {
        let hex;
        let result = "";
        for (let i = 0; i < str.length; i++) {
            hex = str.charCodeAt(i).toString(16);
            result += ("000" + hex).slice(-4);
        }
        return result;
    }
    static buildImage(emoji, node, set, options) {
        if (typeof emoji === "string") {
            const unicodeRegex = unicodeRe();
            if (unicodeRegex.test(emoji)) {
                emoji = Emoji.unicodeToEmoji(emoji);
            }
            else {
                const shortNameRegex = new RegExp(Emoji.shortNameRe);
                const match = shortNameRegex.exec(emoji);
                if (match && match.length > 1) {
                    emoji = Emoji.shortNameToEmoji(match[1]);
                    console.debug(emoji);
                }
            }
        }
        if (emoji && typeof emoji === "object") {
            node.classList.add(Emoji.emojiPrefix + emoji.id);
            // Custom image
            if (emoji.imageUrl) {
                node.classList.add(Emoji.emojiPrefix + "custom");
                node.style.backgroundImage = `url("${emoji.imageUrl}")`;
                node.style.backgroundSize = "contain";
            }
            else {
                // Using a sprite
                let style = null;
                // Default emoji using a set
                if (emoji.sheet) {
                    style = Emoji.emojiSpriteStyles(emoji.sheet, set, options.backgroundImageFn);
                }
                else if (emoji.spriteUrl) {
                    // Emoji using a sprite URL
                    node.classList.add(Emoji.emojiPrefix + "custom");
                    style = Emoji.emojiSpriteStyles([
                        emoji.sheet_x,
                        emoji.sheet_y,
                    ], "", () => emoji.spriteUrl, 24, emoji.size, emoji.sheetColumns);
                }
                if (style) {
                    node.style.display = "inline-block";
                    node.style.backgroundImage = style["background-image"];
                    node.style.backgroundSize = style["background-size"];
                    node.style.backgroundPosition = style["background-position"];
                }
            }
            node.style.fontSize = "inherit";
            node.setAttribute("src", "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7");
            node.setAttribute("draggable", "false");
            if (emoji.unified) {
                const native = Emoji.unifiedToNative(emoji.unified);
                node.setAttribute("alt", native);
            }
            else {
                node.setAttribute("alt", options.indicator + emoji.id + options.indicator);
            }
            if (options.showTitle) {
                const emoticons = emoji.emoticons;
                let title = "";
                if (options.convertEmoticons && emoticons && emoticons.length > 0) {
                    title = emoticons[0] + "\u2002,\u2002";
                }
                title += options.indicator + emoji.id + options.indicator;
                node.setAttribute("title", title);
            }
        }
        return node;
    }
    static convertInput(delta, replacements) {
        const changes = new Delta();
        let position = 0;
        console.debug("here");
        delta.ops.forEach((op) => {
            if (op.insert) {
                if (typeof op.insert === "object") {
                    position++;
                }
                else if (typeof op.insert === "string") {
                    const text = op.insert;
                    let emojiText = "";
                    let index;
                    for (const replacement of replacements) {
                        // tslint:disable-next-line: no-conditional-assignment
                        while ((replacement.match = replacement.regex.exec(text))) {
                            // Setting the index and using the difference between the matches as a workaround for a lookahead regex
                            index =
                                replacement.match.index +
                                    (replacement.match[0].length -
                                        replacement.match[replacement.replacementIndex].length);
                            emojiText = replacement.match[replacement.matchIndex];
                            const emoji = replacement.fn(emojiText);
                            const changeIndex = position + index;
                            if (changeIndex > 0) {
                                changes.retain(changeIndex);
                            }
                            changes.delete(replacement.match[replacement.replacementIndex].length);
                            if (emoji) {
                                changes.insert({ emoji });
                            }
                            else {
                                changes.insert(`${emojiText}`);
                            }
                        }
                    }
                    position += op.insert.length;
                }
            }
        });
        return changes;
    }
    static convertPaste(delta, replacements) {
        const changes = new Delta();
        let op = null;
        // Matchers are called recursively, so iterating is not necessary
        if (delta) {
            op = delta.ops[0];
        }
        if (op && op.insert && typeof op.insert === "string") {
            const text = op.insert;
            let emojiText = "";
            let currentReplacement = null;
            let index = 0;
            let i = 0;
            do {
                // Getting our first match
                let tempReplacement = null;
                for (const replacement of replacements) {
                    // Select the first match in the replacements array
                    if (replacement.match === undefined ||
                        currentReplacement === replacement) {
                        replacement.match = replacement.regex.exec(text);
                    }
                    if (replacement.match) {
                        if (!tempReplacement ||
                            !tempReplacement.match ||
                            replacement.match.index < tempReplacement.match.index) {
                            tempReplacement = replacement;
                        }
                    }
                }
                currentReplacement = tempReplacement;
                if (currentReplacement && currentReplacement.match) {
                    // Setting the index and using the difference between the matches as a workaround for a lookahead regex
                    index =
                        currentReplacement.match.index +
                            (currentReplacement.match[0].length -
                                currentReplacement.match[currentReplacement.replacementIndex]
                                    .length);
                    if (index !== i) {
                        changes.insert(text.slice(i, index));
                    }
                    emojiText = currentReplacement.match[currentReplacement.matchIndex];
                    const emoji = currentReplacement.fn(emojiText);
                    if (emoji) {
                        changes.insert({ emoji });
                    }
                    i =
                        index +
                            currentReplacement.match[currentReplacement.replacementIndex]
                                .length;
                }
            } while (currentReplacement && currentReplacement.match);
            // Check if there is text left
            if (i < text.length) {
                changes.insert(text.slice(i));
            }
        }
        return changes;
    }
    static insertEmoji(quill, event) {
        if (quill && quill.isEnabled()) {
            const range = quill.getSelection(true);
            const delta = new Delta()
                .retain(range.index)
                .delete(range.length)
                .insert({ emoji: event.emoji });
            // Using silent to not trigger text-change, but checking if the editor is enabled
            quill.updateContents(delta, Quill.sources.SILENT);
            quill.setSelection(++range.index, 0, Quill.sources.SILENT);
        }
    }
}
Emoji.unified = {};
Emoji.emoticons = {};
Emoji.shortNames = {};
Emoji.emojiPrefix = "qle-";
// tslint:disable-next-line: max-line-length
Emoji.emoticonRe = `(?:\\s|^)((?:8\\))|(?:\\(:)|(?:\\):)|(?::'\\()|(?::\\()|(?::\\))|(?::\\*)|(?::-\\()|(?::-\\))|(?::-\\*)|(?::-/)|(?::->)|(?::-D)|(?::-O)|(?::-P)|(?::-\\\\)|(?::-b)|(?::-o)|(?::-p)|(?::-\\|)|(?::/)|(?::>)|(?::D)|(?::O)|(?::P)|(?::\\\\)|(?::b)|(?::o)|(?::p)|(?::\\|)|(?:;\\))|(?:;-\\))|(?:;-P)|(?:;-b)|(?:;-p)|(?:;P)|(?:;b)|(?:;p)|(?:<3)|(?:</3)|(?:=\\))|(?:=-\\))|(?:>:\\()|(?:>:-\\()|(?:C:)|(?:D:)|(?:c:))(?=\\s|$)`;
Emoji.shortNameRe = "(?:[^\\*]|^)(\\:([a-z0-9_\\-\\+]+)\\:)(?!\\*)";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW1vamkubW9kZWwuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9AbnV0cmlmeS9xdWlsbC1lbW9qaS1tYXJ0LXBpY2tlci8iLCJzb3VyY2VzIjpbImVtb2ppLm1vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sU0FBUyxNQUFNLGFBQWEsQ0FBQztBQUNwQyxPQUFPLEtBQUssTUFBTSxPQUFPLENBQUM7QUFJMUIsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQTREcEMsTUFBTSxPQUFPLEtBQUs7SUFXaEIsTUFBTSxDQUFDLFdBQVcsQ0FBQyxpQkFBeUIsRUFBRSxHQUFZO1FBQ3hELE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNiLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNWLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNWLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUVWLE9BQU8sQ0FBQyxHQUFHLGlCQUFpQixDQUFDLE1BQU0sRUFBRTtZQUNuQyxDQUFDLEdBQUcsaUJBQWlCLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDdEMsSUFBSSxDQUFDLEVBQUU7Z0JBQ0wsc0NBQXNDO2dCQUN0QyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDckUsQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUNQO2lCQUFNLElBQUksTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksTUFBTSxFQUFFO2dCQUNyQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ1A7aUJBQU07Z0JBQ0wsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsUUFBUSxD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ZXNDb250ZW50IjpbImltcG9ydCB1bmljb2RlUmUgZnJvbSBcImVtb2ppLXJlZ2V4XCI7XG5pbXBvcnQgUXVpbGwgZnJvbSBcInF1aWxsXCI7XG5cbmltcG9ydCB7IEVtb2ppTW9kdWxlT3B0aW9ucywgRW1vamlTZXQgfSBmcm9tIFwiLi9lbW9qaS5xdWlsbC1tb2R1bGVcIjtcblxuY29uc3QgRGVsdGEgPSBRdWlsbC5pbXBvcnQoXCJkZWx0YVwiKTtcblxuZXhwb3J0IHR5cGUgSUN1c3RvbUVtb2ppID0gSUN1c3RvbUltYWdlRW1vamlWaWV3IHwgSUN1c3RvbVNwcml0ZUVtb2ppVmlldztcbmV4cG9ydCB0eXBlIElFbW9qaSA9IElFbW9qaVZpZXcgfCBJQ3VzdG9tRW1vamk7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29tcHJlc3NlZEVtb2ppRGF0YSB7XG4gIG5hbWU6IHN0cmluZztcbiAgdW5pZmllZDogc3RyaW5nO1xuICBzaG9ydE5hbWU6IHN0cmluZztcbiAgc2hvcnROYW1lcz86IHN0cmluZ1tdO1xuICBzaGVldDogW251bWJlciwgbnVtYmVyXTtcbiAga2V5d29yZHM/OiBzdHJpbmdbXTtcbiAgaGlkZGVuPzogc3RyaW5nW107XG4gIGVtb3RpY29ucz86IHN0cmluZ1tdO1xuICB0ZXh0Pzogc3RyaW5nO1xuICBza2luVmFyaWF0aW9ucz86IEVtb2ppVmFyaWF0aW9uW107XG4gIG9ic29sZXRlZEJ5Pzogc3RyaW5nO1xuICBvYnNvbGV0ZXM/OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSUVtb2ppUmVwbGFjZXIge1xuICByZWdleDogUmVnRXhwO1xuICBmbjogKHN0cjogc3RyaW5nKSA9PiBJRW1vamkgfCBzdHJpbmc7XG4gIG1hdGNoSW5kZXg6IG51bWJlcjtcbiAgcmVwbGFjZW1lbnRJbmRleDogbnVtYmVyOyAvLyBXb3JrYXJvdW5kIHRvIHN1cHBvcnQgcmVnZXggbG9va2FoZWFkIG9uIGFsbCBicm93c2Vyc1xuICBtYXRjaD86IFJlZ0V4cEV4ZWNBcnJheTtcbn1cblxuZXhwb3J0IHR5cGUgSUVtb2ppUmVwbGFjZW1lbnQgPSBJRW1vamlSZXBsYWNlcltdO1xuXG5pbnRlcmZhY2UgSUVtb2ppVmlldyB7XG4gIHVuaWZpZWQ6IHN0cmluZztcbiAgaWQ6IHN0cmluZztcbiAgc2hlZXQ6IFtudW1iZXIsIG51bWJlcl07XG4gIGVtb3RpY29ucz86IHN0cmluZ1tdO1xufVxuXG5pbnRlcmZhY2UgSUN1c3RvbUltYWdlRW1vamlWaWV3IHtcbiAgaWQ6IHN0cmluZztcbiAgaW1hZ2VVcmw6IHN0cmluZztcbiAgc2hvcnROYW1lcz86IHN0cmluZ1tdO1xufVxuXG5pbnRlcmZhY2UgSUN1c3RvbVNwcml0ZUVtb2ppVmlldyB7XG4gIGlkOiBzdHJpbmc7XG4gIHNwcml0ZVVybDogc3RyaW5nO1xuICBzaGVldF94OiBudW1iZXI7XG4gIHNoZWV0X3k6IG51bWJlcjtcbiAgc2l6ZTogMTYgfCAyMCB8IDMyIHwgNjQ7XG4gIHNoZWV0Q29sdW1uczogbnVtYmVyO1xuICBzaGVldFJvd3M/OiBudW1iZXI7IC8vIE5vdCByZWFsbHkgbmVjZXNzYXJ5XG4gIHNob3J0TmFtZXM/OiBzdHJpbmdbXTtcbn1cblxuaW50ZXJmYWNlIEVtb2ppVmFyaWF0aW9uIHtcbiAgdW5pZmllZDogc3RyaW5nO1xuICBzaGVldDogW251bWJlciwgbnVtYmVyXTtcbiAgaGlkZGVuPzogc3RyaW5nW107XG59XG5cbmV4cG9ydCBjbGFzcyBFbW9qaSB7XG4gIHN0YXRpYyB1bmlmaWVkOiB7IFtrZXk6IHN0cmluZ106IElFbW9qaSB9ID0ge307XG4gIHN0YXRpYyBlbW90aWNvbnM6IHsgW2tleTogc3RyaW5nXTogSUVtb2ppIH0gPSB7fTtcbiAgc3RhdGljIHNob3J0TmFtZXM6IHsgW2tleTogc3RyaW5nXTogSUVtb2ppIH0gPSB7fTtcblxuICBzdGF0aWMgZW1vamlQcmVmaXggPSBcInFsZS1cIjtcblxuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6IG1heC1saW5lLWxlbmd0aFxuICBzdGF0aWMgZW1vdGljb25SZSA9IGAoPzpcXFxcc3xeKSgoPzo4XFxcXCkpfCg/OlxcXFwoOil8KD86XFxcXCk6KXwoPzo6J1xcXFwoKXwoPzo6XFxcXCgpfCg/OjpcXFxcKSl8KD86OlxcXFwqKXwoPzo6LVxcXFwoKXwoPzo6LVxcXFwpKXwoPzo6LVxcXFwqKXwoPzo6LS8pfCg/OjotPil8KD86Oi1EKXwoPzo6LU8pfCg/OjotUCl8KD86Oi1cXFxcXFxcXCl8KD86Oi1iKXwoPzo6LW8pfCg/OjotcCl8KD86Oi1cXFxcfCl8KD86Oi8pfCg/Ojo+KXwoPzo6RCl8KD86Ok8pfCg/OjpQKXwoPzo6XFxcXFxcXFwpfCg/OjpiKXwoPzo6byl8KD86OnApfCg/OjpcXFxcfCl8KD86O1xcXFwpKXwoPzo7LVxcXFwpKXwoPzo7LVApfCg/OjstYil8KD86Oy1wKXwoPzo7UCl8KD86O2IpfCg/OjtwKXwoPzo8Myl8KD86PC8zKXwoPzo9XFxcXCkpfCg/Oj0tXFxcXCkpfCg/Oj46XFxcXCgpfCg/Oj46LVxcXFwoKXwoPzpDOil8KD86RDopfCg/OmM6KSkoPz1cXFxcc3wkKWA7XG4gIHN0YXRpYyBzaG9ydE5hbWVSZSA9IFwiKD86W15cXFxcKl18XikoXFxcXDooW2EtejAtOV9cXFxcLVxcXFwrXSspXFxcXDopKD8hXFxcXCopXCI7XG5cbiAgc3RhdGljIHRvQ29kZVBvaW50KHVuaWNvZGVTdXJyb2dhdGVzOiBzdHJpbmcsIHNlcD86IHN0cmluZykge1xuICAgIGNvbnN0IHIgPSBbXTtcbiAgICBsZXQgYyA9IDA7XG4gICAgbGV0IHAgPSAwO1xuICAgIGxldCBpID0gMDtcblxuICAgIHdoaWxlIChpIDwgdW5pY29kZVN1cnJvZ2F0ZXMubGVuZ3RoKSB7XG4gICAgICBjID0gdW5pY29kZVN1cnJvZ2F0ZXMuY2hhckNvZGVBdChpKyspO1xuICAgICAgaWYgKHApIHtcbiAgICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWJpdHdpc2VcbiAgICAgICAgci5wdXNoKCgweDEwMDAwICsgKChwIC0gMHhkODAwKSA8PCAxMCkgKyAoYyAtIDB4ZGMwMCkpLnRvU3RyaW5nKDE2KSk7XG4gICAgICAgIHAgPSAwO1xuICAgICAgfSBlbHNlIGlmICgweGQ4MDAgPD0gYyAmJiBjIDw9IDB4ZGJmZikge1xuICAgICAgICBwID0gYztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHIucHVzaChjLnRvU3RyaW5nKDE2KSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHIuam9pbihzZXAgfHwgXCItXCIpO1xuICB9XG5cbiAgc3RhdGljIHVuaWNvZGVUb0Vtb2ppKHVuaWNvZGU6IHN0cmluZyk6IElFbW9qaSB8IHN0cmluZyB7XG4gICAgcmV0dXJuIEVtb2ppLmdldEVtb2ppRGF0YUZyb21VbmlmaWVkKEVtb2ppLnRvQ29kZVBvaW50KHVuaWNvZGUpKTtcbiAgfVxuXG4gIHN0YXRpYyBlbW90aWNvblRvRW1vamkoZW1vdGljb246IHN0cmluZyk6IElFbW9qaSB7XG4gICAgcmV0dXJuIEVtb2ppLmdldEVtb2ppRGF0YUZyb21FbW90aWNvbihlbW90aWNvbik7XG4gIH1cblxuICBzdGF0aWMgc2hvcnROYW1lVG9FbW9qaShzaG9ydE5hbWU6IHN0cmluZyk6IElFbW9qaSB7XG4gICAgcmV0dXJuIEVtb2ppLmdldEVtb2ppRGF0YUZyb21TaG9ydE5hbWUoc2hvcnROYW1lKTtcbiAgfVxuXG4gIHN0YXRpYyBnZXRFbW9qaURhdGFGcm9tVW5pZmllZCh1bmlmaWVkOiBzdHJpbmcpOiBJRW1vamkge1xuICAgIGNvbnN0IGVtb2ppID0gRW1vamkudW5pZmllZFt1bmlmaWVkLnRvVXBwZXJDYXNlKCldO1xuXG4gICAgcmV0dXJuIGVtb2ppID8gZW1vamkgOiBudWxsO1xuICB9XG5cbiAgc3RhdGljIGdldEVtb2ppRGF0YUZyb21FbW90aWNvbihlbW90aWNvbjogc3RyaW5nKTogSUVtb2ppIHtcbiAgICBjb25zdCBlbW9qaSA9IEVtb2ppLmVtb3RpY29uc1tlbW90aWNvbl07XG5cbiAgICByZXR1cm4gZW1vamkgPyBlbW9qaSA6IG51bGw7XG4gIH1cblxuICBzdGF0aWMgZ2V0RW1vamlEYXRhRnJvbVNob3J0TmFtZShzaG9ydE5hbWU6IHN0cmluZyk6IElFbW9qaSB7XG4gICAgY29uc3QgZW1vamkgPVxuICAgICAgRW1vamkuc2hvcnROYW1lc1tcbiAgICAgICAgKHNob3J0TmFtZS5pbmNsdWRlcyhcIjpcIilcbiAgICAgICAgICA/IHNob3J0TmFtZS5zcGxpdChcIjpcIilbMV1cbiAgICAgICAgICA6IHNob3J0TmFtZVxuICAgICAgICApLnRvTG93ZXJDYXNlKClcbiAgICAgIF07XG5cbiAgICBjb25zb2xlLmRlYnVnKHNob3J0TmFtZSk7XG5cbiAgICByZXR1cm4gZW1vamkgPyBlbW9qaSA6IG51bGw7XG4gIH1cblxuICBzdGF0aWMgdW5jb21wcmVzcyhsaXN0OiBDb21wcmVzc2VkRW1vamlEYXRhW10sIG9wdGlvbnM6IEVtb2ppTW9kdWxlT3B0aW9ucykge1xuICAgIGxpc3QubWFwKChlbW9qaSkgPT4ge1xuICAgICAgY29uc3QgZW1vamlSZWYgPSAoRW1vamkudW5pZmllZFtlbW9qaS51bmlmaWVkXSA9IHtcbiAgICAgICAgdW5pZmllZDogZW1vamkudW5pZmllZCxcbiAgICAgICAgaWQ6IGVtb2ppLnNob3J0TmFtZSxcbiAgICAgICAgc2hlZXQ6IGVtb2ppLnNoZWV0LFxuICAgICAgICBlbW90aWNvbnM6IGVtb2ppLmVtb3RpY29ucyxcbiAgICAgIH0pO1xuXG4gICAgICBFbW9qaS5zaG9ydE5hbWVzW2Vtb2ppLnNob3J0TmFtZV0gPSBlbW9qaVJlZjtcblxuICAgICAgLy8gQWRkaXRpb25hbCBzaG9ydE5hbWVzXG4gICAgICBpZiAoZW1vamkuc2hvcnROYW1lcykge1xuICAgICAgICBmb3IgKGNvbnN0IGQgb2YgZW1vamkuc2hvcnROYW1lcykge1xuICAgICAgICAgIEVtb2ppLnNob3J0TmFtZXNbZF0gPSBlbW9qaVJlZjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAob3B0aW9ucy5jb252ZXJ0RW1vdGljb25zICYmIGVtb2ppLmVtb3RpY29ucykge1xuICAgICAgICBmb3IgKGNvbnN0IGQgb2YgZW1vamkuZW1vdGljb25zKSB7XG4gICAgICAgICAgRW1vamkuZW1vdGljb25zW2RdID0gZW1vamlSZWY7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGVtb2ppLnNraW5WYXJpYXRpb25zKSB7XG4gICAgICAgIGZvciAoY29uc3QgZCBvZiBlbW9qaS5za2luVmFyaWF0aW9ucykge1xuICAgICAgICAgIEVtb2ppLnVuaWZpZWRbZC51bmlmaWVkXSA9IHtcbiAgICAgICAgICAgIHVuaWZpZWQ6IGQudW5pZmllZCxcbiAgICAgICAgICAgIGlkOiBlbW9qaVJlZi5pZCxcbiAgICAgICAgICAgIHNoZWV0OiBkLnNoZWV0LFxuICAgICAgICAgICAgZW1vdGljb25zOiBlbW9qaVJlZi5lbW90aWNvbnMsXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYgKG9wdGlvbnMuY3VzdG9tRW1vamlEYXRhKSB7XG4gICAgICBmb3IgKGxldCBjdXN0b21FbW9qaSBvZiBvcHRpb25zLmN1c3RvbUVtb2ppRGF0YSkge1xuICAgICAgICBpZiAoY3VzdG9tRW1vamkuc2hvcnROYW1lcykge1xuICAgICAgICAgIGN1c3RvbUVtb2ppID0geyAuLi5jdXN0b21FbW9qaSwgaWQ6IGN1c3RvbUVtb2ppLnNob3J0TmFtZXNbMF0gfTtcbiAgICAgICAgICBFbW9qaS5zaG9ydE5hbWVzW2N1c3RvbUVtb2ppLmlkXSA9IGN1c3RvbUVtb2ppO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgc3RhdGljIHVuaWZpZWRUb05hdGl2ZSh1bmlmaWVkOiBzdHJpbmcpIHtcbiAgICBjb25zdCBjb2RlUG9pbnRzID0gdW5pZmllZC5zcGxpdChcIi1cIikubWFwKCh1KSA9PiBwYXJzZUludChgMHgke3V9YCwgMTYpKTtcbiAgICByZXR1cm4gU3RyaW5nLmZyb21Db2RlUG9pbnQoLi4uY29kZVBvaW50cyk7XG4gIH1cblxuICBzdGF0aWMgZW1vamlTcHJpdGVTdHlsZXMoXG4gICAgc2hlZXQ6IElFbW9qaVZpZXdbXCJzaGVldFwiXSxcbiAgICBzZXQ6IEVtb2ppU2V0IHwgXCJcIixcbiAgICBiYWNrZ3JvdW5kSW1hZ2VGbjogKHNldDogc3RyaW5nLCBzaGVldFNpemU6IG51bWJlcikgPT4gc3RyaW5nLFxuICAgIHNpemU6IG51bWJlciA9IDI0LFxuICAgIHNoZWV0U2l6ZTogMTYgfCAyMCB8IDMyIHwgNjQgPSA2NCxcbiAgICBzaGVldENvbHVtbnMgPSA1MlxuICApIHtcbiAgICByZXR1cm4ge1xuICAgICAgd2lkdGg6IGAke3NpemV9cHhgLFxuICAgICAgaGVpZ2h0OiBgJHtzaXplfXB4YCxcbiAgICAgIGRpc3BsYXk6IFwiaW5saW5lLWJsb2NrXCIsXG4gICAgICBcImJhY2tncm91bmQtaW1hZ2VcIjogYHVybCgke2JhY2tncm91bmRJbWFnZUZuKHNldCwgc2hlZXRTaXplKX0pYCxcbiAgICAgIFwiYmFja2dyb3VuZC1zaXplXCI6IGAkezEwMCAqIHNoZWV0Q29sdW1uc30lYCxcbiAgICAgIFwiYmFja2dyb3VuZC1wb3NpdGlvblwiOiBFbW9qaS5nZXRTcHJpdGVQb3NpdGlvbihzaGVldCwgc2hlZXRDb2x1bW5zKSxcbiAgICB9O1xuICB9XG5cbiAgc3RhdGljIGdldFNwcml0ZVBvc2l0aW9uKHNoZWV0OiBJRW1vamlWaWV3W1wic2hlZXRcIl0sIHNoZWV0Q29sdW1uczogbnVtYmVyKSB7XG4gICAgY29uc3QgW3NoZWV0WCwgc2hlZXRZXSA9IHNoZWV0O1xuICAgIGNvbnN0IG11bHRpcGx5ID0gMTAwIC8gKHNoZWV0Q29sdW1ucyAtIDEpO1xuICAgIHJldHVybiBgJHttdWx0aXBseSAqIHNoZWV0WH0lICR7bXVsdGlwbHkgKiBzaGVldFl9JWA7XG4gIH1cblxuICBzdGF0aWMgdG9IZXgoc3RyOiBzdHJpbmcpIHtcbiAgICBsZXQgaGV4OiBzdHJpbmc7XG4gICAgbGV0IHJlc3VsdCA9IFwiXCI7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgICAgaGV4ID0gc3RyLmNoYXJDb2RlQXQoaSkudG9TdHJpbmcoMTYpO1xuICAgICAgcmVzdWx0ICs9IChcIjAwMFwiICsgaGV4KS5zbGljZSgtNCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIHN0YXRpYyBidWlsZEltYWdlKFxuICAgIGVtb2ppOiBzdHJpbmcgfCBJRW1vamksXG4gICAgbm9kZTogSFRNTEVsZW1lbnQsXG4gICAgc2V0OiBFbW9qaVNldCxcbiAgICBvcHRpb25zOiBFbW9qaU1vZHVsZU9wdGlvbnNcbiAgKSB7XG4gICAgaWYgKHR5cGVvZiBlbW9qaSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgY29uc3QgdW5pY29kZVJlZ2V4ID0gdW5pY29kZVJlKCk7XG5cbiAgICAgIGlmICh1bmljb2RlUmVnZXgudGVzdChlbW9qaSkpIHtcbiAgICAgICAgZW1vamkgPSBFbW9qaS51bmljb2RlVG9FbW9qaShlbW9qaSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBzaG9ydE5hbWVSZWdleCA9IG5ldyBSZWdFeHAoRW1vamkuc2hvcnROYW1lUmUpO1xuICAgICAgICBjb25zdCBtYXRjaCA9IHNob3J0TmFtZVJlZ2V4LmV4ZWMoZW1vamkpO1xuICAgICAgICBpZiAobWF0Y2ggJiYgbWF0Y2gubGVuZ3RoID4gMSkge1xuICAgICAgICAgIGVtb2ppID0gRW1vamkuc2hvcnROYW1lVG9FbW9qaShtYXRjaFsxXSk7XG4gICAgICAgICAgY29uc29sZS5kZWJ1ZyhlbW9qaSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoZW1vamkgJiYgdHlwZW9mIGVtb2ppID09PSBcIm9iamVjdFwiKSB7XG4gICAgICBub2RlLmNsYXNzTGlzdC5hZGQoRW1vamkuZW1vamlQcmVmaXggKyBlbW9qaS5pZCk7XG5cbiAgICAgIC8vIEN1c3RvbSBpbWFnZVxuICAgICAgaWYgKChlbW9qaSBhcyBJQ3VzdG9tSW1hZ2VFbW9qaVZpZXcpLmltYWdlVXJsKSB7XG4gICAgICAgIG5vZGUuY2xhc3NMaXN0LmFkZChFbW9qaS5lbW9qaVByZWZpeCArIFwiY3VzdG9tXCIpO1xuXG4gICAgICAgIG5vZGUuc3R5bGUuYmFja2dyb3VuZEltYWdlID0gYHVybChcIiR7XG4gICAgICAgICAgKGVtb2ppIGFzIElDdXN0b21JbWFnZUVtb2ppVmlldykuaW1hZ2VVcmxcbiAgICAgICAgfVwiKWA7XG4gICAgICAgIG5vZGUuc3R5bGUuYmFja2dyb3VuZFNpemUgPSBcImNvbnRhaW5cIjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFVzaW5nIGEgc3ByaXRlXG4gICAgICAgIGxldCBzdHlsZSA9IG51bGw7XG5cbiAgICAgICAgLy8gRGVmYXVsdCBlbW9qaSB1c2luZyBhIHNldFxuICAgICAgICBpZiAoKGVtb2ppIGFzIElFbW9qaVZpZXcpLnNoZWV0KSB7XG4gICAgICAgICAgc3R5bGUgPSBFbW9qaS5lbW9qaVNwcml0ZVN0eWxlcyhcbiAgICAgICAgICAgIChlbW9qaSBhcyBJRW1vamlWaWV3KS5zaGVldCxcbiAgICAgICAgICAgIHNldCxcbiAgICAgICAgICAgIG9wdGlvbnMuYmFja2dyb3VuZEltYWdlRm5cbiAgICAgICAgICApO1xuICAgICAgICB9IGVsc2UgaWYgKChlbW9qaSBhcyBJQ3VzdG9tU3ByaXRlRW1vamlWaWV3KS5zcHJpdGVVcmwpIHtcbiAgICAgICAgICAvLyBFbW9qaSB1c2luZyBhIHNwcml0ZSBVUkxcblxuICAgICAgICAgIG5vZGUuY2xhc3NMaXN0LmFkZChFbW9qaS5lbW9qaVByZWZpeCArIFwiY3VzdG9tXCIpO1xuXG4gICAgICAgICAgc3R5bGUgPSBFbW9qaS5lbW9qaVNwcml0ZVN0eWxlcyhcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgKGVtb2ppIGFzIElDdXN0b21TcHJpdGVFbW9qaVZpZXcpLnNoZWV0X3gsXG4gICAgICAgICAgICAgIChlbW9qaSBhcyBJQ3VzdG9tU3ByaXRlRW1vamlWaWV3KS5zaGVldF95LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiXCIsXG4gICAgICAgICAgICAoKSA9PiAoZW1vamkgYXMgSUN1c3RvbVNwcml0ZUVtb2ppVmlldykuc3ByaXRlVXJsLFxuICAgICAgICAgICAgMjQsXG4gICAgICAgICAgICAoZW1vamkgYXMgSUN1c3RvbVNwcml0ZUVtb2ppVmlldykuc2l6ZSxcbiAgICAgICAgICAgIChlbW9qaSBhcyBJQ3VzdG9tU3ByaXRlRW1vamlWaWV3KS5zaGVldENvbHVtbnNcbiAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHN0eWxlKSB7XG4gICAgICAgICAgbm9kZS5zdHlsZS5kaXNwbGF5ID0gXCJpbmxpbmUtYmxvY2tcIjtcbiAgICAgICAgICBub2RlLnN0eWxlLmJhY2tncm91bmRJbWFnZSA9IHN0eWxlW1wiYmFja2dyb3VuZC1pbWFnZVwiXTtcbiAgICAgICAgICBub2RlLnN0eWxlLmJhY2tncm91bmRTaXplID0gc3R5bGVbXCJiYWNrZ3JvdW5kLXNpemVcIl07XG4gICAgICAgICAgbm9kZS5zdHlsZS5iYWNrZ3JvdW5kUG9zaXRpb24gPSBzdHlsZVtcImJhY2tncm91bmQtcG9zaXRpb25cIl07XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgbm9kZS5zdHlsZS5mb250U2l6ZSA9IFwiaW5oZXJpdFwiO1xuXG4gICAgICBub2RlLnNldEF0dHJpYnV0ZShcbiAgICAgICAgXCJzcmNcIixcbiAgICAgICAgXCJkYXRhOmltYWdlL2dpZjtiYXNlNjQsUjBsR09EbGhBUUFCQUlBQUFBQUFBUC8vL3lINUJBRUFBQUFBTEFBQUFBQUJBQUVBQUFJQlJBQTdcIlxuICAgICAgKTtcbiAgICAgIG5vZGUuc2V0QXR0cmlidXRlKFwiZHJhZ2dhYmxlXCIsIFwiZmFsc2VcIik7XG5cbiAgICAgIGlmICgoZW1vamkgYXMgSUVtb2ppVmlldykudW5pZmllZCkge1xuICAgICAgICBjb25zdCBuYXRpdmUgPSBFbW9qaS51bmlmaWVkVG9OYXRpdmUoKGVtb2ppIGFzIElFbW9qaVZpZXcpLnVuaWZpZWQpO1xuICAgICAgICBub2RlLnNldEF0dHJpYnV0ZShcImFsdFwiLCBuYXRpdmUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbm9kZS5zZXRBdHRyaWJ1dGUoXG4gICAgICAgICAgXCJhbHRcIixcbiAgICAgICAgICBvcHRpb25zLmluZGljYXRvciArIGVtb2ppLmlkICsgb3B0aW9ucy5pbmRpY2F0b3JcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgaWYgKG9wdGlvbnMuc2hvd1RpdGxlKSB7XG4gICAgICAgIGNvbnN0IGVtb3RpY29ucyA9IChlbW9qaSBhcyBJRW1vamlWaWV3KS5lbW90aWNvbnM7XG5cbiAgICAgICAgbGV0IHRpdGxlID0gXCJcIjtcblxuICAgICAgICBpZiAob3B0aW9ucy5jb252ZXJ0RW1vdGljb25zICYmIGVtb3RpY29ucyAmJiBlbW90aWNvbnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgIHRpdGxlID0gZW1vdGljb25zWzBdICsgXCJcXHUyMDAyLFxcdTIwMDJcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRpdGxlICs9IG9wdGlvbnMuaW5kaWNhdG9yICsgZW1vamkuaWQgKyBvcHRpb25zLmluZGljYXRvcjtcblxuICAgICAgICBub2RlLnNldEF0dHJpYnV0ZShcInRpdGxlXCIsIHRpdGxlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cblxuICBzdGF0aWMgY29udmVydElucHV0KGRlbHRhOiBhbnksIHJlcGxhY2VtZW50czogSUVtb2ppUmVwbGFjZW1lbnQpOiBhbnkge1xuICAgIGNvbnN0IGNoYW5nZXMgPSBuZXcgRGVsdGEoKTtcblxuICAgIGxldCBwb3NpdGlvbiA9IDA7XG4gICAgY29uc29sZS5kZWJ1ZyhcImhlcmVcIik7XG5cbiAgICBkZWx0YS5vcHMuZm9yRWFjaCgob3A6IGFueSkgPT4ge1xuICAgICAgaWYgKG9wLmluc2VydCkge1xuICAgICAgICBpZiAodHlwZW9mIG9wLmluc2VydCA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgIHBvc2l0aW9uKys7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIG9wLmluc2VydCA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgIGNvbnN0IHRleHQgPSBvcC5pbnNlcnQ7XG5cbiAgICAgICAgICBsZXQgZW1vamlUZXh0ID0gXCJcIjtcbiAgICAgICAgICBsZXQgaW5kZXg6IG51bWJlcjtcblxuICAgICAgICAgIGZvciAoY29uc3QgcmVwbGFjZW1lbnQgb2YgcmVwbGFjZW1lbnRzKSB7XG4gICAgICAgICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6IG5vLWNvbmRpdGlvbmFsLWFzc2lnbm1lbnRcbiAgICAgICAgICAgIHdoaWxlICgocmVwbGFjZW1lbnQubWF0Y2ggPSByZXBsYWNlbWVudC5yZWdleC5leGVjKHRleHQpKSkge1xuICAgICAgICAgICAgICAvLyBTZXR0aW5nIHRoZSBpbmRleCBhbmQgdXNpbmcgdGhlIGRpZmZlcmVuY2UgYmV0d2VlbiB0aGUgbWF0Y2hlcyBhcyBhIHdvcmthcm91bmQgZm9yIGEgbG9va2FoZWFkIHJlZ2V4XG4gICAgICAgICAgICAgIGluZGV4ID1cbiAgICAgICAgICAgICAgICByZXBsYWNlbWVudC5tYXRjaC5pbmRleCArXG4gICAgICAgICAgICAgICAgKHJlcGxhY2VtZW50Lm1hdGNoWzBdLmxlbmd0aCAtXG4gICAgICAgICAgICAgICAgICByZXBsYWNlbWVudC5tYXRjaFtyZXBsYWNlbWVudC5yZXBsYWNlbWVudEluZGV4XS5sZW5ndGgpO1xuXG4gICAgICAgICAgICAgIGVtb2ppVGV4dCA9IHJlcGxhY2VtZW50Lm1hdGNoW3JlcGxhY2VtZW50Lm1hdGNoSW5kZXhdO1xuXG4gICAgICAgICAgICAgIGNvbnN0IGVtb2ppID0gcmVwbGFjZW1lbnQuZm4oZW1vamlUZXh0KTtcblxuICAgICAgICAgICAgICBjb25zdCBjaGFuZ2VJbmRleCA9IHBvc2l0aW9uICsgaW5kZXg7XG5cbiAgICAgICAgICAgICAgaWYgKGNoYW5nZUluZGV4ID4gMCkge1xuICAgICAgICAgICAgICAgIGNoYW5nZXMucmV0YWluKGNoYW5nZUluZGV4KTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGNoYW5nZXMuZGVsZXRlKFxuICAgICAgICAgICAgICAgIHJlcGxhY2VtZW50Lm1hdGNoW3JlcGxhY2VtZW50LnJlcGxhY2VtZW50SW5kZXhdLmxlbmd0aFxuICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgIGlmIChlbW9qaSkge1xuICAgICAgICAgICAgICAgIGNoYW5nZXMuaW5zZXJ0KHsgZW1vamkgfSk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY2hhbmdlcy5pbnNlcnQoYCR7ZW1vamlUZXh0fWApO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcG9zaXRpb24gKz0gb3AuaW5zZXJ0Lmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIGNoYW5nZXM7XG4gIH1cblxuICBzdGF0aWMgY29udmVydFBhc3RlKGRlbHRhOiBhbnksIHJlcGxhY2VtZW50czogSUVtb2ppUmVwbGFjZW1lbnQpOiBhbnkge1xuICAgIGNvbnN0IGNoYW5nZXMgPSBuZXcgRGVsdGEoKTtcbiAgICBsZXQgb3AgPSBudWxsO1xuXG4gICAgLy8gTWF0Y2hlcnMgYXJlIGNhbGxlZCByZWN1cnNpdmVseSwgc28gaXRlcmF0aW5nIGlzIG5vdCBuZWNlc3NhcnlcbiAgICBpZiAoZGVsdGEpIHtcbiAgICAgIG9wID0gZGVsdGEub3BzWzBdO1xuICAgIH1cblxuICAgIGlmIChvcCAmJiBvcC5pbnNlcnQgJiYgdHlwZW9mIG9wLmluc2VydCA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgY29uc3QgdGV4dCA9IG9wLmluc2VydDtcblxuICAgICAgbGV0IGVtb2ppVGV4dCA9IFwiXCI7XG4gICAgICBsZXQgY3VycmVudFJlcGxhY2VtZW50OiBJRW1vamlSZXBsYWNlciA9IG51bGw7XG4gICAgICBsZXQgaW5kZXggPSAwO1xuXG4gICAgICBsZXQgaSA9IDA7XG5cbiAgICAgIGRvIHtcbiAgICAgICAgLy8gR2V0dGluZyBvdXIgZmlyc3QgbWF0Y2hcbiAgICAgICAgbGV0IHRlbXBSZXBsYWNlbWVudDogSUVtb2ppUmVwbGFjZXIgPSBudWxsO1xuICAgICAgICBmb3IgKGNvbnN0IHJlcGxhY2VtZW50IG9mIHJlcGxhY2VtZW50cykge1xuICAgICAgICAgIC8vIFNlbGVjdCB0aGUgZmlyc3QgbWF0Y2ggaW4gdGhlIHJlcGxhY2VtZW50cyBhcnJheVxuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgIHJlcGxhY2VtZW50Lm1hdGNoID09PSB1bmRlZmluZWQgfHxcbiAgICAgICAgICAgIGN1cnJlbnRSZXBsYWNlbWVudCA9PT0gcmVwbGFjZW1lbnRcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIHJlcGxhY2VtZW50Lm1hdGNoID0gcmVwbGFjZW1lbnQucmVnZXguZXhlYyh0ZXh0KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAocmVwbGFjZW1lbnQubWF0Y2gpIHtcbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgIXRlbXBSZXBsYWNlbWVudCB8fFxuICAgICAgICAgICAgICAhdGVtcFJlcGxhY2VtZW50Lm1hdGNoIHx8XG4gICAgICAgICAgICAgIHJlcGxhY2VtZW50Lm1hdGNoLmluZGV4IDwgdGVtcFJlcGxhY2VtZW50Lm1hdGNoLmluZGV4XG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgdGVtcFJlcGxhY2VtZW50ID0gcmVwbGFjZW1lbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY3VycmVudFJlcGxhY2VtZW50ID0gdGVtcFJlcGxhY2VtZW50O1xuXG4gICAgICAgIGlmIChjdXJyZW50UmVwbGFjZW1lbnQgJiYgY3VycmVudFJlcGxhY2VtZW50Lm1hdGNoKSB7XG4gICAgICAgICAgLy8gU2V0dGluZyB0aGUgaW5kZXggYW5kIHVzaW5nIHRoZSBkaWZmZXJlbmNlIGJldHdlZW4gdGhlIG1hdGNoZXMgYXMgYSB3b3JrYXJvdW5kIGZvciBhIGxvb2thaGVhZCByZWdleFxuICAgICAgICAgIGluZGV4ID1cbiAgICAgICAgICAgIGN1cnJlbnRSZXBsYWNlbWVudC5tYXRjaC5pbmRleCArXG4gICAgICAgICAgICAoY3VycmVudFJlcGxhY2VtZW50Lm1hdGNoWzBdLmxlbmd0aCAtXG4gICAgICAgICAgICAgIGN1cnJlbnRSZXBsYWNlbWVudC5tYXRjaFtjdXJyZW50UmVwbGFjZW1lbnQucmVwbGFjZW1lbnRJbmRleF1cbiAgICAgICAgICAgICAgICAubGVuZ3RoKTtcblxuICAgICAgICAgIGlmIChpbmRleCAhPT0gaSkge1xuICAgICAgICAgICAgY2hhbmdlcy5pbnNlcnQodGV4dC5zbGljZShpLCBpbmRleCkpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGVtb2ppVGV4dCA9IGN1cnJlbnRSZXBsYWNlbWVudC5tYXRjaFtjdXJyZW50UmVwbGFjZW1lbnQubWF0Y2hJbmRleF07XG4gICAgICAgICAgY29uc3QgZW1vamkgPSBjdXJyZW50UmVwbGFjZW1lbnQuZm4oZW1vamlUZXh0KTtcblxuICAgICAgICAgIGlmIChlbW9qaSkge1xuICAgICAgICAgICAgY2hhbmdlcy5pbnNlcnQoeyBlbW9qaSB9KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpID1cbiAgICAgICAgICAgIGluZGV4ICtcbiAgICAgICAgICAgIGN1cnJlbnRSZXBsYWNlbWVudC5tYXRjaFtjdXJyZW50UmVwbGFjZW1lbnQucmVwbGFjZW1lbnRJbmRleF1cbiAgICAgICAgICAgICAgLmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgfSB3aGlsZSAoY3VycmVudFJlcGxhY2VtZW50ICYmIGN1cnJlbnRSZXBsYWNlbWVudC5tYXRjaCk7XG5cbiAgICAgIC8vIENoZWNrIGlmIHRoZXJlIGlzIHRleHQgbGVmdFxuICAgICAgaWYgKGkgPCB0ZXh0Lmxlbmd0aCkge1xuICAgICAgICBjaGFuZ2VzLmluc2VydCh0ZXh0LnNsaWNlKGkpKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNoYW5nZXM7XG4gIH1cblxuICBzdGF0aWMgaW5zZXJ0RW1vamkocXVpbGw6IGFueSwgZXZlbnQ6IGFueSkge1xuICAgIGlmIChxdWlsbCAmJiBxdWlsbC5pc0VuYWJsZWQoKSkge1xuICAgICAgY29uc3QgcmFuZ2UgPSBxdWlsbC5nZXRTZWxlY3Rpb24odHJ1ZSk7XG5cbiAgICAgIGNvbnN0IGRlbHRhID0gbmV3IERlbHRhKClcbiAgICAgICAgLnJldGFpbihyYW5nZS5pbmRleClcbiAgICAgICAgLmRlbGV0ZShyYW5nZS5sZW5ndGgpXG4gICAgICAgIC5pbnNlcnQoeyBlbW9qaTogZXZlbnQuZW1vamkgfSk7XG5cbiAgICAgIC8vIFVzaW5nIHNpbGVudCB0byBub3QgdHJpZ2dlciB0ZXh0LWNoYW5nZSwgYnV0IGNoZWNraW5nIGlmIHRoZSBlZGl0b3IgaXMgZW5hYmxlZFxuICAgICAgcXVpbGwudXBkYXRlQ29udGVudHMoZGVsdGEsIFF1aWxsLnNvdXJjZXMuU0lMRU5UKTtcbiAgICAgIHF1aWxsLnNldFNlbGVjdGlvbigrK3JhbmdlLmluZGV4LCAwLCBRdWlsbC5zb3VyY2VzLlNJTEVOVCk7XG4gICAgfVxuICB9XG59XG4iXX0=