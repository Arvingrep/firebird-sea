$(function(){

    //APP端取消下拉刷新
    toggleDragRefresh('off');

  var today = 1;

  $("#date").val($("#date").attr("data-today"));

  //年月日
  $('.demo-test-date').scroller(
  	$.extend({preset: 'date', dateFormat: 'yy-mm-dd'})
  );

  // 选择日期
  $('#date').on("change",function(){
    changedate(1);
  });

  function changedate(change){
    var date = $('#date').val();
    var d = null;
    if(change){
      $('.selected p').text(date.substr(date.indexOf('-')+1));
      d = GetDateStr(date, -1);
      $('.date-1 p').text(d.cut).attr('data-date', d.full);
      d = GetDateStr(date, -2);
      $('.date-2 p').text(d.cut).attr('data-date', d.full);
    }
    $('.selected p').attr('data-date', date);
    d = GetDateStr(date, -1);
    $('.date-1 p').attr('data-date', d.full);
    d = GetDateStr(date, -2);
    $('.date-2 p').attr('data-date', d.full);

    d = GetDateStr(date, -3);
    $('.date-3 p').text(d.cut).attr('data-date', d.full);
    d = GetDateStr(date, -4);
    $('.date-4 p').text(d.cut).attr('data-date', d.full);

    $('.times li:last-child').addClass('active').siblings('li').removeClass('active');

    getData(change);

  }

  function GetDateStr(date, AddDayCount) {
    var dd = new Date(date);
    dd.setDate(dd.getDate()+AddDayCount);//获取AddDayCount天后的日期
    var y = dd.getFullYear();
    var m = dd.getMonth()+1;//获取当前月份的日期
    var d = dd.getDate();

    return {full: y+'-'+m+'-'+d, cut: m+"-"+d};
  }

  $('.times li').click(function(){
    $(this).addClass('active').siblings('li').removeClass('active');
    $("#date").val($(this).children('p').attr('data-date'));
    getData();
  })

  function getData(){
    $(".order-tab").html('<li class="loading">'+langData['siteConfig'][20][409]+'</li>');
    $(".totalCount span").html(0);
    $.ajax({
      url: '/include/ajax.php?service=member&action=statisticsDateRevenue',
      data: 'date='+$("#date").val(),
      type: 'get',
      dataType: 'json',
      success: function(data){
        if(data && data.state == 100){
          var list = data.info, html = [], totalAmount = totalCount = 0;

          if(list.length == 0){
            $(".order-tab").html('<li class="loading">'+langData['siteConfig'][20][430]+'</li>');
          }
          for(var i = 0; i < list.length; i++){
            var item = [];
            var obj = list[i],
                module = obj.module,
                amount = obj.amount,
                count = obj.count;

            totalAmount += parseFloat(amount)
            totalCount += count;

            var type = url = clicktype =  '';
            if(module == 'tuan'){
              type = langData['siteConfig'][16][46];
              url  = tuanurl;
            }else if(module == 'shop'){
              type = langData['siteConfig'][16][47];
              url  = shopurl;
            }else if(module == 'waimai'){
              url = 'javascript:;'
              clicktype = 'waimaitype';
              type = langData['siteConfig'][16][48];
            }

            item.push('<li class="order-'+module+'">');
            item.push('  <a href="'+url+'" class="fn-clear '+clicktype+'">');
            item.push('    <img src="'+skin+'images/icon_'+module+'.png" alt="">');
            item.push('    <div class="txtbox"><p class="tit">'+type+langData['siteConfig'][17][11]+'</p><p>'+count+langData['siteConfig'][13][36]+'</p></div>');
            item.push('    <p class="sum fn-left">'+echoCurrency('symbol')+amount+'</p>');
            item.push('    <em class="more fn-right"></em>');
            item.push('  </a>');
            item.push('</li>');

            html.push(item.join(""));
          }

          if(today){
            $("#todayAmount").text(totalAmount);
            $("#todayOrder").text(totalCount);
            today = 0;
          }

          $(".order-tab").html(html.join(""));
          $(".totalCount span").html(totalCount);

        }else{
          $(".order-tab .loading").html(data.info);
        }
      },
      error: function(){

      }
    })
  }


  $(".order-tab").delegate('.waimaitype','click',function () {
      alert("请前往外卖商家端查看！")
  })
  changedate();

})
