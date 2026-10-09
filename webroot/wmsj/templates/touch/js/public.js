$(function(){
	var style = '<style>'
				+'.tymodal{position: fixed; top: 50%; left:0.6rem; right: 0.6rem; -moz-transform: translate(0,-50%); -webkit-transform: translate(0,-50%); transform: translate(0,-50%); z-index: 1008; padding: 0.2rem; background-color: #fff; border-radius: 0.08rem; text-align: center; font-size:0.32rem;}'
				+'.tymodal .title {padding-bottom: .2rem;margin-bottom: .2rem;border-bottom: 1px solid #ccc;font-size: .34rem;}'
				+'.tymodal .close {position: absolute;right:.2rem;top:.2rem;display: block;width: 0.46rem; height: 0.46rem;}'
				+'.disktemp {background-color: #000; opacity: .7!important; top: 0; left: 0; bottom: 0; width: 100%; z-index: 1001; position: fixed;}'
				+'</style>';
	$('head').append(style);
})

var modal = '<div class="tymodal"><a href="javascript:;" class="close">×</a> <div class="title">$title</div> <div class="text">$content</div> </div> <div class="disktemp"></div>';

var msg = {
	show: function(title, content, auto, time){
		$('.tymodal, .disktemp').remove();
		var fun = this;
		var title = title ? title : langData['siteConfig'][22][72];
		var content = content ? content : '';
		var time = time ? time : 1000;

		var modalhtml = modal.replace('$title', title).replace('$content', content);

		$('body').append(modalhtml);

		if(auto == 'auto'){
			setTimeout(function(){
				fun.close();
			}, time)
		}

		$("body").delegate(".tymodal .close", "click", function(){
			fun.close();
		})

	},
	close: function(){
		$('.tymodal, .disktemp').remove();
	}
}



function in_array(needle, haystack) {
  if(typeof needle == 'string' || typeof needle == 'number') {
      for(var i in haystack) {
          if(haystack[i] == needle) {
                  return true;
          }
      }
  }
  return false;
}
