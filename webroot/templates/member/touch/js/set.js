$(function(){
	var device = navigator.userAgent;

	//切换语言
	$("#language").change(function(){
		var lang = $(this).val();

		var channelDomainClean = typeof masterDomain != 'undefined' ? masterDomain.replace("http://", "").replace("https://", "") : window.location.host;
		var channelDomain_1 = channelDomainClean.split('.');
		var channelDomain_1_ = channelDomainClean.replace(channelDomain_1[0]+".", "");

		channelDomain_ = channelDomainClean.split("/")[0];
		channelDomain_1_ = channelDomain_1_.split("/")[0];

		$.cookie(cookiePre + 'lang', lang, {expires: 7, domain: channelDomainClean, path: '/'});
		$.cookie(cookiePre + 'lang', lang, {expires: 7, domain: channelDomain_, path: '/'});
		$.cookie(cookiePre + 'lang', lang, {expires: 7, domain: channelDomain_1_, path: '/'});

		if(device.indexOf('huoniao') > -1){
			//客户端页面重载
			setupWebViewJavascriptBridge(function(bridge) {
				bridge.callHandler('changeLanguage', {'region': lang},	function(responseData){});
			});
		}else{
			location.href = referer;
		}

	});

	setupWebViewJavascriptBridge(function(bridge) {

		//获取APP推送状态
		bridge.callHandler(
			'getAppPushStatus',
			{},
			function(responseData){
				if(responseData == "on"){
					$("#pushStatus").addClass('open')
				}
			}
		);

		//开启、关闭消息推送
		$("#pushStatus").bind("click", function(event){
			event.preventDefault();

			var t = $(this);

			if(t.hasClass('open')){
				//关闭推送
			    bridge.callHandler(
			        'setAppPushStatus',
			        {"pushStatus": "off"},
			        function(responseData){
			            t.toggleClass('open');
			        }
			    );
			}else{
				//开启推送
			    bridge.callHandler(
			        'setAppPushStatus',
			        {"pushStatus": "on"},
			        function(responseData){
			            t.toggleClass('open');
			        }
			    );

			}
		});


		//获取APP缓存大小
	    bridge.callHandler(
	        'updateCacheSize',
	        {},
	        function(responseData){
	            $("#cache").html(responseData+'<span></span>');
	        }
	    );

		$('.clear').click(function(){
			//清除APP缓存大小
		    bridge.callHandler(
		        'cleanCache',
		        {},
		        function(responseData){
					$('.succes').show();
					setTimeout(function(){$('.succes').hide()}, 1000);
					$("#cache").html("0 B"+"<span></span>");
		        }
		    );
		});



	});

	function getQueryVariable(variable)
	{
	   var query = window.location.search.substring(1);
	   var vars = query.split("&");
	   for (var i=0;i<vars.length;i++) {
	           var pair = vars[i].split("=");
	           if(pair[0] == variable){return pair[1];}
	   }
	   return(false);
	}
	//退出
	$('.logout').bind("click", function(){
        $(this).html(langData['siteConfig'][45][54]);//退出中
		var channelDomainClean = typeof masterDomain != 'undefined' ? masterDomain.replace("http://", "").replace("https://", "") : window.location.host;
		var channelDomain_1 = channelDomainClean.split('.');
		var channelDomain_1_ = channelDomainClean.replace(channelDomain_1[0]+".", "");

		channelDomain_ = channelDomainClean.split("/")[0];
		channelDomain_1_ = channelDomain_1_.split("/")[0];

		$.cookie(cookiePre + 'login_user', null, {expires: 7, domain: channelDomainClean, path: '/'});
		$.cookie(cookiePre + 'login_user', null, {expires: 7, domain: channelDomain_, path: '/'});
		$.cookie(cookiePre + 'login_user', null, {expires: 7, domain: channelDomain_1_, path: '/'});
		
		var device = navigator.userAgent;

		if(device.indexOf('huoniao') > -1){
          	if(device.indexOf('android') > -1){
            	$('body').append('<iframe src="'+masterDomain+'/logout.html?from=app" style="display: none;"></iframe>');
            }
            setTimeout(function(){
                setupWebViewJavascriptBridge(function(bridge) {
                  bridge.callHandler('appLogout', {}, function(){});
                  bridge.callHandler("goBack", {}, function(responseData){});
                  bridge.callHandler('pageReload',	{},	function(responseData){});
				});
            }, 1000);
		}else{
			let isBytemini = device.toLowerCase().includes("toutiaomicroapp");
			if(device.indexOf('miniProgram') > -1){
				if(getQueryVariable('link')){
					wx.miniProgram.reLaunch({url: '/pages/redirect/index?delUser=1&url=' + memberDomain +'/'+ getQueryVariable('link')});
				}else{
					wx.miniProgram.reLaunch({url: '/pages/redirect/index?delUser=1&url=' + encodeURIComponent(memberDomain + (moduleName == 'job' ? '/index_job.html?appFullScreen=1' : '')) });
				}
			}else if(isBytemini){ //抖音
				if(getQueryVariable('link')){
					tt.miniProgram.reLaunch({url: '/pages/redirect/index?delUser=1&url=' + memberDomain +'/'+ getQueryVariable('link')});
				}else{
					tt.miniProgram.reLaunch({url: '/pages/redirect/index?delUser=1&url=' + encodeURIComponent(memberDomain + (moduleName == 'job' ? '/index_job.html?appFullScreen=1' : '')) });
				}
			}else{
            	location.href = masterDomain+'/logout.html' + (moduleName == 'job' ? '?url=' + encodeURIComponent(memberDomain + '/index_job.html?appFullScreen=1') : '');
			}
        }
	});

	var device = navigator.userAgent;
	if(device.indexOf('huoniao') > -1){
		$('.logout').attr('href', 'javascript:;');
	}else{
      	$('.logout').attr('href', masterDomain + '/logout.html' + (moduleName == 'job' ? '?url=' + encodeURIComponent(memberDomain + '/index_job.html?appFullScreen=1') : ''));
    }

    //关闭个性化推荐

    if(!utils.getStorage("huoniao_android_recStatus") || utils.getStorage("huoniao_android_recStatus") == 1){
        $("#recStatus").addClass('open');
    }

    $("#recStatus").bind("click", function(event){
        event.preventDefault();

        var t = $(this);

        if(t.hasClass('open')){

            utils.setStorage("huoniao_android_recStatus", 2);
            t.toggleClass('open');
            
        }else{

            utils.setStorage("huoniao_android_recStatus", 1);
            t.toggleClass('open');

        }
    });


})
