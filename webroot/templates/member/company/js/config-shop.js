var tp_ajax	, sp_ajax , pl_alax ;
var lpage = 0,  ltotalPage = 0, ltotalCount = 0, lload = false ,shopLr = [],choseLr = [];
var uploader_iv;






var showCheckPop = $.cookie('showCheckPop')
var optionsPop = {
	isShow:true,
	title:'您还没有开通商城店铺',
	confirmTip:'请先提交资料',
	popIcon:template + 'images/shop/info_checking.png', // 图片
	popClass:'imgAlertPop',
	noCancel:true,
	btnSure:'我知道了'
}  

if(storeState == '0'){
    optionsPop.title = '您的店铺资料审核中';
    optionsPop.confirmTip = '平台正在尽快审核，请耐心等待！';
}

if(storeState != '0' && storeState != ''){
	var sureHref = '',cancelHref = '';
	if(storeState != '1'){
		optionsPop.title = '店铺资料审核未通过：' + storeRefuse
		optionsPop.confirmTip = '',
		optionsPop.popIcon = template + 'images/shop/noCheck.png';
		optionsPop.btnSure = '修改资料';
		confirmPop(optionsPop);
	
	} else{
		optionsPop.title = '审核通过，快去完善店铺吧~';
		optionsPop.confirmTip = '';
		optionsPop.btnCancelColor = '#347DF6';
		optionsPop.popIcon = template + 'images/shop/info_checkEnd.png';
		optionsPop.noCancel = false;
		optionsPop.btnSure = '完善信息';
		optionsPop.btnCancel = '发布商品';
		sureHref = window.location.href + '?yingye=1'
		cancelHref = managePro;
		if(!showCheckPop || showCheckPop == null){
			$.cookie('showCheckPop', 1 , { 
				expires:30 //设置时间，如果此处留空，则浏览器关闭此cookie就失效。
				});
			confirmPop(optionsPop,function(){
				if(sureHref){
					
					window.location.href  = sureHref
				}
			},function(){
				if(cancelHref){
					window.location.href  = cancelHref
				}
			})	
		}
	}
	
}




if(storeState != '1'){
	$.cookie('showCheckPop', '');
}

// if(storeState == '0'){
	
	
// 	var optionsPop = {
// 		isShow:true,
// 		title:'店铺资料审核中',
// 		confirmTip:'平台正在尽快审核，请耐心等待！',
// 		popIcon:template + 'images/shop/info_checking.png', // 图片
// 		popClass:'imgAlertPop',
// 		noCancel:true,
// 		btnSure:'我知道了'
// 	} 
// 	$(".formTab a").click(function(event){
// 		var href = $(this).attr('href');
// 		event.preventDefault();
// 		if(href.indexOf('yingye=') > -1){
// 			// confirmPop(optionsPop,function(){
// 			// 	window.lo
// 			// },function(){
// 			// 	console.log('取消')
				
// 			// })
// 		}
// 	})
// }



$(function(){
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
                        $('.w-form dd input#contact').css({'padding-left':'10px','width':'205px'});
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


	//选择分类
	$("#selIndustry").delegate("a", "click", function(){
		if($(this).text() != langData['siteConfig'][7][2] && $(this).attr("data-id") != $("#industry").val()){
			var id = $(this).attr("data-id");
			$(this).closest(".sel-group").nextAll(".sel-group").remove();
		}
	});

	//选择区域
	$("#selAddr .sel-group:eq(0) a").bind("click", function(){
		if($(this).attr("data-id") != $("#addrid").val()){
			var id = $(this).attr("data-id");
			$(this).closest(".sel-group").nextAll(".sel-group").remove();
			getChildAddr(id);
		}
	});

	if($("#addrid").val() != ""){
		var cid = 0;
		$("#selAddr .sel-menu li").each(function(){
			if($(this).text() == $("#addrname0").val()){
				cid = $(this).find("a").attr('data-id');
			}
		});
		if(cid != 0){
			getChildAddr(cid, $("#addrname1").val());
		}
	}

	if(shopid && shopid != '0'){
		$(".saleItem ").each(function(){
	        var tcount = $(this).attr('data-count')
	        if(tcount > 0){
	          $(this).addClass('disabled curr');
	          $(this).find('h3').append('<em>（店内相关商品'+tcount+'个）</em>');
	        }else{
	          $(this).find('h3').append('<em>（暂未发布相关商品）</em>');
	        }
	    })
	}
	


	//获取子级区域
	function getChildAddr(id, selected){
		if(!id) return;
		$.ajax({
			url: masterDomain+"/include/ajax.php?service=shop&action=addr&type="+id,
			type: "GET",
			dataType: "jsonp",
			success: function (data) {
				if(data && data.state == 100){
					var list = data.info, html = [];

					html.push('<div class="sel-group">');
					html.push('<button type="button" class="sel">'+(selected ? selected : langData['siteConfig'][7][2])+'<span class="caret"></span></button>');
					html.push('<ul class="sel-menu">');
					for(var i = 0; i < list.length; i++){
						html.push('<li><a href="javascript:;" data-id="'+list[i].id+'">'+list[i].typename+'</a></li>');
					}
					html.push('</ul>');
					html.push('</div>');

					$("#addrid").before(html.join(""));
					if(!selected){
						$("#addrid").val(0);
						$("#addrid").closest("dd").find(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+langData['siteConfig'][20][68]);
					}

				}
			}
		});
	}

	//地图标注
	var init = {
		popshow: function() {
			var src = "/api/map/mark.php?mod=shop",
					address = $("#address").val(),
					lnglat = $("#lnglat").val();
			if(address != ""){
				src = src + "&address="+address;
			}
			if(lnglat != ""){
				src = src + "&lnglat="+lnglat;
			}
			$("#markPopMap").after($('<div id="shadowlayer" style="display:block"></div>'));
			$("#markDitu").attr("src", src);
			$("#markPopMap").show();
		},
		pophide: function() {
			$("#shadowlayer").remove();
			$("#markDitu").attr("src", "");
			$("#markPopMap").hide();
		}
	};

	$(".map-pop .pop-close, #cloPop").bind("click", function(){
		init.pophide();
	});

	$("#mark").bind("click", function(){
		init.popshow();
	});

	$("#okPop").bind("click", function(){
		var doc = $(window.parent.frames["markDitu"].document),
				lng = doc.find("#lng").val(),
				lat = doc.find("#lat").val(),
				address = doc.find("#addr").val();
		$("#lnglat").val(lng+","+lat);
		if($("#address").val() == ""){
			$("#address").val(address).blur();
		}
		init.pophide();
	});

	//2021-12-20 新增选择团购模板等
	//切换模板
	$('.choseTab li').click(function(e){
	    e.stopPropagation();
	    var tindex = $(this).index(),tid = $(this).attr('data-id'),txt = $(this).find('a').text();
	    
	    if(tindex == 1){//电商
	    	//已经发布商品 不可更改
	      	if($('.saleItem.daodian').hasClass('curr') && $('.saleItem.daodian').attr('data-count') > 0){

	          $('.tipAlert').removeClass().addClass('tipAlert changemd');
	          $('.tipAlert h3').html('温馨提示');
	          $('.tipAlert .tipp').html('电商销售模板不支持到店消费类型，如需更改，请先至商品中取消选择到店消费选项。');
	          $('.tipAlert .tipKnow').html('我知道了');
	          $('.tipMask').show();
	          $('.tipAlert').addClass('show');
   
		    }else{//可更改
		        $(this).addClass('active').siblings('li').removeClass('active');
		        $('.choseCon .comCon').eq(tindex).addClass('comshow').siblings('.comCon').removeClass('comshow');
		        $('#shoptype').val(tid);
		        $('.saleItem.daodian').hide();

		    }
	      
	    }else{
	      $(this).addClass('active').siblings('li').removeClass('active');
	      $('.choseCon .comCon').eq(tindex).addClass('comshow').siblings('.comCon').removeClass('comshow');
	      $('#shoptype').val(tid);
	      $('.saleItem.daodian').show();
	    }

	})
	 //商家自配、自提
  	$('.changePs').click(function(){
	    var t = $(this);
	    if(t.hasClass('ndisabled')) return false;

	    var pstype = t.closest('.saleItem').attr('data-id');
	    if(pstype =='2'){//平台配送
		    $('.tipAlert').removeClass().addClass('tipAlert changeToBus');
		    $('.tipAlert h3').html('确定申请同城配送方式改为商家自行配送？');
		    $('.tipAlert .tipp').html('友情提示：审核通过后商家需自行配置配送范围及运费，并为所有相关商品添加运费模板，后续订单配送收入全归商家所有。');
		    $('.tipAlert .tipKnow').html('确定提交审核');
	    }else{

	      	$('.tipAlert').removeClass().addClass('tipAlert changeToPt');
		    $('.tipAlert h3').html('确定向平台申请提供同城配送服务？');
		    $('.tipAlert .tipp').html('我们将尽快审核通过，为您接入平台骑手配送服务平台配送省时省心 为您的商品提供多一种可能！');
		    $('.tipAlert .tipKnow').html('确定申请');
	    }
	    $('.tipMask').show();
	    $('.tipAlert').addClass('show');
  	})
  	//关闭弹窗
  	$('.tipAlert .tipClose').click(function(){
  		$('.tipMask').hide();
	    $('.tipAlert').removeClass('show');
  	})
  	//确定更改销售类型
	$('.tipAlert .tipKnow').click(function(){
		$.ajax({
			url: masterDomain+"/include/ajax.php?service=shop&action=editPeisong&id="+shopid,
			type: 'post',
			dataType: 'json',
			success: function(data){
				var par = $('.tipAlert');
				if(par.hasClass('changemd')){//改模板的提示

				}else if(par.hasClass('changeToBus')){//改为商家配送
					$('.changePs').addClass('ndisabled').html('已申请商家自配，请等待审核');
				}else{//改为平台配送
					$('.changePs').addClass('ndisabled').html('已申请平台配送，请等待审核');
				}
				$('.tipMask').hide();
				$('.tipAlert').removeClass('show');
			},
			error: function(data){
				showErrAlert(data.info);
			}
		});
  	})
  	//选择销售类型
  	$('.saleWrap .saleItem label').click(function(){
    	var par = $(this).closest('.saleItem')
    	if(par.hasClass('disabled')) return false;
    	par.toggleClass('curr');
  	})
  	//模板选完之后的下一步
	$('.nextStep').click(function(){
	    if($('.saleWrap .saleItem.curr').size() == 0){
	      $.dialog.alert('请选择销售类型!');
	      return false;
	    }
	    showChange();
	    $('#modpage').addClass('fn-hide');
	    $('#shopConfig').removeClass('fn-hide');
	})

	//刚进页面时的 已经配置过模板的销售类型
	if($('.saleWrap .saleItem.curr').size() > 0){
		showChange();
	}
	function showChange(){
		if($('#shoptype').val() == 2){//电商销售
	        $('.saleWrap .saleItem.daodian').removeClass('curr');
	        $('.pro1 .modname').html('电商销售模板');
	        $('.yyday,.serBox').addClass('fn-hide');//营业日 设施
	        $('.yytime dt').html('<span>*</span>客服在线：');
	        $('.advSee.ymo').attr('data-type','2');
	        $('.advSee.ypc').attr('data-type','3');
	        $('.zyProj').removeClass('fn-hide');//主营项目
	        // $(".detailAddress").removeAttr('data-required')
	        // $(".detailAddress .point").remove()
	    }else{
	    	// $(".detailAddress").attr('data-required',1)
	    	// $(".detailAddress dt").prepend('<span class="point">*</span>')
	    	$('.pro1 .modname').html('本地团购模板');
	    	$('.yyday,.serBox').removeClass('fn-hide');//营业日 设施
	    	$('.yytime dt').html('<span>*</span>营业时间：');
	    	$('.advSee.ymo').attr('data-type','0');
	        $('.advSee.ypc').attr('data-type','1');
	        $('.zyProj').addClass('fn-hide');//主营项目
	    }
	    var tarr=[],tnamearr=[];
	    $('.saleWrap .saleItem.curr').each(function(){
	      var tid = $(this).attr('data-id');
	      var tname = $(this).find('h3 strong').text();
	      tarr.push(tid);
	      tnamearr.push('【'+tname+'】');
	    })
	    $('#typesales').val(tarr.join(','));
	    $('.pro1 .salename').html(tnamearr.join(' '));
	}

	//修改配置
	$('.changeMod').click(function(){
		$('#modpage').removeClass('fn-hide');
		$('#shopConfig').addClass('fn-hide');
	})

	//时间
	var selectDate = function(el, func){
		WdatePicker({
			el: el,
			isShowClear: false,
			isShowOK: false,
			isShowToday: false,
			qsEnabled: false,
			dateFmt: 'HH:mm',
			onpicked: function(dp){
				$(".timelist .tip-inline").removeClass().addClass("tip-inline success").html("<s></s>");
			}
		});
	}
	$(".timelist").on('focus','input.startime',function(){
		$(".timelist input").removeAttr('id')
		$(this).attr('id','openStart')
		selectDate("openStart");
	});
	$(".timelist").on('focus','input.stoptime',function(){
		$(".timelist input").removeAttr('id')
		$(this).attr('id','openEnd')
		selectDate("openEnd");
	})

	$(".addtime").click(function(){
		var t = $(this);
		$(".timelist input").removeAttr('id');
		t.before('<div class="input-append input-prepend"><input type="text" class="startime" class="inp"  size="5" maxlength="5" autocomplete="off" value="00:00"><span class="add-aft">到</span><input type="text" class="stoptime" class="inp" size="5" maxlength="5" autocomplete="off" value="23:00"><s class="del_time"></s></div>');
		var tlen = $(".timelist .input-append").length
		if(tlen == 3){
			$(".addtime").hide();
			// $.dialog.alert('最多只能添加3个哦~')
   //        	return false;
		}
		
	});

    $('body').delegate('.del_time','click',function(){
        var t = $(this);
        t.closest('.input-prepend').remove();
        var tlen = $(".timelist .input-append").length
		if(tlen < 3){
			$(".addtime").show();
		}
    })

    //查看示例
	$('.advSee').click(function() {
	    var ttype = $(this).attr('data-type');
	    $('.caseImg img').removeClass('show');
	    $('.caseImg img[data-type="'+ttype+'"]').addClass('show');
	    $('.case_mask').show();
	    $('.caseWrap').addClass('show');
	});

	// 隐藏
	$('.case_mask,.caseAlert .close_case').click(function() {
	    $('.case_mask').hide();
	    $('.caseWrap').removeClass('show');
	});

	// 选择商品
	$('.choseLi').click(function(){
		$('.mask_pl').show();
		$('.link_pro').show();
		if($('.pro_box').find('.pro_li').size()==0){
			lpage = 1
			get_prolist()
		}
	})
	// 到底加载
	$('.pro_box ul').scroll(function(){

		if ($('.pro_box').scrollTop() >= $('.pro_box>ul').height() - $('.pro_box').height() - 50 && !lload && lpage < ltotalPage)
		{
		  lpage++;
		  get_prolist();
		}
	});

	// 隐藏
	$('.mask_pl,.link_pro .cancel_btn').click(function() {
		$('.mask_pl').hide();
		$('.link_pro').hide();
		$(".pro_box li").each(function(){
		  	var t = $(this);
		  	id = t.attr('data-id');
		  	var idChose =  $("#goodsId").val();
			if(idChose.indexOf(id) <= -1){
			    t.removeClass('selected')
		  	}
		})
	});



	// 选择商铺
	var allSelect = [];
	$('.pro_box').delegate('li','click',function(){
		var t = $(this),tstate = t.attr('data-hdstate');
	    var clen = $('.pro_box li.selected').length;
        
	    if(!t.hasClass('selected')){
            if(clen >= 5){
                showErr('最多可选5件活动商品~');
                return false;
            }
	      	if($('.pro_li.selected[data-hdstate="3"]').length > 0){//选了砍价
	        	if(tstate == 3){
                    showErr('砍价商品最多可选1件~');
                    return false;
                }
	     	}
	    }

        t.toggleClass('selected');
	});
	// 显示错误
	function showErr(txt){
	  $('.errorTip').text(txt).show();
	  setTimeout(function(){
	    $('.errorTip').fadeOut();
	  }, 2000)
	}

	$('.btnbox .sure_btn').click(function(){
		var selectArr = [];
		$('.goodlist li.goodLi').remove();
	    choseLr=[];
        choseLrIds = [];
	    $('.pro_box li.selected').each(function(){

	      	var tid = $(this).attr('data-id');
	      	selectArr.push(tid);
	        for(var s = 0;s<shopLr.length;s++){
	          if(shopLr[s].id == tid && !choseLrIds.includes(tid)){
	            choseLr.push(shopLr[s]);
                choseLrIds.push(tid);
	          }
	        }

	    })

		var html = [];
	    for(var i = 0;i<choseLr.length;i++){

	      html.push('<li data-id="'+choseLr[i].id+'" class="goodLi">');
              html.push('<a href="'+choseLr[i].url+'" target="_blank" title="'+choseLr[i].title+'">');
	          html.push('<div class="goodImg"><img src="'+choseLr[i].litpic+'" alt=""></div>');
	          html.push('<p>'+choseLr[i].title+'</p>');
	          html.push('</a>');
	          html.push('<a href="javascript:;" class="goodDel"></a>');
	      html.push('</li>');
	    }

        $('.goodlist .goodLi').remove();
	    $('.choseLi').before(html.join(""));
	    if(choseLr.length > 0){
	      	$('.choseLi').addClass('hasGoods');
	      	$('.choseGoods').html('选择商品');
	    }else{
	    	$('.choseLi').removeClass('hasGoods');
	    	$('.choseGoods').html('请选择活动商品');
	    }

		$("#goodsId").val(selectArr.join(','))
		$('.link_pro .cancel_btn').click();
	})

  	//删除爆热商品
	$('.goodlist').delegate('.goodDel', 'click', function() {
	    var par =$(this).closest('.goodLi'),sid = par.attr('data-id');
	    par.remove();
	    $('.pro_li[data-id="'+sid+'"]').removeClass('selected');
	    if($('.goodlist li.goodLi').length == 0){
	      $('.choseLi').removeClass('hasGoods');
	      $('.choseGoods').html('请选择活动商品');
	    }
        var idArr = $("#goodsId").val().split(',');
        newIds = idArr.filter(element => element !== sid);
        $("#goodsId").val(newIds.join(','));
	})

	var isclick = 0;
	// 固定 链接定位
	$('.main').scroll(function(){
		if(yingye == 1){

			for(var i=0; i<$('.compage').length; i++){
				var scroll = $('.compage').eq(i).position().top;
				if($('.main').scrollTop() >=(scroll)-100 && !isclick){
					$('.formTab li').eq(i).addClass('active').siblings('li').removeClass('active');
				}

			}
		}
	});
	$('.formTab li').click(function(){
		isclick = 1;
		var  t = $(this);
		t.addClass('active').siblings('li').removeClass('active');
		var index = t.index();
		var scroll = $('.compage').eq(index).position().top-60;
		$('.main').animate({scrollTop:scroll}, 300);
		setTimeout(function(){
			isclick = 0;
		},300)
	});

	function get_prolist(){
	  	if(pl_alax){
	  		pl_alax.abort();
	  	}
	  	var type = $('.pro_box ul').attr('data-type');
	    var idArr = $("#goodsId").val().split(',')
	    //var editArr = hasChosed.split(',')
	  	lload = true;

	  	var data = [];
	  	data.push('page='+lpage);
	  	url = '/include/ajax.php?service=shop&action=proHuodongList&u=1&add=1&pageSize=20&'+data.join('&');
	  	$('.pro_box ul .loading').remove();
	  	$('.pro_box ul').append('<div class="loading"><span>加载中~</span></div>');
	  	pl_alax = $.ajax({
	  		url: url,
	  		type: "GET",
	  		dataType: "json", //指定服务器返回的数据类型
	  		crossDomain: true,
	  		success: function(data) {
	  			lload = false;
	  			$('.pro_box ul .loading').remove();
	  			if (data.state == 100) {
	  				var list = [],item = data.info.list;
	  				ltotalPage = data.info.pageInfo.totalPage;
	  				ltotalCount = data.info.pageInfo.totalCount;
	  				var label = $('.pro_box ul').attr('data-name');
	  				if(item.length>0){
	  					//$('.link_pro').removeClass('noDatapro');
	  					//$('.search_box').show();
	  					for(var i = 0; i<item.length; i++){
	  						shopLr.push(item[i]);
	  						var chosed = '',editCls = '';
	  						var id = item[i].id;

	              			chosed = idArr.indexOf(id) > -1?'selected': '';
	              			//editCls = editArr.indexOf(id) > -1 ? 'no_change':'';
	  						list.push('<li class="pro_li '+chosed+'" data-id="'+item[i].id+'" data-hdstate="'+item[i].huodongstate+'">');
	              			list.push('<s class="hasChoseIcon"></s>')
	  						list.push('<a href="javascript:;">');
	  						list.push('<div class="left_proimg">');
	  						list.push('<img data-url="'+item[i].litpic+'" src="'+item[i].litpic+'" />');
	  						list.push('</div>');
	  						list.push('<div class="right_info">');
	  						list.push('<h2>'+item[i].title+'</h2>');
	  						var hdtxt='';
				            if(item[i].huodongstate == 1){
				                hdtxt='<span class="qgou">限时抢购</span>'
				            }else if(item[i].huodongstate == 2){
				                hdtxt='<span class="msha">低价秒杀</span>'
				            }else if(item[i].huodongstate == 3){
				                hdtxt='<span class="kanjia">砍价狂欢</span>'
				            }else if(item[i].huodongstate == 4){
				                hdtxt='<span class="tuan">拼团</span>'
				            }
	  						list.push('<p class="price">'+hdtxt+echoCurrency('symbol')+item[i].huodongprice+'</p>');

	  						list.push('</div>');
	  						list.push('</a>');
	  						list.push('</li>');

	  					}
	  					if(lpage==1){
	  						$('.pro_box ul').html(list.join(''));
	  					}else{
	  						$('.pro_box ul').append(list.join(''));
	  					}

	  					// $('.pro_box ul img').scrollLoading(); //懒加载
	  				}else{
	  					if(ltotalPage < lpage && lpage > 0){

	  						$('.pro_box ul').append('<div class="noData loading"><p>已经到底啦！</p></div>')
	  					}else{
	  						//$('.link_pro').addClass('noDatapro');
	  						//$('.search_box').hide();
	  						$('.pro_box ul').html('<div class="loading"><div class="emptyImg"></div><h2>暂无合适的商品</h2><p>您还没有正在参加活动的商品，请先报名活动</p></div>')   /* 暂无符合条件的商品哦~*/
	  					}
	  				}

	  			} else {
	  				//$('.link_pro').addClass('noDatapro');
	  				//$('.search_box').hide();
	  				$('.pro_box ul').html('<div class="loading"><div class="emptyImg"></div><h2>暂无合适的商品</h2><p>您还没有正在参加活动的商品，请先报名活动</p></div>')  /* 暂无符合条件的商品哦~*/
	  			}
	  		},
	  		error: function(err) {
	  			console.log('fail');
	  			$('.pro_box ul').html('<div class="loading">网络错误，加载失败</div>');

	  		}
	  	});

  	}

	var count = 10;
	$('.filePickerBox').each(function(i){
		var ind = 3;
		var fileCount = 0,$list = $("#listSection"+ind),picker = $("#filePicker"+ind);

		// 初始化Web Uploader
			uploader_iv = WebUploader.create({
				auto: true,
				swf: pubStaticPath + 'js/webuploader/Uploader.swf',
				server: server_image_url,
				pick: '#filePicker'+ind,
				fileVal: 'Filedata',
				accept: {
					title: ind == 3 ?'Images':'Video',
					extensions: ind == 3 ?'gif,jpg,jpeg,bmp,png':'mp4,wmv,mov,3gp,rmvb,mkv,flv,asf',
					mimeTypes: ind == 3 ?'.gif,.jpg,.jpeg,.png':'.mp4,.mov'
					// title: 'Images',
					// extensions: 'gif,jpg,jpeg,bmp,png',
					// mimeTypes: 'image/*'
				},
	      chunked: true,//开启分片上传
	            // threads: 1,//上传并发数
				fileNumLimit:  ind == 3?count:1,
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
				if(fileCount == count){
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
				      if(fileCount == count && count == 1){
				        $(this.options.pick).closest('.wxUploadObj').hide();
				  			return false;
				  		}
					}

					var video = $li.find("video");
					if(video.length > 0){
						video.attr("data-val", response.url).attr("data-url", response.turl).attr("src", response.turl);
						$li.find(".enlarge").attr("href", response.turl);
						// if(fileCount == count && count == 1){
							$(this.options.pick).closest('.btn-section').hide();
							return false;
						// }
					}


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
			});
			//删除已上传的文件
			function delFile(b, d, d, c) {
				var type = "delVideo"
				if(d == 'image'){
					type = 'delImage'
				}
				var g = {
					mod: "shop",
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
					var $li = $('<div id="' + file.id + '" class="pubitem"><a href="" target="_blank" title="" class="enlarge"><img></a><a class="li-rm" href="javascript:;"><span>删除</span></a><span class="setMain">设为主图</span><span class="mainImg">主图</span></div>');//删除图片
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
					var $li = $('<div id="' + file.id + '" class="pubitem videoItem"><a href="javascript:;" target="_blank" title="" class="enlarge"><video></video></a><a class="li-rm" href="javascript:;"><span>删除</span></a></div>');//删除图片
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
					if(count == fileCount){
						$(".wxUploadObj").hide()
					}
				}
			}

	})


	// 设为主图
	$("body").delegate('.setMain', 'click', function(event) {
		var t = $(this);
		var li = t.closest('.pubitem');
  		$("#listSection3").prepend(li)

	});


	// 审核中不能修改
	$(".sidebar-content .item.active dd a,.formTab a").click(function(){
		if(checkState != '1'){
			var href = $(this).attr('href');
			var str = checkState == '0' ? langData['siteConfig'][27][25] : langData['siteConfig'][27][26];
			alert(str)
			return false;
		}
	})


		//提交发布
	$('.submit').bind('click',function(event){
		event.preventDefault()
		// 确定修改
		var t = $(this)
		if(shopid && shopid != '0' && editModuleJoinCheck == '0' && !yingye){
			var options = {
				isShow:true,
				title:'温馨提示',
				confirmTip:'提交店铺资料修改后，店铺会进入平台审核状态，店内商品将暂停销售，进行中订单仍可正常处理。店铺资料审核通过后即可恢复正常！'
			}
			confirmPop(options,function(){
				submit(t)
			},function(){
				console.log('取消')
            	return false
			})
		}else{
			submit(t)
		}
	})


	


	function submit(t){
        if($('#cityid').size() > 0){
            $('#addrid').val($('#selAddr .addrBtn').attr('data-id'));
            var addrids = $('#selAddr .addrBtn').attr('data-ids').split(' ');
            $('#cityid').val(addrids[0]);
        }
		// var t           = $(this),
			var	industry    = $("#industry"),
				addrid      = $("#addrid"),
				company     = $("#company"),
				title       = $("#title"),
				referred    = $("#referred"),
				address     = $("#address"),
				logo      = $("#logo"),
				people      = $("#people"),
				contact     = $("#contact"),
				tel         = $("#telphone");
		var shoptype = $('#shoptype').val();
		if(t.hasClass("disabled")) return;

		var offsetTop = 0;

		//行业
		if(industry.size() > 0 && ($.trim(industry.val()) == "" || industry.val() == 0)){
			industry.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+langData['shop'][4][41]);
			offsetTop = offsetTop == 0 ? $("#selIndustry").position().top : offsetTop;
		}

		//店铺名称
		if(title.size() > 0 && ($.trim(title.val()) == "" || title.val() == 0)){
			title.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+langData['siteConfig'][21][128]);
			offsetTop = offsetTop == 0 ? title.position().top : offsetTop;
		}

		//logo
		if(logo.size() > 0 && ($.trim(logo.val()) == "" && offsetTop == 0)){
			$.dialog.alert(langData['shop'][4][45]);
			offsetTop = offsetTop == 0 ? title.position().top : offsetTop;
		}


		//区域
		if(addrid.size() > 0 && ($.trim(addrid.val()) == "" || addrid.val() == 0)){
			addrid.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>请选择所在区域");
			offsetTop = offsetTop == 0 ? addrid.position().top : offsetTop;
		}


		//地址
		if(address.size() > 0 && shoptype && ($.trim(address.val()) == "" || address.val() == 0)){
			address.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+langData['siteConfig'][20][69]);
			offsetTop = offsetTop == 0 ? address.position().top : offsetTop;
		}

		if(yingye == 1){

			//商家图集
			var imgList = [],litpic   = '';
			$("#listSection3 .pubitem").each(function(i){
		      var val = $(this).find('img').attr('data-val');
		      if(i == 0){
		        litpic = val;
		      }else{
		        imgList.push(val+'||');
		      }
		    })
		    $('#litpic').val(litpic);
		    $("#imglist").val(imgList.join('###'));
			
			//本地团购
			if(shoptype == 1){
				//营业日
				var ids = [];
			    $(".yyday input:checked").each(function(){
			        ids.push($(this).val());
			    })
			    $("#openweek").val(ids.join(','))
				if($("#openweek").val() == ''){
					$(".yyday .tip-inline").removeClass().addClass("tip-inline error").html("<s></s>请选择营业日");
					offsetTop = offsetTop == 0 ? $(".yyday").position().top-60 : offsetTop;
				}else{
					$(".yyday .tip-inline").removeClass().addClass("tip-inline success").html("<s></s>");
				}
			}
			var timeArr = [];
		    $(".timelist .input-append").each(function(){
		      var timeStart = $(this).find('.startime').val();
		      var timeStop = $(this).find('.stoptime').val();

		      timeArr.push(timeStart+'-'+timeStop);
		    })

		    $("#limitTime").val(timeArr.join('||'))

		    //营业时间/客服在线
		    if($("#limitTime").val() == ''){
		    	//本地团购
		    	var yytxt = '请添加客服在线时间段'
		    	if(shoptype == 1){
		    		yytxt = '请添加营业时间段'
		    	}
		    	$(".yytime .tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+yytxt);
				offsetTop = offsetTop == 0 ? $(".yytime").position().top-60 : offsetTop;
		    }else{
				$(".yytime .tip-inline").removeClass().addClass("tip-inline success").html("<s></s>");
			}



			//客服电话
			if($.trim(tel.val()) == "" || tel.val() == 0){
				tel.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+langData['shop'][4][47]);
				offsetTop = offsetTop == 0 ? $(".yytime").position().top-60 : offsetTop;
			}

			if($('.uploadVideo').find('video').size() > 0) {
	            $('#video').val($('.uploadVideo').find('video').attr('data-val'));
	        }
		}

		



		if(offsetTop){
			$('.main').animate({scrollTop: offsetTop + 10}, 300);
			return false;
		}


        //商家资质
        var rflag = 0;
        $('.qualityBox dl').each(function(){
            var imgf =$(this).find('.pubitem')
           var inptxt = $(this).attr('data-title');
           var inpval =imgf.find('img').attr('data-val');
           $(this).find('.compinut').val(inpval);
          if($(this).attr('data-required') == 1 && !inpval){//平台要求验证
            $.dialog.alert(inptxt);
            rflag =1;
            offsetTop = $('.qualityBox').position().top
            $('.main').animate({scrollTop: offsetTop - 60}, 300);
            return false;
          }
        })
        if(rflag) return;
        
		var zizhiArr=[]
	    $('.qualityBox dl').each(function(){
	      var cominp = $(this).find('.compinut');
	      var tid = cominp.attr('data-id'),tname = cominp.attr('data-name');
	      // var timg = cominp.val();
	      var timg = '';
	      if(cominp.siblings('ul.listSection').find('li.pubitem').length > 0){
	      	var img = cominp.siblings('ul.listSection').find('li.pubitem img')
		      timg = img.attr('data-val');
	      }
	      zizhiArr.push({'id':tid,'typename':tname,'image':timg})
	    })

	    //移动端主页广告
	    var moimglist = [];
	    $(".moggbox .pubitem").each(function(){
	        var x = $(this),
	            url = x.find('img').attr("data-val"),
	            name = x.find('.i-name').val(),
	            link = x.find('.i-link').val();
	        if (url != undefined && url != '') {
	            moimglist.push(url+'###'+name+'###'+link);
	        }
	    });
	    $("#moimglist").val(moimglist.join('||'));
	    //pc端主页广告
	    var pcimgList = [];
	    $(".pcggbox .pubitem").each(function(){
	        var x = $(this),
	            url = x.find('img').attr("data-val"),
	            name = x.find('.i-name').val(),
	            link = x.find('.i-link').val();
	        if (url != undefined && url != '') {
	            pcimgList.push(url+'###'+name+'###'+link);
	        }
	    });
	    $("#pcimglist").val(pcimgList.join('||'));

	     //爆热商品
	    var idlist =[];
	    $('.goodlist .goodLi').each(function(){
	      var tid = $(this).attr('data-id');
	      idlist.push(tid);
	    });
	    $("#goodsId").val(idlist.join(','));

	    //设施服务
	    var tagids = [];
	    $(".serBox input:checked").each(function(){  
	      tagids.push($(this).val());    
	    })
	    $('#tags').val(tagids.join(','))

	    
		var form = $("#fabuForm"), action = form.attr("action");
        if($('.qualityBox').size() > 0){
            var data = form.serialize()+'&authattrparam='+JSON.stringify(zizhiArr);
        }else{
            var data = form.serialize();
        }
		t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");
		var strData = '';
		if(yingye == '1'){
			strData = '&updateStore=1'
		}
		$.ajax({
			url: action + strData,
			data: data,
			type: "POST",
			dataType: "json",
			success: function (data) {
				if(data && data.state == 100){

					$.dialog({
						title: langData['siteConfig'][19][287],
						icon: 'success.png',
						content: data.info,
						ok: function(){}
					});
					t.removeClass("disabled").html(langData['siteConfig'][6][63]);

				}else{
					$.dialog.alert(data.info);
					t.removeClass("disabled").html(langData['siteConfig'][6][63]);

				}
			},
			error: function(){
				$.dialog.alert(langData['siteConfig'][20][183]);
				t.removeClass("disabled").html(langData['siteConfig'][6][63]);
			}
		});
	}
});
