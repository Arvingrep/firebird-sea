var pageVue = new Vue({
    el:"#pcEnsure",
    data:{
        id:id,
        address:'' ,//地址
        options:[],//地址列表
        goodsInfo:{},//商品信息
        num:1,//数量
        allAmount:totalMoney,//总价(保证金)
        maxnum:0, //最大下单数
    },
    mounted(){
        var tt = this;
        // 获取商品信息
        tt.getGoodsDetail(tt.id,type)


        // 获取地址
        tt.getAddressList();


        	//添加地址
            $(".button-add").on("click",function(){
                $(".popCon .tip .left").html(langData['siteConfig'][6][96]);
                $("#bg,.popup").show();
                if($(".adrItem").length == 0){
                    $('.defaultCheck i').addClass('checked disabled');			
                }
            });


            //关闭弹出层
	$(".popup .tip i").on("click",function(){
		$("#bg,.popup").hide();

		//清空表单数据
		$(".popCon input").val("");
		var codeOld = $('.areaCode_wrap li:first-child').data('code');//区号恢复默认值
		$(".areaCode i").text("+"+codeOld);
		$('#areaCode').val(codeOld);
		$(".popCon .error").removeClass("error");
		$('.addrBtn').html('<span style="color:#bbb;">请选择所在地区</span>');
		$('.addrBtn').attr('data-ids','');
		$('.addrBtn').attr('data-id','');
	});


	//新地址表单验证
	var inputVerify = {
		addrid: function(){
			if($(".addrBtn").attr('data-id') == 0 || $(".addrBtn").attr('data-id') == ''){
				$("#selAddr").parents("li").addClass("error");
				return false;
			}else{
				$("#selAddr").parents("li").removeClass("error");

			}
			return true;
		}
		,address: function(){
			var t = $("#address"), val = t.val(), par = t.closest("li");
			if(val.length < 5 || val.length > 60 || /^\d+$/.test(val)){
				par.addClass("error");
				return false;
			}
			return true;
		}
		,person: function(){
			var t = $("#person"), val = t.val(), par = t.closest("li");
			console.log(val)
			if(val.length < 2 || val.length > 15){
				par.addClass("error");
				par.find(".input-tips").show();
				return false;
			}
			return true;
		}
		,mobile: function(){
			var t = $("#mobile"), val = t.val(), par = t.closest("li");
			if(val == ""){
				par.addClass("error");
				par.find(".input-tips").show();
				return false;
			}else{
				par.find(".input-tips").hide();

			}
			return true;
		}
		,tel: function(){
			var t = $("#tel"), val = t.val(), par = t.closest("li");
			if($("#mobile").val() == "" && val == ""){
				par.addClass("error");
				return false;
			}
			return true;
		}

	}


        $(".popCon input").bind("click", function(){
            $(this).closest("li").removeClass("error");
            if($(this).attr("id") == "mobile"){
                $("#tel").closest("li").removeClass("error");
            }
            if($(this).attr("id") == "tel"){
                $("#mobile").closest("li").removeClass("error");
                $("#mobile").closest("li").find(".input-tips").hide();
            }
        });

        $(".popCon input").bind("blur", function(){
            var id = $(this).attr("id");

            if((id == "address" && inputVerify.address()) ||
                (id == "person" && inputVerify.person()) ||
                (id == "mobile" && inputVerify.mobile()) ||
                (id == "tel" && inputVerify.tel()) ){

                $(this).closest("li").removeClass("error");
            }

        });
        //国际手机号获取
        getNationalPhone();
        function getNationalPhone(){
            $.ajax({
                url: masterDomain+"/include/ajax.php?service=siteConfig&action=internationalPhoneSection",
                type: 'get',
                dataType: 'JSONP',
                success: function(data){
                    if(data && data.state == 100){
                    var phoneList = [], list = data.info;
                    for(var i=0; i<list.length; i++){
                            phoneList.push('<li data-cn="'+list[i].name+'" data-code="'+list[i].code+'">'+list[i].name+' +'+list[i].code+'</li>');
                    }
                    $('.areaCode_wrap ul').append(phoneList.join(''));
                    }else{
                    $('.areaCode_wrap ul').html('<div class="loading">暂无数据！</div>');
                    }
                },
                error: function(){
                            $('.areaCode_wrap ul').html('<div class="loading">加载失败！</div>');
                        }

                })
        }
        //显示区号
        $('.areaCode').bind('click', function(){
            var areaWrap =$(this).closest("dd").find('.areaCode_wrap');
            if(areaWrap.is(':visible')){
            areaWrap.fadeOut(300)
            }else{
            areaWrap.fadeIn(300);
            return false;
            }
        });

        //选择区号
        $('.areaCode_wrap').delegate('li', 'click', function(){
            var t = $(this), code = t.attr('data-code');
            var par = t.closest("dd");
            var areaIcode = par.find(".areaCode");
            areaIcode.find('i').html('+' + code);
            $('#areaCode').val(code)
        });

        $('body').bind('click', function(){
            $('.areaCode_wrap').fadeOut(300);
        });

        $('.defaultCheck i').click(function(){
            $(this).toggleClass('checked');
            if($(this).hasClass('checked')){
                $('#setdefault').val('1')
            }else{
                $('#setdefault').val('0')
            }
        })

        //提交新增/修改
	$("#submit").bind("click", function(){


		var t = $(this);
		if(t.hasClass("disabled")) return false;
		var addr = $(".addrBtn").attr("data-id");
        var addrid = 0;
		//验证表单
		if( inputVerify.person() && inputVerify.mobile() && inputVerify.addrid() && inputVerify.address()){
			var data = [];
			data.push('id='+addrid);
			data.push('addrid='+addr);
			data.push('address='+$("#address").val());
			data.push('person='+$("#person").val());
			data.push('mobile='+$("#mobile").val());
			data.push('areaCode='+$("#areaCode").val());
			data.push('lnglat='+$("#lnglat").val());
			data.push('default='+$('#setdefault').val());

			t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");

			$.ajax({
				url: masterDomain+"/include/ajax.php?service=member&action=addressAdd",
				data: data.join("&"),
				type: "POST",
				dataType: "jsonp",
				success: function (data) {
					if(data && data.state == 100){
						tt.getAddressList(data.info)
						//操作成功后关闭浮动层
						$(".popup .tip i").click();

						// $(".part1Con dl").remove();
						// $(".part1Con").prepend('<div class="loading">'+langData['siteConfig'][20][184]+'...</div>');
						// location.reload();

					}else{
						alert(data.info);
						t.removeClass("disabled").html(langData['shop'][5][32]);
					}
				},
				error: function(){
					alert(langData['siteConfig'][20][183]);
					t.removeClass("disabled").html(langData['shop'][5][32]);
				}
			});

		}

	});

    //标注地图
	$("#mark").bind("click", function(){
		$.dialog({
			id: "markDitu",
			title: langData['siteConfig'][6][92]+"<small>（"+langData['siteConfig'][23][102]+"）</small>",   //标注地图位置<small>（请点击/拖动图标到正确的位置，再点击底部确定按钮。）
			content: 'url:'+masterDomain + '/api/map/mark.php?mod=shop&lnglat='+$("#lnglat").val()+"&city="+map_city+"&addr="+$("#address").val(),
			width: 800,
			height: 500,
			max: true,
			ok: function(){
				var doc = $(window.parent.frames["markDitu"].document),
					lng = doc.find("#lng").val(),
					lat = doc.find("#lat").val(),
					addr = doc.find("#addr").val();
				$("#lnglat").val(lng+","+lat);
				if($("#address").val() == ""){
					$("#address").val(addr);
				}
			},
			cancel: true
		});
	});

    },
    computed:{
        
    },
    methods:{
        // 获取地址列表
        getAddressList(){
            var tt = this;
            $.ajax({
                url:'/include/ajax.php?service=member&action=address',
                type:'get',
                dataType:'json',
                success:function(data){
                    if(data.state == 100){
                        if(data.info.list.length > 0){

                            tt.address = data.info.list[0].id;
                            tt.options = data.info.list;
                        }
                    }
                }
            })
        },

        // 获取商品详情
        getGoodsDetail(id,type){
            var tt = this;
            $.ajax({
                url:'/include/ajax.php?service=paimai&action=detail&id='+id,
                type:'get',
                dataType:'json',
                success:function(data){
                    if(data.state == 100){
                        tt.goodsInfo = data.info;
                        console.log(data.info.amount)
                        tt.maxnum = data.info.maxnum;
                        if(type == 'reg'){
                            tt.allAmount = data.info.amount;
                        }
                    }
                }
            })
        },
        // 计算保证金总价
        handleChange(value) {
            var tt = this;
           
            tt.allAmount = tt.goodsInfo.amount * value
        },


        // 报名/下单
        submit(type){
            var tt = this;
            var address = tt.address;

            if(!address){
                alert('请选择收货地址');
                return false;
            }
            
            $.ajax({
                url:'/include/ajax.php?service=paimai&action=deal',
                type:'post',
                data:{
                    id:tt.id,
                    addrid:address,
                    type:type,
                    num:tt.num,
                },
                dataType:'json',
                success:function(data){
                    if(data.state == 100){
                        info = data.info;
                        orderurl = info.orderurl;
                        if(typeof (info) != 'object'){
                            location.href = info;
                            return false;
                        }

                        cutDown = setInterval(function () {
                            $(".payCutDown").html(payCutDown(info.timeout));
                        }, 1000)

                        var datainfo = [];
                        for (var k in info) {
                            datainfo.push(k + '=' + info[k]);
                        }
                        $("#amout").text(info.order_amount);
                        $('.payMask').show();
                        $('.payPop').show();

                        if (usermoney * 1 < info.order_amount * 1) {

                            $("#moneyinfo").text('余额不足，');
                        }

                        if(monBonus * 1 < info.order_amount * 1  &&  bonus * 1 >= info.order_amount * 1){
                            $("#bonusinfo").text('额度不足，可用');
                            $("#bonusinfo").closest('.check-item').addClass('disabled_pay')
                        }else if( bonus * 1 < info.order_amount * 1){
                            $("#bonusinfo").text('余额不足，');
                            $("#bonusinfo").closest('.check-item').addClass('disabled_pay')
                        }else{
                            $("#bonusinfo").text('');
                            $("#bonusinfo").closest('.check-item').removeClass('disabled_pay')
                        }

                        shopordernum  = info.ordernum;
                        order_amount = info.order_amount;

                        $("#ordertype").val('');
                        $("#service").val('paimai');
                        service = 'paimai';
                        var src = masterDomain + '/include/qrPay.php?' + datainfo.join('&');
                        $('#payQr img').attr('src', masterDomain + '/include/qrcode.php?data=' + encodeURIComponent(src));

                    }else{
                        alert(data.info);
                    }
                },
                error:function(){
                    alert('网络错误，请重试！');
                }
            })

        },

    },

    watch:{
        options:function(val){
            console.log(val)
        }
    }
})