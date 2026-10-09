/**
 * Created by Administrator on 2018/5/18.
 */
$(function(){
    var mask=$('.mask')
    //点击品牌弹窗
    $("#type").bind("click", function(){
        $('.brand-wrap').show();
        //$('.aside-main ul li').removeClass('active')
        mask.show()
    })

    //关闭品牌弹窗
    $(".brand-wrap .close_alert,.ul_wrap .cancel").bind("click", function(){
        $('.brand-wrap').hide();
        mask.hide()
    })
    // 侧边栏点击字幕条状
    var navBar = $(".navbar li");
    navBar.on("click", function (e) {
        $(this).addClass("active").siblings().removeClass('active');
            var id = $(this).find('a').attr('data-id');
            var mao = $('#' + id)
            var scrollTop = $('.block-brand .aside-main').scrollTop()
            var off = mao.position().top + scrollTop -54;//position() 方法返回匹配元素相对于父元素的位置（偏移）。
            $('.block-brand .aside-main').stop(true).animate({scrollTop: off+'px'}, 500)

    });

    //分类车系
    $('.block-brand .aside-main li').on('click',function () {
        var t = $(this), id = t.data('id');
        $('.block-brand .aside-main li').removeClass('active')
        t.addClass('active');
        $('.block-cartype').html('');
        $('.cartype-sub').html('');
        if(id!=''){
            $("#brand").val(id);
            $.ajax({
                url: '/include/ajax.php?service=car&action=typeList&page=1&pageSize=9999&orderby=3&chidren=1&type=' + id,
                type: 'get',
                dataType: 'json',
                success: function(data){
                    if(data && data.state == 100){
                        var html = [], list = data.info.list;

                        html.push('<div class="aside-main">');
                        for(var i = 0; i < list.length; i++){
                            html.push('<h3 class="tt">'+list[i].typename+'</h3>');
                            if(list[i]['lower'] != null){
                                html.push('<ul class="list-line">');
                                for(var j = 0; j < list[i]['lower'].length; j++){
                                    html.push('<li data-id="'+list[i]['lower'][j].id+'">'+list[i]['lower'][j].typename+'</li>');
                                }
                                html.push('</ul>');
                            }
                        }
                        html.push('</div>');
                        $('.block-cartype').html(html.join(''));
                        $('.block-cartype').addClass('show');
                    }else{
                        getModel(id);
                        $('.block-cartype').html('')
                    }
                },
                error: function(){
                }
            })
        }
    });

    // 车型分类
    $(".block-cartype").delegate("li","click",function(){
        var t = $(this), id = t.data('id');
        $('.block-cartype li').removeClass('active');
        t.addClass('active');
        if(id!=''){
            $('.cartype-sub').html('');
            $("#brand").val(id);
            getModel(id);
        }
    });

    //获取型号
    function getModel(id){
        if(id!=''){
            $.ajax({
                url: '/include/ajax.php?service=car&action=carmodel&page=1&pageSize=9999&orderby=3&brand=' + id,
                type: 'get',
                dataType: 'json',
                success: function(data){
                    if(data && data.state == 100){
                        var html = [], list = data.info.list;
                        if(list.length >0){
                        html.push('<div class="aside-main">');
                        var tempYear = '';                   
                        for(var i = 0; i < list.length; i++){
                            if(tempYear == list[i]['prodate']){
                                html.push('<li data-id="'+list[i]['id']+'">'+list[i]['title']+'</li>');
                            }else{
                                html.push('</ul>');
                                tempYear = list[i]['prodate'];
                                html.push('<h3 class="tt">'+list[i]['prodate']+langData['car'][6][50]+' <i></i></h3>');
                                html.push('<ul class="list-line">');
                                html.push('<li data-id="'+list[i]['id']+'">'+list[i]['title']+'</li>');
                            }
                        }
                        html.push('</div>');
                        $('.cartype-sub').html(html.join(''));
                        $('.cartype-sub').addClass('show');
                        }
                    }else{
                         $('.cartype-sub').removeClass('show');
                    }
                },
                error: function(){
                }
            });
        }
    }
    $(".cartype-sub").delegate("li","click",function(){
        var t = $(this), id = t.data('id');
         if(id!=''){
            $("#model").val(id);
        }
        $('.cartype-sub li').removeClass('active');
        t.addClass('active')
    })


    //品牌确定
    var cflag = false;
    $(".ul_wrap .confirm").bind("click", function(){
        var brandVal=$('.block-brand li.active').text()
        var cartypeVal=$('.block-cartype li.active').text();
        var subVal=$('.cartype-sub li.active').text();
        if(!brandVal){//未选品牌
            $.dialog.alert('请选择品牌')//请选择品牌
            cflag = true;
        }else if(!cartypeVal){//未选车系
            if($('.block-cartype li').size() > 0){
               $.dialog.alert('请选择车系')//请选择车系
                cflag = true; 
            }else{
                cflag = false;
            }
            
        }else{
            if($('.cartype-sub li').size() > 0){//有车型
                if(!subVal){
                    $.dialog.alert(langData['car'][5][26])//请选择车型
                    cflag = true;
                }else{
                    cflag = false;
                }
            }else{
               cflag = false; 
            }
        }

        if(!cflag){
            $('#type').val(brandVal+' '+cartypeVal+' '+subVal);
            $('#title-text').val(brandVal+' '+cartypeVal+' '+subVal);
            $('.brand-wrap').hide();
            mask.hide(); 
            $('#type').closest('dl').find('.tip-inline').removeClass().addClass("tip-inline success").html("<s></s>");
            $('#title-text').closest('dl').find('.tip-inline').removeClass().addClass("tip-inline success").html("<s></s>");
        }else{
            return false;
        }
        
    })

    //选择颜色
    $(".colorPick_wrap .colorTag").bind("click", function(){
        $(this).addClass('colorPicked').siblings().removeClass('colorPicked');
        var colorInput=$('.colorPick_wrap .colorTag.colorPicked').attr('data-color')
        $('#colorInput').val(colorInput);
        $('#colorInput').closest('dl').find('.tip-inline').removeClass().addClass("tip-inline success").html("<s></s>");
    })

    // if($('.colorPick_wrap .colorTag').hasClass('colorPicked')){

    //     var colorInput=$('.colorPick_wrap .colorTag.colorPicked').attr('data-color')
    //     $('#colorInput').val(colorInput)
    // }


    //上牌年份
    $(".time-div").bind("click", function(e){
        var t=$(this),time_choose=t.closest('.input_div2').find('.time_choose');
        var type=t.attr('data-type')
        t.find('input').val('');

        $('.time_choose').removeClass('active');
        time_choose.toggleClass('active')


        if(type =='old'){
            yearList();//过去时间
            monthList(year);//过去月份
        }else{
            yearList2();//未来时间
            monthList2(year);//未来月份
        }

        $(document).one('click',function(){
            $('.time_choose').removeClass('active');
        });
        e.stopPropagation();  //停止事件传播

    })


    var myDate = new Date();
    var year=myDate.getFullYear(); //获取完整的年份
    var nowmonth=myDate.getMonth(); //获取当前月份

    function yearList(){//过去时间
        $('.time_year .time-aside').html('');
        var html=[]
        for(i=0;i<10;i++){
            var yearVal= Number(year)-i;
            html.push('<p data-id="'+yearVal+'">'+yearVal+'年</p>')

        }
        $('.time_year .time-aside').append(html.join(''))

    }

    function yearList2(){//未来时间
        $('.time_year2 .time-aside').html('');
        var html=[]
        for(i=0;i<10;i++){
            var yearVal= Number(year)+i;
            html.push('<p data-id="'+yearVal+'">'+yearVal+'年</p>')

        }
        $('.time_year2 .time-aside').append(html.join(''))
        $('.noCheck .year .time-aside').append('<p class="noTime">'+langData['car'][8][71]+'</p>') //未检
        $('.noCheck2 .year .time-aside').append('<p class="noTime">'+langData['car'][8][72]+'</p>') //未交
        $('.noCheck3 .year .time-aside').append('<p class="noTime">'+langData['car'][8][72]+'</p>') //未交
    }



    //点击年份获取月份
    $('.time_year .time-aside').delegate('p','click',function(e){
        var id=$(this).attr('data-id');

        $('.year .time-aside p').removeClass('curr');
        $(this).addClass('curr')
        monthList(id);
        e.stopPropagation();  //停止事件传播
    })

    //点击年份获取月份
    $('.time_year2 .time-aside').delegate('p','click',function(e){


        var id=$(this).attr('data-id');

        $('.year .time-aside p').removeClass('curr');
        $(this).addClass('curr')
        monthList2(id);

        e.stopPropagation();  //停止事件传播
    })
    //未检//未交
    $('.time_year2 .time-aside').delegate('.noTime','click',function(e){

        $('.time_choose').removeClass('active');
        var noCheck =$(this).parents('.down-div').find('input');
        noCheck.val($(this).text())
        return false
    });



    function monthList(id){//过去月份
        $('.time_month .time-aside').html('');
        var html2=[]
        for(var j = 1; j< 13; j++) {

            if(id == year) {
              if(j <=nowmonth + 1){ // 当年
                html2.push('<p data-id="'+j+'">'+j+langData['siteConfig'][13][18]+'</p>')//月

              }
            } else { // 未来年份
              html2.push('<p data-id="'+j+'">'+j+langData['siteConfig'][13][18]+'</p>')//月
            }

          }

      $('.time_month .time-aside').append(html2.join(''))
    }

    function monthList2(id){//未来月份
        $('.time_month2 .time-aside').html('');
        var html2=[]
        for(var j = 1; j< 13; j++) {

            if(id == year) {
              if(j > nowmonth -1){ // 当年

                html2.push('<p data-id="'+j+'">'+j+langData['siteConfig'][13][18]+'</p>')//月

              }
            } else { // 未来年份
              html2.push('<p data-id="'+j+'">'+j+langData['siteConfig'][13][18]+'</p>')//月
            }


        }

      $('.time_month2 .time-aside').append(html2.join(''))
    }



    $('.month .time-aside').delegate('p','click',function(e){
        $('.month .time-aside p').removeClass('curr');
        $(this).addClass('curr');
        $('.time_choose').removeClass('active');
        var yearV
        if($('.year .time-aside p').hasClass('curr')){
            yearV=$('.year .time-aside p.curr').text();
        }else{
            yearV=year+langData['siteConfig'][13][14];//年
        }

        var monthV=$('.month .time-aside p.curr').text();
        var timeVal=yearV+'-'+monthV;
        var timeInput= $(this).parents('.down-div').find('.time-input');
        timeInput.val(timeVal);
        var pardl = $(this).closest('dl');
        var hline = pardl.find(".tip-inline");
        hline.removeClass().addClass("tip-inline success").html("<s></s>");
        e.stopPropagation();  //停止事件传播

    })


    //车辆性质

    $('.time_choose .pro-choose').delegate('p','click',function(e){
        $('.time_choose .pro-choose p').removeClass('curr');
        $(this).addClass('curr');
        $('.time_choose').removeClass('active');
        var proChoose=$('.time_choose .pro-choose p.curr').text();
        if (proChoose==langData['siteConfig'][44][9]) {//非营运
            var nature ='0';
        }else{
            var nature ='1';
        }
       $('#propertyture').val(proChoose);
       $('.naturecl').val(nature);
        var pardl = $('#propertyture').closest('dl');
        var hline = pardl.find(".tip-inline");
        hline.removeClass().addClass("tip-inline success").html("<s></s>");
        e.stopPropagation();  //停止事件传播

    })
    //分期

    $('.price-type').delegate('span','click',function(e){
        $(this).toggleClass('active')
        if($('.installment').hasClass('active')){            
            $('.price-li').removeClass('fn-hide');
            $("#staging").val('1');
        }else{
            $('.price-li').addClass('fn-hide');
            $("#staging").val('0');
        }
        if($('.tax').hasClass('active')){
            $("#tax").val('1');
        }else{
            $("#tax").val('0');
        }
    })
    // if($('.installment').hasClass('active')){
    //     $('.price-li').show();
    // }else{
    //     $('.price-li').hide();
    // }
    //首付金额
    $('.time_choose .radio-choose').delegate('p','click',function(e){
        $('.time_choose .radio-choose p').removeClass('curr');
        $(this).addClass('curr');
        $('.time_choose').removeClass('active');
        var radioChoose=$('.time_choose .radio-choose p.curr').text();
        $('#payments-text').val(radioChoose);
        fenqiPrice(radioChoose);
        var pardl = $('#payments-text').closest('dl');
        var hline = pardl.find(".tip-inline");
        hline.removeClass().addClass("tip-inline success").html("<s></s>");
        e.stopPropagation();  //停止事件传播
    })

    $('#price_text').bind('change',function(){
        var radioChoose=$('.time_choose .radio-choose p.curr').text();
        fenqiPrice(radioChoose);
    });

    function fenqiPrice(rad){
        var price_text=$('#price_text').val();
        var pay = price_text*rad;
        $('.car-price').html(pay.toFixed(2)+langData['siteConfig'][40][43].replace('1',''));//万元
    }



    //点击图片参考
    $(".reference").bind("click", function(){
        $('.img_contanier').show();
        mask.show();

    })
    //关闭图片参考弹窗
    $(".img_contanier .close_alert").bind("click", function(){
        $('.img_contanier').hide();
        mask.hide();
    })
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
                       var listLen = list.length;
                       var codeArea = list[0].code;
                       if(listLen == 1 && codeArea == 86){//当数据只有一条 并且这条数据是大陆地区86的时候 隐藏区号选择
                            $('.areaCode').hide();
                            $('#fabuForm .form-ul2 .inpbdr input#contact').css('padding-left','10px');
                            return false;
                       }
                       for(var i=0; i<list.length; i++){
                            phoneList.push('<li data-cn="'+list[i].name+'" data-code="'+list[i].code+'">'+list[i].name+' +'+list[i].code+'</li>');

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
      $('.areaCode').bind('click', function(){
        var areaWrap =$(this).closest(".form-ul").find('.areaCode_wrap');
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
        var par = t.closest(".form-ul");
        var areaIcode = par.find(".areaCode");
        areaIcode.find('i').html('+' + code);
      });

      $('body').bind('click', function(){
        $('.areaCode_wrap').fadeOut(300);
      });


      var phone_ = $('#contact').val();
      $('#contact').live('input propertychange', function() {
          var phone = $('#contact').val();
          if (phone != phone_) {
              $('.vercode').show();
          }else{
              $('.vercode').hide();
          }
      });


    $(".w-form").delegate("input[type=text],textarea", "focus", function(){
        var t = $(this), dl = t.closest("dl"), hline = dl.find(".tip-inline");
        var errrTip = t.attr('data-title');

        if(dl.attr("data-required") == 1){
            if($(this).val() ==" " || $(this).val() ==""){
                hline.removeClass().addClass("tip-inline focus").html("<s></s>"+errrTip)
            }
        }
        

    })

    $(".w-form").delegate("input[type=text],textarea", "blur", function(){
        var t = $(this), dd = t.closest("dd"),dl = t.closest("dl"), hline = dd.find(".tip-inline");
        var errrTip = t.attr('data-title');
        if(dl.attr("data-required") == 1){
            if($(this).val() !=" " && $(this).val() !=""){
                hline.removeClass().addClass("tip-inline success").html("<s></s>");
            }else{
                hline.removeClass().addClass("tip-inline error").html("<s></s>"+errrTip)
            }
        }

        
    })

    //发布提交
    $(".w-form #submit").bind("click", function(event){
        event.preventDefault();
        var f = $(this);
        var typeVal         = $('#type').val(),//品牌
            titleVal        = $('#title-text').val(),//标题
            colorVal        = $('#colorInput').val(),//颜色
            addrid          = $('#addrid').val(),//所在区域
            cardtime        = $('#card-time').val(),//上牌时间
            mill            = $('#mill').val(),//行驶里程
            guohu           = $('#guohu').val(),//过户次数
            yearlytime      = $('#yearly-time').val(),//年检时间
            compulsorytime  = $('#compulsory-time').val(),//交强险到期时间
            commercialtime  = $('#commercial-time').val(),//商业险到期时间
            propertyture    = $('#propertyture').val(),//车辆性质
            price           = $('#price_text').val(),//价格
            payment         = $('#payments-text').val(),//首付
            explain         = $('#explain').val(),//车况说明
            contactname     = $('#contact-name').val(),//联系人
            contact         = $('#contact').val(),//手机号
            vercode         = $('#vercode').val();//联系人
        var str = '',r = true;
        if(f.hasClass("disabled")) return false;
        var ids = $('.addrBtn').attr("data-ids");
        if(ids != undefined && ids != ''){
            addrid = $('.addrBtn').attr("data-id");
            ids = ids.split(' ');
            cityid = ids[0];
        }
        $('#addrid').val(addrid);
        $('#cityid').val(cityid);
        $('#location').val(cityid);

        var offsetTop = 0;
        if(typeVal == ""){//品牌
            var pardl = $('#type').closest('dl');
            var hline = pardl.find(".tip-inline"), tips = $('#type').data("title");
            hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
            offsetTop = pardl.position().top;
        }
        if(titleVal == ""){//标题
            var pardl = $('#title-text').closest('dl');
            var hline = pardl.find(".tip-inline"), tips = $('#title-text').data("title");
            hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
            offsetTop = pardl.position().top;
        }
        if(colorVal == ""){//颜色
            var pardl = $('#colorInput').closest('dl');
            var hline = pardl.find(".tip-inline"), tips = $('#colorInput').data("title");
            hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
            offsetTop = pardl.position().top;
        }
        if(addrid == ""){//所在区域
            var pardl = $('#addrid').closest('dl');
            var hline = pardl.find(".tip-inline"), tips = $('#addrid').data("title");
            hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
            offsetTop = pardl.position().top;
        }
        if(cardtime == ""){//上牌时间
            var pardl = $('#card-time').closest('dl');
            var hline = pardl.find(".tip-inline"), tips = $('#card-time').data("title");
            hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
            offsetTop = pardl.position().top;
        }
        if(mill == ""){//行驶里程
            var pardl = $('#mill').closest('dl');
            var hline = pardl.find(".tip-inline"), tips = $('#mill').data("title");
            hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
            offsetTop = pardl.position().top;
        }
        if(guohu == ""){//过户
            var pardl = $('#guohu').closest('dl');
            var hline = pardl.find(".tip-inline"), tips = $('#guohu').data("title");
            hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
            offsetTop = pardl.position().top;
        }
        if(yearlytime == ""){//年检时间
            var pardl = $('#yearly-time').closest('dl');
            var hline = pardl.find(".tip-inline"), tips = $('#yearly-time').data("title");
            hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
            offsetTop = pardl.position().top;
        }
        if(compulsorytime == ""){//行驶里程
            var pardl = $('#compulsory-time').closest('dl');
            var hline = pardl.find(".tip-inline"), tips = $('#compulsory-time').data("title");
            hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
            offsetTop = pardl.position().top;
        }
        if(commercialtime == ""){//过户
            var pardl = $('#commercial-time').closest('dl');
            var hline = pardl.find(".tip-inline"), tips = $('#commercial-time').data("title");
            hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
            offsetTop = pardl.position().top;
        }
        if(propertyture == ""){//年检时间
            var pardl = $('#propertyture').closest('dl');
            var hline = pardl.find(".tip-inline"), tips = $('#propertyture').data("title");
            hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
            offsetTop = pardl.position().top;
        }
        if(price == ""){//价格
            var pardl = $('#price_text').closest('dl');
            var hline = pardl.find(".tip-inline"), tips = $('#price_text').data("title");
            hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
            offsetTop = pardl.position().top;
        }
        
        if($('.price-type .installment').hasClass('active')){
            if(payment == ""){//
                var pardl = $('#payments-text').closest('dl');
                var hline = pardl.find(".tip-inline"), tips = $('#payments-text').data("title");
                hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
                offsetTop = pardl.position().top;
            }

        }
        if(explain == ""){//车况说明
            var pardl = $('#explain').closest('dl');
            var hline = pardl.find(".tip-inline"), tips = $('#explain').data("title");
            hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
            offsetTop = pardl.position().top;
        }
        if(contactname == ""){//联系人
            var pardl = $('#contact-name').closest('dl');
            var hline = pardl.find(".tip-inline"), tips = $('#contact-name').data("title");
            hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
            offsetTop = pardl.position().top;
        }
        if(contact == ""){//手机号
            var pardl = $('#contact').closest('dl');
            var hline = pardl.find(".tip-inline"), tips = $('#contact').data("title");
            hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
            offsetTop = pardl.position().top;
        }
        //验证码action
        var codenone = $('.vercode').css('display');
        if(vercode == '' && codenone != 'none') {
            var pardl = $('#vercode').closest('dl');
            var hline = pardl.find(".tip-inline"), tips = $('#vercode').data("title");
            hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
            offsetTop = pardl.position().top;
        }

        if(offsetTop){
            $('.main').animate({scrollTop: offsetTop + 10}, 300);
            return false;
        }

        var form = $("#fabuForm"), action = form.attr("action"), url = form.attr("data-url");
        data = form.serialize();
        // console.log(data);
        // f.addClass("disabled").html(langData['siteConfig'][6][35]+"...");  //提交中

        $.ajax({
            url: action,
            data: data,
            type: "POST",
            dataType: "json",
            success: function (data) {
                if(data && data.state == 100){
                    var tip = langData['siteConfig'][20][341];
                    if(id != undefined && id != "" && id != 0){
                        tip = langData['siteConfig'][20][229];
                    }

                    $.dialog({
                        title: langData['siteConfig'][19][287],
                        icon: 'success.png',
                        content: tip + "，"+langData['siteConfig'][20][404],
                        ok: function(){
                            location.href = url;
                        }
                    });
                }else{

                    $.dialog.alert(data.info);
                    t.removeClass("disabled").html(langData['siteConfig'][11][19]);   //立即发布
                    $("#verifycode").click();
                }
            },
            error: function(XMLHttpRequest, textStatus, errorThrown){
                $.dialog.alert(langData['siteConfig'][44][10]+':'+textStatus);//网络错误，请稍候重试！
                t.removeClass("disabled").html(langData['siteConfig'][11][19]); //立即发布
                $("#verifycode").click();
            }
        });



    });



    //数量错误提示
    var errmsgtime;
    function errmsg(div,str){
        $('#errmsg').remove();
        clearTimeout(errmsgtime);
        var top = div.offset().top + 47;
        var left = div.offset().left + 10;
        $(window).scrollTop(top - 300);//滚动到需要提示的位置
        var msgbox = '<div id="errmsg" style="position:absolute;top:' + top + 'px;left:' + left + 'px;height:28px;line-height:28px;text-align:center;color:#f76120;font-size:14px;display:none;z-index:99999;background:#fff;"><i></i>' + str + '</div>';
        $('body').append(msgbox);
        $('#errmsg').fadeIn(300);
        errmsgtime = setTimeout(function(){
            $('#errmsg').fadeOut(300, function(){
                $('#errmsg').remove()
            });
        },5000);
    };







})
