var huoniaoTools = {

        //转换PHP时间戳
        transTimes: function(timestamp, n){
        
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
    }

$(function(){
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
        $(".areacode_span label").text(txt);
        $("#areaCode").val(txt.replace("+",""));

        $('.layer_code').hide();
        $('.mask-code').removeClass('show');
    })

    // 关闭弹出层
    $('.layer_close, .mask-code').click(function(){
        $('.layer_code').hide();
        $('.mask').removeClass('show');
    })

    $('.appMapBtn').attr('href', OpenMap_URL);


     //放大图片
    $.fn.bigImage({
        artMainCon:".det_con3,.img_ul",  //图片所在的列表标签
    });

    $('.markBox').find('a:first-child').addClass('curr');
    //轮播图
    new Swiper('.topSwiper .swiper-container', {pagination: {el: '.topSwiper .swiper-pagination',type: 'fraction',} ,autoplay: true,loop: true,grabCursor: true,paginationClickable: true,
        on: {
            slideChangeTransitionStart: function(){
                var len = $('.markBox').find('a').length;
                var sindex = this.activeIndex;
                if(len==1){
                    $('.markBox').find('a:first-child').addClass('curr');
                }else if(len==3){
                    if(sindex > 1){
                        $('.pmark').removeClass('curr');
                        $('.picture').addClass('curr');
                    }else if(sindex == 1){
                        $('.pmark').removeClass('curr');
                        $('.video').addClass('curr');
                    }else{
                        $('.pmark').removeClass('curr');
                        $('.panorama').addClass('curr');
                    }
                }

            },
        }
    });


    //如果是安卓腾讯X5内核浏览器，使用腾讯TCPlayer播放器
    var player = document.getElementById('video'), videoWidth = 0, videoHeight = 0, videoCover = '', videoSrc = '', isTcPlayer = false;
    if(device.indexOf('MQQBrowser') > -1 && device.indexOf('Android') > -1 && player){
        videoSrc = player.getAttribute('src');
        videoCover = player.getAttribute('poster');
        var vid = player.getAttribute('id');

        videoWidth = $('#' + vid).width();
        videoHeight = $('#' + vid).height();

        $('#' + vid).after('<div id="tcPlayer"></div>');
        $('#' + vid).remove();
        document.head.appendChild(document.createElement('script')).src = '//imgcache.qq.com/open/qcloud/video/vcplayer/TcPlayer-2.2.2.js';
        isTcPlayer = true;
    }


    // 图片放大
    var videoSwiper = new Swiper('.videoModal .swiper-container', {pagination: {el:'.videoModal .swiper-pagination',type: 'fraction',},loop: false})
    $(".topSwiper").delegate('.topcomm', 'click', function() {
        var imgBox = $('.topSwiper .swiper-slide');
        var i = $(this).index();
        $(".videoModal").addClass('vshow');
        $('.markBox').toggleClass('show');
        videoSwiper.slideTo(i, 0, false);

        //安卓腾讯X5兼容
        if(player && isTcPlayer){
            new TcPlayer('tcPlayer', {
                "mp4": videoSrc, //请替换成实际可用的播放地址
                "autoplay" : false,  //iOS下safari浏览器，以及大部分移动端浏览器是不开放视频自动播放这个能力的
                "coverpic" : videoCover,
                "width" :  videoWidth,  //视频的显示宽度，请尽量使用视频分辨率宽度
                "height" : videoHeight  //视频的显示高度，请尽量使用视频分辨率高度
            });
        }

        return false;
    });

    $(".videoModal").delegate('.vClose', 'click', function() {
        var video = $('.videoModal').find('video').attr('id');
        if(player && isTcPlayer){
            $('#tcPlayer').html('');
        }else{
            $(video).trigger('pause');
        }

        $(this).closest('.videoModal').removeClass('vshow');
        $('.videoModal').removeClass('vshow');
        $('.markBox').removeClass('show');
        return false;
    });

    getComment();

    function getComment(tr){
        var page = 1, pageSize = 3;
        var where = $('.goodMark li.active').data('id');
        where = where ? '&'+where : '';
        if(tr){
            $('#commentList').html('');
        }
        $.ajax({
            url: masterDomain + '/include/ajax.php?service=member&action=getComment&type=pension-store&isAjax=0&aid='+infoData.id+where+'&page='+page+'&pageSize='+pageSize,
            type: 'get',
            dataType: 'jsonp',
            success: function(data){
                if(data && data.state == 100){
                    var list = data.info.list;
                    var pageInfo = data.info.pageInfo;
                    var html = [];
                    for(var i = 0; i < list.length; i++){
                        var d = list[i];
                        if(d.content == '' && d.pics.length == 0) continue;

                        html.push('<li class="fn-clear comm_li" data-id="'+d.id+'">');
                        html.push('<div class="pic_l"><img src="'+(d.user.photo ? d.user.photo : (staticPath + 'images/noPhoto_60.jpg') )+'" alt=""></div>');
                        html.push('<div class="right_c">');
                        html.push('<p class="peo_name">'+(d.isanony==1 ? '匿名' : d.user.nickname)+'</p>');
                        html.push('<p class="comm_p">'+d.content+'</p>');
                        if(d.pics.length){
                            html.push('<div class="img_ul">');
                            html.push('<ul class="fn-clear">');
                            for(var n = 0; n < d.pics.length; n++){
                                if(n>2) break;
                                html.push('<li><img src="'+d.pics[n]+'" alt=""></li>');
                            }
                            html.push('</ul>');
                            html.push('<p class="img_num"><span>'+d.pics.length+'</span>张</p>');
                            html.push('</div>');
                        }
                        html.push('<div class="pub_time fn-clear">');
                        html.push('<span class="time">'+huoniaoTools.transTimes(d.dtime,3)+'<em class="clock">'+huoniaoTools.transTimes(d.dtime,4)+'</em></span>');
                        html.push('<p class="pub_hd"><span class="zan_num'+(d.zan_has == "1" ? " active" : "")+'">'+d.zan+'</span></p>');
                        html.push('</div>');
                        html.push('</div>');
                        html.push('</li>');
                    }
                
                    $('.comment_total').text(pageInfo.totalCount);
                    $('#comment_good').text(pageInfo.sco4 + pageInfo.sco5);
                    $('#comment_middle').text(pageInfo.sco2 + pageInfo.sco3);
                    $('#comment_bad').text(pageInfo.sco1);
                    $('#comment_pic').text(pageInfo.pic);

                    $('.proBox').each(function(i){
                        var t = $(this), s = t.find('s'), num = t.find('.num'), r = 0, n = 0;
                        if(i == 0){
                            n = pageInfo.sco5;
                        }else if(i == 1){
                            n = pageInfo.sco4;
                        }else if(i == 2){
                            n = pageInfo.sco3;
                        }else if(i == 3){
                            n = pageInfo.sco2;
                        }else if(i == 4){
                            n = pageInfo.sco1;
                        }
                        r = (n / pageInfo.totalCount * 100).toFixed(2);
                        s.width(r + '%');
                        num.text(n > 999 ? '999+' : n);
                    })

                    $('#comment_good_ratio').text(parseInt((pageInfo.sco4+pageInfo.sco5)/pageInfo.totalCount*100 ) + '%');
                    $('#commentList').html(html.join(""));
                }
            }
        });
    }

	//点赞
	var commentObj=$('#commentList');
    commentObj.delegate(".zan_num", "click", function(){
        var t = $(this), id = t.closest("li").attr("data-id");
        if(t.hasClass("active")) return false;
		var ncount = Number(t.text());
        var ncount1=ncount+1;
        

        if(id != "" && id != undefined){
            $.ajax({
                url: "/include/ajax.php?service=member&action=dingComment&type=add&id="+id,
                type: "GET",
                dataType: "json",
                success: function (data) {
                    t.addClass("active").html(ncount1);
                    //加1效果
                    var $i = $("<b>").text("+1");
                    var x = t.offset().left, y = t.offset().top;
                    $i.css({top: y - 10, left: x + 17, position: "absolute", color: "#E94F06"});
                    $("body").append($i);
                    $i.animate({top: y - 50, opacity: 0, "font-size": "2em"}, 800, function(){
                        $i.remove();
                    });

                }
            });
        }

    });

    var img_num=$('.img_ul li').size();
    $('.img_num span').text(img_num);

    //评论类型
    $('.goodMark ul').delegate('li', 'click', function(){
        $(this).addClass('active').siblings().removeClass('active')
        getComment(1);
    })

    //允许参观弹出
    $('.con_head').delegate('.order', 'click', function(){
        $('.info_mask').css('visibility','visible');
        return false;

    })
    //联系方式弹出
    $('.org_footer').delegate('.contact', 'click', function(){
        $('.contact_mask').show();

    })
    //联系方式关闭
    $('.contact_mask').delegate('.know', 'click', function(){
        $('.contact_mask').hide();

    })
     // 错误提示
    function showMsg(str){
      var o = $(".error");
      o.html('<p>'+str+'</p>').show();
      setTimeout(function(){o.hide()},1000);
    }
    //  表单验证
    function isPhoneNo(p) {
        var pattern = /^1[23456789]\d{9}$/;
        return pattern.test(p);
    }
    $('.info_con .sure').click(function(){

        var info_name = $('#info_name').val(), 
            info_phone = $('#info_phone').val(), 
            f = $(this) ;

        if(f.hasClass("disabled")) return false;

        if (!info_name) {
            showMsg('请填写联系人'); //请填写联系人
            return false;
        }else if (!info_phone) {
           showMsg('请填写联系电话'); //请填写联系电话
           return false;
        }else if (isPhoneNo($.trim(info_phone)) == false){
            showMsg('请填写正确的手机号');   //请填写正确的手机号
            return false;
        }

        var form = $("#yuform"), action = form.attr("action");

		$.ajax({
			url: action,
			data: form.serialize(),
			type: "POST",
			dataType: "json",
			success: function (data) {
				if(data && data.state == 100){
					$("#info_name").val('');
					$("#info_phone").val('');
                    $("#areaCode").val('86');
                    $(".areacode_span label").text('+86')
					$('.info_mask').css('visibility','hidden');
                    $('.org_mask2').show();
					f.removeClass("disabled").html(langData['siteConfig'][6][63]);
				}else{
					showMsg(data.info);
					f.removeClass("disabled").html(langData['siteConfig'][6][63]);
				}
			},
			error: function(){
				showMsg(langData['siteConfig'][20][183]);
				f.removeClass("disabled").html(langData['siteConfig'][6][63]);
			}
        });
        
    })
    $('.info_con .cancel').click(function(){
         $('.info_mask').css('visibility','hidden');
    })

    // 关闭
     $('.org_mask2 .konw').click(function(){
        $('.org_mask2').hide();
   
     })

  

})