// 判断设备类型，ios全屏
var device = navigator.userAgent;
if (device.indexOf('huoniao_iOS') > -1) {
  $('body').addClass('huoniao_iOS');
  $('.amount .close').hide();
}
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
  var atpage = 1,pageSize = 5;

  // 下拉加载
  var isload = false;
  $(window).scroll(function() {
        var allh = $('body').height();
        var w = $(window).height();
        var scroll = allh - w - 50;
        if ($(window).scrollTop() > scroll && !isload) {
            atpage++;
            getList();
        };
    });
  //点击搜索按钮
    $('.search-btn').click(function(){
        $('.textIn-box').submit();
    });


	var lng = lat = 0;
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
	            getList();
	          }else{
	            lng = data.lng;
	            lat = data.lat;

	            var time = Date.parse(new Date());
	            utils.setStorage('user_local', JSON.stringify({'time': time, 'lng': lng, 'lat': lat, 'address': data.address}));

	            getList(1);
	          }
	        })
		}else{
          getList(1);
        }

    }

    checkLocal();


  //数据列表
  function getList(tr){
    isload = true;

    //如果进行了筛选或排序，需要从第一页开始加载
    if(tr){
      atpage = 1;
      $(".list ul").html("");
    }

    $(".list .loading").remove();
    $(".list").append('<div class="loading">'+langData['siteConfig'][20][184]+'...</div>');

    var keywords = decodeURI(getUrlParam('keywords'));
    if(keywords !='' && keywords != 'undefined' && keywords !='null'){
      $('#keyword').val(keywords);
    }

    //请求数据
    var data = [];
    data.push("pageSize="+pageSize);
    data.push("page="+atpage);
    data.push("store=2");
    data.push("title="+keywords);
    data.push("lng="+lng);
    data.push("lat="+lat);


    $.ajax({
      url: "/include/ajax.php?service=business&action=blist",
      data: data.join("&"),
      type: "GET",
      dataType: "jsonp",
      success: function (data) {
        if(data){
          if(data.state == 100){
            $(".list .loading").remove();
            var list = data.info.list, html = [];
            if(list.length > 0){

              for(var i = 0; i < list.length; i++){

                var imgLen = list[i].banner.length;
                var cla='',imgHtml = '',claInfo='',modelHtml='';

                if(imgLen == 0){

                  cla = 'img1';
                  claInfo = 'listInfo1';
                  imgHtml = `<img src="${list[i].logo}" onerror="this.src='/static/images/bus_default.png'">`;
                  if(list[i].typename.length > 0){
                      var typename = list[i].typename.length > 2 ? list[i].typename.slice(0,2) : list[i].typename;
                      modelHtml = '<div class="has-module"><span>'+typename.join('</span><span>')+'</span>'+(list[i].typename.length > 2 ? '<span>...</span>' : '')+'</div>';
                  }

                }else if(imgLen == 1){

                  cla = 'img1';
                  claInfo = 'listInfo1';
                  imgHtml = `<img src="${list[i].banner[0].pic}" onerror="this.src='/static/images/404.jpg'">`;
                  if(list[i].typename.length > 0){
                      var typename = list[i].typename.length > 2 ? list[i].typename.slice(0,2) : list[i].typename;
                      modelHtml = '<div class="has-module"><span>'+typename.join('</span><span>')+'</span>'+(list[i].typename.length > 2 ? '<span>...</span>' : '')+'</div>';
                  }

                }else if(list[i].banner){
                  cla = 'img3'
				  for(var b=0; b<(list[i].banner.length>3?3:list[i].banner.length); b++){
					 imgHtml += `<img src="${list[i].banner[b].pic}" onerror="this.src='/static/images/404.jpg'">`;
				  }

                }


                html.push('<li class="fn-clear">');
                html.push('<a href="'+list[i].url+'" class="fn-clear">');
                html.push('<div class="listInfo '+claInfo+'">');
                html.push('<h2>'+list[i].title+'</h2>');
                html.push('<p class="comment fn-clear"><span class="starbg"><i class="star" style="width: 82%;"></i></span></p>');
                html.push('<p class="addr"><span class="address">'+list[i].address+'</span><span class="dis">'+(list[i].distance != '0.0米' ? list[i].distance : '')+'</span></p>');
                html.push(modelHtml);
                html.push('</div>');

                html.push('<div class="img_box '+cla+'">');
                html.push(imgHtml);
                html.push('</div>');
                html.push('</a>');
                html.push('</li>');
              }
              $(".list ul").append(html.join(""));
              isload = false;

              //最后一页
              if(atpage >= data.info.pageInfo.totalPage){
                isload = true;
                $(".list").append('<div class="loading">'+langData['siteConfig'][18][7]+'</div>');
              }

            //没有数据
            }else{
              isload = true;
              $(".list").append('<div class="loading">'+langData['siteConfig'][20][126]+'</div>');
            }

          //请求失败
          }else{
            $(".list .loading").html(data.info);
          }

        //加载失败
        }else{
          $(".list .loading").html(langData['siteConfig'][20][462]);
        }
      },
      error: function(){
        isload = false;
        $(".list .loading").html(langData['siteConfig'][20][227]);
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
