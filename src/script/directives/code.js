/**
 * Created by shuding on 6/5/15.
 * <ds303077135@gmail.com>
 */
angular
    .module('y86')
    .directive('codeContainer', function () {
        return {
            restrict:   'E',
            scope:      true,
            transclude: true,
            template:   '<h2 ng-repeat="tab in code.tabs" ng-class="{active: $index == code.currentTab}" ng-click="loadTab($index)"><span class="tab"></span>{{ tab }}</h2><h2><span class="tab"></span><input type="file">+</h2>' +
                        '<pre><code ng-transclude="true"></code></pre><span class="info">WRITE ASSEMBLY CODE HERE</span>',
            link:       function ($scope, elem) {
                var pre = elem.find('pre')[0];
                $scope.$watch(function () {
                    $scope.code.height = pre.offsetHeight;
                    $scope.code.scrollHeight = pre.scrollHeight;
                });
                $scope.$watch('code.scrollTop', function () {
                    pre.scrollTop = $scope.code.scrollTop;
                });

                var file = elem.find('input');
                file.bind('change', function (event) {
                    $scope.newTab(event.target.files);
                });
            }
        }
    }).directive('codeLine', function () {
        return {
            restrict:   'E',
            transclude: true,
            scope:      {
                lineNumber:  '=',
                lineContent: '='
            },
            template:   '<span class="line-number">{{ lineNumber }}</span><span>{{ lineContent }}</span>'
        }
    }).directive('codeLineIndicator', function () {
        return {
            restrict: 'E'
        }
    });
