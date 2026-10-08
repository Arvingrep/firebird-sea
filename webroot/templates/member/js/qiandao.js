$(function(){

    // 今日签到
    var qiandao = function(t){
      if(t.hasClass('disabled') || t.hasClass('on')) return false;
      $('.ClickSign, .today').addClass('disabled');
      $.ajax({
  			url: masterDomain+'/include/ajax.php?service=member&action=qiandao&date='+currentYear+"-"+currentMonth+"-"+$(".today").attr("data-id"),
  			type: "GET",
  			async: false,
  			dataType: "jsonp",
  			success: function (data) {
          $('.ClickSign, .today').removeClass('disabled');
  				if(data && data.state == 100){
            $('.disk').show();
            $('.QianBox').show();
            $(".today").addClass('on');
            $(".ClickSign").addClass('disabled').html(langData['siteConfig'][22][124]);//已签到

            $('.Continuous em').html(data.info.days);
            $('.AllDay em').html(data.info.zongqian);
            $('.QianBox .SuccessDay').html(langData['siteConfig'][22][118].replace('1', data.info.zongqian));//签到第1天
            $('.QianBox .SuccessIcon').html(data.info.reward);
            $('.QianBox p').html(data.info.note);
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
      $(".SureBox").show();
      buqianDate = $(this).attr("data-id");
      buqianObj = $(this);
    })
    // 签到规则弹出层
    $(".Rules").click(function(){
      $(".disk").show();
      $(".RulesBox").show();
    })
    // 关闭弹出层
    $(".close").click(function(){
      $('.disk').hide();
      $('.SuccessBox').hide();
      $('.flower').hide();
      $('.RulesBox').hide();
    })
    $('.cancle').click(function(){
      $('.disk').hide();
      $(".SureBox").hide();
    })

    //确认补签
    $('.SureBox .sure').bind('click', function(){
      var t = $(this);
      if(t.hasClass('disabled')) return false;
      t.addClass('disabled');
      $.ajax({
  			url: masterDomain+'/include/ajax.php?service=member&action=qiandao&date='+calUtil.showYear+"-"+calUtil.showMonth+"-"+buqianDate,
  			type: "GET",
  			async: false,
  			dataType: "jsonp",
  			success: function (data) {
          t.removeClass('disabled');
  				if(data && data.state == 100){
            $(".SureBox").hide();
            $('.QianBox').show();
            buqianObj.addClass('on').removeClass('bu');
            buqianObj.find('span').remove();

            $('.Continuous em').html(data.info.days);
            $('.AllDay em').html(data.info.zongqian);
            $('.QianBox .SuccessDay').html(langData['siteConfig'][22][118].replace('1', data.info.zongqian));//签到第1天
            $('.QianBox .SuccessIcon').html(data.info.reward);
            $('.QianBox p').html(data.info.note);
            $('#totalPoint').html(data.info.point);

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
    //绑定日历表头
    var calendarName=calUtil.showYear+"/"+calUtil.showMonth;
    $(".calendar_month_span").html(calendarName);
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
      $.ajax({
  			url: masterDomain+'/include/ajax.php?service=member&action=qiandaoRecord&year='+calUtil.showYear+"&month="+calUtil.showMonth,
  			type: "GET",
  			async: false,
  			dataType: "jsonp",
  			success: function (data) {
          t.removeClass("disabled");
  				if(data && data.state == 100){
  					calUtil.init(data.info.alreadyQiandao,data.info.notQiandao,data.info.specialDate);
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
   aMonth[0][0] = langData['siteConfig'][13][25];//日
   aMonth[0][1] = langData['siteConfig'][30][61];//一
   aMonth[0][2] = langData['siteConfig'][30][62];//二
   aMonth[0][3] = langData['siteConfig'][30][63];//三
   aMonth[0][4] = langData['siteConfig'][30][64];//四
   aMonth[0][5] = langData['siteConfig'][30][65];//五
   aMonth[0][6] = langData['siteConfig'][30][66];//六
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
   htmls.push("<div class='calendar_month_next'></div>");
   htmls.push("<div class='calendar_month_prev'></div>");
   htmls.push("<div class='calendar_month_span'></div>");
   htmls.push("</div>");
   htmls.push("<div class='sign' id='sign_cal'>");
   htmls.push("<table valign='top'>");
   htmls.push("<tr>");
   htmls.push("<th>" + langData['siteConfig'][14][10] + "</th>");//星期日
   htmls.push("<th>" + langData['siteConfig'][14][4] + "</th>");//星期一
   htmls.push("<th>" + langData['siteConfig'][14][5] + "</th>");//星期二
   htmls.push("<th>" + langData['siteConfig'][14][6] + "</th>");//星期三
   htmls.push("<th>" + langData['siteConfig'][14][7] + "</th>");//星期四
   htmls.push("<th>" + langData['siteConfig'][14][8] + "</th>");//星期五
   htmls.push("<th>" + langData['siteConfig'][14][9] + "</th>");//星期六
   htmls.push("</tr>");
   var d, w;

   for (w = 1; w < 7; w++) {
    htmls.push("<tr  class='WeekDay'>");
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
            htmls.push("<td data-id='"+myMonth[w][d]+"' class='on special' title='"+ifHasSigned+"'><div class='TodayTips'>" + (!isNaN(myMonth[w][d]) ? myMonth[w][d] : " ") + "</div> <i></i><p style='background:"+SpecialData.color+"'>"+SpecialData.title+"</p></td>");
          }else{
            htmls.push("<td data-id='"+myMonth[w][d]+"' class='on special' title='"+ifHasSigned+"'>" + (!isNaN(myMonth[w][d]) ? myMonth[w][d] : " ") + " <i></i><p style='background:"+SpecialData.color+"'>"+SpecialData.title+"</p></td>");
          }
        }else{
          htmls.push("<td data-id='"+myMonth[w][d]+"' class='on' title='"+ifHasSigned+"'>" + (!isNaN(myMonth[w][d]) ? myMonth[w][d] : " ") + " <i></i></td>");
        }
     } else if(Retroactive) {
        if (SpecialData.title) {
          if(cfg_qiandao_buqianState){
            htmls.push("<td data-id='"+myMonth[w][d]+"' data-id='"+myMonth[w][d]+"' class='bu special'>" + (!isNaN(myMonth[w][d]) ? myMonth[w][d] : " ") + " <i></i><span>"+langData['siteConfig'][22][114]+"</span><p style='background:"+SpecialData.color+"'>"+SpecialData.title+"</p></td>");
            //补签
          }else{
            htmls.push("<td data-id='"+myMonth[w][d]+"' data-id='"+myMonth[w][d]+"' class='bu special empty'>" + (!isNaN(myMonth[w][d]) ? myMonth[w][d] : " ") + " <i></i><p style='background:"+SpecialData.color+"'>"+SpecialData.title+"</p></td>");
          }
        }else{
          if(cfg_qiandao_buqianState){
            htmls.push("<td data-id='"+myMonth[w][d]+"' data-id='"+myMonth[w][d]+"' class='bu'>" + (!isNaN(myMonth[w][d]) ? myMonth[w][d] : " ") + " <i></i><span>"+langData['siteConfig'][22][114]+"</span></td>");
            //补签 
          }else{
            htmls.push("<td data-id='"+myMonth[w][d]+"' data-id='"+myMonth[w][d]+"' class='bu empty'>" + (!isNaN(myMonth[w][d]) ? myMonth[w][d] : " ") + " <i></i></td>");
          }
        }
     }else{
        if (SpecialData.title) {
          if(TodayData){
            htmls.push("<td data-id='"+myMonth[w][d]+"' class='today special'><div class='TodayTips'>" + (!isNaN(myMonth[w][d]) ? myMonth[w][d] : " ") + "</div> <i></i><span>"+langData['siteConfig'][22][114]+"</span><p style='background:"+SpecialData.color+"'>"+SpecialData.title+"</p></td>");
            //补签
          }else{
            htmls.push("<td data-id='"+myMonth[w][d]+"' class='special empty'>" + (!isNaN(myMonth[w][d]) ? myMonth[w][d] : " ") + " <i></i><p style='background:"+SpecialData.color+"'>"+SpecialData.title+"</p></td>");
          }
        }else{
          if(TodayData){
            htmls.push("<td data-id='"+myMonth[w][d]+"' class='today'><div class='TodayTips'>" + (!isNaN(myMonth[w][d]) ? myMonth[w][d] : " ") + "</div> <i></i></td>");
          }else{
            htmls.push("<td class='empty'>" + (!isNaN(myMonth[w][d]) ? myMonth[w][d] : "") + "</td>");
          }
        }
     }
    }
    htmls.push("</tr>");
   }
   htmls.push("</table>");
   htmls.push("</div>");
   htmls.push("</div>");
   return htmls.join('');
  }
};
