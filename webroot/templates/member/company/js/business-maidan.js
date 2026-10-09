/**
 * 会员中心商家点评
 * by guozi at: 20170328
 */

$(function(){

    $('.closeMaidan').bind('click', function(){
        if(confirm('确认要禁用收款码功能吗？')){
            $('#maidanState1').click().removeAttr('checked');
            $('#saleSel, #fenxiaoSel, #downloadMaidanTemp').hide();
            $('#maidan_state').val(0);
        }
    })

    //无优惠
	$('#maidanState1').bind('click', function(){
        $('#saleSel').hide();
        $('#maidanState3').siblings('small').show();
        $('#maidan_youhui_limit').hide();
        $('#maidan_state').val(1);
        $('#maidan_not_youhui_open').val(0);
        $('#maidan_youhui_open').val(0);
        $('#submit').removeClass('disabled');
        $('#fenxiaoSel, #downloadMaidanTemp').show();
    });

    //整单优惠
	$('#maidanState2').bind('click', function(){
        $('#saleSel').show();
        $('#maidanState3').siblings('small').show();
        $('#maidan_youhui_limit').hide();
        $('#maidan_state').val(1);
        $('#maidan_not_youhui_open').val(0);
        $('#maidan_youhui_open').val(1);
        $('#submit').removeClass('disabled');
        $('#fenxiaoSel, #downloadMaidanTemp').show();
    });

    //部分优惠
    $('#maidanState3').bind('click', function(){
        $('#saleSel').show();
        $(this).siblings('small').hide();
        $('#maidan_youhui_limit').show();
        $('#maidan_state').val(1);
        $('#maidan_not_youhui_open').val(1);
        $('#maidan_youhui_open').val(1);
        $('#submit').removeClass('disabled');
        $('#fenxiaoSel, #downloadMaidanTemp').show();
    });


    var maidan_XfenxiaoFee = $('#maidan_XfenxiaoFee');
    var maidan_fenxiaoFee = $('#maidan_fenxiaoFee');

    maidan_XfenxiaoFee.blur(fxChange);
    maidan_fenxiaoFee.blur(fxChange);

    function fxChange(){
        if(maidan_XfenxiaoFee.val() == 0 && maidan_fenxiaoFee.val() == 0){
            $('#fxFeeTips').html('可分别设置新客首次买单、及该客户后续每次买单时，推荐人可得比例');
        }else{
            $('#fxFeeTips').html('新客首次买单推荐人可得<font color="#3377FF">'+maidan_XfenxiaoFee.val()+'%</font>；<br />后续再进店(老客)每次买单推荐人都将得<font color="#3377FF">'+maidan_fenxiaoFee.val()+'</font>%');
        }
    }
    fxChange();


	$("#serviceFrom").submit(function(e){
		e.preventDefault();
		var form = $(this), t = $("#submit");
        var t = $('#submit');
		t.attr("disabled", true).text(langData['siteConfig'][26][153]);

        $('#maidan_youhui_value').val(parseInt((10-parseFloat($('#maidan_youhui_obj').val())).toFixed(1)*10));

		var url = form.attr("action"), data = form.serialize();
		$.ajax({
			url: url,
			data: data,
			type: 'post',
			dataType: 'json',
			success: function(data){
				if(data && data.state == 100){
					t.text('保存成功');
				}else{
					$.dialog.alert(data.info);
				}
				setTimeout(function(){
					t.attr("disabled", false).text('保存设置');
				},3000)

			},
			error: function(){
				$.dialog.alert(langData['siteConfig'][20][183]);
				t.attr("disabled", false).text('保存设置');
			}
		})
	})
});
