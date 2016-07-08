/**
 *  A directive which helps you easily show a a-map on your page.
 *
 *
 *  Usages:
 *
 *      <a-map options="options"></a-map>
 *
 *      options: The configurations for the map
 *            .center.longitude[Number]{M}: The longitude of the center point
 *            .center.latitude[Number]{M}: The latitude of the center point
 *            .zoom[Number]{O}:         Map's zoom level. This must be a number between 3 and 19
 *            .navCtrl[Boolean]{O}:     Whether to add a NavigationControl to the map
 *            .scaleCtrl[Boolean]{O}:   Whether to add a ScaleControl to the map
 *            .overviewCtrl[Boolean]{O}: Whether to add a OverviewMapControl to the map
 *            .enableScrollWheelZoom[Boolean]{O}: Whether to enableScrollWheelZoom to the map
 *            .markers[Array]{O}:       An array of marker which will be added on the map
 *                   .longitude[Number]{M}:        The longitude of the marker
 *                   .latitude[Number]{M}:         The latitude of the marker
 *                   .width[Number]{O}:            The width of the the infowindow which displayed while clicking the markder
 *                   .height[Number]{O}:           The height of the the infowindow which displayed while clicking the markder
 *                   .icon[String]{O}:             The icon's url for the marker
 *                   .title[String]{O}:            The title on the infowindow displayed once you click the marker
 *                   .content[String]{O}:          The content on the infowindow displayed once you click the marker
 *
 *
 *
 *  @author      Howard.Zuo
 *  @copyright   July 7, 2016
 *  @version     2.0.2
 *
 */
(function (global, factory) {
    'use strict';

    if (typeof exports === 'object') {
        module.exports = factory(require('angular'));
    } else if (typeof define === 'function' && define.amd) {
        define(['angular'], factory);
    } else {
        factory(global.angular);
    }

}(window, function (angular) {
    'use strict';

    var defaults = {
        navCtrl: true,
        scaleCtrl: true,
        overviewCtrl: true,
        enableScrollWheelZoom: true,
        zoom: 10
    };

    var checkNull = function (obj) {
        return obj === null || obj === undefined;
    };

    var checkMandatory = function (prop, desc) {
        if (!prop) {
            throw new Error(desc);
        }
    };

    /**
     * Construction function
     *
     * @constructor
     */
    var aMapDir = function () {

        // Return configured, directive instance

        return {
            restrict: 'E',
            scope: {
                'options': '='
            },
            link: function ($scope, element, attrs) {

                var ops = {};
                ops.navCtrl = checkNull($scope.options.navCtrl) ? defaults.navCtrl : $scope.options.navCtrl;
                ops.scaleCtrl = checkNull($scope.options.scaleCtrl) ? defaults.scaleCtrl : $scope.options.scaleCtrl;
                ops.overviewCtrl = checkNull($scope.options.overviewCtrl) ? defaults.overviewCtrl : $scope.options.overviewCtrl;
                ops.enableScrollWheelZoom = checkNull($scope.options.enableScrollWheelZoom) ? defaults.enableScrollWheelZoom : $scope.options.enableScrollWheelZoom;
                ops.zoom = checkNull($scope.options.zoom) ? defaults.zoom : $scope.options.zoom;

                checkMandatory($scope.options.center, 'options.center must be set');
                checkMandatory($scope.options.center.longitude, 'options.center.longitude must be set');
                checkMandatory($scope.options.center.latitude, 'options.center.latitude must be set');

                ops.center = {
                    longitude: $scope.options.center.longitude,
                    latitude: $scope.options.center.latitude
                };
                ops.city = $scope.options.city;
                ops.markers = $scope.options.markers;

                // create map instance
                var mapOps = {scrollWheel: ops.enableScrollWheelZoom};

                var map = new AMap.Map(element.find('div')[0], mapOps);

                // init map, set central location and zoom level
                map.setZoom(ops.zoom);
                map.setCenter([
                    ops.center.longitude,
                    ops.center.latitude
                ]);

                if (ops.navCtrl) {
                    // add navigation control
                    map.plugin(['AMap.ToolBar'], function () {
                        var toolBar = new AMap.ToolBar();
                        map.addControl(toolBar);
                    });
                }
                if (ops.scaleCtrl) {
                    // add scale control
                    map.plugin(['AMap.Scale'], function () {
                        var scale = new AMap.Scale();
                        map.addControl(scale);
                    });
                }
                if (ops.overviewCtrl) {
                    //add overview map control
                    map.plugin(['AMap.OverView'], function () {
                        var overView = new AMap.OverView({
                            visible: false
                        });
                        map.addControl(overView);
                    });
                }

                if (!ops.markers) {
                    return;
                }

                var mark = function () {
                    var markerInfoWindow;

                    /**
                     * callback function when a marker is clicked
                     * @param event
                     */
                    function markerClick(event) {
                        markerInfoWindow.setContent(event.target.content);
                        markerInfoWindow.open(map, event.target.getPosition());
                    }
                    //Define the infoWindow once
                    markerInfoWindow = new AMap.InfoWindow({offset: new AMap.Pixel(0, -30)});

                    for (var i in ops.markers) {
                        var markerData = ops.markers[i];
                        var pt = new AMap.LngLat(markerData.longitude, markerData.latitude);
                        var mapMarker = new AMap.Marker({
                            icon: markerData.icon,
                            position: pt
                        });
                        // add marker to the map
                        mapMarker.setMap(map);

                        if (!markerData.content) {
                            continue;
                        }
                        mapMarker.content = markerData.content ? markerData.content : '';
                        mapMarker.on('click', markerClick);
                    }
                    //Fitting all markers to fit the view
                    map.setFitView();
                };

                mark();

                $scope.$watch('options.center', function (newValue, oldValue) {
                    ops = $scope.options;
                    map.setCenter([
                        ops.center.longitude,
                        ops.center.latitude
                    ]);
                    mark();
                }, true);

                $scope.$watch('options.markers', function (newValue, oldValue) {
                    ops.markers = $scope.options.markers;
                    mark();
                }, true);

                $scope.$on('$destroy', function () {
                    if (map && map.destroy) {
                        map.destroy();
                    }
                });
            },
            template: '<div style="width: 100%; height: 100%;"></div>'
        };
    };

    var aMap = angular.module('angular-amap', []);
    aMap.directive('ngAmap', [aMapDir]);
    return 'angular-amap';
}));
