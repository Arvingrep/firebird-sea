$(function(){
	// 获取数据
	var currTypeid = 0;
	getAlbums()
	function getAlbums(){
		$.ajax({
			url: "/include/ajax.php?service=business&action=albumstype",
			type: "GET",
			async: false,
			dataType: "json",
			success: function (data) {
				if(data.state == 100){
					var list = data.info;
					var html = [];
					$.ajax({
						url: "/include/ajax.php?service=business&action=albums&u=1&page=1&pageSize=99999",
						type: "GET",
						async: true,
						dataType: "json",
						success: function (data) {
							if(data.state == 100){
								var albums = data.info.list;
								var html = [];
								var albumData = []
								for(var i = 0; i<list.length; i++){
									currTypeid = list[i].id
									 albumData.push({
										 id:currTypeid,
										 typename:list[i].typename,
										 litpics:albums.filter(checkType)
									 })
								}
								renderHtml(albumData,html)
							}
						},
						error:function(data) {},
					})
				}else{
					$(".albumList .loading").html(data.info)
				}
			},
			error:function(data) {$(".albumList .loading").html('error')},
		})
	}
	function checkType(value) {
	    return value.typeid == currTypeid;
	}

	function renderHtml(data,html){
		for(var m = 0; m < data.length; m++ ){
			var d = data[m];
			html.push('<dl class="albumbox" data-id="'+ d.id +'">');
			html.push('<dt><span class="album_title">'+ d.typename +'</span><div class="albumbtns"><a href="javascript:;" class="upSort"></a><a href="javascript:;" class="downSort"></a></div></dt>');
			html.push('<dd class="photos">');
			html.push('<ul class="fn-clear">');
			var litpic_length = d.litpics.length>3?3:d.litpics.length
			for(var n = 0; n<litpic_length; n++){
				html.push('<li class="photo"><img src="'+d.litpics[n].litpic+'" alt=""></li>');

			}
			html.push('<li class="more"><a href="'+urlPath+'/fabu-business-albums.html?typeid='+ d.id +'"><h4>'+d.litpics.length+langData['siteConfig'][13][17]+'</h4><p>'+langData['business'][9][58]+'</p></a></li>')		//编辑相册
			html.push('</ul></dd></dl>');
		}
		$(".albumList").html(html.join(''))
	}

	// 移动
	  //3.已有模块上移
	  $('.albumList').delegate('.upSort','click',function(){
		if($(this).hasClass('disabled')) return false;
		var par = $(this).parents('dl');
		$('.upSort').addClass('disabled')
		if(par.prev().size()>0){
		  par.addClass('slide-top');
		  par.prev().addClass('slide-bottom');
		  setTimeout(function(){
			$('.albumList dl').removeClass('slide-top');
			$('.albumList dl').removeClass('slide-bottom');
			par.prev().before(par);
			updateAlbumType()
		  },500)
		}
		setTimeout(function(){
		  $('.upSort').removeClass('disabled');
		})

	  })
		//3.已有模块下移
	  $('.albumList').delegate('.downSort','click',function(){
		var par = $(this).parents('dl');
		if($(this).hasClass('disabled')) return false;
		$('.downSort').addClass('disabled')
		if(par.next().size()>0){
		  par.addClass('slide-bottom');
		  par.next().addClass('slide-top');
		  setTimeout(function(){
			$('.albumList dl').removeClass('slide-top');
			$('.albumList dl').removeClass('slide-bottom');
			par.next().after(par);
			updateAlbumType()
		  },500)
		}
		setTimeout(function(){
		  $('.downSort').removeClass('disabled');
		})
	  });

	  // 新增相册
	  $(".save_btn").click(function(){
		  var t = $(this);
		  $(".pop_mask").show();
		  $(".pop").css({'transform':'translateY(0)','opacity':'1'})
	  })

	   $(".pop_mask,.pop .cancel_btn").click(function(){
		   $(".pop_mask").hide();
		   $(".pop").css('transform','translateY(3.3rem)');
		   setTimeout(function(){
			   $(".pop").css('opacity','0');
		   },300)
	   });

	   $(".pop .sure_btn").click(function(){
		   var inp = $(".pop input").val();
		   if(inp =='' || inp == undefined){
			   showErrAlert(langData['business'][9][58]);  //'请输入相册名称'
			   return false;
		   }
		   updateAlbumType('add');
		   $(".pop_mask").click();
	   })


	  function updateAlbumType(action){
		  var albumsdata = []
		  $(".albumList dl").each(function(i){
			  var dl = $(this)
			  var typename = dl.find('dt').text();
			  var aid = dl.attr('data-id');
			  var weight = i;
			  var album = {
				  id:aid,
				  weight:weight,
				  val:typename
			  }
			  albumsdata.push(JSON.stringify(album))
		  })
		  if(action=='add'){
			  var newAlbum = {
				  id:$(".pop").attr('data-id'),
				  weight: $(".albumList dl").length,
				  val:$(".pop input").val()
			  }
			   albumsdata.push(JSON.stringify(newAlbum))
		  }
		  $.ajax({
		  	url: "/include/ajax.php?service=business&action=updateAlbumsType",
		  	type: "POST",
			data:"data=["+albumsdata.join(",")+"]",
		  	async: true,
		  	dataType: "json",
		  	success: function (data) {
		  		if(data.state == 100){
					showErrAlert(langData['siteConfig'][20][244]);  //操作成功
					if(action=='add'){
						var newA = data.info[data.info.length-1]
						window.location.href = urlPath + '/fabu-business-albums.html?typeid='+newA.id
					}
				}else{
					showErrAlert(data.info)
				}
			},
			error: function(data) {showErrAlert(data.info)},
		});
	  }



})
