


new Vue({
	el: "#page",
	data: {
	
		changeLang:0,
	},
	mounted() {
		mobiscroll.settings = {
			theme: 'ios',
			themeVariant: 'light',
			height:40,
			lang:'zh',
			
			headerText:true,
			calendarText:langData['waimai'][10][71],  //时间区间选择
		};
		var instance = mobiscroll.select('.langinp', {
			data:langList,
			dataText:'name',
			dataValue:'code',
			onSet: function (event, inst) {
				var lang = inst._wheelArray[0];
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

			},
		});
		if(typeid){
			instance.setVal(typeid,true);
			// instance.select(typeid)
		}

		//退出
		  $(".logout").bind('click', function(e){
		  	e.preventDefault();
		  	$(this).html(langData['siteConfig'][45][54]);  //退出中
		    $('body').append('<iframe src="'+masterDomain+'/logout.html?from=app" style="display: none;"></iframe>');
		    setTimeout(function(){
		        setupWebViewJavascriptBridge(function(bridge) {
		          bridge.callHandler('appLogout', {}, function(){});
		          bridge.callHandler("goBack", {}, function(responseData){});
		          bridge.callHandler('pageReload',	{},	function(responseData){});
				});
		    }, 1500);
		    setTimeout(function(){
		    	location.href = '/wmsj';
		    }, 2000);
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

	});

	}
	




});


$(function(){

    
    //注销账号弹出
    $('.logOff').click(function(){
        $('.off-mask').show();
        $('.offWrap').animate({'bottom':'0'},200)

        toggleDragRefresh('off');
    })

    //注销账号关闭
    $('.off-mask,.off-close').click(function(){
        $('.off-mask').hide();
        $('.offWrap').animate({'bottom':'-100%'},200)

        toggleDragRefresh('on');
    })

    //同意注销
    $('.off-agree').delegate("a", "click", function(){
        var t = $(this);
        if(t.hasClass('disabled')) return false;

        $('.delMask').addClass('show');
        $('.delAlert').show();

    });
    //确认删除
    $('.sureDel').click(function(e){
        var t = $('.off-agree a'), txt = t.text();
        $('.delMask').removeClass('show');
        $('.delAlert').hide();
        t.addClass("disabled").html('申请中...');//退出中
        $.ajax({
            url: "/include/ajax.php?service=member&action=canceLlation",
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
                if(data && data.state == 100){
                    //注销成功
                    t.addClass("disabled").html('申请成功');//注销成功
                    var device = navigator.userAgent;
                    if(device.indexOf('huoniao') > -1){
                        if(device.toLowerCase().indexOf('android') > -1){
                            $('body').append('<iframe src="'+masterDomain+'/logout.html?from=app" style="display: none;"></iframe>');
                        }
                        setTimeout(function(){
                            $.cookie(cookiePre+'login_user', null, {expires: -10, domain: channelDomain, path: '/'});
                            setupWebViewJavascriptBridge(function(bridge) {
                            bridge.callHandler('appLogout', {}, function(){});
                            bridge.callHandler("goBack", {}, function(responseData){});
                            bridge.callHandler('pageReload',	{},	function(responseData){});
                            });
                        },1000)

                    }else{
                        window.location.href="/logout.html"
                    }

                }else{
                    alert(data.info);
                    t.removeClass("disabled").html(txt);
                }
            },
            error: function(){
                alert(langData['siteConfig'][20][227]);//网络错误，加载失败！
                t.removeClass("disabled").html(txt);
            }
        });
    })

    //关闭删除
    $('.cancelDel,.delMask').click(function(){
        $('.delMask').removeClass('show');
        $('.delAlert').hide();
    })

})
