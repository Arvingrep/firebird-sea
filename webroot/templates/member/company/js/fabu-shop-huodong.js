var tp_ajax	, sp_ajax , pl_alax ;
var lpage = 0,  ltotalPage = 0, ltotalCount = 0, lload = false ,shopLr = [],choseLr = [];
var currProHuodongArr = []
$(function(){
	$('.main').scroll(function(){
		console.log(111)
		$(".datetimepicker").hide()
	});

	$('#fabuForm .chooseGoods').click(function() {

		$('.mask_pl').show();
		$('.link_pro').show();
		if($('.pro_box').find('.pro_li').size()==0){
			lpage = 1
			get_prolist()
		}

		$('html').addClass('noscroll');
	});
	// 隐藏
	$('.mask_pl,.link_pro .cancel_btn').click(function() {
		$('.mask_pl').hide();
		$('.link_pro').hide();
		$('html').removeClass('noscroll');
	});
	$(".w-form").delegate("#market", "focus", function(){
		var t = $(this), dl = t.closest("dl"), name = t.attr("name"), tip = t.data("title"), hline = t.siblings(".tip-inline");
		if(t.hasClass('disabled')){
			hline.removeClass().addClass("tip-inline focus").html("<s></s>"+tip);
		}else{
			hline.removeClass().addClass("tip-inline success").html("<s></s>"+tip);
		}
		
	});

	$(".w-form").delegate("input[type=text]", "blur", function(){
		var t = $(this), dd = t.closest("dd"),dl = t.closest("dl"), hline = dd.find(".tip-inline");
		var errrTip = t.attr('data-title');
		if(dl.attr("data-required") == 1){
			if($(this).val() !=" " && $(this).val() !=""){
				hline.removeClass().addClass("tip-inline success").html("<s></s>");
			}else{
				hline.removeClass().addClass("tip-inline error").html("<s></s>"+errrTip)
			}
		}
		if(dl.attr("data-required") == 2){//针对后面已给提示语
			if($(this).val() !=" " && $(this).val() !=""){
				hline.removeClass().addClass("tip-inline success").html("<s></s>");
			}else{
				hline.removeClass().addClass("tip-inline").html("<s></s>")
			}
		}
		
	})

	$(".w-form").delegate("input[type=text]", "focus", function(){
		var t = $(this), dl = t.closest("dl"), hline = dl.find(".tip-inline");
		var errrTip = t.attr('data-title');

		if(dl.attr("data-required") == 1){
			if($(this).val() ==" " || $(this).val() ==""){
				hline.removeClass().addClass("tip-inline focus").html("<s></s>"+errrTip)
			}
		}
		

	})

    //触发时间
	$(".commonHdtime").click(function(){
		var timeSpan = $(this).siblings('span');
		timeSpan.click();
	})
	var hdtypeVal = $('#hdtype').val();
	if(hdtypeVal == "tuan"){
		//开始时间
		$(".form_datetime .add-aft").datetimepicker({
			format: 'yyyy-mm-dd hh:ii:ss',
			autoclose: true,
			language: 'ch',
			todayBtn: true,
			minuteStep: 15,
			startDate:new Date(),
			linkField: "startdate",
			onSelect: checktimeChose
		}).on('changeDate',checktimeChose);
		//结束时间
		$(".form_datetime .add-on").datetimepicker({
			format: 'yyyy-mm-dd hh:ii:ss',
			autoclose: true,
			language: 'ch',
			todayBtn: true,
			minuteStep: 15,
			startDate:new Date(),
			linkField: "enddate",
			onSelect: checktimeChose
		}).on('changeDate',checktimeChose);
	}else if(hdtypeVal == "secKill"){
		//开始时间
		$(".form_datetime .add-aft").datetimepicker({
			format: 'yyyy-mm-dd hh:ii:ss',
			autoclose: true,
			language: 'ch',
			todayBtn: true,
			minuteStep: 15,
			startDate:new Date(),
			linkField: "kstime",
			onSelect: checktimeChose
		}).on('changeDate',checktimeChose);
		//结束时间
		$(".form_datetime .add-on").datetimepicker({
			format: 'yyyy-mm-dd hh:ii:ss',
			autoclose: true,
			language: 'ch',
			todayBtn: true,
			minuteStep: 15,
			startDate:new Date(),
			linkField: "ketime",
			onSelect: checktimeChose
		}).on('changeDate',checktimeChose);
	}else if(hdtypeVal == "qianggou"){
		var nowDa = new Date();
		$('#qgstart').click(function(){
			$(".form_datetime .add-aft").click();
		})
		//开始时间
		$(".form_datetime .add-aft").datetimepicker({		
			minView: 2,//设置只显示到月份
			format: 'yyyy-mm-dd',
			linkFormat: 'yyyy-mm-dd',
			autoclose: true,
			language: 'ch',
			todayBtn: true,
			timePicker : false,
			startDate:new Date(),
			linkField: "qgstart",
			onSelect: gotohdDate
		}).on('changeDate',gotohdDate);
		gotohdDate();//整点场数据
		function gotohdDate(ev){
			var choseday = '',chosedayTime;
			if(ev){
              console.log(ev)
				choseday = ev.date.getFullYear().toString() + "-"+ (ev.date.getMonth()+1).toString()+ "-"+ ev.date.getDate().toString();//2021-2-2 年月日格式
				chosedayTime = ((new Date(choseday)).getTime())/1000;//时间戳格式
              	$('#qgChang').val('');
				if($('#qgChang').val()!=""){
                	$('.form_datetime .tip-inline').removeClass().addClass("tip-inline success").html("<s></s>");
                }else{
                	$('.form_datetime .tip-inline').removeClass().addClass("tip-inline error").html("<s></s>请选择场次");
                }
			}else{
				choseday = nowDa.getFullYear().toString() + "-"+ (nowDa.getMonth()+1).toString()+ "-"+ nowDa.getDate().toString();//2021-2-2 年月日格式
				chosedayTime = ((new Date(choseday)).getTime())/1000;//时间戳格式
			}

			if(choseday){

				$.ajax({
					url: "/include/ajax.php?service=shop&action=getConfigtime&huodongtime="+choseday,
					type: "GET",
					dataType: "jsonp",
					async:false,
					success: function (data) {
						if(data.state == 100){
							var list = data.info;
							hourArr = [];
							console.log(list);
							for(var i = 0;i<list.length;i++){

								var hourTxt = '<span>（剩余'+list[i].shengyunum+'个名额）</span>',cla='';
								if(list[i].shengyunum == 0){
									hourTxt = '<span class="red">（本场已满）</span>';
									cla ='nochose';
								}
								if(choseday == '2021-2-15'){
									hourTxt = '<span class="red">（本场已满）</span>';
									cla ='nochose';
								}

								hourArr.push('<p class="'+cla+'"><a href="javascript:;" data-id="'+list[i].changci+'" data-start="'+list[i].ktime+'" data-end="'+list[i].etime+'" data-title="'+list[i].title+'">'+list[i].title+hourTxt+'</a></p>');

							}
							$('.whatTime>div').html(hourArr.join(''));

						}
					}
				});
			}
		}

		//显示整点场
		$('.qianggouHour').click(function(e){
			$('.whatTime').show();
			$(document).click(function(){
				$('.whatTime').hide();
			})
			e.stopPropagation();
		})
		//选择时间
		$('.whatTime').delegate('p','click',function(e){
			if($(this).hasClass('nochose')){
				$.dialog.alert('该场次已满，请重新选择');
				return false;
			}else{
				$(this).addClass('active').siblings('p').removeClass('active');
				var choseHour = $(this).find('a').attr('data-id'),choseStart = $(this).find('a').attr('data-start'),choseEnd = $(this).find('a').attr('data-end'),choseTit = $(this).find('a').attr('data-title');
				
				$('#qgChang').val(choseTit);
				var qgstart = $('#qgstart').val();				
				if(!qgstart){
					var nowMonthDa = (nowDa.getMonth()+1).toString();
					if((nowDa.getMonth()+1).toString() < 10){
						nowMonthDa ="0"+nowMonthDa;
					}
					var nowDayDa = nowDa.getDate().toString();
					if(nowDa.getDate().toString() < 10){
						nowDayDa ="0"+nowDayDa;
					}
					qgstart = nowDa.getFullYear().toString() + "-"+ nowMonthDa+ "-"+ nowDayDa;
					$('#qgstart').val(qgstart);
				}
				$('#changci').val(choseHour);//传到后台
              	var ss = $('#qgstart').val();
                $('#startdate').val(ss+' '+choseStart+':00');//
                $('#enddate').val(ss+' '+choseEnd+':00');              
                $('.whatTime').hide();
                if($('#qgstart').val()!=""){
                	$('.form_datetime .tip-inline').removeClass().addClass("tip-inline success").html("<s></s>");
                }else{
                	$('.form_datetime .tip-inline').removeClass().addClass("tip-inline error").html("<s></s>请选择开始时间");
                }

			}
			e.stopPropagation();
		})
	}else if(hdtypeVal == "bargain"){//砍价
		//开始时间
		$(".form_datetime .add-aft").datetimepicker({
			format: 'yyyy-mm-dd hh:ii:ss',
			autoclose: true,
			language: 'ch',
			todayBtn: true,
			minuteStep: 15,
			startDate:new Date(),
			linkField: "kanstime",
			onSelect: checktimeChose
		}).on('changeDate',checktimeChose);
		//结束时间
		$(".form_datetime .add-on").datetimepicker({
			format: 'yyyy-mm-dd hh:ii:ss',
			autoclose: true,
			language: 'ch',
			todayBtn: true,
			minuteStep: 15,
			startDate:new Date(),
			linkField: "kanetime",
			onSelect: checktimeChose
		}).on('changeDate',checktimeChose);
		//砍价规则
		$("#setBarule span").bind("click", function(){
			console.log(111)
			var t = $(this), chid = t.data("id");
			console.log(chid)
			if(chid == 1){//自由设置
				console.log($('#goodsId').val())
				if($('#goodsId').val() == ''){
					$.dialog.alert('请先选择商品');
					return false;
	            }else if($('#hdprice').val() == ''){
	                $.dialog.alert('请输入底价');//请输入底价
	                return false;
	            }else if(($('#hdprice').val())*1 > ($('#marketVal').val())*1){
	                $.dialog.alert('底价不得高于原价');//底价不得高于原价
	                return false;
	            }
	            if($('#allnum').val() == ''){
	                $.dialog.alert('请输入需砍总次数');//请输入需砍总次数
	                return false;
	            }
	            inputChange();
	            $('#bargain1').removeClass('fn-hide');
	            $('#bargain0').addClass('fn-hide');
	        }else{
	            $('#bargain0').removeClass('fn-hide');
	            $('#bargain1').addClass('fn-hide');
	        }
	        $('#bargainrule').val(chid);

		});
		function inputChange(){     
	        var spar = $('.kanWrap li:last-child');
	        var endInput = spar.find('.endKan');
	        var priceInput = spar.find('.priceKan');
	        var oval = $('#marketVal').val();//原价
	        var dval = $('#hdprice').val();//底价
	        var siVal = spar.find('.kanspan').text();
	        //砍至刀数监听
	        endInput.blur(function(){
	            var allnum =$('#allnum').val();//总次数
	            var liLen = $('.kanWrap li').length;
	            var tval = $(this).val();
	            //下一条数据
	            if(liLen > 1){
	                var nextLi = $(this).closest('li').next('li'),
	                    nextKanInput = nextLi.find('.endKan'),
	                    nextKan = nextKanInput.val(),              
	                    nextSpan = nextLi.find('.kanspan'),
	                    nextSpanTxt = nextSpan.text();

	            }

	            if(tval==''){             
	                $.dialog.alert('请输入砍至刀数');//请输入砍至刀数 
	            }else if(tval*1 < siVal*1){
	                $(this).val("");
	                $.dialog.alert('请按顺序输入砍至刀数');//请按顺序输入砍至刀数
	            }else if(tval*1 > allnum*1){
	                $(this).val(allnum);
	                $.dialog.alert('已超过需砍总次数');//已超过需砍总次数
	            // }else if(tval*1 >= nextSpanTxt*1 && liLen > 1){//大于后面一条的一刀
	            }else if( liLen > 1){//大于后面一条的一刀
	                nextSpan.text(tval*1 +1);
	                setTimeout(function(){
	                    if(nextKan*1 < (nextSpan.text())*1){
	                        //nextKanInput.focus();
	                        $.dialog.alert('请按顺序输入砍至刀数');//请按顺序输入砍至刀数 
	                    }
	                },100)
	                
	            }
	       
	        })
	        //砍至价格
	        priceInput.blur(function(){
	            var allnum =$('#allnum').val();//总次数
	            var tval = $(this).val();
	            var endInputVal = endInput.val();
	            var liLen = $('.kanWrap li').length;
	            //前一条数据
	            var prevPrice = 0,nextPrice = 0;
	            if(liLen == 1){
	                prevPrice =  $('.kanWrap li').eq(0).find('.priceKan').val();         
	            }else{
	                prevPrice = $(this).closest('li').prev('li').find('.priceKan').val();
	            }
	            //下一条数据
	            if(liLen > 1){
	                var nextLi = $(this).closest('li').next('li');
	                nextPrice = nextLi.find('.priceKan').val();
	                var nextInput = nextLi.find('.priceKan');
	            }

	            if(tval==''){              
	                $.dialog.alert('请输入砍至价格');//请输入砍至价格 
	            }else if(tval*1 > oval*1){
	                $(this).val('');
	                $.dialog.alert('不得超过原价');//不得超过原价
	            }else if(tval*1 < dval*1){
	                $(this).val('');
	                $.dialog.alert('不得低于底价');//不得低于底价
	            }else if(tval*1 <= nextPrice*1 && liLen > 1){//小于后一条数据 -- 则修改后一条  
	                if(tval*1 == dval*1){
	                    $(this).val('');
	                    $.dialog.alert('需最后一刀才可砍至底价');//需最后一刀才可砍至底价
	                }else{
	                    //nextInput.focus();
	                    $.dialog.alert('请按顺序输入砍至价格');//请按顺序输入砍至价格 
	                }               

	            }else if(tval*1 >=prevPrice*1 && liLen > 1){//大于前一条数据  

	                $(this).val('');
	                $.dialog.alert('请按顺序输入砍至价格');//请按顺序输入砍至价格

	            }else if(tval*1 == dval*1 && endInputVal*1 < allnum){
	                $(this).val('');
	                $.dialog.alert('需最后一刀才可砍至底价');//需最后一刀才可砍至底价
	            }else if(endInputVal*1 == allnum && tval*1 > dval*1 ){
	                $(this).val(dval);
	                $.dialog.alert('最后一刀为底价');//最后一刀为底价
	            }           
	        })

	    }
	    

	    //添加区间
	    $('.addKan a').click(function(){
	        var allnum =$('#allnum').val();//总次数
	        var liLen = $('.kanWrap li').length;
	        var par = $('.kanWrap li:last-child');
	        var endKanValue = par.find('.endKan').val();
	        var priceKanValue = par.find('.priceKan').val();
	        var stKanValue = par.find('.kanspan').text();
	        //判断第一刀数据
	        var oval = $('#marketVal').val();//原价
	        var dval = $('#hdprice').val();//底价       
	        var firstPrice =  $('.kanWrap li').eq(0).find('.priceKan').val();
	        //倒数第二条数据
	        var secondPrice = 0;
	        if(liLen == 1){
	            secondPrice =  $('.kanWrap li').eq(0).find('.priceKan').val();         
	        }else{
	            secondPrice = $('.kanWrap li').eq(-2).find('.priceKan').val();
	        }
	        
	        if(!endKanValue){
	            $.dialog.alert('请输入砍至刀数');//请输入砍至刀数
	        }else if(endKanValue*1 < stKanValue*1){	            
	            $.dialog.alert('请按顺序输入砍至刀数');//请按顺序输入砍至刀数
	        }else if(endKanValue*1 > allnum){
	            par.find('.endKan').val(allnum);
	            $.dialog.alert('已超过需砍总次数');//已超过需砍总次数
	        }else if(!priceKanValue){
	   
	            $.dialog.alert('请输入砍至价格');//请输入砍至价格
	        }else if(firstPrice*1 > oval*1 && liLen == 1){
	   
	            $.dialog.alert('不得超过原价');//不得超过原价
	        }else if(priceKanValue*1 < dval*1){
	   
	            $.dialog.alert('不得低于底价');//不得低于底价
	        }else if(priceKanValue*1 >=secondPrice*1 && liLen > 1){
	   
	            $.dialog.alert('请按顺序输入砍至价格');//请按顺序输入砍至价格
	        }else if(priceKanValue*1 == dval*1 && endKanValue*1 < allnum){
	   
	            $.dialog.alert('需最后一刀才可砍至底价');//需最后一刀才可砍至底价
	        }else if(endKanValue*1 == allnum){
	            if(priceKanValue*1 > dval*1){
	                par.find('.priceKan').val(dval);
	                $.dialog.alert('最后一刀为底价');//最后一刀为底价 
	            }else{
	                $.dialog.alert('已到达需砍总次数');//已到达需砍总次数 
	            }
	           
	        }else{

	            var kanHtml = [];
	            kanHtml.push('<li>');
	            kanHtml.push('<div class="beforeDao">');
	            kanHtml.push('<input type="hidden" class="startKan" name="kan[start][]" value="'+(endKanValue*1+1)+'">');
	            kanHtml.push('<span class="kanspan">'+(endKanValue*1+1)+'</span><span class="dao">刀</span>');
	            kanHtml.push('</div>');
	            kanHtml.push('<em class="zhi">至</em>');
	            kanHtml.push('<div class="endP input-append"><input type="text" class="endKan" name="kan[end][]" onkeyup="zhengshu(this)"><span class="add-aft">刀</span></div>');

	            kanHtml.push('<em class="zhi">砍至</em>');
	            kanHtml.push('<div class="priceP input-append"><input type="text" class="priceKan" name="kan[price][]" onkeyup="xiaoshu(this)"><span class="add-aft">'+echoCurrency('short')+'</span></div>');
	            kanHtml.push('</li>');
	            $('.kanWrap ul').append(kanHtml.join(''));
	            $('.kanWrap .deleteKan').show();
	            inputChange();
	        }

	        
	    })
	    //删除砍刀规则
	    $('.kanWrap .deleteKan').click(function(){
	        if($('.kanWrap li').length >= 2){
	            if($('.kanWrap li').length == 2){
	                $(this).hide();
	            }
	            $('.kanWrap li:last-child').remove();   
	        }
	        
	    })

	    //自由设置-- 查看示例
	    $('.bargaintip a').click(function(){
	        $('.commask').show();
	        $('.bargainAlert').addClass('show');
	    })
	    //取消
	    $('.bargainAlert a.closeBargain,.commask').click(function(){
	        $('.commask').hide();
	        $('.bargainAlert').removeClass('show');
	    })

	}
	//验证开始时间 结束时间
	function checktimeChose(ev){
		if(ev){
			console.log(ev);
			console.log(currProHuodongArr);
			var timeType = 0; //0表示开始时间， 1表示结束时间
			if($(ev.target).hasClass('add-aft')){ //开始时间
				timeType = 0
			}else{//结束时间
				timeType = 1
			}
			// var choseTime = parseInt(ev.timeStamp / 1000);
			var choseTime = parseInt(Math.round(ev.date)/1000);

			
			if($('.startTime').val() == ""){
            	$('.form_datetime .tip-inline').removeClass().addClass("tip-inline error").html("<s></s>请选择开始时间");
            }else if($('.endTime').val() == ""){
            	$('.form_datetime .tip-inline').removeClass().addClass("tip-inline error").html("<s></s>请选择结束时间");
            }else if(new Date($('.startTime').val()) >= new Date($('.endTime').val())){
				$('.form_datetime .tip-inline').removeClass().addClass("tip-inline error").html("<s></s>请重新选择结束时间");
			}else{
            	$('.form_datetime .tip-inline').removeClass().addClass("tip-inline success").html("<s></s>");
            }

            currProHuodongArr.forEach(function(val,index){
				var inner = choseTime > val.ktime && choseTime < val.etime; //在活动期间
				if(inner){
					$.dialog.alert('该商品此时间段内已参加活动，请重选其他时间');
					if(timeType){
						$('.endTime').val('')
					}else{
						$('.startTime').val('')
					}
					
				};


				if(timeType == 1){
					var start = Math.round(new Date($('.startTime').val()) / 1000);
					if(start <= val.ktime && choseTime >= val.etime){
						$.dialog.alert('该商品此时间段内已参加活动，请重选其他时间')
					}
				}

			})

        }
    }



	//活动 时间
    function DateAdd(stype,number, date) {
        switch (stype) {
            case "d": {
                date.setDate(date.getDate() + number);
                return date;
                break;
            }
            case "h": {
                date.setHours(date.getHours() + number);
                return date;
                break;
            }
            default: {
                date.setDate(date.getDate() + number);
                return date;
                break;
            }
        }        
    } 
    var moreSkuFlag = false;//判断是否选了多规格
	// 选择关联商品
	$('.pro_box').delegate('.pro_li', 'click', function() {
		var t = $(this),tid = t.attr('data-id');
		var promotype = t.attr('data-promotype');
		proType = promotype === '1' ? 1 : 0;
		$('#goodsId').val(tid);
		if (!t.hasClass('chosed')) {
			t.addClass('chosed').siblings('.pro_li').removeClass('chosed');
		}
		$('#fakeInp').hide();
		
		$('.mask_pl').hide();
		$('.link_pro').hide();
		$('html').removeClass('noscroll');
		choseLr=[];
		for(var s = 0;s<shopLr.length;s++){
			if(shopLr[s].id == tid){
				choseLr.push(shopLr[s]);
			}
		}
		var html = [],specHtml = [];
		var slitpic = choseLr[0].litpic == "" ? staticPath+'images/404.jpg' : choseLr[0].litpic;
		var stitle = choseLr[0].title,
			skuArr = choseLr[0].specificationArr,			
			smprice = choseLr[0].mprice;
			// skuList = choseLr[0].specifiList;//详情页有此数据 列表没有 待改接口
			skuList = choseLr[0].specification;//详情页有此数据 列表没有 待改接口
		// var skuList = "custom_1_粉色-19-2,328.00#200.00#20|custom_1_粉色-19-3,328.00#200.00#20|custom_1_粉色-19-4,328.00#200.00#20|custom_1_粉色-20-2,328.00#200.00#20|custom_1_粉色-20-3,328.00#200.00#20|custom_1_粉色-20-4,328.00#200.00#20|custom_1_none白-19-2,328.00#200.00#20|custom_1_none白-19-3,328.00#200.00#20|custom_1_none白-19-4,328.00#200.00#20|custom_1_none白-20-2,328.00#200.00#20|custom_1_none白-20-3,328.00#200.00#19|custom_1_none白-20-4,328.00#200.00#19|7-19-2,328.00#200.00#19|7-19-3,328.00#200.00#20|7-19-4,328.00#200.00#20|7-20-2,328.00#200.00#20|7-20-3,328.00#200.00#20|7-20-4,328.00#200.00#20|12-19-2,328.00#200.00#20|12-19-3,328.00#200.00#20|12-19-4,328.00#200.00#20|12-20-2,328.00#200.00#20|12-20-3,328.00#200.00#20|12-20-4,328.00#200.00#18";
        html.push('<div class="goodImg"><img src="'+slitpic+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/404.jpg\';"></div>');
        html.push('<div class="goodInfo">');
        html.push('<h4>'+stitle+'</h4>');
        html.push('</div>');
        $('.goodsCon').html(html.join(""));
        $('.chooseGoods').html('重新选择');
		var hdType = $('#hdtype').val();//活动类型
		if(choseLr[0].huodongarre && choseLr[0].huodongarre.length > 0){
			currProHuodongArr = choseLr[0].huodongarre;
		}else{
            currProHuodongArr = [];
        }
        //数据填充       
        if(skuArr.length > 0){
        	$('.pinTop').hide();
        	$('.yuanLi,.kucun').hide();
        	moreSkuFlag = true;
            createSpecifi(skuArr,skuList,hdType);

        }else{
        	moreSkuFlag = false;
            //原价
            $('#market').removeClass('disabled');
            $('#market').val(echoCurrency('symbol')+smprice);
            $('#market').siblings(".tip-inline").removeClass().addClass("tip-inline success").html('<s></s>');
            $('#marketVal').val(smprice); 
            $('.pinTop,.pintuanPrice').show();
            $('.pinBot').hide();
            $('.yuanLi,.kucun').show();
            //抢购 拼团 秒杀 砍价--活动价           
			var hdpriTip = $('#hdprice').attr('data-title');           
            $('.pinTop').find(".tip-inline").html('<s></s>'+hdpriTip);

        }
        $('#goodsId').siblings(".tip-inline").removeClass().addClass("tip-inline success").html('<s></s>');
        $('#goodtitle').val(stitle)
        $('#litpic').val(slitpic)//页面需要litpicSource


	});
	// 批量输入
	$("#speList").delegate(".pl_fill .text_tip","click",function(){
		var t = $(this);
		t.hide();
		t.siblings("input").show().focus();
	});

	$("#speList").on("blur",".pl_fill input",function(){
		var t = $(this);
		if(t.val()==''){
			t.hide();
			t.siblings(".text_tip").show().focus();
		}
	});

	$("#speList").on("keyup",".pl_fill input",function(){
		var t = $(this),name = t.attr("name");
		var val = t.val();
		if(name=='pl_price1'||name=='pl_price2'){
			var nowval = val.replace(/[^\d\.]/g,'')
			t.val(nowval)
		}else if(name=='pl_kc'){
			var nowval = val.replace(/\D/g,'')
			t.val(nowval)
		}
	});
	$("#speList").on("blur",".pl_fill input",function(){
		var t = $(this),name = t.attr("name");
		var val = t.val();
		if((name=='pl_price1'||name=='pl_price2') && val!=''){
			var nowval = val.replace(/[^\d\.]/g,'')*1
			t.val(nowval.toFixed(2))
		}
	});

	$("#speList").on("keyup","td input",function(){
		var t = $(this),name = t.attr("data-type");
		var val = t.val();
		if(name=='mprice'||name=='price'){
			var nowval = val.replace(/[^\d\.]/g,'')
			t.val(nowval)
		}else if(name=='inventory'){
			var nowval = val.replace(/\D/g,'')
			t.val(nowval)
		}
	});
	$("#speList").on("blur","input",function(){
		var t = $(this),name = t.attr("data-type");
		var val = t.val();
		if((name=='mprice'||name=='price') && val!=''){
			var nowval = val.replace(/[^\d\.]/g,'')*1
			t.val(nowval.toFixed(2))
		}
	})
	$(".piliang").click(function(){
		//var inventory = 0;
		$(".pl_fill").each(function(){
			var t = $(this),p = t.parent('th');
			var index = p.index();
			if(t.find("input").val()!='' && t.find("input").val()!=undefined){
				$(".speTab table tr").each(function(){
					var m = $(this).find('td').eq(index);
					m.find('input').val(t.find("input").val());
					// if(m.find('input').attr("data-type")=="inventory"){
					// 	inventory = inventory + Number(m.find('input').val());
					// }
				});
				t.find("input").val('').hide();
				t.find(".text_tip").show()
			}
		});

	})
  if(hdtypeVal !='bargain'){
    var fspecifiVal = JSON.parse(specifiVal);
	if(fspecifiVal.length > 0){
		createSpecifi(eskuArr,eskuList,hdtypeVal);
	}
  }
	
	//规格填充
	function createSpecifi(sskuArr,sskuList,hdleix){//hdleix 活动类型 由来修改th
		var hdtxt ='';
		if(hdleix == 'tuan'){
			hdtxt = '拼购价'
		}else if(hdleix == 'secKill'){
			hdtxt = '秒杀价'
		}else if(hdleix == 'qianggou'){
			hdtxt = '抢购价'
		}
		//thead
		if(proType == 1){

			var thid = [], thtitle = [], th1 = [],
				th2 = '<th>套餐名称</th>'+
				'<th>'+langData['waimai'][5][23]+'</th>'+
				'<th><div class="pl_fill"><div class="text_tip">'+hdtxt+'<font color="#f00">*</font></div><input type="text" name="pl_price2"/></div></th>'+
				'<th><div class="pl_fill"><div class="text_tip">活动库存<font color="#f00">*</font></div><input type="text" name="pl_kc"/></div></th>';//原价----库存
			if(typeof(sskuArr) == 'string'){
				sskuArr = JSON.parse(sskuArr);
			}
		}else{
			var thid = [], thtitle = [], th1 = [],
				th2 = '<th>'+langData['waimai'][5][23]+'</th>'+
				'<th><div class="pl_fill"><div class="text_tip">'+hdtxt+'<font color="#f00">*</font></div><input type="text" name="pl_price2"/></div></th>'+
				'<th><div class="pl_fill"><div class="text_tip">活动库存<font color="#f00">*</font></div><input type="text" name="pl_kc"/></div></th>';//原价----库存
			if(typeof(sskuArr) == 'string'){
				sskuArr = JSON.parse(sskuArr);
			}
			for(var i = 0; i < sskuArr.length; i++){
				th1.push('<th>'+sskuArr[i].typename+'</th>');
			}

			th1 = th1.join('')

			
		}
		$("#speList thead").html(th1+th2);

		createTbody(sskuList,sskuArr);

	}

	//输出规格内容
	function createTbody(fth,ftharr){
		var cunArr = [],priceArr = [],priceArr2 = [];		
		var tr = [], inventory = 0;
		if(typeof(fth) == 'string'){

			fth = JSON.parse(fth);
		}
		console.log(fth)
      ftharr.forEach(function(item,index){
        if(item.itemtype == '0'){//原有规格
          item.item.forEach(function(opt){
            tr.push('<input type="hidden" name="spe'+item.id+'[]" value="'+opt.id+'">')
          })
        }else{//自定义规格
          item.item.forEach(function(opt){
            tr.push('<input type="hidden" name="speNew['+item.id+'][]" value="'+opt.id+'">')
          })
        }
      });
		for(var i = 0; i < fth.length; i++){
			var  id = [], val = [],txtArr = [],arrTo = [],arrColor = [];
			id = Array.isArray(fth[i].spe) ? fth[i].spe : fth[i].spe.split(',');
			ftharr.forEach(function(item,index){
                item.item.forEach(function(opt){
                    if(id.includes(opt.id)){
                        var nowOpt = opt.name
                        val.push(nowOpt);
                    }
                });
            
            });
			if(id.length > 0){
				tr.push('<tr>');

				var name = [];
				for(var k = 0; k < id.length; k++){
					if(val[k]){
						if(proType != 1){
							tr.push('<td>'+val[k]+'</td>');
						}else{
							tr.push('<td>'+val[k]+'</td>');
						}
						
					}
					name.push(id[k]);
				}

				var price = $("#price").val();
				var mprice = $("#mprice").val();
				// if(priceArr.length > 0 && priceArr.length > i){
				// 	value = priceArr[i].split("#");
				// 	mprice = value[0];
				// }
				mprice = fth[i].price[1];
				// price = fth[i].price;
              var f_inventory = "",f_price ="";
                          
              if(fspecifiVal.length > 0){
              	mprice = fspecifiVal[i].price[0];
                f_price = fspecifiVal[i].price[1];
                f_inventory = fspecifiVal[i].price[2];


              } 
            // if(proType == 1){

            // 	tr.push('<td>'+name[0]+'</td>')
            // }
			tr.push('<td><input class="inp moreSku_hdmprice" type="text" id="hd_mprice_'+fth[i].id+'" name="hd_mprice_'+fth[i].id+'" readonly data-type="mprice" value="'+mprice+'" /></td>');
			tr.push('<td><input class="inp moreSku_hdprice" type="text" id="hd_price_'+fth[i].id+'" name="hd_price_'+fth[i].id+'" data-type="price"  value="'+f_price+'"/></td>');
			tr.push('<td><input class="inp moreSku_hdinventory" type="text" id="hd_inventory_'+fth[i].id+'" name="hd_inventory_'+fth[i].id+'" data-type="inventory" value="'+f_inventory+'"/></td>');
			tr.push('</tr>');
			}
		}
		$("#speList tbody").html(tr.join(""));
		$("#speList").show();  //多规格显示，库存隐藏
		$(".kucun").hide();
		$('.pinBot').show();
		$('.pinTop').hide();

		//合并相同单元格
		// var th = $("#speList thead th");
		// for (var i = 0; i < th.length-3; i++) {
		// 	huoniao.rowspan($("#speList"), i);
		// };
		var th = $("#speList thead th");
		for (var i = 0; i < th.length; i++) {
			huoniao.rowspan($("#speList"), i);
		};
		
	}

	// 到底加载
	$('.pro_box ul').scroll(function(){
		var type = $('.pro_box>ul').attr('data-type');
		if ($('.pro_box').scrollTop() >= $('.pro_box>ul').height() - $('.pro_box').height() - 80 && !lload && lpage < ltotalPage)
		{
			lpage++;
			get_prolist();
		}
	});
	// 搜索
	$('#search_pro').bind('input propertychange',function(){
		var t = $(this);
		lpage = 1 ;
		get_prolist();
	});

	//提交发布
	$("#submit").bind("click", function(event){
		event.preventDefault();

		var t= $(this);
		var goodsId  	 = $('#goodsId').val(),
		    hdtype  	 = $('#hdtype').val(),//活动类型
			market   	 = $('#market').val(),//原价--无规格
		    hdprice  	 = $('#hdprice').val(),//活动价 -- 无规格
		    hdinventory  = $('#hdinventory').val(),//活动库存 -- 无规格
		    startTime  = $('.startTime').val(),//活动开始时间
		    endTime  = $('.endTime').val(),//活动结束时间
		    qgChang  = $('#qgChang').val(),//抢购--整点
		    xianNum  = $('#maxnum').val(),//限购数量
		    pinpeople  = $('#pinpeople').val(),//团购--人数
		    pintime  = $('#pintime').val(),//团购--时长
		    allnum  = $('#allnum').val(),//砍价--总次数
			form = $("#fabuForm"),
			action = form.attr("action"),
			url 	= form.attr("data-url"),
		    
		    market   = $('#market').val();
		if(t.hasClass("disabled")) return;

		var offsetTop = 0;
		if(goodsId == ""){//商品
			var hline = $('#goodsId').next(".tip-inline"), tips = $('#goodsId').data("title");
			hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
			offsetTop = $(".chooseGoods").position().top;
		}
		if(!moreSkuFlag && market == ""){//原价--无规格
			
			var hline = $('#market').siblings(".tip-inline"), tips = $('#market').data("title");
			hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
			offsetTop = $("#market").position().top;
		}
		if(!moreSkuFlag && hdprice == ""){//活动价--无规格
			var pardl = $('#hdprice').closest('dl');
			var hline = pardl.find(".tip-inline"), tips = $('#hdprice').data("title");
			if(goodsId == ""){
				tips = "请先选择商品";
			}
			hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
			offsetTop = $("#hdprice").position().top;
		}
		if(!moreSkuFlag && hdinventory == ""){//活动库存--无规格
			var pardl = $('#hdinventory').closest('dl');
			var hline = pardl.find(".tip-inline"), tips = $('#hdinventory').data("title");
			hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
			offsetTop = $("#hdinventory").position().top;
		}
		if(hdtype != "qianggou"){
			var hline = $('.form_datetime').find(".tip-inline");
			if(startTime == ""){			
				hline.removeClass().addClass("tip-inline error").html("<s></s>请选择开始时间");
				offsetTop = $(".form_datetime").position().top;
			}else if(endTime == ""){			
				hline.removeClass().addClass("tip-inline error").html("<s></s>请选择结束时间");
				offsetTop = $(".form_datetime").position().top;
			}else{
				
				hline.removeClass().addClass("tip-inline success").html("<s></s>");
				
			}
		}else{//抢购为整点场
			var hline = $('.form_datetime').find(".tip-inline");
			if(startTime == ""){			
				hline.removeClass().addClass("tip-inline error").html("<s></s>请选择开始时间");
				offsetTop = $(".form_datetime").position().top;
			}else if(qgChang == ""){			
				hline.removeClass().addClass("tip-inline error").html("<s></s>请选择场次");
				offsetTop = $(".form_datetime").position().top;
			}else{
				hline.removeClass().addClass("tip-inline success").html("<s></s>");
			}
		}

		if(xianNum == ""){//限购数量
			var pardl = $('#maxnum').closest('dl');
			var hline = pardl.find(".tip-inline"), tips = $('#maxnum').data("title");
			hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
			offsetTop = $("#maxnum").position().top;
		}
		if(hdtype == 'tuan'){//团购专属验证
			if(pinpeople == ""){//团购--人数
				var pardl = $('#pinpeople').closest('dl');
				var hline = pardl.find(".tip-inline"), tips = $('#pinpeople').data("title");
				hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
				offsetTop = $("#pinpeople").position().top;
			}else if(pinpeople <= 1){
				$.dialog.alert('活动人数必须大于2人');
			}
			if(pintime == ""){//团购--时长
				var pardl = $('#pintime').closest('dl');
				var hline = pardl.find(".tip-inline"), tips = $('#pintime').data("title");
				hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
				offsetTop = $("#pintime").position().top;
			}
		}

		if(hdtype == 'bargain'){//砍价专属验证
			if(allnum == ""){//团购--人数
				var pardl = $('#allnum').closest('dl');
				var hline = pardl.find(".tip-inline"), tips = $('#allnum').data("title");
				hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
				offsetTop = $("#allnum").position().top;
			}
			var tj = true;
			if($('#setBarule span.curr').attr('data-id') == 1){//自由设置规则
	            var liLen = $('.kanWrap li').length;
	            var par = $('.kanWrap li:last-child');
	            var endKanValue = par.find('.endKan').val();
	            var priceKanValue = par.find('.priceKan').val();
	            var stKanValue = par.find('.kanspan').text();
	            //判断第一刀数据
	            var oval = $('#marketVal').val();//原价
	            var dval = $('#floorprice').val();//底价
	            //倒数第二条数据
	            var secondPrice = 0;
	            var firstPrice =  $('.kanWrap li').eq(0).find('.priceKan').val();
	            if(liLen == 1){
	                secondPrice =  $('.kanWrap li').eq(0).find('.priceKan').val();         
	            }else{
	                secondPrice = $('.kanWrap li').eq(-2).find('.priceKan').val();
	            }
	            
	            if(!endKanValue){
	                
	                $.dialog.alert('请输入砍至刀数');//请输入砍至刀数
	                tj = false;
	            }else if(endKanValue*1 < stKanValue*1){
	                
	                $.dialog.alert('请按顺序输入砍至刀数');//请按顺序输入砍至刀数
	                tj = false;
	            }else if(endKanValue*1 > allnum){
	                par.find('.endKan').val(allnum);
	                $.dialog.alert('已超过需砍总次数');//已超过需砍总次数
	                tj = false;
	            }else if(!priceKanValue){
	                
	                $.dialog.alert('请输入砍至价格');//请输入砍至价格
	                tj = false;
	            }else if(firstPrice*1 > oval*1 && liLen == 1){
	                
	                $.dialog.alert('不得超过原价');//不得超过原价
	                tj = false;
	            }else if(priceKanValue*1 < dval*1){
	                
	                $.dialog.alert('不得低于底价');//不得低于底价
	                tj = false;
	            }else if(priceKanValue*1 >=secondPrice*1 && liLen > 1){
	                
	                $.dialog.alert('请按顺序输入砍至价格');//请按顺序输入砍至价格
	                tj = false;
	            }else if(priceKanValue*1 == dval*1 && endKanValue*1 < allnum){
	                               
	                $.dialog.alert('需最后一刀才可砍至底价');//需最后一刀才可砍至底价
	                tj = false;
	            }else if(endKanValue*1 == allnum){
	                if(priceKanValue*1 > dval*1){
	                    par.find('.priceKan').val(dval);
	                    $.dialog.alert('最后一刀为底价');//最后一刀为底价 
	                    tj = false;
	                }
	               
	            }
	        }
	        if(!tj) return;
		}

		if(hdtype != 'bargain' && moreSkuFlag){//多规格专属验证--原价 库存 活动价
			var tj = true;
			$('.pinBot .moreSku_hdprice').each(function(){
				console.log($(this).val())
                if($(this).val() == ''){
                	var kongTxt = "拼团价不得为空";
                	if(hdtype == 'qianggou'){
                		kongTxt = "抢购价不得为空";
                	}else if(hdtype == 'secKill'){
                		kongTxt = "秒杀价不得为空";
                	}
                	console.log(44)
                   $.dialog.alert(kongTxt);
                   tj = false;
                   return false;
                   
                }
            })
            $('.pinBot .moreSku_hdinventory').each(function(){
                if($(this).val() == ''){
                   $.dialog.alert('活动库存不得为空');//活动库存不得为空 
                   tj = false;
                   return false;
                   
                }
            })
            if(!tj) {
            	offsetTop = $(".pinBot").position().top;
            	$('.main').animate({scrollTop: offsetTop + 10}, 300);
            	return;
            }
		}


		if(offsetTop){
			console.log(offsetTop);
			$('.main').animate({scrollTop: offsetTop + 10}, 300);
			return false;
		}

		var barRule = [],data;
		if($('#bargainrule').val() == 1){//自由设置规则
			$('.kanWrap li').each(function(){
				var kanstartDao = $(this).find('.startKan').val();
				var kanendDao = $(this).find('.endKan').val();
				var kanpriceDao = $(this).find('.priceKan').val();
				var barRuleArr = {min:kanstartDao,max:kanendDao,money:kanpriceDao};
				barRule.push(barRuleArr);
			})
			data = form.serialize()+'&barRule='+JSON.stringify(barRule);
		}else{
			data = form.serialize();
		}

		$.ajax({
			url: action,
			data: data,
			type: "POST",
			dataType: "json",
			success: function (data) {
				if(data && data.state == 100){
					var tip = langData['siteConfig'][20][341];
					if(id != undefined && id != "" && id != 0){
						tip = langData['siteConfig'][20][229];
					}
					location.href = url;
				}else{
					$.dialog.alert(data.info);
					t.removeClass("disabled").html("立即报名");		//
				}
			},
			error: function(){
				$.dialog.alert(langData['siteConfig'][20][183]);
				t.removeClass("disabled").html("立即报名");		//
			}
		});
	})

})
function xiaoshu(obj){
    obj.value = obj.value.replace(/^(\-)*(\d+)\.(\d\d).*$/,'$1$2.$3'); //只能输入两个小数
}
function zhengshu(obj){
    obj.value = obj.value.replace(/[^0-9]/g,''); //只能整数
}

function get_prolist(){
	if(pl_alax){
		pl_alax.abort();
	}
	var type = $('.pro_box ul').attr('data-type');

	lload = true;
	keywords = $('#search_pro').val();
	var data = [];
	data.push('u=1');
	data.push('page='+lpage);
	data.push('keywords='+keywords);
	var hdtype = $("#hdtype").val();

	var hdtypeval = hdtype;
	if(hdtype == 'bargain'){
		hdtypeval = 'kjhuodong'
	}

	data.push('gettype='+hdtypeval);
	url = '/include/ajax.php?service=shop&action=slist&pageSize=20&'+data.join('&');
	$('.pro_box ul .loading').remove();
	$('.pro_box ul').append('<div class="loading"><span>加载中~</span></div>');
	pl_alax = $.ajax({
		url: url,
		type: "GET",
		dataType: "json", //指定服务器返回的数据类型
		crossDomain: true,
		success: function(data) {
			lload = false;
			$('.pro_box ul .loading').remove();
			if (data.state == 100) {
				var list = [],item = data.info.list;
				ltotalPage = data.info.pageInfo.totalPage;
				ltotalCount = data.info.pageInfo.totalCount;
				var label = $('.pro_box ul').attr('data-name');
				if(item.length>0){
					//$('.link_pro').removeClass('noDatapro');
					//$('.search_box').show();
					for(var i = 0; i<item.length; i++){
						shopLr.push(item[i]);
						var chosed = '';
						$('.pro_show li').each(function(){
							var t = $(this);
							if(t.attr('data-link') == type && t.attr('data-id') == item[i].id){
								chosed = "chosed";
							}
						});
						list.push('<li class="pro_li '+chosed+'" data-id="'+item[i].id+'" data-promotype="'+item[i].promotype+'">');
						list.push('<a href="javascript:;">');
						list.push('<s class="hasChoseIcon"></s>')
						list.push('<div class="left_proimg">');
						list.push('<img data-url="'+item[i].litpic+'" src="'+item[i].litpic+'" />');
						list.push('</div>');
						list.push('<div class="right_info">');
						list.push('<h2>'+item[i].title+'</h2>');
						
						list.push('<p class="price">'+echoCurrency('symbol')+item[i].price+'</p>');
				
						list.push('</div>');
						list.push('</a>');
						list.push('</li>');

					}
					if(lpage==1){
						$('.pro_box ul').html(list.join(''));
					}else{
						$('.pro_box ul').append(list.join(''));
					}

					// $('.pro_box ul img').scrollLoading(); //懒加载
				}else{
					if(ltotalPage < lpage && lpage > 0){

						$('.pro_box ul').append('<div class="noData loading"><p>已经到底啦！</p></div>')
					}else{
						//$('.link_pro').addClass('noDatapro');
						//$('.search_box').hide();
						$('.pro_box ul').html('<div class="loading"><div class="emptyImg"></div><h2>暂无合适的商品</h2><p>砍价活动暂不支持多规格商品参加！</p></div>')   /* 暂无符合条件的商品哦~*/
					}
				}

			} else {
				//$('.link_pro').addClass('noDatapro');
				//$('.search_box').hide();
				$('.pro_box ul').html('<div class="loading"><div class="emptyImg"></div><h2>暂无合适的商品</h2><p>砍价活动暂不支持多规格商品参加！</p></div>')  /* 暂无符合条件的商品哦~*/
			}
		},
		error: function(err) {
			console.log('fail');
			$('.pro_box ul').html('<div class="loading">网络错误，加载失败</div>');

		}
	});

}

