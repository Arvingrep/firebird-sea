$(function(){


	//下拉弹窗
    $('.w-form #fabuForm .down-div .inp').click(function(e){
        var par = $(this).closest('.down-div');
        var downCon = par.find('.time_choose');
        if(!par.hasClass('curr')){
            par.addClass('curr');
            $('.time_choose').removeClass('active');
            downCon.addClass('active');
        }else{
            par.removeClass('curr');
            downCon.removeClass('active');
        }
            
        $(document).one('click',function(){
            par.removeClass('curr');
            downCon.removeClass('active');
        })
        e.stopPropagation();
    })

    //选择下拉
    $('.time_choose p').click(function(){
        $(this).addClass('curr').siblings('p').removeClass('curr');
        var par = $(this).closest('.time_choose');
        var timeDiv = $(this).closest('.down-div').find('.time-div');
        var tid = $(this).find('a').attr('data-id');
        var txt = $(this).find('a').text();
        par.siblings('input').val(tid);
        if(timeDiv.hasClass('huNum')){
            timeDiv.find('input').val(tid);
        }else{
            timeDiv.find('input').val(txt);
        }
        var pardl = $(this).closest('dl');
        var hline = pardl.find(".tip-inline");
        hline.removeClass().addClass("tip-inline success").html("<s></s>");
        
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
        $('#addrid').val($('.addrBtn').attr('data-id'));
        var addrids = $('.addrBtn').attr('data-ids').split(' ');
        $('#cityid').val(addrids[0]);


        var t       = $(this),
                title  = $("#title"),
                addrid   = $("#addrid"),
                subjects   = $("#subjects"),
                contact   = $("#contact"),
                educationname = $("#educationname"),
                educations    = $("#educations"),
                lecturesnums   = $("#lecturesnums"),
                price   = $("#price");

        if(t.hasClass("disabled")) return;
        var ftxt = t.text();

        var offsetTop = 0;
        
        if($.trim(title.val()) == "" || title.val() == 0){
			var stip = title.data('title');
			title.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+stip);
			offsetTop = offsetTop == 0 ? title.position().top : offsetTop;
		}

		if($.trim(subjects.val()) == "" || subjects.val() == 0){
            var stip = subjects.data('title');
            subjects.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+stip);
            offsetTop = offsetTop == 0 ? subjects.position().top : offsetTop;
        }
    
 
        if(addrid.val() == '' || addrid.val() == 0){
            var pardl = addrid.closest('dd');
            var hline = pardl.find(".tip-inline");
            hline.removeClass().addClass("tip-inline error").html("<s></s>请选择所在区域");
            offsetTop = $('#selAddr').position().top;
        }

        if(educations.val() == ''){
            var pardl = educations.closest('dd');
            var hline = pardl.find(".tip-inline"), tips = educationname.data("title");
            hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
            offsetTop = educations.offset().top;
        }


        //授课次数
        if(lecturesnums.val() == ''){
            var pardl = lecturesnums.closest('dd');
            var hline = pardl.find(".tip-inline"), tips = lecturesnums.data("title");
            hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
            offsetTop = lecturesnums.offset().top;
        }
            

        
        //预期费用
        if(price.val() == ''){
            var pardl = price.closest('dd');
            var hline = pardl.find(".tip-inline"), tips = price.data("title");
            hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
            offsetTop = price.offset().top;
        }

        //手机号码
        if(contact.val() == ''){
            var hline = contact.siblings(".tip-inline"), tips = contact.data("title");
            hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
            offsetTop = contact.position().top;
        }



        if(offsetTop){
            $('html, body').animate({scrollTop: offsetTop - 5}, 300);
            return false;
        }


        var form = $("#fabuForm"), action = form.attr("action"), url = form.attr("data-url");
        
        t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");  //提交中
        var fabuTy = t.attr('data-fabu');
        $.ajax({
            url: action,
            data: form.serialize(),
            type: "POST",
            dataType: "json",
            success: function (data) {
                if(data && data.state == 100){

                    var tip = langData['siteConfig'][20][341];
                    if(fabuTy == 1){
                        tip = langData['education'][7][9];//
                    }
                    if(data.info.check == 0){
                        tip = langData['siteConfig'][44][69];//请等待管理员审核您的信息,如果需要加急处理请联系网站客服!
                    }
                    t.removeClass("disabled").html(ftxt);   //立即发布
                    $.dialog.alert(tip);
                    setTimeout(function(){
                        location.href = url;
                    },500)
                    
                }else{
                    $.dialog.alert(data.info);
                    t.removeClass("disabled").html(ftxt);   //立即发布
                    $("#verifycode").click();
                }

            },
            error: function(){
                $.dialog.alert(langData['siteConfig'][20][184]);  //加载中，请稍候
                t.removeClass("disabled").html(ftxt);//立即发布
                $("#verifycode").click();
            }
        });


    });


})
