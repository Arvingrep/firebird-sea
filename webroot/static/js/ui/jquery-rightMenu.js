(function($) {
	var D = $(document).data("func", {});	
	$.rightMenu = $.noop;
	$.fn.rightMenu = function(options) {
		var params = $.extend({}, options || {});		
		$(this).each(function() {
			this.oncontextmenu = function(e) {
				e = e || window.event;
				//阻止冒泡
				e.cancelBubble = true;
				if (e.stopPropagation) {
					e.stopPropagation();
				}
				if ($.isFunction(params.func)) {
					params.func.call(this);	
				}
				return false;
			};
		});
	};
})(jQuery);