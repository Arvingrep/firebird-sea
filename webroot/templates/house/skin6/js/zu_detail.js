$(function() {
	$("img").scrollLoading();

  $(".mobile_kf #qrcode").qrcode({
    render: window.applicationCache ? "canvas" : "table",
    width: 74,
    height: 74,
    text: huoniao.toUtf8(window.location.href)
  });


  // 预约看房
  $(".btnYy").bind("click", function(){
    var userid = $.cookie(cookiePre + 'login_user');
    // if(userid == undefined || userid == 0 || userid == ''){
    //   huoniao.login();
    //   return false;
    // }
    $(".modal-yy").addClass("popup").fadeIn();
    $(".popup_bg").show();
    return false;
  });
  // 关闭
  $("body").delegate(".close", "click", function(){
    $(this).parent().hide();
    $(".popup_bg").hide();
  });

  //验证提示弹出层
  function showMsg(msg){
    $('.modal-yy .dc').append('<p class="ptip">'+msg+'</p>')
    setTimeout(function(){
    $('.ptip').remove();
    },2000);
  }
  //国际手机号获取
  getNationalPhone();
  function getNationalPhone(){
    $.ajax({
            url: masterDomain+"/include/ajax.php?service=siteConfig&action=internationalPhoneSection",
            type: 'get',
            dataType: 'JSONP',
            success: function(data){
                if(data && data.state == 100){
                   var phoneList = [], list = data.info;
                   for(var i=0; i<list.length; i++){
                        phoneList.push('<li data-cn="'+list[i].name+'" data-code="'+list[i].code+'">'+list[i].name+' +'+list[i].code+'</li>');
                        //初始areacode
                        var firstCode = list[0].code;
                        $('#areaCode').val(firstCode);
                        $('.areaCode i').text('+'+firstCode);
                   }
                   $('.areaCode_wrap ul').append(phoneList.join(''));
                }else{
                   $('.areaCode_wrap ul').html('<div class="loading">暂无数据！</div>');
                  }
            },
            error: function(){
                $('.areaCode_wrap ul').html('<div class="loading">加载失败！</div>');
            }

        })

  }

  //显示区号
  $('.areaCode').bind('click', function(e){
    e.stopPropagation();
    var areaWrap =$(this).closest(".par_li").find('.areaCode_wrap');
    if(areaWrap.is(':visible')){
      areaWrap.fadeOut(300)
    }else{
      areaWrap.fadeIn(300);
      return false;
    }
  });

  //选择区号
  $('.areaCode_wrap').delegate('li', 'click', function(){
    var t = $(this), code = t.attr('data-code');
    var par = t.closest(".par_li");
    var areaIcode = par.find(".areaCode");
    areaIcode.find('i').html('+' + code);
    $("#areaCode").val(code);
  });

  $('body').bind('click', function(){
    $('.areaCode_wrap').fadeOut(300);
  });

  $('.ytime dl').delegate('dd', 'click', function(event) {
    var t = $(this),val = t.attr("data-val");
    if(!t.hasClass('curr')){
      t.addClass('curr').siblings('dd').removeClass('curr');
    }
  });

  $("body").delegate("#tj", "click", function(){
      var t = $(this), obj = t.closest(".modal-yy");

      console.log(1)

      if(t.hasClass("disabled")) return false;

      var name = obj.find("#name");
      var phone = obj.find("#telphone");
      var vercode = obj.find("#vercode");
      var marks = obj.find("#marks");

      if(name.val() == "" || name.val() == name.attr("placeholder")){
        errMsg = "请输入您的姓名";
        showMsg(errMsg);
        return false;
      }
      else if(!userinfo_.phoneCheck){
        if(phone.val() == "" || phone.val() == phone.attr("placeholder")){
          errMsg = "请输入您的手机号码";
          showMsg(errMsg);
          return false;
        }else if(!/(13|14|15|17|18)[0-9]{9}/.test($.trim(phone.val()))){
          // errMsg = "手机号码格式错误，请重新输入！";
          // showMsg(errMsg);
          // return false;
        }else if(!userinfo_.phoneCheck && (vercode.val() == "" || vercode.val() == vercode.attr("placeholder"))){
          errMsg = "请输入短信验证码";
          showMsg(errMsg);
          return false;
        }
      }

      var data = [];
      var title = $('.crumtit .name').text();
      $('.intro_box p').each(function(){
        var s = $(this).text();
        if($.trim(s) != ''){
          title += ' · ' + s;
        }
      })
      data.push('type=zu');
      data.push('aid='+pageData_.id);
      data.push('title='+title);
      data.push('day='+($('.ytime dl:eq(0) dd.curr').index()-1));
      data.push('time='+($('.ytime dl:eq(1) dd.curr').index()-1));
      data.push('note='+$('#marks').val());
      data.push('username='+$('#name').val());
      data.push('mobile='+$('#telphone').val());
      data.push('areaCode='+$('#areaCode').val());
      data.push('vercode='+$('#vercode').val());
      data.push('sex='+$('[name="sex"]:checked').val());

      t.addClass("disabled").html("提交中...");

      $.ajax({
        url: '/include/ajax.php?service=house&action=bookHouse',
        type: 'get',
        data: data.join('&'),
        dataType: 'jsonp',
        success: function(data){
          if(data && data.state == 100){
            showMsg(data.info);
            setTimeout(function(){
              $('.modal-yy .close').click();
              t.removeClass('disabled').html('提交预约申请');
            }, 2000)
          }else{
            showMsg(data.info);
            t.removeClass('disabled').html('提交预约申请');
          }
        },
        error: function(){
          showMsg('网络错误，请重试！');
          t.removeClass('disabled').html('提交预约申请');
        }
      })

  });

  var sendSmsData = [];

  if(geetest){
    //极验验证
    captchaVerifyFun.initCaptcha('web','#codeButton',sendSmsFunc)
    $('.getCodes').bind("click", function (){
      if($(this).hasClass('disabled')) return false;
      var tel = $("#telphone").val();
      if(tel == ''){
        errMsg = "请输入手机号码";
        showMsg(errMsg);
        $("#telphone").focus();
        return false;
      }
      //弹出验证码
			if(geetest == 1){
				captchaVerifyFun.config.captchaObjReg.verify();
			}else{
				$('#codeButton').click()
			}
    })
  }else{
    $(".getCodes").bind("click", function (){
      if($(this).hasClass('disabled')) return false;
      var tel = $("#telphone").val();
      if(tel == ''){
        errMsg = "请输入手机号码";
        showMsg(errMsg);
        $("#telphone").focus();
        return false;
      }
      $("#vercode").focus();
      sendSmsFunc();
    })
  }

  //发送验证码
  function sendSmsFunc(captchaVerifyParam,callback){
    var tel = $("#telphone").val();
    var areaCode = $("#areaCode").val().replace('+', '');
    var sendSmsUrl = "/include/ajax.php?service=siteConfig&action=getPhoneVerify";

    sendSmsData = []; //清空
    sendSmsData.push('type=verify');
    sendSmsData.push('areaCode=' + areaCode);
    sendSmsData.push('phone=' + tel);
    let param = sendSmsData.join('&')
      if(captchaVerifyParam && geetest == 2){
      param = param + '&geetest_challenge=' + captchaVerifyParam
    }else if(geetest == 1 && captchaVerifyParam){
      param = param +  captchaVerifyParam
    }

    $('.senderror').text('');
    $.ajax({
      url: sendSmsUrl,
      data: param,
      type: 'POST',
      dataType: 'json',
      success: function (res) {
        if(callback){
            callback(res)
        }
        if (res.state == 101) {
          $('.senderror').text(res.info);
        }else{
          countDown($('.getCodes'), 60);
        }
      }
    })
  }


  //倒计时
  function countDown(obj,time){
    obj.html(time+'秒后重发').addClass('disabled');
    mtimer = setInterval(function(){
      obj.html((--time)+'秒后重发').addClass('disabled');
      if(time <= 0) {
        clearInterval(mtimer);
        obj.html('重新发送').removeClass('disabled');
      }
    }, 1000);
  }

   //大图切换
  $(".zu_slide").slide({titCell: ".plist .slideshow-item",mainCell: ".album",effect: "fold",autoPlay: false,delayTime: 800,switchLoad: "_src",pageStateCell:".pageState",startFun: function(i, p) {if (i == 0) {$(".sprev").click()} else if (i % 5 == 0) {$(".snext").click()}}});

  //小图左滚动切换
  $(".zu_slide .thumb").slide({mainCell: ".slideCell",delayTime: 600,vis: 5,scroll: 5,effect: "left",autoPage: true,prevCell: ".sprev",nextCell: ".snext",pnLoop: false});

  setTimeout(function(){$(".zu_slide .thumb a").attr('href','javascript:;');},500)
  //内容导航
  var win = $(window), modList = $(".container"), fixnav = modList.find(".sub-nav");
  $(window).scroll(function() {
    var stop = win.scrollTop();
    stop > modList.offset().top && stop < modList.offset().top + modList.height() - 100 ? fixnav.addClass("fixed") : fixnav.removeClass("fixed");
  });

  var isClick = 0; //是否点击跳转至锚点，如果是则不监听滚动
  //左侧导航点击
  $(".fixnav a").bind("click", function(){
    isClick = 1; //关闭滚动监听
    var t = $(this), parent = t.parent(), index = parent.index(), theadTop = $(".sub-title:eq("+index+")").offset().top - 5;
    parent.addClass("curr").siblings("li").removeClass("curr");
    $('html, body').animate({
          scrollTop: theadTop
      }, 300, function(){
        isClick = 0; //开启滚动监听
      });
  });

  //滚动监听
  $(window).scroll(function(){
    if(isClick) return false;  //判断是否点击中转中...
    var scroH = $(this).scrollTop();
    var theadLength = $(".sub-title").length;
    $(".fixnav li").removeClass("curr");

    $(".sub-title").each(function(index, element){
      var offsetTop = $(this).offset().top;
      if(index != theadLength-1){
        var offsetNextTop = $(".sub-title:eq("+(index+1)+")").offset().top - 30;
        if(scroH < offsetNextTop){
          $(".fixnav li:eq("+index+")").addClass("curr");
          return false;
        }
      }else{
        $(".fixnav li:last").addClass("curr");
        return false;
      }
    });
  });



  $(".btnJb").bind("click", function(){

		var domainUrl = masterDomain;
    $.dialog({
      fixed: false,
      title: "房源举报",
      content: 'url:'+domainUrl+'/complain-house-zu-'+pageData_.id+'.html',
      width: 460,
      height: 300
    });
  });

  // 收藏
  $('.btnSc').click(function(){
    var t = $(this), type = t.hasClass("btnYsc") ? "del" : "add";
    var userid = $.cookie(cookiePre+"login_user");
    if(userid == null || userid == ""){
      huoniao.login();
      return false;
    }
    if(type == "add"){
      t.addClass("btnYsc").html("<i></i>已收藏");
    }else{
      t.removeClass("btnYsc").html("<i></i>收藏");
    }
    $.post("/include/ajax.php?service=member&action=collect&module=house&temp=zu_detail&type="+type+"&id="+pageData_.id);
  });

  //增加浏览历史
  var house_zu_history = $.cookie(cookiePre+'house_zu_history');
  if (house_zu_history == null) house_zu_history = "";
  if (house_zu_history.indexOf(pageData_.id) == -1) {
    if (house_zu_history.length > 0) {
      house_zu_history += ':'+pageData_.id;
    } else {
      house_zu_history += pageData_.id;
    }
    if (house_zu_history.length > 128) {
      var pos = house_zu_history.indexOf(':');
      house_zu_history = house_zu_history.substr(pos + 1);
    }
    $.cookie(cookiePre+'house_zu_history', house_zu_history, {expires: 365, domain: masterDomain.replace("http://", "").replace("https://", ""), path: '/'});
  }
  $('.b-scan').click(function(){
    if($('.scan-pop').attr('class').includes('flex')){
      $('.scan-pop').removeClass('flex');
    }else{
      $('.scan-pop').addClass('flex');
    }
  });
  function popWarn(info) { //弹窗提示
    $('.warnPop').text(info);
    $('.warnPop').css({ 'display': 'flex' });
    clearTimeout(timeoutTimer);
    timeoutTimer = setTimeout(res => {
      $('.warnPop').hide();
    }, 2000);
  }
  // 对比
  let compareArr = []; //正在展示的数据
  let hasSelected = JSON.parse(localStorage.getItem('zu_compare')); //已选择过的对比项
  if (hasSelected && hasSelected.length > 0) { //添加
    for (let i = 0; i < hasSelected.length; i++) {
      let item = hasSelected[i];
      addCompare(item);
    }
    compareArr = hasSelected;
  }
  $('.cv-btn').click(function () { //展开
    $('.c-vertical').hide();
    $('.c-level').show();
  });
  $('.clt-btn').click(function () { //隐藏
    $('.c-level').hide();
    $('.c-vertical').show();
  });
  let selectNumber = 0; //选择对比数量
  let deleteArr = []; //之前选择过的，然后删除了
  $('.btnDb').click(function () { //列表添加对比
    let element = $(this);
    let id = element.attr('data-id');
    $('.cv-btn').click();
    if (checkSame(id)) { //检验是否已经添加
      return false
    }
    for (let i = 0; i < deleteArr.length; i++) { //检查是否之前添加过
      let item = deleteArr[i];
      if (item.id == id) { //之前已经添加过
        addCompare(item); //添加
        deleteArr.splice(i, 1); //从deleteArr中移除
        return false
      }
    }
    getTarget(id);
  });
  $('.clc-list').delegate('.item', 'click', function () { //对比选择/取消选择
    let state = $(this).attr('class').includes('selected'); //true:已选择，false:未选择
    if (state) { //取消选中
      --selectNumber;
      $(this).removeClass('selected');
    } else if (selectNumber < 4) { //选中
      ++selectNumber;
      $(this).addClass('selected');

    } else {
      popWarn('最多选择4项')
    }
  });
  $('.clc-list').delegate('.item .right .delete', 'click', function (e) { //删除单条信息操作
    e.stopPropagation(); //父级绑定的有事件，这里处理一下
    let state = $(this).closest('.item').attr('class').includes('selected'); //是否被选中
    if (state) {
      --selectNumber;
    }
    let id = $(this).attr('data-id');
    deleteCompare(id);
    $(this).closest('.item').remove();
  });
  $('.clc-btn').delegate('.clear', 'click', function () { //全部清除操作
    selectNumber = 0;
    for (let i = 0; i < compareArr.length; i++) {
      let item = compareArr[i];
      deleteArr.push(item); //全部移动到deleteArr中
    }
    compareArr = [];
    $('.clc-list').html(''); //样式清空
  });
  $('.clc-btn').delegate('.start', 'click', function () { //对比跳转
    let child = $('.clc-list').find('.item');
    if (child.length == 0) {
      popWarn('请添加房源对比列');
    } else {
      let idArr = [];
      for (let i = 0; i < child.length; i++) { //选中id整理
        let item = child.eq(i);
        if (item.hasClass('selected')) {
          idArr.push(item.attr('data-id'));
        }
      }
      if (idArr.length < 2) { //没有选中任何数据
        popWarn('至少选择两个对比项');
      } else { //跳转
        open(`${channelDomain}/sale-compare.html?id=${idArr.join(',')}`);
      }
    }
  });
  async function getTarget(id) { //获取详情数据
    let data = {
      service: 'house',
      action: 'saleList',
      id: id
    };
    let result = await ajax(data, { dataType: 'json' });
    if (result.state == 100) {
      addCompare(result.info.list[0]);
    } else {
      popWarn(result.info);
    }
  }
  function addCompare(item) { //增加对比元素
    compareArr.push(item);
    // 渲染
    let str = `
          <div class="item" data-id="${item.id}">
              <div class="left">
                  <img src="${templets_skin}images/confirm.png">
                  <span>${item.title}</span>
              </div>
              <div class="right">
                  <div class="num">${item.price > 0 ? `${Number(item.price)}万` : '面议'}</div>
                  <img src="${templets_skin}images/close2.png" class="delete" data-id="${item.id}">
              </div>
          </div>`;
    $('.clc-list').append(str);
    localStorage.setItem('zu_compare', JSON.stringify(compareArr));
  }
  function popWarn(info) { //弹窗提示
    $('.warnPop').text(info);
    $('.warnPop').css({ 'display': 'flex' });
    clearTimeout(timeoutTimer);
    timeoutTimer = setTimeout(res => {
      $('.warnPop').hide();
    }, 2000);
  }
  function checkSame(id) { //检验重复添加对比
    for (let i = 0; i < compareArr.length; i++) {
      let item = compareArr[i];
      if (item.id == id) {
        popWarn('该房源已在对比列中');
        return true
      }
    }
    return false
  }
  function deleteCompare(id) { //删除对比元素
    for (let i = 0; i < compareArr.length; i++) {
      let item = compareArr[i];
      if (item.id == id) { //找到了
        compareArr.splice(i, 1); //移除
        deleteArr.push(item); //添加到deleteArr中
        localStorage.setItem('zu_compare', JSON.stringify(compareArr));
        return false
      }
    }
  }
});
