angular.module('myApp.controllers', [  ]).
  controller("IndexCtrl",function ( $scope , $http ) {
       $scope.test = function(){
            $http.get("/loggedin").success(function (data) {
               alert(JSON.stringify(data));
            }).error(function (r) {
               alert(r);
            });    
       }
  }).
  controller("LoginCtrl",function ($scope , $http , $location) {
      $scope.user = { email : "vamsi@gmail.com" , password : "vamsikrishna9" };        
      $scope.login = function () {
         var user = $scope.user;
         if ( user.email && user.password){
             $http.post("/login",user).success(function (data) {
                    alert(data);          
                    $location.url("/");   
             }).error(function (r) {
                    alert( "error" + r);                  
             })             
         
         }  else {
             alert("error");         
         }  

      } 
  }).
  controller("SignupCtrl",function () {
  
  });