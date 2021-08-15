import unicodeRe from "emoji-regex";
import Quill from "quill";
import { Emoji, } from "./emoji.model";
const Module = Quill.import("core/module");
export class EmojiModuleOptions {
    constructor() {
        this.showTitle = false;
        this.preventDrag = true;
        this.indicator = ":";
        this.convertEmoticons = true;
        this.convertShortNames = true;
        this.set = () => "apple";
        this.backgroundImageFn = (set, sheetSize) => {
            return `https://unpkg.com/emoji-datasource-${set}@4.0.4/img/${set}/sheets-256/${sheetSize}.png`;
        };
    }
}
export class EmojiModule extends Module {
    // tslint:disable-next-line: no-shadowed-variable
    constructor(quill, options) {
        super(quill, options);
        this.quill = quill;
        this.isEdgeBrowser = false;
        this.pasted = false;
        this.options = options;
        if (navigator.userAgent.indexOf("Edge") > -1) {
            this.isEdgeBrowser = true;
        }
        Emoji.uncompress(options.emojiData, options);
        if (options.preventDrag) {
            // Prevent emojis from dragging
            quill.container.addEventListener("dragstart", (event) => {
                event.preventDefault();
                return false;
            });
        }
        // Convert pasted unicode / emoticons / shortNames
        this.quill.clipboard.addMatcher(Node.TEXT_NODE, (node, delta) => {
            console.debug("here");
            return Emoji.convertPaste(delta, this.replacements);
        });
        // Listen for text change to convert typed in emojis or pasted emojis using Windows 10 Emojis / mobile
        quill.on("text-change", (delta, oldDelta, source) => {
            // text-change also triggers on a paste event, this is a hack to prevent one more check
            if (!this.pasted && source === Quill.sources.USER) {
                console.debug("sdjfklsdklfjsdakl");
                const changes = Emoji.convertInput(quill.getContents(), this.replacements);
                if (changes.ops.length > 0) {
                    quill.updateContents(changes, Quill.sources.SILENT);
                }
            }
            this.pasted = false;
        });
        // Changing cut to copy and delete
        // There seems to be a bug with Quill + Chrome with cut. The performance is much worse
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            quill.container.addEventListener("cut", (event) => {
                const selection = document.getSelection();
                document.execCommand("copy");
                selection.deleteFromDocument();
                event.preventDefault();
            });
        }
        // Edge Bug #1: Image alt tags are not copied.
        // https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/13921866/
        // Edge Bug #2: the url() functions in inline styles are getting escaped when pasted
        quill.container.addEventListener("paste", (event) => {
            this.pasted = true;
            if (this.isEdgeBrowser) {
                event.clipboardData.setData("text/html", event.clipboardData.getData("text/html").replace(/&amp;quot;/g, '"'));
            }
        });
    }
    get replacements() {
        const replacements = [
            // Unicode to Emoji
            {
                regex: unicodeRe(),
                matchIndex: 0,
                replacementIndex: 0,
                fn: (str) => Emoji.unicodeToEmoji(str),
            },
        ];
        if (this.options.convertEmoticons) {
            // Emoticons to Emoji
            replacements.push({
                regex: new RegExp(Emoji.emoticonRe, "g"),
                matchIndex: 1,
                replacementIndex: 1,
                fn: (str) => Emoji.emoticonToEmoji(str),
            });
        }
        if (this.options.convertShortNames) {
            // ShortNames to Emoji
            replacements.push({
                regex: new RegExp(Emoji.shortNameRe, "g"),
                matchIndex: 2,
                replacementIndex: 1,
                fn: (str) => Emoji.shortNameToEmoji(str),
            });
        }
        return replacements;
    }
    get options() {
        return EmojiModule.options;
    }
    set options(options) {
        EmojiModule.options = Object.assign(Object.assign({}, new EmojiModuleOptions()), options);
    }
}
EmojiModule.options = null;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW1vamkucXVpbGwtbW9kdWxlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQG51dHJpZnkvcXVpbGwtZW1vamktbWFydC1waWNrZXIvIiwic291cmNlcyI6WyJlbW9qaS5xdWlsbC1tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxTQUFTLE1BQU0sYUFBYSxDQUFDO0FBQ3BDLE9BQU8sS0FBSyxNQUFNLE9BQU8sQ0FBQztBQUUxQixPQUFPLEVBRUwsS0FBSyxHQUdOLE1BQU0sZUFBZSxDQUFDO0FBRXZCLE1BQU0sTUFBTSxHQUFRLEtBQUssQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUM7QUFXaEQsTUFBTSxPQUFPLGtCQUFrQjtJQUEvQjtRQUdFLGNBQVMsR0FBRyxLQUFLLENBQUM7UUFDbEIsZ0JBQVcsR0FBRyxJQUFJLENBQUM7UUFDbkIsY0FBUyxHQUFHLEdBQUcsQ0FBQztRQUNoQixxQkFBZ0IsR0FBRyxJQUFJLENBQUM7UUFDeEIsc0JBQWlCLEdBQUcsSUFBSSxDQUFDO1FBQ3pCLFFBQUcsR0FBb0IsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDO1FBQ3JDLHNCQUFpQixHQUErQyxDQUM5RCxHQUFHLEVBQ0gsU0FBUyxFQUNULEVBQUU7WUFDRixPQUFPLHNDQUFzQyxHQUFHLGNBQWMsR0FBRyxlQUFlLFNBQVMsTUFBTSxDQUFDO1FBQ2xHLENBQUMsQ0FBQztJQUNKLENBQUM7Q0FBQTtBQUVELE1BQU0sT0FBTyxXQUFZLFNBQVEsTUFBTTtJQWdEckMsaURBQWlEO0lBQ2pELFlBQW1CLEtBQVUsRUFBRSxPQUEyQjtRQUN4RCxLQUFLLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBREwsVUFBSyxHQUFMLEtBQUssQ0FBSztRQTlDckIsa0JBQWEsR0FBRyxLQUFLLENBQUM7UUFDdEIsV0FBTSxHQUFHLEtBQUssQ0FBQztRQWdEckIsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFFdkIsSUFBSSxTQUFTLENB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QUFJLGtCQUFrQixFQUFFLEdBQUssT0FBTyxDQUFFLENBQUM7SUFDcEUsQ0FBQzs7QUE3Q00sbUJBQU8sR0FBdUIsSUFBSSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHVuaWNvZGVSZSBmcm9tIFwiZW1vamktcmVnZXhcIjtcbmltcG9ydCBRdWlsbCBmcm9tIFwicXVpbGxcIjtcblxuaW1wb3J0IHtcbiAgQ29tcHJlc3NlZEVtb2ppRGF0YSxcbiAgRW1vamksXG4gIElDdXN0b21FbW9qaSxcbiAgSUVtb2ppUmVwbGFjZW1lbnQsXG59IGZyb20gXCIuL2Vtb2ppLm1vZGVsXCI7XG5cbmNvbnN0IE1vZHVsZTogYW55ID0gUXVpbGwuaW1wb3J0KFwiY29yZS9tb2R1bGVcIik7XG5cbmV4cG9ydCB0eXBlIEVtb2ppU2V0ID1cbiAgfCBcImFwcGxlXCJcbiAgfCBcImdvb2dsZVwiXG4gIHwgXCJ0d2l0dGVyXCJcbiAgfCBcImVtb2ppb25lXCJcbiAgfCBcIm1lc3NlbmdlclwiXG4gIHwgXCJmYWNlYm9va1wiXG4gIHwgXCJcIjtcblxuZXhwb3J0IGNsYXNzIEVtb2ppTW9kdWxlT3B0aW9ucyB7XG4gIGVtb2ppRGF0YTogQ29tcHJlc3NlZEVtb2ppRGF0YVtdO1xuICBjdXN0b21FbW9qaURhdGE/OiBJQ3VzdG9tRW1vamlbXTtcbiAgc2hvd1RpdGxlID0gZmFsc2U7XG4gIHByZXZlbnREcmFnID0gdHJ1ZTtcbiAgaW5kaWNhdG9yID0gXCI6XCI7XG4gIGNvbnZlcnRFbW90aWNvbnMgPSB0cnVlO1xuICBjb252ZXJ0U2hvcnROYW1lcyA9IHRydWU7XG4gIHNldD86ICgpID0+IEVtb2ppU2V0ID0gKCkgPT4gXCJhcHBsZVwiO1xuICBiYWNrZ3JvdW5kSW1hZ2VGbjogKHNldDogc3RyaW5nLCBzaGVldFNpemU6IG51bWJlcikgPT4gc3RyaW5nID0gKFxuICAgIHNldCxcbiAgICBzaGVldFNpemVcbiAgKSA9PiB7XG4gICAgcmV0dXJuIGBodHRwczovL3VucGtnLmNvbS9lbW9qaS1kYXRhc291cmNlLSR7c2V0fUA0LjAuNC9pbWcvJHtzZXR9L3NoZWV0cy0yNTYvJHtzaGVldFNpemV9LnBuZ2A7XG4gIH07XG59XG5cbmV4cG9ydCBjbGFzcyBFbW9qaU1vZHVsZSBleHRlbmRzIE1vZHVsZSB7XG4gIHN0YXRpYyBvcHRpb25zOiBFbW9qaU1vZHVsZU9wdGlvbnMgPSBudWxsO1xuXG4gIHByaXZhdGUgaXNFZGdlQnJvd3NlciA9IGZhbHNlO1xuICBwcml2YXRlIHBhc3RlZCA9IGZhbHNlO1xuXG4gIGdldCByZXBsYWNlbWVudHMoKTogSUVtb2ppUmVwbGFjZW1lbnQge1xuICAgIGNvbnN0IHJlcGxhY2VtZW50cyA9IFtcbiAgICAgIC8vIFVuaWNvZGUgdG8gRW1vamlcbiAgICAgIHtcbiAgICAgICAgcmVnZXg6IHVuaWNvZGVSZSgpLFxuICAgICAgICBtYXRjaEluZGV4OiAwLFxuICAgICAgICByZXBsYWNlbWVudEluZGV4OiAwLFxuICAgICAgICBmbjogKHN0cjogc3RyaW5nKSA9PiBFbW9qaS51bmljb2RlVG9FbW9qaShzdHIpLFxuICAgICAgfSxcbiAgICBdO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5jb252ZXJ0RW1vdGljb25zKSB7XG4gICAgICAvLyBFbW90aWNvbnMgdG8gRW1vamlcbiAgICAgIHJlcGxhY2VtZW50cy5wdXNoKHtcbiAgICAgICAgcmVnZXg6IG5ldyBSZWdFeHAoRW1vamkuZW1vdGljb25SZSwgXCJnXCIpLFxuICAgICAgICBtYXRjaEluZGV4OiAxLFxuICAgICAgICByZXBsYWNlbWVudEluZGV4OiAxLFxuICAgICAgICBmbjogKHN0cjogc3RyaW5nKSA9PiBFbW9qaS5lbW90aWNvblRvRW1vamkoc3RyKSxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICh0aGlzLm9wdGlvbnMuY29udmVydFNob3J0TmFtZXMpIHtcbiAgICAgIC8vIFNob3J0TmFtZXMgdG8gRW1vamlcbiAgICAgIHJlcGxhY2VtZW50cy5wdXNoKHtcbiAgICAgICAgcmVnZXg6IG5ldyBSZWdFeHAoRW1vamkuc2hvcnROYW1lUmUsIFwiZ1wiKSxcbiAgICAgICAgbWF0Y2hJbmRleDogMixcbiAgICAgICAgcmVwbGFjZW1lbnRJbmRleDogMSxcbiAgICAgICAgZm46IChzdHI6IHN0cmluZykgPT4gRW1vamkuc2hvcnROYW1lVG9FbW9qaShzdHIpLFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlcGxhY2VtZW50cztcbiAgfVxuXG4gIGdldCBvcHRpb25zKCk6IEVtb2ppTW9kdWxlT3B0aW9ucyB7XG4gICAgcmV0dXJuIEVtb2ppTW9kdWxlLm9wdGlvbnM7XG4gIH1cblxuICBzZXQgb3B0aW9ucyhvcHRpb25zOiBFbW9qaU1vZHVsZU9wdGlvbnMpIHtcbiAgICBFbW9qaU1vZHVsZS5vcHRpb25zID0geyAuLi5uZXcgRW1vamlNb2R1bGVPcHRpb25zKCksIC4uLm9wdGlvbnMgfTtcbiAgfVxuXG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTogbm8tc2hhZG93ZWQtdmFyaWFibGVcbiAgY29uc3RydWN0b3IocHVibGljIHF1aWxsOiBhbnksIG9wdGlvbnM6IEVtb2ppTW9kdWxlT3B0aW9ucykge1xuICAgIHN1cGVyKHF1aWxsLCBvcHRpb25zKTtcblxuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG5cbiAgICBpZiAobmF2aWdhdG9yLnVzZXJBZ2VudC5pbmRleE9mKFwiRWRnZVwiKSA+IC0xKSB7XG4gICAgICB0aGlzLmlzRWRnZUJyb3dzZXIgPSB0cnVlO1xuICAgIH1cblxuICAgIEVtb2ppLnVuY29tcHJlc3Mob3B0aW9ucy5lbW9qaURhdGEsIG9wdGlvbnMpO1xuXG4gICAgaWYgKG9wdGlvbnMucHJldmVudERyYWcpIHtcbiAgICAgIC8vIFByZXZlbnQgZW1vamlzIGZyb20gZHJhZ2dpbmdcbiAgICAgIHF1aWxsLmNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKFwiZHJhZ3N0YXJ0XCIsIChldmVudDogRHJhZ0V2ZW50KSA9PiB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIENvbnZlcnQgcGFzdGVkIHVuaWNvZGUgLyBlbW90aWNvbnMgLyBzaG9ydE5hbWVzXG4gICAgdGhpcy5xdWlsbC5jbGlwYm9hcmQuYWRkTWF0Y2hlcihcbiAgICAgIE5vZGUuVEVYVF9OT0RFLFxuICAgICAgKG5vZGU6IEhUTUxFbGVtZW50LCBkZWx0YTogYW55KSA9PiB7XG4gICAgICAgIGNvbnNvbGUuZGVidWcoXCJoZXJlXCIpO1xuICAgICAgICByZXR1cm4gRW1vamkuY29udmVydFBhc3RlKGRlbHRhLCB0aGlzLnJlcGxhY2VtZW50cyk7XG4gICAgICB9XG4gICAgKTtcblxuICAgIC8vIExpc3RlbiBmb3IgdGV4dCBjaGFuZ2UgdG8gY29udmVydCB0eXBlZCBpbiBlbW9qaXMgb3IgcGFzdGVkIGVtb2ppcyB1c2luZyBXaW5kb3dzIDEwIEVtb2ppcyAvIG1vYmlsZVxuICAgIHF1aWxsLm9uKFwidGV4dC1jaGFuZ2VcIiwgKGRlbHRhOiBhbnksIG9sZERlbHRhOiBhbnksIHNvdXJjZTogc3RyaW5nKSA9PiB7XG4gICAgICAvLyB0ZXh0LWNoYW5nZSBhbHNvIHRyaWdnZXJzIG9uIGEgcGFzdGUgZXZlbnQsIHRoaXMgaXMgYSBoYWNrIHRvIHByZXZlbnQgb25lIG1vcmUgY2hlY2tcbiAgICAgIGlmICghdGhpcy5wYXN0ZWQgJiYgc291cmNlID09PSBRdWlsbC5zb3VyY2VzLlVTRVIpIHtcbiAgICAgICAgY29uc29sZS5kZWJ1ZyhcInNkamZrbHNka2xmanNkYWtsXCIpO1xuICAgICAgICBjb25zdCBjaGFuZ2VzID0gRW1vamkuY29udmVydElucHV0KFxuICAgICAgICAgIHF1aWxsLmdldENvbnRlbnRzKCksXG4gICAgICAgICAgdGhpcy5yZXBsYWNlbWVudHNcbiAgICAgICAgKTtcblxuICAgICAgICBpZiAoY2hhbmdlcy5vcHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgIHF1aWxsLnVwZGF0ZUNvbnRlbnRzKGNoYW5nZXMsIFF1aWxsLnNvdXJjZXMuU0lMRU5UKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLnBhc3RlZCA9IGZhbHNlO1xuICAgIH0pO1xuXG4gICAgLy8gQ2hhbmdpbmcgY3V0IHRvIGNvcHkgYW5kIGRlbGV0ZVxuICAgIC8vIFRoZXJlIHNlZW1zIHRvIGJlIGEgYnVnIHdpdGggUXVpbGwgKyBDaHJvbWUgd2l0aCBjdXQuIFRoZSBwZXJmb3JtYW5jZSBpcyBtdWNoIHdvcnNlXG4gICAgaWYgKG5hdmlnYXRvci51c2VyQWdlbnQuaW5kZXhPZihcIkNocm9tZVwiKSA+IC0xKSB7XG4gICAgICBxdWlsbC5jb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lcihcImN1dFwiLCAoZXZlbnQ6IENsaXBib2FyZEV2ZW50KSA9PiB7XG4gICAgICAgIGNvbnN0IHNlbGVjdGlvbiA9IGRvY3VtZW50LmdldFNlbGVjdGlvbigpO1xuICAgICAgICBkb2N1bWVudC5leGVjQ29tbWFuZChcImNvcHlcIik7XG4gICAgICAgIHNlbGVjdGlvbi5kZWxldGVGcm9tRG9jdW1lbnQoKTtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIEVkZ2UgQnVnICMxOiBJbWFnZSBhbHQgdGFncyBhcmUgbm90IGNvcGllZC5cbiAgICAvLyBodHRwczovL2RldmVsb3Blci5taWNyb3NvZnQuY29tL2VuLXVzL21pY3Jvc29mdC1lZGdlL3BsYXRmb3JtL2lzc3Vlcy8xMzkyMTg2Ni9cbiAgICAvLyBFZGdlIEJ1ZyAjMjogdGhlIHVybCgpIGZ1bmN0aW9ucyBpbiBpbmxpbmUgc3R5bGVzIGFyZSBnZXR0aW5nIGVzY2FwZWQgd2hlbiBwYXN0ZWRcbiAgICBxdWlsbC5jb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lcihcInBhc3RlXCIsIChldmVudDogQ2xpcGJvYXJkRXZlbnQpID0+IHtcbiAgICAgIHRoaXMucGFzdGVkID0gdHJ1ZTtcblxuICAgICAgaWYgKHRoaXMuaXNFZGdlQnJvd3Nlcikge1xuICAgICAgICBldmVudC5jbGlwYm9hcmREYXRhLnNldERhdGEoXG4gICAgICAgICAgXCJ0ZXh0L2h0bWxcIixcbiAgICAgICAgICBldmVudC5jbGlwYm9hcmREYXRhLmdldERhdGEoXCJ0ZXh0L2h0bWxcIikucmVwbGFjZSgvJmFtcDtxdW90Oy9nLCAnXCInKVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59XG4iXX0=