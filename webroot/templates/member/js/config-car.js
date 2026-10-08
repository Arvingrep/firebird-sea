$(function(){

  var init = {
		//树形递归分类
		treeTypeList: function(data){
			var typeList = [], cl = "";
			for(var i = 0; i < data.length; i++){
				(function(){
					var jsonArray =arguments[0], jArray = jsonArray.lower;
					typeList.push('<a href="javascript:;" data="'+jsonArray["id"]+'">'+cl+"|--"+jsonArray["typename"]+'</a>');
					if(jArray != undefined){
						for(var k = 0; k < jArray.length; k++){
							cl += '    ';
							if(jArray[k]['lower'] != ""){
								arguments.callee(jArray[k]);
							}else{
								typeList.push('<a href="javascript:;" data="'+jArray[k]["id"]+'">'+cl+"|--"+jArray[k]["typename"]+'</a>');
							}
							if(jsonArray["lower"] == null){
								cl = "";
							}else{
								cl = cl.replace("    ", "");
							}
						}
					}
				})(data[i]);
			}
			return typeList.join("");
		}
	}

  //发布房源子级菜单
  /* $(".main-tab .add").hover(function(){
    var t = $(this), dl = t.find("dl");
    if(dl.size() > 0){
      dl.show();
    };
  }, function(){
    var t = $(this), dl = t.find("dl");
    if(dl.size() > 0){
      dl.hide();
    };
  }); */

  // 头部基本信息
  $(".baseinfo .edit").click(function(){
    var t = $(this);
    t.closest('li').addClass('editing').find('input').prop('readonly', false)[0].select();
  })
  $(".baseinfo .close, .baseinfo .ok").click(function(){
    var t = $(this);
    t.closest('li').removeClass('editing').find('input').prop('readonly', true);
    $("#cancelSelectTxt")[0].select();
  })

  function setAddr(){
    var t = $('.addrBtn'), id = t.attr('data-id'), ids = t.attr('data-ids'), addr = 0, cityid = 0, cityname = '';
    if(id != undefined && id != ''){
      addr = id;
      cityid = ids.split(' ')[0];
      cityname = t.text().split('/')[0];
    }
    $('#addr').val(addr);
    $('#cityid').val(cityid);

    return {addr:addr,cityid:cityid,cityname:cityname};
  }

  function setSelectedCummunity(){
    var txt = [], ids = []
    $('.communityList a.active').each(function(){
      var t = $(this), name = t.text(), id = t.attr('data-id');
      txt.push(name);
      ids.push(id);
    })
    var r = txt.join(' ');
    $('.communityBtn').text(r).attr('title', r);
    $('#community').val(ids.join(','));
  }
  // 调起小区弹框
  $(".communityBtn").click(function(){
    var r = setAddr();
    if(r.cityid == 0){
      $.dialog.alert(langData['siteConfig'][6][204], function(){   //请先选择服务区域
        setTimeout(function(){
          $('.addrBtn').trigger('click');
        }, 200)
      });
    }else{
      $('.communityBox .city span').text(r.cityname);
      var selectedIds = $('#community').val();
      var selectedIdsArr = selectedIds != '' ? selectedIds.split(',') : [];
      if($('.communityList').attr('data-addrid') != r.cityid){
        $('.communityList').attr("data-addrid", r.cityid);
        $('.communityList').html('<li class="loading">'+langData['siteConfig'][20][409]+'</li>');//正在获取，请稍后
        //获取小区
        $.ajax({
          url: "/include/ajax.php?service=house&action=communityList&addrid="+r.cityid,
          type: "GET",
          dataType: "jsonp",
          success: function (data) {
            if(data && data.state == 100){
              var list = data.info.list, community = [];
              for (var i = 0; i < list.length; i++) {
                var d = list[i];
                var py = d.py;
                if(!in_array(community, py)){
                  community[py] = [];
                }
                community[py].push(d);
              };
              var html = [];
              community.sort();
              for(var i in community){
                if(i == "in_array") continue;
                var o = community[i];
                html.push('<li><span class="tp">'+i+'</span><div class="tplist">');
                for(var n = 0; n < o.length; n++){
                  if(n == 'in_array') continue;
                  var cls = in_array(selectedIdsArr, o[n].id) ? ' class="active"' : '';
                  html.push('<a href="javascript:;" data-id="'+o[n].id+'"'+cls+'>'+o[n].title+'</a>');
                }
                html.push('</li>');
              }
              $('.communityList').html(html.join(""));
            }else{
              $('.communityList').html('<li class="loading">'+langData['siteConfig'][20][138]+'</li>');//暂无相关数据！
            }
          }
        });
      }
      $('.communityBox').show();

    }
  })
  // 点击小区
  $(".communityList").delegate("li a", "click", function(){
    var t = $(this);
    t.toggleClass("active");
    setSelectedCummunity();
  })

  // 重置已选小区
  $(".reset").click(function(){
    $(".communityList a.active").removeClass("active");
    setSelectedCummunity();
  })

  // 选择区域时关闭小区弹框
  $('.addrBtn').click(function(){
    $(".communityBox").hide();
    if($("#community").val() != ''){
      listenAddr();
    }
  })
  function listenAddr(){
    r = setAddr();
    var addrid_ = $('.communityList').attr('data-addrid');
    if(r.cityid != addrid_){
      $('.communityBtn').text('').attr('title', '');
      $('.communityList').html('');
      $('.community').val('');
    }else if($('.sel-group').hasClass('open')){
      setTimeout(function(){
        listenAddr();
      }, 500)
    }
  }

  $(document).click(function (e) {
    /* var s = e.target;
    if (!$.contains($("#selCommunity").get(0), s)) {
      $(".communityBox").hide();
    } */
  });


	//删除已选择的标签/技能（非浮窗）
	$(".selectedTag").delegate("span a", "click", function(){
		var pp = $(this).parent(), id = pp.attr("data-id"), input = pp.parent().siblings("input");
		pp.remove();

		var val = input.val().split(",");
		val.splice($.inArray(id,val),1);
		input.val(val.join(","));
	});



  //提交
  $("#submit").bind("click", function(event){
    event.preventDefault();

    $("#addr").val($(".addrBtn").attr("data-id"));
    var addrids = $('#selAddr .addrBtn').attr('data-ids').split(' ');
    $('#cityid').val(addrids[0]);

    $('.listSection').each(function(){
      var c = $(this), li = c.children('li'), inp = c.prev('input');
      if(li.length){
        inp.val(li.eq(0).find('img').attr('data-val'));
      } else{
        inp.val('');
      }
    })

    var t       = $(this),
        company = $("#company").val(),
        zjcom   = $("#zjcom").val(),
        store   = $("#store").val(),
        addr    = $("#addr").val(),
        litpic  = $("#litpic").val();

    if(t.hasClass("disabled")) return false;



    // if($.trim(store) == ""){
    //   $.dialog.tips(langData['siteConfig'][20][130], 2, "error.png");
    //   return false;
    // }

    if(addr == "" || addr == 0){
      $.dialog.tips(langData['siteConfig'][20][131], 2, "error.png");   //请选择服务区域！
      return false;
    }

    if(litpic == ""){
      $.dialog.tips(langData['siteConfig'][20][133], 2, "error.png"); //请上传名片！
      return false;
    }

    t.addClass("disabled").val(langData['siteConfig'][6][35]+"...");  //提交中

    var form = $("#fabuForm"), action = form.attr("action");

    $.ajax({
			url: action,
			data: form.serialize(),
			type: "POST",
			dataType: "jsonp",
			success: function (data) {
				if(data && data.state == 100){

					$.dialog({
						title: langData['siteConfig'][19][287],   //提示消息
						icon: 'success.png',
						content: data.info,
						ok: function(){
              location.reload();
            }
					});

				}else{
					$.dialog.alert(data.info);
					t.removeClass("disabled").html(langData['siteConfig'][6][118]);   //重新提交
					$("#verifycode").click();
				}
			},
			error: function(){
				$.dialog.alert(langData['siteConfig'][20][183]);  //网络错误，请稍候重试！
				t.removeClass("disabled").html(langData['siteConfig'][6][118]); //重新提交
				$("#verifycode").click();
			}
		});

  });

});

function in_array(arr, str){
  for(var i in arr){
    if(arr[i] == str) return true;
  }
  return false;
}
