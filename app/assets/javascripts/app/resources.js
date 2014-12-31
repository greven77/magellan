'use strict';

angular.module('magellanApp.resources', ["rails"])
    .factory('Trip',['railsResourceFactory', '$q', '$http',
        function(railsResourceFactory, $q, $http){
            var resource =  railsResourceFactory({
                url: '/trips',
                name: 'trip'
            });

            resource.findCity = function(city){
                var d = $q.defer();

                $http({
                    method: 'GET',
                    url: "/trips/autocomplete.json?city=" + city
                }).success(function(data){
                    d.resolve(data.results);
                }).error(function(err){
                    d.reject(err);
                });

                return d.promise;
            };

            resource.findById = function(tripId){
                var d = $q.defer();
                resource.query({id: tripId})
                    .then(function(trips){
                        if(trips.length > 0){
                            d.resolve(trips[0]);
                        }
                    });
                return d.promise;
            };

            resource.removeTrip = function (tripID){
                var d = $q.defer();
                var trip = resource.query({
                    id: tripID
                });

                trip.then(function(results){
                    if(results.length > 0){
                        trip = results[0];
                        trip.delete().then(function(){
                            d.resolve(trip);
                        });
                    }
                });

                return d.promise;
            }

            resource.createTrip = function(trip){
                var d = $q.defer();
                var newTrip = new resource({
                    city: trip.city,
                    country: trip.country,
                    start: trip.start,
                    end: trip.end
                });

                newTrip.save().then(function(){
                    d.resolve(newTrip);
                });

                return d.promise;
            }

            resource.updateTrip = function(updatedTrip){
                var d = $q.defer();
                resource.get(updatedTrip.id).then(function(trip){
                    trip.city = updatedTrip.city;
                    trip.update().then(function(){
                        d.resolve(trip);
                    });
                });

                return d.promise;
            }

            return resource;
        }]).factory('User',
        ['$q', 'railsResourceFactory','Trip', 
            function($q, railsResourceFactory, Trip){
                var resource = railsResourceFactory({
                    url: '/users',
                    name: 'user'
                });

                resource.prototype.userTrips = function(){
                    var self = this;
                    return resource.$get(self.$url('trips'))
                        .then(function(trips){
                            self.userTrips = trips;
                            return self.userTrips;
                        });
                };

                return resource;
            }]);