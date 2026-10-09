$(function() {

    //APP端取消下拉刷新
    toggleDragRefresh('off');
    if(listTypename!=''){
    	$('.search-fixForm p.fake-input').hide();
    	$('.search-form .inp .inp_wrap').show()
    	$('#keywords').attr('placeholder',listTypename)
    	//$('#keywords').attr('placeholder').css('color','#333')
    }
    $('.search-form .type').click(function(event) {
        var par =$('.search-form ');
        par.find('.typelist').toggleClass('show');
   });
   $('.typelist').delegate('p', 'click', function(event) {
        var par = $(this).closest('.search-form');
        var spar = $(this).closest('.typelist');
        var sform = par.find('#sform');
        $('#keywords').val('');
        if($(this).text()==langData['siteConfig'][16][25]){//商品
          par.find('.type label').text(langData['siteConfig'][16][25]);//商品
          spar.toggleClass('show');
          sform.attr('action',prourl);
          $(this).text(langData['siteConfig'][17][12]);//店铺
          $('#keywords').attr('placeholder',langData['shop'][6][0]);//输入宝贝关键词
        }else{
          par.find('.type label').text(langData['siteConfig'][17][12]);//店铺
          spar.toggleClass('show');
          sform.attr('action',storeurl);
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
            $('.search-fixForm .clear_inp').show();
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
	    $(this).siblings('.inp_wrap').find('#keywords').focus();
	})

    //以图搜图
    $('.x-btn').bind('click', function(){
        image = '';
        $('.imgsearch-holder').hide();
        $('.fake-input').show();
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
	var listArr = [];

	var detailList, getParid;
  detailList = new h5DetailList();
  setTimeout(function(){detailList.removeLocalStorage();}, 800);

	var	isload = false, isClick = true,
			xiding = $(".choose"),
			chtop = parseInt(xiding.offset().top),
			device = navigator.userAgent;

	var dataInfo = {
			parid: '',
			typeid: '',
			typename: '',
			orderby: '',
			orderbyName: '',
			orderbyType: '',
			keywords: '',
			flag: '',
			price1: '',
			price2: '',
			listArr: '',
			isBack: true
	};


	// 筛选框
	$('.choose-tab li').click(function(){
		var t = $(this), index = t.index();
		if(index == 1 || index ==2){
			if(index == 1){
				$('.sale').attr("data-id",'');				
				if(!t.hasClass('active')){
				 	t.addClass('active');	
				 	$('.choose-tab li.typeid').removeClass('active');		
				 	$('.choose-tab li.sale').removeClass('active');		
					t.attr("data-id",3);			
				}else{
					if(t.hasClass('down')){
		                t.removeClass('down').addClass('up');
		                t.attr("data-id",3);
		            }else{
		                t.removeClass('up').addClass('down')
		                t.attr("data-id",4);
		            }
					
				}
			}else{
				$('.price').attr("data-id",'');
				if(!t.hasClass('active')){
				 	t.addClass('active');	
				 	$('.choose-tab li.typeid').removeClass('active');	
				 	$('.choose-tab li.price').removeClass('active');		
					t.attr("data-id",1);			
				}else{
					if(t.hasClass('down')){
		                t.removeClass('down').addClass('up');
		                t.attr("data-id",2);
		            }else{
		                t.removeClass('up').addClass('down')
		                t.attr("data-id",1);
		            }
					
				}
			}
			getList(1);
		}else{			 	
		 	if (index == 0) {//点击默认时
		 		t.addClass('active').siblings().removeClass('active');
		 		$('.price').attr("data-id",'');
		 		$('.sale').attr("data-id",'');
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

	//展开二级地区
	$('.big-area .addr_down').click(function(){
		var t=$(this)
		if(!$('.small-area').hasClass('show')){
			$('.small-area,.middle-area').addClass('show');
			t.addClass('addr_up')
		}else{
			$('.small-area,.middle-area').removeClass('show')
			t.removeClass('addr_up')
		}
	})

	//服务/折扣
	$('.drop_con a').click(function(){
		$(this).toggleClass('curr').siblings().removeClass('curr');
		var parDrop = $(this).closest('.drop-range');
		if(parDrop.hasClass('big-area')){
			$('.small-area a,.middle-area a').removeClass('curr');
		}else if(parDrop.hasClass('small-area')){
			$('.big-area a,.middle-area a').removeClass('curr');
		}else if(parDrop.hasClass('middle-area')){
			$('.big-area a,.small-area a').removeClass('curr');
		}
	})

	// 确认
	$('.btn_confirm').click(function(){
		$(this).closest('.choose-local').hide();
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
		$('.price1,.price2').val('');
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



	$('#maincontent').delegate('li', 'click', function(e){
		var t = $(this), id = t.closest('li').attr('data-id');
		var detailUrl = t.find('.detHref').attr('data-url');
		var storeUrl = t.find('.stHref').attr('data-url');

		var orderby = $('.choose-tab .orderby.active').attr('data-id'),
				orderbyName = $('.choose-tab .orderby.active').find('span').text(),
				orderbyType = $('.choose-tab .orderby.active').attr('data-type'),
				typeid = $('.choose-tab .typeid').attr('data-id'),
				typename = $('.choose-tab .typeid span').text();
				firstId = $('#choose0 li.active').attr('data-id');
				keywords = $('#keywords').val();
				flagId = $('.discount a.curr').attr('data-flag');
				price1 = $('.drop-range .price1').val();
				price2 = $('.drop-range .price2').val();

		if (firstId == undefined) {
			if (getParid == undefined) {
				parid = $('.choose-tab .typeid').attr('data-id');
			}else {
				parid = getParid;
			}
		}else {
			parid = firstId;
		}

		dataInfo.parid = parid;
		dataInfo.typeid = typeid;
		dataInfo.typename = typename;
		dataInfo.orderby = orderby;
		dataInfo.orderbyName = orderbyName;
		dataInfo.orderbyType = orderbyType;
		dataInfo.keywords = keywords;
		dataInfo.flag = flagId;
		dataInfo.price1 = price1;
		dataInfo.price2 = price2;
		dataInfo.listArr = listArr;
		detailList.insertHtmlStr(dataInfo, $("#maincontent").html(), {lastIndex: atpage});	

		if((e.target == t.find('.store-name')[0]) || (e.target == t.find('.goshop')[0]) || (e.target == t.find('.spos')[0]) || (e.target == t.find('.stHref')[0])){
			setTimeout(function(){location.href = storeUrl;}, 500);
		}else{
			setTimeout(function(){location.href = detailUrl;}, 500);
		}
		


	})

	// 下拉加载
	var isload = false;
	$(document).ready(function() {
		$(window).scroll(function() {
			var allh = $('body').height();
			var w = $(window).height();
			var scroll = allh - w;
			if ($(window).scrollTop() + 100 > scroll && !isload) {
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

		//如果进行了筛选或排序，需要从第一页开始加载
		if(tr){
			atpage = 1;
			$(".list-box ul").html("");
		}

		$(".list-box .loading").remove();
		$(".list-box").append('<div class="loading">'+langData['siteConfig'][20][184]+'...</div>');

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

		// 商品类别
		var typeid = $('.choose-tab li').eq(0).attr('data-id');
		if(typeid != undefined && typeid != ''){
			data.push("typeid="+typeid);
		}
		//服务/折扣
		var flagId = $('.discount a.curr').attr('data-flag');
		if(flagId != undefined && flagId != ''){
			data.push("flag="+flagId);
		}

		// 价格
		var price1 = $('.drop-range .price1').val();
		var price2 = $('.drop-range .price2').val();
		if(price1 || price2){
			data.push("price="+price1+','+price2);
		}
		var keywords = $('#keywords').val();
		if(keywords != null && keywords != ''){
			data.push("title="+keywords);
		}
        if(image){
            data.push('image='+image);
        }
		$.ajax({
			url: "/include/ajax.php?service=shop&action=slist&limited=0",
			data: data.join("&"),
			type: "GET",
			dataType: "jsonp",
			success: function (data) {
				if(data){
					if(data.state == 100){
						$(".list-box .loading").remove();
						var list = data.info.list, lr, html = [];
						if(list.length > 0){
							for(var i = 0; i < list.length; i++){
								lr = list[i];
								var pic = lr.litpic == false || lr.litpic == '' ? '/static/images/blank.gif' : lr.litpic;
								var specification = lr.specification

								html.push('<li class="fn-clear" data-id="'+lr.id+'">');

								html.push('<div class="img-box">');
								html.push('<a href="javascript:;" data-url="'+lr.url+'" class="detHref">');
								html.push('<img src="'+pic+'" alt="">');
								html.push('</a></div>');
								html.push('<div class="txt-box">');
								html.push('<h3>'+lr.title+'</h3>');
								var xsq = ''
								if(lr.panic==1){
									xsq ='<span class="xsq">'+langData['shop'][6][37]+'</span>'//限时必抢
								}
								html.push(xsq);
								html.push('<div class="txt-price">');
								var freeTxt='';
								if(lr.logistic==113 || lr.logistic==114){
									freeTxt ='<span class="freeBy">'+langData['shop'][6][20]+'</span>'//包邮
								}
								var priceArr=lr.price.split('.');
								html.push('<span class="sprice">'+echoCurrency('symbol')+'<strong>'+priceArr[0]+'</strong><em>.'+priceArr[1]+'</em></span>'+freeTxt+'<span class="sellnum">'+lr.sales+langData['shop'][3][0]+'</span> ');//已售
								html.push('</div>');
								html.push('<div class="txt-info"><a href="javascript:;" data-url="'+lr.storeurl+'" class="stHref">');
								html.push('<span class="store-name">'+lr.storeTitle+'</span>');
								html.push('<span class="goshop"> '+langData['shop'][6][36]+'<s></s></span>');//进店
								html.push('<span class="spos">'+lr.addr+' </span>');
								html.push('</a></div>');
								html.push('</div>');
								html.push('</li>');

								listArr[lr.id] = lr;
							}

							$(".list-box ul").append(html.join(""));
							isload = false;

							//最后一页
							if(atpage >= data.info.pageInfo.totalPage){
								isload = true;
								$(".list-box").append('<div class="loading">'+langData['siteConfig'][18][7]+'</div>');//已经到最后一页了
							}

						//没有数据
						}else{
							isload = true;
							$(".list-box").append('<div class="loading"><i></i>'+langData['shop'][6][38]+'</div>');//没有符合条件的宝贝
						}

					//请求失败
					}else{
						$(".list-box .loading").html('<i></i>'+langData['shop'][6][38]);//没有符合条件的宝贝
					}

				//加载失败
				}else{
					$(".list-box .loading").html(langData['siteConfig'][20][462]);//加载失败！
				}
			},
			error: function(){
				isload = false;
				$(".list-box .loading").html(langData['siteConfig'][20][227]);//网络错误，加载失败！
			}
		});
	}


	// 本地存储的筛选条件
	function getData() {

		var filter = $.isEmptyObject(detailList.getLocalStorage()['filter']) ? dataInfo : detailList.getLocalStorage()['filter'];
		console.log(filter)
		getParid = filter.parid;
		typeid = filter.parid;
		listArr = filter.listArr;
		atpage = detailList.getLocalStorage()['extraData'].lastIndex;

		// 分类选中状态
		if (filter.typename != '') {$('.choose-tab .typeid span').text(filter.typename);}
		if (filter.typeid != '') {
			$('.choose-tab .typeid').attr('data-id', filter.typeid);
		}

		// 排序选中状态
		if (filter.orderby != "") {
			$('.choose-tab .orderby[data-type="'+filter.orderbyType+'"]').addClass('active').siblings('li').removeClass('active');
			$('.choose-tab .orderby[data-type="'+filter.orderbyType+'"]').attr('data-id',filter.orderby);
		}

		// 筛选选中状态
		if (filter.flag != "") {
			$('.discount a[data-flag="'+filter.flag+'"]').addClass('curr').siblings('a').removeClass('curr')
			
		}
		if (filter.keywords != "") {
			$('#keywords').text(filter.keywords);
		}
		if (filter.price1 != "") {
			$('.drop-range .price1').val(filter.price1);
		}
		if (filter.price2 != "") {
			$('.drop-range .price2').val(filter.price2);
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
