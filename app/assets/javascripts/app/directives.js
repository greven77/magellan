'use strict';

angular.module('magellanApp.directives', [])
.directive('userPanel', function(){
    return {
        templateUrl: '/templates/user_panel.html',
        controller: ["$scope", "$location", "UserService", function($scope, $location,
            UserService){
            $scope.$on("user:set", function(evt, currentUser){
                $scope.currentUser = currentUser;
            });

            UserService.currentUser()
                .then(function(currentUser){
                    $scope.currentUser = currentUser;
                });

            $scope.logout = function() {
                UserService.logout()
                    .then(function(){
                        $scope.currentUser = null;
                        UserService.logout();
                        $location.path('/');
                });
            };
        }]
    };
})
.directive('autoFill', ['$timeout', function($timeout){
    return {
        templateUrl: '/templates/autocomplete.html',
        controller: ["$scope", "Trip", function($scope, Trip){
            var minKeyCount = 2;
            var timer;
            //$scope.currentIndex = 0;
            $scope.reslist = null;
            $scope.blur = true;
            $scope.fetchCities = Trip.findCity;

            $scope.setCity = function(city){
                $scope.trip.city = city;
                $scope.reslist = null;
            }

            $scope.enableBlur = function(){
                $scope.blur = true;
                $scope.currentIndex = null;
            }

            $scope.disableBlur = function(id){
                $scope.blur = false;
                $scope.currentIndex = id;
            }

            $scope.keyPressed = function(event){
                var val = $scope.trip.city;
                if(val.length < minKeyCount){
                    if (timer) $timeout.cancel(timer);
                    $scope.reslist = null;
                    return;
                } else {
                    if (timer) $timeout.cancel(timer);
                    timer = $timeout(function(){
                        if(event.keyCode == 38 && $scope.reslist){
                            if($scope.reslist && $scope.currentIndex >= 1) {
                                $scope.currentIndex--;
                                $scope.trip.city = $scope.reslist[$scope.currentIndex].city;
                                event.preventDefault();
                                event.stopPropagation();
                            }
                        } 
                        if(event.keyCode == 40 && $scope.reslist){
                            if($scope.currentIndex === undefined){
                                $scope.currentIndex = 0;
                                $scope.trip.city = $scope.reslist[$scope.currentIndex].city;
                                event.preventDefault();
                                event.stopPropagation();
                            } else

                            if ($scope.reslist && $scope.currentIndex >= 0 
                                && $scope.currentIndex < $scope.reslist.length){
                                $scope.currentIndex++;
                                $scope.trip.city = $scope.reslist[$scope.currentIndex].city;
                                event.preventDefault();
                                event.stopPropagation();
                            }
                        } else {
                            $scope.fetchCities($scope.trip.city).then(function(data){
                                if (data && data.length > 0){
                                    $scope.reslist = data;
                                    //$scope.trip.city = data[0].city;
                                }
                            });
                        }
                    }, 200);
                }
            };

            $scope.blurred = function(event){
                if(!$scope.blur) return;
                $scope.reslist = null;
                $scope.currentIndex = null;
            };
        }]
    }
}]).directive('map', function(){
    return {
        template: "<div id='map'></div>",
        controller: ["$scope", function($scope){
            var width = 960,
            height = 400;
            var projection = d3.geo.mercator()
                .center([0, 5 ])
                .scale(100)
                .rotate([0,0]);
            var svg = d3.select("div#map").append("svg")
                .attr("width", width)
                .attr("height", height);
            var path = d3.geo.path()
                .projection(projection);

            var g = svg.append("g");

            d3.json("/world-110m2.json", function(error, topology) {
            g.selectAll("path")
                .data(topojson.object(topology, topology.objects.countries)
                .geometries)
                .enter()
                .append("path")
                .attr("d", path)

                drawCircles();
                $scope.$watchCollection('userTrips', drawCircles, true);
            });

            var drawCircles = function(){
                if(!$scope.userTrips) return;
                g.selectAll("circle").remove();
                g.selectAll("circle")
                .data($scope.userTrips)
                    .enter()
                    .append("circle")
                    .attr("cx", function(d) {
                        return projection([d.longitude, d.latitude])[0];
                        })
                    .attr("cy", function(d) {
                        return projection([d.longitude, d.latitude])[1];
                        })
                    .attr("r", 5)
                    .style("fill", "red");
            }
        }]
    }
});