var refreshTopFunc, refreshTopConfig, refreshSmart, refreshTopModule, refreshTopAction, refreshTopTimer, topNormal, topPlan, refreshTopID = refreshTopAmount = refreshFreeTimes = refreshNormalPrice = memberFreeCount = surplusFreeRefresh = refreshTopPayAmount = 0, check_zjuser = false, zjuser_meal = {};
var topPlanData = [];

$(function () {
    //APP端取消下拉刷新
    toggleDragRefresh('off');
    var p1 = 0,p3 = 0,p4 = 0;

    //$('.infoBox ul li').click(function () {
    $(".infoBox ul").delegate("li","click", function(){
        $(this).toggleClass('active').siblings().removeClass('active');
        var ids = [], type = '';
        $('.infoBox ul li').each(function(){
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


    $('.infoBox .pub_be').click(function () {
        $(this).toggleClass('active');
        var ids = [], boldred = '';
        $('.infoBox .pub_be').each(function(){
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

            //if(type == 'refresh'){//刷新业务
                var smartHtml = [];
                topNormal = rtConfig.topNormal;  //普通置顶
                if(topNormal.length > 0){
					for (var i = 0; i < topNormal.length; i++) {
                        smartHtml.push('<li class="fn-clear" data-type="topping" data-price="'+topNormal[i].price+'" data-id="'+i+'">');
                        smartHtml.push('<div class="day fn-left">'+topNormal[i].day+langData['info'][1][41]+'</div>');
                        smartHtml.push('<span class="con">'+langData['info'][1][44]+topNormal[i].day+langData['info'][1][41]+'</span>');
                        smartHtml.push('<div class="_right fn-right">'+echoCurrency('symbol')+'<em>'+topNormal[i].price+'</em></div>');
                        smartHtml.push('</li>');
                    }
                    // $('.istopList').html(topNormalHtml.join(''));
                }
                smartHtml.push('<h3>'+langData['info'][1][45]+' <span>'+langData['info'][1][46]+'</span></h3>');
            //}else if(type == 'topping'){//置顶
                refreshFreeTimes = rtConfig.refreshFreeTimes;  //可免费刷新次数
                refreshNormalPrice = rtConfig.refreshNormalPrice;  //普通刷新价格
                refreshSmart = rtConfig.refreshSmart;  //智能刷新配置
                if(refreshSmart.length > 0){
                    
                    for (var i = 0; i < refreshSmart.length; i++) {
                        smartHtml.push('<li class="fn-clear" data-type="smartRefresh" data-price="'+refreshSmart[i].price+'" data-id="'+i+'">');
                        smartHtml.push('<i></i>');
                        smartHtml.push('<div class="day fn-left">'+refreshSmart[i].day+langData['info'][1][41]+'</div>');
                        var discount = refreshSmart[i].offer > 0 ? '<em class="zhe">' + refreshSmart[i].discount + '</em>' : '';
                        smartHtml.push('<span class="con">'+langData['info'][1][42]+refreshSmart[i].times+langData['info'][2][68]+discount+'</span>');
                        var oldprice  = Number(refreshSmart[i].price) + Number(refreshSmart[i].offer);
                        smartHtml.push('<div class="_right fn-right"><s>'+echoCurrency('symbol')+oldprice+'</s>'+echoCurrency('symbol')+'<em>'+refreshSmart[i].price+'</em></div>');
                        smartHtml.push('</li>');
                    }
                }
                $('.istopList').html(smartHtml.join(''));
           // }
            toggleDragRefresh('off');

		},

    }
    
    refreshTopFuncSuccess.init('', modelType, templates, id, '', successTitle);

    $('.f_right .fbuy a').bind('click', function(){
        var userid = $.cookie(cookiePre+"login_user");
        if(userid == null || userid == ""){
          window.location.href = masterDomain+'/login.html';
          return false;
        }

        if($("#type").val() == ''){
            alert(langData['info'][1][55]);
            return false;
        }

        var type 	= $("#refreshTopForm input[name='type']").val();
        var module  = $("#refreshTopForm input[name='module']").val();
        var act  	= $("#refreshTopForm input[name='act']").val();
        var aid  	= $("#refreshTopForm input[name='aid']").val();
        var amount  = $("#refreshTopForm input[name='amount']").val();
        var config  = $("#refreshTopForm input[name='config']").val();
        var tourl   = $("#refreshTopForm input[name='tourl']").val();
        var titleblod   = $("#refreshTopForm input[name='titleblod']").val();
        var titlered   = $("#refreshTopForm input[name='titlered']").val();
        $.ajax({
            type: 'POST',
            url: '/include/ajax.php?service=siteConfig&action=refreshTop&type='+type+'&module='+module+'&act='+act+'&aid='+aid+'&amount='+amount+'&titleblod='+titleblod+'&titlered='+titlered+'&config='+config+'&tourl='+tourl,
            dataType: 'json',
            success: function(str){

                info = str.info;
                if(str.state == 100 && str.info != ""){

                    $("#amout").text(info.order_amount);
                    $('.payMask').show();
                    $('.payPop').css('transform','translateY(0)');

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
                        $("#bonusinfo").text('余额不足，');
                        $("#bonusinfo").closest('.pay_item').addClass('disabled_pay')
                    }else{
                        $("#bonusinfo").text('');
                        $("#bonusinfo").closest('.pay_item').removeClass('disabled_pay')
                    }
                    ordernum     = info.ordernum;
                    order_amount = info.order_amount;

                    siteservice = 'siteConfig';
                    ordertype   = 'refreshTop';

                    payCutDown('',info.timeout,info);
                }
            }
        });

    });

});