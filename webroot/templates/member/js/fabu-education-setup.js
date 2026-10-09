

$(function(){

    //选择授课时间
    $('.classTime table td').click(function () {
      $(this).toggleClass('on');
      var td_text= $(this).text();
      if($(this).hasClass('on')){
        $(this).find('span').hide();
        $(this).append('<img src="'+templatePath+'images/edubook.png" alt="" class="td_img">')
      }else{
        $(this).find('span').show();
        $(this).find('.td_img').hide();
      }
      
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
                            $('#fabuForm dl2 .inpbdr input#contact').css('padding-left','10px');
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
        var areaWrap =$(this).closest("dl").find('.areaCode_wrap');
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
        var par = t.closest("dl");
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

    //授课方式
    $('.clasType .radio span').click(function(){
        var tid = $(this).attr('data-id');
        if(tid == 0){//老师上门
            $('.clasQuy').show();
            $('.clasAdr').hide();
        }else{
            $('.clasQuy').hide();
            $('.clasAdr').show();
        }
    })

    $(".w-form").delegate("input[type=text]", "blur", function(){
        var t = $(this), dd = t.closest("dd"),dl = t.closest("dl"), hline = dd.find(".tip-inline");
        var errrTip = t.attr('data-title');
        if(dl.attr("data-required") == 1){
            if($(this).val() !=" " && $(this).val() !=""){
                hline.removeClass().addClass("tip-inline success").html("<s></s>");
            }else{
                hline.removeClass().addClass("tip-inline error").html("<s></s>"+errrTip)
            }
        }
        if(dl.attr("data-required") == 2){//针对后面已给提示语
            if($(this).val() !=" " && $(this).val() !=""){
                hline.removeClass().addClass("tip-inline success").html("<s></s>");
            }else{
                hline.removeClass().addClass("tip-inline").html("<s></s>")
            }
        }
        
    })

    $(".w-form").delegate("input[type=text]", "focus", function(){
        var t = $(this), dl = t.closest("dl"), hline = dl.find(".tip-inline");
        var errrTip = t.attr('data-title');

        if(dl.attr("data-required") == 1){
            if($(this).val() ==" " || $(this).val() ==""){
                hline.removeClass().addClass("tip-inline focus").html("<s></s>"+errrTip)
            }
        }
        

    })

    //提交发布
    $("#submit").bind("click", function(event){

        event.preventDefault();
        $('#areaaddrid').val($('.addrBtn').attr('data-id'));
        var addrids = $('.addrBtn').attr('data-ids').split(' ');
        $('#areacityid').val(addrids[0]);

        var t       = $(this),
                price  = $("#price"),
                typeid  = $("#typeid"),
                areaaddrid   = $("#areaaddrid"),
                note   = $("#note"),
                contact   = $("#contact"),
                address   = $("#class_address");

        if(t.hasClass("disabled")) return;

        var offsetTop = 0;
        

        //价格
        var exp = new RegExp("^" + titleRegex + "$", "img");
        if(price.val() == ''){
            var pardl = price.closest('dd');
            var hline = pardl.find(".tip-inline"), tips = price.data("title");
            hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
            offsetTop = price.offset().top;
        }


        if(typeid.val() == 0){
            console.log(areaaddrid.val())
            if(areaaddrid.val() == '' || areaaddrid.val() == 0){
                var pardl = areaaddrid.closest('dd');
                var hline = pardl.find(".tip-inline");
                hline.removeClass().addClass("tip-inline error").html("<s></s>请选择授课区域");
                offsetTop = areaaddrid.position().top;
            }
            
        }else{
            if(address.val() == ''){
                var hline = address.siblings(".tip-inline"), tips = address.data("title");
                hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
                offsetTop = address.position().top;
            }
        }

        if(!$('.classTime table td').hasClass('on')){
            var hline = $('.classTime').find(".tip-inline");
            hline.removeClass().addClass("tip-inline error").html("<s></s>请选择授课时间");
            offsetTop = $('.classTime').position().top;
        }

        if(note.val() == ''){
            var hline = note.siblings(".tip-inline"), tips = note.data("title");
            hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
            offsetTop = note.position().top;
        }

        if(contact.val() == ''){
            var hline = contact.siblings(".tip-inline"), tips = contact.data("title");
            hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
            offsetTop = contact.position().top;
        }
        //验证码
        var codenone = $('.vercode').css('display');
        var vercode = $('#vercode');
        var vercodev = $.trim(vercode.val());
        if(vercodev == '' && codenone != 'none') {
            var hline = vercode.closest('dd').find(".tip-inline"), tips = vercode.data("title");
            hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
            offsetTop = vercode.position().top;
        }

        if(offsetTop){
            $('html, body').animate({scrollTop: offsetTop - 5}, 300);
            return false;
        }


        var form = $("#fabuForm"), action = form.attr("action"), url = form.attr("data-url");
        var data = '';
        $(".classTime table td.on").each(function(){
          
            var name = $(this).children('span').attr('data-name'), id = $(this).children('span').attr('data-id');
            if(name!='' && id !=''){
              data += name + "=" + id + "&";
            }
          
        });
        if(data!=''){
          data = data.substring(0, data.length-1);
        }

        t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");  //提交中

        $.ajax({
            url: action,
            data: form.serialize() + "&" + data,
            type: "POST",
            dataType: "json",
            success: function (data) {
                if(data && data.state == 100){

                    var tip = langData['siteConfig'][20][341];
                    if(id != undefined && id != "" && id != 0){
                        tip = langData['siteConfig'][20][229];
                    }
                    t.removeClass("disabled").html(langData['siteConfig'][11][19]);   //立即发布
                    $.dialog.alert(tip)
                }else{
                    $.dialog.alert(data.info);
                    t.removeClass("disabled").html(langData['siteConfig'][11][19]);   //立即发布
                    $("#verifycode").click();
                }

            },
            error: function(){
                $.dialog.alert(langData['siteConfig'][20][184]);  //加载中，请稍候
                t.removeClass("disabled").html(langData['siteConfig'][11][19]);//立即发布
                $("#verifycode").click();
            }
        });


    });

})
