/**
 * 会员中心家政服务人员
 * 
 */

var objId = $("#list");
$(function(){
	//添加服务人员
	$('.addPeo').click(function(){
		$('.fwcodeWrap').css('display','flex');
    	$('.fwMask').show();
	})
	$(".fwcodeWrap .scodesubmit").click(function(e){
      e.preventDefault();
      var t = $("#fabuForm"), action = t.attr('data-action'), r = true;t.attr('action', action);

      var add_account = $('#add_account').val();

      if(add_account==''){
        r = false;
        $.dialog.alert(langData['homemaking'][9][6]);
      }

      if(!r){
        return;
      }

      $.ajax({
        url: "/include/ajax.php?service=homemaking&action=operPersonal&oper=add&account="+add_account,
        data: t.serialize(),
        type: 'post',
        dataType: 'json',
        success: function(data){
          if(data && data.state == 100){
            $.dialog.alert('添加成功');
            setTimeout(function(){getList(1);},200);
            $('.jzComWrap').css('display','none');
    	 	$('.fwMask').hide();
            
          }else{
            $.dialog.alert(data.info);
          }
        },
        error: function(){
          $.dialog.alert(langData['siteConfig'][6][203]);
        }
      });

    });

    //添加服务人员--关闭
	$(".fwMask,.fwcodeWrap .close").click(function(e){
    	$('.jzComWrap').css('display','none');
    	$('.fwMask').hide();

    })
	getList(1);

	//删除
	objId.delegate(".del", "click", function(){
		var t = $(this), id = t.attr("data-id"),par=t.closest('tr');
		if(id){
			$.dialog.confirm(langData['siteConfig'][20][543], function(){
				$.ajax({
					url: "/include/ajax.php?service=homemaking&action=operPersonal&oper=del&id="+id,
					type: "GET",
					dataType: "jsonp",
					success: function (data) {
						if(data && data.state == 100){
							$.dialog.alert('删除成功');
							//删除成功后移除信息层并异步获取最新列表
							par.slideUp(300, function(){
								par.remove();
								setTimeout(function(){getList(1);}, 200);
							});

						}else{
							$.dialog.alert(data.info);
						}
					},
					error: function(){
						$.dialog.alert(langData['siteConfig'][20][183]);
					}
				});
			});
		}
	});


});

function getList(is){

	$('.main').animate({scrollTop: 0}, 300);

	objId.html('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');
	$(".pagination").hide();

	$.ajax({
		url: "/include/ajax.php?service=homemaking&action=personalList&u=1&orderby=2&page="+atpage+"&pageSize="+pageSize,
		type: "GET",
		dataType: "jsonp",
		success: function (data) {
			if(data && data.state != 200){
				if(data.state == 101){
					objId.html("<p class='loading'>"+data.info+"</p>");
				}else{
					var list = data.info.list, pageInfo = data.info.pageInfo, html = [];

					//拼接列表
					if(list.length > 0){

						html.push('<table><thead><tr><td class="fir"></td>');
						html.push('<td style="width:20%">'+langData['siteConfig'][19][642]+'</td>');
						html.push('<td>'+langData['siteConfig'][19][56]+'</td>');
						html.push('<td>'+langData['homemaking'][9][4]+'</td>');//服单
						html.push('<td>'+langData['homemaking'][9][5]+'</td>');//结单
						html.push('<td>'+langData['siteConfig'][19][307]+'</td>');
						html.push('</tr></thead>');

						for(var i = 0; i < list.length; i++){
							var item      = [],
									id        = list[i].id,
									username    = list[i].username,
									contact   = list[i].tel,
									onlineorder   = list[i].onlineorder,
									endorder   = list[i].endorder,
									photo     = list[i].photo;
							var courierURl = courierurl.replace("%id%", id);
							console.log(countrurl)
                        	var countrURL = countrurl.replace("%id%", id);
							html.push('<tr data-id="'+id+'"><td class="fir"></td>');
							html.push('<td><div class="left_b"><a href="'+courierURl+'"><img src="'+(photo?photo:"/static/images/noPhoto_60.jpg")+'" alt=""></a></div><h2 class="uname"><a href="'+courierURl+'">'+username+'</a></h2></td>');
							html.push('<td>'+contact+'</td>');
							html.push('<td>'+onlineorder+'</td>');
							html.push('<td>'+endorder+'</td>');
							html.push('<td><div class="btn_group"><a href="javascript:;" class="del d_btn" data-id="'+id+'">'+langData['homemaking'][11][3]+'</a><a href="'+courierURl+'" class="o_btn blueCo">'+langData['homemaking'][11][2]+'</a><a href="'+countrURL+'" class="c_btn blueCo">'+langData['homemaking'][11][1]+'</a></div></td>');//移除-- 订单 --统计  
							html.push('</tr>');


						}

						objId.html(html.join("")+"</table>");

					}else{
						objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
					}

					totalCount = pageInfo.totalCount;

					$("#total").html(pageInfo.totalCount);
					showPageInfo();
				}
			}else{
				objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
			}
		}
	});
}
