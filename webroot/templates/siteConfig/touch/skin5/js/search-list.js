// 判断设备类型，ios全屏
var device = navigator.userAgent;
if (device.indexOf('huoniao_iOS') > -1) {
  $('body').addClass('huoniao_iOS');
  $('.amount .close').hide();
}

var keywords = decodeURI(getUrlParam('keywords'));
$('.search-inp').val(keywords);
var huoniao_ = {
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
    }else{
      return 0;
    }
  }
  /**
     * 获取附件不同尺寸
     * 此功能只适用于远程附件（非FTP模式）
     * @param string url 文件地址
     * @param string width 兼容老版本(small/middle)
     * @param int width 宽度
     * @param int height 高度
     * @return string *
     */ 
   ,changeFileSize: function(url, width, height){
    if(url == "" || url == undefined) return "";

    //小图尺寸
    if(width == 'small'){
        width = 200;
        height = 200;
    }

    //中图尺寸
    if(width == 'middle'){
        width = 500;
        height = 500;
    }

    //默认尺寸
    width = typeof width === 'number' ? width : 800;
    height = typeof height === 'number' ? height : 800;

    //阿里云、华为云
    url = url.replace('w_4096', 'w_' + width);
    url = url.replace('h_4096', 'h_' + height);

    //七牛云
    url = url.replace('w/4096', 'w/' + width);
    url = url.replace('h/4096', 'h/' + height);

    //腾讯云
    url = url.replace('4096x4096', width+"x"+height);

    return url;

    // 以下功能弃用
    if(to == "") return url;
    var from = (from == "" || from == undefined) ? "large" : from;
    var newUrl = "";
    if(hideFileUrl == 1){
      newUrl =  url + "&type=" + to;
    }else{
      newUrl = url.replace(from, to);
    }

    return newUrl;

  }

}

$(function(){
  var loadMoreLock = false, page = 1, isend = false;

  // 点击切换搜索列表
  $('.slideNav a').click(function(){
    $('.slideNav a').removeClass('active');
    $(this).addClass('active');
    $('#action').val($(this).attr('data-action'));
    getList(1);
  })


  // 下拉加载
  $(window).on("scroll", function(){
    var sct = $(window).scrollTop();
    if(sct + $(window).height() + 50 > $(document).height()) {
      if (!loadMoreLock && !isend) {
        page++;
        getList();
      }
    }
  });


  $('form.search').submit(function(e){
  	e.preventDefault()
  	//记录搜索历史
        
        // var history = utils.getStorage('index_history_search');
        var keywords = $(".search-inp").val()
        getList(1); //获取数据


        var history = localStorage.getItem('index_history_search')
        alert(localStorage.getItem('index_history_search'))
        history = history ? JSON.parse(history) : [];
        if (history && history.length >= 10 && $.inArray(keywords, history) < 0) {
            history = history.slice(1);
        }
        // 判断是否已经搜过
        if ($.inArray(keywords, history) > -1) {
            for (var i = 0; i < history.length; i++) {
                if (history[i] === keywords) {
                    history.splice(i, 1);
                    break;
                }
            }
        }
        history.push(keywords);
        var hlist = [];
        for (var i = 0; i < history.length; i++) {
            hlist.push('<li><a href="javascript:;">' + history[i] + '</a></li>');
        }
        utils.setStorage('index_history_search', JSON.stringify(history));
        return false;
  })

  var actionType = getUrlParam('action');
  if(actionType){
    $('.slideNav .active').removeClass('active');
    $('.slideNav .'+actionType).addClass('active');
    $('#action').val($('.slideNav .active').attr('data-action'));
  }
//滚动到对应的搜索项
  var start = $('.slideNav a.active').length ? $('.slideNav a.active').offset().left : 0;
  $('.over').scrollLeft(start);

  
  getList(1);

  // 异步获取列表
  function getList(tr){

    var keywords  = $('.search-inp').val();
    if (tr) {
      page = 1;
      $('.list').html('');
    }

    $('.list').append('<div class="loading">加载中...</div>');

    var active = $('.slideNav .active'), url, action = active.attr('data-action');

    //开启全站搜索
    if(esStatus == '1'){
        siteSearch(action, keywords, page);
        return;
    }


    if (action == "article") {
      url = masterDomain + "/include/ajax.php?service=article&action=alist&page="+page+"&pageSize=10&title="+keywords;
    }else if (action == "image") {
      url = masterDomain + "/include/ajax.php?service=image&action=alist&page="+page+"&pageSize=10&title="+keywords;
    }else if (action == "info") {
      url = masterDomain + "/include/ajax.php?service=info&action=ilist&page="+page+"&pageSize=10&title="+keywords;
    }else if (action == "tuan") {
      url = masterDomain + "/include/ajax.php?service=tuan&action=tlist&page="+page+"&pageSize=10&title="+keywords;
    }else if (action == "waimai") {
      url = masterDomain + "/include/ajax.php?service=waimai&action=shopList&page="+page+"&pageSize=10&keywords="+keywords;
    }else if (action == "shop") {
      url = masterDomain + "/include/ajax.php?service=shop&action=slist&page="+page+"&pageSize=10&keywords="+keywords;
    }else if (action == "house") {
      url = masterDomain + "/include/ajax.php?service=house&action=loupanList&page="+page+"&pageSize=10&keywords="+keywords;
    }else if (action == "renovation") {
      url = masterDomain + "/include/ajax.php?service=renovation&action=news&page="+page+"&pageSize=10";
    }else if (action == "job") {
      url = masterDomain + "/include/ajax.php?service=job&action=post&page="+page+"&pageSize=10&title="+keywords;
    }else if (action == "tieba") {
      url = masterDomain + "/include/ajax.php?service=tieba&action=tlist&page="+page+"&pageSize=10&keywords="+keywords;
    }else if (action == "dating") {
      url = masterDomain + "/include/ajax.php?service=dating&action=memberList&page="+page+"&pageSize=10";
    }else if (action == "video") {
      url = masterDomain + "/include/ajax.php?service=video&action=alist&page="+page+"&pageSize=10&title="+keywords;
    }else if (action == "huangye") {
      url = masterDomain + "/include/ajax.php?service=business&action=blist&page="+page+"&pageSize=10&keywords="+keywords;
    }else if (action == "vote") {
      url = masterDomain + "/include/ajax.php?service=vote&action=vlist&page="+page+"&pageSize=10";
    }else if (action == "huodong") {
      url = masterDomain + "/include/ajax.php?service=huodong&action=hlist&page="+page+"&pageSize=10&keywords="+keywords;
    }else if (action == "education") {
      url = masterDomain + "/include/ajax.php?service=education&action=coursesList&page="+page+"&pageSize=10&keywords="+keywords;
    }else if (action == "car") {
      url = masterDomain + "/include/ajax.php?service=car&action=car&page="+page+"&pageSize=10&keywords="+keywords;
    }else if (action == "homemaking") {
      url = masterDomain + "/include/ajax.php?service=homemaking&action=hList&page="+page+"&pageSize=10&keywords="+keywords;
    }else if (action == "live") {
      // url = masterDomain + "/include/ajax.php?service=huodong&action=hlist&page=1&pageSize=10";
    }else{
      url = masterDomain + "/include/ajax.php?service=info&action=ilist&page=1&pageSize=10";
    }

    loadMoreLock = true;

    $.ajax({
      url: url,
      type: "GET",
      dataType: "jsonp",
      success: function(data){
        if (data && data.state != 200) {
          if (data.state == 101) {
            $('.loading').remove();
            $('.list').append('<div class="loading">暂无数据！</div>');
            $('.count').html(0);
          }else {
            var list = data.info.list, html = [];
            var totalPage = data.info.pageInfo.totalPage;
            var totalCount = data.info.pageInfo.totalCount;
            $('.count').html(totalCount);
            active.attr('data-totalPage', totalPage);
            for (var i = 0; i < list.length; i++) {
              // 资讯模块
              if (action == "article") {

                // 如果是图集
                if(list[i].group_img){
                  html.push('<div class="item imglist">');
                  html.push('<a href="' + list[i].url + '" class="fn-clear">');
                  html.push('<p class="tit">' + list[i].title + '</p>');
                  html.push('<p class="desc">' + list[i].description + '</p>');
                  html.push('<ul class="fn-clear">');
                  var n = 0;
                  for (var g = 0; g < list[i].group_img.length; g++) {
                    var src = huoniao_.changeFileSize(list[i].group_img[g].path, "small");
                    if(src && n < 3) {
                      html.push('<li><img src="' + src +'"></li>');
                      n++;
                      if(n == 3) break;
                    }
                  }
                  html.push('</ul>');
                  html.push('<p class="tag"><span class="source">'+list[i].source+'</span><span class="time">' + returnHumanTime(list[i].pubdate,3) + '</span></p>');
                  html.push('</a>');
                  html.push('</div>');

                //如果是视频
                }else if (list[i].typeid == "3") {
                  var litpic = list[i].litpic;
                  html.push('<div class="item videoBox">');
                  html.push('<a href="' + list[i].url + '" class="fn-clear">');
                  html.push('<p class="tit">' + list[i].title + '</p>');
                  html.push('<p class="desc">' + list[i].description + '</p>');
                  html.push('<div class="video">');
                  if (litpic) {
                    html.push('<img src="' + list[i].litpic + '" alt=""><span class="video_bg"></span>');
                  }
                  html.push('</div>');
                  html.push('<p class="tag"><span class="source">'+list[i].source+'</span><span class="time">' + returnHumanTime(list[i].pubdate,3) + '</span></p>');
                  html.push('</a>');
                  html.push('</div>');

                // 缩略图
                }else {
                  var litpic = list[i].litpic;
                  html.push('<div class="item">');
                  html.push('<a href="' + list[i].url + '" class="fn-clear">');
                  if (litpic) {
                    html.push('<div class="imgbox"><img src="' + list[i].litpic + '"></div>');
                  }
                  html.push('<div class="txtbox">');

                  html.push('<p class="tit">' + list[i].title + '</p>');
                  html.push('<p class="desc">' + list[i].description + '</p>');
                  html.push('<p class="tag"><span class="source">'+list[i].source+'</span><span class="time">' + returnHumanTime(list[i].pubdate,3) + '</span></p>');
                  html.push('</div>');
                  html.push('</a>');
                  html.push('</div>');
                }

              // 图片列表
              }else if (action == "image") {
                var litpic = list[i].litpic;
                html.push('<div class="item">');
                html.push('<a href="' + list[i].url + '" class="fn-clear">');
                if (litpic) {
                  html.push('<div class="imgbox"><img src="' + list[i].litpic + '"></div>');
                }
                html.push('<div class="txtbox">');

                html.push('<p class="tit">' + list[i].title + '</p>');
                html.push('<p class="desc">' + list[i].subtitle + '</p>');
                html.push('<p class="tag"><span class="source">'+list[i].source+'</span><span class="time">' + returnHumanTime(list[i].pubdate,3) + '</span></p>');
                html.push('</div>');
                html.push('</a>');
                html.push('</div>');

              // 二手
              }else if (action == "info"){
                var litpic = list[i].litpic;
                html.push('<div class="item">');
                html.push('<a href="' + list[i].url + '" class="fn-clear">');
                if (litpic) {
                  html.push('<div class="imgbox"><img src="' + list[i].litpic + '"></div>');
                }
                html.push('<div class="txtbox">');

                html.push('<p class="tit">' + list[i].title + '</p>');
                html.push('<p class="desc">' + list[i].desc + '</p>');
                html.push('<p class="tag"><span class="source">'+list[i].teladdr+'</span><span class="time">' + returnHumanTime(list[i].pubdate,3) + '</span></p>');
                html.push('</div>');
                html.push('</a>');
                html.push('</div>');

              // 团购
              }else if (action == "tuan"){
                var litpic = list[i].litpic;
                html.push('<div class="item">');
                html.push('<a href="' + list[i].url + '" class="fn-clear">');
                if (litpic && litpic != null) {
                  html.push('<div class="imgbox"><img src="' + list[i].litpic + '"></div>');
                }
                html.push('<div class="txtbox">');

                html.push('<p class="tit">' + list[i].title + '</p>');
                html.push('<p class="desc">' + list[i].subtitle + '</p>');
                html.push('<p class="tag"><span class="source">原价：'+echoCurrency('symbol')+list[i].market+'</span><span class="time">现价：'+echoCurrency('symbol')+ list[i].price + '</span></p>');
                html.push('</div>');
                html.push('</a>');
                html.push('</div>');

              // 外卖
              }else if (action == "waimai"){
                var logo = list[i].pic;
                html.push('<div class="item">');
                html.push('<a href="' + list[i].url + '" class="fn-clear">');
                if (logo) {
                  html.push('<div class="imgbox"><img src="' + logo + '"></div>');
                }
                html.push('<div class="txtbox">');

                html.push('<p class="tit">' + list[i].shopname + '</p>');
                html.push('<p class="desc">' + list[i].typename + '</p>');
                html.push('<p class="tag"><span class="source">配送费：'+echoCurrency('symbol')+list[i].delivery_fee+'</span></p>');
                html.push('</div>');
                html.push('</a>');
                html.push('</div>');

              // 商城
              }else if (action == "shop"){
                var litpic = list[i].litpic;
                html.push('<div class="item">');
                html.push('<a href="' + list[i].url + '" class="fn-clear">');
                if (litpic) {
                  html.push('<div class="imgbox"><img src="' + list[i].litpic + '"></div>');
                }
                html.push('<div class="txtbox">');

                html.push('<p class="tit">' + list[i].title + '</p>');
                html.push('<p class="desc">库存：' + list[i].inventory + '</p>');
                html.push('<p class="tag"><span class="source">原价：'+echoCurrency('symbol')+list[i].mprice+'</span><span class="time">现价：'+echoCurrency('symbol')+list[i].price+'</span></p>');
                html.push('</div>');
                html.push('</a>');
                html.push('</div>');

              // 房产
              }else if (action == "house"){
                var litpic = list[i].litpic;
                html.push('<div class="item">');
                html.push('<a href="' + list[i].url + '" class="fn-clear">');
                if (litpic) {
                  html.push('<div class="imgbox"><img src="' + list[i].litpic + '"></div>');
                }
                html.push('<div class="txtbox">');

                html.push('<p class="tit">' + list[i].title + '</p>');
                html.push('<p class="desc">' + list[i].address + '</p>');
                html.push('<p class="tag"><span class="source">'+list[i].protype+'</span><span class="time">'+list[i].zhuangxiu+'</span></p>');
                html.push('</div>');
                html.push('</a>');
                html.push('</div>');

              // 装修
              }else if (action == "renovation"){
                var litpic = list[i].litpic;
                html.push('<div class="item">');
                html.push('<a href="' + list[i].url + '" class="fn-clear">');
                if (litpic) {
                  html.push('<div class="imgbox"><img src="' + list[i].litpic + '"></div>');
                }
                html.push('<div class="txtbox">');

                html.push('<p class="tit">' + list[i].title + '</p>');
                html.push('<p class="desc">' + list[i].description + '</p>');
                html.push('<p class="tag"><span class="source">浏览：'+list[i].click+'</span><span class="time">' + returnHumanTime(list[i].pubdate,3) + '</span></p>');
                html.push('</div>');
                html.push('</a>');
                html.push('</div>');

              // 招聘
              }else if (action == "job") {
                var company = list[i].company;
                html.push('<div class="item">');
                html.push('<a href="' + list[i].url + '" class="fn-clear">');
                if (company && company != "" && company.logo) {
                  html.push('<div class="imgbox"><img src="' + company.logo + '"></div>');
                }
                html.push('<div class="txtbox">');

                html.push('<p class="tit">' + list[i].title + '</p>');
                html.push('<p class="desc">' + list[i].note + '</p>');
                html.push('<p class="tag"><span class="source">'+list[i].salary+'</span><span class="time">' + list[i].timeUpdate + '</span></p>');
                html.push('</div>');
                html.push('</a>');
                html.push('</div>');

              // 贴吧列表
              }else if (action == "tieba") {
                var group = list[i].imgGroup, username = list[i].username;
                // 如果是图集
                if(group && group != ""){
                  html.push('<div class="item imglist">');
                  html.push('<a href="' + list[i].url + '" class="fn-clear">');
                  html.push('<p class="tit">' + list[i].title + '</p>');
                  html.push('<p class="desc">' + list[i].content + '</p>');
                  html.push('<ul class="fn-clear">');
                  var n = 0;
                  for (var g = 0; g < group.length; g++) {
                    var src = group[g];
                    if(src && n < 3) {
                      html.push('<li><img src="' + src +'"></li>');
                      n++;
                      if(n == 3) break;
                    }
                  }
                  html.push('</ul>');
                  html.push('<p class="tag"><span class="source">'+list[i].typename[0]+'</span><span class="time">' + returnHumanTime(list[i].pubdate,3) + '</span></p>');
                  html.push('</a>');
                  html.push('</div>');

                //如果是视频
                }else if (list[i].typeid == "3") {
                  var litpic = list[i].litpic;
                  html.push('<div class="item videoBox">');
                  html.push('<a href="' + list[i].url + '" class="fn-clear">');
                  html.push('<p class="tit">' + list[i].title + '</p>');
                  html.push('<p class="desc">' + list[i].content + '</p>');
                  html.push('<div class="video">');
                  if (litpic) {
                    html.push('<img src="' + list[i].litpic + '" alt=""><span class="video_bg"></span>');
                  }
                  html.push('</div>');
                  html.push('<p class="tag"><span class="source">'+list[i].typename[0]+'</span><span class="time">' + returnHumanTime(list[i].pubdate,3) + '</span></p>');
                  html.push('</a>');
                  html.push('</div>');

                // 没有图
                }else {
                  var litpic = list[i].litpic;
                  html.push('<div class="item">');
                  html.push('<a href="' + list[i].url + '" class="fn-clear">');
                  html.push('<div class="txtbox">');

                  html.push('<p class="tit">' + list[i].title + '</p>');
                  html.push('<p class="desc">' + list[i].content + '</p>');
                  html.push('<p class="tag"><span class="source">'+list[i].typename[0]+'</span><span class="time">' + returnHumanTime(list[i].pubdate,3) + '</span></p>');
                  html.push('</div>');
                  html.push('</a>');
                  html.push('</div>');
                }

              // 交友
              }else if (action == "dating"){
                var photo = list[i].photo;
                html.push('<div class="item">');
                html.push('<a href="' + list[i].url + '" class="fn-clear">');
                if (photo && photo != null) {
                  html.push('<div class="imgbox"><img src="' + photo + '"></div>');
                }
                html.push('<div class="txtbox">');

                html.push('<p class="tit">' + list[i].nickname + '</p>');
                html.push('<p class="desc">' + list[i].sign + '</p>');
                var sex = list[i].sex == 0 ? '女' : '男';
                html.push('<p class="tag"><span class="source">年龄：'+list[i].age+'</span><span class="time">'+ sex + '</span></p>');
                html.push('</div>');
                html.push('</a>');
                html.push('</div>');

              // 视频
              }else if (action == "video") {
                var litpic = list[i].litpic;
                html.push('<div class="item videoBox">');
                html.push('<a href="' + list[i].url + '" class="fn-clear">');
                html.push('<p class="tit">' + list[i].title + '</p>');
                html.push('<p class="desc">' + list[i].description + '</p>');
                html.push('<div class="video">');
                if (litpic && litpic != "") {
                  html.push('<img src="' + litpic + '" alt=""><span class="video_bg"></span>');
                }
                html.push('</div>');
                html.push('<p class="tag"><span class="source">'+list[i].source+'</span><span class="time">' + returnHumanTime(list[i].pubdate,3) + '</span></p>');
                html.push('</a>');
                html.push('</div>');

              // 黄页
              }else if (action == "huangye"){
                html.push('<div class="item">');
                html.push('<a href="' + list[i].url + '" class="fn-clear">');
                if (list[i].logo) {
                  html.push('<div class="imgbox"><img src="' + list[i].logo + '"></div>');
                }
                html.push('<div class="txtbox">');

                html.push('<p class="tit">' + list[i].title + '</p>');
                html.push('<p class="desc">&nbsp;</p>');
                html.push('<p class="desc">' + list[i].address + '</p>');
                html.push('<p class="tag"><span class="source">'+list[i].typename.join(' · ')+'</span><span class="time">' + returnHumanTime(list[i].pubdate,3) + '</span></p>');
                html.push('</div>');
                html.push('</a>');
                html.push('</div>');

              // 投票
              }else if (action == "vote"){
                var litpic = list[i].litpic;
                html.push('<div class="item">');
                html.push('<a href="' + list[i].url + '" class="fn-clear">');
                if (litpic && litpic != null) {
                  html.push('<div class="imgbox"><img src="' + litpic + '"></div>');
                }
                html.push('<div class="txtbox">');

                html.push('<p class="tit">' + list[i].title + '</p>');
                html.push('<p class="desc">&nbsp;结束时间：'+list[i].endf+'</p>');
                html.push('<p class="tag"><span class="source">已有'+list[i].usercount+'名选手</span></p>');
                html.push('</div>');
                html.push('</a>');
                html.push('</div>');

              // 活动
              }else if (action == "huodong") {
                var litpic = list[i].litpic;
                html.push('<div class="item">');
                html.push('<a href="' + list[i].url + '" class="fn-clear">');
                if (litpic && litpic != null) {
                  html.push('<div class="imgbox"><img src="' + litpic + '"></div>');
                }
                html.push('<div class="txtbox">');

                html.push('<p class="tit">' + list[i].title + '</p>');
                html.push('<p class="desc">开始时间：' + returnHumanTime(list[i].began,3) + '</p>');

                var feetype = list[i].feetype == 0 ? '免费' : echoCurrency('symbol')+list[i].mprice;
                html.push('<p class="tag"><span class="source">'+feetype+'</span></p>');
                html.push('</div>');
                html.push('</a>');
                html.push('</div>');

              // 教育
              }else if (action == "education"){
                var litpic = list[i].litpic;
                html.push('<div class="item">');
                html.push('<a href="' + list[i].url + '" class="fn-clear">');
                if (litpic) {
                  html.push('<div class="imgbox"><img src="' + list[i].litpic + '"></div>');
                }
                html.push('<div class="txtbox">');

                html.push('<p class="tit">' + list[i].title + '</p>');
                html.push('<p class="desc">' + list[i].classname + '</p>');
                html.push('<p class="tag"><span class="source">'+list[i].price+echoCurrency('short')+'起</span></p>');
                html.push('</div>');
                html.push('</a>');
                html.push('</div>');

              // 汽车
              }else if (action == "car"){
                var litpic = list[i].litpic;
                html.push('<div class="item">');
                html.push('<a href="' + list[i].url + '" class="fn-clear">');
                if (litpic) {
                  html.push('<div class="imgbox"><img src="' + list[i].litpic + '"></div>');
                }
                html.push('<div class="txtbox">');

                html.push('<p class="tit">' + list[i].title + '</p>');
                html.push('<p class="desc">' + list[i].address + '</p>');
                html.push('<p class="tag"><span class="source">'+list[i].price+echoCurrency('short')+'</span></p>');
                html.push('</div>');
                html.push('</a>');
                html.push('</div>');

              // 家政
              }else if (action == "homemaking"){
                var litpic = list[i].litpic;
                html.push('<div class="item">');
                html.push('<a href="' + list[i].url + '" class="fn-clear">');
                if (litpic) {
                  html.push('<div class="imgbox"><img src="' + list[i].litpic + '"></div>');
                }
                html.push('<div class="txtbox">');

                html.push('<p class="tit">' + list[i].title + '</p>');
                html.push('<p class="desc">' + list[i].typename + '</p>');
                html.push('<p class="tag"><span class="source">'+list[i].price+echoCurrency('short')+'</span></p>');
                html.push('</div>');
                html.push('</a>');
                html.push('</div>');

              }else {
                html.push('');
              }
            }
            $('.loading').remove();
            $('.list').append(html.join(""));
            if(totalPage == page || totalCount == 0){
              isend = true;
              $('.list').append('<div class="loading">已加载全部数据！</div>');
            }else {
              isend = false;
            }

          }
        }
        loadMoreLock = false;

      }
    })

  }


  //全站搜索
  function siteSearch(module, keyword, page){

    loadMoreLock = true;
    var active = $('.slideNav .active');

    $.ajax({
        url: '/include/ajax.php?service=siteConfig&action=siteSearch&module=' + module + '&keyword=' + encodeURIComponent(keyword) + '&tongji=1&page=' + page,
        type: "GET",
        dataType: "jsonp",
        success: function(data){
            if (data && data.state == 100) {
                var list = data.info.list, tongji = data.info.tongji, count = data.info.count, html = [];
                var totalPage = data.info.pageInfo.totalPage;
                var totalCount = data.info.pageInfo.totalCount;
                $('.count').html(totalCount);
                active.attr('data-totalPage', totalPage);

                //统计信息
                if(tongji && tongji.total > 0){
                    $('.slideNav').find('a').each(function(){
                        var t = $(this), action = t.data('action');
                        if(action == ''){
                            t.find('span').html('('+tongji['total']+')');
                        }else{
                            if(tongji[action] > 0){
                                t.find('span').html('('+tongji[action]+')');
                                t.show();
                            }else{
                                t.hide();
                            }
                        }
                    });
                    $('.slideNav').show();
                }


                for (var i = 0; i < list.length; i++) {
      
                    html.push('<div class="item">');
                    html.push('<a href="' + list[i].url + '" class="fn-clear">');
                    if (list[i].picture) {
                    html.push('<div class="imgbox"><img src="' + huoniao.changeFileSize(list[i].picture, 200, 188) + '" onerror="this.src=\'/static/images/404.jpg\'"></div>');
                    }
                    html.push('<div class="txtbox">');

                    html.push('<p class="tit">' + list[i].title + '</p>');
                    html.push('<p class="desc">' + huoniao.transTimes(list[i].time, 2) + '</p>');
                    html.push('<p class="tag"><span class="source">'+(module == '' ? list[i].moduleName : '')+'</span></p>');
                    html.push('</div>');
                    html.push('</a>');
                    html.push('</div>');
                }

                $('.loading').remove();
                $('.list').append(html.join(""));
                if(totalPage == page || totalCount == 0){
                isend = true;
                $('.list').append('<div class="loading">已加载全部数据！</div>');
                }else {
                isend = false;
                }


            }else{
                $('.loading').remove();
                $('.list').append('<div class="loading">'+data.info+'</div>');
                $('.count').html(0);
            }

            loadMoreLock = false;
        },
        error: function(){
            alert('网络错误！');
            loadMoreLock = false;
        }
    });

  }

})

function returnHumanTime(t,type) {
    var n = new Date().getTime();
    var c = n - t;
    var str = '';
    if(c < 3600) {
        str = parseInt(c / 60) + '分钟前';
    } else if(c < 86400) {
        str = parseInt(c / 3600) + '小时前';
    } else if(c < 604800) {
        str = parseInt(c / 86400) + '天前';
    } else {
        str = huoniao_.transTimes(t,type);
    }
    return str;
}
function G(id) {
    return document.getElementById(id);
}
function in_array(needle, haystack) {
    if(typeof needle == 'string' || typeof needle == 'number') {
        for(var i in haystack) {
            if(haystack[i] == needle) {
                    return true;
            }
        }
    }
    return false;
}

//获取url中的参数
function getUrlParam(name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
  var r = window.location.search.substr(1).match(reg);
  if ( r != null ){
     return decodeURI(r[2]);
  }else{
     return null;
  }
}
