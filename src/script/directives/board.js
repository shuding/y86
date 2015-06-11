/**
 * Created by shuding on 6/4/15.
 * <ds303077135@gmail.com>
 */
angular
    .module('y86')
    .directive('board', function () {
        return {
            restrict:   'E',
            transclude: true,
            template:   '<h1>Y86 Simulator<br/>' +
                        '<small>Author: <a href="mailto:quietshu@gmail.com" target="_blank">Shu Ding</a>.' +
                        ' Source: <a href="https://github.com/quietshu/y86" target="_blank">GitHub</a>.</small>' +
                        '</h1>' +
                        '<div ng-transclude="true"></div>'
        }
    })
    .directive('flex-container', function () {
        return {
            restrict:   'E',
            transclude: true
        }
    });
