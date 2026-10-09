var page = 1,load_on = false;
$(function(){

	// 显示当前模块的div
	var module = getParam('module')
	$("."+module+"_page").removeClass('fn-hide');
	$(".manage_btn").click(function(){
		var t = $(this);
		t.addClass('fn-hide');
		$(".btns_group").removeClass('fn-hide');
		$("."+module+"_page").addClass('on_manage');
	});
	$(".manage_box").addClass(module+'-manage');
	// 取消编辑
	$(".btns_group .btn_cancel").click(function(){
		var t = $(this);
		$(".btns_group").addClass('fn-hide');
		$(".manage_btn").removeClass('fn-hide');
		$("."+module+"_page").removeClass('on_manage');
		$(".list_dd").removeClass('on_chose')
	});

	// 选择
	$("body").delegate('.on_manage .list_dd,.on_manage dd','tap',function(){
		var t = $(this);
		t.toggleClass('on_chose');
		var chose_len = $(".on_chose").length;
		if(chose_len == 0){
			$(".btn_del").addClass('disabled')
		}else{
			$(".btn_del").removeClass('disabled')
		}
		$(".btn_del").find('em').html(chose_len);
		
		return false;
	})

	// 删除选择
	$(".btn_del").click(function(){
		del_history()
	})


	// 清空
	$(".btn_clear").click(function(){
		$(".clear_mask").show();
		$(".clear_sure").show();

	})

	$(".cancel,.clear_mask").click(function(){
		$(".clear_mask").hide();
		$(".clear_sure").hide();
	});
	$(".sure").click(function(){
		del_history(1);
		$('.clear_mask').click();
	})

	 getfootList(module);
	// 下拉加载
	$(window).scroll(function() {

		var allh = $('body').height();
		var w = $(window).height();
		var scroll = allh - w - 60;
		if ($(window).scrollTop() > scroll && !load_on) {
		  getfootList(module);
		};

	});


	// 房产切换
	$('.tabbox li').click(function(){
		var type = $(this).attr('data-type');
		if(!$(this).hasClass('curr')){
			$(this).addClass('curr').siblings('li').removeClass('curr')
			page = 1,load_on = false;
			$('.'+module+'_dl').remove();
			getfootList(module);
		}
	})


	// 删除数据
	function del_history(delall){
		var data =  [];
		data.push('module='+module);
		$('.btn_del').addClass('disabled')
		if(delall){
			data.push('delall=1');
		}else{
			var idList = []
			$(".on_chose").each(function(){
				var t = $(this)
				idList.push(t.attr('data-id'))
			})
			data.push('delall=0')
			data.push('id='+idList.join(','))
		}
		$.ajax({
			url: '/include/ajax.php?service=member&action=delFootprints',
			type: "POST",
			dataType: "json",
			data:data.join('&'),
			success: function (data) {
				if(data.state==100){
					showErrAlert('删除成功');
					if(delall){
						$(".list_dd").remove();
					}
					$(".on_chose").remove();
					$('.btn_del em').text(0)
				}else{
					showErrAlert(data.info);
					if($('.btn_del em').text() != '0'){
						$('.btn_del').removeClass('disabled')
					}
				}
			},
			error: function(data){
				showErrAlert(data.info);
				if($('.btn_del em').text() != '0'){
					$('.btn_del').removeClass('disabled')
				}
			},
		});


	}

	$('body .job_page').delegate('.job_li ','click',function(){
		var state = $(this).attr('data-state');
		var off = $(this).attr('data-off')
		var p = $(this).closest('.job_page')
		if(p.hasClass('on_manage')) return false
		if(state === '0' || state === '2' || off){
			let options = {
				title: '<s></s>该职位审核中',    // 提示标题
				confirmHtml:'<p>该职位内容可能有变动，平台正在审核中</p>',
				btnSure: '好的',
				isShow: true,
				popClass:'myConfirm',
				noCancel:true
			}

			if(state === '2' || off){
				options = {
					title: '<s></s>该职位已失效',    // 提示标题
					confirmHtml:'<p>该职位已被下架或删除，如需沟通投递或面试事宜，请与招聘方核实</p>',
					btnSure: '好的',
					isShow: true,
					popClass:'myConfirm',
					noCancel:true
				}
			}
			confirmPop(options,function(){
				
			})

			return false;
		}
	})

	// 获取数据
	function getfootList(module){
		if(load_on) return false;
		load_on = true;
		$(".loading").remove();
		if(module=='house' || module=='travel'){
			$("."+module+"_page .conbox").append('<p class="loading">加载中~</p>');
		}else{
			console.log($("."+module+"_page").length)
			$("."+module+"_page").append('<p class="loading">加载中~</p>');
		}
		var prame = '';
		if(module=='house' || module=='travel'){
			var mod2 = $("."+module+"_page .tabbox .curr").attr('data-type');
			if(mod2){
				modArr = mod2.split(',');
				if(modArr.length>1){
					prame = 'module2='+modArr.join('Detail,')+'Detail';

				}else{
					prame = 'module2='+mod2+'Detail';
				}
				console.log(prame)
			}
		}
		$.ajax({
			url: '/include/ajax.php?service=member&action=footprintsGet&page='+page+'&pageSize=10&module='+module+(module=='job'?'&module2=postDetail':''),
			type: "POST",
			dataType: "json",
			data:prame,
			success: function (data) {
				if(data.state!=100){
					if(module=='house'||module=='travel'){
						$("."+module+"_page .conbox").html('<p class="loading">'+data.info+'</p>');
					}else{
						$("."+module+"_page").html('<p class="loading">'+data.info+'</p>');
					}
				}else{
					$('.manage_box .manage_btn').show();
					var list = data.info.list
					var html = [];
					var dt_flag = false;
					if(module=='article'){
						for(var i = 0; i < list.length; i++){
							var bYY = list[i].browsetimeymd.split('-')[0]; //浏览年
							var bMM = list[i].browsetimeymd.split('-')[1]; //浏览月
							var bDD = list[i].browsetimeymd.split('-')[2]; //浏览日
							var bpYY,bpMM,bpDD,bnYY,bnMM,bnDD;
							var html_dt = [];
							if($(".article_dl[data-date='"+list[i].browsetimeymd+"']").size()>0){
								dt_flag = true;
							}
							if(i>0){
								bpYY = list[i-1].browsetimeymd.split('-')[0]; //浏览年
								bpMM = list[i-1].browsetimeymd.split('-')[1]; //浏览月
								bpDD = list[i-1].browsetimeymd.split('-')[2]; //浏览日
							}

							if(i != (list.length-1)){
								bnYY = list[i+1].browsetimeymd.split('-')[0]; //浏览年
								bnMM = list[i+1].browsetimeymd.split('-')[1]; //浏览月
								bnDD = list[i+1].browsetimeymd.split('-')[2]; //浏览日
							}
							if(dt_flag){
								html_dt.push('<dd class="list_dd" data-id="'+list[i].lid+'">');
								html_dt.push('<a href="'+list[i].url+'" class="fn-clear " >');
								if(list[i].litpic){
									html_dt.push('<div class="litpic"><img src="'+list[i].litpic+'" onerror="this.src=\'/static/images/404.jpg\'">');
									html_dt.push('</div>');
								}
								html_dt.push('<div class="rinfo">');
								html_dt.push('<h1>'+list[i].title+'</h1>');
								html_dt.push('<p><span>'+list[i].typeName+'</span></p>');
								html_dt.push('</div>');
								html_dt.push('</a>');
								html_dt.push('</dd>');
								$(".article_dl:last-of-type").append(html_dt.join(''));
								dt_flag = false;
							}else{
								if((i==0) || (i>0 && (bpYY!=bYY || bpMM!=bMM || bpDD!=bDD))){
									html.push('<dl class="article_dl" data-date="'+list[i].browsetimeymd+'">');
									html.push('<dt>'+list[i].browsetimeymd+' 阅读了<em></em>条资讯</dt>');
								}
								html.push('<dd class="list_dd" data-id="'+list[i].lid+'">');
								html.push(`<a href="${list[i].url}" class="fn-clear toMini" data-temp="detail" data-module="article" data-id="${list[i].id}">`);
								if(list[i].litpic){
									html.push('<div class="litpic"><img src="'+list[i].litpic+'" onerror="this.src=\'/static/images/404.jpg\'">');
									html.push('</div>');
								}
								html.push('<div class="rinfo">');
								html.push('<h1>'+list[i].title+'</h1>');
								html.push('<p><span>'+list[i].typeName+'</span></p>');
								html.push('</div>');
								html.push('</a>');
								html.push('</dd>');
								if(i == (list.length-1) || (bnYY != bYY || bnMM != bMM || bnDD != bDD)){
									html.push('</dl>');
								}
							}
						}

					}else if(module=='tieba'){
						for(var i = 0; i < list.length; i++){
							var bYY = list[i].browsetimeymd.split('-')[0]; //浏览年
							var bMM = list[i].browsetimeymd.split('-')[1]; //浏览月
							var bDD = list[i].browsetimeymd.split('-')[2]; //浏览日
							var bpYY,bpMM,bpDD,bnYY,bnMM,bnDD;
							var html_dt = [];
							if($(".tieba_dl[data-date='"+list[i].browsetimeymd+"']").size()>0){
								dt_flag = true;
							}
							if(i>0){
								bpYY = list[i-1].browsetimeymd.split('-')[0]; //浏览年
								bpMM = list[i-1].browsetimeymd.split('-')[1]; //浏览月
								bpDD = list[i-1].browsetimeymd.split('-')[2]; //浏览日
							}

							if(i != (list.length-1)){
								bnYY = list[i+1].browsetimeymd.split('-')[0]; //浏览年
								bnMM = list[i+1].browsetimeymd.split('-')[1]; //浏览月
								bnDD = list[i+1].browsetimeymd.split('-')[2]; //浏览日
							}
							if(dt_flag){
								html_dt.push('<dd class="list_dd" data-id="'+list[i].lid+'">');
								html_dt.push(`<a href="${list[i].url}" class="fn-clear toMini" data-temp="detail" data-module="tieba" data-id="${list[i].id}">`);
								if(list[i].imgGroup && list[i].imgGroup.length>0){
									html_dt.push('<div class="litpic"><img src="'+list[i].imgGroup[0]+'" onerror="this.src=\'/static/images/404.jpg\'">');
									html_dt.push('</div>');
								}else{
									html_dt.push('<div class="litpic"><h6>'+list[i].title.split('')[0]+'</h6>');
									html_dt.push('</div>');
								}
								html_dt.push('<div class="rinfo">');
								html_dt.push('<h1>'+list[i].title+'</h1>');
								html_dt.push('<p><span>'+list[i].typename+'</span></p>');
								html_dt.push('</div>');
								html_dt.push('</a>');
								html_dt.push('</dd>');
								$(".tieba_dl:last-of-type").append(html_dt.join(''));
								dt_flag = false;
							}else{

								if((i==0) || (i>0 && (bpYY!=bYY || bpMM!=bMM || bpDD!=bDD))){
									html.push('<dl class="tieba_dl" data-date="'+list[i].browsetimeymd+'">');
									html.push('<dt>'+list[i].browsetimeymd+' 阅读了<em></em>条资讯</dt>');
								}
								html.push('<dd class="list_dd" data-id="'+list[i].lid+'">');
								html.push(`<a href="${list[i].url}" class="fn-clear toMini" data-temp="detail" data-module="tieba" data-id="${list[i].id}">`);
								if(list[i].imgGroup && list[i].imgGroup.length>0){
									html.push('<div class="litpic"><img src="'+list[i].imgGroup[0]+'" onerror="this.src=\'/static/images/404.jpg\'">');
									html.push('</div>');
								}else{
									html.push('<div class="litpic"><h6>'+list[i].title.split('')[0]+'</h6>');
									html.push('</div>');
								}
								html.push('<div class="rinfo">');
								html.push('<h1>'+list[i].title+'</h1>');
								html.push('<p><span>'+list[i].typename+'</span></p>');
								html.push('</div>');
								html.push('</a>');
								html.push('</dd>');
								if(i == (list.length-1) || (bnYY != bYY || bnMM != bMM || bnDD != bDD)){
									html.push('</dl>');
								}
							}
						}

					}else if(module=='car'){
						for(var i = 0; i < list.length; i++){
							var bYY = list[i].browsetimeymd.split('-')[0]; //浏览年
							var bMM = list[i].browsetimeymd.split('-')[1]; //浏览月
							var bDD = list[i].browsetimeymd.split('-')[2]; //浏览日
							var bpYY,bpMM,bpDD,bnYY,bnMM,bnDD;
							var html_dt = [];
							var label = list[i].usertype=='0'?'<label class="lab">个人</label>':""; //是否为个人che源
							if($("."+module+"_dl[data-date='"+list[i].browsetimeymd+"']").size()>0){
								dt_flag = true;
							}
							if(i>0){
								bpYY = list[i-1].browsetimeymd.split('-')[0]; //浏览年
								bpMM = list[i-1].browsetimeymd.split('-')[1]; //浏览月
								bpDD = list[i-1].browsetimeymd.split('-')[2]; //浏览日
							}

							if(i != (list.length-1)){
								bnYY = list[i+1].browsetimeymd.split('-')[0]; //浏览年
								bnMM = list[i+1].browsetimeymd.split('-')[1]; //浏览月
								bnDD = list[i+1].browsetimeymd.split('-')[2]; //浏览日
							}
							if(dt_flag){
								html_dt.push('<dd class="list_dd" data-id="'+list[i].lid+'">');
								html_dt.push('<a href="'+list[i].url+'" class="fn-clear">');
								if(list[i].litpic ||list[i].imglist){
									html_dt.push('<div class="litpic">'+label+'<img src="'+(list[i].litpic?list[i].litpic:list[i].imglist[0].path)+'" onerror="this.src=\'/static/images/404.jpg\'">');
									html_dt.push('</div>');
								}
								html_dt.push('<div class="rinfo">');
								html_dt.push('<h1>'+list[i].title+'</h1>');
								html_dt.push('<p><span>'+list[i].cardtimeminus+'/'+list[i].mileage+'万公里</span></p>');
								if(list[i].ckprice){
									html_dt.push('<div class="price_show"><span class="allprice"><b>'+((list[i].ckprice).replace('万',''))+'</b>万</span></div>')
								}else if(list[i].price){
									html_dt.push('<div class="price_show"><span class="allprice"><b>'+((list[i].price).replace('万',''))+'</b>万</span></div>')
								}
								html_dt.push('</div>');
								html_dt.push('</a>');
								html_dt.push('</dd>');
								$("."+module+"_dl:last-of-type").append(html_dt.join(''));
								dt_flag = false;
							}else{

								if(( i==0) || (i>0 && (bpYY!=bYY || bpMM!=bMM || bpDD!=bDD))){
									html.push('<dl class="'+module+'_dl" data-date="'+list[i].browsetimeymd+'">');
									html.push('<dt>'+list[i].browsetimeymd+'</dt>');
								}
								html.push('<dd class="list_dd" data-id="'+list[i].lid+'">');
								html.push('<a href="'+list[i].url+'" class="fn-clear">');
								if(list[i].litpic ||list[i].imglist){
									html.push('<div class="litpic">'+label+'<img src="'+(list[i].litpic?list[i].litpic:list[i].imglist[0].path)+'" onerror="this.src=\'/static/images/404.jpg\'">');
									html.push('</div>');
								}
								html.push('<div class="rinfo">');
								html.push('<h1>'+list[i].title+'</h1>');
								html.push('<p><span>'+list[i].cardtimeminus+'/'+list[i].mileage+'万公里</span></p>');
								if(list[i].ckprice){
									html.push('<div class="price_show"><span class="allprice"><b>'+((list[i].ckprice).replace('万',''))+'</b>万</span></div>')
								}else if(list[i].price){
									html.push('<div class="price_show"><span class="allprice"><b>'+((list[i].price).replace('万',''))+'</b>万</span></div>')
								}
								html.push('</div>');
								html.push('</a>');
								html.push('</dd>');
								if(i == (list.length-1) || (bnYY != bYY || bnMM != bMM || bnDD != bDD)){
									html.push('</dl>');
								}
							}
						}

					}else if(module == 'job'){
						for(var i = 0; i<list.length; i++){
							let jobAddr = list[i].job_addr_detail ? list[i].job_addr_detail.addrName : ''
							html.push('<li class="job_li list_dd" data-id="'+list[i].id+'" data-state="'+list[i].state +'" data-off="'+(list[i].off || list[i].del ? 1 : '')+'">');
							html.push('<a href="'+list[i].url+'" class="fn-clear toMini" data-module="job"  data-temp="job" data-id="'+ list[i].id +'">');
							html.push('<h1>'+list[i].title+'  <span class="salary">'+(list[i].show_salary)+'</span></h1>');
							html.push('<p>'+(jobAddr ? jobAddr[jobAddr.length - 1] : "暂无" )+'<em>|</em>'+(list[i].experience?list[i].experience:"无经验要求")+'<em>|</em>'+(list[i].educational?list[i].educational:"无学历要求")+'</p>');
							html.push('<div class="comp_detail">');
							// html.push('<div class="litpic"><img src="'+list[i].company.logo+'" onerror="this.src=\'/static/images/404.jpg\'"></div>');
							// html.push('<div class="comp_name">'+list[i].company.title+'</div>');
							html.push('</div>');
							html.push('</a>');
							html.push('</li>');
						}
					}else if(module == 'huodong'){
						for(var i = 0; i<list.length; i++){
							var bYY = list[i].browsetimeymd.split('-')[0]; //浏览年
							var bMM = list[i].browsetimeymd.split('-')[1]; //浏览月
							var bDD = list[i].browsetimeymd.split('-')[2]; //浏览日
							var bpYY,bpMM,bpDD,bnYY,bnMM,bnDD;
							var html_dt = [];
							if($("."+module+"_dl[data-date='"+list[i].browsetimeymd+"']").size()>0){
								dt_flag = true;
							}
							if(i>0){
								bpYY = list[i-1].browsetimeymd.split('-')[0]; //浏览年
								bpMM = list[i-1].browsetimeymd.split('-')[1]; //浏览月
								bpDD = list[i-1].browsetimeymd.split('-')[2]; //浏览日
							}

							if(i != (list.length-1)){
								bnYY = list[i+1].browsetimeymd.split('-')[0]; //浏览年
								bnMM = list[i+1].browsetimeymd.split('-')[1]; //浏览月
								bnDD = list[i+1].browsetimeymd.split('-')[2]; //浏览日
							}

							if(dt_flag){
								html_dt.push('<li class="list_dd" data-id="'+list[i].lid+'">');
								html_dt.push('<a href="'+list[i].url+'">');
								html_dt.push('<div class="litpic"><img src="'+list[i].litpic+'" onerror="this.src=\'/static/images/404.jpg\'" alt=""></div>');
								html_dt.push('<h1>'+list[i].title+'</h1>');
								if(list[i].feetype=='1'){
									html_dt.push('<p class="price"><em>'+echoCurrency('symbol')+'</em>'+list[i].minprice+'</p>');
								}else{
									html_dt.push('<p class="price">免费</p>');
								}
								html_dt.push('</a>');
								html_dt.push('</li>');
								$("."+module+"_dl:last-of-type ul").append(html_dt.join(''));
								dt_flag = false;
							}else{
								if(( i==0) || (i>0 && (bpYY!=bYY || bpMM!=bMM || bpDD!=bDD))){
									html.push('<div class="'+module+'_dl" data-date="'+list[i].browsetimeymd+'">');
									html.push('<h3 class="huodong_dt">'+list[i].browsetimeymd+'</h3>');
									html.push('<ul class="fn-clear">');
								}
									html.push('<li class="list_dd" data-id="'+list[i].lid+'">');
									html.push('<a href="'+list[i].url+'">');
									html.push('<div class="litpic"><img src="'+list[i].litpic+'" onerror="this.src=\'/static/images/404.jpg\'" alt=""></div>');
									html.push('<h1>'+list[i].title+'</h1>');
									if(list[i].feetype=='1'){
										html.push('<p class="price"><em>'+echoCurrency('symbol')+'</em>'+list[i].minprice+'</p>');
									}else{
										html.push('<p class="price">免费</p>');
									}
									html.push('</a>');
									html.push('</li>');
								if(i == (list.length-1) || (bnYY != bYY || bnMM != bMM || bnDD != bDD)){
									html.push('</ul>');
									html.push('</div>');
								}
							}
						}

					}else if(module == 'live'){
						for(var i = 0; i<list.length; i++){
							var bYY = list[i].browsetimeymd.split('-')[0]; //浏览年
							var bMM = list[i].browsetimeymd.split('-')[1]; //浏览月
							var bDD = list[i].browsetimeymd.split('-')[2]; //浏览日
							var bpYY,bpMM,bpDD,bnYY,bnMM,bnDD;
							var html_dt = [];
							if($("."+module+"_dl[data-date='"+list[i].browsetimeymd+"']").size()>0){
								dt_flag = true;
							}
							if(i>0){
								bpYY = list[i-1].browsetimeymd.split('-')[0]; //浏览年
								bpMM = list[i-1].browsetimeymd.split('-')[1]; //浏览月
								bpDD = list[i-1].browsetimeymd.split('-')[2]; //浏览日
							}

							if(i != (list.length-1)){
								bnYY = list[i+1].browsetimeymd.split('-')[0]; //浏览年
								bnMM = list[i+1].browsetimeymd.split('-')[1]; //浏览月
								bnDD = list[i+1].browsetimeymd.split('-')[2]; //浏览日
							}

							if(dt_flag){
								html_dt.push('<li class="list_dd" data-id="'+list[i].lid+'">');
								html_dt.push('<a href="'+list[i].url+'">');
								html_dt.push('<div class="litpic"><img src="'+list[i].litpic+'" onerror="this.src=\'/static/images/404.jpg\'" alt=""></div>');
								html_dt.push('<h1>'+list[i].title+'</h1>');
								html_dt.push('<p>'+list[i].typename+'</p>');
								html_dt.push('</a>');
								html_dt.push('</li>');
								$("."+module+"_dl:last-of-type ul").append(html_dt.join(''));
								dt_flag = false;
							}else{
								if(( i==0) || (i>0 && (bpYY!=bYY || bpMM!=bMM || bpDD!=bDD))){
									html.push('<div class="'+module+'_dl" data-date="'+list[i].browsetimeymd+'">');
									html.push('<h3 class="live_dt">'+list[i].browsetimeymd+'  观看了<em></em>个直播</h3>');
									html.push('<ul class="fn-clear">');
								}
									html.push('<li class="list_dd" data-id="'+list[i].lid+'">');
									html.push('<a href="'+list[i].url+'">');
									html.push('<div class="litpic"><img src="'+list[i][0].litpic+'" onerror="this.src=\'/static/images/404.jpg\'" alt=""></div>');
									html.push('<h1>'+list[i][0].title+'</h1>');
									html.push('<p>'+list[i][0].nickname+'</p>');
									html.push('</a>');
									html.push('</li>');
								if(i == (list.length-1) || (bnYY != bYY || bnMM != bMM || bnDD != bDD)){
									html.push('</ul>');
									html.push('</div>');
								}
							}
						}

					}else if(module == 'pension'){
						for(var i = 0; i < list.length; i++){
							var bYY = list[i].browsetimeymd.split('-')[0]; //浏览年
							var bMM = list[i].browsetimeymd.split('-')[1]; //浏览月
							var bDD = list[i].browsetimeymd.split('-')[2]; //浏览日
							var bpYY,bpMM,bpDD,bnYY,bnMM,bnDD;
							var html_dt = [];
							var label = list[i].usertype=='0'?'<label class="lab">个人</label>':""; //是否为个人che源
							if($("."+module+"_dl[data-date='"+list[i].browsetimeymd+"']").size()>0){
								dt_flag = true;
							}
							if(i>0){
								bpYY = list[i-1].browsetimeymd.split('-')[0]; //浏览年
								bpMM = list[i-1].browsetimeymd.split('-')[1]; //浏览月
								bpDD = list[i-1].browsetimeymd.split('-')[2]; //浏览日
							}

							if(i != (list.length-1)){
								bnYY = list[i+1].browsetimeymd.split('-')[0]; //浏览年
								bnMM = list[i+1].browsetimeymd.split('-')[1]; //浏览月
								bnDD = list[i+1].browsetimeymd.split('-')[2]; //浏览日
							}
							if(dt_flag){
								html_dt.push('<dd class="list_dd" data-id="'+list[i].lid+'">');
								html_dt.push('<a href="'+list[i].url+'" class="fn-clear">');
								if(list[i].litpic ||list[i].pics){
									html_dt.push('<div class="litpic">'+label+'<img src="'+(list[i].litpic?list[i].litpic:list[i].pics[0].path)+'" onerror="this.src=\'/static/images/404.jpg\'">');
									html_dt.push('</div>');
								}
								html_dt.push('<div class="rinfo">');
								html_dt.push('<h1>'+list[i].title+'</h1>');
								html_dt.push('<p><span>'+list[i].addrname[1]+'</span></p>');
								html_dt.push('<div class="price_show"><span class="allprice"><em>'+echoCurrency('symbol')+'</em><b>'+list[i].price+'</b>起</span></div>');
								html_dt.push('</div>');
								html_dt.push('</a>');
								html_dt.push('</dd>');
								$("."+module+"_dl:last-of-type").append(html_dt.join(''));
								dt_flag = false;
							}else{

								if((i==0) || (i>0 && (bpYY!=bYY || bpMM!=bMM || bpDD!=bDD))){
									html.push('<dl class="'+module+'_dl" data-date="'+list[i].browsetimeymd+'">');
									html.push('<dt>'+list[i].browsetimeymd+'</dt>');
								}
								html.push('<dd class="list_dd" data-id="'+list[i].lid+'">');
								html.push('<a href="'+list[i].url+'" class="fn-clear">');
								html.push('<div class="litpic">'+label+'<img src="'+(list[i].litpic?list[i].litpic:list[i].pics[0].path)+'" onerror="this.src=\'/static/images/404.jpg\'">');
								html.push('</div>');
								html.push('<div class="rinfo">');
								html.push('<h1>'+list[i].title+'</h1>');
								html.push('<p><span>'+list[i].addrname[1]+'</span></p>');
								html.push('<div class="price_show"><span class="allprice"><em>'+echoCurrency('symbol')+'</em><b>'+list[i].price+'</b>起</span></div>');
								html.push('</div>');
								html.push('</a>');
								html.push('</dd>');
								if(i == (list.length-1) || (bnYY != bYY || bnMM != bMM || bnDD != bDD)){
									html.push('</dl>');
								}
							}
						}

					}else if(module=='business'){
						for(var i = 0; i < list.length; i++){
							var bYY = list[i].browsetimeymd.split('-')[0]; //浏览年
							var bMM = list[i].browsetimeymd.split('-')[1]; //浏览月
							var bDD = list[i].browsetimeymd.split('-')[2]; //浏览日
							var bpYY,bpMM,bpDD,bnYY,bnMM,bnDD;
							var html_dt = [];
							if($("."+module+"_dl[data-date='"+list[i].browsetimeymd+"']").size()>0){
								dt_flag = true;
							}
							if(i>0){
								bpYY = list[i-1].browsetimeymd.split('-')[0]; //浏览年
								bpMM = list[i-1].browsetimeymd.split('-')[1]; //浏览月
								bpDD = list[i-1].browsetimeymd.split('-')[2]; //浏览日
							}

							if(i != (list.length-1)){
								bnYY = list[i+1].browsetimeymd.split('-')[0]; //浏览年
								bnMM = list[i+1].browsetimeymd.split('-')[1]; //浏览月
								bnDD = list[i+1].browsetimeymd.split('-')[2]; //浏览日
							}
							if(dt_flag){
								html_dt.push('<dd class="list_dd" data-id="'+list[i].lid+'">');
								html_dt.push('<a href="'+list[i].url+'" class="fn-clear">');
								if(list[i].banner){
									html_dt.push('<div class="litpic"><img src="'+list[i].banner[0].pic+'" onerror="this.src=\'/static/images/404.jpg\'">');
									html_dt.push('</div>');
								}
								html_dt.push('<div class="rinfo">');
								html_dt.push('<h1>'+list[i].title+'</h1>');
								html_dt.push('<p><span>'+list[i].typename+'</span></p>');
								html_dt.push('<label>'+list[i].typenameArr[0]+'</label>')
								html_dt.push('</div>');
								html_dt.push('</a>');
								html_dt.push('</dd>');
								$("."+module+"_dl:last-of-type").append(html_dt.join(''));
								dt_flag = false;
							}else{

								if(( i==0) || (i>0 && (bpYY!=bYY || bpMM!=bMM || bpDD!=bDD))){
									html.push('<dl class="'+module+'_dl" data-date="'+list[i].browsetimeymd+'">');
									html.push('<dt>'+list[i].browsetimeymd+'</dt>');
								}
								html.push('<dd class="list_dd" data-id="'+list[i].lid+'">');
								html.push('<a href="'+list[i].url+'" class="fn-clear">');
								if(list[i].banner.length > 0){
									html.push('<div class="litpic"><img src="'+list[i].banner[0].pic+'" onerror="this.src=\'/static/images/404.jpg\'">');
									html.push('</div>');
								}
								html.push('<div class="rinfo">');
								html.push('<h1>'+list[i].title+'</h1>');
								html.push('<p><span>'+list[i].address+'</span></p>');
								html.push('<label>'+list[i].typenameArr[0]+'</label>')
								html.push('</div>');
								html.push('</a>');
								html.push('</dd>');
								if(i == (list.length-1) || (bnYY != bYY || bnMM != bMM || bnDD != bDD)){
									html.push('</dl>');
								}
							}
						}

					}else if(module == 'info'){
						for(var i = 0; i < list.length; i++){
							var bYY = list[i].browsetimeymd.split('-')[0]; //浏览年
							var bMM = list[i].browsetimeymd.split('-')[1]; //浏览月
							var bDD = list[i].browsetimeymd.split('-')[2]; //浏览日
							var bpYY,bpMM,bpDD,bnYY,bnMM,bnDD;
							var html_dt = [];
							if($("."+module+"_dl[data-date='"+list[i].browsetimeymd+"']").size()>0){
								dt_flag = true;
							}
							if(i>0){
								bpYY = list[i-1].browsetimeymd.split('-')[0]; //浏览年
								bpMM = list[i-1].browsetimeymd.split('-')[1]; //浏览月
								bpDD = list[i-1].browsetimeymd.split('-')[2]; //浏览日
							}

							if(i != (list.length-1)){
								bnYY = list[i+1].browsetimeymd.split('-')[0]; //浏览年
								bnMM = list[i+1].browsetimeymd.split('-')[1]; //浏览月
								bnDD = list[i+1].browsetimeymd.split('-')[2]; //浏览日
							}
							// var typename = list[i].module2=='detail'? '<span>#'+list[i].typename+'</span>':"";
							if(dt_flag){
								html_dt.push('<dd class="list_dd '+(list[i].module2=='detail'?"":"store_dd")+' '+(list[i].imglist?"":"nopic")+'" data-id="'+list[i].lid+'">');
								html_dt.push('<a href="'+(list[i].module2 == 'storeDetail' ? list[i].domain : list[i].url)+'" class="fn-clear toMini" data-module="info" data-temp="'+list[i].module2+'" data-id="'+list[i].id+'">');
								if(((list[i].litpic &&list[i].litpic!='') || (list[i].imglist && list[i].imglist.length >0  )) && list[i].module2=='detail'){
									html_dt.push('<div class="litpic"><img src="'+(list[i].litpic?list[i].litpic:list[i].imglist[0].path)+'" onerror="this.src=\'/static/images/404.jpg\'">');
									html_dt.push('</div>');
								}
								if(list[i].pics && list[i].module2=='storeDetail'){
									html_dt.push('<div class="litpic"><img src="'+list[i].pics[0].path+'" onerror="this.src=\'/static/images/404.jpg\'">');
									html_dt.push('</div>');
								}


								html_dt.push('<div class="rinfo">');
								if(list[i].module2=='detail'){
									html_dt.push('<h1>'+list[i].titlenew+'</h1>');
									console.log(111)
									html_dt.push('<p class="price">'+list[i].typename+'</p>');
								}else{
									html_dt.push('<h1>'+list[i].member.company+'</h1>');
									html_dt.push('<p>'+list[i].address+'</p>');
									html_dt.push('<p class="typename">'+list[i].typenameonly+'</p>');
								}
								html_dt.push('</div>');
								html_dt.push('</a>');
								html_dt.push('</dd>');
								$("."+module+"_dl:last-of-type").append(html_dt.join(''));
								dt_flag = false;
							}else{

								if((i==0) || (i>0 && (bpYY!=bYY || bpMM!=bMM || bpDD!=bDD))){
									html.push('<dl class="'+module+'_dl" data-date="'+list[i].browsetimeymd+'">');
									html.push('<dt>'+list[i].browsetimeymd+'</dt>');
								}
								html.push('<dd class="list_dd '+(list[i].module2=='detail'?"":"store_dd")+' '+(list[i].imglist?"":"nopic")+'" data-id="'+list[i].lid+'">');
								html.push('<a href="'+(list[i].module2 == 'storeDetail' ? list[i].domain : list[i].url)+'" class="fn-clear toMini" data-module="info" data-temp="'+list[i].module2+'" data-id="'+list[i].id+'">');
								if(list[i].module2=='detail' && (list[i].imglist.length)  ){
									html.push('<div class="litpic"><img src="'+list[i].imglist[0].path+'" onerror="this.src=\'/static/images/404.jpg\'">');
									html.push('</div>');
								}
								if(list[i].pics && list[i].module2=='storeDetail'){
									html.push('<div class="litpic"><img src="'+list[i].pics[0].path+'" onerror="this.src=\'/static/images/404.jpg\'">');
									html.push('</div>');
								}


								html.push('<div class="rinfo">');
								if(list[i].module2=='detail'){
									html.push('<h1>'+list[i].titlenew+'</h1>');
									console.log(22)
									html.push('<p class="price">'+list[i].typename+'</p>');
								}else{
									html.push('<h1>'+list[i].member.company+'</h1>');
									html.push('<p>'+list[i].address+'</p>');
									html.push('<p class="typename">'+list[i].typenameonly+'</p>');
								}
								html.push('</div>');
								html.push('</a>');
								html.push('</dd>');
								if(i == (list.length-1) || (bnYY != bYY || bnMM != bMM || bnDD != bDD)){
									html.push('</dl>');
								}
							}
						}
						// if(dt_flag){
						// 	$("."+module+"_dl:last-of-type").append(html_dt.join(''));
						// 	dt_flag = false;
						// }
					}else if(module == 'shop'){
						for(var i = 0; i < list.length; i++){
							var bYY = list[i].browsetimeymd.split('-')[0]; //浏览年
							var bMM = list[i].browsetimeymd.split('-')[1]; //浏览月
							var bDD = list[i].browsetimeymd.split('-')[2]; //浏览日
							var bpYY,bpMM,bpDD,bnYY,bnMM,bnDD;
							var html_dt = [];
							if($("."+module+"_dl[data-date='"+list[i].browsetimeymd+"']").size()>0){
								dt_flag = true;
							}
							if(i>0){
								bpYY = list[i-1].browsetimeymd.split('-')[0]; //浏览年
								bpMM = list[i-1].browsetimeymd.split('-')[1]; //浏览月
								bpDD = list[i-1].browsetimeymd.split('-')[2]; //浏览日
							}

							if(i != (list.length-1)){
								bnYY = list[i+1].browsetimeymd.split('-')[0]; //浏览年
								bnMM = list[i+1].browsetimeymd.split('-')[1]; //浏览月
								bnDD = list[i+1].browsetimeymd.split('-')[2]; //浏览日
							}
							if(dt_flag){
								html_dt.push('<li class="list_dd" data-id="'+list[i].lid+'">');
								html_dt.push(`<a href="${list[i].url}" class="toMini" data-temp="detail" data-module="shop" data-id="${list[i].id}">`);
								html_dt.push('<div class="litpic"><img src="'+list[i].litpic+'" alt=""></div>');
								html_dt.push('<h1>'+list[i].title+'</h1>');
								html_dt.push('<p class="price">'+echoCurrency('symbol')+'<em>'+list[i].price.split('.')[0]+'</em>'+(list[i].price.split('.').length>1?"."+list[i].price.split('.')[1]:"")+'</p>');
								html_dt.push('</a>');
								html_dt.push('</li>');
								$("."+module+"_dl:last-of-type ul").append(html_dt.join(''));
								dt_flag = false;
							}else{

								if((i==0) || (i>0 && (bpYY!=bYY || bpMM!=bMM || bpDD!=bDD))){
									// html.push('<dl class="'+module+'_dl" data-date="'+list[i].browsetimeymd+'">');
									// html.push('<dt>'+list[i].browsetimeymd+'</dt>');
									html.push('<div class="'+module+'_dl" data-date="'+list[i].browsetimeymd+'">');
									html.push('<h3 class="shop_dt">'+list[i].browsetimeymd+'</h3>');
									html.push('<ul class="fn-clear">');
								}
								html.push('<li class="list_dd" data-id="'+list[i].lid+'">');
								html.push(`<a href="${list[i].url}" class="toMini" data-temp="detail" data-module="shop" data-id="${list[i].id}">`);
								html.push('<div class="litpic"><img src="'+list[i].litpic+'" alt=""></div>');
								html.push('<h1>'+list[i].title+'</h1>');
								if(list[i].price){
									html.push('<p class="price">'+echoCurrency('symbol')+'<em>'+list[i].price.split('.')[0]+'</em>'+(list[i].price.split('.').length>1?"."+list[i].price.split('.')[1]:"")+'</p>');
								}
								html.push('</a>');
								html.push('</li>');
								if(i == (list.length-1) || (bnYY != bYY || bnMM != bMM || bnDD != bDD)){
									html.push('</ul>');
									html.push('</div>');
								}
							}
						}
					}else if(module == 'house'){
						for(var i = 0; i < list.length; i++){
							var bYY = list[i].browsetimeymd.split('-')[0]; //浏览年
							var bMM = list[i].browsetimeymd.split('-')[1]; //浏览月
							var bDD = list[i].browsetimeymd.split('-')[2]; //浏览日
							var bpYY,bpMM,bpDD,bnYY,bnMM,bnDD;
							var html_dt = [];
							if($("."+module+"_dl[data-date='"+list[i].browsetimeymd+"']").size()>0){
								dt_flag = true;
							}
							if(i>0){
								bpYY = list[i-1].browsetimeymd.split('-')[0]; //浏览年
								bpMM = list[i-1].browsetimeymd.split('-')[1]; //浏览月
								bpDD = list[i-1].browsetimeymd.split('-')[2]; //浏览日
							}

							if(i != (list.length-1)){
								bnYY = list[i+1].browsetimeymd.split('-')[0]; //浏览年
								bnMM = list[i+1].browsetimeymd.split('-')[1]; //浏览月
								bnDD = list[i+1].browsetimeymd.split('-')[2]; //浏览日
							}
							if(dt_flag){
								html_dt.push('<dd class="list_dd" data-id="'+list[i].lid+'">');
								html_dt.push('<a href="'+list[i].url+'" class="fn-clear">');
								if(list[i].litpic){
									html_dt.push('<div class="litpic">'+((list[i].module2=='spDetail' && list[i].transfer!='0')?"<span>有转让费</span>":"")+'<img src="'+list[i].litpic+'" alt="" onerror="this.src=\'/static/images/404.jpg\'"></div>');
								}
								html_dt.push('<div class="rinfo">');
								html_dt.push('<h1>'+(list[i].module2=='zuDetail'?list[i].rentype:"")+' '+list[i].title+'</h1>');
								if(list[i].module2=='saleDetail'){
									html_dt.push('<p> '+list[i].room+'/'+list[i].area+''+echoCurrency('areasymbol')+' /'+list[i].direction+'/'+list[i].community+' </p>');
									html_dt.push('<div class="price_show"><span class="allprice"><b>'+list[i].price+'</b>万</span> <span class="unit_price">'+list[i].unitprice+'元/平</span></div>');
									html_dt.push('<div class="label_show">');
									if(list[i].flags && list[i].flags.length>0){
										list[i].flags.forEach(function(val){
											html_dt.push('<span>'+val+'</span>');
										})
									}
									html_dt.push('</div>');
								}else if(list[i].module2=='loupanDetail'){
									html_dt.push('<p> '+list[i].addr[list[i].addr.length-2]+'·'+list[i].addr[list[i].addr.length-1]+'/'+list[i].buildarea+''+echoCurrency('areasymbol')+' </p>');
									html_dt.push('<div class="price_show">');
									html_dt.push('<span class="allprice">');
										if(list[i].price != 0){
											var ptype = echoCurrency('short')+"/平";
											if(list[i].ptype != 1){
												ptype = "万"+echoCurrency('short')+"/套";
											}
											html_dt.push('<b>'+list[i].price+'</b><span class="unit_price">'+ptype+'</span>');
										}else{
											html_dt.push('<b>待定</b>');
										}
									html_dt.push('</span>');
									html_dt.push('</div>');
									html_dt.push('<div class="label_show">');
									if(list[i].protypeArr && list[i].protypeArr.length>0){
										list[i].protypeArr.forEach(function(val,index){
											if(index<3){
												html_dt.push('<span>'+val+'</span>');
											}
										})
									}
									html_dt.push('</div>');
								}else if(list[i].module2=='zuDetail'){
									html_dt.push('<p> '+list[i].room+'/'+list[i].area+''+echoCurrency('areasymbol')+' /'+list[i].direction+'/'+list[i].community+' </p>');
									html_dt.push('<div class="price_show"><span class="allprice">')
									if(list[i].price != 0){
										var ptype = echoCurrency('short')+"/月";
										html_dt.push('<b>'+list[i].price+'</b><span>'+ptype+'</span>');
									}else{
										html_dt.push('<b>面议<b>');
									}
									html_dt.push('</div>');
									html_dt.push('<div class="label_show">');
									if(list[i].flags && list[i].flags.length>0){
										list[i].flags.forEach(function(val){
											html_dt.push('<span>'+val+'</span>');
										})
									}
									html_dt.push('</div>');
								}else if(list[i].module2=='spDetail' || list[i].module2=='xzlDetail'|| list[i].module2=='cfDetail' || list[i].module2=='cwDetail' ){
									html_dt.push('<p> '+list[i].area+''+echoCurrency('areasymbol')+' / '+list[i].addr[list[i].addr.length-2]+'·'+list[i].addr[list[i].addr.length-1]+' / '+(list[i].protype?list[i].protype:"")+'</p>');
									html_dt.push('<div class="price_show"><span class="allprice">')
									if(list[i].price != 0){
										var ptype = echoCurrency('short')+"/月";
										html_dt.push('<b>'+list[i].price+'</b><span>'+ptype+'</span>');
									}else{
										html_dt.push('<b>面议<b>');
									}
									html_dt.push('</div>');
									html_dt.push('<div class="label_show">');
									if(list[i].flag){
										html_dt.push('<span>'+list[i].flag+'</span>');
									}
									if(list[i].zhuangxiu){
										html_dt.push('<span>'+list[i].zhuangxiu+'</span>');
									}
									if(list[i].paytype){
										html_dt.push('<span>'+list[i].paytype+'</span>');
									}

									html_dt.push('</div>');
								}
								html_dt.push('</div>');
								html_dt.push('</a>');
								html_dt.push('</dd>')
								$("."+module+"_dl:last-of-type").append(html_dt.join(''));
								dt_flag = false;
							}else{

								if((i==0) || (i>0 && (bpYY!=bYY || bpMM!=bMM || bpDD!=bDD))){
									html.push('<dl class="'+module+'_dl" data-date="'+list[i].browsetimeymd+'">');
									html.push('<dt>'+list[i].browsetimeymd+'</dt>');
								}
								html.push('<dd class="list_dd" data-id="'+list[i].lid+'">');
								html.push('<a href="'+list[i].url+'" class="fn-clear">');
								if(list[i].litpic){
									html.push('<div class="litpic">'+((list[i].module2=='spDetail' && list[i].transfer!='0')?"<span>有转让费</span>":"")+'<img src="'+list[i].litpic+'" alt="" onerror="this.src=\'/static/images/404.jpg\'"></div>');
								}
								html.push('<div class="rinfo">');
								html.push('<h1>'+(list[i].module2=='zuDetail'?list[i].rentype:"")+' '+list[i].title+'</h1>');
								if(list[i].module2=='saleDetail'){
									html.push('<p> '+list[i].room+'/'+list[i].area+''+echoCurrency('areasymbol')+' /'+list[i].direction+'/'+list[i].community+' </p>');
									html.push('<div class="price_show"><span class="allprice"><b>'+list[i].price+'</b>万</span> <span class="unit_price">'+list[i].unitprice+'元/平</span></div>');
									html.push('<div class="label_show">');
									if(list[i].flags && list[i].flags.length>0){
										list[i].flags.forEach(function(val){
											html.push('<span>'+val+'</span>');
										})
									}
									html.push('</div>');
								}else if(list[i].module2=='loupanDetail'){
									html.push('<p> '+list[i].addr[list[i].addr.length-2]+'·'+list[i].addr[list[i].addr.length-1]+'/'+list[i].buildarea+''+echoCurrency('areasymbol')+' </p>');
									html.push('<div class="price_show">');
									html.push('<span class="allprice">');
										if(list[i].price != 0){
											var ptype = echoCurrency('short')+"/平";
											if(list[i].ptype != 1){
												ptype = "万"+echoCurrency('short')+"/套";
											}
											html.push('<b>'+list[i].price+'</b><span class="unit_price">'+ptype+'</span>');
										}else{
											html.push('<b>待定</b>');
										}
									html.push('</span>');
									html.push('</div>');
									html.push('<div class="label_show">');
									if(list[i].protypeArr && list[i].protypeArr.length>0){
										list[i].protypeArr.forEach(function(val,index){
											if(index<3){
												html.push('<span>'+val+'</span>');
											}
										})
									}
									html.push('</div>');
								}else if(list[i].module2=='zuDetail'){
									html.push('<p> '+list[i].room+'/'+list[i].area+''+echoCurrency('areasymbol')+' /'+list[i].direction+'/'+list[i].community+' </p>');
									html.push('<div class="price_show"><span class="allprice">')
									if(list[i].price != 0){
										var ptype = echoCurrency('short')+"/月";
										html.push('<b>'+list[i].price+'</b><span>'+ptype+'</span>');
									}else{
										html.push('<b>面议<b>');
									}
									html.push('</div>');
									html.push('<div class="label_show">');
									if(list[i].flags && list[i].flags.length>0){
										list[i].flags.forEach(function(val){
											html.push('<span>'+val+'</span>');
										})
									}
									html.push('</div>');
								}else if(list[i].module2=='spDetail' || list[i].module2=='xzlDetail'|| list[i].module2=='cfDetail' || list[i].module2=='cwDetail' ){
									html.push('<p> '+list[i].area+''+echoCurrency('areasymbol')+' / '+list[i].addr[list[i].addr.length-2]+'·'+list[i].addr[list[i].addr.length-1]+' / '+(list[i].protype?list[i].protype:"")+'</p>');
									html.push('<div class="price_show"><span class="allprice">')
									if(list[i].price != 0){
										var ptype = echoCurrency('short')+"/月";
										html.push('<b>'+list[i].price+'</b><span>'+ptype+'</span>');
									}else{
										html.push('<b>面议<b>');
									}
									html.push('</div>');
									html.push('<div class="label_show">');
									if(list[i].flag){
										html.push('<span>'+list[i].flag+'</span>');
									}
									if(list[i].zhuangxiu){
										html.push('<span>'+list[i].zhuangxiu+'</span>');
									}
									if(list[i].paytype){
										html.push('<span>'+list[i].paytype+'</span>');
									}

									html.push('</div>');
								}
								html.push('</div>');
								html.push('</a>');
								html.push('</dd>');
								if(i == (list.length-1) || (bnYY != bYY || bnMM != bMM || bnDD != bDD)){
									html.push('</dl>');
								}
							}
						}

					}else if(module == 'travel'){
							for(var i = 0; i < list.length; i++){
								var bYY = list[i].browsetimeymd.split('-')[0]; //浏览年
								var bMM = list[i].browsetimeymd.split('-')[1]; //浏览月
								var bDD = list[i].browsetimeymd.split('-')[2]; //浏览日
								var bpYY,bpMM,bpDD,bnYY,bnMM,bnDD;
								var html_dt = [];
								if($("."+module+"_dl[data-date='"+list[i].browsetimeymd+"']").size()>0){
									dt_flag = true;
								}
								if(i>0){
									bpYY = list[i-1].browsetimeymd.split('-')[0]; //浏览年
									bpMM = list[i-1].browsetimeymd.split('-')[1]; //浏览月
									bpDD = list[i-1].browsetimeymd.split('-')[2]; //浏览日
								}

								if(i != (list.length-1)){
									bnYY = list[i+1].browsetimeymd.split('-')[0]; //浏览年
									bnMM = list[i+1].browsetimeymd.split('-')[1]; //浏览月
									bnDD = list[i+1].browsetimeymd.split('-')[2]; //浏览日
								}
								if(dt_flag){
									html_dt.push('<dd class="list_dd '+(list[i].module2=='videoDetail'?"video_dd":"")+'" data-id="'+list[i].lid+'">');
									html_dt.push('<a href="'+list[i].url+'" class="fn-clear">');
									if(list[i].pics ){

										html_dt.push('<div class="litpic"><img src="'+list[i].pics[0].path+'" onerror="this.src = \'/static/images/404.jpg\'" alt=""></div>');
									}else if(list[i].litpic){
										html_dt.push('<div class="litpic"><img src="'+list[i].litpic+'" onerror="this.src = \'/static/images/404.jpg\'" alt=""></div>');
									}
									html_dt.push('<div class="rinfo">');
									html_dt.push('<h1>'+list[i].title+'</h1>');
									if(list[i].module2=='strategyDetail' || list[i].module2=='videoDetail'){
										html_dt.push('<p>'+(list[i].module2=='strategyDetail'?"攻略":"视频")+' - '+list[i].user.nickname+'</p>')
									}else{
										if(list[i].typename){
											html_dt.push('<p>'+list[i].typename+'</p>');
										}else if(list[i].tag){
											html_dt.push('<p>'+list[i].tag+'</p>');
										}
										if(list[i].price){
											html_dt.push('<div class="price_show"><span class="allprice">'+echoCurrency('symbol')+'<b>'+list[i].price+'</b>'+(list[i].module2=='rentcarDeatil'?"日均":"")+'</span> </div>');
										}else if(list[i].minprice){
												html_dt.push('<div class="price_show"><span class="allprice">'+echoCurrency('symbol')+'<b>'+list[i].minprice+'</b>起</span> </div>');
										}
									}
									html_dt.push('</div>');
									html_dt.push('</a>');
									html_dt.push('</dd>');
									$("."+module+"_dl:last-of-type").append(html_dt.join(''));
									dt_flag = false;
								}else{

									if((i==0) || (i>0 && (bpYY!=bYY || bpMM!=bMM || bpDD!=bDD))){
										html.push('<dl class="'+module+'_dl" data-date="'+list[i].browsetimeymd+'">');
										html.push('<dt>'+list[i].browsetimeymd+'</dt>');
									}
									html.push('<dd class="list_dd '+(list[i].module2=='videoDetail'?"video_dd":"")+'" data-id="'+list[i].lid+'">');
									html.push('<a href="'+list[i].url+'" class="fn-clear">');
									if(list[i].pics){
										html.push('<div class="litpic"><img src="'+list[i].pics[0].path+'" onerror="this.src = \'/static/images/404.jpg\'" alt=""></div>');
									}else if(list[i].litpic){
										html.push('<div class="litpic"><img src="'+list[i].litpic+'" onerror="this.src = \'/static/images/404.jpg\'" alt=""></div>');
									}
									html.push('<div class="rinfo">');
									html.push('<h1>'+list[i].title+'</h1>');
									if(list[i].module2=='strategyDetail' || list[i].module2=='videoDetail'){
										html.push('<p>'+(list[i].module2=='strategyDetail'?"攻略":"视频")+' - '+list[i].user.nickname+'</p>')
									}else{
										if(list[i].typename){
											html.push('<p>'+list[i].typename+'</p>');
										}else if(list[i].tag){
											html.push('<p>'+list[i].tag+'</p>');
										}
										if(list[i].price){
											html.push('<div class="price_show"><span class="allprice">'+echoCurrency('symbol')+'<b>'+list[i].price+'</b>'+(list[i].module2=='rentcarDeatil'?"日均":"")+'</span> </div>');
										}else if(list[i].minprice){
												html.push('<div class="price_show"><span class="allprice">'+echoCurrency('symbol')+'<b>'+list[i].minprice+'</b>起</span> </div>');
										}
									}
									html.push('</div>');
									html.push('</a>');
									html.push('</dd>');
									if(i == (list.length-1) || (bnYY != bYY || bnMM != bMM || bnDD != bDD)){
										html.push('</dl>');
									}
								}
						}
					}else if(module == 'renovation'){
						for(var i = 0; i < list.length; i++){
							var bYY = list[i].browsetimeymd.split('-')[0]; //浏览年
							var bMM = list[i].browsetimeymd.split('-')[1]; //浏览月
							var bDD = list[i].browsetimeymd.split('-')[2]; //浏览日
							var bpYY,bpMM,bpDD,bnYY,bnMM,bnDD;
							var html_dt = [];
							if($("."+module+"_dl[data-date='"+list[i].browsetimeymd+"']").size()>0){
								dt_flag = true;
							}
							if(i>0){
								bpYY = list[i-1].browsetimeymd.split('-')[0]; //浏览年
								bpMM = list[i-1].browsetimeymd.split('-')[1]; //浏览月
								bpDD = list[i-1].browsetimeymd.split('-')[2]; //浏览日
							}

							if(i != (list.length-1)){
								bnYY = list[i+1].browsetimeymd.split('-')[0]; //浏览年
								bnMM = list[i+1].browsetimeymd.split('-')[1]; //浏览月
								bnDD = list[i+1].browsetimeymd.split('-')[2]; //浏览日
							}

							if(dt_flag){
								html_dt.push('<dd class="list_dd" data-id="'+list[i].lid+'">');
								if(list[i].module2 == 'teamDetail' || list[i].module2 == 'foremanDetail'){
									html_dt.push('<a href="'+list[i].domain+'" class="fn-clear">');
									html_dt.push('<div class="litpic"><img src="'+list[i].photo+'" onerror="this.src=\'/static/images/npPhoro_60.jpg\'">');
									html_dt.push('</div>');
									html_dt.push('<div class="rinfo">');
									html_dt.push('<h1>'+list[i].name+'</h1>');
									html_dt.push('<p><span>'+(list[i].module2 == 'teamDetail'?"设计师":"工长")+'</span> - '+(list[i].company.company?list[i].company.company:("自由"+(list[i].module2 == 'teamDetail'?"设计师":"工长")))+'</p>');
									html_dt.push('</div>');
									html_dt.push('</a>');
								}else{
									if(list[i].module2 == 'diaryDetail'){
										html_dt.push('<a href="'+list[i].url+'" class="fn-clear">');
										html_dt.push('<div class="litpic"><img src="'+list[i].litpicpath+'" onerror="this.src=\'/static/images/404.jpg\'">');
										html_dt.push('</div>');
										html_dt.push('<div class="rinfo">');
										html_dt.push('<h1>'+list[i].title+'</h1>');

										html_dt.push('<p><span>案例</span>-'+list[i].author.company+'</p>');
									}else{
										html_dt.push('<a href="'+list[i].url+'" class="fn-clear">');
										html_dt.push('<div class="litpic"><img src="'+list[i].logo+'" onerror="this.src=\'/static/images/404.jpg\'">');
										html_dt.push('</div>');
										html_dt.push('<div class="rinfo">');
										html_dt.push('<h1>'+list[i].company+'</h1>');

										html_dt.push('<p>'+list[i].address+'</p>');
									}

									html_dt.push('</div>');
									html_dt.push('</a>');
								}
								html_dt.push('</dd>');
								$("."+module+"_dl:last-of-type").append(html_dt.join(''));
								dt_flag = false;
							}else{
								if((i==0) || (i>0 && (bpYY!=bYY || bpMM!=bMM || bpDD!=bDD))){
									html.push('<dl class="'+module+'_dl" data-date="'+list[i].browsetimeymd+'">');
									html.push('<dt>'+list[i].browsetimeymd+'</dt>');
								}
								html.push('<dd class="list_dd" data-id="'+list[i].lid+'">');
								if(list[i].module2 == 'teamDetail' || list[i].module2 == 'foremanDetail'){
									html.push('<a href="'+list[i].domain+'" class="fn-clear">');
									html.push('<div class="litpic"><img src="'+list[i].photo+'" onerror="this.src=\'/static/images/npPhoro_60.jpg\'">');
									html.push('</div>');
									html.push('<div class="rinfo">');
									html.push('<h1>'+list[i].name+'</h1>');
									html.push('<p><span>'+(list[i].module2 == 'teamDetail'?"设计师":"工长")+'</span> - '+(list[i].company.company?list[i].company.company:("自由"+(list[i].module2 == 'teamDetail'?"设计师":"工长")))+'</p>');
									html.push('</div>');
									html.push('</a>');
								}else{
									if(list[i].module2 == 'diaryDetail'){
										html.push('<a href="'+list[i].url+'" class="fn-clear">');
										html.push('<div class="litpic"><img src="'+list[i].litpicpath+'" onerror="this.src=\'/static/images/404.jpg\'">');
										html.push('</div>');
										html.push('<div class="rinfo">');
										html.push('<h1>'+list[i].title+'</h1>');

										html.push('<p><span>案例</span> - '+list[i].author.company+'</p>');
									}else{
										html.push('<a href="'+list[i].url+'" class="fn-clear">');
										html.push('<div class="litpic"><img src="'+list[i].logo+'" onerror="this.src=\'/static/images/404.jpg\'">');
										html.push('</div>');
										html.push('<div class="rinfo">');
										html.push('<h1>'+list[i].company+'</h1>');

										html.push('<p>'+list[i].address+'</p>');
									}

									html.push('</div>');
									html.push('</a>');
								}
								html.push('</dd>');

								if(i == (list.length-1) || (bnYY != bYY || bnMM != bMM || bnDD != bDD)){
									html.push('</dl>');
								}
							}
						}
					}else if(module=='homemaking'){
						for(var i = 0; i < list.length; i++){
							var bYY = list[i].browsetimeymd.split('-')[0]; //浏览年
							var bMM = list[i].browsetimeymd.split('-')[1]; //浏览月
							var bDD = list[i].browsetimeymd.split('-')[2]; //浏览日
							var bpYY,bpMM,bpDD,bnYY,bnMM,bnDD;
							var html_dt = [];
							console.log('111')
							if($("."+module+"_dl[data-date='"+list[i].browsetimeymd+"']").size()>0){
								dt_flag = true;
							}
							if(i>0){
								bpYY = list[i-1].browsetimeymd.split('-')[0]; //浏览年
								bpMM = list[i-1].browsetimeymd.split('-')[1]; //浏览月
								bpDD = list[i-1].browsetimeymd.split('-')[2]; //浏览日
							}

							if(i != (list.length-1)){
								bnYY = list[i+1].browsetimeymd.split('-')[0]; //浏览年
								bnMM = list[i+1].browsetimeymd.split('-')[1]; //浏览月
								bnDD = list[i+1].browsetimeymd.split('-')[2]; //浏览日
							}

							if(dt_flag){
								html_dt.push('<dd class="list_dd" data-id="'+list[i].lid+'">');
								html_dt.push('<a href="'+list[i].url+'" class="fn-clear">');
								if(list[i].pics){
									html_dt.push('<div class="litpic"><img src="'+list[i].pics[0].path+'" onerror="this.src=\'/static/images/npPhoro_60.jpg\'">');
								}
								html_dt.push('</div>');
								html_dt.push('<div class="rinfo">');
								html_dt.push('<h1>'+list[i].title+'</h1>');
								if(list[i].module2=='storeDetail'){
									html_dt.push('<p><span>'+list[i].address+'</p>');
								}else{
									html_dt.push('<p><span>'+list[i].typename+'</p>');
									html_dt.push('<div class="price_show"><span class="allprice">'+echoCurrency('symbol')+'<b>'+list[i].price+'</b></span> </div>');
								}
								html_dt.push('</div>');
								html_dt.push('</a>');
								html_dt.push('</dd>');
								$("."+module+"_dl:last-of-type").append(html_dt.join(''));
								dt_flag = false;
							}else{
								if((i==0) || (i>0 && (bpYY!=bYY || bpMM!=bMM || bpDD!=bDD))){
									html.push('<dl class="'+module+'_dl" data-date="'+list[i].browsetimeymd+'">');
									html.push('<dt>'+list[i].browsetimeymd+'</dt>');
								}
								html.push('<dd class="list_dd" data-id="'+list[i].lid+'">');
								html.push('<a href="'+list[i].url+'" class="fn-clear">');
								if(list[i].pics){
									html.push('<div class="litpic"><img src="'+list[i].pics[0].path+'" onerror="this.src=\'/static/images/npPhoro_60.jpg\'">');
								}
								html.push('</div>');
								html.push('<div class="rinfo">');
								html.push('<h1>'+list[i].title+'</h1>');
								if(list[i].module2=='storeDetail'){
									html.push('<p><span>'+list[i].address+'</p>');
								}else{
									html.push('<p><span>'+list[i].typename+'</p>');
									html.push('<div class="price_show"><span class="allprice">'+echoCurrency('symbol')+'<b>'+list[i].price+'</b></span> </div>');
								}
								html.push('</div>');
								html.push('</a>');

								html.push('</dd>');

								if(i == (list.length-1) || (bnYY != bYY || bnMM != bMM || bnDD != bDD)){
									html.push('</dl>');
								}
							}
						}
					}else if(module=='tuan'){
						for(var i = 0; i < list.length; i++){
							var bYY = list[i].browsetimeymd.split('-')[0]; //浏览年
							var bMM = list[i].browsetimeymd.split('-')[1]; //浏览月
							var bDD = list[i].browsetimeymd.split('-')[2]; //浏览日
							var bpYY,bpMM,bpDD,bnYY,bnMM,bnDD;
							var html_dt = [];
							if($("."+module+"_dl[data-date='"+list[i].browsetimeymd+"']").size()>0){
								dt_flag = true;
							}
							if(i>0){
								bpYY = list[i-1].browsetimeymd.split('-')[0]; //浏览年
								bpMM = list[i-1].browsetimeymd.split('-')[1]; //浏览月
								bpDD = list[i-1].browsetimeymd.split('-')[2]; //浏览日
							}

							if(i != (list.length-1)){
								bnYY = list[i+1].browsetimeymd.split('-')[0]; //浏览年
								bnMM = list[i+1].browsetimeymd.split('-')[1]; //浏览月
								bnDD = list[i+1].browsetimeymd.split('-')[2]; //浏览日
							}

							if(dt_flag){
								html_dt.push('<dd class="list_dd" data-id="'+list[i].lid+'">');
								html_dt.push('<a href="'+list[i].url+'" class="fn-clear">');
								if(list[i].module2=='storeDetail'){
									html_dt.push('<div class="litpic"><img src="'+list[i].imgGroup[0]+'" onerror="this.src=\'/static/images/404.jpg\'"></div>');
								}else{
									html_dt.push('<div class="litpic"><img src="'+list[i].litpic+'" onerror="this.src=\'/static/images/404.jpg\'"></div>');
								}
								html_dt.push('<div class="rinfo">');
								if(list[i].module2=='storeDetail'){
									html_dt.push('<h1>'+list[i].member.company+'</h1>');
								}else{
									html_dt.push('<h1>'+list[i].title+'</h1>');
								}

								if(list[i].pin && list[i].pin=='1'){
									html_dt.push('<p><span>拼团</span>'+list[i].store.address+'</p>');
									html_dt.push('<div class="price_show"><span class="allprice">'+echoCurrency('symbol')+'<b>'+list[i].pinprice+'</b></span><span class="unit_price">门市价'+echoCurrency('symbol')+list[i].price+'</span></div>');
								}else if(list[i].pin && list[i].pin=='0'){
									html_dt.push('<p><span>团购</span>'+list[i].store.address+'</p>');
									html_dt.push('<div class="price_show"><span class="allprice">'+echoCurrency('symbol')+'<b>'+list[i].price+'</b></span><span class="unit_price">单买价'+echoCurrency('symbol')+list[i].market+'</span></div>');
								}

								if(list[i].module2=='storeDetail'){
									html_dt.push('<p>'+list[i].address+'</p>');
									html_dt.push('<div class="label">'+list[i].typename+'</div>');
								}
								html_dt.push('</div>');
								html_dt.push('</a>');
								html_dt.push('</dd>');
								$("."+module+"_dl:last-of-type").append(html_dt.join(''));
								dt_flag = false;
							}else{
								if((i==0) || (i>0 && (bpYY!=bYY || bpMM!=bMM || bpDD!=bDD))){
									html.push('<dl class="'+module+'_dl" data-date="'+list[i].browsetimeymd+'">');
									html.push('<dt>'+list[i].browsetimeymd+'</dt>');
								}
								html.push('<dd class="list_dd" data-id="'+list[i].lid+'">');
								html.push('<a href="'+list[i].url+'" class="fn-clear">');
								if(list[i].module2=='storeDetail'){
									html.push('<div class="litpic"><img src="'+list[i].imgGroup[0]+'" onerror="this.src=\'/static/images/404.jpg\'"></div>');
								}else{
									html.push('<div class="litpic"><img src="'+list[i].litpic+'" onerror="this.src=\'/static/images/404.jpg\'"></div>');
								}
								html.push('<div class="rinfo">');
								if(list[i].module2=='storeDetail'){
									html.push('<h1>'+list[i].member.company+'</h1>');
								}else{
									html.push('<h1>'+list[i].title+'</h1>');
								}
								if(list[i].pin && list[i].pin=='1'){
									html.push('<p><span>拼团</span>'+list[i].store.address+'</p>');
									html.push('<div class="price_show"><span class="allprice">'+echoCurrency('symbol')+'<b>'+list[i].pinprice+'</b></span><span class="unit_price">门市价'+echoCurrency('symbol')+list[i].price+'</span></div>');
								}else if(list[i].pin && list[i].pin=='0'){
									html.push('<p><span>团购</span>'+list[i].store.address+'</p>');
									html.push('<div class="price_show"><span class="allprice">'+echoCurrency('symbol')+'<b>'+list[i].price+'</b></span><span class="unit_price">单买价'+echoCurrency('symbol')+list[i].market+'</span></div>');
								}

								if(list[i].module2=='storeDetail'){
									html.push('<p>'+list[i].address+'</p>');
									html.push('<div class="label">'+list[i].typename+'</div>');
								}
								html.push('</div>');
								html.push('</a>');

								html.push('</dd>');

								if(i == (list.length-1) || (bnYY != bYY || bnMM != bMM || bnDD != bDD)){
									html.push('</dl>');
								}
							}
						}
					}else if(module == 'education'){
						for(var i = 0; i < list.length; i++){
							var bYY = list[i].browsetimeymd.split('-')[0]; //浏览年
							var bMM = list[i].browsetimeymd.split('-')[1]; //浏览月
							var bDD = list[i].browsetimeymd.split('-')[2]; //浏览日
							var bpYY,bpMM,bpDD,bnYY,bnMM,bnDD;
							var html_dt = [];
							if($("."+module+"_dl[data-date='"+list[i].browsetimeymd+"']").size()>0){
								dt_flag = true;
							}
							if(i>0){
								bpYY = list[i-1].browsetimeymd.split('-')[0]; //浏览年
								bpMM = list[i-1].browsetimeymd.split('-')[1]; //浏览月
								bpDD = list[i-1].browsetimeymd.split('-')[2]; //浏览日
							}

							if(i != (list.length-1)){
								bnYY = list[i+1].browsetimeymd.split('-')[0]; //浏览年
								bnMM = list[i+1].browsetimeymd.split('-')[1]; //浏览月
								bnDD = list[i+1].browsetimeymd.split('-')[2]; //浏览日
							}

							if(dt_flag){
								html_dt.push('<dd class="list_dd" data-id="'+list[i].lid+'">');
								html_dt.push('<a href="'+list[i].url+'" class="fn-clear">');
								if(list[i].pics){
									html_dt.push('<div class="litpic"><img src="'+list[i].pics[0].path+'" onerror="this.src=\'/static/images/404.jpg\'"></div>');
								}
								html_dt.push('<div class="rinfo">');
								if(list[i].module2 == 'storeDetail'){
									html_dt.push('<h1>'+list[i].title+'</h1>');
									html_dt.push('<p>教育机构</p>');
									html_dt.push('<div class="label">'+list[i].tag.split('、')[0]+'</div>');
								}else{
									html_dt.push('<h1>'+(list[i].title?list[i].title:list[i].classname)+'</h1>');
									html_dt.push('<p>课程</p>');
									html_dt.push('<div class="price_show"><span class="allprice">'+echoCurrency('symbol')+'<b>'+list[i].price+'</b></span></div>');
								}
								html_dt.push('<div class="price_show"><span class="allprice">'+echoCurrency('symbol')+'<b>'+list[i].price+'</b></span></div>');
								html_dt.push('</div>');
								html_dt.push('</a>');

								html_dt.push('</dd>');
								$("."+module+"_dl:last-of-type").append(html_dt.join(''));
								dt_flag = false;
							}else{
								if((i==0) || (i>0 && (bpYY!=bYY || bpMM!=bMM || bpDD!=bDD))){
									html.push('<dl class="'+module+'_dl" data-date="'+list[i].browsetimeymd+'">');
									html.push('<dt>'+list[i].browsetimeymd+'</dt>');
								}
									html.push('<dd class="list_dd" data-id="'+list[i].lid+'">');
									html.push('<a href="'+list[i].url+'" class="fn-clear">');
									if(list[i].pics){
										html.push('<div class="litpic"><img src="'+list[i].pics[0].path+'" onerror="this.src=\'/static/images/404.jpg\'"></div>');
									}
									html.push('<div class="rinfo">');
									if(list[i].module2 == 'storeDetail'){
										html_dt.push('<h1>'+list[i].title+'</h1>');
										html.push('<p>教育机构</p>');
										html.push('<div class="label">'+list[i].tag.split('、')[0]+'</div>');
									}else{
										html_dt.push('<h1>'+(list[i].title?list[i].title:list[i].classname)+'</h1>');
										html.push('<p>课程</p>');
										html.push('<div class="price_show"><span class="allprice">'+echoCurrency('symbol')+'<b>'+list[i].price+'</b></span></div>');
									}
									html.push('</div>');
									html.push('</a>');

									html.push('</dd>');
									if(i == (list.length-1) || (bnYY != bYY || bnMM != bMM || bnDD != bDD)){
										html.push('</dl>');
									}

							}
						}
					}


					page++;
					load_on = false;
					$(".loading").remove();
					if(module=='job'){
						$("."+module+"_page ul").append(html.join(''));
					}else if(module=='house'||module=='travel'){
						$("."+module+"_page .conbox").append(html.join(''));
					}else{

						$("."+module+"_page").append(html.join(''));
					}
					if(page > data.info.pageInfo.totalPage){
						load_on = true;
						$("."+module+"_page").append('<p class="loading">为您保留最近3个月的浏览历史</p>');
					}

					if(module=='article' || module=='tieba' || module=='business'){
						$("dl").each(function(){
							var t = $(this);
							t.find('dt em').text(t.find('dd').length)
						})
					}else if(module=='live'){
						$(".live_dl").each(function(){
							var t = $(this);
							t.find('.live_dt em').text(t.find('li').length)
						})
					}



				}
			},
			error: function(){}
		});
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


})
