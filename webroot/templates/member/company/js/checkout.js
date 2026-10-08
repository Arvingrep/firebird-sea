$(function(){

  var today = 1;

  //时间
	var selectDate = function(el, func){
		WdatePicker({
			el: el,
			doubleCalendar: true,
			dateFmt: 'yyyy-MM-dd',
      maxDate: $('#startdate').attr('maxdate'),
			onpicked: function(dp){
				typeof func === 'function' ? func(dp) : "";
        changedate(1);
			}
		});
	}

  $("#startdate").focus(function(){
		selectDate("startdate", function(dp){
			var sdate = dp.cal.getNewDateStr();
		});
	});

  $("#startdate").val($("#startdate").attr("data-today"));

  function changedate(change){
    var date = $('#startdate').val();
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
    $("#startdate").val($(this).children('p').attr('data-date'));
    getData();
  })

  function getData(){
    $(".order-tab").html('<li class="loading">'+langData['siteConfig'][20][409]+'</li>');
    $(".totalCount span").html(0);
    $.ajax({
      url: '/include/ajax.php?service=member&action=statisticsDateRevenue',
      data: 'date='+$("#startdate").val(),
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

            var type = '';
            if(module == 'tuan'){
              type = langData['siteConfig'][16][46];
            }else if(module == 'shop'){
              type = langData['siteConfig'][16][47];
            }else if(module == 'waimai'){
              type = langData['siteConfig'][16][48];
            }

            item.push('<li class="order-'+module+'">');
            item.push('  <a href="'+orderUrl+'">');
            item.push('    <p class="order-tit fn-clear"><i></i><span>'+type+'</span><i></i></p>');
            item.push('    <p class="order-price">'+echoCurrency('symbol')+' <em>'+amount+'</em></p>');
            item.push('    <p>'+langData['siteConfig'][26][156].replace('1', count)+'</p>');
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

  changedate();

})
