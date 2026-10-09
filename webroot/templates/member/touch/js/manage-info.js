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

	//刷新
	objId.delegate('.refresh', 'click', function(){
		var t = $(this), par = t.closest(".item"), id = par.attr("data-id"), title = par.attr("data-title");
		if(!t.hasClass('disabled')){
			refreshTopFunc.init('refresh', 'info', 'detail', id, t, title);
		}
	});


	//置顶
	objId.delegate('.topping', 'click', function(){
		var t = $(this), par = t.closest(".item"), id = par.attr("data-id"), title = par.attr("data-title");
		refreshTopFunc.init('topping', 'info', 'detail', id, t, title);
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
		var t = $(this), par = t.closest(".item"), id = par.attr("data-id");
		if(id){
			M.dialog = jqueryAlert({
		          'title'   : '',
		          'content' : langData['siteConfig'][44][98],//确定要删除吗?
		          'modal'   : true,
		          'buttons' :{
		              '是' : function(){
			                M.dialog.close();
			                t.siblings("a").hide();
							t.addClass("load");

							$.ajax({
								url: masterDomain+"/include/ajax.php?service=info&action=del&id="+id,
								type: "GET",
								dataType: "jsonp",
								success: function (data) {
									if(data && data.state == 100){

										//删除成功后移除信息层并异步获取最新列表
										objId.html('')
			             				getList(1);

									}else{
										$.dialog.alert(data.info);
										t.siblings("a").show();
										t.removeClass("load");
									}
								},
								error: function(){
									alert(langData['siteConfig'][20][227]);
									t.siblings("a").show();
									t.removeClass("load");
								}
							});
		              },
		              '否' : function(){
		                  M.dialog.close();
		              }
		          }
		    })
		}
	});






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
		url: masterDomain+"/include/ajax.php?service=info&action=ilist&u=1&orderby=1&state="+state+"&page="+atpage+"&pageSize="+pageSize,
		type: "GET",
		dataType: "jsonp",
		success: function (data) {
			if(data && data.state != 200){
				if(data.state == 101){
					objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
          			$('.count span').text(0);
				}else{
					var list = data.info.list, pageInfo = data.info.pageInfo, html = [];

					//拼接列表
					if(list.length > 0){

						var t = window.location.href.indexOf(".html") > -1 ? "?" : "&";
						var param = t + "do=edit&id=";
						var urlString = editUrl + param;

						for(var i = 0; i < list.length; i++){
							var item        = [],
							id          = list[i].id,
							title       = list[i].title,
							titleNew    = list[i].titleNew,
							color       = list[i].color,
							address     = list[i].address,
							typename    = list[i].typename,
							url         = list[i].url,
							litpic      = list[i].litpic,
							click       = list[i].click,
							common      = list[i].common,
          					isbid       = parseInt(list[i].isbid),
							bid_type    = list[i].bid_type,
							bid_price   = list[i].bid_price,
							bid_end     = huoniao.transTimes(list[i].bid_end, 1),
							bid_plan    = list[i].bid_plan,
							waitpay     = list[i].waitpay,
							is_valid    = list[i].is_valid,
							refreshSmart= list[i].refreshSmart,
							pubdate     = huoniao.transTimes(list[i].pubdate, 1);

      						url = waitpay == "1" || list[i].arcrank != "1" ? 'javascript:;' : url;

             				//智能刷新
							if(refreshSmart){
								refreshCount = list[i].refreshCount;
								refreshTimes = list[i].refreshTimes;
								refreshPrice = list[i].refreshPrice;
								refreshBegan = huoniao.transTimes(list[i].refreshBegan, 1);
								refreshNext = huoniao.transTimes(list[i].refreshNext, 1);
								refreshSurplus = list[i].refreshSurplus;
							}

							html.push('<div class="item" data-id="'+id+'" data-title="'+titleNew+'">');
							if(waitpay == "0"){
  								html.push('<div class="title">');
				                var apa = [];
				                html.push('<span style="color:#919191;font-size: .24rem;">'+langData['siteConfig'][11][8]+'：'+pubdate+'</span>');
				                var arcrank = "";
				                if(list[i].arcrank == "0"){
				                   html.push('<span style="color:#f9412e; font-size: .26rem; float: right;">'+langData['siteConfig'][19][556]+'</span>');
				                 }else if(list[i].arcrank == "1"){
				                   // html.push('<span style="color:#f9412e; font-size: .26rem; float: right;">'+langData['siteConfig'][26][73]+'</span>');
				                   if(!isbid){
										html.push('<a href="javascript:;" class="topping">'+langData['siteConfig'][44][99]+'<s></s></a>');//开通置顶
									}
                                   	if(refreshSmart || isbid == 1){
                                        if(isbid && bid_type == 'normal'){
                                            html.push('<a href="javascript:;" class="topcommon">已开通普通置顶</a>');
                                        }
                                        if(isbid && bid_type == 'plan'){
                                            //记录置顶详情
                                            topPlanData['info'] = Array.isArray(topPlanData['info']) ? topPlanData['info'] : [];
                                            topPlanData['info'][id] = bid_plan;

                                            html.push('<a href="javascript:;" class="topPlanDetail topcommon" data-module="info" data-id="'+id+'" title="'+langData['siteConfig'][6][113]+'">'+langData['siteConfig'][31][131]+'<s></s></a>');//查看详情 -- 已开通计划置顶
                                        }
                                    }
				                 }else if(list[i].arcrank == "2"){
				                   html.push('<span style="color:#f9412e; font-size: .26rem; float: right;">'+langData['siteConfig'][9][35]+'</span>');
				                 }
				                html.push('</div>');
				            }

							html.push('<div class="info-item fn-clear">');
							if(litpic != "" && litpic != undefined){
								html.push('<div class="info-img fn-left"><a href="'+url+'"><img onerror="this.src=\''+litpic+'\'" src="'+huoniao.changeFileSize(litpic, "small")+'" /></a></div>');
							}else{
				                html.push('<div class="icontxt"></div>')
				            }
							html.push('<dl>');
							html.push('<dt><a href="'+url+'">'+title+'</a></dt>');
							//html.push('<dd class="item-area"><em>'+langData['siteConfig'][19][393]+'：'+typename+'</em></dd>');
							if(is_valid==1){
								html.push('<dd class="item-area"><em>'+langData['siteConfig'][19][393]+'：'+typename+'</em>&nbsp;<font color="#f00">'+langData['siteConfig'][31][132]+'</font></dd>');//此商品已售完
							}else{
								html.push('<dd class="item-area"><em>'+langData['siteConfig'][19][393]+'：'+typename+'</em></dd>');
							}
							if(list[i].arcrank == "0"){
				                  html.push('');
				            }else if(list[i].arcrank == "1"){
				                  html.push('<dd class="item-type-1"><span class="sp_see"><em></em>'+click+' </span><span class="sp_comment"><em></em>'+common+'</span></dd>');
				            }else if(list[i].arcrank == "2"){
				                  html.push('');
				            }
							html.push('</dl>');
							html.push('</div>');
                            if(refreshSmart || isbid == 1){
                                html.push('<div class="sd">');
                                if(refreshSmart){
                                    html.push('<p><span style="color:#f9412e">'+langData['siteConfig'][32][28]+'</span> — <span class="refreshSmartTime" data-time="'+list[i].refreshNext+'">0:0:0</span>'+langData['siteConfig'][45][2]+'，'+langData['siteConfig'][45][1].replace('1','<span class="alreadyRefreshCount">'+(refreshCount-refreshSurplus)+'</span>')+'，'+langData['siteConfig'][45][0].replace('1','<span class="SurplusRefreshCount">'+refreshSurplus+'</span>')+'</font></p>');//智能刷新 -- 后刷新--已刷新1次--剩余1次

                                }
                                if(isbid && bid_type == 'normal'){
                                    html.push('<p><span style="color:#f9412e">'+langData['siteConfig'][41][57]+'</span> — <span class="topEndTime">'+bid_end+langData['siteConfig'][6][163]+' </span></p>');//普通置顶 -- 结束

                                }
                                if(isbid && bid_type == 'plan'){

                                    //记录置顶详情
                                    topPlanData['info'] = Array.isArray(topPlanData['info']) ? topPlanData['info'] : [];
									topPlanData['info'][id] = bid_plan;
									var plan_end = bid_plan[bid_plan.length-1]['date'];

                                    html.push('<p><span style="color:#f9412e">'+langData['siteConfig'][32][39]+'</span> — <span class="topEndTime">'+plan_end+langData['siteConfig'][6][163]+'</span></p>');//计划置顶 -- 结束
                                }
                                html.push('</div>');
							}

							html.push('<div class="o fn-clear">');
			                if(waitpay == "1"){
			                    html.push('<a href="javascript:;" class="delayPay pay_btn publicpaybtn">'+langData['siteConfig'][19][327]+'</a><a href="javascript:;" class="del">'+langData['siteConfig'][6][8]+'</a>');
			                }else{
			                	if(list[i].arcrank == "1"){
				                    if(!refreshSmart){
										html.push('<a href="javascript:;" class="refresh">'+langData['siteConfig'][16][70]+'</a>');//刷新
									}else{
                                      	html.push('<a href="javascript:;" class="refresh disabled">'+langData['siteConfig'][45][3]+'</a>');//已设置刷新
                                    }
	                			}
			  					html.push('<a href="'+urlString+id+'" class="edit">'+langData['siteConfig'][6][6]+'</a>');
				                if(!refreshSmart && !isbid){
				                    html.push('<a href="javascript:;" class="del">'+langData['siteConfig'][6][8]+'</a>');
				                }

              				}
							html.push('</div>');



                            // if(refreshSmart || isbid == 1){
							// 	html.push('<div class="sd">');
							// 	if(refreshSmart){
							// 		html.push('<p><font color="#ff6600">已开通智能刷新，下次刷新时间：'+refreshNext+'，已刷新'+(refreshCount-refreshSurplus)+'次，剩余'+refreshSurplus+'次</font></p>');
							// 	}
							// 	if(isbid && bid_type == 'normal'){
							// 		html.push('<p><font color="#ff6600">已开通置顶，结束时间：'+bid_end+'</font></p>');
							// 	}
							// 	if(isbid && bid_type == 'plan'){
							// 		var topPlanArr = [];
							// 		for (var p = 0; p < bid_plan.length; p++) {
							// 			var state = !bid_plan[p].state ? 'disabled' : '';
							// 			topPlanArr.push('<span class="'+state+'">' + bid_plan[p].date + ' ' + bid_plan[p].week + '（'+(bid_plan[p].type == 'all' ? '全天' : '早8点-晚8点')+'）</span>');
							// 		}
							// 		html.push('<p><font color="#ff6600">已开通计划置顶，明细：'+topPlanArr.join('、')+'</font></p>');
							// 	}
							// 	html.push('</div>');
							// }

							html.push('</div>');

						}

            objId.append(html.join(""));
            $('.loading').remove();
            isload = false;

					}else{
            $('.loading').remove();
            objId.append("<p class='loading'>"+langData['siteConfig'][20][185]+"</p>");
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
			            $("#audit").show().html(pageInfo.audit);
			         }else{
			            $("#audit").hide();
			         }
			         if(pageInfo.gray>0){
			            $("#gray").show().html(pageInfo.gray);
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
				objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
        $('.count span').text(0);
			}
		}
	});
}
