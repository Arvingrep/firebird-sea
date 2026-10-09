$(function(){

    //房屋类型
    var hx =[];
    getHuxing()
    function getHuxing(){
        $.ajax({
            type: "POST",
            url: "/include/ajax.php?service=renovation&action=type&type=8",
            dataType: "json",
            success: function(res){
                if(res.state==100 && res.info){
                    var list = res.info;
                    var huxinSelect = new MobileSelect({
                        trigger: '.room_type',
                        title: '',
                        wheels: [
                            {data:list}
                        ],
                        keyMap: {
                            id: 'id',
                            value: 'typename'
                        },
                        position:[0, 0],
                        callback:function(indexArr, data){
                            $('#room_type').val(data[0].typename);
                            $('.room_type .type_room span').hide();
                            $('#units').val(data[0].id)
                        }
                        ,triggerDisplayData:false,
                    });
                }
            }
        });
    }
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
        var par = $('.formCommon')
        var arcode = par.find('.areacode_span')
        arcode.find("label").text(txt);
        par.find(".areaCodeinp").val(txt.replace("+",""));

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
     $('.inv_submit').click(function(){
        var f = $(this);
        var room_type = $('#room_type').val();//户型结构
        var inv_name = $('#inv_name').val();//小区名称
        var room_area = $('#room_area').val();//房屋面积
        var name = $('#name').val();//您的称呼
        var phone = $('#phone').val();//手机号码
        var units = $('#units').val();//手机号码
        var txt = f.text();
        if(f.hasClass("disabled")) return false;
        var par = f.closest('.formCommon');
        var areaCodev = $.trim(par.find('.areaCodeinp').val());
        var addrid = par.find('.gz-addr-seladdr').attr('data-id');

        if(addrid == '') {
            showMsg(langData['renovation'][1][0]);//请选择您所在的城市

        }else if(!inv_name){
             showMsg(langData['renovation'][1][25]);  //请输入小区名称
           
        }else if(!room_area){
             showMsg(langData['renovation'][1][1]);  //请输入房屋面积
           
        }else if(!room_type){
            showMsg(langData['renovation'][1][26]);  //请选择户型结构

        }else if(!name){
             showMsg(langData['renovation'][1][27]);  //请输入您的称呼
           
        }else if(!phone){
             showMsg(langData['renovation'][1][29]);  //请输入联系方式
           
        }else{
            f.addClass("disabled").text(langData['renovation'][14][59]);//申请中...

            var data = [];
            data.push("community="+inv_name);
            data.push("units="+units);
            data.push("area="+room_area);
            data.push("people="+name);
            data.push("areaCode="+areaCodev);
            data.push("contact="+phone);
            data.push("company="+storeid);
            data.push("addrid="+addrid);

            $.ajax({
                url: "/include/ajax.php?service=renovation&action=sendEntrust",
                data: data.join("&"),
                type: "POST",
                dataType: "json",
                success: function (data) {
                    f.removeClass("disabled").text(txt);//
                    if(data && data.state == 100){
                        $('.order_mask').show();
                        
                    }else{
                        alert(data.info);
                    }
                },
                error: function(){
                    alert(langData['renovation'][14][90]);//预约失败，请重试！
                    f.removeClass("disabled").text(txt);//
                }
            });
        }

     })
    // 立即预约关闭
    $('.order_mask .work_close').click(function(){
        $('.order_mask').hide();
   
    })


    //滚动信息
    $.ajax({
        url : "/include/ajax.php?service=renovation&action=entrust&company="+storeid,
        type : "GET",
        dataType : "json",
        success : function (data) {
            var obj = $(".mBox .swiper-wrapper");
            if(data && data.state == 100){
                var tcNewsHtml = [], list = data.info.list,pageInfo = data.info.pageInfo;
                $(".applay_num").html(pageInfo.totalCount);
                if(list.length > 0){
                    tcNewsHtml.push('<div class="swiper-slide">');
                    for (var i = 0; i < list.length; i++){
                        tcNewsHtml.push('<a href="javascriptL:;" class="fn-clear"><ul><li>'+list[i].people+'</li><li class="origion">'+list[i].community+'</li><li>'+list[i].units+'</li><li>'+list[i].area+'平</li></ul></a>');
                        if((i + 1) % 5 == 0 && i + 1 < list.length){
                            tcNewsHtml.push('</div>');
                            tcNewsHtml.push('<div class="swiper-slide swiper-no-swiping">');
                        }

                    }
                    tcNewsHtml.push('</div>');
                    $('.tcNews .swiper-wrapper').html(tcNewsHtml.join(''));
                    new Swiper('.tcNews .swiper-container', {direction: 'vertical',loop: true,autoplay: {delay: 4000},observer: true,observeParents: true,disableOnInteraction: false});
                }else{
                    $('.des_applay').remove();
                }


            }else{
                $('.des_applay').remove();
            }
        },
        error:function(){
            $('.des_applay').remove();
        }
    });




})