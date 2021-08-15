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
                    regex: typeof Emoji.emoticonRe === "string"
                        ? new RegExp(Emoji.emoticonRe, "g")
                        : new RegExp(Emoji.emoticonRe),
                    matchIndex: 1,
                    replacementIndex: 1,
                    fn: function (str) { return Emoji.emoticonToEmoji(str); },
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW1vamkucXVpbGwtbW9kdWxlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQG51dHJpZnkvcXVpbGwtZW1vamktbWFydC1waWNrZXIvIiwic291cmNlcyI6WyJlbW9qaS5xdWlsbC1tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sU0FBUyxNQUFNLGFBQWEsQ0FBQztBQUNwQyxPQUFPLEtBQUssTUFBTSxPQUFPLENBQUM7QUFFMUIsT0FBTyxFQUVMLEtBQUssR0FHTixNQUFNLGVBQWUsQ0FBQztBQUV2QixJQUFNLE1BQU0sR0FBUSxLQUFLLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBV2hEO0lBQUE7UUFHRSxjQUFTLEdBQUcsS0FBSyxDQUFDO1FBQ2xCLGdCQUFXLEdBQUcsSUFBSSxDQUFDO1FBQ25CLGNBQVMsR0FBRyxHQUFHLENBQUM7UUFDaEIscUJBQWdCLEdBQUcsSUFBSSxDQUFDO1FBQ3hCLHNCQUFpQixHQUFHLElBQUksQ0FBQztRQUN6QixRQUFHLEdBQW9CLGNBQU0sT0FBQSxPQUFPLEVBQVAsQ0FBTyxDQUFDO1FBQ3JDLHNCQUFpQixHQUErQyxVQUM5RCxHQUFHLEVBQ0gsU0FBUztZQUVULE9BQU8sd0NBQXNDLEdBQUcsbUJBQWMsR0FBRyxvQkFBZSxTQUFTLFNBQU0sQ0FBQztRQUNsRyxDQUFDLENBQUM7SUFDSixDQUFDO0lBQUQseUJBQUM7QUFBRCxDQUFDLEFBZkQsSUFlQzs7QUFFRDtJQUFpQywrQkFBTTtJQXNEckMsaURBQWlEO0lBQ2pELHFCQUFtQixLQUFVLEVBQUUsT0FBMkI7UUFBMUQsWUFDRSxrQkFBTSxLQUFLLEVBQUUsT0FBTyxDQUFDLFNBcUV0QjtRQXRFa0IsV0FBSyxHQUFMLEtBQUssQ0FBSztRQXBEckIsbUJBQWEsR0FBRyxLQUFLLENBQUM7UUFDdEIsWUFBTSxHQUFHLEtBQUssQ0FBQztRQXNEckIsS0FBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFFdkIsSUFBSSxTQUFTLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtZQUM1QyxLQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztTQUMzQjtRQUVELEtBQUssQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUU3QyxJQUFJLE9BQU8sQ0FBQyxXQUFXLEVBQUU7WUFDdkIsK0JBQStCO1lBQy9CLEtBQUssQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLFVBQUMsS0FBZ0I7Z0JBQzdELEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDdkIsT0FBTyxLQUFLLENBQUM7WUFDZixDQUFDLENBQUMsQ0FBQztTQUNKO1FBRUQsa0RBQWtEO1FBQ2xELEtBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FDN0IsSUFBSSxDQUFDLFNBQVMsRUFDZCxVQUFDLElBQWlCLEVBQUUsS0FBVTtZQUM1QixPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3RCLE9BQU8sS0FBSyxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsS0FBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ3RELENBQUMsQ0FDRixDQUFDO1FBRUYsc0dBQXNHO1FBQ3RHLEtBQUssQ0FBQyxFQUFFLENBQUMsYUFBYSxFQUFFLFVBQUMsS0FBVSxFQUFFLFFBQWEsRUFBRSxNQUFjO1lBQ2hFLHVGQUF1RjtZQUN2RixJQUFJLENBQUMsS0FBSSxDQUFDLE1BQU0sSUFBSSxNQUFNLEtBQUssS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUU7Z0JBQ2pELE9BQU8sQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsQ0FBQztnQkFDbkMsSUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLFlBQVksQ0FDaEMsS0FBSyxDQUFDLFdBQVcsRUFBRSxFQUNuQixLQUFJLENBQUMsWUFBWSxDQUNsQixDQUFDO2dCQUVGLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO29CQUMxQixLQUFLLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2lCQUNyRDthQUNGO1lBRUQsS0FBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7UUFDdEIsQ0FBQyxDQUFDLENBQUM7UUFFSCxrQ0FBa0M7UUFDbEMsc0ZBQXNGO1FBQ3RGLElBQUksU0FBUyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUU7WUFDOUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUUsVUFBQyxLQUFxQjtnQkFDNUQsSUFBTSxTQUFTLEdBQUcsUUFBUSxDQUFDLFlBQVksRUFBRSxDQUFDO2dCQUMxQyxRQUFRLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUM3QixTQUFTLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztnQkFDL0IsS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ3pCLENBQUMsQ0FBQyxDQUFDO1NBQ0o7UUFFRCw4Q0FBOEM7UUFDOUMsaUZBQWlGO1FBQ2pGLG9GQUFvRjtRQUNwRixLQUFLLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxVQUFDLEtBQXFCO1lBQzlELEtBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO1lBRW5CLElBQUksS0FBSSxDQUFDLGFBQWEsRUFBRTtnQkFDdEIsS0FBSyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQ3pCLFdBQVcsRUFDWCxLQUFLLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFLEdBQUcsQ0FBQyxDQUNyRSxDQUFDO2FBQ0g7UUFDSCxDQUFDLENBQUMsQ0FBQzs7SUFDTCxDQUFDO0lBdkhELHNCQUFJLHFDQUFZO2FBQWhCO1lBQ0UsSUFBTSxZQUFZLEdBQUc7Z0JBQ25CLG1CQUFtQjtnQkFDbkI7b0JBQ0UsS0FBSyxFQUFFLFNBQVMsRUFBRTtvQkFDbEIsVUFBVSxFQUFFLENBQUM7b0JBQ2IsZ0JBQWdCLEVBQUUsQ0FBQztvQkFDbkIsRUFBRSxFQUFFLFVBQUMsR0FBVyxJQUFLLE9BQUEsS0FBSyxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsRUFBekIsQ0FBeUI7aUJBQy9DO2FBQ0YsQ0FBQztZQUVGLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRTtnQkFDakMscUJBQXFCO2dCQUNyQixZQUFZLENBQUMsSUFBSSxDQUFDO29CQUNoQixLQUFLLEVBQ0gsT0FBTyxLQUFLLENBQUMsVUFBVSxLQUFLLFFBQVE7d0JBQ2xDLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLEdBQUcsQ0FBQzt3QkFDbkMsQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUM7b0JBQ2xDLFVBQVUsRUFBRSxDQUFDO29CQUNiLGdCQUFnQixFQUFFLENBQUM7b0JBQ25CLEVBQUUsRUFBRSxVQUFDLEdBQVcsSUFBSyxPQUFBLEtBQUssQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLEVBQTFCLENBQTBCO2lCQUNoRCxDQUFDLENBQUM7YUFDSjtZQUVELElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsRUFBRTtnQkFDbEMsc0JBQXNCO2dCQUN0QixZQUFZLENBQUMsSUFBSSxDQUFDO29CQUNoQixLQUFLLEVBQ0gsT0FBTyxLQUFLLENBQUMsV0FBVyxLQUFLLFFBQVE7d0JBQ25DLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQzt3QkFDcEMsQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUM7b0JBQ25DLFVBQVUsRUFBRSxDQUFDO29CQUNiLGdCQUFnQixFQUFFLENBQUM7b0JBQ25CLEVBQUUsRUFBRSxVQUFDLEdBQVcsSUFBSyxPQUFBLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsRUFBM0IsQ0FBMkI7aUJBQ2pELENBQUMsQ0FBQzthQUNKO1lBRUQsT0FBTyxZQUFZLENBQUM7UUFDdEIsQ0FBQzs7O09BQUE7SUFFRCxzQkFBSSxnQ0FBTzthQUFYO1lBQ0UsT0FBTyxXQUFXLENBQUMsT0FBTyxDQUFDO1FBQzdCLENBQUM7YUFFRCxVQUFZLE9BQTJCO1lBQ3JDLFdBQVcsQ0FBQyxPQUFPLHlCQUFRLElBQUksa0JBQWtCLEVBQUUsR0FBSyxPQUFPLENBQUUsQ0FBQztRQUNwRSxDQUFDOzs7T0FKQTtJQS9DTSxtQkFBTyxHQUF1QixJQUFJLENBQUM7SUE2SDVDLGtCQUFDO0NBQUEsQUE5SEQsQ0FBaUMsTUFBTSxHQThIdEM7U0E5SFksV0FBVyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB1bmljb2RlUmUgZnJvbSBcImVtb2ppLXJlZ2V4XCI7XG5pbXBvcnQgUXVpbGwgZnJvbSBcInF1aWxsXCI7XG5cbmltcG9ydCB7XG4gIENvbXByZXNzZWRFbW9qaURhdGEsXG4gIEVtb2ppLFxuICBJQ3VzdG9tRW1vamksXG4gIElFbW9qaVJlcGxhY2VtZW50LFxufSBmcm9tIFwiLi9lbW9qaS5tb2RlbFwiO1xuXG5jb25zdCBNb2R1bGU6IGFueSA9IFF1aWxsLmltcG9ydChcImNvcmUvbW9kdWxlXCIpO1xuXG5leHBvcnQgdHlwZSBFbW9qaVNldCA9XG4gIHwgXCJhcHBsZVwiXG4gIHwgXCJnb29nbGVcIlxuICB8IFwidHdpdHRlclwiXG4gIHwgXCJlbW9qaW9uZVwiXG4gIHwgXCJtZXNzZW5nZXJcIlxuICB8IFwiZmFjZWJvb2tcIlxuICB8IFwiXCI7XG5cbmV4cG9ydCBjbGFzcyBFbW9qaU1vZHVsZU9wdGlvbnMge1xuICBlbW9qaURhdGE6IENvbXByZXNzZWRFbW9qaURhdGFbXTtcbiAgY3VzdG9tRW1vamlEYXRhPzogSUN1c3RvbUVtb2ppW107XG4gIHNob3dUaXRsZSA9IGZhbHNlO1xuICBwcmV2ZW50RHJhZyA9IHRydWU7XG4gIGluZGljYXRvciA9IFwiOlwiO1xuICBjb252ZXJ0RW1vdGljb25zID0gdHJ1ZTtcbiAgY29udmVydFNob3J0TmFtZXMgPSB0cnVlO1xuICBzZXQ/OiAoKSA9PiBFbW9qaVNldCA9ICgpID0+IFwiYXBwbGVcIjtcbiAgYmFja2dyb3VuZEltYWdlRm46IChzZXQ6IHN0cmluZywgc2hlZXRTaXplOiBudW1iZXIpID0+IHN0cmluZyA9IChcbiAgICBzZXQsXG4gICAgc2hlZXRTaXplXG4gICkgPT4ge1xuICAgIHJldHVybiBgaHR0cHM6Ly91bnBrZy5jb20vZW1vamktZGF0YXNvdXJjZS0ke3NldH1ANC4wLjQvaW1nLyR7c2V0fS9zaGVldHMtMjU2LyR7c2hlZXRTaXplfS5wbmdgO1xuICB9O1xufVxuXG5leHBvcnQgY2xhc3MgRW1vamlNb2R1bGUgZXh0ZW5kcyBNb2R1bGUge1xuICBzdGF0aWMgb3B0aW9uczogRW1vamlNb2R1bGVPcHRpb25zID0gbnVsbDtcblxuICBwcml2YXRlIGlzRWRnZUJyb3dzZXIgPSBmYWxzZTtcbiAgcHJpdmF0ZSBwYXN0ZWQgPSBmYWxzZTtcblxuICBnZXQgcmVwbGFjZW1lbnRzKCk6IElFbW9qaVJlcGxhY2VtZW50IHtcbiAgICBjb25zdCByZXBsYWNlbWVudHMgPSBbXG4gICAgICAvLyBVbmljb2RlIHRvIEVtb2ppXG4gICAgICB7XG4gICAgICAgIHJlZ2V4OiB1bmljb2RlUmUoKSxcbiAgICAgICAgbWF0Y2hJbmRleDogMCxcbiAgICAgICAgcmVwbGFjZW1lbnRJbmRleDogMCxcbiAgICAgICAgZm46IChzdHI6IHN0cmluZykgPT4gRW1vamkudW5pY29kZVRvRW1vamkoc3RyKSxcbiAgICAgIH0sXG4gICAgXTtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMuY29udmVydEVtb3RpY29ucykge1xuICAgICAgLy8gRW1vdGljb25zIHRvIEVtb2ppXG4gICAgICByZXBsYWNlbWVudHMucHVzaCh7XG4gICAgICAgIHJlZ2V4OlxuICAgICAgICAgIHR5cGVvZiBFbW9qaS5lbW90aWNvblJlID09PSBcInN0cmluZ1wiXG4gICAgICAgICAgICA/IG5ldyBSZWdFeHAoRW1vamkuZW1vdGljb25SZSwgXCJnXCIpXG4gICAgICAgICAgICA6IG5ldyBSZWdFeHAoRW1vamkuZW1vdGljb25SZSksXG4gICAgICAgIG1hdGNoSW5kZXg6IDEsXG4gICAgICAgIHJlcGxhY2VtZW50SW5kZXg6IDEsXG4gICAgICAgIGZuOiAoc3RyOiBzdHJpbmcpID0+IEVtb2ppLmVtb3RpY29uVG9FbW9qaShzdHIpLFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5jb252ZXJ0U2hvcnROYW1lcykge1xuICAgICAgLy8gU2hvcnROYW1lcyB0byBFbW9qaVxuICAgICAgcmVwbGFjZW1lbnRzLnB1c2goe1xuICAgICAgICByZWdleDpcbiAgICAgICAgICB0eXBlb2YgRW1vamkuc2hvcnROYW1lUmUgPT09IFwic3RyaW5nXCJcbiAgICAgICAgICAgID8gbmV3IFJlZ0V4cChFbW9qaS5zaG9ydE5hbWVSZSwgXCJnXCIpXG4gICAgICAgICAgICA6IG5ldyBSZWdFeHAoRW1vamkuc2hvcnROYW1lUmUpLFxuICAgICAgICBtYXRjaEluZGV4OiAyLFxuICAgICAgICByZXBsYWNlbWVudEluZGV4OiAxLFxuICAgICAgICBmbjogKHN0cjogc3RyaW5nKSA9PiBFbW9qaS5zaG9ydE5hbWVUb0Vtb2ppKHN0ciksXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVwbGFjZW1lbnRzO1xuICB9XG5cbiAgZ2V0IG9wdGlvbnMoKTogRW1vamlNb2R1bGVPcHRpb25zIHtcbiAgICByZXR1cm4gRW1vamlNb2R1bGUub3B0aW9ucztcbiAgfVxuXG4gIHNldCBvcHRpb25zKG9wdGlvbnM6IEVtb2ppTW9kdWxlT3B0aW9ucykge1xuICAgIEVtb2ppTW9kdWxlLm9wdGlvbnMgPSB7IC4uLm5ldyBFbW9qaU1vZHVsZU9wdGlvbnMoKSwgLi4ub3B0aW9ucyB9O1xuICB9XG5cbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOiBuby1zaGFkb3dlZC12YXJpYWJsZVxuICBjb25zdHJ1Y3RvcihwdWJsaWMgcXVpbGw6IGFueSwgb3B0aW9uczogRW1vamlNb2R1bGVPcHRpb25zKSB7XG4gICAgc3VwZXIocXVpbGwsIG9wdGlvbnMpO1xuXG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcblxuICAgIGlmIChuYXZpZ2F0b3IudXNlckFnZW50LmluZGV4T2YoXCJFZGdlXCIpID4gLTEpIHtcbiAgICAgIHRoaXMuaXNFZGdlQnJvd3NlciA9IHRydWU7XG4gICAgfVxuXG4gICAgRW1vamkudW5jb21wcmVzcyhvcHRpb25zLmVtb2ppRGF0YSwgb3B0aW9ucyk7XG5cbiAgICBpZiAob3B0aW9ucy5wcmV2ZW50RHJhZykge1xuICAgICAgLy8gUHJldmVudCBlbW9qaXMgZnJvbSBkcmFnZ2luZ1xuICAgICAgcXVpbGwuY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnc3RhcnRcIiwgKGV2ZW50OiBEcmFnRXZlbnQpID0+IHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gQ29udmVydCBwYXN0ZWQgdW5pY29kZSAvIGVtb3RpY29ucyAvIHNob3J0TmFtZXNcbiAgICB0aGlzLnF1aWxsLmNsaXBib2FyZC5hZGRNYXRjaGVyKFxuICAgICAgTm9kZS5URVhUX05PREUsXG4gICAgICAobm9kZTogSFRNTEVsZW1lbnQsIGRlbHRhOiBhbnkpID0+IHtcbiAgICAgICAgY29uc29sZS5kZWJ1ZyhcImhlcmVcIik7XG4gICAgICAgIHJldHVybiBFbW9qaS5jb252ZXJ0UGFzdGUoZGVsdGEsIHRoaXMucmVwbGFjZW1lbnRzKTtcbiAgICAgIH1cbiAgICApO1xuXG4gICAgLy8gTGlzdGVuIGZvciB0ZXh0IGNoYW5nZSB0byBjb252ZXJ0IHR5cGVkIGluIGVtb2ppcyBvciBwYXN0ZWQgZW1vamlzIHVzaW5nIFdpbmRvd3MgMTAgRW1vamlzIC8gbW9iaWxlXG4gICAgcXVpbGwub24oXCJ0ZXh0LWNoYW5nZVwiLCAoZGVsdGE6IGFueSwgb2xkRGVsdGE6IGFueSwgc291cmNlOiBzdHJpbmcpID0+IHtcbiAgICAgIC8vIHRleHQtY2hhbmdlIGFsc28gdHJpZ2dlcnMgb24gYSBwYXN0ZSBldmVudCwgdGhpcyBpcyBhIGhhY2sgdG8gcHJldmVudCBvbmUgbW9yZSBjaGVja1xuICAgICAgaWYgKCF0aGlzLnBhc3RlZCAmJiBzb3VyY2UgPT09IFF1aWxsLnNvdXJjZXMuVVNFUikge1xuICAgICAgICBjb25zb2xlLmRlYnVnKFwic2RqZmtsc2RrbGZqc2Rha2xcIik7XG4gICAgICAgIGNvbnN0IGNoYW5nZXMgPSBFbW9qaS5jb252ZXJ0SW5wdXQoXG4gICAgICAgICAgcXVpbGwuZ2V0Q29udGVudHMoKSxcbiAgICAgICAgICB0aGlzLnJlcGxhY2VtZW50c1xuICAgICAgICApO1xuXG4gICAgICAgIGlmIChjaGFuZ2VzLm9wcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgcXVpbGwudXBkYXRlQ29udGVudHMoY2hhbmdlcywgUXVpbGwuc291cmNlcy5TSUxFTlQpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMucGFzdGVkID0gZmFsc2U7XG4gICAgfSk7XG5cbiAgICAvLyBDaGFuZ2luZyBjdXQgdG8gY29weSBhbmQgZGVsZXRlXG4gICAgLy8gVGhlcmUgc2VlbXMgdG8gYmUgYSBidWcgd2l0aCBRdWlsbCArIENocm9tZSB3aXRoIGN1dC4gVGhlIHBlcmZvcm1hbmNlIGlzIG11Y2ggd29yc2VcbiAgICBpZiAobmF2aWdhdG9yLnVzZXJBZ2VudC5pbmRleE9mKFwiQ2hyb21lXCIpID4gLTEpIHtcbiAgICAgIHF1aWxsLmNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKFwiY3V0XCIsIChldmVudDogQ2xpcGJvYXJkRXZlbnQpID0+IHtcbiAgICAgICAgY29uc3Qgc2VsZWN0aW9uID0gZG9jdW1lbnQuZ2V0U2VsZWN0aW9uKCk7XG4gICAgICAgIGRvY3VtZW50LmV4ZWNDb21tYW5kKFwiY29weVwiKTtcbiAgICAgICAgc2VsZWN0aW9uLmRlbGV0ZUZyb21Eb2N1bWVudCgpO1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gRWRnZSBCdWcgIzE6IEltYWdlIGFsdCB0YWdzIGFyZSBub3QgY29waWVkLlxuICAgIC8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1pY3Jvc29mdC5jb20vZW4tdXMvbWljcm9zb2Z0LWVkZ2UvcGxhdGZvcm0vaXNzdWVzLzEzOTIxODY2L1xuICAgIC8vIEVkZ2UgQnVnICMyOiB0aGUgdXJsKCkgZnVuY3Rpb25zIGluIGlubGluZSBzdHlsZXMgYXJlIGdldHRpbmcgZXNjYXBlZCB3aGVuIHBhc3RlZFxuICAgIHF1aWxsLmNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKFwicGFzdGVcIiwgKGV2ZW50OiBDbGlwYm9hcmRFdmVudCkgPT4ge1xuICAgICAgdGhpcy5wYXN0ZWQgPSB0cnVlO1xuXG4gICAgICBpZiAodGhpcy5pc0VkZ2VCcm93c2VyKSB7XG4gICAgICAgIGV2ZW50LmNsaXBib2FyZERhdGEuc2V0RGF0YShcbiAgICAgICAgICBcInRleHQvaHRtbFwiLFxuICAgICAgICAgIGV2ZW50LmNsaXBib2FyZERhdGEuZ2V0RGF0YShcInRleHQvaHRtbFwiKS5yZXBsYWNlKC8mYW1wO3F1b3Q7L2csICdcIicpXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==