$(function () {
 
    $('.container').delegate('.itemTop','click',function(){
	    var par = $(this).closest('.item');
	    var sib = par.siblings('.item').find(".itemDown");
	    var downItem = par.find(".itemDown");
	    var ulH = downItem.find('ul').height(),
	     	pH = downItem.find('p').height();
	    sib.animate({'height':'0'},200);
	    if(par.hasClass('click')){
	    	par.removeClass('click');
	    	downItem.animate({'height':'0'},200);
	    }else{
	    	par.siblings('.item').removeClass('click');
	    	par.addClass('click');
	    	downItem.animate({'height':ulH+pH+'px'},200);
	    }
	    

	})
	if(getParam('menuid')){
		var meid = getParam('menuid');
		$('.container .item[data-id="'+meid+'"]').find('.itemTop').click();
	}



});
// 获取参数
function getParam(paramName) {
	paramValue = "", isFound = !1;
	if (this.location.search.indexOf("?") == 0 && this.location.search.indexOf("=") > 1) {
		arrSource = unescape(this.location.search).substring(1, this.location.search.length).split("&"), i = 0;
		while (i < arrSource.length && !isFound) arrSource[i].indexOf("=") > 0 && arrSource[i].split("=")[0].toLowerCase() == paramName.toLowerCase() && (paramValue = arrSource[i].split("=")[1], isFound = !0), i++
	}
	return paramValue == "" && (paramValue = null), paramValue
}