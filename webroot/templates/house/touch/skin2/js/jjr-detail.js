$(function(){

  var xiding = $(".main_titleList_l");
  var chtop = parseInt(xiding.offset().top);
  var pageSize = 10;

  $(window).on("scroll", function() {
    var thisa = $(this);
    var st = thisa.scrollTop();
    if (st >= chtop) {
      $(".main_titleList_l").addClass('choose-top');
      if (device.indexOf('huoniao_iOS') > -1) {
        $(".main_titleList_l").addClass('padTop20');
      }
    } else {
      $(".main_titleList_l").removeClass('choose-top padTop20');
    }

    var active = $('.main_titleList_l li.active'), index = active.index();
    if(index == 0 || active.attr('data-lock') == "1") return;
    var top = $('.main-list > div').eq(index).children('.loading').offset().top;
    var winh = $(window).height();
    console.log(top + '--' + st + '==' + winh)
    if(top - st + $('.bottom-fixed-container').height() + 50 > winh){
      getList();
    }

  });

  $('.gd').click(function(){
    var t = $(this);
    var index = t.hasClass('sale') ? 1 : 2;
    $('.main_titleList_l li:eq('+index+')').click();
  })

  $('.main_titleList .main_titleList_l ul li').click(function(){
    var t = $(this);
    var index = t.index();
    var box = $('.main-list>div:eq('+index+')');
    if(!t.hasClass('active')){
      t.addClass('active');
      t.siblings().removeClass('active');
      if(box.children('.house-list').html() == ''){
        getList();
      }
    }
    box.show().siblings().hide();
  });

  function getList(){
    var active = $('.main_titleList_l li.active'), index = active.index(), lock = active.attr('data-lock'), type = active.attr('data-type'), page = active.attr('data-page');
    if(index == 0 || lock == 1) return;
    page = page == undefined ? 1 : page;

    active.attr('data-lock', 1);
    var fun = 'insert_'+type;

    var wrap = $('.main-list > div').eq(index);
    var box = wrap.children('.house-list');
    wrap.children('.loading').remove();
    wrap.append('<p class="loading">正在加载，请稍后</p>');
    active.attr({'data-lock': 1});

    $.ajax({
      url: '/include/ajax.php?service=house&action='+type+'List&zj='+zjuid+'&pageSize='+pageSize+'&page='+page,
      type: 'get',
      dataType: 'json',
      success: function(data){
        if(data && data.state == 100){
          var list = data.info.list, pageInfo = data.info.pageInfo;
          var html = [];
          if(type == 'sale'){
            for(var i = 0; i < list.length; i++){
              var d = list[i];

              html.push('<div class="house-box">');
              html.push('<a href="'+d.url+'">');
              html.push('<div class="house-item">');
              html.push('<div class="house-img l">');
              html.push('<i class="house_disk"></i><img src="'+d.litpic+'">'+(d.video ? '<i class="play_img"></i>' : '')+(d.qj ? '<i class="VR_img"></i>' : ''));
              html.push('</div>');
              html.push('<dl class="l">');
              html.push('<dt>'+(d.isbid ? '<i class="set_top"></i>' : '')+'<em>'+d.title+'</em>'+(d.qj ? '<span class="label_01">全景</span>' : '')+'</dt>');
              var price = '';
              if(d.price > 0){
                price = '<span class="price r">'+d.price+'万'+echoCurrency('short')+'</span>';
              }else{
                price = '<span class="price r">面议</span>';
              }
              html.push('<dd class="item-area"><em>'+d.room+'</em><em>'+d.area+echoCurrency('areasymbol')+'</em>'+price+'</dd>');
              html.push('<dd class="item-type-1 fn-clear"><em class="l">'+d.community+'</em><em class="r">均价 '+d.unitprice+'/'+echoCurrency('areaname')+'</em></dd>');
              html.push('</dl>');
              html.push('</div>');
              html.push('<div class="clear"></div>');
              html.push('</a>');
              html.push('</div> ');
            }

          }else if(type == 'zu'){
            for(var i = 0; i < list.length; i++){
              var d = list[i];

              html.push('<div class="house-box">');
              html.push('<a href="'+d.url+'">');
              html.push('<div class="house-item">');
              html.push('<div class="house-img l">');
              html.push('<i class="house_disk"></i><img src="'+d.litpic+'">'+(d.video ? '<i class="play_img"></i>' : '')+(d.qj ? '<i class="VR_img"></i>' : ''));
              html.push('</div>');
              html.push('<dl class="l">');
              html.push('<dt>'+(d.isbid ? '<i class="set_top"></i>' : '')+'<em>'+d.title+'</em>'+(d.qj ? '<span class="label_01">全景</span>' : '')+'</dt>');
              var price = '';
              var junjia = '';
              if(d.price > 0){
                price = '<span class="price r">'+d.price+''+echoCurrency('short')+'/月</span>';
                junjia = '<em class="r">均价 '+Math.ceil(d.price / d.area)+''+echoCurrency('short')+'/'+echoCurrency('areaname')+'</em>';
              }else{
                price = '<span class="price r">面议</span>';
              }
              html.push('<dd class="item-area"><em>'+d.rentype+'</em><em>'+d.room+'</em><em>'+d.area+echoCurrency('areasymbol')+'</em>'+price+'</dd>');
              html.push('<dd class="item-type-1 fn-clear"><em class="l">'+d.community+'</em>'+junjia+'</dd>');
              html.push('</dl>');
              html.push('</div>');
              html.push('<div class="clear"></div>');
              html.push('</a>');
              html.push('</div> ');
            }

          }else if(type == 'sp'){
            for(var i = 0; i < list.length; i++){
              var d = list[i];

              html.push('<div class="house-box">');
              html.push('<a href="'+d.url+'">');
              html.push('<div class="house-item">');
              html.push('<div class="house-img l">');
              html.push('<i class="house_disk"></i><img src="'+d.litpic+'">'+(d.video ? '<i class="play_img"></i>' : '')+(d.qj ? '<i class="VR_img"></i>' : ''));
              html.push('</div>');
              html.push('<dl class="l">');
              html.push('<dt>'+(d.isbid ? '<i class="set_top"></i>' : '')+'<em>'+d.title+'</em>'+(d.qj ? '<span class="label_01">全景</span>' : '')+'</dt>');
              var des = [];
              if(d.loupan){
                des.push(d.loupan);
              }
              if(d.zhuangxiu){
                des.push(d.zhuangxiu);
              }
              des.push(d.area+echoCurrency('areasymbol'));

              var price = '';
              var transfer = '';
              if(d.price > 0){
                price += '<strong>'+d.price+'</strong>';
                if(d.type == 1){
                  price += '<span>万</span>';
                  transfer = (d.price / d.area).toFixed(0) + '万/'+echoCurrency('areasymbol');
                }else{
                  price += '<span>'+echoCurrency('short')+'/月</span>';
                  if(d.type == 2){
                    transfer = '转让费：'+d.transfer+'万';
                  }else{
                    transfer = (d.price / d.area).toFixed(0) + ''+echoCurrency('short')+'/'+echoCurrency('areasymbol')+'•月';
                  }
                }
              }else{
                price += '<strong>待定</strong>';
              }

              html.push('<dd class="item-area sp_item-area"><em>'+des.join('|')+'</em><span class="price r">'+price+'</span></dd>');
              html.push('<dd class="item-type-1 sp-item-type-1 fn-clear"><em>'+d.address+'</em><em class="r">'+transfer+'</em></dd>');
              html.push('</dl>');
              html.push('</div>');
              html.push('<div class="clear"></div>');
              html.push('</a>');
              html.push('</div>');
            }

          }else if(type == 'xzl'){
            for(var i = 0; i < list.length; i++){
              var d = list[i];

              html.push('<div class="house-box">');
              html.push('<a href="'+d.url+'">');
              html.push('<div class="house-item">');
              html.push('<div class="house-img l">');
              html.push('<i class="house_disk"></i><img src="'+d.litpic+'">'+(d.video ? '<i class="play_img"></i>' : '')+(d.qj ? '<i class="VR_img"></i>' : ''));
              html.push('</div>');
              html.push('<dl class="l">');
              html.push('<dt>'+(d.isbid ? '<i class="set_top"></i>' : '')+'<em class="sp_title">'+d.title+'</em>'+(d.qj ? '<span class="label_01">全景</span>' : '')+'</dt>');
              var des = [];
              des.push(d.area+echoCurrency('areaname'));
              if(d.loupan){
                des.push(d.loupan);
              }
              if(d.zhuangxiu){
                des.push(d.zhuangxiu);
              }
              var price = '';
              if(d.type == 0){
                if(d.price > 0){
                  price = d.price + ''+echoCurrency('short')+'/'+echoCurrency('areaname')+'•月';
                }else{
                  price = '待定';
                }
              }else{
                if(d.price > 0){
                  price = d.price + '万';
                }else{
                  price = '待定';
                }
              }
              html.push('<dd class="item-area xzl-item-area"><em>'+des.join('|')+'</em><span class="price r">'+price+'</span></dd>');
              html.push('<dd class="item-type-1 xzl-item-type-1"><em>'+d.addr[d.addr.length-1]+'&nbsp;&nbsp;'+d.address+'</em><em class="r">'+d.area+echoCurrency('areasymbol')+'</em></dd>');
              html.push('</dl>');
              html.push('</div>');
              html.push('<div class="clear"></div>');
              html.push('</a>');
              html.push('</div>');
            }

          }else if(type == 'cf'){
            for(var i = 0; i < list.length; i++){
              var d = list[i];

              html.push('<div class="house-box">');
              html.push('<a href="'+d.url+'">');
              html.push('<div class="house-item">');
              html.push('<div class="house-img l">');
              html.push('<i class="house_disk"></i><img src="'+d.litpic+'">'+(d.video ? '<i class="play_img"></i>' : '')+(d.qj ? '<i class="VR_img"></i>' : ''));
              html.push('</div>');
              html.push('<dl class="l">');
              html.push('<dt>'+(d.isbid ? '<i class="set_top"></i>' : '')+'<em>'+d.title+'</em>'+(d.qj ? '<span class="label_01">全景</span>' : '')+'</dt>');
              var des = [];
              des.push(d.area+echoCurrency('areasymbol'));
              if(d.protype){
                des.push(d.protype);
              }
              var price = '<strong>待定</strong>';
              var transfer = '';
              if(d.type == 0){
                if(d.price > 0){
                  price = '<strong>'+d.price+'</strong><span>'+echoCurrency('short')+'/月</span>';
                  transfer = (d.price / d.area).toFixed(0) + ''+echoCurrency('short')+'/'+echoCurrency('areasymbol')+'•月';
                }
              }else if(d.type == 1){
                if(d.price > 0){
                  price = '<strong>'+d.price+'</strong><span>'+echoCurrency('short')+'/月</span>';
                }
                transfer = '转让费：' + d.transfer + '万';
              }else if(d.type == 2){
                if(d.price > 0){
                  price = '<strong>'+d.price+'</strong><span>万</span>';
                  transfer = (d.price / d.area).toFixed(0) + '万/'+echoCurrency('areasymbol');
                }
              }

              html.push('<dd class="item-area sp_item-area"><em>'+des.join('|')+'</em><span class="price r">'+price+'</span></dd>');
              html.push('<dd class="item-type-1 sp-item-type-1 fn-clear"><em>'+d.address+'</em><em class="r">'+transfer+'</em></dd>');
              html.push('</dl>');
              html.push('</div>');
              html.push('<div class="clear"></div>');
              html.push('</a>');
              html.push('</div>');
            }

          }else if(type == 'cw'){
            for(var i = 0; i < list.length; i++){
              var d = list[i];

              html.push('<div class="house-box">');
              html.push('<a href="'+d.url+'">');
              html.push('<div class="house-item">');
              html.push('<div class="house-img l">');
              html.push('<i class="house_disk"></i><img src="'+d.litpic+'">'+(d.video ? '<i class="play_img"></i>' : '')+(d.qj ? '<i class="VR_img"></i>' : ''));
              html.push('</div>');
              html.push('<dl class="l">');
              html.push('<dt><i class="set_top"></i><em class="sp_title">'+d.title+'</em></dt>');

              var des = [];
              des.push(d.area+'㎡');
              if(d.protype == 1){
                d.push('地下');
              }else if(d.protype == 2){
                d.push('地上');
              }
              if(d.mintime){
                d.push(d.mintime);
              }
              var price = '待定';
              var transfer = '';
              if(d.type == 0){
                if(d.price > 0){
                  price = d.price + ''+echoCurrency('short')+'/月';
                  transfer = (d.price / d.area).toFixed(0) + ''+echoCurrency('short')+'/'+echoCurrency('areasymbol')+'•月';
                }
              }else if(d.type == 1){
                if(d.price > 0){
                  price = d.price + '万';
                  transfer = (d.price / d.area).toFixed(0) + '万/'+echoCurrency('areasymbol');
                }
              }else if(d.type == 2){
                if(d.price > 0){
                  price = d.price + ''+echoCurrency('short')+'/月';
                }
                transfer = '转让费：' + d.transfer + '万';
              }
              html.push('<dd class="item-area xzl-item-area"><em>'+des.join('|')+'</em><span class="price r">'+price+'</span></dd>');
              html.push('<dd class="item-type-1 xzl-item-type-1"><em>'+d.address+'</em><em class="r">'+transfer+'</em></dd>');
              html.push('</dl>');
              html.push('</div>');
              html.push('<div class="clear"></div>');
              html.push('</a>');
              html.push('</div>');
            }
          }

          box.append(html.join(""));
          if(page == pageInfo.totalPage){
            wrap.children(".loading").text('已加载全部数据');
          }else{
            active.attr({'data-lock': 0, 'data-page': ++page});
          }

        }else{
          if(page == 1){
            wrap.children(".loading").text('暂无相关数据');
          }else{
            wrap.children(".loading").text('已加载全部数据');
          }
        }
      },
      error: function(){
        wrap.children(".loading").addClass('again').text('网络错误，点击重试');
        active.attr({'data-lock': 0});
      }
    })
  }

  $('.main-list').delegate('.loading', 'click', function(){
    if($(this).hasClass('again')) getList();
  })

    // 点击微信
    $('.contact_way .w').click(function(){
      $('.wx_frame').show();
      $('.desk').show();
    });
    $('.wx_frame .wx_cuo').click(function(){
      $('.wx_frame').hide();
      $('.desk').hide();
    });

    // 点击qq
    $('.contact_way .Q').click(function(){
        $('.qq_frame').show();
        $('.desk').show();
    });
    $('.qq_frame .qq_cuo').click(function(){
        $('.qq_frame').hide();
        $('.desk').hide();
    });
    // 点击电话
    $('.building_phone span').click(function(){
        $('.phone_frame').show();
        $('.desk').show();
    });
    $('.phone_frame .phone_cuo').click(function(){
        $('.phone_frame').hide();
        $('.desk').hide();
    });







































































})
