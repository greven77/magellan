'use strict';

angular.module('magellanApp', [
    'ngRoute',
    'ngCookies',
     'magellanApp.controllers',
     'magellanApp.services',
     'magellanApp.directives',
     'magellanApp.resources',
     'magellanApp.interceptors'])
.config(['$routeProvider','$locationProvider',function($routeProvider, $locationProvider){
    $routeProvider
        .when('/user/:user_id',{
            controller: 'ProfileController',
            templateUrl: '/templates/profile.html',
            resolve: {
                user: ['$q','$route', '$location', 'AuthService',
                function($q, $route, $location, AuthService){
                    var d = $q.defer();

                    AuthService.currentUser().then(function(user){
                        if(user && user.id == $route.current.params.user_id){
                            d.resolve();
                        } else if (!user){
                            $location.path('/login');
                        } else {
                            $location.path('/');
                        }
                    });
                    return d.promise;
                }]
            }
        })
        .when('/login', {
            controller: 'LoginController',
            templateUrl: '/templates/login.html'
        })
        .when('/',
        {
            controller: "TravelsController",
            templateUrl: '/templates/travels.html',
            resolve: {
                user: ['$q', '$route', '$location', 'AuthService',
                function($q, $route, $location, AuthService){
                    var d = $q.defer();

                    AuthService.currentUser().then(function(user){
                        if(user && user.id){
                            d.resolve();
                            $location.path('/user/' + user.id);
                        } else {
                            $location.path('/login');
                        }
                    });
                    return d.promise;
                }]
            }
        })
        .otherwise({redirectTo: '/'});
        $locationProvider.html5Mode(true);
}])
.config(['$httpProvider',function($httpProvider){
    $httpProvider.interceptors.push('UserAuthInterceptor');
}]);