/**
 * 会员中心交友私信列表
 * by guozi at: 20160608
 */

var objId = $("#list");
// var hash = (!window.location.hash) ? "" : window.location.hash;
$(function(){

	getList(1);

	$('.reply').click(function(){
		if($('body').hasClass('showreply')){
			$('body').removeClass('showreply');
		}else{
			$('body').addClass('showreply wait');
			$('#con').focus();
			var fh = objId.height(), vh = $('#scroller').height();
			$('#scroller').scrollTop(fh-vh);
			setTimeout(function(){
				$('body').removeClass('wait');
			},500)
		}
	})
	setTimeout(function(){
		$('.reviewbox').addClass('tran');
	},500)

	//回复
	$("#send").bind("click", function(){
		var btn = $(this);
		if(btn.hasClass('disabled')) return;
		var note = $("#con").val();
		if($.trim(note) == ""){
			alert(langData['siteConfig'][20][297]);
			$("#con").focus();
			return false;
		}
		$.ajax({
			url: masterDomain + "/include/ajax.php?service=dating&action=fabuReview&id="+tid+"&note="+encodeURIComponent(note),
			type: "GET",
			dataType: "jsonp",
			success: function (data) {
				btn.removeClass('disabeld');
				if(data.state == 100){
					btn.val(langData['siteConfig'][20][298]);
					setTimeout(function(){
						btn.val(langData['siteConfig'][6][139]);
					})
					$("#con").val("");
					getList();
				}else{
					alert(data.info);
				}
			},
			error: function(){
				btn.removeClass('disabeld');
				alert(langData['siteConfig'][20][173]);
			}
		});
	});

	$('#scroller').scroll(function(){
		if(!$('body').hasClass('wait')){
			$('body').removeClass('showreply');
		}
	})


	function getList(is){

		if(is != 1){

		}

		objId.html('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');
		$(".pagination").hide();

		$.ajax({
			url: masterDomain+"/include/ajax.php?service=dating&action=reviewDetail&id="+id+"&page="+atpage+"&pageSize="+pageSize,
			type: "GET",
			dataType: "jsonp",
			success: function (data) {
				if(data && data.state != 200){
					if(data.state == 101){
						objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
					}else{
						var list = data.info.list, pageInfo = data.info.pageInfo, html = [];

						//拼接列表
						if(list.length > 0){
							for(var i = 0; i < list.length; i++){
								var type = " l", url = tinfo['url'], name = tinfo['nickname'], photo = huoniao.changeFileSize(tinfo['photo'], "small");
								if(list[i].from == mid){
									type = " r";
									url = minfo['url'];
									name = langData['siteConfig'][19][742];
									photo = huoniao.changeFileSize(minfo['photo'], "small");
								}
								html.push('<div class="li fn-clear'+type+'" id="r'+list[i].pubdate+'">');
								html.push('<a href="'+url+'" class="photo"><img src="'+photo+'" onerror="javascript:this.src=\''+masterDomain+'/static/images/default_user.jpg\';" /></a>');
								html.push('<div class="info">');
								html.push('<s><i></i></s>');
								html.push('<h3><a href="'+url+'">'+name+'</a></h3>');
								html.push('<p>'+list[i].content+'</p>');
								html.push('<em>'+huoniao.transTimes(list[i].pubdate, 1)+'</em>');
								html.push('</div>');
								html.push('</div>');
							}

							objId.addClass('op0').html(html.join(""));
							var fh = $('#list').height(), vh = $('#scroller').height();
							$('#scroller').scrollTop(fh-vh);
							objId.removeClass('op0');

						}else{
							objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
						}

					}
				}else{
					objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
				}
			}
		});
	}

});
