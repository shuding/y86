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
            template:   '<div ng-transclude="true"></div>'
        }
    })
    .directive('flex-container', function () {
        return {
            restrict:   'E',
            transclude: true
        }
    });
