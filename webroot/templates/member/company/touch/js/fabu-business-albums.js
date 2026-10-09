var albumTypeArr = [],albumName;
$(function(){
	getphotos(id)
	function getphotos(id){
		$('body').append('<div class="loadingIcon"></div>')
		$.ajax({
			url: '/include/ajax.php?service=business&action=albums&u=1&page=1&pageSize=1000&typeid='+id,
			type: "GET",
			dataType: "json",
			success: function (data) {
				if(data.state==100){
					var list = data.info.list;
					var html = []
					for(var i = 0; i < list.length; i++){
						html.push('<li class="photo" data-id="'+list[i].id+'"><img src="'+list[i].litpic+'" ><div class="btns"><a href="javascript:;" class="del_img"></a><a class="fn-hide tochose"></a></div></li>')
					}
					$(".photoList li.photo").remove();
					$(".photoList ul").append(html.join(''))
				}
				$(".loadingIcon").remove()
			},
			error: function(data) {
				$(".loadingIcon").remove()
			},
		})
	}
	albumType();
	// 重命名
	$(".btnsbox .btn_group .rename").click(function(){
		$(".pop_mask").show();
		$(".pop").css({
			'transform':' translateY(0)',
			'opacity': '1'
		});

	});
	// 取消重命名
	$(".pop_mask,.pop .cancel_btn").click(function(){
		$(".pop_mask").hide();
		$(".pop").css({
			'transform':' translateY(3.3rem)',
		});
		setTimeout(function(){
			$(".pop").css({'opacity': '0'})
		},300)
	});

	// 确认重命名’
	$(".pop .sure_btn").click(function(){
		var t = $(this);
		var rename = $('.pop input').val();
		var newAlbum = albumTypeArr.find(checkAlbum);
		newAlbum.typename = rename;
		var albumType = [];
		albumTypeArr.forEach(function(val){
			var jsonA = {
					'id':val.id,
					'val':val.typename,
					'weight':val.weight,
				}
			albumType.push(JSON.stringify(jsonA))
		})
		$('.pop_mask').click();
		updateAlbum(t,albumType);

	});

	function checkAlbum(album) {
	    return album.id == id;
	}


	// 删除相册
	$(".del_album").click(function(){
		$(".delMask").addClass('show');
		$(".delAlert").show();

		// 取消删除’
		$(".delMask,.delAlert .cancelDel").click(function(){
			$(".delMask").removeClass('show');
			$(".delAlert").hide();
		});

		// 确认删除’
		$(".delAlert .sureDel").click(function(){
			$(".delMask").click();
			delAlbum(id)
		});
	});



	// 批量管理
	$('.btnsbox .btn_group .manage').click(function(){
		var t = $(this),par = t.closest('.btn_group');
		par.addClass('fn-hide');
		$('.photo').addClass('piliang_chose');
		$(".photo .btns").find('.tochose').removeClass('fn-hide');
		$(".photo .btns").find('.del_img').addClass('fn-hide');
		$(".pilia_btns").removeClass('fn-hide');
	});
	// 批量管理选择
	$('.photoList').delegate('li.piliang_chose','click',function(){
		var t = $(this);
		t.toggleClass('active');

	})
	// 取消批量管理
	$('.cancel_pl').click(function(){
		var t = $(this),par = t.closest('.pilia_btns');
		par.addClass('fn-hide');
		$('.photo').removeClass('piliang_chose active');
		$(".photo .btns").find('.del_img').removeClass('fn-hide');
		$(".photo .btns").find('.tochose').addClass('fn-hide');
		$(".btn_group").removeClass('fn-hide');
	});

	// 全选
	$(".all_chose").click(function(){
		var t = $(this);
		t.toggleClass('active');
		if(t.hasClass('active')){
			$('.photo').addClass('active');
		}else{
			$('.photo').removeClass('active');
		}
	})

	// // 上传相册照片
  var upslideShow = new Upload({
    btn: '.upload_btn',
    bindBtn: '',
    title: 'Images',
    mod: 'business',
    params: 'type=atlas',
    atlasMax: 5,
    deltype: 'delAtlas',
	del:'del_img',
    replace: true,
    fileQueued: function(file){
		$(".upload_btn").after('<li class="photo_new photo" id="'+file.id+'"></li>');
    },
    uploadSuccess: function(file, response){
      if(response.state == "SUCCESS"){
        $('#'+file.id).html('<img src="'+response.turl+'" data-url="'+response.url+'" alt=""><div class="btns"><a href="javascript:;" class="del_img"></a><a class="fn-hide tochose"></a></div>');
      }
    },
    uploadFinished: function(){
      if(this.sucCount == this.totalCount){
        // showErr('所有图片上传成功');
      }else{
        showErr((this.totalCount - this.sucCount) + langData['siteConfig'][44][19].replace('1',''));//1张图片上传失败
      }

      updateBanner();
    },
    uploadError: function(){

    },
    showErr: function(info){
      showErrAlert(info);
    }
  });

  $(".photoList").delegate('.del_img','click',function(){
	  var did = $(this).closest('.photo').attr('data-id');
	  var del = $(this),li = del.closest('.photo');
	  del.attr('disabled')
	  $.ajax({
	  	url: '/include/ajax.php?service=business&action=delalbums',
	  	data:{'id':did},
	  	type: "post",
	  	dataType: "json",
	  	success: function (data) {
	  		if(data.state==100){
	  			showErrAlert(langData['business'][9][28]);  //删除成功
				li.remove();
	  		}else{
	  			showErrAlert(data.info)
	  		}
	  		del.removeAttr('disabled')
	  	},
	  	error: function (data) {
	  		del.removeAttr('disabled')
	  	},
	  });
  })


   function updateBanner(){
      var banner = [];
      $(".photoList .photo_new").each(function(i){
          var src = $(this).children('img').attr('data-url');
          banner.push(src);
      })
      // $.post('/include/ajax.php?service=business&action=addalbums');
	  $.ajax({
	  	url: '/include/ajax.php?service=business&action=addalbums',
		data:{'typeid':id,'pics':banner.join(',')},
	  	type: "post",
	  	dataType: "json",
	  	success: function (data) {
			getphotos(id)
		},
		error: function (data) {},
	  });
    }


	// 批量删除图片
	$('.del_imgs').click(function(){
		var del = $(this);
		del.attr('disabled')
		var idArr = [];
		$(".photoList .active").each(function(){
			var t = $(this),tid = t.attr('data-id');
			idArr.push(tid)
		});
		$.ajax({
			url: '/include/ajax.php?service=business&action=delalbums',
			data:{'id':idArr.join(',')},
			type: "GET",
			dataType: "json",
			success: function (data) {
				if(data.state==100){
					console.log(data);
					$(".photoList .active").remove();
					showErrAlert(langData['business'][9][28]);  //删除成功
					$(".cancel_pl").click();
				}else{
					showErrAlert(data.info)
				}
				del.removeAttr('disabled')
			},
			error: function (data) {
				del.removeAttr('disabled')
			},
		});
	});

	// 获取相册分类
	function albumType(){
		$.ajax({
			url: '/include/ajax.php?service=business&action=albumstype',
			type: "GET",
			dataType: "json",
			success: function (data) {
				if(data.state==100){
					albumTypeArr = data.info;
					console.log(albumTypeArr)
					albumName = albumTypeArr.find(checkAlbum);
					$(".header-address").html(albumName.typename)
				}else{
					showErrAlert(data.info)
				}
			},
			error: function (data) {
				showErrAlert(data.info)
			},
		});
	};


	// 修改相册名字
	function updateAlbum(btn,data){
		btn.attr('disabled');
		$.ajax({
			url: "/include/ajax.php?service=business&action=updateAlbumsType",
			type: "POST",
			data:"data=["+data.join(",")+"]",
			dataType: "json",
			success: function(data){
				if(data && data.state == 100){
					showErrAlert(langData['business'][9][65]);  //修改成功
					btn.removeAttr('disabled');
					$(".header-address").html($(".pop input").val())
				}else{
					showErrAlert(data.info);
					btn.removeAttr('disabled');

				}
			}
		});
	}


	// 删除该相册
	function delAlbum(typeid){
		$.ajax({
			url: "/include/ajax.php?service=business&action=delAlbumsType&id="+typeid,
			type: "POST",
			dataType: "json",
			success: function(data){
				if(data.state == 100){
					showErrAlert(langData['business'][9][28]);  //删除成功
					setTimeout(function(){
						window.location.href = urlPath+'/business-albums.html'
					},2000)
				}
			}
		});
	}


})
