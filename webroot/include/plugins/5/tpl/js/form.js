//实例化编辑器
var ue = UE.getEditor('body');

$(function () {

	var result = function(state, title, html){
		$('body').html('<dl class="result fn-clear"><dt><img src="tpl/images/'+state+'.png" /></dt><dd><h5>'+title+'</h5>'+html+'</dd></dl>');
	}

	//初始加载数据
	function getData(){
		if(remoteUrl != ''){
			$('.loading').show();
			$.ajax({
				url: "getInfo.php",
				data: "url=" + encodeURIComponent(remoteUrl),
				type: "POST",
				dataType: "json",
				success: function(data){
					$('.loading').hide();
					if(data.state == 100 && data.title && data.content){
						$('#title').val(data.title);
						$('#source').val(data.source);
						$('#sourceurl').val(data.url);
						ue.setContent(data.content);
						$('#keywords').val(data.keywords);
						$('#description').val(data.description);
					}else{
						$('.loading').hide();
						result('error', (data.info ? data.info : '要转载的网站内容解析失败！'), '<a href="javascript:;" onclick="location.reload();">点击重试</a>');
					}
				},
				error: function(){
					$('.loading').hide();
					result('error', '网络错误，信息采集失败！', '<a href="javascript:;" onclick="location.reload();">点击重试</a>');
				}
			});
		}else{
			$('.loading').hide();
			result('error', '要转载的网址读取失败！', '<a href="javascript:;" onclick="location.reload();">点击重试</a>');
		}
	}
	getData();

  //填充城市列表
  huoniao.buildAdminList($("#cityid"), cityList, '请选择分站', 0);
  $(".chosen-select").chosen();

	var init = {
		//菜单递归分类
		selectTypeList: function(){
			var typeList = [];
			typeList.push('<ul class="dropdown-menu">');
			typeList.push('<li><a href="javascript:;" data-id="0">选择分类</a></li>');

			var l=typeListArr.length;
			for(var i = 0; i < l; i++){
				(function(){
					var jsonArray =arguments[0], jArray = jsonArray.lower, cl = "";
					if(jArray.length > 0){
						cl = ' class="dropdown-submenu"';
					}
					typeList.push('<li'+cl+'><a href="javascript:;" data-id="'+jsonArray["id"]+'">'+jsonArray["typename"]+'</a>');
					if(jArray.length > 0){
						typeList.push('<ul class="dropdown-menu">');
					}
					for(var k = 0; k < jArray.length; k++){
						if(jArray[k]['lower'] != null){
							arguments.callee(jArray[k]);
						}else{
							typeList.push('<li><a href="javascript:;" data-id="'+jArray[k]["id"]+'">'+jArray[k]["typename"]+'</a></li>');
						}
					}
					if(jArray.length > 0){
						typeList.push('</ul></li>');
					}else{
						typeList.push('</li>');
					}
				})(typeListArr[i]);
			}

			typeList.push('</ul>');
			return typeList.join("");
		}
	};

	//填充栏目分类
	$("#typeBtn").append(init.selectTypeList());

	//二级菜单点击事件
	$("#typeBtn a").bind("click", function(){
		var id = $(this).attr("data-id"), title = $(this).text();
		$("#typeid").val(id);
		$("#typeBtn button").html(title+'<span class="caret"></span>');
	});

	//提交表单
	$("#btnSubmit").bind("click", function(event){
		event.preventDefault();
		var t            = $(this),
			typeid       = $("#typeid").val(),
      cityid       = $("#cityid").val(),
			title        = $("#title").val(),
			keywords     = $("#keywords"),
			description  = $("#description"),
			tj           = true;

		//分类
		if(typeid == "" || typeid == 0){
			alert('请选择分类');
			return false;
		}

    //城市
    if(cityid == '' || cityid == 0){
      alert('请选择城市');
      return false;
    };

		//标题
		if(title == ''){
			alert('请填写标题');
      return false;
		};

		ue.sync();
		t.attr("disabled", true);

		if(tj){
			$.ajax({
				type: "POST",
				url: "form.php",
				data: $(this).parents("form").serialize() + "&submit=" + encodeURI("提交"),
				dataType: "json",
				success: function(data){
					if(data.state == 100){
						result('success', '发布成功！', '<a href="'+data.url+'" target="_blank">点击查看文章</a>');
					}else{
						alert(data.info);
						t.attr("disabled", false);
					};
				},
				error: function(msg){
					alert("网络错误，发布失败，请刷新页面重试！");
					t.attr("disabled", false);
				}
			});
		}
	});




});
