$(function(){

    // $('#waimaiOrder_start_time').timepicker($.extend($.datepicker.regional['zh-cn'], {'timeFormat':'hh:mm','hour':'09','minute':'40'}));

    $('#waimaiOrder_start_time').datetimepicker($.extend($.datepicker.regional['zh_cn'], {'showSecond':true,'changeMonth':true,'changeYear':true,'tabularLevel':null,'yearRange':'2013:' + new Date().getFullYear(),'minDate':new Date(2013,1,1,00,00,00),'timeFormat':'hh:mm:ss','dateFormat':'yy-mm-dd','timeText':'时间','hourText':'时','minuteText':'分','secondText':'秒','currentText':'当前时间','closeText':'关闭','showOn':'focus','hour':'0','minute':'0','second':'0'}));
    $('#waimaiOrder_end_time').datetimepicker($.extend($.datepicker.regional['zh_cn'], {'showSecond':true,'changeMonth':true,'changeYear':true,'tabularLevel':null,'yearRange':'2013:' + new Date().getFullYear(),'minDate':new Date(2013,1,1,00,00,00),'timeFormat':'hh:mm:ss','dateFormat':'yy-mm-dd','timeText':'时间','hourText':'时','minuteText':'分','secondText':'秒','currentText':'当前时间','closeText':'关闭','showOn':'focus','hour':'23','minute':'59','second':'59'}));

    // checkbox
    /*$(document).on('click','#order-grid-failed_c0_all',function() {
        var checked=this.checked;
        $("input[name='selectorderlist\[\]']:enabled").each(function() {this.checked=checked;});
    });
    $(document).on('click', "input[name='selectorderlist\[\]']", function() {
        $('#order-grid-failed_c0_all').prop('checked', $("input[name='selectorderlist\[\]']").length==$("input[name='selectorderlist\[\]']:checked").length);
    });*/

    if($(".choseCity").size() > 0){
    	huoniao.choseCity($(".choseCity"),$("#cityid"));  //城市分站选择初始化
    }

    //下拉选择控件
    $(".chosen-select").chosen().change(function(){
        var t = $(this), id = t.attr("id"), v = t.val(), about = [];
        // 完成时间不为空,重置订单状态
        if(id == "form-field-select-5" && v != ""){
            if($("#form-field-select-4").val() != 1){
                about.push("#form-field-select-4");
            }
        }
        // 订单状态
        else if(id == "form-field-select-4"){
            // 不是成功
            if(v != "1"){
                // 重置完成时间
                about.push("#form-field-select-5");
                // 未处理或已确认，重置派送员
                if(v == "2" || v == "3"){
                    about.push("#form-field-select-2");
                }
            }
        }

        if(about.length > 0){
            chosenReset($(about.join(",")));
        }
    })

    // 重置
    $("#reset").click(function(){
        chosenReset($(".chosen-select"));
    })

    function chosenReset(obj){
        obj.each(function(){
            $(this).children("option").eq(0).attr("selected", true)
            $(this).trigger("liszt:updated");
        })
    }

    // 导出
    $("#export_btn").click(function(){
        var btn = $(this);

        if(btn.hasClass("disabled")) return;

        huoniao.showTip("loading", "操作中，请稍后");

        btn.addClass("disabled");

        $("#action").val("export");
        var data = $(".searchform").serialize();
        $.ajax({
            url: '',
            type: 'get',
            data: data,
            dataType: 'json',
            cache: false,
            processData: false,
            contentType: false,
            success: function(data){
                btn.removeClass("disabled");
                huoniao.showTip("loading", "", "auto");
                if(data && data.state == 100){
                    location.href = data.info;
                }else{
                    $.dialog.alert(data.info);
                }
            },
            error: function(){
                huoniao.showTip("loading", "", "auto");
                $.dialog.alert("网络错误，请重试！");
                btn.removeClass("disabled");
            }
        })

        $("#action").val("search");

    })


    if(personId){
        $("#waimaiOrder_lewaimai_customer_id").val(personId);
        $(".searchform").submit();
    }
    $('.searchform').submit(function(){
        var data = $(".searchform").serialize();
        var sarr = data.split('cityid');

        var thref = $('#export').attr('href')+'&cityid'+sarr[1];
        $('#export').attr('href',thref)
    })

});

function winScroll(top){
    var sct = top == 'set' ? $(window).scrollTop()-1 : $('#resultiframe').offset().top + 5;
    $('html,body').animate({
        'scrollTop' : sct
    },300)
}
