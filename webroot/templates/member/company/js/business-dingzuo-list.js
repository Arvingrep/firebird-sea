$(function(){

  //公共方法
  var init = {
  	/**
  	 * 提示信息
  	 * param string type 类型： loading warning success error
  	 * param string message 提示内容
  	 * param string hide 是否自动隐藏 auto
  	 */
  	showTip: function(type, message, hide){
  		var obj = $(".w-tip");

  		if(obj.html() != undefined){
  			obj.remove();
  		}
  		$("body").append('<div class="w-tip"><span class="msg '+type+'">'+message+'</span></div>');

  		if(hide == "auto"){
  			setTimeout(function(){
  				$(".w-tip").stop().fadeOut("fast", function(){
  					$(".w-tip").remove();
  				});
  			}, 3000);
  		}
  	}

  	//删除提示信息
  	,hideTip: function(){
  		var obj = $(".w-tip");
  		setTimeout(function(){
  			obj.fadeOut("fast", function(){
  				obj.remove();
  			});
  		}, 500);
  	}

  	//异步操作
  	,operaJson: function(url, action, callback){
  		$.ajax({
  			url: url,
  			data: action,
  			type: "POST",
  			dataType: "json",
  			success: function (data) {
  				typeof callback == "function" && callback(data);
  			},
  			error: function(){
  				init.showTip("error", langData['siteConfig'][20][183]);
  			}
  		});
  	}

  };



	//全选
	$(".checkall").bind("click", function(){

		var checkbox = $(this).closest(".cats-table").find("tbody input[type=checkbox]");
		if($(this).is(":checked")){
			checkbox.attr("checked", true);
		}else{
			checkbox.attr("checked", false);
		}

	});

	//单选
	$(".cats-table").bind("click", function(){

		var checkbox = $(this).closest(".cats-table").find("tbody input[type=checkbox]").length,
			checked = $(this).closest(".cats-table").find("tbody input[type=checkbox]:checked").length;

		if(checkbox == checked){
			$(".checkall").attr("checked", true);
		}else{
			$(".checkall").attr("checked", false);
		}

		if(checked > 0){
			$(".delchecked").show();
			$(".delchecked").next().hide();
		}else{
			$(".delchecked").hide();
			$(".delchecked").next().show();
		}

	});


  //选中一级分类
  $(".cats-table").delegate(".sup input[type=checkbox]", "click", function(){
    var checked = $(this).is(":checked"), parent = $(this).closest("tbody");
    if(checked){
      parent.find(".sub input[type=checkbox]").parent().addClass("checked");
      parent.find(".sub input[type=checkbox]").attr("checked", true);
    }else{
      parent.find(".sub input[type=checkbox]").parent().removeClass("checked");
      parent.find(".sub input[type=checkbox]").attr("checked", false);
    }
  });

  //新增一级
  var moreHtml = '';
  if(dopost == 'table'){
    // moreHtml = '<input type="text" data-type="min" value="" placeholder="桌位最少人数" class="min" /><input type="text" data-type="max" value="" placeholder="桌位最多人数" class="max" />';
  }
  var newSupHtml = '<tbody><tr class="sup" data-id=""><td><input type="checkbox" name="ids" value=""></td><td class="tit"><a href="javascript:;" class="fold"></a><input type="text" data-id="" value="" class="name" />'+moreHtml+'</td><td><a href="javascript:;" class="up">'+langData['siteConfig'][26][13]+'</a><a href="javascript:;" class="down">'+langData['siteConfig'][26][14]+'</a></td><td><a href="javascript:;" class="deletetr" title="'+langData['siteConfig'][6][8]+'">'+langData['siteConfig'][6][8]+'</a></td></tr><tr class="add-sub"><td></td><td colspan="3" class="tit"><span class="plus-icon"></span><a href="javascript:;" class="add-type">'+langData['siteConfig'][6][91]+'</a></td></tr></tbody>';

  //头部新增
  $("#addNewType").bind("click", function(){
    $(".cats-table").prepend(newSupHtml);
    $(".cats-table tbody:first-child").find(".name").focus();
    $(".stopdrag").fadeIn();
    $("tbody.empty").remove();
  });

  //底部新增
  $("#addNewType1").bind("click", function(){
    $(".cats-table").append(newSupHtml);
    $(".cats-table tbody:last-child").find("input").focus();
    $(".stopdrag").fadeIn();
    $("tbody.empty").remove();
  });

  //新增二级
  var newSubHtml = '<tr class="sub" data-id=""><td><input type="checkbox" name="ids" value=""></td><td class="tit"><span class="plus-icon"></span><input type="text" data-id="" value="" /></td><td><a href="javascript:;" class="up">'+langData['siteConfig'][26][13]+'</a><a href="javascript:;" class="down">'+langData['siteConfig'][26][14]+'</a></td><td><a href="javascript:;" class="deletetr" title="'+langData['siteConfig'][6][8]+'">'+langData['siteConfig'][6][8]+'</a></td></tr>';
  $(".cats-table").delegate(".add-type", "click", function(){
    var t = $(this).closest("tr");
    t.before(newSubHtml);

    t.prev("tr").find(".tit input").focus();
    if(dopost == 'time'){
      inpck(t.prev("tr").find(".tit input"));
    }

    $(".stopdrag").fadeIn();
  });


  //单个折叠、展开
  $(".cats-table").delegate(".fold", "click", function(){
    var t = $(this), tr = t.closest(".sup"), siblings = tr.siblings(".sub, .add-sub");
    if(t.hasClass("unfold")){
      t.removeClass("unfold");
      siblings.show();
    }else{
      t.addClass("unfold");
      siblings.hide();
    }
  });

  //全部折叠
  $("#fold").bind("click", function(){
    $(".cats-table .fold").addClass("unfold");
    $(".cats-table .sub, .cats-table .add-sub").hide();
  });

  //全部展开
  $("#unfold").bind("click", function(){
    $(".cats-table .fold").removeClass("unfold");
    $(".cats-table .sub, .cats-table .add-sub").show();
  });


  //排序向上
  $(".cats-table").delegate(".up", "click", function(){
    var t = $(this), parent = t.closest("tr"), index = parent.index();

    if(index == 1) return;

    //一级分类
    if(parent.hasClass("sup")){

      parent = parent.parent();
      parent.after(parent.prev("tbody"));

    }else{
      parent.after(parent.prev("tr"));
    }

    $(".stopdrag").show();

  });

  //排序向下
  $(".cats-table").delegate(".down", "click", function(){
    var t = $(this), parent = t.closest("tr"), index = parent.index();

    //一级分类
    if(parent.hasClass("sup")){

      parent = parent.parent();
      var length = parent.siblings("tbody").length + 1;

      if(index != length){
        parent.before(parent.next("tbody"));
      }

    }else{
      var length = parent.siblings(".sub").length + 1;
      if(index != length){
        parent.before(parent.next("tr"));
      }
    }

    $(".stopdrag").show();

  });


  //input焦点离开自动保存
  $(".cats-table").delegate("input[type=text]", "blur", function(){
    var t = $(this), id = t.closest("tr").attr("data-id"), type = t.attr("data-type") ? t.attr("data-type") : 'typename', value = t.val();

    if(id != "" && id != 0){
      init.operaJson("/include/ajax.php?service="+modelType+"&action=dingzuoUpdateCategory&id="+id, "field="+type+"&typename="+value+"&tab="+dopost, function(data){
        if(data.state == 100){
          init.showTip("success", data.info, "auto");
        }else{
          init.showTip("error", data.info, "auto");
        }
      });
    }
  });


  //批量删除
  $(".delchecked").bind("click", function(){

    var tips = langData['siteConfig'][20][211];
    $(".cats-table tr").each(function(){
      var t = $(this), checked = t.find("input[type=checkbox]").is(":checked");
      if(checked){
        tips = $(this).hasClass("sup") ? langData['siteConfig'][27][84] : tips;
      }
    });

    $.dialog.confirm(tips, function(){
      var ids = [];
      $(".cats-table tr").each(function(){
        var checkbox = $(this).find("input[type=checkbox]"), id = checkbox.val(), checked = checkbox.is(":checked");

        if(checked){
          //如果是数据库信息
          if(id){
            ids.push(id);

          //新增的直接删除
          }else{
            $(this).remove();
          }
        }

      });

      //异步删除
      if(ids){
        del(ids.join(","));
      }

    });

  });

  //单个删除
  $(".cats-table").delegate(".deletetr", "click", function(){
    var t = $(this).closest("tr"), id = t.data("id");

    if(id == ""){
      //一级
      if(t.hasClass("sup")){
        t.parent().remove();
      }else{
        t.remove();
      }
      checkNewType();
      return;
    }

    var tips = langData['siteConfig'][20][211];
    if(t.hasClass("sup")){
      tips = langData['siteConfig'][27][84];
    }

    $.dialog.confirm(tips, function(){

      //异步删除
      del(id, t);

    });

  });


  //异步删除分类
  function del(id, th){
    init.operaJson("/include/ajax.php?service="+modelType+"&action=dingzuoDelCategory&tab="+dopost, "id="+id, function(data){
      if(data.state == 100){
        init.showTip("success", data.info, "auto");

        if(!th){
          var ids = id.split(",");
          for(var i = 0; i < ids.length; i++){
            var t = $("tr[data-id="+ids[i]+"]");
            if(t.hasClass("sup")){
              t.parent().remove();
            }else{
              t.remove();
            }
          }
        }else{
          if(th.hasClass("sup")){
            th.parent().remove();
          }else{
            th.remove();
          }
        }

        checkNewType();

      }else{
        $.dialog.alert(data.info);
      }

    });
  }


  //判断是否还有新增的分类，如果没有则隐藏保存按钮
  function checkNewType(){

    var count = 0;

    $(".cats-table tr").each(function(){
      var id = $(this).data("id");
      if(id == ""){
        count++;
      }
    });

    if(count == 0){
      $(".stopdrag").fadeOut();
    }

  }


  //点击保存
  $(".stopdrag a").bind("click", function(){
    saveOpera();
  });

  //保存
  function saveOpera(){

    var first = $(".cats-table tr.sup"), json = '[';
    for(var i = 0; i < first.length; i++){
      (function(){
        var html = arguments[0], count = 0, jArray = $(html).siblings(".sub"), id = $(html).data("id"), val = $(html).find("input[type=text]").val();

        if(jArray.length > 0 && val != ""){
          json = json + '{"id": "'+id+'", "name": "'+encodeURIComponent(val)+'", "lower": [';
          for(var k = 0; k < jArray.length; k++){

              var id = $(jArray[k]).data("id"), val = $(jArray[k]).find("input[type=text]").val();
              if(val != ""){
                json = json + '{"id": "'+id+'", "name": "'+encodeURIComponent(val)+'"},';
              }else{
                count++;
              }

          }
          json = json.substr(0, json.length-1);
          if(count == jArray.length){
            json = json + 'null},';
          }else{
            json = json + ']},';
          }
        }else{
          if(val != ""){
            json = json + '{"id": "'+id+'", "name": "'+encodeURIComponent(val)+'", "lower": null},';
          }
        }
      })(first[i]);
    }
    json = json.substr(0, json.length-1);
    json = json + ']';

    if(json == "]") return false;

    init.showTip("loading", langData['siteConfig'][27][85]+"...");
    init.operaJson("/include/ajax.php?service="+modelType+"&action=dingzuoOperaCategory", "data="+json+"&type="+dopost, function(data){
      if(data.state == 100){
        init.showTip("success", data.info, "auto");
        location.reload();
      }else{
        init.showTip("error", data.info, "auto");
      }
    });

  }


  //时间
  if(dopost == 'time'){
    $("body").delegate(".sub input", "click", function(){
      inpck($(this));
    });

    function inpck(obj){
      var inp = obj, id = inp.attr('id');
      if(id == undefined){
        id = 'time_' + new Date().getTime();
        inp.attr('id', id);
      }
      WdatePicker({
        el: id,
        dateFmt: 'H:mm',
        // doubleCalendar: true,
        isShowClear: false,
        isShowOK: false,
        // isShowToday: false,
        // minDate: '%y-%M-{%d+1}',
        onpicking: function(dp){

        }
      });
    }

  }

});
