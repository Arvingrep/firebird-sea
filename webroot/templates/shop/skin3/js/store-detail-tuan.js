$(function(){

    // 广告轮播
    $("#slideBox1").slide({mainCell:".bd ul",effect:"left",autoPlay:true, autoPage:'<li></li>', titCell: '.hd ul'});

    //爆热活动轮播
    $("#slideBox2").slide({mainCell:".bd ul",autoPlay:false});


    // 商家详情是否显示查看更多
    if($(".storeInfo .shopDetCon2").height() > 200){
      $(".storeInfo .shopDetCon2").css({'height':200,'overflow':'hidden'})
    }else{
      $(".seeAll.seeSt").hide()
    }


    //地址跳转
	$('.appMapBtn').attr('href', OpenMap_URL);
    //拼团未开始倒计时
    if($('.ptdjs').size() > 0){

        var stimes =$('.ptdjs').attr('data-time');
        var pttml = [];
        setInterval(function(){
            pttml = cutDownTime(serviceTime,stimes)
            if(pttml[0] > 0){
                $('.ptdjs').find('.day').text(pttml[0]).show();
                $('.ptdjs').find('.daypot').show();
            }else{
                $('.ptdjs').find('.day').hide();
                $('.ptdjs').find('.daypot').hide();
            }
            // if(pttml[1] > 0){
            //      $('.ptdjs').find('.hour').text(pttml[1]).show();
            //      $('.ptdjs').find('.hourpot').show();
            // }else{
            //      $('.ptdjs').find('.hour').hide();
            //      $('.ptdjs').find('.hourpot').hide();
            // }
            $('.ptdjs').find('.hour').text(pttml[1]);
            $('.ptdjs').find('.minute').text(pttml[2]);
            $('.ptdjs').find('.second').text(pttml[3]);
        },1000) ;
    }

    // 显示图集
    $(".shopDet .shopLip").click(function(){
      if($(this).find('span').text() > 0){
        $('.slide-box').show();
        $('.slide').picScroll();
      }
    });

    $(".slide-box .close").click(function(){
      $('.slide-box').hide();
    })
    //倒计时
    function cutDownTime(setime,datatime){
        var eday = 3;
        var jsTime = parseInt((new Date()).valueOf()/1000);
        var timeOffset = parseInt(jsTime - setime);
          var end = datatime*1000;  //点击的结束抢购时间的毫秒数
          var newTime = Date.parse(new Date()) - timeOffset;  //当前时间的毫秒数
          var youtime = end - newTime; //还有多久时间结束的毫秒数
          var timeArr = [];
          if(youtime <= 0){
            timeArr = ['00','00','00','00'];
            return timeArr;
            return false;
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
            timeArr = [CDay,CHour,CMinute,CSecond];
            return timeArr;
          }else{
            timeArr = ['00',CHour,CMinute,CSecond];
            return timeArr;
          }
    }

    //查看全部
    $('.seeAll').click(function(){
    	var par = $(this).closest('.comCon');
    	if(!$(this).hasClass('active')){
    		$(this).addClass('active')
    		if($(this).hasClass('seeSt')){//查看店铺信息

    			// par.find('dl').removeClass('fn-hide');
          par.find('.shopDetCon2').css({
            'height':'auto'
          })
    		}else{
    			par.find('li').removeClass('fn-hide');
    		}
    		
    		$(this).html('收起<i></i>')
    	}else{
    		$(this).removeClass('active')
    		if($(this).hasClass('seeSt')){//查看店铺信息
    			// par.find('dl:gt(0)').addClass('fn-hide');
           par.find('.shopDetCon2').css({
            'height':'200px'
          })
    		}else{
    			par.find('li:gt(1)').addClass('fn-hide');
    		}
    		
    		$(this).html('查看全部<i></i>')
    	}
    	
    })
    //收藏
    $(".soucang,.gz").bind("click", function(){
        var t = $(this), type = "add", oper = "+1", txt = "已关注";

        var userid = $.cookie(cookiePre+"login_user");
        if(userid == null || userid == ""){
            huoniao.login();
            return false;
        }

        if(!t.hasClass("has")){
            t.addClass("has");
        }else{
            type = "del";
            t.removeClass("has");
            oper = "-1";
            txt = "关注商家";
        }

        var $i = $("<b>").text(oper);
        var x = t.offset().left, y = t.offset().top;
        $i.css({top: y - 10, left: x + 17, position: "absolute", "z-index": "5000", color: "#E94F06"});
        $("body").append($i);
        $i.animate({top: y - 50, opacity: 0, "font-size": "2em"}, 2000, function(){
            $i.remove();
        });

        $(".soucang,.gz").html("<s></s>"+txt);
        $.post("/include/ajax.php?service=member&action=collect&module=shop&temp=store-detail&type="+type+"&id="+id);
        alert(type=='del'?"已取消关注" : "已成功关注");

    });
    if($('#slideBox2 .bd ul li')[0]){
      $('.baoreBox').show();
    }
    pageConfig();
    async function pageConfig() {
      let data = {
        service: 'shop',
        action: 'config'
      }
      let result = await ajax(data, { dataType: 'json' });
      if (result.state == 100) {
        console.log(result.info.pageTypeConfig);
        for (let i = 0; i < result.info.pageTypeConfig.length; i++) {
          let item = result.info.pageTypeConfig[i];
          if (item.id == 2 && item.show == 1) { //送到家
            $('.comCon.sameCity').show();
            $('.sudBox').show();
            $('.comTit .tongcheng').html(`${item.title}<em></em>`);
          }
          if (item.id == 1 && item.show == 1) { //到店优惠
            $('.comTit .daodian').html(`${item.title}<em></em>`);
            $('.comCon.daodain').show();
          }
        }
      }
    }
});
