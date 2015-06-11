/**
 * Created by shuding on 6/4/15.
 * <ds303077135@gmail.com>
 */
angular
    .module('y86')
    .directive('stackContainer', function () {
        return {
            restrict:   'E',
            transclude: true,
            template:   '<h3>MEMORY</h3>' +
                        '<div ng-transclude="true"></div>'
        }
    })
    .directive('stack', function () {
        return {
            restrict: 'E',
            transclude: true,
            template: '<div ng-transclude="true"></div>'
        }
    });
