var cflag = 0;//下个月可点不可点
function speClass(){//调整最后一行高度 为空则为0

  $('#sign_cal .WeekDay').each(function(){
    var len = 0;
    $(this).find('div').each(function(){
      if($(this).text() == ''){
        len ++;
      }

    })
    if(len == 7){//表明这个月的最后一行全为空
      $(this).addClass('speWeek')
    }
  })
}
var tFlag = 1;
//不可补签样式
function speCla(bla){//

  if(bla == 1){//当月

  }else{//非当月
    $('#sign_cal .WeekDay').each(function(){
      $(this).find('div').each(function(){
        var txtOld = $(this).html();
        //不为空 并且没有被签过
        if(txtOld != ''){
          if($(this).find('i').size() == 0){
            $(this).html(txtOld+'<span class="noBu">—</span>')
          }

        }

      })
    })

  }


}
$(function(){

    // 判断设备类型，ios全屏
    var device = navigator.userAgent;
    if (device.indexOf('huoniao_iOS') > -1) {
      $('body').addClass('padTop20');
    }
    //奖励规则


    // 今日签到
    var qiandao = function(t){
      if(t.hasClass('disabled') || t.hasClass('on')) return false;
      $('.ClickSign, .today').addClass('disabled');
      $.ajax({
  			url: '/include/ajax.php?service=member&action=qiandao&date='+currentYear+"-"+currentMonth+"-"+currentDay,
  			type: "GET",
  			async: false,
  			dataType: "json",
  			success: function (data) {
          $('.ClickSign, .today').removeClass('disabled');
  				if(data && data.state == 100){
            $('.disk').show();
            $('.QianBox').addClass('show');
            $(".today").addClass('on');
            $(".ClickSign").addClass('disabled').html(langData['siteConfig']['22'][124]);

            $('#Continuous').html(data.info.days);//头部连签天数
            $('#AllDay').html(data.info.zongqian);//头部总签天数
            $('.QianBox .comtitle').removeClass('bq').addClass('qd');//签到成功
            //判断是 今天签到 或者今天连续 或者总签满多少天 或者又总签又连签 四种情况
            var qdTxt='';
              qdTxt = data.info.text+'＋<span><strong>'+data.info.reward+'</strong><i>'+cfg_pointName+'</i></span>';

              //已连续签到7天
              //qdTxt = '已连续签到'+data.info.days+'天 ＋<span><strong>'+data.info.reward+'</strong><i>'+cfg_pointName+'</i></span>';
              //总签到已满30天
              //qdTxt = '总签到已满＋'+data.info.zongqian+'天 ＋<span><strong>'+data.info.reward+'</strong><i>'+cfg_pointName+'</i></span>';
              //总签满30天 连签7天
              //qdTxt = '总签满'+data.info.zongqian+'天 连签'+data.info.days+'天 ＋<span><strong>'+data.info.reward+'</strong><i>'+cfg_pointName+'</i></span>';

            $('.QianBox .SuccessIcon').html(qdTxt);
            $('#totalPoint').html(data.info.point);

  				}else{
  					alert(data.info);
  				}
  			},
  			error: function(){
          $('.ClickSign, .today').removeClass('disabled');
  				alert(langData['siteConfig'][20][388]);  //网络错误，请求失败！
  			}
  		});
    }
    $('.ClickSign').click(function(){
      qiandao($(this));
    })
    $('#calendar').delegate('.today', 'click', function(){
      qiandao($(this));
    })

    // 补签
    var buqianDate = 0, buqianObj;
    $('#calendar').delegate('.bu', 'click', function(){
      $('.disk').show();
      $(".SureBox").addClass('show');
      buqianDate = $(this).attr("data-id");
      buqianObj = $(this);
    })

    // 关闭弹出层
    $(".close").click(function(){
      $('.disk').hide();
      $(".SuccessBox,.SureBox").removeClass('show');
    })
    $('.cancle').click(function(){
      $('.disk').hide();
      $(".SuccessBox,.SureBox").removeClass('show');
    })

    $('.disk').click(function(){
      $('.disk,.error').hide();
      $(".SuccessBox,.SureBox").removeClass('show');
    })

    //确认补签
    $('.SureBox .sure').bind('click', function(){
      var t = $(this);
      if(t.hasClass('disabled')) return false;
      t.addClass('disabled');
      $.ajax({
  			url: '/include/ajax.php?service=member&action=qiandao&date='+calUtil.showYear+"-"+calUtil.showMonth+"-"+buqianDate,
  			type: "GET",
  			async: false,
  			dataType: "json",
  			success: function (data) {
          t.removeClass('disabled');
  				if(data && data.state == 100){
            var totalP = $('#totalPoint').html();
            if(cfg_qiandao_buqianPrice > totalP){//补签大于积分时
              $('.error,.disk').show();//积分不够弹窗
              return false;
            }else{
              $(".SureBox").removeClass('show');
              $('.QianBox').addClass('show');
              buqianObj.addClass('on').removeClass('bu');
              buqianObj.find('span').remove();

              $('#Continuous').html(data.info.days);//头部连签天数
              $('#AllDay').html(data.info.zongqian);//头部总签天数
              $('.QianBox .comtitle').removeClass('qd').addClass('bq');//补签成功
              //判断是否连续 奖励为负值时没有span标签加粗效果
              var qdTxt='';
              if(data.info.reward < 0){
                qdTxt = '<p class="spe">此次签到 '+data.info.reward+cfg_pointName+'</p>';
              }else{
                qdTxt = data.info.text+'＋<span><strong>'+data.info.reward+'</strong><i>'+cfg_pointName+'</i></span>';
              }
              //已连续签到7天
              //qdTxt = '已连续签到'+data.info.days+'天 ＋<span><strong>'+data.info.reward+'</strong><i>'+cfg_pointName+'</i></span>';
              //总签到已满30天
              //qdTxt = '总签到已满＋'+data.info.zongqian+'天 ＋<span><strong>'+data.info.reward+'</strong><i>'+cfg_pointName+'</i></span>';
              //总签满30天 连签7天
              //qdTxt = '总签满'+data.info.zongqian+'天 连签'+data.info.days+'天 ＋<span><strong>'+data.info.reward+'</strong><i>'+cfg_pointName+'</i></span>';


              $('.QianBox .SuccessIcon').html(qdTxt);
              $('#totalPoint').html(data.info.point);
            }

  				}else{

  					alert(data.info);
  				}
  			},
  			error: function(){
          t.removeClass('disabled');
  				alert(langData['siteConfig'][20][388]);  //网络错误，请求失败！
  			}
  		});
    });


    //初始化ajax获取日历json数据
    $.ajax({
			url: masterDomain+'/include/ajax.php?service=member&action=qiandaoRecord&year='+currentYear+"&month="+currentMonth,
			type: "GET",
			async: false,
			dataType: "jsonp",
			success: function (data) {
				if(data && data.state == 100){
          			calUtil.setMonthAndDay();
					calUtil.init(data.info.alreadyQiandao,data.info.notQiandao,data.info.specialDate);
          			speClass();

				}else{
					alert(data.info);
				}
			},
			error: function(){
				alert(langData['siteConfig'][20][388]);  //网络错误，请求失败！
			}
		});

});


// 日历加载主要代码

var calUtil = {

  eventName:"load",
  //初始化日历
  init:function(signList,RetroList,SpecialList){
    calUtil.draw(signList,RetroList,SpecialList);
    calUtil.bindEnvent();
  },
  draw:function(signList,RetroList,SpecialList){

    //绑定日历
    var str = calUtil.drawCal(calUtil.showYear,calUtil.showMonth,signList,RetroList,SpecialList);
    $("#calendar").html(str);
    var currYearY = (new Date()).getFullYear();
    var currMonthM = (new Date()).getMonth();
    currMonthM = currMonthM < 10 ? '0'+currMonthM : currMonthM;
    if(currYearY == calUtil.showYear && currMonthM == calUtil.showMonth){//当月
      cflag = 0;//下个月不可点
    }

    var currMonthM2 = (new Date()).getMonth() + 1;
    currMonthM2 = currMonthM2 < 10 ? '0'+currMonthM2 : currMonthM2;
    if(!(currYearY == calUtil.showYear && currMonthM2 == calUtil.showMonth)){//非当月
      tFlag = 0;
    }else{
      tFlag = 1;
    }

    //绑定日历表头
    var calendarName=calUtil.showYear+"/"+calUtil.showMonth;
    $(".calendar_month_span").html(calendarName);

    //2020-10-20
    speCla(tFlag);//针对不可补签写样式
  },
  //绑定事件
  bindEnvent:function(){

    //绑定上个月事件
    $(".calendar_month_prev").click(function(){
      var t = $(this);
      if(t.hasClass("disabled")) return false;
      calUtil.eventName="prev";
      calUtil.setMonthAndDay();
      t.addClass("disabled");
      cflag = 1;
     // $('.calendar_month_next').removeClass("disabled");
      $.ajax({
  			url: masterDomain+'/include/ajax.php?service=member&action=qiandaoRecord&year='+calUtil.showYear+"&month="+calUtil.showMonth,
  			type: "GET",
  			async: false,
  			dataType: "jsonp",
  			success: function (data) {
          t.removeClass("disabled");
  				if(data && data.state == 100){
  					calUtil.init(data.info.alreadyQiandao,data.info.notQiandao,data.info.specialDate);
            speClass();
  				}else{
  					alert(data.info);
  				}
  			},
  			error: function(){
          $(this).removeClass("disabled");
  				alert(langData['siteConfig'][20][388]);  //网络错误，请求失败！
  			}
  		});
    });

    //绑定下个月事件
    $(".calendar_month_next").click(function(){
      var t = $(this);
      if(t.hasClass("disabled")) return false;
      var nowYear = parseInt($(".calendar_month_span").html().split("/")[0]), nowMonth = parseInt($(".calendar_month_span").html().split("/")[1]);
      // 限制只能翻近两个月
      //if (nowYear + nowMonth < currentYear + currentMonth) {
        calUtil.eventName="next";
        calUtil.setMonthAndDay();
        t.addClass("disabled");
        $.ajax({
    			url: masterDomain+'/include/ajax.php?service=member&action=qiandaoRecord&year='+calUtil.showYear+"&month="+calUtil.showMonth,
    			type: "GET",
    			async: false,
    			dataType: "jsonp",
    			success: function (data) {
            t.removeClass("disabled");
    				if(data && data.state == 100){
    					calUtil.init(data.info.alreadyQiandao,data.info.notQiandao,data.info.specialDate);
              speClass();
    				}else{
    					alert(data.info);
    				}
    			},
    			error: function(){
            t.removeClass("disabled");
    				alert(langData['siteConfig'][20][388]);  //网络错误，请求失败！
    			}
    		});
      //}
    });

  },
  //获取当前选择的年月
  setMonthAndDay:function(){
    switch(calUtil.eventName)
    {
      case "load":
        calUtil.showYear=currentYear;
        calUtil.showMonth=currentMonth < 10 ? "0" + currentMonth : currentMonth;
        break;
      case "prev":
        var nowMonth=$(".calendar_month_span").html().split("/")[1];
        var newMonth = parseInt(nowMonth)-1;
        calUtil.showMonth=newMonth < 10 ? "0" + newMonth : newMonth;
        if(calUtil.showMonth==0)
        {
            calUtil.showMonth=12;
            calUtil.showYear-=1;
        }
        break;
      case "next":
        var nowMonth=$(".calendar_month_span").html().split("/")[1];
        var newMonth = parseInt(nowMonth)+1;
        calUtil.showMonth=newMonth < 10 ? "0" + newMonth : newMonth;
        if(calUtil.showMonth==13)
        {
            calUtil.showMonth="01";
            calUtil.showYear+=1;
        }
        break;
    }
  },
  getDaysInmonth : function(iMonth, iYear){
   var dPrevDate = new Date(iYear, iMonth, 0);
   return dPrevDate.getDate();
  },
  bulidCal : function(iYear, iMonth) {
   var aMonth = new Array();
   aMonth[0] = new Array(7);
   aMonth[1] = new Array(7);
   aMonth[2] = new Array(7);
   aMonth[3] = new Array(7);
   aMonth[4] = new Array(7);
   aMonth[5] = new Array(7);
   aMonth[6] = new Array(7);
   var dCalDate = new Date(iYear, iMonth - 1, 1);
   var iDayOfFirst = dCalDate.getDay();
   var iDaysInMonth = calUtil.getDaysInmonth(iMonth, iYear);
   var iVarDate = 1;
   var d, w;
   aMonth[0][0] = "日";
   aMonth[0][1] = "一";
   aMonth[0][2] = "二";
   aMonth[0][3] = "三";
   aMonth[0][4] = "四";
   aMonth[0][5] = "五";
   aMonth[0][6] = "六";
   for (d = iDayOfFirst; d < 7; d++) {
    aMonth[1][d] = iVarDate;
    iVarDate++;
   }
   for (w = 2; w < 7; w++) {
    for (d = 0; d < 7; d++) {
     if (iVarDate <= iDaysInMonth) {
      aMonth[w][d] = iVarDate;
      iVarDate++;
     }
    }
   }
   return aMonth;
  },
  ifHasSigned : function(signList, day){
    var note = "";
    if(day != undefined){
      $.each(signList,function(index,item){
        if(item.date == day) {
          note = item.note;
        }
      });
    }
    return note;
  },
  Retroactive : function(RetroList,day){
   var Retro = false;
   $.each(RetroList,function(index,item){
    if(item == day) {
     Retro = true;
     return false;
    }
   });
   return Retro ;
  },
  SpecialData : function(SpecialList, Year, Month, day){
   var data = [], day = day < 10 ? "0" + day : day;
   $.each(SpecialList,function(index,item){
    if (item['date'] == Year + "-" + Month + "-" + day) {
     data = {'title': item.title, 'color': item.color}
    }
   });
   return data;
  },
  TodayData : function(TrueYear, TrueMonth, TrueDay, Year, Month, day){
   var Retro = false;
    if(TrueYear == Year && TrueMonth == Month && TrueDay == day) {
       Retro = true;
    }
   return Retro;
  },
  drawCal : function(iYear,iMonth ,signList ,RetroList, SpecialList) {


   var myMonth = calUtil.bulidCal(iYear, iMonth);
   var htmls = new Array();
   htmls.push("<div class='sign_main' id='sign_layer'>");
   htmls.push("<div class='sign_succ_calendar_title'>");
   if(cflag == 1){
    htmls.push("<div class='calendar_month_next'></div>");
  }else{
    htmls.push("<div class='calendar_month_next disabled'></div>");
  }

   htmls.push("<div class='calendar_month_prev'></div>");
   htmls.push("<div class='calendar_month_span'></div>");
   htmls.push("</div>");
   htmls.push("<div class='sign' id='sign_cal'>");
   htmls.push("<div class='table'>");
   htmls.push("<div class='weekHead'>");
   for(var wk = 0;wk<7;wk++){
    htmls.push("<span>" + myMonth[0][wk] + "</span>");
   }
   htmls.push("</div>");
   var d, w;

   for (w = 1; w < 7; w++) {
    htmls.push("<div  class='WeekDay'>");
    for (d = 0; d < 7; d++) {

     // 当前日期高亮提示
     var TodayData = calUtil.TodayData(currentYear, currentMonth, currentDay, iYear, iMonth, myMonth[w][d]);
     // 已签到日期循环对号
     var ifHasSigned = calUtil.ifHasSigned(signList, myMonth[w][d]);
     // 补签日期循环对号
     if (RetroList != undefined) {
       var Retroactive = calUtil.Retroactive(RetroList, myMonth[w][d]);
     }
     // 特殊日期循环对号
     if (SpecialList != undefined) {
       var SpecialData = calUtil.SpecialData(SpecialList, iYear, iMonth, myMonth[w][d]);
     }

     if(ifHasSigned){
        if (SpecialData.title) {
          if(TodayData){
            htmls.push("<div data-id='"+myMonth[w][d]+"' class='on special speToday' title='"+ifHasSigned+"'><div class='TodayTips'>" + (!isNaN(myMonth[w][d]) ? myMonth[w][d] : " ") + "</div> <i></i><p style='background:"+SpecialData.color+"'>"+SpecialData.title+"</p></div>");
          }else{
            htmls.push("<div data-id='"+myMonth[w][d]+"' class='on special' title='"+ifHasSigned+"'>" + (!isNaN(myMonth[w][d]) ? myMonth[w][d] : " ") + " <i></i><p style='background:"+SpecialData.color+"'>"+SpecialData.title+"</p></div>");
          }
        }else{
          if(TodayData){//2020-10-19 speToday 选出今天为分界点
            htmls.push("<div data-id='"+myMonth[w][d]+"' class='on speToday' title='"+ifHasSigned+"'>" + (!isNaN(myMonth[w][d]) ? myMonth[w][d] : " ") + " <i></i></div>");
          }else{
            htmls.push("<div data-id='"+myMonth[w][d]+"' class='on' title='"+ifHasSigned+"'>" + (!isNaN(myMonth[w][d]) ? myMonth[w][d] : " ") + " <i></i></div>");
          }

        }
     } else if(Retroactive) {
        if (SpecialData.title) {
          if(cfg_qiandao_buqianState){
            htmls.push("<div data-id='"+myMonth[w][d]+"' data-id='"+myMonth[w][d]+"' class='bu special'>" + (!isNaN(myMonth[w][d]) ? myMonth[w][d] : " ") + " <i></i><span>"+langData['siteConfig'][22][114]+"</span><p style='background:"+SpecialData.color+"'>"+SpecialData.title+"</p></div>");
          }else{
            htmls.push("<div data-id='"+myMonth[w][d]+"' data-id='"+myMonth[w][d]+"' class='bu special empty'>" + (!isNaN(myMonth[w][d]) ? myMonth[w][d] : " ") + " <i></i><p style='background:"+SpecialData.color+"'>"+SpecialData.title+"</p></div>");
          }
        }else{
          if(cfg_qiandao_buqianState){
            htmls.push("<div data-id='"+myMonth[w][d]+"' data-id='"+myMonth[w][d]+"' class='bu'>" + (!isNaN(myMonth[w][d]) ? myMonth[w][d] : " ") + " <i></i><span>"+langData['siteConfig'][22][114]+"</span></div>");
          }else{
            htmls.push("<div data-id='"+myMonth[w][d]+"' data-id='"+myMonth[w][d]+"' class='bu empty'>" + (!isNaN(myMonth[w][d]) ? myMonth[w][d] : " ") + " <i></i></div>");
          }
        }
     }else{
        if (SpecialData.title) {
          if(TodayData){
            htmls.push("<div data-id='"+myMonth[w][d]+"' class='today special speToday'><div class='TodayTips'>" + (!isNaN(myMonth[w][d]) ? myMonth[w][d] : " ") + "</div> <i></i><span>"+langData['siteConfig'][22][114]+"</span><p style='background:"+SpecialData.color+"'>"+SpecialData.title+"</p></div>");
          }else{
            htmls.push("<div data-id='"+myMonth[w][d]+"' class='special empty'>" + (!isNaN(myMonth[w][d]) ? myMonth[w][d] : " ") + " <i></i><p style='background:"+SpecialData.color+"'>"+SpecialData.title+"</p></div>");
          }
        }else{
          if(TodayData){
            htmls.push("<div data-id='"+myMonth[w][d]+"' class='today speToday'><div class='TodayTips'>" + (!isNaN(myMonth[w][d]) ? myMonth[w][d] : " ") + "</div> <i></i></div>");
          }else{
            htmls.push("<div class='empty'>" + (!isNaN(myMonth[w][d]) ? myMonth[w][d] : "") + "</div>");
          }
        }
     }
    }
    htmls.push("</div>");
   }
   htmls.push("</div>");
   htmls.push("</div>");
   htmls.push("</div>");
   return htmls.join('');
  }
};
