/**
 * 会员中心商家买单设置
 */
$(function(){

    //优惠限制
    $('.saletip').bind('click', function(){
        $('.maidanSalePop .cancel').html('取消');
        $('.maidanSalePop, .maidanSalePopOverlay').show();
        return false;
    });

    //优惠限制取消
    $('.maidanSalePop .cancel').bind('click', function(){
        $('.maidanSalePop, .maidanSalePopOverlay').hide();
        $('.maidanPop').hide();
    });

    //优惠限制确认
    $('.maidanSalePop .sure').bind('click', function(){
        var info = $('.maidanSalePop textarea').val();
        $('.saletip').html(info).hide();
        if(info){
            $('.saletip').attr('style', 'display: inline-block;');
        }
        $('#maidan_youhui_limit').val(info);
        $('.maidanSalePop, .maidanSalePopOverlay').hide();
        $('.maidanPop').hide();
    });

    //是否开启
    $('#maidanState').bind('click', function(){
        $('.maidanPop').show();
    });

    $('.maidanPop .overlay').bind('click', function(){
        $('.maidanPop').hide();
    });

    //选择开启/优惠
    $('.maidan-set li').bind('click', function(){
        var mid = parseInt($(this).data('id'));

        $('.maidan-set li').removeClass('curr');
        $(this).addClass('curr');
        $('#maidanState label, .maidanSalePop').hide();
        $('#fenxiaoSel, .help').show();

        //重置折扣
        $('#saleObj label').show();
        $('.delsale').hide();
        $('#saleObj .setval').html('').show();
        $('#maidan_youhui_value').val(0);

        $('#maidan_state').val(1);

        //无优惠
        if(mid == 1){

            $('#maidanState .setval').html('无优惠').show();
            $('#saleSel, .saletip').hide();
            $('#maidan_youhui_open').val(0);
            $('#maidan_not_youhui_open').val(0);

        //整单优惠
        }else if(mid == 2){

            $('#maidanState .setval').html('整单优惠').show();
            $('#saleSel').show();
            $('.saletip').hide();
            $('#maidan_youhui_open').val(1);
            $('#maidan_not_youhui_open').val(0);

        //部分优惠
        }else if(mid == 3){

            $('.maidanSalePop .cancel').html('跳过');
            $('#maidanState .setval').html('部分优惠').show();
            $('#saleSel, .maidanSalePop').show();
            $('#maidan_youhui_open').val(1);
            $('#maidan_not_youhui_open').val(1);
            return;

        //关闭买单
        }else if(mid == 4){

            $('#saleSel, #fenxiaoSel, .help, .saletip').hide();
            $('#maidanState .setval').html('未开启收款功能').show();
            $('#maidan_youhui_open').val(0);
            $('#maidan_not_youhui_open').val(0);

            $('#maidan_state').val(0);

        }

        $('.maidanPop').hide();

    });

    //删除折扣
    $('#saleSel .delsale').click(function(){
        $('#saleObj label').show();
        $('.delsale').hide();
        $('#saleObj .setval').html('').show();
        $('#maidan_youhui_value').val(0);
    });

    //选择折扣
    $('#saleObj').mobiscroll().number({
        theme: 'ios',
        themeVariant: 'light',
        scale: 1,
        step: 0.1,
        max: 9.9,
        defaultValue: $('#maidan_youhui_value').val() != '' ? ((100-$('#maidan_youhui_value').val())/10) : 9.9,
        units: '折',
        minWidth: 30,
        maxWidth: 100,
		height:40,
		lang:'zh',
		headerText:"设置优惠折扣",
        onSet: function(event){
            if(parseFloat(event.valueText) > 0){
                $('#saleObj label').hide();
                $('.delsale').show();
                $('#saleObj .setval').html(event.valueText).show();
            }else{
                $('#saleObj label').show();
                $('.delsale').hide();
                $('#saleObj .setval').html('').show();
            }
            $('#maidan_youhui_value').val(parseInt((10-parseFloat(event.valueText)).toFixed(1)*10));
        }
    });

    //选择推广比例
    $('#fenxiaoObj .val').focus(function(){
        var t = $(this);
        setTimeout(function(){
            $('#fenxiaoObj').addClass('focus');
            t.addClass('active');
            if(t.text() == '请填写'){
                t.html('');
            }else{
                t.html(t.text().replace('%', ''));
            }
        }, 100)
    });
    $('#fenxiaoObj .val').blur(function(){
        $('#fenxiaoObj').removeClass('focus');
        var value = parseFloat($(this).text());
        if(value && typeof value === 'number' && !isNaN(value)){
            $(this).html(value+'%').addClass('active');
            var did = $(this).data('id');
            $('#maidan_' + did).val(value);
        }else{
            $(this).html('请填写').removeClass('active');
        }
        fxChange();
    });

    var maidan_XfenxiaoFee = $('#maidan_XfenxiaoFee');
    var maidan_fenxiaoFee = $('#maidan_fenxiaoFee');

    function fxChange(){
        if(maidan_XfenxiaoFee.val() == 0 && maidan_fenxiaoFee.val() == 0){
            $('#fxFeeTips').html('可分别设置新客首次买单、及该客户后续每次买单时，推荐人可得比例');
        }else{
            $('#fxFeeTips').html('新客首次买单推荐人可得<font color="#3377FF">'+maidan_XfenxiaoFee.val()+'%</font>；<br />后续再进店(老客)每次买单推荐人都将得<font color="#3377FF">'+maidan_fenxiaoFee.val()+'</font>%');
        }
    }
    fxChange();

    
    //保存
    $('#save').bind('click', function(e){
        e.preventDefault();
        var t = $(this), form = $('#serviceFrom');
        if(t.hasClass('disabled')) return false;

        t.addClass("disabled").html('正在保存...');
		var url = form.attr("action"), data = form.serialize();
		$.ajax({
			url: url,
			data: data,
			type: 'post',
			dataType: 'json',
			success: function(data){
				if(data && data.state == 100){
					t.html('保存成功');
				}else{
					alert(data.info);
				}
				setTimeout(function(){
					t.removeClass("disabled").html('保存设置');
				},1000)

			},
			error: function(){
				alert(langData['siteConfig'][20][183]);
				t.removeClass("disabled").html('保存设置');
			}
		})
    });

});
