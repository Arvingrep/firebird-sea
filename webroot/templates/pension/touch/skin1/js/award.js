$(function(){
	//居住类型
    var numArr =['机构养老','居家养老','旅居养老'];//自定义数据
    var huxinSelect = new MobileSelect({
        trigger: '.choose_type ',
        title: '',
        wheels: [
            {data: [
                {
                    id:'1',
                    value:'机构养老'
                },
                {
                    id:'2',
                    value:'居家养老'
                },
                {
                    id:'3',
                    value:'旅居养老'
                },
            ]}
            
        ],
        position:[0, 0],
        callback:function(indexArr, data){
            $('#room_type').val(data[0]['value']);
            $('.type_room span').text(data['0']['value']);
            $('#catid').val(data[0]['id']);

            //选择居住类型 更改tip提示
			var i = indexArr[0]+1;
			$(".type_div .type_tip").eq(i).addClass("type_show").siblings().removeClass("type_show");
        }
        ,triggerDisplayData:false,
    });
	
 // 错误提示
    function showMsg(str){
      var o = $(".error");
      o.html('<p>'+str+'</p>').show();
      setTimeout(function(){o.hide()},1000);
    }
	//提交申请
	$('.apply').click(function(){
		var room_type = $('#room_type').val(),  
            f = $(this) ;
        if(f.hasClass("disabled")) return false;

        if (!room_type) {
            showMsg('请选择居住类型'); //请选择居住类型
            return false;
        }

        var form = $("#awardForm"), action = form.attr("action");

		$.ajax({
			url: action,
			data: form.serialize(),
			type: "POST",
			dataType: "json",
			success: function (data) {
				if(data && data.state == 100){
					$('.award_mask').show();
					f.removeClass("disabled").html(langData['siteConfig'][6][63]);
				}else{
					showMsg(data.info);
					f.removeClass("disabled").html(langData['siteConfig'][6][63]);
				}
			},
			error: function(){
				showMsg(langData['siteConfig'][20][183]);
				f.removeClass("disabled").html(langData['siteConfig'][6][63]);
			}
		});

	})




	//弹窗关闭
	$('.award_mask .close_mask').click(function(){
		$('.award_mask').hide();
	})
	$('.award_mask .watch').click(function(){
		location.href = pointurl; //立即查看 链接应为 到后台去看积分
	})


})
