/**
 * 会员中心分类信息列表
 * by guozi at: 20150627
 */

 var uploadErrorInfo = [],
 	huoniao = {

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

 	//将普通时间格式转成UNIX时间戳
 	,transToTimes: function(timestamp){
 		var new_str = timestamp.replace(/:/g,'-');
     new_str = new_str.replace(/ /g,'-');
     var arr = new_str.split("-");
     var datum = new Date(Date.UTC(arr[0],arr[1]-1,arr[2],arr[3]-8,arr[4],arr[5]));
     return datum.getTime()/1000;
 	}


 	//判断登录成功
 	,checkLogin: function(fun){
 		//异步获取用户信息
 		$.ajax({
 			url: masterDomain+'/getUserInfo.html',
 			type: "GET",
 			async: false,
 			dataType: "jsonp",
 			success: function (data) {
 				if(data){
 					fun();
 				}
 			},
 			error: function(){
 				return false;
 			}
 		});
 	}



 	/**
     * 获取附件不同尺寸
     * 此功能只适用于远程附件（非FTP模式）
     * @param string url 文件地址
     * @param string width 兼容老版本(small/middle)
     * @param int width 宽度
     * @param int height 高度
     * @return string *
     */ 
      ,changeFileSize: function(url, width, height){
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
 		if(hideFileUrl == 1){
 			return url + "&type=" + to;
 		}else{
 			return url.replace(from, to);
 		}
 	}

 	//获取字符串长度
 	//获得字符串实际长度，中文2，英文1
 	,getStrLength: function(str) {
 		var realLength = 0, len = str.length, charCode = -1;
 		for (var i = 0; i < len; i++) {
 		charCode = str.charCodeAt(i);
 		if (charCode >= 0 && charCode <= 128) realLength += 1;
 		else realLength += 2;
 		}
 		return realLength;
 	}



 	//删除已上传的图片
 	,delAtlasImg: function(mod, obj, path, listSection, delBtn){
 		var g = {
 			mod: mod,
 			type: "delAtlas",
 			picpath: path,
 			randoms: Math.random()
 		};
 		$.ajax({
 			type: "POST",
 			cache: false,
 			async: false,
 			url: "/include/upload.inc.php",
 			dataType: "json",
 			data: $.param(g),
 			success: function() {}
 		});
 		$("#"+obj).remove();

 		if($("#"+listSection).find("li").length < 1){
 			$("#"+listSection).hide();
 			$("#"+delBtn).hide();
 		}
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



 }
var objId = $("#list");

$(function(){

	//导航
	$('.header-r .screen').click(function(){
		var nav = $('.nav'), t = $('.nav').css('display') == "none";
		if (t) {nav.show();}else{nav.hide();}
	})


	//项目
	$(".tab .type").bind("click", function(){
	var t = $(this), id = t.attr("data-id"), index = t.index();
	if(!t.hasClass("curr") && !t.hasClass("sel")){
		state = id;
		atpage = 1;
	$('.count li').eq(index).show().siblings("li").hide();
		t.addClass("curr").siblings("li").removeClass("curr");
	$('#list').html('');
		getList(1);
	}
	});
	//置顶刷新 弹出
	objId.delegate('.moreC','click',function(){
		var t = $(this),tid = t.attr('data-id'),top = t.attr('data-top');
		if(tid==1){
			$('.topFresh ul li.firtop').css('display','none')
		}else{
			$('.topFresh ul li.firtop').css('display','block')
		}
		if(top==1){
			$('.topFresh ul li.topLi').css('display','none')
		}else{
			$('.topFresh ul li.topLi').css('display','block')
		}
		$('.item').removeClass('itemShow');
		t.closest('.item').addClass('itemShow');
	  	$('.topFresh').animate({"bottom":'0'},200);
	  	$('.sfcarMask').fadeIn();
	});
	//置顶刷新 关闭
	$('.top-cancel,.sfcarMask').click(function(){
		$('.item').removeClass('itemShow');
		$('.sfcarMask').fadeOut();
  		$('.topFresh').animate({"bottom":'-100%'},200);
	})


	//刷新
	objId.delegate('.refresh', 'click', function(){
		var t = $(this), par = t.closest(".item"), id = par.attr("data-id"), title = par.attr("data-title");
		if(!t.hasClass('disabled')){
			refreshTopFunc.init('refresh', 'sfcar', 'detail', id, t, title);
		}
	});

	//已开通智能刷新后 点击智能刷新
	objId.delegate('.smartfresh', 'click', function(){
		var o = $(".hasSmart");
		 o.css('display','block');
		 setTimeout(function(){
		  	o.css('display','none')
		},1000);
	});

	//弹出层中的置顶
	$('.topFresh .topping').click(function(){
		var t = $(this), par = $('.itemShow'), id = par.attr("data-id"), title = par.attr("data-title");
		refreshTopFunc.init('topping', 'sfcar', 'detail', id, t, title);
	});
	//弹出层中的智能刷新
	$('.topFresh .sfcarReshSmart').click(function(){
		var t = $(this), par = $('.itemShow'), id = par.attr("data-id"), title = par.attr("data-title");
		refreshTopFunc.init('newSmartfresh', 'sfcar', 'detail', id, t, title);
	});

	// 下拉加载
	$(window).scroll(function() {
		var h = $('.item').height();
		var allh = $('body').height();
		var w = $(window).height();
		var scroll = allh - w - h;
		if ($(window).scrollTop() > scroll && !isload) {
			atpage++;
			getList();
		};
	});


	getList(1);

	var M={};
	objId.delegate(".del", "click", function(){
		$('.delMask').addClass('show');
		$('.delAlert').show();
		var t = $(this), par = t.closest(".item"), id = par.attr("data-id");
		$('.item').removeClass('itemShow');
		t.closest('.item').addClass('itemShow');
		var d = (t.hasClass('realDel'))?1:0;
		var txt = (d==0)?langData['sfcar'][2][14]:langData['sfcar'][2][15];//确定删除信息？---该信息已开通付费推广，确定删除？
		$('.delAlert h2.delTile').text(txt);

	});

	//确认删除
	$('.sureDel').click(function(e){
		var id = $('.itemShow').attr("data-id");
		$('.delMask').removeClass('show');
		$('.delAlert').hide();
		$.ajax({
			url: masterDomain+"/include/ajax.php?service=sfcar&action=del&id="+id,
			type: "GET",
			dataType: "jsonp",
			success: function (data) {
				if(data && data.state == 100){
					//删除成功后移除信息层并异步获取最新列表
					objId.html('')
     				getList(1);

				}else{
					alert(data.info);
				}
			},
			error: function(){
				alert(langData['siteConfig'][20][227]);
			}
		});
	})
	//关闭删除
	$('.cancelDel,.delMask').click(function(){
		$('.delMask').removeClass('show');
		$('.delAlert').hide();
	})



});

function getList(is){

  isload = true;

	if(is != 1){
		// $('html, body').animate({scrollTop: $(".main-tab").offset().top}, 300);
	}else{
		atpage = 1;
	}

	objId.append('<p class="loading">'+langData['siteConfig'][20][184]+'...</p>');

	$.ajax({
		url: masterDomain+"/include/ajax.php?service=sfcar&action=getsfcarlist&u=1&orderby=1&state="+state+"&page="+atpage+"&pageSize="+pageSize,
		type: "GET",
		dataType: "jsonp",
		success: function (data) {
			if(data && data.state != 200){
				if(data.state != 100){
					objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
          			$('.count span').text(0);
				}else{
					var list = data.info.list, pageInfo = data.info.pageInfo, html = [];
					var totalPage = data.info.pageInfo.totalPage;

					//拼接列表
					if(list.length > 0){

						var t = window.location.href.indexOf(".html") > -1 ? "?" : "&";
						var param = t + "do=edit&id=";
						var urlString = editUrl + param;
						var cartype = '';
						for(var i = 0; i < list.length; i++){
							var item        = [],
								id          	= list[i].id,
								carseat			= list[i].carseat,
								endaddr			= list[i].endaddr,
								startaddr		= list[i].startaddr,
								missiontime		= list[i].missiontime,
								missiontime1	= list[i].missiontime1,
								usetypename		= list[i].usetypename,
								usetype			= list[i].usetype,
								typename		= list[i].typename,
								onclick			= list[i].onclick,
								isbid			= list[i].isbid,
								refreshSmart    = list[i].refreshSmart,
								bid_type    	= list[i].bid_type,
								bid_price   	= list[i].bid_price,
								bid_end     	= huoniao.transTimes(list[i].bid_end, 1),
								bid_plan    	= list[i].bid_plan,
								pubdate    		= list[i].pubdate,
								pubdatetime   	= list[i].pubdatetime,
								url    			= list[i].url,
								waitpay			= list[i].waitpay

							//智能刷新
							if(refreshSmart){
								refreshCount = list[i].refreshCount;
								refreshTimes = list[i].refreshTimes;
								refreshPrice = list[i].refreshPrice;
								refreshBegan = huoniao.transTimes(list[i].refreshBegan, 1);
								refreshNext = huoniao.transTimes(list[i].refreshNext, 1);
								refreshSurplus = list[i].refreshSurplus;
							}
							url = waitpay == "1" || list[i].state != "1" ? 'javascript:;' : url;


								html.push('<div class="item" data-id="'+id+'" >');

								html.push('<div class="info-item fn-clear">');
								//乘用车car 载货车truck 乘客car 货物truck
								if (usetype ==0) {
									cartype ='car';
								}else{
									cartype ='truck';
								}
								html.push('<div class="li_top"><a href="'+url+'" data-module="sfcar" class="toMini" data-temp="detail" data-id="'+list[i].id+'"><span class="car-type '+cartype+'">'+usetypename+'</span><h2 class="liTitle">'+startaddr+'<s></s>'+endaddr+'</h2></a></div>')

								html.push('<dl>');
								html.push('<dd class="item-type-1">');
								html.push('<span class="sp_time">'+langData['sfcar'][2][19]+pubdatetime+'</span>');//更新于

								if(list[i].state == "0"){//待审核
									if(onclick>0){
										html.push('<span class="sp_see" style="margin-right:.3rem;">'+langData['siteConfig'][19][394]+onclick+'</span>');	//浏览
									}
									html.push('<span style="color:#F9412E; float: left;">'+langData['siteConfig'][19][556]+'</span>');
								}else if(list[i].state == "1"){
									html.push('<span class="sp_see">'+langData['siteConfig'][19][394]+onclick+'</span>');//浏览
								}else if(list[i].state == "2"){//审核拒绝
									html.push('<span style="color:#F9412E; float: left;">'+langData['siteConfig'][9][35]+'</span>');
								}
								html.push('</dd>');
								html.push('</dl>');
								html.push('</div>');
								if(refreshSmart || isbid == 1){
									var claplan = '', txtPlan= '';
									if(isbid && bid_type == 'plan'){
										claplan = 'topPlanDetail'
										txtPlan ='data-module="info" data-id="'+id+'" title="'+langData['siteConfig'][6][113]+'"'
									}
									html.push('<div class="sd '+claplan+'"'+txtPlan+'>');
									if(refreshSmart){
										html.push('<p><span style="color:#1F7EF2;font-weight: bold;margin-right: .16rem;">'+langData['siteConfig'][32][28]+'</span><span class="refreshSmartTime" data-time="'+list[i].refreshNext+'">0:0:0</span>'+langData['siteConfig'][45][2]+'，'+langData['siteConfig'][45][1].replace('1','<span class="alreadyRefreshCount">'+(refreshCount-refreshSurplus)+'</span>')+'，'+langData['siteConfig'][45][0].replace('1','<span class="SurplusRefreshCount">'+refreshSurplus+'</span>')+'</font></p>');//智能刷新 -- 后刷新--已刷新1次--剩余1次

									}
									if(isbid && bid_type == 'normal'){
										html.push('<p><span style="color:#1F7EF2;font-weight: bold;margin-right: .16rem;">'+langData['siteConfig'][41][57]+'</span><span class="topEndTime">'+bid_end+langData['siteConfig'][6][163]+' </span></p>');//普通置顶 -- 结束

									}
									if(isbid && bid_type == 'plan'){

										//记录置顶详情
										topPlanData['info'] = Array.isArray(topPlanData['info']) ? topPlanData['info'] : [];
										topPlanData['info'][id] = bid_plan;
										var plan_end = bid_plan[bid_plan.length-1]['date'];

										html.push('<p><span style="color:#1F7EF2;font-weight: bold;margin-right: .16rem;">'+langData['siteConfig'][32][39]+'</span><span class="topEndTime">'+plan_end+langData['siteConfig'][6][163]+'</span></p>');//计划置顶 -- 结束
										html.push('<i class="morePlan"></i>')
									}
									html.push('</div>');
								}

								html.push('<div class="o fn-clear">');
								if(waitpay == "1"){
									html.push('<a href="javascript:;" class="delayPay">'+langData['siteConfig'][19][327]+'</a><a href="javascript:;" class="del">'+langData['siteConfig'][6][8]+'</a>');
								}else{
									if(list[i].state == "1"){
										if(!refreshSmart || !isbid){
											html.push('<span class="moreC" data-id="'+refreshSmart+'" data-top="'+isbid+'"></span>');
										}
										if(!refreshSmart){
											html.push('<a href="javascript:;" class="refresh">'+langData['siteConfig'][16][70]+'</a>');//刷新
										}else{
											html.push('<a href="javascript:;" class="smartfresh">'+langData['siteConfig'][32][28]+'</a>');//智能刷新
										}
									}
									html.push('<a href="'+urlString+id+'" class="edit">'+langData['siteConfig'][6][6]+'</a>');
									if(!refreshSmart && !isbid){
										html.push('<a href="javascript:;" class="del putongDel">'+langData['siteConfig'][6][8]+'</a>');
									}else{
										html.push('<a href="javascript:;" class="del realDel">'+langData['siteConfig'][6][8]+'</a>');
									}


								}
								html.push('</div>');
								html.push('</div>');

						}

            			objId.append(html.join(""));
            			$('.loading').remove();
            			isload = false;
                        if(atpage >= totalPage){
                            isload = true;
                          	objId.append("<p class='loading'>"+langData['sfcar'][1][6]+"</p>");//没有更多了~
                        }

					}else{
            			$('.loading').remove();
            			objId.append("<p class='loading'>"+langData['sfcar'][1][6]+"</p>");//没有更多了~
					}

                    countDownRefreshSmart();

					switch(state){
						case "":
							totalCount = pageInfo.totalCount;
							break;
						case "0":
							totalCount = pageInfo.gray;
							break;
						case "1":
							totalCount = pageInfo.audit;
							break;
						case "2":
							totalCount = pageInfo.refuse;
							break;
						case "4":
							totalCount = pageInfo.expire;
							break;
					}

					// $("#total").html(pageInfo.totalCount);
					if(pageInfo.audit>0){
			           // $("#audit").show().html(pageInfo.audit);
			         }else{
			            $("#audit").hide();
			         }
			         if(pageInfo.gray>0){
			            //$("#gray").show().html(pageInfo.gray);
			         }else{
			            $("#gray").hide();
			         }
			         if(pageInfo.refuse>0){
			            $("#refuse").show().html(pageInfo.refuse);
			         }else{
			            $("#refuse").hide();
			         }
					// $("#expire").html(pageInfo.expire);
					// showPageInfo();
				}
			}else{
				objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");//暂无相关信息！
        		$('.count span').text(0);
			}
		}
	});
}
