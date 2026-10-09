var history_search = 'school_history_search';
var utils = {
    canStorage: function(){
        if (!!window.localStorage){
            return true;
        }
        return false;
    },
    setStorage: function(a, c){
        try{
            if (utils.canStorage()){
                localStorage.removeItem(a);
                localStorage.setItem(a, c);
            }
        }catch(b){
            if (b.name == "QUOTA_EXCEEDED_ERR"){
                alert("您开启了秘密浏览或无痕浏览模式，请关闭");
            }
        }
    },
    getStorage: function(b){
        if (utils.canStorage()){
            var a = localStorage.getItem(b);
            return a ? JSON.parse(localStorage.getItem(b)) : null;
        }
    },
    removeStorage: function(a){
        if (utils.canStorage()){
            localStorage.removeItem(a);
        }
    },
    cleanStorage: function(){
        if (utils.canStorage()){
            localStorage.clear();
        }
    }
};
$(function() {	
	//加载历史记录
	var shlist = [];
	var history = utils.getStorage(history_search);
	if(history){
		history.reverse();
		for(var i = 0; i < history.length; i++){
			shlist.push('<span>'+history[i]+'</span>');
		}
		$('.search_result p').html(shlist.join(''));
	}
  
    //搜索提交
	$('.form_search').submit(function(e){
			var keywords = $('#keywords').val();
			var type = $('.chose_type').attr('data-type');
			if(!keywords){
				return false;
			}
			//记录搜索历史
			var history = utils.getStorage(history_search);
			history = history ? history : [];
			if(history && history.length >= 10 && $.inArray(keywords, history) < 0){
				history = history.slice(1);
			}

			// 判断是否已经搜过
			if($.inArray(keywords, history) > -1){
				for (var i = 0; i < history.length; i++) {
					if (history[i] === keywords) {
						history.splice(i, 1);
						break;
					}
				}
			}
			history.push(keywords);
			utils.setStorage(history_search, JSON.stringify(history));
		
	})
  
	//历史搜索记录点击
	$('.search_result').delegate('span','click',function(t){		
		$('#keywords').val($(this).text());
		$('.form_search').submit();		
	})

	//搜索切换
	$('.chose_type').click(function(){
		$('.chose_box').toggle();
		$(this).toggleClass('curr');
		
	});

    $('.chose_box li').click(function(){
		var txt = $(this).text();
		var stype = $(this).attr("data-type");
		$('.chose_type').text(txt).attr('data-type',stype);
		$('#searchtype').val(stype)
		$('.chose_box').hide();
		$('.chose_type').removeClass('curr');
		if(stype == 1){
			$('#keywords').attr('placeholder','输入小区名称查询');
			$('.filter_box').hide();
		}else{
			$('#keywords').attr('placeholder','输入学校名称查询');
            $('.filter_box').show();
		}
	})
   getSee();
  //最近浏览
    function getSee(){
       
        $(".seeCon ul").html('<div class="loading">'+langData['siteConfig'][38][8]+'</div>'); //加载中...  
        $.ajax({
            url: "/include/ajax.php?service=house&action=loupanHistory&type=releaseschool&page=1&pageSize=8",
            type: "POST",
            dataType: "json",
            success: function (data) {              
                if(data && data.state == 100){
                    $(".seeCon ul .loading").remove();
                    var list = data.info.list, html = [];
                    if(list.length > 0){                        
                        for(var i = 0; i < list.length; i++){
                            html.push('<li><a href="'+channelDomain+'/school_detail.html?id='+list[i].id+'"><span>·</span>'+list[i].title+'</a></li>');
                        }
                                             
                    //没有数据
                    }else{
                        html.push('<li class="noSc">');
                        html.push('<img src="'+templets_skin+'images/school/nosee.png" alt="">');
                        html.push('<p><a href="'+channelDomain+'/slist.html"> 您还没有浏览过的学校哦<br/>快去看看吧</a></p>');
                        html.push('</li>');
                    }
                     $(".seeCon ul").html(html.join(""));

                  //请求失败
                }else{
                    $(".seeCon ul .loading").remove();
                    $(".seeCon ul").html('<li class="noSc"><img src="'+templets_skin+'images/school/nosee.png" alt=""><p><a href="'+channelDomain+'/slist.html"> 您还没有浏览过的学校哦<br/>快去看看吧</a></p></li>');
                }

               
            },
            error: function(){
                $(".seeCon ul .loading").remove();
                $(".seeCon ul").append('<div class="loading">'+langData['siteConfig'][20][227]+'</div>');//网络错误，加载失败！
            }
        });
    }



})
