$(function(){
    //css 样式设置
   
    $('.wedding-wrap li:last-child').css('margin-right','0')
    $('.plan_con li.bigLi:nth-child(3n)').css('margin-right','0')
    $('.plan_con li.smallLi:last-child').css('margin-right','0')
    $('.com-list li:nth-child(4n)').css('margin-right','0')


	// 焦点图
    $(".slideBox1").slide({titCell:".hd ul",mainCell:".bd .slideobj",effect:"leftLoop",autoPlay:true,autoPage:"<li></li>"});

	// 最新发布
	$(".ViewBox").slide({mainCell:".NewList",effect:"left",autoPlay:false,vis:4,prevCell:".prev",nextCell:".next",scroll:2,pnLoop:false});

    //婚纱摄影
    $(".slideBox2").slide({mainCell:".bd ul",
        startFun:function(i,c){
            $('.company_con').find('.company').eq(i).addClass('show').siblings('.company').removeClass('show')
        }
    });


    //筛选展开
    $('.filterCon .item').bind('click',function(){
        var t =$(this);      
        if(t.hasClass('opend')){
            t.removeClass('opend');
            t.find('.dn_mod').hide()
        }else{
            $('.filterCon .item').removeClass('opend');
             t.addClass('opend');
             t.siblings('.item').find('.dn_mod').hide()
             t.find('.dn_mod').stop(true,false).slideDown(200);
        }       
        
    })
    $(".dn_mod").mouseleave(function(){
        $(this).closest('.item').removeClass("opend");
        $(this).hide();
    })
    //筛选选中
    $('.dn_mod a').bind('click',function(){
        var txt = $(this).text();
        var dId = $(this).attr('data-id');
        var par  = $(this).closest('.item');
        par.addClass('has');
        par.find('.selector_rs').text(txt);
        par.attr('data-id',dId);
        $(this).addClass('on').siblings().removeClass('on')
    })
    //立即预约婚宴酒店
    $('.orderNow').click(function(){
        var data = [];
        $('.filterCon .item.has').each(function(){
            var type = $(this).attr('data-type');
            var tid = $(this).attr('data-id');
            data.push(type+'='+tid);
        })
        window.location.href = channelDomain+"/hotellist.html?"+data.join('&');

    })
    //人气商家切换
    $('.tab-ul li').click(function(){
        var state = $(this).attr('data-typeid');
        var box = $('.tab_container').find('li');
        if(!$(this).hasClass('active')){
            $(this).addClass('active').siblings('li').removeClass('active');            
            getlist(state);           
        }
    });
    //获取数据
   function getlist(state){

        $('.tab_container ul').html('');
        $('.loading').html(langData['marry'][5][22]);//加载中...
        var data = [];
        data.push("page=1");
        data.push("pageSize=5");
        data.push("filter="+state);
        var url = "/include/ajax.php?service=marry&action=storeList&"+data.join("&")
        
     $.ajax({
        url: url,
        type: "GET",
        dataType: "json", //指定服务器返回的数据类型
        success: function (data) {
         if(data.state == 100){
            var list = data.info.list;
            var html = [];
            if(list.length > 0){
                for(var i=0 ; i<list.length; i++){
                    var pic = list[i].litpic != "" && list[i].litpic != undefined ? huoniao.changeFileSize(list[i].litpic, "small") : "/static/images/404.jpg";               
                    html.push('<li><a href="'+list[i].url+'">')
                    html.push('<div class="top_img">')                                 
                    html.push('<img src="'+pic+'" alt="">')
                    html.push('</div>')
                    html.push('<div class="recInfo">')
                    html.push('<h2>'+list[i].title+'</h2>')
                    html.push('<p class="recPrice">'+echoCurrency('symbol')+'<strong>'+list[i].hotelprice+'</strong><em>起</em></p>')
                    html.push('</div>')
                    html.push('</a></li>')
                    
                }

                $('.loading').html('');
                $('.tab_container ul').html(html.join(''));
                 $('.tab_con li:last-child').css('margin-right','0')
            }else{
                $('.loading').html(langData['siteConfig'][21][64]);//暂无数据
            }
                      
         }else{
            $('.loading').html(data.info);            
         }
        },
        error:function(err){
            $('.loading').html(data.info); 
        }
     });    
    
   }




})
