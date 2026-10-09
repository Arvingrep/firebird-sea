$(function(){
	var flag = 0, gzAddrEditId = 0;  //添加或者修改

	//错误提示
	var showErrTimer;
	function showErr(txt){
	    showErrTimer && clearTimeout(showErrTimer);
	    $(".popErr").remove();
	    $("body").append('<div class="popErr"><p>'+txt+'</p></div>');
	    $(".popErr p").css({"margin-left": -$(".popErr p").width()/2, "left": "50%"});
	    $(".popErr").css({"visibility": "visible"});
	    showErrTimer = setTimeout(function(){
	        $(".popErr").fadeOut(300, function(){
	            $(this).remove();
	        });
	    }, 1500);
	}

	// 取消积分勾选
	$(".integral .gou").click(function(){
		var t = $(this);
		t.toggleClass('hasgou');
		checkPrice();
	})







	//出行时间显示
    /* var a = [langData['travel'][1][11],langData['travel'][1][12],langData['travel'][1][13],langData['travel'][1][14],langData['travel'][1][15],langData['travel'][1][16],langData['travel'][1][17]];  //周日到周六
	var curDate = new Date();
	var order_time = curDate.getTime() +24*60*60*1000*15;
	var html =[];
	$('.tip i').html(curDate.getFullYear()+'-'+(curDate.getMonth()+1)+'-'+(curDate.getDate()));
	for(var i=0; i<4; i++){
		var preDate = new Date(order_time +24*60*60*1000*i); //后一天
		var nowDate = new Date(curDate.getTime() +24*60*60*1000*i)
		var year = preDate.getFullYear();    //获取完整的年份(4位,1970-????)
		var month = preDate.getMonth();       //获取当前月份(0-11,0代表1月)
		var day = preDate.getDate();        //获取当前日(1-31)
		var week = preDate.getDay();   //获取当前星期几
		if(i==0){
			html.push('<div class="date_chose chosedate" data-year='+nowDate.getFullYear()+'-'+(nowDate.getMonth()+1)+'-'+(nowDate.getDate())+'><h3 data-id="'+year+'-'+(month+1)+'-'+(day)+'">'+(month+1)+'-'+(day)+'</h3><p>星期'+a[week]+'</p></div>')
		}else{
			html.push('<div class="chosedate" data-year='+nowDate.getFullYear()+'-'+(nowDate.getMonth()+1)+'-'+(nowDate.getDate())+'><h3 data-id="'+year+'-'+(month+1)+'-'+(day)+'">'+(month+1)+'-'+(day)+'</h3><p>星期'+a[week]+'</p></div>')
		}
	} */
	var a = [langData['travel'][1][11],langData['travel'][1][12],langData['travel'][1][13],langData['travel'][1][14],langData['travel'][1][15],langData['travel'][1][16],langData['travel'][1][17]];  //周日到周六
	earliestdate = parseInt(earliestdate) * 1000;//将php时间戳转化为整形并乘以1000
	var curDate = new Date(earliestdate);
	var order_time = curDate.getTime() -24*60*60*1000*15;
	var html =[];
	$('.tip i').html(curDate.getFullYear()+'-'+(curDate.getMonth()+1)+'-'+(curDate.getDate()));
	for(var i=0; i<4; i++){
		// var preDate = new Date(order_time +24*60*60*1000*i); //后一天
		var preDate = new Date(curDate.getTime() + 24*60*60*1000*i);
		var nowDate = new Date(order_time + 24*60*60*1000*i);
		var year = preDate.getFullYear();    //获取完整的年份(4位,1970-????)
		var month = preDate.getMonth();       //获取当前月份(0-11,0代表1月)
		var day = preDate.getDate();        //获取当前日(1-31)
		var week = preDate.getDay();   //获取当前星期几
		if(i==0){
			$('.tip i').html(nowDate.getFullYear()+'-'+(nowDate.getMonth()+1)+'-'+(nowDate.getDate()));
			html.push('<div class="date_chose chosedate" data-year='+nowDate.getFullYear()+'-'+(nowDate.getMonth()+1)+'-'+(nowDate.getDate())+'><h3 data-id="'+year+'-'+(month+1)+'-'+(day)+'">'+(month+1)+'-'+(day)+'</h3><p>星期'+a[week]+'</p></div>')
		}else{
			html.push('<div class="chosedate" data-year='+nowDate.getFullYear()+'-'+(nowDate.getMonth()+1)+'-'+(nowDate.getDate())+'><h3 data-id="'+year+'-'+(month+1)+'-'+(day)+'">'+(month+1)+'-'+(day)+'</h3><p>星期'+a[week]+'</p></div>')
		}
	}

	html.push('<div class="more_date"><a href="javascript:;">'+langData['travel'][1][10]+'</a></div>');  //更多
	$('.datebox').html(html.join(''));
	$('#datein').val($('.date_chose').find('h3').text())

	//选择时间
	$('.datebox').delegate('.chosedate','click',function(){
		$(this).addClass('date_chose').siblings('.chosedate').removeClass('date_chose');
		var year  = $(this).attr('data-year');
		 $('#datein').val($(this).find('h3').text());  //
		 $('.tip i').text(year)
	})


	//申请人填写相关操作s
	/*打开申请人页面*/
	$('.addoffer_btn').click(function(){
		$('.page_offer').animate({'right':0},150);
		if($('.page_offer .per_list li').length==0){
			$('.page_offer .chose_confirm').hide();
		}
	});

	/*关闭申请人页面*/
	$('.top_return a').click(function(){
		$(this).parents('.page').animate({'right':'-100%'},150);
	});

	/*选择申请人*/
	$('.page_offer .per_list ').delegate('.per_info','click',function(){
		$(this).siblings('.chose_btn').toggleClass('chose_on');
		$(this).parents('li').toggleClass('chosed');
	});

	$('.page_offer .per_list ').delegate('.chose_btn','click',function(){
		$(this).toggleClass('chose_on');
		$(this).parents('li').toggleClass('chosed');
	});

	//修改申请人信息
	$('.page_offer .per_list').delegate('.edit_btn','click',function(){
		flag = 1;
		var t = $(this), parent = t.parents('li'),info = parent.find('.per_info'),id=parent.attr('data-id') ;
		$('.info_in').animate({'right':0},150);
		var offer_name = info.find('dt').text(),offer_birth = info.find('.date_birth').text(),offer_type = info.find('.cate_chose').text();
		$('#offer_name').val(offer_name);
		$('#offer_type').val(offer_type);
		$('#offer_birth').val(offer_birth);
		$('.tijiao').attr('data-id',id);  //提供id
	});

	//删除
	$('.page_offer .per_list').delegate('.del_btn','click',function(){
		var t = $(this), parent = t.parents('li'),len = $('.page_offer .per_list li').length;
		parent.remove();
		if(len<=1){
			$('.page_offer .chose_confirm').hide();
		}
	});

	/*新增申请人*/
	$('.add_btn').click(function(){
		flag = 0;
		$('.info_in').animate({'right':0},150);
	});

	/*选择申请人*/
	$('.page_offer .chose_confirm').click(function(){
		var chosed =[],html=[],len = $('.page_offer .per_list').find('.chosed').length;
		if(len>=20){
			showErr(langData['travel'][8][47]);   //选择的申请人超过20了
			return 0
		}else if(len==0){
			showErr(langData['travel'][8][48]);   //请选择申请人
			return 0
		}else{
			$('.page_offer .per_list').find('.chosed').each(function(){
				var t = $(this),birth =t.find('.date_birth').text(), name = t.find('.per_info dt').text(), job = t.find('.cate_chose').text(),type='';
				chosed.push({
					'offer_name':name,
					'offer_birth':birth,
					'offer_job':job,
				});
			});

			$('.page_offer').animate({'right':'-100%'},150);   //当前页面隐藏
			$('.add_offer dt').show();

			for(var i=0; i<chosed.length;i++){
				jsGetAge(chosed[i].offer_birth);
				var dd_box = '<dd data-name="'+chosed[i].offer_name+'" data-age="'+chosed[i].offer_birth+'" data-typename="'+chosed[i].offer_job+'"><label>'+langData['travel'][13][77]+'</label><span class="name_offer"><em>'+type+'</em>'+(chosed[i].offer_name)+'</span><span class="type_offer type_right">'+(chosed[i].offer_job)+'</span></dd>';
				html.push(dd_box);
			}
			$('.add_offer dl').find('dd').remove();
			$('.add_offer dt').after(html.join(''));
			checkPrice()
		}
	});

checkPrice()
	// 计算价格
	 function checkPrice(){
		var len = $(".add_offer dd").length;
		var price = $(".price_all").attr('data-price');
		var priceAll = len > 0 ? price * len : price;
		jifen_di = parseInt(jifen_ * priceAll  * pointRatio / 100);
		jifen_di = hasPoint <= jifen_di ? hasPoint : jifen_di;
		jian = parseFloat((jifen_di/pointRatio).toFixed(2));
		$(".integral .jifen").html(jifen_di) ;
		$(".integral .jian").html(jian) ;
		if($(".integral .gou").hasClass('hasgou')){
			$('.price_all em').html(priceAll-jian);
			$('.detail_all em').html(priceAll-jian);
		}else{
			$('.price_all em').html(priceAll);
			$('.detail_all em').html(priceAll);
		}
	}

	$('.tijiao').click(function(){
		var offer_name = $('#offer_name').val(),
		offer_type = $('#offer_type').val(),
		offer_birth = $('#offer_birth').val();
		if( offer_name==''){
			showErr(langData['travel'][8][49]);   //请输入姓名
			return 0;
		}else if(offer_type==''){
			showErr(langData['travel'][8][50]);  //请选择客户类型
			return 0;
		}else if(offer_birth==''){
			showErr(langData['travel'][8][51]);   //请选择出生日期
			return 0;
		}
		$(this).parents('.page').animate({'right':'-100%'},150);
		$('.page_offer .chose_confirm').show();
		if(flag==0){
			var len = $('.page_offer .per_list li').length;  //模拟一下id
			var list =`
				<li data-id=`+len+` class="chosed">
					<a class="chose_btn _left chose_on" href="javascript:;"></a>
					<div class="btn_group">
						<a href="javascript:;" class="edit_btn"></a>
						<a href="javascript:;" class="del_btn"></a>
					</div>
					<dl class="per_info">
						<dt>`+offer_name+`</dt>
						<dd><label>`+langData['travel'][8][52]+`</label><span class="date_birth">`+offer_birth+`</span></dd>
						<dd><label>`+langData['travel'][8][53]+`</label><span class="cate_chose">`+offer_type+`</span></dd>
					</dl>
				</li>
			`;  //出生日期-----客户类型
			$('.page_offer .per_list').prepend(list);
		}else{
			var id = $(this).attr('data-id');
			$('.page_offer .per_list li').each(function(){
				var t =$(this),
				id_t = t.attr('data-id'),
				date_birth=t.find('.date_birth'),
				cate_chose=t.find('.cate_chose'),
				offer=t.find('.per_info dt');
				if(id_t==id){
					date_birth.text(offer_birth);
					cate_chose.text(offer_type);
					offer.text(offer_name);
					return false;
				}
			})
		}
		$('.info_in input').val('');
	});

	//申请人类型
	var typeSelect = new MobileSelect({
			trigger: '.offer_type ',
			title: langData['travel'][8][53],  //客户类型
			wheels: [
						{data:[langData['travel'][8][54],langData['travel'][8][55],langData['travel'][8][56],langData['travel'][8][57],langData['travel'][8][58]]}
					],
			//	    '在职人员','自由职业者','退休人员','在校学生','学龄前儿童'
			callback:function(indexArr, data){
				$('#offer_type').val(data.join(' '))

			}
		,triggerDisplayData:false,
	});

	//出生时间选择器
    var opt1={};
    opt1.date = {preset : 'date'};
    opt1.datetime = {preset : 'datetime'};
    opt1.time = {preset : 'time'};
    opt1.default = {
        dateFormat:'yy-mm-dd',
        mode: 'scroller', //日期选择模式
        lang:'zh',
        maxDate: new Date(),
        onCancel:function(){//点击取消按钮

        },
        onSelect:function(valueText,inst){//点击确定按钮
            $('#offer_birth').val(valueText)

        },
    };
    var time = $.extend(opt1['date'], opt1['default']);
    $(".offer_birth").scroller($.extend(opt1['date'], opt1['default']));

	//申请人填写相关操作e

	//选择地址s
	$('.info_box').click(function(){
		$('.page_address').animate({'right':0},150);
		if($('.page_address .per_list li').length==0){
			$(".page_address .chose_confirm").hide();
		}
	});

	$('.add_btn1').click(function(){
		flag = 0;
		gzAddrEditId = 0;
		$('.address_in').animate({'right':0},150);
	});

	//选择地址效果切换
	$('.page_address .per_list ').delegate('.adress_info','click',function(){
		var t= $(this),parent = t.parents('li'),psib = parent.siblings('li');
		t.siblings('.chose_cir').toggleClass('chose_on');
		parent.toggleClass('chosed').siblings('li').removeClass('chosed');
		psib.find('.chose_cir').removeClass('chose_on')
	});

	$('.page_address .per_list ').delegate('.chose_cir','click',function(){
		var t= $(this),parent = t.parents('li'),psib = parent.siblings('li');
		t.toggleClass('chose_on');
		parent.toggleClass('chosed').siblings('li').removeClass('chosed');
		psib.find('.chose_cir').removeClass('chose_on')
	});

	$('.page_address .per_list').delegate('.del_btn','click',function(){
		var len = $('.page_address .per_list li').length;
		$(this).parents('li').remove();
		if(len<=1){
			$('.page_address .chose_confirm').hide();
		}
	});

	//修改信息
	$('.page_address .per_list').delegate('.edit_btn','click',function(){
		flag = 1;
		var t = $(this), parent = t.parents('li'),info = parent.find('.per_info'),id=parent.attr('data-id') ;
		$('.address_in').animate({'right':0},150);

		if(id){
			gzAddrEditId = id;

			var people  = t.parents('li').attr('data-name');
			var contact = t.parents('li').attr('data-tel');
			var address = t.parents('li').attr('data-address');
			var addrname= t.parents('li').attr('data-addr');
			var addrid  = t.parents('li').attr('data-addrid');
			var addrids = t.parents('li').attr('data-ids');

			$("#post_name").val(people);
			$("#post_tel").val(contact);
			$(".position_box .gz-addr-seladdr dd").text(addrname);
			$("#post_address").val(address);
			$("#addrid").val(addrid);
			$(".position_box .gz-addr-seladdr").attr("data-id", addrid);
			$(".position_box .gz-addr-seladdr").attr("data-ids", addrids);
		}
	});

	$('.page_address .chose_confirm').click(function(){
		var id = $('.per_list .chose_on').parent('li').data('id'),
			post_info = $('.per_list .chose_on').siblings('.adress_info').children('dt').html(),
			address = $('.per_list .chose_on').siblings('.adress_info').children('.post_addr').html();
		$('.add_addr').hide();
		$('.info_box').html('<ul><li>'+post_info+'</li><li>'+address+'</li></ul>');
		$(this).parents('.page_address').animate({'right':'-100%'},150);console.log(id);
		$("#addressid").val(id);
	});



	$('.tijiao1').click(function(){


		var t = $(this);
		var tel_d = /^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/;
		var post_name = $('#post_name').val(),
		post_tel = $('#post_tel').val(),
		post_address = $('#post_address').val(),
		addrids = $('.gz-addr-seladdr').attr('data-ids')
		addrid = $('#addrid').val(),
		areatxt = $('.gz-addr-seladdr').find('p').text();
		if( post_name==''){
			showErr(langData['travel'][8][49]);     //请输入姓名
			return 0;
		}else if(post_tel==''){
			showErr(langData['travel'][7][60]);   //请输入手机号
			return 0;
		}else if(!post_tel.match(tel_d)){
			showErr(langData['travel'][7][61]);   //请输入正确的手机号
			return 0;
		}else if(addrid==''){
			showErr(langData['travel'][8][60]);   //请选择所在地区
			return 0;
		}else if(post_address==''){
			showErr(langData['travel'][8][61]);   //请输入详细地址
			return 0;
		}
		$(this).parents('.page').animate({'right':'-100%'},150);
		$(".page_address .chose_confirm").show();

		t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");

		var data = [];
		data.push('id='+ gzAddrEditId);
		data.push('addrid='+$(".gz-addr-seladdr").attr("data-id"));
		data.push('address='+$("#post_address").val());
		data.push('person='+$("#post_name").val());
		data.push('mobile='+$("#post_tel").val());

		$.ajax({
			url: masterDomain+"/include/ajax.php?service=member&action=addressAdd",
			data: data.join("&"),
			type: "GET",
			dataType: "jsonp",
			success: function (data) {
				if(data && data.state == 100){
					//返回到地址列表
					$(".address_in .top_return").click();

					//异步加载所有地址
					$.ajax({
						url: masterDomain+"/include/ajax.php?service=member&action=address",
						type: "POST",
						dataType: "jsonp",
						success: function (data) {
							if(data && data.state == 100){
								$(".null").remove();
								var list = [], addList = data.info.list;
								for(var i = 0; i < addList.length; i++){
									contact = addList[i].mobile != "" && addList[i].tel != "" ? addList[i].mobile : (addList[i].mobile == "" && addList[i].tel != "" ? addList[i].tel : addList[i].mobile);

									list.push('<li class="chosed" data-id="'+addList[i].id+'" data-ids="'+addList[i].addrids+'" data-addrid="'+addList[i].addrid+'" data-name="'+addList[i].person+'" data-tel="'+addList[i].mobile+'" data-addr="'+addList[i].addrname+'" data-address="'+addList[i].address+'">');
									list.push('<a class="chose_cir _left" href="javascript:;"></a>');

									list.push('<div class="btn_group">');
									list.push('<a href="javascript:;" class="edit_btn"></a>');
									list.push('<a href="javascript:;" class="del_btn"></a>');
									list.push('</div>');

									list.push('<dl class="adress_info">');
									list.push('<dt><dt><span class="postname">'+addList[i].person+'</span><span class="post_tel">'+contact+'</span></dt></dt>');
									list.push('<dd class="post_addr" data-addr="'+addList[i].addrid+'" data-ids="'+addList[i].addrids+'"><em class="addr_area">'+addList[i].addrname+'</em><span class="addr_detail">'+addList[i].address+'</span></dd>');

									list.push('</dl>');
									list.push('</li>');

								}
								$(".per_list").html(list.join(""));
								gzAddrEditId = 0;
							}else{
								alert(langData['shop'][2][20]);
							}
						},
						error: function(){
							alert(langData['shop'][2][20]);
						}
					});

					t.removeClass("disabled").html(langData['siteConfig'][6][27]);
					$("#addressid").val("");
					$(".chose_cir:eq(0)").addClass('chose_on');
				}else{
					alert(data.info);
					t.removeClass("disabled").html(langData['siteConfig'][6][27]);
				}
			},
			error: function(){
				alert(langData['siteConfig'][20][183]);
				t.removeClass("disabled").html(langData['siteConfig'][6][27]);
			}
		});

		$('.address_in input').val('');
		$('.address_in .position_box p').html('<font style="color: #aaa;">'+langData['travel'][1][18]+'</font>')   ;   //请选择
	});

	//选择地址e


	//时间选择器
    var opt={};
    var mydate = new Date();
	var mimtime = mydate.getTime()+1000*60*60*24*15;  //俩周后
    opt.date = {preset : 'date'};
    opt.datetime = {preset : 'datetime'};
    opt.time = {preset : 'time'};
    opt.default = {
        dateFormat:'yy-mm-dd',
        mode: 'scroller', //日期选择模式
        lang:'zh',
        minDate: new Date(mimtime),
        onCancel:function(){//点击取消按钮

        },
        onSelect:function(valueText,inst){//点击确定按钮
            console.log(inst);
            var chosedate = new Date(valueText);
			// 有三种方式获取
			var curchose = chosedate.getTime();
			var file_time = new Date(curchose-24*60*60*1000*15)  //材料需要提前15天提交
//          $('.tip i').html(file_time.getFullYear());
            $('.tip i').html(file_time.getFullYear()+'-'+(file_time.getMonth()+1)+'-'+(file_time.getDate()));
            console.log(curchose);
            var html2 = [];
            var len = $('.chosedate').length;
            for(var i=0; i<len; i++){
            	var preDate = new Date(curchose +24*60*60*1000*i); //后一天
            	var nowDate = new Date(curchose-24*60*60*1000*(15-i));
				var year = preDate.getFullYear();    //获取完整的年份(4位,1970-????)
				var month = preDate.getMonth();       //获取当前月份(0-11,0代表1月)
				var day = preDate.getDate();        //获取当前日(1-31)
				var week = preDate.getDay();   //获取当前星期几
				if(i==0){
					html2.push('<div class="date_chose chosedate" data-year = '+nowDate.getFullYear()+'-'+(nowDate.getMonth()+1)+'-'+(nowDate.getDate())+'><h3 data-id="'+year+'-'+(month+1)+'-'+(day)+'">'+(month+1)+'-'+(day)+'</h3><p>星期'+a[week]+'</p></div>')
				}else{
					html2.push('<div class="chosedate" data-year = '+nowDate.getFullYear()+'-'+(nowDate.getMonth()+1)+'-'+(nowDate.getDate())+'><h3 data-id="'+year+'-'+(month+1)+'-'+(day)+'">'+(month+1)+'-'+(day)+'</h3><p>星期'+a[week]+'</p></div>')
				}
            }
            $('.chosedate').remove();
			$('.more_date').before(html2.join(''));
        },
    };
    var time = $.extend(opt['date'], opt['default']);
    $(".more_date").scroller($.extend(opt['date'], opt['default']));

	//提交
	$('.right_btn').click(function(){
		var userid = $.cookie(cookiePre+"login_user");
		if(userid == null || userid == ""){
			window.location.href = masterDomain+'/login.html';
			return false;
		}

		var per_len = $('.add_offer dd').length;  //申请人
		var addr_info = $('.postBox ul').length;
		var contact = $('#contact').val();
		var tel = $('#tel').val();
		var email =$('#email').val();
		var tel_d = /^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/;
		var email_match= /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
		if(per_len==0){
			showErr(langData['travel'][8][62]);  //请添加申请人
			return 0;
		}else if(contact==''){
			showErr(langData['travel'][8][63]);   //请输入联系人
			return 0;
		}else if(tel==''){
			showErr(langData['travel'][7][60]);   //请输入手机号
			return 0;
		}else if(!tel.match(tel_d)){
			showErr(langData['travel'][7][61]);    //请输入正确的手机号
			return 0;
		}else if(email==''){
			showErr(langData['travel'][8][64]);  //  请输入邮箱号
			return 0;
		}else if(!email.match(email_match)){
			showErr(langData['travel'][8][65]);   //请输入正确邮箱号
			return 0;
		}else if(addr_info==0){
			showErr(langData['travel'][8][66]);   //请选择材料回寄地址
			return 0;
		}
		$(".payBeforeLoading").show();
		var data = [];
		data.push('proid=' + $("#proid").val());
		data.push('type=' + types);
		data.push('procount=1');
		data.push('people=' + $("#contact").val());
		data.push('contact=' + $("#tel").val());
		data.push('email=' + $("#email").val());

		var applicantinformation = [];    //添加申请人
		$('.add_offer dd').each(function(){
			var d = $(this), name = d.attr('data-name'), age = d.attr('data-age'), typename = d.attr('data-typename');
			if(name !="" || age !=''){
				applicantinformation.push(name+"$$$"+age+"$$$"+typename);
			}
		});

		if(applicantinformation!=''){
			data.push('applicantinformation=' + applicantinformation.join('|||'));
		}

		data.push('addressid=' + $("#addressid").val());
		data.push('note=' + $("#note").val());
		data.push('walktime=' + $(".datebox .date_chose").find('h3').data('id'));
		data.push('usePinput=' + ($('.integral .gou').hasClass('hasgou')?'1':'0'));


		$.ajax({
			url: masterDomain + '/include/ajax.php?service=travel&action=deal',
			data: data.join("&"),
			type: "GET",
			dataType: "jsonp",
			success: function (data) {
				$(".payBeforeLoading").hide();
				if (typeof (data.info) == 'object') {
					sinfo = data.info;
					service = 'travel';
					$('#ordernum').val(sinfo.ordernum);
					$('#action').val('pay');

					$('#pfinal').val('1');
					$("#amout").text(sinfo.order_amount);
					$('.payMask').show();
					$('.payPop').css('transform', 'translateY(0)');

					// if (totalBalance * 1 < sinfo.order_amount * 1) {
					//
					// 	$("#moneyinfo").text('余额不足，');
					//
					// 	$('#balance').hide();
					// }
					if (totalBalance * 1 < sinfo.order_amount * 1) {

						$("#moneyinfo").text('余额不足，');
						$("#moneyinfo").closest('.check-item').addClass('disabled_pay')

						$('#balance').hide();
					}

					if(monBonus * 1 < sinfo.order_amount * 1  &&  bonus * 1 >= sinfo.order_amount * 1){
						$("#bonusinfo").text('额度不足，');
						$("#bonusinfo").closest('.check-item').addClass('disabled_pay')
					}else if( bonus * 1 < sinfo.order_amount * 1){
						$("#bonusinfo").text('余额不足，');
						$("#bonusinfo").closest('.check-item').addClass('disabled_pay')
					}else{
						$("#bonusinfo").text('');
						$("#bonusinfo").closest('.check-item').removeClass('disabled_pay')
					}


					ordernum = sinfo.ordernum;
					order_amount = sinfo.order_amount;

					payCutDown('', sinfo.timeout, sinfo);
				}else {
					if(data && data.state == 100){
						if(device.indexOf('huoniao_Android') > -1) {
							setupWebViewJavascriptBridge(function (bridge) {
								bridge.callHandler('pageClose', {}, function (responseData) {
								});
							});
							location.href = data.info;
						}else{
							location.href = data.info + (data.info.indexOf('?') > -1 ? '&' : '?') + 'currentPageOpen=1';
						}
					}else{
						alert(data.info);
					}
				}

			},
			error: function(){
				$(".payBeforeLoading").hide();
				alert(langData['siteConfig'][20][183]);
				t.removeClass("disabled").html(langData['shop'][1][8]);
			}
		});

	});

	//价格明细
	$('.price_all a').click(function(){
		$('.mask').show();
		$('.detail_price').animate({'bottom':'0'},200)
	});

	$('.detail_price h2>i,.mask').click(function(){
		$('.mask').hide();
		$('.detail_price').animate({'bottom':'-4rem'},200)
	});

	function jsGetAge(strBirthday){
		var returnAge;
		var strBirthdayArr=strBirthday.split("-");
		var birthYear = strBirthdayArr[0];
		var birthMonth = strBirthdayArr[1];
		var birthDay = strBirthdayArr[2];

		d = new Date();
		var nowYear = d.getFullYear();
		var nowMonth = d.getMonth() + 1;
		var nowDay = d.getDate();

		if(nowYear == birthYear){
			returnAge = 0;//同年 则为0岁
		}
		else{
			var ageDiff = nowYear - birthYear ; //年之差
			if(ageDiff > 0){
				if(nowMonth == birthMonth) {
					var dayDiff = nowDay - birthDay;//日之差
					if(dayDiff < 0)
					{
						returnAge = ageDiff - 1;
					}
					else
					{
						returnAge = ageDiff ;
					}
				}
				else
				{
					var monthDiff = nowMonth - birthMonth;//月之差
					if(monthDiff < 0)
					{
						returnAge = ageDiff - 1;
					}
					else
					{
						returnAge = ageDiff ;
					}
				}
			}
			else
			{
				returnAge = -1;//返回-1 表示出生日期输入错误 晚于今天
			}
		}
		if(returnAge>13){
			type =langData['travel'][8][67];  //成人
		}else{
			type =langData['travel'][8][68];  //儿童
		}
		return returnAge;//返回周岁年龄
	}


});
