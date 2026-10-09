/**
 * 会员中心家政订单详情
 * by zmy at: 20210311
 */

var objId = $(".container");
$(function(){

	//发布抢单
	objId.delegate('.fabuQiang','click',function(){
        var id=$(this).attr('data-id');
        $.ajax({
            url: '/include/ajax.php?service=homemaking&action=operOrder',
            data:{grabid:id},
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

	//结单
    objId.delegate('.statement','click',function(){
        var id=$(this).attr('data-id');
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

	//确认有效
	objId.delegate(".sureOk", "click", function(){
		var t = $(this), id = t.attr("data-id");
		if(id){
			$.dialog.confirm('确认订单有效吗？', function(){
				$.ajax({
					url: "/include/ajax.php?service=homemaking&action=operOrder&oper=yes&id="+id,
					type: "GET",
					dataType: "jsonp",
					success: function (data) {
						if(data && data.state == 100){
							$.dialog.alert('确认成功');
							window.location.reload();
						}else{
							$.dialog.alert(data.info);
						}
					},
					error: function(){
						$.dialog.alert(langData['siteConfig'][20][183]);
					}
				});
			});
		}
	});

	//确认无效
	objId.delegate(".sureNo", "click", function(){
		$('.jznouseWrap').css('display','flex');
    	$('.fwMask').show();
    	var pdid = $(this).attr('data-id');
    	$('.jznouseWrap .snousesubmit').attr('data-id',pdid);
	});
	

	//无效--关闭
	$(".jznouseWrap .close").click(function(e){
    	$('.jzComWrap').css('display','none');
    	$('.fwMask').hide();

    })
    //无效 -- 确认
    $('.jznouseWrap .snousesubmit').click(function () {
        var t = $(this), id = t.attr("data-id");
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
                        t.html('确认成功');
                        $('#nouse_tip').val('');
                        $(".jznouseWrap .close").click();                       
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


	
	 //手续费
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
    //确认服务
    objId.delegate('.sureFw','click',function(){
    	$('.fwWrap').css('display','flex');
    	$('.fwMask').show();
    	var pdid = $(this).attr('data-id');
    	$('.sureFwAlert .surefwsubmit').attr('data-id',pdid);
    })
    $(".sureFwAlert .close").click(function(e){
    	$('.fwWrap').css('display','none');
    	$('.fwMask').hide();

    })
    //公共--弹窗关闭
    $('.fwMask').click(function(){
		$('.jzComWrap').css('display','none');
    	$('.fwMask').hide();
    })
    //确认服务
    $(".sureFwAlert .surefwsubmit").click(function(e){
      e.preventDefault();
      var type = $(".no_pay .active").attr('data-id'), online = $(".need_pay .active").attr('data-id'), price = $("#price").val(), servicedesc = $("#demo").val();
      var tid = $(this).attr('data-id');
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
            $('.fwWrap').css('display','none');
    		$('.fwMask').hide();
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
    //售后
    objId.delegate('.sale_treat','click',function(){
    	$('.repairWrap').css('display','flex');
    	$('.repairMask').show();
    })
    //关闭售后
    $('.repairMask,.repairAlert .close').click(function(){
    	$('.repairWrap').css('display','none');
    	$('.repairMask').hide();
    })
    //派单--弹出
    objId.delegate('.paidan','click',function(){
    	$('.jzpdWrap').css('display','flex');
    	$('.fwMask').show();
    	$('.jzpdAlert .fwPeoList li').removeClass('active');
    	var pdid = $(this).attr('data-id');
    	$('.jzpdWrap .surepdsubmit').attr('data-id',pdid);
    })
    //改派 -- 弹出
    objId.delegate('.changepaidan','click',function(){
    	$('.jzpdWrap').css('display','flex');
    	$('.fwMask').show();
    	$('.jzpdAlert .fwPeoList li').removeClass('active');
    	var pdid = $(this).attr('data-id'),cdid = $(this).attr('data-cid');
    	$('.jzpdWrap .surepdsubmit').attr('data-id',pdid);
    	$('#jzcourier').val(cdid);
    	$('.jzpdAlert .fwPeoList li a[data-id="'+cdid+'"]').closest('li').addClass('active');
    })
    //派单--关闭
    $('.jzpdWrap .close').click(function(){
    	$('.jzpdWrap').css('display','none');
    	$('.fwMask').hide();
    })


    //更多服务人员
    var orderpage = 1;
    var objFw = $('.fwPeoList ul');
    $('.fwPeoList .fwMore').click(function(){
    	orderpage++;
    	getpeoList();
    })
    getpeoList()
    //服务人员列表  
    function getpeoList(item) {
    	if(item){
    		orderpage =1;
    		objFw.html('');
    	}

        objFw.append('<p class="loading">'+langData['siteConfig'][20][184]+'...</p>');

        $.ajax({
            url: "/include/ajax.php?service=homemaking&action=personalList&u=1&orderby=2&page="+orderpage+"&pageSize=10",
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
              if(data && data.state != 200){
                if(data.state == 101){
                	$('.fwPeoList .fwMore').hide();
                  	objFw.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
                }else{
                   	var list = data.info.list, pageinfo = data.info.pageInfo, html = [];
                  
                  	//拼接列表
                  	if(list.length > 0){
        
	                    var t = window.location.href.indexOf(".html") > -1 ? "?" : "&";
	                    var param = t + "id=";
	                    //var urlString = editUrl + param;
	        
	                    for(var i = 0; i < list.length; i++){
	                      var item           = [],
	                          id             = list[i].id,
	                          photo          = list[i].photo,
	                          username       = list[i].username,
	                          tel            = list[i].tel,
	                          onlineorder    = list[i].onlineorder,
	                          endorder       = list[i].endorder,
	                          photo          = list[i].photo;	        

	                        html.push('<li class="fn-clear"><a href="javascript:;" data-id="'+id+'">');
	                        if(photo!=''){
	                            html.push('<div class="jzpd_left"><img src="'+photo+'" alt=""></div>');
	                        }
	                        html.push('<div class="jzpd_right">');
	                        html.push('<h3>'+username+'</h3>');
	                        html.push('<p>服务中：'+onlineorder+'<span>'+langData['homemaking'][9][5]+'：'+endorder+'</span></p>');//服务中--结单
	                        html.push('<h5>'+tel+'</h5>');
	                        html.push('</div>');
	                        html.push('<s></s>');
	                        html.push('</a></li>');
	                
	                    }
        				$('.fwPeoList .fwMore').show();
	                    objFw.append(html.join(""));
	                    $('.fwPeoList .loading').remove();

	                    if(orderpage >= pageinfo.totalPage){
	                        $('.fwPeoList .fwMore').hide();
	                        objFw.append('<p class="loading">'+langData['homemaking'][8][65]+'</p>');
	                    }
        
                  	}else{
                  		$('.fwPeoList .fwMore').hide();
                    	$('.fwPeoList .loading').remove();
                    	objFw.append("<p class='loading'>"+langData['siteConfig'][20][185]+"</p>");
                  	}
                }
              }else{
              	$('.fwPeoList .fwMore').hide();
                objFw.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
              }
            }
        });
    }
    //派单--选择
    $('.jzpdAlert .fwPeoList').delegate('li','click',function(){
    	$(this).toggleClass('active').siblings('li').removeClass('active');
    })
    //确认派单--确定
    $(".jzpdAlert .surepdsubmit").click(function(){
        var orderid = $(".jzpdAlert .surepdsubmit").attr('data-id'), courier = $('.jzpdAlert li.active a').attr('data-id');
        if($(this).hasClass('disabled')) return false;
        
        if(orderid && courier){
        	$(this).addClass('disabled');
        	$(this).find('a').html('派单中...');
            var data = [];
            data.push('id='+orderid);
            data.push('courier='+courier);
            $.ajax({
                url: '/include/ajax.php?service=homemaking&action=operOrder&oper=dispatch',
                data: data.join("&"),
                type: 'post',
                dataType: 'json',
                success: function(data){
                    if(data && data.state == 100){
                    	$('.jzpdWrap').css('display','none');
                        getpeoList(1);
                        getList(1)
                        $('.jzpdAlert .surepdsubmit').removeClass('disabled');
       					$('.jzpdAlert .surepdsubmit').find('a').html('确定派单');
                    }else{
                        alert(data.info);
                        $('.jzpdAlert .surepdsubmit').removeClass('disabled');
       					$('.jzpdAlert .surepdsubmit').find('a').html('确定派单');
                    }
                },
                error: function(){
                    alert(langData['siteConfig'][6][203]);
                    $('.jzpdAlert .surepdsubmit').removeClass('disabled');
       				$('.jzpdAlert .surepdsubmit').find('a').html('确定派单');
                }
            });
        }else{
        	alert('请选择服务人员');
        	return false;
        }
    })

    //服务码 -- 弹出
    objId.delegate('.fwCode','click',function(){
    	$('.fwcodeWrap').css('display','flex');
    	$('.fwMask').show();
    	var pdid = $(this).attr('data-id');
    	$('.fwcodeWrap .scodesubmit').attr('data-id',pdid);
    })

    //服务码 -- 关闭
    $('.fwcodeWrap .close').click(function(){
    	$('.fwcodeWrap').css('display','none');
    	$('.fwMask').hide();
    })
    //服务码 -- 确认
    $('.fwcodeWrap .scodesubmit').click(function () {
        var t = $(this), cardnum = $("#confim_sure").val();
        if(t.hasClass('disabled')) return;
        if(cardnum==''){
            alert(langData['homemaking'][9][77]);
            return;
        }
        t.addClass('disabled').find('a').html('验证中...');
        var data = [];
        data.push('cardnum='+cardnum);
        $.ajax({
            url: '/include/ajax.php?service=homemaking&action=useCode',
            data: data.join("&"),
            type: 'post',
            dataType: 'json',
            success: function(data){
                if(data && data.state == 100){
                    t.find('a').html('验证成功');
                    setTimeout(function(){
                        $("#confim_sure").val('');
                        $('.fwcodeWrap .close').click();
                        t.removeClass('disabled');
                        window.location.reload();
                    }, 1000);
                }else{
                    $.dialog.alert(data.info);
                    t.removeClass('disabled').find('a').html('验证服务码');
                }
            },
            error: function(){
                $.dialog.alert(langData['siteConfig'][6][203]);
                t.removeClass('disabled').find('a').html('验证服务码');
            }
        });
    })

    $('#sureNote').click(function(){
      var orderid = $(this).attr('data-orderid');
      var businessbz = $("#businessbz").val();

      $.ajax({
        url : '/include/ajax.php?service=homemaking&action=operOrder&oper=businessbz&orderid='+orderid+'&businessbz='+businessbz,
        type : 'post',
        datatype : 'json',
        success : function(result){
          var data = JSON.parse(result);
           if (data.state==100) {
            $.dialog.alert(data.info);
            setTimeout(function(){window.location.reload()},1000)
            

           }else{

            $.dialog.alert(data.info);

           }
        },
        error : function(){

          $.dialog.alert(langData['siteConfig'][6][203]);

        }
      });

    })


});


