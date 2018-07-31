'use strict';

angular
	.module('app').directive('repeatDone', repeatDone);

function repeatDone() {
	var directive = {
		link: link,
		restrict: 'EA'
	}
	function link(scope, element, attrs) {
		if (scope.$last) { // all are rendered
            scope.$eval(attrs.repeatDone);
        }
	}
	return directive;
}