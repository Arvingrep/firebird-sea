var validTrade = null;
// 获取url参数
	function getParam(paramName) {
		paramValue = "", isFound = !1;
		if (this.location.search.indexOf("?") == 0 && this.location.search.indexOf("=") > 1) {
			arrSource = unescape(this.location.search).substring(1, this.location.search.length).split("&"), i = 0;
			while (i < arrSource.length && !isFound) arrSource[i].indexOf("=") > 0 && arrSource[i].split("=")[0].toLowerCase() == paramName.toLowerCase() && (paramValue = arrSource[i].split("=")[1], isFound = !0), i++
		}
		return paramValue == "" && (paramValue = null), paramValue
	}
var managePage = new Vue({
  el:'#page',
  data:{
    EditId:'0',  //当前要删除的id
    extendTipShow:false,  //是否显示推广提示
    infoList:[],  //发布的信息数据
    noData:false, //没有数据
    calendarList:[],  //日历数据
    todayTime: (new Date( new Date(new Date().toLocaleDateString()).getTime() )).valueOf(),
    starTime:0,  //计划置顶开始时间
    endTime:0,  //计划置顶结束时间
    cfg_info_topPlan:cfg_info_topPlan=='null'?[]:cfg_info_topPlan, //置顶相关数据
    topPlanFulldayUnit:2,  //计划置顶全天，单价
    topPlanUnit:1,  //计划置顶全天，单价
    topPlanAmount:0, //计划置顶费用
    weekPriceUnit:[], //置顶时间星期
    currShowYear:(new Date()).getFullYear(), //置顶计划当前显示的年
    currShowMonth:(new Date()).getMonth() + 1, //置顶计划当前显示的月
    currShowYearMonth:(new Date()).getFullYear() + '/' +((new Date()).getMonth() + 1), //置顶计划当前显示的月
    currShowMonthData:[],  //置顶计划当前显示的月的数据
    currTopData:[],  // 当前月置顶数据
    topType: 0,   //置顶类型,0是立即置顶，1是计划置顶
    topDates:'',  //置顶时间
    freshDates:'', //刷新天数
    topMustData:[], //立即置顶数据
    smartFreshData:[  //智能刷新的相关配置
      {
        days:1,  //刷新天数
        unit:8,  //单价
        countPrice:8,  //计价
        fresh:4,  //每日刷新次数
      },
      {
        days:3,  //刷新天数
        unit:8,  //单价
        countPrice:19,  //计价
        fresh:12,  //每日刷新次数
      },
      {
        days:7,  //刷新天数
        unit:8,  //单价
        countPrice:49,  //计价
        fresh:28,  //每日刷新次数
      },
      {
        days:0,  //刷新天数
        countPrice:6,  //计价
        fresh:1,  //每日刷新次数
      },

    ],
    normalRefreshPice:0, //普通刷新
    jiliData:{
      // hbData:{
      //   hbAmount:145,       //红包总额
      //   hbLeftAmount:130,   //红包剩余
      //   hbNum:20,           //红包个数
      //   hbLeftNum:10,       //红包剩余个数
      //   hbMessage:'聚会就去长谷深度沉浸密室',       //红包口令
      // },
      // readData:{
      //   unit:.08,       //奖励金额
      //   shareNum:130,  //分享人次
      //   readNum:20,         //奖励次数
      //   readLeftNum:4,    //奖励剩余次数
      // },
    },
    hasSetTop:false,  //是否设置过置顶，true是设置过
    hasSetjili:false,  //是否设置过用户激励，true是设置过

    loadIcon:false,  //loading图标
    editObj:[], //编辑对象
    editIndex:0, //编辑索引
    totalCount : 0,  //全部
    refuse  : 0,     //待审核
    extension : 0, //推广中
    expire : 0, //已失效
    refreshSmart : false,   //是否刷新
    bid_end : 0,   //指定结束时间

    page:1,
    locked:0,
    loadText:'正在加载...',
    interValList:[], //计时器存放数组
    setMsg:false,

    // 有效期
    valid:valid ? JSON.parse(valid)[0] : {day:0},
    validArr:JSON.parse(validArr),
    validUnit:0,
    validChose:[],
    valid_id:0,
    level_vip:level_vip, //会员等级
  },
  created(){
    var tt = this;
    toggleDragRefresh('off');  //取消下拉刷新
    tt.validChose = tt.validArr[0]; //默认状态
    if(getParam('id')){
      tt.valid_id = getParam('id');
    }
  },
  computed:{
    // 时间戳转换
    getDateDiff(){
       return function(t,type){
          var n = new Date().getTime() / 1000;
          var c = n - t;
          var str = '';
          if(c < 60) {
              str = '刚刚';
          } else if(c < 3600) {
              str = parseInt(c / 60) + '分钟前';
          } else if(c < 86400) {
              str = parseInt(c / 3600) + '小时前';
          } else if(c < 604800) {
              str = parseInt(c / 86400) + '天前';
          } else {
              str = huoniao.transTimes(t,type);
          }
          return str;
       }
    },
    // 计算日期
    countDay(){
      var tt = this;
      return function(day,calendar){
        var countday = (day-calendar.weekFirst > 0)?(day-calendar.weekFirst) : "";
        return countday;
      }
    },

    // 计算时间戳
    countTime(){
      var tt = this;
      return function(day,calendar){
        var countday = (day-calendar.weekFirst > 0)?(day-calendar.weekFirst) : "";
        var counttime = new Date(calendar.year+'/'+calendar.month+'/'+countday);
        counttime = counttime.valueOf();
        return counttime;
      }
    },

    // 计算时间差
    countTimeOff(){
      return function(timeStr,type){ //type为1表示列表中，不填表示只展示有效期
        // console.log(timeStr,type)
        var tt = this;
        var nowDate = parseInt((new Date()).valueOf()/1000);
        var timeOff = timeStr - nowDate;
        var weekTimeOff = 7 * 86400;
        var showText = '';
        var btn_show = 0; //是否显示增加有效期到按钮
        if(type){
          if(timeOff <= 0){ //已失效
            showText = '已失效';
            btn_show = 1;
          }else if(timeOff <= weekTimeOff){
            var timeTrans = timeOff / 86400
            showText =  (Number(timeTrans.toString().split('.')[0]) + 1) +'天后失效';
            btn_show = 2;
          }else{
            var timeTrans = timeOff / 86400;
            if(Number(timeTrans) >= Number(tt.valid['day']/2) ){
              btn_show = 3;  //永久
            }
          }
          return [showText,btn_show];
        }else{
          if(timeOff > 0){
            var timeTrans = timeOff / 86400;
              showText = '剩余'+(Number(timeTrans.toString().split('.')[0]) + 1)+'天'
          }
          return showText;
        }

      }
    },

    // 插入置顶数据
    checkPlan(){
      return function(day){
        var tt = this;
        var palndata = tt.currTopData;
        var showText = '-';
        day = day > 9 ? day : '0' + day
        var month = tt.currShowMonthData.month > 9 ? tt.currShowMonthData.month : '0' + tt.currShowMonthData.month
        var currMonth = tt.currShowMonthData.year+'/'+month+'/'+day;
        var weekDay = (new Date(currMonth)).getDay() ;
        if(palndata && palndata.length > 0){
          palndata.forEach(function(topDay){
            if((topDay.date.replace(/-/g,'/')).indexOf(currMonth) > -1){
               
                if(topDay.type == 'day'){
                  showText = langData['info'][4][25]; //'早8晚8';
                }else{
                  showText = langData['info'][3][84]; //'全天';
                }
            }
          })
        }
        else if(tt.editObj.bid_type && tt.editObj.bid_type == 'normal'){
          var bid_start = tt.editObj.bid_start * 1000;
          let nowTimeDate = new Date(bid_start);
          nowTimeDate.setHours(0, 0, 0, 0);//设为当天0点0分0秒0毫秒。
          nowTimeDate = nowTimeDate.getTime()
          var bid_end = tt.editObj.bid_end * 1000;
          var currday = parseInt((new Date(currMonth)).getTime());

          if(bid_end  >= currday && nowTimeDate <= currday ){
            showText= "置顶"
          }
        }

        return showText;
      }
    },

    // 判断截止时间
    checkEndPlan(){
      return function(day){
        var tt = this;
        var bid_end = tt.editObj.bid_end?tt.editObj.bid_end:0;
        var endday = 0;
        var ifEnd = false;
        if(tt.editObj.bid_type ){
          if(tt.editObj.bid_type=='plan'){
            var endDate = tt.currTopData && tt.currTopData.length?(tt.currTopData[tt.currTopData.length-1].date):'0-0-0';
            if(day == Number(endDate.split('-')[2])){
              ifEnd = true;
            }
          }else{
            var endDate = huoniao.transTimes(bid_end,2)
            if(day == Number(endDate.split('-')[2])){
              ifEnd = true;
            }
          }
        }
        return ifEnd;
      }
    },
    // 时间戳转换成日期
    timeTrans(){
      return function(timestamp,n){
        
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
    },
    // 刷新、置顶倒计时
    toTopCutDown(){
      return function(time,type){
        if(type){
          return huoniao.transTimes(time,type)
        }else{
          return huoniao.transTimes(time,1)
        }
      }
    },

    // 年月日转换
    daysChange(){
      return function(item){
        var tt = this;
        var showText = '';
        showText = item.day + item.dayText;
        // if(item.dayText != '天'){
        //   showText = item.day + item.dayText;
        // }else{
        //   var days = item.day;
        //   if(days < 30){
        //     showText = days +'天'
        //   }else if(days >= 30){
        //     showText = parseInt(days/30) +'月'
        //     if(parseInt(days/30) >= 12){
        //       showText = parseInt(parseInt(days/30) / 12) +'年';
        //     }
        //   }
        // }
        if(item.day >= 3650){
          showText = '永久有效'
        }
        return showText;
      }
    }



    // 刷新倒计时
    // freshCutDown(){
    //
    //         //  countdown：倒计时
    //         return function(time){
    //           var timetext = '';
    //           var alltime = time * 1000 - (new Date()).getTime();  //总的时间（毫秒）
    //
    //
    //           return timetext;
    //       }
    //   }
  },
  mounted(){
    var tt = this;
    // console.log(tt.validArr)
    if(tt.validArr.length > 0){
      tt.validArr.forEach(function(val,ind){
        if(ind == 0){
          tt.validUnit = parseInt(val.price / val.day)
        }
        tt.validArr[ind]['offer'] = parseInt(tt.validUnit * val.day - val.price);
      })

    }


    $(".tabs a").click(function(){
      var el = $(this);
      var type = el.attr('data-type');
      el.addClass('curr').siblings('a').removeClass('curr');
      var offLeft = el.offset().left,wid = el.width() - $(".tabs s").width();  //
      $(".tabs s").css('transform','translateX('+(offLeft + wid/2) +'px)');
      tt.page = 1;
      tt.locked = 0;
      tt.getinfoList();
    });

    $(".tabs a").eq(0).click();


    // confirm弹窗
    var popOptions = {
      btnTrggle:'.delInfo',  //点击触发按钮
      title: langData['info'][4][23],  //'确定删除信息？',  //提示文字
      btnColor:'#F23D18',
      confirmTip:langData['info'][4][24],   //'一经删除不可恢复',  //副标题
      trggleType:'1',
    }
    confirmPop(popOptions,function(){
      tt.delInfo();
    });

    // 计划置顶选择日期
    var options={
      months:24,
    }
    tt.calendarList = getCalendar(options);


    // 计划置顶展示显示
    var optionRead = {
      showDate:tt.currShowYearMonth,
    }
    tt.currShowMonthData =  getCalendar(optionRead);


    // 置顶选择
    $('.toTopPop .top_tabs a').click(function(){
      var t = $(this);
      if(t.hasClass('toTop')){
        tt.topType = 0;
      }else{
        tt.topType = 1;
      }

    });


    // 选择全天还是早8晚8
    $("body").delegate('.weekTime .timetab','click',function(){
      var t = $(this);
      t.addClass('onChose').siblings('.timetab').removeClass('onChose');
      tt.checkTopPlanAmount();
    });

    tt.refreshTopFunc();


    $(window).scroll(function() {
      var scrTop = $(window).scrollTop();
      var bh = $('body').height() - 50;
      var wh = $(window).height();
      // 滚动加载更多
      if (scrTop + wh >= bh && !tt.locked) {
        tt.getinfoList();
      }
    })






  },


  watch:{
    validChose(val){
      var tt = this;
      // console.log(val.day , tt.validAll)
    },
    endTime(){
      var tt = this;
      if(tt.endTime > 0){
        $('.timeChose').removeClass('fn-hide');
        tt.checkTopPlanAmount();
      }
    },
    infoList(val){
        var tt = this;
      // 是否直接增加有效期
      // console.log(val)
      if(tt.valid_id){
        tt.editObj = tt.infoList[0]
        setTimeout(function(){
          tt.showdelayPop(tt.editObj)
        },300)
      }

      
      if(tt.interValList.length){
        for(var i=0 ;i<tt.interValList.length; i++){
          clearInterval(tt.interValList[i])
        }
      }



      setTimeout(function(){
        $('.info_li').each(function(){
          var t = $(this);
          if(t.find('.refreshtxt').length){
            var times = t.find('.refreshtxt').attr('data-time') - sysNow;
            var intval = setInterval(function(){
              t.find('.refreshtxt em').text(tt.daojishi(times * 1000))
              times--;

              tt.interValList.push(intval)
            },1000)
          }
        })
      },1000)
    },

    // 设置红包口令
    setMsg(val){
      if(val){
        $("#hbMsg").focus();
        $("#hbMsg").attr('placeholder','请输入红包口令')
      }
    },


  },


  methods: {

    //checkPayResult
    checkPayResult(ordernum){
      var tt = this;
      $.ajax({
        type: 'POST',
        async: false,
        url: '/include/ajax.php?service=member&action=tradePayResult&order='+ordernum,
        dataType: 'json',
        success: function(str){
          if(str.state == 100 && str.info != ""){
            clearInterval(validTrade);
            tt.updateValid(1)

          }
        }
      });

    },


    // 继续支付
    keepPay(payInfo){

      var tt = this;
    var t = $(event.currentTarget), aid = payInfo.aid;

    if(typeof (aid) !='undefined' && aid!=''){

      $("#payform input[name='aid']").val(aid);
      $("#payform").append(
          '<input type="hidden" name="aid"  value="'+aid+'" />'
      );
    } else {
      $("#payform").append(
          '<input type="hidden" name="aid"  value="'+$("#aid").val()+'" />'
      );
    }
    console.log(aid)
    if(typeof(module) =='undefined' || typeof(module) != 'string' || module == ''  ){

      module = $("#module").val();
    }

    $("#payform input[name='createtype']").val('1');
    $("#payform input[name='paytype']").val('');
    $("#payform input[name='action']").val('fabuPay');
    $("#payform input[name='amount']").val(payInfo.order_amount);
    if($('#payform input[name="balance"]').length == 0){
      $('#payform').append('<input type="hidden" value="'+payInfo.order_amount+'" name="balance">')
    }else{
      $('#payform input[name="balance"]').val(payInfo.order_amount)
    }
      var nowDate = parseInt((new Date()).valueOf()/1000)
      var oldValid = tt.editObj.waitpay == '1' ? 0 : tt.editObj.valid;
      oldValid = Number(oldValid) > nowDate  ? Number(oldValid) : nowDate;
      valid = oldValid + Number(tt.validChose.daytime);
      $("#payform input[name='valid']").val(valid);
      $("#payform input[name='validType']").val(1);
      ordernum = payInfo.ordernum;
      if($("#payform input[name='ordernum']").size() > 0){
          $("#payform input[name='ordernum']").val(ordernum);
      }else{
          $('#payform').append('<input type="hidden" value="' + ordernum + '" name="ordernum">')
      }
    // $("#payform #tourl").val( document.URL);
    // orderurl = document.URL
    $.ajax({
      type: 'POST',
      url: '/include/ajax.php?service=member&action=fabuPay',
      dataType: 'json',
      data:$("#payform").serialize(),
      success: function (sdata) {
        if(sdata && sdata.state == 100) {
          sinfo = sdata.info;
          ordertype = 'fabuPay';

          $("#amout").text(sinfo.order_amount);
          // if($('#payform input[name="balance"]').length == 0){
          //   $('#payform').append('<input type="hidden" value="'+sinfo.order_amount+'" name="balance">')
          // }else{
          //   $('#payform input[name="balance"]').val(sinfo.order_amount)
          // }
          if(sinfo.order_amount > 0){
            $('.payMask').show();
            $('.payPop').css('transform', 'translateY(0)');
          }
          //
          // if (totalBalance * 1 < sinfo.order_amount * 1) {
          //
          //   $("#moneyinfo").text('余额不足，');
          //
          //   $('#balance').hide();
          // }
          if (totalBalance * 1 < sinfo.order_amount * 1) {

            $("#moneyinfo").text('余额不足，');
            $("#moneyinfo").closest('.check-item').addClass('disabled_pay')

            $('#balance').hide();
          }

          if(monBonus * 1 < sinfo.order_amount * 1  &&  bonus * 1 >= sinfo.order_amount * 1){
            $("#bonusinfo").text('额度不足，');
            $("#bonusinfo").closest('.check-item').addClass('disabled_pay')
          }else if( bonus * 1 < sinfo.order_amount * 1){
            $("#bonusinfo").text('余额不足，');
            $("#bonusinfo").closest('.check-item').addClass('disabled_pay')
          }else{
            $("#bonusinfo").text('');
            $("#bonusinfo").closest('.check-item').removeClass('disabled_pay')
          }

          ordernum = sinfo.ordernum;
          order_amount = sinfo.order_amount;

          payCutDown('', sinfo.timeout, sinfo);
          if(validTrade){
            clearInterval(validTrade)
          }
          tt.checkPayResult(ordernum)
          validTrade = setInterval(function(){
            tt.checkPayResult(ordernum)
          },2000)
        }
      },
      error: function () {

      }
    })

    },
    // 倒计时
    daojishi(alltime){
        var haoscend = alltime%1000;  //毫秒
        //console.log(haoscend);
        var scend = parseInt ((alltime/1000)%60  ) ;  //秒
        //console.log(scend);
        var minute =parseInt((alltime/1000/60)%60  ) ;  //  分钟
        // console.log(minute);
        var hour =parseInt((alltime/1000/60/60)%24 ) ;   //小时
        // console.log(hour);
        var day=parseInt((alltime/1000/60/60/24)%30);   //天数
        // console.log(day);
        var month=parseInt((alltime/1000/60/60/24/30)%12); //月
        // console.log(month);
        var timeTxt = (month ? month +'月' : '') +
        (day ? day +'天' : '') +
        (hour ? hour +':' : '') +
        (minute > 9 ? minute : '0'+minute) + ':'+
        (scend > 9 ? scend : '0'+scend)
        if(timeTxt == '00:00'){
          timeTxt = ''
        }
        return timeTxt;

    },


    refreshTopFunc() {
      var  tt = this;
      //初始加载配置信息，包括会员相关信息
      $.ajax({
        type: "POST",
        url: "/include/ajax.php",
        dataType: "json",
        data: {
          'service': 'siteConfig',
          'action': 'refreshTopConfig',
          'module': 'info',
          'act': 'detail',
          'userid':userid_, //用户id
        },
        success: function (data) {
          if (data && data.state == 100) {
              // tt.smartFreshData = data.info.config.refreshSmart;

            var refreshSmart =  data.info.config.refreshSmart;
            tt.smartFreshData = [];
            // console.log(data.info.config)
            tt.normalRefreshPice = data.info.config.refreshNormalPrice
            refreshSmart.forEach(function (val){
              tt.smartFreshData.push({
                days:val.day,  //刷新天数
                unit:val.unit ,  //单价
                countPrice:val.price,  //计价
                fresh:val.times,  //每日刷新次数
                offer:val.offer, //优惠价格
              })
            })
            var topNormal = data.info.config.topNormal;
            tt.topMustData = [];
            topNormal.forEach(function (val){
              tt.topMustData.push({
                days:val.day,  //置顶天数
                unit:val.price,  //单价
                countPrice:val.price,  //计价
                offer:val.offer,  //优惠价格
              })
            })

          } else {
            alert(data.info);
          }
        },
        error: function () {
          alert(langData['siteConfig'][20][227]);//网络错误，加载失败！
        }
      });
    },


    // 删除信息
    delInfo(){
      var tt = this;
      $.ajax({
        url: masterDomain+"/include/ajax.php?service=info&action=del&id="+ tt.EditId,
        type: "GET",
        dataType: "jsonp",
        success: function (data) {
          if(data && data.state == 100){

            //删除成功后移除信息层并异步获取最新列表
            // objId.html('');
            showErrAlert('删除成功！');
            tt.hideEditPop();
            setTimeout(function(){
              tt.page = 1;
              tt.locked = false;
              tt.totalCount = tt.totalCount - 1;
              tt.getinfoList(1);
            },800)

          }else{
            // $.dialog.alert(data.info);
            showErrAlert(data.info)
            // t.siblings("a").show();
            // t.removeClass("load");
          }
        },
        error: function(){
          alert(langData['siteConfig'][20][227]);
          t.siblings("a").show();
          t.removeClass("load");
        }
      });
    },

    // 显示延时弹窗
    showdelayPop(info,optype){
      var tt = this;
      $('html').addClass('noscroll');
      $(".delayValidMask").show();
      $(".delayValidPop").addClass('slideUp');
      // var optText = optype ? '选择有效期' : '延长有效期';
      // $(".delayValidPop.slideUp .top_tit h3").text(optText)
      tt.editObj = info;
    },

    // 隐藏延时弹窗
    hidedelayPop(){
      var tt = this;
      $('html').removeClass('noscroll');
      $(".delayValidMask").hide();
      $(".delayValidPop").removeClass('slideUp');
      tt.valid_id = 0;
    },

    // 选择延长时间
    choseValid(item){
      var tt = this;
      var el = event.currentTarget;
      tt.validChose = item;
      $(el).addClass('chosed_top').siblings('li').removeClass('chosed_top');
    },

    // 更新延长时间
    updateValid(haspayVal){
      var tt = this;
      var fabuid = tt.editObj.id;
      var url = '/include/ajax.php?service=info&action=zvalid&id='+fabuid;
      var nowDate = parseInt((new Date()).valueOf()/1000)
      var oldValid = tt.editObj.waitpay == '1' ? 0 : tt.editObj.valid;
      oldValid = Number(oldValid) > nowDate  ? Number(oldValid) : nowDate;
      valid = oldValid + Number(tt.validChose.daytime);


      if(haspayVal){
        var dataTo = {
          hasPay:1,
          valid:valid,
          amount:tt.validChose.price,
        }
      }else{
        var dataTo = {
          valid:valid,
          amount:tt.validChose.price,
        }
      }

      $.ajax({
				url: url,
				data: dataTo,
				type: "POST",
				dataType: "json",
				success: function (data) {
          if(data.state == 100){
            if(!haspayVal){
              tt.keepPay(data.info)
            }else{
              showErrAlert('成功增加信息曝光时长');
              setTimeout(function(){
                location.href='manage-info.html';
                // location.reload();
              },1600)
            }
          }
        },
        error:function(data){
          showErrAlert(data.info)
        },
      })
    },

    // 显示编辑弹窗
    showEditPop(item,index){
      var tt = this;
      tt.EditId = item.id;
      tt.editObj = item;
      tt.validEdit = item.valid;
      tt.editIndex = index;
      $(".optMask").show();
      $('html').addClass('noscroll');
      $('.optPop').addClass('slideUp');
      if((item.hasSetTop && item.hasSetTop == '1') || (item.hasSetjili && item.hasSetjili=='1') || (item.refreshSmart && item.refreshSmart=='1')){
        $('.delInfo').attr('data-title',langData['info'][3][58])
      }else{
        $('.delInfo').attr('data-title','确认删除该信息吗？')
      }
    },

    // 隐藏编辑弹窗
    hideEditPop(){
      $(".optMask").hide();
      $('html').removeClass('noscroll');
      $('.optPop').removeClass('slideUp');
    },
    editInfo(){
      // console.log(141111)
    },

    // 显示弹窗
    checkShow(item){
      // console.log(item)
      var tt = this;
      var el = event.currentTarget;
      tt.editObj = item;
      tt.EditId = item.id;
      tt.hasSetjili = item.hasSetjili == '1' ? true : false;
      tt.refreshSmart = item.refreshSmart == '1' ? true : false;
      tt.hasSetTop = item.isbid == '1' ? true : false;
      tt.jiliData= {
        hbData:{
          hbAmount: item.priceCount,       //红包总额
          hbLeftAmount: item.hongbaoPrice,   //红包剩余
          hbNum: item.countHongbao,           //红包个数
          hbLeftNum: item.hongbaoCount,       //红包剩余个数
          hbMessage: item.hbMessage,       //红包口令
        },
        readData:{
            unit:item.rewardPrice,       //奖励金额
            shareNum:item.countFenxiang,  //分享人次
            readNum:item.CountReward,         //奖励次数
            readLeftNum:item.rewardCount,    //奖励剩余次数
       }
      }
      var toTop = $(el).find('.toTop').length;
      var refresh = $(el).find('.refreshtxt').length;
      var jili = $(el).find('.jili').length;
      if((toTop && jili) || (refresh && jili) || (refresh && toTop)){
        tt.showExtend(item,0)
      }else if(toTop){
        tt.showtoTopPop();
      }else if(jili){
        tt.showjiliPop();
      }else{
        tt.showSmartFresh();
      }

    },

    // 显示推广弹窗
    showExtend(info,index){
      var tt = this;
      tt.EditId = info.id;
      tt.editObj = info;
      tt.editIndex = index;
      $(".exMask").show();
      $('html').addClass('noscroll');
      $('.extendPop').addClass('slideUp');
      tt.hasSetjili = info.hasSetjili == '1' ? true : false;
      tt.refreshSmart = info.refreshSmart == '1' ? true : false;
      tt.hasSetTop = info.isbid == '1' ? true : false;
      // console.log(tt.hasSetjili)
      tt.jiliData= {
        hbData:{
          hbAmount: info.priceCount,       //红包总额
          hbLeftAmount: info.hongbaoPrice,   //红包剩余
          hbNum: info.countHongbao,           //红包个数
          hbLeftNum: info.hongbaoCount,       //红包剩余个数
          hbMessage: info.hbMessage,       //红包口令
        },
        readData:{
            unit:info.rewardPrice,       //奖励金额
            shareNum:info.countFenxiang,  //分享人次
            readNum:info.CountReward,         //奖励次数
            readLeftNum:info.rewardCount,    //奖励剩余次数
       }
      }
    },

    //单次刷新
    oneFresh(info){
      var tt = this;
      var aid = info.id;
      $("#refreshTopForm input[name='type']").val('refresh');
      $("#refreshTopForm input[name='act']").val('detail');
      $("#refreshTopForm input[name='aid']").val(aid);

      var type 	= $("#refreshTopForm input[name='type']").val();
      var module  = $("#refreshTopForm input[name='module']").val();
      var act  	= $("#refreshTopForm input[name='act']").val();
      var aid  	= $("#refreshTopForm input[name='aid']").val();
      var amount  = $("#refreshTopForm input[name='amount']").val();
      var config  = $("#refreshTopForm input[name='config']").val();
      var tourl   = $("#refreshTopForm input[name='tourl']").val();
      $.ajax({
        type: 'POST',
        url: '/include/ajax.php?service=siteConfig&action=refreshTop&type='+type+'&module='+module+'&act='+act+'&aid='+aid+'&amount='+amount+'&config='+0+'&tourl='+tourl,
        dataType: 'json',
        success: function(str){

          info = str.info;
          if(str.state == 100 && str.info != ""){

            if(typeof(info) == 'string' && (info.indexOf('https://') != -1 || info.indexOf('http://') != -1)){
                tt.page = 1;
                tt.locked = 0;
                tt.getinfoList();
                tt.hideExtend();
                $(".payBeforeLoading").hide();
                return false;
            }

            $("#amout").text(info.order_amount);
            $('.payMask').show();
            $('.payPop').css('transform','translateY(0)');

            // if(usermoney*1 < info.order_amount *1){
            //
            //   $("#moneyinfo").text('余额不足，');
            // }
            if (usermoney * 1 < info.order_amount * 1) {

              $("#moneyinfo").text('余额不足，');
              $("#moneyinfo").closest('.check-item').addClass('disabled_pay')

              $('#balance').hide();
            }

            if(monBonus * 1 < info.order_amount * 1  &&  bonus * 1 >= info.order_amount * 1){
              $("#bonusinfo").text('额度不足，可用');
              $("#bonusinfo").closest('.check-item').addClass('disabled_pay')
            }else if( bonus * 1 < info.order_amount * 1){
              $("#bonusinfo").text('余额不足，');
              $("#bonusinfo").closest('.check-item').addClass('disabled_pay')
            }else{
              $("#bonusinfo").text('');
              $("#bonusinfo").closest('.check-item').removeClass('disabled_pay')
            }

            ordernum     = info.ordernum;
            order_amount = info.order_amount;

            payCutDown('',info.timeout,info);
          }
        }
      });
    },


    // 隐藏推广弹窗
    hideExtend(){
      $(".exMask").hide();
      $('html').removeClass('noscroll');
      $('.extendPop').removeClass('slideUp');
    },

    // 弹出置顶弹窗
    showtoTopPop(){
      var tt = this;
      tt.hideExtend();
      tt.currTopData = tt.editObj.bid_plan;
      if(!tt.hasSetTop){  //设置置顶
        $(".topMask").show();
        $('html').addClass('noscroll');
        $('.toTopPop').addClass('slideUp');
      }else{  //查看置顶
        $(".plantopMask").show();
        $('html').addClass('noscroll');
        $('.topPlanPop').addClass('slideUp');
      }

    },
    // 隐藏置顶弹窗
    hidetoTopPop(){
      var tt = this;
      $(".topMask").hide();
      $('html').removeClass('noscroll');
      $('.toTopPop').removeClass('slideUp');
    },

    // 选择立即置顶的天数
    choseTop(days){
      var tt = this;
      var el = event.currentTarget;
      $("#refreshTopForm input[name='config']").val($(el).index());
      $(el).addClass('chosed_top').siblings('li').removeClass('chosed_top');
      tt.countTop(days);
    },

    // 计算置顶时长
    countTop(days){
      var tt = this;
      var today = (new Date()).valueOf();
      var endDay = (new Date()).valueOf() + days * 24 * 60 * 60 * 1000;
      tt.topDates = tt.getDateText(today) +'-'+ tt.getDateText(endDay)
    },

    getDateText(timestamp,type){
        timestamp = parseInt(timestamp / 1000)
        const dateFormatter = huoniao.dateFormatter(timestamp);
        const year = dateFormatter.year;
        const month = dateFormatter.month;
        const day = dateFormatter.day;
        const hour = dateFormatter.hour;
        const minute = dateFormatter.minute;
        const second = dateFormatter.second;
        
      if(type == 1){
        return (year+'/'+month+'/'+day);
      }else{
        return (month+'/'+day);
      }
    },

    // 选择时间
    choseTime(time){
        var tt = this;
        if(!tt.starTime || (tt.starTime && tt.endTime)){
          tt.starTime = time;
          tt.endTime = 0;
        }else{
          if(tt.starTime > time){
            tt.endTime = tt.starTime;
            tt.starTime = time;
          }else{
            tt.endTime = time
          }
        }
    },

    // 获取上一月/下一月
    getYearMonth(type){
      var tt = this;

      var year = tt.currShowYearMonth.split('/')[0];
      var month = tt.currShowYearMonth.split('/')[1];
      if(type == 'prev'){ //上一个月
        if(month == 1){
          year--;
          month = 12;
        }else{
          month--
        }
      }else{  //下一个月
        if(month == 12){
          year++;
          month = 1;
        }else{
          month++;
        }
      }
      tt.currShowYearMonth = year + '/' + (month>9?month:('0'+month));
      tt.currShowMonthData =  getCalendar({showDate:tt.currShowYearMonth});
    },


    // 隐藏时间选择的弹窗
    hideTimechose(){
      $(".timeChose").addClass('fn-hide');
      $('.dateChose h3 .btn_back').addClass('show');
    },

    // 显示时间选择弹窗
    showTimeChose(){
      var tt = this;
      if(tt.endTime == 0){
        $(".bottmTip").removeClass('fn-hide');
        setTimeout(function(){
          $(".bottmTip").addClass('fn-hide');
        },1500)
        return false;
      }
      $(".bottmTip").addClass('fn-hide');
      $(".timeChose").removeClass('fn-hide');
      $('.dateChose h3 .btn_back').removeClass('show')
    },

    // 计算计划置顶的价格
    checkTopPlanAmount(){
      var tt = this;
      var amount = 0; //总计
      // 第一步 梳理一周的每一天都价格
      var priceUnit = [];
      $('.timeChose .weekTime li').each(function(){
        var t = $(this);
        var unit = Number(t.find('.onChose').attr('data-unit'));
        // if($(".chosed_start").attr('data-week') == t.attr('data-index') ){
        //   amount = amount + unit;
        //   console.log(unit)
        // }
        // console.log($(".chosed_start").attr('data-week'),$(".chosed_end").attr('data-week') , t.attr('data-index'))
        // if($(".chosed_end").attr('data-week') == t.attr('data-index')){
        //   amount = amount + unit;
        //   console.log(unit)
        // }
        priceUnit.push({
          unit:unit,
          index:t.attr('data-index'),
          type:t.find('.onChose').index(), //0全天 or 1早8晚8
        });
        tt.weekPriceUnit = priceUnit;

      });

      // 第二步 选择的日期
      setTimeout(function(){

        $(".dateArr .includeTime").each(function(){
          var t = $(this);
          var weekday = t.attr('data-week'),
              date = t.attr('data-date');
              for(var i = 0; i < priceUnit.length; i++){
                if(weekday == priceUnit[i].index){
                  amount = amount + priceUnit[i].unit;
                }
              }
        });
        tt.topPlanAmount = amount;
      },300)

    },

    //立即置顶
    mustTop(){
      var tt = this;
      var aid = tt.editObj.id;
      $("#refreshTopForm input[name='type']").val('topping');
      $("#refreshTopForm input[name='act']").val('detail');
      $("#refreshTopForm input[name='aid']").val(aid);

      var type 	= $("#refreshTopForm input[name='type']").val();
      var module  = $("#refreshTopForm input[name='module']").val();
      var act  	= $("#refreshTopForm input[name='act']").val();
      var aid  	= $("#refreshTopForm input[name='aid']").val();
      var amount  = $("#refreshTopForm input[name='amount']").val();
      var config  = $("#refreshTopForm input[name='config']").val();
      var tourl   = $("#refreshTopForm input[name='tourl']").val();

      $.ajax({
        type: 'POST',
        url: '/include/ajax.php?service=siteConfig&action=refreshTop&type='+type+'&module='+module+'&act='+act+'&aid='+aid+'&amount='+amount+'&config='+config+'&tourl='+tourl,
        // url: '/include/ajax.php?service=siteConfig&action=refreshTop&type=topping&module=info&act=detail&aid=971&amount=8&config=0&tourl='+'',
        dataType: 'json',
        success: function(str){

          info = str.info;
          if(str.state == 100 && str.info != ""){

            if(typeof(info) == 'string' && (info.indexOf('https://') != -1 || info.indexOf('http://') != -1)){
                tt.page = 1;
                tt.locked = 0;
                tt.getinfoList();
                $(".payBeforeLoading").hide();
                return false;
            }

            $("#amout").text(info.order_amount);
            $('.payMask').show();
            $('.payPop').css('transform','translateY(0)');

            // if(usermoney*1 < info.order_amount *1){
            //
            //   $("#moneyinfo").text('余额不足，');
            // }
            if (usermoney * 1 < info.order_amount * 1) {

              $("#moneyinfo").text('余额不足，');
              $("#moneyinfo").closest('.check-item').addClass('disabled_pay')

              $('#balance').hide();
            }

            if(monBonus * 1 < info.order_amount * 1  &&  bonus * 1 >= info.order_amount * 1){
              $("#bonusinfo").text('额度不足，');
              $("#bonusinfo").closest('.check-item').addClass('disabled_pay')
            }else if( bonus * 1 < info.order_amount * 1){
              $("#bonusinfo").text('余额不足，');
              $("#bonusinfo").closest('.check-item').addClass('disabled_pay')
            }else{
              $("#bonusinfo").text('');
              $("#bonusinfo").closest('.check-item').removeClass('disabled_pay')
            }

            ordernum     = info.ordernum;
            order_amount = info.order_amount;

            payCutDown('',info.timeout,info);
          }
        }
      });

    },

    // 滚动加载




    // 计划置顶提交付款
    countTopAmount(){
      var tt = this;
      var dateArr = []; //置顶日期
      $('.includeTime').each(function(){
        var t = $(this);
        dateArr.push(t.attr('data-date'));
      })
      var topDateArr = {
        startTop: $(".chosed_start").attr('data-date'),
        endTop: $(".chosed_end").attr('data-date'),
        dateArr:[$(".chosed_start").attr('data-date'),...dateArr,$(".chosed_end").attr('data-date')],
        weekPriceUnit:tt.weekPriceUnit,
      }
      tt.currTopData = topDateArr;
      tt.hasSetTop = true;
      tt.hidetoTopPop(); //隐藏弹窗
      var aid = tt.editObj.id;
      $("#refreshTopForm input[name='type']").val('toppingPlan');
      $("#refreshTopForm input[name='act']").val('detail');
      $("#refreshTopForm input[name='aid']").val(aid);
      $("#refreshTopForm input[name='amount']").val(tt.topPlanAmount);
      var type 	= $("#refreshTopForm input[name='type']").val();
      var module  = $("#refreshTopForm input[name='module']").val();
      var act  	= $("#refreshTopForm input[name='act']").val();
      var aid  	= $("#refreshTopForm input[name='aid']").val();
      var amount  = $("#refreshTopForm input[name='amount']").val();
      var config  = $("#refreshTopForm input[name='config']").val();
      var tourl   = $("#refreshTopForm input[name='tourl']").val();

      var strArr = []
      tt.weekPriceUnit.forEach(function (val){
        if(val.index == '0'){
          strArr = [val.type?'day':'all',...strArr]
        }else{
          strArr.push(val.type?'day':'all')
        }
      })
      var reg = new RegExp( '/' , "g" )
      strArr = topDateArr.startTop.replace(reg,'-') +'|'+ topDateArr.endTop.replace(reg,'-') +'|' + strArr.join(',')
      $("#refreshTopForm input[name='config']").val(strArr);

      $.ajax({
        type: 'POST',
        url: '/include/ajax.php?service=siteConfig&action=refreshTop&type='+type+'&module='+module+'&act='+act+'&aid='+aid+'&amount='+amount+'&config='+strArr+'&tourl='+tourl,
        dataType: 'json',
        success: function(str){

          info = str.info;
          if(str.state == 100 && str.info != ""){

            if(typeof(info) == 'string' && (info.indexOf('https://') != -1 || info.indexOf('http://') != -1)){
                tt.page = 1;
                tt.locked = 0;
                tt.getinfoList();
                tt.hidePlanPop();
                $(".payBeforeLoading").hide();
                return false;
            }

            $("#amout").text(info.order_amount);
            $('.payMask').show();
            $('.payPop').css('transform','translateY(0)');

            // if(usermoney*1 < info.order_amount *1){
            //
            //   $("#moneyinfo").text('余额不足，');
            // }
            if (usermoney * 1 < info.order_amount * 1) {

              $("#moneyinfo").text('余额不足，');
              $("#moneyinfo").closest('.check-item').addClass('disabled_pay')

              $('#balance').hide();
            }

            if(monBonus * 1 < info.order_amount * 1  &&  bonus * 1 >= info.order_amount * 1){
              $("#bonusinfo").text('额度不足，');
              $("#bonusinfo").closest('.check-item').addClass('disabled_pay')
            }else if( bonus * 1 < info.order_amount * 1){
              $("#bonusinfo").text('余额不足，');
              $("#bonusinfo").closest('.check-item').addClass('disabled_pay')
            }else{
              $("#bonusinfo").text('');
              $("#bonusinfo").closest('.check-item').removeClass('disabled_pay')
            }

            ordernum     = info.ordernum;
            order_amount = info.order_amount;

            payCutDown('',info.timeout,info);
          }
        }
      });

    },

    // 隐藏制定计划
    hidePlanPop(){
      $(".plantopMask").hide();
      $('.topPlanPop').removeClass('slideUp');
      $('html').removeClass('noscroll');
    },

    // 智能刷新
    showSmartFresh(ind){
      var tt = this;
      tt.hideExtend();
      $('html').addClass('noscroll');
      $(".refreshMask").show();
      $(".refreshPop").addClass('slideUp');
      if(ind == 1){
        $(".refreshPop .last").click()
      }else{
        $(".refreshPop li").eq(0).click()
      }
    },
    freshNow(item){
      var tt = this;
      tt.editObj = item;
      tt.showSmartFresh(1)
    },
    //刷新
    smartFresh(){
      var tt = this;
      if(tt.freshDates == ''){
        tt.oneFresh(tt.editObj)
        return false;
      }
      var aid = tt.editObj.id;
      $("#refreshTopForm input[name='type']").val('smartRefresh');
      $("#refreshTopForm input[name='act']").val('detail');
      $("#refreshTopForm input[name='aid']").val(aid);

      var type 	= $("#refreshTopForm input[name='type']").val();
      var module  = $("#refreshTopForm input[name='module']").val();
      var act  	= $("#refreshTopForm input[name='act']").val();
      var aid  	= $("#refreshTopForm input[name='aid']").val();
      var amount  = $("#refreshTopForm input[name='amount']").val();
      var config  = $("#refreshTopForm input[name='config']").val();
      var tourl   = $("#refreshTopForm input[name='tourl']").val();

      $.ajax({
        type: 'POST',
        url: '/include/ajax.php?service=siteConfig&action=refreshTop&type='+type+'&module='+module+'&act='+act+'&aid='+aid+'&amount='+amount+'&config='+config+'&tourl='+tourl,
        dataType: 'json',
        success: function(str){

          info = str.info;
          if(str.state == 100 && str.info != ""){

            if(typeof(info) == 'string' && (info.indexOf('https://') != -1 || info.indexOf('http://') != -1)){
                tt.page = 1;
                tt.locked = 0;
                tt.getinfoList();
                tt.hidefreshPop();
                $(".payBeforeLoading").hide();
                return false;
            }

            $("#amout").text(info.order_amount);
            $('.payMask').show();
            $('.payPop').css('transform','translateY(0)');

            // if(usermoney*1 < info.order_amount *1){
            //
            //   $("#moneyinfo").text('余额不足，');
            // }
            if (usermoney * 1 < info.order_amount * 1) {

              $("#moneyinfo").text('余额不足，');
              $("#moneyinfo").closest('.check-item').addClass('disabled_pay')

              $('#balance').hide();
            }

            if(monBonus * 1 < info.order_amount * 1  &&  bonus * 1 >= info.order_amount * 1){
              $("#bonusinfo").text('额度不足，');
              $("#bonusinfo").closest('.check-item').addClass('disabled_pay')
            }else if( bonus * 1 < info.order_amount * 1){
              $("#bonusinfo").text('余额不足，');
              $("#bonusinfo").closest('.check-item').addClass('disabled_pay')
            }else{
              $("#bonusinfo").text('');
              $("#bonusinfo").closest('.check-item').removeClass('disabled_pay')
            }
            ordernum     = info.ordernum;
            order_amount = info.order_amount;

            payCutDown('',info.timeout,info);
          }
        }
      });
    },
    hidefreshPop(){
      $('html').removeClass('noscroll');
      $(".refreshMask").hide();
      $(".refreshPop").removeClass('slideUp');
    },

    // 选择刷新选项
    choseFresh(days){
      var tt = this;
      var el = event.currentTarget;
      $("#refreshTopForm input[name='config']").val($(el).index());
      $(el).addClass('chosed_top').siblings('li').removeClass('chosed_top');
      // $(".freshdays").html(days);
      tt.freshDates = days;
    },


    // 显示激励弹窗
    showjiliPop(){
      var tt = this;
      tt.hideExtend();
      $(".jlMask").show();
      $('html').addClass('noscroll')
      $('.jiliPop').addClass('slideUp');
    },

    // 隐藏激励弹窗
    hidejiliPop(){
      $(".jlMask").hide();
      $('html').removeClass('noscroll')
      $('.jiliPop').removeClass('slideUp');
    },


    // 更新口令
    updateMsg(){
      var tt = this;
      var el = event.currentTarget;
      if(event.keyCode == 13){
        var id = tt.editObj.id
        var ind = tt.editIndex;
        var hbMessage = $(el).val();

        if(hbMessage == ''){
          showErrAlert('请输入红包口令');
          return false;
        }
        if($(el).hasClass('disabledInp')){
          return false;
        }
        $(el).addClass('disabledInp')

        $.ajax({
          type: "POST",
          url: "/include/ajax.php?service=siteConfig&action=upDesc&id="+id+"&hbMessage="+hbMessage,
          dataType: "json",
          success: function (data) {
            $(el).removeClass('disabledInp')
            if (data && data.state == 100) {
              tt.infoList[ind]['hbMessage'] = hbMessage;
              tt.jiliData.hbData['hbMessage'] = hbMessage;
              // console.log(ind,tt.infoList[ind]['hbMessage'],tt.jiliData.hbData['hbMessage'])
              showErrAlert('红包口令设置成功')

            }

          },
          error: function () {
            $(el).removeClass('disabledInp')
            showErrAlert(langData['siteConfig'][20][227]);//网络错误，加载失败！
          }
        });
      }
    },

    // 显示有效期弹窗
    showAddValidPop(){},


    // 新增有效期
    addValid(){},

    // 获取信息列表
    getinfoList(){
      var tt = this;
      var type = $('.tabs .curr').attr('data-type')
      // console.log('111111')
      if(tt.loadIcon || tt.locked) return false;
      tt.loadIcon = true;
      tt.loadText = langData['info'][3][18];  //'正在加载...';
      var validId = tt.valid_id ? ('&id='+tt.valid_id) : '';
      axios({
          method: 'post',
          url: "/include/ajax.php?service=info&action=ilist&u=1&orderby=1&page=" + tt.page + "&pageSize=10&type="+type + validId,

        })
        .then((response) => {
          tt.loadIcon = false;
          var data = response.data;
          if (data.state == 100) {
            tt.noData = false;
            if(tt.totalCount == 0){
              tt.totalCount = data.info.pageInfo.totalCount;      //全部
              tt.refuse = data.info.pageInfo.refuse;            //审核拒绝
              tt.expire = data.info.pageInfo.expire;            //审核拒绝
              tt.extension = data.info.pageInfo.extension;    //推广中
              tt.hasSetTop = data.info.list.isbid;
            }
            tt.bid_end     = huoniao.transTimes(data.info.list.bid_end, 1);
            if(tt.page == 1){
              tt.infoList = data.info.list;

            }else{
              tt.infoList = [...tt.infoList,...data.info.list];
            }
            tt.locked = false;
            tt.page++;
            tt.loadText = langData['info'][3][19]; //'下拉加载更多'
            if(tt.page > data.info.pageInfo.totalPage){
              tt.locked = true;
              tt.loadText = langData['info'][3][20]; //'没有更多了~'
            }
          } else {
            tt.locked = false;
            tt.loadText = data.info;
            tt.infoList = [];
            tt.noData = true;
          }
        })
    },

    // 改变状态
    changeState(state,info,index){
      var tt = this;
      if(state == 3){

        // confirm弹窗
        var popOptions = {
          
          title: '确认隐藏该信息？',  //'确定删除信息？',  //提示文字
          btnColor:'#F23D18',
          confirmTip:'',   //'一经删除不可恢复',  //副标题
          isShow: true
        }
        confirmPop(popOptions,function(){
          tt.updateState(state,info,index)
        });
      }else{
        tt.updateState(state,info,index)
      }
    },

    updateState(state,info,index){
      var tt = this;
      axios({
        method: 'post',
        url: "/include/ajax.php?service=info&action=updateState&id="+info.id+"&state=" + state,

      })
      .then((response) => {
        var data = response.data;
        if(data.state == 100){
          showErrAlert(state == 1 ?'开启成功' : '已成功下架');
          tt.infoList[index].arcrank = state
        }else{
          showErrAlert(data.info)
        }
      })
    },
  }
})
