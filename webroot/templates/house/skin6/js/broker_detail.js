$(function(){


	var typeid = $(".ul-nav").find('.curr').attr("data-id"); //排序
	$(".mobile_kf #qrcode").qrcode({
		render: window.applicationCache ? "canvas" : "table",
		width: 74,
		height: 74,
		text: huoniao.toUtf8(window.location.href)
	});

	// 微信悬浮层弹出
	$('.crumbottom .l').delegate('a', 'click', function() {
		var t = $(this),cla = t.attr('class');
		$('html').addClass('nos');
        $('.modalbox').addClass('curr');
		if(cla == 'piTel'){
			$('.ptext').html("微信扫二维码，即刻拨打电话");
		}else if(cla == 'piWx'){
			$('.ptext').html("扫二维码，加微信好友");
		}else{
			$('.ptext').html("扫二维码，加QQ好友");
		}
	});
     // 关闭
    $(".modal-bg,.closebox").on("click",function(){
        $("html, .modalbox").removeClass('curr nos');
    })

	// 房源委托
	$(".btnWt").bind("click", function(){
		$(".modal-wt").addClass("popup").fadeIn();
		$(".popup_bg").show();
		return false;
	});
	$("body").delegate(".close", "click", function(){
		$(this).parent().hide();
		$(".popup_bg").hide();
	});

	//验证提示弹出层
	function showMsg(msg){
	  $('.modal-wt .dc').append('<p class="ptip">'+msg+'</p>')
	  setTimeout(function(){
		$('.ptip').remove();
	  },2000);
	}

	// 单选框
	var sexval='';
	$("body").delegate(".sexbox input[type='radio']", "click", function(){
		var t = $(this);
		if(this.checked){
	        sexval= t.val();
	    }
	});

	$('.tab_wt').delegate('li', 'click', function(event) {
		var t = $(this),val = t.attr("data-val");
		if(!t.hasClass('curr')){
			t.addClass('curr').siblings('li').removeClass('curr');
		}
		if(val == "0"){
			$('.zbj').show();
			$('.sbj').hide();
			$('.mprice').hide();
			$('.zrprice').hide();
		}else if(val == "1"){
			$('.sbj').show();
			$('.zbj').hide();
			$('.mprice').hide();
			$('.zrprice').hide();
		}else{
			$('.zbj').hide();
			$('.sbj').hide();
			$('.mprice').show();
			$('.zrprice').show();
		}
	});
	//国际手机号获取
  getNationalPhone();
  function getNationalPhone(){
    $.ajax({
            url: "/include/ajax.php?service=siteConfig&action=internationalPhoneSection",
            type: 'get',
            dataType: 'JSONP',
            success: function(data){
                if(data && data.state == 100){
                   var phoneList = [], list = data.info;
                   for(var i=0; i<list.length; i++){
                        phoneList.push('<li data-cn="'+list[i].name+'" data-code="'+list[i].code+'">'+list[i].name+' +'+list[i].code+'</li>');
                        //初始areacode
                        var firstCode = list[0].code;
                        $('#areaCode').val(firstCode);
                        $('.areaCode i').text('+'+firstCode);
                   }
                   $('.areaCode_wrap ul').append(phoneList.join(''));
                }else{
                   $('.areaCode_wrap ul').html('<div class="loading">暂无数据！</div>');
                  }
            },
            error: function(){
                $('.areaCode_wrap ul').html('<div class="loading">加载失败！</div>');
            }

        })

  }

  //显示区号
  $('.areaCode').bind('click', function(e){
    e.stopPropagation();
    var areaWrap =$(this).closest(".par_li").find('.areaCode_wrap');
    if(areaWrap.is(':visible')){
      areaWrap.fadeOut(300)
    }else{
      areaWrap.fadeIn(300);
      return false;
    }
  });

  //选择区号
  $('.areaCode_wrap').delegate('li', 'click', function(){
    var t = $(this), code = t.attr('data-code');
    var par = t.closest(".par_li");
    var areaIcode = par.find(".areaCode");
    areaIcode.find('i').html('+' + code);
    $("#areaCode").val(code);
  });

  $('body').bind('click', function(){
    $('.areaCode_wrap').fadeOut(300);
  });


	$("body").delegate("#tj", "click", function(){
		var t = $(this), obj = t.closest(".modal-wt");

		if(t.hasClass("disabled")) return false;

		var addr = obj.find("#addr");
		var doorcard = obj.find("#doorcard");
		var area = obj.find("#area");

		var price = obj.find("#price");
		var sprice = obj.find("#sprice");
		var mprice = obj.find("#mprice");
		var zprice = obj.find("#zprice");

		var name = obj.find("#name");
		var phone = obj.find("#telphone");
		var vercode = obj.find("#vercode");

		var errMsg = '';

		if(addr.val() == "" || addr.val() == addr.attr('placeholder')){
			errMsg = "请输入地址";
			showMsg(errMsg);
			return false;
		}else if(doorcard.val() == "" || doorcard.val() == doorcard.attr('placeholder')){
			errMsg = "请输入门牌";
			showMsg(errMsg);
			return false;
		}else if(area.val() == "" || area.val() == area.attr('placeholder')){
			errMsg = "请输入房产证上的面积";
			showMsg(errMsg);
			return false;
		}else{
			if($('.tab_wt li:first-child').hasClass('curr')){
				if(price.val() == "" || price.val() == price.attr('placeholder')){
					errMsg = "请输入您的报价";
					showMsg(errMsg);
					return false;
				}
			}else if($('.tab_wt li:nth-child(2)').hasClass('curr')){
				if(sprice.val() == "" || sprice.val() == sprice.attr('placeholder')){
					errMsg = "请输入您的报价";
					showMsg(errMsg);
					return false;
				}
			}else if($('.tab_wt li:nth-child(3)').hasClass('curr')){
				if(mprice.val() == "" || mprice.val() == mprice.attr('placeholder')){
					errMsg = "请输入您的月租金";
					showMsg(errMsg);
					return false;
				}else if(zprice.val() == "" || zprice.val() == zprice.attr('placeholder')){
					errMsg = "请输入您的转让费";
					showMsg(errMsg);
					return false;
				}
			}
		}

		if(errMsg == ''){
			if(name.val() == "" || name.val() == name.attr("placeholder")){
				errMsg = "请输入您的姓名";
				showMsg(errMsg);
				return false;
			}else if(!userinfo_.phoneCheck){
				if(phone.val() == "" || phone.val() == phone.attr("placeholder")){
					errMsg = "请输入您的手机号码";
					showMsg(errMsg);
					return false;
				}else if(!/(13|14|15|17|18)[0-9]{9}/.test($.trim(phone.val()))){
					// errMsg = "手机号码格式错误，请重新输入！";
					// showMsg(errMsg);
					// return false;
				}else if(vercode.val() == "" || vercode.val() == vercode.attr("placeholder")){
					errMsg = "请输入短信验证码";
					showMsg(errMsg);
					return false;
				}
			}
		}


		t.addClass("disabled").html("提交中...");

		var data = [];
		data.push("type=" + $(".tab_wt .curr").attr("data-val"));
		data.push("address=" + $("#addr").val());
		data.push("zjuid=" + $("#zjuid").val());
		data.push("doornumber=" + $("#doorcard").val());
		data.push("area=" + $("#area").val());
		if($(".tab_wt .curr").attr("data-val")==2){
			data.push("price=" + $("#mprice").val());
		}else if($(".tab_wt .curr").attr("data-val")==1){
			data.push("price=" + $("#sprice").val());
		}else  if($(".tab_wt .curr").attr("data-val")==0){
			data.push("price=" + $("#price").val());
		}
		data.push("username=" + $("#name").val());
		data.push("phone=" + $("#telphone").val());
		data.push('areaCode='+$('#areaCode').val());
		data.push("vdimgck=" + $("#vercode").val());
		data.push("transfer=" + $("#zprice").val());
		data.push("sex=" + $("input[name=sex]:checked").val());

		$.ajax({
            url: "/include/ajax.php?service=house&action=putEnturst&"+data.join("&"),
            type: "POST",
            dataType: "json",
            success: function (data) {
                if(data.state == 100){
                    $(".modal-wt").removeClass("popup").fadeOut();
					$(".popup_bg").hide();
					alert('提交成功，我们会尽快与您取得联系');
					setTimeout(function(){
						location.reload();
				    },1000);
                }else{
                	t.removeClass("disabled").html('提交');
                    showMsg(data.info);
                }
            },
            error: function(){
            	t.removeClass("disabled").html('提交');
                showMsg('网络错误，提交失败！');
            }
        });

	});
	if(!geetest){
		$(".getCodes").bind("click", function (){
			if($(this).hasClass('disabled')) return false;
			var tel = $("#telphone").val();
			if(tel == ''){
				errMsg = "请输入手机号码";
				showMsg(errMsg);
				$("#telphone").focus();
				return false;
			}else{
				 sendVerCode();
			}
			$("#vercode").focus();
		})
	}

	//发送验证码
  function sendVerCode(captchaVerifyParam,callback){
  	var phone = $("#telphone").val();
	let param = "type=verify"+"&phone="+phone+"&areaCode=86"
	if(captchaVerifyParam && geetest == 2){
		param = param + '&geetest_challenge=' + captchaVerifyParam
	}else if(geetest == 1 && captchaVerifyParam){
		param = param +  captchaVerifyParam
	}
	$.ajax({
	    url: "/include/ajax.php?service=siteConfig&action=getPhoneVerify",
	    data: param,
	    type: "GET",
	    dataType: "json",
	    success: function (data) {
			if(callback){
				callback(data)
			}
			//获取成功
			if(data && data.state == 100){
				countDown($('.getCodes'), 60);
			//获取失败
			}else{
				alert(data.info);
			}
	    },
	    error: function(){
	      alert(langData['siteConfig'][20][173]);
	    }
	  });
  }



	//倒计时
	function countDown(obj,time){
		obj.html(time+'秒后重发').addClass('disabled');
		mtimer = setInterval(function(){
			obj.html((--time)+'秒后重发').addClass('disabled');
			if(time <= 0) {
				clearInterval(mtimer);
				obj.html('重新发送').removeClass('disabled');
			}
		}, 1000);
	}

	$('.nav_item').delegate('h4', 'click', function(event) {
		var t =  $(this),icon = t.find('i'),next = t.next();
		var len = next.length;
		if(len>0){
			if(icon.hasClass('add')){
				icon.removeClass('add').addClass('reduce');
			}else{
				icon.removeClass('reduce').addClass('add');
			}
			next.toggleClass('ushow');
		}

	});
	// 二级分类
	$('.ubox').delegate('.litit', 'click', function(event) {
		var t =  $(this),icon = t.find('i'),next = t.next('.sub_nav');
		var len = next.length;
		if(len>0){
			if(icon.hasClass('add')){
				icon.removeClass('add').addClass('reduce');
			}else{
				icon.removeClass('reduce').addClass('add');
			}
			next.toggleClass('ushow');
		}
	});
	$('.ubox').delegate('.litit-li', 'click', function(event) {
		var t = $(this);
        if(!t.hasClass('curr')){
          $('.litit-li').removeClass('curr');
          t.addClass('curr').siblings('li').removeClass('curr');
        }
		var type = t.attr("data-type"), id = t.attr("data-id");
		$(".choose-tab li").attr("data-id", '');
		if(type=='community'){
			$(".community").attr("data-id", id);
		}else if(type=='price'){
			$(".price").attr("data-id", id);
		}else if(type=='room'){
			$(".room").attr("data-id", id);
		}
		getList(1);
	});
	$('.ul-nav').delegate('li', 'click', function(event) {
		var t = $(this),id = t.attr('data-id');
		if(!t.hasClass('curr')){
			t.addClass('curr').siblings('li').removeClass('curr');
		}
		typeid = id;

		$(".choose-tab li").attr("data-id", '');

		if(id=="zu"){
			getCondition(1);
		}else if(id=="sale"){
			getCondition();
		}else{
			$(".uboxsale").siblings(".on").find('i').removeClass('reduce').addClass('add');
			$(".uboxsale").html('').removeClass('ushow');
			$(".uboxzu").html('').removeClass('ushow');
			$(".uboxzu").siblings(".on").find('i').removeClass('reduce').addClass('add');
		}
		getList(1);
	});

	//获取出售、出租条件分类
	getCondition();

	function getCondition(tr){
		var type = 0;
		if(tr){
			type = 1;
		}
		$.ajax({
            url: "/include/ajax.php?service=house&action=getCondition&zj="+zj+"&type="+type,
            type: "POST",
            dataType: "html",
			success: function(data){
				if(data!=101){
					if(type==1){
						$(".uboxsale").siblings(".on").find('i').removeClass('reduce').addClass('add');
						$(".uboxsale").html('').removeClass('ushow');
						$(".uboxzu").html(data).addClass('ushow');
						$(".uboxzu").siblings(".on").find('i').removeClass('add').addClass('reduce');
					}else{
						$(".uboxzu").siblings(".on").find('i').removeClass('reduce').addClass('add');
						$(".uboxzu").html('').removeClass('ushow');
						$(".uboxsale").html(data).addClass('ushow');
						$(".uboxsale").siblings(".on").find('i').removeClass('add').addClass('reduce');
					}
				}else{
					$(".uboxsale").siblings(".on").find('i').removeClass('reduce').addClass('add');
					$(".uboxsale").html('').removeClass('ushow');
					$(".uboxzu").html('').removeClass('ushow');
					$(".uboxzu").siblings(".on").find('i').removeClass('reduce').addClass('add');
				}
			}
		})
	}


	getList();

	function getList(tr){
		 var active = $('.ul-nav .curr'), action = active.attr('data-id'), url;

		 var data = [];

		 var community = $('.choose-tab .community').attr('data-id');
		 var price = $('.choose-tab .price').attr('data-id');
		 var room  = $('.choose-tab .room').attr('data-id');

		 if(action=="sale"){//二手房
            if(tr){
                atpage = 1;
                $(".boxCon ul").html('');
                $(".pagination").html('').hide();
            }

            data.push("community="+community);
            data.push("price="+price);
            data.push("room="+room);


            url =  "/include/ajax.php?service=house&action=saleList&check_collect=1&page=" + atpage + "&pageSize=" + pageSize + "&zj=" + zj;
		}else if(action=="zu"){//租房
            if(tr){
                atpage = 1;
                $(".boxCon ul").html('');
                $(".pagination").html('').hide();
            }

            data.push("community="+community);
            data.push("price="+price);
            data.push("room="+room);

            url =  "/include/ajax.php?service=house&action=zuList&check_collect=1&page=" + atpage + "&pageSize=" + pageSize + "&zj=" + zj;
        }else if(action=="xzl"){//写字楼
            if(tr){
                atpage = 1;
                $(".boxCon ul").html('');
                $(".pagination").html('').hide();
            }
            url =  "/include/ajax.php?service=house&action=xzlList&page=" + atpage + "&pageSize=" + pageSize + "&zj=" + zj;
        }else if(action=="sp"){//商铺
            if(tr){
                atpage = 1;
                $(".boxCon ul").html('');
                $(".pagination").html('').hide();
            }
            url =  "/include/ajax.php?service=house&action=spList&check_collect=1&page=" + atpage + "&pageSize=" + pageSize + "&zj=" + zj;
        }else if(action=="cf"){//厂房
            if(tr){
                atpage = 1;
                $(".boxCon ul").html('');
                $(".pagination").html('').hide();
            }
            url =  "/include/ajax.php?service=house&action=cfList&check_collect=1&page=" + atpage + "&pageSize=" + pageSize + "&zj=" + zj;
        }else if(action=="cw"){//车位
            if(tr){
                atpage = 1;
                $(".boxCon ul").html('');
                $(".pagination").html('').hide();
            }
            url =  "/include/ajax.php?service=house&action=cwList&check_collect=1&page=" + atpage + "&pageSize=" + pageSize + "&zj=" + zj;
        }

		$.ajax({
	            url: url,
	            data: data.join("&"),
	            type: "POST",
	            dataType: "json",
				success: function(data){
					if(data.state == 100){
						var list = data.info.list, pageInfo = data.info.pageInfo, html = [];
						totalCount = pageInfo.totalCount;
						for(var i = 0; i < list.length; i++){
							if(action=="sale"){//二手房
								html.push('<li class="fn-clear">');

									html.push('<div class="imgbox fn-left">');
									html.push('<a href="'+list[i].url+'"><img src="'+huoniao.changeFileSize(list[i].litpic, "large")+'" alt=""></a>');
									if(list[i].video==1){
										html.push('<i class="ivplay"></i>');
									}
									if(list[i].qj==1){
										html.push('<i class="is_Vr"></i>');
									}
									//html.push('<div class="markbox"><span class="m_mark m_cs">出售</span></div>');
									html.push('</div>');

									//
									html.push('<div class="infobox fn-left">');

										html.push('<div class="lptit fn-clear">');
			                            html.push('<a href="'+list[i].url+'"><h2>'+list[i].title+'</h2></a>');
			                            if(list[i].price>0){
			                            	var price = parseInt(list[i].price).toFixed(0);
			                                html.push('<span class="lpprice"><b>'+price+'</b>万</span>');
			                            }else{
			                                html.push('<span class="lpprice"><b>面议</b></span>');
			                            }
			                            html.push('</div>');

			                            var elevatortxt = list[i].elevator==1 ? '有电梯' : '无电梯';
                            			html.push('<div class="lpinf fn-clear"><div class="sp_l fn-left"><span>'+list[i].room+'</span><em>|</em><span>'+parseInt(list[i].area).toFixed(1)+echoCurrency('areasymbol')+'</span><em>|</em><span>'+list[i].buildage+'年</span><em>|</em><span>'+list[i].direction+'</span><em>|</em><span>'+list[i].zhuangxiu+'</span><em>|</em><span>'+list[i].bno+'/'+list[i].floor+'层</span><em>|</em><span>'+elevatortxt+'</span></div><div class="sp_r fn-right">'+parseInt(list[i].unitprice).toFixed(0)+' '+echoCurrency('short')+'/'+echoCurrency('areasymbol')+'</div></div>');

										html.push('<p class="lpinf">['+list[i].addr.join(' ')+']  '+list[i].address+'</p>');

										html.push('<div class="lpbottom"><div class="lpmark">');
			                            for (var j = 0; j < list[i].flags.length; j++) {
			                                html.push('<span>'+list[i].flags[j]+'</span>');
			                            }
			                            html.push('</div></div>');

			                            html.push('</div>');



									html.push('</div>');


								html.push('</li>');
							}else if(action=="zu"){//租房
								html.push('<li class="fn-clear">');

									html.push('<div class="imgbox fn-left">');
									html.push('<a href="'+list[i].url+'"><img src="'+huoniao.changeFileSize(list[i].litpic, "large")+'" alt=""></a>');
									if(list[i].video==1){
										html.push('<i class="ivplay"></i>');
									}
									if(list[i].qj==1){
										html.push('<i class="is_Vr"></i>');
									}
									//html.push('<div class="markbox"><span class="m_mark m_cs">出售</span></div>');
									html.push('</div>');

									//
									html.push('<div class="infobox fn-left">');

										html.push('<div class="lptit fn-clear">');
			                            html.push('<a href="'+list[i].url+'"><h2>'+list[i].title+'</h2></a>');
			                            if(list[i].price>0){
			                                html.push('<span class="lpprice"><b>'+parseInt(list[i].price).toFixed(0)+'</b>'+echoCurrency('short')+'/月</span>');
			                            }else{
			                                html.push('<span class="lpprice"><b>面议</b></span>');
			                            }
			                            html.push('</div>');

			                            var elevatortxt = list[i].elevator==1 ? '有电梯' : '无电梯';
                            			html.push('<div class="lpinf fn-clear"><div class="sp_l fn-left"><span>'+list[i].room+'</span><em>|</em><span>'+parseInt(list[i].area).toFixed(1)+echoCurrency('areasymbol')+'</span><em>|</em><span>'+list[i].buildage+'年</span><em>|</em><span>'+list[i].direction+'</span><em>|</em><span>'+list[i].zhuangxiu+'</span><em>|</em><span>'+list[i].bno+'/'+list[i].floor+'层</span><em>|</em><span>'+elevatortxt+'</span></div><div class="sp_r fn-right">'+list[i].timeUpdate+'更新</div></div>');

										html.push('<p class="lpinf">['+list[i].addr.join(' ')+']  '+list[i].address+'</p>');

										html.push('<div class="lpbottom"><div class="lpmark">');
			                            for (var j = 0; j < list[i].configlist.length; j++) {
			                                html.push('<span>'+list[i].configlist[j]+'</span>');
			                            }
			                            html.push('</div></div>');

			                            html.push('</div>');



									html.push('</div>');


								html.push('</li>');


							}else if(action=="xzl"){//写字楼
								html.push('<li class="fn-clear">');

									html.push('<div class="imgbox fn-left">');
									html.push('<a href="'+list[i].url+'"><img src="'+huoniao.changeFileSize(list[i].litpic, "large")+'" alt=""></a>');
									if(list[i].video==1){
										html.push('<i class="ivplay"></i>');
									}
									if(list[i].qj==1){
										html.push('<i class="is_Vr"></i>');
									}
									if(list[i].type==1){
										html.push('<div class="markbox"><span class="m_mark m_cs">出售</span></div>');
									}else{
										html.push('<div class="markbox"><span class="m_mark m_cz">出租</span></div>');
									}
									html.push('</div>');

									//
									html.push('<div class="infobox fn-left">');

										html.push('<div class="lptit fn-clear">');
			                            html.push('<a href="'+list[i].url+'"><h2>'+list[i].title+'</h2></a>');
			                            if(list[i].price>0){
			                            	if(list[i].type==0){
												html.push('<span class="lpprice"><b>'+parseInt(list[i].price).toFixed(0)+'</b>'+echoCurrency('short')+'/'+echoCurrency('areasymbol')+'•月</span>');
			                            	}else{
												html.push('<span class="lpprice"><b>'+parseInt(list[i].price).toFixed(0)+'</b>万</span>');
			                            	}

			                            }else{
			                                html.push('<span class="lpprice"><b>面议</b></span>');
			                            }
			                            html.push('</div>');

			                            var elevatortxt = '';
			                            if(list[i].price>0){
											if(list[i].type==1){
												elevatortxt = (list[i].price / list[i].area * 10000).toFixed(0) + ''+echoCurrency('short')+'/'+echoCurrency('areasymbol');
			                            	}else{
			                            		elevatortxt = (list[i].price * list[i].area).toFixed(0) + ''+echoCurrency('short')+'/月';
			                            	}
			                            }else{
											elevatortxt = '面议';
			                            }
                            			html.push('<div class="lpinf fn-clear"><div class="sp_l fn-left"><span>'+parseInt(list[i].area).toFixed(1)+echoCurrency('areasymbol')+'</span><em>|</em><span>'+list[i].loupan+'</span><em>|</em><span>'+list[i].zhuangxiu+'</span><em>|</em><span>'+list[i].bno+'/'+list[i].floor+'层</span><em>|</em><span>'+list[i].protype+'</span></div><div class="sp_r fn-right">'+elevatortxt+'</div></div>');

										html.push('<p class="lpinf">['+list[i].addr.join(' ')+']  '+list[i].address+'</p>');

										html.push('<div class="lpbottom"><div class="lpmark">');
			                            for (var j = 0; j < list[i].config.length; j++) {
			                                html.push('<span>'+list[i].config[j]+'</span>');
			                            }
			                            html.push('</div></div>');

			                            html.push('</div>');



									html.push('</div>');


								html.push('</li>');


							}else if(action=="sp"){//商铺
								html.push('<li class="fn-clear">');

									html.push('<div class="imgbox fn-left">');
									html.push('<a href="'+list[i].url+'"><img src="'+huoniao.changeFileSize(list[i].litpic, "large")+'" alt=""></a>');
									if(list[i].video==1){
										html.push('<i class="ivplay"></i>');
									}
									if(list[i].qj==1){
										html.push('<i class="is_Vr"></i>');
									}
									if(list[i].type==1){
										html.push('<div class="markbox"><span class="m_mark m_cs">出售</span></div>');
									}else if(list[i].type==0){
										html.push('<div class="markbox"><span class="m_mark m_cz">出租</span></div>');
									}else if(list[i].type==2){
										html.push('<div class="markbox"><span class="m_mark m_zr">转让</span></div>');
									}
									html.push('</div>');

									//
									html.push('<div class="infobox fn-left">');

										html.push('<div class="lptit fn-clear">');
			                            html.push('<a href="'+list[i].url+'"><h2>'+list[i].title+'</h2></a>');
			                            if(list[i].price>0){
			                            	if(list[i].type==1){
												html.push('<span class="lpprice"><b>'+parseInt(list[i].price).toFixed(0)+'</b>万</span>');
			                            	}else{
			                            		html.push('<span class="lpprice"><b>'+parseInt(list[i].price).toFixed(0)+'</b>'+echoCurrency('short')+'/月</span>');
			                            	}

			                            }else{
			                                html.push('<span class="lpprice"><b>面议</b></span>');
			                            }
			                            html.push('</div>');

			                            var elevatortxt = '';
										if(list[i].type==1){
											if(list[i].price>0){
												elevatortxt = (list[i].price / list[i].area).toFixed(0) + '万/'+echoCurrency('areasymbol');
											 }
		                            	}else if(list[i].type==2){
		                            		if(list[i].transfer>0){
		                            			elevatortxt = '转让费： ' + parseInt(list[i].transfer).toFixed(0) + '万';
		                            		}
		                            	}else if(list[i].type==0){
			                           		if(list[i].price>0){
			                           			elevatortxt = (list[i].price / list[i].area).toFixed(0) + ''+echoCurrency('short')+'/'+echoCurrency('areasymbol')+'•月';
			                           		}
			                           	}

                            			html.push('<div class="lpinf fn-clear"><div class="sp_l fn-left"><span>'+parseInt(list[i].area).toFixed(1)+echoCurrency('areasymbol')+'</span><em>|</em><span>'+list[i].loupan+'</span><em>|</em><span>'+list[i].zhuangxiu+'</span><em>|</em><span>'+list[i].bno+'/'+list[i].floor+'层</span><em>|</em><span>'+list[i].protype+'</span></div><div class="sp_r fn-right">'+elevatortxt+'</div></div>');

										html.push('<p class="lpinf">['+list[i].addr.join(' ')+']  '+list[i].address+'</p>');

										html.push('<div class="lpbottom"><div class="lpmark">');
			                            for (var j = 0; j < list[i].config.length; j++) {
			                                html.push('<span>'+list[i].config[j]+'</span>');
			                            }
			                            html.push('</div></div>');

			                            html.push('</div>');



									html.push('</div>');


								html.push('</li>');


							}else if(action=="cf"){//厂房

								html.push('<li class="fn-clear">');

									html.push('<div class="imgbox fn-left">');
									html.push('<a href="'+list[i].url+'"><img src="'+huoniao.changeFileSize(list[i].litpic, "large")+'" alt=""></a>');
									if(list[i].video==1){
										html.push('<i class="ivplay"></i>');
									}
									if(list[i].qj==1){
										html.push('<i class="is_Vr"></i>');
									}
									if(list[i].type==2){
										html.push('<div class="markbox"><span class="m_mark m_cs">出售</span></div>');
									}else if(list[i].type==0){
										html.push('<div class="markbox"><span class="m_mark m_cz">出租</span></div>');
									}else if(list[i].type==1){
										html.push('<div class="markbox"><span class="m_mark m_zr">转让</span></div>');
									}
									html.push('</div>');

									//
									html.push('<div class="infobox fn-left">');

										html.push('<div class="lptit fn-clear">');
			                            html.push('<a href="'+list[i].url+'"><h2>'+list[i].title+'</h2></a>');
			                            if(list[i].price>0){
			                            	if(list[i].type==2){
			                            		html.push('<span class="lpprice"><b>'+parseInt(list[i].price).toFixed(0)+'</b>万</span>');
			                            	}else{
												html.push('<span class="lpprice"><b>'+parseInt(list[i].price).toFixed(0)+'</b>'+echoCurrency('short')+'/月</span>');
			                            	}

			                            }else{
			                                html.push('<span class="lpprice"><b>面议</b></span>');
			                            }
			                            html.push('</div>');

			                            var elevatortxt = '';
			                            if(list[i].type==2){
											if(list[i].price>0){
												elevatortxt = (list[i].price / list[i].area).toFixed(0) + '万/'+echoCurrency('areasymbol');
											 }
			                           	}else if(list[i].type==1){
			                           		if(list[i].transfer>0){
			                           			elevatortxt = '转让费： ' + parseInt(list[i].transfer).toFixed(0) + '万';
			                           		}
			                           	}else if(list[i].type==0){
			                           		if(list[i].price>0){
			                           			elevatortxt = (list[i].price / list[i].area).toFixed(0) + ''+echoCurrency('short')+'/'+echoCurrency('areasymbol')+'•月';
			                           		}
			                           	}

                            			html.push('<div class="lpinf fn-clear"><div class="sp_l fn-left"><span>'+parseInt(list[i].area).toFixed(1)+echoCurrency('areasymbol')+'</span><em>|</em><span>'+list[i].bno+'/'+list[i].floor+'层</span><em>|</em><span>'+list[i].protype+'</span></div><div class="sp_r fn-right">'+elevatortxt+'</div></div>');

										html.push('<p class="lpinf">['+list[i].addr.join(' ')+']  '+list[i].address+'</p>');


			                            html.push('</div>');



									html.push('</div>');


								html.push('</li>');

							}else if(action=="cw"){//车位
								html.push('<li class="fn-clear">');

									html.push('<div class="imgbox fn-left">');
									html.push('<a href="'+list[i].url+'"><img src="'+huoniao.changeFileSize(list[i].litpic, "large")+'" alt=""></a>');
									if(list[i].video==1){
										html.push('<i class="ivplay"></i>');
									}
									if(list[i].qj==1){
										html.push('<i class="is_Vr"></i>');
									}
									if(list[i].type==1){
										html.push('<div class="markbox"><span class="m_mark m_cs">出售</span></div>');
									}else if(list[i].type==0){
										html.push('<div class="markbox"><span class="m_mark m_cz">出租</span></div>');
									}else if(list[i].type==2){
										html.push('<div class="markbox"><span class="m_mark m_zr">转让</span></div>');
									}
									html.push('</div>');

									//
									html.push('<div class="infobox fn-left">');

										html.push('<div class="lptit fn-clear">');
			                            html.push('<a href="'+list[i].url+'"><h2>'+list[i].title+'</h2></a>');
			                            if(list[i].price>0){
			                            	if(list[i].type==1){
			                            		html.push('<span class="lpprice"><b>'+parseInt(list[i].price).toFixed(0)+'</b>万</span>');
			                            	}else{
												html.push('<span class="lpprice"><b>'+parseInt(list[i].price).toFixed(0)+'</b>'+echoCurrency('short')+'/月</span>');
			                            	}

			                            }else{
			                                html.push('<span class="lpprice"><b>面议</b></span>');
			                            }
			                            html.push('</div>');

			                            var elevatortxt = '';
			                            if(list[i].type==1){
											if(list[i].price>0){
												elevatortxt = (list[i].price / list[i].area).toFixed(0) + '万/'+echoCurrency('areasymbol');
											 }
			                           	}else if(list[i].type==2){
			                           		if(list[i].transfer>0){
			                           			elevatortxt = '转让费： ' + parseInt(list[i].transfer).toFixed(0) + '万';
			                           		}
			                           	}else if(list[i].type==0){
			                           		if(list[i].price>0){
			                           			elevatortxt = (list[i].price / list[i].area).toFixed(0) + ''+echoCurrency('short')+'/'+echoCurrency('areasymbol')+'•月';
			                           		}
			                           	}

                            			html.push('<div class="lpinf fn-clear"><div class="sp_l fn-left"><span>'+parseInt(list[i].area).toFixed(1)+echoCurrency('areasymbol')+'</span><em>|</em><span>'+list[i].community+'</span><em>|</em><span>'+list[i].protype+'</span></div><div class="sp_r fn-right">'+elevatortxt+'</div></div>');

										html.push('<p class="lpinf">['+list[i].addr.join(' ')+']  '+list[i].address+'</p>');


			                            html.push('</div>');



									html.push('</div>');


								html.push('</li>');

							}

						}
						$(".boxCon ul").html(html.join(""));

						showPageInfo();
					}else{
						$(".boxCon ul").html('<div class="empty">抱歉！ 未找到相关信息</div>');
					}
				}
			})
	}


	//打印分页
	function showPageInfo() {
	    var info = $(".pagination");
	    var nowPageNum = atpage;
	    var allPageNum = Math.ceil(totalCount/pageSize);
	    var pageArr = [];

	    info.html("").hide();

	    //输入跳转
	    var redirect = document.createElement("div");
	    redirect.className = "pagination-gotopage";
	    redirect.innerHTML = '<label for="">跳转</label><input type="text" class="inp" maxlength="4" /><input type="button" class="btn" value="GO" />';
	    info.append(redirect);

	    //分页跳转
	    info.find(".btn").bind("click", function(){
	        var pageNum = info.find(".inp").val();
	        if (pageNum != "" && pageNum >= 1 && pageNum <= Number(allPageNum)) {
	            atpage = pageNum;
	            getList();
	        } else {
	            info.find(".inp").focus();
	        }
	    });

	    var pages = document.createElement("div");
	    pages.className = "pagination-pages";
	    info.append(pages);

	    //拼接所有分页
	    if (allPageNum > 1) {

	        //上一页
	        if (nowPageNum > 1) {
	            var prev = document.createElement("a");
	            prev.className = "prev";
	            prev.innerHTML = '上一页';
	            prev.onclick = function () {
	                atpage = nowPageNum - 1;
	                getList();
	            }
	        } else {
	            var prev = document.createElement("span");
	            prev.className = "prev disabled";
	            prev.innerHTML = '上一页';
	        }
	        info.find(".pagination-pages").append(prev);

	        //分页列表
	        if (allPageNum - 2 < 1) {
	            for (var i = 1; i <= allPageNum; i++) {
	                if (nowPageNum == i) {
	                    var page = document.createElement("span");
	                    page.className = "curr";
	                    page.innerHTML = i;
	                } else {
	                    var page = document.createElement("a");
	                    page.innerHTML = i;
	                    page.onclick = function () {
	                        atpage = Number($(this).text());
	                        getList();
	                    }
	                }
	                info.find(".pagination-pages").append(page);
	            }
	        } else {
	            for (var i = 1; i <= 2; i++) {
	                if (nowPageNum == i) {
	                    var page = document.createElement("span");
	                    page.className = "curr";
	                    page.innerHTML = i;
	                }
	                else {
	                    var page = document.createElement("a");
	                    page.innerHTML = i;
	                    page.onclick = function () {
	                        atpage = Number($(this).text());
	                        getList();
	                    }
	                }
	                info.find(".pagination-pages").append(page);
	            }
	            var addNum = nowPageNum - 4;
	            if (addNum > 0) {
	                var em = document.createElement("span");
	                em.className = "interim";
	                em.innerHTML = "...";
	                info.find(".pagination-pages").append(em);
	            }
	            for (var i = nowPageNum - 1; i <= nowPageNum + 1; i++) {
	                if (i > allPageNum) {
	                    break;
	                }
	                else {
	                    if (i <= 2) {
	                        continue;
	                    }
	                    else {
	                        if (nowPageNum == i) {
	                            var page = document.createElement("span");
	                            page.className = "curr";
	                            page.innerHTML = i;
	                        }
	                        else {
	                            var page = document.createElement("a");
	                            page.innerHTML = i;
	                            page.onclick = function () {
	                                atpage = Number($(this).text());
	                                getList();
	                            }
	                        }
	                        info.find(".pagination-pages").append(page);
	                    }
	                }
	            }
	            var addNum = nowPageNum + 2;
	            if (addNum < allPageNum - 1) {
	                var em = document.createElement("span");
	                em.className = "interim";
	                em.innerHTML = "...";
	                info.find(".pagination-pages").append(em);
	            }
	            for (var i = allPageNum - 1; i <= allPageNum; i++) {
	                if (i <= nowPageNum + 1) {
	                    continue;
	                }
	                else {
	                    var page = document.createElement("a");
	                    page.innerHTML = i;
	                    page.onclick = function () {
	                        atpage = Number($(this).text());
	                        getList();
	                    }
	                    info.find(".pagination-pages").append(page);
	                }
	            }
	        }

	        //下一页
	        if (nowPageNum < allPageNum) {
	            var next = document.createElement("a");
	            next.className = "next";
	            next.innerHTML = '下一页';
	            next.onclick = function () {
	                atpage = nowPageNum + 1;
	                getList();
	            }
	        } else {
	            var next = document.createElement("span");
	            next.className = "next disabled";
	            next.innerHTML = '下一页';
	        }
	        info.find(".pagination-pages").append(next);

	        info.show();

	    }else{
	        info.hide();
	    }
	}

	//是否使用极验验证码
  var sendvdimgckBtn;

  if(geetest){
		captchaVerifyFun.initCaptcha('web','#codeButton',sendVerCode)
		$(document).on('click','.getCodes',function(){
			var tel = $("#telphone").val();
			if(tel == ''){
				errMsg = "请输入手机号码";
				showMsg(errMsg);
				$("#telphone").focus();
				return false;
			}
			var a = $(this);
			sendvdimgckBtn = a;
			
			//弹出验证码
			if(geetest == 1){
				captchaVerifyFun.config.captchaObjReg.verify();
			}else{
				$('#codeButton').click()
			}
		});
	}

})
