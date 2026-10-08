// var titleRegex       = '.{2,50}', titleErrTip = langData['siteConfig'][20][34];
// var writerRegex       = '.{2,20}', writerErrTip = langData['siteConfig'][20][37];
// var sourceRegex      = '.{2,20}', sourceErrTip = langData['siteConfig'][20][37];
// var keywordsRegex    = '.{2,50}', keywordsErrTip = langData['siteConfig'][20][34];
// var descriptionRegex = '.{10,200}', descriptionErrTip = langData['siteConfig'][20][36];
// var priceRegex       = '[1-9][0-9]{0,6}';
// var floatRegex       = '[0-9]+(.[0-9]+)?';
// var personRegex      = '.{2,15}', personErrTip = langData['siteConfig'][20][346];
// var telRegex         = '[0-9]{4,15}', telErrTip = langData['siteConfig'][20][525];

//编辑器配置
var ue = null;


$(function(){

	//多选
	$(".w-form").delegate("input[type=checkbox]", "click", function(){
		var t = $(this), dl = t.closest("dl"), name = t.attr("name"), tip = t.closest(".checkbox").data("title"), hline = dl.find(".tip-inline");
		if(dl.data("required") == 1){
			var val = $("input[name='"+name+"']:checked").val();
			if(val == undefined){
				hline.removeClass().addClass("tip-inline error").html("<s></s>"+tip);
			}else{
				hline.removeClass().addClass("tip-inline success").html("<s></s>"+tip);
			}
		}
	});

	//单选按钮组
	$(".w-form").delegate(".radio span", "click", function(){
		var t = $(this), dl = t.closest("dl"), id = t.attr("data-id"), hline = dl.find(".tip-inline");
		if(!t.hasClass("curr")){
			t.siblings("input[type=hidden]").val(id);
			hline.removeClass().addClass("tip-inline success").html("<s></s>");
			t.addClass("curr").siblings("span").removeClass("curr");
		}
	});

	//下拉菜单
	$(".w-form").delegate(".sel-group", "click", function(){
		var t = $(this);
		$(".sel-menu").hide();
		t.hasClass("open") ? (t.removeClass("open"), t.find(".sel-menu").hide()) : (t.addClass("open"), t.find(".sel-menu").show());
		t.siblings(".sel-group").removeClass("open").find(".sel-menu").hide();
		return false;
	});

	//下拉菜单赋值
	$(".w-form").delegate(".sel-menu a", "click", function(){
		var t = $(this), id = t.attr("data-id"), val = t.text(), par = t.closest(".sel-group"), input = par.next("input"), hline = par.parent().find(".tip-inline");
		t.closest(".sel-group").find(".sel").html(val+'<span class="caret"></span>');
		input.val(id);
		hline.removeClass().addClass("tip-inline success").html("<s></s>");
	});

	//点击空白位置隐藏下拉菜单内容
	$(document).click(function (e) {
		$(".sel-group").removeClass("open").find(".sel-menu").hide();
	});

	//表单提示
	$(".w-form").delegate("input[type=text], textarea", "focus", function(){
		var t = $(this), dl = t.closest("dl"), name = t.attr("name"), tip = t.data("title"), hline = t.siblings(".tip-inline");
		if(name == "price" || name == "proprice" || name == "area"){
			hline = t.parent().siblings(".tip-inline");
		}
		hline.removeClass().addClass("tip-inline focus").html("<s></s>"+tip);
	});

	$(".w-form").delegate("input[type=text], textarea", "blur", function(){
		var t = $(this), dl = t.closest("dl"), name = t.attr("name"), tip = t.data("title"), etip = tip, hline = t.siblings(".tip-inline"), check = true;
		if(name == "price" || name == "proprice" || name == "area"){
			hline = t.parent().siblings(".tip-inline");
		}

		if($.trim(t.val()) != ""){
			var regex = "";
			//判断标题
			if(name == "title"){
				regex = titleRegex;
				etip = titleErrTip;

			//作者
			}else if(name == "writer"){
				regex = writerRegex;
				etip = writerErrTip;

			//来源
			}else if(name == "souce"){
				regex = souceRegex;
				etip = souceErrTip;

			//关键词
			}else if(name == "keywords"){
				regex = keywordsRegex;
				etip = keywordsErrTip;

			//描述
			}else if(name == "description"){
				regex = descriptionRegex;
				etip = descriptionErrTip;

			//判断价格
			}else if(name == "price" || name == "area"){
				regex = floatRegex;

			//物业费
			}else if(name == "proprice"){
				regex = floatRegex;

			//联系人
			}else if(name == "person"){
				regex = personRegex;
				etip = personErrTip;

			//判断电话
			}else if(name == "tel"){
				regex = telRegex;
				etip = telErrTip;

			//验证码
			}else if(name == "vdimgck"){

				hline.removeClass().addClass("tip-inline loading").html("<s></s>");

				$.ajax({
					url: "/include/ajax.php?service=siteConfig&action=checkVdimgck&code="+t.val(),
					type: "GET",
					dataType: "jsonp",
					success: function (data) {
						if(data && data.state == 100){
							if(data.info == "error"){
								hline.removeClass().addClass("tip-inline error").html("<s></s>"+langData['siteConfig'][20][99]);  //验证码输入错误，请重试！
								$("#verifycode").click();
							}else{
								hline.removeClass().addClass("tip-inline success").html("<s></s>"+tip);
							}
						}
					}
				});

				return;

			}

			if(regex != ""){
				var exp = new RegExp("^" + regex + "$", "img");
				if(!exp.test($.trim(t.val()))){
					check = false;
				}
			}
		}

		if(dl.attr("data-required") == 1){
			if($.trim(t.val()) == "" || !check){
				hline.removeClass().addClass("tip-inline error").html("<s></s>"+etip);
			}else{
				hline.removeClass().addClass("tip-inline success").html("<s></s>"+tip);
			}
		}
	});

	//更新验证码
	var verifycode = $("#verifycode").attr("src");
	$("#verifycode").bind("click", function(){
		$(this).attr("src", verifycode+"?v="+Math.random());
	});

});

function getEditor(id){
	ue = UE.getEditor(id, {toolbars: [['fullscreen', 'undo', 'redo', '|', 'fontfamily', 'fontsize', '|', 'forecolor', 'bold', 'italic', 'underline', '|', 'justifyleft', 'justifycenter', 'justifyright', 'justifyjustify', '|', 'insertorderedlist', 'insertunorderedlist', '|', 'simpleupload', 'insertimage', 'insertvideo', 'attachment', 'insertframe', 'wordimage', 'inserttable', '|', 'link', 'unlink']], initialStyle:'p{line-height:1.5em; font-size:13px; font-family:microsoft yahei;}'});
	ue.on("focus", function() {ue.container.style.borderColor = "#999"});
	ue.on("blur", function() {ue.container.style.borderColor = ""})
}
