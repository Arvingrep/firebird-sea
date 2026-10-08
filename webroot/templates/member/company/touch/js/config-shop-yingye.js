$(function(){

  //APP端取消下拉刷新
  toggleDragRefresh('off');
  
   // 选择标签
  $(".facybox span").click(function(){
    var t = $(this), p = t.parent();
    t.toggleClass("active"); 
  })

  //选择星期
  $('.indusel').click(function(){
    $(".mask_scroll").show();
    $(".scroll_box").css('bottom',0)

  })
  $('.mask_scroll,.cancel_btn').click(function(){
    $(".mask_scroll").hide();
    $(".scroll_box").css('bottom','-6.6rem');
    $(".scroll_box li.chose_now").removeClass('chose_now chosed')
  })

  $('.sure_btn').click(function(){
    $(".scroll_box li").removeClass('chose_now');
    $(".scroll_box li.chosed").addClass('chose_before');
    $(".mask_scroll").hide();
    $(".scroll_box").css('bottom','-6.6rem');
    var str = [], ids = [];
    $(".scroll_box li.chosed").each(function(){
      if(!$(this).hasClass('allchose')){
        str.push($(this).text());
        ids.push($(this).attr('data-id'));
      }
    })
    $("#weeks_show").val(str.join(' '))
    $("#openweek").val(ids.join(','))
  })

  $(".weekselect li").click(function(){
    var t = $(this);
    
    if(t.hasClass('allchose')){//全选
      if(!t.hasClass('chosed')){
        $(".weekselect li").addClass('chosed');
      }else{
        $(".weekselect li").removeClass('chosed');
      }
    }else{
      t.toggleClass("chosed"); 
      $(".weekselect li.allchose").removeClass('chosed');
    }
  })

  // 时间格式化
  var timeint={
    formatTime:function(date,type){
      var yy = date.getFullYear();
      var mm = date.getMonth()+1;
      var dd = date.getDate();
      var hh = date.getHours();
      var min = date.getMinutes();
      yy = yy>9?yy:('0'+ yy);
      mm = mm>9?mm:('0'+ mm);
      dd = dd>9?dd:('0'+ dd);
      hh = hh>9?hh:('0'+ hh);
      min = min>9?min:('0'+ min);
      var data ;
      if(type==1){
        data = yy+'-'+mm+'-'+dd
      }else{
        data = hh+':'+min
      }
      return data;
    },
  }
  //营业时间段
  mobiscroll.settings = {
        theme: 'ios',
        themeVariant: 'light',
      height:40,
      lang:'zh',
      headerText:true,
      calendarText:'选择时间段',  //选择时间段
    };
    // 时间段
    mobiscroll.range('#stime', {
        controls: ['time'],
        endInput: '#etime',
      autoCorrect:false,
      hourText:'点',  //'点'
      minuteText:'分',  //分
      autoCorrect:false,
      onSet: function (event, inst) {
        var enddate = inst._endDate;
        enddateFormat = timeint.formatTime(enddate);
        var tlen = $(".chose_inp").size();
        if(tlen==3){
          showErrAlert('最多只能添加3个哦~')
          return false;
        }
        $(".time_list").prepend('<span class="chose_inp">'+event.valueText+'-'+enddateFormat+'<em class="del_time"></em><input type="hidden" class="limit_start"  value="'+event.valueText+'" /><input type="hidden" class="limit_stop"  value="'+enddateFormat+'" /></span>')
        
      }
    });
    
    // 删除选择的时间
    $("body").delegate('.del_time','click',function(){
      var t =$(this);
      t.closest('.chose_inp').remove();
    });

    $('.date_box .add_btn').click(function(){
      $("#stime").click();
    })




  // 表单提交
  $(".tjBtn").bind("click", function(event){

		event.preventDefault();

		var t= $(this);

		if(t.hasClass("disabled")) return;

    if(busType == 0){//团购商家
      if($("#openweek").val() == ''){
        showErrAlert('请选择营业日');
        return;
      }

      // if($("#tel").val() == ''){
      //   showErrAlert('请输入电话号码');
      //   return;
      // }
    }
    if($('.time_list .chose_inp').length == 0){
      if(busType == 0){//团购商家
        showErrAlert('请添加营业时间段');
        return;
      }else{//电商
        showErrAlert('请添加客服在线时间段');
        return;
      }
    }

    //客服电话
    if($.trim($("#tel").val()) == "" || $("#tel").val() == 0){
      showErrAlert(langData['shop'][4][47]);
      return
    }

    var tagids = [];
    $(".facybox span.active").each(function(){  
      tagids.push($(this).children('em').text());    
    })
    $('#tags').val(tagids.join(','))

    var timeArr = [];
    $(".date_chose .time_list span").each(function(){
      var timeStart = $(this).find('.limit_start').val();
      var timeStop = $(this).find('.limit_stop').val();

      timeArr.push(timeStart+'-'+timeStop);
    })



		var form = $("#fabuForm"), action = form.attr("action");
    t.addClass('disabled').find('a').html('保存中');
		$.ajax({
			url: action,
			data: form.serialize()+'&limit_time='+timeArr.join('||'),
			type: "POST",
			dataType: "json",
			success: function (data) {
        t.removeClass('disabled').find('a').html('保存设置');
				if(data && data.state == 100){
          showErrAlert(langData['siteConfig'][6][39])
           window.history.back();
				}else{
          showErrAlert(data.info)
				}
        
       
			},
			error: function(){
				showErrAlert(langData['siteConfig'][20][183]);
        t.removeClass('disabled').find('a').html('保存设置');
			}
		});


    });

    // 上传微信二维码

  // 上传微信二维
  
  var upWeixin = new Upload({
    btn: '#up_wechatqr',
    bindBtn: '',
    title: 'Images',
    mod: 'shop',
    params: 'type=atlas',
    atlasMax: 1,
    deltype: 'delAtlas',
    replace: true,
    fileQueued: function(file){

    },
    uploadSuccess: function(file, response){
      if(response.state == "SUCCESS"){
        var dt = $('#up_wechatqr').closest("dl").children("dt");
        var img = dt.children('img');
        if(img.length){
          var old = img.attr('data-url');
          upWeixin.del(old);
        }
        dt.siblings('dd').addClass('fn-hide')
        dt.html('<img src="'+response.turl+'" data-url="'+response.url+'" alt=""><i class="del_btn"></i>').removeClass('fn-hide');
    
        $("#wechatqr").val(response.url);

        //$.post(masterDomain+'/include/ajax.php?service=b&action=updateStoreConfig&wechatqr='+response.url);
      }
    },
    uploadError: function(){

    },
    showErr: function(info){
        alert(info);
    }
  });

  // 删除二维码
  $(".logoshow").delegate('.del_btn','click',function(){
    var t = $(this);
    var val = t.siblings('img').attr('data-url');
    t.closest('.logoshow').addClass('fn-hide').find('img').remove();
    t.closest('dl').find('dd').removeClass('fn-hide')   
    upWeixin.del(val);
    $("#wechatqr").val('');

  })



})




// 扩展zepto
$.fn.prevAll = function(selector){
    var prevEls = [];
    var el = this[0];
    if(!el) return $([]);
    while (el.previousElementSibling) {
        var prev = el.previousElementSibling;
        if (selector) {
            if($(prev).is(selector)) prevEls.push(prev);
        }
        else prevEls.push(prev);
        el = prev;
    }
    return $(prevEls);
};

$.fn.nextAll = function (selector) {
    var nextEls = [];
    var el = this[0];
    if (!el) return $([]);
    while (el.nextElementSibling) {
        var next = el.nextElementSibling;
        if (selector) {
            if($(next).is(selector)) nextEls.push(next);
        }
        else nextEls.push(next);
        el = next;
    }
    return $(nextEls);
};
