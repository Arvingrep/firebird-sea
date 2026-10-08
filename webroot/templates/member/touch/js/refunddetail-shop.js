
//商城买家退款详情
$(function () {
    //倒计时
    //商家未处理时-- 等到商家退款 第一次申请和第二次申请
    if($('.waitRefund').size()>0){
      var timer_refund1 = setInterval(function(){
          cutDownTime($('.waitRefund'));
      },1000) ;
    }

    //直接拒绝退款 倒计时
    if($('.refuseTime').size()>0){
      var timer_refusetime = setInterval(function(){
          cutDownTime($('.refuseTime'));
      },1000) ;
    }
    //商家收货后拒绝了申请
    if($('.refuseTime2').size()>0){
      var timer_refusetime2 = setInterval(function(){
          cutDownTime($('.refuseTime2'));
      },1000) ;
    }

    //商家同意退货--买家剩余退货时间
    if($('.waitReturn').size()>0){
      var timer_return = setInterval(function(){
          cutDownTime($('.waitReturn'));
      },1000) ;
    }
    //买家已退货--选择快递公司 倒计时
    if($('.waitReturn2').size()>0){
      var timer_return2 = setInterval(function(){
          cutDownTime($('.waitReturn2'));
      },1000) ;
    }
    //买家已退货--自行退回 未送达 倒计时
    if($('.waitReturn3').size()>0){
      var timer_return3 = setInterval(function(){
          cutDownTime($('.waitReturn3'));
      },1000) ;
    }

    //买家已退货--自行退回 已送达 倒计时
    if($('.waitReturn4').size()>0){
      var timer_return4 = setInterval(function(){
          cutDownTime($('.waitReturn4'));
      },1000) ;
    }

    // 倒计时
    var eday = 3;    
    function cutDownTime(dom){   
        // timeOffset  是服务器和本地时间的时间差
        var end = dom.attr("data-time")*1000;  //点击的结束抢购时间的毫秒数
        var newTime = Date.parse(new Date()) - timeOffset;  //当前时间的毫秒数
        var youtime = end - newTime; //还有多久时间结束的毫秒数
        if(youtime <= 0){
          if(dom.hasClass('waitRefund')){
            clearInterval(timer_refund1);
          }else if(dom.hasClass('refuseTime')){
            clearInterval(timer_refusetime);
          }else if(dom.hasClass('refuseTime2')){
            clearInterval(timer_refusetime2);
          }else if(dom.hasClass('waitReturn')){
            clearInterval(timer_return);
          }else if(dom.hasClass('waitReturn2')){
            clearInterval(timer_return2);
          }else if(dom.hasClass('waitReturn3')){
            clearInterval(timer_return3);
          }else if(dom.hasClass('waitReturn4')){
            clearInterval(timer_return4);
          }
            
            return;

        }
        var seconds = youtime/1000;//秒
        var minutes = Math.floor(seconds/60);//分
        var hours = Math.floor(minutes/60);//小时
        var days = Math.floor(hours/24);//天

        var CDay= days ;
        var CHour= hours % 24 ;
        if(CDay <= eday){//3天之内的只要小时 不要天
            CHour = CHour + CDay*24;
            CDay = 0;
        }
        var CMinute= minutes % 60;
        var CSecond= Math.floor(seconds%60);//"%"是取余运算，可以理解为60进一后取余数
        var c = new Date(Date.parse(new Date()) - timeOffset);
        var millseconds=c.getMilliseconds();
        var Cmillseconds=Math.floor(millseconds %100);
        if(CSecond<10){//如果秒数为单数，则前面补零
          CSecond="0"+CSecond;
        }
        if(CMinute<10){ //如果分钟数为单数，则前面补零
          CMinute="0"+CMinute;
        }
        if(CHour<10){//如果小时数为单数，则前面补零
          CHour="0"+CHour;
        }
        if(CDay<10){//如果天数为单数，则前面补零
          CDay="0"+CDay;
        }
        if(Cmillseconds<10) {//如果毫秒数为单数，则前面补零
          Cmillseconds="0"+Cmillseconds;
        }
        if(CDay > 0){
         dom.find("#day_show").html(CDay);
         dom.find("#day_show").show();
         dom.find("em.speDot").show();
         dom.find(".dd_txt").show();
        }else{
          dom.find("#day_show").hide();
          dom.find("em.speDot").hide();
          dom.find(".dd_txt").hide();
        }

        dom.find("#hour_show").html(CHour);
        dom.find("#minute_show").html(CMinute);
        dom.find("#second_show").html(CSecond);
    }

    //撤销申请 -- 弹出
    $('.cancelApply').click(function(){
        $('.delMask').show();
        $('.delAlert').addClass('show');
    })
    //撤销申请 -- 取消
    $('.delAlert .cancelDel,.delMask').click(function(){
        $('.delMask').hide();
        $('.delAlert').removeClass('show');
    })

    //撤销申请 -- 确定
    $('.delAlert .sureDel').click(function(){
        $('.delMask').hide();
        $('.delAlert').removeClass('show');
        $.ajax({
            url: '/include/ajax.php?service=shop&action=operOrder&oper=cancelrefund&id='+detailId+'&proid='+proid,
            type: 'post',
            dataType: 'json',
            success: function(data){
                if(data && data.state == 100){
                    setTimeout( function(){location.href = orderdetailUrl;},200)
                }else{
                    showMsg(data.info);
                }
            },
            error: function(){
                showMsg(langData['siteConfig'][6][203]);
            }
        });

    })


    //我已送达
    $('.arriveBtn').click(function(){
        $.ajax({
            url: '/include/ajax.php?service=shop&action=selfreturn&id='+detailId+'&proid='+proid+'&delivery=1',
            type: 'post',
            dataType: 'json',
            success: function(data){
                if(data && data.state == 100){
                    setTimeout( function(){location.href = orderdetailUrl;},200)
                }else{
                    showMsg(data.info);
                }
            },
            error: function(){
                showMsg(langData['siteConfig'][6][203]);
            }
        });

    })


    //自行退货弹窗
    $('.selfArr').click(function(){
        $('.tuihMask').show();
        $('.tuiAlert').addClass('show');
    })
    //自行退货 -- 取消
    $('.tuiAlert .cancelSelf,.tuihMask').click(function(){
        $('.tuihMask').hide();
        $('.tuiAlert').removeClass('show');
    })

    //自行退货 -- 确定
    $('.tuiAlert .sureSelf').click(function(){
        $('.tuihMask').hide();
        $('.tuiAlert').removeClass('show');
        $.ajax({
            url: '/include/ajax.php?service=shop&action=selfreturn&id='+detailId+'&proid='+proid+'&self=2',
            type: 'post',
            dataType: 'json',
            success: function(data){
                if(data && data.state == 100){
                    setTimeout( function(){location.href = orderdetailUrl;},200)
                }else{
                    showMsg(data.info);
                }
            },
            error: function(){
                showMsg(langData['siteConfig'][6][203]);
            }
        });

    })

    //选择快递
    if($('.fakeData').size() > 0){
        var companyList = [];
        $('.fakeData span').each(function(){
          var tid = $(this).attr('data-id');
          var tval= $(this).text();
            companyList.push({
              id: tid,
              value: tval,//时
            })
        })
          
        var showFlag =false;
        //选择快递公司
        var clockSelect = new MobileSelect({
            trigger: '#fhTriggle',
            title: '选择快递公司',//选择快递公司
            ensureBtnText: '确定',//不选择
            wheels: [
              {data : companyList}
            ],
            transitionEnd:function(indexArr, data){
              var fir = indexArr[0];
              $('.selectContainer').find('li').removeClass('onchose')
              var firWheel =$('.wheels .wheel:first-child').find('.selectContainer');
              firWheel.find('li').eq(fir).addClass('onchose');
            },
            callback:function(indexArr, data){
              $('#expcompanytxt').val(data[0].value);
              $('#exp-company').val(data[0].id);
              if(!showFlag){
                $('.fahuoWrap .fahuoTxt').hide();
                $('.fahuoWrap .fahuoForm').show();
                showFlag = true;
              }
            }
            ,triggerDisplayData:false
        });
        $('.wheels .wheel:first-child').find('li:first-child').addClass('onchose');
    }


});
 // 错误提示
function showMsg(str){
    var o = $(".error");
    o.html('<p>'+str+'</p>').show();
    setTimeout(function(){o.hide()},1000);
}
