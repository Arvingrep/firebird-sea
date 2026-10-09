$(function(){

    var hasError = false;

	$("#quan-form").submit(function(e){
        e.preventDefault();
        var form = $(this),
            btn = $(".submit"),
            type = $("#type"),
            id = $("#id");

        if(id.val() == ''){
            $.dialog.alert("请选择优惠券");
            return false;
        }
        if(type.val() == 'only'){
        	var userid = $("#userid");
        	if(userid.val() == ''){
	            $.dialog.alert("请填写用户ID");
	            return false;
	        }
        }

        btn.attr("disabled",true);

        if(type.val() == 'all'){
        	huoniao.showTip("loading", "本操作耗时较长，请耐心等待");
        }

        sendQuan(form.serialize(), 1);

        /*$.ajax({
            url: '?dopost=submit',
            type: 'post',
            data: form.serialize(),
            dataType: 'json',
            success: function(data){
                if(data && data.state == 100){
                    var pageInfo = data.pageInfo, page = pageInfo.page, totalPage = data.totalPage;

                    if(data.code == 100){
                        if(page == totalPage){
                            huoniao.showTip("loading", "发放成功", "auto");
                        }else{

                        }
                    }
                    huoniao.showTip("loading", "发放成功", "auto");
                    location.reload();
                }else{
                    huoniao.showTip("loading", "", "auto");
                    $.dialog.alert(data.info);
                    btn.attr("disabled",false).text("保存");
                }
            },
            error: function(){
            	huoniao.showTip("loading", "", "auto");
                $.dialog.alert("网络错误");
                btn.attr("disabled",false).text("保存");
            }
        })*/
    })

    function sendQuan(formdata, atpage){
        var btn = $(".submit");
        $.ajax({
            url: '?dopost=submit&page='+atpage,
            type: 'post',
            data: formdata,
            dataType: 'json',
            success: function(data){
                if(data && data.state == 100){
                    var pageInfo = data.pageInfo, page = pageInfo.page, totalPage = pageInfo.totalPage, totalCount = pageInfo.totalCount, count = data.count;

                    if(page == 1){
                        $(".sendInfo .info").html('共<span>'+totalPage+'</span>组<span>'+totalCount+'</span>个会员');
                    }


                    $(".sendprogress ul").append('<li>发放完第'+page+'组，'+count+' 个会员</li>');
                    $(".sendprogress ul").animate({
                        'scrollTop' : '+=25'
                    },300)

                    // 没有漏发的用户
                    if(data.code == 100){
                        
                        // 发放完毕
                        if(page == totalPage){
                            if(!hasError){
                                huoniao.showTip("loading", "发放成功", "auto");
                                $.dialog({
                                    title: '提醒',
                                    icon: 'success.png',
                                    content: '发放成功！',
                                    ok: function(){
                                        location.reload();
                                    }
                                });
                            }else{
                                $.dialog.alert('部分用户发放失败，请查看底部信息');
                            }
                            // 如果有错误，显示给发放失败用户发送按钮
                            if(hasError){
                                $(".sendAgain").show();
                            }
                        }else{
                            sendQuan(formdata, atpage+1);
                        }
                    }else{
                        hasError = true;

                        $(".senderror ul").append('<li>'+data.info+'</li>');
                    }
                }else{
                    huoniao.showTip("loading", "", "auto");
                    $.dialog.alert(data.info);
                    btn.attr("disabled",false);
                }
            },
            error: function(){
                huoniao.showTip("loading", "", "auto");
                $.dialog.alert("网络错误");
                btn.attr("disabled",false);

                $(".sendFilter").show();
            }
        })
    }

    $(".sendFail").click(function(){
        var ids = [];
        $(".senderror ul li").each(function(){
            ids.push($(this).text());
        })
        if(ids.length > 0){

            $("#ids").val(ids.join(","));

            var formdata = $("#quan-form").serialize();

            $(".sendInfo ul").append('<li class="fgx"></li>');

            sendQuan(formdata, 1);
        }
    })

    $(".sendFilter").click(function(){
        $("#filter").val("1");
    })

})