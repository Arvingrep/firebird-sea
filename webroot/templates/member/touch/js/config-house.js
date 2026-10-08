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
							cl += '    ';
							if(jArray[k]['lower'] != ""){
								arguments.callee(jArray[k]);
							}else{
								typeList.push('<a href="javascript:;" data="'+jArray[k]["id"]+'">'+cl+"|--"+jArray[k]["typename"]+'</a>');
							}
							if(jsonArray["lower"] == null){
								cl = "";
							}else{
								cl = cl.replace("    ", "");
							}
						}
					}
				})(data[i]);
			}
			return typeList.join("");
		}
	}

  //导航
	$('.header-r .screen').click(function(){
		var nav = $('.nav'), t = $('.nav').css('display') == "none";
		if (t) {nav.show();}else{nav.hide();}
	})

  var id0 = $('.area1').val(), adr2 = $('#addrname1').val();
  if(id0 && adr2 != ''){
    getaddr(id0, adr2);
  }

  //小区模糊搜索
  if($('#communitytxt').size() > 0){
    $('#communitytxt').autocomplete({
      serviceUrl: '/include/ajax.php?service=house&action=communityList&allcity=1',
      paramName: 'keywords',
      dataType: 'jsonp',
      transformResult: function(data){
        var arr = [], dataArr = [];
        arr['suggestions'] = [];
        if(data && data.state == 100){
          var list = data.info.list;
          for(var i = 0; i < list.length; i++){
            dataArr[i] = [];
            dataArr[i]['id']      = list[i].id;
            dataArr[i]['title']   = list[i].title;
            dataArr[i]['address'] = list[i].address;
            dataArr[i]['price']   = list[i].price;
          }
        }

        arr['suggestions'] = $.map(dataArr, function (value, key) {
          return { value: value.title, data: value.id, address: value.address, price: value.price };
        })
        return arr;
      },
      onSelect: function(suggestion) {
        $('#community').val(suggestion.data);
        unitPrice = suggestion.price;
      },
      lookupFilter: function(suggestion, originalQuery, queryLowerCase) {
        var re = new RegExp('\\b' + $.Autocomplete.utils.escapeRegExChars(queryLowerCase), 'gi');
        return re.test(suggestion.value);
      }
    });
  }

  //公司模糊搜索
  $('#company').autocomplete({
    serviceUrl: '/include/ajax.php?service=house&action=zjCom',
    paramName: 'title',
    dataType: 'jsonp',
    transformResult: function(data){
      var arr = [], dataArr = [];
      arr['suggestions'] = [];
      if(data && data.state == 100){
        var list = data.info;
        for(var i = 0; i < list.length; i++){
          dataArr[i] = [];
          dataArr[i]['id']      = list[i].id;
          dataArr[i]['title']   = list[i].title;
        }
      }

      arr['suggestions'] = $.map(dataArr, function (value, key) {
        return { value: value.title, data: value.id, address: value.address, price: value.price };
      })
      return arr;
    },
    onSelect: function(suggestion) {
      $('#zjcom').val(suggestion.data);
    },
    lookupFilter: function(suggestion, originalQuery, queryLowerCase) {
      var re = new RegExp('\\b' + $.Autocomplete.utils.escapeRegExChars(queryLowerCase), 'gi');
      return re.test(suggestion.value);
    }
  });


  // 选择区域
  $(".area1").change(function(){
    var id = $(this).val();
    getaddr(id)
  });

$(".list").delegate(".area2", "change", function(){
      var id = $(this).val();
      $('#addr').attr('value',id);

})

  // 删除已添加的图片
  $('.addimg .close').click(function(){
    var t = $(this), li = t.parents('li'), ul = li .parents('ul');
    li.remove();
    if ($('.addimg li').length == 1) {
      ul.addClass('noimg')
    }
  })


  //提交发布
	$("#submit").bind("click", function(event){

		event.preventDefault();

    var form = $("#fabuForm"), action = form.attr("action"), url = form.attr("data-url"), tj = true;

    var t       = $(this),
        company = $("#company").val(),
        zjcom   = $("#zjcom").val(),
        store   = $("#store").val(),
        addr    = $("#addr").val(),
        litpic  = $("#litpic"),
        error   = $('.error'),
        text    = error.find('p');

		if(t.hasClass("disabled")) return;


    if (company == "" && zjcom == "") {
      showMsg('请输入所属公司');
      tj = false;
    }
    else if(store == ""){
      showMsg('请输入所在门店');
      tj = false;
		}
    else if(addr == "" || addr == 0){
      showMsg('请选择服务区域');
      tj = false;
    }
    else if(litpic.find('li.item').length == 0){
      showMsg('请上传名片');
      tj = false;
		}

    if(tj){
      var data = form.serialize();
      data = form.serialize() + '&litpic='+litpic.find('.item img').attr('data-val')
    }
    if(!tj) return false;

    $.ajax({
      url: action,
      data: data,
      type: "POST",
      dataType: "jsonp",
      success: function (data) {
        if(data && data.state == 100){
          alert(data.info);
          location.reload();
        }else{
          alert(data.info);
          t.removeClass("disabled").html("重新提交");
          $("#verifycode").click();
        }
      },
      error: function(){
        alert("网络错误，请重试！");
        t.removeClass("disabled").html("重新提交");
        $("#verifycode").click();
      }
    });


	});


  //更新验证码
	var verifycode = $("#verifycode").attr("src");
	$("#verifycode").bind("click", function(){
		$(this).attr("src", verifycode+"?v="+Math.random());
	});


})

function getaddr(id,sname){
  $.ajax({
    url: "/include/ajax.php?service=house&action=addr&type="+id,
    type: "GET",
    dataType: "json",
    success: function (data) {
      if(data && data.state == 100){
        var list = [], info = data.info;
        list.push('<option value="0"><a href="javascript:;">请选择</a></option>');
        for(var i = 0; i < info.length; i++){
          var selected = '';
          if(sname != undefined && $.trim(sname) == $.trim(info[i].typename)){
            selected = ' selected="selected"';
          }
          list.push('<option value="'+info[i].id+'"'+selected+'><a href="javascript:;">'+info[i].typename+'</a></option>');
        }
        $(".area2").html(list.join("")).show();
      }
    }
  });
}

// 错误提示
function showMsg(str){
  var o = $(".error");
  o.html('<p>'+str+'</p>').show();
  setTimeout(function(){o.hide()},1000);
}
