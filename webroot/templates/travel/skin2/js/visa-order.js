$(function(){
	birthPick();
	function birthPick(){
		$('.birthday').daterangepicker({
			autoApply: true,
	        singleDatePicker: true,
	        showDropdowns: true,
	        autoUpdateInput:false,
	        minYear:1901,
	        maxYear:parseInt(moment().format('YYYY'),10),
	        "locale" : {  //因为这个插件是英文的 所以下面配置成中文的
	           applyLabel : '确定',
	           cancelLabel : '取消',
	           fromLabel : '起始时间',
	           toLabel : '结束时间',
	           customRangeLabel : '自定义',
	           daysOfWeek : [ '日', '一', '二', '三', '四', '五', '六' ],
	           monthNames : [ '一月', '二月', '三月', '四月', '五月', '六月','七月', '八月', '九月', '十月', '十一月', '十二月' ],
	           cancelLabel:'Clear'


	       }
	      }, function(start, end, label) {

	      	var birth = start.format('YYYY-MM-DD');
	       this.element.val(birth);
	    });
	}
	//增加人数目
	$('.start-people .add').click(function(){
		var i = $(this).siblings('span').text()*1;
		i=i+1;
		$(this).siblings('span').text(i);
		priceCalculator();
		var applyList = [];
		applyList.push('<div class="apply">');
		applyList.push('<h2 class="apply-h2">申请人'+i+'</h2>');
		applyList.push('<div class="apply_con peo_con">');
		applyList.push('<dl class="apply_man">');
		applyList.push('<dt><label for="offer_name'+i+'"><em class="star">*</em>姓&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 名：</label></dt>');
		applyList.push('<dd><input type="text" placeholder="请输入订单联系人姓名" id="offer_name'+i+'" name="offer_name" class="offer_name"></dd>');
		applyList.push('</dl>');
		applyList.push('<dl class="apply_type">');
		applyList.push('<dt><label for="customerType'+i+'"><em class="star">*</em>'+langData['travel'][8][53]+'：</label></dt>');//客户类型
		applyList.push('<dd class="selectCus">');
		applyList.push('<select name="customerType'+i+'" id="customerType'+i+'" class="offer_type">');
		applyList.push('<option value="0">'+langData['travel'][8][50]+'</option>');//请选择客户类型
		applyList.push('<option value="1">'+langData['travel'][8][54]+'</option>');//在职人员
		applyList.push('<option value="2">'+langData['travel'][8][55]+'</option>');//自由职业者
		applyList.push('<option value="3">'+langData['travel'][8][56]+'</option>');//退休人员
		applyList.push('<option value="4">'+langData['travel'][8][57]+'</option>');//在校学生
		applyList.push('<option value="5">'+langData['travel'][8][58]+'</option>');//学龄前儿童
		applyList.push('</select>');
		applyList.push('</dd></dl>');
		applyList.push('<dl class="birth">');
		applyList.push('<dt><label for="birthday'+i+'"><em class="star">*</em>'+langData['travel'][8][52]+'：</label></dt>');//出生日期
		applyList.push('<dd>');
		applyList.push('<input class="birthday" name="birthday" id="birthday'+i+'" readonly="readonly" placeholder="请选择出生日期" type="text">');

		applyList.push('<i class="time-icon birth-icon"></i></dd>');
		applyList.push('</dl>');
		applyList.push('</div>');
		applyList.push('</div>');
		$('.apply_content').append(applyList.join(''));
		birthPick();//动态追加的元素执行此方法
	});
	//减少人数目
	$('.jian').click(function(){
		var i = $(this).siblings('span').text()*1;
		i=i-1;
		if(i==0){
			alert(langData['travel'][7][59]);//不能再减少了
			return 0;
		}
		$(this).siblings('span').text(i);
		priceCalculator();
		$('.apply_content').find('.apply:last').remove();
	});
	//出行日期
	$('#startTime,.start-time .time-icon').click(function(){

		if($('#single-pick').hasClass('show')){
			$('#single-pick').hide();
			$('#single-pick').removeClass('show')
		}else{
			$('#single-pick').show();
			$('#single-pick').addClass('show')
		}
		return false;
	})
	new Calendar({
		  // 设置显示位置
		  parent: 'single-pick',
		  // 初始化显示时间（默认选中时间）
		  time: '',
		  // viewMode：
		  // 0 - 日期模式（默认值）
		  viewMode: 0,
		  // pickMode：
		  // single - 单选模式
		  pickMode: 'single',
		  hasFooter: false,
		  // 配置日期选择的事件处理器 onDatePick，参数如下：
		  // time - 选中的日期时间
		  // $el - 点击的 DOM 节点
		  // calendar - 日历控件的实例
		  onDatePick: function (time, $el, calendar) {
		  	var choseTime = time
		    $("#startTime").val(choseTime);
		    $('#single-pick').hide();
		    priceCalculator();
		  },
		  // 配置今天选择的事件处理器 onTodayPick，参数如下：
		  // 1. 先切换到日期试图模式；
		  // 2. 触发日期选择的业务逻辑；
		  onTodayPick: function (time, $el, calendar) {
		    console.log('选择时间：', time)
		    console.log('选择的 DOM 节点：', $el)
		    console.log('日历实例：', calendar)
		  }
	})
	//出生日期选择
	$('.apply_content').delegate('.birth-icon','click',function(){
		$(this).siblings('input').focus();
	})
	//最晚提交日期
	var tjTime = huoniao.transTimes(earliestdate,2);
	$('.tjTip em').html(tjTime)


	//出发日期 先赋值默认当天为选中
	var nowVal = $('.cal-current').attr('data-date');
	$('#startTime').val(nowVal);
	//计算总价 包含特殊时刻
	priceCalculator();
	function priceCalculator(){
		var peoplenum = $('.jian').siblings('span').text();//人数
		peoplenum = peoplenum ? parseInt(peoplenum) : 1;
		$('.peoNum').text(peoplenum);

		pricePay = (Number(price) * peoplenum).toFixed(2);

		$('.price_all em').html(pricePay);
		$('.detail_all em').html(pricePay);

		jifen_di = parseInt(jifen_ * pricePay  * pointRatio / 100);
		jifen_di = hasPoint <= jifen_di ? hasPoint : jifen_di;
		jian = parseFloat((jifen_di/pointRatio).toFixed(2));
		$(".integral .jifen").html(jifen_di) ;
		$(".integral .jifen_jian").html(jian) ;
		$(".integral .amount_jian span").html(jian)
		if($(".integral .gou").hasClass('hasgou')){
			$('.price_all em').html(pricePay-jian);
		}else{
			$('.price_all em').html(pricePay);
		}

	}

	$(".integral .gou").click(function(){
		$(this).toggleClass('hasgou');
		priceCalculator();
	})

	//材料回寄地址
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
			},
			cancel: true
		});
	});
	var addrid = 0, addArr = [];
	//设置默认地址
	$(".part1Con").delegate(".setAddress", "click", function(){
		var $address=$(this);
		$address.text(langData['shop'][5][14]).parents("dl").siblings("dl").find("a.setAddress").text(langData['shop'][5][15]);
		$address.parents("dl").addClass("on").siblings("dl").removeClass("on");
		$("#addressid").val($address.closest("dl").attr("data-id"));
	});

	$(".part1Con").delegate("dt", "click", function(){
		var $dt=$(this);
		$dt.siblings("dd").find("a.setAddress").text(langData['shop'][5][14]).parents("dl").siblings("dl").find("a.setAddress").text(langData['shop'][5][15]);
		$dt.parents("dl").addClass("on").siblings("dl").removeClass("on");
		$("#addressid").val($dt.closest("dl").attr("data-id"));
	});

	$("#addressid").val($(".part1Con .on").data("id"));

	//添加地址
	$(".part1Con .add").on("click",function(){
		$(".popCon .tip .left").html(langData['siteConfig'][6][96]);
		$("#bg,.popup").show();
	});

	//修改地址
	$(".part1Con").delegate(".revise", "click", function(){
		var t = $(this), dl = t.closest("dl");
		addrid = dl.attr("data-id");
		$(".popCon .tip .left").html(langData['shop'][5][76]);
		$("#bg,.popup").show();

		//填充数据
		$("#person").val(dl.attr("data-name"));
		$("#mobile").val(dl.attr("data-mobile"));
		$("#tel").val(dl.attr("data-tel"));
		$("#address").val(dl.attr("data-address"));
		$("#lnglat").val(dl.attr("data-lng") + ',' + dl.attr("data-lat"));
		var codeNew = dl.attr("data-code");
		if(codeNew != ''){
			$("#address-areaCode").val(codeNew);
			$('.popCon .areaCode i').text("+"+codeNew);
		}else{
			$("#address-areaCode").val('86');
			$('.popCon .areaCode i').text("+86");
		}

		addArr = dl.attr("data-addr").split(" ");
		$("#addrlist select:eq(0) option").each(function(){
			if($(this).text() == addArr[0]){
				$(this).attr("selected", true);
			}
		});
		$("#addrlist select:eq(0)").change();

	});

	//关闭弹出层
	$(".popup .tip i").on("click",function(){
		$("#bg,.popup").hide();

		//清空表单数据
		$(".popCon input").val("");
		var codeOld = $('.areaCode_wrap li:first-child').data('code');//区号恢复默认值
		$(".popCon .areaCode i").text("+"+codeOld);
		$('#address-areaCode').val(codeOld);
		$(".popCon .error").removeClass("error");
		$("#addrlist select:eq(0)").nextAll("select").remove();
		$("#addrlist select:eq(0) option:eq(0)").attr("selected", true);
		$("#mobile").next(".input-tips").show().html('<s></s>'+langData['siteConfig'][20][581]);
	});


	//新地址表单验证
	var inputVerify = {
		addrid: function(){
			if($("#addrlist select:last").val() == 0){
				$("#addrlist").parents("li").addClass("error");
				return false;
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
			if(val.length < 2 || val.length > 15){
				par.addClass("error");
				return false;
			}
			return true;
		}
		,mobile: function(){
			var t = $("#mobile"), val = t.val(), par = t.closest("li");
			if(val == "" && $("#tel").val() == ""){
				par.addClass("error");
				par.find(".input-tips").html("<s></s>"+langData['siteConfig'][20][581]).show();
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

	}


	//区域
	$("#addrlist").delegate("select", "change", function(){
		var sel = $(this), id = sel.val(), index = sel.index();
		if(id == 0){
			sel.closest("li").addClass("error");
			sel.nextAll("select").remove();
		} else if(id != 0 && id != ""){
			$.ajax({
				type: "GET",
				url: "/include/ajax.php",
				data: "service=siteConfig&action=addr&son=0&type="+id,
				dataType: "jsonp",
				success: function(data){
					var i = 0, opt = [];
					if(data instanceof Object && data.state == 100){
						for(var k = 0; k < data.info.length; k++){
							var selected = addArr.length > 0 && addArr[index+1] == data.info[k]['typename'] ? " selected" : "";
							opt.push('<option value="'+data.info[k]['id']+'"'+selected+'>'+data.info[k]['typename']+'</option>');
						}
						sel.nextAll("select").remove();
						$("#addrlist").append('<select name="addrid[]"><option value="0">'+langData['siteConfig'][23][118]+'</option>'+opt.join("")+'</select>');
						sel.closest("li").addClass("error");

						if(addArr.length > 0){
							$("#addrlist select:last").change();
						}
					}else{
						sel.closest("li").removeClass("error");
					}
				},
				error: function(msg){
					alert(msg.status+":"+msg.statusText);
				}
			});
		}
	});

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
		//提交新增/修改
	$("#submit").bind("click", function(){


		var t = $(this);
		if(t.hasClass("disabled")) return false;

		//验证表单
		if(inputVerify.addrid() && inputVerify.address() && inputVerify.person() && inputVerify.mobile() && inputVerify.tel() ){
			var data = [];
			data.push('id='+addrid);
			data.push('addrid='+$("#addrlist select:last").val());
			data.push('address='+$("#address").val());
			data.push('person='+$("#person").val());
			data.push('mobile='+$("#mobile").val());
			data.push('areaCode='+$("#address-areaCode").val());
			data.push('tel='+$("#tel").val());
			data.push('lnglat='+$("#lnglat").val());

			t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");

			$.ajax({
				url: "/include/ajax.php?service=member&action=addressAdd",
				data: data.join("&"),
				type: "POST",
				dataType: "jsonp",
				success: function (data) {
					if(data && data.state == 100){

						//操作成功后关闭浮动层
						$(".popup .tip i").click();

						$(".part1Con dl").remove();
						$(".part1Con").prepend('<div class="loading">'+langData['siteConfig'][20][184]+'...</div>');

						//异步加载所有地址
						$.ajax({
							url: "/include/ajax.php?service=member&action=address",
							type: "POST",
							dataType: "jsonp",
							success: function (data) {
								if(data && data.state == 100){

									$(".part1Con .loading").remove();
									var list = [], addList = data.info.list;

									for(var i = 0; i < addList.length; i++){

										on = (i == 0 && addrid == 0) || (addrid == addList[i].id) ? 1 : 0;
										list.push('<dl'+(on ? " class='on'" : "")+' data-id="'+addList[i].id+'" data-name="'+addList[i].person+'" data-mobile="'+addList[i].mobile+'" data-tel="'+addList[i].tel+'" data-addr="'+addList[i].addrname+'" data-address="'+addList[i].address+'" data-lng="'+addList[i].lng+'" data-lat="'+addList[i].lat+'" data-code="'+addList[i].areaCode+'">');
										list.push('<dt><i></i>');

										contact = addList[i].mobile != "" && addList[i].tel != "" ? addList[i].mobile : (addList[i].mobile == "" && addList[i].tel != "" ? addList[i].tel : addList[i].mobile);
										var areaCode =addList[i].areaCode;
										var code = '';
										if(areaCode != '' && areaCode !='86'){
											code = '+'+areaCode;
										}

										list.push('<p class="name"><span>'+addList[i].person+'</span>  <span class="addr_tel">'+code+' '+contact+'</span></p>');
										list.push('<p class="address"><span>'+addList[i].addrname.replace(/\s+/g, '</span><span>')+'</span></p>');
										list.push('<p class="detail">'+addList[i].address+'</p>');
										list.push('</dt>');
										list.push('<dd><a class="setAddress" href="javascript:;">'+(on ? langData['shop'][5][14] : langData['shop'][5][15])+'</a><a class="revise" href="javascript:;">'+langData['siteConfig'][6][6]+'</a><a class="delete" href="javascript:;">'+langData['siteConfig'][6][8]+'</a></dd>');
										list.push('</dl>');
									}

									$(".part1Con").prepend(list.join(""));
									addrid = 0;
									addArr = [];

									t.removeClass("disabled").html(langData['shop'][5][32]);
									$("#addressid").val($(".part1Con .on").data("id"));


								}else{
									alert(langData['shop'][2][20]);
									t.removeClass("disabled").html(langData['shop'][5][32]);
								}
							},
							error: function(){
								alert(langData['shop'][2][20]);
								t.removeClass("disabled").html(langData['shop'][5][32]);
							}
						});


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


	//删除地址
	$(".part1Con").delegate(".delete", "click", function(){
		var $delete=$(this),$one=$(".part1Con");
		if(confirm(langData['shop'][5][77])){

			$.ajax({
				url: "/include/ajax.php?service=member&action=addressDel",
				data: "id="+$delete.closest("dl").attr("data-id"),
				type: "POST",
				dataType: "jsonp",
				success: function (data) {
					if(data && data.state == 100){

						if($delete.parents("dl").hasClass("on")){
							if($delete.parents("dl").index()==0){
								$one.find("dl:eq(1)").addClass("on").siblings("dl").removeClass("on");
								$one.find("dl:eq(1) a.setAddress").text(langData['shop'][5][14]);
								$one.find("dl:eq(1)").siblings("dl").find("a.setAddress").text(langData['shop'][5][15]);
							}else{
								$one.find("dl:first").addClass("on").siblings("dl").removeClass("on");
								$one.find("dl:first a.setAddress").text(langData['shop'][5][14]);
								$one.find("dl:first").siblings("dl").find("a.setAddress").text(langData['shop'][5][15]);
							}
						}
						$delete.parents("dl").remove();
						$("#addressid").val($(".part1Con .on").data("id"));

					}else{
						alert(data.info);
					}
				},
				error: function(){
					alert(langData['siteConfig'][20][183]);
				}
			});

		}
		$(".part1Con dl.on a.setAddress").css("color","#333");

	})
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

	    var areaWrap =$(this).closest(".inpbdr").find('.areaCode_wrap');
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
	    var par = t.closest(".inpbdr");
	    var areaIcode = par.find(".areaCode");
	    areaIcode.find('i').html('+' + code);
	    var seAreacode = par.find('.commCode')
	    seAreacode.val(code);
	});

	$('body').bind('click', function(e){
	    $('.areaCode_wrap').fadeOut(300);
	    if(e.target!=$('.icon-angle-down')[0]&&e.target!=$('.icon-angle-up')[0]){
	    	$('#single-pick').hide().removeClass('show');
	    }
	});


	otherModify2();
	function otherModify2(){
		//找到当前日期的前面的所有日期
		var len = $('.cal-date').length;
		$('.cal-date').each(function(){
			var $index = $('.cal-date.cal-current').index();
			if($(this).index()<$index){
				$(this).addClass('cal-disabled').removeClass('cal-data-now');
			}
		})
		//修改当天为 今天
		$('.cal-date.cal-current').find('.cal-text').text('今天')
		$('.cal-date.cal-current').next().find('.cal-text').text('明天')
		$('.cal-date.cal-current').next().next().find('.cal-text').text('后天')

	}


	//提交
	$('.submit_a').click(function(){
		var userid = $.cookie(cookiePre+"login_user");
		if(userid == null || userid == ""){
			window.location.href = masterDomain+'/login.html';
			return false;
		}

		var t = $(this);
		var contact = $('#contact').val();
		var tel = $('#tel').val();
		var email =$('#email').val();
		var areaCode = $('#contact-areaCode').val();
		var email_match= /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
		if(contact==''){
			alert(langData['travel'][8][63]);  //请输入联系人
			$('#contact').focus();
			return 0;
		}else if(tel==''){
			alert(langData['travel'][7][60]);//请输入手机号
			$('#tel').focus();
			return 0;
		}else if(email==''){
			alert(langData['travel'][8][64]);  //  请输入邮箱号
			$('#email').focus();
			return 0;
		}else if(!email.match(email_match)){
			alert(langData['travel'][8][65]);   //请输入正确邮箱号
			$('#email').focus();
			return 0;
		}else{//验证申请人
			var aa = true;
			$(".apply_content .apply").each(function () {
				var typePar = $(this).find('.offer_type');
				var applyName = $(this).find('.offer_name').val();
				var applyType = typePar.find("option:selected").text();
				var applyBirth = $(this).find('.birthday').val();
				if(applyName == ''){
					alert('请输入订单联系人姓名');
					$(this).find('.offer_name').focus();
					aa=false;
					return false;
				}
				if(applyType == '请选择客户类型'){
					alert('请选择客户类型');
					typePar.focus();
					aa=false;
					return false;
				}
				if(applyBirth == ''){
					alert('请选择出生日期');
					$(this).find('.birthday').focus();
					aa=false;
					return false;
				}
			});
			if(!aa){
				return false;
			}

		}
		var data = [];
		var applicantinformation = [];    //添加申请人
		$('.apply_content .apply').each(function(){
			var typePar = $(this).find('.offer_type');
			var applyName = $(this).find('.offer_name').val();
			var applyType = typePar.find("option:selected").text();
			var applyBirth = $(this).find('.birthday').val();
			applicantinformation.push(applyName+"$$$"+applyBirth+"$$$"+applyType);

		});
		if(applicantinformation!=''){
			data.push('applicantinformation=' + applicantinformation.join('|||'));
		}
		var choseAddress = $('.part1Con dl.on').data('id');


		data.push('proid=' + $("#proid").val());
		data.push('type=' + type);
		data.push('procount=' + $('.jian').siblings('span').text());
		data.push('people=' + $("#contact").val());
		data.push('areaCode=' + $("#contact-areaCode").val());
		data.push('contact=' + $("#tel").val());
		data.push('email=' + $("#email").val());
		data.push('note=' + $("#note").val());
		data.push('walktime=' + $("#startTime").val());
		data.push('addressid=' + choseAddress);
		data.push('usePinput=' + ($('.integral .gou').hasClass('hasgou')?'1':'0'));


		$.ajax({
			url: '/include/ajax.php?service=travel&action=deal',
			data: data.join("&"),
			type: "GET",
			dataType: "jsonp",
			success: function (data) {
				if(data && data.state == 100){
					if (typeof (data.info) == 'object') {
						info = data.info;
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
						//
						// if (totalBalance * 1 < info.order_amount * 1) {
						//
						// 	$("#moneyinfo").text('余额不足，');
						// }
						if (totalBalance * 1 < info.order_amount * 1) {

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

						ordernum = info.ordernum;
						order_amount = info.order_amount;

						$("#ordertype").val('');
						$("#service").val('travel');
						service = 'travel';
						var src = masterDomain + '/include/qrPay.php?' + datainfo.join('&');
						$('#payQr img').attr('src', masterDomain + '/include/qrcode.php?data=' + encodeURIComponent(src));
					}else {
						location.href = data.info + (data.info.indexOf('?') > -1 ? '&' : '?') + 'currentPageOpen=1';
					}
				}else{
					alert(data.info);
				}
			},
			error: function(){
				alert(langData['siteConfig'][20][183]);
				t.removeClass("disabled").html(langData['shop'][1][8]);
			}
		});

	});

})
