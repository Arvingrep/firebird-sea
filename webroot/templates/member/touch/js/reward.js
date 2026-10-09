/**
 * 会员中心交易明细
 * by guozi at: 20151109
 */

var objId = $("#list");
$(function(){

  var currYear = (new Date()).getFullYear();
  var currMonth = (new Date()).getMonth() + 1;
  currMonth = currMonth < 10 ? '0'+currMonth : currMonth;
  var activeDate = '';
  $('.yearly-time').scroller(
      $.extend({
          preset: 'date',
          dateFormat: 'yy-mm',
          endYear: currYear,
          maxDate: new Date(),
          onSelect: function (valueText, inst) {
              $(".list").html('');
              isload = false;
              atpage = 1;
              $('#allMoney').text(0);
              activeDate = valueText;
              getList(1);
          }
      })
  );

  //收入提示
  $('.tipI').click(function(){
    $('.sameChose').removeClass('click');
    $('.comWrap').removeClass('show');
    if(!$(this).hasClass('click')){
      $(this).addClass('click');
      $('.tipCon').show();
    }else{
      $(this).removeClass('click');
      $('.tipCon').hide();
    }
  })

  //筛选
  var allH =0;
  $('.filerP').click(function(){
    var h1 = $('.incomeSor').height(),
      h2 = $('.incomeType').height(),
      h3 = $('.amoutMoney').height(),
      h4 = $('.btnCon').height();
     allH = h1*1+h2*1+h3*1+h4*1;
    if(!$(this).hasClass('active')){
      $(this).addClass('active');
      $('.dsTitle').addClass('topFixed');
      $('.mask').show();
      $('.filterWrap').animate({'height':allH+'px'},200);
    }else{
      $(this).removeClass('active');
      $('.mask').hide();
      if(!$('.dsTitle').hasClass('topcurr')){
        $('.dsTitle').removeClass('topFixed');
        $('.filterWrap').css({'height':'0'});
      }else{//已经滚动到头部
        $('.filterWrap').animate({'height':'0'},200);
      }
    }
  })
  
  
  


  //关闭弹窗
  $('.mask').click(function(){
    $('.filerP').removeClass('active');
    $('.mask').hide();
    if(!$('.dsTitle').hasClass('topcurr')){//
      $('.dsTitle').removeClass('topFixed');
    }
    $('.filterWrap').css({'height':'0'});
  })

  //来源 类型选择
  $('.sameList li').click(function(){
    $(this).toggleClass('curr').siblings('li').removeClass('curr');
  })

  //重置
  $('.btnCon .setBtn').click(function(){
    $('.sameList li').removeClass('curr');
    $('.symbol input').val('');
  })

  //确定
  $(".btnCon .sureBtn").bind("click",function () {
      //确定金额
      var price1 = $.trim($("#price1").val()) > 0 ? parseFloat($.trim($("#price1").val())) : 0,
        price2 = $.trim($("#price2").val()) > 0 ? parseFloat($.trim($("#price2").val())) : 0;
      var price = [];
      if((price1 > 0 && price2 > 0) && (price2 > price1)){

        $('.amoutMoney').attr('data-id',price1+','+price2);

      }else if((price1 == '' || price1 == 0) && price2>0){
        $('.amoutMoney').attr('data-id',' ,'+price2);

      }else if((price2 == '' || price2 == 0) && price1>0){

        $('.amoutMoney').attr('data-id',price1+', ')
      }else{

        $('.amoutMoney').attr('data-id',' ')
      }
      $('.filerP').addClass('curr');
      $('.filerP').removeClass('active');
      $('.mask').hide();

      if(!$('.dsTitle').hasClass('topcurr')){//
        $('.dsTitle').removeClass('topFixed');

      }
      $('.filterWrap').css({'height':'0'});
      getList(1);
  });

	function getParam(paramName) {
	    paramValue = "", isFound = !1;
	    if (this.location.search.indexOf("?") == 0 && this.location.search.indexOf("=") > 1) {
	        arrSource = unescape(this.location.search).substring(1, this.location.search.length).split("&"), i = 0;
	        while (i < arrSource.length && !isFound) arrSource[i].indexOf("=") > 0 && arrSource[i].split("=")[0].toLowerCase() == paramName.toLowerCase() && (paramValue = arrSource[i].split("=")[1], isFound = !0), i++
	    }
	    return paramValue == "" && (paramValue = null), paramValue
	}
	
	if(getParam('module')){
		  var module = getParam('module');
		  $(".filerP").addClass('active')
		  var a = $(".filterCon.incomeSor .sameList li a[data-id='"+module+"']");
		  a.closest('li').addClass('curr');
	}

  var device = navigator.userAgent;
  if (device.indexOf('huoniao_iOS') > -1) {
    $('body').addClass('huoniao_iOS');
  }

  // 下拉加载
  var isload = false;
  var stt = $('.listWrap').offset().top -55;
  $(window).scroll(function() {
    if($(window).scrollTop() > stt){
        $('.dsTitle').addClass('topFixed topcurr');
    }else{
        $('.dsTitle').removeClass('topFixed topcurr');
        $('.mask').hide();
        $('.filerP').removeClass('active');
        $('.filterWrap').css({'height':'0'});
    }
    var h = $('.list li').height();
    var allh = $('body').height();
    var w = $(window).height();
    var scroll = allh - h - w;
    if ($(window).scrollTop() > scroll && !isload) {
      atpage++;
      getList();
    };
  });


  getMoney();
  function getMoney(){
    var data = [];
    data.push('page=1');
    data.push('date='+activeDate);
    $.ajax({
      url: "/include/ajax.php?service=member&action=reward",
      type: "GET",
      data: data.join('&'),
      dataType: "json",
      success: function (data) {
        if(data && data.state == 200){
          var pageInfo = data.info.pageInfo;
          var totalmoney = pageInfo.totalmoney;
          $("#allMoney").html(totalmoney.toFixed(2));
        }
      }
    })
  }


  getList();
  function getList(tr){
    if(tr){
      atpage =1;
      $('.list').html('');
    }

    isload = true;
    $('.loading').remove();
  	objId.append('<div class="loading">'+langData['siteConfig'][20][184]+'...</div>');

    var soure = $('.incomeSor li.curr a').attr('data-id'),
		type = $('.incomeType li.curr a').attr('data-id'),
		price = $('.amoutMoney').attr('data-id');

    var data = [];
    data.push('page='+atpage);
    data.push('pageSize='+pageSize);
    data.push('date='+activeDate);
    data.push('soure='+(soure != undefined ? soure : ''));
    data.push('type='+(type != undefined ? type : ''));
    data.push('price='+price);
  	$.ajax({
  		url: "/include/ajax.php?service=member&action=reward",
  		type: "GET",
        data: data.join('&'),
  		dataType: "json",
  		success: function (data) {
        	$('.loading').remove();
  			if(data && data.state != 200){

				if(data.state == 101){
		            if(tr){
		              $('.listTit em.tt').text(langData['siteConfig'][19][549]);//小计
		              $('#allMoney').html(0);
		            }
		            isload = true;
  					objId.append("<div class='empty'>"+langData['siteConfig'][20][126]+"</div>");
  				}else{
					isload = false;
  					var list = data.info.list, pageInfo = data.info.pageInfo, html = [];
            		var totalmoney = pageInfo.totalmoney;
  					//拼接列表
  					if(list.length > 0){
  						for(var i = 0; i < list.length; i++){
  							var item   = [],
								title  = list[i].title,
			                    url    = list[i].url,
			                    user   = list[i].user,
			                    amount = list[i].amount,
			                    date   = list[i].date,
			                    type   = list[i].type,
			                    moduled   = list[i].module,
                    			reward_userid   = list[i].reward_userid;

			                var d = date.split(' '),da = d[0].split('-'),dateYear = da[0];
			                var date2 = currYear == dateYear ? date.replace(currYear+'-',' '):date;
			                html.push('<li>');
			                // 打赏来的 dsImg 礼物来的giftImg
			                var typeclass = '';
			                typeclass = type ==0 ? 'dsImg' : 'giftImg' ;
			                html.push('<div class="'+typeclass+' comImg"></div>');
			                html.push('<div class="rightCon">');
			                html.push('<div class="topT"><h2>'+(reward_userid > 0 ? ('<a href="/user/'+reward_userid+'">'+user+'</a>') : user)+'</h2><span>'+echoCurrency('symbol')+'<strong>'+amount+'</strong></span></div>');
			                var sTitle = '【'+moduled+'】'+title;
			                html.push('<h3>'+(url ? `<a href="${url}" class="toMini" data-temp="detail" data-module="article" data-id="${list[i].id}">${sTitle}</a>` : sTitle)+'</h3>');
			                html.push('<p class="time">'+date2+'</p>');
			                html.push('</div>');
			                html.push('</li>');
  						}

						if(tr){
							$('.listTit em.tt').text(langData['siteConfig'][19][549]);//小计
							$("#allMoney").html(totalmoney.toFixed(2));
						}

  						objId.append(html.join(""));
						if(atpage >= pageInfo.totalPage){
							isload = true;
    						$(".list").append('<div class="empty">'+langData['siteConfig'][20][185]+'</div>');
    					}
  					}else{
						if(tr){
							$('.listTit em.tt').text(langData['siteConfig'][19][549]);//小计
							$('#allMoney').html(0);
						}
  						objId.append("<div class='empty'>"+langData['siteConfig'][20][126]+"</div>");
  					}
  				}
  			}else{
				if(tr){
					$('.listTit em.tt').text(langData['siteConfig'][19][549]);//小计
					$('#allMoney').html(0);
				}
  				objId.append("<div class='empty'>"+langData['siteConfig'][20][126]+"</div>");
  			}
  		}
  	});
  }


});
