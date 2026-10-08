$(function(){






  //APP端取消下拉刷新
  toggleDragRefresh('off');



// 选择定位
  /*
   * 1.获取当前页面填充的数据 保存数据
   * 2.跳转选择地图的页面
   * 3.返回当前页面
   * 4.填充数据

    */
  $('.map_detail').click(function(){
    var addressVal = $('#addr').html();
    

    var form = $("#fabuForm"), action = form.attr("action");
    var data = form.serialize()+'&address='+addressVal;
    var dataArr = form.serializeArray();
    // 地址
    dataArr.push({
      name:'address',
      value:addressVal
    })
    // logo
    dataArr.push({
      name:'logoPath',
      value:$('.logobox img').attr('src')
    })

   
    // 返回地址
    dataArr.push({
      name:'returnUrl',
      value:window.location.href,
    });
    localStorage.setItem('infoData',JSON.stringify(dataArr))
    window.location.href = (memberUrl + '/mapPosi.html?noPosi=1&currentPageOpen=1');
  });


  //接收数据/处理数据
  var infoData = localStorage.getItem('infoData');
  if(infoData){
    infoData = JSON.parse(infoData);
    console.log(infoData)
    infoData.forEach(function(param){
      $("input[name="+param.name+"]").val(param.value);
      if(param.name == 'logoPath'){
        $(".logobox img").attr('src',param.value)
      }

      if(param.name == 'authattrparam'){
        var zizhiArr = param.value;
        $('.qualityBox .img-box').each(function(){
          var cominp = $(this).find('.compinut');
          var tid = cominp.attr('data-id');
          for(var i = 0; i < zizhiArr.length; i++){
            if(tid == zizhiArr[i]['id']){
              cominp.val(zizhiArr[i]['image'])
              $(this).find('.logoshow img').attr('src',zizhiArr[i]['imgpath'])
            }
          }


        })
      }
      if(param.name == 'address'){

        $('#addr').html(param.value)
      }

      if(param.name == 'district'){
        var district = JSON.parse(param.value)
        $("#lnglat").val(district.point.lng +','+district.point.lat)
        $(".map_detail").attr('data-lng',district.point.lng).attr('data-lat',district.point.lat)
        checkAddr(district)
      }
      localStorage.removeItem("infoData");
    })





  }




  function checkAddr(districtInfo) {
    var city = districtInfo.address.split(' ')[0]
    var district = districtInfo.title
    
    $.ajax({
      url: '/include/ajax.php?service=siteConfig&action=verifyCityInfo&city='+city+'&district='+district,
      type: "POST",
      dataType: "json",
      success: function (data) {
        if(data && data.state == 100){
          var addrArr = data.info.ids;
          var addrname = data.info.names;
          $(".chose_area").attr('data-ids',addrArr.join(' ')).attr('data-id',addrArr[addrArr.length - 1]);
          $(".chose_area p.city").text(addrname.join(' '))
          $("#addrid").val(addrArr[addrArr.length - 1])
        }
      },
      error: function(){}
    });
  }







  //所属行业
  $.ajax({
      type: "POST",
      url:  "/include/ajax.php?service=shop&action=type",
      dataType: "json",
      success: function(res){
          if(res.state==100 && res.info){
              var styleSelect = new MobileSelect({
                  trigger: '#industryname',
                  title: '请选择',
                  wheels: [
                      {data:res.info}
                  ],
                  keyMap: {
                      id: 'id',
                      value: 'typename'
                  },
                  position:[0, 0],
                  callback:function(indexArr, data){
                      $('#industryname').val(data[0]['typename']);
                      $('#industry').val(data[0]['id']);
                  }
                  ,triggerDisplayData:false,
              });
          }
      }
  });




  //判断此会员是否已经是分店
  $('#account').blur(function(){
    var tval = $(this).val();
    if(tval !=''){
      $.ajax({
        url: '/include/ajax.php?service=shop&action=storeBranchConfig&id='+brachid+'&account='+tval,
        type: "POST",
        dataType: "json",
        success: function (data) {
          if(data && data.state == 200){//已存在
            showErrAlert(data.info);
            $('.phbox').addClass('disabled');
          }else{
            $('.phbox').removeClass('disabled');
          }
        },
        error: function(){
        }
      });
    }
  })



  // 表单提交
  $(".tjBtn").bind("click", function(event){

		event.preventDefault();

		var t           = $(this),
        logo      = $("#logo"),
        addrid      = $("#addrid"),
        industry      = $("#industry"),
        title      = $("#title"),
        people      = $("#people"),
				address     = $("#addr"),
        account     = $("#account"),//会员账号
        telphone     = $("#telphone"),
        cityid      = $('#cityid');

		if(t.hasClass("disabled")) return;

    //店铺logo
    if(logo.val() == ''){
      showErrAlert('请上传店铺LOGO');
      return
    }

    //店铺名称
    if($.trim(title.val()) == ''){
        showErrAlert('请输入店铺名称');
        return
    }
    // 所属行业
    if($.trim(industry.val()) == ''){
        showErrAlert('请选择所属行业');
        return
    }

    //区域
    if($.trim(addrid.val()) == "" || addrid.val() == 0){
      showErrAlert(langData['siteConfig'][20][68]);
      return
    }
    
    // 会员账号
    if($.trim(account.val()) == ''){
        showErrAlert('请输入会员账号');
        return
    }
    //验证手机号
    if(!(/^1[3456789]\d{9}$/.test(account.val()))){
      showErrAlert('请输入正确的会员手机号');
      return
    }
    //此会员已经是分店
    if($('.phbox').hasClass('disabled')){
      showErrAlert('该会员已是分店，请重新填写');
      return
    }
    
    // 联系人
    if($.trim(people.val()) == ''){
        showErrAlert('请输入联系人');
        return
    }

    // 联系电话
    if($.trim(telphone.val()) == ''){
        showErrAlert('请输入联系电话');
        return
    }

    var addrids = $('.chose_area').attr('data-ids');
    var cityid_ = addrids ? addrids.split(' ')[0] : 0;
    cityid.val(cityid_);

    var addressVal = $('#addr').html();

		var form = $("#fabuForm"), action = form.attr("action"),url = form.attr("data-url");
    var data = form.serialize()+'&address='+addressVal
    t.addClass('disabled').find('a').html('保存中');
		$.ajax({
			url: action,
			data: data,
			type: "POST",
			dataType: "json",
			success: function (data) {
				if(data && data.state == 100){
          showErrAlert(langData['siteConfig'][6][39])
          setTimeout(function(){
            window.location.href=url;
          },500)
				}else{
          showErrAlert(data.info)
				}
        t.removeClass('disabled').find('a').html('保存设置');
			},
			error: function(){
				showErrAlert(langData['siteConfig'][20][183]);
        t.removeClass('disabled').find('a').html('保存设置');
			}
		});


  });


  // 上传LOGO
  var upPhoto = new Upload({
    btn: '#up_logo',
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
        var dt = $('#up_logo').closest("dl").children("dt");
        var img = dt.children('img');
        if(img.length){
          var old = img.attr('data-url');
          upPhoto.del(old);
        }
        dt.html('<img src="'+response.turl+'" data-url="'+response.url+'" alt=""><i class="del_btn"></i>').removeClass('fn-hide');
        dt.siblings('dd').addClass('fn-hide')
        $("#logo").val(response.url)
      }
    },
    showErr: function(info){
      showErrAlert(info);
    }
  });


  // 删除logo/营业执照/食品安全许可证
  $(".logoshow").delegate('.del_btn','click',function(){
    var t = $(this);
    var val = t.siblings('img').attr('data-url');
    t.closest('.logoshow').addClass('fn-hide').find('img').remove();
    t.closest('dl').find('dd').removeClass('fn-hide')
    if(t.closest('.logoshow').hasClass('licensebox')){//营业执照
      upLicense.del(val);
      $('#license').val('');
    }else if(t.closest('.logoshow').hasClass('safebox')){//食品安全许可证
      upSafe.del(val);
      $('#safety').val('');
    }else{//logo
      upPhoto.del(val);
      $('#logo').val('');
    }
    
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
