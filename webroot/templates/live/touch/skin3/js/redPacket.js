$(function(){

	//验证提示弹出层
	function showTipMsg(msg){
   /* 给出一个浮层弹出框,显示出errorMsg,2秒消失!*/
    /* 弹出层 */
	  $('.protips').html(msg);
		  var scrollTop=$(document).scrollTop();
		  var windowTop=$(window).height();
		  var xtop=windowTop/2+scrollTop;
		  $('.protips').css('display','block');
		  setTimeout(function(){      
			$('.protips').css('display','none');
		  },2000);
	}


    //点击验证
	$('.btn').click(function(){
		var money = $('#money').val();
		var money_number = parseInt($('#money_number').val());

		if(!money){
			errorMsg="总金额不能为空";
	        showTipMsg(errorMsg);return;
		}else if(!money_number){
			errorMsg="红包个数不能为空";
	        showTipMsg(errorMsg);return
		}else if(money_number>100){
			errorMsg="请正确填写红包个数";
	        showTipMsg(errorMsg);return
		}
		var note = $("input[name=note]").val();
		$.ajax({
			url :  '/include/ajax.php?service=live&action=makeHongbao',
			data : {
                liveid : liveid,
                amount : money,
                count : money_number,
                note : note,
                chatid : chatid
			},
			type : 'GET',
			dataType : 'jsonp',
			success : function (data) {
				// data = JSON.parse(data);
				$(".payBeforeLoading").hide()
				if(data.state == 100){
					// window.location.href = data.info;
					if(typeof(data.info) != 'object'){
					location.href = info;
					return false;
				}
				sinfo = data.info;
				service = 'live';
				$('#ordernum').val(sinfo.ordernum);
				$('#action').val('pay');

				$('#pfinal').val('1');
				$("#amout").text(sinfo.order_amount);
				$('.payMask').show();
				$('.payPop').css('transform', 'translateY(0)');

				if (totalBalance * 1 < sinfo.order_amount * 1) {

					$("#moneyinfo").text('余额不足，');

					$('#balance').hide();
				}

				if(monBonus * 1 < sinfo.order_amount * 1  &&  bonus * 1 >= sinfo.order_amount * 1){
					$("#bonusinfo").text('额度不足，');
					$("#bonusinfo").closest('.check-item').addClass('disabled_pay')
				}else if( bonus * 1 < sinfo.order_amount * 1){
					$("#bonusinfo").text('余额不足，');
					$("#bonusinfo").closest('.check-item').addClass('disabled_pay')
				}else{
					$("#bonusinfo").text('');
					$("#bonusinfo").closest('.check-item').removeClass('disabled_pay')
				}
				ordernum = sinfo.ordernum;
				order_amount = sinfo.order_amount;
				var ptime = sinfo.timeout ? sinfo.timeout : 0
				payCutDown('', ptime, sinfo);
				}else{
					if(data.info == '最少金额为1元'){
						alert(data.info);return;
					}
                    location.href = masterDomain + '/login.html';
                }
            }
		})


	});










})