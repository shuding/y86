/**
 * Created by shuding on 6/4/15.
 * <ds303077135@gmail.com>
 */
angular
    .module('y86')
    .directive('controlContainer', function () {
        return {
            restrict:   'E',
            transclude: true,
            template:   '<div ng-transclude="true"></div>'
        }
    }).directive('frequency', function () {
        return {
            restrict: 'E',
            transclude: true,
            scope:    {
                hz: '='
            },
            template: '1 Hz <input id="frequency-input" type="range" min="1" max="50" value="10" step=".1" ng-model="hz"> 50 Hz'
        }
    }).directive('frequencyLabel', function () {
        return {
            restrict: 'E',
            scope:    {
                hz: '='
            },
            template: '<span>{{ hz }}</span>'
        }
    }).directive('playPause', function () {
        return {
            restrict: 'E',
            scope:    {
                fn:   '&',
                icon: '='
            },
            template: '<button ng-click="fn()"><i class="fa fa-fw fa-{{ icon }}"></i></button>'
        }
    }).directive('prev', function () {
        return {
            restrict: 'E',
            scope:    {
                fn: '&'
            },
            template: '<button ng-click="fn()"><i class="fa fa-caret-left"></i></button>'
        }
    }).directive('next', function () {
        return {
            restrict: 'E',
            scope:    {
                fn: '&'
            },
            template: '<button ng-click="fn()"><i class="fa fa-caret-right"></i></button>'
        }
    }).directive('reset', function () {
        return {
            restrict: 'E',
            scope:    {
                fn: '&'
            },
            template: '<button ng-click="fn()"><i class="fa fa-fw fa-undo"></i> Reset</button>'
        }
    });
