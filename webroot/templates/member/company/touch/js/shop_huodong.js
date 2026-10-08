$(function () {

	// 获取url参数

	function getParam(paramName) {
	    paramValue = "", isFound = !1;
	    if (this.location.search.indexOf("?") == 0 && this.location.search.indexOf("=") > 1) {
	        arrSource = unescape(this.location.search).substring(1, this.location.search.length).split("&"), i = 0;
	        while (i < arrSource.length && !isFound) arrSource[i].indexOf("=") > 0 && arrSource[i].split("=")[0].toLowerCase() == paramName.toLowerCase() && (paramValue = arrSource[i].split("=")[1], isFound = !0), i++
	    }
	    return paramValue == "" && (paramValue = null), paramValue
	}

	var proid = ''
	if(getParam('id')){
		proid = getParam('id');
	}

	if(proid){
		getProDetail(proid)
		$(".container .con a").click(function(){
			var t = $(this), con = t.closest('.con');
			var hdtype = con.attr('data-type');
			var sArr = {'id': proid, 'type': hdtype};
			utils.setStorage('chosegoods', JSON.stringify(sArr));
		})

	}


	function getProDetail(id){
		$.ajax({
            url: '/include/ajax.php?service=shop&action=detail&id=' + id,
            type: "POST",
            dataType: "json",
            success: function (data) {
                if(data.state == 100){
                	if(data.info.specificationArr && data.info.specificationArr.length > 0 ){
                		$('.bargain').hide()
                	}
                }
            },
            error: function () { }
        });
	}
	
})