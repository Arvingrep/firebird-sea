$(function(){
    var isload = false, nowIdexTime = '',nowkTime = '';

	$.fn.scrollTo =function(options){
        var defaults = {
            toT : 0, //滚动目标位置
            durTime : 500, //过渡动画时间
            delay : 30, //定时器时间
            callback:null //回调函数
        };
        var opts = $.extend(defaults,options),
            timer = null,
            _this = this,
            curTop = _this.scrollTop(),//滚动条当前的位置
            subTop = opts.toT - curTop, //滚动条目标位置和当前位置的差值
            index = 0,
            dur = Math.round(opts.durTime / opts.delay),
            smoothScroll = function(t){
                index++;
                var per = Math.round(subTop/dur);
                if(index >= dur){
                    _this.scrollTop(t);
                    window.clearInterval(timer);
                    if(opts.callback && typeof opts.callback == 'function'){
                        opts.callback();
                    }
                    return;
                }else{
                    _this.scrollTop(curTop + index*per);
                }
            };
        timer = window.setInterval(function(){
            smoothScroll(opts.toT);
        }, opts.delay);
        return _this;
    };
    if($('.banner .siteAdvObj').size() > 0){
    	$('.banner').removeClass('noAdv');
    }else{
      $('.ptCon').addClass('speAdv');
      $('.qgTab').addClass('speTab');
    }

    //var galleryMain = new Swiper('.gallery-main', {
      //spaceBetween: 0,
    //});

    $.ajax({
      url: "/include/ajax.php?service=shop&action=getConfigtime&gettype=1",
      type: "GET",
      dataType: "jsonp",
      success: function (data) {
  		  if(data.state == 100){
  			  var list = data.info, now = data.info.now, nowTime = data.info.nowTime, html = [], className='';

          if(list.length > 0){
    				for(var i = 0; i < list.length; i++){
    					nowIdexTime  = list[0].changci;
    				   	nowkTime  = list[0].ktime;
    				    var textname = '';
                if(list[i].now > list[i].etimestr){
                  textname = '不能错过'
                }else if(list[i].now >= list[i].ktimestr && list[i].now <= list[i].etimestr){
    				   		textname = '热抢中';
                  if(list[i].hongdongCount > 0){
                    html.push('<li class="noChangci" data-huodongtime="'+list[i].ktimestr+'"><a href="javascript:;"><strong>热卖中</strong><p>不能错过</p></a></li>')
                  }

    				    }else{
    				    	textname = '即将开始';
    				    }
                html.push('<li  data-hour="'+list[i].ktime+'" data-time="'+list[i].changci+'"><a href="javascript:;"><strong>'+list[i].ktime+'</strong><p>'+textname+'</p></a></li>')

    				}
    				$(".qgTab ul").html(html.join(""));
            if($(".noChangci").length == 0){
              $(".qgTab ul li:first-child").addClass('curr');
            }else{
              $(".qgTab ul li:nth-child(2)").addClass('curr');
            }
            
    				getList(nowIdexTime,nowkTime,1)
  			 }
  		  }
	   }
	  }); 

    //tab 切换
    $('.qgTab ').delegate('li','click',function(){
      if(!$(this).hasClass('curr')){
        $(this).addClass('curr').siblings().removeClass('curr');
        if(!$(this).hasClass('noChangci')){
          var time= $(this).attr("data-time");
          var ktime= $(this).attr("data-hour");
          getList(time,ktime,1);
        }else{
          var huodongtime = $(this).attr('data-huodongtime')
          getList('','',1,huodongtime);
        }
        var end = $('.qgTab li.curr').offset().left - $('body').width() /2;
        var star = $(".tabDiv").scrollLeft();
        var ot = $('.qgTab li.curr').offset().left;
        var thisw = $('.qgTab li.curr').width(),tbody = $('html').width();
        if((ot + thisw) >= tbody || ot < 0){
          $('.tabDiv').scrollLeft(end + star);
        }

      }
    })


  function getList(time,ktime,tr,huodongtime){
    isload = true;
    if(tr){
      atpage = 1;
      $(".glistbox ul").html("");
    }
    $(".glistbox .loading").remove();

    var param = ''
		if(time!='' && time!=undefined){
			nextHour = time;
      param = "&changci="+nextHour;
		}else if(huodongtime){
       param = "&huodongtime="+huodongtime;
    }

		$.ajax({
				url: "/include/ajax.php?service=shop&action=proHuodongList&huodongtype=1&pageSize=5&page="+atpage + param,
				type: "GET",
				dataType: "jsonp",
				success: function (data) {
					if(data && data.state == 100 && data.info.list.length > 0){
						var list = data.info.list, ggoodboxhtml = [], likeboxhtml = [], html = [];
						if(list.length > 0){
							for(var i = 0; i < list.length; i++){
                var cla = claTxt = '';
                if(list[i].huodongtimestate==1){
                  cla ='hasBegain';
                  claTxt = '<div class="hotTag"><i></i>热抢</div>';
                }
								if(list[i].huodonginventory == 0){
                  cla = 'hasSaleout';
                  claTxt = '<div class="outTag">已抢完</div>';
                }
								html.push('<li data-id="'+list[i].id+'" class="fn-clear '+cla+'">');
								html.push('<a href="'+list[i].url+'" class="fn-clear"><div class="imgbox">');               
                html.push(claTxt);
								html.push('<img src="'+list[i].litpic+'" alt="">');
								html.push('</div>');
								html.push('<div class="txtbox">');

								html.push('<h4>'+list[i].title+'</h4>');
								html.push('<p class="mprice"><span>'+echoCurrency('symbol')+parseFloat(list[i].mprice)+'</span><span>'+echoCurrency('symbol')+parseFloat(list[i].mprice)+'</span></p>');
	      						html.push('<div class="downPrice">');
                    var chaPrice = parseInt(list[i].mprice-list[i].huodongprice);
	      						html.push('	<span>直降<br/><strong>'+chaPrice+'</strong></span>');
	      						html.push('</div>');
	      						html.push('    <div class="tjPrice">');
			            		html.push('        <div class="tjLeft">');
			            		html.push('            <p class="price1"><span>'+echoCurrency('symbol')+'<strong>'+parseInt(list[i].huodongprice)+'</strong></span><em>限时价</em></p>');
			            		html.push('            <p class="price2">'+echoCurrency('symbol')+parseFloat(list[i].mprice)+'<em>日常价</em></p>');
			            		html.push('        </div>');
                      if(list[i].huodongtimestate==1){//已经开始
                        if(list[i].huodonginventory == 0){
                          html.push('        <div class="tjRt">已抢完</div>');
                        }else{
                          html.push('        <div class="tjRt"><div><strong>抢购</strong><p>仅剩'+list[i].huodonginventory+'件</p></div></div>');
                        }
                        
                      }else{
                        html.push('        <div class="tjRt">提前加购</div>');
                      }
			            		
								 html.push('</div>');
								html.push('</div></a>');
								html.push('</li>');
								

							}
							$(".glistbox ul").append(html.join(""));

			                isload = false;
			                //最后一页
			                if(atpage >= data.info.pageInfo.totalPage){
			                    isload = true;
			                    $(".glistbox ul").append('<div class="loading">'+langData['siteConfig'][18][7]+'</div>');
			                }
						}else{
			                isload = true;

			                $(".glistbox ul").append('<div class="loading">暂无相关信息</div>');
			            }
					}else{
		                isload = true;

		                $(".glistbox ul").append('<div class="loading">暂无相关信息</div>');
		            }
				},
				error: function(){
					isload = false;

    				$('.glistbox ul').html('<div class="loading">'+langData['siteConfig'][20][227]+'</div>');
				}
		});
    }

    $(window).scroll(function() {

        var allh = $('body').height();
        var w = $(window).height();
        var scroll = allh - w;
        let li = $('qgTab li.curr');
       
        if ($(window).scrollTop() + 50 > scroll && !isload) {
            atpage++;
            if(!li.hasClass('noChangci')){
              var time= li.attr("data-time");
              var ktime= li.attr("data-hour");
              getList(time,ktime,);
            }else{
              var huodongtime = li.attr('data-huodongtime')
              getList('','','',huodongtime);
            }
        };
    });



})
