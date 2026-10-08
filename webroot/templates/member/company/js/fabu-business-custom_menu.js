$(function(){

	getEditor("body");

    //类型切换
    $('.radio span').bind('click', function(){
        var t = $(this), id = t.data('id');
        t.addClass('curr').siblings('span').removeClass('curr');
        $('.type0, .type1').hide();
        $('.type' + id).show();
    })

	//修改
	var id = $('#id').val();
    if(id && menuList){
		var data;
		for (var i = 0; i < menuList.length; i++){
			if(menuList[i].id == id){
				data = menuList[i];
			}
		}

		if(data){
			$('#title').val(data.title);
			//跳转
			if(data.jump_url){
				$('.radio span').removeClass('curr');
				$('.radio span:eq(1)').addClass('curr');
				$('.type0').hide();
				$('.type1').show();
				$('#jump').val(data.jump_url);
			}
			setTimeout(function(){
                ue.setContent(data.body);
			}, 300);
		}
	}


	//提交发布
	$("#submit").bind("click", function(event){
		event.preventDefault();

		var t = $(this);
        var id = $.trim($('#id').val());
        var title = $.trim($('#title').val());
        var jump = $('.radio span:eq(1)').hasClass('curr') ? 1 : 0;
        var jump_url = $.trim($('#jump').val());

        if(title == ''){
            $.dialog.alert(langData['siteConfig'][39][0]);//请填写标题
            return false;
        }

        if(jump == 1){
            if(jump_url == ''){
                $.dialog.alert(langData['siteConfig'][44][28]);//请填写跳转链接
                return false;
            }else{
                var reg = /(http:\/\/|https:\/\/)((\w|=|\?|\.|\/|&|-)+)/g;
                var objExp = new RegExp(reg);
                if (objExp.test(jump_url) != true) {
                    $.dialog.alert(langData['siteConfig'][44][29]);//请填写正确的url
                    return false;
                }
            }
        }else{
            ue.sync();
            if(!ue.hasContents()){
                $.dialog.alert(langData['siteConfig'][20][329]);//请输入内容
                return false;
            }
        }

        var content = ue.getContent();

        t.attr('disabled', true).html(langData['siteConfig'][6][35]+'...');//提交中

        $.ajax({
            url: masterDomain + '/include/ajax.php?service=business&action=updateStoreCustomMenu&id='+id+'&title='+title+'&jump='+jump+'&jump_url='+jump_url+'&body='+encodeURIComponent(content),
            type: 'get',
            dataType: 'jsonp',
            success: function(data){
                if(data && data.state == 100){
                    $.dialog({
                        title: langData['siteConfig'][6][39],//保存成功
                        icon: 'success.png',
                        content: langData['siteConfig'][6][39],//保存成功
                        ok: function(){
                            location.href = $('#fabuForm').data('url');
                        }
                    });
                }else{
                    t.removeAttr('disabled').html(langData['siteConfig'][6][118]);//重新提交
                    $.dialog.alert(data.info);
                }
            },
            error: function(){
                t.removeAttr('disabled').html(langData['siteConfig'][6][118]);//重新提交
                $.dialog.alert(langData['siteConfig'][6][203]);//网络错误，请重试
            }
        });

	});


});
