var noticeTipID = null;

var huoniao = {

	/**

	 * 提示信息

	 * param string type 类型： loading warning success error

	 * param string message 提示内容

	 * param string hide 是否自动隐藏 auto

	 */

	showTip: function(type, message, hide){

		var obj = $(".w-tip");



		if(obj.html() != undefined){

			obj.remove();

		}

		$("body").append('<div class="w-tip"><span class="msg '+type+'">'+message+'</span></div>');



		if(hide == "auto"){

			setTimeout(function(){

				$(".w-tip").stop().fadeOut("fast", function(){

					$(".w-tip").remove();

				});

			}, 3000);

		}

	}



	//删除提示信息

	,hideTip: function(){

		var obj = $(".w-tip");

		setTimeout(function(){

			obj.fadeOut("fast", function(){

				obj.remove();

			});

		}, 500);

	}



	//父级窗口提示

	,parentTip: function(type, message){

		if(parent.$(".w-notice").html() != undefined){

			parent.$(".w-notice").remove();

		}

		parent.$("body").append('<div class="w-notice"><span class="msg '+type+'"><s></s>'+message+'</span></div>');



		huoniao.parentHideTip();

	}



	//删除父级窗口提示

	,parentHideTip: function(){

		noticeTipID != null ? clearTimeout(noticeTipID) : "";



		noticeTipID = setTimeout(function(){

			parent.$(".w-notice").stop().animate({top: "-50px", opacity: 0}, 300, function(){

				parent.$(".w-notice").remove();

			});

		}, 3000);

	}



	//异步操作

	,operaJson: function(url, action, callback){

		$.ajax({

			url: url,

			data: action,

			type: "POST",

			dataType: "json",

			success: function (data) {

				typeof callback == "function" && callback(data);

			},

			error: function(){



				$.post("../login.php", "action=checkLogin", function(data){

					if(data == "0"){

						huoniao.showTip("error", langData['siteConfig'][20][262]);

						setTimeout(function(){

							location.reload();

						}, 500);

					}else{

						huoniao.showTip("error", langData['siteConfig'][20][183]);

					}

				});



			}

		});

	}



	//表单验证

	,regex: function(obj){

		var regex = obj.attr("data-regex"), tip = obj.siblings(".input-tips");

		if(regex != undefined && tip.html() != undefined){

			var exp = new RegExp("^" + regex + "$", "img");

			if(!exp.test($.trim(obj.val()))){

				tip.removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");

				return false;

			}else{

				tip.removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");

				return true;

			}

		}

	}



	//返回头部

	,goTop: function(){

		window.scroll(0, 0);

	}



	//定位input

	,goInput: function(obj){

		$(document).scrollTop(Number(obj.offset().top)-8);

	},



	//转换PHP时间戳
	transTimes: function(timestamp, n){

        const dateFormatter = this.dateFormatter(timestamp);
        const year = dateFormatter.year;
        const month = dateFormatter.month;
        const day = dateFormatter.day;
        const hour = dateFormatter.hour;
        const minute = dateFormatter.minute;
        const second = dateFormatter.second;

		if(n == 1){
			return (year+'-'+month+'-'+day+' '+hour+':'+minute+':'+second);
		}else if(n == 2){
			return (year+'-'+month+'-'+day);
		}else if(n == 3){
			return (month+'-'+day);
        }else if(n == 4){
            return dateFormatter;
		}else{
			return 0;
		}
	},

    //判断是否为合法时间戳
    isValidTimestamp: function(timestamp) {
        return timestamp = timestamp * 1, Number.isFinite(timestamp) && timestamp > 0;
    },

    //创建 Intl.DateTimeFormat 对象并设置格式选项
    dateFormatter: function(timestamp){
        
        if(!this.isValidTimestamp(timestamp)) return {year: '-', month: '-', day: '-', hour: '-', minute: '-', second: '-'};

        const date = new Date(timestamp * 1000);  //创建一个新的Date对象，使用时间戳
        
        // 使用Intl.DateTimeFormat来格式化日期
        const dateTimeFormat = new Intl.DateTimeFormat('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: typeof cfg_timezone == 'undefined' ? 'PRC' : cfg_timezone,  //指定时区，cfg_timezone变量已在页面中通过程序自动声明
        });
        
        // 获取格式化后的时间字符串
        const formatted = dateTimeFormat.format(date);
        
        // 将格式化后的字符串分割为数组
        const [year, month, day, hour, minute, second] = formatted.match(/\d+/g);

        // 返回一个对象，包含年月日时分秒
        return {year, month, day, hour, minute, second};
    }



	//合并相同内容的单元格

	,rowspan: function(t, colIdx) {

	    return t.each(function() {

	        var that;

	        $('tr', this).each(function(row) {

	            $('td:eq(' + colIdx + ')', this).filter(':visible').each(function(col) {

	                if (that != null && $(this).html() == $(that).html()) {

	                    rowspan = $(that).attr("rowSpan");

	                    if (rowspan == undefined) {

	                        $(that).attr("rowSpan", 1);

	                        rowspan = $(that).attr("rowSpan");

	                    }

	                    rowspan = Number(rowspan) + 1;

	                    $(that).attr("rowSpan", rowspan);

	                    $(this).hide();

	                } else {

	                    that = this;

	                }

	            });

	        });

	    });

	}



	//打印分页信息

	,showPageInfo: function(lt, po) {

		var list = lt != undefined ? lt : "list";

		var pageInfo = po != undefined ? po : "pageInfo";



		var obj = $("#"+list), info = $("#"+pageInfo);

		var nowPageNum = Number(obj.attr("data-atpage"));

		var allPageNum = Number(obj.attr("data-totalpage"));



		info.hide();



		//拼接所有分页

		$("#paginationBtn button").html(nowPageNum + '/'+ allPageNum +langData['siteConfig'][13][54]+'<span class="caret"></span>');

		var pageList = [];

		for(var i = 0; i < allPageNum; i++){

			pageList.push('<li><a href="javascript:;" data-id="'+(i+1)+'">'+langData['waimai'][6][135].replace('1', (i+1))+'</a></li>');

		}

		$("#paginationBtn ul").html(pageList.join(""));



		if (allPageNum > 1) {



			$("#paginationBtn").attr("style", "display:inline-block;");



			info.html("").hide();



			var ul = document.createElement("ul");

			info.append(ul);



			//上一页

			if (nowPageNum > 1) {

				var prev = document.createElement("li");

				prev.innerHTML = '<a href="javascript:;">« '+langData['waimai'][6][33]+'</a>';

				prev.onclick = function () {

					obj.attr("data-atpage", nowPageNum - 1);

					getList();

				}

				$("#prevBtn").removeClass("disabled").show();

			} else {

				var prev = document.createElement("li");

				prev.className = "disabled";

				prev.innerHTML = '<a href="javascript:;">« '+langData['waimai'][6][33]+'</a>';

				$("#prevBtn").addClass("disabled").show();



			}

			info.find("ul").append(prev);



			//分页列表

			if (allPageNum - 2 < 1) {

				for (var i = 1; i <= allPageNum; i++) {

					if (nowPageNum == i) {

						var page = document.createElement("li");

						page.className = "active";

						page.innerHTML = '<a href="javascript:;">'+i+'</a>';

					}

					else {

						var page = document.createElement("li");

						page.innerHTML = '<a href="javascript:;">'+i+'</a>';

						page.onclick = function () {

							obj.attr("data-atpage", $(this).text());

							getList();

						}

					}

					info.find("ul").append(page);

				}

			} else {

				for (var i = 1; i <= 2; i++) {

					if (nowPageNum == i) {

						var page = document.createElement("li");

						page.className = "active";

						page.innerHTML = '<a href="javascript:;">'+i+'</a>';

					}

					else {

						var page = document.createElement("li");

						page.innerHTML = '<a href="javascript:;">'+i+'</a>';

						page.onclick = function () {

							obj.attr("data-atpage", $(this).text());

							getList();

						}

					}

					info.find("ul").append(page);

				}

				var addNum = nowPageNum - 4;

				if (addNum > 0) {

					var em = document.createElement("li");

					em.innerHTML = "<em>...</em>";

					info.find("ul").append(em);

				}

				for (var i = nowPageNum - 1; i <= nowPageNum + 1; i++) {

					if (i > allPageNum) {

						break;

					}

					else {

						if (i <= 2) {

							continue;

						}

						else {

							if (nowPageNum == i) {

								var page = document.createElement("li");

								page.className = "active";

								page.innerHTML = '<a href="javascript:;">'+i+'</a>';

							}

							else {

								var page = document.createElement("li");

								page.innerHTML = '<a href="javascript:;">'+i+'</a>';

								page.onclick = function () {

									obj.attr("data-atpage", $(this).text());

									getList();

								}

							}

							info.find("ul").append(page);

						}

					}

				}

				var addNum = nowPageNum + 2;

				if (addNum < allPageNum - 1) {

					var em = document.createElement("li");

					em.innerHTML = "<em>...</em>";

					info.find("ul").append(em);

				}

				for (var i = allPageNum - 1; i <= allPageNum; i++) {

					if (i <= nowPageNum + 1) {

						continue;

					}

					else {

						var page = document.createElement("li");

						page.innerHTML = '<a href="javascript:;">'+i+'</a>';

						page.onclick = function () {

							obj.attr("data-atpage", $(this).text());

							getList();

						}

						info.find("ul").append(page);

					}

				}

			}



			//下一页

			if (nowPageNum < allPageNum) {

				var next = document.createElement("li");

				next.innerHTML = '<a href="javascript:;">'+langData['waimai'][6][34]+' »</a>';

				next.onclick = function () {

					obj.attr("data-atpage", nowPageNum + 1);

					getList();

				}

				$("#nextBtn").removeClass("disabled").show();

			} else {

				var next = document.createElement("li");

				next.className = "disabled";

				next.innerHTML = '<a href="javascript:;">'+langData['waimai'][6][34]+' »</a>';

				$("#nextBtn").addClass("disabled").show();

			}

			info.find("ul").append(next);



			//输入跳转

			var insertNum = Number(nowPageNum + 1);

			if (insertNum >= Number(allPageNum)) {

				insertNum = Number(allPageNum);

			}



			var redirect = document.createElement("div");

			redirect.className = "input-prepend input-append";

			redirect.innerHTML = '<span class="add-on">'+langData['waimai'][6][170]+'</span><input class="span1" id="prependedInput" type="text" placeholder="'+langData['siteConfig'][26][174]+'"><button class="btn" type="button" id="pageSubmit">GO</button>';

			info.append(redirect);



			info.show();



			//分页跳转

			info.find("#pageSubmit").bind("click", function(){

				var pageNum = $("#prependedInput").val();

				if (pageNum != "" && pageNum >= 1 && pageNum <= Number(allPageNum)) {

					obj.attr("data-atpage", pageNum);

					getList();

				} else {

					//alert("请输入正确的数值！");

					$("#prependedInput").focus();

				}

			});

		}else{

			$("#prevBtn").removeClass("disabled").addClass("disabled").hide();

			$("#nextBtn").removeClass("disabled").addClass("disabled").hide();

			$("#paginationBtn").hide();

		}

	}



	//上一页、下一页

	,pageInfo: function(type){

		var obj = $("#list"), atPage = Number(obj.attr("data-atpage"));

		if(type == "prev"){

			obj.attr("data-atpage", atPage - 1);

		}else if(type == "next"){

			obj.attr("data-atpage", atPage + 1);

		}

		getList();

	}



	//分类拖动后提示

	,stopDrag: function(){

		if($(".stopdrag").size() <= 0){

			$("body").append('<div class="stopdrag">'+langData['waimai'][6][174]+'<a href="javascript:;" onclick="saveOpera(\'\');">'+langData['siteConfig'][6][27]+'</a></div>');

		}

	}



	//获取URL参数

	,GetQueryString : function(name){

		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)","i");

		var r = window.location.search.substr(1).match(reg);

		if (r!=null) return (r[2]); return null;

	}



	//修改URL参数

	,changeURLPar: function(destiny, par, par_value){

		var pattern = par+'=([^&]*)';

		var replaceText = par+'='+par_value;

		if (destiny.match(pattern)){

			var tmp = '/'+par+'=[^&]*/';

			tmp = destiny.replace(eval(tmp), replaceText);

			return (tmp);

		}else{

			if (destiny.match('[\?]')){

				return destiny+'&'+ replaceText;

			}else{

				return destiny+'?'+replaceText;

			}

		}

		return destiny+'\n'+par+'\n'+par_value;

	}



	//判断url地址是否包含scrolltop

	,scrollTop: function(){

		var scrolltop = huoniao.GetQueryString("scrolltop");

		if(scrolltop != null && scrolltop != 0){

			$(document).scrollTop(scrolltop);

		}

	}



	//重置用户输入的日期为“yyyy-mm-dd hh:mm:ss”格式

	,resetDate: function(t){

		var val   = t.val(),

				now   = new Date(),

				year  = now.getFullYear(),

				month = now.getMonth() + 1,

				day   = now.getDate(),

				hh    = now.getHours(),

				mm    = now.getMinutes(),

				ss    = now.getSeconds();



		month = month <= 9 ? "0" + month : month;

		day   = day <= 9 ? "0" + day : day;

		mm    = mm <= 9 ? "0" + mm : mm;

		ss    = ss <= 9 ? "0" + ss : ss;



		val = val.replace("年", "-");

		val = val.replace("月", "-");

		val = val.replace("日 ", "日");

		val = val.replace("日", " ");

		val = val.replace("时", ":");

		val = val.replace("分", ":");

		val = val.replace("秒", "");



		var nDate = [];

		var ds = val.split(" ");



		if(ds[1] != undefined){

			var ymd = ds[0].split("-");

			nDate[0] = isNaN(ymd[0]) ? year  : ymd[0];

			nDate[1] = isNaN(ymd[1]) ? month : ymd[1];

			nDate[2] = isNaN(ymd[2]) ? day   : ymd[2];

		}else{

			nDate[0] = year;

			nDate[1] = month;

			nDate[2] = day;

		}



		if(ds[1] != undefined){

			var hms = ds[1].split(":");

			nDate[3] = isNaN(hms[0]) ? hh : hms[0];

			nDate[4] = isNaN(hms[1]) ? mm : hms[1];

			nDate[5] = hms[2] == undefined || hms[2] == "" ? "00" : (isNaN(hms[2]) ? ss : hms[2]);

		}else{

			nDate[3] = hh;

			nDate[4] = mm;

			nDate[5] = ss;

		}



		t.val(nDate[0] + "-" + nDate[1] + "-" + nDate[2] + " " + nDate[3] + ":" + nDate[4] + ":" + nDate[5]);

	}





}



$(function(){



	//上一页

	$("#prevBtn").bind("click", function(){

		if(!$(this).hasClass("disabled")){

			huoniao.pageInfo("prev");

		}

	});



	//下一页

	$("#nextBtn").bind("click", function(){

		if(!$(this).hasClass("disabled")){

			huoniao.pageInfo("next");

		}

	});



});



Date.ParseString = function (e) {

    var b = /(\d{4})-(\d{1,2})-(\d{1,2})(?:\s+(\d{1,2}):(\d{1,2}):(\d{1,2}))?/i,

    a = b.exec(e),

    c = 0,

    d = null;

    if (a && a.length) {

        if (a.length > 5 && a[6]) {

            c = Date.parse(e.replace(b, "$2/$3/$1 $4:$5:$6"));

        } else {

            c = Date.parse(e.replace(b, "$2/$3/$1"));

        }

    } else {

        c = Date.parse(e);

    }

    if (!isNaN(c)) {

        d = new Date(c);

    }

    return d;

};



Array.prototype.in_array = function(e){

	for(i=0;i<this.length && this[i]!=e;i++);

	return !(i==this.length);

}



//监听F5，只刷新当前页面

function _attachEvent(obj, evt, func, eventobj) {

	eventobj = !eventobj ? obj : eventobj;

	if(obj.addEventListener) {

		obj.addEventListener(evt, func, false);

	} else if(eventobj.attachEvent) {

		obj.attachEvent('on' + evt, func);

	}

}



var ISFRAME = 1;

if(ISFRAME) {

	try {

		_attachEvent(document.documentElement, 'keydown', parent.resetEscAndF5);

	} catch(e) {}

}


//输出货币标识
function echoCurrency(type){
	var pre = (typeof cookiePre != "undefined" && cookiePre != "") ? cookiePre : "HN_";
	var currencyArr = $.cookie(pre+"currency");
	if(currencyArr){
		var currency = JSON.parse(decodeURIComponent(atob(currencyArr)));
		if(type){
			return currency[type]
		}else{
			return currencyArr['short'];
		}
	}
}
