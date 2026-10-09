var refreshTopFunc, refreshTopConfig, refreshSmart, refreshTopModule, refreshTopAction, refreshTopTimer, topNormal, topPlan, refreshTopID = refreshTopAmount = refreshFreeTimes = refreshNormalPrice = memberFreeCount = surplusFreeRefresh = refreshTopPayAmount = 0, check_zjuser = false, zjuser_meal = {};
var topPlanData = [];
$(function(){

	var p1 = 0,p3 = 0,p4 = 0;
    $(".fabu_choose").delegate("li","click", function(){
    	$('.fabu_choose ul li').removeClass('active');
        $(this).toggleClass('active');
        var ids = [], type = '';
        $('.fabu_choose ul li').each(function(){
            if($(this).hasClass('active')){
                type   = $(this).data('type');
                var config = $(this).data('id');
                
                $("#config").val(config);
                ids.push($(this).data('price'));
            }
        })
        $('#toptag').val(ids.join());
        $("#type").val(type);
        if(!$('#toptag').val()){
            p1 =0
        }else {
            p1 = $('#toptag').val();
        }
        getPrice();
    });


    $('.choose3 li').click(function () {
        $(this).toggleClass('active');
        var ids = [], boldred = '';
        $('.choose3 li').each(function(){
            if($(this).hasClass('active')){
                var type   = $(this).data('type');
                var id     = $(this).data('id');
                if(type == 'titleblod'){
                    $("#titleblod").val(id);
                }else if(type == 'titlered'){
                    $("#titlered").val(id);
                }
                boldred = 'boldred';
                ids.push($(this).data('price'));
            }else{
                var type   = $(this).data('type');
                if(type == 'titleblod'){
                    $("#titleblod").val('');
                }else if(type == 'titlered'){
                    $("#titlered").val('');
                }
            }
        })
        $('#tag').val(ids.join(","));
        if($(".istopList .active").length == 0){
            $("#type").val(boldred);
        }

        p3 = ids[0];
        if(!ids[0]){
            p3 = 0;
            p4 = 0;
        }
        if(ids[1]){
            p4 = ids[1];
        }else {
            p4 = 0;
        }
        getPrice();
    });
	function getPrice() {
        var price = parseFloat(p1)+parseFloat(p3)+parseFloat(p4);
        var pp = price.toFixed(2)
        $('#all_price').html(pp);
        $("#amount").val(pp);
    }

    var refreshTopFuncSuccess = {

		//初始加载
		// type: refresh、top
		// mod: 系统模块
		// act: 类目
		// aid: 信息ID
		// btn: 触发元素  非必传
		init: function(type, mod, act, aid, btn, title){

			if(!mod || !act || !aid) return false;
			btn ? btn.addClass('load') : null;  //给触发元素增加load样式

			//初始加载配置信息，包括会员相关信息
			$.ajax({
				type: "POST",
				url: "/include/ajax.php",
				dataType: "json",
				data: {
					'service': 'siteConfig',
					'action': 'refreshTopConfig',
					'module': mod,
					'act': act
				},
				success: function(data) {
					if(data && data.state == 100){
						refreshTopConfig = data.info;
						refreshTopFuncSuccess.show(type, title);
					}else{
						alert(data.info);
					}
					btn ? btn.removeClass('load') : null;
				},
				error: function(){
					alert(langData['siteConfig'][20][227]);//网络错误，加载失败！
					btn ? btn.removeClass('load') : null;
				}
            });
            	
		},

		//显示业务窗口，以及填充初始数据
		show: function(type, title){
            var that_ = this;
            var rtConfig = refreshTopConfig.config;console.log(rtConfig);
            var smartHtml = [];
            topNormal = rtConfig.topNormal;  //普通置顶
            if(topNormal.length > 0){
            	//置顶我的信息 -- 强效提高曝光率！
            	smartHtml.push('<h2 class="adv_tip">'+langData['sfcar'][2][27]+'<span>'+langData['sfcar'][2][28]+'</span></h2>');
            	smartHtml.push('<ul>')
				for (var i = 0; i < topNormal.length; i++) {
                    smartHtml.push('<li class="fn-clear" data-type="topping" data-price="'+topNormal[i].price+'" data-id="'+i+'">');
                    smartHtml.push('<div class="con">');
                    smartHtml.push('<span class="span_day">'+topNormal[i].day+langData['siteConfig'][13][6]+'</span>');//天
                    smartHtml.push('<span class="top_day">'+langData['siteConfig'][32][38]+topNormal[i].day+langData['siteConfig'][13][6]);//立即置顶--天 --
                    if(topNormal[i].offer > 0){
                    	smartHtml.push('<span class="discount">'+topNormal[i].discount+'</span>');//折
                    }
                    smartHtml.push('</span>');
                    if(topNormal[i].offer>0){
                    	var oldprice  = Number(topNormal[i].price) + Number(topNormal[i].offer);
                    	smartHtml.push('<p class="top_price"><del>'+echoCurrency('symbol')+oldprice+'</del>'+echoCurrency('symbol')+topNormal[i].price+'</p>');
                    }else{
                    	smartHtml.push('<p class="top_price">'+echoCurrency('symbol')+topNormal[i].price+'</p>');
                    }
                    smartHtml.push('</div>');
                    smartHtml.push('</li>');
                }
                smartHtml.push('</ul>')
            }
           
            refreshFreeTimes = rtConfig.refreshFreeTimes;  //可免费刷新次数
            refreshNormalPrice = rtConfig.refreshNormalPrice;  //普通刷新价格
            refreshSmart = rtConfig.refreshSmart;  //智能刷新配置

            if(refreshSmart.length > 0){
            	//智能刷新信息 -- 稳定曝光率！
                smartHtml.push('<h2 class="adv_tip">'+langData['sfcar'][2][30]+' <span>'+langData['sfcar'][2][31]+'</span></h2>');
                smartHtml.push('<ul>')
                for (var i = 0; i < refreshSmart.length; i++) {
                    smartHtml.push('<li class="fn-clear" data-type="smartRefresh" data-price="'+refreshSmart[i].price+'" data-id="'+i+'">');
                    smartHtml.push('<div class="con">');
                    smartHtml.push('<span class="span_day">'+refreshSmart[i].day+langData['siteConfig'][13][6]+'</span>');//天
                    smartHtml.push('<span class="top_day">'+langData['siteConfig'][32][28]+refreshSmart[i].times+langData['siteConfig'][13][26]);//智能刷新--次 --
                    if(refreshSmart[i].offer > 0){
                    	smartHtml.push('<span class="discount">'+refreshSmart[i].discount+'</span>');//折
                    }
                    smartHtml.push('</span>');
                    if(refreshSmart[i].offer>0){
                    	var oldprice  = Number(refreshSmart[i].price) + Number(refreshSmart[i].offer);
                    	smartHtml.push('<p class="top_price"><del>'+echoCurrency('symbol')+oldprice+'</del>'+echoCurrency('symbol')+refreshSmart[i].price+'</p>');
                    }else{
                    	smartHtml.push('<p class="top_price">'+echoCurrency('symbol')+refreshSmart[i].price+'</p>');
                    }
                    smartHtml.push('</div>');
                    smartHtml.push('</li>');
                }
                smartHtml.push('</ul>')
            }
            $('.istopList').html(smartHtml.join(''));
		},

    }
    
    refreshTopFuncSuccess.init('', modelType, templates, id, '', successTitle);

    $('.pay_wrap .buy a').bind('click', function(){
        var userid = $.cookie(cookiePre+"login_user");
        if(userid == null || userid == ""){
          window.location.href = masterDomain+'/login.html';
          return false;
        }

        if($("#type").val() == ''){
            alert(langData['info'][1][55]);//请选择项目
            return false;
        }

        // $('#refreshTopForm').submit();
        var t = $(this);
        if(t.hasClass('disabled')) return;
        if(t.attr('href').indexOf('javascript') == 0){
            // $('#refreshTopForm').submit();
            var type    = $("#refreshTopForm input[name='type']").val();
            var module  = $("#refreshTopForm input[name='module']").val();
            var act     = $("#refreshTopForm input[name='act']").val();
            var aid     = $("#refreshTopForm input[name='aid']").val();
            var amount  = $("#refreshTopForm input[name='amount']").val();
            var config  = $("#refreshTopForm input[name='config']").val();
            var tourl   = $("#refreshTopForm input[name='tourl']").val();
            $.ajax({
                type: 'POST',
                url: '/include/ajax.php?service=siteConfig&action=refreshTop&type='+type+'&module='+module+'&act='+act+'&aid='+aid+'&amount='+amount+'&config='+config+'&tourl='+tourl,
                dataType: 'json',
                success: function(str){

                    info = str.info;
                        if (typeof (str.info) == 'object') {
                            
                        cutDown = setInterval(function () {
                            $(".payCutDown").html(payCutDown(info.timeout));
                        },1000)

                        var datainfo = [];
                        for(var k in info) {
                            datainfo.push(k+'='+info[k]);
                        }
                        $("#amout").text(info.order_amount);
                        $('.payMask').show();
                        $('.payPop').show();

                        // if(usermoney*1 < info.order_amount *1){
                        //
                        //     $("#moneyinfo").text('余额不足，');
                        // }
                            if (usermoney * 1 < info.order_amount * 1) {

                                $("#moneyinfo").text('余额不足，');
                                $("#moneyinfo").closest('.pay_item').addClass('disabled_pay')
                            }else{
                                $("#moneyinfo").text('可用');
                                $("#moneyinfo").closest('.pay_item').removeClass('disabled_pay')
                            }
                            if(monBonus * 1 < info.order_amount * 1  &&  bonus * 1 >= info.order_amount * 1){
                                $("#bonusinfo").text('额度不足，可用');
                                $("#bonusinfo").closest('.pay_item').addClass('disabled_pay')
                            }else if( bonus * 1 < info.order_amount * 1){
                                $("#bonusinfo").text('余额不足，可用');
                                $("#bonusinfo").closest('.pay_item').addClass('disabled_pay')
                            }else{
                                $("#bonusinfo").text('可用');
                                $("#bonusinfo").closest('.pay_item').removeClass('disabled_pay')
                            }


                        ordernum     = info.ordernum;
                        order_amount = info.order_amount;
                        $("#ordertype").val('refreshTop');
                        $("#service").val('siteConfig');
                        var src = masterDomain + '/include/qrPay.php?' + datainfo.join('&');
                        $('#payQr img').attr('src', masterDomain + '/include/qrcode.php?data=' + encodeURIComponent(src));

                    }else {
                            $('.rtClose').click();
                            alert(str.info);

                        }
                }
            });
        }

    });

	
})