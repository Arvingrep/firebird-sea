$(function(){
    //提示窗
   	 var showErrTimer;
   	 var showMsg = function(txt,time){
   	 	ht = time?time:1500
   	 	showErrTimer && clearTimeout(showErrTimer);
   	 	$(".popMsg").remove();
   	 	$("body").append('<div class="popMsg"><div class="popText"><p>'+txt+'</p></div></div>');
   	 	$(".popMsg p").css({ "left": "50%"});
   	 	$(".popMsg").css({"visibility": "visible"});
   	 	showErrTimer = setTimeout(function(){
   	 	    $(".popMsg").fadeOut(300, function(){
   	 	        $(this).remove();
   	 	    });
   	 	}, ht);
   	 }
    $('.m-close').click(function(){
        $('.down_modal').css("display","none");
    });
	if(live_state=='1'){
		$(".live_time .live_ftime").html(liveTime(livetime))
	}

	// 复制url
	// var clipboard
	// 	clipboard = new ClipboardJS('.copy_btn');
	// 	clipboard.on('success', function(e) {
	// 		showMsg(langData['siteConfig'][46][101]);  //复制成功
	// 	});

	// 	clipboard.on('error', function(e) {
	// 		showMsg(langData['siteConfig'][46][102]); //复制失败
	// 	});

	$(".switch").click(function(){
		var t =$(this);
		if(t.hasClass("disabled")) return false;
		t.addClass("disabled");
		if(!t.hasClass("closed_switch")){
			t.addClass("closed_switch");
			t.find("em").text(langData['live'][1][7]);  //关闭
		}else{
			t.removeClass("closed_switch");
			t.find("em").text(langData['live'][1][36]);  //开启
		}
		$.ajax({
			url: "/include/ajax.php?service=live&action=updateReplayState&id="+id,
			type: 'post',
			dataType: 'json',
			success: function (data) {
				if(data && data.state == 100){
					t.removeClass("disabled");
				}else{
					alert(data.info);
				}
			}
		});

	})



	// 查看大图
	Zepto.fn.bigImage({
	   artMainCon:".instro_box ",  //图片所在的列表标签
	   show_Con:"img "
	});




	function liveTime(s){
		var t;
		s = s/1000;
		if(s > -1){
			var hour = Math.floor(s/3600);
			var min = Math.floor(s/60) % 60;
			var sec = s % 60;
			if(hour < 10 && hour > 0) {
				t = '0'+ hour + "时";
			} else if(hour >= 10) {
				t = hour + "时";
			}else{
				t = '';
			}

			if(min < 10){t += "0";}
			t += min + "分";
			if(sec < 10){t += "0";}
			t += sec.toFixed(0) +"秒";
		}
		return t;

	}
    //刷新页面
    $(".vrefresh").click(function(){
        window.location.reload();
    });
    var device = navigator.userAgent;
	//开始直播

   var isWeixin = device.toLowerCase().indexOf('micromessenger') != -1;
   var wx_stringArr = isWeixin?device.toLowerCase().match(/micromessenger\/([\d\.]+)/i):0;
   var wx_version = wx_stringArr.length>0?device.toLowerCase().match(/micromessenger\/([\d\.]+)/i)[1]:0; //微信版本号
   var wx_for = isWeixin?(wx_version.split('.')[0]>=7 || (wx_version.split('.')[1] >= 0 && wx_version.split('.')[0]==7) || (wx_version.split('.')[2]>=12 && wx_version.split('.')[0]==7 && wx_version.split('.')[1] == 0) ):0;//微信版本号是否大于7.0.12
     masterDomain = typeof(masterDomain)!='undefined'?masterDomain:'';
      var url_path =  window.location.href;
     var paramUrlAnd = url_path == masterDomain?"":'?url='+url_path;
     var paramUrlIos = url_path == masterDomain?"":'://?url='+url_path
     var appConfig = {
          scheme_IOS: appinfo.URLScheme_iOS?(appinfo.URLScheme_iOS + paramUrlIos):(masterDomain+'/mobile.html'),
          scheme_Adr: appinfo.URLScheme_Android?('portal://'+appinfo.URLScheme_Android+':8000/splash' + paramUrlAnd):(masterDomain+'/mobile.html'),
          download_url_IOS: masterDomain+'/mobile.html',
          timeout: 600
      };
      if(isWeixin && wx_for &&  appinfo.wx_appid){
      	$(".btn_start").append(' <span><wx-open-launch-app' +
          '          id="launch-appbtn-live"' +
          '          appid="'+appinfo.wx_appid+'"' +
          '      extinfo="'+url_path+'"'+
          '        ><template>\n' +
          '     <style>.downLoadBtn {width:100px; height:100px; diplay:block;  opacity:0; }</style>\n'+
           '   <a href="javascript:;" class="downLoadBtn">立即打开</a>\n' +  //立即打开
          '   </template>\n'+
         '   </wx-open-launch-app>\n</span>')
      }
    $(".btn_start").click(function(){
		if(level=='0' && typeof(live) != 'undefined' && !live ){
			$(".mask,.pop_box").show();
			return false;
		}

		var appLive = true;
    	//如果是系统生成推流地址需要判断是否客户端 如果不是在客户端，显示下载链接
		if (!pulltype && device.indexOf('huoniao_Android') <= -1 && device.indexOf('huoniao_iOS') <= -1 || (isWeixin && !wx_for)) {
			// $('.down_modal').css("display","block");
			appLive = false;
			if(isWeixin && !wx_for){
	           location.href = appConfig.download_url_IOS
	          }else if(!isWeixin){
	            openclient();
	          }
           
		}

		if(isWeixin && wx_for){
			appLive = false;
		}

		if(!appLive){
			showErrAlert('<p style="margin:auto;">小程序端不支持，请在APP或者电脑端操作！</p>')
		}


		if(!appLive) return; 
    	$.ajax({
			url: masterDomain+"/include/ajax.php?service=live&action=updateState&state=1&id="+id,
			type: "GET",
			dataType: "json",
			success: function (data) {
				if(data && data.state == 100){
                    // location.reload();
				}else{
					alert(data.info);
				}
			}
		});
		if(device.indexOf('huoniao_Android') > -1 || device.indexOf('huoniao_iOS') > -1){
			setupWebViewJavascriptBridge(function(bridge) {
	            bridge.callHandler("createLive", {
					"title": title,
					"pushurl": pushurl,
					"flowname": flowname,
					"wayname": wayname,
					"pullUrl":pullUrl,
					"litpic":litpic,
					"webUrl":webUrl,
					"id":id,
					"starttime":starttime,
					"liveLimitTime":liveLimitTime,
					"livetime":livetime,
					"streamname":streamname
	            }, function callback(DataInfo){
	                if(DataInfo){
	                    if(DataInfo.indexOf('http') > -1){
	                        location.href = DataInfo;
	                    }else{
	                        alert(DataInfo);
	                    }
	                }
	            });
	        });
		}

    });


    if(isWeixin && wx_for){
    	
         wx.ready(function(){
           var btn = document.getElementById('launch-appbtn-live');
           if(btn){
            btn.addEventListener('click', function (e) {
           console.log('click');

           //调起失败后兼容处理
           setTimeout(function(){
             if(!isClick){
               isClick = true;
               location.href = appConfig.download_url_IOS
             }
           }, 1000);

         });
             btn.addEventListener('launch', function (e) {
              
             });
             btn.addEventListener('error', function (e) {
           //调起失败后兼容处理
           isClick = true;
           $.cookie('appDownloadLocation', true);
           location.href = appConfig.download_url_IOS
             });
           }

         })

       }

	// 直接开播
	$(".btn_live1").click(function(){
		live = 1;
		$(".btn_start").click();
		$(".mask,.pop_box").hide();
	})
	// 关闭弹窗
	$(".close_pop,.mask").click(function(){
		$(".mask,.pop_box").hide();
	});
	//结束直播
    $("body").delegate(".btn_end", "click", function() {
        var con=confirm("是否确定关闭直播？"); //在页面上弹出对话框
        if(con==true) {
            update();
            window.location.reload();
        } else {
        }

    });

    setInterval(function(){
	    $.ajax({
	        url: masterDomain + "/include/ajax.php?service=live&action=selLiveTime&id="+id,
	        type: 'post',
	        dataType: 'json',
	        async : false,   //注意：此处是同步，不是异步
	        data:"id="+id,
	        success: function (data) {
	            if(data && data.state == 100){
	                livetime = data.info.livetime;
	            }else{
	                alert(data.info)
	            }
	        }

	    });
	},3000);

	// 修改推流方式
	$(".edit_url").click(function(e){
		var t =$(this);
		txt = t.text();
	    $(".popsure_box").css("display","flex");
		$(".pop_sure.no_title").removeClass("fn-hide").siblings(".pop_sure").addClass("fn-hide");
		$(".pop_sure.no_title h3").text(langData['live'][0][8]+txt+"？");  //确定
		$(".pop_sure.no_title .sure_btn").click(function(){

			if(pulltype){
				$.ajax({
					url: "/include/ajax.php?service=live&action=updateLiveType&type=0&id="+chatid,
					type: 'post',
					dataType: 'json',
					data:"id="+id,
					success: function (data) {
						if(data && data.state == 100){
							location.reload();
							alert(langData['live'][5][3]);
						}else{
							alert(data.info);
						}
					}
				});
			}else{
				$(".mask").show();
				$(".pop_url").css("bottom","0");
				$(".popsure_box").css("display","none");
			}
		});
		$(".pop_sure.no_title .cancel_btn,.popsure_box").click(function(){
			 $(".popsure_box").css("display","none");
		});
		e.stopPropagation();
	});

	// 关闭推流弹出层
	$(".mask").click(function(){
		$(".mask").hide();
		$(".pop_url").animate({"bottom":"-7rem"},300)
	});

	// 切换推流
	$(".pop_url .tab_box li").click(function(){
		var t = $(this),val = t.attr('data-val');
		t.addClass("selected").siblings('li').removeClass("selected");
		// $("#pulltype").val(val);
		$(".conbox").addClass("fn-hide");
		if(val==0){
			$(".pop_url .tab_box").addClass("left_li").removeClass("right_li");
			$(".conbox.auto_box").removeClass("fn-hide");
			// var title = '你已配置过第三方推流，确认改为手动拉流？';
			// $(".popsure_box").css("display","flex");
			// $(".pop_sure.pop_title").removeClass("fn-hide").siblings(".pop_sure").addClass("fn-hide");
			// $(".pop_sure.pop_title h3").text(title);
		}else{
			$(".pop_url .tab_box").removeClass("left_li").addClass("right_li");
			$(".conbox.self_box").removeClass("fn-hide")
		}
	});

	// 确定改变推流方式

	$(".self_box .btn_tj").click(function(e){
		var pulltype = $("#pulltype").val();
		var ctype = $(".pop_url .tab_box li.selected").attr('data-val');
		var title = '';
		var txt = ctype!='0'?"手动拉流":"系统拉流"
		var ctxt = ctype!='0'?"系统拉流":"手动拉流";
		if(ctype=='1'){
			if($("#addrPc").val()==''){
				alert('请输入pc端地址');
				return false;
			}else if($("#addrMob").val()==''){
				alert('请输入移动端地址');
				return false;
			}
		}
		if(pulltype == ctype){
			if(ctype=='0'){
				return false;
			}else{
				title ='你已配置过'+txt+'，确认修改？';
			}
		}else{
			title ='你已配置过'+ctxt+'，确认改为'+txt+'？';
		}
		$(".popsure_box").css("display","flex");
		$(".pop_sure.pop_title").removeClass("fn-hide").siblings(".pop_sure").addClass("fn-hide");
		$(".pop_sure.pop_title h3").text(title);
		// 点击确认按钮
		var addrPc =  $("#addrPc").val();
		var addrMob = $("#addrMob").val()
		$(".pop_sure.pop_title .sure_btn").click(function(){
			$(".mask").show();
			$(".pop_url").css("bottom","0");
			$(".popsure_box").css("display","none");
			$("#pulltype").val(ctype);
			$.ajax({
				url: "/include/ajax.php?service=live&action=updateLiveType&type=1&id="+chatid+"&pc=" + encodeURIComponent(addrPc) + "&touch=" + encodeURIComponent(addrMob),
				type: 'post',
				dataType: 'json',
				data:"id="+id,
				success: function (data) {
					if(data && data.state == 100){
						alert('保存成功');
						location.reload();
					}else{
						alert(data.info);
						t.removeClass('disabled').html('重新提交');
					}
				}
			});

		});
		$(".pop_sure.pop_title .cancel_btn,.popsure_box").click(function(){
			 $(".popsure_box").css("display","none");
		});
		e.stopPropagation();

	});

});

function update(){
    $.ajax({
        url: masterDomain + "/include/ajax.php?service=live&action=updateState&state=2&id="+id,
        type: 'post',
        dataType: 'json',
        async : false,   //注意：此处是同步，不是异步
        data:"id="+id,
        success: function (data) {
            if(data && data.state == 100){
                data.info=langData['siteConfig'][32][12];//结束直播
                // alert(data.info);
            }else{
                alert(data.info)
            }
        }

    });
}
