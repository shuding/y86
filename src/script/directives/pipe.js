/**
 * Created by shuding on 6/10/15.
 * <ds303077135@gmail.com>
 */
angular.module('y86').directive('fetch', function () {
        return {
            restrict:   'E',
            scope:      true,
            transclude: true,
            template:   '<h3>FETCH</h3>' + '<div ng-transclude="true"></div>'
        }
    }).directive('decode', function () {
        return {
            restrict:  'E',
            scope:     true,
            transclude: true,
            template:  '<h3>DECODE</h3>' + '<div ng-transclude="true"></div>'
        }
    }).directive('execute', function () {
        return {
            restrict:  'E',
            scope:     true,
            transclude: true,
            template:  '<h3>EXECUTE</h3>' + '<div ng-transclude="true"></div>'
        }
    }).directive('memory', function () {
        return {
            restrict:  'E',
            scope:     true,
            transclude: true,
            template:  '<h3>MEMORY</h3>' + '<div ng-transclude="true"></div>'
        }
    }).directive('writeBack', function () {
        return {
            restrict:  'E',
            scope:     true,
            transclude: true,
            template:  '<h3>WRITE BACK</h3>' + '<div ng-transclude="true"></div>'
        }
    }).directive('pipeAttr', function () {
        return {
            restrict: 'E',
            scope: {
                pipeName: '=',
                pipeData: '=',
                pipePref: '='
            },
            transclude: true,
            template: '<h6>{{ pipeName }}</h6><p>{{ pipePref }}{{ pipeData }}</p>',
            link: function($scope, elem) {
                $scope.$watch('pipeData', function () {
                    move(elem[0])
                        .set('color', '#0B0B0B')
                        .set('background-color', '#37F3FF')
                        .duration('0s')
                        .delay('0s')
                        .then()
                        .set('color', '#37F3FF')
                        .set('background-color', '#0B0B0B')
                        .duration('.2s')
                        .delay('.1s')
                        .pop()
                        .end();
                });
            }
        }
    });
