$(function(){
	//区域展开
	$('.filterTop .quyu').click(function(){
		if(!$(this).hasClass('curr')){
			$(this).addClass('curr')
			$('html').addClass('noscroll')
			$('.mask').show();
			$('.filerAlert').addClass('show');
		}else{
			hideFilter();
			
		}
		
	})
	// 二级地域切换
    $('.chooseLeft a').click(function(){
    	var par = $(this).closest('li');
        par.addClass('curr').siblings('li').removeClass('curr');
        var i = $(this).index();
        var id = $(this).attr('data-id'), typename = $(this).text();
        var lower = $(this).attr('data-lower');
        if(lower == 0){
        	$('.quyu span').text(typename);
        	$('.quyu').attr('data-id',id);       	
        	$('.filerAlert').removeClass('active');
        	$(".chooseRight ul").html('');
        	hideFilter();
        	getList(1);
        }else{
        	$('.filerAlert').addClass('active');
			$.ajax({
	            url: "/include/ajax.php?service=shop&action=addr&type="+id,
	            type: "GET",
	            dataType: "jsonp",
	            success: function (data) {
	                if(data && data.state == 100){
	                    var html = [], list = data.info;
	                    html.push('<li class="all"><a href="javascript:;" data-id="'+id+'" data-name="'+typename+'">全部(2426)</a></li>');
	                    for (var i = 0; i < list.length; i++) {
	                        html.push('<li><a href="javascript:;" data-id="'+list[i].id+'" data-name="'+list[i].typename+'">'+list[i].typename+'</a></li>');
	                    }
	                    $(".chooseRight ul").html(html.join(""));
	                }else if(data.state == 102){
	                    $(".chooseRight ul").html('<li class="all"><a href="javascript:;" data-id="'+id+'" data-name="'+typename+'">全部(2426)</a></li>');
	                }else{
	                    $(".chooseRight ul").html('<li class="load">'+data.info+'</li>');
	                }
	            },
	            error: function(){
	                $(".chooseRight ul").html('<li class="load">'+langData['info'][1][29]+'</li>');
	            }
	        });
        }
        

        $('.choose-list .choose-city .brand-wrapper ul').eq(i).addClass('show').siblings().removeClass('show');
    });
    //选择二级
    $('.chooseRight').delegate('a','click',function(){
    	var par = $(this).closest('li');
        par.addClass('curr').siblings('li').removeClass('curr');
        var id = $(this).attr('data-id'), typename = $(this).attr('data-name');
        $('.quyu span').text(typename);
        $('.quyu').attr('data-id',id);
        hideFilter();
        getList(1);
    });	
    //关闭弹窗
    function hideFilter(){
    	$('.filterTop .quyu').removeClass('curr');
		$('html').removeClass('noscroll')
		$('.mask').hide();
		$('.filerAlert').removeClass('show');
	}
	$('.mask').click(function(){
		hideFilter();
	})
	//搜索提交
	$('.searchForm form').submit(function(){
		getList(1);
		hideFilter();
		return false;
	})

	//人气商圈 离我最近
	$('.orderFilter a').click(function(){
		if(!$(this).hasClass('curr')){
			$(this).addClass('curr').siblings('a').removeClass('curr');
			getList(1);
			hideFilter();
		}
	})

	getList();
	// 下拉加载
	var isload = false,atpage =1, pageSize = 20;
	$(document).ready(function() {
		$(window).scroll(function() {
			var allh = $('body').height();
			var w = $(window).height();
			var scroll = allh - w;
			if ($(window).scrollTop() + 50 > scroll && !isload) {
				atpage++;
				getList();
			};
		});
	});
	//数据列表
	function getList(tr){
        isload = true;
        if(tr){
        	atpage =1;
            $(".list ul").html("");
        }
        $('.loading').remove();
        $(".list ul").append('<div class="loading">加载中...</div>');
        //请求数据
        var data = [];
        data.push("pageSize="+pageSize);
        data.push("page="+atpage);

		var addrId = $('.quyu').attr('data-id');
		if(addrId != undefined && addrId != ''){
			data.push("addrid="+addrId);
		}

		var keywords = $('#keywords').val();		
		data.push("title="+keywords);

		var orderby = $('.orderFilter .curr').attr('data-id');		
		data.push("orderby="+orderby);
	

        $.ajax({
          url: "/include/ajax.php?service=shop&action=store",
          data: data.join("&"),
          type: "GET",
          dataType: "jsonp",
          success: function (data) {
            if(data.state == 100){
                $(".list ul .loading").remove();
                var list = data.info.list, html = [];
                for(var i = 0; i < list.length; i++){
					var logo = list[i]['logo'] == '' ? staticPath+'images/404.jpg' : huoniao.changeFileSize(list[i]['logo'], "small");
					html.push('<li><a href="./shangquan-detail.html">')
					html.push('	<div class="leftImg"><img src="'+logo+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/404.jpg\';"></div>')
					html.push('	<div class="rInfo">')
					html.push('		<h2>'+list[i].title+'</h2>')
					html.push('		<div class="openTime">')
					html.push('			<em>5家好店</em>')
					html.push('			<span>营业时间: 08:00-22:00</span>')
					html.push('		</div>')
					html.push('		<div class="addr">');
					var addrTxt = '';
					if(list[i].address !=''){
						addrTxt = list[i].address;
					}else{
						addrTxt = list[i].addr[list[i].addr.length-2]+' '+list[i].addr[list[i].addr.length-1];
					}
					html.push('			<div class="pos"><i></i><span>'+addrTxt+'</span></div>')
					html.push('			<span class="juli">2.5km<s></s></span>')
					html.push('		</div>')
					html.push('		<div class="tag">')
					html.push('			<span>交通便利</span>')
					html.push('			<span>交通便利</span>')
					html.push('			<span>交通便利</span>')
					html.push('		</div>')
					html.push('	</div>')
					html.push('</a></li>')
                }
                $(".list ul").append(html.join(""));
                isload = false;

                //最后一页
                if(atpage >= data.info.pageInfo.totalPage){
                    isload = true;
                    $(".list ul").append('<div class="loading">'+langData['siteConfig'][18][7]+'</div>');
                }
            }else{
                isload = true;
                $(".list ul").append('<div class="loading"><i></i>没有符合条件的商圈</div>');//没有符合条件的店铺
            }
          },
          error: function(){
            isload = false;
            $('.list ul').html('<div class="loading">'+langData['siteConfig'][20][227]+'</div>');
          }
        });
    }





})

