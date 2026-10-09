$(function(){

    //APP端取消下拉刷新
    toggleDragRefresh('off');

	var listArr = [];
	//判断是否有广告
  	if($(".advbox .siteAdvObj").length == 0){
      $(".advbox").remove();
    }
    //商家广告位
    new Swiper('.advbox .swiper-container', {pagination: {el: '.advbox .swiper-pagination',type: 'fraction',} ,autoplay: true,loop: true,grabCursor: true,paginationClickable: true,
  	});
  //商品属性选择
  var SKUResult = {};  //保存组合结果
  var mpriceArr = [];  //市场价格集合
  var priceArr = [];   //现价集合
  var totalStock = 0;  //总库存
  var skuObj = $(".size-box .size-count"),
      mpriceObj = $(".size-box .size-selected .price .mprice"),          //原价
      priceObj = $(".size-box .size-selected p.price b"),    //现价
      stockObj = $(".size-box .count b"),                   //库存
      disabled = "disabled",                               //不可选
      selected = "selected";                               //已选



  // new Swiper('.shop_container.swiper-container');
	// 店铺首页
  $('.shoptab li').click(function() {
		$(this).addClass('active').siblings().removeClass('active')
		var index = $(this).index();
		$('.shopcon').eq(index).addClass('show').siblings().removeClass('show');
  });

/**************20210524新增****************/
// 倒计时
if($('.cutTime').size() > 0){
	var timer = setInterval(function(){
	  $('.cutTime').html( timerCut())
	},1000)
}

function timerCut(){
  var timenow = new Date();
			timenow = timenow.valueOf();
  			var ktime = $('.kanjiaBox').attr('data-ktime');
  			var etime = $('.kanjiaBox').attr('data-etime');
  			var txt = '';
  			var timeEnd = 0;
  			if(ktime*1000 > timenow){
              timeEnd = ktime;
              txt = '距开始'
            }else {
              timeEnd = etime;
              txt = '距结束'
            }
  			if(ktime*1000 > timenow){
              $('.kj_img label').text('即将开始')
            }else{
              $('.kj_img label').text('即将结束')
            }
			timeEnd = timeEnd*1000;
			timeCount = parseInt((timeEnd - timenow)/1000)

			if(timeCount < 0){
				clearInterval(timer)
				return;
			}
			var time = timeCount;
			var d = parseInt(time / (60 * 60 * 24));
			var h = parseInt(time / 60 / 60 % 24);
			var m = parseInt(time / 60 % 60);
			var s = parseInt(time % 60);
      var html = txt+'<span class="hh">'+(h>9?h:'0'+h)+'</span><em>:</em><span class="mm">'+(m>9?m:'0'+m)+'</span><em>:</em><span class="ss">'+(s>9?s:'0'+s)+'</span>'
			return html;
}



// 领券滑动
if($(".quanbox li").length > 1){
  new Swiper('.quanbox.swiper-container',{
    slidesPerView: 'auto',
  });
}

if($(".baoreBox .swiper-slide").length > 1){
  new Swiper('.baoreBox.swiper-container',{
    pagination: {
        el: '.pagination',
        type: 'progressbar',
      },
  });
}

$('.shopMask').click(function(){
	$('.shopDetailBox').css('transform',"translateY(100%)");
    setTimeout(function(){
      $(".shopMask,.shopDetailBox").hide();
      $('html').removeClass('noscroll')
    },300)
})
var pageSwiper= new Swiper('.shop_container.swiper-container',{
  autoHeight: true, //高度随内容变化
  observer:true,
  observeParents:true,
  on:{
    slideChangeTransitionStart: function(){
      
      if(this.activeIndex == 1){//分类
      	$(".tabbox li").eq(2).addClass('on').siblings('li').removeClass('on');
        $('body').removeClass('probox_show').addClass('fLbox_show');

      }else{
      	if($('.tabbox li.tton').size() > 0){
      		$(".tabbox li.tton").addClass('on').siblings('li').removeClass('on');
      	}else{
      		$(".tabbox li").eq(0).addClass('on').siblings('li').removeClass('on');
      	}
      	
        $('body').removeClass('fLbox_show').addClass('probox_show');
      }
    },
  }
});


// 查看全部商品
var isClick = 0;
$(".tabbox li").click(function(){
  var t = $(this),ind = t.index(),theadTop;
  if(ind == 2){//分类
  	pageSwiper.slideTo(1);
  	pageSwiper.updateAutoHeight(500);

  }else{ //推荐 -- 商品
  	t.addClass("on tton").siblings("li").removeClass("on tton");
  	if($('body').hasClass('probox_show')){
  		isClick = 1; //关闭滚动监听
	    if((device.indexOf('huoniao_iOS') > -1) && !(window.__wxjs_environment == 'miniprogram')){
	      theadTop = $(".bigWrap:eq("+ind+")").offset().top - 160;
	    }else{
	      theadTop = $(".bigWrap:eq("+ind+")").offset().top - 80;
	    }
	    
	    $(window).scrollTop(theadTop);
	    setTimeout(function(){
	      isClick = 0;//开启滚动监听
	    },500);
  	}else{//从分类页切换过来
  		pageSwiper.slideTo(0);
  		setTimeout(function(){
  			$(".tabbox li").eq(1).click();	
  		},500)
  	}
    

  }
})
//分类页--查看全部商品
$('.tjProlist .seeAll').click(function(){
	$(".tabbox li").eq(1).click();	
})
//底部全部商品
$('.bottom_box ul li.posBus').click(function(){
	$(".tabbox li").eq(1).click();	
})

//底部分类
$('.bottom_box ul li.telBus').click(function(){
	$(".tabbox li").eq(2).click();	
})


// 显示店铺详情
var swiperImg;
$(".spbox .shop_detail").click(function(){
  $(".shopMask,.shopDetailBox").show();
  $('html').addClass('noscroll')
  $('.shopDetailBox').css('transform',"translateY(0)");
  if(!swiperImg){
    // 店铺介绍的图片
    swiperImg = new Swiper('.bannerBox.swiper-container',{
      pagination: {
        el: '.img_page',
        type: 'fraction',
      },
    });
  }
  setTimeout(function(){
    $('.shopDetailBox').css('transform',"none");
  },300)
})


// 查看所有商品
$('.shopDetailBox').click(function(e){
  if(e.target == $('.shopDetailBox')[0]){
    $('.shopDetailBox').css('transform',"translateY(100%)");
    setTimeout(function(){
      $(".shopMask,.shopDetailBox").hide();
      $('html').removeClass('noscroll')
    },300)
  }
})
$(".btn_to_pro").click(function(){

  $(".tabbox li").eq(1).click();
  $('.shopDetailBox').click()
})
/**************20210524新增****************/
	//点击头部搜索
	$('.searchbox').click(function(){
		$('.searchbox input').focus();
		$(this).addClass('hasClick');
		$(this).siblings('ul').addClass('speHide');
	})

	$('.searchbox input').blur(function(){
		var tval = $(this).val();
		if(tval == ''){
			$('.searchbox').removeClass('hasClick');
			setTimeout(function(){
				$('.searchbox').siblings('ul').removeClass('speHide');
			},400)
		}
	})
	//搜本店
	$('.souStore').click(function(e){
		e.stopPropgation();
		$('.searchbox').submit();
		return false;
	})




    // 安心购弹框
	$('.sbotop').delegate('.bzjcon', 'click', function(event) {
		$.smartScroll($('.modal-public'), '.modal-main');
	    $('html').addClass('nos');
	    $('.m-bzj').addClass('curr');
	    return false;
	});

	// 关闭
	$(".modal-public .modal-main .close").on("click",function(){
	    $("html, .modal-public").removeClass('curr nos');
	    return false;
	 })
	$(".bgCover").on("click",function(){
	    $("html, .modal-public").removeClass('curr nos');
	})

	// 关注
	 $('.btn-care').click(function(){
        var t = $(this), type = t.hasClass("cared") ? "del" : "add";
        var userid = $.cookie(cookiePre+"login_user");
	    if(userid == null || userid == ""){
	      location.href = masterDomain + '/login.html';
	      return false;
	    }
	    if(type == 'add'){
	    	$(".collectBus").addClass('cared niceIn');
		     setTimeout(function() {
	           $(".collectBus").removeClass('niceIn');
	        }, 500)
	    }
      	$.post("/include/ajax.php?service=member&action=collect&module=shop&temp=store-detail&type="+type+"&id="+storeid,function(data,status){
          if(type == 'add'){
            $('.btn-care').addClass('cared').html('已关注');
            $(".collectBus a p").text('已关注')
            $(".collectBus").addClass('cared')
          }else{
            $('.btn-care').removeClass('cared').html('关注');
            $(".collectBus a p").text('关注商家')
            $(".collectBus").removeClass('cared')
          }
          if(status == 'success' && type == 'add'){
            $('.sc_tip').addClass('show');
            setTimeout(function(){
              $('.sc_tip').removeClass('show');
            },3500)
          }
        });
    });

	 $(".collectBus").click(function(){
	 	$('.btn-care').click()
	 })


  $('.shai_tab').delegate('li', 'click', function() {
  	  var $t = $(this), index = $t.index();
      if(index != 3 && $t.hasClass('on_chose')) return false;
      $t.addClass('on_chose').siblings().removeClass('on_chose');
  	  if (index == 1) {
		      $t.attr("data-id",'1');
  	  }else if(index == 3){
          if($t.hasClass('ord1')){
            $t.removeClass('ord1').addClass('ord2');
			  $t.attr("data-id",'3');
          }else{
            $t.removeClass('ord2').addClass('ord1');
			  $t.attr("data-id",'4');
		  }
  	  }
	  isload = false;
  	  getList(1)
  });

  $('.jumpurl').delegate('li', 'click', function() {
	var url = $(this).data('url');
	location.href = url;
  });

  $("#isearch").click(function(){
	$("#sForm").submit();
  });
  	//拼团未开始倒计时
  	if($('.ptdjs').size() > 0){

	  	var stimes =$('.ptdjs').attr('data-time');
		var pttml = [];
		setInterval(function(){
			pttml = cutDownTime(serviceTime,stimes)
			if(pttml[0] > 0){
              	$('.ptdjs').find('.day').text(pttml[0]).show();
              	$('.ptdjs').find('.daypot').show();
            }else{
              	$('.ptdjs').find('.day').hide();
              	$('.ptdjs').find('.daypot').hide();
            }
            // if(pttml[1] > 0){
            //   	$('.ptdjs').find('.hour').text(pttml[1]).show();
            //   	$('.ptdjs').find('.hourpot').show();
            // }else{
            //   	$('.ptdjs').find('.hour').hide();
            //   	$('.ptdjs').find('.hourpot').hide();
            // }
			$('.ptdjs').find('.hour').text(pttml[1]);
			$('.ptdjs').find('.minute').text(pttml[2]);
			$('.ptdjs').find('.second').text(pttml[3]);
		},1000) ;
  	}
  	

	//倒计时
	function cutDownTime(setime,datatime){
	    var eday = 3;
	    var jsTime = parseInt((new Date()).valueOf()/1000);
	    var timeOffset = parseInt(jsTime - setime);
	      var end = datatime*1000;  //点击的结束抢购时间的毫秒数
	      var newTime = Date.parse(new Date()) - timeOffset;  //当前时间的毫秒数
	      var youtime = end - newTime; //还有多久时间结束的毫秒数
	      var timeArr = [];
	      if(youtime <= 0){
	        timeArr = ['00','00','00','00'];
	        return timeArr;
	        return false;
	      }
	      var seconds = youtime/1000;//秒
	      var minutes = Math.floor(seconds/60);//分
	      var hours = Math.floor(minutes/60);//小时
	      var days = Math.floor(hours/24);//天

	      var CDay= days ;
	      var CHour= hours % 24 ;
	      if(CDay <= eday){//3天之内的只要小时 不要天
	          CHour = CHour + CDay*24;
	          CDay = 0;
	      }
	      var CMinute= minutes % 60;
	      var CSecond= Math.floor(seconds%60);//"%"是取余运算，可以理解为60进一后取余数
	      var c = new Date(Date.parse(new Date()) - timeOffset);
	      var millseconds=c.getMilliseconds();
	      var Cmillseconds=Math.floor(millseconds %100);
	      if(CSecond<10){//如果秒数为单数，则前面补零
	        CSecond="0"+CSecond;
	      }
	      if(CMinute<10){ //如果分钟数为单数，则前面补零
	        CMinute="0"+CMinute;
	      }
	      if(CHour<10){//如果小时数为单数，则前面补零
	        CHour="0"+CHour;
	      }
	      if(CDay<10){//如果天数为单数，则前面补零
	        CDay="0"+CDay;
	      }
	      if(Cmillseconds<10) {//如果毫秒数为单数，则前面补零
	        Cmillseconds="0"+Cmillseconds;
	      }
	      if(CDay > 0){
	        timeArr = [CDay,CHour,CMinute,CSecond];
	        return timeArr;
	      }else{
	        timeArr = ['00',CHour,CMinute,CSecond];
	        return timeArr;
	      }
	}
	$('.canGet').click(function(){
		var qid = $(this).attr('data-id');
		$.ajax({
			url: "/include/ajax.php?service=shop&action=getQuan&qid="+qid,
			type:'POST',
			dataType: "json",
			success:function (data) {
				if(data.state ==100){

					$(this).text('已领取');
					$(this).addClass('noChose');
					showErrAlert(data.info)

				}else{
					showErrAlert(data.info)
				}
			},
			error:function () {

			}
		});

	})
	

	var isload = false;	
  	getList(1);
	function getList(tr){
		if(isload) return false;
		isload = true;
		//如果进行了筛选或排序，需要从第一页开始加载
		if(tr){
			atpage = 1;
			$(".proList ul").html("");
		}
    	// pageSwiper.updateAutoHeight(500);
		$(".proList  .loading").remove();
		$(".proList").append('<div class="loading"><span></span><span></span><span></span><span></span><span></span></div>');

		//请求数据
		var data = [];
		data.push("pageSize="+6);
		data.push("page="+atpage);
		data.push("store="+storeid);

		var orderbyType = $('.shai_tab li.on_chose').attr('data-id');
		if(orderbyType != undefined && orderbyType != ''){
			data.push("orderby="+orderbyType);
		}

		// 商品类别
		//var typeid = $('.choose-tab li').eq(0).attr('data-id');
		var typeid = $("#typeid").val();
		if(typeid != undefined && typeid != ''){
			data.push("storetype="+typeid);
		}


		var keywords = $('#keywords').val();
		if(keywords != null && keywords != ''){
			data.push("title="+keywords);
		}

		$.ajax({
			url: "/include/ajax.php?service=shop&action=slist",
			data: data.join("&"),
			type: "GET",
			dataType: "json",
			success: function (data) {
				
				if(data && data.state == 100){
					$(".proList .loading").remove();
					var list = data.info.list, lr, html1 = [],html2=[];
					var html3 = [],html4=[];//用于分类页面的4个商品
					if(list.length > 0){
						for(var i = 0; i < list.length; i++){
							lr = list[i];
							var html=[];
							var pic = lr.litpic == false || lr.litpic == '' ? '/static/images/blank.gif' : lr.litpic;
							var specification = lr.specification;
							html.push('<li class="pro_li tc_li">');
							html.push('	<a href="'+lr.url+'">');
							html.push('		<div class="pimg"><img src="'+pic+'" alt="">');
							html.push('		</div>');
							html.push('		<div class="pinfo">');
							var qtxt = '';
			                if(lr.huodongarr==1){//准点抢购特有
			                    qtxt='<span class="xianshi">限时抢</span>';
			                } 
							html.push('			<h3>'+qtxt+lr.title+'</h3>');
							if(lr.huodongarr==1 || lr.huodongarr==4){//拼团 准点抢购特有
								html.push('    <div class="choicePrice tesPrice">');
								html.push('      <p class="spePrice">');
								var priTxt = '';
								if(lr.huodongprice>=1000){
									priTxt = '<strong>'+parseInt(lr.huodongprice)+'</strong>';
								}else{					
									var priArr = lr.huodongprice.split('.');
									if(priArr[1] > 0){
										priTxt = '<strong>'+priArr[0]+'</strong><em>.'+priArr[1]+'</em>';
									}else{
									    // priTxt = '<strong>'+parseFloat(lr.price)+'</strong>';	
									    priTxt = '<strong>'+priArr[0]+'</strong>';	
									}
								}
			                    
			                    html.push('      <span class="newPrice">'+echoCurrency('symbol')+priTxt+'</span>');
			                    html.push('        <s class="oldPrice">'+echoCurrency('symbol')+parseInt(lr.mprice)+'</s>');

			                    html.push('      </p>');
			                    html.push('      <s class="pr-bg"></s>');
			                    var pstxt = '';
								if(lr.huodongarr==1){//准点抢购
									pstxt = lr.huodongechangci+'场';
								}else{
									pstxt = lr.huodongnumber+'人拼';
								}
			                    html.push('      <span class="psPan">'+pstxt+'</span>');
			                    html.push('	</div>');  
			                    html.push('    <div class="choiceSale">');
				                  if(lr.huodongarr==1){//准点抢购特有
				                    
				                    html.push('      <div class="tsTime" data-time="1637374062"><i></i>');
				                    html.push('         <span class="day">00</span><em class="sepot">:</em>');
				                    html.push('         <span class="hour">00</span><em>:</em>');
				                    html.push('        <span class="minute">00</span><em>:</em>');
				                    html.push('         <span class="second">00</span>');
				                    html.push('       </div>');
				                  }
				                  var saleTxt = lr.huodongarr==4?'已拼':'已售';
				                  html.push('      <p class="hasSale">'+saleTxt+lr.sales+'</p>');
				                  html.push('    </div>');
							}else{

								html.push('			<p class="mprice">'+echoCurrency('symbol')+'<span>'+lr.mprice+'</span></p>');
								html.push('			<div class="pricebox">');
								var qhtml='';
			                    if(lr.quanhave ==1){
			                        qhtml = '<span class="quan_icon">券</span>';
			                    }

								var priArr = lr.price.split('.');
								html.push('				<h4>'+echoCurrency('symbol')+'<b>'+priArr[0]+'</b><span>.'+priArr[1]+'</span>'+qhtml+'</h4>');
												
								html.push('				<span class="hasSale">已售'+lr.sales+'</span>');
								html.push('			</div>');
							}
							

							html.push('		</div>');

		                  	html.push('</a></li>');
		                  	
							  if(i % 2 == 0){
								html1.push(html.join(""))
								if(atpage == 1 && i<=2){//分类页的列表只要4个商品
									html3.push(html.join(""))
								}
							  }else{
								html2.push(html.join(""))
								if(atpage == 1 && i<=3){
									html4.push(html.join(""))
								}
							  }

							//listArr[lr.id] = lr;
						}
						$(".proBox .proList ul.proUl").eq(0).append(html1.join(""));
						$(".proBox .proList ul.proUl").eq(1).append(html2.join(""));
						//分类页的商品列表
						if(atpage == 1){
							$(".tjProlist .proList ul.proUl").eq(0).append(html3.join(""));
							$(".tjProlist .proList ul.proUl").eq(1).append(html4.join(""));
						}
						

						$(".proList ul.proUl").find('.tsTime').each(function(){
			              var t = $(this),inx = t.index();
			              var stimes =t.attr('data-time');
			              var shtml = [];
			              setInterval(function(){
			                shtml = cutDownTime(serviceTime,stimes)
			                if(shtml[0] > 0){
			                  	t.find('.day').text(shtml[0]).show();
			                  	t.find('.sepot').show();
			                }else{
			                  	t.find('.day').hide();
			                  	t.find('.sepot').hide();
			                }
			                t.find('.hour').text(shtml[1]);
			                t.find('.minute').text(shtml[2]);
			                t.find('.second').text(shtml[3]);
			              },1000) ;
			            })
						isload = false;
						//最后一页
						if(atpage >= data.info.pageInfo.totalPage){
							isload = true;
							$(".proBox .proList").append('<div class="loading">'+langData['siteConfig'][18][7]+'</div>');
						}
						  setTimeout(function(){
							pageSwiper.updateAutoHeight(500);
						  },100)
					//没有数据
					}else{
						isload = true;
						$(".proList").append('<div class="loading">'+langData['siteConfig'][20][126]+'</div>');
					}

				//请求失败
				}else{
					$(".proList .loading").html(data.info);
				}


			},
			error: function(){
				isload = false;
				$(".proList .loading").html(langData['siteConfig'][20][227]);
			}
		});
	}

	// 下拉加载
	var windowTop = 0;
	
	var titleTop=$('.shopInfo').offset().top;
	var headboxTop=$('.headbox').offset().top;
	var headH=$('.header').height();
	$(window).scroll(function() {
		var scrolls = $(window).scrollTop();
		var allh = $('body').height();
		var w = $(window).height();
		var scroll = allh - w;
		if (scrolls + 50 > scroll && !isload && $('body').hasClass('probox_show')) {
			atpage++;
			getList();
		};
		//滚动标题固定
		if(scrolls > titleTop){
			var headTxt = $('.shopInfo .shop_tit h2').html();
			$('.header-address span').html(headTxt);
			$('.header').removeClass('transparent');
		}else{
			$('.header-address span').html('');
			$('.header').addClass('transparent');
		}
		//滚动 headbox固定
		if(scrolls >= headboxTop -headH){
			$('.shop_container,.headbox').addClass('topSpe');
		}else{
			$('.shop_container,.headbox').removeClass('topSpe');
		}
		//滚动隐藏底部
		if (scrolls >= windowTop) { //当B>A时，表示页面在向上滑动
			//需要执行的操作
			windowTop = scrolls;
			$('.bottom_box').css('transform',"translateY(100%)");
			//搜索框
			$('.searchbox input').blur();
			$('.searchbox').removeClass('hasClick');
			setTimeout(function(){
				$('.searchbox').siblings('ul').removeClass('speHide');
			},300)

		} else { //当B<a 表示手势往下滑动
			//需要执行的操作
			windowTop = scrolls;
			
		}
		setTimeout(function(){
			$('.bottom_box').css('transform',"translateY(0)");
		},2000)

		if($('body').hasClass('probox_show')){//监听推荐页的滚动

			if(isClick) return false;//点击切换时关闭滚动监听

	        var theadLength = $(".bigWrap").length;
	        $(".tabbox li").removeClass("on tton");

	        $(".bigWrap").each(function(index, element) {
	            var offsetTop = $(this).offset().top;
	            if (index != theadLength - 1) {
	               
	                var offsetNextTop;
	                if((device.indexOf('huoniao_iOS') > -1) && !(window.__wxjs_environment == 'miniprogram')){
	                  offsetNextTop = $(".bigWrap:eq(" + (index + 1) + ")").offset().top - 140;
	                }else{
	                  offsetNextTop = $(".bigWrap:eq(" + (index + 1) + ")").offset().top - 70;
	                }
	                if (scrolls < offsetNextTop) {
	                    $(".tabbox li:eq(" + index + ")").addClass("on tton");
	                    return false;
	                }
	            } else {
	            	console.log(444)
	                $(".tabbox li:last").addClass("on tton");
	                return false;
	            }
	        });
        }

		
	});


})
