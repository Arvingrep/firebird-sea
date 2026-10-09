$(function(){
    //css 样式设置
    $('.service_wrap ul li:nth-child(5n)').css('margin-right','0')
    $('.recomtop ul li:nth-child(4n)').css('margin-right','0')
    $('.right_jin ul li:nth-child(4n)').css('margin-right','0')
    $('.newshop li:last-child').css('margin-right','0')
    $('.hot_service li:nth-child(4n)').css('margin-right','0')
    $('.right_jin li:nth-child(2)').css('margin-top','2px')
    $('.right_jin li:nth-child(3)').css('margin-top','2px')
    $('.right_jin li:nth-child(4)').css('margin-top','2px')
    
	
	// 焦点图
    $(".slideBox1").slide({titCell:".hd ul",mainCell:".bd .slideobj",effect:"leftLoop",autoPlay:true,autoPage:"<li></li>"});

	//查看电话
    $('.recom_main').delegate('.call_span','click',function(){
        var tel = $(this).data('tel');
        $(this).text(tel);
        return false;
        e.stopPropagation();
    })


    //换一批
    var page = 1,pageSize = 3;
    $('.change_wrap').delegate('.change','click',function(){
        page++;
        getList()
    })
    function getList(tr){

        //if(isload) return false;
        var data = [];
        data.push("page="+page);
        data.push("pageSize="+pageSize);
        data.push("lng="+lng);
        data.push("lat="+lat);      
        $.ajax({
            url: masterDomain + "/include/ajax.php?service=homemaking&action=storeList&rec=1&orderby=1&"+data.join("&"),
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
                isload = false;
                if(data && data.state == 100){
 
                    var html = [],html_box = [], list = data.info.list, pageinfo = data.info.pageInfo;
                    for (var i = 0; i < list.length; i++) {
                        html.push('<li class="fn-clear">');
                        html.push('<a href="'+list[i].url+'" target="_blank">');                      
                        html.push('<img src="'+templatePath+'images/new_recom.png" alt="" class="new_recom">');//推荐icon
                        var pic = list[i].litpic != "" && list[i].litpic != undefined ? huoniao.changeFileSize(list[i].litpic, "small") : "/static/images/404.jpg";
                        html.push('<div class="recom_img"><img src="'+pic+'" alt=""></div>');
                        html.push('<div class="recom_info">');
                        html.push('<div class="recom_c">');
                        html.push('<h3>'+list[i].title+'</h3> ');
                        if(list[i].tag!=''){
                            html.push('<h5>');
                            for(var m=0;m<list[i].tagAll.jc.length;m++){
                                html.push('<span>'+list[i].tagAll.jc[m]+'</span>');
                            }
                            html.push('</h5>');
                        }
                        html.push('<div class="pos_box"><i></i>'+list[i].address+'</div>');
                        html.push('</div>');
                        html.push('<p class="see_call"><span data-tel="'+list[i].tel+'" class="call_span">查看电话</span></p>');
                        html.push('</div>');
                        html.push('</a>');
                        html.push('</li>');
                    }

                    $(".recom_main ul").html(html.join(""));


                    if(page >= pageinfo.totalPage){
                        page = 0;//循环加载 加载结束时 加载第一页
                    }

                }else{
                    if(page == 1){
                        $(".recom_main ul").html("");
                    }
                    $(".recom_main ul").html('<div class="empty">'+data.info+'</div>');
                }
            },
            error: function(){
                //isload = false;
                if(page == 1){
                    $(".recom_main ul").html("");
                }
                $(".recom_main ul .empty").html(langData['homemaking'][8][66]).show();
            }
        });

    }
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
    checkLocal();
    function checkLocal(){
      var local = false;
      var localData = utils.getStorage("user_local");
      if(localData){
        var time = Date.parse(new Date());
        time_ = localData.time;
        // 缓存1小时
        if(time - time_ < 3600 * 1000){
          lat = localData.lat;
          lng = localData.lng;
          local = true;
        }

      }

      if(!local){
        HN_Location.init(function(data){
          if (data == undefined || data.address == "" || data.name == "" || data.lat == "" || data.lng == "") {
            lat = lng = -1;
          }else{
            lng = data.lng;
            lat = data.lat;

            var time = Date.parse(new Date());
            utils.setStorage('user_local', JSON.stringify({'time': time, 'lng': lng, 'lat': lat, 'address': data.address}));
          }
        })
      }
      
    }




	function getParentName(data, index) {
    	// console.log(data)
    	// console.log(index)
    	var len = data.length;
		for(var i = 0; i < len; i++){
			if(data[i].id == index){
				return data[i].typename;
			}
		}
    }

    var  transTimes = function(timestamp, n){
        
        const dateFormatter = huoniao.dateFormatter(timestamp);
        const year = dateFormatter.year;
        const month = dateFormatter.month;
        const day = dateFormatter.day;
        const hour = dateFormatter.hour;
        const minute = dateFormatter.minute;
        const second = dateFormatter.second;
        
        
        if(n == 1){
            return (year+'-'+month+'-'+day+' '+hour+':'+minute+':'+second);
        }else if(n == 2){
            return (year+'-'+month+'-'+day);
        }else if(n == 3){
            return (month+'-'+day);
        }else if(n == 4){
            return (hour+':'+minute);
        }else{
            return 0;
        }
    }



//点击分享链接
//点击list中的i
    var userid = typeof cookiePre == "undefined" ? null : $.cookie(cookiePre+"login_user");
	$('.new_info i').click(function(){
		if(userid==null||userid==undefined){
    		huoniao.login();
    		return false;
    	}
		var url = $(this).parents('li').find('a').attr('href');
		var chatid = $(this).attr('data-id');
		var mod = 'info';
		var title = $(this).parents('li').find('.new_title').text();
		var imgUrl = $(this).parents('li').find('.left_b img').attr('src');
		var price = $(this).parents('li').find('.new_price').text();
        var type = $(this).attr('data-type')
        imconfig = {
            'mod':'info',
            'chatid':chatid,
            'title': title,
            "price": price,
            "imgUrl": imgUrl,
            "link": url,
        }
        sendLink(type);
	});






})
