objId = $('.tablebox tbody');
$(function(){




getList()


})

$(".search_btn").click(function(){
	atpage = 1;
	isload = false;
	getList();
})

$('#state').click(function(e){
	// $(".shai").addClass('open');
	$(".shai").toggleClass('open')
	$(document).one('click',function(){
		$(".shai").removeClass('open')
	});
	e.stopPropagation();
})

$("#state").change(function(){
	atpage = 1;
	isload = false;
	getList();

})



function getList(is){
	setTimeout(function(){
		$(".shai").removeClass('open');
	},1)
    $('.main').animate({scrollTop: 0}, 300);

  	objId.html('<tr class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</tr>');
  	$(".pagination").hide();
	var state = $("#state").val();
	var keywd = $(".search_inp input").val();
  	$.ajax({
  		url: "/include/ajax.php?service=shop&action=quanStoreList&state="+state+"&title="+keywd+"&pageSize=10&page="+atpage,
  		type: "GET",
  		dataType: "json",
  		success: function (data) {
  			if(data && data.state != 200){
  				if(data.state == 101){
  					objId.html("<tr class='loading'>"+data.info+"</tr>");
  				}else{
  					var list = data.info.list, pageInfo = data.info.pageinfo, html = [];

  					//拼接列表
  					if(list.length > 0){
  						for(var i = 0; i < list.length; i++){

  							var alluser = allusertxt = '';
  							if(list[i].shoptype ==0){
								alluser 	= 'alluser';
								allusertxt  = '全店通用';
							}else{
								allusertxt  = '指定商品';
							}
							var statetxt ='';

  							switch (list[i].state) {
								case '0':
									statetxt = '领取中';

									if(list[i].sent ==0){
										statetxt = '已领完';
									}
									break;
								case '1':
									statetxt = '已结束';
									break;

							}

							var money = '';
							if(list[i].promotiotype == 0){
								money = list[i].promotio+'元';
							}else{
								money = list[i].promotio+'折';
							}
  							html.push('<tr class="'+alluser+'">');   //全店通用  加alluser  指定商品不加
							html.push('<th class="txtleft">');
							html.push('<h3>'+list[i].name+'</h3>');
							html.push('<p class="lab">'+allusertxt+'</p></th>');
							html.push('<th>'+statetxt+'</th>');
							html.push('<th>'+money+'</th>');
							html.push('<th>满'+list[i].basic_price+'</th>');
							html.push('<th><p>起：'+list[i].ktime+'</p><p>止：'+list[i].etime+'</p></th>');
							html.push('<th>'+list[i].limit+'</th>');
							html.push('<th>'+list[i].received+'/'+list[i].number+'</th>');

							if(list[i].state ==1){

								html.push('<th> <a href="'+memberD+'/quanDetail.html?id='+list[i].id+'">查看</a><a href="javascript:;" data-id="'+list[i].id+'" class="del">删除</a> </th> </tr>');
							}else{
								html.push('<th> <a href="'+memberD+'/quanDetail.html?id='+list[i].id+'">查看</a> <a href="'+memberD+'/fabuquan.html?id='+list[i].id+'">修改</a> <a href="javascript:;" data-id="'+list[i].id+'" id="end">结束</a> <a href="javacript:;" class="copy_btn'+i+'" data-clipboard-action="copy" data-clipboard-text="'+list[i].quanurl+'?id='+list[i].id+'" onclick="copy(\'.copy_btn'+i+'\')">链接</a> </th> </tr>');
							}

  						}

  						objId.html(html.join(""));
						var clipboard
						clipboard = new ClipboardJS('.copy_btn');
						clipboard.on('success', function(e) {
							alert(langData['siteConfig'][46][101]);  //复制成功
						});

						clipboard.on('error', function(e) {
							alert(langData['siteConfig'][46][102]); //复制失败
						});

  					}else{
  						objId.html("<tr class='loading'>"+langData['siteConfig'][20][126]+"</tr>");
  					}

  					totalCount = pageInfo.totalCount;

  					switch(state){
  						case "0":
  							totalCount = pageInfo.gray;
  							break;
  						case "1":
  							totalCount = pageInfo.audit;
  							break;
  						case "2":
  							totalCount = pageInfo.refuse;
  							break;
  					}


  					$("#audit").html(pageInfo.audit);
  					$("#gray").html(pageInfo.gray);
  					$("#refuse").html(pageInfo.refuse);
  					showPageInfo();
  				}
  			}else{
  				objId.html("<tr class='loading'>"+langData['siteConfig'][20][126]+"</tr>");
  			}
  		}
  	});
  }

$(".quan_container").delegate('#end','click', function () {
	var id = $(this).attr('data-id');
	$.ajax({
		url: "/include/ajax.php?service=shop&action=quanEdit&end=1&qid="+id,
		type:"POST",
		dataType: "json",
		success:function (data) {
			if(data.state ==100){
				alert("更新成功")
				// windows.reload();
				getList()
			}else{
				alert("更新失败")
			}

		},
		error:function () {

		}
	})

});

$(".quan_container").delegate('.del','click', function () {
	var id = $(this).attr('data-id');
	$.ajax({
		url: "/include/ajax.php?service=shop&action=delQuan&qid="+id,
		type:"POST",
		dataType: "json",
		success:function (data) {
			if(data.state ==100){
				alert("删除成功")
				// windows.reload();
				getList()
			}else{
				alert("删除失败")
			}

		},
		error:function () {

		}
	})

});
function copy(copyid){
	var clipboard = new ClipboardJS(copyid)

	clipboard.on("success", function (e) {
		alert('已经成功复制');

		clipboard.destroy();
	});
}
