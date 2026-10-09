
var jian = 0;


$(function(){


	$(".online_contact").click(function(){
		var t = $(this),id = t.attr('data-id');
			imconfig['chatid'] = id; 
		if(t.attr('data-type') == 'detail'){
			var pro = t.closest('.goods').find('.sp');
			imconfig['title'] = pro.find('.t2 a').text()
			imconfig['price'] = pro.attr('data-price')
			imconfig['imgUrl'] = pro.find('.t1 a img').attr('src')
			imconfig['link'] = pro.find('.t2 a').attr('href')
		}
		
		console.log(imconfig)
		setTimeout(function(){

			$('.chat_to-Link').trigger('click');
		},100)

	})


	// 获取运费
	function newGetLogisticPrice(t,func){
		if(t.hasClass('noClick')) return false;
		var sid = t.closest('.goods .sj').attr('data-id')
		t.addClass('noClick')
		var pros = $("#pros").val();
		var addressid = $("#addressid").val();
		var data = [];
		data.push('addressid='+addressid)
		data.push('pros='+pros)
		data.push('sid='+sid)
		// var confirmTo = confirmtype == 2 ? $(".confirmTab li.active").index() : confirmtype;
		var confirmTo = 1;

		// var confirmTo = $("#confirmType").val();
		console.log(confirmTo)
		$.ajax({
		  url: '/include/ajax.php?service=shop&action=getLogisticPrice&confirmtype='+confirmTo,
		  data: data.join('&'),
		  type: "POST",
		  dataType: "json",
		  success: function (data) {
			  t.removeClass('noClick')
			  // 运费改变  配送方式也可能改变
		        if(data.state == 100){
		        	let psname = '';
		        	if(data.info[0].logistictype == 0){
		        		psname = '普通快递'
		        	}else if(data.info[0].logistictype == 1){
						psname = '商家配送'
		        	}else if(data.info[0].logistictype == 2){
		        		psname = '平台配送'
		        	}
		        	if(psname){
		        		$(".logistic .ps").text(psname)

		        	}

		        }
			func(data)
			
		  },
		  error: function(){
			  t.removeClass('noClick')
		  }
		});
	}

	jifen = parseInt($(".integral .jifen").text());
	//获取分店 当前位置的坐标 取出最近的分店
	$(".sj").each(function(){
		var t = $(this), id = t.data('id');
		// getBranchStore(t, id, branchid);
	});
	function getBranchStore(t, id, branchid){
		var data = [];
		var lng = $(".part1Con .on").data('lng'), lat = $(".part1Con .on").data('lat');
		if(id){
			data.push("branchid="+id);
			if(lng != undefined && lat != undefined){
				data.push("lng="+lng);
				data.push("lat="+lat);
			}
			data.push("orderby=3");
			$.ajax({
				url: masterDomain+"/include/ajax.php?service=shop&action=storeBranch",
				data: data.join("&"),
				type: "POST",
				dataType: "jsonp",
				success: function (data) {
					if(data && data.state == 100){
						var list = data.info.list, html = [];
						for(var i = 0; i < list.length; i++){
							var selected = ''
							if(branchid == list[i].id){
								selected = 'selected';
							}
							html.push('<option '+selected+' value="'+list[i].id+'">'+list[i].title+'</option>');
						}
						t.find("#branchid").html(html.join(""));
					}else{
						t.find("#branchid").html('');
						t.find("#branchids").hide();
					}
				}
			});
		}
	}


	// 展开更多地址
	$('.openAddress').click(function(){
		$(".part1Con").toggleClass('open');
		if($('.part1Con').hasClass("open")){

			$('.openAddress').html('收起地址<s></s>') 
		}else{
			$('.openAddress').html('展开全部地址<s></s>') 
		}
	})

	//标注地图
	$("#mark").bind("click", function(){
		$.dialog({
			id: "markDitu",
			title: langData['siteConfig'][6][92]+"<small>（"+langData['siteConfig'][23][102]+"）</small>",   //标注地图位置<small>（请点击/拖动图标到正确的位置，再点击底部确定按钮。）
			content: 'url:'+masterDomain + '/api/map/mark.php?mod=shop&lnglat='+$("#lnglat").val()+"&city="+map_city+"&addr="+$("#address").val(),
			width: 800,
			height: 500,
			max: true,
			ok: function(){
				var doc = $(window.parent.frames["markDitu"].document),
					lng = doc.find("#lng").val(),
					lat = doc.find("#lat").val(),
					addr = doc.find("#addr").val();
				$("#lnglat").val(lng+","+lat);
				if($("#address").val() == ""){
					$("#address").val(addr);
				}
				var locationData = {
					lng:lng,
					lat:lat,
				}
				$('.addrBtn').text('')
				lnglatGetTown(locationData, function(res){
					
					if(res && res.province){

						var province = res.province.replace('省','').replace('市',''); // 省,直辖市
						var city = res.city.replace('市',''); // 市
						var district = res.district.replace('区','').replace('市','').replace(city,''); // 
						var  town= res.town.replace('镇','').replace('街道',''); // 
						calcAddrid(province,city,district,town)
					}
                    else{
                        $('.addrBtn').text('请选择');
                    }
				})
			},
			cancel: true
		});
	});




	// 坐标转换获取城镇
    function lnglatGetTown(locationData, func) {
        if (locationData) {
            var latlng = locationData.lat + ',' + locationData.lng;
            $.ajax({
                url: '/include/ajax.php?service=siteConfig&action=getLocationByGeocoding&location=' + latlng,
                type: "POST",
                dataType: "json",
                success: function (data) {
                    if (data.info.town) {
                        locationData['town'] = data.info.town;
                        locationData['district'] = data.info.district;
                        locationData['city'] = data.info.city;
                        locationData['lng'] = data.info.lng;
                        locationData['lat'] = data.info.lat;
                        locationData['province'] = data.info.province;
                    }
                    //如果位置名没有获取到，直接使用详情地址
                    if (locationData['name'] == '') {
                        locationData['name'] = locationData['address'];
                    }
                    // HN_Location.cookie('set', locationData);
                    func(locationData);
                },
                error: function () { }
            });
        }
    }


	// 获取当前定位的城市id，区域id
	function calcAddrid(myprovince,mycity,mydistrict,town){

		var cityArr = [myprovince,mycity,mydistrict,town]
		if(myprovince == mycity){
			cityArr = [myprovince,mydistrict,town]
		}
		addridsArr = [];
		if($("#gzAddrArea0 li").length > 0){ //获取过数据
			$("#gzAddrArea0 li").each(function(){
				if($(this).text() == myprovince){
					pid = $(this).attr('data-id');
					addridsArr.push(pid)
					checkCityid(cityArr,1)
				}
			})
		}else{
			checkCityid(cityArr,0)
		}	

	}

	function checkCityid(strArr,type){
		// var promise = new promise((resolve, reject) => {
			
		// })
		$('.loadIcon').removeClass('fn-hide')
		var id = 0;
		switch(type){
			case 0 : 
				id = 0;
				break;
			case 1 : 
				id = pid;
				break;
			case 2 : 
				id = cid;
				break;
			case 3 : 
				id = did;
				break;
		}
		var typeStr = '&type='+id;
		$.ajax({
			url: "/include/ajax.php?service=siteConfig&action=area" + typeStr,
			type: "POST",
			dataType: "jsonp",
			success: function(data){
				if(data && data.state == 100){
					var city = data.info;
					for(var i=0; i<city.length; i++){
						if(city[i].typename == strArr[type] || (city[i].typename == strArr[type] + '区') ||  (city[i].typename == strArr[type] + '省') ||  (city[i].typename == strArr[type] + '市') ||  (city[i].typename == strArr[type] + '镇')  ||  (city[i].typename == strArr[type] + '街道') ){
							switch(type){
								case 0 : 
									pid = city[i].id;
									break;
								case 1 : 
									cid = city[i].id;
									break;
								case 2 : 
									did = city[i].id;
									break;
								case 3 : 
									tid = city[i].id;
									break;
							}
							type++;
							addridsArr.push(city[i].id)
							$(".addrBtn").attr('data-ids',addridsArr.join(' '))
							$(".addrBtn").attr('data-id',addridsArr[addridsArr.length - 1])
							$("#addrid").val(addridsArr[addridsArr.length - 1])
							if(type < strArr.length){
								checkCityid(strArr,type)
							}else{
								$(".addrBtn").attr('data-addrname',strArr.join(' '));
								$(".addrBtn").text(strArr.join('/'))
								
							}
						}else{
							$(".addrBtn").attr('data-ids',addridsArr.join(' '))
							$(".addrBtn").attr('data-id',addridsArr[addridsArr.length - 1])
							$("#addrid").val(addridsArr[addridsArr.length - 1])
							$(".addrBtn").removeClass('gz-no-sel').attr('data-addrname',strArr.join(' '));
							$(".addrBtn").text(strArr.join('/'));
						}
					}
					
				}else{
					$('.loadIcon').addClass('fn-hide')
				}
			}
		})
		
	}

	var addrid = 0, addArr = [];
	setTimeout(function(){
		$("#usePcount, #useBcount, #paypwd").val("");
	}, 500);



	$(".part1Con").delegate(".adrItem", "click", function(e){

		var t=$(this);
		addrid = t.attr("data-id");
		if(e.target == t.find('.revise')[0]){
			//修改地址
			var dl = t;
			$(".popCon .tip .left").html(langData['shop'][5][76]);
			$("#bg,.popup").show();

			//填充数据
			$("#person").val(dl.attr("data-name"));
			$("#mobile").val(dl.attr("data-mobile"));
			$("#address").val(dl.attr("data-address"));
			$("#lnglat").val(dl.attr("data-lng") + ',' + dl.attr("data-lat"));
			var codeNew = dl.attr("data-code");
			if(codeNew != ''){
				$("#areaCode").val(codeNew);
				$('.areaCode i').text("+"+codeNew);
			}else{
				var codeOld = $('.areaCode_wrap li:first-child').data('code')
				$("#areaCode").val(codeOld);
				$('.areaCode i').text("+"+codeOld);
			}

			addArr = dl.attr("data-addr").replaceAll(/ /g,'/');
			var addrids = dl.attr("data-ids");
			var addridArr= addrids.split(' ');
			$('.addrBtn').attr('data-ids',addrids)
			$('.addrBtn').attr('data-id',addridArr[addridArr.length-1])
			$('.addrBtn').html(addArr);
			var defval = dl.attr("data-default");
			if(defval == '1' || $(".addressList  .adrItem").length == 1){
				$('.defaultCheck i').addClass('checked ');
				if($(".addressList  .adrItem").length == 1){
					$('.defaultCheck i').addClass('disabled ');	
				}
			}else{
				$('.defaultCheck i').removeClass('checked disabled');
			}
		//删除地址	
		}else if(e.target == t.find('.delete')[0]){
			$('.delbranchMask').show();
			$('.delbranchAlert').addClass('show');
			$('.delbranchAlert .sureDelbranch').attr('data-id',addrid)
			

		//跳转链接	
		}else{
			var thref = t.find('.linkA').attr('data-url');
			location.href = thref;
		}
		
		t.addClass("on").siblings(".adrItem").removeClass("on");
		$("#addressid").val(t.attr("data-id"));
	});

	//确定删除地址
	$(".delbranchAlert .sureDelbranch").on("click",function(){
		
		var delid = $(this).attr('data-id');
		var $delete=$('.part1Con .adrItem[data-id="'+delid+'"]'),$one=$(".part1Con");
		$.ajax({
			url: "/include/ajax.php?service=member&action=addressDel",
			data: "id="+delid,
			type: "POST",
			dataType: "jsonp",
			success: function (data) {
				if(data && data.state == 100){

					if($delete.hasClass("on")){
						if($delete.index()==0){
							$one.find(".adrItem:eq(1)").addClass("on").siblings("dl").removeClass("on");

						}else{
							$one.find(".adrItem:first").addClass("on").siblings("dl").removeClass("on");
						}
					}
					$delete.remove();
					$("#addressid").val($(".part1Con .on").data("id"));

				}else{
					alert(data.info);
				}
				$('.delbranchMask').hide();
				$('.delbranchAlert').removeClass('show');
			},
			error: function(){
				alert(langData['siteConfig'][20][183]);
				$('.delbranchMask').hide();
				$('.delbranchAlert').removeClass('show');
			}
		});
	});

	//关闭弹窗
	$(".delbranchAlert .delbranch_close,.delbranchMask").on("click",function(){
		$('.delbranchMask').hide();
		$('.delbranchAlert').removeClass('show');
	});

	$("#addressid").val($(".part1Con .on").data("id"));

	//添加地址
	$(".part1Con .add").on("click",function(){
		$(".popCon .tip .left").html(langData['siteConfig'][6][96]);
		$("#bg,.popup").show();
		if($(".adrItem").length == 0){
			$('.defaultCheck i').addClass('checked disabled');			
		}
	});


	//关闭弹出层
	$(".popup .tip i").on("click",function(){
		$("#bg,.popup").hide();

		//清空表单数据
		$(".popCon input").val("");
		var codeOld = $('.areaCode_wrap li:first-child').data('code');//区号恢复默认值
		$(".areaCode i").text("+"+codeOld);
		$('#areaCode').val(codeOld);
		$(".popCon .error").removeClass("error");
		$('.addrBtn').html('<span style="color:#bbb;">请选择所在地区</span>');
		$('.addrBtn').attr('data-ids','');
		$('.addrBtn').attr('data-id','');
	});


	//新地址表单验证
	var inputVerify = {
		addrid: function(){
			if($(".addrBtn").attr('data-id') == 0 || $(".addrBtn").attr('data-id') == ''){
				$("#selAddr").parents("li").addClass("error");
				return false;
			}else{
				$("#selAddr").parents("li").removeClass("error");

			}
			return true;
		}
		,address: function(){
			var t = $("#address"), val = t.val(), par = t.closest("li");
			if(val.length < 5 || val.length > 60 || /^\d+$/.test(val)){
				par.addClass("error");
				return false;
			}
			return true;
		}
		,person: function(){
			var t = $("#person"), val = t.val(), par = t.closest("li");
			console.log(val)
			if(val.length < 2 || val.length > 15){
				par.addClass("error");
				par.find(".input-tips").show();
				return false;
			}
			return true;
		}
		,mobile: function(){
			var t = $("#mobile"), val = t.val(), par = t.closest("li");
			if(val == ""){
				par.addClass("error");
				par.find(".input-tips").show();
				return false;
			}else{
				par.find(".input-tips").hide();

			}
			return true;
		}
		,tel: function(){
			var t = $("#tel"), val = t.val(), par = t.closest("li");
			if($("#mobile").val() == "" && val == ""){
				par.addClass("error");
				return false;
			}
			return true;
		}
		,lnglat: function(){
			var t = $("#lnglat"), val = t.val(), par = t.closest("li");
			if($("#lnglat").val() == "" && val == ""){
				alert('请点击地图按钮确认收货地址的位置');
				return false;
			}
			return true;
		}

	}


	$(".popCon input").bind("click", function(){
		$(this).closest("li").removeClass("error");
		if($(this).attr("id") == "mobile"){
			$("#tel").closest("li").removeClass("error");
		}
		if($(this).attr("id") == "tel"){
			$("#mobile").closest("li").removeClass("error");
			$("#mobile").closest("li").find(".input-tips").hide();
		}
	});

	$(".popCon input").bind("blur", function(){
		var id = $(this).attr("id");

		if((id == "address" && inputVerify.address()) ||
			 (id == "person" && inputVerify.person()) ||
			 (id == "mobile" && inputVerify.mobile()) ||
			 (id == "tel" && inputVerify.tel()) ){

			$(this).closest("li").removeClass("error");
		}

	});
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
	  $('.areaCode').bind('click', function(){
	    var areaWrap =$(this).closest("dd").find('.areaCode_wrap');
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
	    var par = t.closest("dd");
	    var areaIcode = par.find(".areaCode");
	    areaIcode.find('i').html('+' + code);
	    $('#areaCode').val(code)
	  });

	  $('body').bind('click', function(){
	    $('.areaCode_wrap').fadeOut(300);
	  });

	 $('.defaultCheck i').click(function(){
	 	$(this).toggleClass('checked');
	 	if($(this).hasClass('checked')){
	 		$('#setdefault').val('1')
	 	}else{
	 		$('#setdefault').val('0')
	 	}
	 })


	//提交新增/修改
	$("#submit").bind("click", function(){


		var t = $(this);
		if(t.hasClass("disabled")) return false;
		var addr = $(".addrBtn").attr("data-id");
		//验证表单
		if( inputVerify.person() && inputVerify.mobile() && inputVerify.addrid() && inputVerify.address() && inputVerify.lnglat()){
			var data = [];
			data.push('id='+addrid);
			data.push('addrid='+addr);
			data.push('address='+$("#address").val());
			data.push('person='+$("#person").val());
			data.push('mobile='+$("#mobile").val());
			data.push('areaCode='+$("#areaCode").val());
			data.push('lnglat='+$("#lnglat").val());
			data.push('default='+$('#setdefault').val());

			t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");

			$.ajax({
				url: masterDomain+"/include/ajax.php?service=member&action=addressAdd",
				data: data.join("&"),
				type: "POST",
				dataType: "jsonp",
				success: function (data) {
					if(data && data.state == 100){
						getAddressList(data.info)
						//操作成功后关闭浮动层
						$(".popup .tip i").click();

						// $(".part1Con dl").remove();
						// $(".part1Con").prepend('<div class="loading">'+langData['siteConfig'][20][184]+'...</div>');
						// location.reload();

					}else{
						alert(data.info);
						t.removeClass("disabled").html(langData['shop'][5][32]);
					}
				},
				error: function(){
					alert(langData['siteConfig'][20][183]);
					t.removeClass("disabled").html(langData['shop'][5][32]);
				}
			});

		}

	});
	
	function getAddressList(id){
		$.ajax({
	      url: '/include/ajax.php?service=member&action=address',
	      type: "POST",
	      dataType: "json",
	      success: function (data) {
	        if(data.state == 100){
	        	var html = []
	        	for(var i=0; i < data.info.list.length; i++){
	        		var addr = data.info.list[i];
	        	
	        		var on_chose = id == addr.id ? 'on' : '';
	        		var addrids = addr.addrids.split(' ')[0]
	        		var tel = addr.mobile?((addr.areaCode?'+' + addr.areaCode :'') +  addr.mobile):(addr.tel ? addr.tel : '')
	        		html.push('<div class="adrItem '+on_chose+'"  data-id="'+addr.id+'" data-ids="'+addr.addrids+'" data-name="'+addr.person+'" data-mobile="'+addr.mobile+'" data-tel="'+addr.tel+'" data-addr="'+addr.addrname+'" data-address="'+addr.address+'" data-lng="'+addr.lng+'" data-lat="'+addr.lat+'" data-code="'+addr.areaCode+'" data-default="'+addr.default+'">');
					html.push('<a href="javascript:;" data-url="'+urlAddr+'?addresid='+addrids+'&adsid='+addr.id+param+'" class="linkA">');
					html.push('<h2><strong class="sadrname">'+addr.person+'</strong><span class="sadrtel">'+tel+'</span></h2>');
					html.push('<p class="sadres">'+addr.addrname+addr.address+'</p>');
					html.push('<i></i>');
					if(addr.default && addr.default == '1'){
						html.push('<span class="mrtxt">默认</span>');
					}
					html.push('</a>');  
					html.push('<div class="oprAdr">');
					html.push('<a class="revise" href="javascript:;">'+langData['siteConfig'][6][4]+'</a>');
					// html.push('<a class="delete" href="javascript:;">'+langData['siteConfig'][6][8]+'</a>');
					html.push('</div> </div>')
	        	}
	        	$(".addressList  ").html(html.join(''));
	        	$(".adrItem[data-id='"+id+"']").click()
	        }
	      },
	      error: function(){}
	    });
	}

	//底部收货信息
	if($('.adrItem').size() == 0){//没有地址时
		$('.shouBox').hide();
	}else{
		var acadrItem = $('.adrItem.on'),
			sadrname    = acadrItem.find('.sadrname').text(),
			sadrtel    = acadrItem.find('.sadrtel').text(),
			sadres    = acadrItem.find('.sadres').text();
		$('.shouBox span').html(sadrname+' '+sadrtel+' '+sadres);	

	}
 
	//支付方式 货到付款-- 在线支付
	$(".zhifuBox span").on("click",function(){
		var t =$(this);
		t.addClass('active').siblings('span').removeClass('active');
		var zftype = t.attr('data-type');
		$('#payway').val(zftype);
	});


	//支付方式功能区域
	$(".part3Con .pay-style").on("click",function(){
		var $bank=$(this);
		$bank.parents(".payStyle").removeClass("none").siblings(".payStyle").addClass("none");
	});

	$("#paytype").val($(".bank-icon.active:eq(0)").data("type"));

	//选择银行
	$(".part3Con .bank-icon").on("click",function(){
		var $t=$(this);
		$t.addClass("active").siblings("a").removeClass("active");
		$t.parents(".payStyle").siblings(".payStyle").removeClass("active");
		$t.parents(".payStyle").siblings(".payStyle").find(".bank-icon").removeClass("active");

		if($t.data("type") == 'peerpay'){

			$('.sum').hide();
		}else{
			$('.sum').show();
		}
		$("#paytype").val($t.data("type"));
	});



	//积分&余额功能区域
	var cusePoint = totalPoint;
	var cuseBalance = totalBalance;
  	var totalQuanjian = 0; //使用优惠券减少的金额
  	var quanUse = [];  //优惠券数组
	var anotherPay = {
		//计算使用积分
       countPoint:function(){
          if(totalPoint > 0){
		   var totalPayMoney = totalAmount - totalQuanjian;
           var pointMoney = totalPoint / pointRatio;
           cusePoint = totalPoint;
           if(pointMoney > totalPayMoney){
            cusePoint = totalPayMoney * pointRatio;
           }
              //填充可使用的最大值
           $("#cusePoint").html(parseInt(cusePoint));
           $("#usePcount").val(parseInt(cusePoint));
           if($("#usePinput").attr("checked") == "checked"){
             this.usePoint()
           }
			//判断是否使用余额
			if($("#useBalance").attr("checked") == "checked"){
				this.useBalance();
			}
          }
        },
        //计算可用余额
         countBalance:function(){
            var totalPayMoney = totalAmount - totalQuanjian;

            if(totalBalance > 0){
                if(totalBalance > totalPayMoney){
                    cuseBalance = totalPayMoney;
                }
              	console.log(cuseBalance)
                $("#cuseBalance").html(cuseBalance);

            }
           if($("#usePinput").attr("checked") == "checked"){
             this.usePoint()
           }
			//判断是否使用余额
			if($("#useBalance").attr("checked") == "checked"){
				this.useBalance();
			}
          },
		//使用积分
		usePoint: function(){
			$("#usePcount").val(parseInt(cusePoint));  //重置为最大值
			$("#disMoney").html(cusePoint / pointRatio);  //计算抵扣值
			//判断是否使用余额
			if($("#useBalance").attr("checked") == "checked"){
				this.useBalance();
			}
		},

      	//计算优惠券金额
      	quanjian:function(){
          quanUse = [],totalQuanjian = 0;
          $('.goods .sj').each(function(){
            var t = $(this);
            var shopTotalAmount = t.find('.shoptprice').attr('data-shopprice');
            if(t.find('.quan_chose').size()>0 && t.find('.quan_chose .chosed').length>0){
              var quan = t.find('.quan_chose .chosed');
              if(quan.attr('data-id')!='0'){
                quanUse.push({
                  'shopid': t.attr('data-id'),
                  'quanid': quan.attr('data-id')
                });

                //计算价格
                var qtype = quan.attr('data-promotiotype');
                var qjian = quan.attr('data-money');
                var qProid = quan.attr('data-detailid')?quan.attr('data-detailid'):'';
                t.find('.quan_chose').attr('data-jian',qjian)
                t.find('.quan_chose').attr('data-fid',qProid)
                if(qtype == '0'){
                  totalQuanjian = totalQuanjian*1 + qjian*1;
                }else{
                	if(frompage == '0'){
                		let logistic_jian = confirmtype == '0' ? 0 : (t.find(".logistic").attr('data-logistic') ? t.find(".logistic").attr('data-logistic')  : 0)
                		totalQuanjian = totalQuanjian*1 + (shopTotalAmount - logistic_jian  - (shopTotalAmount- logistic_jian) * qjian /10)*1;
                	}else{
                		totalQuanjian = totalQuanjian*1 + (shopTotalAmount - (shopTotalAmount) * qjian /10)*1;
                	}
                  
                }
                // t.find('.quan_chose').attr('data-jian',totalQuanjian);
              }else{//不使用优惠
              	t.find('.quan_chose').attr('data-jian',0);
              }
            }
          });
          console.log(quanUse)
        }

		//使用余额
		,useBalance: function(){
			var balanceTotal = totalBalance;

			//判断是否使用积分
			if($("#usePinput").attr("checked") == "checked"){

				var pointSelectMoney = $("#usePcount").val() / pointRatio;
				//如果余额不够支付所有费用，则把所有余额都用上
				if(totalAmount - pointSelectMoney - totalQuanjian< totalBalance){
					balanceTotal = totalAmount - pointSelectMoney - totalQuanjian;
				}

			//没有使用积分
			}else{

				//如果余额大于订单总额，则将可使用额度重置为订单总额
				if(totalBalance > (totalAmount - totalQuanjian)){
					balanceTotal = totalAmount - totalQuanjian;
				}

			}

			balanceTotal = balanceTotal < 0 ? 0 : balanceTotal;
			balanceTotal = balanceTotal.toFixed(2);
			cuseBalance = balanceTotal;
			$("#useBcount").val(balanceTotal);
			$("#balMoney, #cuseBalance").html(balanceTotal);  //计算抵扣值
		},
		//重新计算店铺价格
		resetStoreMoney:function(){
			var chosid = $('.confirmTab .active a').attr('data-id');
			// chosid = 0; //到店消费支持优惠券
			var storeAllPrice = 0;
			var vipTotal = 0;
			$('.goods .sj').each(function(){
				var logst = 0;
	            var t = $(this);
				
	            //详情页过来 可更改数量 可切换时
				if(confirmtype != '0'){
					var sval = t.find('.sp input').val();
		            // 计算运费
		            logst = t.find('.logistic').attr('data-orlog');

				}
	            //其余商品变回未减券之前的价格
				var shopAll = 0,amountAll=0; //店铺总价， 优惠价格
	            t.find('.sp').each(function(){
					//详情页过来 可更改数量时
					if(confirmtype == '2' || frompage != '0'){
						var danPrice = $(this).attr('data-danPrice'); 
						var countVal = $(this).find('.countDiv input').val();
						var shopprice = Number(danPrice * countVal);
						$(this).attr('data-price',shopprice.toFixed(2));

					}
	            	var tmprice = $(this).attr('data-price'); 
					var amount = $(this).attr('data-amount')
	            	// $(this).attr('data-nprice',tmprice);
					shopAll = shopAll + Number(tmprice);
					amountAll += Number(amount);
	            	t.find('.shoptprice').attr('data-shopprice',shopAll);
	            	t.find('.shoptprice').attr('data-amountAll',amountAll);
	            	t.find('.shoptprice strong').html(parseFloat((shopAll + amountAll).toFixed(2))).attr('data-amountAll',amountAll);
	            	// t.find('.shoptprice').attr('data-shopprice',tmprice);
	            	// t.find('.shoptprice strong').html((tmprice*1).toFixed(2))
	            })
				vipTotal += amountAll; //会员vip减免
				$(".vipjian").text(vipTotal)
	            var storeJian = t.find('.quan_chose').attr('data-jian');
	            var sdetailId = t.find('.quan_chose').attr('data-fid');
	            storeJian = (storeJian*1>0?storeJian*1:0);
	            // if(chosid == 1){//到店消费没有优惠券
	            // 	storeJian = 0;
	            // }
	            if(sdetailId){//特定商品券
	            	var mprice = $('.goods .sp[data-id="'+sdetailId+'"]').attr('data-price');
	            	var nprice = Number(mprice)-storeJian;
	            	nprice = nprice>0?nprice:0;
	            	$('.goods .sp[data-id="'+sdetailId+'"]').attr('data-nprice',nprice);
	            	var toPrice = 0;
		            t.find('.sp').each(function(){
						var nprice2 = $(this).attr('data-nprice');
			            toPrice += nprice2*1;
		            })
		            storeAllPrice = toPrice.toFixed(2);

	            }else{//选了店铺券
	            	var msPrice = Number(t.find('.shoptprice').attr('data-shopprice'));
					var storeAllPrice2 = Number(t.find('.shoptprice').attr('data-shopprice')) + Number(t.find('.shoptprice').attr('data-amountAll')); //没有打折的价格
	            	msPrice = msPrice-storeJian;
					storeAllPrice2 = parseFloat((storeAllPrice2 - storeJian).toFixed(2)); //未打折的总价 - 店铺优惠券的价格
	            	msPrice = msPrice>0?msPrice:0;
	            	storeAllPrice2 = storeAllPrice2>0?storeAllPrice2:0;
	            	storeAllPrice = msPrice.toFixed(2);
	            	
	            }
	            if(chosid == 1){//到店消费没有运费
					logst = 0;
				}

				storeAllPrice = (storeAllPrice*1)+(logst*1);
				storeAllPrice2 = (storeAllPrice2*1)+(logst*1);
	            t.find('.shoptprice strong').html(storeAllPrice2.toFixed(2)).attr('data-shopprice',storeAllPrice);
	            t.find('.dpYh').html('-'+echoCurrency('symbol')+storeJian.toFixed(2));		            
	        })
	        anotherPay.resetTotalMoney();

		}

		//重新计算还需支付的值
		,resetTotalMoney: function(){

			//var totalPayMoney = totalAmount-totalQuanjian;
			//汇总各个店铺的价格之后进行积分抵扣
			var totalPayMoney = 0;
			var totalPayMoney2 = 0
			$('.goods .sj').each(function(){

				// var msPrice = $(this).find('.shoptprice strong').html();
				var msPrice = ($(this).find('.shoptprice strong').attr('data-shopprice')?$(this).find('.shoptprice strong').attr('data-shopprice'):0)
				if(!msPrice){
					msPrice = Number($(this).find('.shoptprice strong').html()?$(this).find('.shoptprice strong').html():0) - ($(this).find('.shoptprice strong').attr('daya-amountall')?$(this).find('.shoptprice strong').attr('daya-amountall'):0);
					console.log($(this).find('.shoptprice strong').attr('daya-amountall'))
				}
				totalPayMoney += msPrice*1;
				totalPayMoney2 += Number($(this).find('.shoptprice strong').html()?$(this).find('.shoptprice strong').html():0)
			})

			// $('#toPrice').html(totalPayMoney.toFixed(2));
			$('#toPrice').html(totalPayMoney2.toFixed(2));
			if(hasPoint > 0){
				jifen_di = parseInt( jifen_* totalPayMoney * pointRatio / 100 );
			  	jifen_di = hasPoint <= jifen_di ? hasPoint : jifen_di;
			  	jifen_di = Number(jifen_di)
			  	jian = parseFloat((jifen_di/pointRatio).toFixed(2));
			  	$(".integral .jifen").html(parseFloat(jifen_di.toFixed(2))) ;
			  	$(".integral .jian").html(parseFloat(jian.toFixed(2))) ;
			}
			$('#diMoney').html(jian.toFixed(2));
		  	if($(".integral .gou").hasClass('hasgou')){
		  		$('.jfDbox').show();
		      	$("#totalPayMoney").html(parseFloat((totalPayMoney-jian).toFixed(2)))
		  	}else{
		  		$('.jfDbox').hide();
		  		$("#totalPayMoney").html(parseFloat(totalPayMoney.toFixed(2)))
		  	}

			// $("#totalPayMoney").html(totalPayMoney.toFixed(2));
		}

	}
	// anotherPay.countPoint();
  	// anotherPay.countBalance();
	// 选择优惠券
	$(".selectbox").click(function(){
		$(this).find(".quanlist").toggleClass('show');
	})


	$(".integral .gou").click(function(){
		$(this).toggleClass('hasgou');
		anotherPay.resetTotalMoney();
	})
	$(".quanlist ").delegate('li','click',function(e){
		$(this).addClass('chosed').siblings('li').removeClass('chosed');
		$(".quanlist").removeClass('show');
		let selectbox = $(this).closest('.selectbox')
		selectbox.find('em').text($(this).text());
      	anotherPay.quanjian();
      // 	anotherPay.countPoint();
  		// anotherPay.countBalance();
  		//更新店铺价格
      	anotherPay.resetStoreMoney();
      	
		e.stopPropagation()
	});
	anotherPay.resetTotalMoney();
	//使用积分抵扣/余额支付
	$("#usePinput, #useBalance").bind("click", function(){

		var t = $(this), ischeck = t.attr("checked"), parent = t.closest(".account-summary"), type = t.attr("name"), label = t.closest('label')
				discharge = label.siblings('.discharge');
		if(ischeck == "checked"){
			label.addClass('bbottom');
			discharge.addClass('show');
			parent.find(".use-input, .use-tip").show();
		}else{
			label.removeClass('bbottom');
			discharge.removeClass('show');
			parent.find(".use-input, .use-tip").hide();
		}

		//积分
		if(type == "usePinput"){
          	anotherPay.quanjian();
			$("#disMoney").html("0");  //重置抵扣值

			//确定使用
			if(ischeck == "checked"){
              	anotherPay.countPoint()
				anotherPay.usePoint();

			//如果不使用积分，重新计算余额
			}else{

				$("#usePcount").val("0");

				//判断是否使用余额
				if($("#useBalance").attr("checked") == "checked"){
                  	anotherPay.countBalance()
					anotherPay.useBalance();
				}
			}

		//余额
		}else if(type == "useBalance"){
          	anotherPay.quanjian();
			$("#balMoney").html("0");

			//确定使用
			if(ischeck == "checked"){
              	anotherPay.countBalance()
				anotherPay.useBalance();
			}else{
				$("#useBcount").val("0");
			}
		}

		anotherPay.resetTotalMoney();
	});


	//验证积分输入
	var lastInputVal = 0;
	$("#usePcount").bind("blur", function(){
		var t = $(this), val = t.val();

		//判断输入是否有变化
		if(lastInputVal == val) return;

		if(val > cusePoint){
			alert(langData['shop'][5][26]+" "+cuseBalance);
			$("#usePcount").val(cusePoint);
			$("#disMoney").html(cusePoint / pointRatio);
			lastInputVal = cusePoint;
		}else{
			lastInputVal = val;
			$("#disMoney").html(val / pointRatio);
		}

		//判断是否使用余额
		if($("#useBalance").attr("checked") == "checked"){
			anotherPay.useBalance();
		}
		anotherPay.resetTotalMoney();

	});


	//验证余额输入
	$("#useBcount").bind("blur", function(){
		var t = $(this), val = Number(t.val()), check = true;

		cuseBalance = Number(cuseBalance);

		var exp = new RegExp("^(?:[1-9]\\d*|0)(?:.\\d{1,2})?$", "img");
		if(!exp.test(val)){
			check = false;
		}

		if(!check){
			alert(langData['shop'][5][78]);
			$("#useBcount").val("0");
			$("#balMoney").html("0");
		}else if(val > cuseBalance){
			alert(langData['shop'][5][26]+" "+cuseBalance+" "+echoCurrency('short'));
			$("#useBcount").val(cuseBalance);
			$("#balMoney").html(cuseBalance);
		}else{
			$("#balMoney").html(val);
		}
		anotherPay.resetTotalMoney();
	});


	$('#payform').keydown(function(e){
		if(e.keyCode == 13) return false;
	})


	//提交支付
	$(".submitOrder").bind("click", function(event){
		var t = $(this);

		if(t.hasClass("disabled")) return false;

		if($("#pros").val() == ""){
			alert(langData['shop'][2][21]);
			return false;
		}

        if($("#confirmType").val() == 2 && ($("#addressid").val() == 0 || $("#addressid").val() == "")){
            if($(".confirmTab .active a").size() > 0 && $(".confirmTab .active a").attr('data-id') == 1){

            }else{
                alert(langData['shop'][2][22]);
                return false;
            }
		}

        if($(".confirmTab .active a").size() > 0 && $(".confirmTab .active a").attr('data-id') == 2 && !$('#addressid').val()){
            alert(langData['shop'][2][22]);
            return false;
        }
        
		// if($("#paytype").val() == 0){
		// 	alert(langData['siteConfig'][21][75]);
		// 	return false;
		// }

		var pinputCheck  = $("#usePinput").attr("checked"),
				point        = $("#usePcount").val(),
				balanceCheck = $("#useBalance").attr("checked"),
				balance       = $("#useBcount").val(),
				paypwd       = $("#paypwd").val();

		if(balanceCheck == "checked" && balance > 0 && paypwd == ""){
			alert(langData['siteConfig'][21][88]);
			return false;
		}

		t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");
		$("#payform").append("<input type='hidden' name='quanuse' value='"+JSON.stringify(quanUse)+"'>");
		$("#payform").append("<input type='hidden' name='usePinput' value='"+($('.integral .gou').hasClass('hasgou')?'1':'0')+"'>");

		var prosval = $("#pros").val();
		if(prosval) {
			shopInit.database('get', '', function (cartData) {
				var cartDataArr = cartData.split("|"), newCartData = cartDataArr,
					proArr = prosval.split("|");
				for (var p = 0; p < proArr.length; p++) {
					val = proArr[p].split(",");
					for (var i = 0; i < cartDataArr.length; i++) {
						var cData = cartDataArr[i].split(",");
						if (val[0] == cData[0] && val[1] == cData[1]) {
							newCartData.splice(i, 1);
						}
					}
				}
				shopInit.database('update', newCartData.join('|'));
			})
		}

		action = $("#payform").attr("action");

		var delivery = '';
		if($("#confirmType").val() == 2 && $(".zhifuBox .active").length &&  $(".zhifuBox .active").attr('data-type') == '1'){
			delivery = '&paytype=delivery'
		}
		
		$.ajax({
			url: action,
			data: $("#payform").serialize() + delivery +'&note='+$(".buynote").text(),
			type: "POST",
			dataType: "json",
			success: function (data) {
				if(data && data.state == 100){

					info = data.info;
					orderurl = info.orderurl;
					if(typeof (info) != 'object'){
						location.href = info;
						return false;
					}

					cutDown = setInterval(function () {
						$(".payCutDown").html(payCutDown(info.timeout));
					}, 1000)

					var datainfo = [];
					for (var k in info) {
						datainfo.push(k + '=' + info[k]);
					}
					$("#amout").text(info.order_amount);
					$('.payMask').show();
					$('.payPop').show();

					if (usermoney * 1 < info.order_amount * 1) {

						$("#moneyinfo").text('余额不足，');
					}

					if(monBonus * 1 < info.order_amount * 1  &&  bonus * 1 >= info.order_amount * 1){
						$("#bonusinfo").text('额度不足，可用');
						$("#bonusinfo").closest('.check-item').addClass('disabled_pay')
					}else if( bonus * 1 < info.order_amount * 1){
						$("#bonusinfo").text('余额不足，');
						$("#bonusinfo").closest('.check-item').addClass('disabled_pay')
					}else{
						$("#bonusinfo").text('');
						$("#bonusinfo").closest('.check-item').removeClass('disabled_pay')
					}

					shopordernum  = info.ordernum;
					order_amount = info.order_amount;

					$("#ordertype").val('');
					$("#service").val('shop');
					service = 'shop';
					var src = masterDomain + '/include/qrPay.php?' + datainfo.join('&');
					$('#payQr img').attr('src', masterDomain + '/include/qrcode.php?data=' + encodeURIComponent(src));

				}else{
					alert(data.info);
					t.removeClass("disabled").html("提交订单");
				}
			},
			error: function(){
				alert("网络错误，请重试！");
				t.removeClass("disabled").html("提交订单");
			}
		});

	});

	//到店消费和送到家切换
    $('.confirmTab li').click(function(){
    	if(!$(this).hasClass('active')){
			$("#confirmType").val($(this).index() + 1)
    		$(this).addClass('active').siblings('li').removeClass('active');
    		var tindex = $(this).index();
    		$('.twoWrap .comTwo').eq(tindex).addClass('twoshow').siblings('.comTwo').removeClass('twoshow');
    		var t = $('.t5 a'),  chosid = $('.confirmTab .active a').attr('data-id');

    		newGetLogisticPrice(t,function(data){
				if(data.state == 100){
					var logistic = data.info[0].logistic
					var mlogistic = data.info[0].mlogistic
					var free = data.info[0].free
					if( chosid == 1){//到店消费没有运费
						logistic = 0;
					}
					if(logistic == 0){
			
						$(".logistic span.mlogistic .ps").html(langData['shop'][3][2]);
						if($('.logistic span.mlogistic .err_msg').text() != '' && !free){
							$(".logistic span.mlogistic .ps").addClass('fn-hide')
							$(".logistic span.mlogistic .err_msg").removeClass('fn-hide')
						}else{
							$(".logistic span.mlogistic .ps").removeClass('fn-hide')
							$(".logistic span.mlogistic .err_msg").addClass('fn-hide')
						}
					}else{
						$(".logistic span.mlogistic .ps").removeClass('fn-hide')
						$(".logistic span.mlogistic .err_msg").addClass('fn-hide')
						$(".logistic span.mlogistic .ps").html('运费：'+echoCurrency('symbol')+mlogistic);
					}
					
	                var auth = checkAuth('delivery');
	                $(".vip_delivery").addClass('fn-hide')
	                if(auth != 0 && auth[0]){

	                    // 打折
	                    if(auth[0].type == 'discount'){
	                        if(auth[0].val > 0 && auth[0].val < 10){
	                            auth_delivery_price = (logistic * (1 - auth[0].val / 10));
	                            logistic = parseFloat((logistic - auth_delivery_price).toFixed(2));
	                            $(".vip_delivery").removeClass('fn-hide')
	                           if(logistic == 0){
	                            	if( $('.logistic span.mlogistic .err_msg').text() != ''  && !free){
	                            		$(".vip_delivery").addClass('fn-hide')
	                            	}else{
	                            		$(".vip_delivery").removeClass('fn-hide')
	                            	}
	                            }
	                        }
	                    // 计次
	                    }else if(auth[0].type == 'count'){
	                        // 限次数
	                        if(auth[0].val > 0){
	                            if(userinfovip.delivery_count == 0){

	                            }else{
	                            	$(".vip_delivery").removeClass('fn-hide')
	                                auth_delivery_price = logistic;
	                                logistic = parseFloat((logistic - auth_delivery_price).toFixed(2));
	                                $(".vip_delivery").removeClass('fn-hide')
	                                if(logistic == 0){
	                            	if( $('.logistic span.mlogistic .err_msg').text() != '' && !free){
	                            		$(".vip_delivery").addClass('fn-hide')
	                            	}else{
	                            		$(".vip_delivery").removeClass('fn-hide')
	                            	}
	                            }
	                            }
	                        }
	                    }
	                }

					$(".logistic b").html(echoCurrency('symbol')+logistic);
					$(".logistic").attr('data-orlog',logistic);
					$(".logistic").attr('data-logistic',logistic);
					


					// 如果有优惠券
					if(data.info[0].quanarr && data.info[0].quanarr.length > 0){
						quanItem(data.info[0].quanarr)
					}

					//计算价格
					anotherPay.resetStoreMoney();



				}else{
					//运费
					var logistic = getLogisticPrice(bearfreight, valuation, express_start, express_postage, express_plus, express_postageplus, preferentialstandard, preferentialmoney, weight, volume, price, val);
					if( chosid == 1){//到店消费没有运费
						logistic = 0;
					}
					if(logistic == 0){
			
						$(".logistic span").html(langData['shop'][3][2]);
					}else{
			
						$(".logistic span").html('');
					}
					
					$(".logistic b").html(echoCurrency('symbol')+logistic);
					$(".logistic").attr('data-logistic',logistic);
					$(".logistic").attr('data-orlog',logistic);
					//计算价格
					anotherPay.resetStoreMoney();
				}
			})
    		if(tindex == 1){//送到家
    			//有店铺优惠 和 支付方式选择
    			$('.sj .quan_chose,.shoppayLi').show();
    			//有配送
    			var nowYunf = $('.sj .logistic').attr('data-orlog');
		    	$('.sj .logistic').attr('data-logistic',nowYunf);
		    	if(nowYunf == 0){
		    // 		if($('.sj .logistic span .err_msg').text() != ''  && !free){
		    // 			$('.sj .logistic span .ps').addClass('fn-hide');
		    // 			$('.sj .logistic span .err_msg').removeClass('fn-hide')
		    // 		}else{
						// $('.sj .logistic span .ps').html('免运费');
						// $('.sj .logistic span .ps').removeClass('fn-hide');
		    // 			$('.sj .logistic span .err_msg').addClass('fn-hide')

		    // 		}
		    	}else{
		    		$('.sj .logistic span .ps').html('');
		    	}
		    	$('.sj .logistic b').html(echoCurrency('symbol')+nowYunf);
		    	anotherPay.resetStoreMoney();
				$(".sj .logistic").removeClass('fn-hide')
    		}else{//到店消费

    			//没有优惠券 //没有支付方式选择			
    			$('.shoppayLi').hide();
		    	//没有配送
		    	$('.sj .logistic').attr('data-logistic',0);
		    	$('.sj .logistic span .ps').html('免运费');
		    	$('.sj .logistic b').html(echoCurrency('symbol')+'0.00');
				$(".sj .logistic").addClass('fn-hide')
		    	anotherPay.resetStoreMoney();
    		}



    		// 此处需要统计运费
    	}

    	if($(this).find('a').attr('data-id') == '1'){
    		$('.shouBox').addClass('fn-hide')
    	}else{
    		$('.shouBox').removeClass('fn-hide')
    	}
    });

	if(confirmtype == '2' && adsid != '0'){
		$('.confirmTab li').eq(1).click()
	}else if(confirmtype=='2'){
    	$('.confirmTab li:first-child').click();
    }
    //有优惠时 先选优惠
    $('.goods .sj').each(function(){
    	var t = $(this);
    	if(t.find('.quan_chose').size() >0){
    		t.find('.quanlist li:nth-child(2)').click();
    	}
    })
    //最开始的运费
    

    //数量错误提示
	var errmsgtime;
	function errmsg(div,type,num,nunm,detunit){
		clearTimeout(errmsgtime);
		var str = type=='max' ? '最多购买'+num+detunit : '最少购买'+num+detunit;
		var obj = div.find('.t5 .specialTip');
		obj.html(str)
		obj.fadeIn();
		errmsgtime = setTimeout(function(){
			obj.fadeOut();
		},1500);
	};

    //数量增加、减少
	$(".sp").delegate(".t5 a", "click", function(){
		var t = $(this).closest(".sp"), type = $(this).attr("data-type"), inp = t.find(".t5 input"), val = Number(inp.val());
		var a = $(this)
		//商品不可买时 不操作
		if($(this).hasClass('disabled') || $(this).hasClass('noClick')){
			return false;
		}
		
		//每次装箱数量
		var eachcout = t.attr('data-eachcout');
		var mincout = t.attr('data-mincout');//最小起订量
		var limit = t.attr('data-limit'); //限购
		//减少
		if(type == "minus"){
			inp.val(val-eachcout*1);

			if(limit != '0' && (val - eachcout*1) < limit ){
				a.siblings(".plus").removeClass('disabled')
			}

			if((val - eachcout*1) <= mincout){
				a.addClass('disabled')
			}

			checkCount(t);

		//增加
		}else if(type == "plus"){
			inp.val(val+eachcout*1);
			
			if(limit != '0' && (val + eachcout*1) >= limit ){
				a.addClass('disabled');
				errmsg(t,'max', limit, a.siblings('input'),t.data("shopunit"));
			}

			if((val + eachcout*1) > mincout){
				a.siblings(".minus").removeClass('disabled')
			} //达到最小装箱数

			checkCount(t, 1);
		}


	});

	$(".countDiv input").blur(function(){
		var obj = $(this).closest('.sp')
		checkCount(obj, 1)
	})

    
    function checkAuth(type){
        var type = type == undefined ? 'discount' : type;
        var r = {"type" : 0, "val" : 0};
        for(var i in privilege){
            if(i == type){
                r = privilege[i];
                break;
            }
        }
        return r;
    }

    //验证数量
	function checkCount(obj, t){
		var count = obj.find(".t5 input"), val = Number(count.val());
		var t = obj.find('.t5 a')
		var par = obj.closest('.sj');
		var id = obj.data("id"),
				price = Number(obj.data("price")),
				oprice = Number(obj.data("oprice")),  //原单价
				nprice = Number(obj.data("danprice")), //当前单价
				bearfreight = Number(obj.data("bearfreight")),
				valuation = Number(obj.data("valuation")),
				express_start = Number(obj.data("express_start")),
				express_postage = Number(obj.data("express_postage")),
				express_plus = Number(obj.data("express_plus")),
				express_postageplus = Number(obj.data("express_postageplus")),
				preferentialstandard = Number(obj.data("preferentialstandard")),
				preferentialmoney = Number(obj.data("preferentialmoney")),
				weight = Number(obj.data("weight")),
				volume = Number(obj.data("volume")),
				maxCount = Number(obj.data("limit")),
				inventor = Number(obj.data("inventor")),
				mincout = Number(obj.data("mincout")),
				eachcout = Number(obj.data("eachcout")),
				shopunit = obj.data("shopunit");
		if(maxCount == 0){//限购为0 则表示不限购
			var canbuycount = inventor;
		}else{
			var canbuycount = Math.min.apply(null, [inventor,maxCount]);//库存和限购的最小值为 最大购买数量
		}		

		//最小
		if(val < mincout){
			count.val(mincout);
			val = mincout;
			errmsg(obj,'min', mincout, count,shopunit);

		//最大  超出库存/超出限购
		}else if((val >= canbuycount && !t) || (val > canbuycount && t)){

			count.val(canbuycount);
			val = canbuycount;
			errmsg(obj,'max', canbuycount, count,shopunit);

		}else{
			$('#errmsg').remove();
		}

		var lastNum = count.val();
		$(".scount").text(lastNum);
		$(".shop-item-price label").text('共' +lastNum+ '件')
		console.log(obj)
		var singlePrice = obj.attr('data-danPrice') ? Number( obj.attr('data-danPrice')) : 0
		var singleOprice = obj.attr('data-oprice') ? Number( obj.attr('data-oprice')) : 0
		var vipjian = obj.attr('data-amount') ? Number(obj.attr('data-amount')) : 0
		obj.find('.t6 span').text( echoCurrency('symbol') + (singleOprice ) * lastNum )

		var prosArr = $("#pros").val().split(',')
		prosArr[prosArr.length - 1] = lastNum
		$("#pros").val(prosArr.join(','))
		var chosid = $('.confirmTab .active a').attr('data-id');

		obj.attr('data-amount',(count.val() * (oprice - nprice)).toFixed(2))

		newGetLogisticPrice(t,function(data){
			if(data.state == 100){
				var logistic = data.info[0].logistic
				var mlogistic = data.info[0].mlogistic
				var free = data.info[0].free
				if( chosid == 1){//到店消费没有运费
					logistic = 0;
				}
				if(logistic == 0){
		
					par.find(".logistic span.mlogistic .ps").html(langData['shop'][3][2]);
					if(par.find('.logistic span.mlogistic .err_msg').text() != ''  && !free){
						par.find(".logistic span.mlogistic .ps").addClass('fn-hide')
						par.find(".logistic span.mlogistic .err_msg").removeClass('fn-hide')
					}else{
						par.find(".logistic span.mlogistic .ps").removeClass('fn-hide')
						par.find(".logistic span.mlogistic .err_msg").addClass('fn-hide')
					}
				}else{
					par.find(".logistic span.mlogistic .ps").removeClass('fn-hide')
					par.find(".logistic span.mlogistic .err_msg").addClass('fn-hide')
					par.find(".logistic span.mlogistic .ps").html('运费：'+echoCurrency('symbol')+mlogistic);
				}
				$(".vip_delivery").addClass('fn-hide')
                var auth = checkAuth('delivery');
                if(auth != 0 && auth[0]){

                    // 打折
                    if(auth[0].type == 'discount'){
                        if(auth[0].val > 0 && auth[0].val < 10){
                            auth_delivery_price = (logistic * (1 - auth[0].val / 10));
                            logistic = parseFloat((logistic - auth_delivery_price).toFixed(2));
                            $(".vip_delivery").removeClass('fn-hide')
                            if(logistic == 0){
                            	if( par.find('.logistic span.mlogistic .err_msg').text() != '' && !free){
                            		$(".vip_delivery").addClass('fn-hide')
                            	}else{
                            		$(".vip_delivery").removeClass('fn-hide')
                            	}
                            }
                            
                        }
                    // 计次
                    }else if(auth[0].type == 'count'){
                        // 限次数
                        if(auth[0].val > 0){
                            if(userinfovip.delivery_count == 0){

                            }else{
                                auth_delivery_price = logistic;
                                logistic = parseFloat((logistic - auth_delivery_price).toFixed(2));
                                $(".vip_delivery").removeClass('fn-hide')
                                if(logistic == 0){
	                            	if( par.find('.logistic span.mlogistic .err_msg').text() != ''  && !free){
	                            		$(".vip_delivery").addClass('fn-hide')
	                            	}else{
	                            		$(".vip_delivery").removeClass('fn-hide')
	                            	}
	                            }

                            }
                        }
                    }
                }

				par.find(".logistic b").html(echoCurrency('symbol')+logistic);
				par.find(".logistic").attr('data-orlog',logistic);
				par.find(".logistic").attr('data-logistic',logistic);
				

				//计算价格
				anotherPay.resetStoreMoney();
				// 如果有优惠券
				if(data.info[0].quanarr && data.info[0].quanarr.length > 0){
					quanItem(data.info[0].quanarr)
				}

				



			}else{
				//运费
				var logistic = getLogisticPrice(bearfreight, valuation, express_start, express_postage, express_plus, express_postageplus, preferentialstandard, preferentialmoney, weight, volume, price, val);
				if( chosid == 1){//到店消费没有运费
					logistic = 0;
				}
				if(logistic == 0){
		
					par.find(".logistic span").html(langData['shop'][3][2]);
				}else{
		
					par.find(".logistic span").html('');
				}
				
				par.find(".logistic b").html(echoCurrency('symbol')+logistic);
				par.find(".logistic").attr('data-logistic',logistic);
				par.find(".logistic").attr('data-orlog',logistic);
				//计算价格
				anotherPay.resetStoreMoney();
			}
		})

			
		
	}


	function quanItem(quanarr){
		var html = [];
		html.push('<li data-id="0"><s></s>不使用优惠</li>')
		var chosid = $('.confirmTab .active a').attr('data-id');

		// chosid = 0; //到店消费支持优惠券
		// if(chosid != '1'){
		// 	$(".quan_chose").removeClass('fn-hide').show();
		// }	
		if(quanarr.length > 0){
			$(".quan_chose").removeClass('fn-hide').show();	
			for(var i = 0; i < quanarr.length; i++){
				var fid = quanarr[i].quantype == '1' ? (quanarr[i].fid?quanarr[i].fid:'') : '';
				var txt = '';
				if( quanarr[i].promotiotype == '0'){
					txt = '减'+ parseFloat(quanarr[i].promotio) + echoCurrency('short') +'，'+quanarr[i].name
				}else{
					txt =  parseFloat(quanarr[i].promotio) + '折，'+quanarr[i].name

				}
				html.push('<li data-id="'+quanarr[i].id+'" data-money="'+quanarr[i].promotio+'" data-promotiotype="'+quanarr[i].promotiotype+'" data-detailid="'+fid+'"><s></s>'+txt+'</li>')
			}
		}else{
			$(".quan_chose").addClass('fn-hide').hide();
		}

		$(".quan_chose .quanlist").html(html.join(''))
		// if(html.length > 1 && chosid!='1'){
		if(html.length > 1 ){
			$('.quanlist li:nth-child(2)').click();
		}else{
			$('.quanlist li:nth-child(1)').click();
		}
	}

    //2021-12-16 商家地图
  	if(site_map == 'baidu'){
	      // 百度地图API功能
	      var map = new BMap.Map("allmap");
	      //获取坐标
	      var eduLng = pageData.lng;
	      var eduLat = pageData.lat;
	      var point = new BMap.Point(eduLng, eduLat);
	      map.centerAndZoom(point, 13);

	      //创建个人图标
	      var myIcon = new BMap.Icon(templatePath+"/images/mapIcon.png", new BMap.Size(34,38));
	      var marker2 = new BMap.Marker(point,{icon:myIcon});  // 创建标注
	      map.addOverlay(marker2);     // 将标注添加到地图中

    }else if(site_map == 'amap'){//高德地图
        var amap = new AMap.Map('allmap', {
            center: [pageData.lng, pageData.lat],
            zoom: 14,
        });

        // 构造点标记
        var marker = new AMap.Marker({
          	map:amap,
        
            position: [pageData.lng, pageData.lat]
        });
        amap.add(marker);

    }else if(site_map == 'tmap'){//天地图
        var map = new T.Map("allmap");
	      //获取坐标
	      var eduLng = pageData.lng;
	      var eduLat = pageData.lat;
	      var point = new T.LngLat(eduLng, eduLat);
	      map.centerAndZoom(point, 13);

	      //创建个人图标
          var myIcon = new T.Icon({
            "iconUrl": templatePath+"images/mapIcon.png",
            "iconSize": new T.Point(34, 38),
            "iconAnchor": new T.Point(17, 30)
        });
	      var marker2 = new T.Marker(point,{icon:myIcon});  // 创建标注
	      map.addOverLay(marker2);     // 将标注添加到地图中

    }else if(site_map == "google"){
        var marker,
		   mapOptions = {
		     zoom: 14,
		     center: new google.maps.LatLng(pageData.lat, pageData.lng),
		     zoomControl: false,
		     mapTypeControl: false,
		     streetViewControl: false,
		     fullscreenControl: false
		   }
		 	
		 mapPath = new google.maps.Map(document.getElementById('allmap'), mapOptions);
		 	
		 // 店铺坐标
		 marker = new google.maps.Marker({
		   position: new google.maps.LatLng(pageData.lat, pageData.lng),
		   map: mapPath,
		 });
    }
    //查看地图链接
    $('.appMapBtn').attr('href', OpenMap_URL);


	// 切换优惠券
	$(".quanConBox .quanTab a").click(function(){
		$(this).addClass('onTab').siblings('').removeClass('onTab');
		$(".quanCon .quanList ").eq($(this).index()).removeClass('fn-hide').siblings('.quanList').addClass('fn-hide')
	});

	$("body").delegate('li','click',function(){
		var t = $(this);
		if(!t.hasClass('disabled')){
			t.addClass('on_chose').siblings('li').removeClass('on_chose')
		}
	});

	$(".quanBox h4").click(function(){
		$(".quanBox").toggleClass('open')
	})

});
