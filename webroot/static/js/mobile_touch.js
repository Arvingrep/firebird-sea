$(function(){
	var ww = document.documentElement.clientWidth;
	var wh = document.documentElement.clientHeight;
	var bili = ww/wh
	var url_path = masterDomain;
    var ua = navigator.userAgent;
	var isWeixin = ua.toLowerCase().indexOf('micromessenger') != -1;
	var clickCount = $.cookie('failClick') ? $.cookie('failClick')   : 0; //失败的点击次数
						
	 if(clickCount >= 2){
    	$('body').append('<div class="failToApp"></div>')
    	setTimeout(function(){
    		clickCount = 0
    		$.cookie('failClick',0);
    	},1000)

    	// 点击删除
    	 $('body').delegate('.failToApp','click',function(){
	    	$('.failToApp').remove()
	     })
    	
    }
	
	if($(".appPage_v2").size()>0 && ((ua.toLowerCase().match(/android/) && androidUrl) || (/iphone|ipad|ipod/.test(ua.toLowerCase()) && iosUrl))){
		if(isWeixin){
			var wx_stringArr = isWeixin?device.toLowerCase().match(/micromessenger\/([\d\.]+)/i):0;
			var wx_version = wx_stringArr.length>0?device.toLowerCase().match(/micromessenger\/([\d\.]+)/i)[1]:0; //微信版本号
			var wx_for = isWeixin?(wx_version.split('.')[0]>=7 || (wx_version.split('.')[1] >= 0 && wx_version.split('.')[0]==7) || (wx_version.split('.')[2]>=12 && wx_version.split('.')[0]==7 && wx_version.split('.')[1] == 0) ):0;//微信版本号是否大于7.0.12
			if(wx_for &&  cfg_appinfo.wx_appid){
				// $(".btn_down").remove();
				$('.appPage_v2 .btn_down').after('<div class="btn_down_box" style="height: 1rem; margin-top:-60px; opacity:0;" >'+
				'     <wx-open-launch-app' +
				 '          id="launch-btn"' +
				 '          appid="'+cfg_appinfo.wx_appid+'"' +
				 // '			extinfo="'+url_path+'"'+
				 '    ><template>\n' +
				 '     <style>.btn_down{display: flex; align-items: center; justify-content: center; width:320px; height: 60px; border-radius: 141px; color: #fff; font-size: 26px; font-weight: 800; margin: auto; background: #F3494A;}\n'+
				 '.btn_box{display:block;width:375px; display:flex; justify-content:center;}\n'+
				 '</style>\n'+
				  ' <div class="btn_box"> <a class="btn_down">APP下载</a></div>\n' +  //立即打开
				 '   </template>\n'+
				'   </wx-open-launch-app>\n'+
				'</div>')
			}
		}

		var iOSver = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);  //ios版本信息
		var isIOS9 = iOSver?iOSver[1]:0;
		var appConfig = {
			scheme_IOS: cfg_appinfo.URLScheme_iOS?(cfg_appinfo.URLScheme_iOS+'://?url='):(androidUrl),
			scheme_Adr: cfg_appinfo.URLScheme_Android?('portal://'+cfg_appinfo.URLScheme_Android+':8000/splash'):(androidUrl),
			download_url_And: androidUrl,
			download_url_IOS: iosUrl,
			download_url_HM: hmUrl,
			timeout: 1000
		};

        
        //调起失败后兼容处理
	    var isClick = false;

	    $('.btn_down').bind('click', function(){
	        setTimeout(function(){
	            if(!isClick){
                    isClick = true;
                    if (/iphone|ipad|ipod/.test(ua.toLowerCase())) {
						location.href = iosUrl;
                    }else if (ua.match(/MicroMessenger/i) == 'MicroMessenger') {
        				if($(".btn_down").attr('data-yyb')){
        					location.href = $(".btn_down").attr('data-yyb');
        				}else{
        					$('.tipWarp').show();
        				}
        			}else if (/openharmony/.test(ua.toLowerCase())) {
						location.href = hmUrl;
					}else if (/android/.test(ua.toLowerCase())) {
        				location.href = androidUrl;
        			}
                }
	        }, 2000);
	    })
	    $('body').delegate('.btn_down_box', 'click', function(){
	        setTimeout(function(){
	            if(!isClick){
                    isClick = true;
                    if (/iphone|ipad|ipod/.test(ua.toLowerCase())) {
						location.href = iosUrl;
                    }else if (ua.match(/MicroMessenger/i) == 'MicroMessenger') {
        				if($(".btn_down").attr('data-yyb')){
        					location.href = $(".btn_down").attr('data-yyb');
        				}else{
        					$('.tipWarp').show();
        				}
        			}else if (/openharmony/.test(ua.toLowerCase())) {
						location.href = hmUrl;
					}else if (/android/.test(ua.toLowerCase())) {
        				location.href = androidUrl;
        			}
                }
	        }, 2000);
	    })
	    
		if(isWeixin && wx_for){
			wx.ready(function(){
				var btn = document.getElementById('launch-btn');
				btn.addEventListener('click', function (e) {
				    //调起失败后兼容处理
                    setTimeout(function(){
                        if(!isClick){
                            isClick = true;
                            if (/iphone|ipad|ipod/.test(ua.toLowerCase())) {
        						location.href = iosUrl;
                            }else if (ua.match(/MicroMessenger/i) == 'MicroMessenger') {
                				if($(".btn_down").attr('data-yyb')){
                					location.href = $(".btn_down").attr('data-yyb');
                				}else{
                					$('.tipWarp').show();
                				}
                			}else if (/openharmony/.test(ua.toLowerCase())) {
                				location.href = hmUrl;
                			}else if (/android/.test(ua.toLowerCase())) {
                				location.href = androidUrl;
                			}
                        }
                    }, 1000);
                    
				});
				btn.addEventListener('launch', function (e) {
				    isClick = true;
					console.log('success');
				});
				btn.addEventListener('error', function (e) {
				    //调起失败后兼容处理
				    clickCount = Number(clickCount)
				    clickCount++;
				    $.cookie('failClick',clickCount)
				    if(clickCount >= 2){
				    	$('body').append('<div class="failToApp"></div>')
				    	setTimeout(function(){
				    		clickCount = 0
				    		$.cookie('failClick',0);
				    	},1000)

				    	// 点击删除
				    	 $('body').delegate('.failToApp','click',function(){
					    	$('.failToApp').remove()
					     })
				    	
				    }
                    isClick = true;
					if (/iphone|ipad|ipod/.test(ua.toLowerCase()) ) {
						location.href = iosUrl;
					}else{
						$.cookie('appDownloadLocation', true);
						if (ua.match(/MicroMessenger/i) == 'MicroMessenger') {
            				if($(".btn_down").attr('data-yyb')){
            					location.href = $(".btn_down").attr('data-yyb');
            				}else{
            					$('.tipWarp').show();
            				}
            			}else if (/openharmony/.test(ua.toLowerCase())) {
							location.href = hmUrl;
						}else if (/android/.test(ua.toLowerCase())) {
            				location.href = androidUrl;
            			}
					}

				});
			})

		}else{
			$("body").delegate(".btn_down",'click',function(){
				openclient()
			})
		}

		//安卓端调起失败后会刷新页面，这里判断cookie进行跳转到下载终端
		if($.cookie('appDownloadLocation')){
			$.cookie('appDownloadLocation', null);
			if (ua.match(/MicroMessenger/i) == 'MicroMessenger') {
				if($(".btn_down").attr('data-yyb')){
					location.href = $(".btn_down").attr('data-yyb');
				}else{
					$('.tipWarp').show();
				}
			}else if (/openharmony/.test(ua.toLowerCase())) {
				location.href = hmUrl;
			}else if (/android/.test(ua.toLowerCase())) {
				location.href = androidUrl;
			}
		}

	}else{
		if (/iphone|ipad|ipod/.test(ua.toLowerCase())) {
			$(".btn_down").attr('href',iosUrl);
		}else if (ua.match(/MicroMessenger/i) == 'MicroMessenger') {
			if($(".btn_down").attr('data-yyb')){
				$(".btn_down").attr('href',$(".btn_down").attr('data-yyb'));
			}else{
				$('.tipWarp').show();
			}
		}else if (/openharmony/.test(ua.toLowerCase())) {
			location.href = hmUrl;
		}else if (/android/.test(ua.toLowerCase())) {
			$(".btn_down").attr('href',androidUrl)
		}
	}

	$(".btn_down").click(function(){
		if((ua.toLowerCase().match(/android/) && !androidUrl) || (/iphone|ipad|ipod/.test(ua.toLowerCase()) && !iosUrl)){
			showErrAlert('APP上架中，敬请期待~')
			return false;
		}
	})


	function openclient() {
		var startTime = Date.now();
		// 用户点击时，在动态创建一个iframe，并且让这个iframe去加载config中的Schema
		var ifr = document.createElement('iframe');
		// 端口判断 安卓或IOS
		ifr.src = device.toLowerCase().indexOf('os') > 0 ? appConfig.scheme_IOS : appConfig.scheme_Adr;
		ifr.style.display = 'none';
		if(isIOS9 >= 9){
			 window.location.href = appConfig.scheme_IOS;
			 setTimeout(function(){
				window.location.href = appConfig.download_url_IOS
			 },appConfig.timeout)
		}else{
			document.body.appendChild(ifr);
		}
		var t = setTimeout(function() {
			var endTime = Date.now();
			//指定的时间内没有跳转成功 当前页跳转到apk的下载地址
			if ((endTime - startTime) < (appConfig.timeout + 200)) {
				//判断是安卓 还是IOS
				if (/iphone|ipad|ipod/.test(device.toLowerCase())) {
					window.location.href = appConfig.download_url_IOS;
				}else if (ua.match(/MicroMessenger/i) == 'MicroMessenger') {
					if($(".btn_down").attr('data-yyb')){
						location.href = $(".btn_down").attr('data-yyb');
					}else{
						$('.tipWarp').show();
					}
				}else if(/openharmony/.test(device.toLowerCase())){
					window.location.href = appConfig.download_url_HM;
				} else if (/android/.test(device.toLowerCase())) {
					window.location.href = appConfig.download_url_And;
				}
			} else {
				window.close();
			}
		}, appConfig.timeout);

		window.onblur = function() {
			clearTimeout(t);
		}
	}





  // 安卓下载地址
  $('.app_box a').click(function(e){
    var t = $(this), li = t.closest('li');
    if (li.hasClass('app_android')) {
      if (ua.match(/(iPhone|iPod|iPad);?/i)) {
        alert(langData['siteConfig'][38][5]);//只支持 Android 设备
      }else {
        if (ua.match(/MicroMessenger/i) == 'MicroMessenger') {
            if(t.attr('data-yyb')){
                location.href = t.attr('data-yyb');
            }else{
              $('.tipWarp').show();
            }
        }else {
          location.href = t.attr('data-href');
        }
      }
    }else if (li.hasClass('app_ios')){
      if (!ua.match(/(iPhone|iPod|iPad);?/i)) {
        alert(langData['siteConfig'][38][6]);//只支持 IOS 设备
      }else {
        if (ua.match(/MicroMessenger/i) == 'MicroMessenger') {
		  if(t.attr('data-yyb')){
  			  location.href = t.attr('data-yyb');
  		  }else{
  			$('.tipWarp').show();
  		  }
        }else {
          location.href = t.attr('data-href');
        }
      }
    }

  })




})
