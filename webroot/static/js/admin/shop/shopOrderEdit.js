$(function () {

	var thisURL   = window.location.pathname;
		tmpUPage  = thisURL.split( "/" );
		thisUPage = tmpUPage[ tmpUPage.length-1 ];
		thisPath  = thisURL.split(thisUPage)[0];

    var init = {

		//编辑订单备注
		quickEditAdminLog: function(){

            $.dialog({
                fixed: true,
                title: '编辑订单备注',
                content: $("#adminLogForm").html(),
                width: 560,
                ok: function(){

                    //提交
                    var serialize = self.parent.$(".quick-editForm").serialize();

                    huoniao.operaJson("?dopost=updateAdminLog", serialize, function(data){
                        if(data.state == 100){
                            huoniao.showTip("success", data.info, "auto");
                            setTimeout(function() {
                                location.reload();
                            }, 800);
                        }else if(data.state == 101){
                            alert(data.info);
                            return false;
                        }else{
                            huoniao.showTip("error", data.info, "auto");
                        }
                    });

                },
                cancel: true
            });

		}

		//编辑收货信息
		,quickEditAddress: function(){

            $.dialog({
                fixed: true,
                title: '修改收货信息',
                content: $("#editAddressForm").html(),
                width: 560,
                ok: function(){

                    //提交
                    var serialize = self.parent.$(".quick-editForm").serialize();

                    huoniao.operaJson("?dopost=updateAddress", serialize, function(data){
                        if(data.state == 100){
                            huoniao.showTip("success", data.info, "auto");
                            setTimeout(function() {
                                location.reload();
                            }, 800);
                        }else if(data.state == 101){
                            alert(data.info);
                            return false;
                        }else{
                            huoniao.showTip("error", data.info, "auto");
                        }
                    });

                },
                cancel: true
            });

		}

		//编辑物流信息
		,quickEditExpress: function(){

            $.dialog({
                fixed: true,
                title: '修改物流信息',
                content: $("#editExpressForm").html(),
                width: 560,
                ok: function(){

                    //提交
                    var serialize = self.parent.$(".quick-editForm").serialize();

                    huoniao.operaJson("?dopost=updateExpress", serialize, function(data){
                        if(data.state == 100){
                            huoniao.showTip("success", data.info, "auto");
                            setTimeout(function() {
                                location.reload();
                            }, 800);
                        }else if(data.state == 101){
                            alert(data.info);
                            return false;
                        }else{
                            huoniao.showTip("error", data.info, "auto");
                        }
                    });

                },
                cancel: true
            });

		}

    }
    

	//修改订单备注
	$(".adminLogEdit").bind("click", function(){
		init.quickEditAdminLog();
	});

	//修改收货信息
	$(".editAddress").bind("click", function(){
		init.quickEditAddress();
	});

	//修改物流信息
	$(".editExpress").bind("click", function(){
		init.quickEditExpress();
	});


    //查看位置
    $("#mark").bind("click", function(){
        var t = $(this), lng = t.data("lng"), lat = t.data("lat");

        $.dialog({
			id: "markDitu",
			title: "查看收货地址位置",
			content: 'url:/api/map/mark.php?mod=shop&lnglat='+lat+","+lng+"&city=&onlyshow=1",
			width: 1000,
			height: 600,
			max: true,
			ok: function(){

			},
			cancel: true
		});
    });

	$("input[name='emstype']").bind("click", function(){
		var val = $(this).val();
		if(val == 1){
			$(".ems").hide();
		}else{
			$(".ems").show();
		}
	});

	//头部导航切换
	$("#myTab li").click(function (){
		// console.log(111)
		var index = $(this).index(), type = $(this).find('a').attr("data-type");
		if (!$(this).hasClass("active")) {
			$(this).addClass("active").siblings('li').removeClass('active')
			$(".qswrap .item").addClass('fn-hide');
			$(".qswrap .item:eq(" + index + ")").removeClass('fn-hide');
		}
	})




	//变更分店
	$('#brancheSelect').change(function(){
		var val = $(this).val();
		if(val && confirm('确认要变更吗？')){
			huoniao.showTip("loading", "正在操作，请稍候...");
			$.ajax({
				type: "POST",
				url: "shopOrderEdit.php?dopost=changeBranch",
				data: "id="+$('#id').val()+"&branchid="+val,
				dataType: "json",
				success: function(data){
					if(data.state == 100){
						$.dialog({
							fixed: true,
							title: "变更成功",
							icon: 'success.png',
							content: "变更成功！",
							ok: function(){
								location.reload();
							},
							cancel: false
						});
					}else{
						$.dialog.alert(data.info);
					};
				},
				error: function(msg){
					$.dialog.alert("网络错误，请刷新页面重试！");
				}
			});
		}
	});

	//提交表单
	$("#btnSubmit").bind("click", function(event){
		event.preventDefault();
		var t      = $(this),
			id       = $("#id").val(),
			address  = $("#address").val(),
			people   = $("#people").val(),
			contact  = $("#contact").val(),
			tj       = true;

		if(address == ""){
			$.dialog.alert("请输入街道地址！");
			return false;
		}
		if(people == ""){
			$.dialog.alert("请输入收货人姓名！");
			return false;
		}
		if(contact == ""){
			$.dialog.alert("请输入联系电话！");
			return false;
		}

		if(tj){
			t.attr("disabled", true);
			$.ajax({
				type: "POST",
				url: "shopOrderEdit.php?action="+action,
				data: $(this).parents("form").serialize()+"&submit=" + encodeURI("提交"),
				dataType: "json",
				success: function(data){
					if(data.state == 100){
						$.dialog({
							fixed: true,
							title: "修改成功",
							icon: 'success.png',
							content: "修改成功！",
							ok: function(){
								location.reload();
							},
							cancel: false
						});
					}else{
						$.dialog.alert(data.info);
						t.attr("disabled", false);
					};
				},
				error: function(msg){
					$.dialog.alert("网络错误，请刷新页面重试！");
					t.attr("disabled", false);
				}
			});
		}
	});


// 显示修改价格弹窗
$(".changeOrder").click(function(){
	$('.changeMask').show();
	$('.chpriceAlert').addClass('show');
})

	//关闭修改价格弹窗
	$(".changeMask,.chpriceAlert .chprice_close").click(function(){
		$('.changeMask').hide();
		$('.chpriceAlert').removeClass('show');
	})
	//免运费
  	$('.free').click(function(){
	    var t = $(this);
	    if(!t.hasClass('curr')){
			t.addClass('curr');
			var logistic = $('#logistic').val();
			t.attr('data-price',logistic);
			$('#logistic').val('0.00');
	    }else{
			t.removeClass('curr');
			var logistic = $('#logistic').val();
			if(logistic == 0){
				var nowLog = t.attr('data-price');
				$('#logistic').val(nowLog);
			}
    	}

   		calcPrice();
   	})
    //实时监听
  	$("#totalprice").focus(function(){
      	var tval = $(this).val();
      	if(tval !=""){
        	$('#fakeprice').val(tval)
      	}
  	})
  	$("#logistic").focus(function(){
	    var tval = $(this).val();
	    if(tval !=""){
	        $('#fakelogistic').val(tval)
	    }
  	})

  	//监听运费输入
  	$('#logistic').blur(function(){
	    var logval = $(this).val();
	    var nowLog = $('#fakelogistic').val();
	    if(logval > 0 && $('.free').hasClass('curr')){
	      $('.free').removeClass('curr')
	    }else if(logval == "" || logval == " "){
	      $(this).val(nowLog);
	    }
	    calcPrice();
  	})
 	//修改商品总价
  	$('#totalprice').blur(function(){
	    var oldTot = $('#fakeprice').val();
	    var tval = $(this).val();
	    if(tval == ''){
	      $(this).val(oldTot);
	    }
	    calcgoodPrice(1);
  	})

  	//修改商品总价将均摊至单件商品价格
  	function calcgoodPrice(tr){
	    var ssflag = 0;
	    var oldTot = $('.zongjia').attr('data-totalprice');
	    var nowTot = $('#totalprice').val();
	    var difference = Math.abs(oldTot-nowTot);

	    if(nowTot*1 > oldTot*1){
	      ssflag = 1;
	    }
    	var afterAllprice = 0;
    	if(difference > 0){//总价做了修改
	        $('.goodWrap .goodItem').each(function(){
	          var xdprice = $(this).attr('data-price');
	          var xdRadio = (xdprice/oldTot)*difference;
	          if(ssflag == 1){
	            var afterprice = (xdprice*1 + xdRadio*1).toFixed(2);
	          }else{
	            var afterprice = (xdprice - xdRadio).toFixed(2);
	          }
	          $(this).find('.afterprice').val(afterprice);
	          $(this).find('.inpBox').addClass('active');
              console.log(afterprice)
	          afterAllprice += afterprice*1;

	        })
            
            console.log(afterAllprice);


	      	if(tr){//从修改商品总价处过来的
		        if(afterAllprice > nowTot){//总和 大于修改
		          var cha = afterAllprice-nowTot;
		          var tprice = $('.goodWrap .goodItem:first-child').find('.afterprice').val() - cha;
		          $('.goodWrap .goodItem:first-child').find('.afterprice').val(tprice.toFixed(2));
		        }else if(afterAllprice < nowTot){
		          var cha = nowTot-afterAllprice;
		          var tprice = ($('.goodWrap .goodItem:first-child').find('.afterprice').val())*1 + cha*1;
		          $('.goodWrap .goodItem:first-child').find('.afterprice').val(tprice.toFixed(2));
		        }
	      	}
      		calcPrice();
    	}

  	}
	// 商品未付款时
	$('.goodWrap').delegate('.afterprice','focus',function(){
        $(this).attr('placeholder','');
        $(this).closest('.inpBox').addClass('active');
	});
	//单独修改某件商品价格
	$('.goodWrap').delegate('.afterprice','blur',function(){
        var tval = $(this).val();
        if(tval == ''){
            $(this).closest('.inpBox').removeClass('active');
            $(this).attr('placeholder','修改价格').val($(this).closest('.goodItem').attr('data-price'));
        }
        calctotPrice(1);
	})


	//单独修改某件商品价格 -- 改总价
	function calctotPrice(){
		var afterAllprice = 0;
		$('.goodWrap .goodItem').each(function(){
			var afterprice = $(this).find('.afterprice').val();
			afterAllprice += afterprice*1;
		})
		$('#totalprice').val(afterAllprice.toFixed(2));
		calcPrice();
	}


	function calcPrice(){
		var totalprice = $('#totalprice').val();
		var logPrice = $('#logistic').val();
		totalprice = totalprice*1+logPrice*1;
		$('#priceAll').text(totalprice.toFixed(2));
		// if(logPrice > 0){
		//   $('.chYf').text('(含运费'+echoCurrency('symbol')+logPrice+')');
		// }else{
		//   $('.chYf').text('(免运费)');
		// }

	}


	//确认修改价格
	$('.sureChange').click(function(){
		var btn = $(this);
		if(btn.hasClass('disabled')) return false;
		var priceArr = [];
		$('.goodWrap .goodItem').each(function(){
			var tid = $(this).attr('data-id');
			var afterprice = $(this).find('.afterprice').val()?$(this).find('.afterprice').val():$(this).find('.xdprice').attr('data-price');
			priceArr.push({'id':tid,'price':afterprice});
		})
		var totalprice = $('#priceAll').text();
		var logistic   = $('#logistic').val();
		var orderid = orderNum;
		var data = 'orderid='+orderid+'&totalprice='+totalprice+'&logistic='+logistic+'&goodpricearr='+JSON.stringify(priceArr);
		btn.addClass('disabled');
		$.ajax({
			url: "shopOrderEdit.php?dopost=changePayprice",
			type: 'POST',
			data:data,
			dataType: 'json',
			success: function(data){
					 if(data && data.state == 100){
                        $.dialog({
							fixed: true,
							title: "修改成功",
							icon: 'success.png',
							content: "修改成功！",
							ok: function(){
								huoniao.goTop();
								window.location.reload();
							},
							cancel: false
						});
							// $.dialog.alert('修改成功');
					 }else{
							$.dialog.alert(data.info);
					 }
					 btn.removeClass('disabled');
					 $('.changeMask').hide();
			 $('.chpriceAlert').removeClass('show');
			 // location.reload();
			},
			error: function(){
				$.dialog.alert('网络错误，加载失败！')
				btn.removeClass('disabled');
			}

		})

	})

	// 修改之后的商品价格

	if($(".chpriceAlert").length > 0){
		var product = JSON.parse(productArr);
		var oPrice = 0;  //原价 没减掉积分抵扣的
		var pointPrice = 0 //积分抵扣的钱
		// var all_logistic = 0 ; //总运费
		var toPay_proPrice = 0; //还需要支付商品的价格
		var proHtml = [];
		var changeTotal = '';
        var chYzj = 0;
        console.log(product);
		for(var p = 0; p <product.length; p++){
			var changePrice = '';
			if(goodpricearr && goodpricearr != ''){
				var changeAfterArr = JSON.parse(goodpricearr);
				for(var i = 0; i < changeAfterArr.length; i++ ){
					if(product[p].proid == changeAfterArr[i].id){
						changePrice = changeAfterArr[i].price;
					}
				}
			}

            var _totalPrice = product[p].price * 1 * product[p].count;

            chYzj += _totalPrice;

            changeprice = parseFloat(product[p].changeprice);
            changePrice = changeprice ? changeprice : _totalPrice;

            _totalPrice = changePrice;

			// product[p].balance
			// changeTotal = (changePrice != '' ? changePrice * 1 : product[p].balance * 1) + changeTotal * 1;

			// all_logistic = all_logistic + ( product[p].logistic/product[p].payprice) * product[p].balance; //计算运费
			pointPrice = pointPrice + 1 * product[p].pointprice;
			toPay_proPrice = toPay_proPrice + 1 * product[p].balance
			var payPrice = (1 - product[p].logistic/product[p].payprice) * product[p].balance
			// oPrice = oPrice + 1 * product[p].balance;
            oPrice += _totalPrice;
			proHtml.push('<tr class="goodItem" data-id="'+product[p].proid+'" data-price="'+_totalPrice+'">');
			proHtml.push('	<td>');
			proHtml.push('		<div class="info">');
			proHtml.push('			<a href="'+product[p].proUrl+'" title="'+product[p].product+'" target="_blank" class="pic"><img src="'+product[p].proImg+'" onerror="javascript:this.src=\'/images/404.jpg\';this.onerror=this.src=\'/static/images/good_default.png\';"/></a>');
			proHtml.push('			<div class="txt"><a href="'+product[p].proUrl+'" title="'+product[p].product+'" target="_blank">'+product[p].product+'</a><p>'+(product[p].specation?product[p].specation.split('$$$').join("、"):'')+'</p>');
			proHtml.push('			</div>');
			proHtml.push('		</div>');
			proHtml.push('	</td>');
			proHtml.push('	<td>'+echoCurrency('symbol')+product[p].price+'</td>');
			proHtml.push('	<td>'+product[p].count+'</td>');
			// proHtml.push('	<td class="xdprice" data-price="'+product[p].balance+'">'+echoCurrency('symbol')+keepTwoDecimal(payPrice)+'</td>');
			proHtml.push('	<td><div class="inpBox"><em>'+echoCurrency('symbol')+'</em><input type="text" placeholder="修改价格" class="afterprice" value="'+changePrice+'"></div></td>');
			proHtml.push('</tr>');
		}

		$('.chpriTa tbody').html(proHtml.join(''));
		// $("#priceAll").text(keepTwoDecimal(oPrice));
		$(".chYzj").text(keepTwoDecimal(chYzj+all_logistic*1))
		$("#totalprice").val(changeTotal != '' ? keepTwoDecimal(changeTotal) : keepTwoDecimal(oPrice));  //商品价格（修改过的会显示修改后的价格）
		$(".zongjia").attr('data-totalprice',oPrice)       //需支付的总价
								 .attr('data-ototalprice',oPrice)  //原价总价
		$("#logistic").val(changelogistic == '' ? keepTwoDecimal(all_logistic) : keepTwoDecimal(changelogistic));
        $("#priceAll").text(keepTwoDecimal(oPrice * 1 + all_logistic * 1));
		// if(changelogistic != '' || changeTotal != ''){
		// }
	}

});

function keepTwoDecimal(num) {
	var result = parseFloat(num);
	if (isNaN(result)) {
		console.log('传递参数错误，请检查！');
		return false;
	}
	result = Math.round(num * 100) / 100;
	return result;
};




function countFinalPrice(type){  //type是计算价格的类型  1是修改单个
	var ssflag = 0;
	var oldTot = $('.zongjia').attr('data-totalprice');
  var nowTot = $('#totalprice').val();
  var difference = Math.abs(oldTot-nowTot);
  if(nowTot*1 > oldTot*1){
    ssflag = 1;
  }

	if(difference > 0){
		$(".goodItem").each(function(){

		})
	}
}
