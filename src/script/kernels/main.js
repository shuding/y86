/**
 * Created by shuding on 6/9/15.
 * <ds303077135@gmail.com>
 */

(function (window, undefined) {
    var Y86 = {
        modules: []
    };

    window.xhrGETSync = function (url) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url + '?' + (new Date()).getTime(), false);
        xhr.send();
        if (xhr.readyState == 4) {
            return xhr.responseText;
        }
        return undefined;
    };

    /**
     * The require (CommonJS) function.
     * @param path
     */
    window.require = function (path) {
        // Module cache
        if (typeof Y86.modules[path] !== 'undefined') {
            return Y86.modules[path];
        }

        var data = xhrGETSync(path + '.js');
        if (typeof data !== 'undefined') {
            Y86.modules[path] = eval('(function (window, undefined) { var module = {}; ' + data + '; return module.exports; })(window)');
        }

        return Y86.modules[path];
    };
})(window);
