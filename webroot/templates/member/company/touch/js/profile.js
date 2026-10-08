$(function(){
	var currYear = (new Date()).getFullYear();
	var opt={};
	opt.date = {preset : 'date'};
	opt.datetime = {preset : 'datetime'};
	opt.time = {preset : 'time'};
	opt.default = {
		theme: 'android-ics light', //皮肤样式
		display: 'bottom', //显示方式
		mode: 'scroller', //日期选择模式
		dateFormat: 'yyyy-mm-dd',
		lang: 'zh',
	};

	$("#birth").mobiscroll($.extend(opt['date'], opt['default']));

	var gzAddress         = $(".gz-address"),  //选择地址页
			gzAddrHeaderBtn   = $(".gz-addr-header-btn"),  //删除按钮
			gzAddrListObj     = $(".gz-addr-list"),  //地址列表
			gzAddNewObj       = $(".personal_list"),   //新增地址页
			gzSelAddr         = $("#gzSelAddr"),     //选择地区页
			gzSelMask         = $(".gz-sel-addr-mask"),  //选择地区遮罩层
			gzAddrSeladdr     = $(".gz-addr-seladdr"),  //选择所在地区按钮
			gzSelAddrCloseBtn = $("#gzSelAddrCloseBtn"),  //关闭选择所在地区按钮
			gzSelAddrList     = $(".gz-sel-addr-list"),  //区域列表
			gzSelAddrNav      = $(".gz-sel-addr-nav"),  //区域TAB
			gzSelAddrActive   = "gz-sel-addr-active",  //选择所在地区后页面下沉样式名
			gzSelAddrHide     = "gz-sel-addr-hide",  //选择所在地区浮动层隐藏样式名
			showErrTimer      = null,
			gzAddrEditId      = 0,   //修改地址ID
			gzAddrInit = {

					//错误提示
					showErr: function(txt){
							showErrTimer && clearTimeout(showErrTimer);
					$(".gzAddrErr").remove();
					$("body").append('<div class="gzAddrErr"><p>'+txt+'</p></div>');
					$(".gzAddrErr p").css({"margin-left": -$(".gzAddrErr p").width()/2, "left": "50%"});
					$(".gzAddrErr").css({"visibility": "visible"});
					showErrTimer = setTimeout(function(){
						$(".gzAddrErr").fadeOut(300, function(){
							$(this).remove();
						});
					}, 1500);
					}


					//获取地址列表
					,getAddrList: function(){

							gzAddrListObj.html('<div class="empty">'+langData['siteConfig'][20][184]+'...</empty>');

							$.ajax({
									url: masterDomain + '/include/ajax.php?service=member&action=address',
									dataType: "jsonp",
									success: function (data) {
											if(data){

													var list = data.info.list, addrList = [];
													if(data.state == 100 && list.length > 0){

															for (var i = 0, addr, contact; i < list.length; i++) {
																	addr = list[i];
																	contact = addr.mobile != "" ? addr.mobile : addr.tel;
																	addrList.push('<article class="fn-clear" data-id="'+addr.id+'" data-people="'+addr.person+'" data-contact="'+contact+'" data-addrid="'+addr.addrid+'" data-addrids="'+addr.addrids+'" data-addrname="'+addr.addrname+'" data-address="'+addr.address+'">');
																	addrList.push('<div class="gz-linfo">');
																	addrList.push('<s></s>');
																	addrList.push('<h5>'+addr.person+'<sup>'+contact+'</sup></h5>');
																	addrList.push('<p>'+addr.addrname+' '+addr.address+'</p>');
																	addrList.push('</div>');
																	addrList.push('<div class="gz-rbtn gz-rbtn-edit"></div>');
																	addrList.push('</article>');
															}
															gzAddrListObj.html(addrList.join(""));
															gzAddrHeaderBtn.fadeIn(300);

													}else{
															if(list && list.length == 0){
																	gzAddrListObj.html('<div class="empty">'+langData['siteConfig'][20][226]+'</empty>');
															}else{
																	gzAddrListObj.html('<div class="empty">'+data.info+'</empty>');
															}
													}

											}else{
													gzAddrListObj.html('<div class="empty">'+langData['siteConfig'][20][228]+'</empty>');
											}
									},
									error: function(){
											gzAddrListObj.html('<div class="empty">'+langData['siteConfig'][20][227]+'</empty>');
									}
							});

					}

					//删除地址
					,delAddr: function(id, obj){
							$.ajax({
									url: masterDomain + "/include/ajax.php?service=member&action=addressDel",
									data: "id="+id,
									type: "GET",
									dataType: "jsonp",
									success: function (data) {
											if(data && data.state == 100){
													obj.hide(300, function(){
															obj.remove();
															if(gzAddrListObj.find("article").length == 0){
																	gzAddrListObj.html('<div class="empty">'+langData['siteConfig'][20][226]+'</empty>');
															}
													});
											}else{
													alert(data.info);
											}
									},
									error: function(){
											alert(langData['siteConfig'][20][183]);
									}
							});
					}

					//获取区域
					,getAddrArea: function(id){

							//如果是一级区域
							if(!id){
									gzSelAddrNav.html('<li class="gz-curr"><span>'+langData['siteConfig'][7][2]+'</span></li>');
									gzSelAddrList.html('');
							}

							var areaobj = "gzAddrArea"+id;
							if($("#"+areaobj).length == 0){
									gzSelAddrList.append('<ul id="'+areaobj+'"><li class="loading">'+langData['siteConfig'][20][184]+'...</li></ul>');
							}

							gzSelAddrList.find("ul").hide();
							$("#"+areaobj).show();

							$.ajax({
									url: masterDomain + "/include/ajax.php?service=siteConfig&action=area",
									data: "type="+id,
									type: "GET",
									dataType: "jsonp",
									success: function (data) {
											if(data && data.state == 100){
													var list = data.info, areaList = [];
													for (var i = 0, area, lower; i < list.length; i++) {
															area = list[i];
															lower = area.lower == undefined ? 0 : area.lower;
															areaList.push('<li data-id="'+area.id+'" data-lower="'+lower+'"'+(!lower ? 'class="n"' : '')+'>'+area.typename+'</li>');
													}
													$("#"+areaobj).html(areaList.join(""));
											}else{
													$("#"+areaobj).html('<li class="loading">'+data.info+'</li>');
											}
									},
									error: function(){
											$("#"+areaobj).html('<li class="loading">'+langData['siteConfig'][20][183]+'</li>');
									}
							});


					}

					//初始区域
					,gzAddrReset: function(i, ids, addrArr){

							var gid = i == 0 ? 0 : ids[i-1];
							var id = ids[i];
							var addrname = addrArr[i];

							//全国区域
							if(i == 0){
									gzSelAddrNav.html('');
									gzSelAddrList.html('');
							}

							var cla = i == addrArr.length - 1 ? ' class="gz-curr"' : '';
							gzSelAddrNav.append('<li data-id="'+id+'"'+cla+'><span>'+addrname+'</span></li>');

							var areaobj = "gzAddrArea"+id;
							if($("#"+areaobj).length == 0){
									gzSelAddrList.append('<ul class="fn-hide" id="'+areaobj+'"><li class="loading">'+langData['siteConfig'][20][184]+'...</li></ul>');
							}

							$.ajax({
									url: masterDomain + "/include/ajax.php?service=siteConfig&action=area",
									data: "type="+gid,
									type: "GET",
									dataType: "jsonp",
									success: function (data) {
											if(data && data.state == 100){
													var list = data.info, areaList = [];
													for (var i = 0, area, cla, lower; i < list.length; i++) {
															area = list[i];
															lower = area.lower == undefined ? 0 : area.lower;
															cla = "";
															if(!lower){
																	cla += " n";
															}
															if(id == area.id){
																	cla += " gz-curr";
															}
															areaList.push('<li data-id="'+area.id+'" data-lower="'+lower+'"'+(cla != "" ? 'class="'+cla+'"' : '')+'>'+area.typename+'</li>');
													}
													$("#"+areaobj).html(areaList.join(""));
											}else{
													$("#"+areaobj).html('<li class="loading">'+data.info+'</li>');
											}
									},
									error: function(){
											$("#"+areaobj).html('<li class="loading">'+langData['siteConfig'][20][183]+'</li>');
									}
							});

					}

					//隐藏选择地区浮动层&遮罩层
					,hideNewAddrMask: function(){
							gzAddNewObj.removeClass(gzSelAddrActive);
							gzSelMask.fadeOut();
							gzSelAddr.addClass(gzSelAddrHide);
					}

			}



	//选择地址
	gzAddrListObj.delegate("article .gz-linfo", "click", function(){
			var t = $(this), par = t.parent(), id = par.attr("data-id"), people = par.attr("data-people"), contact = par.attr("data-contact"), addrid = par.attr("data-addrid"), addrids = par.attr("data-addrids"), addrname = par.attr("data-addrname"), address = par.attr("data-address");
			// par.addClass(gzAddrActive).siblings("article").removeClass(gzAddrActive);

			var data = {
					"id": id,
					"people": people,
					"contact": contact,
					"addrid": addrid,
					"addrids": addrids,
					"addrname": addrname,
					"address": address
			}
			//业务层需要配合
			// chooseAddressOk(data);

			// gzAddrList.find(gzBackClass).click();
	});

	//选择所在地区
	gzAddrSeladdr.bind("click", function(){
			gzAddNewObj.addClass(gzSelAddrActive);
			gzSelMask.fadeIn();
			gzSelAddr.removeClass(gzSelAddrHide);

			var t = $(this), ids = t.attr("data-ids"), id = t.attr("data-id"), addrname = t.find("dd").text();

			//第一次点击
			if((ids == undefined && id == undefined) || (ids == '' && (id == '' || id == 0))){
					gzAddrInit.getAddrArea(0);

			//已有默认数据
			}else{

					//初始化区域
					ids = ids.split(" ");
					addrArr = addrname.split(" ");
					for (var i = 0; i < ids.length; i++) {
							gzAddrInit.gzAddrReset(i, ids, addrArr);
					}
					$("#gzAddrArea"+id).show();

			}

	});

	//关闭选择所在地区浮动层
	gzSelAddrCloseBtn.bind("touchend", function(){
			gzAddrInit.hideNewAddrMask();
	})

	//点击遮罩背景层关闭层
	gzSelMask.bind("touchend", function(){
			gzAddrInit.hideNewAddrMask();
	});

	//选择区域
	gzSelAddrList.delegate("li", "click", function(){
			var t = $(this), id = t.attr("data-id"), addr = t.text(), lower = t.attr("data-lower"), par = t.closest("ul"), index = par.index();
			if(id && addr){

					t.addClass("gz-curr").siblings("li").removeClass("gz-curr");
					gzSelAddrNav.find("li:eq("+index+")").attr("data-id", id).html("<span>"+addr+"</span>");

					//如果有下级
					if(lower != "0"){

							//把子级清掉
							gzSelAddrNav.find("li:eq("+index+")").nextAll("li").remove();
							gzSelAddrList.find("ul:eq("+index+")").nextAll("ul").remove();

							//新增一组
							gzSelAddrNav.find("li:eq("+index+")").removeClass("gz-curr");
							gzSelAddrNav.append('<li class="gz-curr"><span>'+langData['siteConfig'][7][2]+'</span></li>');

							//获取新的子级区域
							gzAddrInit.getAddrArea(id);

					//没有下级
					}else{

							var addrname = [], ids = [];
							gzSelAddrNav.find("li").each(function(){
									addrname.push($(this).text());
									ids.push($(this).attr("data-id"));
							});

							gzAddrSeladdr.removeClass("gz-no-sel").attr("data-ids", ids.join(" ")).attr("data-id", id).find("dd").html(addrname.join(" "));
							gzAddrInit.hideNewAddrMask();

					}

			}
	});

	//区域切换
	gzSelAddrNav.delegate("li", "touchend", function(){
			var t = $(this), index = t.index();
			t.addClass("gz-curr").siblings("li").removeClass("gz-curr");
			gzSelAddrList.find("ul").hide();
			gzSelAddrList.find("ul:eq("+index+")").show();
	});


    //提交
	$("#submit").bind("click", function(event){
		event.preventDefault();

		var id = $('.gz-addr-seladdr').attr("data-id");
		if(id != 0){
			$('#addr').val(id);
		}

		var t = $(this), form = $("#fabuForm"), serialize = form.serialize(), action = form.attr("action");
		if(t.hasClass('disabled')) return;

		t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");

		$.ajax({
			url: action,
			data: serialize,
			type: "POST",
			dataType: "json",
			success: function (data) {
				if(data && data.state == 100){
					t.removeClass("disabled").html(langData['siteConfig'][20][229]);
					setTimeout(function(){
						t.html(langData['siteConfig'][6][122]);
					}, 2000);
				}else{
					alert(data.info);
					t.removeClass("disabled").html(langData['siteConfig'][6][122]);
				}
			},
			error: function(){
				alert(langData['siteConfig'][20][183]);
				t.removeClass("disabled").html(langData['siteConfig'][6][122]);
			}
		});

	});

})
