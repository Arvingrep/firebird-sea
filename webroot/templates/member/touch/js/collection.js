var page = 1,pageSize = 20,load_on = false;
$(function(){
	var module = getParam('module');
	if(module){
		$("."+module+"_page").removeClass('fn-hide').addClass('mshow');
		$('.allModule_page').addClass('fn-hide');
	}

	
	//全部内容时 切换
	$('.alltabbox li').click(function(){
		$(this).addClass('curr').siblings('li').removeClass('curr');
		closeFilter();
		page =1;
		load_on = false;
		let ctype = $(this).attr('data-type');
		if(ctype == 4){
			updateRead()
		} 
		$(".btn_cancel").find('em').html('0');

		$('.listBox ul').html('');
		getDatalist();
	})

	//各模块 切换
	$('.tabbox li').click(function(){
		$(this).addClass('curr').siblings('li').removeClass('curr');
		closeFilter();
		page =1;
		load_on = false;
		$('.listBox ul').html('');
		getDatalist(module);
	})

	//单独模块分类
	if(stype!=''){
		$("."+module+"_page .tabbox li[data-type='"+stype+"']").click();
	}

	//筛选
  	$('.allFilter .sxFilter').click(function(){

	    if(!$(this).hasClass('active')){
	      	$(this).addClass('active');
	      	$('.filterMask').show();
	      	if ($(".huoniao_iOS").size()>0) {//app时
		      	$('.filterWrap').animate({'top':'.9rem'},200);
		  	}else{
		  		$('.filterWrap').animate({'top':'1.8rem'},200);
		  	}
		  	$('html').addClass('noscroll');
            //APP端取消下拉刷新
    		toggleDragRefresh('off');
	    }else{
			
			closeFilter();
	    }
  	})
  	function closeFilter(){
  		$('.allFilter .sxFilter').removeClass('active');			
      	$('.filterMask').hide();
      	$('.filterWrap').animate({'top':'-100%'},200);
      	$('html').removeClass('noscroll');
		let ctype = $(".alltabbox li.curr").attr('data-type');
		$(".manageBox .btns_group").addClass('fn-hide')
		$(".delAlertCon .del_tip").addClass('fn-hide')
		if(ctype == 4){
			$(".delAlertCon .del_tip.zan_tip ").removeClass('fn-hide')
			$(".manageBox .btns_group.zan_btns ").removeClass('fn-hide')
			// $(".listBox").removeClass('on_manage')
			// $(".manageBox ").removeClass('slide-in-bottom')
			// $(".manageA ").css({'visibility':'hidden'})
		}else{
			// $(".manageA").css({'visibility':'visible'})
			$(".delAlertCon .del_tip.collect_tip").removeClass('fn-hide')
			$(".manageBox .btns_group.collect_btns ").removeClass('fn-hide')

		}
      	//APP端开启下拉刷新
	  	toggleDragRefresh('on');
  	}
  	$('.filterMask').click(function(){
  		closeFilter();
  	})

  	// 筛选选中
  	$('.filterWrap li').click(function(){
  		var modId = $(this).find('a').attr('data-id');
  		$(this).addClass('curr').siblings('li').removeClass('curr');
  		closeFilter();
  		page =1;
		load_on = false;
		$('.listBox ul').html('');
  		getDatalist();
  	})

  	//管理收藏
  	$('.header-search  .manageA,.allModule_page  .manage_box').click(function(){
  		var t = $(this);
  		if($('.listBox li').size() > 0){
			if(t.hasClass('manage_box')){
				$('.listBox').addClass('on_manage');
				$('.manageBox').addClass('slide-in-bottom');
				t.hide()
			}else{
				if(!t.hasClass('active')){//管理
				  t.siblings().hide();
					t.addClass('active').text('完成');
					$('.listBox').addClass('on_manage');
					$('.manageBox').addClass('slide-in-bottom');
				}else{//完成
					t.siblings().show();
					t.removeClass('active').text('管理');
					$('.listBox').removeClass('on_manage');
					$('.manageBox').removeClass('slide-in-bottom');
					$(".btn_cancel").find('em').html('0');
				  $(".delAlert .delTile").find('em').html('0');
				  $('.listBox li').removeClass('on_chose');
				}
			}
  		}
  		
  		closeFilter();
  		
  	})

	$(".btn_finish").click(function(){
		$('.listBox').removeClass('on_manage');
		$('.manageBox').removeClass('slide-in-bottom');
		$(".btn_cancel").find('em').html('0');
		$(".delAlert .delTile").find('em').html('0');
		$('.listBox li').removeClass('on_chose');
		$('.allModule_page  .manage_box').show()
	})

	// 更新状态为已读
	function updateRead(){
		$.ajax({
            url: '/include/ajax.php?service=member&action=updateRead&type=zan',
            type: "POST",
            dataType: "json",
            success: function (data) {
                if(data && data.state == 100){
					// 更新成功
				}
            },
            error: function () { }
        });
	};

	// 选择
	$("body").delegate('.on_manage li','click',function(){
		var t = $(this);
		t.toggleClass('on_chose');
		var chose_len = $(".on_chose").length;
		if(chose_len==0){
			$(".btn_cancel").addClass('disabled')
		}else{
			$(".btn_cancel").removeClass('disabled')
		}
		$(".btn_cancel").find('em').html(chose_len);
		$(".delAlert .delTile").find('em').html(chose_len);
		return false;
	})
	//全选
	$('.manageBox .btn_clear').click(function(){
		if(!$(this).hasClass('click')){
			$(this).addClass('click');
			$('.listBox li').addClass('on_chose');
		}else{
			$(this).removeClass('click');
			$('.listBox li').removeClass('on_chose');
		}
		var chose_len = $(".on_chose").length;
		if(chose_len==0){
			$(".btn_cancel").addClass('disabled')
		}else{
			$(".btn_cancel").removeClass('disabled')
		}
		$(".btn_cancel").find('em').html(chose_len);
		$(".delAlert .delTile").find('em').html(chose_len);
		
	})

	//确认取消收藏
	$(".btn_cancel").click(function(){
		if($(this).hasClass('disabled')) 
		return false;
		$('.delMask').show();
		$('.delAlert').addClass('show');

	})
	//确认取消收藏--确认
	$('.delAlert .sureDel').click(function(){
		$('.delMask').hide();
		$('.delAlert').removeClass('show');
		var ids = [];
		$('.listBox  li.on_chose').each(function () {
			ids.push($(this).attr('data-id'));
		})
		let ctype = $(".alltabbox li.curr").attr('data-type');
		// let url = "/include/ajax.php?service=member&action=delCollect&id="+ids;
		if(ctype != 4){
			$.ajax({
				url:"/include/ajax.php?service=member&action=delCollect&id="+ids,
				type: "GET",
				dataType: "jsonp",
				success: function (data) {
					if(data && data.state == 100){
						$('.swiper-slide-active .item').each(function(){
							var t = $(this), selected = $(this).find('.selected'), id = selected.closest('.item').attr('data-id');
							if (id) {
								t.remove();
							}
						})
						if ($('.swiper-slide-active .item').length == 0) {
							finishDel();
						}
					}else{
						alert(data.info);
					}
				},
				error: function(){
					alert(langData['siteConfig'][20][183]);
				}
			});
			// 此处为模拟数据 实际为 del_history()
			showErrAlert('取消收藏成功');
			$(".on_chose").remove();
			$('.btn_cancel em').text(0);
		}else{
			let idDels = []
			for(let i = 0; i < ids.length; i++){
				let li = $(".listBox.on_manage li.zan_li[data-id='"+ ids[i] +"']")
				let type = li.attr('data-type');
				let module = li.attr('data-module')
				let url = "/include/ajax.php?service=member&action=dingComment&type=del&id="+ids[i]
				if(type === '0'){
					url =  "/include/ajax.php?service=member&action=getZan&temp=detail&uid=1&module="+ module +"&id="+ids[i]
				}
				$.ajax({
					url:url,
					type: "GET",
					dataType: "json",
					success: function (data) {
						if(data.state == 100){
							idDels.push(ids[i])
							li.remove()
							if(idDels.length == ids.length){
								showErrAlert('成功取消点赞');
								$(".on_chose").remove();
								$('.btn_cancel em').text(0);
							}
						}
					},
					error: function(){
						// alert(langData['siteConfig'][20][183]);
						showErrAlert(langData['siteConfig'][20][183]);
					}
				});
			}
		}
		
	})
	//确认取消收藏--取消
	$('.delAlert .cancelDel,.delMask').click(function(){
		$('.delMask').hide();
		$('.delAlert').removeClass('show');
	})

	

	// 删除数据
	function del_history(){
		var data =  [];
		$('.btn_del').addClass('disabled');			
		var idList = []
		$(".on_chose").each(function(){
			var t = $(this),tid = t.attr('data-id'),tmod = t.attr('data-module');
			var delArr = {'id':tid,'module':tmod};
			idList.push(delArr)
		})
		data.push('delall=0');
		
		$.ajax({
			url: '/include/ajax.php?service=member&action=delFootprints',
			type: "POST",
			dataType: "json",
			data:data.join('&')+'&dellist='+JSON.stringify(idList),
			success: function (data) {
				if(data.state==100){
					showErrAlert('取消收藏成功');
					$(".on_chose").remove();
					$('.btn_cancel em').text(0);
				}else{
					showErrAlert(data.info);
					if($('.btn_cancel em').text() != '0'){
						$('.btn_cancel').removeClass('disabled');
					}
				}
			},
			error: function(data){
				showErrAlert(data.info);
				if($('.btn_cancel em').text() != '0'){
					$('.btn_cancel').removeClass('disabled');
				}
			},
		});


	}
	// 下拉加载
	$(window).scroll(function() {
		
		var allh = $('body').height();
		var w = $(window).height();
		var scroll = allh - w - 60;
		if ($(window).scrollTop() > scroll && !load_on) {
		  getDatalist(module);
		};

	});
	getDatalist(module);
	//数据列表
	function getDatalist(smodule){
		if(load_on) return false;
		load_on = true;
		$(".loading").remove();
		$('.listBox').append('<div class="loading hasCon"><p>加载中~</p></div>');
		var data =[];
		data.push('page='+page);
		data.push('pageSize='+pageSize);
		let action = 'collectList';
		let showType = '';
		if(smodule){//单独模块进来

			data.push('module='+smodule);//模块
			var type = $('.mshow .tabbox ul li.curr').attr('data-type');//模块下的分类
			if(type != 4){
				data.push('type='+type);
			}
			showType = type
		}else{//总首页的模块筛选	

			var modId = $('.filterWrap li.curr').find('a').attr('data-id');//模块	
			var contype = $('.alltabbox ul li.curr').attr('data-type');//全部or商品or内容or店铺
			data.push('module='+modId);
			if(contype != 4){
				data.push('contype='+contype);
			}else{
				// 修改action
				action = 'upList'
				data.push('u=2')
			}
			showType = contype
		}
		if(!module){
			module ='';
		}
		$.ajax({
			url: '/include/ajax.php?service=member&action=' + action,
			type: "POST",
			data: data.join('&'),
			dataType: "json",
			success: function (data) {
				if(data.state!=100){

					$(".loading").remove();
					$('html').addClass('nodata');
					let noData_pic = showType != 4 ? templets_skin+'images/collection/empty_collect.png' : templets_skin+'images/collection/empty_zan.png'
					$(".listBox").append('<div class="loading empty"><img src="'+noData_pic+'" alt=""><p>暂无'+( showType != 4 ? '收藏' : '点赞')+'记录</p></div>');
					$(".manageA,.manage_box ").hide()
				}else{
					$('html').removeClass('nodata');
					$(".loading").remove();
					var list = data.info.list
					if(list.length){
						$(".manageA,.manage_box").show()
						console.log(1)
					}else{
						console.log(2)
						$(".manageA,.manage_box ").hide()

					}
					var html = [];
					if(list.length > 0){
						if(action == 'upList'){
							for(let i = 0; i < list.length; i++){
								let rdetail = list[i].detail ;
								let detail = rdetail
								if(detail){
									if(rdetail['0']){
										detail = rdetail['0']
									}
									let url = rdetail['0'] ? rdetail.url : detail.url
									let picH = '';
									if(detail.litpic){
										picH = '<img src="'+ detail.litpic +'" onerror="this.src=\'/static/images/404.jpg\'" />'
									}else if(detail.imgGroup){
										let picUrl = Array.isArray(detail.imgGroup) ? detail.imgGroup[0] : detail.imgGroup;
										if(picUrl){
											picH = '<img src="'+ picUrl +'" onerror="this.src=\'/static/images/404.jpg\'" />'
										}else{
											picH = delHtmlTag(detail.title).substring(0,1)
										}
										
									}else if(detail.imglist && Array.isArray(detail.imglist) && detail.imglist.length ){
										picH = '<img src="'+ detail.imglist[0].path +'" onerror="this.src=\'/static/images/404.jpg\'" />'
									}else{
										picH = delHtmlTag(detail.title).substring(0,1)
									}
									let liObj = `<li class="zan_li" data-id="${list[i].tid}" data-module="${list[i].module}" data-type="${list[i].type}">
													<a href="${url}" class="zan_detail">
														<div class="d_pic">${picH}</div>
														<div class="d_info rInfo">
															<h2 class="comTitle">${detail.title}</h2>
															<p class="typename">${detail.typename ? detail.typename : list[i].moduleName}</p>
														</div>
													</a>
												</li>`
									html.push(liObj)
								}else{
									html.push('<li class="disabled" data-id="'+list[i].id+'" data-module="'+smod+'">');
									// html.push('	<a href="javascript:;">');
									html.push('<div class="leftImg"><img src="'+staticPath+'images/404.jpg" alt=""></div>');
									html.push('<div class="rInfo">');
									html.push('	<h2 class="comTitle sxttile">信息不存在或已被删除</h2>');
									html.push('</div>');
									html.push('</li>');
								}
								
							}
							page++;
							load_on = false;
							
							$('.listBox ul').append(html.join(''));
							if(page > data.info.pageInfo.totalPage){
								load_on = true;
								$(".listBox").append('<div class="loading hasCon"><p>没有更多了</p></div>');
							}
						}else{

							for(var i = 0; i < list.length; i++){
								var smod 	= list[i].module,
									 url 	= list[i].url,
									 title 	= list[i].title,
									detail 	= list[i].detail,
									 price 	= list[i].price;
								collecttype = list[i].collecttype;
								if(smod =='awardlegou' || smod =='website'){
								  continue;
								}
								if(price >0){
									var priceArr = price.split('.');
									if(priceArr[1] == 0){//小数为0时
										price = priceArr[0];
									}
								} 	
	
								let modname = (smod == 'job' && collecttype != 1 )? 'company' : smod;
	
								if(detail){
	
								
									if((smod=='info' && detail.validCeil =='已过期') || detail.state !='1' || (smod=='job' && detail.valid < nowtime)){//商品下架/信息过期/店铺下架
										html.push('<li class="'+modname+'Li disabled" data-id="'+list[i].id+'" data-module="'+smod+'">');
										html.push('	<a href="javascript:;">');
									}else if((smod=='huodong' && nowtime >  detail.baomingend) || (smod=='info' && detail.is_valid ==1)){//活动结束
										html.push('<li class="'+modname+'Li finished" data-id="'+list[i].id+'" data-module="'+smod+'">');
										if(smod != 'info'){
	
											html.push('	<a href="'+detail.url+'">');
										}else{
											html.push('	<a href="'+detail.url+'" class="toMini" data-id="'+list[i].detail.id+'" data-module="'+smod+'" data-temp="detail">');
										}
									}else{
										html.push('<li class="'+modname+'Li" data-id="'+list[i].id+'" data-module="'+smod+'">');
										if(!['info','article','sfcar','job','tieba','shop'].includes(smod)){ //跳转小程序调整
											html.push('	<a href="'+detail.url+'">');
										}else if(smod == 'job'){
											let tempArr = ['job','company','resume']
											html.push('	<a href="'+detail.url+'" class="toMini" data-id="'+list[i].detail.id+'" data-module="'+smod+'" data-temp="'+tempArr[(list[i].collecttype - 1) >= 0 ? (list[i].collecttype - 1) : 0 ]+'">');
										}else{
											html.push('	<a href="'+detail.url+'" class="toMini" data-id="'+list[i].detail.id+'" data-module="'+smod+'" data-temp="'+(list[i].collecttype == 1 ? "store-detail" : "detail")+'">');
										}
										
									}
									
									if(smod == 'sfcar'){
										html.push('<div class="li_top">');
										html.push('	<h2 class="liTitle">'+detail.startaddr+'<s></s>'+detail.endaddr+'</h2>');
										html.push('</div>');
										html.push('<div class="startTime">');
	
										html.push('	<strong class="startDay">'+detail.missiontime+'</strong>');
										if(detail.missiontype == 0){
	
											html.push('	<span class="startWeek">'+detail.missiontime1+'</span>');
										}
	
										html.push(' <span class="pubTime">'+detail.pubdate+'</span>');
										html.push('</div>');
										html.push('<div class="carInfo">');
										var span = '';
										if(detail.type==1){
	
											span = '<span>'+detail.carseat+'座</span>';
										}
										html.push('	<span class="car-type">'+detail.usetypename+'</span>'+span);
										html.push('</div>');
									}else if(smod == 'car'){
	
										var piclit = collecttype == 0?detail.imglist[0].path:detail.litpic;
										if (piclit) {
											html.push('<div class="leftImg"><img src="' + piclit + '" alt="" onerror="javascript:this.src=\'' + staticPath + 'images/noPhoto_100.jpg\';this.onerror=this.src=\'' + staticPath + 'images/404.jpg\';"></div>');
										}
										html.push('<div class="rInfo">');
										html.push('	<h2 class="comTitle">' + detail.title + '</h2>');
										html.push('	<p class="comDetp">' + detail.address + '</p>');
										if (collecttype == 0) {//汽车
											html.push('<h5 class="carPrice"><span>' + detail.price + '</span>万</h5>');
										} else {//店铺
											if (smodule) {//单独模块
												html.push('<h5 class="cominfo">在售: <strong>' + detail.salenums + '</strong><em></em>已售: <strong>' + detail.soldnums + '</strong></h5>');
											} else {
												html.push('<h5 class="indexStore">汽车经销商</h5>');
											}
	
										}
										html.push('</div>');
										
										
									}else if(smod == 'article'){
										if(pic){
											html.push('<div class="leftImg"><img src="'+pic+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/404.jpg\';"></div>');									
										}
										html.push('<div class="rInfo">');	
										html.push('	<h2 class="comTitle">资讯-软喵喵的雷货铺</h2>');	
										html.push('	<p class="comDetp">只想做一个普通而又简单的人</p>');
										if(smodule){//单独模块
											html.push('<h5 class="cominfo">文章: <strong>30</strong><em></em>总阅读: <strong>30</strong></h5>');
										}else{//首页
											html.push('<h5 class="indexStore">资讯自媒体</h5>');
										}
										html.push('</div>');
									}else if(smod == 'business'){//商家
										
										var piclit = detail.logo;
										
										if(piclit){
											html.push('<div class="leftImg"><img src="'+piclit+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/404.jpg\';"></div>');
										}
	
										html.push('<div class="rInfo">');
										html.push('	<h2 class="comTitle">'+detail.title+'</h2>');
										//店铺
										html.push('	<p class="indexStore">'+detail.typename+'</span></p>');
										
										html.push('	</div>');
										
									}else if(smod == 'info'){
										if(detail){
											var piclink = '';
											if((detail.imglist && detail.imglist.length > 0) || (detail.pics && detail.pics.length > 0)){
												
												if(collecttype ==0){
													piclink = detail.imglist[0].path;
												}else{
													piclink = detail.pics[0].path;
												}
											}
											if(piclink){
												html.push('<div class="leftImg"><img src="'+piclink+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/404.jpg\';"></div>');
											}
											html.push('<div class="rInfo">');
											if (collecttype == 0){
	
												html.push('	<h2 class="comTitle">'+detail.Newtitle+'</h2>');
												html.push('	<p class="infoDet">'+detail.addrArr+'</p>');
												html.push('<h5 class="infoPrice noPrice">'+detail.typename+'</h5>');
												// if(detail.price || detail.price == '0.00'){
												// 	html.push('<h5 class="infoPrice"><strong><em>'+echoCurrency('symbol')+'</em>'+detail.price+'</strong></h5>');
												// }else{
												// 	html.push('<h5 class="infoPrice noPrice">detail.typename</h5>');
												// }
											}else{
												html.push('	<h2 class="comTitle">'+detail.member.company+'</h2>');
												html.push('	<p class="infoDet noColor">'+detail.address+'</p>');
												html.push('<h5 class="infoPrice noPrice">'+detail.typenameonly+'</h5>');
											}
											html.push('</div>');
										}
									}else if(smod == 'huodong'){
	
										var piclit = '';
										if(collecttype==0) {//商品
											piclit = detail.litpic;
										}else{
											piclit = detail.logo;
										}
										if(piclit){
											html.push('<div class="leftImg"><img src="'+piclit+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/404.jpg\';"></div>');
										}
										html.push('<div class="rInfo">');	
										html.push('	<h2 class="comTitle comTitle2">'+detail.title+'</h2>');
										html.push('	<p class="comDetp">'+detail.address+'<em></em>报名截止：'+huoniao.transTimes(detail.baomingend,2)+'</p>');
										if(detail.minprice){
											html.push('<h5 class="comPrice"><strong><em>'+echoCurrency('symbol')+'</em><span>'+detail.minprice+'</span></strong><em>起</em></h5>');
										}else{
											html.push('<h5 class="comPrice">免费</h5>');
										}
										html.push('</div>');
									}else if(smod == 'pension'){//养老
										if(detail) {
											if (detail.pics) {
												html.push('<div class="leftImg"><img src="' + detail.pics[0].path + '" alt="" onerror="javascript:this.src=\'' + staticPath + 'images/noPhoto_100.jpg\';this.onerror=this.src=\'' + staticPath + 'images/404.jpg\';"></div>');
											}
											html.push('<div class="rInfo">');
											html.push('	<h2 class="comTitle comTitle2">' + detail.title + '</h2>');
											html.push('	<p class="comDetp">' + detail.address + '</p>');
	
											html.push('	<h5 class="comPrice"><strong><em>' + echoCurrency('symbol') + '</em><span>' + detail.price + '</span></strong><em>起</em></h5>');
											html.push('</div>');
										}
									}else if(smod == 'renovation'){//装修
										if(detail) {
	
											if (detail.litpic) {
												html.push('<div class="leftImg"><img src="' + detail.litpic + '" alt="" onerror="javascript:this.src=\'' + staticPath + 'images/noPhoto_100.jpg\';this.onerror=this.src=\'' + staticPath + 'images/404.jpg\';"></div>');
											}
											html.push('<div class="rInfo">');
											html.push('	<h2 class="comTitle comTitle2">' + detail.title + '</h2>');
											html.push('	<p class="comDetp">'+detail.area + echoCurrency('areasymbol') + '<em></em>'+detail.style+'<em></em>'+detail.price+'万<em></em>'+detail.btype+'</p>');
	
											html.push('	<div class="comStoreInfo">');
											html.push('		<div class="storeImg"><img src="' + (detail.author ? detail.author.photo : '/static/images/bus_default.png') + '" alt=""></div>');
											html.push('		<div class="rStoreinfo">');
											html.push('			<h3>' + (detail.author ? detail.author.name : '信息不存在') + '</h3>');
											html.push('		</div>');
											html.push('	</div>');
											html.push('</div>');
										}
										
									}else if(smod == 'job'){//招聘				
										if (collecttype == 1) {//职位
											var addrlen = detail.job_addr_detail && detail.job_addr_detail.addrName.length ? detail.job_addr_detail.addrName.length : 0 ;
											var addrName = addrlen > 0 ? ( detail.job_addr_detail.addrName[addrlen - 1]) : '';
											var pic = detail['companyDetail'].logo_url ? detail['companyDetail'].logo_url : staticPath + 'images/noPhoto_100.jpg';
											html.push('<div class="rInfo">');
											if (!detail.mianyi) {
												html.push('<p class="jobPrice">' + detail.show_salary + '');
												if(detail.dy_salary > 12){
													html.push('<span>· '+ detail.dy_salary +'薪</span></p>')
	
												}
											} else {
												html.push('<p class="jobPrice">面议</p>');
											}
											html.push('	<h2 class="comTitle comTitle3">' + detail.title + '</h2>');
											html.push('	<p class="comDetp">' + addrName + '<em style="'+(addrName ? '' : 'display:none;')+'"></em>' + (detail.experience ? detail.experience : '经验不限') + '<em></em>' + detail.educational + '</p>');
											html.push('	<div class="comStoreInfo">');
											html.push('		<div class="storeImg"><img src="' + pic + '" alt="" onerror="this.src=\'/static/images/404.jpg\'"></div>');
											html.push('		<div class="rStoreinfo">');
											if(detail['company']){
												html.push('			<h3>' + detail['companyDetail'].title + '</h3>');
											}
											html.push('		</div>');
											html.push('	</div>');
											html.push('	</div>');
										}else if(collecttype == 3){
											html.push('<div class="clogo">');
											html.push('<img src="'+ detail.photo_url +'" onerror="this.src=\'/static/images/404.jpg\'"">');
											html.push('</div> <div class="cinfo"><h4>'+detail.title+'</h4> ');
											html.push('<p class="cinfo_detail"><span>'+detail.age+'岁</span><em>|</em><span>'+detail.edu_tallest_name+'</span><em>|</em><span>'+detail.work_jy_name+'</span></p>');
											html.push(' <p class="cjob"><span class="salary">'+detail.show_salary+'</span> <em class="job_intention">'+detail.job_name[0]+'</em>');
											html.push('</p></div>');
	
										} else {//企业
											// var piclink = detail.photo == '' ? staticPath + 'images/noPhoto_100.jpg' : detail.photo;
											// if (piclink) {
											// 	html.push('<div class="leftImg"><img src="' + piclink + '" alt="" onerror="javascript:this.src=\'' + staticPath + 'images/noPhoto_100.jpg\';this.onerror=this.src=\'' + staticPath + 'images/404.jpg\';"></div>');
											// }
											// html.push('<div class="rInfo">');
											// html.push('	<h2 class="comTitle">' + detail.name + '</h2>');
											// html.push('	<p class="comDetp">' + ((detail.sex == 0) ? '男' : '女') + '<em></em>' + detail.age + '岁<em></em>' + detail.educationalname + '<em></em>' + detail.typename + '</p>');
											// html.push('	<p class="salary"><strong>' + (detail.salary * 1 > 0 ? detail.salary : '面议') + '</strong>' +(detail.salary * 1 > 0 ?echoCurrency('short') + '/月':'') + '</p>');
											// html.push('</div>');
	
											// html.push('<li class="companyLi">');
											// html.push('<a href="'+detail.url+'">');
											html.push('<div class="clogo">');
											html.push('<img src="'+ detail.logo_url +'" onerror="this.src=\'/static/images/404.jpg\'"">');
											html.push('</div> <div class="cinfo"><h4>'+detail.title+'</h4> ');
											html.push('<p class="cinfo_detail"><span>'+detail.addr[detail.addr.length - 1]+'</span><em>|</em><span>'+detail.scale+'</span><em>|</em><span>'+detail.nature+'</span></p>');
											html.push(' <p class="cjob"><span>'+detail.first_ptitle+'</span>等<em>'+detail.pcount+'</em>个职位在招');
											html.push('</p></div>');
										}
											
										
									}else if(smod == 'tuan'){//团购
										
										var piclink = collecttype == 0?detail.litpic:detail.imgGroup[0];
										if (piclink) {
											html.push('<div class="leftImg"><img src="' + piclink + '" alt="" onerror="javascript:this.src=\'' + staticPath + 'images/noPhoto_100.jpg\';this.onerror=this.src=\'' + staticPath + 'images/404.jpg\';"></div>');
										}
										html.push('<div class="rInfo">');
										if (collecttype == 0) {//商品
											html.push('	<h2 class="comTitle">' + detail.title + '</h2>');
											var priceArr = detail.price.split('.');
											if(detail.store && detail.store.member){
												html.push('	<p class="comDetp">' + detail.store.member.nickname + '</p>');
											}
											html.push('	<p class="tuanPrice"><span>' + echoCurrency('symbol') + '<strong>' + priceArr[0] + '</strong>.' + priceArr[1] + '</span><em>门市价' + echoCurrency('symbol') + detail.price + '</em></p>');
										} else {//店铺
											html.push('	<h2 class="comTitle">' + detail.member.company + '</h2>');
											var addrlen = detail.addrname.length;
											var addrName = addrlen > 0 ? (detail.addrname[addrlen - 1]) : '';
											var address = detail.address ? detail.address : '';
											html.push('	<p class="comDetp "><i class="stroreP">' + addrName + ' ' + address + '</i></p>');
											html.push('	<p class="storeName">' + (detail.typenameonly?detail.typenameonly:'团购商家') + '</p>');
										}
										html.push('</div>');
										
									}else if(smod == 'marry'){//婚嫁
										
										if (detail.pics) {
											html.push('<div class="leftImg"><img src="' + detail.pics[0].path + '" alt="" onerror="javascript:this.src=\'' + staticPath + 'images/noPhoto_100.jpg\';this.onerror=this.src=\'' + staticPath + 'images/404.jpg\';"></div>');
										}
										html.push('<div class="rInfo">');
										html.push('	<h2 class="comTitle">' + detail.title + '</h2>');
										var pageTit = '';
										if (list[i].typeid == 9) {
											pageTit = langData['marry'][2][14] //婚礼策划
										} else if (list[i].typeid == 4) {
											pageTit = langData['marry'][2][9] //摄像跟拍
										} else if (list[i].typeid == 10) {
											pageTit = langData['marry'][2][15] //租婚车
										} else if (list[i].typeid == 1) {
											pageTit = langData['marry'][2][6] //婚纱摄影
										} else if (list[i].typeid == 2) {
											pageTit = langData['marry'][2][7] //摄影跟拍
										} else if (list[i].typeid == 7) {
											pageTit = langData['marry'][2][16] //婚礼主持
										} else if (list[i].typeid == 3) {
											pageTit = langData['marry'][2][8] //珠宝首饰
										} else if (list[i].typeid == 5) {
											pageTit = langData['marry'][2][10] //新娘跟妆
										} else if (list[i].typeid == 6) {
											pageTit = langData['marry'][2][11] //婚纱礼服
										}
										var mrtxt = '', htxt = '';
										if (collecttype == 2) {//婚嫁酒店
											var addrlen = detail.addrname.length;
											var addrName = addrlen > 0 ? (detail.addrname[addrlen - 1]) : '';
											var address = detail.address ? detail.address : '';
											mrtxt = addrName + address;
											;
											htxt = '<span><em>' + echoCurrency('symbol') + '</em><strong>' + detail.pricee + '</strong></span><em>/桌起</em>';
	
										} else if (collecttype == 0) {//婚嫁套餐
											var companyname = detail.companyname?detail.companyname:(detail.store.title?detail.store.title:'')
											mrtxt = (pageTit?(pageTit + '<em></em>'):'') + companyname;
											htxt = '<span><em>' + echoCurrency('symbol') + '</em><strong>' + (detail.price?detail.price:'0.00') + '</strong></span><em>起</em>';
	
										} else if (collecttype == 3) {//婚嫁案例
											mrtxt = pageTit + '<em></em>' + huoniao.transTimes(detail.pubdate, 2);
	
										} else {//婚嫁店铺
											mrtxt = '案例 ' + detail.anli + '<em></em> 套系 ' + detail.taoxi;
											htxt = '<span><em>' + echoCurrency('symbol') + '</em><strong>' + detail.pricee + '</strong></span><em>起</em>';
										}
										html.push('	<p class="comDetp">' + mrtxt + '</p>');
	
										if (collecttype == 2 || collecttype == 0) {//婚嫁酒店/婚嫁套餐
											html.push('	<p class="hotelPrice">' + htxt + '</p>');
	
										} else if (collecttype == 3) {//婚嫁案例
											html.push('	<div class="comStoreInfo">');
											if(detail.store.pics){
												html.push('		<div class="storeImg"><img src="' + detail.store.pics[0].path + '" alt="" onerror="javascript:this.src=\'' + staticPath + 'images/noPhoto_100.jpg\';this.onerror=this.src=\'' + staticPath + 'images/404.jpg\';"></div>');
											}
											html.push('		<div class="rStoreinfo">');
											html.push('			<h3>' + detail.store.title + '</h3>');
											html.push('		</div>');
											html.push('	</div>');
										} else {//婚嫁店铺
											if (smodule) {//单独模块
												html.push('	<p class="hotelPrice">' + htxt + '</p>');
											} else {//首页
												html.push('	<h5 class="indexStore">婚礼商家</h5>');
											}
	
										}
										html.push('	</div>');
										
	
									}else if(smod == 'house'){//房产
	
										
										if (detail.litpic) {
											html.push('<div class="leftImg"><img src="' + detail.litpic + '" alt="" onerror="javascript:this.src=\'' + staticPath + 'images/noPhoto_100.jpg\';this.onerror=this.src=\'' + staticPath + 'images/404.jpg\';"></div>');
										}
										html.push('<div class="rInfo">');
										html.push('	<h2 class="comTitle">'+detail.title+'</h2>');
										var mrtxt = '', pricetxt = '';
	
	
										var addrlen = detail.addr.length;
										var addrName = addrlen > 0 ? (detail.addr[addrlen - 2] + '·' + detail.addr[addrlen - 1]) : '';
										if (collecttype == 1) {//二手房
	
											mrtxt = detail.room + '<em></em>' + detail.area + echoCurrency('areasymbol') + '<em></em>' + detail.direction + '<em></em>' + detail.community;
											if (detail.price > 0) {
												pricetxt = '<span><strong>' + detail.price + '</strong>万</span><em>' + detail.unitprice + echoCurrency('short') + '/' + echoCurrency('areaname') + '</em>';//元/平
											} else {
												pricetxt = '<span>价格待定</span>';
											}
	
	
										} else if (collecttype == 0) {//新房
	
											var hxnum = detail.hx_room, hxarea = detail.hx_area;
											var hxnumArr = [], hxtxt = '', hxtxt2 = '';
											if (hxnum.length > 0) {
												for (var j = 0; j < hxnum.length; j++) {
													hxnumArr.push(hxnum[j]);
												}
												hxtxt = '<em></em>' + hxnumArr.join('.') + '居室'
											}
											if (hxarea.length > 0) {
												hxtxt2 = '<em></em>' + detail.hx_area[0] + '-' + detail.hx_area[1] + echoCurrency('areasymbol')
											}
	
											mrtxt = addrName + hxtxt2 + hxtxt;
											if (detail.price > 0) {
												var ptype = echoCurrency('short') + "/" + echoCurrency('areaname');//元/平
												if (detail.ptype != 1) {
													ptype = "万" + echoCurrency('short') + "/套";//万元/套
												}
	
												pricetxt = '<span><strong>' + detail.price + '</strong>' + ptype + '</span>';
											} else {
												pricetxt = '<span>价格待定</span>';
											}
	
										} else if (collecttype == 2) {//出租房
	
											mrtxt = addrName + '<em></em>' + detail.area + echoCurrency('areasymbol');
											if (detail.price > 0) {
												pricetxt = '<span><strong>' + detail.price + '</strong>' + echoCurrency('short') + '/月</span>';//元/月
											} else {
												pricetxt = '<span>价格待定</span>';
											}
	
										} else if (collecttype == 3) {//写字楼--出租/出售
	
											mrtxt = addrName + '<em></em>' + detail.area + echoCurrency('areasymbol');
											if (detail.price > 0) {
												if (detail.type == 0) {//出租
													var totalprice = parseInt(detail.price * detail.area).toFixed(0);
													var fenPrice = (detail.price / 30).toFixed(2);
													pricetxt = '<span><strong>' + totalprice + '</strong>' + echoCurrency('short') + '/月</span><em>' + fenPrice + echoCurrency('short') + '/' + echoCurrency('areaname') + '/天</em>';//元/月 --- 元/平/天
												} else {//出售
													var fenPrice = (detail.price / detail.area).toFixed(2);
													pricetxt = '<span><strong>' + price + '</strong>万</span><em>' + fenPrice + echoCurrency('short') + '/' + echoCurrency('areaname') + '</em>';//元/平
												}
											} else {
												pricetxt = '<span>价格待定</span>';
											}
	
	
										} else if (collecttype ==4) {//商铺
	
											mrtxt = addrName + '<em></em>' + detail.area + echoCurrency('areasymbol');
	
											if (detail.price > 0) {
												if (detail.type == 0) {//出租
													var fenPrice = (detail.price / detail.area / 30).toFixed(2);
													pricetxt = '<span><strong>' + price + '</strong>' + echoCurrency('short') + '/月</span><em>' + fenPrice + echoCurrency('short') + '/' + echoCurrency('areaname') + '/天</em>';//元/月== 元/平/天
												} else if (detail.type == 1) {//出售
	
													pricetxt = '<span><strong>' + detail.price + '</strong>万</span><em>' + (detail.price / detail.area).toFixed(0) + echoCurrency('short') + '/' + echoCurrency('areaname') + '</em>';//元/平
												} else {//转让
													pricetxt = '<span><strong>' + detail.price + '</strong>' + echoCurrency('short') + '/月</span><em>转让费：' + parseInt(detail.transfer).toFixed(1) + ' 万</em>';//元/月
	
												}
											} else {
												pricetxt = '<span>价格待定</span>';
											}
	
										} else if (collecttype == 7) {//车位
	
											mrtxt = detail.area + echoCurrency('areasymbol') + '<em></em>' + detail.protype;
											if (detail.price > 0) {
												if (detail.type == 0) {//出租
													pricetxt = '<span><strong>' + detail.price + '</strong>' + echoCurrency('short') + '/月</span>';//元/月
												} else if (detail.type == 1) {//出售
	
													pricetxt = '<span><strong>' + detail.price + '</strong>万</span>';//元/平
												} else {//转让
													pricetxt = '<span><strong>' + detail.price + '</strong>' + echoCurrency('short') + '/月</span><em>转让费：' + parseInt(detail.transfer).toFixed(1) + ' 万</em>';//元/月
												}
											} else {
												pricetxt = '<span>价格待定</span>';
											}
	
										} else if (collecttype == 5) {//厂房
	
											mrtxt = detail.area + echoCurrency('areasymbol') + '<em></em>' + addrName + '<em></em>层高' + detail.cenggao + 'm';
											if (detail.price > 0) {
												if (detail.type == 0) {//出租
													var fenPrice = (detail.price / detail.area / 30).toFixed(2);
													pricetxt = '<span><strong>' + detail.price + '</strong>' + echoCurrency('short') + '/月</span><em>' + fenPrice + echoCurrency('short') + '/' + echoCurrency('areaname') + '/天</em>';//元/月== 元/平/天
												} else if (detail.type == 2) {//出售
	
													pricetxt = '<span><strong>' + detail.price + '</strong>万</span><em>' + (detail.price / detail.area).toFixed(0) + echoCurrency('short') + '/' + echoCurrency('areaname') + '</em>';//元/平
												} else {//转让
													pricetxt = '<span><strong>' + detail.price + '</strong>' + echoCurrency('short') + '/月</span><em>转让费：' + parseInt(detail.transfer).toFixed(1) + ' 万</em>';//元/月
	
												}
											} else {
												pricetxt = '<span>价格待定</span>';
											}
	
										} else if (collecttype == 6) {//小区
	
											mrtxt = '在售' + detail.total_sale + '套<em></em>在租' + detail.total_zu + '套<em></em>' + (detail.opendate ? ('|' + huoniao.transTimes(detail.opendate, 2).split('-')[0] + '年建成') : '');
											if (detail.price > 0) {
												pricetxt = '<span><strong>' + detail.price + '</strong>' + echoCurrency('short') + '/' + echoCurrency('areaname') + '</span>';//元/平
											} else {
												pricetxt = '<span>价格待定</span>';
											}
										}
										html.push('	<p class="comDetp">' + mrtxt + '</p>');
										html.push('	<p class="housePrice">' + pricetxt + '</p>');
										html.push('	</div>');
										
									}else if(smod == 'travel'){//旅游
										var cla = '';
										if(detail.video){
											cla = 'hasVideo'
										}
										if(detail.pics){
											html.push('<div class="leftImg '+cla+'"><img src="'+detail.pics[0]['path']+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/404.jpg\';"></div>');
										}
										html.push('<div class="rInfo">');	
										html.push('	<h2 class="comTitle">'+detail.title+'</h2>');
	
										var typename = '';
										if(collecttype =='1'){
											typename = '酒店'; /*酒店*/
										}else if(collecttype =='2'){
											typename = '游玩';/*游玩*/
										}else if(collecttype =='3'){
											typename = '旅游攻略';/*游玩*/
										}else if(collecttype =='4'){
											typename = '租车';/*游玩*/
										}else if(collecttype =='5'){
											typename = '旅游视频';/*游玩*/
										}else if(collecttype =='6'){
											typename = '旅游签证';/*游玩*/
										}else{
											typename = '旅行社';/*游玩*/
										}
										html.push('	<p class="comDetp">'+typename+'</p>');
										if(collecttype==3 || collecttype==5){//旅游攻略、旅游视频
											var photo = list[i].user['photo'] != "" && list[i].user['photo'] != undefined ? huoniao.changeFileSize(list[i].user['photo'], "small") : "/static/images/noPhoto_40.jpg";
										
											html.push('	<div class="comStoreInfo">');
											html.push('		<div class="storeImg"><img src="'+photo+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/404.jpg\';"></div>');
											html.push('		<div class="rStoreinfo">');
											html.push('			<h3>'+list[i].user['nickname']+'</h3>');
											html.push('		</div>');
											html.push('	</div>');
										}else{
											var unip = '起'
											if(collecttype==4){//租车
												unip = '日均'
											}
											if(collecttype !=0){
	
												html.push('	<p class="travelPrice"><span><em>'+echoCurrency('symbol')+'</em><strong>'+detail.price+'</strong></span><em>'+unip+'</em></p>');
											}else{
												html.push('	<p class="comDetp"><i>'+detail.address+'</i></p>');
											}
	
										}
										html.push('	</div>');
									}else if(smod == 'education'){//教育
	
										var piclit = '';
										if(detail.pics){
											html.push('<div class="leftImg '+cla+'"><img src="'+detail.pics[0].path+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/404.jpg\';"></div>');
										}
										html.push('<div class="rInfo">');
										var classtitle = detail.title;
	
										if(collecttype==0  && !detail.title){
											classtitle = detail.classname;
										}
										html.push('	<h2 class="comTitle">'+classtitle+'</h2>');
										if(collecttype==0){//课程
											var priceArr = detail.price.split('.');
											html.push('	<p class="comDetp">课程</p>');
											html.push('	<p class="eduPrice"><span>'+echoCurrency('symbol')+'<strong>'+priceArr[0]+'</strong>.'+priceArr[1]+'</span><em>起</em></p>');
										}else{//机构
											html.push('	<p class="comDetp">教育机构</p>');
											if(detail.tag!=''){
												html.push('	<p class="indexStore">'+detail.tagAll[0].jc+'</p>');
											}
											
										}	
										html.push('	</div>');
										
	
									}else if(smod == 'homemaking'){//家政
										if(collecttype ==0|| collecttype==1){
											pic = detail.pics[0].path;
											hometitle = detail.title;
										}else{
											pic = detail.photo;
											hometitle = detail.username;
										}
										if(pic){
											html.push('<div class="leftImg"><img src="'+pic+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/404.jpg\';"></div>');
										}
										html.push('<div class="rInfo">');
										html.push('	<h2 class="comTitle">'+hometitle+'</h2>');
										var homeTxt = '',pricetxt='';
										if(collecttype ==0|| collecttype==1){//商家、服务
											var addrlen = detail.addrname.length;
											var addrName = addrlen>0?(detail.addrname[addrlen-1]):'';
											var address = detail.address?detail.address:'';
											homeTxt = addrName+address;
	
											if(collecttype==1){//商家
												pricetxt = '<em>起</em>';
											}
	
											price = detail.price?detail.price:'0.00';
	
										}else{//家政人员
											homeTxt ='家政人员';
											pricetxt = '<em>/月</em>'
											price = detail.salary;
	
										}
										html.push('	<p class="comDetp">'+homeTxt+'</p>');
										html.push('	<p class="homePrice"><span><em>'+echoCurrency('symbol')+'</em><strong>'+price+'</strong></span>'+pricetxt+'</p>');
										html.push('	</div>');
										
	
									}else if(smod == 'waimai'){//外卖
										if(detail.shop_banner[0]){
											html.push('<div class="leftImg"><img src="'+detail.shop_banner[0]+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/404.jpg\';"></div>');
										}
										html.push('<div class="rInfo" data-lng="'+detail.coordY+'" data-lat="'+detail.coordX+'">');
										html.push('	<span class="shop_distance"></span>');
										html.push('	<h2 class="comTitle">'+detail.shopname+'</h2>');
										html.push('	<p class="star_info "><span class="fen '+(detail.common.star>0?"":"no_com")+'"><em>'+(detail.common.star>0?detail.common.star:langData['waimai'][2][4])+'</em></span><span class="shop_sale">'+langData['waimai'][7][84]+' <em> '+detail.sale+'</em></span></p>');//已售
										var peitxt = '免配送费';//
										if(detail.delivery_service >0){
											peitxt = langData['waimai'][2][7]+echoCurrency('symbol')+detail.delivery_service;//配送
										}
										html.push('	<p class="comDetp">'+langData['waimai'][2][6]+echoCurrency('symbol')+detail.basicprice+'<em></em>'+peitxt+(detail.delivery_time?('<em></em>'+detail.delivery_time+langData['waimai'][2][11]):"")+'</p>');//起送--分钟
										html.push('	</div>');
										
									}else if(smod == 'shop'){//商城
										
										var piclit = '';
										if(collecttype==0) {//商品
											piclit = detail.litpic;
										}else{
											piclit = detail.logo;
										}
										if(piclit){
											html.push('<div class="leftImg"><img src="'+piclit+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/404.jpg\';"></div>');
										}
	
										html.push('<div class="rInfo">');
										html.push('	<h2 class="comTitle">'+detail.title+'</h2>');
										html.push('	<p class="comDetp">'+detail.collectnum+'人收藏</p>');
										if(collecttype==0){//商品
											var priceArr = detail.price.split('.');
	
											html.push('	<p class="shopPrice"><span>'+echoCurrency('symbol')+'<strong>'+priceArr[0]+'</strong>.'+priceArr[1]+'</span></p>');
	
	
										}else{//店铺
											html.push('	<p class="indexStore">'+detail.industry+'</span></p>');
										}
										html.push('	</div>');
										
									}else if(smod == 'tieba'){//贴吧
										var ttxt = detail.title.split('')[0];
										if(detail.imgGroup){
											html.push('<div class="leftImg"><img src="'+detail.imgGroup[0]+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/404.jpg\';"></div>');
										}else{
											html.push('<div class="leftImg noImg"><p>'+ttxt+'</p></div>')
										}
										html.push('<div class="rInfo">');
										html.push('	<h2>'+detail.title+'</h2>');
										html.push('<p class="comDetp">'+detail.typename+'</p>');
										html.push('</div>');
									}
								}else{
									html.push('<li class="'+modname+'Li disabled" data-id="'+list[i].id+'" data-module="'+smod+'">');
									html.push('	<a href="javascript:;">');
									html.push('<div class="leftImg"><img src="'+staticPath+'images/404.jpg" alt=""></div>');
									html.push('<div class="rInfo">');
									html.push('	<h2 class="comTitle sxttile">信息不存在或已被删除</h2>');
									html.push('</div>');
								}
	
								html.push('	</a>');
								html.push('</li>');
								
							}
							page++;
							load_on = false;
							
							$('.listBox ul').append(html.join(''));
							if(page > data.info.pageInfo.totalPage){
								load_on = true;
								$(".listBox").append('<div class="loading hasCon"><p>没有更多了</p></div>');
							}
							//外卖计算距离
							if($('.listBox ul li.waimaiLi').size() > 0){
	
								waimaiJuli();
							}
						}
						
					}else{
						$(".listBox").append('<div class="loading empty"><img src="'+templets_skin+'images/collection/empty.png" alt=""><p>暂无收藏内容</p></div>');
					}
				}	
			},
			error: function(){
				$('html').removeClass('nodata');
				$(".loading p").html(langData['siteConfig'][6][203]);//网络错误，请重试！
			}
		});



	}
	var stLng,stLat;//当前位置

	HN_Location.init(function(data){
        if (data == undefined || data.address == "" || data.name == "" || data.lat == "" || data.lng == "") {

            return false;
        }else{

          	//定位点
          	stLng = data.lng;
          	stLat = data.lat;
          	waimaiJuli();
        }

    })
    function waimaiJuli(){
    	$('.listBox ul li.waimaiLi').each(function(){								
			var shop_distance = $(this).find('.shop_distance');
			var slng = $(this).find('.rInfo').attr('data-lng');
			var slat = $(this).find('.rInfo').attr('data-lat');								
			if(slng && slat && stLng && stLat && shop_distance.text() ==''){
				var nowdis = getDistance(slat,slng,stLat,stLng);
				shop_distance.text(nowdis)
			}

			
			
		})
    }

	
	// 获取url参数
	function getParam(paramName) {
		paramValue = "", isFound = !1;
		if (this.location.search.indexOf("?") == 0 && this.location.search.indexOf("=") > 1) {
			arrSource = unescape(this.location.search).substring(1, this.location.search.length).split("&"), i = 0;
			while (i < arrSource.length && !isFound) arrSource[i].indexOf("=") > 0 && arrSource[i].split("=")[0].toLowerCase() == paramName.toLowerCase() && (paramValue = arrSource[i].split("=")[1], isFound = !0), i++
		}
		return paramValue == "" && (paramValue = null), paramValue
	}
	// 经纬度转换成三角函数中度分表形式。
    function rad(d) {
        return d * Math.PI / 180.0; 
    }
	function delHtmlTag(str){
		return str.replace(/<[^>]+>/g,"");//去掉所有的html标记
	  } 

    // 根据经纬度计算距离，参数分别为第一点的纬度，经度；第二点的纬度，经度
    function getDistance(lat1, lng1, lat2, lng2) {

        var radLat1 = rad(lat1);
        var radLat2 = rad(lat2);
        var a = radLat1 - radLat2;
        var b = rad(lng1) - rad(lng2);
        var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
            Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
        s = s * 6378.137; // EARTH_RADIUS;
        s = Math.round(s * 10000) / 10000; //输出为公里

        var distance = s;
        var distance_str = "";

        if (parseInt(distance) >= 1) {
            distance_str = distance.toFixed(1) + "km";
        } else {
            distance_str = distance * 1000 + "m";
        }

        //s=s.toFixed(4);

        //console.info('lyj 距离是', s);
        //console.info('lyj 距离是', distance_str);
        return distance_str;
    }
})