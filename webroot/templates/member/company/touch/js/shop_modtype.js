$(function(){

  //APP端取消下拉刷新
  toggleDragRefresh('off');
  


  //本地团购、电商销售切换
  $('.choseTab li').click(function(){
    var tindex = $(this).index(),tid = $(this).attr('data-id'),txt = $(this).find('a').text();
    $(this).addClass('active').siblings('li').removeClass('active');
    $('.choseCon .comCon').eq(tindex).addClass('comshow').siblings('.comCon').removeClass('comshow');
    $('#modname').val(tid);
    $('.modname').html(txt+'模板');
    if(tindex == 1){//电商
      $('.saleItem.daodian').hide();
      //放大图片
      Zepto.fn.bigImage({
            artMainCon:".advWrap3",  //图片所在的列表标签
            show_Con:".img"
      });
    }else{
      $('.saleItem.daodian').show();
      //放大图片
      Zepto.fn.bigImage({
            artMainCon:".advWrap2",  //图片所在的列表标签
            show_Con:".img"
      });
    }

  })
  $('.choseTab li:first-child').click();


    //模板选完之后的下一步
    $('.nextStep').click(function(){

        var modAdrr = $('#modname').val();

            window.location.href = profileUrl+"?modAdrr="+modAdrr;


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
