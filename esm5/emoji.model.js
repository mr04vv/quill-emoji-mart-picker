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
        var emoji = Emoji.shortNames[(shortName.includes(":")
            ? shortName.split(":")[1]
            : shortName).toLowerCase()];
        console.debug(shortName);
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
                    console.debug(emoji);
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
        console.debug("here");
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
                                else {
                                    changes.insert("" + emojiText);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW1vamkubW9kZWwuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9AbnV0cmlmeS9xdWlsbC1lbW9qaS1tYXJ0LXBpY2tlci8iLCJzb3VyY2VzIjpbImVtb2ppLm1vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLFNBQVMsTUFBTSxhQUFhLENBQUM7QUFDcEMsT0FBTyxLQUFLLE1BQU0sT0FBTyxDQUFDO0FBSTFCLElBQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7QUE0RHBDO0lBQUE7SUF3WkEsQ0FBQztJQTdZUSxpQkFBVyxHQUFsQixVQUFtQixpQkFBeUIsRUFBRSxHQUFZO1FBQ3hELElBQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNiLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNWLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNWLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUVWLE9BQU8sQ0FBQyxHQUFHLGlCQUFpQixDQUFDLE1BQU0sRUFBRTtZQUNuQyxDQUFDLEdBQUcsaUJBQWlCLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDdEMsSUFBSSxDQUFDLEVBQUU7Z0JBQ0wsc0NBQXNDO2dCQUN0QyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDckUsQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUNQO2lCQUFNLElBQUksTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksTUFBTSxFQUFFO2dCQUNyQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ1A7aUJBQU07Z0JBQ0wsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsUUFBUSxD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S0FBSyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQzVEO0lBQ0gsQ0FBQztJQXRaTSxhQUFPLEdBQThCLEVBQUUsQ0FBQztJQUN4QyxlQUFTLEdBQThCLEVBQUUsQ0FBQztJQUMxQyxnQkFBVSxHQUE4QixFQUFFLENBQUM7SUFFM0MsaUJBQVcsR0FBRyxNQUFNLENBQUM7SUFFNUIsNENBQTRDO0lBQ3JDLGdCQUFVLEdBQUcsK1pBQStaLENBQUM7SUFDN2EsaUJBQVcsR0FBRywrQ0FBK0MsQ0FBQztJQStZdkUsWUFBQztDQUFBLEFBeFpELElBd1pDO1NBeFpZLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdW5pY29kZVJlIGZyb20gXCJlbW9qaS1yZWdleFwiO1xuaW1wb3J0IFF1aWxsIGZyb20gXCJxdWlsbFwiO1xuXG5pbXBvcnQgeyBFbW9qaU1vZHVsZU9wdGlvbnMsIEVtb2ppU2V0IH0gZnJvbSBcIi4vZW1vamkucXVpbGwtbW9kdWxlXCI7XG5cbmNvbnN0IERlbHRhID0gUXVpbGwuaW1wb3J0KFwiZGVsdGFcIik7XG5cbmV4cG9ydCB0eXBlIElDdXN0b21FbW9qaSA9IElDdXN0b21JbWFnZUVtb2ppVmlldyB8IElDdXN0b21TcHJpdGVFbW9qaVZpZXc7XG5leHBvcnQgdHlwZSBJRW1vamkgPSBJRW1vamlWaWV3IHwgSUN1c3RvbUVtb2ppO1xuXG5leHBvcnQgaW50ZXJmYWNlIENvbXByZXNzZWRFbW9qaURhdGEge1xuICBuYW1lOiBzdHJpbmc7XG4gIHVuaWZpZWQ6IHN0cmluZztcbiAgc2hvcnROYW1lOiBzdHJpbmc7XG4gIHNob3J0TmFtZXM/OiBzdHJpbmdbXTtcbiAgc2hlZXQ6IFtudW1iZXIsIG51bWJlcl07XG4gIGtleXdvcmRzPzogc3RyaW5nW107XG4gIGhpZGRlbj86IHN0cmluZ1tdO1xuICBlbW90aWNvbnM/OiBzdHJpbmdbXTtcbiAgdGV4dD86IHN0cmluZztcbiAgc2tpblZhcmlhdGlvbnM/OiBFbW9qaVZhcmlhdGlvbltdO1xuICBvYnNvbGV0ZWRCeT86IHN0cmluZztcbiAgb2Jzb2xldGVzPzogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIElFbW9qaVJlcGxhY2VyIHtcbiAgcmVnZXg6IFJlZ0V4cDtcbiAgZm46IChzdHI6IHN0cmluZykgPT4gSUVtb2ppIHwgc3RyaW5nO1xuICBtYXRjaEluZGV4OiBudW1iZXI7XG4gIHJlcGxhY2VtZW50SW5kZXg6IG51bWJlcjsgLy8gV29ya2Fyb3VuZCB0byBzdXBwb3J0IHJlZ2V4IGxvb2thaGVhZCBvbiBhbGwgYnJvd3NlcnNcbiAgbWF0Y2g/OiBSZWdFeHBFeGVjQXJyYXk7XG59XG5cbmV4cG9ydCB0eXBlIElFbW9qaVJlcGxhY2VtZW50ID0gSUVtb2ppUmVwbGFjZXJbXTtcblxuaW50ZXJmYWNlIElFbW9qaVZpZXcge1xuICB1bmlmaWVkOiBzdHJpbmc7XG4gIGlkOiBzdHJpbmc7XG4gIHNoZWV0OiBbbnVtYmVyLCBudW1iZXJdO1xuICBlbW90aWNvbnM/OiBzdHJpbmdbXTtcbn1cblxuaW50ZXJmYWNlIElDdXN0b21JbWFnZUVtb2ppVmlldyB7XG4gIGlkOiBzdHJpbmc7XG4gIGltYWdlVXJsOiBzdHJpbmc7XG4gIHNob3J0TmFtZXM/OiBzdHJpbmdbXTtcbn1cblxuaW50ZXJmYWNlIElDdXN0b21TcHJpdGVFbW9qaVZpZXcge1xuICBpZDogc3RyaW5nO1xuICBzcHJpdGVVcmw6IHN0cmluZztcbiAgc2hlZXRfeDogbnVtYmVyO1xuICBzaGVldF95OiBudW1iZXI7XG4gIHNpemU6IDE2IHwgMjAgfCAzMiB8IDY0O1xuICBzaGVldENvbHVtbnM6IG51bWJlcjtcbiAgc2hlZXRSb3dzPzogbnVtYmVyOyAvLyBOb3QgcmVhbGx5IG5lY2Vzc2FyeVxuICBzaG9ydE5hbWVzPzogc3RyaW5nW107XG59XG5cbmludGVyZmFjZSBFbW9qaVZhcmlhdGlvbiB7XG4gIHVuaWZpZWQ6IHN0cmluZztcbiAgc2hlZXQ6IFtudW1iZXIsIG51bWJlcl07XG4gIGhpZGRlbj86IHN0cmluZ1tdO1xufVxuXG5leHBvcnQgY2xhc3MgRW1vamkge1xuICBzdGF0aWMgdW5pZmllZDogeyBba2V5OiBzdHJpbmddOiBJRW1vamkgfSA9IHt9O1xuICBzdGF0aWMgZW1vdGljb25zOiB7IFtrZXk6IHN0cmluZ106IElFbW9qaSB9ID0ge307XG4gIHN0YXRpYyBzaG9ydE5hbWVzOiB7IFtrZXk6IHN0cmluZ106IElFbW9qaSB9ID0ge307XG5cbiAgc3RhdGljIGVtb2ppUHJlZml4ID0gXCJxbGUtXCI7XG5cbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOiBtYXgtbGluZS1sZW5ndGhcbiAgc3RhdGljIGVtb3RpY29uUmUgPSBgKD86XFxcXHN8XikoKD86OFxcXFwpKXwoPzpcXFxcKDopfCg/OlxcXFwpOil8KD86OidcXFxcKCl8KD86OlxcXFwoKXwoPzo6XFxcXCkpfCg/OjpcXFxcKil8KD86Oi1cXFxcKCl8KD86Oi1cXFxcKSl8KD86Oi1cXFxcKil8KD86Oi0vKXwoPzo6LT4pfCg/OjotRCl8KD86Oi1PKXwoPzo6LVApfCg/OjotXFxcXFxcXFwpfCg/OjotYil8KD86Oi1vKXwoPzo6LXApfCg/OjotXFxcXHwpfCg/OjovKXwoPzo6Pil8KD86OkQpfCg/OjpPKXwoPzo6UCl8KD86OlxcXFxcXFxcKXwoPzo6Yil8KD86Om8pfCg/OjpwKXwoPzo6XFxcXHwpfCg/OjtcXFxcKSl8KD86Oy1cXFxcKSl8KD86Oy1QKXwoPzo7LWIpfCg/OjstcCl8KD86O1ApfCg/OjtiKXwoPzo7cCl8KD86PDMpfCg/OjwvMyl8KD86PVxcXFwpKXwoPzo9LVxcXFwpKXwoPzo+OlxcXFwoKXwoPzo+Oi1cXFxcKCl8KD86QzopfCg/OkQ6KXwoPzpjOikpKD89XFxcXHN8JClgO1xuICBzdGF0aWMgc2hvcnROYW1lUmUgPSBcIig/OlteXFxcXCpdfF4pKFxcXFw6KFthLXowLTlfXFxcXC1cXFxcK10rKVxcXFw6KSg/IVxcXFwqKVwiO1xuXG4gIHN0YXRpYyB0b0NvZGVQb2ludCh1bmljb2RlU3Vycm9nYXRlczogc3RyaW5nLCBzZXA/OiBzdHJpbmcpIHtcbiAgICBjb25zdCByID0gW107XG4gICAgbGV0IGMgPSAwO1xuICAgIGxldCBwID0gMDtcbiAgICBsZXQgaSA9IDA7XG5cbiAgICB3aGlsZSAoaSA8IHVuaWNvZGVTdXJyb2dhdGVzLmxlbmd0aCkge1xuICAgICAgYyA9IHVuaWNvZGVTdXJyb2dhdGVzLmNoYXJDb2RlQXQoaSsrKTtcbiAgICAgIGlmIChwKSB7XG4gICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1iaXR3aXNlXG4gICAgICAgIHIucHVzaCgoMHgxMDAwMCArICgocCAtIDB4ZDgwMCkgPDwgMTApICsgKGMgLSAweGRjMDApKS50b1N0cmluZygxNikpO1xuICAgICAgICBwID0gMDtcbiAgICAgIH0gZWxzZSBpZiAoMHhkODAwIDw9IGMgJiYgYyA8PSAweGRiZmYpIHtcbiAgICAgICAgcCA9IGM7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByLnB1c2goYy50b1N0cmluZygxNikpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiByLmpvaW4oc2VwIHx8IFwiLVwiKTtcbiAgfVxuXG4gIHN0YXRpYyB1bmljb2RlVG9FbW9qaSh1bmljb2RlOiBzdHJpbmcpOiBJRW1vamkgfCBzdHJpbmcge1xuICAgIHJldHVybiBFbW9qaS5nZXRFbW9qaURhdGFGcm9tVW5pZmllZChFbW9qaS50b0NvZGVQb2ludCh1bmljb2RlKSk7XG4gIH1cblxuICBzdGF0aWMgZW1vdGljb25Ub0Vtb2ppKGVtb3RpY29uOiBzdHJpbmcpOiBJRW1vamkge1xuICAgIHJldHVybiBFbW9qaS5nZXRFbW9qaURhdGFGcm9tRW1vdGljb24oZW1vdGljb24pO1xuICB9XG5cbiAgc3RhdGljIHNob3J0TmFtZVRvRW1vamkoc2hvcnROYW1lOiBzdHJpbmcpOiBJRW1vamkge1xuICAgIHJldHVybiBFbW9qaS5nZXRFbW9qaURhdGFGcm9tU2hvcnROYW1lKHNob3J0TmFtZSk7XG4gIH1cblxuICBzdGF0aWMgZ2V0RW1vamlEYXRhRnJvbVVuaWZpZWQodW5pZmllZDogc3RyaW5nKTogSUVtb2ppIHtcbiAgICBjb25zdCBlbW9qaSA9IEVtb2ppLnVuaWZpZWRbdW5pZmllZC50b1VwcGVyQ2FzZSgpXTtcblxuICAgIHJldHVybiBlbW9qaSA/IGVtb2ppIDogbnVsbDtcbiAgfVxuXG4gIHN0YXRpYyBnZXRFbW9qaURhdGFGcm9tRW1vdGljb24oZW1vdGljb246IHN0cmluZyk6IElFbW9qaSB7XG4gICAgY29uc3QgZW1vamkgPSBFbW9qaS5lbW90aWNvbnNbZW1vdGljb25dO1xuXG4gICAgcmV0dXJuIGVtb2ppID8gZW1vamkgOiBudWxsO1xuICB9XG5cbiAgc3RhdGljIGdldEVtb2ppRGF0YUZyb21TaG9ydE5hbWUoc2hvcnROYW1lOiBzdHJpbmcpOiBJRW1vamkge1xuICAgIGNvbnN0IGVtb2ppID1cbiAgICAgIEVtb2ppLnNob3J0TmFtZXNbXG4gICAgICAgIChzaG9ydE5hbWUuaW5jbHVkZXMoXCI6XCIpXG4gICAgICAgICAgPyBzaG9ydE5hbWUuc3BsaXQoXCI6XCIpWzFdXG4gICAgICAgICAgOiBzaG9ydE5hbWVcbiAgICAgICAgKS50b0xvd2VyQ2FzZSgpXG4gICAgICBdO1xuXG4gICAgY29uc29sZS5kZWJ1ZyhzaG9ydE5hbWUpO1xuXG4gICAgcmV0dXJuIGVtb2ppID8gZW1vamkgOiBudWxsO1xuICB9XG5cbiAgc3RhdGljIHVuY29tcHJlc3MobGlzdDogQ29tcHJlc3NlZEVtb2ppRGF0YVtdLCBvcHRpb25zOiBFbW9qaU1vZHVsZU9wdGlvbnMpIHtcbiAgICBsaXN0Lm1hcCgoZW1vamkpID0+IHtcbiAgICAgIGNvbnN0IGVtb2ppUmVmID0gKEVtb2ppLnVuaWZpZWRbZW1vamkudW5pZmllZF0gPSB7XG4gICAgICAgIHVuaWZpZWQ6IGVtb2ppLnVuaWZpZWQsXG4gICAgICAgIGlkOiBlbW9qaS5zaG9ydE5hbWUsXG4gICAgICAgIHNoZWV0OiBlbW9qaS5zaGVldCxcbiAgICAgICAgZW1vdGljb25zOiBlbW9qaS5lbW90aWNvbnMsXG4gICAgICB9KTtcblxuICAgICAgRW1vamkuc2hvcnROYW1lc1tlbW9qaS5zaG9ydE5hbWVdID0gZW1vamlSZWY7XG5cbiAgICAgIC8vIEFkZGl0aW9uYWwgc2hvcnROYW1lc1xuICAgICAgaWYgKGVtb2ppLnNob3J0TmFtZXMpIHtcbiAgICAgICAgZm9yIChjb25zdCBkIG9mIGVtb2ppLnNob3J0TmFtZXMpIHtcbiAgICAgICAgICBFbW9qaS5zaG9ydE5hbWVzW2RdID0gZW1vamlSZWY7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKG9wdGlvbnMuY29udmVydEVtb3RpY29ucyAmJiBlbW9qaS5lbW90aWNvbnMpIHtcbiAgICAgICAgZm9yIChjb25zdCBkIG9mIGVtb2ppLmVtb3RpY29ucykge1xuICAgICAgICAgIEVtb2ppLmVtb3RpY29uc1tkXSA9IGVtb2ppUmVmO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChlbW9qaS5za2luVmFyaWF0aW9ucykge1xuICAgICAgICBmb3IgKGNvbnN0IGQgb2YgZW1vamkuc2tpblZhcmlhdGlvbnMpIHtcbiAgICAgICAgICBFbW9qaS51bmlmaWVkW2QudW5pZmllZF0gPSB7XG4gICAgICAgICAgICB1bmlmaWVkOiBkLnVuaWZpZWQsXG4gICAgICAgICAgICBpZDogZW1vamlSZWYuaWQsXG4gICAgICAgICAgICBzaGVldDogZC5zaGVldCxcbiAgICAgICAgICAgIGVtb3RpY29uczogZW1vamlSZWYuZW1vdGljb25zLFxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmIChvcHRpb25zLmN1c3RvbUVtb2ppRGF0YSkge1xuICAgICAgZm9yIChsZXQgY3VzdG9tRW1vamkgb2Ygb3B0aW9ucy5jdXN0b21FbW9qaURhdGEpIHtcbiAgICAgICAgaWYgKGN1c3RvbUVtb2ppLnNob3J0TmFtZXMpIHtcbiAgICAgICAgICBjdXN0b21FbW9qaSA9IHsgLi4uY3VzdG9tRW1vamksIGlkOiBjdXN0b21FbW9qaS5zaG9ydE5hbWVzWzBdIH07XG4gICAgICAgICAgRW1vamkuc2hvcnROYW1lc1tjdXN0b21FbW9qaS5pZF0gPSBjdXN0b21FbW9qaTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHN0YXRpYyB1bmlmaWVkVG9OYXRpdmUodW5pZmllZDogc3RyaW5nKSB7XG4gICAgY29uc3QgY29kZVBvaW50cyA9IHVuaWZpZWQuc3BsaXQoXCItXCIpLm1hcCgodSkgPT4gcGFyc2VJbnQoYDB4JHt1fWAsIDE2KSk7XG4gICAgcmV0dXJuIFN0cmluZy5mcm9tQ29kZVBvaW50KC4uLmNvZGVQb2ludHMpO1xuICB9XG5cbiAgc3RhdGljIGVtb2ppU3ByaXRlU3R5bGVzKFxuICAgIHNoZWV0OiBJRW1vamlWaWV3W1wic2hlZXRcIl0sXG4gICAgc2V0OiBFbW9qaVNldCB8IFwiXCIsXG4gICAgYmFja2dyb3VuZEltYWdlRm46IChzZXQ6IHN0cmluZywgc2hlZXRTaXplOiBudW1iZXIpID0+IHN0cmluZyxcbiAgICBzaXplOiBudW1iZXIgPSAyNCxcbiAgICBzaGVldFNpemU6IDE2IHwgMjAgfCAzMiB8IDY0ID0gNjQsXG4gICAgc2hlZXRDb2x1bW5zID0gNTJcbiAgKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHdpZHRoOiBgJHtzaXplfXB4YCxcbiAgICAgIGhlaWdodDogYCR7c2l6ZX1weGAsXG4gICAgICBkaXNwbGF5OiBcImlubGluZS1ibG9ja1wiLFxuICAgICAgXCJiYWNrZ3JvdW5kLWltYWdlXCI6IGB1cmwoJHtiYWNrZ3JvdW5kSW1hZ2VGbihzZXQsIHNoZWV0U2l6ZSl9KWAsXG4gICAgICBcImJhY2tncm91bmQtc2l6ZVwiOiBgJHsxMDAgKiBzaGVldENvbHVtbnN9JWAsXG4gICAgICBcImJhY2tncm91bmQtcG9zaXRpb25cIjogRW1vamkuZ2V0U3ByaXRlUG9zaXRpb24oc2hlZXQsIHNoZWV0Q29sdW1ucyksXG4gICAgfTtcbiAgfVxuXG4gIHN0YXRpYyBnZXRTcHJpdGVQb3NpdGlvbihzaGVldDogSUVtb2ppVmlld1tcInNoZWV0XCJdLCBzaGVldENvbHVtbnM6IG51bWJlcikge1xuICAgIGNvbnN0IFtzaGVldFgsIHNoZWV0WV0gPSBzaGVldDtcbiAgICBjb25zdCBtdWx0aXBseSA9IDEwMCAvIChzaGVldENvbHVtbnMgLSAxKTtcbiAgICByZXR1cm4gYCR7bXVsdGlwbHkgKiBzaGVldFh9JSAke211bHRpcGx5ICogc2hlZXRZfSVgO1xuICB9XG5cbiAgc3RhdGljIHRvSGV4KHN0cjogc3RyaW5nKSB7XG4gICAgbGV0IGhleDogc3RyaW5nO1xuICAgIGxldCByZXN1bHQgPSBcIlwiO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcbiAgICAgIGhleCA9IHN0ci5jaGFyQ29kZUF0KGkpLnRvU3RyaW5nKDE2KTtcbiAgICAgIHJlc3VsdCArPSAoXCIwMDBcIiArIGhleCkuc2xpY2UoLTQpO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBzdGF0aWMgYnVpbGRJbWFnZShcbiAgICBlbW9qaTogc3RyaW5nIHwgSUVtb2ppLFxuICAgIG5vZGU6IEhUTUxFbGVtZW50LFxuICAgIHNldDogRW1vamlTZXQsXG4gICAgb3B0aW9uczogRW1vamlNb2R1bGVPcHRpb25zXG4gICkge1xuICAgIGlmICh0eXBlb2YgZW1vamkgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIGNvbnN0IHVuaWNvZGVSZWdleCA9IHVuaWNvZGVSZSgpO1xuXG4gICAgICBpZiAodW5pY29kZVJlZ2V4LnRlc3QoZW1vamkpKSB7XG4gICAgICAgIGVtb2ppID0gRW1vamkudW5pY29kZVRvRW1vamkoZW1vamkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3Qgc2hvcnROYW1lUmVnZXggPSBuZXcgUmVnRXhwKEVtb2ppLnNob3J0TmFtZVJlKTtcbiAgICAgICAgY29uc3QgbWF0Y2ggPSBzaG9ydE5hbWVSZWdleC5leGVjKGVtb2ppKTtcbiAgICAgICAgaWYgKG1hdGNoICYmIG1hdGNoLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICBlbW9qaSA9IEVtb2ppLnNob3J0TmFtZVRvRW1vamkobWF0Y2hbMV0pO1xuICAgICAgICAgIGNvbnNvbGUuZGVidWcoZW1vamkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGVtb2ppICYmIHR5cGVvZiBlbW9qaSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgbm9kZS5jbGFzc0xpc3QuYWRkKEVtb2ppLmVtb2ppUHJlZml4ICsgZW1vamkuaWQpO1xuXG4gICAgICAvLyBDdXN0b20gaW1hZ2VcbiAgICAgIGlmICgoZW1vamkgYXMgSUN1c3RvbUltYWdlRW1vamlWaWV3KS5pbWFnZVVybCkge1xuICAgICAgICBub2RlLmNsYXNzTGlzdC5hZGQoRW1vamkuZW1vamlQcmVmaXggKyBcImN1c3RvbVwiKTtcblxuICAgICAgICBub2RlLnN0eWxlLmJhY2tncm91bmRJbWFnZSA9IGB1cmwoXCIke1xuICAgICAgICAgIChlbW9qaSBhcyBJQ3VzdG9tSW1hZ2VFbW9qaVZpZXcpLmltYWdlVXJsXG4gICAgICAgIH1cIilgO1xuICAgICAgICBub2RlLnN0eWxlLmJhY2tncm91bmRTaXplID0gXCJjb250YWluXCI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBVc2luZyBhIHNwcml0ZVxuICAgICAgICBsZXQgc3R5bGUgPSBudWxsO1xuXG4gICAgICAgIC8vIERlZmF1bHQgZW1vamkgdXNpbmcgYSBzZXRcbiAgICAgICAgaWYgKChlbW9qaSBhcyBJRW1vamlWaWV3KS5zaGVldCkge1xuICAgICAgICAgIHN0eWxlID0gRW1vamkuZW1vamlTcHJpdGVTdHlsZXMoXG4gICAgICAgICAgICAoZW1vamkgYXMgSUVtb2ppVmlldykuc2hlZXQsXG4gICAgICAgICAgICBzZXQsXG4gICAgICAgICAgICBvcHRpb25zLmJhY2tncm91bmRJbWFnZUZuXG4gICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIGlmICgoZW1vamkgYXMgSUN1c3RvbVNwcml0ZUVtb2ppVmlldykuc3ByaXRlVXJsKSB7XG4gICAgICAgICAgLy8gRW1vamkgdXNpbmcgYSBzcHJpdGUgVVJMXG5cbiAgICAgICAgICBub2RlLmNsYXNzTGlzdC5hZGQoRW1vamkuZW1vamlQcmVmaXggKyBcImN1c3RvbVwiKTtcblxuICAgICAgICAgIHN0eWxlID0gRW1vamkuZW1vamlTcHJpdGVTdHlsZXMoXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgIChlbW9qaSBhcyBJQ3VzdG9tU3ByaXRlRW1vamlWaWV3KS5zaGVldF94LFxuICAgICAgICAgICAgICAoZW1vamkgYXMgSUN1c3RvbVNwcml0ZUVtb2ppVmlldykuc2hlZXRfeSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBcIlwiLFxuICAgICAgICAgICAgKCkgPT4gKGVtb2ppIGFzIElDdXN0b21TcHJpdGVFbW9qaVZpZXcpLnNwcml0ZVVybCxcbiAgICAgICAgICAgIDI0LFxuICAgICAgICAgICAgKGVtb2ppIGFzIElDdXN0b21TcHJpdGVFbW9qaVZpZXcpLnNpemUsXG4gICAgICAgICAgICAoZW1vamkgYXMgSUN1c3RvbVNwcml0ZUVtb2ppVmlldykuc2hlZXRDb2x1bW5zXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzdHlsZSkge1xuICAgICAgICAgIG5vZGUuc3R5bGUuZGlzcGxheSA9IFwiaW5saW5lLWJsb2NrXCI7XG4gICAgICAgICAgbm9kZS5zdHlsZS5iYWNrZ3JvdW5kSW1hZ2UgPSBzdHlsZVtcImJhY2tncm91bmQtaW1hZ2VcIl07XG4gICAgICAgICAgbm9kZS5zdHlsZS5iYWNrZ3JvdW5kU2l6ZSA9IHN0eWxlW1wiYmFja2dyb3VuZC1zaXplXCJdO1xuICAgICAgICAgIG5vZGUuc3R5bGUuYmFja2dyb3VuZFBvc2l0aW9uID0gc3R5bGVbXCJiYWNrZ3JvdW5kLXBvc2l0aW9uXCJdO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIG5vZGUuc3R5bGUuZm9udFNpemUgPSBcImluaGVyaXRcIjtcblxuICAgICAgbm9kZS5zZXRBdHRyaWJ1dGUoXG4gICAgICAgIFwic3JjXCIsXG4gICAgICAgIFwiZGF0YTppbWFnZS9naWY7YmFzZTY0LFIwbEdPRGxoQVFBQkFJQUFBQUFBQVAvLy95SDVCQUVBQUFBQUxBQUFBQUFCQUFFQUFBSUJSQUE3XCJcbiAgICAgICk7XG4gICAgICBub2RlLnNldEF0dHJpYnV0ZShcImRyYWdnYWJsZVwiLCBcImZhbHNlXCIpO1xuXG4gICAgICBpZiAoKGVtb2ppIGFzIElFbW9qaVZpZXcpLnVuaWZpZWQpIHtcbiAgICAgICAgY29uc3QgbmF0aXZlID0gRW1vamkudW5pZmllZFRvTmF0aXZlKChlbW9qaSBhcyBJRW1vamlWaWV3KS51bmlmaWVkKTtcbiAgICAgICAgbm9kZS5zZXRBdHRyaWJ1dGUoXCJhbHRcIiwgbmF0aXZlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5vZGUuc2V0QXR0cmlidXRlKFxuICAgICAgICAgIFwiYWx0XCIsXG4gICAgICAgICAgb3B0aW9ucy5pbmRpY2F0b3IgKyBlbW9qaS5pZCArIG9wdGlvbnMuaW5kaWNhdG9yXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIGlmIChvcHRpb25zLnNob3dUaXRsZSkge1xuICAgICAgICBjb25zdCBlbW90aWNvbnMgPSAoZW1vamkgYXMgSUVtb2ppVmlldykuZW1vdGljb25zO1xuXG4gICAgICAgIGxldCB0aXRsZSA9IFwiXCI7XG5cbiAgICAgICAgaWYgKG9wdGlvbnMuY29udmVydEVtb3RpY29ucyAmJiBlbW90aWNvbnMgJiYgZW1vdGljb25zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICB0aXRsZSA9IGVtb3RpY29uc1swXSArIFwiXFx1MjAwMixcXHUyMDAyXCI7XG4gICAgICAgIH1cblxuICAgICAgICB0aXRsZSArPSBvcHRpb25zLmluZGljYXRvciArIGVtb2ppLmlkICsgb3B0aW9ucy5pbmRpY2F0b3I7XG5cbiAgICAgICAgbm9kZS5zZXRBdHRyaWJ1dGUoXCJ0aXRsZVwiLCB0aXRsZSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBub2RlO1xuICB9XG5cbiAgc3RhdGljIGNvbnZlcnRJbnB1dChkZWx0YTogYW55LCByZXBsYWNlbWVudHM6IElFbW9qaVJlcGxhY2VtZW50KTogYW55IHtcbiAgICBjb25zdCBjaGFuZ2VzID0gbmV3IERlbHRhKCk7XG5cbiAgICBsZXQgcG9zaXRpb24gPSAwO1xuICAgIGNvbnNvbGUuZGVidWcoXCJoZXJlXCIpO1xuXG4gICAgZGVsdGEub3BzLmZvckVhY2goKG9wOiBhbnkpID0+IHtcbiAgICAgIGlmIChvcC5pbnNlcnQpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBvcC5pbnNlcnQgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICBwb3NpdGlvbisrO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBvcC5pbnNlcnQgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICBjb25zdCB0ZXh0ID0gb3AuaW5zZXJ0O1xuXG4gICAgICAgICAgbGV0IGVtb2ppVGV4dCA9IFwiXCI7XG4gICAgICAgICAgbGV0IGluZGV4OiBudW1iZXI7XG5cbiAgICAgICAgICBmb3IgKGNvbnN0IHJlcGxhY2VtZW50IG9mIHJlcGxhY2VtZW50cykge1xuICAgICAgICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOiBuby1jb25kaXRpb25hbC1hc3NpZ25tZW50XG4gICAgICAgICAgICB3aGlsZSAoKHJlcGxhY2VtZW50Lm1hdGNoID0gcmVwbGFjZW1lbnQucmVnZXguZXhlYyh0ZXh0KSkpIHtcbiAgICAgICAgICAgICAgLy8gU2V0dGluZyB0aGUgaW5kZXggYW5kIHVzaW5nIHRoZSBkaWZmZXJlbmNlIGJldHdlZW4gdGhlIG1hdGNoZXMgYXMgYSB3b3JrYXJvdW5kIGZvciBhIGxvb2thaGVhZCByZWdleFxuICAgICAgICAgICAgICBpbmRleCA9XG4gICAgICAgICAgICAgICAgcmVwbGFjZW1lbnQubWF0Y2guaW5kZXggK1xuICAgICAgICAgICAgICAgIChyZXBsYWNlbWVudC5tYXRjaFswXS5sZW5ndGggLVxuICAgICAgICAgICAgICAgICAgcmVwbGFjZW1lbnQubWF0Y2hbcmVwbGFjZW1lbnQucmVwbGFjZW1lbnRJbmRleF0ubGVuZ3RoKTtcblxuICAgICAgICAgICAgICBlbW9qaVRleHQgPSByZXBsYWNlbWVudC5tYXRjaFtyZXBsYWNlbWVudC5tYXRjaEluZGV4XTtcblxuICAgICAgICAgICAgICBjb25zdCBlbW9qaSA9IHJlcGxhY2VtZW50LmZuKGVtb2ppVGV4dCk7XG5cbiAgICAgICAgICAgICAgY29uc3QgY2hhbmdlSW5kZXggPSBwb3NpdGlvbiArIGluZGV4O1xuXG4gICAgICAgICAgICAgIGlmIChjaGFuZ2VJbmRleCA+IDApIHtcbiAgICAgICAgICAgICAgICBjaGFuZ2VzLnJldGFpbihjaGFuZ2VJbmRleCk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBjaGFuZ2VzLmRlbGV0ZShcbiAgICAgICAgICAgICAgICByZXBsYWNlbWVudC5tYXRjaFtyZXBsYWNlbWVudC5yZXBsYWNlbWVudEluZGV4XS5sZW5ndGhcbiAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICBpZiAoZW1vamkpIHtcbiAgICAgICAgICAgICAgICBjaGFuZ2VzLmluc2VydCh7IGVtb2ppIH0pO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNoYW5nZXMuaW5zZXJ0KGAke2Vtb2ppVGV4dH1gKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIHBvc2l0aW9uICs9IG9wLmluc2VydC5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBjaGFuZ2VzO1xuICB9XG5cbiAgc3RhdGljIGNvbnZlcnRQYXN0ZShkZWx0YTogYW55LCByZXBsYWNlbWVudHM6IElFbW9qaVJlcGxhY2VtZW50KTogYW55IHtcbiAgICBjb25zdCBjaGFuZ2VzID0gbmV3IERlbHRhKCk7XG4gICAgbGV0IG9wID0gbnVsbDtcblxuICAgIC8vIE1hdGNoZXJzIGFyZSBjYWxsZWQgcmVjdXJzaXZlbHksIHNvIGl0ZXJhdGluZyBpcyBub3QgbmVjZXNzYXJ5XG4gICAgaWYgKGRlbHRhKSB7XG4gICAgICBvcCA9IGRlbHRhLm9wc1swXTtcbiAgICB9XG5cbiAgICBpZiAob3AgJiYgb3AuaW5zZXJ0ICYmIHR5cGVvZiBvcC5pbnNlcnQgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIGNvbnN0IHRleHQgPSBvcC5pbnNlcnQ7XG5cbiAgICAgIGxldCBlbW9qaVRleHQgPSBcIlwiO1xuICAgICAgbGV0IGN1cnJlbnRSZXBsYWNlbWVudDogSUVtb2ppUmVwbGFjZXIgPSBudWxsO1xuICAgICAgbGV0IGluZGV4ID0gMDtcblxuICAgICAgbGV0IGkgPSAwO1xuXG4gICAgICBkbyB7XG4gICAgICAgIC8vIEdldHRpbmcgb3VyIGZpcnN0IG1hdGNoXG4gICAgICAgIGxldCB0ZW1wUmVwbGFjZW1lbnQ6IElFbW9qaVJlcGxhY2VyID0gbnVsbDtcbiAgICAgICAgZm9yIChjb25zdCByZXBsYWNlbWVudCBvZiByZXBsYWNlbWVudHMpIHtcbiAgICAgICAgICAvLyBTZWxlY3QgdGhlIGZpcnN0IG1hdGNoIGluIHRoZSByZXBsYWNlbWVudHMgYXJyYXlcbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICByZXBsYWNlbWVudC5tYXRjaCA9PT0gdW5kZWZpbmVkIHx8XG4gICAgICAgICAgICBjdXJyZW50UmVwbGFjZW1lbnQgPT09IHJlcGxhY2VtZW50XG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICByZXBsYWNlbWVudC5tYXRjaCA9IHJlcGxhY2VtZW50LnJlZ2V4LmV4ZWModGV4dCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHJlcGxhY2VtZW50Lm1hdGNoKSB7XG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICF0ZW1wUmVwbGFjZW1lbnQgfHxcbiAgICAgICAgICAgICAgIXRlbXBSZXBsYWNlbWVudC5tYXRjaCB8fFxuICAgICAgICAgICAgICByZXBsYWNlbWVudC5tYXRjaC5pbmRleCA8IHRlbXBSZXBsYWNlbWVudC5tYXRjaC5pbmRleFxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgIHRlbXBSZXBsYWNlbWVudCA9IHJlcGxhY2VtZW50O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGN1cnJlbnRSZXBsYWNlbWVudCA9IHRlbXBSZXBsYWNlbWVudDtcblxuICAgICAgICBpZiAoY3VycmVudFJlcGxhY2VtZW50ICYmIGN1cnJlbnRSZXBsYWNlbWVudC5tYXRjaCkge1xuICAgICAgICAgIC8vIFNldHRpbmcgdGhlIGluZGV4IGFuZCB1c2luZyB0aGUgZGlmZmVyZW5jZSBiZXR3ZWVuIHRoZSBtYXRjaGVzIGFzIGEgd29ya2Fyb3VuZCBmb3IgYSBsb29rYWhlYWQgcmVnZXhcbiAgICAgICAgICBpbmRleCA9XG4gICAgICAgICAgICBjdXJyZW50UmVwbGFjZW1lbnQubWF0Y2guaW5kZXggK1xuICAgICAgICAgICAgKGN1cnJlbnRSZXBsYWNlbWVudC5tYXRjaFswXS5sZW5ndGggLVxuICAgICAgICAgICAgICBjdXJyZW50UmVwbGFjZW1lbnQubWF0Y2hbY3VycmVudFJlcGxhY2VtZW50LnJlcGxhY2VtZW50SW5kZXhdXG4gICAgICAgICAgICAgICAgLmxlbmd0aCk7XG5cbiAgICAgICAgICBpZiAoaW5kZXggIT09IGkpIHtcbiAgICAgICAgICAgIGNoYW5nZXMuaW5zZXJ0KHRleHQuc2xpY2UoaSwgaW5kZXgpKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBlbW9qaVRleHQgPSBjdXJyZW50UmVwbGFjZW1lbnQubWF0Y2hbY3VycmVudFJlcGxhY2VtZW50Lm1hdGNoSW5kZXhdO1xuICAgICAgICAgIGNvbnN0IGVtb2ppID0gY3VycmVudFJlcGxhY2VtZW50LmZuKGVtb2ppVGV4dCk7XG5cbiAgICAgICAgICBpZiAoZW1vamkpIHtcbiAgICAgICAgICAgIGNoYW5nZXMuaW5zZXJ0KHsgZW1vamkgfSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaSA9XG4gICAgICAgICAgICBpbmRleCArXG4gICAgICAgICAgICBjdXJyZW50UmVwbGFjZW1lbnQubWF0Y2hbY3VycmVudFJlcGxhY2VtZW50LnJlcGxhY2VtZW50SW5kZXhdXG4gICAgICAgICAgICAgIC5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgIH0gd2hpbGUgKGN1cnJlbnRSZXBsYWNlbWVudCAmJiBjdXJyZW50UmVwbGFjZW1lbnQubWF0Y2gpO1xuXG4gICAgICAvLyBDaGVjayBpZiB0aGVyZSBpcyB0ZXh0IGxlZnRcbiAgICAgIGlmIChpIDwgdGV4dC5sZW5ndGgpIHtcbiAgICAgICAgY2hhbmdlcy5pbnNlcnQodGV4dC5zbGljZShpKSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjaGFuZ2VzO1xuICB9XG5cbiAgc3RhdGljIGluc2VydEVtb2ppKHF1aWxsOiBhbnksIGV2ZW50OiBhbnkpIHtcbiAgICBpZiAocXVpbGwgJiYgcXVpbGwuaXNFbmFibGVkKCkpIHtcbiAgICAgIGNvbnN0IHJhbmdlID0gcXVpbGwuZ2V0U2VsZWN0aW9uKHRydWUpO1xuXG4gICAgICBjb25zdCBkZWx0YSA9IG5ldyBEZWx0YSgpXG4gICAgICAgIC5yZXRhaW4ocmFuZ2UuaW5kZXgpXG4gICAgICAgIC5kZWxldGUocmFuZ2UubGVuZ3RoKVxuICAgICAgICAuaW5zZXJ0KHsgZW1vamk6IGV2ZW50LmVtb2ppIH0pO1xuXG4gICAgICAvLyBVc2luZyBzaWxlbnQgdG8gbm90IHRyaWdnZXIgdGV4dC1jaGFuZ2UsIGJ1dCBjaGVja2luZyBpZiB0aGUgZWRpdG9yIGlzIGVuYWJsZWRcbiAgICAgIHF1aWxsLnVwZGF0ZUNvbnRlbnRzKGRlbHRhLCBRdWlsbC5zb3VyY2VzLlNJTEVOVCk7XG4gICAgICBxdWlsbC5zZXRTZWxlY3Rpb24oKytyYW5nZS5pbmRleCwgMCwgUXVpbGwuc291cmNlcy5TSUxFTlQpO1xuICAgIH1cbiAgfVxufVxuIl19