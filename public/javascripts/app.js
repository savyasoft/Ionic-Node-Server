// client side angular router paths 

angular.module('myApp', ["myApp.controllers"])
    .config(function($routeProvider) {

        $routeProvider.
        // default route
        when('/', {
            templateUrl: 'views/index.html'
        }).
        // route for login page 
        when('/login', {
            templateUrl: 'views/login.html'
        }).
        // route for signup page
        when('/signup', {
            templateUrl: 'views/signup.html'
        }).
        otherwise({
            redirectTo: '/'
        });
        //$locationProvider.html5Mode(true);
    });
