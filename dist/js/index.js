(function(){
    var vm = window.vm = {};
    vm.calendar = Calendar({locale:'ru'});

    document.addEventListener("DOMContentLoaded", function(event) {
		ko.applyBindings(vm);
	});
})();
