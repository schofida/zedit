ngapp.directive('autocompleteInput', function() {
    return {
        restrict: 'E',
        transclude: true,
        templateUrl: 'directives/autocompleteInput.html',
        scope: {
            selectedItem: '=',
            search: '=',
            getText: '=?',
            setCustom: '=?',
            minLength: '@',
            pause: '@'
        },
        controller: 'autocompleteInputController'
    }
});

ngapp.controller('autocompleteInputController', function($scope, $timeout, hotkeyService) {
    Object.defaults($scope, {
        minLength: 2,
        pause: 250,
        getText: (item) => { return item }
    });

    // helper functions
    let hideDropdown = function() {
        $scope.results = [];
        $scope.showDropdown = false;
    };

    let startSearch = function() {
        $scope.showDropdown = true;
        $scope.currentIndex = -1;
        $scope.results = [];
        $scope.searching = true;
    };

    let getSearchResults = function() {
        startSearch();
        if ($scope.searchTimer) clearTimeout($scope.searchTimer);
        $scope.searchTimer = setTimeout(function() {
            $scope.$applyAsync(function() {
                $scope.results = $scope.search($scope.text);
                $scope.searching = false;
            });
        }, $scope.pause);
    };

    // inherited functions
    hotkeyService.buildOnKeyDown($scope, 'onInputKeyDown', 'dropdownItems');

    // scope functions
    $scope.handleEscape = () => hideDropdown();
    $scope.handleEnter = () => $scope.onItemClick($scope.results[$scope.currentIndex]);

    $scope.handleUpArrow = function() {
        $scope.currentIndex--;
        if ($scope.currentIndex < 0) $scope.currentIndex = $scope.results.length - 1;
    };

    $scope.handleDownArrow = function() {
        $scope.currentIndex++;
        if ($scope.currentIndex >= $scope.results.length) $scope.currentIndex = 0;
    };

    $scope.setExact = function() {
        let item = $scope.results.find(function(item) {
            return $scope.getText(item) === $scope.text;
        });
        if (item) {
            $scope.selectedItem = item;
        } else {
            $scope.text = $scope.getText($scope.selectedItem);
        }
    };

    // event handlers
    $scope.onTextChanged = function() {
        $scope.text.length < $scope.minLength ?  hideDropdown() : getSearchResults();
    };

    $scope.onInputBlur = function() {
        $timeout(function() {
            $scope.setCustom ? $scope.setCustom($scope.text) : $scope.setExact();
            hideDropdown();
        }, 250);
    };

    $scope.onItemClick = function(item) {
        if (item) $scope.selectedItem = item;
        hideDropdown();
    };

    $scope.onItemMouseOver = (index) => $scope.currentIndex = index;
    $scope.$watch('selectedItem', () => $scope.text = $scope.getText($scope.selectedItem));
});
