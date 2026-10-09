var tp_ajax	, sp_ajax , pl_alax ;
var lpage = 0,  ltotalPage = 0, ltotalCount = 0, lload = false ,shopLr = [],choseLr = [];
var allnumber = $('#number').val();

$(function(){


  if(!foodid){
  var currDate = new Date();
  var endDate = currDate.setDate(currDate.getDate()+60);
  
  //开始时间
  $(".form_datetime .add-aft,.form_datetime #startdate").datetimepicker({
      format: 'yyyy-mm-dd hh:ii:ss',
      autoclose: true,
      language: 'ch',
      todayBtn: true,
      minuteStep: 15,
      startDate:new Date(),
      endDate:new Date(endDate),
      linkField: "startdate",
    }).on('changeDate', function(ev){
       var date1 = ev.date;
          date2 = parseInt(date1.valueOf()/1000 + 60 * 81600)
      // var date2 = parseInt(currDate1.setDate(currDate1.getDate()+60)/1000);
      $(".form_datetime .add-on").datetimepicker('setStartDate', huoniao.transTimes(date1.valueOf()/1000,1));
      $(".form_datetime .add-on").datetimepicker('setEndDate', huoniao.transTimes(date2,1));
      $(".form_datetime #enddate").datetimepicker('setStartDate', huoniao.transTimes(date1.valueOf()/1000,1));
      $(".form_datetime #enddate").datetimepicker('setEndDate', huoniao.transTimes(date2,1));
    });
    $(".form_datetime .add-on,.form_datetime #enddate").datetimepicker({
        format: 'yyyy-mm-dd hh:ii:ss',
        autoclose: true,
        language: 'ch',
        todayBtn: true,
        minuteStep: 15,
        startDate:new Date(),
        linkField: "enddate",
      });
   
  }
    

  $(".radio span").click(function(){
    var dl = $(this).closest('dl'),
        val = $(this).attr('data-id'),
        type = dl.attr('data-type');
        if(type && type == 'youhui'){
          if(val == 0){
            $(".youhui").eq(0).removeClass('fn-hide').siblings('.youhui').addClass('fn-hide');
            $(".menkan .time-tip").eq(0).removeClass('fn-hide').siblings('.time-tip').addClass('fn-hide');
          }else{
              $(".menkan .time-tip").eq(1).removeClass('fn-hide').siblings('.time-tip').addClass('fn-hide');
            $(".youhui").eq(1).removeClass('fn-hide').siblings('.youhui').addClass('fn-hide')

          }
        }

        if(type && type == 'shiyong'){
          if(val == 1){
            $(".goodsDl").removeClass('fn-hide')
          }else{
            $(".goodsDl").addClass('fn-hide')
          }
        }
  })


  if($('#number').val()){
      var quannum = $('#number').val();
      var html = [];
      html.push('<option value="0">请选择</option>');
      var limitGet = litmit?litmit:1;
      for(var i = limitGet; i <= quannum; i++){
          var select = '';
          if(limit ==i){
              select = 'selected';
          }
          html.push('<option value="'+i+'" '+select+'>'+i+'</option>');
      }
      $("#quanlimit").html(html.join(''))
  }

  $("#number").change(function(event) {
    /* Act on the event */
    var quannum = $(this).val();
    var html = [];
      if(allnumber && allnumber > quannum){
          alert('修改的发放量不能低于之前的发放量！');
          $(this).val(allnumber);
          quannum = allnumber;
      }
    html.push('<option value="0">请选择</option>');
    var limitGet = litmit?litmit:1;
    for(var i = limitGet; i <= quannum; i++){
        var select = '';
        if(limit ==i){
            select = 'selected';
        }
      html.push('<option value="'+i+'" '+select+'>'+i+'</option>');
    }
    $("#quanlimit").html(html.join(''))
  });

  // 选择商品
  $('.chooseGoods').click(function(){
    $('.mask_pl').show();
		$('.link_pro').show();
		if($('.pro_box').find('.pro_li').size()==0){
			lpage = 1
			get_prolist()
		}

		$('html').addClass('noscroll');
  })
  // 到底加载
  $('.pro_box ul').scroll(function(){
    var type = $('.pro_box>ul').attr('data-type');
    if ($('.pro_box').scrollTop() >= $('.pro_box>ul').height() - $('.pro_box').height() - 50 && !lload && lpage < ltotalPage)
    {
      lpage++;
      get_prolist();
    }
  });

  // 隐藏
	$('.mask_pl,.link_pro .cancel_btn').click(function() {
		$('.mask_pl').hide();
		$('.link_pro').hide();
		$('html').removeClass('noscroll');
    $(".pro_box li").each(function(){
      var t = $(this);
      id = t.attr('data-id');
      var idChose =  $("#goodsId").val();
      if(idChose.indexOf(id) <= -1){
        t.removeClass('selected')
      }
    })
	});


  // 搜索
	$('#search_pro').bind('input propertychange',function(){
		var t = $(this);
		lpage = 1 ;
		get_prolist();
	});

  // 选择商铺
  var allSelect = [];
  $('.pro_box').delegate('li','click',function(){
    var t = $(this),tid = t.attr('data-id');
    if(!t.hasClass('no_change')){
      t.toggleClass('selected');
      if($('#search_pro').val() != '' && !t.hasClass('selected')){//搜索了商品的 然后取消勾选
        if(allSelect.indexOf(tid) > -1){//之前有勾选 现在要剔除掉
          allSelect.splice(allSelect.indexOf(tid),1); 
        }
      }
    }
  });

$('.btnbox .sure_btn').click(function(){
  
  if($('#search_pro').val() == ''){//未搜索
    var selectArr = [];
    allSelect=[];
    $('.pro_box li.selected').each(function(){
        var  t = $(this),proid = t.attr('data-id');
         selectArr.push(proid);
         allSelect.push(proid);
    })
  }else{//已搜索 
    var selectArr = allSelect;
    $('.pro_box li.selected').each(function(){
        var  t = $(this),proid = t.attr('data-id');
        if(selectArr.indexOf(proid) <= -1){
            selectArr.push(proid);
        }
    })
  }
 
  $('.chooseGoodsNum em').text(selectArr.length);
  $("#goodsId").val(selectArr.join(','))
  $('.link_pro .cancel_btn').click();
})


// 提交
$(".submit").click(function(e){
  var stop = false,t = $(this);
  $(".w-form dl[data-required='1']:not(.fn-hide)").each(function(){
      var input = $(this).find('input');
      if(input.val() == ''){
        alert(input.attr('placeholder'));
        stop = true;
        return false;
      }
  });

  if(!$("#quanlimit").val()){
    stop = true;
    alert($("#quanlimit").attr('data-title'))
  }
  if($('#promotiotype').val() == 1){
      $("#promotio").val($("#promotio1").val());
  }
  var action ='quanAdd';

  if(foodid!=''){
      action ='quanEdit&qid='+foodid;
  }
    $.ajax({
        url: "/include/ajax.php?service=shop&action="+action,
        type: "POST",
        data:$(".w-form form").serializeArray(),
        dataType: "json",
        success: function (data) {
            if(data.state == 100){
                alert(data.info);
                location.href =  bsDomain + '/quan-shop.html'
            }else{
                alert(data.info);
            }
        },
        error:function () {

        }
    });
  if(stop) return false;
  console.log($(".w-form form").serializeArray())
  t.attr('disabled', 'true');

  setTimeout(function(){
    t.removeAttr('disabled');  //在ajax请求成功之后执行
  },1200)
})



  function get_prolist(){
  	if(pl_alax){
  		pl_alax.abort();
  	}
  	var type = $('.pro_box ul').attr('data-type');
    var idArr = $("#goodsId").val().split(',')
    var editArr = hasChosed.split(',')
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
  				shopLr = item;
  				ltotalPage = data.info.pageInfo.totalPage;
  				ltotalCount = data.info.pageInfo.totalCount;
  				var label = $('.pro_box ul').attr('data-name');
  				if(item.length>0){
  					//$('.link_pro').removeClass('noDatapro');
  					//$('.search_box').show();
  					for(var i = 0; i<item.length; i++){
  						var chosed = '',editCls = '';
  						var id = item[i].id;

              chosed = idArr.indexOf(id) > -1?'selected': '';
              editCls = editArr.indexOf(id) > -1 ? 'no_change':'';
  						list.push('<li class="pro_li '+chosed+' '+editCls+'" data-id="'+item[i].id+'">');
              list.push('<s class="hasChoseIcon"></s>')
  						list.push('<a href="javascript:;">');
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
  						$('.pro_box ul').html('<div class="loading"><div class="emptyImg"></div><h2>暂无合适的商品</h2></div>')   /* 暂无符合条件的商品哦~*/
  					}
  				}

  			} else {
  				//$('.link_pro').addClass('noDatapro');
  				//$('.search_box').hide();
  				$('.pro_box ul').html('<div class="loading"><div class="emptyImg"></div><h2>暂无合适的商品</h2></div>')  /* 暂无符合条件的商品哦~*/
  			}
  		},
  		error: function(err) {
  			console.log('fail');
  			$('.pro_box ul').html('<div class="loading">网络错误，加载失败</div>');

  		}
  	});

  }


})
