$(function(){

  //APP端取消下拉刷新
  toggleDragRefresh('off');
  

  Zepto.fn.bigImage({
      artMainCon:".advWrap" + (Number($('.choseTab .active').attr('data-id')) + 1),  //图片所在的列表标签
      show_Con:".img"
  });

  //本地团购、电商销售切换
  $('.choseTab li').click(function(e){
    e.stopPropagation();
    var tindex = $(this).index(),tid = $(this).attr('data-id'),txt = $(this).find('a').text();
    
    
    if(tindex == 1){//电商
        $('.saleItem.daodian').removeClass('curr');
      if($('.saleItem.daodian').hasClass('curr') || $('.saleItem.daodian').attr('data-count') > 0){
         var popOptions = {
            title:'温馨提示',
            confirmTip:'电商销售模板不支持到店消费类型，如需更改，请先至商品中取消选择到店消费选项。',
            isShow:true,
            noSure:true,
            btnCancelColor:'#3B7CFF',
            btnCancel:'我知道了'
          }
         confirmPop(popOptions,function(){})     
      }else{
        $(this).addClass('active').siblings('li').removeClass('active');
        $('.choseCon .comCon').eq(tindex).addClass('comshow').siblings('.comCon').removeClass('comshow');
        $('#modname').val(tid);
         $('.saleItem.daodian').hide();
        //放大图片
        Zepto.fn.bigImage({
            artMainCon:".advWrap3",  //图片所在的列表标签
            show_Con:".img"
        });
       }
      
    }else{
      $(this).addClass('active').siblings('li').removeClass('active');
      $('.choseCon .comCon').eq(tindex).addClass('comshow').siblings('.comCon').removeClass('comshow');
      $('#modname').val(tid);
      $('.saleItem.daodian').show();
      //放大图片
      Zepto.fn.bigImage({
            artMainCon:".advWrap2",  //图片所在的列表标签
            show_Con:".img"
      });
    }

  })

  
  if(!$('.moduleWrap').is(':hidden')){
    var modinfoData = utils.getStorage('modinfo');
    if(modinfoData){

        $('.moduleWrap .choseTab li[data-id="'+modinfoData.modname+'"]').click();
        var spAr = modinfoData.saletype.split(',');
        for(var i= 0;i<spAr.length;i++){
            $('.saleItem[data-id="'+spAr[i]+'"]').addClass('curr');
            var tcount = $('.saleItem[data-id="'+spAr[i]+'"]').attr('data-count');
            if(tcount > 0){
                $('.saleItem[data-id="'+spAr[i]+'"]').addClass('disabled');
                $('.saleItem[data-id="'+spAr[i]+'"] h3').append('<em>（店内相关商品'+tcount+'个）</em>');
            }else{
                $('.saleItem[data-id="'+spAr[i]+'"] h3').append('<em>（暂未发布相关商品）</em>');
            }
        }
        // utils.removeStorage('modinfo');
    }else{
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
    }
  }
  

  //商家自配、自提
  $('.changePs').click(function(e){
    var t = $(this);
    if(t.hasClass('disabled')) return false;
    var popOptions = {
      title:'确定申请同城配送方式改为商家自行配送？',
      confirmTip:'友情提示：审核通过后商家需自行配置配送范围及运费，并为所有相关商品添加运费模板，后续订单配送收入全归商家所有。',
      isShow:true,
      btnSure:'确定提交审核'
    }
    var pstype = t.closest('.saleItem').attr('data-id');
    if(configstate == '0'){
      popOptions.btnSure='确定'
      if(pstype =='2'){//平台配送
        popOptions.title="确定将平台配送改为商家配送？";
        popOptions.confirmTip='友情提示：商家需自行配置配送范围及运费，并为所有相关商品添加运费模板，后续订单配送收入全归商家所有。';

      }else{
        popOptions.title="确定向平台申请提供平台配送服务？";
        popOptions.confirmTip='友情提示：为您接入平台骑手配送服务平台配送省时省心 为您的商品提供多一种可能！';
      }
    }else{
       popOptions.btnSure='确定提交审核'
      if(pstype =='2'){//平台配送
        popOptions.title="确定申请平台配送方式改为商家自行配送？";
        popOptions.confirmTip='友情提示：审核通过后商家需自行配置配送范围及运费，并为所有相关商品添加运费模板，后续订单配送收入全归商家所有。';
      }else{
        popOptions.title="确定向平台申请提供平台配送服务？";
        popOptions.confirmTip='我们将尽快审核通过，为您接入平台骑手配送服务平台配送省时省心 为您的商品提供多一种可能！';
      }
    }
    
    confirmPop(popOptions,function(){
     
        if(configstate == '0'){
          var txt = ''
           if(pstype =='2'){//平台配送
              $(".saleItem.deliver h3 strong").html('商家自配')
                t.html('改为平台配送>');
                pstype = '3'
                txt = '商家自配'
            }else{//商家自配
              $(".saleItem.deliver h3 strong").html('平台配送')
               pstype = '2'
                t.html('改为商家自配>');
                txt = '平台配送'
            }
            $(".saleItem.deliver p").text('本店支持配送上门，当前配送方式为'+txt)
            $(".saleItem.deliver").attr('data-id',pstype)
        }else{

          $.ajax({
              url: masterDomain+"/include/ajax.php?service=shop&action=editPeisong&id="+id,
              type: 'post',
              dataType: 'json',
              success: function(data){
                  if(pstype =='2'){//平台配送
                      t.addClass('disabled').html('已申请商家自配，请等待审核');
                  }else{//商家自配
                      t.addClass('disabled').html('已申请平台配送，请等待审核');
                  }
              },
              error: function(data){
              showErrAlert(data.info);
              }
          });
          return false;
        }

    })
     e.stopPropagation()
  })
  //选择销售类型
  $('.saleWrap .saleItem').click(function(){
    if($(this).hasClass('disabled')) return false;
    $(this).toggleClass('curr');
  })

  //模板选完之后的下一步
  $('.nextStep').click(function(){
    if($('.saleWrap .saleItem.curr').size() == 0){
      showErrAlert('请选择销售类型!');
      return false;
    }
    if($('#modname').val() == 2){//电商销售
      $('.saleWrap .saleItem.daodian').removeClass('curr');
    }
    var tarr=[],tnamearr=[];
    $('.saleWrap .saleItem.curr').each(function(){
      var tid = $(this).attr('data-id');
      var tname = $(this).find('h3 strong').text();
      tarr.push(tid);
      tnamearr.push(tname);
    })
    $('#saletype').val(tarr.join(','));
    $('#salename').val(tnamearr.join(','));
    var modAdrr = {'modname': $('#modname').val(), 'saletype': tarr.join(','),'salename':tnamearr.join(',')}
    utils.setStorage('modinfo',JSON.stringify(modAdrr));
    setTimeout(function(){
      window.location.href = profileUrl;
    },500)
    
  })

  if(showflg == 1){
    $('.nextStep').click();
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
                        $('.areacode_span').closest('.f-item').hide();
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
        $(".areacode_span label").text(txt);
        $("#areaCode").val(txt.replace("+",""));

        $('.layer_code').hide();
        $('.mask-code').removeClass('show');
    })

    // 关闭弹出层
    $('.layer_close, .mask-code').click(function(){
        $('.layer_code').hide();
        $('.mask-code').removeClass('show');
    })



})






// 扩展zepto
$.fn.prevAll = function(selector){
    var prevEls = [];
    var el = this[0];
    if(!el) return $([]);
    while (el.previousElementSibling) {
        var prev = el.previousElementSibling;
        if (selector) {
            if($(prev).is(selector)) prevEls.push(prev);
        }
        else prevEls.push(prev);
        el = prev;
    }
    return $(prevEls);
};

$.fn.nextAll = function (selector) {
    var nextEls = [];
    var el = this[0];
    if (!el) return $([]);
    while (el.nextElementSibling) {
        var next = el.nextElementSibling;
        if (selector) {
            if($(next).is(selector)) nextEls.push(next);
        }
        else nextEls.push(next);
        el = next;
    }
    return $(nextEls);
};
