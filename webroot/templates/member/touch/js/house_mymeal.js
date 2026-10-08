$(function(){

  var objId = $('#orderlist'), atpage = 1, pageSize = 3, isload = false;

  getList();

  $(window).scroll(function(){
    var sct = $(window).scrollTop();
    if(!isload && sct + $(window).height() + 50 >= $('body').height()){
      atpage ++;
      getList();
    }
  })

  function getList(){
    isload = true;
    objId.append('<p class="loading">'+langData['siteConfig'][20][184]+'...</p>');

    $.ajax({
      url: masterDomain+"/include/ajax.php?service=house&action=mymeal&page="+atpage+"&pageSize="+pageSize,
      type: "GET",
      dataType: "jsonp",
      success: function (data) {
        $('.loading').remove();

        if(data && data.state != 200){
          if(data.state == 101){
            objId.append("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
          }else{
            
            var list = data.info.list, pageInfo = data.info.pageInfo, html = [];

            //拼接列表
            if(list.length > 0){
              for(var i = 0; i < list.length; i++){
                var item     = [],
                    id       = list[i].id,
                    date     = list[i].date,
                    ordernum = list[i].ordernum,
                    totalprice = list[i].totalprice,
                    config = list[i].config,
                    paytype   = list[i].paytype;

                html.push('<dl class="item" data-id="'+id+'">');
                html.push('  <dt>');
                html.push('    <p class="state">'+langData['siteConfig'][45][6]+'</p>');//付款成功
                html.push('    <p class="money">'+echoCurrency('symbol')+'<font>'+totalprice+'</font></p>');
                html.push('    <p class="des">'+config.name+'（'+langData['siteConfig'][16][26]+'：'+config.house+','+langData['siteConfig'][19][762]+config.settop+','+langData['siteConfig'][16][70]+config.refresh+'）</p>');//房源 -- 置顶 -- 刷新
                html.push('  </dt>');
                html.push('  <dd><span>'+langData['siteConfig'][19][487]+'：</span>'+ordernum+'</dd>'); //编号
                html.push('  <dd><span>'+langData['siteConfig'][19][51]+'：</span>'+huoniao.transTimes(date, 1)+'</dd>'); //下单时间
                html.push('  <dd><span>'+langData['siteConfig'][31][118]+'：</span>'+config.time+langData['siteConfig'][40][96].replace('1','')+'</dd>'); //套餐时长 -- 1个月
                html.push('  <dd><span>'+langData['siteConfig'][19][296]+'：</span>'+paytype+'</dd>'); //支付方式
                html.push('</dl>');

              }

              objId.append(html.join(""));
              if(pageInfo.totalPage > atpage){
                isload = false;
              }else{
                objId.append("<p class='loading'>"+langData['siteConfig'][20][185]+"</p>");
              }
            }else{
              objId.append("<p class='loading'>"+(atpage == 1 ? langData['siteConfig'][20][126] : langData['siteConfig'][20][429])+"</p>");
            }

          }
        }else{
          objId.append("<p class='loading'>"+(atpage == 1 ? langData['siteConfig'][20][126] : langData['siteConfig'][20][429])+"</p>");
        }
      },
      error: function(){
        $('.loading').remove();
        objId.append("<p class='loading'>"+langData['siteConfig'][20][458]+"</p>");
      }
    });
  }

})