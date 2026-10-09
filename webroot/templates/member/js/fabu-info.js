var 	uploader_iv;
var fabuid = id,validTrade = null;
$(function(){
		getEditor("body", {
			toolbars: [[
				'undo', //撤销
				'redo', //重做
				'bold', //加粗
				'indent', //首行缩进
				'edittip ', //编辑提示
				'touppercase', //字母大写
				'tolowercase', //字母小写
			]],
			retainOnlyLabelPasted: true
		});

		ue.ready(function(){
			if(typeof(aiConJs) !== 'undefined'){
				aiConJs.initAi('info',getSearchKey,handleData,solveData)
			}
		})
		

		// 重置一下高度
		document.documentElement.style.setProperty('--height',( $(".customBox .cContent").height() + 40) + 'px');

		// 展开自定义信息
		// $(".customizeBox .cTitle s.arr").click(function(e){
		// 	$('.customizeBox').toggleClass('open')
		// 	$('.customizeBox .cContent').slideToggle(300);
		// 	e.stopPropagation()
		// });
		// $(".customizeBox").click(function(){
		// 	if(!$(this).hasClass('open')){
		// 		$(".customizeBox .cTitle s.arr").click()
		// 	}
		// });
		// $(".customizeBox .cTitle").click(function(e){
		// 	$(".customizeBox .cTitle s.arr").click();
		// 	e.stopPropagation()
		// });

		

		var feature = $('#feature').val();
		if(feature != ''){
			$('.tabArrs span').each(function(){
				var id = $(this).attr('data-id')
				if(feature.indexOf(id) > -1){
					$(this).addClass('on_chose')
				}
				console.log($(this).attr('data-id'),feature)
			})
		}

		var click = false;
		$('.addrBtn').click(function(){
			if(!click){
				click = true;
				var t = $(this);
				var id = t.attr('data-id');
				setTimeout(function(){
					$('.city-first a[data-id="'+id+'"]').click()
				},1000)

			}
		});


		//地图标注
    var init = {
        popshow: function() {
            var src = "/api/map/mark.php?mod=info",
                address = $("#addrPosi").val(),
                lng = $("#lng").val(),
                lat = $("#lat").val();
            if(address != ""){
                src = src + "&address="+address;
            }
            if(lng != "" && lat != ""){
                src = src + "&lnglat="+lng+','+lat;
            }

            $("#markDitu").attr("src", src);
            $(".mapMask,.mapPopBox").show();
        },
        pophide: function() {
            $("#markDitu").attr("src", "");
            $(".mapMask,.mapPopBox").hide();
						// $("#currAddr").attr('readonly',true)
        }
    };

    // 聚焦
    $("#currAddr").focus(function(){
    	var t = $(this),pbox = t.closest('.posiInp');
    	pbox.addClass('focusIn')

    });

    $("#currAddr").blur(function(){
    	var t = $(this),pbox = t.closest('.posiInp');
    	pbox.removeClass('focusIn')

    })

    $(".pop-close").bind("click", function(){
        init.pophide();
    });

    $("#markbtn").bind("click", function(){
        init.popshow();
    });

    $("#okPop").bind("click", function(){
        var doc = $(window.parent.frames["markDitu"].document),
            lng = doc.find("#lng").val(),
            lat = doc.find("#lat").val(),
            // address = doc.find("#addr").val();
            address = $("#currAddr").val();
        $("#lnglat").val(lng+","+lat);
				$("#addrPosi").val(address);
				$('.city-title.addrBtn').removeAttr('data-ids').removeAttr('data-id')
				$(".detaiAddr").removeClass('fn-hide');
				$("#markbtn").addClass('pFixed').find('span').text('查看定位')
        init.pophide();
    });

		// $(".edit_posi").click(function(event) {
		// 	$("#currAddr").attr('readonly',false).focus()
		// });

	if(typeid == 0 && id == 0){
		//大类切换
		$(".catagoryBox a").bind("click", function(){
			var t = $(this), index = t.index();

			$(".catagoryBox a").removeClass('on_chose')
			t.addClass('on_chose')
		});

		$("#skey").val("");


		function getUrl(id){
			var url = $(".sform").data("url");
			return url.replace("%id%", id);
		}

		//二级分类
		$(".seltype .stype li").hover(function(){
			var sub = $(this).find(".subnav");
			if(sub.find("a").length > 0){
				$(this).addClass("curr");
				sub.show();
			}
		}, function(){
			var sub = $(this).find(".subnav");
			if(sub.find("a").length > 0){
				$(this).removeClass("curr");
				sub.hide();
			}
		});

		// return false;

	}

	//国际手机号获取
    getNationalPhone();
    function getNationalPhone(){
        $.ajax({
            url: masterDomain+"/include/ajax.php?service=siteConfig&action=internationalPhoneSection",
            type: 'get',
            dataType: 'JSONP',
            success: function(data){
                if(data && data.state == 100){
                   var phoneList = [], list = data.info;
                   var listLen = list.length;
                   var codeArea = list[0].code;
                   if(listLen == 1 && codeArea == 86){//当数据只有一条 并且这条数据是大陆地区86的时候 隐藏区号选择
                        $('.areaCode').hide();
                        $('.w-form .inp#tel').css({'padding-left':'10px','width':'175px'});
                        return false;
                   }
                   for(var i=0; i<list.length; i++){
                        phoneList.push('<li data-cn="'+list[i].name+'" data-code="'+list[i].code+'">'+list[i].name+' +'+list[i].code+'</li>');
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
      console.log('codeclick')
        e.stopPropagation();
        var areaWrap =$(this).closest("dd").find('.areaCode_wrap');
        if(areaWrap.is(':visible')){
            areaWrap.fadeOut(300)
        }else{
            areaWrap.fadeIn(300);
           return false;
        }


    });

		// $('.radioBox li').click(function(){
		$('body').delegate('.radioBox li','click', function(){
			var t = $(this);
			let radiobox = $(this).closest('.radioBox')
			let require = radiobox.attr('data-required');
			// if(require == '0' && t.find('input[type="radio"]').attr('checked')){

			// 	t.removeClass('on_chose');
			// 	t.find('input[type="radio"]').prop('checked', false)
			// }else{

				t.addClass('on_chose').siblings('li').removeClass('on_chose');
				t.find('input[type="radio"]').prop('checked', true)
			// }
		})
    //选择区号
    $('.areaCode_wrap').delegate('li', 'click', function(){
        var t = $(this), code = t.attr('data-code');
        var par = t.closest("dd");
        var areaIcode = par.find(".areaCode");
        areaIcode.find('i').html('+' + code);
        $('#areaCode').val(code);
    });

    $('body').bind('click', function(){
        $('.areaCode_wrap').fadeOut(300);
    });



	//自动获取交易地点
	//百度地图
	if(site_map == "baidu"){
		var coords = $().coords();
		var transform = function(e, t) {
			coords.transform(e,	function(e, n) {
				n != null ? $("#address").val(n.street + n.streetNumber) : alert(e.message);
				$("#address").siblings(".tip-inline").removeClass().addClass("tip-inline success");
				var dist = n.district;
				$("#selAddr .sel-group:eq(0) li").each(function(){
					var t = $(this).find("a"), v = t.text(), i = t.attr("data-id");
					if(v.indexOf(dist) > -1){
						$("#addr").val(i);
						$("#selAddr .sel-group:eq(0)").find("button").html(v+'<span class="caret"></span>');
						$("#selAddr .sel-group:eq(0)").siblings(".sel-group").remove();
						getChildAddr(i);
					}
				});
				t.hide();
			}, true);
		};
		$("#getlnglat").bind("click", function() {
			var e = $(this);
			coords.get(function(t, n) {
				transform(n, e);
			}),
			$(this).unbind("click").html("<s></s>"+langData['siteConfig'][7][3]+"...");  //获取中
		});

		//搜索联想
		var autocomplete = new BMap.Autocomplete({
				input: "address"
		});
		autocomplete.setLocation(map_city);

	//google 地图
	}else if(site_map == "google"){

		$("#getlnglat").hide();
	    var autocomplete = new google.maps.places.Autocomplete(document.getElementById('address'), {placeIdOnly: true});

	}

	//选择区域
	$("#selAddr").delegate("a", "click", function(){
		if($(this).text() != langData['siteConfig'][22][96] && $(this).attr("data-id") != $("#addr").val()){  //不限
			var id = $(this).attr("data-id");
			$(this).closest(".sel-group").nextAll(".sel-group").remove();
			getChildAddr(id);
		}
	});

	//获取子级区域
	function getChildAddr(id){
		if(!id) return;
		$.ajax({
			url: "/include/ajax.php?service=info&action=addr&type="+id,
			type: "GET",
			dataType: "jsonp",
			success: function (data) {
				if(data && data.state == 100){
					var list = data.info, html = [];

					html.push('<div class="sel-group">');
					html.push('<button class="sel">'+langData['siteConfig'][22][96]+'<span class="caret"></span></button>');  //不限
					html.push('<ul class="sel-menu">');
					html.push('<li><a href="javascript:;" data-id="'+id+'">'+langData['siteConfig'][22][96]+'</a></li>');  //不限
					for(var i = 0; i < list.length; i++){
						html.push('<li><a href="javascript:;" data-id="'+list[i].id+'">'+list[i].typename+'</a></li>');
					}
					html.push('</ul>');
					html.push('</div>');

					$("#addr").before(html.join(""));

				}
			}
		});
	}


	//有效期
	$("#valid").click(function(){
		WdatePicker({
			el: 'valid',
			doubleCalendar: true,
			isShowClear: false,
			isShowOK: false,
			isShowToday: false,
			minDate: '%y-%M-{%d+1}',
			onpicking: function(dp){

			}
		});
	});

	//价格开关
	$("input[name=price_switch]").bind("click", function(){
		if($(this).is(":checked")){
			$(".priceinfo").hide();
		}else{
			$(".priceinfo").show();
		}
	});

	// 设置主图
	$('#listSection2').delegate(".setMain",'click',function(){
		console.log('111')
		var t = $(this);
		var li = t.closest('.pubitem');
		$(".listSection").prepend(li)
	})

    // 手机号修改时，显示输入验证码
	$('#tel').change(function(){
		var val = $(this).val();
        if(!customFabuCheckPhone) return;
		if(val == bindTel){
			$('.pCode').addClass('fn-hide')
		}else{
			$('.pCode').removeClass('fn-hide')
		}
	})
	
	//提交发布
	$("#submit").bind("click", function(event){
		event.preventDefault();
		if($('#addr').val() == ''){
			$('#addr').val($('#selAddr .addrBtn').attr('data-id'));
		}
		var now = parseInt((new Date()).valueOf()/1000); //当前时间戳
		if($('#selAddr .addrBtn').attr('data-ids')){
			var addrids = $('#selAddr .addrBtn').attr('data-ids').split(' ');
			$('#cityid').val(addrids[0]);
		}
		var t       = $(this),
				typeid  = $("#typeid").val(),
				price   = $("#price").val(),
				addr    = $("#addr").val(),
				// person  = $("#person"),
				tel     = $("#tel"),
				valid   =  Number($(".endSelBox li.on_chose").length ? $(".endSelBox li.on_chose").attr('data-time') : 0);
                validtime = oldValid > parseInt((new Date()).valueOf()/1000) && waitPay == '0' ? 0 : valid;
      			valid = valid * 1 + (oldValid > parseInt((new Date()).valueOf()/1000) ? oldValid * 1 : parseInt((new Date()).valueOf()/1000))
				$("#addidArr").val($(".addrBtn").attr('data-id'))
				$(".addrBtn span").remove();
				$("#addrArr").val($('.addrBtn').text().replace(/\//g,' '))

		if(t.hasClass("disabled")) return;

		var offsetTop = 0;
		if(!typeid){
			$.dialog.alert(langData['siteConfig'][20][342]);  //分类ID获取失败，请重新选择类目！
			return false;
		}
      	// if(!(/^1[3|4|5|6|7|8][0-9]\d{4,8}$/.test(tel.val()))){
  if(!(/^1[0-9][0-9]\d{4,8}$/.test(tel.val())) && $('#areaCode').val() == '86'){
			tel.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+telErrTip);
 		 offsetTop = offsetTop == 0 ? tel.offset().top : offsetTop;
		 return false;
		}

		// //验证标题
		// var exp = new RegExp("^" + titleRegex + "$", "img");
		// if(!exp.test(title.val())){
		// 	title.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+titleErrTip);
		// 	offsetTop = title.offset().top;
		// }
		ue.sync();
		if(ue.getContentTxt() == ''){
			$.dialog.alert('请输入内容');
			return false;
		}

		$("#itemList").find("input, .radio, .sel-group").each(function() {
			var t = $(this), dl = t.closest("dl");

			//下拉菜单
			if(t[0].tagName == "DIV" && t[0].className == "sel-group"){
				if(dl.find("input[type=hidden]").val() == "" && dl.data("required") == 1){
					dl.find(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+dl.find(".sel-group:eq(0)").attr("data-title"));
					offsetTop = offsetTop == 0 ? dl.offset().top : offsetTop;
				}

			//单选
			}else if(t[0].tagName == "DIV" && t[0].className == "radio"){
				if(dl.find("input[type=hidden]").val() == "" && dl.data("required") == 1){
					dl.find(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+dl.find(".radio").attr("data-title"));
					offsetTop = offsetTop == 0 ? dl.offset().top : offsetTop;
				}

			//多选
			}else if(t[0].tagName == "INPUT" && t[0].type == "checkbox"){
				if(dl.find("input:checked").length <= 0 && dl.data("required") == 1){
					dl.find(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+dl.find(".checkbox").attr("data-title"));
					offsetTop = offsetTop == 0 ? dl.offset().top : offsetTop;
				}

			//文本
			}else if(t[0].tagName == "INPUT" && t[0].type == "text"){
				if(t.val() == "" && dl.data("required") == 1){

					//价格
					if(t[0].name == "price"){
						t.parent().siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+t.attr("data-title"));
					}else{
						t.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+t.attr("data-title"));
					}
					offsetTop = offsetTop == 0 ? t.offset().top : offsetTop;
				}
			}

		});

		
		// console.log(ue.getContentTxt())

		//验证区域
		if(addr == "" || addr == 0){
			$("#selAddr .tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+$("#selAddr .sel-group:eq(0)").attr("data-title"));
			offsetTop = offsetTop == 0 ? $("#selAddr").offset().top : offsetTop;
		}

		//验证联系人
		// var exp = new RegExp("^" + personRegex + "$", "img");
		// if(!exp.test(person.val())){
		// 	person.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+personErrTip);
		// 	offsetTop = offsetTop == 0 ? person.offset().top : offsetTop;
		// }

		// //验证手机号码
		var exp = new RegExp("^" + telRegex + "$", "img");
		if(!exp.test(tel.val())){
			tel.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+telErrTip);
			offsetTop = offsetTop == 0 ? tel.offset().top : offsetTop;
		}

		if($('#vercode').val() == '' && !$(".pCode").hasClass('fn-hide')){
				$.dialog.alert('请输入验证码');  //加载中，请稍候
				return false;
		}

		//验证有效期
		// if(valid.val() == 0 || valid.val() == ""){
		// 	valid.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+langData['siteConfig'][20][22]);  //请选择有效期！
		// 	offsetTop = offsetTop == 0 ? valid.offset().top : offsetTop;
		// }

		if(offsetTop){
			$('html, body').animate({scrollTop: offsetTop - 5}, 300);
			return false;
		}

		var allCountPrice = 0;
		if($('.endSelBox .on_chose').length > 0){
			 allCountPrice =  Number($('.endSelBox .on_chose').attr('data-price'))
		}
		var amountTxt = allCountPrice > 0 ? ('&amount=' + allCountPrice) : '';
		var imgArr = [];
		$("#listSection1 .pubitem").each(function(){
			var img = $(this).find('img').attr('data-val')
			imgArr.push(img)
		})
		var vidArr = [], vidPoster = [];
		$("#listSection2 .pubitem").each(function(){
			var video = $(this).find('video').attr('data-val');
            var videoPoster = $(this).find('video').attr('data-poster');
			vidArr.push(video)
			vidPoster.push(videoPoster)
		})
		console.log(allCountPrice)
		var form = $("#fabuForm"), action = form.attr("action"), url = form.attr("data-url");
		data = form.serialize()+'&username='+(username?username:$("#tel").val())+'&validtime='+validtime+'&valid='+valid+amountTxt+'&imgArr='+imgArr.join('||')+'&video='+vidArr.join(',')+'&videoPoster='+vidPoster.join(',');
		if($("#topDay").val()){
			data = data + '&top=' + $("#topDay").val()
		}
		t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");  //提交中
		if(fabuid){
			action = "/include/ajax.php?service=info&action=edit&moneyType=1&id="+fabuid
		}
		$.ajax({
			url: action,
			data: data,
			type: "POST",
			dataType: "json",
			success: function (data) {
				if(data && data.state == 100){
					$("input[name='aid']").val(data.info.aid);
					if(data.info.aid){
						fabuid = data.info.aid;
					}
					if(data.state == 100 && !data.info.order_amount){
						fabuPay.check(data, url, t)
					}else{
						console.log(111)
						checkPay(data, url, t);
					}

				}else{
					$.dialog.alert(data.info);
					t.removeClass("disabled").html(langData['siteConfig'][11][19]);   //立即发布
					$("#verifycode").click();
				}

			},
			error: function(){
				$.dialog.alert(langData['siteConfig'][20][184]);  //加载中，请稍候
				t.removeClass("disabled").html(langData['siteConfig'][11][19]);//立即发布
				$("#verifycode").click();
			}
		});


	});


//   $("body").delegate('.radioBox input','click',function(){
// 	let t = $(this)
// 	let radiobox = $(this).parents('.radioBox')
// 	let require = radiobox.data('required')
// 	console.log(t.attr('checked'))
// 	if(t.attr('checked') && require == 0){
// 		radiobox.find('li').removeClass('on_chose')
// 			radiobox.find('input[type="radio"]').attr('checked',false)
// 	}
//   })	
  $('.close_payPop').click(function(){
		$("#submit").removeClass('disabled').text('立即提交')
	})

	//视频预览
	$("#listSection3").delegate(".enlarge", "click", function(event){
		event.preventDefault();
		var href = $(this).attr("href");

		window.open(href, "videoPreview", "height=500, width=650, top="+(screen.height-500)/2+", left="+(screen.width-650)/2+", toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, status=no");
	});

	//删除文件
	$(".spic .reupload").bind("click", function(){
		var t = $(this), parent = t.parent(), input = parent.prev("input"), iframe = parent.next("iframe"), src = iframe.attr("src");
		delFile(input.val(), false, function(){
			input.val("");
			t.prev(".sholder").html('');
			parent.hide();
			iframe.attr("src", src).show();
		});
	});

	function checkPay(oderinfo, url, t){
		var moduleText = $("#module").val()
    $("#tourl").val(payReturn);
		info = oderinfo.info;

    $.ajax({
      type: 'POST',
      url: '/include/ajax.php?service=member&action=checkFabuAmount&module='+moduleText,
      dataType: 'json',
      success: function(data){

        if(data){
          // t.removeClass("load");
          // 需要支付
          if(data.info.needpay == "1"){

						cutDown = setInterval(function () {
							$(".payCutDown").html(payCutDown(info.timeout));
						}, 1000)

						var datainfo = [];
						for (var k in info) {
							datainfo.push(k + '=' + info[k]);
						}
						// $("#amout").text(info.order_amount); //原来的代码
						$("#amout").text(oderinfo.info.order_amount);
						// $("#amount").text(oderinfo.info.order_amount);
			            // $('#payform input[name="amount"]').val(oderinfo.info.order_amount)
						$('.payMask').show();
						$('.payPop').show();
						if($('#payform input[name="balance"]').length == 0){
				      $('#payform').append('<input type="hidden" value="'+info.order_amount+'" name="balance">')
				    }else{
				      $('#payform input[name="balance"]').val(info.order_amount)
				    }
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

						ordernum  = info.ordernum;
						order_amount = info.order_amount;
						if(validTrade){
							clearInterval(validTrade)
						}
						validTrade = setInterval(function(){
							checkPayResult(ordernum)
						},2000)
						$("#ordertype").val('fabupay');
						$("#service").val('member');
						var src = masterDomain + '/include/qrPay.php?' + datainfo.join('&');
						$('#payQr img').attr('src', masterDomain + '/include/qrcode.php?data=' + encodeURIComponent(src));

	        }
				}
      },
      error: function(){
        $.dialog.alert(langData['siteConfig'][20][183]);  //网络错误，请稍候重试！
        t.removeClass("load");
      }
    })
	}

	// 验证支付成功
	function checkPayResult(ordernum){
	      var tt = this;
	      $.ajax({
	        type: 'POST',
	        async: false,
	        url: '/include/ajax.php?service=member&action=tradePayResult&order='+ordernum,
	        dataType: 'json',
	        success: function(str){
	          if(str.state == 100 && str.info != ""){
	            clearInterval(validTrade);
	            var nowDate = parseInt((new Date()).valueOf()/1000)
	            var nowValid = nowDate;
	            var addValid = Number($('.endSelBox li.on_chose').attr('data-time'));
	            var amount = Number($('.endSelBox li.on_chose').attr('data-price'));
	            nowValid = nowValid * 1 + addValid;
	            updateValid(nowValid,fabuid,1)

	          }
	        }
	      });

	    }

			// 更新有效期
			function updateValid(valid,editId,haspayVal){
			    var url = '/include/ajax.php?service=info&action=zvalid&id='+editId;
			    var amount = Number($('.endSelBox li.on_chose').attr('data-price'));
					// console.log(valid,editId,haspayVal,amount)
					// return false;
			    if(haspayVal){
			      var dataTo = {
			        hasPay:1,
			        valid:valid,
			        amount:amount,
			      }
			    }else{
			      var dataTo = {
			        valid:valid,
			        amount:amount,
			      }
			    }
			    $.ajax({
						url: url,
						data: dataTo,
						type: "POST",
						dataType: "json",
						success: function (data) {
			        if(data.state == 100){
								alert('成功增加信息曝光时长');
								window.location.href = payReturn;
			        }
			      },
			      error:function(data){
			        alert(data.info)
			      },
			    })
			  }
	// 弹出分类选择
	$("#typename,.typeParBox").click(function(){
		$(".typeMask,.typePop").show();
	});

	// 隐藏分类
	$(".typePop .popTit a.close_pop").click(function(){
		$(".typeMask,.typePop").hide();
	});

	// 选择分类
	$(".catagoryBox dd a.typechose").click(function(){
		var t = $(this);
		$(".catagoryBox dd a.typechose").removeClass('on_chose')
		t.addClass('on_chose');
		typeid = t.attr('data-typeid');
		typename = t.attr('data-typename');
		var dl = t.closest('dl');
		typeparid = dl.attr('data-pid');
		typepar = dl.find('dt').text();
		$("#typename").val(typename);
		$("#typeid").val(typeid);
		$("#typePar").val(typepar);
		$("#typeparid").val(typeparid);
		$(".typeParBox").removeClass('fn-hide')
		$(".typePop .popTit a.close_pop").click();
		console.log(typeid)
		// getCustom(typeid);
        location.href = 'fabu-info.html?typeid=' + typeid;

	});


	// 获取当前分类下的自定义内容
	 function getCustom(typeid){
		$.ajax({
      url: '/include/ajax.php?service=info&action=typeDetail&id='+typeid,
      type: "POST",
      dataType: "json",
      success: function (data) {
        if(data.state == 100){
					var currType = data.info[0];

					// 自定义内容
					if(currType.item && currType.item.length > 0){
						var currCst = currType.item;  //当前分类下的自定义内容
						var cusHtml = []
						for(var i = 0; i < currCst.length ; i++){
							var typeRequired = currCst[i].required=='1' ? '<span>*</span>':''; //dl的类名

							if(currCst[i].formtype == 'radio'){
								cusHtml.push('<dl class="radioBox" data-id="'+currType.id+'" data-required="'+currCst[i].required+'">');
								cusHtml.push('<dt>'+typeRequired+currCst[i].title+'</dt>');
								cusHtml.push('<dd> <ul>');
								 for(var n = 0; n <currCst[i].options.length; n++){
									 var choseOn = '',checked='';
									 if(currCst[i].default.indexOf(currCst[i].options[n]) > -1){
										 choseOn = 'on_chose';
										 checked="checked";
									 }
									 cusHtml.push('	<li class="'+choseOn+'"><input type="radio" name="huoniao_'+currCst[i].field+'" value="'+currCst[i].options[n]+'" '+checked+'><s><i></i></s><span>'+currCst[i].options[n]+'</span></li>');
								 }
								cusHtml.push('</ul> </dd> </dl>');
							}else if(currCst[i].formtype == 'checkbox'){

								cusHtml.push('<dl class="AllcheckBox fn-clear" data-id="'+currType.id+'" data-required="'+currType.required+'">');
								cusHtml.push('<dt>'+typeRequired+currCst[i].title+'</dt>');
								cusHtml.push('<dd> <div class="checkbox">');
								 for(var n = 0; n <currCst[i].options.length; n++){
									 var choseOn = '',checked='';
	 								if(currCst[i].default.indexOf(currCst[i].options[n]) > -1){
	 									choseOn = 'on_chose';
	 									checked="checked";
	 								}
									 cusHtml.push('	<label><input type="checkbox" name="huoniao_'+currCst[i].field+'[]" value="'+currCst[i].options[n]+'" '+checked+'>'+currCst[i].options[n]+'</label>');
								 }
								cusHtml.push('</div> </dd> </dl>');
							}else{
								console.log(currCst[i])
								cusHtml.push('<dl  data-id="'+currType.id+'" data-required="'+currType.required+'"><dt>'+typeRequired+currCst[i].title+'</dt><dd>');
								cusHtml.push('<div class="inpBox"><input type="text" placeholder="请填写'+currCst[i].title+'" name="huoniao_'+currCst[i].field+'" value="'+currCst[i].default[0]+'">');
								cusHtml.push('</div> </dd> </dl>');
							}
						}
						$('.customizeBox').show()
						$(".customizeBox .cContent").html(cusHtml.join(''))
					}else{
						$('.customizeBox').hide()
						$(".customizeBox .cContent").html('');
					}

					// 标签
					$('.tabArrs').remove();
					$("#feature").val('');
					if(currType.label && currType.label.length > 0){
						var dl = $("#feature").closest('dl');
						for(var m=0; m<currType.label.length; m++){
							var feObj = currType.label[m];
							dl.append('<dd class="tabArrs" data-id="'+feObj.id+'"><span>'+feObj.name+'</span></dd>')
						}
					}
				}
      },
      error: function(){}
    });
	}

	$('body').delegate('.tabArrs span','click',function(){
		var t = $(this);
		// t.toggleClass('on_chose');
		let currid = $(this).attr('data-id');
		$(".tabArrs span[data-id='"+currid+"']").toggleClass('on_chose');
		var idArr = []
		$('.tabArrs span').each(function(){
			var id= $(this).attr('data-id');
			if($(this).hasClass('on_chose')){
				idArr.push(id)
			}
		});
		let arr = Array.from(new Set(idArr));
		$("#feature").val(arr.join(','))
	});

	if($('.endSelBox li.on_chose').length == 0){
		$('.endSelBox li').eq(0).addClass('on_chose')
	}
	// 选择有效期
	$('.endSelBox li').click(function(event) {
		/* Act on the event */
		var t = $(this);
		if(optype == 'edit'){
			t.toggleClass('on_chose').siblings('li').removeClass('on_chose');
		}else{
			if($('.endSelBox li.default_valid').length > 0){
				t.toggleClass('on_chose').siblings('li').removeClass('on_chose');
				if($('.endSelBox li.on_chose').length == 0){
					$('.endSelBox li.default_valid').addClass('on_chose')
				}
			}else{
				t.addClass('on_chose').siblings('li').removeClass('on_chose')
			}
		}

	});

	var count = atlasMax;
	$('.filePickerBox').each(function(i){
		// var ind = i+1;
        var ind = parseInt($(this).attr('id').replace('listSection', ''));
		var fileCount = 0,$list = $("#listSection"+ind),picker = $("#filePicker"+ind);

		// 初始化Web Uploader
			uploader_iv = WebUploader.create({
				auto: true,
				swf: pubStaticPath + 'js/webuploader/Uploader.swf',
				server: ind == 1 ? server_image_url : server_video_url,
				pick: '#filePicker'+ind,
				fileVal: 'Filedata',
				accept: {
					title: ind == 1 ?'Images':'Video',
					extensions: ind == 1 ?'gif,jpg,jpeg,bmp,png':'mp4,wmv,mov,3gp,rmvb,mkv,flv,asf',
					mimeTypes: ind == 1 ?'.gif,.jpg,.jpeg,.png':'.mp4,.mov'
					// title: 'Images',
					// extensions: 'gif,jpg,jpeg,bmp,png',
					// mimeTypes: 'image/*'
				},
	      chunked: true,//开启分片上传
	            // threads: 1,//上传并发数
				fileNumLimit:  ind == 1?count:1,
				// fileSingleSizeLimit: atlasSize
			});


			uploader_iv.on('beforeFileQueued', function(file) {
				if(file.type.indexOf('image') > -1){  //上传文件为图片
					uploader_iv.options.server = server_image_url;
				}else{

					uploader_iv.options.server = server_video_url;
				}
			});

			uploader_iv.on('fileQueued', function(file) {
				console.log('fileQueued')
				var pick = $(this.options.pick);
				//先判断是否超出限制
				if(fileCount == atlasMax){
			    alert(langData['siteConfig'][38][24]);//文件数量已达上限
					uploader_iv.cancelFile( file );
					return false;
				}

				fileCount++;
				addFile(file);
				updateStatus(pick);
			});



			// 文件上传过程中创建进度条实时显示。
			uploader_iv.on('uploadProgress', function(file, percentage){
				var $li = $('#'+file.id),
				$percent = $li.find('.progress span');

				// 避免重复创建
				if (!$percent.length) {
					$percent = $('<p class="progress"><span></span></p>')
						.appendTo($li)
						.find('span');
				}
				$percent.css('width', percentage * 100 + '%');

				//音频文件浏览器右下角增加上传进度
				if(file.type == 'video'){
					var progressFixed = $('#progressFixed_' + file.id);
					if(!progressFixed.length){
						var $i = $("<b id='progressFixed_"+file.id+"'>");
				        $i.css({bottom: 0, left: 0, position: "fixed", "z-index": "10000", background: "#a5a5a5", padding: "0 5px", color: "#fff", "font-weight": "500", "font-size": "12px"});
						$("body").append($i);
						progressFixed = $('#progressFixed_' + file.id);
					}
					progressFixed.text(""+langData['siteConfig'][38][25]+"："+parseInt(percentage * 100) + '%');//上传进度
					if(percentage == 1){
						progressFixed.remove();
					}
				}

			});
			uploader_iv.on('uploadSuccess',function(file,response){
					// console.log(response)
			  	window.webUploadSuccess && window.webUploadSuccess(file, response, picker);
					var $li = $('#'+file.id), listSection = $li.closest('.listSection');
					listSection.show();
					if(response.state == "SUCCESS"){
						var img = $li.find("img");
						if (img.length > 0) {
							img.attr("data-val", response.url).attr("data-url", response.turl).attr("src", response.turl);
							$li.find(".enlarge").attr("href", response.turl);
							// $li.closest('.listImgBox').find('.deleteAllAtlas').show();
							// 此处应该赋值
				      if(fileCount == atlasMax && atlasMax == 1){
				        $(this.options.pick).closest('.wxUploadObj').hide();
				  			return false;
				  		}
					}

					var video = $li.find("video");
					if(video.length > 0){
						video.attr("data-val", response.url).attr("data-url", response.url).attr("data-poster", response.poster).attr("src", response.turl).attr("poster", "/include/attachment.php?f=" + response.poster);
						$li.find(".enlarge").attr("href", response.turl);
						// if(fileCount == atlasMax && atlasMax == 1){
							$(this.options.pick).closest('.btn-section').hide();
							return false;
						// }
					}


				}else{
                    $li.remove();
                    fileCount--;
                    alert(response.state);
                }
			})
			uploader_iv.on('uploadComplete',function(file,response){
				  $('#'+file.id).find('.progress').remove();
			})

			$('body').delegate('.li-rm', 'click', function(event) {
				var $btn = $(this),$li = $btn.closest('.pubitem'),list = $btn.closest('.filePickerBox')
				if($li.find('video').length >= 1){
					var path = $li.find('video').attr('data-val')
					delFile(path, false, 'video', function(){
						$li.remove();
					});
					list.find('.btn-section').show()
				}else{
					var path = $li.find('img').attr('data-val');
					delFile(path, false, 'image',function(){
						$li.remove();
					});
				}
				fileCount--;
				if(fileCount == 0){
					$('#listpic').val('')
				}
                if(fileCount < atlasMax){
                    $('.wxUploadObj').show();
                }
			});
			//删除已上传的文件
			function delFile(b, d, d, c) {
				var type = "delVideo"
				if(d == 'image'){
					type = 'delImage'
				}
				var g = {
					mod: "info",
					type: type,
					picpath: b,
					randoms: Math.random()
				};
				$.ajax({
					type: "POST",
					cache: false,
					async: d,
					url: "/include/upload.inc.php",
					dataType: "json",
					data: $.param(g),
					success: function(a) {
						try {
							c(a)
						} catch(b) {}
					}
				})
			}

			// 新增
			function addFile(file){
				// console.log(file)
				if(file.type.indexOf('image') > -1){
					var $li = $('<div id="' + file.id + '" class="pubitem"><a href="" target="_blank" title="" class="enlarge"><img></a><a class="li-rm" href="javascript:;"></a><span class="setMain">设为主图</span><span class="mainImg">主图</span></div>');//删除图片
					var $img = $li.find('img');
					// 创建缩略图
					uploader_iv.makeThumb(file, function(error, src) {
						$img.closest('.listSection').show();
						if(error){
							$list.show();
							$img.replaceWith('<span class="thumb-error">'+langData['siteConfig'][6][177]+'...</span>');//上传中
							return;
						}
						$img.attr('src', src);
					});
				}else{
					var $li = $('<div id="' + file.id + '" class="pubitem videoItem"><a href="javascript:;" target="_blank" title="" class="enlarge"><video></video></a><a class="li-rm" href="javascript:;"></a></div>');//删除图片
					var $video = $li.find('video');
					// $video.attr('src', src);
				}

				var $btns = $li.find('.li-rm');


				$btns.on('click', function(){
					uploader_iv.cancelFile( file );
					uploader_iv.removeFile(file, true);
				});
				// $list.prepend($li);
				picker.closest('.btn-section').before($li);
			}


			function updateStatus(obj){
				var len = $(".listSection .pubitem").length;
				if(length == 0){
					$(".wxUploadObj").show()
				}else{
					if(atlasMax == fileCount){
						$(".wxUploadObj").hide()
					}
				}
			}

	})






		// 设为主图
		$("body").delegate('.setMain', 'click', function(event) {
			var t = $(this);
			var li = t.closest('.pubitem');
	  	$("#listSection1").prepend(li)

		});

		//极速验证
var dataGeetest = "";
  var ftype = "phone";

    //发送验证码
 function sendPhoneVerCode(captchaVerifyParam,callback){
    var btn = $('.codebtn');
    if(btn.filter(":visible").hasClass("disabled")) return;

    var vericode = "";
    // var vericode = $("#vdimgck").val();  //图形验证码
    // if(vericode == '' && !geetest){
    //   alert(langData['siteConfig'][20][170]);
    //   return false;
    // }

    var number = $('#tel').val();
    if (number == '') {
      alert(langData['siteConfig'][20][27]);
      return false;
    }

   if(isNaN(number)){
      alert(langData['siteConfig'][20][179]);
      return false;
    }else{
      ftype = "phone";
    }

    btn.addClass("disabled");

    if(ftype == "phone"){

      var action = "getPhoneVerify";
      var dataName = "phone";
	  let param = "vericode="+vericode+"&areaCode="+$("#areaCode").val()+"&phone="+number
      if(captchaVerifyParam && geetest == 2){
        param = param + '&geetest_challenge=' + captchaVerifyParam
      }else if(geetest == 1 && captchaVerifyParam){
        param = param +  captchaVerifyParam
      }
      $.ajax({
        url: masterDomain+"/include/ajax.php?service=siteConfig&action=getPhoneVerify&type=verify",
        data: param,
        type: "GET",
        dataType: "jsonp",
        success: function (data) {
			if(callback){
				callback(data)
			}
          //获取成功

          if(data && data.state == 100){
          // alert('验证码已发送');
           countDown(60, $('.codebtn'));
          //获取失败
          }else{
            btn.removeClass("disabled");
            if(data.info != '图形验证错误，请重试！'){
				alert(data.info);
			}
          }
        },
        error: function(){
          btn.removeClass("disabled");
          alert(langData['siteConfig'][20][173]);
        }
      });
    }
  }
  if(!geetest){
    $('.codebtn').click(function(){
      if(!$(this).hasClass("disabled")){
        sendPhoneVerCode();
      }
    });
  }else{
	captchaVerifyFun.initCaptcha('web','#codeButton',sendPhoneVerCode)
    //获取验证码
    $('.codebtn').click(function(){
      if($(this).hasClass("disabled")) return;
      var number   = $('#tel').val();
      if (number == '') {
        $.dialog.alert(langData['siteConfig'][20][27]);   //请输入您的手机号
        return false;
      } else {
        if(isNaN(number)){
          $.dialog.alert(langData['siteConfig'][20][179]);  //账号错误
          return false;
        }else{
          ftype = "phone";
    	}

         //弹出验证码
		if (geetest == 1) {
			captchaVerifyFun.config.captchaObjReg.verify();
		} else {
			$('#codeButton').click()
		}

      }
    });

	$('.topNormalUl ').delegate('li','click',function(){
		let day = $(this).attr('data-day');

		if($(this).hasClass('on_chose')){
			$(this).removeClass('on_chose');
		}else{
		$(".topNormalUl .feeItem").removeClass('on_chose');

			$(this).addClass('on_chose');
		}
		$("#topDay").val(day || '')
		console.log($("#topDay").val())
	});

	$('body').delegate('.slide_btn','click',function(){
		// 展开/收齐完善信息
		$(".slide_btn span").text($(this).closest('.customBox').hasClass('slideOpen')?'展开':'收起')
		$(this).closest('.customBox').toggleClass('slideOpen')
	})
  }

  getTopNormal(); //获取置顶数据


  $(".bg_mask").click(function(){
	$(".slide_btn ").click()
  })
});


//倒计时
function countDown(time, obj){
	obj.html(time+'秒后重发').addClass('disabled');
	mtimer = setInterval(function(){
		obj.html((--time)+'秒后重发').addClass('disabled');
		if(time <= 0) {
			clearInterval(mtimer);
			obj.html('重新发送').removeClass('disabled');
		}
	}, 1000);
}

function getTopNormal(){

	$.ajax({
        url: "/include/ajax.php?service=siteConfig&action=refreshTopConfig&module=info&act=detail&typeid="+typeid,
        type: "GET",
        dataType: "json",
        success: function (data) {
			if(data.state == 100){
				let topNormal = data.info.config.topNormal;
				for(let i=0;i<topNormal.length;i++){
					let item = topNormal[i];
					let html = `
					<li class="feeItem" data-day="${item.day}">
						<h3>
							${item.price ? ('<em>'+echoCurrency("symbol")+'</em>'+ parseFloat(item.price)):'免费'}
						</h3>
						<p>置顶${item.day}天</p>
					</li>`;
					$('.topNormalUl').append(html);
				}
				if(topNormal.length > 0){
					$('.topSetbox').show()
				}
			}
        }
	});
}

// 获取页面输入的内容
function getSearchKey(){
	let desc = ue.getContentTxt(); //填写的内容
	// 获取完善信息中填写的内容
	let optionArr = [];
	let objDom = $('.customBox');
	if(objDom.is(':hidden') && $('.aiFitConBox .customizeBox').length > 0){
		objDom = $('.aiFitConBox .customizeBox')
	}
	objDom.find('.cContent dl').each(function(){
		let t = $(this)
		let key = t.children('dt').text();
		let type = 'text';
		let val = ''
		if(t.hasClass('radioBox')){
			type = 'radio';
			val = t.find('input[type="radio"]:checked').val();
		}else if(t.hasClass('AllcheckBox')){
			type = 'checkbox';
			let checkVal = [];
			t.find('input[type="checkbox"]:checked').each(function(){
				var t = $(this), val = t.val();
				checkVal.push(val);

			})
			val = checkVal.join('、');
		}else{
			val = t.find('input').val();
		}

		if(val){
			optionArr.push(`${key}:${val}`)
		}
	})

	// 获取特色标签
	let tags = [];
	$('.tabArrs .on_chose').each(function(){
		tags.push($(this).text())
	})
	tags = Array.from(new Set(tags))
	if(tags.length){
		optionArr.push(`特色标签:${tags.join('、')}`)
	}
	let keywordArr = [];
	keywordArr.push(typename);
	if(desc){
		keywordArr.push(desc)
	}
	if(optionArr.length){
		keywordArr.push(optionArr.join(','))
	}
	var typename_all = $("#typePar").val() + '-' +  $("#typename").val()
	let obj = {
		typename:typename_all,
		note:desc.trim(),
		options:optionArr
	}
	
	return obj
}
// 获取页面输入的内容
function handleData(data){
	ue.setContent(data.content.replace(/\n/g,'<br>'))
}

/**
 *  此操作是解决分类信息表单转移时 数据无法自动更新
 * @param {*} type  1 => 从下方转移到ai里  2 =>  从ai里转移到下方
 */
function solveData(type,callback){
	// 处理表单中的数据
	let arr = [];
	if(type == 1){
		$('.customBox .customizeBox dl').each(function(){
			let t = $(this)
			let type = 'text'
			let key = t.attr('data-name'),
				value = ''
			if(t.hasClass('AllcheckBox')){
				type = 'checkbox'
				let val_arr = [];
				t.find('input[type="checkbox"]:checked').each(function(){
					var tt = $(this), val = tt.val();
					val_arr.push(val);
				})
				value = val_arr
			}else if(t.hasClass('radioBox')){
				type = 'radio';
				let val_arr = [];
				t.find('input[type="radio"]:checked').each(function(){
					var tt = $(this), val = tt.val();
					val_arr.push(val);
				})
				value = val_arr
			}else{
				value = t.find('input').val()
				
			}
	
			arr.push({
				type:type,
				key:key,
				value:value
	
			})
		})
		if(callback){
			callback(arr)
		}
	
		$('.customBox').hide()
		$('.outerTabArrs').hide()
	}else{
		$('.outerTabArrs').show()
		$('.customBox').show()

		let objDom = $('.aiFitConBox .customizeBox');
		objDom.find('dl').each(function(){
			let dl = $(this)
			let key = $(this).attr('data-name')
		
			if(dl.hasClass('AllcheckBox') ){
				let type = dl.hasClass('AllcheckBox') ? 'checkbox' : 'radio'
				dl.find('input[type="'+ type +'"]').each(function(){
					let ind = $(this).index(),val = $(this).val();
					$('.customBox .customizeBox dl[data-name="'+key+'"]').find('input[type="'+ type +'"][value="'+val+'"]').attr('checked',$(this).attr('checked'))
				})
			}else if(dl.hasClass('radioBox')){
				let val = dl.find('input[type="radio"]:checked').val();
				$('.customBox .customizeBox dl[data-name="'+key+'"]').find('input[type="radio"][value="'+val+'"]').trigger('click')
			}else{
				$('.customBox .customizeBox dl[data-name="'+key+'"]').find('input').val(dl.find('input').val())
			}
		})
	}

	
}