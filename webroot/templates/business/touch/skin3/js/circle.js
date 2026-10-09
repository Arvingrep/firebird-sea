$(function(){
  var page = 1,mpage = 1, mload = 0,
  isload = 0;


  // 新增存储 获取定位
  var localData = utils.getStorage('circle_local');
  if(localData != null){
    var last = localData.time;
  }else{
    var last = 0;
  }
  var time = Date.parse(new Date());
  if(local == 'manual' || (time - last < 60*10*1000)){
    lat = localData.lat;
    lng = localData.lng;
    utils.setStorage('circle_local', JSON.stringify({'time': time, 'lng': lng, 'lat': lat, 'address': localData.address}));
  }else{
    //获取定位
    HN_Location.init(function (data) {
        if (data == undefined || data.address == "" || data.lat == "" || data.lng == "") {
        console.log('定位获取失败');
         } else {
             lat = data.lat;
             lng = data.lng;
         name = data.name;
             address = data.address instanceof Array ? data.address[0] : data.address;
         utils.setStorage('circle_local', JSON.stringify({'time': time, 'lng': lng, 'lat': lat, 'address':name}));
        setTimeout(function(){
           console.log(utils.getStorage('circle_local'));
        },1000)
        }
    });
  }

	  // 滚动加载
    var allh = $('body').height();
    var w = $(window).height();
    var scroll = allh - w;
    if ($(window).scrollTop() >= scroll && !isload) {
      console.log('测试下拉加载')
      getlist($('.new_box'),"nofollow")
    }

    // 获取列表数据
  function getlist(p,type) {
    isload = 1;
    p.append('<div class="loading_tip"><img src="' + templets_skin + 'images/loading.png" ></div>');
    url = "/include/ajax.php?service=circle&action=tlist";
    data = {
      'page': page,
      'pageSize': 10,
      'orderby': 1,
      'u': 1,
      'uid': uid,
      'lat':lat,
      'lng':lng
    }
    $.ajax({
      url: url,
      type: "GET",
      data: data,
      dataType: "json", //指定服务器返回的数据类型
      crossDomain: true,
      success: function(data) {
        if (data.state == 100) {
          var list = [];
          var datalist = data.info.list;
          $('.nav_box .li_on').attr('data-total', data.info.pageInfo.totalPage);

          for (var i = 0; i < datalist.length; i++) {
            var d = datalist[i];
                      var clsname = ''
                        if(d.isfollow==1){
                          clsname = 'cared'
                          ctxt = langData['circle'][0][50] ;//已关注
                        }else{
                          clsname = '';
                          ctxt = langData['circle'][0][1] ;//关注
                        }
                        var level = (d.level!="0")?Number(d.level):0;
                        var levicon = (d.level!="0")?"":"fn-hide"
            var levelname = d.levelname?d.levelname:langData['circle'][3][25];   //普通会员
                        //是否热门
                        var hottag = (d.zan*1>customhot*1?"hot_con":"");
            list.push('<li class="li_box" data-id="' + d.id + '" data-url="' + d.url + '">');
            if (p == $('.recgz_ul')) { //关注板块的
              list.push('<div class="rec_tip"><p>'+langData['circle'][3][26]+'</p></div>')  //来自你参与的话题
            }
            /* 作者信息s */
            list.push('<a href="'+masterDomain+'/user/'+d.userid+'" class="art_ib"><div class="left_head">');
            if (d.photo) {
                var phonimg = d.photo;
              }else{
                var phonimg = "/static/images/noPhoto_40.jpg";
              }
            list.push('<img src="' +phonimg + '" /><div class="v_log '+levicon+'">');
            list.push('<img src="' + templets_skin + 'images/vip.png" /></div></div>');
            list.push('<div class="r_info vip_icon">');
            list.push('<h4><span class="artname">' + (d.username) + '</span><div class="lBox level_'+level+'">'+(d.levelicon ? '<i><img src="'+ d.levelicon +'"></i>' : '')+'<span>'+levelname+'</span></div></h4>');
            list.push('<p class="pub_time">' + d.pubdate1 +"  "+ (type=='fujin'?d.juli:"") +'</p></div>');

            if (p[0] == $('.recgz_ul')[0]) { //关注板块的
              list.push('<a href="javascript:;" class="care_btn '+clsname+'" data-userid ="'+d.userid+'">'+ ctxt +'</a>');
            }
                      list.push('</a>')
            /* 作者信息e */

            list.push('<div class="art_con '+hottag+'"><a href="' + d.url + '" class="dt_detail">' + (d.content ? "<h2>" + d.content +
              "</h2>" : ""));
            //图片内容
            if (d.media.length == 2 || d.media.length == 4) {
              list.push('<div class="img_box fn-clear">');
              for (var m = 0; m < d.media.length; m++) {
                list.push('<div class="img_item d_img"><img data-url=' + d.media[m] + ' src='+d.media[m]+'></div>');
              }
              list.push('</div>');
            } else if (d.media.length > 4 || d.media.length == 3) {
              var imglen = d.media.length > 9 ? 9 : d.media.length
              list.push('<div class="img_box fn-clear">');
              for (var l = 0; l < imglen; l++) {
                list.push('<div class="img_item m_img"><img data-url=' + d.media[l] + ' src='+d.media[l]+'></div>');
              }
              list.push('</div>');
            } else if (d.media.length == 1) {
              list.push('<div class="img_box fn-clear">');
              /*一张图片判断尺寸   <div class="img_item h_img video_item"><img src="{#$templets_skin#}upfiles/bg1.jpg"><em>0:56</em></div>*/
              list.push('<div class="img_item v_img"><img data-url=' + d.media[0] + ' src='+d.media[0]+'></div>')
              list.push('</div>');
            }else if(d.media.length==0 && d.videoadr!=''){
              list.push('<div class="img_box fn-clear">');
              var img_v = (d.thumbnail=="")?templets_skin+'images/sv_icon.png':d.thumbnail
              list.push('<div class="img_item h_img video_item"><img data-url="'+img_v+'" src=/static/images/blank.gif"></div>')
              list.push('</div>');
            }

            list.push('</a>')
            // 链接
                        if(d.commodity != '' && d.commodity.length>0){
                           list.push('<a class="link_out" href="'+d.commodity[0]['url']+'"><div class="left_img"><img src="' +d.commodity[0]['litpic']+
               '"></div><p>'+d.commodity[0]['title']+'</p></a>');
                           }


            // 话题链接
                      if(d.topictitle){
                         list.push('<a class="topic_link" href="'+d.topicurl+'">'+d.topictitle+'</a>');
                        }

            // 定位
                       if(d.addrname){
                         list.push('<a href="javascript:;" class="posi_link">'+d.addrname+'</a>');
                       }


            // 点赞按钮
            list.push('<div class="btn_group"><a href="javascript:;" class="r_btn"></a>');
            list.push('<div class="left_btns"><a href="javascript:;" class="comt_btn">' + (d.reply > 0 ? d.reply : "") +
              '</a>');
            if(d.isdz == '1'){
              var zclass = "zan_btn zaned";
            }else{
              var zclass = "zan_btn ";
            }
            list.push('<a href="javascript:;" class="'+zclass+'" data-did ="'+d.id+'" data-uid = "'+d.userid+'"><div class="canvas_box"><img src="' + templets_skin +
              'images/zan.gif" /></div><em>' + (d.up > 0 ? d.up : "") + '</em></a>');
            list.push('<a href="javascript:;" class="share_btn "></a><a href="javascript:;" class="HN_PublicShare hidea"  style="display:none;"></a></div></div>');

            // 点赞列表
            if (d.up != 0 || d.reply != 0) {
              list.push('<div class="comt_box">');
              if (d.up != 0) {
                list.push('<div class="zan_box"><ul class="zan_ul fn-clear">');
                // console.log(d);
                for (var a = 0; a < ((d.dianres.length)>8?8:(d.dianres.length)); a++) {

                  list.push('<li class="zan_li"> <a href="'+masterDomain+'/user/'+ d.dianres[a].id +'#circle"><img src="/include/attachment.php?f=' +  d.dianres[a].photo + ' " onerror="this.src= \'/static/images/noPhoto_100.jpg\'"></a> </li>')
                }
                list.push('<a href="javascript:;" class="zan_count"><em>' + d.up +langData['siteConfig'][46][57]+ '</em></a>')//赞
                list.push('</ul></div>');
              }
              if (d.reply != 0) {
                list.push('<div class="comt_list"><ul class="comt_ul">');
                for (var n = 0; n < d.lastReply.length; n++) {
                  list.push('<li class="comt_li" data-plid = "'+d.lastReply[n].id+'"> <a href="javascript:;">'+d.lastReply[n].nickname+'</a>：'+d.lastReply[n].content+' </li>')
                }
                if (d.lastReply.length == "3") {
                  list.push('<a href="'+d.url+'" class="comt_detail">'+langData['business'][5][129].replace('1',d.reply)+'></a>');//全部1条评论
                }
                list.push('</ul><div class="commt_btn">'+langData['circle'][0][53]+'</div></div>');  /* 写评论*/

              }
              list.push('</div>')
            }

            list.push('</div></li>')
          }
          p.find('.loading_tip').remove();
          if(page==1){
            p.html(list.join(''));
          }else{
            p.append(list.join(''));
          }

          setTimeout(function() {
            isload = 0;
            page++;
            $('.nav_box .li_on').attr('data-page', page);
            if (page > data.info.pageInfo.totalPage) {
              p.append('<div class="loading_tip">'+ langData['circle'][0][54]+'</div>');   /*  没有更多了~  */
              isload = 1;
            }

          }, 1000)
           $("img").scrollLoading();

        } else {
          isload = 0;
          p.find('.loading_tip').remove();
          if ($('.nav_box .li_on').index() != 1) {
            p.append('<div class="loading_tip">'+ langData['circle'][0][55]+'</</div>');   /*  暂无数据  */
          } else if ($('.gz_ulbox li').length == 0 && $('.gz_ulbox')[0]==p[0]) {
            // && p== $('.gz_ulbox')
            $('.gz_ulbox').hide();
            $('.rec_box').show();
            getlist($('.recgz_ul'),"nofollow");
          } else {
                        p.find('.loading_tip').remove();
            p.append('<div class="loading_tip">'+ langData['circle'][0][55] +'</div>'); /*  暂无数据  */
          }
        }
      },
      error: function(err) {
        console.log('fail');
        isload = 0;
        console.log("改变isload")
      }
    });
  }
  // 评论
  $('body').delegate('.commt_btn,.comt_btn', 'click', function() {
    scroll = $(this).offset().top;
    var id = $(this).parents('.li_box').attr('data-id')
    pHeight = $(this).parents('.li_box').height()
    $('.bottom_box,.mask_re').show();
    $('.bottom_box').attr('data-reply',id);
        $('.bottom_box').removeAttr('data-type');
    $('#reply').focus();
    $('html').addClass('noscroll');
  });
  $('.mask_re').on('click', function() {
    $('.bottom_box #reply').blur();
    $('.bottom_box,.mask_re').hide();
    $('.bq_box').removeClass('show');
    $('.bq_btn').removeClass('bq_open');
  });
  $('#reply').click(function(){
    var t = $(this);
     $('.bq_btn').removeClass('bq_open');
     $('.bq_box').removeClass('show')
  })
  // 隐藏评论框
  $('.bottom_box #reply').blur(function() {
    scroll = 0;
    $('html').removeClass('noscroll');
  });

  // 更多
  $('body').delegate('.btn_group .r_btn', 'click', function() {
    var t = $(this),
      id = t.parents('.li_box').attr('data-id');
    var name = t.parents('.li_box').find('.r_info h4 .artname').text();
    var title = t.parents('.li_box').find('.art_con h2').text();
    $('.mask_more').show();
    $('html').addClass('noscroll');
    $('.more_box').animate({
        'bottom': 0
      }, 150)
      .attr('data-id', id)
      .attr('data-name', name)
      .attr('data-title', title);
  });

  // 隐藏更多
  $('.mask_more,.cancel_btn').click(function() {
    $('.mask_more').hide();
    $('html').removeClass('noscroll')
    $('.more_box').animate({
        'bottom': '-4.1rem'
      }, 150)
      .removeAttr('data-id')
      .removeAttr('data-name')
      .removeAttr('data-title');
  });
  // 点赞
  $('body').delegate('.zan_btn', 'click', function() {
    var userid = $.cookie(cookiePre + "login_user");
    if (userid == null || userid == "") {
      window.location.href = masterDomain + '/login.html';
      return false;
    }
    var t = $(this),
      num = t.find('em').text() == "" ? 0 : Number(t.find('em').text())
    var did = t.attr("data-did");
    var uid = t.attr("data-uid");
    $.ajax({
      url: "/include/ajax.php?service=circle&action=Fabulous",
      data:{'did':did,'fbuid':uid,'dzuid':dzuid},
      type:"POST",
      dataType:"json",
      success:function(data){
        // console.log(data.info);
        if(data.info =="ok"){
          if (t.hasClass('zaned')) {
              t.removeClass('zaned');
              num = num - 1;
          } else {
            t.find('.canvas_box').show();
            setTimeout(function() {
              t.find('.canvas_box').hide();
              t.addClass('zaned');
            }, 500)
            num = num + 1;
            }
          }
      t.find('em').text(num > 0 ? num : "");
      },
      error:function(){

      }
    });

  });

  // 短视频点赞

  $('body').delegate('.liBox .numZan','click',function(e){
    var t = $(this);
    var vid  = t.parent('._right').attr('data-id');
    var uid = t.parent('._right').attr('data-uid');
    var num = t.text()*1;
    var userid = $.cookie(cookiePre + "login_user");
    if (userid == null || userid == "") {
      window.location.href = masterDomain + '/login.html';
      return false;
    }
    $.ajax({
      url: "/include/ajax.php?service=circle&action=Fabulous",
      data:{'did':vid,'fbuid':uid,'dzuid':dzuid},
      type:"POST",
      dataType:"json",
      success:function(data){
        // console.log(data.info);
        if(data.info =="ok"){
          if (t.hasClass('onclick')) {
              t.removeClass('onclick');
              num = num - 1;
          } else {
            t.find('.canvas_box').show();
            setTimeout(function() {
              t.addClass('onclick');
            }, 500)
            num = num + 1;
          }
        }
        t.text(num > 0 ? num : "");
        return false;
      },
      error:function(){

      }
    });
    return false;

  })
  //打赏
  var dashangElse = false;
  $('.ds_btn').click(function() {
    var t = $(this),
      newsid = t.parents('.more_box').attr('data-id');
    name = t.parents('.more_box').attr('data-name')
    if (t.hasClass("load")) return;
    t.addClass("load");
    //验证文章状态
    $.ajax({
      "url": "/include/ajax.php?service=circle&action=checkRewardState",
      "data": {
        "aid": newsid
      },
      "dataType": "jsonp",
      success: function(data) {
        t.removeClass("load");
        if (data && data.state == 100) {

          $('.mask').show();
          $('.shang-box').show();
          $('.shang-item-cash').show();
          $('.shang-item .inp').show();
          $('.shang-item .shang-else').hide();
          $('body').bind('touchmove', function(e) {
            e.preventDefault();
          });
          $('.shang_to').find('span').text(name)

        } else {
          alert(data.info);
        }
      },
      error: function() {
        t.removeClass("load");
        alert(langData['circle'][0][65]);     /* 网络错误，操作失败，请稍候重试！*/
      }
    });
  });

  // 其他金额
  $('.shang-item .inp').click(function() {
    $(this).hide();
    $('.shang-item-cash').hide();
    $('.shang-money .shang-item .error-tip').show()
    $('.shang-item .shang-else').show();
    dashangElse = true;
    $(".shang-else input").focus();
  })

  // 遮罩层
  $('.mask').on('click', function() {
    $('.mask').hide();
    $('.shang-money .shang-item .error-tip').hide()
    $('.shang-box').hide();
    $('.paybox').animate({
      "bottom": "-100%"
    }, 300)
    setTimeout(function() {
      $('.paybox').removeClass('show');
    }, 300);
    $('body').unbind('touchmove')
  })

  // 关闭打赏
  $('.shang-money .close').click(function() {
    $('.mask').hide();
    $('.shang-box').hide();
    $('.shang-money .shang-item .error-tip').hide()
    $('body').unbind('touchmove')
  })

  // 选择打赏支付方式
  var amount = 0;
  $('.shang-btn').click(function() {
    var newsid = $('.more_box').attr('data-id')
    amount = dashangElse ? parseFloat($(".shang-item input").val()) : parseFloat($(".shang-item-cash em").text());
    var regu = "(^[1-9]([0-9]?)+[\.][0-9]{1,2}?$)|(^[1-9]([0-9]+)?$)|(^[0][\.][0-9]{1,2}?$)";
    var re = new RegExp(regu);
    if (!re.test(amount)) {
      amount = 0;
      alert(langData['circle'][0][66]);   /* 打赏金额格式错误，最少0.01元！*/
      return false;
    }

    var app = device.indexOf('huoniao') >= 0 ? 1 : 0;
    location.href = "/include/ajax.php?service=tieba&action=reward&aid=" + newsid + "&amount=" + amount + "&app=" +app;
    return;

    $('.shang-box').animate({
      "opacity": "0"
    }, 300);
    setTimeout(function() {
      $('.shang-box').hide();
    }, 300);

    //如果不在客户端中访问，根据设备类型删除不支持的支付方式
    if (appInfo.device == "") {
      // 赏
      if (navigator.userAgent.toLowerCase().match(/micromessenger/)) {
        $("#shangAlipay, #shangGlobalAlipay").remove();
      }
      // else{
      //  $("#shangWxpay").remove();
      // }
    }
    $(".paybox li:eq(0)").addClass("on");

    $('.paybox').addClass('show').animate({
      "bottom": "0"
    }, 300);
  })

  $('.paybox li').click(function() {
    var t = $(this);
    t.addClass('on').siblings('li').removeClass('on');
  })

  //提交支付
  $("#dashang").bind("click", function() {

    var regu = "(^[1-9]([0-9]?)+[\.][0-9]{1,2}?$)|(^[1-9]([0-9]+)?$)|(^[0][\.][0-9]{1,2}?$)";
    var re = new RegExp(regu);
    if (!re.test(amount)) {
      amount = 0;
      alert(langData['circle'][0][66]);  /* 打赏金额格式错误，最少0.01元！*/
      return false;
    }

    var paytype = $(".paybox .on").data("id");
    if (paytype == "" || paytype == undefined) {
      alert(langData['circle'][0][67]);   /* 请选择支付方式！*/
      return false;
    }

    //非客户端下验证支付类型
    if (appInfo.device == "") {
      if (paytype == "alipay" && navigator.userAgent.toLowerCase().match(/micromessenger/)) {
        showErr(langData['circle'][0][68]);  /*微信浏览器暂不支持支付宝付款<br />请使用其他浏览器！ */
        return false;
      }

      location.href = "/include/ajax.php?service=circle&action=reward&aid=" + newsid + "&amount=" + amount +
        "&paytype=" + paytype;
    } else {
      location.href = "/include/ajax.php?service=circle&action=reward&aid=" + newsid + "&amount=" + amount +
        "&paytype=" + paytype + "&app=1";
    }


  });


  //举报按钮
  $('.jb_btn').click(function() {
    JubaoConfig.id = $(this).parents('.more_box').attr('data-id');
    $('.jubao_box').show();
    $('.jubao_detail h4').find('em').text($(this).parents('.more_box').attr('data-name'));
    $('.jubao_title').text($(this).parents('.more_box').attr('data-title'));

  });


  // 举报提交
  var JuMask = $('.JuMask'),
    JubaoBox = $('.jubao_box');
  $('.content_box .sub').click(function() {

    var t = $(this);
    if (t.hasClass('disabled')) return;
    if ($('.jubap_type input').val() == '') {
      showErr(langData['siteConfig'][24][2]); //请选择举报类型
    } else if ($('.contact input').val() == "") {
      showErr(langData['siteConfig'][20][459]); //请填写您的联系方式
    } else {

      var type = $('.jubap_type input').val();
      var desc = $('.jubao_content .con textarea').val();
      var phone = $('.contact input').val();

      if (JubaoConfig.module == "" || JubaoConfig.action == "" || JubaoConfig.id == 0) {
        showErr('Error!');
        setTimeout(function() {
          JubaoBox.hide();
          JuMask.removeClass('show');
        }, 1000);
        return false;
      }

      t.addClass('disabled').html(langData['circle'][0][69]);   /* 正在提交*/

      $.ajax({
        url: "/include/ajax.php",
        data: "service=member&template=complain&module=" + JubaoConfig.module + "&dopost=" + JubaoConfig.action +
          "&aid=" + JubaoConfig.id + "&type=" + encodeURIComponent(type) + "&desc=" + encodeURIComponent(desc) +
          "&phone=" + encodeURIComponent(phone),
        type: "GET",
        dataType: "jsonp",
        success: function(data) {
          t.removeClass('disabled').html(langData['siteConfig'][6][151]); //提交
          if (data && data.state == 100) {
            showErr(langData['siteConfig'][21][242]); //举报成功！
            setTimeout(function() {
              JubaoBox.hide();
              JuMask.removeClass('show');
            }, 1500);

          } else {
            showErr(data.info);
          }
        },
        error: function() {
          t.removeClass('disabled').html(langData['siteConfig'][6][151]); //提交
          showErr(langData['siteConfig'][20][183]); //网络错误，请稍候重试！
        }
      });

    }
  });

  //关闭举报窗口
  $('.jubao .close_btn').click(function() {
    $('.jubao_box').hide();
    $('.jubao_box').find('input').val('');
    $('.jubao_box').find('textarea').val('');
    $('.chosebox').removeClass('show');
  });

  //举报类型选择
  $('.jubap_type').click(function(e) {
    $('.chosebox').addClass('show');
    $(document).one('click', function() {
      $('.chosebox').removeClass('show');
    });
    e.stopPropagation();
  });
  $('.chose_ul li').click(function() {
    var txt = $(this).text();
    $('.chosebox').removeClass('show');
    $('.jubap_type input').val(txt);
    return false;
  });

  //计算输入的字数
  $(".jubao_content ").bind('input propertychange', 'textarea', function() {
    var length = 100;
    var content_len = $(".jubao_content textarea").val().length;
    var in_len = length - content_len;
    if (content_len >= 100) {
      $(".jubao_content textarea").val($(".jubao_content textarea").val().substring(0, 100));
    }
    $('.jubao_content dt em').text($(".jubao_content textarea").val().length);

  });
  // 分享
  $('body').delegate('.share_btn', 'click', function() {
    var t = $(this),
      p = t.parents('.li_box');
    var url = p.attr('data-url'),
      desc = p.find('.art_con h2').text()
    img_url = p.find('.img_item:nth-child(1) img').attr('src');
    wxconfig['link'] = url;
    wxconfig['title'] = desc;
    wxconfig['img_url'] = img_url;
    wxconfig['description'] = desc;
    $(this).siblings('.HN_PublicShare').click();
  });





      function pullrefresh() {
      isload = 0;
      $('.li_on').attr('data-page','1');
      if($('.li_on').attr('data-id')=='1'){
        getlist($('.gz_ulbox'),'follow')
      }else if($('.li_on').attr('data-id')=='0'){
        var p =$('#tabs-container>.swiper-wrapper>.swiper-slide').eq(1).find('.tab_con ul.show');
        getlist(p)
      }else if($('.li_on').attr('data-id')=='3'){
        if($('.near_dt').hasClass('show')){
          getlist($('.near_dt'),"fujin");
        }else{
          aplist();
        }

      }else if($('.li_on').attr('data-id')=='4'){
        topiclist()
      }else if($('.li_on').attr('data-id')=='2'){
        $('.sv_list>ul').html('');
        getsvlist()
      }
      }


    // 表情
    // 选择表情

      $('.reply_box a').click(function() {
        if (!$(this).hasClass('bq_btn')) {
          $('.bq_box').removeClass('show');
          $('bq_btn').addClass()
        } else {
          var t = $(this);

          if (!t.hasClass('bq_open')) {
            $('.bq_btn').addClass('bq_open');
            $('.bq_box').addClass('show');
          } else {
            $('.bq_btn').removeClass('bq_open');
            $('.bq_box').removeClass('show');
          }
          // $(window).scrollTop(0)
        }
      });

      //点击表情，输入
      var memerySelection;
      var userAgent = navigator.userAgent.toLowerCase();
      $('.emot_li').click(function() {
        var t = $(this);
        var emojsrc = t.find('img').attr('src');
        console.log(emojsrc)
        memerySelection = window.getSelection();
        if (/iphone|ipad|ipod/.test(userAgent)) {
          $('#reply').append('<img src="' + emojsrc + '" class="emotion-img" />');
          return false;

        } else {
          set_focus($('#reply:last'));
          pasteHtmlAtCaret('<img src="' + emojsrc + '" class="emotion-img" />');
        }
        // $('.input_container .inbox:before').css('display',"none")
        document.activeElement.blur();
        return false;
      })

      //根据光标位置插入指定内容
      function pasteHtmlAtCaret(html) {
        var sel, range;
        if (window.getSelection) {
          sel = memerySelection;
          // console.log(sel)
          if (sel.anchorNode == null) {
            return;
          }
          if (sel.getRangeAt && sel.rangeCount) {

            range = sel.getRangeAt(0);
            range.deleteContents();
            var el = document.createElement("div");
            el.innerHTML = html;
            var frag = document.createDocumentFragment(),
              node, lastNode;
            while ((node = el.firstChild)) {
              lastNode = frag.appendChild(node);
            }
            range.insertNode(frag);
            if (lastNode) {
              range = range.cloneRange();
              range.setStartAfter(lastNode);
              range.collapse(true);
              sel.removeAllRanges();
              sel.addRange(range);
            }
          }

        } else if (document.selection && document.selection.type != "Control") {
          document.selection.createRange().pasteHTML(html);
        }
      }
      //光标定位到最后
      function set_focus(el) {
        el = el[0];
        el.focus();
        if ($.browser.msie) {
          var rng;
          el.focus();
          rng = document.selection.createRange();
          rng.moveStart('character', -el.innerText.length);
          var text = rng.text;
          for (var i = 0; i < el.innerText.length; i++) {
            if (el.innerText.substring(0, i + 1) == text.substring(text.length - i - 1, text.length)) {
              result = i + 1;
            }
          }
          return false;
        } else {
          var range = document.createRange();
          range.selectNodeContents(el);
          range.collapse(false);
          var sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }
      // 回复评论
  $('.content_box').delegate('.comt_li','click',function(){
    var rid = $(this).attr('data-plid');
    $('.bottom_box').attr('data-reply',rid);
    $('.bottom_box').attr('data-type','reply');
    $('.bottom_box,.mask_re').show();

    $('#reply').focus();
    $('html').addClass('noscroll');
  });

  // 发送评论
  $('.send_btn').click(function(){
    var t = $(this);
    var replyid = t.parents('.bottom_box').attr('data-reply');
    var rtype = t.parents('.bottom_box').attr('data-type');
    if(rtype=='reply'){
      var url = '/include/ajax.php?service=member&action=replyComment&check=1&id=' + replyid;
    }else{
      var url = '/include/ajax.php?service=member&action=sendComment&check=1&type=circle-dynamic&aid=' + replyid;
    }
    var userid = $.cookie(cookiePre + "login_user");
    var con = $('#reply').html();  //去掉回车和空格
    console.log(con);
    if (userid == null || userid == "") {
      window.location.href = masterDomain + '/login.html';
      return false;
    }
    if(con==''){
      showErr(langData['circle'][3][20]);return false;  //请输入评论内容
    }else{
      $.ajax({
          url: url,
          data: "content=" + encodeURIComponent(con),
          type: "POST",
          dataType: "json",
          success: function(data) {
            if (data && data.state == 100) {
              if (data.info.ischeck == 1) {
                alert(langData['circle'][3][21]);    //回复成功！
                location.reload();
              } else {
                alert(langData['circle'][3][22]);  //评论成功，请等待管理员审核！
              }


            } else {
              alert(data.info);
            }
          },
          error: function() {
            alert(langData['circle'][3][23]);  //网络错误，发表失败，请稍候重试！
          }
      });
    }

  });

})
