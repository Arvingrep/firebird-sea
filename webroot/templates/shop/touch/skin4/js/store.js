$(function() {

    //APP端取消下拉刷新
    toggleDragRefresh('off');
    $('.search-form .type').click(function(event) {
        var par =$('.search-form ');
        par.find('.typelist').toggleClass('show');
   });
   $('.typelist').delegate('p', 'click', function(event) {
        var par = $(this).closest('.search-form');
        var spar = $(this).closest('.typelist');
        var sform = par.find('#sform')
        if($(this).text()==langData['siteConfig'][16][25]){//商品
          par.find('.type label').text(langData['siteConfig'][16][25]);//商品
          spar.toggleClass('show');
          sform.attr('action',prourl);
          $(this).text(langData['siteConfig'][17][12]);//店铺
          $("#stype").val('pro')
          $('#keywords').attr('placeholder',langData['shop'][6][0]);//输入宝贝关键词
        }else{
          par.find('.type label').text(langData['siteConfig'][17][12]);//店铺
          spar.toggleClass('show');
          sform.attr('action',storeurl);
          $("#stype").val('shop')
          $(this).text(langData['siteConfig'][16][25]);//商品
          $('#keywords').attr('placeholder',langData['shop'][6][31]);//输入店铺关键词
        }
   });
   $(".inp").delegate('#search', 'click', function(event) {
    $(this).closest('#sform').submit();
   });
   //监听input输入
    $(".search-fixForm #keywords").bind('input propertychange', function () {
        var term = $(this).val();
        if (term=='') {
              $('.search-fixForm .imgsearch').show();
              $('.search-fixForm .clear_inp').hide();
        }else{
            $('.search-fixForm .imgsearch').hide();
            $('.search-fixForm .clear_inp').show()
        }
    });
  //清除头部input
  $(".search-fixForm").delegate('.clear_inp', 'click', function(event) {
    $(".search-fixForm #keywords").val('');
    $(this).hide();
    $('.search-fixForm .imgsearch').show();
   });
  $('.search-fixForm .fake-input').click(function(){
    $(this).hide();
    $('.search-fixForm').addClass('show');
    $(this).siblings('.inp_wrap').show();
    $(this).siblings('.inp_wrap').find('#keywords').focus()
  })

    //以图搜图
    $('.imgsearch-holder').bind('click', function(){
        image = '';
        $(this).hide();
        $('#keywords').attr('placeholder', '商品/品牌');
        $('.imgsearch').show();
        getList(1);
    });

    //上传单张图片
    var uploadHolder;
	function mysub(id){
        var t = $("#"+id), p = t.parent(), uploadHolder = t.siblings('.imgsearch-btn');

        var data = [];
        data['mod'] = 'shop';
        data['filetype'] = 'image';
        data['type'] = 'single';

        $.ajaxFileUpload({
          url: "/include/upload.inc.php",
          fileElementId: id,
          dataType: "json",
          data: data,
          success: function(m, l) {
            if (m.state == "SUCCESS") {
                location.href = '?image=' + m.url;
            } else {
              uploadError(m.state, id, uploadHolder);
            }
          },
          error: function() {
            uploadError("网络错误，请重试！", id, uploadHolder);
          }
      	});

	}

	function uploadError(info, id, uploadHolder){
		uploadHolder.removeClass('disabled');
		$('.soutu').html(info);
		setTimeout(function(){
			$('.soutu').hide();
		},1000)
	}

	$(".imgsearch-btn").bind("click", function(){
		var t = $(this), inp = t.siblings("input");
		if(t.hasClass("disabled")) return;
		inp.click();
	})

	$("#Filedata_imgsearch").bind("change", function(){
		if ($(this).val() == '') return;
		$(this).siblings('.imgsearch-btn').addClass('disabled');
	    mysub($(this).attr("id"));
	    $('.soutu').html('<i></i><span>'+langData['shop'][6][34]+'</span>').show();//正在搜图
	})
	if(keywords){
		$('.search-fixForm .fake-input').click();
		$('#keywords').val(keywords);
		$('.search-fixForm .imgsearch').hide();
        $('.search-fixForm .clear_inp').show();
    }


	var disk2 = $('.disk2'),
		areaScroll = infoScroll = sortScroll = null,
		areaArr = infoArr = sortArr = moreArr = sortSecondArr = [],
		chooseScroll = function(obj){return new iScroll(obj, {vScrollbar: false, mouseWheel: true, click: true});};

	var detailList, getParid;
  detailList = new h5DetailList();
  setTimeout(function(){detailList.removeLocalStorage();}, 800);

	var	isload = false, isClick = true,
			xiding = $(".choose"),
			chtop = parseInt(xiding.offset().top),
			device = navigator.userAgent;

	var dataInfo = {
			orderby: '',
			orderbyName: '',
			orderbyType: '',
			flag: '',
			keywords: '',
			isBack: true
	};


	// 筛选框
	$('.choose-tab li').click(function(){
		var t = $(this), index = t.index();
		if(index == 1 || index ==2){//1是销量 2是评价
			if(index == 1){//1是销量
				$('.comment').attr("data-id",'');
				if(!t.hasClass('active')){
				 	t.addClass('active');
				 	$('.choose-tab li.typeid').removeClass('active');
				 	$('.choose-tab li.comment').removeClass('active');
					t.attr("data-id",5);
				}else{
					if(t.hasClass('down')){
		                t.removeClass('down').addClass('up');
		                t.attr("data-id",4);
		            }else{
		                t.removeClass('up').addClass('down')
		                t.attr("data-id",5);
		            }

				}
			}else{//2是评价
				$('.sale').attr("data-id",'');
				if(!t.hasClass('active')){
				 	t.addClass('active');
				 	$('.choose-tab li.typeid').removeClass('active');
				 	$('.choose-tab li.sale').removeClass('active');
					t.attr("data-id",7);
				}else{
					if(t.hasClass('down')){
		                t.removeClass('down').addClass('up');
		                t.attr("data-id",6);
		            }else{
		                t.removeClass('up').addClass('down')
		                t.attr("data-id",7);
		            }

				}
			}
			getList(1);
		}else{

		 	if (index == 0) {//点击默认时
		 		t.addClass('active').siblings().removeClass('active');
		 		$('.comment').attr("data-id",'0');
		 		$('.sale').attr("data-id",'0');
		 		$('.drop_con a').removeClass('curr');
		 		getList(1);
		 	}
		 	if (index == 3 ) {
		 		disk2.show();
		 		t.addClass('active');
		 		$('.choose-more').animate({"right":'0'},200);
		 	}

		}

	});


	//服务/折扣
	$('.drop_con a').click(function(){
		$(this).toggleClass('curr').siblings().removeClass('curr');

	})

	// 确认
	$('.btn_confirm').click(function(){
		$('.choose-more').animate({"right":'-100%'},200);
		disk2.hide();
		if($('.choose-more-search a.curr').length>0){
			$('.choose-tab li.typeid').removeClass('active');
		}else{
			$('.choose-tab li.moreFilter').removeClass('active');
		}
		getList(1);
	});
	$("#search").click(function(){
		getList(1);
	});

	// 重置
	$('.btn_reset').click(function() {
		$('.drop_con a').removeClass('curr');
	});


	// 遮罩层
	$('.disk2').on('click',function(){
		disk2.hide();
		$('.choose-more').animate({"right":'-100%'},200);
		$('.choose-tab li.moreFilter').removeClass('active');
	})

	$('.confirm, .drop-range input').on('touchmove', function(e){
		e.preventDefault();
	})




	$('#maincontent').delegate('li a', 'click', function(){
		var t = $(this), url = t.attr('data-url'), id = t.closest('li').attr('data-id');

		var orderby = $('.choose-tab .orderby.active').attr('data-id'),
			orderbyName = $('.choose-tab .orderby.active').find('span').text(),
			orderbyType = $('.choose-tab .orderby.active').attr('data-type'),
			flagId = $('.discount a.curr').attr('data-flag'),
			keywords = $('#keywords').val();


		dataInfo.orderby = orderby;
		dataInfo.orderbyName = orderbyName;
		dataInfo.orderbyType = orderbyType;
		dataInfo.flag = flagId;
		dataInfo.keywords = keywords;

		detailList.insertHtmlStr(dataInfo, $("#maincontent").html(), {lastIndex: atpage});

		setTimeout(function(){location.href = url;}, 500);

	})

	// 下拉加载
	var isload = false;
	$(document).ready(function() {
		$(window).scroll(function() {
			var allh = $('body').height();
			var w = $(window).height();
			var scroll = allh - w;
			if ($(window).scrollTop() + 50 > scroll && !isload) {
				atpage++;
				getList();
			};
		});
	});


	//初始加载
	if($.isEmptyObject(detailList.getLocalStorage()['extraData']) || !detailList.isBack()){
    	getList();
	}else {
		getData();
		setTimeout(function(){
			detailList.removeLocalStorage();
		}, 500)
	}

	//数据列表
	function getList(tr){
        isload = true;
        if(tr){
            $(".list-box ul").html("");
        }
        //请求数据
        var data = [];
        data.push("pageSize="+pageSize);
        data.push("page="+atpage);
        var keywords = $('#keywords').val();
		if(keywords != null && keywords != ''){
			data.push("title="+keywords);
		}
		//请求数据
		var data = [];
		data.push("pageSize="+pageSize);
		data.push("page="+atpage);

		var orderbyId = $('.choose-tab li.orderby.active').attr('data-id');
		if(orderbyId != undefined && orderbyId != ''){
			data.push("orderby="+orderbyId);
		}
		var addrId = $('.big-area a.curr').attr('data-addr');
		if(addrId != undefined && addrId != ''){
			data.push("addrid="+addrId);
		}

		var flag = $('.discount a.curr').attr('data-flag');
		if(flag != undefined && flag != ''){
			data.push("flag="+flag);
		}

		var keywords = $('#keywords').val();
		if(keywords != null && keywords != ''){
			data.push("title="+keywords);
		}

		var hp = $('.haoping a.curr').attr('data-haoping');
		if(hp != undefined && hp != ''){
			data.push("hp="+hp);
		}

		var industry = $('.leibie a.curr').attr('data-leibie');
		if(industry != undefined && industry != ''){
			data.push("industry="+industry);
		}

        if(image){
            data.push('image='+image);
        }
        console.log(data)
        $.ajax({
          url: "/include/ajax.php?service=shop&action=store",
          data: data.join("&"),
          type: "GET",
          dataType: "jsonp",
          success: function (data) {
            if(data.state == 100){
                $(".list-box ul .loading").remove();
                var list = data.info.list, html = [];
                for(var i = 0; i < list.length; i++){
					var logo = list[i]['logo'] == '' ? staticPath+'images/blank.gif' : huoniao.changeFileSize(list[i]['logo'], "large");
                	var topTxt = '';
                	if(list[i]['rec']==1){
						topTxt = '<span class="toptag">'+langData['siteConfig'][23][109]+'</span>';//推荐
                	}
                	html.push('<li class="shopBox">');
						html.push('<div class="sbotop fn-clear">');
						html.push('<a href="javascript:;"  data-url="'+list[i]['url']+'" class="goShop">'+langData['shop'][6][36]+'<i class="go"></i></a>');//进店
						html.push('<div class="sbleft">');
						html.push('<a href="javascript:;"  data-url="'+list[i]['url']+'"><img src="'+logo+'" onerror="this.src=\'/static/images/404.jpg\'" alt=""></a>');
						html.push('</div>');
						html.push('<div class="sbright">');
						html.push('<a href="javascript:;"  data-url="'+list[i]['url']+'">');
						html.push('<h3>'+list[i]['title']+'</h3>');
						html.push(topTxt);
						html.push('<p class="fn-clear">'+langData['siteConfig'][18][32]+list[i].rating+' | '+langData['shop'][6][40].replace('1',list[i]['thismonth']	)+'</p>');//好评率 月售1笔
						html.push('</a>');
						html.push('</div>');
						html.push('</div>');
							html.push('<div class="sbomain children-'+list[i].id+'">');
							html = html.concat(getPro(list[i].xiaoliangarr));
							html.push('</div>');

					html.push('</li>');
                }
                $(".list-box ul").append(html.join(""));
                isload = false;

                //最后一页
                if(atpage >= data.info.pageInfo.totalPage){
                    isload = true;
                    $(".list-box ul").append('<div class="loading">'+langData['siteConfig'][18][7]+'</div>');
                }
            }else{
                isload = true;
                $(".list-box ul").append('<div class="loading"><i></i>'+langData['shop'][6][39]+'</div>');//没有符合条件的店铺
            }
          },
          error: function(){
            isload = false;
            $('.list-box ul').html('<div class="loading">'+langData['siteConfig'][20][227]+'</div>');
          }
        });
    }

    //获取商家3个商品
  //   function getPro(storeid){
		// $.ajax({
		// 	url: "/include/ajax.php?service=shop&action=slist&store="+storeid+"&page=1&pageSize=3",
		// 	type: "GET",
		// 	dataType: "jsonp",
		// 	success: function (data) {
		// 		if(data && data.state == 100){
		// 			var list = data.info.list, pageInfo = data.info.pageInfo, html = [];
		// 			for(var i = 0; i < list.length; i++){
		// 				var photo = (list[i].litpic == "" || list[i].litpic == undefined) ? staticPath+'images/blank.gif' : huoniao.changeFileSize(list[i].litpic, "o_large");
		// 				html.push('<div class="goBox">');
		// 				html.push('<a href="javascript:;"  data-url="'+list[i]['url']+'">');
		// 				html.push('<div class="good_box">');
		// 				html.push('<img src="'+photo+'" onerror="this.src=\'/static/images/404.jpg\'" alt=""  >');
		// 				html.push('</div>');
		// 				var priceArr = list[i].price.split('.');
		// 				html.push('<div class="good_txt">'+echoCurrency('symbol')+'<strong>'+priceArr[0]+'<strong><em>.'+priceArr[1]+'</em></div>');
		// 				html.push('</a>');
		// 				html.push('</div>');
		// 			}
		// 			$('.children-'+storeid).html(html.join(""));
		// 		}else{
		// 			$('.children-'+storeid).html('<div class="nogoodBox">店铺暂时没有宝贝哦~</div>')
		// 		}
		// 	},
		// 	error:function (data){

		// 	}
		// });
  //   }
  function getPro(list){
  	    var html = [];

		for(var i = 0; i < list.length; i++){
			var photo = (list[i].litpic == "" || list[i].litpic == undefined) ? staticPath+'images/blank.gif' : huoniao.changeFileSize(list[i].litpic, "o_large");
			html.push('<div class="goBox">');
			html.push('<a href="javascript:;"  data-url="'+list[i]['url']+'">');
			html.push('<div class="good_box">');
			html.push('<img src="'+photo+'" onerror="this.src=\'/static/images/404.jpg\'" alt=""  >');
			html.push('</div>');
			var priceArr = list[i].price.split('.');
			html.push('<div class="good_txt">'+echoCurrency('symbol')+'<strong>'+priceArr[0]+'<strong><em>.'+priceArr[1]+'</em></div>');
			html.push('</a>');
			html.push('</div>');
		}

		return html;
		
   }


	// 本地存储的筛选条件
	function getData() {

		var filter = $.isEmptyObject(detailList.getLocalStorage()['filter']) ? dataInfo : detailList.getLocalStorage()['filter'];

		atpage = detailList.getLocalStorage()['extraData'].lastIndex;

		console.log(filter)
		// 排序选中状态
		if (filter.orderby != "") {
			$('.choose-tab .orderby[data-type="'+filter.orderbyType+'"]').addClass('active').siblings('li').removeClass('active');
			$('.choose-tab .orderby[data-type="'+filter.orderbyType+'"]').attr('data-id',filter.orderby);
		}

		// 筛选选中状态
		if (filter.flag != "") {
			$('.discount a[data-flag="'+filter.flag+'"]').addClass('curr').siblings('a').removeClass('curr')

		}

		// 筛选选中状态
		if (filter.keywords != "") {
			$('#keywords').text(filter.keywords);
		}

	}

	// 判断设备类型，ios全屏
	var device = navigator.userAgent;
	if (device.indexOf('huoniao_iOS') > -1) {
		$('body').addClass('huoniao_iOS');
	}

})

// 扩展zepto
$.fn.prevAll = function(selector){
    var prevEls = [];
    var el = this[0];
    if(!el) return $([]);
    while (el.previousElementSibling) {
        var prev = el.previousElementSibling;
        if (selector) {
            if($(prev).is(selector)) prevEls.push(prev);
        }
        else prevEls.push(prev);
        el = prev;
    }
    return $(prevEls);
};

$.fn.nextAll = function (selector) {
    var nextEls = [];
    var el = this[0];
    if (!el) return $([]);
    while (el.nextElementSibling) {
        var next = el.nextElementSibling;
        if (selector) {
            if($(next).is(selector)) nextEls.push(next);
        }
        else nextEls.push(next);
        el = next;
    }
    return $(nextEls);
};
