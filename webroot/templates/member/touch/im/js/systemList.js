$(function(){
  var getDateDiff = function(theDate){
        var nowTime = (new Date());    //当前时间
        var date = (new Date(theDate*1000));    //当前时间
        var today = new Date(nowTime.getFullYear(), nowTime.getMonth(), nowTime.getDate()).getTime(); //今天凌晨
        var yestday = new Date(today - 24*3600*1000).getTime();
        var is = date.getTime() < today && yestday <= date.getTime();

        var Y = date.getFullYear(),
        M = date.getMonth() + 1,
        D = date.getDate(),
        H = date.getHours(),
        m = date.getMinutes(),
        s = date.getSeconds();
        //小于10的在前面补0
        if (M < 10) {
            M = '0' + M;
        }
        if (D < 10) {
            D = '0' + D;
        }
        if (H < 10) {
            H = '0' + H;
        }
        if (m < 10) {
            m = '0' + m;
        }
        if (s < 10) {
            s = '0' + s;
        }

        if(is){
            return langData['siteConfig'][13][34] + H + ':' + m;//昨天
        }else if(date > today){
            return H + ':' + m;
        }else if(Y==nowTime.getFullYear()){
            return M + '/' + D ;
        }else{
            return Y + '/' + M + '/' + D ;
        }
    }
  //获取通知列表
  var notice_load = 0,notice_page = 1;
  var scrollHeight = document.documentElement.scrollHeight;

  function notice_list(){
  	if(notice_load) return false;
  	notice_load=1;
  	$.ajax({
         url: '/include/ajax.php?service=member&action=message&page='+notice_page+'&pageSize=10',
         type: "GET",
         dataType: "json",
         success: function (data) {

  	       var html = [];
  	        var list =[];
  	       if(data.state == 100){
  	       	 var datalist = data.info.list;
  		       var totalpage = data.info.pageInfo.totalPage;
  		       $('.tip_list').attr('data-total',totalpage);
  	          if(datalist.length==0){
  	          	$(".headBox").addClass('bg_white');
  	          	$('.msgList').addClass('bg_white')
  	          	.html('<div class="noData"><img src="'+templets_skin+'images/no_notice.png"/><p>'+langData['siteConfig'][47][18]+'~</p></div>');//暂无未读通知
  	          }else{
  	          	var unread = '';
                datalist = datalist.reverse();
  	          	$('.msgList,.headBox').removeClass('bg_white');
  	            for(var i=0; i<datalist.length; i++){
  	            	if(datalist[i].state=="0"){
  	            		unread='unread'
  	            	}else{
  	            		unread=''
  	            	}
  	            	var info = datalist[i].body;
                    var cls = (info && datalist[i].body.first)?"orderMsg":"linkMsg";
  	            	list.push('<div class="sysMsgBox '+cls+'" data-id="'+datalist[i].id+'">');
                    // list.push('<p class="pubtime">'+datalist[i].date.replace(/-/g,'/')+'</p>');
                    list.push('<p class="pubtime">'+getDateDiff(datalist[i].timestamp)+'</p>');
                    list.push('<div class="msgItem msgLi"><div class="msgConBox">')
                    if(info && datalist[i].body.first){
                        list.push('<a class="sysMsg" href="'+datalist[i].url+'">');
						list.push('<div class="line"><h2>'+datalist[i].title+'</h2></div>');
						list.push('<ul class="tip_detail msgCon">');
						for(var m=0; m<Object.keys(info).length; m++){
							if(Object.keys(info)[m]!='first' && Object.keys(info)[m]!='remark'){
								list.push('<li class="fn-clear"><label>'+Object.keys(info)[m]+'</label><span>'+info[Object.keys(info)[m]].value+'</span></li>');
							}
						}
						list.push('</ul>');
          				list.push('</a>')//删除
        			}else{
                      list.push('<div class="sysMsg">')
                      list.push('<div class="msgCon">');
                      list.push('<h2>'+datalist[i].title+'</h2>');
                      list.push('<p>'+datalist[i].body+'</p>');
                      list.push('</div>');
        							list.push('<a href="'+datalist[i].url+'" class="line"> <span>查看详情</span> </a>');
                      list.push('</div>')//删除
                     }
                  list.push('</div>')//删除
                  list.push('<div class="delBox">');
                  list.push('<s class="del_btn"></s>');
				  list.push('</div></div></div>')//删除
				  // html.push(list.join(''));


  	            }
  	           $('.msgList').prepend(list.join(''))
  	          }
  			  $('.msgList .loading').remove();
  	          notice_load =0;
              if(notice_page == 1){
                // window.scrollTo(0, document.documentElement.clientHeight);
                window.scrollTo(0,document.documentElement.scrollHeight);
                // $(window).scrollTop(document.documentElement.scrollHeight);
              }else{
                  window.scrollTo(0,document.documentElement.scrollHeight - scrollHeight - 40);
              }
              scrollHeight = document.documentElement.scrollHeight;
  	          if(totalpage == notice_page){
  	          	// $('.msgList').append('<div class="loading"><span>'+langData['siteConfig'][47][6]+'</span></div>');//已经全部加载
  	          	console.log('已经全部加载');
  	          	notice_load=1;

  	          }
  	          notice_page++;
  	          $('.msgList').attr('data-page',notice_page);
  	       }else{
  	       		$(".headBox").addClass('bg_white');
  	       		$('.msgList').addClass('bg_white').html('<div class="noData"><img src="'+templets_skin+'images/no_notice.png"/><p>'+langData['siteConfig'][47][18]+'~</p></div>');//暂无未读通知
  	       }
         },
         error: function(){
           $('.loading').html('<span>'+langData['siteConfig'][37][80]+'</span>');  //请求出错请刷新重试
         }
      });

  }
  // 全部清除消息
  	function clearNotice(){
  		$.ajax({
            url: "/include/ajax.php?service=member&action=clearMessage",
            type: "GET",
            dataType: "json",
            success: function (data) {
              if(data && data.state == 100){
               	showErrAlert('已全部清空');
                 $(".headBox").addClass('bg_white');
                 $('.msgList').addClass('bg_white').html('<div class="noData"><img src="'+templets_skin+'images/no_notice.png"/><p>'+langData['siteConfig'][47][18]+'~</p></div>');//暂无未读通知
  				       notice_page = 1;
  	             notice_list();
              }else{
                showErrAlert(data.info)
              }
            },
            error: function(){
             	 showErrAlert(data.info)
            }
          });
  	}
notice_list()
clearNewNotice();

// 更新所有通知已读
function clearNewNotice(){
    $.ajax({
          url: "/include/ajax.php?service=member&action=updateMessageState",
          type: "GET",
          dataType: "json",
          success: function (data) {
            if(data && data.state == 100){
              console.log(data.info)
            }
          },
          error: function(){
             showErrAlert(data.info)
          }
        });
  }


  $(window).scroll(function(){
		var allh = $('body').height();
        var w = $(window).height();
        var scroll = allh - w;
        if ($(window).scrollTop() == 0 && !notice_load && notice_page!=1) {
        	notice_list();
        }
	})


  var clearPopOptions = {
        	title:'确认要清空系统通知吗？',
        	isShow:true,
          btnColor:'#F22424',
      }
  	

    $(".clear_sys").click(function(){
      if($(".msgLi").length == 0){
        showErrAlert('暂无系统通知');
      }else{
        confirmPop(clearPopOptions,function(){
          clearNotice();
        });
      }
      
    })

    $('body').delegate('.del_btn','click',function(e){
      var t = $(this), par = t.closest(".sysMsgBox"), del_id = par.attr("data-id");

        var delPopOptions = {
              title:'确认删除该通知？',
              isShow:true,
              btnColor:'#F22424',
          }
        confirmPop(delPopOptions,function(){
             $.ajax({
              url: '/include/ajax.php?service=member&action=delMessage&id='+del_id,
              type: 'post',
              dataType: 'json',
              success: function(data){
                  if(data.state == 100){
                     var detail = data.info;
                   par.remove();
                   showErrAlert('已成功删除该通知')//已删除对话
                  }else{
                      showErrAlert(data.info);
                  }
              },
              error: function(){
                  showErrAlert(langData['siteConfig'][46][63]);//网络错误，初始化失败！
              }
          });
        });
       return false;


  });


    //左滑删除
        var lines = $(".msgList .msgLi");//左滑对象
        var len = lines.length;
        var lastXForMobile;//上一点位置
        var pressedObj;  // 当前左滑的对象
        var lastLeftObj; // 上一个左滑的对象
        var start;//起点位置

        $(".msgList").on('touchstart','.msgLi',function(e){

          lastXForMobile = e.changedTouches[0].pageX;
          pressedObj = this; // 记录被按下的对象
          // 记录开始按下时的点
          var touches = event.touches[0];
          start = {
              x: touches.pageX, // 横坐标
              y: touches.pageY  // 纵坐标
          };
        })
        $(".msgList").on('touchmove', '.msgLi',function(e){
          // 计算划动过程中x和y的变化量
          var touches = event.touches[0];
          delta = {
              x: touches.pageX - start.x,
              y: touches.pageY - start.y
          };
          // 横向位移大于纵向位移，阻止纵向滚动
          if (Math.abs(delta.x) > Math.abs(delta.y)  * 2 ) {
              $(this).find('.del_btn').show() //显示删除按钮
              // $(this).siblings().find('.del_btn').hide();  //隐藏删除按钮
              e.preventDefault();
            }
            if (lastLeftObj && pressedObj != lastLeftObj) { // 点击除当前左滑对象之外的任意其他位置
                $(lastLeftObj).animate({'transform': 'translateX(0px)'},100); // 右滑
                lastLeftObj = null; // 清空上一个左滑的对象

            }
            var li = $(this).closest('li.msgBox');

            var diffX = e.changedTouches[0].pageX - lastXForMobile;
            // $('.message_list .info_li .del_btn').text(langData['siteConfig'][47][17]).removeClass('sure_btn');//删除对话
            if (diffX < -50) {
                $(pressedObj).animate({'transform': 'translateX(-1.58rem) '},100).siblings('li').animate({'transform': 'translateX(0px)'}); // 左滑
                lastLeftObj = pressedObj; // 记录上一个左滑的对象
            } else if (diffX > 50) {
                if (pressedObj == lastLeftObj) {
                    $(pressedObj).animate({'transform': 'translateX(0px)'},100);// 右滑
                    lastLeftObj = null; // 清空上一个左滑的对象
                }
            }
        })
})
