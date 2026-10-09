/**
 * Created by Administrator on 2018/5/18.
 */
$(function(){
    var mask=$('.mask')
    //点击品牌弹窗
    $(".type").bind("click", function(){
        $('.brand-wrap').show();
        $('.aside-main ul li').removeClass('active')
        mask.show()
    })

    //关闭品牌弹窗
    $(".brand-wrap .close_alert,.ul_wrap .cancel").bind("click", function(){
        $('.brand-wrap').hide();
        mask.hide()
    })

    //分类车系
    $('.block-brand .aside-main li').on('click',function () {
        var t = $(this), id = t.data('id');
        $('.block-brand .aside-main li').removeClass('active')
        t.addClass('active');
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
        $('.block-cartype li').removeClass('active')
        t.addClass('active');
        if(id!=''){
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


    // $(".cartype-sub").delegate("li","click",function(){
    //     var t = $(this).html(), id = $(this).data('id');
    //     if(id!=''){
    //         $("#model").val(id);
    //     }
    //     $('#brand-text').val(t);
    //     $('.brand .choose span').hide();
    //     $('.aside').removeClass('show');
    //     $('.mask_car').addClass('mask-hide');
    // });

    //品牌确定
    $(".ul_wrap .confirm").bind("click", function(){
        var brandVal=$('.block-brand li.active').text()
        var cartypeVal=$('.block-cartype li.active').text();
        var subVal=$('.cartype-sub li.active').text();
        $('#type').val(brandVal+' '+cartypeVal+' '+subVal);
        $('.brand-wrap').hide();
        mask.hide();
    })

    //选择颜色
    $(".colorPick_wrap .colorTag").bind("click", function(){
        $(this).addClass('colorPicked').siblings().removeClass('colorPicked');
        var colorInput=$('.colorPick_wrap .colorTag.colorPicked').attr('data-color')
        $('#colorInput').val(colorInput)
    })

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
                html2.push('<p data-id="'+j+'">'+j+'月</p>')

              } 
            } else { // 未来年份
              html2.push('<p data-id="'+j+'">'+j+'月</p>')
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

                html2.push('<p data-id="'+j+'">'+j+'月</p>')

              } 
            } else { // 未来年份
              html2.push('<p data-id="'+j+'">'+j+'月</p>')
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
            yearV=year+'年';
        }
        
        var monthV=$('.month .time-aside p.curr').text();
        var timeVal=yearV+'-'+monthV;
        var timeInput= $(this).parents('.down-div').find('.time-input');
        timeInput.val(timeVal);
        e.stopPropagation();  //停止事件传播
        
    })


    //车辆性质

    $('.time_choose .pro-choose').delegate('p','click',function(e){
        $('.time_choose .pro-choose p').removeClass('curr');
        $(this).addClass('curr');
        $('.time_choose').removeClass('active');
        var proChoose=$('.time_choose .pro-choose p.curr').text();
       $('#propertyture').val(proChoose);
        e.stopPropagation();  //停止事件传播
        
    })
    //分期
    
    $('.price-type').delegate('span','click',function(e){
        $(this).toggleClass('active')
        if($('.installment').hasClass('active')){
            $('.price-li').show();
            var price_text=$('#price_text').val();
            if(price_text==''){
                alert(langData['car'][8][82]);//请先输入价格
            }

        }else{
            $('.price-li').hide();
        }
    })
    //首付金额
    $('.time_choose .radio-choose').delegate('p','click',function(e){
        
            $('.time_choose .radio-choose p').removeClass('curr');
            $(this).addClass('curr');
            $('.time_choose').removeClass('active');
            var radioChoose=$('.time_choose .radio-choose p.curr').text();
            $('#payments-text').val(radioChoose);
            var price_text=$('#price_text').val();
            var pay = price_text*radioChoose;
            $('.car-price').html(pay.toFixed(2)+'万元');
        
        

        
        e.stopPropagation();  //停止事件传播
        
    })

    

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
    //发布提交
    $(".form_con .fabu-submit").bind("click", function(){
        var f = $(this);
        var str = '',r = true;
        if(f.hasClass("disabled")) return false; 
        //上传图片
        var img = $('#img-error');
        if($('.img_box .imgshow_box').length == 0){
            if (r) {
                
                $('#img-error').show();
                var errmsgtime2 = setTimeout(function(){
                    $('#img-error').hide()
                },5000);  
                $(window).scrollTop(img.offset().top - 300);//滚动到需要提示的位置

            }
            r = false;
        }

        // 标题
        var carName = $('#car-name');
        var carNamev = $.trim(carName.val());
        if(carNamev == '') {
            if (r) {
                carName.focus();
                errmsg(carName, langData['car'][8][39]);   //请输入标题
            }
            r = false;
        }
        // 请选择品牌
        var type = $('#type');
        var typev = $.trim(type.val());
        if(typev == '') {
            if (r) {
                errmsg(type, langData['car'][4][1]);   //请选择品牌
            }
            r = false;
        }

        // 颜色
        var colorInput = $('#colorInput');
        var colorInputv = $.trim(colorInput.val());
        if(colorInputv == '') {
            if (r) {
                $('#img-error2').show();
                var errmsgtime3 = setTimeout(function(){
                    $('#img-error2').hide()
                },5000);  
                $(window).scrollTop($('#img-error2').offset().top - 300);//滚动到需要提示的位置
            }
            r = false;
        }

        // 所在区域
        var selAddr = $('.addrBtn');
        var selAddrv = $.trim($('.city-title').text());
        if(selAddrv == '' || selAddrv =='请选择') {
            if (r) {

                errmsg(selAddr, langData['car'][8][70]);   //请选择所在区域
            }
            r = false;
        }


        // 上牌时间
        var cardTime = $('#card-time');
        var cardTimev = $.trim(cardTime.val());
        if(cardTimev == '') {
            if (r) {
                errmsg(cardTime, langData['car'][4][4]);   //请选择上牌时间
            }
            r = false;
        }
        // 行驶里程
        var mill = $('#mill');
        var millv = $.trim(mill.val());
        if(millv == '') {
            if (r) {
                mill.focus();
                errmsg(mill, langData['car'][8][40]);   //请填写行驶里程
            }
            r = false;
        }
        // 过户次数
        var guohu = $('#guohu');
        var guohuv = $.trim(guohu.val());
        if(guohuv == '') {
            if (r) {
                guohu.focus();
                errmsg(guohu, langData['car'][7][57]);   //请填写过户次数
            }
            r = false;
        }
        // 年检时间
        var yearly = $('#yearly-time');
        var yearlyv = $.trim(yearly.val());
        if(yearlyv == '') {
            if (r) {

                errmsg(yearly, langData['car'][8][41]);   //请选择年检时间
            }
            r = false;
        }
        // 交强险到期时间
        var compulsory = $('#compulsory-time');
        var compulsoryv = $.trim(compulsory.val());
        if(compulsoryv == '') {
            if (r) {

                errmsg(compulsory, langData['car'][6][39]);   //请选择交强险到期时间
            }
            r = false;
        }

        // 商业险到期时间
        var commercial = $('#commercial-time');
        var commercialv = $.trim(commercial.val());
        if(commercialv == '') {
            if (r) {

                errmsg(commercial, langData['car'][6][40]);   //请选择商业险到期时间
            }
            r = false;
        }

        // 车辆性质
        var property = $('#propertyture');
        var propertyv = $.trim(property.val());
        if(propertyv == '') {
            if (r) {

                errmsg(property, langData['car'][4][6]);   //请选择车辆性质
            }
            r = false;
        }

        // 价格
        var price_text = $('#price_text');
        var price_textv = $.trim(price_text.val());
        if(price_textv == '') {
            if (r) {

                errmsg(price_text, langData['car'][4][7]);   //请填写价格
            }
            r = false;
        }
        //首付金额
        if($('.price-type .installment').hasClass('active')){
            var payment = $('#payments-text');
            var paymentv = $.trim(payment.val());
            if(paymentv == '') {
                if (r) {

                    errmsg(payment, langData['car'][3][20]);   //请选择首付比例
                }
                r = false;
            } 
        }
        // 车况信息
        var explain = $('#explain');
        var explainv = $.trim(explain.val());
        if(explainv == '') {
            if (r) {
                explain.focus();
                $('#img-error3').show();
                var errmsgtime4 = setTimeout(function(){
                    $('#img-error3').hide()
                },5000);  
                $(window).scrollTop($('#img-error3').offset().top - 300);//滚动到需要提示的位置
            }
            r = false;
        }
        // 联系人
        var name = $('#contact-name');
        var namev = $.trim(name.val());
        if(namev == '') {
            if (r) {
                name.focus();
                errmsg(name, langData['car'][4][13]);   //请填写联系人
            }
            r = false;
        }
        // 手机号
        var contact = $('#contact')
        var contactv = $.trim(contact.val());
        if(contactv == '') {
            if (r) {
                contact.focus();
                errmsg(contact, langData['car'][8][15]);//请输入手机号码
            }
            r = false;
        } else {
            // var telReg = !!contactv.match(/^(13|14|15|17|18)[0-9]{9}$/);
            // if(!telReg){
            // if (r) {
            //     contact.focus();
            //     errmsg(contact,langData['car'][8][16]);//请输入正确手机号码
            // }
            // r = false;
            // }
        }

        var ids = $('.addrBtn').attr("data-ids");
        if(ids != undefined && ids != ''){
            addrid = $('.addrBtn').attr("data-id");
            ids = ids.split(' ');
            cityid = ids[0];
        }else{
            r = false;
            $('.maskbg').show();
            $('.maskbg .msg-box .msg').html(''+langData['car'][6][48]+'');
        }
        $('#addrid').val(addrid);
        $('#cityid').val(cityid);
        $('#location').val(cityid);

        var pics = [];
        $("#fileList").find('.thumbnail').each(function(){
            var src = $(this).find('img').attr('data-val');
            pics.push(src);
        });
        $("#pics").val(pics.join(','));

        if(!r){
            return;
        }    



        var form = $("#fabuForm"), action = form.attr("action"), url = form.attr("data-url");
        // 验证码action
        var vercode = $('#vercode');
        var vercodev = $.trim(vercode.val());
        if(vercodev == '') {
            if (r) {

                errmsg(vercode, langData['car'][4][11]);   //请输入验证码
            }
            r = false;
        }     

        data = form.serialize();

        // f.addClass("disabled").html(langData['siteConfig'][6][35]+"...");  //提交中

        $.ajax({
            url: action,
            data: data,
            type: "POST",
            dataType: "json",
            success: function (data) {
                if(data && data.state == 100){
                    $('.order_success').show();
                    fabuPay.check(data, url, t);
                }else{
                    $('.maskbg').show();
                    $('.maskbg .msg-box .msg').html(data.info);
                    //$.dialog.alert(data.info);
                    t.removeClass("disabled").html(langData['car'][3][21]);   //立即投稿
                    //$("#verifycode").click();
                }
            },
            error: function(XMLHttpRequest, textStatus, errorThrown){
                alert('错误信息:'+textStatus);
                $('.maskbg').show();
                $('.maskbg .msg-box .msg').html(langData['siteConfig'][20][183]);
                //$.dialog.alert(langData['siteConfig'][20][183]);//网络错误，请稍候重试！
                t.removeClass("disabled").html(langData['car'][3][21]); //立即投稿
                //$("#verifycode").click();
            }
        });

       

    });

    //关闭预约成功弹窗
    $(".order_success .close_alert,.order_success .t3").bind("click", function(){
        $('.order_success').hide();
    })

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
