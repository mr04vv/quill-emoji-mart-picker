import { __assign, __extends } from "tslib";
import unicodeRe from "emoji-regex";
import Quill from "quill";
import { Emoji, } from "./emoji.model";
var Module = Quill.import("core/module");
var EmojiModuleOptions = /** @class */ (function () {
    function EmojiModuleOptions() {
        this.showTitle = false;
        this.preventDrag = true;
        this.indicator = ":";
        this.convertEmoticons = true;
        this.convertShortNames = true;
        this.set = function () { return "apple"; };
        this.backgroundImageFn = function (set, sheetSize) {
            return "https://unpkg.com/emoji-datasource-" + set + "@4.0.4/img/" + set + "/sheets-256/" + sheetSize + ".png";
        };
    }
    return EmojiModuleOptions;
}());
export { EmojiModuleOptions };
var EmojiModule = /** @class */ (function (_super) {
    __extends(EmojiModule, _super);
    // tslint:disable-next-line: no-shadowed-variable
    function EmojiModule(quill, options) {
        var _this = _super.call(this, quill, options) || this;
        _this.quill = quill;
        _this.isEdgeBrowser = false;
        _this.pasted = false;
        _this.options = options;
        if (navigator.userAgent.indexOf("Edge") > -1) {
            _this.isEdgeBrowser = true;
        }
        Emoji.uncompress(options.emojiData, options);
        if (options.preventDrag) {
            // Prevent emojis from dragging
            quill.container.addEventListener("dragstart", function (event) {
                event.preventDefault();
                return false;
            });
        }
        // Convert pasted unicode / emoticons / shortNames
        _this.quill.clipboard.addMatcher(Node.TEXT_NODE, function (node, delta) {
            console.debug("here");
            return Emoji.convertPaste(delta, _this.replacements);
        });
        // Listen for text change to convert typed in emojis or pasted emojis using Windows 10 Emojis / mobile
        quill.on("text-change", function (delta, oldDelta, source) {
            // text-change also triggers on a paste event, this is a hack to prevent one more check
            if (!_this.pasted && source === Quill.sources.USER) {
                console.debug("sdjfklsdklfjsdakl");
                var changes = Emoji.convertInput(quill.getContents(), _this.replacements);
                if (changes.ops.length > 0) {
                    quill.updateContents(changes, Quill.sources.SILENT);
                }
            }
            _this.pasted = false;
        });
        // Changing cut to copy and delete
        // There seems to be a bug with Quill + Chrome with cut. The performance is much worse
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            quill.container.addEventListener("cut", function (event) {
                var selection = document.getSelection();
                document.execCommand("copy");
                selection.deleteFromDocument();
                event.preventDefault();
            });
        }
        // Edge Bug #1: Image alt tags are not copied.
        // https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/13921866/
        // Edge Bug #2: the url() functions in inline styles are getting escaped when pasted
        quill.container.addEventListener("paste", function (event) {
            _this.pasted = true;
            if (_this.isEdgeBrowser) {
                event.clipboardData.setData("text/html", event.clipboardData.getData("text/html").replace(/&amp;quot;/g, '"'));
            }
        });
        return _this;
    }
    Object.defineProperty(EmojiModule.prototype, "replacements", {
        get: function () {
            var replacements = [
                // Unicode to Emoji
                {
                    regex: unicodeRe(),
                    matchIndex: 0,
                    replacementIndex: 0,
                    fn: function (str) { return Emoji.unicodeToEmoji(str); },
                },
            ];
            if (this.options.convertEmoticons) {
                // Emoticons to Emoji
                replacements.push({
                    regex: new RegExp(Emoji.emoticonRe, "g"),
                    matchIndex: 1,
                    replacementIndex: 1,
                    fn: function (str) { return Emoji.emoticonToEmoji(str); },
                });
            }
            if (this.options.convertShortNames) {
                // ShortNames to Emoji
                replacements.push({
                    regex: new RegExp(Emoji.shortNameRe, "g"),
                    matchIndex: 2,
                    replacementIndex: 1,
                    fn: function (str) { return Emoji.shortNameToEmoji(str); },
                });
            }
            return replacements;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EmojiModule.prototype, "options", {
        get: function () {
            return EmojiModule.options;
        },
        set: function (options) {
            EmojiModule.options = __assign(__assign({}, new EmojiModuleOptions()), options);
        },
        enumerable: true,
        configurable: true
    });
    EmojiModule.options = null;
    return EmojiModule;
}(Module));
export { EmojiModule };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW1vamkucXVpbGwtbW9kdWxlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQG51dHJpZnkvcXVpbGwtZW1vamktbWFydC1waWNrZXIvIiwic291cmNlcyI6WyJlbW9qaS5xdWlsbC1tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sU0FBUyxNQUFNLGFBQWEsQ0FBQztBQUNwQyxPQUFPLEtBQUssTUFBTSxPQUFPLENBQUM7QUFFMUIsT0FBTyxFQUVMLEtBQUssR0FHTixNQUFNLGVBQWUsQ0FBQztBQUV2QixJQUFNLE1BQU0sR0FBUSxLQUFLLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBV2hEO0lBQUE7UUFHRSxjQUFTLEdBQUcsS0FBSyxDQUFDO1FBQ2xCLGdCQUFXLEdBQUcsSUFBSSxDQUFDO1FBQ25CLGNBQVMsR0FBRyxHQUFHLENBQUM7UUFDaEIscUJBQWdCLEdBQUcsSUFBSSxDQUFDO1FBQ3hCLHNCQUFpQixHQUFHLElBQUksQ0FBQztRQUN6QixRQUFHLEdBQW9CLGNBQU0sT0FBQSxPQUFPLEVBQVAsQ0FBTyxDQUFDO1FBQ3JDLHNCQUFpQixHQUErQyxVQUM5RCxHQUFHLEVBQ0gsU0FBUztZQUVULE9BQU8sd0NBQXNDLEdBQUcsbUJBQWMsR0FBRyxvQkFBZSxTQUFTLFNBQU0sQ0FBQztRQUNsRyxDQUFDLENBQUM7SUFDSixDQUFDO0lBQUQseUJBQUM7QUFBRCxDQUFDLEFBZkQsSUFlQzs7QUFFRDtJQUFpQywrQkFBTTtJQWdEckMsaURBQWlEO0lBQ2pELHFCQUFtQixLQUFVLEVBQUUsT0FBMkI7UUFBMUQsWUFDRSxrQkFBTSxLQUFLLEVBQUUsT0FBTyxDQUFDLFNBcUV0QjtRQXRFa0IsV0FBSyxHQUFMLEtBQUssQ0FBSztRQTlDckIsbUJBQWEsR0FBRyxLQUFLLENBQUM7UUFDdEIsWUFBTSxHQUFHLEtBQUssQ0FBQztRQWdEckIsS0FBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFFdkIsSUFBSSxTQUFTLENB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QWtCLEVBQUUsR0FBSyxPQUFPLENBQUUsQ0FBQztRQUNwRSxDQUFDOzs7T0FKQTtJQXpDTSxtQkFBTyxHQUF1QixJQUFJLENBQUM7SUF1SDVDLGtCQUFDO0NBQUEsQUF4SEQsQ0FBaUMsTUFBTSxHQXdIdEM7U0F4SFksV0FBVyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB1bmljb2RlUmUgZnJvbSBcImVtb2ppLXJlZ2V4XCI7XG5pbXBvcnQgUXVpbGwgZnJvbSBcInF1aWxsXCI7XG5cbmltcG9ydCB7XG4gIENvbXByZXNzZWRFbW9qaURhdGEsXG4gIEVtb2ppLFxuICBJQ3VzdG9tRW1vamksXG4gIElFbW9qaVJlcGxhY2VtZW50LFxufSBmcm9tIFwiLi9lbW9qaS5tb2RlbFwiO1xuXG5jb25zdCBNb2R1bGU6IGFueSA9IFF1aWxsLmltcG9ydChcImNvcmUvbW9kdWxlXCIpO1xuXG5leHBvcnQgdHlwZSBFbW9qaVNldCA9XG4gIHwgXCJhcHBsZVwiXG4gIHwgXCJnb29nbGVcIlxuICB8IFwidHdpdHRlclwiXG4gIHwgXCJlbW9qaW9uZVwiXG4gIHwgXCJtZXNzZW5nZXJcIlxuICB8IFwiZmFjZWJvb2tcIlxuICB8IFwiXCI7XG5cbmV4cG9ydCBjbGFzcyBFbW9qaU1vZHVsZU9wdGlvbnMge1xuICBlbW9qaURhdGE6IENvbXByZXNzZWRFbW9qaURhdGFbXTtcbiAgY3VzdG9tRW1vamlEYXRhPzogSUN1c3RvbUVtb2ppW107XG4gIHNob3dUaXRsZSA9IGZhbHNlO1xuICBwcmV2ZW50RHJhZyA9IHRydWU7XG4gIGluZGljYXRvciA9IFwiOlwiO1xuICBjb252ZXJ0RW1vdGljb25zID0gdHJ1ZTtcbiAgY29udmVydFNob3J0TmFtZXMgPSB0cnVlO1xuICBzZXQ/OiAoKSA9PiBFbW9qaVNldCA9ICgpID0+IFwiYXBwbGVcIjtcbiAgYmFja2dyb3VuZEltYWdlRm46IChzZXQ6IHN0cmluZywgc2hlZXRTaXplOiBudW1iZXIpID0+IHN0cmluZyA9IChcbiAgICBzZXQsXG4gICAgc2hlZXRTaXplXG4gICkgPT4ge1xuICAgIHJldHVybiBgaHR0cHM6Ly91bnBrZy5jb20vZW1vamktZGF0YXNvdXJjZS0ke3NldH1ANC4wLjQvaW1nLyR7c2V0fS9zaGVldHMtMjU2LyR7c2hlZXRTaXplfS5wbmdgO1xuICB9O1xufVxuXG5leHBvcnQgY2xhc3MgRW1vamlNb2R1bGUgZXh0ZW5kcyBNb2R1bGUge1xuICBzdGF0aWMgb3B0aW9uczogRW1vamlNb2R1bGVPcHRpb25zID0gbnVsbDtcblxuICBwcml2YXRlIGlzRWRnZUJyb3dzZXIgPSBmYWxzZTtcbiAgcHJpdmF0ZSBwYXN0ZWQgPSBmYWxzZTtcblxuICBnZXQgcmVwbGFjZW1lbnRzKCk6IElFbW9qaVJlcGxhY2VtZW50IHtcbiAgICBjb25zdCByZXBsYWNlbWVudHMgPSBbXG4gICAgICAvLyBVbmljb2RlIHRvIEVtb2ppXG4gICAgICB7XG4gICAgICAgIHJlZ2V4OiB1bmljb2RlUmUoKSxcbiAgICAgICAgbWF0Y2hJbmRleDogMCxcbiAgICAgICAgcmVwbGFjZW1lbnRJbmRleDogMCxcbiAgICAgICAgZm46IChzdHI6IHN0cmluZykgPT4gRW1vamkudW5pY29kZVRvRW1vamkoc3RyKSxcbiAgICAgIH0sXG4gICAgXTtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMuY29udmVydEVtb3RpY29ucykge1xuICAgICAgLy8gRW1vdGljb25zIHRvIEVtb2ppXG4gICAgICByZXBsYWNlbWVudHMucHVzaCh7XG4gICAgICAgIHJlZ2V4OiBuZXcgUmVnRXhwKEVtb2ppLmVtb3RpY29uUmUsIFwiZ1wiKSxcbiAgICAgICAgbWF0Y2hJbmRleDogMSxcbiAgICAgICAgcmVwbGFjZW1lbnRJbmRleDogMSxcbiAgICAgICAgZm46IChzdHI6IHN0cmluZykgPT4gRW1vamkuZW1vdGljb25Ub0Vtb2ppKHN0ciksXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmNvbnZlcnRTaG9ydE5hbWVzKSB7XG4gICAgICAvLyBTaG9ydE5hbWVzIHRvIEVtb2ppXG4gICAgICByZXBsYWNlbWVudHMucHVzaCh7XG4gICAgICAgIHJlZ2V4OiBuZXcgUmVnRXhwKEVtb2ppLnNob3J0TmFtZVJlLCBcImdcIiksXG4gICAgICAgIG1hdGNoSW5kZXg6IDIsXG4gICAgICAgIHJlcGxhY2VtZW50SW5kZXg6IDEsXG4gICAgICAgIGZuOiAoc3RyOiBzdHJpbmcpID0+IEVtb2ppLnNob3J0TmFtZVRvRW1vamkoc3RyKSxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiByZXBsYWNlbWVudHM7XG4gIH1cblxuICBnZXQgb3B0aW9ucygpOiBFbW9qaU1vZHVsZU9wdGlvbnMge1xuICAgIHJldHVybiBFbW9qaU1vZHVsZS5vcHRpb25zO1xuICB9XG5cbiAgc2V0IG9wdGlvbnMob3B0aW9uczogRW1vamlNb2R1bGVPcHRpb25zKSB7XG4gICAgRW1vamlNb2R1bGUub3B0aW9ucyA9IHsgLi4ubmV3IEVtb2ppTW9kdWxlT3B0aW9ucygpLCAuLi5vcHRpb25zIH07XG4gIH1cblxuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6IG5vLXNoYWRvd2VkLXZhcmlhYmxlXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBxdWlsbDogYW55LCBvcHRpb25zOiBFbW9qaU1vZHVsZU9wdGlvbnMpIHtcbiAgICBzdXBlcihxdWlsbCwgb3B0aW9ucyk7XG5cbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuXG4gICAgaWYgKG5hdmlnYXRvci51c2VyQWdlbnQuaW5kZXhPZihcIkVkZ2VcIikgPiAtMSkge1xuICAgICAgdGhpcy5pc0VkZ2VCcm93c2VyID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBFbW9qaS51bmNvbXByZXNzKG9wdGlvbnMuZW1vamlEYXRhLCBvcHRpb25zKTtcblxuICAgIGlmIChvcHRpb25zLnByZXZlbnREcmFnKSB7XG4gICAgICAvLyBQcmV2ZW50IGVtb2ppcyBmcm9tIGRyYWdnaW5nXG4gICAgICBxdWlsbC5jb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdzdGFydFwiLCAoZXZlbnQ6IERyYWdFdmVudCkgPT4ge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBDb252ZXJ0IHBhc3RlZCB1bmljb2RlIC8gZW1vdGljb25zIC8gc2hvcnROYW1lc1xuICAgIHRoaXMucXVpbGwuY2xpcGJvYXJkLmFkZE1hdGNoZXIoXG4gICAgICBOb2RlLlRFWFRfTk9ERSxcbiAgICAgIChub2RlOiBIVE1MRWxlbWVudCwgZGVsdGE6IGFueSkgPT4ge1xuICAgICAgICBjb25zb2xlLmRlYnVnKFwiaGVyZVwiKTtcbiAgICAgICAgcmV0dXJuIEVtb2ppLmNvbnZlcnRQYXN0ZShkZWx0YSwgdGhpcy5yZXBsYWNlbWVudHMpO1xuICAgICAgfVxuICAgICk7XG5cbiAgICAvLyBMaXN0ZW4gZm9yIHRleHQgY2hhbmdlIHRvIGNvbnZlcnQgdHlwZWQgaW4gZW1vamlzIG9yIHBhc3RlZCBlbW9qaXMgdXNpbmcgV2luZG93cyAxMCBFbW9qaXMgLyBtb2JpbGVcbiAgICBxdWlsbC5vbihcInRleHQtY2hhbmdlXCIsIChkZWx0YTogYW55LCBvbGREZWx0YTogYW55LCBzb3VyY2U6IHN0cmluZykgPT4ge1xuICAgICAgLy8gdGV4dC1jaGFuZ2UgYWxzbyB0cmlnZ2VycyBvbiBhIHBhc3RlIGV2ZW50LCB0aGlzIGlzIGEgaGFjayB0byBwcmV2ZW50IG9uZSBtb3JlIGNoZWNrXG4gICAgICBpZiAoIXRoaXMucGFzdGVkICYmIHNvdXJjZSA9PT0gUXVpbGwuc291cmNlcy5VU0VSKSB7XG4gICAgICAgIGNvbnNvbGUuZGVidWcoXCJzZGpma2xzZGtsZmpzZGFrbFwiKTtcbiAgICAgICAgY29uc3QgY2hhbmdlcyA9IEVtb2ppLmNvbnZlcnRJbnB1dChcbiAgICAgICAgICBxdWlsbC5nZXRDb250ZW50cygpLFxuICAgICAgICAgIHRoaXMucmVwbGFjZW1lbnRzXG4gICAgICAgICk7XG5cbiAgICAgICAgaWYgKGNoYW5nZXMub3BzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBxdWlsbC51cGRhdGVDb250ZW50cyhjaGFuZ2VzLCBRdWlsbC5zb3VyY2VzLlNJTEVOVCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5wYXN0ZWQgPSBmYWxzZTtcbiAgICB9KTtcblxuICAgIC8vIENoYW5naW5nIGN1dCB0byBjb3B5IGFuZCBkZWxldGVcbiAgICAvLyBUaGVyZSBzZWVtcyB0byBiZSBhIGJ1ZyB3aXRoIFF1aWxsICsgQ2hyb21lIHdpdGggY3V0LiBUaGUgcGVyZm9ybWFuY2UgaXMgbXVjaCB3b3JzZVxuICAgIGlmIChuYXZpZ2F0b3IudXNlckFnZW50LmluZGV4T2YoXCJDaHJvbWVcIikgPiAtMSkge1xuICAgICAgcXVpbGwuY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoXCJjdXRcIiwgKGV2ZW50OiBDbGlwYm9hcmRFdmVudCkgPT4ge1xuICAgICAgICBjb25zdCBzZWxlY3Rpb24gPSBkb2N1bWVudC5nZXRTZWxlY3Rpb24oKTtcbiAgICAgICAgZG9jdW1lbnQuZXhlY0NvbW1hbmQoXCJjb3B5XCIpO1xuICAgICAgICBzZWxlY3Rpb24uZGVsZXRlRnJvbURvY3VtZW50KCk7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBFZGdlIEJ1ZyAjMTogSW1hZ2UgYWx0IHRhZ3MgYXJlIG5vdCBjb3BpZWQuXG4gICAgLy8gaHR0cHM6Ly9kZXZlbG9wZXIubWljcm9zb2Z0LmNvbS9lbi11cy9taWNyb3NvZnQtZWRnZS9wbGF0Zm9ybS9pc3N1ZXMvMTM5MjE4NjYvXG4gICAgLy8gRWRnZSBCdWcgIzI6IHRoZSB1cmwoKSBmdW5jdGlvbnMgaW4gaW5saW5lIHN0eWxlcyBhcmUgZ2V0dGluZyBlc2NhcGVkIHdoZW4gcGFzdGVkXG4gICAgcXVpbGwuY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoXCJwYXN0ZVwiLCAoZXZlbnQ6IENsaXBib2FyZEV2ZW50KSA9PiB7XG4gICAgICB0aGlzLnBhc3RlZCA9IHRydWU7XG5cbiAgICAgIGlmICh0aGlzLmlzRWRnZUJyb3dzZXIpIHtcbiAgICAgICAgZXZlbnQuY2xpcGJvYXJkRGF0YS5zZXREYXRhKFxuICAgICAgICAgIFwidGV4dC9odG1sXCIsXG4gICAgICAgICAgZXZlbnQuY2xpcGJvYXJkRGF0YS5nZXREYXRhKFwidGV4dC9odG1sXCIpLnJlcGxhY2UoLyZhbXA7cXVvdDsvZywgJ1wiJylcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuIl19