$(function(){
  $('.main').delegate('a', 'click', function(){
    var t = $(this), domain = t.data('domain');

    var channelDomainClean = typeof channelDomain != 'undefined' ? channelDomain.replace("http://", "").replace("https://", "") : window.location.host;
    var channelDomain_1 = channelDomainClean.split('.');
    var channelDomain_1_ = channelDomainClean.replace(channelDomain_1[0]+".", "");

    channelDomain_ = channelDomainClean.split("/")[0];
    channelDomain_1_ = channelDomain_1_.split("/")[0];

    $.cookie(cfg_cookiePre + 'siteCityInfo', JSON.stringify(domain), {expires: 7, domain: channelDomainClean, path: '/'});
    $.cookie(cfg_cookiePre + 'siteCityInfo', JSON.stringify(domain), {expires: 7, domain: channelDomain_1_, path: '/'});
    $.cookie(cfg_cookiePre + 'siteCityInfo', JSON.stringify(domain), {expires: 7, path: '/', domain: '.' + cfg_clihost});

  });

  //分站城市数量小于10个，显示默认排版样式
  if($('.content li').length < 10){
    $('.content').show();

  //超过10个显示按字母排序样式
  }else{

  	var sortBy = function(prop){
  		return function (obj1, obj2) {
  			var val1 = obj1[prop];
  			var val2 = obj2[prop];
  			if(!isNaN(Number(val1)) && !isNaN(Number(val2))) {
  				val1 = Number(val1);
  				val2 = Number(val2);
  			}
  			if(val1 < val2) {
  				return -1;
  			}else if(val1 > val2) {
  				return 1;
  			}else{
  				return 0;
  			}
  		}
  	}

    var cityListData = [], hotCityData = [];
    $('.content li').each(function(){
      var t = $(this).find('a'), domain = t.data('domain');
      cityListData.push(domain);
    });

    var cityArr = [];
    for (var i = 0; i < cityListData.length; i++) {
      var pinyin = cityListData[i].pinyin.substr(0,1);
      if(cityArr[pinyin] == undefined){
        cityArr[pinyin] = [];
      }
      cityArr[pinyin].push(cityListData[i]);
    }

    var szmArr = [];
    for(var key in cityArr){
      var szm = key;
      szmArr.push(key);
    }

    // 右侧字母填充
    var html = [];
    szmArr.sort();
    html.push('<div class="content-box">');
    for (var i = 0; i < szmArr.length; i++) {
      html.push('<div class="content-letter fn-clear">');
      html.push('<span class="content-letter-panel">'+szmArr[i]+'<em></em></span>');

      cityArr[szmArr[i]].sort(sortBy('cityid'));

      // 左侧城市填充
      html.push('<div class="content-cities">');
      for (var j = 0; j < cityArr[szmArr[i]].length; j++) {
        html.push('<a href="'+cityArr[szmArr[i]][j].url+'" data-domain=\''+JSON.stringify(cityArr[szmArr[i]][j])+'\'>'+cityArr[szmArr[i]][j].name+'</a>');

        if(cityArr[szmArr[i]][j].hot == 1){
          hotCityData.push('<a href="'+cityArr[szmArr[i]][j].url+'" data-domain=\''+JSON.stringify(cityArr[szmArr[i]][j])+'\'>'+cityArr[szmArr[i]][j].name+'</a>');
        }
      }
      html.push('</div></div>');
    }
    html.push('</div>');

    var hotCityHtml = '';
    if(hotCityData.length > 0){
      hotCityHtml = '<dl class="hot-city fn-clear"><dt>'+langData['siteConfig'][37][98]+'</dt><dd>'+hotCityData.join('')+'</dd></dl>';//热门城市
    }

    $('.content').html(hotCityHtml + '<h3 class="sel-tit">'+langData['siteConfig'][37][99]+'：</h3>' + html.join('')).show();//按城市首字母选择

    var $panels = $(".content-letter-panel"),
        $letters = $('.content-letter'),
        $contentbox = $(".content-box");

    $letters.each(function(index, el) {
        $panels.eq(index).css({
            height: $(el).css("height"),
            "line-height": $(el).css("height")
        });
        $(el).on("mouseover", function(event) {
            $panels.eq(index).addClass("content-letter-panle-hover")
        });
        $(el).on("mouseout", function(event) {
            $panels.eq(index).removeClass("content-letter-panle-hover")
        });
        $(this).on("mouseover", function(event) {
            $(this).addClass("content-letter-hover")
        });
        $(this).on("mouseout", function(event) {
            $(this).removeClass("content-letter-hover")
        });
    });

  }
});
