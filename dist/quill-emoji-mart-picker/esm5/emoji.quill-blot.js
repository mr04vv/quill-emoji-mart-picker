import { __extends } from "tslib";
import Quill from "quill";
import { Emoji } from "./emoji.model";
import { EmojiModule } from "./emoji.quill-module";
var Parchment = Quill.import("parchment");
var EmojiBlot = /** @class */ (function (_super) {
    __extends(EmojiBlot, _super);
    function EmojiBlot() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    EmojiBlot.create = function (value) {
        var node = _super.create.call(this);
        var options = EmojiModule.options;
        if (value) {
            Emoji.buildImage(value, node, options.set(), options);
        }
        return node;
    };
    EmojiBlot.value = function (node) {
        return node.getAttribute("alt");
    };
    return EmojiBlot;
}(Parchment.Embed));
export { EmojiBlot };
// tslint:disable: no-string-literal
EmojiBlot["blotName"] = "emoji";
EmojiBlot["className"] = "ql-emoji";
EmojiBlot["tagName"] = "img";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW1vamkucXVpbGwtYmxvdC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0BudXRyaWZ5L3F1aWxsLWVtb2ppLW1hcnQtcGlja2VyLyIsInNvdXJjZXMiOlsiZW1vamkucXVpbGwtYmxvdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxLQUFLLE1BQU0sT0FBTyxDQUFDO0FBRTFCLE9BQU8sRUFBRSxLQUFLLEVBQVUsTUFBTSxlQUFlLENBQUM7QUFDOUMsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBRW5ELElBQU0sU0FBUyxHQUFRLEtBQUssQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUM7QUFFakQ7SUFBK0IsNkJBQWU7SUFBOUM7O0lBZ0JBLENBQUM7SUFmUSxnQkFBTSxHQUFiLFVBQWMsS0FBc0I7UUFDbEMsSUFBTSxJQUFJLEdBQWdCLE9BQU0sTUFBTSxXQUFpQixDQUFDO1FBRXhELElBQU0sT0FBTyxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUM7UUFFcEMsSUFBSSxLQUFLLEVBQUU7WUFDVCxLQUFLLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1NBQ3ZEO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRU0sZUFBSyxHQUFaLFVBQWEsSUFBaUI7UUFDNUIsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFDSCxnQkFBQztBQUFELENBQUMsQUFoQkQsQ0FBK0IsU0FBUyxDQUFDLEtBQUssR0FnQjdDOztBQUVELG9DQUFvQztBQUNwQyxTQUFTLENBQUMsVUFBVSxDQUFDLEdBQUcsT0FBTyxDQUFDO0FBQ2hDLFNBQVMsQ0FBQyxXQUFXLENBQUMsR0FBRyxVQUFVLENBQUM7QUFDcEMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEtBQUssQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBRdWlsbCBmcm9tIFwicXVpbGxcIjtcblxuaW1wb3J0IHsgRW1vamksIElFbW9qaSB9IGZyb20gXCIuL2Vtb2ppLm1vZGVsXCI7XG5pbXBvcnQgeyBFbW9qaU1vZHVsZSB9IGZyb20gXCIuL2Vtb2ppLnF1aWxsLW1vZHVsZVwiO1xuXG5jb25zdCBQYXJjaG1lbnQ6IGFueSA9IFF1aWxsLmltcG9ydChcInBhcmNobWVudFwiKTtcblxuZXhwb3J0IGNsYXNzIEVtb2ppQmxvdCBleHRlbmRzIFBhcmNobWVudC5FbWJlZCB7XG4gIHN0YXRpYyBjcmVhdGUodmFsdWU6IHN0cmluZyB8IElFbW9qaSkge1xuICAgIGNvbnN0IG5vZGU6IEhUTUxFbGVtZW50ID0gc3VwZXIuY3JlYXRlKCkgYXMgSFRNTEVsZW1lbnQ7XG5cbiAgICBjb25zdCBvcHRpb25zID0gRW1vamlNb2R1bGUub3B0aW9ucztcblxuICAgIGlmICh2YWx1ZSkge1xuICAgICAgRW1vamkuYnVpbGRJbWFnZSh2YWx1ZSwgbm9kZSwgb3B0aW9ucy5zZXQoKSwgb3B0aW9ucyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cblxuICBzdGF0aWMgdmFsdWUobm9kZTogSFRNTEVsZW1lbnQpIHtcbiAgICByZXR1cm4gbm9kZS5nZXRBdHRyaWJ1dGUoXCJhbHRcIik7XG4gIH1cbn1cblxuLy8gdHNsaW50OmRpc2FibGU6IG5vLXN0cmluZy1saXRlcmFsXG5FbW9qaUJsb3RbXCJibG90TmFtZVwiXSA9IFwiZW1vamlcIjtcbkVtb2ppQmxvdFtcImNsYXNzTmFtZVwiXSA9IFwicWwtZW1vamlcIjtcbkVtb2ppQmxvdFtcInRhZ05hbWVcIl0gPSBcImltZ1wiO1xuIl19