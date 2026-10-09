//实例化编辑器

$(function(){

	huoniao.parentHideTip();

	var thisURL   = window.location.pathname;
		tmpUPage  = thisURL.split( "/" );
		thisUPage = tmpUPage[ tmpUPage.length-1 ];
		thisPath  = thisURL.split(thisUPage)[0];

	//举办时间
	$("#startdate,#enddate").datetimepicker({format: 'yyyy-mm-dd HH:mm:ss', minView: 3, autoclose: true, language: 'ch'});

	//表单验证
	$("#editform").delegate("input,textarea", "focus", function(){
		var tip = $(this).siblings(".input-tips");
		if(tip.html() != undefined){
			tip.removeClass().addClass("input-tips input-focus").attr("style", "display:inline-block");
		}
	});


	$("#editform").delegate("input,textarea", "blur", function(){
		var obj = $(this);
		huoniao.regex(obj);
	});

	$("#editform").delegate("select", "change", function(){
		if($(this).parent().siblings(".input-tips").html() != undefined){
			if($(this).val() == 0){
				$(this).parent().siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
			}else{
				$(this).parent().siblings(".input-tips").removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
			}
		}
	});

	//模糊匹配招聘会
	$("#fname").bind("input", function(){
		$("#fid").val("0");
		var t = $(this), val = t.val();
		if(val != ""){
			t.addClass("input-loading");
			huoniao.operaJson("jobFairsJoin_xc.php?dopost=checkFairs", "key="+val, function(data){
				t.removeClass("input-loading");
				if(!data) {
					$("#fairsList").html("").hide();
					return false;
				}
				var list = [];
				for(var i = 0; i < data.length; i++){
					list.push('<li data-id="'+data[i].id+'">'+data[i].title+'</li>');
				}
				if(list.length > 0){
					var pos = t.position();
					$("#fairsList")
						.css({"left": pos.left, "top": pos.top + 36, "width": t.width() + 12})
						.html('<ul>'+list.join("")+'</ul>')
						.show();
				}else{
					$("#fairsList").html("").hide();
				}
			});

		}else{
			$("#fairsList").html("").hide();
		}
    });

	//模糊匹配公司
	$("#company").bind("input", function(){
		$("#cid").val("0");
		var t = $(this), val = t.val();
		if(val != ""){
			t.addClass("input-loading");
			huoniao.operaJson("jobFairsJoin_xc.php?dopost=checkCompany", "key="+val, function(data){
				t.removeClass("input-loading");
				if(!data) {
					$("#companyList").html("").hide();
					return false;
				}
				var list = [];
				for(var i = 0; i < data.length; i++){
					list.push('<li data-id="'+data[i].id+'">'+data[i].title+'</li>');
				}
				if(list.length > 0){
					var pos = t.position();
					$("#companyList")
						.css({"left": pos.left, "top": pos.top + 36, "width": t.width() + 12})
						.html('<ul>'+list.join("")+'</ul>')
						.show();
				}else{
					$("#companyList").html("").hide();
				}
			});

		}else{
			$("#companyList").html("").hide();
		}
	});

	$("#fairsList").delegate("li", "click", function(){
		var name = $(this).text(), id = $(this).attr("data-id");
		$("#fname").val(name);
		$("#fid").val(id);
		$("#fairsList").html("").hide();
		checkGw();
		return false;
	});

	$("#companyList").delegate("li", "click", function(){
		var name = $(this).text(), id = $(this).attr("data-id");
		$("#company").val(name);
		$("#cid").val(id);
		$("#companyList").html("").hide();
		return false;
	});

	$(document).click(function (e) {
      var s = e.target;
      if (!jQuery.contains($("#fairsList").get(0), s)) {
          if (jQuery.inArray(s.id, "user") < 0) {
              $("#fairsList").hide();
          }
      }
  });

	$("#fname").bind("blur", function(){
		var t = $(this);
		if(t.val() != ""){
			checkGw();
		}else{
			t.siblings(".input-tips").removeClass().addClass("input-tips input-ok").html('<s></s>&nbsp;');
		}
	});

	function checkGw(){
		if($("#fname").val() != ""){
			$("#fname").siblings(".input-tips").removeClass().addClass("input-tips input-ok").html('<s></s>进行中的网络招聘会');
		}else{
			$("#fname").siblings(".input-tips").removeClass().addClass("input-tips input-error").html('<s></s>请从列表中选择招聘会');
		}
	}

	//搜索回车提交
    // $("#editform input").keyup(function (e) {
    //     if (!e) {
    //         var e = window.event;
    //     }
    //     if (e.keyCode) {
    //         code = e.keyCode;
    //     }
    //     else if (e.which) {
    //         code = e.which;
    //     }
    //     if (code === 13) {
    //         $("#btnSubmit").click();
    //     }
    // });

	var vm = new Vue({
		el: '#app',
		data:{
			job:{"name":"","number":1,"description":""},
			jobs:[
			]
		},
		methods:{
			del : function (index) {
				this.jobs.splice(index,1);
			},
			add : function () {
				let j = JSON.stringify(this.job);
				this.jobs.push(JSON.parse(j));
			}
		},
		mounted(){
			jobs = JSON.parse(join_jobs);
			this.jobs = jobs;
		}
	});

	//表单提交
	$("#btnSubmit").bind("click", function(event){
		event.preventDefault();
		var t   = $(this),
			id    = $("#id").val(),
			fname = $("#fname"),
			title = $("#title"),
			obj  = $("#obj");

		if($.trim(fname.val()) == ""){
			huoniao.goInput(fname);
			return false;
		};

		t.attr("disabled", true);

		//异步提交
		huoniao.operaJson("jobFairsJoin_xc.php", $("#editform").serialize() + "&submit="+encodeURI("提交")+"&jobs="+encodeURI(JSON.stringify(vm.jobs)), function(data){
			if(data.state == 100){
				if($("#dopost").val() == "Add"){

					huoniao.parentTip("success", "发布成功！<a href='"+data.url+"' target='_blank'>"+data.url+"</a>");
					huoniao.goTop();
					window.location.reload();

				}else{

					huoniao.parentTip("success", "修改成功！<a href='"+data.url+"' target='_blank'>"+data.url+"</a>");
					t.attr("disabled", false);

				}
			}else{
				$.dialog.alert(data.info);
				t.attr("disabled", false);
			};
		});
	});

});
