var position_cityid,  //定位城市id
	position_city,  //定位城市名
	position_area,   //定位区域名
	position_areaid;  //定位区域id

$(function(){
  var device = navigator.userAgent;
  if(device.indexOf('huoniao') > -1){
        // $('.pos_sz').bind('click', function(e){
        //     e.preventDefault();
        //     setupWebViewJavascriptBridge(function(bridge) {
        //         bridge.callHandler('goToCity', {'module': 'renovation'}, function(){});
        //     });
        // });
    }else{
      //切换地点
      $('.pos_sz').click(function(){
         var url = $(this).attr('data-url');
         window.location.href = url;
      })
    }



var checkname = ''	; //验证城市
location();
// 定位
function location(force){
	HN_Location.init(function(data){
		if (data == undefined || data.address == "" || data.name == "" || data.lat == "" || data.lng == "") {
			// alert(langData['siteConfig'][27][137]);
			position_cityid = cityid;  //定位失败 选择当前城市分站
			position_city  = city;
			checkname = position_city;//验证的城市
			position_area = '';
			getCity()
		}else{
			var lng = data.lng, lat = data.lat, name = data.name, page = 1;
			var time = Date.parse(new Date());
			if(data.city.indexOf(city) > -1){  //定位显示当前是城市分站
				position_cityid = cityid;
				position_city  = city;
				position_area = data.district;
				getCity(position_city)
			}else{
				position_city  = data.city;
				checkname = position_city;//验证的城市
				position_area = data.district
				getCity()
			}
		}
	}, force);
}


function getCity(id){
	var data = {};
	if(id){
		data = {'type':id};
		checkname = position_area;
	}
	$.ajax({
		url: '/include/ajax.php?service=siteConfig&action=addr&son=1',
		data: data,
		type: "POST",
		dataType: "json",
		success: function (data) {
			if(data.state == 100){
				var cityList = data.info;
				var cityObj = cityList.find(checkCity);  //城市对象
				if(cityObj){
					if(!id){
						position_cityid = cityObj.id;
						$(".free_list .gz-addr-seladdr").attr('data-ids',position_cityid).attr('data-id',position_cityid);
						$(".free_list .gz-addr-seladdr .city,.free_list .gz-addr-seladdr .city2").html(position_city)
						getCity(position_cityid);

					}else{
						position_areaid =  cityObj.id;
						position_area =  cityObj.typename
						$(".free_list .gz-addr-seladdr").attr('data-ids',position_cityid +' '+position_areaid).attr('data-id',position_areaid);
						$(".free_list .gz-addr-seladdr .city").html(position_city+' '+position_area)
					}
				}else{
					if(!position_cityid){
                       position_city  = city;
                       position_cityid = cityid;
                    }
					$(".free_list .gz-addr-seladdr").attr('data-ids',position_cityid).attr('data-id',position_cityid);
					$(".free_list .gz-addr-seladdr .city,.free_list .gz-addr-seladdr .city2").html(position_city)
				}
			}
		},
		error: function(){}
	});
}

// 查找符合的城市
function checkCity(city){
	if(checkname.indexOf(city.typename) > -1){
		return city
	}
}

//搜索类型
$('.head-box .type').click(function(){
    var typeList = $(this).find('.type-list');
    if(typeList.hasClass('show')){
        typeList.removeClass('show')
    }else{
        typeList.addClass('show')
    }

});
$('.type-list li').click(function(){
    var type = $(this).attr('data-type');
    var txt = $(this).find('span').text();
    $('.type label').text(txt);
    $('.textIn-box').attr('action',channelDomain+'/'+type+'.html')
});
//搜索跳转
$('.btn-go').click(function(){
    var keywords = $('#keywords').val();
    $('.textIn-box ').submit();
});



  // banner轮播图
  new Swiper('.banner .swiper-container', {pagination:{ el: '.banner .pagination',} ,slideClass:'slideshow-item',loop: true,grabCursor: true,paginationClickable: true,autoplay:{delay: 2000,}});

   // 滑动导航
    var t = $('.tcInfo .swiper-wrapper');
    var swiperNav = [], mainNavLi = t.find('li');
    for (var i = 0; i < mainNavLi.length; i++) {
        swiperNav.push('<li>'+t.find('li:eq('+i+')').html()+'</li>');
    }

    var liArr = [];
    for(var i = 0; i < swiperNav.length; i++){
        liArr.push(swiperNav.slice(i, i + 10).join(""));
        i += 9;
    }

    t.html('<div class="swiper-slide"><ul class="fn-clear">'+liArr.join('</ul></div><div class="swiper-slide"><ul class="fn-clear">')+'</ul></div>');
    new Swiper('.tcInfo .swiper-container', {pagination: {el:'.tcInfo .pagination',}, loop: false, grabCursor: true, paginationClickable: true});




    //滚动信息
    $.ajax({
        url : "/include/ajax.php?service=renovation&action=news",
        type : "GET",
        data : {},
        dataType : "json",
        success : function (data) {
            var obj = $(".mBox .swiper-wrapper");
            if(data.state == 100){
                var list = data.info.list;
                var html = '';
                var length = list.length;
                for (var i = 0; i < length; i++){
                    if(i < length){
                        if(i % 2 != 0 ){
                            continue;
                        }
                    }

                    var html2 = '';
					if(list[i+1] != undefined){
	                    html2 =  '<a href="'+list[i+1].url+'" class="fn-clear"><p>'+list[i+1].title+'</p></a>' ;
					}
                    var html3='';
                    html += '<div class="swiper-slide swiper-no-swiping">' +
                        '<a href="'+list[i].url+'" class="fn-clear"><p>'+list[i].title+'</p></a>' +
                        html2 +
                        '</div>';

                }
                obj.html(html);
                new Swiper('.tcNews .swiper-container', {direction: 'vertical', pagination: { el: '.tcNews .pagination'},loop: true,autoplay: {delay: 2000},observer: true,observeParents: true,disableOnInteraction: false});
            }
        }
    });




    //房屋类型
    var hx =[];
    getHuxing()
    function getHuxing(){
        $.ajax({
            type: "POST",
            url: "/include/ajax.php?service=renovation&action=type&type=8",
            dataType: "json",
            success: function(res){
                if(res.state==100 && res.info){
                    var list = res.info;
                    var huxinSelect = new MobileSelect({
                        trigger: '.room_type',
                        title: '',
                        wheels: [
                            {data:list}
                        ],
                        keyMap: {
                            id: 'id',
                            value: 'typename'
                        },
                        position:[0, 0],
                        callback:function(indexArr, data){
                            $('#room_type').val(data[0].typename);
                            $('.room_type .type_room span').hide();
                            $('#units').val(data[0].id)
                        }
                        ,triggerDisplayData:false,
                    });
                }
            }
        });
    }


    //国际手机号获取
    getNationalPhone();
    function getNationalPhone(){
        $.ajax({
            url: masterDomain+"/include/ajax.php?service=siteConfig&action=internationalPhoneSection",
            type: 'get',
            dataType: 'jsonp',
            success: function(data){
                if(data && data.state == 100){
                   var phoneList = [], list = data.info;
                   var listLen = list.length;
                   var codeArea = list[0].code;
                   if(listLen == 1 && codeArea == 86){//当数据只有一条 并且这条数据是大陆地区86的时候 隐藏区号选择
                        $('.areacode_span').hide();
                        return false;
                   }
                   for(var i=0; i<list.length; i++){
                        phoneList.push('<li><span>'+list[i].name+'</span><em class="fn-right">+'+list[i].code+'</em></li>');
                   }
                   $('.layer_list ul').append(phoneList.join(''));
                }else{
                   $('.layer_list ul').html('<div class="loading">暂无数据！</div>');
                  }
            },
            error: function(){
                    $('.layer_list ul').html('<div class="loading">加载失败！</div>');
                }

        })
    }
    // 打开手机号地区弹出层
    $(".areacode_span").click(function(){
        $('.layer_code').show();
        $('.mask-code').addClass('show');
    })
    // 选中区域
    $('.layer_list').delegate('li','click',function(){
        var t = $(this), txt = t.find('em').text();
        var par = $('.formCommon.show')
        var arcode = par.find('.areacode_span')
        arcode.find("label").text(txt);
        par.find(".areaCodeinp").val(txt.replace("+",""));

        $('.layer_code').hide();
        $('.mask-code').removeClass('show');
    })

    // 关闭弹出层
    $('.layer_close, .mask-code').click(function(){
        $('.layer_code').hide();
        $('.mask-code').removeClass('show');
    })
    // 信息提示框
    // 错误提示
    function showMsg(str){
      var o = $(".error");
      o.html('<p>'+str+'</p>').show();
      setTimeout(function(){o.hide()},1000);
    }
    // 立即报价 表单验证
    // 立即报价弹出
    $('.publish-news').click(function(){
        $('.shop-img img').css('opacity',0.7)
        $('.news-img img').css('opacity',1)
        $('.quote').show().addClass('show');
        $('.order').hide().removeClass('show');


     })
    $('.submit').click(function(){

        var room_type = $('#room_type').val(),
            room_area = $('.quote .room_area').val(),
            name = $('.quote .name').val(),
            tel = $('.quote .phone').val(),
            f = $(this);
        var txt = f.text();

        if(f.hasClass("disabled")) return false;
        var par = f.closest('.formCommon');
        var areaCodev = $.trim(par.find('.areaCodeinp').val());
        var addrid = par.find('.gz-addr-seladdr').attr('data-id');
        if(addrid == '') {

            showMsg(langData['renovation'][1][0]); //请选择所在城市

        }else if (!tel) {

           showMsg(langData['renovation'][15][83]);// 请输入手机号码，输入号码免费

        }else {
            f.addClass("disabled").text(langData['renovation'][14][49]);//正在获取，请稍后

            var data = [];
            data.push("units="+$("#units").val());
            data.push("are="+room_area);
            data.push("people="+name);
            data.push("areaCode="+areaCodev);
            data.push("contact="+tel);
            data.push("addrid="+addrid);
            data.push("resetype=1");

            $.ajax({
                url: "/include/ajax.php?service=renovation&action=sendRese",
                data: data.join("&"),
                type: "POST",
                dataType: "json",
                success: function (data) {
                    f.removeClass("disabled").text(txt);//
                    if(data && data.state == 100){//要返回价格回来
                        $('.order_mask').show();

                    }else{
                        alert(data.info);
                    }
                },
                error: function(){
                    alert(langData['renovation'][14][88]);//获取失败，请重试！
                    f.removeClass("disabled").text(txt);//
                }
            });
        }
    })



    // 立即预约弹出
    $('.merchant').click(function(){
        $('.news-img img').css('opacity',0.7)
        $('.shop-img img').css('opacity',1)
        $('.order').show().addClass('show');
        $('.quote').hide().removeClass('show');



     })

    // 立即预约 表单验证
    $('.submit2').click(function(){
        var f = $(this);
        var name2 = $('.order .name').val(),
            tel2 = $('.order .phone').val();
            room2 = $('.order .room').val();
        var txt = f.text();
        if(f.hasClass("disabled")) return false;
        var par = f.closest('.formCommon');
        var areaCodev = par.find('.areaCodeinp').val();
        var addrid = par.find('.gz-addr-seladdr').attr('data-id');
        if(addrid == '') {

            showMsg(langData['renovation'][1][0]);//请选择所在城市

        }else if (!tel2) {

            showMsg(langData['renovation'][15][83]);// 请输入手机号码，输入号码免费

        }else {
            f.addClass("disabled").text(langData['renovation'][14][58]);//预约中...

            var data = [];
            data.push("community="+room2);
            data.push("people="+name2);
            data.push("areaCode="+areaCodev);
            data.push("contact="+tel2);
            data.push("addrid="+addrid);

            $.ajax({
                url: "/include/ajax.php?service=renovation&action=sendEntrust",
                data: data.join("&"),
                type: "POST",
                dataType: "json",
                success: function (data) {
                    f.removeClass("disabled").text(txt);//
                    if(data && data.state == 100){
                        $('.order_mask').show()

                    }else{
                        alert(data.info);
                    }
                },
                error: function(){
                    alert(langData['renovation'][14][90]);//预约失败，请重试！
                    f.removeClass("disabled").text(txt);//
                }
            });
        }
    })

    // 立即预约关闭
     $('.order_mask .work_close').click(function(){
        $('.order_mask').hide();

    })

    //装修公司
    company()
    function company(){
        $.ajax({
            type: "GET",
            url: "/include/ajax.php?service=renovation&action=store&pageSize=2",
            dataType: "jsonp",
            success: function (data) {
                if(data && data.state == 100){
                    var cList = [], list = data.info.list;
                    for (var i = 0; i < list.length; i++){
                        var pic = list[i].logo != "" && list[i].logo != undefined ? huoniao.changeFileSize(list[i].logo, "small") : "/static/images/404.jpg";
                        cList.push('<div class="com_bottom">');
                        cList.push('<a href="'+list[i].url+'">');
                        cList.push('<div class="middle">');
                        cList.push('<div class="left_b">');
                        cList.push('<img src="'+pic+'" alt="">');
                        cList.push('</div>');
                        cList.push('<div class="right_b">');
                        cList.push('<div class="com1">');
                        cList.push('<h4 class="com_type">'+list[i].company+'</h4>');
                        if(list[i].safeguard > 0){
                           cList.push('<span class="defend"></span>');
                        }
                        if(list[i].certi == 1){
                            cList.push('<span class="certify"></span>');
                        }

                        cList.push('</div>');
                        cList.push('<ul class="right_ul">');
                        cList.push('<li>'+langData['renovation'][0][24]+'：<span>'+list[i].diaryCount+'</span></li>');//案例
                        cList.push('<li>'+langData['renovation'][0][25]+'：<span>'+list[i].constructionCount+'</span></li>');//工地
                        cList.push('<li>'+langData['renovation'][0][4]+'：<span>'+list[i].teamCount+'</span></li>');//设计师
                        cList.push('</ul>');
                        cList.push('</div>');
                        cList.push('</div>');
                       var diarylist = list[i].diarylist ? list[i].diarylist : [] ;
                      if(diarylist.length > 0){
                          cList.push('<div class="bottom">');
                          cList.push('<ul>');
                          var alen = diarylist.length < 3 ? diarylist.length :3;
                          for (var a = 0; a < alen; a++) {
                              var diarylistpic = diarylist[a].litpic != "" &&  diarylist[a].litpic != undefined ? huoniao.changeFileSize( diarylist[a].litpic, "small") : "/static/images/404.jpg";
                              cList.push('<li><img src="'+diarylistpic+'" alt=""></li>');

                          }

                          cList.push('/ul>');
                          cList.push('</div>');
                        }
                        cList.push('</a>');
                        cList.push('</div>');
                    }
                    $('.company-wrap').html(cList.join(''));
                }else{
                    $('.company-wrap .loading').html(data.info)
                }
            },
            error: function(){
                $('.company-wrap .loading').html(langData['siteConfig'][20][183])  //网络错误，请稍候重试！
            }
        });
    }


    //设计师
    team()
    function team(){
        $.ajax({
            type: "GET",
            url: "/include/ajax.php?service=renovation&action=team&pageSize=6",
            dataType: "json",
            success: function (data) {
                if(data && data.state == 100){
                    var teamList = [], list = data.info.list;
                    for (var i = 0; i < list.length; i++){
                        var pic = list[i].photo != "" && list[i].photo != undefined ? huoniao.changeFileSize(list[i].photo, "small") : "/static/images/404.jpg";
                        teamList.push('<div class="swiper-slide">');
                        teamList.push('<a href="'+list[i].url+'">');
                        teamList.push('<div class="artist_info">');
                        teamList.push('<img src="'+pic+'" alt="">');
                        teamList.push('<p class="artist_name">'+list[i].name+'</p>');
                        if(list[i].diary>0){
                            teamList.push('<p class="artist_anli">'+langData['renovation'][14][71].replace('1',list[i].diary)+'</p>');//1套案例
                        }else{
                            teamList.push('<p class="artist_anli">'+langData['renovation'][14][73]+'</p>');//暂无案例
                        }

                        teamList.push('</div>');
                        teamList.push('<p class="service_order">'+langData['renovation'][0][21]+'</p>');//免费预约
                        teamList.push('</a>');
                        teamList.push('</div>');
                    }
                    $('.jz_service .swiper-wrapper').html(teamList.join(''));
                    //横向滚动
                    var swiper = new Swiper('.jz_service .swiper-container', {
                      slidesPerView: 'auto',
                      pagination: {
                        el: '.swiper-pagination',
                        clickable: true,
                      }

                    });
                }else{
                    $('.jz_service .swiper-wrapper').html('<div class="loading">'+data.info+'</div>')
                }
            },
            error: function(){
                $('.jz_service .swiper-wrapper').html('<div class="loading">'+langData['siteConfig'][20][183]+'</div>')  //网络错误，请稍候重试！
            }
        });
    }
    //效果图
    //导航切换(按空间,按风格,按户型)
    $('.reno_tab li').click(function(){
        $(this).addClass('active').siblings('li').removeClass('active')
        $('.design_container').html('<div class="loading">'+langData['siteConfig'][38][8]+'</div>');//加载中...
        albums();

    });
    albums();
    function albums(){
        var type = $('.reno_tab .active').attr('data-type')
        if(type == '533'){
            typename = "kongjian";
        }else if(type == '4'){
            typename = "style";
        }else if(type == '8'){
            typename = "units";
        }
        $.ajax({
            type: "GET",
            url: "/include/ajax.php?service=renovation&action=type&pageSize=5&getpicCount=1&type="+type+"&typename="+typename,
            dataType: "json",
            success: function (data) {
                if(data && data.state == 100){
                    var aList = [], list = data.info;
                    aList.push('<ul>');
                    for (var i = 0; i < list.length; i++){
                        var pic = list[i].litpic != "" && list[i].litpic != undefined ? huoniao.changeFileSize(list[i].litpic, "small") : "/static/images/404.jpg";
                        aList.push('<li class="'+typename+i+'">');
                        aList.push('<a href="'+ablumsurl+'?'+typename+'='+list[i].id+'">');
                        aList.push('<div class="design_info">');
                        aList.push('<p class="design_place">'+list[i].title+'</p>');
                        //if(list[i].case>0){
                            aList.push('<p class="design_num">'+langData['renovation'][14][75].replace('1',list[i].pictoalcount)+'</p>');//1套
                        //}else{
                            //aList.push('<p class="design_num">'+langData['renovation'][14][73]+'</p>');//暂无案例
                        //}

                        aList.push('</div>');

                        aList.push('</a>');
                        aList.push('</li>');
                    }
                    aList.push('</ul>');
                    $('.design_container').html(aList.join(''));
                }else{
                    $('.design_container .loading').html(data.info)
                }
            },
            error: function(){
                $('.design_container .loading').html(langData['siteConfig'][20][183])  //网络错误，请稍候重试！
            }
        });
    }
    //在线工地
    site();
    function site(){
        $.ajax({
            type: "GET",
            url: "/include/ajax.php?service=renovation&action=constructionList&pageSize=3",
            dataType: "jsonp",
            success: function (data) {
                if(data && data.state == 100){
                    var cList = [], list = data.info.list;
                    cList.push('<ul>');
                    for (var i = 0; i < list.length; i++){
                        var pic = list[i].litpic != "" && list[i].litpic != undefined ? huoniao.changeFileSize(list[i].litpic, "small") : "/static/images/404.jpg";
                        cList.push('<li class="fn-clear">');
                        cList.push('<a href="'+list[i].url+'">');
                        cList.push('<div class="left_b">');
                        cList.push('<img src="'+pic+'" alt="">');
                        cList.push('</div>');
                        cList.push('<div class="right_b">');
                        cList.push('<h3 class="build_title">'+list[i].title+'</h3>');
                        cList.push('<div class="build_middle">');
                        cList.push('<span>'+list[i].style+'</span><span>'+list[i].area+langData['renovation'][11][14]+'</span><span>'+list[i].company+'</span>');//平
                        cList.push('</div>');
                        cList.push('<div class="build_bottom fn-clear">');
                        cList.push('<span>'+list[i].mqjd+'</span><span>'+langData['renovation'][1][8]+'</span>');//查看工地
                        cList.push('</div>');
                        cList.push('</div>');
                        cList.push('</a>');
                        cList.push('</li>');
                    }
                    cList.push('</ul>');
                    $('.build_content').html(cList.join(''));
                }else{
                    $('.build_content .loading').html(data.info)
                }
            },
            error: function(){
                $('.build_content .loading').html(langData['siteConfig'][20][183])  //网络错误，请稍候重试！
            }
        });
    }
    //工长推荐
    foreman()
    function foreman(){
        $.ajax({
            type: "GET",
            url: "/include/ajax.php?service=renovation&action=foreman&pageSize=4",
            dataType: "json",
            success: function (data) {
                if(data && data.state == 100){
                    var fList = [], list = data.info.list;
                    fList.push('<ul>');
                    for (var i = 0; i < list.length; i++){
                        var pic = list[i].photo != "" && list[i].photo != undefined ? huoniao.changeFileSize(list[i].photo, "small") : "/static/images/404.jpg";
                        fList.push('<li>');
                        fList.push('<a href="'+list[i].url+'">');
                        fList.push('<div class="foreman_photo">');
                        fList.push('<img src="'+pic+'" alt="">');
                        fList.push('</div>');
                        fList.push('<p class="foreman_name">'+list[i].name+'</p>');
                        if(list[i].works>0){
                            fList.push('<p class="foreman_age">'+langData['renovation'][14][94].replace('1',list[i].works)+'</p>');//1年工龄
                        }else{
                            fList.push('<p class="foreman_age">'+langData['renovation'][14][95]+'</p>');//暂无
                        }

                        fList.push('</a>');
                        fList.push('</li>');
                    }
                    fList.push('</ul>');
                    $('.foreman_container').html(fList.join(''));
                }else{
                    $('.foreman_container').html('<div class="loading">'+data.info+'</div>')
                }
            },
            error: function(){
                $('.foreman_container').html('<div class="loading">'+langData['siteConfig'][20][183]+'</div>')  //网络错误，请稍候重试！
            }
        });
    }

    // 悬浮发布
    $(document).ready(function (ev) {
          $('.menu').on('touchend', function (ev) {
              if($('.mask').hasClass('show')){
                 $('.mask').removeClass('show');
               }else{
                 $('.mask').addClass('show');
               }
              $('.mIcon').toggleClass('close');
              $('.menu').toggleClass('m_active');
              $('.mIcon.wx').toggleClass('m_curr');
              $('.mIcon.my').toggleClass('m_curr');
              $('.mIcon.gt').toggleClass('m_curr');
          });

    });
        //下拉加载
    var isload = false;
    var page=1;
    // $(window).scroll(function() {
    //     var h = $('.wiki_container li').height();
    //     var allh = $('body').height();
    //     var w = $(window).height();
    //     var scroll = allh - h - w;
    //     if ($(window).scrollTop() > scroll && !isload) {
    //         page++;
    //         getList();
    //     };
    // });

    getList()


    //获取信息列表
    function getList(tr){

        if(isload) return false;
        isload = true;
      $(".wiki_container .loading").remove();
        if(page != 1){
            $(".wiki_container ul").append('<div class="loading">'+langData['siteConfig'][38][8]+'</div>');//加载中...
        }
        $.ajax({
            url: "/include/ajax.php?service=renovation&action=news&pageSize=4&page="+page,
            type: "GET",
            dataType: "json",
            success: function (data) {
                isload = false;
                if(data && data.state == 100){

                    var html = [],html_box = [], list = data.info.list, pageinfo = data.info.pageInfo;
                    if(list.length > 0){
                        $(".wiki_container .loading").remove();
                        for (var i = 0; i < list.length; i++) {

                            html.push('<li class="fn-clear">');
                            html.push('<a href="'+list[i].url+'">');
                            if(list[i].litpic != ""){
                                html.push('<div class="right_b">');
                                html.push('<img src="'+list[i].litpic+'" alt="">');
                                html.push('</div>');
                            }
                            html.push('<div class="left_b">');
                            html.push('<p class="wiki_title">'+list[i].title+'</p>');
                            html.push('<div class="wiki_info">');
                            var pubTime = list[i].pubdate;
                            var pub = huoniao.transTimes(pubTime,2)
                            var reg = new RegExp("-","g");//g,表示全部替换。
                            html.push('<p class="wiki_time"><span>'+pub.replace(reg,'.')+'</span></p>');
                            html.push('<p class="wiki_read">'+langData['renovation'][14][96].replace('1',list[i].click)+'</p> '); //1次浏览
                            html.push('</div>');
                            html.push('</div>');

                            html.push('</a>');
                            html.push('</li>');

                        }


                        $(".wiki_container ul").append(html.join(""));
                        isload = false;
                        $(".wiki_container").append('<a style="display:block; text-align:center; " class="loading" href="'+channelDomain+'/raiders.html"> 查看更多 > </a>')
                        if(page >= pageinfo.totalPage){
                            isload = true;
                            $(".wiki_container ul").append('<div class="loading">到底了...</div>');

                        }
                    }else{
                        $(".wiki_container .loading").html(langData['siteConfig'][20][126]);//暂无相关信息！
                    }


                }else{
                    $(".wiki_container .loading").html(data.info);
                }
            },
            error: function(){
                isload = false;
                $(".wiki_container .loading").html(langData['renovation'][2][29]);//网络错误，加载失败...
            }
        });

    }





});
