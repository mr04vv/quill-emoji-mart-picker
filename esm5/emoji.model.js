import { __assign, __read, __spread, __values } from "tslib";
import unicodeRe from "emoji-regex";
import Quill from "quill";
var Delta = Quill.import("delta");
var Emoji = /** @class */ (function () {
    function Emoji() {
    }
    Emoji.toCodePoint = function (unicodeSurrogates, sep) {
        var r = [];
        var c = 0;
        var p = 0;
        var i = 0;
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
    };
    Emoji.unicodeToEmoji = function (unicode) {
        return Emoji.getEmojiDataFromUnified(Emoji.toCodePoint(unicode));
    };
    Emoji.emoticonToEmoji = function (emoticon) {
        return Emoji.getEmojiDataFromEmoticon(emoticon);
    };
    Emoji.shortNameToEmoji = function (shortName) {
        return Emoji.getEmojiDataFromShortName(shortName);
    };
    Emoji.getEmojiDataFromUnified = function (unified) {
        var emoji = Emoji.unified[unified.toUpperCase()];
        return emoji ? emoji : null;
    };
    Emoji.getEmojiDataFromEmoticon = function (emoticon) {
        var emoji = Emoji.emoticons[emoticon];
        return emoji ? emoji : null;
    };
    Emoji.getEmojiDataFromShortName = function (shortName) {
        var emoji = Emoji.shortNames[shortName.toLowerCase()];
        return emoji ? emoji : null;
    };
    Emoji.uncompress = function (list, options) {
        var e_1, _a;
        list.map(function (emoji) {
            var e_2, _a, e_3, _b, e_4, _c;
            var emojiRef = (Emoji.unified[emoji.unified] = {
                unified: emoji.unified,
                id: emoji.shortName,
                sheet: emoji.sheet,
                emoticons: emoji.emoticons,
            });
            Emoji.shortNames[emoji.shortName] = emojiRef;
            // Additional shortNames
            if (emoji.shortNames) {
                try {
                    for (var _d = __values(emoji.shortNames), _e = _d.next(); !_e.done; _e = _d.next()) {
                        var d = _e.value;
                        Emoji.shortNames[d] = emojiRef;
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            }
            if (options.convertEmoticons && emoji.emoticons) {
                try {
                    for (var _f = __values(emoji.emoticons), _g = _f.next(); !_g.done; _g = _f.next()) {
                        var d = _g.value;
                        Emoji.emoticons[d] = emojiRef;
                    }
                }
                catch (e_3_1) { e_3 = { error: e_3_1 }; }
                finally {
                    try {
                        if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
                    }
                    finally { if (e_3) throw e_3.error; }
                }
            }
            if (emoji.skinVariations) {
                try {
                    for (var _h = __values(emoji.skinVariations), _j = _h.next(); !_j.done; _j = _h.next()) {
                        var d = _j.value;
                        Emoji.unified[d.unified] = {
                            unified: d.unified,
                            id: emojiRef.id,
                            sheet: d.sheet,
                            emoticons: emojiRef.emoticons,
                        };
                    }
                }
                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                finally {
                    try {
                        if (_j && !_j.done && (_c = _h.return)) _c.call(_h);
                    }
                    finally { if (e_4) throw e_4.error; }
                }
            }
        });
        if (options.customEmojiData) {
            try {
                for (var _b = __values(options.customEmojiData), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var customEmoji = _c.value;
                    if (customEmoji.shortNames) {
                        customEmoji = __assign(__assign({}, customEmoji), { id: customEmoji.shortNames[0] });
                        Emoji.shortNames[customEmoji.id] = customEmoji;
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
    };
    Emoji.unifiedToNative = function (unified) {
        var codePoints = unified.split("-").map(function (u) { return parseInt("0x" + u, 16); });
        return String.fromCodePoint.apply(String, __spread(codePoints));
    };
    Emoji.emojiSpriteStyles = function (sheet, set, backgroundImageFn, size, sheetSize, sheetColumns) {
        if (size === void 0) { size = 24; }
        if (sheetSize === void 0) { sheetSize = 64; }
        if (sheetColumns === void 0) { sheetColumns = 52; }
        return {
            width: size + "px",
            height: size + "px",
            display: "inline-block",
            "background-image": "url(" + backgroundImageFn(set, sheetSize) + ")",
            "background-size": 100 * sheetColumns + "%",
            "background-position": Emoji.getSpritePosition(sheet, sheetColumns),
        };
    };
    Emoji.getSpritePosition = function (sheet, sheetColumns) {
        var _a = __read(sheet, 2), sheetX = _a[0], sheetY = _a[1];
        var multiply = 100 / (sheetColumns - 1);
        return multiply * sheetX + "% " + multiply * sheetY + "%";
    };
    Emoji.toHex = function (str) {
        var hex;
        var result = "";
        for (var i = 0; i < str.length; i++) {
            hex = str.charCodeAt(i).toString(16);
            result += ("000" + hex).slice(-4);
        }
        return result;
    };
    Emoji.buildImage = function (emoji, node, set, options) {
        if (typeof emoji === "string") {
            var unicodeRegex = unicodeRe();
            if (unicodeRegex.test(emoji)) {
                emoji = Emoji.unicodeToEmoji(emoji);
            }
            else {
                var shortNameRegex = new RegExp(Emoji.shortNameRe);
                var match = shortNameRegex.exec(emoji);
                if (match && match.length > 1) {
                    emoji = Emoji.shortNameToEmoji(match[1]);
                }
            }
        }
        if (emoji && typeof emoji === "object") {
            node.classList.add(Emoji.emojiPrefix + emoji.id);
            // Custom image
            if (emoji.imageUrl) {
                node.classList.add(Emoji.emojiPrefix + "custom");
                node.style.backgroundImage = "url(\"" + emoji.imageUrl + "\")";
                node.style.backgroundSize = "contain";
            }
            else {
                // Using a sprite
                var style = null;
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
                    ], "", function () { return emoji.spriteUrl; }, 24, emoji.size, emoji.sheetColumns);
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
                var native = Emoji.unifiedToNative(emoji.unified);
                node.setAttribute("alt", native);
            }
            else {
                node.setAttribute("alt", options.indicator + emoji.id + options.indicator);
            }
            if (options.showTitle) {
                var emoticons = emoji.emoticons;
                var title = "";
                if (options.convertEmoticons && emoticons && emoticons.length > 0) {
                    title = emoticons[0] + "\u2002,\u2002";
                }
                title += options.indicator + emoji.id + options.indicator;
                node.setAttribute("title", title);
            }
        }
        return node;
    };
    Emoji.convertInput = function (delta, replacements) {
        var changes = new Delta();
        var position = 0;
        delta.ops.forEach(function (op) {
            var e_5, _a;
            if (op.insert) {
                if (typeof op.insert === "object") {
                    position++;
                }
                else if (typeof op.insert === "string") {
                    var text = op.insert;
                    var emojiText = "";
                    var index = void 0;
                    try {
                        for (var replacements_1 = __values(replacements), replacements_1_1 = replacements_1.next(); !replacements_1_1.done; replacements_1_1 = replacements_1.next()) {
                            var replacement = replacements_1_1.value;
                            // tslint:disable-next-line: no-conditional-assignment
                            while ((replacement.match = replacement.regex.exec(text))) {
                                // Setting the index and using the difference between the matches as a workaround for a lookahead regex
                                index =
                                    replacement.match.index +
                                        (replacement.match[0].length -
                                            replacement.match[replacement.replacementIndex].length);
                                emojiText = replacement.match[replacement.matchIndex];
                                var emoji = replacement.fn(emojiText);
                                var changeIndex = position + index;
                                if (changeIndex > 0) {
                                    changes.retain(changeIndex);
                                }
                                changes.delete(replacement.match[replacement.replacementIndex].length);
                                if (emoji) {
                                    changes.insert({ emoji: emoji });
                                }
                            }
                        }
                    }
                    catch (e_5_1) { e_5 = { error: e_5_1 }; }
                    finally {
                        try {
                            if (replacements_1_1 && !replacements_1_1.done && (_a = replacements_1.return)) _a.call(replacements_1);
                        }
                        finally { if (e_5) throw e_5.error; }
                    }
                    position += op.insert.length;
                }
            }
        });
        return changes;
    };
    Emoji.convertPaste = function (delta, replacements) {
        var e_6, _a;
        var changes = new Delta();
        var op = null;
        // Matchers are called recursively, so iterating is not necessary
        if (delta) {
            op = delta.ops[0];
        }
        if (op && op.insert && typeof op.insert === "string") {
            var text = op.insert;
            var emojiText = "";
            var currentReplacement = null;
            var index = 0;
            var i = 0;
            do {
                // Getting our first match
                var tempReplacement = null;
                try {
                    for (var replacements_2 = (e_6 = void 0, __values(replacements)), replacements_2_1 = replacements_2.next(); !replacements_2_1.done; replacements_2_1 = replacements_2.next()) {
                        var replacement = replacements_2_1.value;
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
                }
                catch (e_6_1) { e_6 = { error: e_6_1 }; }
                finally {
                    try {
                        if (replacements_2_1 && !replacements_2_1.done && (_a = replacements_2.return)) _a.call(replacements_2);
                    }
                    finally { if (e_6) throw e_6.error; }
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
                    var emoji = currentReplacement.fn(emojiText);
                    if (emoji) {
                        changes.insert({ emoji: emoji });
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
    };
    Emoji.insertEmoji = function (quill, event) {
        if (quill && quill.isEnabled()) {
            var range = quill.getSelection(true);
            var delta = new Delta()
                .retain(range.index)
                .delete(range.length)
                .insert({ emoji: event.emoji });
            // Using silent to not trigger text-change, but checking if the editor is enabled
            quill.updateContents(delta, Quill.sources.SILENT);
            quill.setSelection(++range.index, 0, Quill.sources.SILENT);
        }
    };
    Emoji.unified = {};
    Emoji.emoticons = {};
    Emoji.shortNames = {};
    Emoji.emojiPrefix = "qle-";
    // tslint:disable-next-line: max-line-length
    Emoji.emoticonRe = "(?:\\s|^)((?:8\\))|(?:\\(:)|(?:\\):)|(?::'\\()|(?::\\()|(?::\\))|(?::\\*)|(?::-\\()|(?::-\\))|(?::-\\*)|(?::-/)|(?::->)|(?::-D)|(?::-O)|(?::-P)|(?::-\\\\)|(?::-b)|(?::-o)|(?::-p)|(?::-\\|)|(?::/)|(?::>)|(?::D)|(?::O)|(?::P)|(?::\\\\)|(?::b)|(?::o)|(?::p)|(?::\\|)|(?:;\\))|(?:;-\\))|(?:;-P)|(?:;-b)|(?:;-p)|(?:;P)|(?:;b)|(?:;p)|(?:<3)|(?:</3)|(?:=\\))|(?:=-\\))|(?:>:\\()|(?:>:-\\()|(?:C:)|(?:D:)|(?:c:))(?=\\s|$)";
    Emoji.shortNameRe = "(?:[^\\*]|^)(\\:([a-z0-9_\\-\\+]+)\\:)(?!\\*)";
    return Emoji;
}());
export { Emoji };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW1vamkubW9kZWwuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9AbnV0cmlmeS9xdWlsbC1lbW9qaS1tYXJ0LXBpY2tlci8iLCJzb3VyY2VzIjpbImVtb2ppLm1vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLFNBQVMsTUFBTSxhQUFhLENBQUM7QUFDcEMsT0FBTyxLQUFLLE1BQU0sT0FBTyxDQUFDO0FBSTFCLElBQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7QUE0RHBDO0lBQUE7SUE0WUEsQ0FBQztJQWpZUSxpQkFBVyxHQUFsQixVQUFtQixpQkFBeUIsRUFBRSxHQUFZO1FBQ3hELElBQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNiLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNWLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNWLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUVWLE9BQU8sQ0FBQyxHQUFHLGlCQUFpQixDQUFDLE1BQU0sRUFBRTtZQUNuQyxDQUFDLEdBQUcsaUJBQWlCLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDdEMsSUFBSSxDQUFDLEVBQUU7Z0JBQ0wsc0NBQXNDO2dCQUN0QyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDckUsQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUNQO2lCQUFNLElBQUksTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksTUFBTSxFQUFFO2dCQUNyQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ1A7aUJBQU07Z0JBQ0wsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsUUFBUSxD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Q29udGVudCI6WyJpbXBvcnQgdW5pY29kZVJlIGZyb20gXCJlbW9qaS1yZWdleFwiO1xuaW1wb3J0IFF1aWxsIGZyb20gXCJxdWlsbFwiO1xuXG5pbXBvcnQgeyBFbW9qaU1vZHVsZU9wdGlvbnMsIEVtb2ppU2V0IH0gZnJvbSBcIi4vZW1vamkucXVpbGwtbW9kdWxlXCI7XG5cbmNvbnN0IERlbHRhID0gUXVpbGwuaW1wb3J0KFwiZGVsdGFcIik7XG5cbmV4cG9ydCB0eXBlIElDdXN0b21FbW9qaSA9IElDdXN0b21JbWFnZUVtb2ppVmlldyB8IElDdXN0b21TcHJpdGVFbW9qaVZpZXc7XG5leHBvcnQgdHlwZSBJRW1vamkgPSBJRW1vamlWaWV3IHwgSUN1c3RvbUVtb2ppO1xuXG5leHBvcnQgaW50ZXJmYWNlIENvbXByZXNzZWRFbW9qaURhdGEge1xuICBuYW1lOiBzdHJpbmc7XG4gIHVuaWZpZWQ6IHN0cmluZztcbiAgc2hvcnROYW1lOiBzdHJpbmc7XG4gIHNob3J0TmFtZXM/OiBzdHJpbmdbXTtcbiAgc2hlZXQ6IFtudW1iZXIsIG51bWJlcl07XG4gIGtleXdvcmRzPzogc3RyaW5nW107XG4gIGhpZGRlbj86IHN0cmluZ1tdO1xuICBlbW90aWNvbnM/OiBzdHJpbmdbXTtcbiAgdGV4dD86IHN0cmluZztcbiAgc2tpblZhcmlhdGlvbnM/OiBFbW9qaVZhcmlhdGlvbltdO1xuICBvYnNvbGV0ZWRCeT86IHN0cmluZztcbiAgb2Jzb2xldGVzPzogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIElFbW9qaVJlcGxhY2VyIHtcbiAgcmVnZXg6IFJlZ0V4cDtcbiAgZm46IChzdHI6IHN0cmluZykgPT4gSUVtb2ppO1xuICBtYXRjaEluZGV4OiBudW1iZXI7XG4gIHJlcGxhY2VtZW50SW5kZXg6IG51bWJlcjsgLy8gV29ya2Fyb3VuZCB0byBzdXBwb3J0IHJlZ2V4IGxvb2thaGVhZCBvbiBhbGwgYnJvd3NlcnNcbiAgbWF0Y2g/OiBSZWdFeHBFeGVjQXJyYXk7XG59XG5cbmV4cG9ydCB0eXBlIElFbW9qaVJlcGxhY2VtZW50ID0gSUVtb2ppUmVwbGFjZXJbXTtcblxuaW50ZXJmYWNlIElFbW9qaVZpZXcge1xuICB1bmlmaWVkOiBzdHJpbmc7XG4gIGlkOiBzdHJpbmc7XG4gIHNoZWV0OiBbbnVtYmVyLCBudW1iZXJdO1xuICBlbW90aWNvbnM/OiBzdHJpbmdbXTtcbn1cblxuaW50ZXJmYWNlIElDdXN0b21JbWFnZUVtb2ppVmlldyB7XG4gIGlkOiBzdHJpbmc7XG4gIGltYWdlVXJsOiBzdHJpbmc7XG4gIHNob3J0TmFtZXM/OiBzdHJpbmdbXTtcbn1cblxuaW50ZXJmYWNlIElDdXN0b21TcHJpdGVFbW9qaVZpZXcge1xuICBpZDogc3RyaW5nO1xuICBzcHJpdGVVcmw6IHN0cmluZztcbiAgc2hlZXRfeDogbnVtYmVyO1xuICBzaGVldF95OiBudW1iZXI7XG4gIHNpemU6IDE2IHwgMjAgfCAzMiB8IDY0O1xuICBzaGVldENvbHVtbnM6IG51bWJlcjtcbiAgc2hlZXRSb3dzPzogbnVtYmVyOyAvLyBOb3QgcmVhbGx5IG5lY2Vzc2FyeVxuICBzaG9ydE5hbWVzPzogc3RyaW5nW107XG59XG5cbmludGVyZmFjZSBFbW9qaVZhcmlhdGlvbiB7XG4gIHVuaWZpZWQ6IHN0cmluZztcbiAgc2hlZXQ6IFtudW1iZXIsIG51bWJlcl07XG4gIGhpZGRlbj86IHN0cmluZ1tdO1xufVxuXG5leHBvcnQgY2xhc3MgRW1vamkge1xuICBzdGF0aWMgdW5pZmllZDogeyBba2V5OiBzdHJpbmddOiBJRW1vamkgfSA9IHt9O1xuICBzdGF0aWMgZW1vdGljb25zOiB7IFtrZXk6IHN0cmluZ106IElFbW9qaSB9ID0ge307XG4gIHN0YXRpYyBzaG9ydE5hbWVzOiB7IFtrZXk6IHN0cmluZ106IElFbW9qaSB9ID0ge307XG5cbiAgc3RhdGljIGVtb2ppUHJlZml4ID0gXCJxbGUtXCI7XG5cbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOiBtYXgtbGluZS1sZW5ndGhcbiAgc3RhdGljIGVtb3RpY29uUmUgPSBgKD86XFxcXHN8XikoKD86OFxcXFwpKXwoPzpcXFxcKDopfCg/OlxcXFwpOil8KD86OidcXFxcKCl8KD86OlxcXFwoKXwoPzo6XFxcXCkpfCg/OjpcXFxcKil8KD86Oi1cXFxcKCl8KD86Oi1cXFxcKSl8KD86Oi1cXFxcKil8KD86Oi0vKXwoPzo6LT4pfCg/OjotRCl8KD86Oi1PKXwoPzo6LVApfCg/OjotXFxcXFxcXFwpfCg/OjotYil8KD86Oi1vKXwoPzo6LXApfCg/OjotXFxcXHwpfCg/OjovKXwoPzo6Pil8KD86OkQpfCg/OjpPKXwoPzo6UCl8KD86OlxcXFxcXFxcKXwoPzo6Yil8KD86Om8pfCg/OjpwKXwoPzo6XFxcXHwpfCg/OjtcXFxcKSl8KD86Oy1cXFxcKSl8KD86Oy1QKXwoPzo7LWIpfCg/OjstcCl8KD86O1ApfCg/OjtiKXwoPzo7cCl8KD86PDMpfCg/OjwvMyl8KD86PVxcXFwpKXwoPzo9LVxcXFwpKXwoPzo+OlxcXFwoKXwoPzo+Oi1cXFxcKCl8KD86QzopfCg/OkQ6KXwoPzpjOikpKD89XFxcXHN8JClgO1xuICBzdGF0aWMgc2hvcnROYW1lUmUgPSBcIig/OlteXFxcXCpdfF4pKFxcXFw6KFthLXowLTlfXFxcXC1cXFxcK10rKVxcXFw6KSg/IVxcXFwqKVwiO1xuXG4gIHN0YXRpYyB0b0NvZGVQb2ludCh1bmljb2RlU3Vycm9nYXRlczogc3RyaW5nLCBzZXA/OiBzdHJpbmcpIHtcbiAgICBjb25zdCByID0gW107XG4gICAgbGV0IGMgPSAwO1xuICAgIGxldCBwID0gMDtcbiAgICBsZXQgaSA9IDA7XG5cbiAgICB3aGlsZSAoaSA8IHVuaWNvZGVTdXJyb2dhdGVzLmxlbmd0aCkge1xuICAgICAgYyA9IHVuaWNvZGVTdXJyb2dhdGVzLmNoYXJDb2RlQXQoaSsrKTtcbiAgICAgIGlmIChwKSB7XG4gICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1iaXR3aXNlXG4gICAgICAgIHIucHVzaCgoMHgxMDAwMCArICgocCAtIDB4ZDgwMCkgPDwgMTApICsgKGMgLSAweGRjMDApKS50b1N0cmluZygxNikpO1xuICAgICAgICBwID0gMDtcbiAgICAgIH0gZWxzZSBpZiAoMHhkODAwIDw9IGMgJiYgYyA8PSAweGRiZmYpIHtcbiAgICAgICAgcCA9IGM7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByLnB1c2goYy50b1N0cmluZygxNikpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiByLmpvaW4oc2VwIHx8IFwiLVwiKTtcbiAgfVxuXG4gIHN0YXRpYyB1bmljb2RlVG9FbW9qaSh1bmljb2RlOiBzdHJpbmcpOiBJRW1vamkge1xuICAgIHJldHVybiBFbW9qaS5nZXRFbW9qaURhdGFGcm9tVW5pZmllZChFbW9qaS50b0NvZGVQb2ludCh1bmljb2RlKSk7XG4gIH1cblxuICBzdGF0aWMgZW1vdGljb25Ub0Vtb2ppKGVtb3RpY29uOiBzdHJpbmcpOiBJRW1vamkge1xuICAgIHJldHVybiBFbW9qaS5nZXRFbW9qaURhdGFGcm9tRW1vdGljb24oZW1vdGljb24pO1xuICB9XG5cbiAgc3RhdGljIHNob3J0TmFtZVRvRW1vamkoc2hvcnROYW1lOiBzdHJpbmcpOiBJRW1vamkge1xuICAgIHJldHVybiBFbW9qaS5nZXRFbW9qaURhdGFGcm9tU2hvcnROYW1lKHNob3J0TmFtZSk7XG4gIH1cblxuICBzdGF0aWMgZ2V0RW1vamlEYXRhRnJvbVVuaWZpZWQodW5pZmllZDogc3RyaW5nKTogSUVtb2ppIHtcbiAgICBjb25zdCBlbW9qaSA9IEVtb2ppLnVuaWZpZWRbdW5pZmllZC50b1VwcGVyQ2FzZSgpXTtcblxuICAgIHJldHVybiBlbW9qaSA/IGVtb2ppIDogbnVsbDtcbiAgfVxuXG4gIHN0YXRpYyBnZXRFbW9qaURhdGFGcm9tRW1vdGljb24oZW1vdGljb246IHN0cmluZyk6IElFbW9qaSB7XG4gICAgY29uc3QgZW1vamkgPSBFbW9qaS5lbW90aWNvbnNbZW1vdGljb25dO1xuXG4gICAgcmV0dXJuIGVtb2ppID8gZW1vamkgOiBudWxsO1xuICB9XG5cbiAgc3RhdGljIGdldEVtb2ppRGF0YUZyb21TaG9ydE5hbWUoc2hvcnROYW1lOiBzdHJpbmcpOiBJRW1vamkge1xuICAgIGNvbnN0IGVtb2ppID0gRW1vamkuc2hvcnROYW1lc1tzaG9ydE5hbWUudG9Mb3dlckNhc2UoKV07XG5cbiAgICByZXR1cm4gZW1vamkgPyBlbW9qaSA6IG51bGw7XG4gIH1cblxuICBzdGF0aWMgdW5jb21wcmVzcyhsaXN0OiBDb21wcmVzc2VkRW1vamlEYXRhW10sIG9wdGlvbnM6IEVtb2ppTW9kdWxlT3B0aW9ucykge1xuICAgIGxpc3QubWFwKChlbW9qaSkgPT4ge1xuICAgICAgY29uc3QgZW1vamlSZWYgPSAoRW1vamkudW5pZmllZFtlbW9qaS51bmlmaWVkXSA9IHtcbiAgICAgICAgdW5pZmllZDogZW1vamkudW5pZmllZCxcbiAgICAgICAgaWQ6IGVtb2ppLnNob3J0TmFtZSxcbiAgICAgICAgc2hlZXQ6IGVtb2ppLnNoZWV0LFxuICAgICAgICBlbW90aWNvbnM6IGVtb2ppLmVtb3RpY29ucyxcbiAgICAgIH0pO1xuXG4gICAgICBFbW9qaS5zaG9ydE5hbWVzW2Vtb2ppLnNob3J0TmFtZV0gPSBlbW9qaVJlZjtcblxuICAgICAgLy8gQWRkaXRpb25hbCBzaG9ydE5hbWVzXG4gICAgICBpZiAoZW1vamkuc2hvcnROYW1lcykge1xuICAgICAgICBmb3IgKGNvbnN0IGQgb2YgZW1vamkuc2hvcnROYW1lcykge1xuICAgICAgICAgIEVtb2ppLnNob3J0TmFtZXNbZF0gPSBlbW9qaVJlZjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAob3B0aW9ucy5jb252ZXJ0RW1vdGljb25zICYmIGVtb2ppLmVtb3RpY29ucykge1xuICAgICAgICBmb3IgKGNvbnN0IGQgb2YgZW1vamkuZW1vdGljb25zKSB7XG4gICAgICAgICAgRW1vamkuZW1vdGljb25zW2RdID0gZW1vamlSZWY7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGVtb2ppLnNraW5WYXJpYXRpb25zKSB7XG4gICAgICAgIGZvciAoY29uc3QgZCBvZiBlbW9qaS5za2luVmFyaWF0aW9ucykge1xuICAgICAgICAgIEVtb2ppLnVuaWZpZWRbZC51bmlmaWVkXSA9IHtcbiAgICAgICAgICAgIHVuaWZpZWQ6IGQudW5pZmllZCxcbiAgICAgICAgICAgIGlkOiBlbW9qaVJlZi5pZCxcbiAgICAgICAgICAgIHNoZWV0OiBkLnNoZWV0LFxuICAgICAgICAgICAgZW1vdGljb25zOiBlbW9qaVJlZi5lbW90aWNvbnMsXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYgKG9wdGlvbnMuY3VzdG9tRW1vamlEYXRhKSB7XG4gICAgICBmb3IgKGxldCBjdXN0b21FbW9qaSBvZiBvcHRpb25zLmN1c3RvbUVtb2ppRGF0YSkge1xuICAgICAgICBpZiAoY3VzdG9tRW1vamkuc2hvcnROYW1lcykge1xuICAgICAgICAgIGN1c3RvbUVtb2ppID0geyAuLi5jdXN0b21FbW9qaSwgaWQ6IGN1c3RvbUVtb2ppLnNob3J0TmFtZXNbMF0gfTtcbiAgICAgICAgICBFbW9qaS5zaG9ydE5hbWVzW2N1c3RvbUVtb2ppLmlkXSA9IGN1c3RvbUVtb2ppO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgc3RhdGljIHVuaWZpZWRUb05hdGl2ZSh1bmlmaWVkOiBzdHJpbmcpIHtcbiAgICBjb25zdCBjb2RlUG9pbnRzID0gdW5pZmllZC5zcGxpdChcIi1cIikubWFwKCh1KSA9PiBwYXJzZUludChgMHgke3V9YCwgMTYpKTtcbiAgICByZXR1cm4gU3RyaW5nLmZyb21Db2RlUG9pbnQoLi4uY29kZVBvaW50cyk7XG4gIH1cblxuICBzdGF0aWMgZW1vamlTcHJpdGVTdHlsZXMoXG4gICAgc2hlZXQ6IElFbW9qaVZpZXdbXCJzaGVldFwiXSxcbiAgICBzZXQ6IEVtb2ppU2V0IHwgXCJcIixcbiAgICBiYWNrZ3JvdW5kSW1hZ2VGbjogKHNldDogc3RyaW5nLCBzaGVldFNpemU6IG51bWJlcikgPT4gc3RyaW5nLFxuICAgIHNpemU6IG51bWJlciA9IDI0LFxuICAgIHNoZWV0U2l6ZTogMTYgfCAyMCB8IDMyIHwgNjQgPSA2NCxcbiAgICBzaGVldENvbHVtbnMgPSA1MlxuICApIHtcbiAgICByZXR1cm4ge1xuICAgICAgd2lkdGg6IGAke3NpemV9cHhgLFxuICAgICAgaGVpZ2h0OiBgJHtzaXplfXB4YCxcbiAgICAgIGRpc3BsYXk6IFwiaW5saW5lLWJsb2NrXCIsXG4gICAgICBcImJhY2tncm91bmQtaW1hZ2VcIjogYHVybCgke2JhY2tncm91bmRJbWFnZUZuKHNldCwgc2hlZXRTaXplKX0pYCxcbiAgICAgIFwiYmFja2dyb3VuZC1zaXplXCI6IGAkezEwMCAqIHNoZWV0Q29sdW1uc30lYCxcbiAgICAgIFwiYmFja2dyb3VuZC1wb3NpdGlvblwiOiBFbW9qaS5nZXRTcHJpdGVQb3NpdGlvbihzaGVldCwgc2hlZXRDb2x1bW5zKSxcbiAgICB9O1xuICB9XG5cbiAgc3RhdGljIGdldFNwcml0ZVBvc2l0aW9uKHNoZWV0OiBJRW1vamlWaWV3W1wic2hlZXRcIl0sIHNoZWV0Q29sdW1uczogbnVtYmVyKSB7XG4gICAgY29uc3QgW3NoZWV0WCwgc2hlZXRZXSA9IHNoZWV0O1xuICAgIGNvbnN0IG11bHRpcGx5ID0gMTAwIC8gKHNoZWV0Q29sdW1ucyAtIDEpO1xuICAgIHJldHVybiBgJHttdWx0aXBseSAqIHNoZWV0WH0lICR7bXVsdGlwbHkgKiBzaGVldFl9JWA7XG4gIH1cblxuICBzdGF0aWMgdG9IZXgoc3RyOiBzdHJpbmcpIHtcbiAgICBsZXQgaGV4OiBzdHJpbmc7XG4gICAgbGV0IHJlc3VsdCA9IFwiXCI7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgICAgaGV4ID0gc3RyLmNoYXJDb2RlQXQoaSkudG9TdHJpbmcoMTYpO1xuICAgICAgcmVzdWx0ICs9IChcIjAwMFwiICsgaGV4KS5zbGljZSgtNCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIHN0YXRpYyBidWlsZEltYWdlKFxuICAgIGVtb2ppOiBzdHJpbmcgfCBJRW1vamksXG4gICAgbm9kZTogSFRNTEVsZW1lbnQsXG4gICAgc2V0OiBFbW9qaVNldCxcbiAgICBvcHRpb25zOiBFbW9qaU1vZHVsZU9wdGlvbnNcbiAgKSB7XG4gICAgaWYgKHR5cGVvZiBlbW9qaSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgY29uc3QgdW5pY29kZVJlZ2V4ID0gdW5pY29kZVJlKCk7XG5cbiAgICAgIGlmICh1bmljb2RlUmVnZXgudGVzdChlbW9qaSkpIHtcbiAgICAgICAgZW1vamkgPSBFbW9qaS51bmljb2RlVG9FbW9qaShlbW9qaSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBzaG9ydE5hbWVSZWdleCA9IG5ldyBSZWdFeHAoRW1vamkuc2hvcnROYW1lUmUpO1xuICAgICAgICBjb25zdCBtYXRjaCA9IHNob3J0TmFtZVJlZ2V4LmV4ZWMoZW1vamkpO1xuICAgICAgICBpZiAobWF0Y2ggJiYgbWF0Y2gubGVuZ3RoID4gMSkge1xuICAgICAgICAgIGVtb2ppID0gRW1vamkuc2hvcnROYW1lVG9FbW9qaShtYXRjaFsxXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoZW1vamkgJiYgdHlwZW9mIGVtb2ppID09PSBcIm9iamVjdFwiKSB7XG4gICAgICBub2RlLmNsYXNzTGlzdC5hZGQoRW1vamkuZW1vamlQcmVmaXggKyBlbW9qaS5pZCk7XG5cbiAgICAgIC8vIEN1c3RvbSBpbWFnZVxuICAgICAgaWYgKChlbW9qaSBhcyBJQ3VzdG9tSW1hZ2VFbW9qaVZpZXcpLmltYWdlVXJsKSB7XG4gICAgICAgIG5vZGUuY2xhc3NMaXN0LmFkZChFbW9qaS5lbW9qaVByZWZpeCArIFwiY3VzdG9tXCIpO1xuXG4gICAgICAgIG5vZGUuc3R5bGUuYmFja2dyb3VuZEltYWdlID0gYHVybChcIiR7XG4gICAgICAgICAgKGVtb2ppIGFzIElDdXN0b21JbWFnZUVtb2ppVmlldykuaW1hZ2VVcmxcbiAgICAgICAgfVwiKWA7XG4gICAgICAgIG5vZGUuc3R5bGUuYmFja2dyb3VuZFNpemUgPSBcImNvbnRhaW5cIjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFVzaW5nIGEgc3ByaXRlXG4gICAgICAgIGxldCBzdHlsZSA9IG51bGw7XG5cbiAgICAgICAgLy8gRGVmYXVsdCBlbW9qaSB1c2luZyBhIHNldFxuICAgICAgICBpZiAoKGVtb2ppIGFzIElFbW9qaVZpZXcpLnNoZWV0KSB7XG4gICAgICAgICAgc3R5bGUgPSBFbW9qaS5lbW9qaVNwcml0ZVN0eWxlcyhcbiAgICAgICAgICAgIChlbW9qaSBhcyBJRW1vamlWaWV3KS5zaGVldCxcbiAgICAgICAgICAgIHNldCxcbiAgICAgICAgICAgIG9wdGlvbnMuYmFja2dyb3VuZEltYWdlRm5cbiAgICAgICAgICApO1xuICAgICAgICB9IGVsc2UgaWYgKChlbW9qaSBhcyBJQ3VzdG9tU3ByaXRlRW1vamlWaWV3KS5zcHJpdGVVcmwpIHtcbiAgICAgICAgICAvLyBFbW9qaSB1c2luZyBhIHNwcml0ZSBVUkxcblxuICAgICAgICAgIG5vZGUuY2xhc3NMaXN0LmFkZChFbW9qaS5lbW9qaVByZWZpeCArIFwiY3VzdG9tXCIpO1xuXG4gICAgICAgICAgc3R5bGUgPSBFbW9qaS5lbW9qaVNwcml0ZVN0eWxlcyhcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgKGVtb2ppIGFzIElDdXN0b21TcHJpdGVFbW9qaVZpZXcpLnNoZWV0X3gsXG4gICAgICAgICAgICAgIChlbW9qaSBhcyBJQ3VzdG9tU3ByaXRlRW1vamlWaWV3KS5zaGVldF95LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFwiXCIsXG4gICAgICAgICAgICAoKSA9PiAoZW1vamkgYXMgSUN1c3RvbVNwcml0ZUVtb2ppVmlldykuc3ByaXRlVXJsLFxuICAgICAgICAgICAgMjQsXG4gICAgICAgICAgICAoZW1vamkgYXMgSUN1c3RvbVNwcml0ZUVtb2ppVmlldykuc2l6ZSxcbiAgICAgICAgICAgIChlbW9qaSBhcyBJQ3VzdG9tU3ByaXRlRW1vamlWaWV3KS5zaGVldENvbHVtbnNcbiAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHN0eWxlKSB7XG4gICAgICAgICAgbm9kZS5zdHlsZS5kaXNwbGF5ID0gXCJpbmxpbmUtYmxvY2tcIjtcbiAgICAgICAgICBub2RlLnN0eWxlLmJhY2tncm91bmRJbWFnZSA9IHN0eWxlW1wiYmFja2dyb3VuZC1pbWFnZVwiXTtcbiAgICAgICAgICBub2RlLnN0eWxlLmJhY2tncm91bmRTaXplID0gc3R5bGVbXCJiYWNrZ3JvdW5kLXNpemVcIl07XG4gICAgICAgICAgbm9kZS5zdHlsZS5iYWNrZ3JvdW5kUG9zaXRpb24gPSBzdHlsZVtcImJhY2tncm91bmQtcG9zaXRpb25cIl07XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgbm9kZS5zdHlsZS5mb250U2l6ZSA9IFwiaW5oZXJpdFwiO1xuXG4gICAgICBub2RlLnNldEF0dHJpYnV0ZShcbiAgICAgICAgXCJzcmNcIixcbiAgICAgICAgXCJkYXRhOmltYWdlL2dpZjtiYXNlNjQsUjBsR09EbGhBUUFCQUlBQUFBQUFBUC8vL3lINUJBRUFBQUFBTEFBQUFBQUJBQUVBQUFJQlJBQTdcIlxuICAgICAgKTtcbiAgICAgIG5vZGUuc2V0QXR0cmlidXRlKFwiZHJhZ2dhYmxlXCIsIFwiZmFsc2VcIik7XG5cbiAgICAgIGlmICgoZW1vamkgYXMgSUVtb2ppVmlldykudW5pZmllZCkge1xuICAgICAgICBjb25zdCBuYXRpdmUgPSBFbW9qaS51bmlmaWVkVG9OYXRpdmUoKGVtb2ppIGFzIElFbW9qaVZpZXcpLnVuaWZpZWQpO1xuICAgICAgICBub2RlLnNldEF0dHJpYnV0ZShcImFsdFwiLCBuYXRpdmUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbm9kZS5zZXRBdHRyaWJ1dGUoXG4gICAgICAgICAgXCJhbHRcIixcbiAgICAgICAgICBvcHRpb25zLmluZGljYXRvciArIGVtb2ppLmlkICsgb3B0aW9ucy5pbmRpY2F0b3JcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgaWYgKG9wdGlvbnMuc2hvd1RpdGxlKSB7XG4gICAgICAgIGNvbnN0IGVtb3RpY29ucyA9IChlbW9qaSBhcyBJRW1vamlWaWV3KS5lbW90aWNvbnM7XG5cbiAgICAgICAgbGV0IHRpdGxlID0gXCJcIjtcblxuICAgICAgICBpZiAob3B0aW9ucy5jb252ZXJ0RW1vdGljb25zICYmIGVtb3RpY29ucyAmJiBlbW90aWNvbnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgIHRpdGxlID0gZW1vdGljb25zWzBdICsgXCJcXHUyMDAyLFxcdTIwMDJcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRpdGxlICs9IG9wdGlvbnMuaW5kaWNhdG9yICsgZW1vamkuaWQgKyBvcHRpb25zLmluZGljYXRvcjtcblxuICAgICAgICBub2RlLnNldEF0dHJpYnV0ZShcInRpdGxlXCIsIHRpdGxlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cblxuICBzdGF0aWMgY29udmVydElucHV0KGRlbHRhOiBhbnksIHJlcGxhY2VtZW50czogSUVtb2ppUmVwbGFjZW1lbnQpOiBhbnkge1xuICAgIGNvbnN0IGNoYW5nZXMgPSBuZXcgRGVsdGEoKTtcblxuICAgIGxldCBwb3NpdGlvbiA9IDA7XG5cbiAgICBkZWx0YS5vcHMuZm9yRWFjaCgob3A6IGFueSkgPT4ge1xuICAgICAgaWYgKG9wLmluc2VydCkge1xuICAgICAgICBpZiAodHlwZW9mIG9wLmluc2VydCA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgIHBvc2l0aW9uKys7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIG9wLmluc2VydCA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgIGNvbnN0IHRleHQgPSBvcC5pbnNlcnQ7XG5cbiAgICAgICAgICBsZXQgZW1vamlUZXh0ID0gXCJcIjtcbiAgICAgICAgICBsZXQgaW5kZXg6IG51bWJlcjtcblxuICAgICAgICAgIGZvciAoY29uc3QgcmVwbGFjZW1lbnQgb2YgcmVwbGFjZW1lbnRzKSB7XG4gICAgICAgICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6IG5vLWNvbmRpdGlvbmFsLWFzc2lnbm1lbnRcbiAgICAgICAgICAgIHdoaWxlICgocmVwbGFjZW1lbnQubWF0Y2ggPSByZXBsYWNlbWVudC5yZWdleC5leGVjKHRleHQpKSkge1xuICAgICAgICAgICAgICAvLyBTZXR0aW5nIHRoZSBpbmRleCBhbmQgdXNpbmcgdGhlIGRpZmZlcmVuY2UgYmV0d2VlbiB0aGUgbWF0Y2hlcyBhcyBhIHdvcmthcm91bmQgZm9yIGEgbG9va2FoZWFkIHJlZ2V4XG4gICAgICAgICAgICAgIGluZGV4ID1cbiAgICAgICAgICAgICAgICByZXBsYWNlbWVudC5tYXRjaC5pbmRleCArXG4gICAgICAgICAgICAgICAgKHJlcGxhY2VtZW50Lm1hdGNoWzBdLmxlbmd0aCAtXG4gICAgICAgICAgICAgICAgICByZXBsYWNlbWVudC5tYXRjaFtyZXBsYWNlbWVudC5yZXBsYWNlbWVudEluZGV4XS5sZW5ndGgpO1xuXG4gICAgICAgICAgICAgIGVtb2ppVGV4dCA9IHJlcGxhY2VtZW50Lm1hdGNoW3JlcGxhY2VtZW50Lm1hdGNoSW5kZXhdO1xuXG4gICAgICAgICAgICAgIGNvbnN0IGVtb2ppID0gcmVwbGFjZW1lbnQuZm4oZW1vamlUZXh0KTtcblxuICAgICAgICAgICAgICBjb25zdCBjaGFuZ2VJbmRleCA9IHBvc2l0aW9uICsgaW5kZXg7XG5cbiAgICAgICAgICAgICAgaWYgKGNoYW5nZUluZGV4ID4gMCkge1xuICAgICAgICAgICAgICAgIGNoYW5nZXMucmV0YWluKGNoYW5nZUluZGV4KTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGNoYW5nZXMuZGVsZXRlKFxuICAgICAgICAgICAgICAgIHJlcGxhY2VtZW50Lm1hdGNoW3JlcGxhY2VtZW50LnJlcGxhY2VtZW50SW5kZXhdLmxlbmd0aFxuICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgIGlmIChlbW9qaSkge1xuICAgICAgICAgICAgICAgIGNoYW5nZXMuaW5zZXJ0KHsgZW1vamkgfSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBwb3NpdGlvbiArPSBvcC5pbnNlcnQubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gY2hhbmdlcztcbiAgfVxuXG4gIHN0YXRpYyBjb252ZXJ0UGFzdGUoZGVsdGE6IGFueSwgcmVwbGFjZW1lbnRzOiBJRW1vamlSZXBsYWNlbWVudCk6IGFueSB7XG4gICAgY29uc3QgY2hhbmdlcyA9IG5ldyBEZWx0YSgpO1xuICAgIGxldCBvcCA9IG51bGw7XG5cbiAgICAvLyBNYXRjaGVycyBhcmUgY2FsbGVkIHJlY3Vyc2l2ZWx5LCBzbyBpdGVyYXRpbmcgaXMgbm90IG5lY2Vzc2FyeVxuICAgIGlmIChkZWx0YSkge1xuICAgICAgb3AgPSBkZWx0YS5vcHNbMF07XG4gICAgfVxuXG4gICAgaWYgKG9wICYmIG9wLmluc2VydCAmJiB0eXBlb2Ygb3AuaW5zZXJ0ID09PSBcInN0cmluZ1wiKSB7XG4gICAgICBjb25zdCB0ZXh0ID0gb3AuaW5zZXJ0O1xuXG4gICAgICBsZXQgZW1vamlUZXh0ID0gXCJcIjtcbiAgICAgIGxldCBjdXJyZW50UmVwbGFjZW1lbnQ6IElFbW9qaVJlcGxhY2VyID0gbnVsbDtcbiAgICAgIGxldCBpbmRleCA9IDA7XG5cbiAgICAgIGxldCBpID0gMDtcblxuICAgICAgZG8ge1xuICAgICAgICAvLyBHZXR0aW5nIG91ciBmaXJzdCBtYXRjaFxuICAgICAgICBsZXQgdGVtcFJlcGxhY2VtZW50OiBJRW1vamlSZXBsYWNlciA9IG51bGw7XG4gICAgICAgIGZvciAoY29uc3QgcmVwbGFjZW1lbnQgb2YgcmVwbGFjZW1lbnRzKSB7XG4gICAgICAgICAgLy8gU2VsZWN0IHRoZSBmaXJzdCBtYXRjaCBpbiB0aGUgcmVwbGFjZW1lbnRzIGFycmF5XG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgcmVwbGFjZW1lbnQubWF0Y2ggPT09IHVuZGVmaW5lZCB8fFxuICAgICAgICAgICAgY3VycmVudFJlcGxhY2VtZW50ID09PSByZXBsYWNlbWVudFxuICAgICAgICAgICkge1xuICAgICAgICAgICAgcmVwbGFjZW1lbnQubWF0Y2ggPSByZXBsYWNlbWVudC5yZWdleC5leGVjKHRleHQpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChyZXBsYWNlbWVudC5tYXRjaCkge1xuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAhdGVtcFJlcGxhY2VtZW50IHx8XG4gICAgICAgICAgICAgICF0ZW1wUmVwbGFjZW1lbnQubWF0Y2ggfHxcbiAgICAgICAgICAgICAgcmVwbGFjZW1lbnQubWF0Y2guaW5kZXggPCB0ZW1wUmVwbGFjZW1lbnQubWF0Y2guaW5kZXhcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICB0ZW1wUmVwbGFjZW1lbnQgPSByZXBsYWNlbWVudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjdXJyZW50UmVwbGFjZW1lbnQgPSB0ZW1wUmVwbGFjZW1lbnQ7XG5cbiAgICAgICAgaWYgKGN1cnJlbnRSZXBsYWNlbWVudCAmJiBjdXJyZW50UmVwbGFjZW1lbnQubWF0Y2gpIHtcbiAgICAgICAgICAvLyBTZXR0aW5nIHRoZSBpbmRleCBhbmQgdXNpbmcgdGhlIGRpZmZlcmVuY2UgYmV0d2VlbiB0aGUgbWF0Y2hlcyBhcyBhIHdvcmthcm91bmQgZm9yIGEgbG9va2FoZWFkIHJlZ2V4XG4gICAgICAgICAgaW5kZXggPVxuICAgICAgICAgICAgY3VycmVudFJlcGxhY2VtZW50Lm1hdGNoLmluZGV4ICtcbiAgICAgICAgICAgIChjdXJyZW50UmVwbGFjZW1lbnQubWF0Y2hbMF0ubGVuZ3RoIC1cbiAgICAgICAgICAgICAgY3VycmVudFJlcGxhY2VtZW50Lm1hdGNoW2N1cnJlbnRSZXBsYWNlbWVudC5yZXBsYWNlbWVudEluZGV4XVxuICAgICAgICAgICAgICAgIC5sZW5ndGgpO1xuXG4gICAgICAgICAgaWYgKGluZGV4ICE9PSBpKSB7XG4gICAgICAgICAgICBjaGFuZ2VzLmluc2VydCh0ZXh0LnNsaWNlKGksIGluZGV4KSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZW1vamlUZXh0ID0gY3VycmVudFJlcGxhY2VtZW50Lm1hdGNoW2N1cnJlbnRSZXBsYWNlbWVudC5tYXRjaEluZGV4XTtcbiAgICAgICAgICBjb25zdCBlbW9qaSA9IGN1cnJlbnRSZXBsYWNlbWVudC5mbihlbW9qaVRleHQpO1xuXG4gICAgICAgICAgaWYgKGVtb2ppKSB7XG4gICAgICAgICAgICBjaGFuZ2VzLmluc2VydCh7IGVtb2ppIH0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGkgPVxuICAgICAgICAgICAgaW5kZXggK1xuICAgICAgICAgICAgY3VycmVudFJlcGxhY2VtZW50Lm1hdGNoW2N1cnJlbnRSZXBsYWNlbWVudC5yZXBsYWNlbWVudEluZGV4XVxuICAgICAgICAgICAgICAubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICB9IHdoaWxlIChjdXJyZW50UmVwbGFjZW1lbnQgJiYgY3VycmVudFJlcGxhY2VtZW50Lm1hdGNoKTtcblxuICAgICAgLy8gQ2hlY2sgaWYgdGhlcmUgaXMgdGV4dCBsZWZ0XG4gICAgICBpZiAoaSA8IHRleHQubGVuZ3RoKSB7XG4gICAgICAgIGNoYW5nZXMuaW5zZXJ0KHRleHQuc2xpY2UoaSkpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY2hhbmdlcztcbiAgfVxuXG4gIHN0YXRpYyBpbnNlcnRFbW9qaShxdWlsbDogYW55LCBldmVudDogYW55KSB7XG4gICAgaWYgKHF1aWxsICYmIHF1aWxsLmlzRW5hYmxlZCgpKSB7XG4gICAgICBjb25zdCByYW5nZSA9IHF1aWxsLmdldFNlbGVjdGlvbih0cnVlKTtcblxuICAgICAgY29uc3QgZGVsdGEgPSBuZXcgRGVsdGEoKVxuICAgICAgICAucmV0YWluKHJhbmdlLmluZGV4KVxuICAgICAgICAuZGVsZXRlKHJhbmdlLmxlbmd0aClcbiAgICAgICAgLmluc2VydCh7IGVtb2ppOiBldmVudC5lbW9qaSB9KTtcblxuICAgICAgLy8gVXNpbmcgc2lsZW50IHRvIG5vdCB0cmlnZ2VyIHRleHQtY2hhbmdlLCBidXQgY2hlY2tpbmcgaWYgdGhlIGVkaXRvciBpcyBlbmFibGVkXG4gICAgICBxdWlsbC51cGRhdGVDb250ZW50cyhkZWx0YSwgUXVpbGwuc291cmNlcy5TSUxFTlQpO1xuICAgICAgcXVpbGwuc2V0U2VsZWN0aW9uKCsrcmFuZ2UuaW5kZXgsIDAsIFF1aWxsLnNvdXJjZXMuU0lMRU5UKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==