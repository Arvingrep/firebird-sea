

 //服务范围 点击叉号 关闭标签
function close_li(thisli){
    $(thisli).parent().remove();
    var range_num=$('.service-box .service li').length;
    $('.service-box .ser_range .num1').text(range_num);
}

$(function () {

    toggleDragRefresh('off');  //取消下拉刷新
    
    //服务选择
     $('.service-box .ser_range .range_sure').click(function () {
        var range_value=$('.service_input').val();
       if(range_value.length>0){
            $('.service-box .service').append("<li><span>"+ range_value +"</span><img src='"+templatePath+"images/homemaking/close_icon1.png' alt='' class='close_img' onclick='close_li(this)'></li>");
            var range_value=$('.service_input').val('');
            var range_num=$('.service-box .service li').length;
            $('.service-box .ser_range .num1').text(range_num);
       }

        if(range_num==10){
            $('.service-box .ser_range .range_sure button').attr({"disabled":"disabled"});
            var range_value=$('.service_input').val(langData['homemaking'][8][69]);
        }
    });

    //营业时间
    var numArr =['01时','02时','03时','04时','05时','06时','07时','08时','09时','10时','11时','12时','13时','14时','15时','16时','17时','18时','19时','20时','21时','22时','23时','24时'
],numArr1 =['00分','10分','20分','30分','40分','50分'],numArr2 =['01时','02时','03时','04时','05时','06时','07时','08时','09时','10时','11时','12时','13时','14时','15时','16时','17时','18时','19时','20时','21时','22时','23时','24时'
],numArr3 =['00分','10分','20分','30分','40分','50分'];//自定义数据
    var huxinSelect = new MobileSelect({
        trigger: '.time ',
        title: '',
        wheels: [
            {data: numArr},
            {data: numArr1},
            {data: numArr2},
            {data: numArr3}
        ],
        position:[0, 0, 0, 0],
        callback:function(indexArr, data){
            var h = parseInt(data[0].replace(/[^0-9]/ig,"")), i = parseInt(data[1].replace(/[^0-9]/ig,"")), h1 = parseInt(data[2].replace(/[^0-9]/ig,"")), i1 = parseInt(data[3].replace(/[^0-9]/ig,""));
            $('#openStart').val(h+':'+i);
            $('#openEnd').val(h1+':'+i1);
            $('#open-time').val(parseInt(data[0].replace(/[^0-9]/ig,""))+'时 '+parseInt(data[1].replace(/[^0-9]/ig,""))+'分-'+parseInt(data[2].replace(/[^0-9]/ig,""))+'时 '+parseInt(data[3].replace(/[^0-9]/ig,""))+'分');
            $('.time .choose span').hide();
        }
        ,triggerDisplayData:false,
    });


    //获取分类数据 所属行业
    function getChildType(){
        $.ajax({
            type: "POST",
            url: masterDomain + "/include/ajax.php?service=homemaking&action=type&value=1",
            dataType: "jsonp",
            success: function(res){
                if(res.state==100 && res.info){
                    var typeSelect = new MobileSelect({
                        trigger: '.company ',
                        title: '',
                        wheels: [
                            {data:res.info}
                        ],
                        position:[0, 0],
                        callback:function(indexArr, data){
                            $('#com_origin').val(data[0]['value']);
                            $('#typeid').val(data[0]['id']);
                            $('.company .choose span').hide();
                        }
                        ,triggerDisplayData:false,
                    });
                }
            }
        });
    }
   getChildType();
   //国际手机号获取
    getNationalPhone();
    function getNationalPhone(){
        $.ajax({
            url: masterDomain+"/include/ajax.php?service=siteConfig&action=internationalPhoneSection",
            type: 'get',
            dataType: 'jsonp',
            success: function(data){
                if(data && data.state == 100){
                   var phoneList = [], list = data.info;
                   var listLen = list.length;
                   var codeArea = list[0].code;
                   if(listLen == 1 && codeArea == 86){//当数据只有一条 并且这条数据是大陆地区86的时候 隐藏区号选择
                        $('.areacode_span').closest('li').hide();
                        return false;
                   }
                   for(var i=0; i<list.length; i++){
                        phoneList.push('<li><span>'+list[i].name+'</span><em class="fn-right">+'+list[i].code+'</em></li>');
                   }
                   $('.layer_list ul').append(phoneList.join(''));
                }else{
                   $('.layer_list ul').html('<div class="loading">暂无数据！</div>');
                  }
            },
            error: function(){
                    $('.layer_list ul').html('<div class="loading">加载失败！</div>');
                }

        })
    }
    // 打开手机号地区弹出层
    $(".areacode_span").click(function(){
        $('.layer_code').show();
        $('.mask-code').addClass('show');
    })
    // 选中区域
    $('.layer_list').delegate('li','click',function(){
        var t = $(this), txt = t.find('em').text();
        $(".areacode_span em").text(txt);
        $("#areaCode").val(txt.replace("+",""));

        $('.layer_code').hide();
        $('.mask-code').removeClass('show');
    })

    // 关闭弹出层
    $('.layer_close, .mask-code').click(function(){
        $('.layer_code').hide();
        $('.mask-code').removeClass('show');
    })

    // 信息提示框
    // 错误提示
    function showMsg(str){
      var o = $(".error");
      o.html('<p>'+str+'</p>').show();
      setTimeout(function(){o.hide()},1000);
    }

    //表单验证
    function isPhoneNo(p) {
        var areaCode = parseInt($("#areaCode").val());
        if(areaCode == 86){
            var pattern = /^1[23456789]\d{9}$/;
            return pattern.test(p);
        }
        return true;
    }
    $('#btn-keep').click(function (e) {
        e.preventDefault();
        var t = $("#fabuForm"), action = t.attr('data-action');
        t.attr('action', action);

        var comname = $('#comname').val();
        var addrid = $('#addrid').val();
        var com_origin = $('#com_origin').val();
        var address = $('#address').val();
        var phone = $('#phone').val();
        var serviceture = $('#serviceture').val();
        var opentime = $('#open-time').val();
        var num1=$(".num1").text();
        var addrid = 0, cityid = 0, r = true;

        if(!comname){
            r = false;
            showMsg(langData['homemaking'][5][14]);  //请输入公司名称
        }else if(!com_origin){
            r = false;
            showMsg(langData['homemaking'][5][20]);  //请选择所属行业
        }else if(!address){
            r = false;
            showMsg(langData['homemaking'][5][15]);  //请输入详细地址
        }else if(!phone){
            r = false;
            showMsg(langData['homemaking'][5][6]);  //请输入联系方式
        }else if (isPhoneNo($.trim($('#phone').val())) == false) {
            // r = false;
            // showMsg(langData['homemaking'][5][7]);  //手机号码不正确
        }else if($('#fileList .thumbnail').length == 0){
            r = false;
            showMsg(langData['homemaking'][5][21]);  //请上传店铺图集
        }else if(num1==0){
            //r = false;
            //showMsg(langData['homemaking'][5][13]);  //请选择服务范围
        }

        var ids = $('.gz-addr-seladdr').attr("data-ids");
        if(ids != undefined && ids != ''){
            addrid = $('.gz-addr-seladdr').attr("data-id");
            ids = ids.split(' ');
            cityid = ids[0];
        }else{
            r = false;
            showMsg(langData['homemaking'][5][19]);  //请选择所在地
        }
        $('#addrid').val(addrid);
        $('#cityid').val(cityid);

        var pics = [];
        $("#fileList").find('.thumbnail').each(function(){
            var src = $(this).find('img').attr('data-val');
            pics.push(src);
        });
        $("#pics").val(pics.join(','));

        var tags = [];
        $('.service').find('li span').each(function(){
            var t = $(this), val = t.text();
            tags.push(val);
        })
        $('.service_input').val(tags.join('|'));

        if(!r){
            return;
        }

        $.ajax({
			url: action,
			data: t.serialize(),
			type: 'post',
			dataType: 'json',
			success: function(data){
				if(data && data.state == 100){
                    showMsg(data.info);
				}else{
                    showMsg(data.info);
				}
			},
			error: function(){
                showMsg(langData['siteConfig'][6][203]);
			}
		})

    });


});
