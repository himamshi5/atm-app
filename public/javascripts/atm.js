angular.module('app', []).controller('main', ['$scope', '$http', function($scope, $http) {
    $scope.text = {};
    $scope.showDeposit = true;
    $scope.withdrawAmount = 0;
    $scope.accountId = 'test';
    $scope.repeater = new Array();
  
    console.log('loaded');
  
    $scope.addBanknote = function () {
      $scope.repeater.push({value:0, amount:0});
      console.log($scope.repeater);
    }
  
    $scope.removeBanknote = function (index) {
      $scope.repeater.splice(index, 1);
      console.log($scope.repeater);
    }
  
    $scope.executeAction = function () {
      var data = {};
      if ($scope.showDeposit) {
        data.amount = 0;
        data.targetAccount = $scope.accountId;
        data.banknotes = $scope.repeater.map(function (note) {
          data.amount += note.amount * note.value;
          return { amount: '' + note.amount, value: note.value};
        });
      } else {
        data.account = $scope.accountId;
        data.amount = $scope.withdrawAmount;
        data.denomination = $scope.denominationAmount;
      }
      $http({
        method: 'POST',
        url: '/api/' + ($scope.showDeposit ? 'deposit' : 'withdraw'),
        data: data
      })
      .then(function successCallback(response) {
        if (response.data.banknotes) {
          alert(JSON.stringify(response.data.banknotes));
        } else {
          alert(JSON.stringify(response.data));
          if(!($scope.showDeposit)) {
            let banknotes = response.data.data.banknotes;
            let array = [];
            for(let [key,value] of Object.entries(banknotes)) {
              console.log(key,value);
              array.push({'amount': key, 'value': value});
            }
            $scope.details = array;
          } 
        }
      }, function errorCallback(response) {
        alert('failed');
      });
    }
  
    $scope.getBalance = function () {
      if ($scope.accountId) {
        $http({
          method: 'GET',
          url: '/api/balance?account=' + $scope.accountId
        }).then(function successCallback(response) {
          console.log(response.data);
            alert('current balance: ' + response.data.data.amount);
          }, function errorCallback(response) {
            alert('failed');
          });
      } else {
        alert('Insert a valid Account ID');
      }
    }
  }]);
  
  angular.element(document).ready(function($scope) {
      angular.bootstrap(document, ['app']);
  });