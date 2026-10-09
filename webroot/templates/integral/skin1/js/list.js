$(function(){

	$("img").scrollLoading();

	//-----------------------------------列表页
	//展开 多选
	$('.sr-btn .unonly').click(function(){
		var ulh;
		var $ul = $('#sr-type-1 .sr-list');
		if($ul.attr('data-click')==undefined){
			ulh = $('#sr-type-1 .sr-list').height();
			$ul.attr('data-click',ulh);
		}else{
			ulh = parseInt($ul.attr('data-click'));
		}
		showMoreSel(1,ulh);
	})

	//展开 更多
	$('.sr-btn .more').click(function(){
		var ulh;
		var $ul = $('#sr-type-1 .sr-list');
		if($ul.attr('data-click')==undefined){
			ulh = $('#sr-type-1 .sr-list').height();
			$ul.attr('data-click',ulh);
		}else{
			ulh = parseInt($ul.attr('data-click'));
		}

		showMoreSel(2,ulh);
	})

	//选择分类
	var selecttypeArr = [] , selecttypeTempArr = []
	var m_msg_h_t;
	$(document).on('click','#sr-type-1 .sr-list li a',function(){
		var $this = $(this);
		var id = $this.attr('data-id');
		var $type = $('#sr-type-1');
		var show = $type.attr('data-show');
		var type = $type.attr('data-drop');
		if(show=='2'){
			//单选
			$this.parent('li').addClass('on').siblings('li').removeClass('on');
			if(type=='down'){
				$type.animate({'height':'40px'},200).attr('data-drop','up').find('.more').removeClass('up')
			}
			var txt = $this.text();
			$('.selected-type').slideDown().attr('data-id', id);
			$('.selected-type span').text(txt);
			$('.sr-list li').removeClass('active');
			$('#sr-type-1 .unlimit').addClass('unsele');

			getList();

		}else if(show=='1'){
			//多选
			if($this.parent('li').hasClass('active')){return;}
			var index = $this.parents('li').index();
			if(selecttypeTempArr.length>=3){
				clearTimeout(m_msg_h_t)
				var top = $('.select-require').offset().top;
				var left = "40%";
				if($('#modal-message').length<=0){
					var dom = '<div id="modal-message" style="position:absolute;top:' + top + 'px;left:' + left + ';height:30px;line-height:30px;padding: 0 12px;color:#fff;background:#fe5050;font-size:14px;text-align:center;border-radius:15px;display:none;">' +
							  '您最多可以选择3项' +
							  '</div>'
					$('body').append(dom)
				}
				$('#modal-message').fadeIn()
				m_msg_h_t = setTimeout(function(){
					$('#modal-message').fadeOut()
				},1500)
				return;
			}
			$this.parent('li').addClass('active')
			selecttypeTempArr.push(index)
		}
	})

	//点击 取消 多选项中的某一项
	$(document).on('click','.sr-list li i',function(event){
		event.stopPropagation();
		var $this = $(this);
		var $type = $('#sr-type-1');
		var index = $(this).parents('li').index();
		for(var i in selecttypeTempArr){
			if(index==selecttypeTempArr[i]){
				selecttypeTempArr.splice(i,1);
			}
		}
		$this.parents('li').removeClass('active');
	})

	//点击 多选---取消按钮
	$(document).on('click','.selectmore-btn .cancel',function(){
		$('#sr-type-1 .sr-list li').removeClass('active')
		selecttypeTempArr.length = selecttypeArr.length
		for(var i in selecttypeArr){
			selecttypeTempArr[i] = selecttypeArr[i]
			$('#sr-type-1 .sr-list li').eq(selecttypeArr[i]).addClass('active')
		}

		$('#sr-type-1').find('.unonly').click()
	})

	//分类多选-确定按钮
	$('.selectmore-btn .certain').click(function(){
		var txt = ''
		if(selecttypeTempArr.length==0){
			$('.selected-type').slideUp(200,function(){$('.selected-type span').text('');});
			selecttypeArr.length=0;

			$('#sr-type-1 .unlimit').removeClass('unsele');
		}else{

			for(var i in selecttypeTempArr){
				selecttypeArr[i] = selecttypeTempArr[i];
				var $li = $('#sr-type-1 .sr-list li').eq(selecttypeArr[i]);
				txt += $li.text() + ' , ';
			}
			txt = txt.substr(0,txt.length-2);
			$('.selected-type span').text(txt);
			$('.selected-type').slideDown();

			$('#sr-type-1 .unlimit').addClass('unsele');
		}
		$('#sr-type-1 .sr-list li').removeClass('on');
		$('#sr-type-1').find('.unonly').click();

		var ids = [];
		$('#chooseTypeid .sr-list li.active').each(function(){
			ids.push($(this).children('a').attr('data-id'));
		})
		$('.selected-type').attr('data-id', ids.join(","));

		getList();
	})
	//删除  条件
	$('.selected-type a').click(function(){
		$('.selected-type').slideUp().attr('data-id', 0);
		$('.sr-list li').removeClass('active on');
		selecttypeArr.length=0;
		selecttypeTempArr.length=0;


		$('#sr-type-1 .unlimit').removeClass('unsele');

		getList();
	})

	function showMoreSel(type,ulh){
		var updown = '',h=ulh;
		$type = $('#sr-type-1');
		if(type==1){
			$('.selectmore-btn').show();
		}else{
			$('.selectmore-btn').hide()
		}

		var data = $type.attr('data-drop')
		var show = $type.attr('data-show')
		var $ul = $type.find('.sr-list')
		if(data=='up' || show!=type){
		//show!=type:多选和更多之间没有收起选项直接切换
			$ul.height('auto').removeClass('yscroll');
			if(type==1){
				h += 40;
			}else{
				h = $ul.height();
			}
			updown = 'down';
		}else{
			h = 40
			updown = 'up';
		}
		$type.animate({'height':h+'px'},200,function(){
			$type.attr({'data-drop':''+updown,'data-show':''+type})
			if(updown=='up'){
				$type.removeClass('unonly').addClass('more').attr('data-show','2')
				$type.find('.sr-list').height('auto').removeClass('yscroll')
				if(type==2){
					$('.more').removeClass('up')
				}
			}else{
				if(type==1){
					$type.addClass('unonly').removeClass('more')
					$('.more').removeClass('up')
				}else{
					$type.removeClass('unonly').addClass('more')
					$('.more').addClass('up')
				}
			}
			if(updown == 'down'){
				h = $ul.height()+40;
				$type.animate({'height':h+'px'},200,function(){})
			}
		})
	}

	//积分范围,支付方式选择
	//积分范围 小屏下隐藏/显示右侧自定义输入框
	$('#sr-type-2 .big-hide').mouseover(function(){
		$(this).siblings('.small-hide').show()
	})
	$('#sr-type-2 .small-hide').mouseleave(function(){
		if(!$('html').hasClass('w1200')){
			$(this).hide()
		}
	})
	// 确定
	$('#pointConfirm').click(function(){
		if($('#pointMin').val() != '' || $('#pointMax').val() != ''){
			$('.unlimit.fl2').addClass('unsele');
			$('#sr-type-2 .fl li').removeClass('on');
			getList();
		}
	})

	//积分范围--支付方式 点击 条件项
	$(document).on('click','#sr-type-2 .sr-list li a,#sr-type-3 .sr-list li a',function(){
		$(this).parent('li').addClass('on').siblings('li').removeClass('on');
		$(this).parents('.sr-type').find('.unlimit').addClass('unsele');

		$('#pointMin, #pointMax').val('');
		getList();
	})

	// 关键词
	$('#keywordsBtn').click(function(){
		getList();
	})

	//选择 不限
	$(document).on('click','.select-require .unlimit',function(){
		$(this).siblings('ul').children('li').removeClass('on')
		$(this).parents('.sr-type').find('.unlimit').removeClass('unsele')
		if($('#sr-type-1').attr('data-drop')=='down'){
			if($('#sr-type-1').attr('data-show')=='1'){
				$('#sr-type-1 .unonly').click()
			}else{
				$('#sr-type-1 .more').click()
			}
		}
		if($(this).hasClass('fl1')){
			selecttypeTempArr.length=0;
			selecttypeArr.length=0;
			$('.selected-type').slideUp(200,function(){$('.selected-type span').text('');}).attr("data-id", toptypeid);
			$('.sr-list li').removeClass('active');

		}
		if($(this).hasClass('fl2')){
			$('#pointMin, #pointMax').val('');
		}

		getList();
	})
	//排序方式
	$('.s-t-l').click(function(){
		if($(this).hasClass('stl3')){
			var $up = $(this).find('.up');
			var $down = $(this).find('.down');

			if($(this).hasClass('on')){
				$(this).find('span i.on').removeClass('on').siblings().addClass('on');
			}
			if($(this).find('span i.on').length == 0){
				$down.addClass('on');
			}

			$(this).attr('data-id',$(this).find('span i.on').attr('data-id'));

		}

		$(this).addClass('on').siblings('.s-t-l').removeClass('on');

		getList();
	})
	$('.stl-other').click(function(){
		$(this).toggleClass('on')
	})

	$(document).delegate(".pgbtn a", "click", function(){
		var t = $(this), cls = t.attr('class');
		if(t.hasClass('not')) return;
		if(t.hasClass('pgbtn-l')){
			atpage--;
		}else{
			atpage++;
		}

		getList();
	})

	getList();
})


var atpage = 1, pageSize = 30, totalCount = 0, totalPage = 0, isload = false;
var objId = $('#list');
function getList(){
	objId.html('');
	if(isload) return;
	var data = [];
	typeid = $('.selected-type').attr('data-id');
	var	point = '',
		paytype = $('#sr-type-3 .sr-list li.on').length ? $('#sr-type-3 .sr-list li.on').children('a').attr('data-id') : '',
		orderby = $('.seque-type .s-t-l.on').length ? $('.seque-type .s-t-l.on').attr('data-id') : '',
		keywords = $('#keywords').val();

	typeid = typeid == undefined ? toptypeid : typeid;

	var pointMin = $('#pointMin').val(), pointMax = $('#pointMax').val();
	pointMin = pointMin == '' ? 0 : parseInt(pointMin);
	pointMax = pointMax == '' ? 0 : parseInt(pointMax);

	if(pointMin || pointMax){
		point = pointMin+','+pointMax;
	}else{
		if($('#sr-type-2 .sr-list li.on').length){
			point = $('#sr-type-2 .sr-list li.on').children('a').attr('data-id');
		}
	}


	data.push('typeid='+typeid);
	data.push('point='+point);
	data.push('paytype='+paytype);
	data.push('orderby='+orderby);
	data.push('keywords='+keywords);

	$('.loading').html('正在获取，请稍后').show();

	$.ajax({
		url: '/include/ajax.php?service=integral&action=slist&page='+atpage+'&pageSize='+pageSize,
		type: 'get',
		data: data.join('&'),
		dataType: 'json',
		success: function(data){
			if(data && data.state == 100){
				var list = data.info.list, len = list.length, html = [];

				totalCount = data.info.pageInfo.totalCount;
				totalPage = data.info.pageInfo.totalPage;

				$('.productnum span').text(totalCount);

				if(len){
					for(var i = 0; i < len; i++){
						var obj = list[i];
						html.push('<li>');
						html.push('	<div class="inner product-time-c3">');
						html.push('	  	<div class="pic">');
						html.push('	    	<a href="'+obj.url+'" target="_blank"><img src="'+obj.litpic+'" data-url="'+obj.litpic+'"></a>');
						html.push('	  	</div>');
						html.push('	  	<p class="name"><a href="'+obj.url+'">'+obj.title+'</a></p>');
						html.push('	  	<p class="price">'+obj.price+''+echoCurrency('short')+' + '+obj.point+pointName+'</p>');
						html.push('	  	<p class="des">使用'+pointName+'抵'+obj.point/pointRatio+''+echoCurrency('short')+'</p>');
						html.push('	</div>');
						html.push('	<div class="inner-ab"></div>');
						html.push('</li>');
					}

					objId.html(html.join(""));
					$('.loading').hide();

					showPageInfo();

				}else{
					if(totalPage == 0){
						$('.loading').html('暂无相关商品').show();
					}else{
						$('.loading').html('已加载全部商品').show();
					}
				}

				isload = false;

			}else{
				$('.loading').html('暂无相关商品').show();
				isload = false;
			}
		},
		error: function(){
			$('.loading').html('网络错误，加载失败！').show();
			isload = false;
		}
	})
}


//打印分页
function showPageInfo() {
	var info = $("#mod-item .pagination");
	var nowPageNum = atpage;
	var allPageNum = Math.ceil(totalCount/pageSize);
	var pageArr = [];

	info.html("").hide();

	var pageList = [];

	//页码统计
	pageList.push('<div class="le"><span class="thispg">'+atpage+'</span>/<span class="allpg">'+allPageNum+'</span></div>');
    pageList.push('<div class="pgbtn">');

	//上一页
	if(atpage > 1){
		pageList.push('<a href="javascript:void(0)" class="pgbtn-l" title="上一页"></a>');
	}else{
		pageList.push('<a href="javascript:void(0)" class="pgbtn-l not" title="上一页"></a>');
	}

	//下一页
	if(atpage >= allPageNum){
		pageList.push('<a href="javascript:void(0)" class="pgbtn-r not" title="下一页"></a>');
	}else{
		pageList.push('<a href="javascript:void(0)" class="pgbtn-r" title="下一页"></a>');
	}
    pageList.push('</div>');

	

	$("#bar-area .pagination").html(pageList.join(""));

	var pages = document.createElement("div");
	pages.className = "pagination-pages fn-clear";
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
			info.find(".pagination-pages").append(prev);
		}

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
			info.find(".pagination-pages").append(next);
		}

		//输入跳转
		var insertNum = Number(nowPageNum + 1);
		if (insertNum >= Number(allPageNum)) {
			insertNum = Number(allPageNum);
		}

		var redirect = document.createElement("div");
		redirect.className = "redirect";
		redirect.innerHTML = '<i>到</i><input id="prependedInput" type="number" placeholder="页码" min="1" max="'+allPageNum+'" maxlength="4"><i>页</i><button type="button" id="pageSubmit">确定</button>';
		info.find(".pagination-pages").append(redirect);

		//分页跳转
		info.find("#pageSubmit").bind("click", function(){
			var pageNum = $("#prependedInput").val();
			if (pageNum != "" && pageNum >= 1 && pageNum <= Number(allPageNum)) {
				atpage = Number(pageNum);
				getList();
			} else {
				$("#prependedInput").focus();
			}
		});

		info.show();

	}else{
		info.hide();
	}
}
