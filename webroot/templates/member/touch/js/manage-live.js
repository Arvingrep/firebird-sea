$(function(){
  //开始直播
  var device = navigator.userAgent;
    $(".op_box").delegate(".btn_start", "click", function() {
    	if(device.indexOf('huoniao') > -1){

	        setupWebViewJavascriptBridge(function(bridge) {
	            bridge.callHandler("createLive", {
		        "title": title,
		        "pushurl": pushurl,
		        "flowname": flowname,
		        "wayname": wayname,
		        "pullUrl":pullUrl,
		        "litpic":litpic,
		        "webUrl":webUrl
		            }, function callback(DataInfo){
		              //这里需要进行直播状态改变吗？
		                if(DataInfo){
		                  $.ajax({
		                url: "/include/ajax.php?service=live&action=updateState&state=1&id="+id,
		                type: "GET",
		                dataType: "json",
		                success: function (data) {
		                  if(data && data.state == 100){
		                  }else{
		                    alert(data.info);
		                  }
		                }
		              });
		                    if(DataInfo.indexOf('http') > -1){
		                        location.href = DataInfo;
		                    }else{
		                        alert(DataInfo);
		                    }
		                }
		            });
		    });
	    }else{
	    	var alink = $('.btn_start a').attr('data-href')

	    }

    });

    var page=1,isload=false,objId = $(".an_main");
	var keywords = '';
	$(".searchbox").submit(function(e){
		keywords = $.trim($('#keywords').val());
		page = 1,isload = false;
		getList();
		e.preventDefault();
	});

	$(".search_clear").click(function(){
		$("#keywords").val('');
	})
	$("#keywords").blur(function(){
		if($(this).val()){
			$(".placeholder").hide();
			$(".search_icon").show();
		}else{
			$(".placeholder").show();
			$(".search_icon").hide();
		}
	});
	$("#keywords").focus(function(){
		$(".placeholder").hide();
		$(".search_icon").show();

	});
	$("#keywords").on("input",function(){
		if($(this).val()){
			$(".searchbox i.search_clear").show();
		}else{
			$(".searchbox i.search_clear").hide();
		}
	})


  var range = 100; //距下边界长度/单位px
    var totalheight = 0;
    $(window).scroll(function(){
        var srollPos = $(window).scrollTop(); //滚动条距顶部距离(页面超出窗口的高度)
        totalheight = parseFloat($(window).height()) + parseFloat(srollPos);
        if(($(document).height()-range) <= totalheight && !isload) {
          page++;
            getList();
        }
    });
    getList();
    function getList(state,order){

	  if(isload) return false;
      isload = true;
	  objId.append("<p class='loading'>加载中~</p>");//暂无数据！
	  var state = $(".fast_shai .onclick").attr("data-state");
	  var order = $(".order_box .selected").attr("data-order");
    $.ajax({
        url: "/include/ajax.php?service=live&action=alive&type=2&page="+page+"&u=1&uid="+hiddenid+"&pageSize=10&state="+state+"&orderby="+order+"&title="+keywords,
        type: "GET",
        dataType: "json",
        success: function (data) {
            if(data && data.state != 200){
                if(data.state == 101){
                    objId.html("<p class='loading'>暂无数据~</p>");//暂无数据！
                }else{
					$(".loading").remove();
                    var list = data.info.list, pageInfo = data.info.pageInfo, html = [];
					//$(".fast_shai li").eq(0).find('em').text(pageInfo.totalCount)
                    //拼接列表
                    if(list.length > 0){
                        var t = window.location.href.indexOf(".html") > -1 ? "?" : "&";
                        var param = t + "do=edit&id=";
                        for(var i = 0; i < list.length; i++){
                            var item        = [],
                                id          = list[i].id,
                                title       = list[i].title,
                                url         = list[i].url,
                                litpic      = list[i].litpic,
                                photo      = list[i].photo,
                                state      = list[i].state,
                                click       = list[i].click,
                                up        = list[i].up,
                                newurl    = list[i].newurl,
                                arcrank   = list[i].arcrank,
								pubdate   = list[i].pubdate,
								ftimes   = list[i].ftimes,
                                ftime   = list[i].ftime;

							var stateCls = '',stateTxt= '';
							if(state==0){
								stateCls = 'tolive';
								stateTxt= '预告';
							}else if(state==1){
								stateCls = 'living';
								stateTxt= '';
							}else{
								stateCls = 'lived';
								stateTxt= '回放';
							}
							html.push('<li class="item live_li '+stateCls+'" data-id="'+id+'">');
							if(list[i].waitpay == '0'){
							    html.push('<a href="'+newurl+'" class="fn-clear">');
							}else{
							    html.push('<a href="javascript:;" class="fn-clear">');
							}
							html.push('<h3><i>'+stateTxt+'</i>'+title+'</h3>');
							html.push('<div class="live_litpic fn-left"><img src="'+litpic+'"></div><div class="live_time ">');
							if(state==0){
								html.push('<h4 class="countTime" data-ftime="'+ftimes+'">00:00:00</h4><p>开播倒计时</p>');
							}else{
								html.push('<div class="ftime"><h6>'+ftime.split(' ')[0]+'</h6><p>'+ftime.split(' ')[1]+'</p></div><i class="line" ></i>');
								html.push('<div class="etime"><p style="font-weight:normal;">时长   '+(list[i].times?list[i].times:"正在直播")+'</p></div>');
							}
							html.push('</div></a>');
							var arcrankStr = '';
							switch(arcrank){
							  case '0':
							    arcrankStr = '<span class="arcrank_0">'+langData['siteConfig'][19][556]+'</span>';//待审核
							    break;
							  case '1':
							    arcrankStr = (state==0?'<span class="arcrank_1">待开播</span>':'');//已审核
							    break;
							  case '2':
							    arcrankStr = '<span class="arcrank_0">'+langData['siteConfig'][23][101]+'</span>';//审核失败
							    break;
							}
							html.push('<div class="live_detail"><p class="live_info">'+arcrankStr);
							html.push('<span class="read">'+click+'</span>');
							html.push('<span class="live_ftime"> 更新于'+huoniao.transTimes(pubdate,1)+' </span>');
							html.push('</p>');

							if(list[i].waitpay == '0'){
							    html.push('<a href="javascript:;" class="live_op '+(arcrank!='0'?"":"")+'" data-id="'+id+'"></a>');
							}else{
							    html.push('<a href="javascript:;" class="delayPay" style="color:#ff6600;">支付</a>');
							}

							html.push('</div>');
                        }

                        if(page > 1){
                          objId.append(html.join(""));
                        }else{
                          objId.html(html.join(""));
                        }
						getCountDown();
						setInterval(getCountDown,1000);
                        if(page >= pageInfo.totalPage){
							isload = true;
							objId.append("<p class='loading'>没有更多了~</p>")
						 }else{
							isload = false;
						}

					}else{
						objId.html("<p class='loading'>"+langData['siteConfig'][21][64]+"</p>");//暂无数据！
					}
				}
			}else{
				objId.html("<p class='loading'>"+langData['siteConfig'][21][64]+"</p>");//暂无数据！
			}
        }
    });
  }

  function getCountDown(){
	  var nowDate = Date.parse(new Date());
	  $(".an_main .tolive").each(function(){
		  var ftime = $(this).find(".countTime").attr("data-ftime");
		  var countTime = Number(ftime) - (nowDate/1000)  ;
		  if(countTime<=0){
			  countTime = 0;
			  clearInterval(getCountDown)
		  }
		  var days = parseInt(countTime / 60 / 60 / 24 , 10); //计算剩余的天数
		  var hours = parseInt(countTime / 60 / 60 % 24 , 10); //计算剩余的小时
		  var minutes = parseInt(countTime / 60 % 60, 10);//计算剩余的分钟
		  var seconds = parseInt(countTime % 60, 10);//计算剩余的秒数

		  $(this).find(".countTime").text((days>0?(days+"天"):"")+(hours>9?hours:"0"+hours)+":"+(minutes>9?minutes:"0"+minutes)+":"+(seconds>9?seconds:"0"+seconds))
	  })
  }
  // setInterval(getCountDown,1000);

  //用户删除直播
  $("body").delegate(".dellive","tap", function(){
    var t = $(this);
    if(t.hasClass('load')) return;
    t.addClass('load');
     if(confirm(langData['siteConfig'][31][134]) ){//是否确认删除？
      var id = t.attr('data-id');
      $.ajax({
          url: "/include/ajax.php?service=live&action=delUserLive",
          data: "id="+id,
          type: "GET",
          dataType: "json",
          success: function (msg) {
            if(msg.state == 100){
              objId.html("<p class='loading'>"+langData['siteConfig'][38][8]+"</p>");//加载中...
              page = 1;
              getList();
            }else{
              t.removeClass('load');
              alert(msg.info);
            }
          },
          error: function(){
            t.removeClass('load');
            console.log(langData['siteConfig'][38][42]);//网络错误，操作失败！
          }
        });
     }else{
      setTimeout(function(){
        t.removeClass('load');
      }, 200)
     }
  });


  // 筛选
  $(".fast_shai li").click(function(){
	  var t = $(this);
	  t.addClass("onclick").siblings('li').removeClass("onclick");
	  page = 1,isload = false;
	  getList()
  });

  // 排序
  $(".shai_btn").click(function(ev){
	  var t = $(this);
	  $(".order_box,.mask").show();
	  $(".order_box li").click(function(){
		  var li  =$(this);
		  li.addClass("selected").siblings("li").removeClass("selected");
		  t.text(li.text());
		  page=1; isload=false;
		  getList();
	  })
	  $(document).one("click",function(){
		  $(".order_box,.mask").hide();
	  });
	  ev.stopPropagation();
  });

  // 操作直播
  $(".an_list").delegate(".live_li .live_op","click",function(ev){
	  var t = $(this),id = t.attr('data-id');
	  var par = t.closest('li');
	  $(".mask1").show();
	  $(".op_box").css('transform','translateY(0)');
	  $(".op_box li").removeClass("disabled");
	  $(".op_box h2.tip").addClass("disabled");
	  if(par.find(".arcrank_0").size()>0){
		  $(".enter,.btn_start,.txt").addClass("disabled");
		  $(".op_box h2.tip").removeClass("disabled");
	  }else if(par.hasClass("lived") || par.hasClass("living")){
		  $(".btn_start,.edit").addClass("disabled");

	  }
	  $(".op_box li").each(function(){
		  var li = $(this);
		  if(li.find('a').attr('data-href')){
			  var url = li.find('a').attr('data-href');
			  li.find('a').attr('href',url+id);
		  }else{
			   li.find('a').attr('data-id',id)
		  }
	  })

	  $(document).one("click",function(){
		   $(".op_box").css('transform','translateY(100%)');
		   $(".mask1").hide();
	  });
	  ev.stopPropagation();

  });
  
  
  // 删除视频
  $(".del_live").click(function(){
	  var id = $(this).find('a').attr('data-id');
	  $(".delMask").addClass('show')
	  $(".delAlert").show();
	  $(".delAlert .sureDel").attr('data-id',id);
	  
  });
  
  $(".delMask,.delAlert .cancelDel").click(function(){
	  $(".delMask").removeClass('show')
	  $(".delAlert").hide();
  });
  
  $(".delAlert .sureDel").click(function(){
  	  var id = $(this).attr('data-id')
	  $.ajax({
		url: "/include/ajax.php?service=live&action=delUserLive",
		data: "id="+id,
		type: "GET",
		dataType: "json",
		success: function (msg) {
		  if(msg.state == 100){
			  //删除成功后移除信息层并异步获取最新列表
			  var par = $(".an_list  .live_li[data-id='"+id+"']")
				par.remove();
				showErrAlert(msg.info)
		  }else{
			  showErrAlert(msg.info);
		  }
		  $(".delMask").click()
		},
		error: function(){
		  console.log(langData['siteConfig'][31][134]);//网络错误，操作失败！
		}
	  });
  })


});
