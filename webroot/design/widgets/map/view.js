define(function(require) {
    var i = require("ui/imgmax");
    return function(n) {
        i(n.find("img"))
    }
});