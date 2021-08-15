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
                regex: typeof Emoji.emoticonRe === "string"
                    ? new RegExp(Emoji.emoticonRe, "g")
                    : new RegExp(Emoji.emoticonRe),
                matchIndex: 1,
                replacementIndex: 1,
                fn: (str) => Emoji.emoticonToEmoji(str),
            });
        }
        if (this.options.convertShortNames) {
            // ShortNames to Emoji
            replacements.push({
                regex: typeof Emoji.shortNameRe === "string"
                    ? new RegExp(Emoji.shortNameRe, "g")
                    : new RegExp(Emoji.shortNameRe),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW1vamkucXVpbGwtbW9kdWxlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQG51dHJpZnkvcXVpbGwtZW1vamktbWFydC1waWNrZXIvIiwic291cmNlcyI6WyJlbW9qaS5xdWlsbC1tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxTQUFTLE1BQU0sYUFBYSxDQUFDO0FBQ3BDLE9BQU8sS0FBSyxNQUFNLE9BQU8sQ0FBQztBQUUxQixPQUFPLEVBRUwsS0FBSyxHQUdOLE1BQU0sZUFBZSxDQUFDO0FBRXZCLE1BQU0sTUFBTSxHQUFRLEtBQUssQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUM7QUFXaEQsTUFBTSxPQUFPLGtCQUFrQjtJQUEvQjtRQUdFLGNBQVMsR0FBRyxLQUFLLENBQUM7UUFDbEIsZ0JBQVcsR0FBRyxJQUFJLENBQUM7UUFDbkIsY0FBUyxHQUFHLEdBQUcsQ0FBQztRQUNoQixxQkFBZ0IsR0FBRyxJQUFJLENBQUM7UUFDeEIsc0JBQWlCLEdBQUcsSUFBSSxDQUFDO1FBQ3pCLFFBQUcsR0FBb0IsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDO1FBQ3JDLHNCQUFpQixHQUErQyxDQUM5RCxHQUFHLEVBQ0gsU0FBUyxFQUNULEVBQUU7WUFDRixPQUFPLHNDQUFzQyxHQUFHLGNBQWMsR0FBRyxlQUFlLFNBQVMsTUFBTSxDQUFDO1FBQ2xHLENBQUMsQ0FBQztJQUNKLENBQUM7Q0FBQTtBQUVELE1BQU0sT0FBTyxXQUFZLFNBQVEsTUFBTTtJQXNEckMsaURBQWlEO0lBQ2pELFlBQW1CLEtBQVUsRUFBRSxPQUEyQjtRQUN4RCxLQUFLLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBREwsVUFBSyxHQUFMLEtBQUssQ0FBSztRQXBEckIsa0JBQWEsR0FBRyxLQUFLLENBQUM7UUFDdEIsV0FBTSxHQUFHLEtBQUssQ0FBQztRQXNEckIsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFFdkIsSUFBSSxTQUFTLENB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QUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUM7YUFDakQsQ0FBQyxDQUFDO1NBQ0o7UUFFRCxPQUFPLFlBQVksQ0FBQztJQUN0QixDQUFDO0lBRUQsSUFBSSxPQUFPO1FBQ1QsT0FBTyxXQUFXLENBQUMsT0FBTyxDQUFDO0lBQzdCLENBQUM7SUFFRCxJQUFJLE9BQU8sQ0FBQyxPQUEyQjtRQUNyQyxXQUFXLENBQUMsT0FBTyxtQ0FBUSxJQUFJLGtCQUFrQixFQUFFLEdBQUssT0FBTyxDQUFFLENBQUM7SUFDcEUsQ0FBQzs7QUFuRE0sbUJBQU8sR0FBdUIsSUFBSSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHVuaWNvZGVSZSBmcm9tIFwiZW1vamktcmVnZXhcIjtcbmltcG9ydCBRdWlsbCBmcm9tIFwicXVpbGxcIjtcblxuaW1wb3J0IHtcbiAgQ29tcHJlc3NlZEVtb2ppRGF0YSxcbiAgRW1vamksXG4gIElDdXN0b21FbW9qaSxcbiAgSUVtb2ppUmVwbGFjZW1lbnQsXG59IGZyb20gXCIuL2Vtb2ppLm1vZGVsXCI7XG5cbmNvbnN0IE1vZHVsZTogYW55ID0gUXVpbGwuaW1wb3J0KFwiY29yZS9tb2R1bGVcIik7XG5cbmV4cG9ydCB0eXBlIEVtb2ppU2V0ID1cbiAgfCBcImFwcGxlXCJcbiAgfCBcImdvb2dsZVwiXG4gIHwgXCJ0d2l0dGVyXCJcbiAgfCBcImVtb2ppb25lXCJcbiAgfCBcIm1lc3NlbmdlclwiXG4gIHwgXCJmYWNlYm9va1wiXG4gIHwgXCJcIjtcblxuZXhwb3J0IGNsYXNzIEVtb2ppTW9kdWxlT3B0aW9ucyB7XG4gIGVtb2ppRGF0YTogQ29tcHJlc3NlZEVtb2ppRGF0YVtdO1xuICBjdXN0b21FbW9qaURhdGE/OiBJQ3VzdG9tRW1vamlbXTtcbiAgc2hvd1RpdGxlID0gZmFsc2U7XG4gIHByZXZlbnREcmFnID0gdHJ1ZTtcbiAgaW5kaWNhdG9yID0gXCI6XCI7XG4gIGNvbnZlcnRFbW90aWNvbnMgPSB0cnVlO1xuICBjb252ZXJ0U2hvcnROYW1lcyA9IHRydWU7XG4gIHNldD86ICgpID0+IEVtb2ppU2V0ID0gKCkgPT4gXCJhcHBsZVwiO1xuICBiYWNrZ3JvdW5kSW1hZ2VGbjogKHNldDogc3RyaW5nLCBzaGVldFNpemU6IG51bWJlcikgPT4gc3RyaW5nID0gKFxuICAgIHNldCxcbiAgICBzaGVldFNpemVcbiAgKSA9PiB7XG4gICAgcmV0dXJuIGBodHRwczovL3VucGtnLmNvbS9lbW9qaS1kYXRhc291cmNlLSR7c2V0fUA0LjAuNC9pbWcvJHtzZXR9L3NoZWV0cy0yNTYvJHtzaGVldFNpemV9LnBuZ2A7XG4gIH07XG59XG5cbmV4cG9ydCBjbGFzcyBFbW9qaU1vZHVsZSBleHRlbmRzIE1vZHVsZSB7XG4gIHN0YXRpYyBvcHRpb25zOiBFbW9qaU1vZHVsZU9wdGlvbnMgPSBudWxsO1xuXG4gIHByaXZhdGUgaXNFZGdlQnJvd3NlciA9IGZhbHNlO1xuICBwcml2YXRlIHBhc3RlZCA9IGZhbHNlO1xuXG4gIGdldCByZXBsYWNlbWVudHMoKTogSUVtb2ppUmVwbGFjZW1lbnQge1xuICAgIGNvbnN0IHJlcGxhY2VtZW50cyA9IFtcbiAgICAgIC8vIFVuaWNvZGUgdG8gRW1vamlcbiAgICAgIHtcbiAgICAgICAgcmVnZXg6IHVuaWNvZGVSZSgpLFxuICAgICAgICBtYXRjaEluZGV4OiAwLFxuICAgICAgICByZXBsYWNlbWVudEluZGV4OiAwLFxuICAgICAgICBmbjogKHN0cjogc3RyaW5nKSA9PiBFbW9qaS51bmljb2RlVG9FbW9qaShzdHIpLFxuICAgICAgfSxcbiAgICBdO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5jb252ZXJ0RW1vdGljb25zKSB7XG4gICAgICAvLyBFbW90aWNvbnMgdG8gRW1vamlcbiAgICAgIHJlcGxhY2VtZW50cy5wdXNoKHtcbiAgICAgICAgcmVnZXg6XG4gICAgICAgICAgdHlwZW9mIEVtb2ppLmVtb3RpY29uUmUgPT09IFwic3RyaW5nXCJcbiAgICAgICAgICAgID8gbmV3IFJlZ0V4cChFbW9qaS5lbW90aWNvblJlLCBcImdcIilcbiAgICAgICAgICAgIDogbmV3IFJlZ0V4cChFbW9qaS5lbW90aWNvblJlKSxcbiAgICAgICAgbWF0Y2hJbmRleDogMSxcbiAgICAgICAgcmVwbGFjZW1lbnRJbmRleDogMSxcbiAgICAgICAgZm46IChzdHI6IHN0cmluZykgPT4gRW1vamkuZW1vdGljb25Ub0Vtb2ppKHN0ciksXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmNvbnZlcnRTaG9ydE5hbWVzKSB7XG4gICAgICAvLyBTaG9ydE5hbWVzIHRvIEVtb2ppXG4gICAgICByZXBsYWNlbWVudHMucHVzaCh7XG4gICAgICAgIHJlZ2V4OlxuICAgICAgICAgIHR5cGVvZiBFbW9qaS5zaG9ydE5hbWVSZSA9PT0gXCJzdHJpbmdcIlxuICAgICAgICAgICAgPyBuZXcgUmVnRXhwKEVtb2ppLnNob3J0TmFtZVJlLCBcImdcIilcbiAgICAgICAgICAgIDogbmV3IFJlZ0V4cChFbW9qaS5zaG9ydE5hbWVSZSksXG4gICAgICAgIG1hdGNoSW5kZXg6IDIsXG4gICAgICAgIHJlcGxhY2VtZW50SW5kZXg6IDEsXG4gICAgICAgIGZuOiAoc3RyOiBzdHJpbmcpID0+IEVtb2ppLnNob3J0TmFtZVRvRW1vamkoc3RyKSxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiByZXBsYWNlbWVudHM7XG4gIH1cblxuICBnZXQgb3B0aW9ucygpOiBFbW9qaU1vZHVsZU9wdGlvbnMge1xuICAgIHJldHVybiBFbW9qaU1vZHVsZS5vcHRpb25zO1xuICB9XG5cbiAgc2V0IG9wdGlvbnMob3B0aW9uczogRW1vamlNb2R1bGVPcHRpb25zKSB7XG4gICAgRW1vamlNb2R1bGUub3B0aW9ucyA9IHsgLi4ubmV3IEVtb2ppTW9kdWxlT3B0aW9ucygpLCAuLi5vcHRpb25zIH07XG4gIH1cblxuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6IG5vLXNoYWRvd2VkLXZhcmlhYmxlXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBxdWlsbDogYW55LCBvcHRpb25zOiBFbW9qaU1vZHVsZU9wdGlvbnMpIHtcbiAgICBzdXBlcihxdWlsbCwgb3B0aW9ucyk7XG5cbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuXG4gICAgaWYgKG5hdmlnYXRvci51c2VyQWdlbnQuaW5kZXhPZihcIkVkZ2VcIikgPiAtMSkge1xuICAgICAgdGhpcy5pc0VkZ2VCcm93c2VyID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBFbW9qaS51bmNvbXByZXNzKG9wdGlvbnMuZW1vamlEYXRhLCBvcHRpb25zKTtcblxuICAgIGlmIChvcHRpb25zLnByZXZlbnREcmFnKSB7XG4gICAgICAvLyBQcmV2ZW50IGVtb2ppcyBmcm9tIGRyYWdnaW5nXG4gICAgICBxdWlsbC5jb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdzdGFydFwiLCAoZXZlbnQ6IERyYWdFdmVudCkgPT4ge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBDb252ZXJ0IHBhc3RlZCB1bmljb2RlIC8gZW1vdGljb25zIC8gc2hvcnROYW1lc1xuICAgIHRoaXMucXVpbGwuY2xpcGJvYXJkLmFkZE1hdGNoZXIoXG4gICAgICBOb2RlLlRFWFRfTk9ERSxcbiAgICAgIChub2RlOiBIVE1MRWxlbWVudCwgZGVsdGE6IGFueSkgPT4ge1xuICAgICAgICBjb25zb2xlLmRlYnVnKFwiaGVyZVwiKTtcbiAgICAgICAgcmV0dXJuIEVtb2ppLmNvbnZlcnRQYXN0ZShkZWx0YSwgdGhpcy5yZXBsYWNlbWVudHMpO1xuICAgICAgfVxuICAgICk7XG5cbiAgICAvLyBMaXN0ZW4gZm9yIHRleHQgY2hhbmdlIHRvIGNvbnZlcnQgdHlwZWQgaW4gZW1vamlzIG9yIHBhc3RlZCBlbW9qaXMgdXNpbmcgV2luZG93cyAxMCBFbW9qaXMgLyBtb2JpbGVcbiAgICBxdWlsbC5vbihcInRleHQtY2hhbmdlXCIsIChkZWx0YTogYW55LCBvbGREZWx0YTogYW55LCBzb3VyY2U6IHN0cmluZykgPT4ge1xuICAgICAgLy8gdGV4dC1jaGFuZ2UgYWxzbyB0cmlnZ2VycyBvbiBhIHBhc3RlIGV2ZW50LCB0aGlzIGlzIGEgaGFjayB0byBwcmV2ZW50IG9uZSBtb3JlIGNoZWNrXG4gICAgICBpZiAoIXRoaXMucGFzdGVkICYmIHNvdXJjZSA9PT0gUXVpbGwuc291cmNlcy5VU0VSKSB7XG4gICAgICAgIGNvbnNvbGUuZGVidWcoXCJzZGpma2xzZGtsZmpzZGFrbFwiKTtcbiAgICAgICAgY29uc3QgY2hhbmdlcyA9IEVtb2ppLmNvbnZlcnRJbnB1dChcbiAgICAgICAgICBxdWlsbC5nZXRDb250ZW50cygpLFxuICAgICAgICAgIHRoaXMucmVwbGFjZW1lbnRzXG4gICAgICAgICk7XG5cbiAgICAgICAgaWYgKGNoYW5nZXMub3BzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBxdWlsbC51cGRhdGVDb250ZW50cyhjaGFuZ2VzLCBRdWlsbC5zb3VyY2VzLlNJTEVOVCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5wYXN0ZWQgPSBmYWxzZTtcbiAgICB9KTtcblxuICAgIC8vIENoYW5naW5nIGN1dCB0byBjb3B5IGFuZCBkZWxldGVcbiAgICAvLyBUaGVyZSBzZWVtcyB0byBiZSBhIGJ1ZyB3aXRoIFF1aWxsICsgQ2hyb21lIHdpdGggY3V0LiBUaGUgcGVyZm9ybWFuY2UgaXMgbXVjaCB3b3JzZVxuICAgIGlmIChuYXZpZ2F0b3IudXNlckFnZW50LmluZGV4T2YoXCJDaHJvbWVcIikgPiAtMSkge1xuICAgICAgcXVpbGwuY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoXCJjdXRcIiwgKGV2ZW50OiBDbGlwYm9hcmRFdmVudCkgPT4ge1xuICAgICAgICBjb25zdCBzZWxlY3Rpb24gPSBkb2N1bWVudC5nZXRTZWxlY3Rpb24oKTtcbiAgICAgICAgZG9jdW1lbnQuZXhlY0NvbW1hbmQoXCJjb3B5XCIpO1xuICAgICAgICBzZWxlY3Rpb24uZGVsZXRlRnJvbURvY3VtZW50KCk7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBFZGdlIEJ1ZyAjMTogSW1hZ2UgYWx0IHRhZ3MgYXJlIG5vdCBjb3BpZWQuXG4gICAgLy8gaHR0cHM6Ly9kZXZlbG9wZXIubWljcm9zb2Z0LmNvbS9lbi11cy9taWNyb3NvZnQtZWRnZS9wbGF0Zm9ybS9pc3N1ZXMvMTM5MjE4NjYvXG4gICAgLy8gRWRnZSBCdWcgIzI6IHRoZSB1cmwoKSBmdW5jdGlvbnMgaW4gaW5saW5lIHN0eWxlcyBhcmUgZ2V0dGluZyBlc2NhcGVkIHdoZW4gcGFzdGVkXG4gICAgcXVpbGwuY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoXCJwYXN0ZVwiLCAoZXZlbnQ6IENsaXBib2FyZEV2ZW50KSA9PiB7XG4gICAgICB0aGlzLnBhc3RlZCA9IHRydWU7XG5cbiAgICAgIGlmICh0aGlzLmlzRWRnZUJyb3dzZXIpIHtcbiAgICAgICAgZXZlbnQuY2xpcGJvYXJkRGF0YS5zZXREYXRhKFxuICAgICAgICAgIFwidGV4dC9odG1sXCIsXG4gICAgICAgICAgZXZlbnQuY2xpcGJvYXJkRGF0YS5nZXREYXRhKFwidGV4dC9odG1sXCIpLnJlcGxhY2UoLyZhbXA7cXVvdDsvZywgJ1wiJylcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuIl19