$(function () {
    //app端取消下拉刷新
    toggleDragRefresh('off');
    var juFlag = 0;
    //input获得焦点时光标自动定位到文字后面
    $('input[type="text"]').click(function(){
        var tid = $(this).attr('id');
        if(tid && juFlag == 0){
            var sr=document.getElementById(tid);
            po_Last(sr)
        }               
    })
    $('input[type="text"]').blur(function(){
        juFlag = 0;
    })

    function po_Last(obj) {
        juFlag = 1;
        obj.focus();//解决ff不获取焦点无法定位问题
        if (window.getSelection) {//ie11 10 9 ff safari
            var max_Len=obj.value.length;//text字符数
            obj.setSelectionRange(max_Len, max_Len);
        }
        else if (document.selection) {//ie10 9 8 7 6 5
            var range = obj.createTextRange();//创建range
            range.collapse(false);//光标移至最后
            range.select();//避免产生空格
        }
    }
    //年月日
    $('.demo-test-date').scroller(
        $.extend({preset: 'date', dateFormat: 'yy-mm-dd'})
    );

    $('.fabu_btn .btn').click(function () {
        var t = $(this);

        var form = $("#fabuForm"), action = form.attr("action"), url = form.attr("data-url"), tj = true;

        if($('#comname').val() == ''){
            showErr(''+langData['marry'][4][16]+'');//请输入标题！
            tj = false;
        }else if($('#card-time').val() == ''){
            showErr(''+langData['marry'][4][17]+'');//请选择日期！
            tj = false;
        }else if($('#hotel-name').val() == ''){
            showErr(''+langData['marry'][4][18]+'');//请输入酒店名称！
            tj = false;
        }else if($('.store-imgs .imgshow_box').length == 0){
            showErr(''+langData['marry'][4][8]+'');//请至少上传一张图片！
            tj = false;
        }

        //获取图片的
        var pics = [];
        $("#fileList").find('.thumbnail').each(function(){
            var src = $(this).find('img').attr('data-val');
            pics.push(src);
        });
        $("#pics").val(pics.join(','));

        if(!tj) return;

        $('.fabu_btn .btn').addClass("disabled").html(langData['siteConfig'][6][35]+"...");	//提交中

        $.ajax({
	        url: action,
	        data: form.serialize(),
	        type: "POST",
	        dataType: "json",
	        success: function (data) {
	            if(data && data.state == 100){
	            	var tip = langData['siteConfig'][20][341];
                    if(id != undefined && id != "" && id != 0){
                        tip = langData['siteConfig'][20][229];
                    }
                    location.href = url;
	            }else{
					showErr(data.info);
	            	t.removeClass("disabled").html(langData['marry'][2][58]);		//立即发布
	            }
	        },
	        error: function(){
				showErr(langData['siteConfig'][20][183]);
	            t.removeClass("disabled").html(langData['marry'][2][58]);		//立即发布
	        }
        });

    });

    //错误提示框
    var showErrTimer;
    function showErr(txt){
        showErrTimer && clearTimeout(showErrTimer);
        $(".popErr").remove();
        $("body").append('<div class="popErr"><p>'+txt+'</p></div>');
        $(".popErr").css({"visibility": "visible"});
        showErrTimer = setTimeout(function(){
            $(".popErr").fadeOut(300, function(){
                $(this).remove();
            });
        }, 1500);
    }

});