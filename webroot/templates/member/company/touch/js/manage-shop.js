var huoniao = {

    //转换PHP时间戳
    transTimes: function(timestamp, n){

        const dateFormatter = this.dateFormatter(timestamp);
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
            return dateFormatter;
        }else{
            return 0;
        }
    },

    //判断是否为合法时间戳
    isValidTimestamp: function(timestamp) {
        return timestamp = timestamp * 1, Number.isFinite(timestamp) && timestamp > 0;
    },

    //创建 Intl.DateTimeFormat 对象并设置格式选项
    dateFormatter: function(timestamp){
        
        if(!this.isValidTimestamp(timestamp)) return {year: '-', month: '-', day: '-', hour: '-', minute: '-', second: '-'};

        const date = new Date(timestamp * 1000);  //创建一个新的Date对象，使用时间戳
        
        // 使用Intl.DateTimeFormat来格式化日期
        const dateTimeFormat = new Intl.DateTimeFormat('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: typeof cfg_timezone == 'undefined' ? 'PRC' : cfg_timezone,  //指定时区，cfg_timezone变量已在页面中通过程序自动声明
        });
        
        // 获取格式化后的时间字符串
        const formatted = dateTimeFormat.format(date);
        
        // 将格式化后的字符串分割为数组
        const [year, month, day, hour, minute, second] = formatted.match(/\d+/g);

        // 返回一个对象，包含年月日时分秒
        return {year, month, day, hour, minute, second};
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
		// if(hideFileUrl == 1){
		// 	newUrl =  url + "&type=" + to;
		// }else{
			newUrl = url.replace(from, to);
		// }
		return newUrl;
	}

}
  var objId = $('.list'), isload = false;
$(function(){


  state = state == '' ? 1 : state;

  // var activeState = $(".tab li[data-id='"+state+"']");
  // activeState.addClass("curr").siblings().removeClass('curr');
  // $('.count li').eq(activeState.index()).show().siblings().hide();

	$(".tab li").bind("click", function(){
		var t = $(this), id = t.attr("data-id"), index = t.index();

		if(!t.hasClass("curr")){
			state = id;
			atpage = 1;
       t.addClass("curr").siblings("li").removeClass("curr");
      $('.count li').hide().eq(index).show();
      $('.list').html('');
      if(id == '0'){
        $(".upselfTime,.createTime").addClass('fn-hide')
        $(".orderbyAlert .updateTime").click()
        $(".updateTime").removeClass('fn-hide')
      }else if(id == '1'){
        $(".createTime").addClass('fn-hide')
        $(".upselfTime,.updateTime").removeClass('fn-hide')
        $(".orderbyAlert .updateTime").click()
      }else{
         $(".createTime").removeClass('fn-hide')
         $(".createTime").eq(0).click()
         $(".upselfTime,.updateTime").addClass('fn-hide')
      }
     
			// getList(1);
		}




	});


  //下架
	objId.delegate(".offShelf", "click", function(){
		var t = $(this), par = t.closest(".item"), id = par.attr("data-id");
    var confirmOptio = {
      title:langData['siteConfig'][27][116],
      trggleType:1,
      isShow:true,
    }
    confirmPop(confirmOptio,function(){
       t.siblings("a").hide();
       t.addClass("load");

       $.ajax({
         url: masterDomain+"/include/ajax.php?service=shop&action=offShelf&id="+id,
         type: "GET",
         dataType: "jsonp",
         success: function (data) {
           if(data && data.state == 100){
             t.siblings("a").show();
             t.removeClass("load").html(langData['siteConfig'][27][117]);//下架成功
             setTimeout(function(){objId.html('');getList(1);}, 1000);
           }else{
             alert(data.info);
             t.siblings("a").show();
             t.removeClass("load");
           }
         },
         error: function(){
           alert(langData['siteConfig'][6][203]);//网络错误，请稍候重试！
           t.siblings("a").show();
           t.removeClass("load");
         }
       });
    })

  })
	//上架
	objId.delegate(".upShelf", "click", function(){
		var t = $(this), par = t.closest(".item"), id = par.attr("data-id");
		if(id){
			t.siblings("a").hide();
			t.addClass("load");

			$.ajax({
				url: masterDomain+"/include/ajax.php?service=shop&action=upShelf&id="+id,
				type: "GET",
				dataType: "jsonp",
				success: function (data) {
					if(data && data.state == 100){
						t.siblings("a").show();
						t.removeClass("load").html(langData['siteConfig'][27][118]);//上架成功
						setTimeout(function(){objId.html('');getList(1);}, 1000);
					}else{
						alert(data.info);
						t.siblings("a").show();
						t.removeClass("load");
					}
				},
				error: function(){
					alert(langData['siteConfig'][6][203]);//网络错误，请稍候重试！
					t.siblings("a").show();
					t.removeClass("load");
				}
			});
		}
	});
  //删除
  var M={};
  objId.delegate(".delete", "click", function(){
    $('.delMask').addClass('show');
    $('.delAlert').show();
    var t = $(this), par = t.closest(".item"), id = par.attr("data-id");
    $('.item').removeClass('itemShow');
    t.closest('.item').addClass('itemShow');
  });

  //确认删除
  $('.sureDel').click(function(e){
    var id = $('.itemShow').attr("data-id");
    $('.delMask').removeClass('show');
    $('.delAlert').hide();
    $.ajax({
      url: "/include/ajax.php?service=shop&action=del&id="+id,
      type: "GET",
      dataType: "jsonp",
      success: function (data) {
        if(data && data.state == 100){
          //删除成功后移除信息层并异步获取最新列表
          objId.html('')
          getList(1);

        }else{
          alert(data.info);
        }
      },
      error: function(){
        alert(langData['siteConfig'][20][227]);
      }
    });
  })
  //关闭删除
  $('.cancelDel,.delMask').click(function(){
    $('.delMask').removeClass('show');
    $('.delAlert').hide();
  })
  //排序
  $('.navFilter .orderitem').click(function(){
    if($(this).hasClass('active')){
      $(this).removeClass('active');
      $('.maskAside').hide();
      $('.orderbyAlert').animate({'bottom':'-100%'},200)
    }else{
      $(this).addClass('active');
      $('.maskAside').show();
      $('.orderbyAlert').animate({'bottom':'0'},200)
    }
  })
  //取消排序
  $('.orderbyAlert .cancelOr').click(function(){
      $('.navFilter .orderitem').removeClass('active');
      $('.maskAside').hide();
      $('.orderbyAlert').animate({'bottom':'-100%'},200)
  })

  $('.maskAside').click(function(){
      $('.navFilter .orderitem').removeClass('active');
      $(this).hide();
      $('.orderbyAlert').animate({'bottom':'-100%'},200);
      $('.asideType').removeClass('show');
  })
  //选择排序
  $('.asideType p').click(function(){
    $(this).addClass('active').siblings('p').removeClass('active');
    $('.asideType').removeClass('show');
    $('.maskAside').hide();
    var actxt = $(this).find('a').text();
    $('.navFilter .typeitem span').text(actxt);
    atpage = 1;
    $('.list').html('');
    getList(1);
  })
  //店铺分类
  $('.navFilter .typeitem').click(function(){
    $('.asideType').addClass('show');
    $('.maskAside').show();
  })
  //选择分类
  $('.orderbyAlert p').click(function(){
    $(this).addClass('active').siblings('p').removeClass('active');
    $('.orderbyAlert').animate({'bottom':'-100%'},200);
    $('.maskAside').hide();
    var actxt = $(this).find('a').text();
    $('.navFilter .orderitem span').text(actxt);
    atpage = 1;
    $('.list').html('');
    getList(1);
  })




  // 下拉加载
  $(window).scroll(function() {
    var h = $('.item').height();
    var allh = $('body').height();
    var w = $(window).height();
    var scroll = allh - w - h;
    if ($(window).scrollTop() > scroll && !isload) {
      atpage++;
      getList();
    };
  });


  // 初始加载
  if(state != '' && state != 1){
    $(".tab li[data-id='"+state+"']").click()
  }else{
     getList(1);
  }
 



})
  function getList(is){
    if(is){
      atpage = 1;
      isload = false;
    }

    if(isload) return false;
    isload = true;
    objId.append('<p class="loading">'+langData['siteConfig'][20][184]+'...</p>');//加载中，请稍候
    var orderbyitem = $('.orderbyAlert p.active').find('a').attr('data-id');
    var typeitem = $('.asideType p.active').find('a').attr('data-id');
    var keyword = $('#searchTit').val();
    var currTime = parseInt((new Date()).valueOf()/1000);
    $.ajax({
      url: masterDomain+"/include/ajax.php?service=shop&action=slist&u=1&orderby="+orderbyitem+"&shoptypeid="+typeitem+"&title="+keyword+"&state="+state+"&page="+atpage+"&pageSize="+pageSize,
      type: "GET",
      dataType: "jsonp",
      success: function (data) {
        if(data && data.state != 200){
          if(data.state == 101){
            objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");//暂无相关信息！
          }else{
            $('.loading').remove();
            var list = data.info.list, pageInfo = data.info.pageInfo, html = [];

            //拼接列表
            if(list.length > 0){

              var t = window.location.href.indexOf(".html") > -1 ? "?" : "&";
              var param = t + "do=edit&id=";
              var urlString = editUrl + param;

              for(var i = 0; i < list.length; i++){
                var item      = [],
                    id        = list[i].id,
                    title     = list[i].title,
                    sta       = list[i].state,
                    url       = state == 1 ? list[i].url : "javascript:;",
                    sales     = list[i].sales,
                    comment   = list[i].comment,
                    inventory = list[i].inventory,
                    litpic    = list[i].litpic,
                    price     = list[i].price,
                    huodongarr    = list[i].huodongarr,
                    huodongarre    = list[i].huodongarre,
                    date      = huoniao.transTimes(list[i].pubdate, 1);
                   //已报名的活动管理
                  var nobaoMurl = baoMurl + "?id=";
                html.push('<div class="item fn-clear" data-id="'+id+'">');
                if(litpic != ""){
                  html.push('<div class="item-img"><a href="'+url+'"><img onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/good_default.png\';" src="'+huoniao.changeFileSize(litpic, "large")+'" /></a></div>');
                }
                var arcrank = type = "";
                if(sta == "1"){
                  // if(huodongarr.indexOf('4') > -1){
                  //   arcrank += '<span class="tuanIng">拼团活动中</span>';//拼团活动中
                  //     type = 'tuan';
                  // }
                  // if(huodongarr.indexOf('2')  > -1){
                  //   arcrank += '<span class="miaoshaIng">秒杀活动中</span>';//拼团活动中
                  //     type = 'secKill';
                  // }
                  // if(huodongarr.indexOf('3')  > -1){
                  //   arcrank += '<span class="kanjiaIng">砍价活动中</span>';//拼团活动中
                  //     type = 'bargain';
                  // }
                  // if(huodongarr.indexOf('1')  > -1){
                  //   arcrank += '<span class="qianggouIng">抢购活动中</span>';//拼团活动中
                  //     type = 'qianggou';
                  // }
                  if(huodongarre && huodongarre.length > 0){

                    for(var m = 0; m < huodongarre.length; m++){
                      var hdText = huodongarre[m].ktime <= currTime ? '活动中' : '预热中';
                      var hdName = '',hdCls='';
                      switch (huodongarre[m].huodongtype){
                        case '4' :
                          hdName = '拼团'; //拼团活动中
                          hdCls = 'tuanIng';
                          type = 'tuan';
                          break;
                        case '2' :
                          hdName = '秒杀'; //秒杀活动中
                          hdCls = 'miaoshaIng';
                          type = 'secKill';
                          break;
                        case '3' :
                          hdName = '砍价'; //砍价活动中
                          hdCls = 'kanjiaIng';
                          type = 'bargain';
                          break;
                        case '1' :
                          hdName = '抢购'; //抢购活动中
                          hdCls = 'qianggouIng';
                          type = 'qianggou';
                          break;
                      }
                      arcrank += '<span class="'+hdCls+'">'+ hdName + hdText +'</span>';
                    }
                  }
                }
                var urlString2 = hasbaoMurl;
                html.push('<div class="item-txt">');
                html.push('<a href="'+url+'" class="item-tit">'+title+'</a>');
                if(list[i].shangjia == '1' ){
                  arcrank = '<em style="color:#347DF6; font-size:.24rem;" >完善信息后可上架销售</em>'
                }
                html.push('<p class="hding">'+arcrank+'</p>');
                html.push('<p class="price">'+echoCurrency('symbol')+'<em>'+price+'</em></p>');
                html.push('<p class="operate"><span>'+langData['siteConfig'][19][518]+sales+'</span><span>'+langData['siteConfig'][19][525]+inventory+'</span><span>'+list[i].typesalesname+'</span>');//已售--库存
                html.push('</p>');


                html.push('</div>');
                html.push('<p class="opWrap fn-clear">');
                if(state == "2"){
                //   html.push('<a href="javascript:;" class="delete"><i></i>'+langData['siteConfig'][6][8]+'</a>');//删除
                }
                if(sta == "1"){
                  html.push('<a href="javascript:;" class="offShelf"><i></i>'+langData['siteConfig'][19][558]+'</a>');//下架
                }
                if(list[i].shangjia != '1'){
                  html.push('<a href="'+urlString+id+'" class="edit"><i></i>'+langData['siteConfig'][6][6]+'</a>');//编辑
                }else{
                  html.push('<a href="'+urlString+id+'" class="edit"><i></i>完善信息</a>');//编辑

                }
                if(sta == "1" && is_staff !=1 && shop_huodongopen.length > 0){//销售中
                  if(list[i].huodongarr.length == 0){//未参加活动者 可报名
                    html.push('<a href="'+nobaoMurl+id+'" class="noBaom"><i></i>活动报名</a>');
                  }else{//已参加活动者 为管理
                    html.push('<a href="'+urlString2+'" class="noBaom"><i></i>活动管理</a>');
                  }
                }
                if (sta == "2" && list[i].shangjia != '1') {
                  html.push('<a href="javascript:;" class="upShelf"><i></i>'+langData['siteConfig'][26][166]+'</a>');//上架
                }

                html.push('</p>');
                html.push('</div>');

              }

              $('.loading').remove();
              objId.append(html.join(""));
              isload = false;

            }else{
              if(atpage == 1){
                objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");//暂无相关信息！
              }else{
                objId.append("<p class='loading'>已经到底了~</p>");//已加载全部信息！
              }
            }

            totalCount = pageInfo.totalCount;

            switch(state){
              case "0":
                totalCount = pageInfo.gray;
                break;
              case "1":
                totalCount = pageInfo.audit;
                break;
              case "2":
                totalCount = pageInfo.refuse;
                break;
            }


            $("#audit").html(pageInfo.audit);
            $("#gray").html(pageInfo.gray);
            $("#refuse").html(pageInfo.refuse);
          }
        }else{
          objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");//暂无相关信息！
        }
      }
    });
  }
  //关键词搜索

  function CheckformInfo(e) {
      if (e.keyCode == 13) {
          atpage = 1;
          $('.list').html('');
          getList(1);
      }
  }
