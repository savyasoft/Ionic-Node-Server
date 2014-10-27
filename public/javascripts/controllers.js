// angular controllers for client side html pages 

angular.module('myApp.controllers', []).
// index page controller
controller("IndexCtrl", function($scope, $http) {
    $scope.test = function() {
        $http.get("/loggedin").success(function(data) {
            alert(JSON.stringify(data));
        }).error(function(r) {
            alert(r);
        });
    }
}).
// login page controller
controller("LoginCtrl", function($scope, $http, $location) {
    $scope.user = {
        email: "vamsi@gmail.com",
        password: "vamsikrishna9"
    };
    $scope.login = function() {
        var user = $scope.user;
        if (user.email && user.password) {
            $http.post("/login", user).success(function(data) {
                alert(data);
                $location.url("/");
            }).error(function(r) {
                alert("error" + r);
            })

        } else {
            alert("error");
        }

    }
}).
// sign up page controller
controller("SignupCtrl", function() {

});
