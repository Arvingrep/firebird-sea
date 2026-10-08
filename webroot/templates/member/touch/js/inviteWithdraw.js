$(function(){
	getlist()
	$(".listBox .tab span").click(function(){
		var t = $(this);

		$(".listBox").removeClass("txShow");
		$(".recordList ul").addClass('fn-hide')
		if(t.index()){
			$(".listBox").addClass("txShow");
			$(".tx_record").removeClass('fn-hide');
		}else{
			$(".yq_record").removeClass('fn-hide');
		}
		t.addClass('curr').siblings('span').removeClass('curr');
		if($(".recordList ul").eq(t.index()).find('li').length==0){
			getlist()
		}
	})

	//点击提现
	$('.tx_btn').bind('click', function(e){
		if(totalCanWithdrawn < moneyRegGivingWithdraw){
			e.preventDefault();
			alert($('.left_amount p').html());
		}
	});

	function getlist(){
		var type = $('.tab .curr').attr('data-type'); //类型
		var page = $('.tab .curr').attr('data-page');  //page
		var isload = $('.tab .curr').attr('data-isload');
		var index = $('.tab .curr').index();
		if(isload =='1') return false;
		$('.tab .curr').attr('data-isload',"1");
		$('.recordList ul').eq(index).find('.loading').remove()
		$('.recordList ul').eq(index).append('<div class="loading">加载中</div>')

		 $.ajax({
		      url: "/include/ajax.php?service=member&action="+(type == 'yq' ? 'inviteLog' : 'withdraw_log&type=2')+"&page="+page+"&pageSize=10",
		      type: "GET",
		      dataType: "json",
		      success: function (data) {
				 if(data.state==100){
					 var list = data.info.list;
					 var html = '';
					 for(var i=0; i<list.length;i++){
						if(type=='yq'){
							 html += `<li>
										<div class="left_box">
											<div class="head_img"><img src="`+list[i].photo+`" onerror="this.src='/static/images/noPhoto_60.jpg'"></div>
											<div class="userinfo">
												<h5>`+list[i].nickname+`</h5>
												<p>`+huoniao.transTimes(list[i].time, 2)+`注册成功，奖励到账</p>
											</div>
										</div>
										<div class="mcount">
											<span>`+list[i].money+`</span>`+echoCurrency('short')+`
										</div>
									</li>`
						}else{
							html += `
								<li><a href="`+list[i].url+`">
									<div class="left_box">
										<div class="userinfo">
											<h5>`+(list[i].state == 0 ? '审核中' : (list[i].state == 1 ? '提现成功' : '审核失败'))+`</h5>
											<p>`+huoniao.transTimes(list[i].tdate, 2)+`</p>
										</div>
									</div>
									<div class="mcount">
										<span>`+list[i].amount+`</span>`+echoCurrency('short')+`
									</div>
								</a></li>
							`
						}
					 }
					$('.recordList ul').eq(index).find('.loading').remove()
					$('.recordList ul').eq(index).append(html);
					page++;
					$('.tab .curr').attr('data-page',page);
					$('.tab .curr').attr('data-isload',"0");
					$('.recordList ul').eq(index).append('<div class="loading">下拉加载更多</div>')
					if(page>data.info.pageInfo.totalPage){
						$('.tab .curr').attr('data-isload',"1");
						$('.recordList ul').eq(index).find('.loading').text('没有更多了')
					}
				}else{
					$('.tab .curr').attr('data-isload',"1");
					$('.recordList ul').eq(index).find('.loading').text(data.info)
				}
			  },

		})
	}

	$(window).scroll(function() {
		var allh = $('body').height();
		var w = $(window).height();
		var scroll = allh - w;
		var isload = Number($('.tab .curr').attr('data-isload'));
		if ($(window).scrollTop() + 100 > scroll && !isload) {
			getlist();
		};
	});



})
