$(function(){

	//验证方法
	var applyUtil ={
		checkNum:function(num, obj){
			num = $.trim(num);
			if(getBytesLength(num) > 9 || getBytesLength(num)<1 || isNaN(num) || parseFloat(num) > 99999) {
				$('#'+obj).siblings('.error_msg').css('visibility', 'visible');
				$('#'+obj).addClass('error_txt');
				return false;
			}
			return true;
		},
		checkLiLv:function(lilv){
			lilv = $.trim(lilv);
			if(isNaN(lilv)||lilv=='' || lilv <= 0 || parseInt(lilv) >= 100) {
				$('#lilv').siblings('.error_msg').css('visibility', 'visible');
				$('#lilv').addClass('error_txt');
				return false;
			}
			return true;
		}
	};


	//统计结果
	function compute_result(){
		var month = parseInt($('#time').text()) * 12;
		//------------ 根据贷款总额计算

		//--  组合型贷款(组合型贷款的计算，只和商业贷款额、和公积金贷款额有关，和按贷款总额计算无关)
		var total_sy = $('#shangdai').val()*10000;
		var total_gjj = $('#gongdai').val()*10000;

		//贷款总额
		var daikuan_total = total_sy + total_gjj;
		$('#total_loan_bx, #total_loan_bj').text(Math.round(daikuan_total*100)/100);

		var lilv_sd = $('#lilv_shang').val()/100;//得到商贷利率
		var lilv_gjj = $('#lilv_gong').val()/100;//得到公积金利率

		$('#loan_month_bx, #loan_month_bj').text(month);

		//1.本金还款
			//月还款
			var first_pay = 0;
			var all_total2 = 0;
			var average_pay_bj = 0;
			poputData = "";
			for(j=0;j<month;j++) {
				//调用函数计算: 本金月还款额
				huankuan = getMonthMoney2(lilv_sd,total_sy,month,j) + getMonthMoney2(lilv_gjj,total_gjj,month,j);
				all_total2 += huankuan;
				if(j == 0)
					first_pay += huankuan;
					average_pay_bj = Math.round(first_pay*100)/100;
				if(j == 1)
					decrease = Math.round((average_pay_bj - huankuan)*100)/100;
				huankuan = Math.round(huankuan*100)/100;
				poputData += '<li><span style="width: '+(huankuan/average_pay_bj*100)+'%;">第'+(j+1)+'期<em>'+huankuan+echoCurrency('short')+'</em></span></li>';
			}
			$('#average_pay_bj').text(average_pay_bj);
			//还款总额
			$('#total_pay_bj').text(Math.round(all_total2*100)/100);
			//支付利息款
			$('#interest_bj').text(Math.round( (all_total2 - daikuan_total) *100)/100);


		//2.本息还款
			//月均还款
			var month_money1 = getMonthMoney1(lilv_sd,total_sy,month) + getMonthMoney1(lilv_gjj,total_gjj,month);//调用函数计算
			$('#average_pay_bx').text(Math.round(month_money1*100)/100);
			//还款总额
			var all_total1 = month_money1 * month;
			$('#total_pay_bx').text(Math.round(all_total1*100)/100);
			//支付利息款
			$('#interest_bx').text(Math.round( (all_total1 - daikuan_total) *100)/100);
	}

	//本金还款的月还款额(参数: 年利率 / 贷款总额 / 贷款总月份 / 贷款当前月0～length-1)
	function getMonthMoney2(lilv,total,month,cur_month){
		var lilv_month = lilv / 12;//月利率
		var benjin_money = total/month;
		return (total - benjin_money * cur_month) * lilv_month + benjin_money;

	}

	//本息还款的月还款额(参数: 年利率/贷款总额/贷款总月份)
	function getMonthMoney1(lilv,total,month){
		var lilv_month = lilv / 12;//月利率
		return total * lilv_month * Math.pow(1 + lilv_month, month) / ( Math.pow(1 + lilv_month, month) -1 );
	}

	//在GBK编码里，除了ASCII字符，其它都占两个字符宽
	function getBytesLength(str) {
		return str.replace(/[^\x00-\xff]/g, 'xx').length;
	};


	//点击计算按钮之后
	$('.subtn').bind("click", function () {
		var shangdai = $("#shangdai").val();
		var gongdai = $("#gongdai").val();
		var lilv_shang = $("#lilv_shang").val();
		var lilv_gong = $("#lilv_gong").val();

		// return false;
		if (!applyUtil.checkNum(shangdai, "shangdai")) {
			return false;
		}
		if (!applyUtil.checkNum(gongdai, "gongdai")) {
			return false;
		}
		if (!applyUtil.checkLiLv(lilv_shang)) {
			return false;
		}
		if (!applyUtil.checkLiLv(lilv_gong)) {
			return false;
		}


		$('input[data-type="number"]').each(function () {
			var $this = $(this);
			$this.removeClass('error_txt');
			$this.siblings('.error_msg').css('visibility', 'hidden');
		});

		compute_result();

		if ($('.result').css('display') === 'none') {
			$('.write').stop().animate({
				'margin-left': '0px'
			}, 300, function () {
				$('.split, .result').fadeIn();
			});
		};

	});


  //清空重填
  $('#reset').click(function () {
    $("#shangdai").val("");
    $("#gongdai").val("");
    $("#lilv_shang").val("4.9");
    $("#lilv_gong").val("3.25");
    $("#time").html("30年（360期）");

    $('input[data-type="number"]').each(function () {
			var $this = $(this);
			$this.removeClass('error_txt');
			$this.siblings('.error_msg').css('visibility', 'hidden');
		});

  });


});
