
function xiaoshu(obj){
    obj.value = obj.value.replace(/[^\d.]/g, "");  //清除“数字”和“.”以外的字符   
    obj.value = obj.value.replace(/\.{2,}/g, "."); //只保留第一个. 清除多余的   
    obj.value = obj.value.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
    obj.value = obj.value.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3');//只能输入两个小数   
    if (obj.value.indexOf(".") < 0 && obj.value != "") {//以上已经过滤，此处控制的是如果没有小数点，首位不能为类似于 01、02的金额  
        obj.value = parseFloat(obj.value);
    }

}
function zhengshu(obj){

    obj.value = obj.value.replace(/[^0-9]/g,''); //只能整数
}
$(function(){

    //班级情况
    $('.clasType .radio span').click(function () {
      $(this).addClass('curr').siblings('span').removeClass('curr');
      var tid = $(this).attr('data-id');
      if(tid == 1){//多个班级
        $('.classContainer').show();
        $('a.addMore').css('display','inline-block')
        $('.classWrap2').hide();
      }else{
        $('.classContainer,a.addMore').hide();
        $('.classWrap2').show();
      }
      $('#class_type').val(tid)
      
    })

    //课程时间
    speTime();
    function speTime(){
        //时间
        var nowDa = new Date();
        //开始时间
        $(".form_datetime .startTime").datetimepicker({     
            minView: 2,//设置只显示到月份
            format: 'yyyy-mm-dd',
            linkFormat: 'yyyy-mm-dd',
            autoclose: true,
            language: 'ch',
            todayBtn: true,
            timePicker : false,
            startDate:new Date(),
            linkField: "startTime",
            onSelect: checktimeChose
        }).on('changeDate',checktimeChose);

        //结束时间
        $(".form_datetime .endTime").datetimepicker({       
            minView: 2,//设置只显示到月份
            format: 'yyyy-mm-dd',
            linkFormat: 'yyyy-mm-dd',
            autoclose: true,
            language: 'ch',
            todayBtn: true,
            timePicker : false,
            startDate:new Date(),
            linkField: "endTime",
            onSelect: checktimeChose
        }).on('changeDate',checktimeChose);
        

    }
    //验证开始时间 结束时间
    function checktimeChose(ev){
        var currentDate = ev.date;
        var currentClass = ev.currentTarget.className;
        var currentTarget = ev.currentTarget;
        if(currentClass.indexOf('startTime') > -1){
            var nextVal = $(currentTarget).siblings('input');
            if(currentDate > new Date(nextVal.val())){
                nextVal.val('');
            }
        }else{
            var nextVal = $(currentTarget).siblings('input');
            if(currentDate < new Date(nextVal.val())){
                nextVal.val('');
            }
        }
        
    }
    var obj = $('.classContainer');
    function addList(tr,insetDom){
        var count = $('.classContainer .classWrap').length + 1;
        var addHtml = [],html2 = [],html3 = [];
        addHtml.push('<div class="classWrap classWrap1">');
        addHtml.push('<input type="hidden" class="class_id">');
        addHtml.push('<div class="classCon fn-clear">');

        addHtml.push('<dl class="fn-clear speDl">');
        addHtml.push('<dt><span>*</span>班级名：</dt>');
        addHtml.push('<dd><input type="text" class="inp class_name"></dd>');
        addHtml.push('</dl>');

        addHtml.push('<dl class="speTime fn-clear">');
        addHtml.push('<dt><span>*</span>课程时间：</dt>');
        addHtml.push('<dd>');
        addHtml.push('<div class="form_datetime">');
        addHtml.push('<input type="text" class="inp startTime" readonly placeholder="开始时间"><em>-</em><input type="text" class="inp endTime" readonly placeholder="结束时间">');
        addHtml.push('</div>');
        addHtml.push('</dd>');
        addHtml.push('</dl>');

        addHtml.push('<dl class="fn-clear">');
        addHtml.push('<dt><span>*</span>地点：</dt>');
        addHtml.push('<dd><input type="text" class="inp class_place class_com"></dd>');
        addHtml.push('</dl>');

        addHtml.push('<dl class="fn-clear">');
        addHtml.push('<dt><span>*</span>价格：</dt>');
        addHtml.push('<dd>');
        addHtml.push('<div class="input-append">');
        addHtml.push('<input type="text" value="" onkeyup="xiaoshu(this)" class="class_price class_com2"><span class="add-aft">'+echoCurrency('short')+'</span>');//元
        addHtml.push('</div>');
        addHtml.push('</dd>');
        addHtml.push('</dl>');

        addHtml.push('<dl class="fn-clear">');
        addHtml.push('<dt><span>*</span>课时：</dt>');
        addHtml.push('<dd>');
        addHtml.push('<div class="input-append">');
        addHtml.push('<input type="text" value="" onkeyup="xiaoshu(this)" class="class_hour class_com2"><span class="add-aft">时</span>');
        addHtml.push('</div>');
        addHtml.push('</dd>');
        addHtml.push('</dl>');

        if(isteacher=='1'){
            addHtml.push('<dl class="fn-clear">');
            addHtml.push('<dt>授课教师：</dt>');
            addHtml.push('<dd>');
            addHtml.push('<div class="comBox">');
            addHtml.push('<input type="text" class="inp class_teacher class_com" placeholder="请选择" readonly><span class="caret"></span>');
            addHtml.push('</div>');
            addHtml.push('<input type="hidden" class="class_teacherid">');
            addHtml.push('</dd>');
            addHtml.push('</dl>');
        }
        

         addHtml.push('<dl class="fn-clear">');
        addHtml.push('<dt>授课形式：</dt>');
        addHtml.push('<dd>');
        addHtml.push('<div class="radio">');
        var fakeHtml = $('.fakeHtml').html();
        addHtml.push(fakeHtml);
        addHtml.push('<input type="hidden" value="" class="class_typeid">');
        addHtml.push('</div>');
        addHtml.push('</dd>');
        addHtml.push('</dl>');

         addHtml.push('<dl class="fn-clear">');
        addHtml.push('<dt>班级特色：</dt>');
        addHtml.push('<dd><textarea class="input_area" ></textarea></dd>');
        addHtml.push('</dl>');
        addHtml.push('</div>');
        addHtml.push('<span class="btn move" title="'+langData['siteConfig'][6][19]+'"><i></i></span>');
        addHtml.push('<span class="btn del" title="'+langData['siteConfig'][6][8]+'"><i></i></span>');
        addHtml.push('<span class="btn add" title="'+langData['siteConfig'][6][18]+'"><i></i></span>');
        addHtml.push('</div>');
        var realHtml = addHtml.join('');
        if(tr){
            $(realHtml).insertAfter(insetDom)
        }else{
            $('.classContainer').append(realHtml);
        }
        
        speTime();
    }
    //继续添加班级
    $('body').delegate('.addMore','click',function(){
       addList();
    })
    //删除班级
    obj.delegate('.del','click',function(){
        var spar = $(this).closest('.classWrap');           
        if(obj.find('.classWrap').length == 1){
            spar.find('.class_name').val('');
            spar.find('.startTime').val('');
            spar.find('.endTime').val('');
            spar.find('.class_place').val('');
            spar.find('.class_price').val('');
            spar.find('.class_hour').val('');
            spar.find('.class_teacher').val('');
            spar.find('.class_typeid').val('');
            spar.find('.input_area').val('');
            spar.find('.radio span').removeClass('curr');
        }else{
            spar.remove();
        }
    })

    //增加班级
    obj.delegate('.add','click',function(){
        var spar = $(this).closest('.classWrap');
        addList(1,spar);
    })

    $(".classContainer").dragsort({ dragSelector: ".move", placeHolderTemplate: '<div class="classWrap classWrap1"></div>' });

    //授课教师
    $('body').delegate('.class_teacher','click',function(){
        $('.classWrap').removeClass('show');
        var spar = $(this).closest('.classWrap');
        spar.addClass('show')
        $('.teMask').show();
        $('.teacherWrap').css('display','flex');
    })
    //选择授课教师
    $('.teacherWrap').delegate('.tecMid li','click',function(){
        if($(this).find('.r_class span.curr').size() > 0){
            $(this).find('.r_class span').removeClass('curr');
            $(this).removeClass('active');
        }else{
            $(this).find('.r_class span').addClass('curr');
            $(this).addClass('active');
        }

    })

    $('.teacherWrap').delegate('.r_class span','click',function(){
        $(this).toggleClass('curr');
        if ($(this).closest('.r_class').find('span').hasClass('curr')) {
          $(this).closest('li').addClass('active');
        } else {
          $(this).closest('li').removeClass('active');
        }
        return false;
    })

    //选择授课教师 -- 确认
    $('.teacherWrap .tecConfirm').click(function () {
        $('.teMask').hide();
        $('.teacherWrap').css('display','none');
          //输出被选中的教师名
          var tec = [];
          var ids = [];
          $(".tecMid li.active").each(function () {              
              var tec_name = $(this).find('.r_name').text();
              var id = $(this).attr('data-id');
              tec.push(tec_name)
              ids.push(id)
          });
          $('.classWrap.show').find('.class_teacher').val(tec.join(','))
          $('.classWrap.show').find('.class_teacherid').val(ids.join(','))
      });

    //选择授课教师 -- 取消
    $('.teacherWrap .tecCancel,.teMask,.tecClose').click(function () {
        $('.teMask').hide();
        $('.teacherWrap').css('display','none');
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

    //提交发布
    $("#submit").bind("click", function(event){

        event.preventDefault();
        

        var t       = $(this),
                title  = $("#title"),
                typeid  = $("#typeid"),
                classType   = $("#class_type"),
                note   = $("#note"),
                contact   = $("#contact"),
                address   = $("#class_address");

        if(t.hasClass("disabled")) return;

        var offsetTop = 0;
        

        //标题
        if(title.val() == ''){           
            var hline = title.siblings(".tip-inline"), tips = title.data("title");
            hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
            offsetTop = title.offset().top;
        }


        if(typeid.val() == ''){           
            var pardl = typeid.closest('dd');
            var hline = pardl.find(".tip-inline"),tips = $('#typename').data("title");
            hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
            offsetTop = typeid.position().top;   
            
        }

        if($("#listSection2").find('.pubitem').length == 0){
            $.dialog.alert('请上传课程图片')
            offsetTop = $('#listSection2').position().top;
        }

        if(classType.val() == 111){//单个班级

            var spar = $('.classWrap2');
            var clsstart = spar.find('.startTime').val();
            var clsend = spar.find('.endTime').val();
            var clsplace = spar.find('.class_place').val();
            var clsprice = spar.find('.class_price').val();
            var clshour = spar.find('.class_hour').val();
            if(!clsstart){
                $.dialog.alert('请选择开始时间');
                return false;
            }else if(!clsend){
                $.dialog.alert('请选择结束时间');
                return false;
            }else if(!clsplace){
                $.dialog.alert('请填写班级地点');
                return false;
            }else if(!clsprice){
                $.dialog.alert('请填写班级价格');
                return false;
            }else if(!clshour){
                $.dialog.alert('请填写班级课时');
                return false;
            }
        }else{//多个班级
            var tflg= false;
            $('.classContainer .classWrap1').each(function(){
                var that = $(this);
                var clsname = that.find('.class_name').val();
                var clsstart = that.find('.startTime').val();
                var clsend = that.find('.endTime').val();
                var clsplace = that.find('.class_place').val();
                var clsprice = that.find('.class_price').val();
                var clshour = that.find('.class_hour').val();
                if(!clsname){
                    $.dialog.alert('请填写班级名称');
                    tflg = true;
                    return false;
                }else if(!clsstart){
                    $.dialog.alert('请选择开始时间');
                    tflg = true;
                    return false;
                }else if(!clsend){
                    $.dialog.alert('请选择结束时间');
                    tflg = true;
                    return false;
                }else if(!clsplace){
                    $.dialog.alert('请填写班级地点');
                    tflg = true;
                    return false;
                }else if(!clsprice){
                    $.dialog.alert('请填写班级价格');
                    tflg = true;
                    return false;
                }else if(!clshour){
                    $.dialog.alert('请填写班级课时');
                    tflg = true;
                    return false;
                }else{
                    var tindex = that.index()+1;
                    that.find('.class_id').attr('name','courses['+tindex+'][id]');
                    that.find('.class_name').attr('name','courses['+tindex+'][classname]');
                    that.find('.startTime').attr('name','courses['+tindex+'][openStart]');
                    that.find('.endTime').attr('name','courses['+tindex+'][openEnd]');
                    that.find('.class_place').attr('name','courses['+tindex+'][address]');
                    that.find('.class_price').attr('name','courses['+tindex+'][price]');
                    that.find('.class_teacherid').attr('name','courses['+tindex+'][teacherid]');
                    that.find('.class_typeid').attr('name','courses['+tindex+'][typeid]');
                    that.find('.input_area').attr('name','courses['+tindex+'][desc]');
                    that.find('.class_hour').attr('name','courses['+tindex+'][classhour]');

                }
                
            })
        }
        if(tflg == true){
            return false;
        }

        var pics = [];
        $("#listSection2").find('.pubitem').each(function(){
            var src = $(this).find('img').attr('data-val');
            pics.push(src);
        });
        $("#pics").val(pics.join(','));
		$("input[name='pics']").val(pics.join(','));
        if(offsetTop){
            $('html, body').animate({scrollTop: offsetTop - 5}, 300);
            return false;
        }


        var form = $("#fabuForm"), action = form.attr("action"), url = form.attr("data-url");

        t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");  //提交中

        $.ajax({
            url: action,
            data: form.serialize(),
            type: "POST",
            dataType: "json",
            success: function (data) {
                if(data && data.state == 100){

                    fabuPay.check(data, url, t);
                    t.removeClass("disabled").html(langData['siteConfig'][11][19]);   //立即发布

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
