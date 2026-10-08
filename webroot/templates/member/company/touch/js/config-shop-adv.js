$(function(){

  //APP端取消下拉刷新
  toggleDragRefresh('off');
   // 上传店铺幻灯
  var hasCout = $('#slideShow_choose .hasimg').length; 
  var upslideShow = new Upload({
    btn: '#up_slideShow',
    bindBtn: '',
    title: 'Images',
    mod: 'shop',
    params: 'type=atlas',
    atlasMax: 5,
    has:hasCout,
    deltype: 'delAtlas',
    replace: true,
    fileQueued: function(file){
      $("#slideShow_choose .addImgLi").before('<li id="'+file.id+'" class="hasimg fn-clear"><div class="imgwrap"></div></li>');
    },
    uploadSuccess: function(file, response){
      if(response.state == "SUCCESS"){
        $('#'+file.id).html('<div class="imgwrap"><img src="'+response.turl+'" data-url="'+response.url+'" alt=""></div><div class="imgTxt"><input type="text" class="imglink" placeholder="请输入图片链接"></div><a href="javascript:;" class="close"></a>');
      }
    },
    uploadFinished: function(){
      if(this.sucCount == this.totalCount){
        // showErr('所有图片上传成功');
      }else{
        showErrAlert((this.totalCount - this.sucCount) + langData['siteConfig'][44][19].replace('1',''));//1张图片上传失败
      }

    },
    uploadError: function(){

    },
    showErr: function(info){
      showErrAlert(info);
    }
  });

  $('#slideShow_choose .slideshow').delegate('.close', 'click', function(){
    var t = $(this), val = t.parent().find('img').attr('data-url');
    upslideShow.del(val);
    t.parent().remove();

  })


  // 上传店铺视频
  var hasCout2 = $('#pcslideShow_choose .hasimg').length; 
  var uppcslideShow = new Upload({
    btn: '#up_pcslideShow',
    bindBtn: '',
    title: 'Images',
    mod: 'shop',
    params: 'type=atlas',
    atlasMax: 5,
    has:hasCout2,
    deltype: 'delAtlas',
    replace: true,
    fileQueued: function(file){
      $("#pcslideShow_choose .addImgLi").before('<li id="'+file.id+'" class="hasimg fn-clear"><div class="imgwrap"></div></li>');
    },
    uploadSuccess: function(file, response){
      if(response.state == "SUCCESS"){
        $('#'+file.id).html('<div class="imgwrap"><img src="'+response.turl+'" data-url="'+response.url+'" alt=""></div><div class="imgTxt"><input type="text" class="imgname" placeholder="请输入图片标题"><input type="text" class="imglink" placeholder="请输入图片链接"></div><a href="javascript:;" class="close"></a>');
      }
    },
    uploadFinished: function(){
      if(this.sucCount == this.totalCount){
        // showErr('所有图片上传成功');
      }else{
        showErrAlert((this.totalCount - this.sucCount) + langData['siteConfig'][44][19].replace('1',''));//1张图片上传失败
      }

    },
    uploadError: function(){

    },
    showErr: function(info){
      showErrAlert(info);
    }
  });

  $('#pcslideShow_choose .slideshow').delegate('.close', 'click', function(){
    var t = $(this), val = t.parent().find('img').attr('data-url');
    uppcslideShow.del(val);
    t.parent().remove();

  })


  var pl_alax ;
  var lpage = 0,  ltotalPage = 0, ltotalCount = 0, lload = false ,shopLr = [],choseLr = [];

  $('.formbox .choseGoods').click(function() {

    $('.pro_mask').show();
    $('.pro_box').addClass('proshow');
    if($('.pro_box').find('.pro_li').size()==0){
      lpage = 1
      get_prolist()
    }

    $('html').addClass('noscroll');
  });
  // 隐藏
  $('.pro_mask,.pro_box .pro_cancel').click(function() {
    $('.pro_mask').hide();
    $('.pro_box').removeClass('proshow');
    $('html').removeClass('noscroll');
  });

  // 选择关联商品
  $('.pro_box').delegate('.pro_li', 'click', function() {
    var t = $(this),tstate = t.attr('data-hdstate');
    var clen = $('.proScrollBox li.chosed').length;
    if(!t.hasClass('chosed')){
      if($('.pro_li.chosed[data-hdstate="3"]').length > 0){//选了砍价
        if(clen >=4){
          showErr('不能再多了~');
          return false;
        }
      }else{

        if(clen >=3 && tstate!=3){
          showErr('不能再多了~');
          return false;
        }
      }
    }
    
    if(tstate == 3){//砍价只能选一个
      if(!t.hasClass('chosed')){
        $('.pro_li[data-hdstate="3"]').removeClass('chosed');
        t.addClass('chosed');
      }else{
        t.removeClass('chosed');
      }    
    }else{
      t.toggleClass('chosed');
    }
  });

  $('.pro_box .pro_sure').click(function() {
    $('.goodlist li.goodLi').remove();
    choseLr=[];
    $('.proScrollBox li.chosed').each(function(){
      var tid = $(this).attr('data-id');     
        for(var s = 0;s<shopLr.length;s++){
          if(shopLr[s].id == tid){
            choseLr.push(shopLr[s]);
          }
        }
      
    })

    var html = [];
    for(var i = 0;i<choseLr.length;i++){

      html.push('<li data-id="'+choseLr[i].id+'" class="goodLi">');
          html.push('<div class="goodImg"><img src="'+choseLr[i].litpic+'" alt=""></div>');
          html.push('<p>'+choseLr[i].title+'</p>');
          html.push('<a href="javascript:;" class="goodDel"></a>');
      html.push('</li>');
    }

    $('.choseLi').before(html.join(""));
    if(choseLr.length > 0){
      $('.choseLi').addClass('hasGoods');
      $('.choseGoods').html('选择商品'); 
    }
    
    $('.pro_mask').hide();
    $('.pro_box').removeClass('proshow');
    $('html').removeClass('noscroll');

  })

  //删除爆热商品
  $('.goodlist').delegate('.goodDel', 'click', function() {
    var par =$(this).closest('.goodLi'),sid = par.attr('data-id'); 
    par.remove();
    $('.pro_li[data-id="'+sid+'"]').removeClass('chosed');
    if($('.goodlist li.goodLi').length == 0){
      $('.choseLi').removeClass('hasGoods');
      $('.choseGoods').html('请选择活动商品'); 
    }
  })

  //查看示例
  $('.addImgLi .advSee').click(function() {
    var ttype = $(this).attr('data-type');
    $('.caseImg img').removeClass('show');
    $('.caseImg img[data-type="'+ttype+'"]').addClass('show');
    $('.case_mask').show();
    $('.caseAlert').addClass('caseshow');
    $('html').addClass('noscroll');
  });

  // 隐藏
  $('.case_mask,.caseAlert .know').click(function() {
    $('.case_mask').hide();
    $('.caseAlert').removeClass('caseshow');
    $('html').removeClass('noscroll');
  });

   //倒计时
  function cutDownTime(setime,datatime){
    var eday = 3;
    var jsTime = parseInt((new Date()).valueOf()/1000);
    var timeOffset = parseInt(jsTime - setime);
      var end = datatime*1000;  //点击的结束抢购时间的毫秒数
      var newTime = Date.parse(new Date()) - timeOffset;  //当前时间的毫秒数
      var youtime = end - newTime; //还有多久时间结束的毫秒数
      var timeArr = [];
      if(youtime <= 0){
        timeArr = ['00','00','00','00'];
        return timeArr;
        return false;
      }
      var seconds = youtime/1000;//秒
      var minutes = Math.floor(seconds/60);//分
      var hours = Math.floor(minutes/60);//小时
      var days = Math.floor(hours/24);//天

      var CDay= days ;
      var CHour= hours % 24 ;
      if(CDay <= eday){//3天之内的只要小时 不要天
          CHour = CHour + CDay*24;
          CDay = 0;
      }
      var CMinute= minutes % 60;
      var CSecond= Math.floor(seconds%60);//"%"是取余运算，可以理解为60进一后取余数
      var c = new Date(Date.parse(new Date()) - timeOffset);
      var millseconds=c.getMilliseconds();
      var Cmillseconds=Math.floor(millseconds %100);
      if(CSecond<10){//如果秒数为单数，则前面补零
        CSecond="0"+CSecond;
      }
      if(CMinute<10){ //如果分钟数为单数，则前面补零
        CMinute="0"+CMinute;
      }
      if(CHour<10){//如果小时数为单数，则前面补零
        CHour="0"+CHour;
      }
      if(CDay<10){//如果天数为单数，则前面补零
        CDay="0"+CDay;
      }
      if(Cmillseconds<10) {//如果毫秒数为单数，则前面补零
        Cmillseconds="0"+Cmillseconds;
      }
      if(CDay > 0){
        timeArr = [CDay,CHour,CMinute,CSecond];
        return timeArr;
      }else{
        timeArr = ['00',CHour,CMinute,CSecond];
        return timeArr;
      }
  }

  
  // 到底加载
  $('.proScrollBox').scroll(function(){
    var allh = $('.proScrollBox>ul').height();
    var w = $('.proScrollBox').height();
    var s_scroll = allh - 80 - w;
    if ($(this).scrollTop() >= s_scroll && !lload && lpage < ltotalPage)
    {
      lpage++;
      get_prolist();
    }
  });

  function get_prolist(){
    if(pl_alax){
      pl_alax.abort();
    }

    lload = true;

    var data = [];
    //data.push('u=1');
    data.push('page='+lpage);

    url = '/include/ajax.php?service=shop&action=proHuodongList&u=1&add=1&pageSize=20&'+data.join('&');
    $('.pro_box ul .loading').remove();
    $('.pro_box ul').append('<div class="loading"><span>加载中~</span></div>');
    pl_alax = $.ajax({
      url: url,
      type: "GET",
      dataType: "json", //指定服务器返回的数据类型
      crossDomain: true,
      success: function(data) {
        lload = false;
        $('.pro_box ul .loading').remove();
        if (data.state == 100) {
          var list = [],item = data.info.list;
          ltotalPage = data.info.pageInfo.totalPage;
          ltotalCount = data.info.pageInfo.totalCount;
          var label = $('.pro_box ul').attr('data-name');
          if(item.length>0){
            //$('.link_pro').removeClass('noDatapro');
            //$('.search_box').show();
            for(var i = 0; i<item.length; i++){
              shopLr.push(item[i]);
              var chosed = '';
              $('.pro_show li').each(function(){
                var t = $(this);
                if(t.attr('data-link') == type && t.attr('data-id') == item[i].id){
                  chosed = "chosed";
                }
              });
              list.push('<li class="pro_li '+chosed+'" data-id="'+item[i].id+'" data-hdstate="'+item[i].huodongstate+'">');
              list.push('<a href="javascript:;">');
              list.push('<s class="hasChoseIcon"></s>')
              list.push('<div class="left_proimg">');
              list.push('<img data-url="'+item[i].litpic+'" src="'+item[i].litpic+'" />');
              list.push('</div>');
              list.push('<div class="right_info">');
              list.push('<h2>'+item[i].title+'</h2>');
              
              var ktimestr = parseInt(item[i].ktimestr);
              var etimestr = parseInt(item[i].etimestr);
              var nowTime = parseInt((new Date()).valueOf()/1000);
              if(ktimestr > nowTime){//未开始
                var timediff = ktimestr-nowTime;
                var days = Number((timediff/86400).toFixed(2));
                if(days > 2){//2天后开始
                  list.push('<h5><i></i><span>预热</span>'+Math.floor(days)+'天后开始</h5>');
                }else{
                  list.push('        <div class="msTime" data-kstime="'+ktimestr+'">');   
                  list.push('         <p><i></i>预热</p><span class="hour">00</span><em>时</em>');
                  list.push('        <span class="minute">00</span><em>分</em>');
                  list.push('         <span class="second">00</span><span class="kspan">后开始</span>');
                  list.push('      </div>');
                }
                console.log(days)
              }else{//已开始
                var timediff = etimestr-nowTime;
                var days = Number((timediff/86400).toFixed(2));
                if(days > 2){
                  list.push('<h5>'+Math.ceil(days)+'天后结束</h5>');
                }else{//24之内 开启倒计时
                  list.push('        <div class="msTime" data-kstime="'+etimestr+'">');   
                  list.push('         <span class="hour">00</span><em>时</em>');
                  list.push('        <span class="minute">00</span><em>分</em>');
                  list.push('         <span class="second">00</span><span class="kspan">后结束</span>');
                  list.push('      </div>');
                }
                console.log(days)
              }
              var hdtxt='';
              if(item[i].huodongstate == 1){
                hdtxt='<span class="qgou">限时抢购</span>'
              }else if(item[i].huodongstate == 2){
                hdtxt='<span class="msha">低价秒杀</span>'
              }else if(item[i].huodongstate == 3){
                hdtxt='<span class="kanjia">砍价狂欢</span>'
              }else if(item[i].huodongstate == 4){
                hdtxt='<span class="tuan">拼团</span>'
              }
              list.push('<p class="price">'+hdtxt+'<em>'+echoCurrency('symbol')+'</em><strong>'+item[i].huodongprice+'</strong></p>');
          
              list.push('</div>');
              list.push('</a>');
              list.push('</li>');

            }
            if(lpage==1){
              $('.pro_box ul').html(list.join(''));
            }else{
              $('.pro_box ul').append(list.join(''));
            }

             $('.pro_li').find('.msTime').each(function(){
                var t = $(this),inx = t.index();
                var stimes =t.attr('data-kstime');
                var shtml = [];
                setInterval(function(){
                  shtml = cutDownTime(serviceTime,stimes)
                  t.find('.hour').text(shtml[1]);
                  t.find('.minute').text(shtml[2]);
                  t.find('.second').text(shtml[3]);
                },1000) ;
              })


            // $('.pro_box ul img').scrollLoading(); //懒加载
          }else{
            if(ltotalPage < lpage && lpage > 0){

              $('.pro_box ul').append('<div class="noData loading"><p>已经到底啦！</p></div>')
            }else{
              //$('.link_pro').addClass('noDatapro');
              //$('.search_box').hide();
              $('.pro_box ul').html('<div class="loading"><div class="emptyImg"></div><h2>暂无合适的商品</h2><p>您还没有正在参加活动的商品，请先报名活动</p></div>')   /* 暂无符合条件的商品哦~*/
            }
          }

        } else {
          //$('.link_pro').addClass('noDatapro');
          //$('.search_box').hide();
          $('.pro_box ul').html('<div class="loading"><div class="emptyImg"></div><h2>暂无合适的商品</h2><p>您还没有正在参加活动的商品，请先报名活动</p></div>')  /* 暂无符合条件的商品哦~*/
        }
      },
      error: function(err) {
        console.log('fail');
        $('.pro_box ul').html('<div class="loading">网络错误，加载失败</div>');

      }
    });

  }

  // 表单提交
  $(".tjBtn").bind("click", function(event){

    event.preventDefault();

    var t= $(this);

    if(t.hasClass("disabled")) return;
    //移动端主页广告
    var imgList = [];
    $("#slideShow_choose .hasimg").each(function(){
        var x = $(this),
            url = x.find('img').attr("data-url"),
            name = x.find('.imgname').val(),
            link = x.find('.imglink').val();
        if (url != undefined && url != '') {
            imgList.push(url+'###'+name+'###'+link);
        }
    });
    $("#moimglist").val(imgList.join('||'));

    //pc端主页广告
    var pcimgList = [];
    $("#pcslideShow_choose .hasimg").each(function(){
        var x = $(this),
            url = x.find('img').attr("data-url"),
            name = x.find('.imgname').val(),
            link = x.find('.imglink').val();
        if (url != undefined && url != '') {
            pcimgList.push(url+'###'+name+'###'+link);
        }
    });
    $("#pcimglist").val(pcimgList.join('||'));

    var note = $('.note').html();

    // note.innerHTML.replace(/<.*?>/g,"")
    //爆热商品
    var idlist =[];
    $('.goodlist .goodLi').each(function(){
      var tid = $(this).attr('data-id');
      idlist.push(tid);
    });
    $("#hotgoods").val(idlist.join(','));

    var form = $("#fabuForm"), action = form.attr("action");
    var data = form.serialize()+'&note='+note;
    t.addClass('disabled').find('a').html('保存中');
    $.ajax({
      url: action,
      data: data,
      type: "POST",
      dataType: "json",
      success: function (data) {
        if(data && data.state == 100){
          showErrAlert(langData['siteConfig'][6][39])

        }else{
          showErrAlert(data.info)
        }
        t.removeClass('disabled').find('a').html('保存设置');
        window.history.back();
      },
      error: function(){
        showErrAlert(langData['siteConfig'][20][183]);
        t.removeClass('disabled').find('a').html('保存设置');
      }
    });


  });




})


 // 显示错误
function showErr(txt){
  $('.error').text(txt).show();
  setTimeout(function(){
    $('.error').fadeOut();
  }, 2000)
}



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
