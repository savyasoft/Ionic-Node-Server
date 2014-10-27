
angular.module('myApp', [ "myApp.controllers" ])
  .config(function( $routeProvider ) {
    
    $routeProvider.
      when('/', {
        templateUrl: 'views/index.html'
      }).
      when('/login', {
        templateUrl: 'views/login.html'
      }).
      when('/signup', {
        templateUrl: 'views/signup.html'
      }).
      otherwise({
        redirectTo: '/'
      });
    //$locationProvider.html5Mode(true);
  });