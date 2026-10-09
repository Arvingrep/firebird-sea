$(function(){

	//弹窗公共关闭
	$('.fwMask').click(function(){
		$('.fwMask').hide();
		$('.jzComWrap').css('display','none');
	})
	//取消订单/取消预约
	$('.yuyue_cancel').click(function(){	
		var id = detailID;
		if(id){
			$.dialog.confirm('确定取消订单？', function(){ //确定取消订单？
				$.ajax({
					url: "/include/ajax.php?service=homemaking&action=operOrder&oper=cancel&id="+id,
					type: "GET",
					dataType: "jsonp",
					success: function (data) {
						if(data && data.state == 100){
							$.dialog.alert(data.info);
                   			window.location.reload();
						}else{
							$.dialog.alert(data.info);
						}
					},
					error: function(){
						$.dialog.alert(langData['siteConfig'][20][183]);//网络错误，请稍候重试！
					}
				});
			});
		}
	});

	/***************************  我服务的--服务码 **************************************/
	//我服务的 -- 服务码-- 弹出
	$('.service_code').click(function(){
		$('.fwMask').show();
		$('.fwcodeWrap').css('display','flex')
	})

	//我服务的 --服务码-- 关闭
	$('.fwcodeWrap .close,.fwcodeCon a').click(function(){
		$('.fwMask').hide();
		$('.fwcodeWrap').css('display','none');
	})
	/***************************  我买的--服务码 **************************************/
	//我买的 -- 服务码
	$('.buy_service_code').click(function(){
		$('.buycodeWrap').css('display','flex');
    	$('.fwMask').show();
    	var parcode = $(this).closest('table').attr('data-cardnum');
    	$('.buycodeWrap .fwcodeCon h3').text(parcode);
	});

	//我买的 -- 服务码-- 关闭/我知道了
	$('.buycodeWrap .close,.buycodeWrap .knowA').click(function(){
		$('.fwMask').hide();
		$('.buycodeWrap').css('display','none');
	})

	/***************************  我买的--待服务 -- 预付金 --申请售后 **************************************/


	//待服务 -- 申请售后-- 弹出
	$('.nomoney_back').click(function(){
		$('.fwMask').show();
		$('.saleAfterWrap').css('display','flex');
	})

	//待服务 -- 申请售后-- 关闭/继续服务
	$('.saleAfterWrap .close,.saleAfterWrap .sale_confirm').click(function(){
		$('.fwMask').hide();
		$('.saleAfterWrap').css('display','none');
	})
	//待服务 -- 申请售后-- 取消订单
	$('.saleAfterWrap .sale_cancel').click(function(){
        $.ajax({
            url: '/include/ajax.php?service=homemaking&action=operOrder&oper=cancel&id='+detailID,
            type: 'post',
            dataType: 'json',
            success: function(data){
                if(data && data.state == 100){
                    $.dialog.alert(data.info);
                   	window.location.reload();
                }else{
                    $.dialog.alert(data.info);
                }
            },
            error: function(){
                $.dialog.alert(langData['siteConfig'][6][203]);
            }
        });

	})

	/***************************  我买的--验收完成 **************************************/

	//我买的--验收完成--线下/线下--二维码去移动端验证
	$('.jz_yanshou').click(function(){	
		$('.jzysWrap').css('display','flex');
    	$('.fwMask').show();

	})

	//我买的 -- 验收完成-- 关闭
	$('.jzysWrap .close').click(function(){
		$('.fwMask').hide();
		$('.jzysWrap').css('display','none');
	})

	/***************************  我服务的 -- 确认无效 **************************************/
	//我服务的 -- 确认无效
	$('.confirm_none').click(function(){	
		$('.jznouseWrap').css('display','flex');
    	$('.fwMask').show();
	})

	//我服务的 -- 确认无效--关闭
	$(".jznouseWrap .close").click(function(e){
    	$('.jzComWrap').css('display','none');
    	$('.fwMask').hide();

    })
    //我服务的 -- 确认无效 -- 确认
    $('.jznouseWrap .snousesubmit').click(function () {
        var t = $(this), id = detailID;
        var nouse_tip=$('#nouse_tip').val()//获取订单失败的原因
        if(nouse_tip==''){
            $.dialog.alert(langData['homemaking'][9][48]);
            return false;
        }
        if(id){
            var data = [];
            data.push('id='+id);
            data.push('failnote='+nouse_tip);

            $.ajax({
                url: '/include/ajax.php?service=homemaking&action=operOrder&oper=no',
                data: data.join("&"),
                type: 'post',
                dataType: 'json',
                success: function(data){
                    if(data && data.state == 100){
                        $.dialog.alert('确认成功');
                   		window.location.reload();
                    }else{
                        $.dialog.alert(data.info);
                    }
                },
                error: function(){
                    $.dialog.alert(langData['siteConfig'][6][203]);
                }
            });
        }
        
    })

    /***************************  我服务的 -- 确认服务 **************************************/
    //我服务的 -- 确认服务 -- 有无手续费
    $('.no_pay li').click(function () {
      $(this).toggleClass('active').siblings().removeClass('active')
      if($(this).hasClass("active") ){
          var price_typ=$(this).attr('data-id');
          if(price_typ==1){
            $('.need_pay').show();
            $('.wrhomeCon2').show();
            $('.wrhometip').show();
          }else if(price_typ==0){
            $('.need_pay').hide();
            $('.wrhomeCon2').hide();
            $('.wrhometip').hide();
            
          }
        }


    });
	//我服务的 -- 确认服务 -- 线上/线下 手续费
    $('.need_pay li').click(function () {
      $(this).toggleClass('active').siblings().removeClass('active')
      if($(this).hasClass("active") ){
          var price_typ=$(this).attr('data-id');
          if(price_typ==1){           
            $('.wrhomeCon2 p').text(langData['homemaking'][7][5]+'：');     //线下收费
            $('.wrhometip').text(langData['homemaking'][7][11]);     //请务必确保顾客当面结清所有费用
            $('.baomu_manage_footer p').text(langData['homemaking'][7][10]);      //确认已线下收款

          }else if(price_typ==0){           
            $('.wrhomeCon2 p').text(langData['homemaking'][7][4]+'：');     //线上收费
            $('.wrhometip').text(langData['homemaking'][7][9]);      //提交后请确保顾客当面结清所有费用
            $('.baomu_manage_footer p').text(langData['homemaking'][7][0]);     //确认服务费用

          }
        }


    });
	//我服务的 -- 确认服务
	$(".suerFw").click(function(e){	
		$('.fwWrap').css('display','flex');
    	$('.fwMask').show();
    	var pdid = $(this).closest('table').attr('data-id');
    	$('.sureFwAlert .surefwsubmit').attr('data-id',pdid);
	})
	//我服务的 -- 确认服务 -- 关闭
	$(".sureFwAlert .close").click(function(e){
    	$('.fwWrap').css('display','none');
    	$('.fwMask').hide();

    })
    //我服务的 -- 确认服务 -- 确认
    $(".sureFwAlert .surefwsubmit").click(function(e){
      e.preventDefault();
      var type = $(".no_pay .active").attr('data-id'), online = $(".need_pay .active").attr('data-id'), price = $("#price").val(), servicedesc = $("#demo").val();
      var tid = detailID;
      if(type==1){
        if(price<0 || price==''){
          $.dialog.alert(langData['homemaking'][9][87]);
          return;
        }
      }

      var data =[], t = $(this);
      data.push('id='+tid);
      data.push('servicetype='+type);
      data.push('guarantee='+$("#guarantee").val());
      data.push('online='+online);
      data.push('price='+price);
      data.push('servicedesc='+servicedesc);

      t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");

      $.ajax({
        url: '/include/ajax.php?service=homemaking&action=addservice',
        data: data.join("&"),
        type: "POST",
        dataType: "json",
        success: function (data) {
          if(data && data.state == 100){
            $.dialog.alert(data.info);
            window.location.reload();

          }else{
            $.dialog.alert(data.info);
            t.removeClass("disabled").html(langData['siteConfig'][11][19]);
          }
        },
        error: function(){
          t.removeClass("disabled").html(langData['siteConfig'][11][19]);
        }
      });

    });

    /***************************  我服务的 -- 结单 **************************************/
	//我服务的 -- 结单
	$(".fwjiedan").click(function(){	
		var id = detailID;
		$.dialog.confirm('确定结单吗？',function(){
			$.ajax({
	            url: '/include/ajax.php?service=homemaking&action=addservice',
	            data:{orderid:id,type:'statement'},
	            type: 'post',
	            dataType: 'json',
	            success: function(data){
	                if(data.state == 100){
	                   $.dialog.alert(data.info);
	                   window.location.reload();
	                }else{
	                    $.dialog.alert(data.info);
	                }
	            },
	            error: function(){
	                $.dialog.alert(langData['siteConfig'][6][203]);
	            }
	        });
		})
	})

	//售后维保
	$('.shouhou').click(function(){	
    	$('.repairWrap').css('display','flex');
    	$('.repairMask').show();
    	
    	if($(this).hasClass('fwshouhou')){////我服务的 -- 售后维保
    		$('.repairCon5').addClass('fn-hide');
    	}else{//我买的 -- 售后维保
			$('.repairCon5').removeClass('fn-hide');
    	}

	});

	//售后维保 -- 关闭
    $('.repairWrap .close,.repairMask').click(function(){
    	$('.repairWrap').css('display','none');
    	$('.repairMask').hide();
    })


});
