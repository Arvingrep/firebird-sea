//jQuery Cookie
jQuery.cookie=function(name,value,options){if(typeof value!='undefined'){options=options||{};if(value===null){value='';options.expires=-1}var expires='';if(options.expires&&(typeof options.expires=='number'||options.expires.toUTCString)){var date;if(typeof options.expires=='number'){date=new Date();date.setTime(date.getTime()+(options.expires*24*60*60*1000))}else{date=options.expires}expires='; expires='+date.toUTCString()}var path=options.path?'; path='+options.path:'';var domain=options.domain?'; domain='+options.domain:'';var secure=location.protocol=='https:'?'; SameSite=None; Secure=true':'';document.cookie=[name,'=',encodeURIComponent(value),expires,path,domain,secure].join('')}else{var cookieValue=null;if(document.cookie&&document.cookie!=''){var cookies=document.cookie.split(';');for(var i=0;i<cookies.length;i++){var cookie=jQuery.trim(cookies[i]);if(cookie.substring(0,name.length+1)==(name+'=')){cookieValue=decodeURIComponent(cookie.substring(name.length+1));break}}}return cookieValue}};


var noticeTipID = null;
var huoniao = {
    /**
     * 提示信息
     * param string type 类型： loading warning success error
     * param string message 提示内容
     * param string hide 是否自动隐藏 auto
     */
    showTip: function (type, message, hide) {
        var obj = $(".w-tip");

        if (obj.html() != undefined) {
            obj.remove();
        }
        $("body").append('<div class="w-tip"><span class="msg ' + type + '">' + message + '</span></div>');

        if (hide == "auto") {
            setTimeout(function () {
                $(".w-tip").stop().fadeOut("fast", function () {
                    $(".w-tip").remove();
                });
            }, 3000);
        }
    }

    //删除提示信息
    , hideTip: function () {
        var obj = $(".w-tip");
        setTimeout(function () {
            obj.fadeOut("fast", function () {
                obj.remove();
            });
        }, 500);
    }

    //父级窗口提示
    , parentTip: function (type, message) {
        if (parent.$(".w-notice").html() != undefined) {
            parent.$(".w-notice").remove();
        }
        parent.$("body").append('<div class="w-notice"><span class="msg ' + type + '"><s></s>' + message + '</span></div>');

        huoniao.parentHideTip();
    }

    //删除父级窗口提示
    , parentHideTip: function () {
        noticeTipID != null ? clearTimeout(noticeTipID) : "";

        noticeTipID = setTimeout(function () {
            parent.$(".w-notice").stop().animate({top: "-50px", opacity: 0}, 300, function () {
                parent.$(".w-notice").remove();
            });
        }, 3000);
    }

    //异步操作
    , operaJson: function (url, action, callback, asy) {
        $.ajax({
            url: url,
            data: action,
            type: "POST",
            dataType: "json",
            async: (typeof asy != "undefined" ? asy : true),
            success: function (data) {
                typeof callback == "function" && callback(data);
            },
            error: function (a, b, c) {
                var _t = this;
                $.post("../login.php", "action=checkLogin", function (data) {
                    if (data == "0") {
                        huoniao.showTip("error", "登录超时，请重新登录！");
                        setTimeout(function () {
                            location.reload();
                        }, 500);
                    } else {
                        huoniao.showTip("error", "接口错误，请稍候重试！");

                        $.dialog({
                            id: "ajaxError",
                            fixed: false,
                            title: "接口错误，请稍候重试！",
                            content: '<table class="table table-striped table-hover" style="border-bottom: 1px solid #ddd; margin-bottom: 0;"><tr><td style="width: 90px; text-align: right;">接口地址：</td><td>'+_t.url+'</td></tr><tr><td style="text-align: right;">接口参数：</td><td><div style="max-height: 200px; overflow-y: auto;">'+_t.data+'</div></td></tr><tr><td style="text-align: right;">状态编码：</td><td>'+a.status+'</td></tr><tr><td style="text-align: right;">错误信息：</td><td>'+b+'</td></tr><tr><td style="text-align: right;">错误内容：</td><td><div style="max-height: 200px; overflow-y: auto;">'+a.responseText+'</div></td></tr><tr><td style="text-align: right;">详细内容：</td><td><div style="max-height: 200px; overflow-y: auto;">'+huoniao.toTXT(c.toString())+'</div></td></tr></table>',
                            width: 700,
                            ok: false,
                            cancel: 'true',
                            cancelVal: '知道了'
                        });
                    }
                });

            }
        });
    }

    , toTXT: function(str){
        var RexStr = /\<|\>|\"|\'|\&/g
        str = str.replace(RexStr,
            function(MatchStr) {
                switch(MatchStr) {
                    case "<":
                    return "&lt;";
                    break;
                    case ">":
                    return "&gt;";
                    break;
                    case "\"":
                    return "&quot;";
                    break;
                    case "'":
                    return "&#39;";
                    break;
                    case "&":
                    return "&amp;";
                    break;
                    case " ":
                    return "&ensp;";
                    break;
                    case " ":
                    return "&emsp;";
                    break;
                    default:
                    break;
                }
            }
        )
        return str;
    }

    //表单验证
    , regex: function (obj) {
        var regex = obj.attr("data-regex"), tip = obj.siblings(".input-tips");
        if (regex != undefined && tip.html() != undefined) {
            var exp = new RegExp("^" + regex + "$", "img");
            if (!exp.test($.trim(obj.val()))) {
                tip.removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
                return false;
            } else {
                tip.removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
                return true;
            }
        }
        return true;
    }

    //返回头部
    , goTop: function () {
        window.scroll(0, 0);
    }

    //定位input
    , goInput: function (obj) {
        $(document).scrollTop(Number(obj.offset().top) - 8);
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
        
        var cfg_timezone = $.cookie('HN_cfg_timezone');
        
        // 使用Intl.DateTimeFormat来格式化日期
        const dateTimeFormat = new Intl.DateTimeFormat('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: typeof cfg_timezone == 'object' ? 'PRC' : cfg_timezone,  //指定时区，cfg_timezone变量已在页面中通过程序自动声明
        });
        
        // 获取格式化后的时间字符串
        const formatted = dateTimeFormat.format(date);
        
        // 将格式化后的字符串分割为数组
        const [year, month, day, hour, minute, second] = formatted.match(/\d+/g);

        // 返回一个对象，包含年月日时分秒
        return {year, month, day, hour, minute, second};
    }

    //合并相同内容的单元格
    , rowspan: function (t, colIdx) {
        return t.each(function () {
            var that;
            $('tr', this).each(function (row) {
                $('td:eq(' + colIdx + ')', this).filter(':visible').each(function (col) {
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
    , showPageInfo: function (lt, po) {
        var list = lt != undefined ? lt : "list";
        var pageInfo = po != undefined ? po : "pageInfo";

        var obj = $("#" + list), info = $("#" + pageInfo);
        var nowPageNum = Number(obj.attr("data-atpage"));
        var allPageNum = Number(obj.attr("data-totalpage"));

        info.hide();

        //拼接所有分页
        if(allPageNum < 10000){
            $("#paginationBtn button").html(nowPageNum + '/' + allPageNum + '页<span class="caret"></span>');
            var pageList = [];
            for (var i = 0; i < allPageNum; i++) {
                pageList.push('<li><a href="javascript:;" data-id="' + (i + 1) + '">第' + (i + 1) + '页</a></li>');
            }
            $("#paginationBtn ul").html(pageList.join(""));
        }else{
            $("#paginationBtn").remove();
        }

        if (allPageNum > 1) {

            $("#paginationBtn").attr("style", "display:inline-block;");

            info.html("").hide();

            var ul = document.createElement("ul");
            info.append(ul);

            //上一页
            if (nowPageNum > 1) {
                var prev = document.createElement("li");
                prev.innerHTML = '<a href="javascript:;">« 上一页</a>';
                prev.onclick = function () {
                    obj.attr("data-atpage", nowPageNum - 1);
                    getList();
                }
                $("#prevBtn").removeClass("disabled").show();
            } else {
                var prev = document.createElement("li");
                prev.className = "disabled";
                prev.innerHTML = '<a href="javascript:;">« 上一页</a>';
                $("#prevBtn").addClass("disabled").show();

            }
            info.find("ul").append(prev);

            //分页列表
            if (allPageNum - 2 < 1) {
                for (var i = 1; i <= allPageNum; i++) {
                    if (nowPageNum == i) {
                        var page = document.createElement("li");
                        page.className = "active";
                        page.innerHTML = '<a href="javascript:;">' + i + '</a>';
                    }
                    else {
                        var page = document.createElement("li");
                        page.innerHTML = '<a href="javascript:;">' + i + '</a>';
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
                        page.innerHTML = '<a href="javascript:;">' + i + '</a>';
                    }
                    else {
                        var page = document.createElement("li");
                        page.innerHTML = '<a href="javascript:;">' + i + '</a>';
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
                                page.innerHTML = '<a href="javascript:;">' + i + '</a>';
                            }
                            else {
                                var page = document.createElement("li");
                                page.innerHTML = '<a href="javascript:;">' + i + '</a>';
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
                        page.innerHTML = '<a href="javascript:;">' + i + '</a>';
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
                next.innerHTML = '<a href="javascript:;">下一页 »</a>';
                next.onclick = function () {
                    obj.attr("data-atpage", nowPageNum + 1);
                    getList();
                }
                $("#nextBtn").removeClass("disabled").show();
            } else {
                var next = document.createElement("li");
                next.className = "disabled";
                next.innerHTML = '<a href="javascript:;">下一页 »</a>';
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
            redirect.innerHTML = '<span class="add-on">跳转至</span><input class="span1" id="prependedInput" type="text" placeholder="页码"><button class="btn" type="button" id="pageSubmit">GO</button>';
            info.append(redirect);

            info.show();

            //分页跳转
            info.find("#pageSubmit").bind("click", function () {
                var pageNum = $("#prependedInput").val();
                if (pageNum != "" && pageNum >= 1 && pageNum <= Number(allPageNum)) {
                    obj.attr("data-atpage", pageNum);
                    getList();
                } else {
                    //alert("请输入正确的数值！");
                    $("#prependedInput").focus();
                }
            });
        } else {
            $("#prevBtn").removeClass("disabled").addClass("disabled").hide();
            $("#nextBtn").removeClass("disabled").addClass("disabled").hide();
            $("#paginationBtn").hide();
        }
    }

    //上一页、下一页
    , pageInfo: function (type) {
        var obj = $("#list"), atPage = Number(obj.attr("data-atpage"));
        if (type == "prev") {
            obj.attr("data-atpage", atPage - 1);
        } else if (type == "next") {
            obj.attr("data-atpage", atPage + 1);
        }
        getList();
    }

    //分类拖动后提示
    , stopDrag: function () {
        if ($(".stopdrag").size() <= 0) {
            $("body").append('<div class="stopdrag">信息发生变化，请及时保存<a href="javascript:;" onclick="saveOpera(\'\');">保存</a></div>');
        }
    }

    //获取URL参数
    , GetQueryString: function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return (r[2]);
        return null;
    }

    //修改URL参数
    , changeURLPar: function (destiny, par, par_value) {
        var pattern = par + '=([^&]*)';
        var replaceText = par + '=' + par_value;
        if (destiny.match(pattern)) {
            var tmp = '/' + par + '=[^&]*/';
            tmp = destiny.replace(eval(tmp), replaceText);
            return (tmp);
        } else {
            if (destiny.match('[\?]')) {
                return destiny + '&' + replaceText;
            } else {
                return destiny + '?' + replaceText;
            }
        }
        return destiny + '\n' + par + '\n' + par_value;
    }

    //判断url地址是否包含scrolltop
    , scrollTop: function () {
        var scrolltop = huoniao.GetQueryString("scrolltop");
        if (scrolltop != null && scrolltop != 0) {
            $(document).scrollTop(scrolltop);
        }
    }

    //重置用户输入的日期为“yyyy-mm-dd hh:mm:ss”格式
    , resetDate: function (t) {
        var val = t.val(),
            now = new Date(),
            year = now.getFullYear(),
            month = now.getMonth() + 1,
            day = now.getDate(),
            hh = now.getHours(),
            mm = now.getMinutes(),
            ss = now.getSeconds();

        month = month <= 9 ? "0" + month : month;
        day = day <= 9 ? "0" + day : day;
        mm = mm <= 9 ? "0" + mm : mm;
        ss = ss <= 9 ? "0" + ss : ss;

        val = val.replace("年", "-");
        val = val.replace("月", "-");
        val = val.replace("日 ", "日");
        val = val.replace("日", " ");
        val = val.replace("时", ":");
        val = val.replace("分", ":");
        val = val.replace("秒", "");

        var nDate = [];
        var ds = val.split(" ");

        if (ds[1] != undefined) {
            var ymd = ds[0].split("-");
            nDate[0] = isNaN(ymd[0]) ? year : ymd[0];
            nDate[1] = isNaN(ymd[1]) ? month : ymd[1];
            nDate[2] = isNaN(ymd[2]) ? day : ymd[2];
        } else {
            nDate[0] = year;
            nDate[1] = month;
            nDate[2] = day;
        }

        if (ds[1] != undefined) {
            var hms = ds[1].split(":");
            nDate[3] = isNaN(hms[0]) ? hh : hms[0];
            nDate[4] = isNaN(hms[1]) ? mm : hms[1];
            nDate[5] = hms[2] == undefined || hms[2] == "" ? "00" : (isNaN(hms[2]) ? ss : hms[2]);
        } else {
            nDate[3] = hh;
            nDate[4] = mm;
            nDate[5] = ss;
        }

        t.val(nDate[0] + "-" + nDate[1] + "-" + nDate[2] + " " + nDate[3] + ":" + nDate[4] + ":" + nDate[5]);
    }

    //填写管理员列表 chzn
    , buildAdminList: function (obj, list, title, currid) {
        var html = [];
        html.push('<option value="">' + (title ? title : '请选择') + '</option>');
        if (obj && list) {
            for (var i = 0; i < list.length; i++) {
                var id = list[i].id, name = list[i].name, l = list[i].list;
                if (l) {
                    html.push('<optgroup label="' + name + '">');
                    for (var b = 0; b < l.length; b++) {
                        html.push('<option value="' + l[b].id + '"' + (currid == l[b].id ? ' selected' : '') + '>' + l[b].username + '&nbsp;&nbsp;[' + l[b].nickname + ']' + '</option>');
                    }
                    html.push('</optgroup>');
                } else {
                    html.push('<option value="' + id + '"' + (currid == id ? ' selected' : '') + '>' + name + '</option>');
                }
            }
        }
        obj.html(html.join(''));
    },

	// 20200420修改 选择城市分站
	sortBy:function(prop){
			return function (obj1, obj2) {
				var val1 = obj1[prop];
				var val2 = obj2[prop];
				if(!isNaN(Number(val1)) && !isNaN(Number(val2))) {
					val1 = Number(val1);
					val2 = Number(val2);
				}
				if(val1 < val2) {
					return -1;
				}else if(val1 > val2) {
					return 1;
				}else{
					return 0;
				}
			}
	},
	choseCity:function(obj,cityid,sub){
		var cityright = $(window).width()-obj.offset().left;
		var cityHtml = '';
		var cityval = cityid.val();

        var cookiePre = window.cookiePre ? window.cookiePre : top.cookiePre;
        var admin_userType = $.cookie(cookiePre+'admin_userType');

		 cityHtml = '<input type="text" id="cityname" name="cityname" readonly="readonly" placeholder="请选择城市分站"><div class="changeCityList">' +
				'<p class="setwidth"></p>' +
				'<div class="boxpd">' +
					'<div class="sj"><i></i></div>' +
					'<div class="box">' +
						'<div class="content fn-clear">' +
							'<p class="tit">'+langData["siteConfig"][37][3]+'：</p> ' +
							'<ul></ul>' +
			      		'</div>' +
						' <div class="morecontent fn-hide">' +
							'<dl class="hot">' +
								'<dt></dt> ' +    //'+langData["siteConfig"][37][79]+'
								'<dd></dd>' +
							'</dl>' +
							'<div class="more">' +
								'<dl class="pytit">' +
									'<dt>'+langData["siteConfig"][19][892]+'</dt> ' +
									'<dd></dd>' +
								'</dl>' +
								'<div class="list"></div>' +
							'</div></div></div></div></div>';
		obj.append(cityHtml);

		var cityCon = obj.find(".changeCityList"), listCon = cityCon.find(".list");
		if(cityright < obj.offset().left){
			$(".choseCity .changeCityList").addClass("right_align");
		}else{
			$(".choseCity .changeCityList").removeClass("right_align");
		}

        var abnormal = {'id': -1, 'name': '异常分站'};
        var notSelectTitle = $('#title').size() == 0 ? '所有分站' : '暂不选择';

        if(cityval == -1){
            $("#cityname").val('异常分站');
        }

		// 城市少于10个
		if(cityList && cityList.length < 10){
			$(".morecontent").remove();
			var cityshao = [];

            if(admin_userType == 0){
                cityshao.push('<li><a style="color:#999;" href="javascript:;">'+notSelectTitle+'</a></li>')
            }else{
                if($('#title').size() == 0 && $('#Config_shopname').size() == 0){
                    $('.choseCity').hide();
                }
            }

            if(admin_userType == 0 && $('#title').size() == 0){
                cityshao.push('<li><a style="color:#f00;" href="javascript:;" data-domain=\''+JSON.stringify(abnormal)+'\' title="查询【分站未启用】和【分站已被删除】的残留数据">异常分站</a></li>')
            }

			for(var i = 0; i<cityList.length; i++){
				if(cityval==cityList[i].id){
					$("#cityname").val(cityList[i].name)
				}
				cityshao.push('<li><a href="javascript:;" title="'+cityList[i].name+'" class="" data-domain=\''+JSON.stringify(cityList[i])+'\'>'+cityList[i].name+'<s><img src="/static/images/changecity_curr.png" /></s></a></li>')
			}

			$('.changeCityList .content').show();
			$('.changeCityList .content').html(cityshao.join(''))

		}else if(cityList && cityList.length >= 10){// 城市多于10个
			$('.changeCityList .content').remove();
			var cityArr = [];
			var hotCityHtml = [];

			//   if(i==0){
              
              //   }
            if(admin_userType == 0){
              if($('#title').size() == 0){
                hotCityHtml.push('<a style="color:#409eff;" href="javascript:;">'+notSelectTitle+'</a>')
                hotCityHtml.push('<a style="color:#f00; margin: 0 20px 0 15px;" href="javascript:;" data-domain=\''+JSON.stringify(abnormal)+'\' title="查询【分站未启用】和【分站已被删除】的残留数据">异常分站</a>')
              }else{
                hotCityHtml.push('<a style="color:#409eff; margin-right: 20px;" href="javascript:;">'+notSelectTitle+'</a>')
              }
            }else{
                if($('#title').size() == 0){
                    $('.choseCity').hide();
                }
            }

			for (var i = 0; i < cityList.length; i++) {
			  var pinyin = cityList[i].pinyin.substr(0,1);
			  if(cityval==cityList[i].id){
			  	$("#cityname").val(cityList[i].name)
			  }
			  if(cityArr[pinyin] == undefined){
			    cityArr[pinyin] = [];
			  }
			  cityArr[pinyin].push(cityList[i]);

			  if(cityList[i].hot == 1){
			  	hotCityHtml.push('<a href="javascript:;" data-domain=\''+JSON.stringify(cityList[i])+'\'>'+cityList[i].name+'</a>');
			  }

			}

			var szmArr = [];
			for(var key in cityArr){
			  szmArr.push(key);
			}
			szmArr.sort();
			var list = [], topSzm = [];
			for(var i = 0; i < szmArr.length; i++){
				if(szmArr[i] == "in_array") continue;
				var cls1 = '';
				cityArr[szmArr[i]].sort(huoniao.sortBy('cityid'));
				list.push('<dl>');
				list.push('	<dt>'+szmArr[i].toUpperCase()+'</dt>');
				list.push('	<dd>');
				for(var n = 0; n < cityArr[szmArr[i]].length; n++){
					var cls = '';

					list.push('<a href="javascript:;" data-domain=\''+JSON.stringify(cityArr[szmArr[i]][n])+'\'>'+cityArr[szmArr[i]][n].name+'</a>');
				}
				list.push('	</dd>');
				list.push('</dl>');
				topSzm.push('<span'+cls1+'>'+szmArr[i].toUpperCase()+'</span>');
			}

			if(hotCityHtml.length){
				cityCon.find(".hot dd").html(hotCityHtml.join(""));
			}else{
				cityCon.find(".hot").remove();
			}
			cityCon.find(".pytit dd, .setwidth").html(topSzm.join(""));
			listCon.html(list.join(""));
			cityCon.delegate(".pytit span", "click", function(e){
				listCon.scrollTop(0);
				var t = $(this), index = t.index(), sct = listCon.find("dl:eq("+index+")").position().top;
				listCon.scrollTop(sct);
				t.addClass("curr").siblings().removeClass("curr");
				e.stopPropagation();
			})
			cityCon.find(".pytit span.curr").click();



		}
		$("#cityname").click(function(e){
			cityCon.show();
			// if(cityList.length>=10){
			// 	listCon.children("dl").each(function(){
			// 		var t = $(this);
			// 		t.attr("data-top", t.position().top);
			// 	})
			// }

			$(document).one("click",function(){
				cityCon.hide();
			});
			 e.stopPropagation();
		});

		cityCon.delegate('a', 'click', function(e){
		  var t = $(this), domain = t.data('domain');
		  cityCon.find('a').removeClass("curr");
		  t.addClass("curr");
		  if(domain){
			  $("#cityname").val(domain.name);
			  cityid.val(domain.id).trigger('change');
		  }else{
			  $("#cityname").val('');
			  cityid.val('').trigger('change');
		  }
		  // sub表示是查询的表
		  if(sub){
			  sub.submit();
		  }
		});


	},


    /*  20190816新增 by zt */


    	//选项框获取数据
    	getTypeList:function(listArr,selector){
    		/*
    		 * 1.listArr是数据，selector是按钮
    		 * 2.布局必须和以前一致
    		 * */
    		var ul_list = [];
    		ul_list.push('<div class="brand_box fn-clear"><ul class="ul_box first_ul">');
    		var len = listArr.length;
    		for(var i=0; i<len; i++){
    			(function(){
					var jsonArray =arguments[0], jArray = jsonArray.lower, cl = "",arrow="";
					if(jArray.length > 0){
						cl = ' sub_li';
						arrow = '<i></i>'
					}
					ul_list.push('<li class=" '+cl+'" data-id="'+jsonArray["id"]+'" ><a href="javascript:;"   class="fn-clear" data-id="'+jsonArray["id"]+'">'+jsonArray["typename"]+arrow+'</a>');
					if(jArray.length > 0){
						ul_list.push('<ul class="ul_box" data-pid="'+jsonArray["id"]+'">');
					}
					for(var k = 0; k < jArray.length; k++){
						if(jArray[k]['lower'] != null){
							arguments.callee(jArray[k]);
						}else{
							ul_list.push('<li data-id="'+jArray[k]["id"]+'" ><a href="javascript:;" data-id="'+jArray[k]["id"]+'">'+jArray[k]["typename"]+'</a></li>');
						}
					}
					if(jArray.length > 0){
						ul_list.push('</ul></li>');
					}else{
						ul_list.push('</li>');
					}
				})(listArr[i]);
    		}
    		ul_list.push('</ul></div>');
			selector.parents('.clearfix').after(ul_list.join(''))

    	},

    	//点击li选择的方法
    	liClick:function(e,t,btn,val){   //e是点击事件  t是点击目标==li  btn是触发按钮  val是保存选值的input
    		//btn是指触发按钮，val是存放id的input
			var id = t.attr('data-id'),title = t.children('a').text();
			t.addClass('li_active').siblings('li').removeClass('li_active');
			var ul = t.children('.ul_box');
			var p_ul = t.parent('ul.ul_box');
			p_ul.nextAll('.ul_box').hide();
			p_ul.nextAll('.ul_box').find('li').removeClass("li_active");
			if(!t.hasClass('sub_li')){
				t.parents('.brand_box').hide();
				btn.find('button').html(title+'<span class="caret"></span>');
				val.val(id);
				if(id != 0){
					val.siblings(".input-tips").removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
				}else{
					val.siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
				}
			}
			t.parents('.brand_box').find('.ul_box[data-pid="'+id+'"]').show();
			t.parents('.brand_box').append(ul);
			$(document).one('click',function(){
				$('.brand_box').hide()
			})
			e.stopPropagation();  //停止事件传播
    	},

        /**
     * 获取附件不同尺寸
     * 此功能只适用于远程附件（非FTP模式）
     * @param string url 文件地址
     * @param string width 兼容老版本(small/middle)
     * @param int width 宽度
     * @param int height 高度
     * @return string *
     */ 
     changeFileSize: function(url, width, height){
        if(url == "" || url == undefined) return "";
    
        //小图尺寸
        if(width == 'small'){
            width = 200;
            height = 200;
        }
    
        //中图尺寸
        if(width == 'middle'){
            width = 500;
            height = 500;
        }
    
        //默认尺寸
        width = typeof width === 'number' ? width : 800;
        height = typeof height === 'number' ? height : 800;
    
        //阿里云、华为云
        url = url.replace('w_4096', 'w_' + width);
        url = url.replace('h_4096', 'h_' + height);
    
        //七牛云
        url = url.replace('w/4096', 'w/' + width);
        url = url.replace('h/4096', 'h/' + height);
    
        //腾讯云
        url = url.replace('4096x4096', width+"x"+height);
    
        return url;
    
        // 以下功能弃用
		if(to == "") return url;
		var from = (from == "" || from == undefined) ? "large" : from;
		var newUrl = "";
		// if(hideFileUrl == 1){
		// 	newUrl =  url + "&type=" + to;
		// }else{
			newUrl = url.replace(from, to);
		// }

		return newUrl;

		//判断图片是否存在
		// var xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
		// xmlhttp.open("GET", newUrl, false);
		// xmlhttp.send();
		// if(xmlhttp.readyState==4){
		// 	//url存在
		// 	if(xmlhttp.status==200){
		// 		return newUrl;
		//
		// 	//url不存在
		// 	}else if(xmlhttp.status==404){
		// 		return url;
		//
		// 	//其他状态
		// 	}else{
		// 		return url;
		// 	}
		// }else{
		// 	return url;
		// }


		// var ImgObj = new Image();
	    // ImgObj.src = newUrl;
		// if (ImgObj.fileSize > 0 || (ImgObj.width > 0 && ImgObj.height > 0)) {
	    //     return newUrl;
	    // } else {
	    //     return url;
	    // }

	}




}






$(function () {
    //判断是否为顶级窗体
    if (self.location == top.location && typeof adminPath != 'undefined' && (typeof adminPage == 'undefined' || (typeof adminPage != 'undefined' && adminPage != 'index'))) {
        var count = adminPath.split("../").length,
            url = self.location.pathname + self.location.search,
            Nowurls = url.split("/"),
            path = [];
        for (var i = count; i < Nowurls.length; i++) {
            path.push(Nowurls[i]);
        }
        parent.location.href = adminPath + "index.php?gotopage=" + path.join("/");
    }

    //上一页
    $("#prevBtn").bind("click", function () {
        if (!$(this).hasClass("disabled")) {
            huoniao.pageInfo("prev");
        }
    });

    //下一页
    $("#nextBtn").bind("click", function () {
        if (!$(this).hasClass("disabled")) {
            huoniao.pageInfo("next");
        }
    });

//	/* 20190816修改*/
//	$('body').delegate('.brand_box li','click',function(e,btn,val){
//
//	})

    //删除按钮增加样式
    $('#delBtn').addClass('btn-danger');

	// 城市分站选择
	function sortBy(prop){
			return function (obj1, obj2) {
				var val1 = obj1[prop];
				var val2 = obj2[prop];
				if(!isNaN(Number(val1)) && !isNaN(Number(val2))) {
					val1 = Number(val1);
					val2 = Number(val2);
				}
				if(val1 < val2) {
					return -1;
				}else if(val1 > val2) {
					return 1;
				}else{
					return 0;
				}
			}
	}

    //开启自定义路由提示
    if($('.routerTips').size() > 0){
        $('.routerTips').tooltip();
    }

    //选择模板
    $("#tplList").delegate(".choose", "click", function () {
        var t = $(this), li = t.closest("li"), ul = t.closest(".tpl-list"), img = li.find(".img"),
            id = img.attr("data-id");
        if (!li.hasClass("current")) {
            ul.find("li").removeClass("current");
            li.addClass("current");
            ul.find(".del").show();
            // li.find(".del").attr("style", "display:none;");
            ul.find("input[type=hidden]").val(id);

            if(t.html().indexOf('首页') > -1){
                ul.find(".choose").html('设为首页');
                t.html('取消首页');
            }
        }else{
            li.removeClass("current");
            li.find(".del").show();
            ul.find("input[type=hidden]").val('');

            if(t.html().indexOf('首页') > -1){
                t.html('设为首页');
            }
        }
        return false;
    });


    //编辑模板
    $("#tplList").delegate(".edit", "click", function (event) {
        var t = $(this), obj = t.parent().prev(".img"), template = obj.attr("data-id"),
            touch = t.closest(".tpl-list").hasClass("touch") ? "touch" : "", title = obj.attr("data-title");
        
        if(template != 'diy'){
            try {
                event.preventDefault();
                parent.addPage(action + "EditTemplate_" + touch + "_" + template, action, "编辑" + title + "模板", "siteConfig/editTemplate.php?action=" + action + "&template=" + template + "&title=" + title + "&touch=" + touch);
            } catch (e) {
            }
        }
    });


    //模板缩略图放大
    $("#tplList").delegate(".img", "click", function () {
        var url = $(this).find("img").attr("src").replace("preview", "preview_large"), rand = Math.random();
        
        if($(this).attr('data-id') == 'diy') return false;

        $.dialog({
            id: 'tplPic',
            title: '预览模板',
            lock: true,
            content: '<div style="width: 700px; height: 700px; overflow-y: scroll;"><img src="../' + url + '?v=' + rand + '" width="700" style="display: block; margin: 0 auto;" /></div>',
            padding: 0
        });
    });


    //删除模板
    $("#tplList").delegate(".del", "click", function () {
        var t = $(this), obj = t.parent().prev(".img"), floder = obj.attr("data-id"),
            type = t.closest(".tpl-list").hasClass("touch") ? "touch/" : "";
        $.dialog.confirm('此操作不可恢复，您确定要删除吗？', function () {
            if (!obj.hasClass("current")) {
                huoniao.showTip("loading", "正在删除，请稍候！");
                huoniao.operaJson("?action=delTpl", "floder=" + encodeURIComponent(type + floder) + "&dopost=" + action + "&token=" + $("#token").val(), function (data) {
                    if (data.state == 100) {
                        huoniao.showTip("success", data.info);
                        t.parent().parent().remove();
                        setTimeout(function(){
                            typeof getCityTemplate == "function" && getCityTemplate();
                        }, 2000);
                    } else {
                        huoniao.showTip("error", data.info);
                        setTimeout(function(){
                            typeof getCityTemplate == "function" && getCityTemplate();
                        }, 2000);
                    }
                });
            }
        });
    });


    //检测FTP是否可连接
    $("#checkFtpConn").bind("click", function () {
        var t = $(this), custome = $("input[name=articleFtp]:checked").val(),
            type = $("input[name=ftpType]:checked").val(), data = $("#ftpType" + type).find("input").serialize();
        if (t.text() == "正在连接...") return false;
        t.html("<font class='muted'>正在连接...</font>");
        if (type == 0) {
            action_ = "checkFtpConn";
        } else if (type == 1) {
            action_ = "checkOssConn";
        } else if (type == 2) {
            action_ = "checkQINIUConn";
        } else if (type == 3) {
            action_ = "checkObsConn";
        } else if (type == 4) {
            action_ = "checkCosConn";
        }
        if (custome == 0) {
            action_ = "checkSystemConn";
            data = "";
        }
        huoniao.operaJson("../inc/json.php?action=" + action_, data, function (val) {
            if (!val) t.html("点击检测是否可用");
            var info = val.info;
            if (val.state == 100) {
                info = '<font class="text-success">' + info + '</font>';
            } else {
                info = '<font class="text-error">' + info + '</font>';
            }
            t.html(info + "&nbsp;&nbsp;<font size='1'>返回重试</font>");
        });
    });

    //一键导入系统地址库
    $("#importAddr").bind("click", function () {
        var t = $(this), type = t.attr("data-type");

        if (t.html() == "正在导入...") return false;
        huoniao.showTip("loading", "加载中...");

        huoniao.operaJson("../siteConfig/siteSubway.php?dopost=getCity", "", function (data) {
            if (data) {
                huoniao.hideTip();

                var li = [];
                for (var i = 0; i < data.length; i++) {
                    li.push('<option value="' + data[i].id + '">' + data[i].typename + '</option>');
                }
                $.dialog({
                    id: "areaInfo",
                    fixed: false,
                    title: "请选择要导入的城市",
                    content: '<form class="quick-editForm" name="editForm" style="padding: 40px 0;"><dl class="clearfix"><dt>选择城市：</dt><dd><select id="province" name="province" style="width:130px;"><option value="">--省份--</option>' + li.join("") + '</select><select id="city" name="city" style="width:130px; margin-left: 10px;"><option value="">--城市--</option></select></dd></dl></form>',
                    width: 450,
                    ok: function () {
                        var cid = 0, city = parent.$("#city").val(), province = parent.$("#province").val();
                        if (city != "" && city != 0) {
                            cid = city;
                        } else if (province != "" && province != 0) {
                            cid = province;
                        }

                        if (cid == 0) {
                            alert("请选择要导入的城市！");
                            return false;
                        }


                        huoniao.operaJson("../inc/json.php?action=importAddr", "type=" + type + "&id=" + cid, function (val) {
                            if (!val) t.html("一键导入系统地址库");
                            if (val.state == 100) {
                                location.reload();
                            } else {
                                $.dialog.alert(val.info);
                                t.html("一键导入系统地址库");
                            }
                        });


                    },
                    cancelVal: "关闭",
                    cancel: true
                });

                parent.$("#province").change(function () {
                    var id = $(this).val(), pinyin = $(this).find("option:selected").data("pinyin");
                    if (id != 0 && id != "") {
                        //获取子级城市
                        huoniao.operaJson("../siteConfig/siteSubway.php?dopost=getCity", "id=" + id, function (data) {
                            if (data) {
                                var li = [];
                                for (var i = 0; i < data.length; i++) {
                                    li.push('<option value="' + data[i].id + '">' + data[i].typename + '</option>');
                                }
                                parent.$("#city").html('<option value="0">--城市--</option>' + li.join(""));
                            } else {
                                parent.$("#city").html('<option value="0">--城市--</option>');
                            }
                        });
                    } else {
                        parent.$("#city").html('<option value="0">--城市--</option>');
                    }
                });


            } else {
                huoniao.showTip("error", "加载失败！");
            }
        });

        // $.dialog.confirm('确定要导入系统地址库吗？<br />确定后将清除现有数据，请谨慎操作！', function(){
        // 	if(t.html() == "正在导入...") return false;
        // 	t.html("正在导入...");
        // 	huoniao.operaJson("../inc/json.php?action=importAddr", "type="+type, function(val){
        // 		if(!val) t.html("一键导入系统地址库");
        // 		if(val.state == 100){
        // 			location.reload();
        // 		}else{
        // 			$.dialog.alert(val.info);
        // 			t.html("一键导入系统地址库");
        // 		}
        // 	});
        // });
    });

    //多选按钮组全选功能
    $("#editform").delegate(".checkAll", "click", function () {
        if ($(this).html() == "反选") {
            $(this).html("全选");
            $(this).parent().find("input[type=checkbox]").attr("checked", false);
        } else {
            $(this).html("反选");
            $(this).parent().find("input[type=checkbox]").attr("checked", true);
        }
    });

    //查看会员信息
    $("#list, #editform, .o-wrap, .layui-row").delegate(".userinfo", "click", function () {
        var id = $(this).attr("data-id");
        if (id) {
            huoniao.showTip("loading", "数据读取中，请稍候...");
            huoniao.operaJson("../inc/json.php?action=getMemberInfo", "id=" + id, function (data) {
                huoniao.hideTip();
                if (data) {

                    $.dialog({
                        id: "memberInfo",
                        fixed: false,
                        title: "会员ID【" + id + "】",
                        content: '<table width="100%"border="0"cellspacing="1"cellpadding="5" style="line-height:2em;"><tr><td width="100"valign="top"><img onerror="this.src=\'/static/images/noPhoto_60.jpg\'" src="' + data[0]["photo"] + '"width="100"/></td><td width="80"align="right"valign="top">会员名：<br />昵称：<br />真实姓名：<br />' + (data[0]["company"] ? "公司名称：<br />" : "") + '帐户：<br />&nbsp;<br />性别：<br />邮箱：<br />电话：<br />QQ：<br />生日：<br />城市：<br />注册时间：<br />注册IP：<br />状态：</td><td valign="top">' + data[0]["username"] + (data[0]["level"] ? '<font color="red">【' + data[0]["level"] + '】</font>' : '') + '<br />' + data[0]["nickname"] + '<br />' + data[0]["realname"] + (data[0]["company"] ? '<br />' + data[0]["company"] : "") + '<br />余额 ' + data[0]["money"] + '&nbsp;&nbsp;&nbsp;积分 ' + data[0]["point"] + '<br />保障金 ' + data[0]["promotion"] + '&nbsp;&nbsp;&nbsp;'+ parent.bonusName + ' ' + data[0]['bonus'] + '<br />' + (data[0]["sex"] == 0 ? "女" : "男") + '<br />' + data[0]["email"] + (data[0]["emailCheck"] == 0 ? "&nbsp;<font color='#f00'>[未验证]</font>" : "&nbsp;<font color='green'>[已验证]</font>") + '<br />' + data[0]["phone"] + (data[0]["phoneCheck"] == 0 ? "&nbsp;<font color='#f00'>[未验证]</font>" : "&nbsp;<font color='green'>[已验证]</font>") + '<br />' + data[0]["qq"] + '<br />' + huoniao.transTimes(data[0]["birthday"], 2) + '<br />' + data[0]["addr"] + '<br />' + huoniao.transTimes(data[0]["regtime"], 2) + '<br />' + data[0]["regip"] + '<br />' + (data[0]["state"] == 1 ? '<font color="green">正常</font>' : (data[0]["state"] == 2 ? '<font color="red">审核拒绝</font>' : '<font color="gray">未审核</font>')) + '</td></tr></table>',
                        width: 550,
                        button: [
                            {
                                name: '修改会员信息',
                                callback: function(){
                                    var title = data[0]["username"],
                                        href = "memberList.php?dopost=Edit&id=" + id;

                                    try {
                                        parent.addPage("memberListEdit" + id, "member", title, "member/" + href);
                                    } catch (e) {
                                    }
                                },
                                focus: true
                            },
                            {
                                name: '授权登录此账号',
                                callback: function(){
                                    window.open('/?action=authorizedLogin&id='+id+'');
                                }
                            },
                            {
                                name: '关闭'
                            }
                        ]
                    });

                } else {
                    huoniao.showTip("error", "数据读取失败");
                }
            });
        }
    });


    //打开页面
    $('.addPage').bind('click', function(){
        var t = $(this), href = t.attr('href'), _id = t.attr('data-id'), name = t.attr('data-name'), action = t.attr('data-action');
        try {
            event.preventDefault();
            parent.addPage(_id, action, name, href);
        } catch (e) {
        }
    })

    function checkFenbiao(){
        var cookiePre = window.cookiePre ? window.cookiePre : top.cookiePre;
        var cookieDomain = $.cookie(cookiePre+'cookieDomain');
        var syncCheck = $.cookie(cookiePre+'syncFenbiao');
        if(syncCheck){
            var file = syncCheck+'_syncFenbiao.php';
            $.cookie(cookiePre+'syncFenbiao', '');
            top.open('/include/cron/'+file);
        }
    }
    setTimeout(function(){
        checkFenbiao();
    }, 1000)


    //生成随机密码
    $('body').delegate('.autoPassword', 'click', function(){
        var t = $(this), inp = t.attr('data-id');
        huoniao.operaJson("../inc/json.php?action=generatePassword", "", function(data){
            var state = "success";
            if(data.state != 100){
                state = "error";
            }

            if(data.state == 100){
                $('#'+inp).val(data.info);
            }

        });
    })
});


//输出货币标识
function echoCurrency(type) {
    var pre = (typeof cookiePre != "undefined" && cookiePre != "") ? cookiePre : ((typeof top.cookiePre != "undefined" && top.cookiePre != "") ? top.cookiePre : "HN_");
    var currencyArr = $.cookie(pre + "currency");
    if (currencyArr) {
        var currency = JSON.parse(decodeURIComponent(atob(currencyArr)));
        if (type) {
            return currency[type]
        } else {
            return currencyArr['short'];
        }
    }
}


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

Array.prototype.in_array = function (e) {
    for (i = 0; i < this.length && this[i] != e; i++);
    return !(i == this.length);
}

//监听F5，只刷新当前页面
function _attachEvent(obj, evt, func, eventobj) {
    eventobj = !eventobj ? obj : eventobj;
    if (obj.addEventListener) {
        obj.addEventListener(evt, func, false);
    } else if (eventobj.attachEvent) {
        obj.attachEvent('on' + evt, func);
    }
}

var ISFRAME = 1;
if (ISFRAME) {
    try {
        _attachEvent(document.documentElement, 'keydown', parent.resetEscAndF5);
    } catch (e) {
    }
}



/**
 * 导入默认数据
 */
 function importDefaultData_(){
	$.dialog.confirm("导入默认数据，会先清空现有数据，原数据无法恢复，请谨慎操作！！！", function(){
		huoniao.showTip("loading", "正在导入，，请稍候...");
		huoniao.operaJson("?dopost=importDefaultData",{}, function(data){
			if(data.state == 100){
				huoniao.showTip("success", data.info, "auto");
				setTimeout(function() {
					location.reload();
				}, 800);
			}else{
				alert(data.info);
				return false;
			}
		});
	});
}