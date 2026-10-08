$(function(){

  $("img").scrollLoading();

  var lng = lat = 0;
  HN_Location.init(function(data){
    if (data == undefined || data.address == "" || data.name == "" || data.lat == "" || data.lng == "") {
      $('.list.load').removeClass('load').html('<div style="text-align:center; line-height:1.68rem;">' + langData['siteConfig'][27][137] + '</div>');
    }else{
      lng = data.lng;
      lat = data.lat;

      getBusiness(1);
      getWaimaiShop();

    }
  })


  // 商家
  function getBusiness(page){
    $.ajax({
      url: masterDomain + '/include/ajax.php?service=business&action=blist&pageSize=3&orderby=3&page='+page+'&lng='+lng+'&lat='+lat,
      dataType: 'jsonp',
      success: function(data){
        if(data.state == 100){
          $(".loading").hide();
          var list = data.info.list, html = [],totalPage = data.info.pageInfo.totalPage;

          for(var i = 0; i < list.length; i++){

            html.push('<div class="item fn-clear">');
            html.push('  <a href="'+list[i].url+'">');
            html.push('    <div class="pic"><img src="'+list[i].logo+'" alt=""></div>');
            html.push('    <div class="info">');
            html.push('      <p class="tit">'+list[i].title+'</p>');
            html.push('      <p class="des"><span>['+list[i].typename[0]+']</span>'+list[i].address+'</p>');
            html.push('      <p class="other">');

            if (list[i].member.licenseState) {
              html.push('<em class="zheng">'+langData['siteConfig'][22][2]+'</em>');
            }
            if (list[i].member.phoneCheck) {
              html.push('<em class="jian">'+langData['siteConfig'][22][3]+'</em>');
            }
            if (list[i].member.certifyState) {
              html.push('<em class="jin">'+langData['siteConfig'][22][4]+'</em>');
            }
            var auth = list[i].auth;
            for(var b = 0; b < auth.length; b++){
              html.push('<em class="icon_'+b+'">'+auth[b].jc+'</em>');
            }

            html.push('       <span class="distance">'+list[i].distance+'</span>');
            html.push('      </p>');
            html.push('    </div>');
            html.push('  </a>');
            html.push('</div>');
          }
          $('.business .list').html(html.join('')).removeClass('load');
        }else{
          $(".business .list").removeClass("load").html('<div style="text-align:center; line-height:1.68rem;">暂无相关信息</div>');
        }
      },
      error: function(){
        $(".business .list").removeClass("load").html('<div style="text-align:center; line-height:1.68rem;">' + langData['siteConfig'][20][183] + '</div>');
      }
    });
  }


  // 外卖
  function getWaimaiShop(){
    $.ajax({
      url: masterDomain + '/include/ajax.php?service=waimai&action=shopList',
      data: {
          lng: lng,
          lat: lat,
          orderby: 1,
          page: 1,
          pageSize: 4
      },
      type: 'get',
      dataType: 'jsonp',
      success: function(data){

          if(data.state == 100){
              var list = [];

              var info = data.info.list;
              for(var i = 0; i < info.length; i++){
                  var d = info[i];

                  var stateCls = stateStr = '';
                  if(d.yingye != 1 || d.ordervalid != 1){
                    if(d.ordervalid != 1){
                      stateStr = '<span class="tag">'+langData['waimai'][2][101]+'</span>';
                    }else if(d.yingye != 1){
                      stateStr = '<span class="tag">'+langData['waimai'][2][102]+'</span>';
                    }
                    stateCls = ' disabled';
                  }else{
                    stateStr = d.delivery_service ? '<span class="tag">'+d.delivery_service+'</span> ' : '';
                  }

                  list.push('<div class="item fn-clear'+stateCls+'">');
                  list.push('  <a href="'+d.url+'">');
                  list.push('    <div class="pic"><img src="'+d.pic+'" alt="">' + stateStr + '</div>');
                  list.push('    <div class="info">');
                  list.push('      <p class="tit">'+d.shopname+'</p>');
                  list.push('      <div class="des">');
                  list.push('        <div class="rating-wrapper">');
                  list.push('          <div class="rating-gray"><svg><use xmlns:xlink="http://www.w3.org/1999/xlink"xlink:href="#star-gray.cc081b9"></use></svg></div>');
                  list.push('          <div class="rating-actived" style="width: '+(d.star/5)*100+'%;">');
                  list.push('            <svg><use xmlns:xlink="http://www.w3.org/1999/xlink"xlink:href="#star-actived.d4c54d1"></use></svg>');
                  list.push('          </div>');
                  list.push('        </div>');
                  list.push('        <div class="sale">'+langData['waimai'][2][5].replace("1", d.sale)+'</div>');
                  list.push('        <div class="distance">'+d.juli+(d.delivery_time ? ' | '+d.delivery_time+langData['waimai'][2][11] : '')+'</div>');
                  list.push('      </div>');
                  list.push('      <p class="other">'+echoCurrency('symbol')+' '+d.basicprice+' '+langData['waimai'][2][6]+'&nbsp;&nbsp;|&nbsp;&nbsp;'+echoCurrency('symbol')+''+d.delivery_fee+' '+langData['waimai'][2][7]+'</p>');
                  list.push('      <ul>');
                  if(d.first_discount > 0){
                    list.push('        <li><span class="shou">'+langData['waimai'][2][92]+'</span>'+langData['waimai'][2][8].replace('1', d.first_discount)+'</li>');
                  }
                  if(d.is_discount == '1'){
                    list.push('        <li><span class="zhe">'+langData['waimai'][2][91]+'</span>'+langData['waimai'][2][90].replace('1', d.discount_value)+'</li>');
                  }
                  if(d.open_promotion == '1'){
                    var c = [];
                    for(var o = 0; o < d.promotions.length; o++){
                      if(d.promotions[o][0] && d.promotions[o][1]){
                          c.push(langData['waimai'][2][10].replace('1', d.promotions[o][0]).replace('2', d.promotions[o][1]));
                      }
                    }
                    if(c.length){
                      list.push('        <li><span class="sale">'+langData['waimai'][2][93]+'</span>'+c.join(",")+'</li>');
                    }
                  }
                  list.push('      </ul>');
                  list.push('    </div>');
                  list.push('  </a>');
                  list.push('</div>');
              }


              if(list.length){
                $(".waimai .list").html(list.join(""));
              }else{
                $(".waimai .list").removeClass("load").html('<div style="text-align:center; line-height:1.68rem;">暂无相关信息</div>');;
              }

          }else{
            $(".waimai .list").removeClass("load").html('<div style="text-align:center; line-height:1.68rem;">暂无相关信息</div>');;
          }

      },
      error: function(){
        $(".waimai .list").removeClass("load").html('<div style="text-align:center; line-height:1.68rem;">' + langData['siteConfig'][20][183] + '</div>');
      }
  })
  }
})
