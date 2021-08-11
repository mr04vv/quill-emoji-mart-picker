import { __assign, __extends } from "tslib";
import unicodeRe from 'emoji-regex';
import Quill from 'quill';
import { Emoji } from './emoji.model';
var Module = Quill.import('core/module');
var EmojiModuleOptions = /** @class */ (function () {
    function EmojiModuleOptions() {
        this.showTitle = true;
        this.preventDrag = true;
        this.indicator = ':';
        this.convertEmoticons = true;
        this.convertShortNames = true;
        this.set = function () { return 'apple'; };
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
        if (navigator.userAgent.indexOf('Edge') > -1) {
            _this.isEdgeBrowser = true;
        }
        Emoji.uncompress(options.emojiData, options);
        if (options.preventDrag) {
            // Prevent emojis from dragging
            quill.container.addEventListener('dragstart', function (event) {
                event.preventDefault();
                return false;
            });
        }
        // Convert pasted unicode / emoticons / shortNames
        _this.quill.clipboard.addMatcher(Node.TEXT_NODE, function (node, delta) {
            return Emoji.convertPaste(delta, _this.replacements);
        });
        // Listen for text change to convert typed in emojis or pasted emojis using Windows 10 Emojis / mobile
        quill.on('text-change', function (delta, oldDelta, source) {
            // text-change also triggers on a paste event, this is a hack to prevent one more check
            if (!_this.pasted && source === Quill.sources.USER) {
                var changes = Emoji.convertInput(quill.getContents(), _this.replacements);
                if (changes.ops.length > 0) {
                    quill.updateContents(changes, Quill.sources.SILENT);
                }
            }
            _this.pasted = false;
        });
        // Changing cut to copy and delete
        // There seems to be a bug with Quill + Chrome with cut. The performance is much worse
        if (navigator.userAgent.indexOf('Chrome') > -1) {
            quill.container.addEventListener('cut', function (event) {
                var selection = document.getSelection();
                document.execCommand('copy');
                selection.deleteFromDocument();
                event.preventDefault();
            });
        }
        // Edge Bug #1: Image alt tags are not copied.
        // https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/13921866/
        // Edge Bug #2: the url() functions in inline styles are getting escaped when pasted
        quill.container.addEventListener('paste', function (event) {
            _this.pasted = true;
            if (_this.isEdgeBrowser) {
                event.clipboardData.setData('text/html', event.clipboardData.getData('text/html').replace(/&amp;quot;/g, '"'));
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
                    fn: function (str) { return Emoji.unicodeToEmoji(str); }
                }
            ];
            if (this.options.convertEmoticons) {
                // Emoticons to Emoji
                replacements.push({
                    regex: new RegExp(Emoji.emoticonRe, 'g'),
                    matchIndex: 1,
                    replacementIndex: 1,
                    fn: function (str) { return Emoji.emoticonToEmoji(str); }
                });
            }
            if (this.options.convertShortNames) {
                // ShortNames to Emoji
                replacements.push({
                    regex: new RegExp(Emoji.shortNameRe, 'g'),
                    matchIndex: 2,
                    replacementIndex: 1,
                    fn: function (str) { return Emoji.shortNameToEmoji(str); }
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
            EmojiModule.options = __assign(__assign({}, (new EmojiModuleOptions())), options);
        },
        enumerable: true,
        configurable: true
    });
    EmojiModule.options = null;
    return EmojiModule;
}(Module));
export { EmojiModule };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW1vamkucXVpbGwtbW9kdWxlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQG51dHJpZnkvcXVpbGwtZW1vamktbWFydC1waWNrZXIvIiwic291cmNlcyI6WyJlbW9qaS5xdWlsbC1tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sU0FBUyxNQUFNLGFBQWEsQ0FBQztBQUNwQyxPQUFPLEtBQUssTUFBTSxPQUFPLENBQUM7QUFFMUIsT0FBTyxFQUF1QixLQUFLLEVBQW1DLE1BQU0sZUFBZSxDQUFDO0FBRTVGLElBQU0sTUFBTSxHQUFRLEtBQUssQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUM7QUFJaEQ7SUFBQTtRQUdFLGNBQVMsR0FBRyxJQUFJLENBQUM7UUFDakIsZ0JBQVcsR0FBRyxJQUFJLENBQUM7UUFDbkIsY0FBUyxHQUFHLEdBQUcsQ0FBQztRQUNoQixxQkFBZ0IsR0FBRyxJQUFJLENBQUM7UUFDeEIsc0JBQWlCLEdBQUcsSUFBSSxDQUFDO1FBQ3pCLFFBQUcsR0FBb0IsY0FBTSxPQUFBLE9BQU8sRUFBUCxDQUFPLENBQUM7UUFDckMsc0JBQWlCLEdBQStDLFVBQUMsR0FBRyxFQUFFLFNBQVM7WUFDN0UsT0FBTyx3Q0FBc0MsR0FBRyxtQkFBYyxHQUFHLG9CQUFlLFNBQVMsU0FBTSxDQUFDO1FBQ2xHLENBQUMsQ0FBQTtJQUNILENBQUM7SUFBRCx5QkFBQztBQUFELENBQUMsQUFaRCxJQVlDOztBQUVEO0lBQWlDLCtCQUFNO0lBa0RyQyxpREFBaUQ7SUFDakQscUJBQW1CLEtBQVUsRUFBRSxPQUEyQjtRQUExRCxZQUNFLGtCQUFNLEtBQUssRUFBRSxPQUFPLENBQUMsU0E2RHRCO1FBOURrQixXQUFLLEdBQUwsS0FBSyxDQUFLO1FBL0NyQixtQkFBYSxHQUFHLEtBQUssQ0FBQztRQUN0QixZQUFNLEdBQUcsS0FBSyxDQUFDO1FBaURyQixLQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUV2QixJQUFJLFNBQVMs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Z0g1QyxrQkFBQztDQUFBLEFBbEhELENBQWlDLE1BQU0sR0FrSHRDO1NBbEhZLFdBQVciLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdW5pY29kZVJlIGZyb20gJ2Vtb2ppLXJlZ2V4JztcbmltcG9ydCBRdWlsbCBmcm9tICdxdWlsbCc7XG5cbmltcG9ydCB7IENvbXByZXNzZWRFbW9qaURhdGEsIEVtb2ppLCBJQ3VzdG9tRW1vamksIElFbW9qaVJlcGxhY2VtZW50IH0gZnJvbSAnLi9lbW9qaS5tb2RlbCc7XG5cbmNvbnN0IE1vZHVsZTogYW55ID0gUXVpbGwuaW1wb3J0KCdjb3JlL21vZHVsZScpO1xuXG5leHBvcnQgdHlwZSBFbW9qaVNldCA9ICdhcHBsZScgfCAnZ29vZ2xlJyB8ICd0d2l0dGVyJyB8ICdlbW9qaW9uZScgfCAnbWVzc2VuZ2VyJyB8ICdmYWNlYm9vaycgfCAnJztcblxuZXhwb3J0IGNsYXNzIEVtb2ppTW9kdWxlT3B0aW9ucyB7XG4gIGVtb2ppRGF0YTogQ29tcHJlc3NlZEVtb2ppRGF0YVtdO1xuICBjdXN0b21FbW9qaURhdGE/OiBJQ3VzdG9tRW1vamlbXTtcbiAgc2hvd1RpdGxlID0gdHJ1ZTtcbiAgcHJldmVudERyYWcgPSB0cnVlO1xuICBpbmRpY2F0b3IgPSAnOic7XG4gIGNvbnZlcnRFbW90aWNvbnMgPSB0cnVlO1xuICBjb252ZXJ0U2hvcnROYW1lcyA9IHRydWU7XG4gIHNldD86ICgpID0+IEVtb2ppU2V0ID0gKCkgPT4gJ2FwcGxlJztcbiAgYmFja2dyb3VuZEltYWdlRm46IChzZXQ6IHN0cmluZywgc2hlZXRTaXplOiBudW1iZXIpID0+IHN0cmluZyA9IChzZXQsIHNoZWV0U2l6ZSkgPT4ge1xuICAgIHJldHVybiBgaHR0cHM6Ly91bnBrZy5jb20vZW1vamktZGF0YXNvdXJjZS0ke3NldH1ANC4wLjQvaW1nLyR7c2V0fS9zaGVldHMtMjU2LyR7c2hlZXRTaXplfS5wbmdgO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBFbW9qaU1vZHVsZSBleHRlbmRzIE1vZHVsZSB7XG5cbiAgc3RhdGljIG9wdGlvbnM6IEVtb2ppTW9kdWxlT3B0aW9ucyA9IG51bGw7XG5cbiAgcHJpdmF0ZSBpc0VkZ2VCcm93c2VyID0gZmFsc2U7XG4gIHByaXZhdGUgcGFzdGVkID0gZmFsc2U7XG5cbiAgZ2V0IHJlcGxhY2VtZW50cygpOiBJRW1vamlSZXBsYWNlbWVudCB7XG5cbiAgICBjb25zdCByZXBsYWNlbWVudHMgPSBbXG4gICAgICAvLyBVbmljb2RlIHRvIEVtb2ppXG4gICAgICB7XG4gICAgICAgIHJlZ2V4OiB1bmljb2RlUmUoKSxcbiAgICAgICAgbWF0Y2hJbmRleDogMCxcbiAgICAgICAgcmVwbGFjZW1lbnRJbmRleDogMCxcbiAgICAgICAgZm46IChzdHI6IHN0cmluZykgPT4gRW1vamkudW5pY29kZVRvRW1vamkoc3RyKVxuICAgICAgfVxuICAgIF07XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmNvbnZlcnRFbW90aWNvbnMpIHtcbiAgICAgIC8vIEVtb3RpY29ucyB0byBFbW9qaVxuICAgICAgcmVwbGFjZW1lbnRzLnB1c2goe1xuICAgICAgICByZWdleDogbmV3IFJlZ0V4cChFbW9qaS5lbW90aWNvblJlLCAnZycpLFxuICAgICAgICBtYXRjaEluZGV4OiAxLFxuICAgICAgICByZXBsYWNlbWVudEluZGV4OiAxLFxuICAgICAgICBmbjogKHN0cjogc3RyaW5nKSA9PiBFbW9qaS5lbW90aWNvblRvRW1vamkoc3RyKVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5jb252ZXJ0U2hvcnROYW1lcykge1xuICAgICAgLy8gU2hvcnROYW1lcyB0byBFbW9qaVxuICAgICAgcmVwbGFjZW1lbnRzLnB1c2goe1xuICAgICAgICByZWdleDogbmV3IFJlZ0V4cChFbW9qaS5zaG9ydE5hbWVSZSwgJ2cnKSxcbiAgICAgICAgbWF0Y2hJbmRleDogMixcbiAgICAgICAgcmVwbGFjZW1lbnRJbmRleDogMSxcbiAgICAgICAgZm46IChzdHI6IHN0cmluZykgPT4gRW1vamkuc2hvcnROYW1lVG9FbW9qaShzdHIpXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVwbGFjZW1lbnRzO1xuICB9XG5cbiAgZ2V0IG9wdGlvbnMoKTogRW1vamlNb2R1bGVPcHRpb25zIHtcbiAgICByZXR1cm4gRW1vamlNb2R1bGUub3B0aW9ucztcbiAgfVxuXG4gIHNldCBvcHRpb25zKG9wdGlvbnM6IEVtb2ppTW9kdWxlT3B0aW9ucykge1xuICAgIEVtb2ppTW9kdWxlLm9wdGlvbnMgPSB7IC4uLihuZXcgRW1vamlNb2R1bGVPcHRpb25zKCkpLCAuLi5vcHRpb25zIH07XG4gIH1cblxuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6IG5vLXNoYWRvd2VkLXZhcmlhYmxlXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBxdWlsbDogYW55LCBvcHRpb25zOiBFbW9qaU1vZHVsZU9wdGlvbnMpIHtcbiAgICBzdXBlcihxdWlsbCwgb3B0aW9ucyk7XG5cbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuXG4gICAgaWYgKG5hdmlnYXRvci51c2VyQWdlbnQuaW5kZXhPZignRWRnZScpID4gLTEpIHtcbiAgICAgIHRoaXMuaXNFZGdlQnJvd3NlciA9IHRydWU7XG4gICAgfVxuXG4gICAgRW1vamkudW5jb21wcmVzcyhvcHRpb25zLmVtb2ppRGF0YSwgb3B0aW9ucyk7XG5cbiAgICBpZiAob3B0aW9ucy5wcmV2ZW50RHJhZykge1xuICAgICAgLy8gUHJldmVudCBlbW9qaXMgZnJvbSBkcmFnZ2luZ1xuICAgICAgcXVpbGwuY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdzdGFydCcsIChldmVudDogRHJhZ0V2ZW50KSA9PiB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIENvbnZlcnQgcGFzdGVkIHVuaWNvZGUgLyBlbW90aWNvbnMgLyBzaG9ydE5hbWVzXG4gICAgdGhpcy5xdWlsbC5jbGlwYm9hcmQuYWRkTWF0Y2hlcihOb2RlLlRFWFRfTk9ERSwgKG5vZGU6IEhUTUxFbGVtZW50LCBkZWx0YTogYW55KSA9PiB7XG5cbiAgICAgIHJldHVybiBFbW9qaS5jb252ZXJ0UGFzdGUoZGVsdGEsIHRoaXMucmVwbGFjZW1lbnRzKTtcbiAgICB9KTtcblxuICAgIC8vIExpc3RlbiBmb3IgdGV4dCBjaGFuZ2UgdG8gY29udmVydCB0eXBlZCBpbiBlbW9qaXMgb3IgcGFzdGVkIGVtb2ppcyB1c2luZyBXaW5kb3dzIDEwIEVtb2ppcyAvIG1vYmlsZVxuICAgIHF1aWxsLm9uKCd0ZXh0LWNoYW5nZScsIChkZWx0YTogYW55LCBvbGREZWx0YTogYW55LCBzb3VyY2U6IHN0cmluZykgPT4ge1xuXG4gICAgICAvLyB0ZXh0LWNoYW5nZSBhbHNvIHRyaWdnZXJzIG9uIGEgcGFzdGUgZXZlbnQsIHRoaXMgaXMgYSBoYWNrIHRvIHByZXZlbnQgb25lIG1vcmUgY2hlY2tcbiAgICAgIGlmICghdGhpcy5wYXN0ZWQgJiYgc291cmNlID09PSBRdWlsbC5zb3VyY2VzLlVTRVIpIHtcblxuICAgICAgICBjb25zdCBjaGFuZ2VzID0gRW1vamkuY29udmVydElucHV0KHF1aWxsLmdldENvbnRlbnRzKCksIHRoaXMucmVwbGFjZW1lbnRzKTtcblxuICAgICAgICBpZiAoY2hhbmdlcy5vcHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgIHF1aWxsLnVwZGF0ZUNvbnRlbnRzKGNoYW5nZXMsIFF1aWxsLnNvdXJjZXMuU0lMRU5UKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLnBhc3RlZCA9IGZhbHNlO1xuICAgIH0pO1xuXG4gICAgLy8gQ2hhbmdpbmcgY3V0IHRvIGNvcHkgYW5kIGRlbGV0ZVxuICAgIC8vIFRoZXJlIHNlZW1zIHRvIGJlIGEgYnVnIHdpdGggUXVpbGwgKyBDaHJvbWUgd2l0aCBjdXQuIFRoZSBwZXJmb3JtYW5jZSBpcyBtdWNoIHdvcnNlXG4gICAgaWYgKG5hdmlnYXRvci51c2VyQWdlbnQuaW5kZXhPZignQ2hyb21lJykgPiAtMSkge1xuICAgICAgcXVpbGwuY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoJ2N1dCcsIChldmVudDogQ2xpcGJvYXJkRXZlbnQpID0+IHtcbiAgICAgICAgY29uc3Qgc2VsZWN0aW9uID0gZG9jdW1lbnQuZ2V0U2VsZWN0aW9uKCk7XG4gICAgICAgIGRvY3VtZW50LmV4ZWNDb21tYW5kKCdjb3B5Jyk7XG4gICAgICAgIHNlbGVjdGlvbi5kZWxldGVGcm9tRG9jdW1lbnQoKTtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIEVkZ2UgQnVnICMxOiBJbWFnZSBhbHQgdGFncyBhcmUgbm90IGNvcGllZC5cbiAgICAvLyBodHRwczovL2RldmVsb3Blci5taWNyb3NvZnQuY29tL2VuLXVzL21pY3Jvc29mdC1lZGdlL3BsYXRmb3JtL2lzc3Vlcy8xMzkyMTg2Ni9cbiAgICAvLyBFZGdlIEJ1ZyAjMjogdGhlIHVybCgpIGZ1bmN0aW9ucyBpbiBpbmxpbmUgc3R5bGVzIGFyZSBnZXR0aW5nIGVzY2FwZWQgd2hlbiBwYXN0ZWRcbiAgICBxdWlsbC5jb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lcigncGFzdGUnLCAoZXZlbnQ6IENsaXBib2FyZEV2ZW50KSA9PiB7XG4gICAgICB0aGlzLnBhc3RlZCA9IHRydWU7XG5cbiAgICAgIGlmICh0aGlzLmlzRWRnZUJyb3dzZXIpIHtcbiAgICAgICAgZXZlbnQuY2xpcGJvYXJkRGF0YS5zZXREYXRhKCd0ZXh0L2h0bWwnLCBldmVudC5jbGlwYm9hcmREYXRhLmdldERhdGEoJ3RleHQvaHRtbCcpLnJlcGxhY2UoLyZhbXA7cXVvdDsvZywgJ1wiJykpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59XG4iXX0=