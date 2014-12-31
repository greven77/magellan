'use strict';

angular.module('magellanApp.controllers')
.controller('ProfileController', [
    '$scope', '$routeParams', 'User', 'Trip',
    function($scope, $routeParams, User, Trip){
        $scope.trip = {};

        User.query({id: $routeParams.user_id})
            .then(function(users){
                if(users.length >0){
                    $scope.user = users[0];
                    $scope.user.userTrips()
                        .then(function(trips){
                            $scope.userTrips = trips;
                        });
                }
            });
        $scope.isEditable = false;
        $scope.isNew = false;
        $scope.formVisible = false;

        //$scope.reslist = [];
        
        //$scope.reslist = [{name: "yooooo"}];

        $scope.toggleNew = function(){
            $scope.isNew = true;
            $scope.isEditable = false;
            $scope.formVisible = true;
        }

        $scope.cancelForm = function(){
            $scope.isNew = false;
            $scope.isEditable = false;
            $scope.trip = {};
            $scope.formVisible = false;
        }

        $scope.removeTrip = function(trip){
            var index = $scope.userTrips.indexOf(trip);
            Trip.removeTrip(trip).then(function(deletedTrip){
                $scope.userTrips.splice(index, 1);
            });
        }

        $scope.editTrip = function(trip){
            $scope.trip = trip;
            $scope.isEditable = true;
            $scope.isNew = false;
            $scope.formVisible = true;
        }

        $scope.updateTrip = function(){
            Trip.updateTrip($scope.trip).then(function(updatedTrip){
                $scope.isEditable = false;
                $scope.formVisible = false;
            });
        }

        $scope.createTrip = function(){
            Trip.createTrip($scope.trip).then(function(newTrip){
                $scope.userTrips.push(newTrip);
                $scope.isNew = false;
                $scope.formVisible = false;
                $scope.trip = {};
            });
        }

        $scope.submitTrip = function(){
            if($scope.trip.id){
                $scope.updateTrip();
            } else {
                $scope.createTrip();
            }
        }
}]);