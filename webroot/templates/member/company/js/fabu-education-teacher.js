$(function(){
	//教学科目
	$(".tags_enter").blur(function() { //焦点失去触发
        var txtvalue=$(this).val().trim();
        if(txtvalue!=''){
            addTag($(this));
        }
    }).keydown(function(event) {
        var key_code = event.keyCode;
        var txtvalue=$(this).val().trim();
        if (key_code == 13 && txtvalue != '') { //enter
            addTag($(this));
        }
        if (key_code == 32 && txtvalue!='') { //space
            addTag($(this));
        }
        if (key_code == 13) {
            return false;
        }
	});
	$(".close").live("click", function() {
        $(this).parent(".tag").remove();
    });

	//下拉弹窗
    $('.w-form #fabuForm .down-div .inp').click(function(e){
        var par = $(this).closest('.down-div');
        var downCon = par.find('.time_choose');
        if(!par.hasClass('curr')){
            par.addClass('curr');
            $('.time_choose').removeClass('active');
            downCon.addClass('active');
        }else{
            par.removeClass('curr');
            downCon.removeClass('active');
        }
            
        $(document).one('click',function(){
            par.removeClass('curr');
            downCon.removeClass('active');
        })
        e.stopPropagation();
    })

    //选择下拉
    $('.time_choose p').click(function(){
        $(this).addClass('curr').siblings('p').removeClass('curr');
        var par = $(this).closest('.time_choose');
        var timeDiv = $(this).closest('.down-div').find('.time-div');
        var tid = $(this).find('a').attr('data-id');
        var txt = $(this).find('a').text();
        par.siblings('input').val(tid);
        if(timeDiv.hasClass('huNum')){
            timeDiv.find('input').val(tid);
        }else{
            timeDiv.find('input').val(txt);
        }
        var pardl = $(this).closest('dl');
        var hline = pardl.find(".tip-inline");
        hline.removeClass().addClass("tip-inline success").html("<s></s>");
        
    })

	//提交发布
    $("#submit").bind("click", function(event){

        event.preventDefault();

        //教学科目
        var tags = [];
        $('.tags').find('.tag').each(function(){
            var t = $(this), val = t.attr('data-val');
            tags.push(val);
        })
        $('#tag_shop').val(tags.join(','));

        var t       = $(this),
                title  = $("#title"),
                photo   = $("#photo"),
                educationname = $("#educationname"),
                educations    = $("#educations"),
                teachingagename   = $("#teachingagename"),
                teachingage   = $("#teachingage"),
                tagshop   = $("#tag_shop"),
                schoolName   = $("#school_name");

        if(t.hasClass("disabled")) return;

        var offsetTop = 0;
        
        if($.trim(title.val()) == "" || title.val() == 0){
			var stip = title.data('title');
			title.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+stip);
			offsetTop = offsetTop == 0 ? title.position().top : offsetTop;
		}
		
        

        if(photo.val() == ''){
            $.dialog.alert('请上传头像');
            offsetTop = $('#listSection1').position().top;
        }

        if(schoolName.val() == ''){
            var hline = schoolName.siblings(".tip-inline"), tips = schoolName.data("title");
            hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
            offsetTop = schoolName.position().top;
        }

        if(educations.val() == ''){
            var pardl = educations.closest('dd');
            var hline = pardl.find(".tip-inline"), tips = educationname.data("title");
            hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
            offsetTop = educations.offset().top;
        }

        if(educations.val() == ''){
            var pardl = educations.closest('dd');
            var hline = pardl.find(".tip-inline"), tips = educationname.data("title");
            hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
            offsetTop = educations.offset().top;
        }

        if(teachingage.val() == ''){
            var pardl = teachingage.closest('dd');
            var hline = pardl.find(".tip-inline"), tips = teachingagename.data("title");
            hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
            offsetTop = teachingage.offset().top;
        }

        if(tagshop.val() == ''){
            $.dialog.alert('请输入教学科目');
            offsetTop = $('#tags').position().top;
        }


        if(offsetTop){
            $('html, body').animate({scrollTop: offsetTop - 5}, 300);
            return false;
        }


        var form = $("#fabuForm"), action = form.attr("action"), url = form.attr("data-url");
        
        t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");  //提交中

        $.ajax({
            url: action,
            data: form.serialize(),
            type: "POST",
            dataType: "json",
            success: function (data) {
                if(data && data.state == 100){
                    
                    var tip = langData['siteConfig'][20][341];
                    if(id != undefined && id != "" && id != 0){
                        tip = langData['siteConfig'][20][229];
                    }
                    t.removeClass("disabled").html(langData['siteConfig'][11][19]);   //立即发布
                    $.dialog.alert(tip)
                    location.href = url;
                }else{
                    $.dialog.alert(data.info);
                    t.removeClass("disabled").html(langData['siteConfig'][11][19]);   //立即发布
                    $("#verifycode").click();
                }

            },
            error: function(){
                $.dialog.alert(langData['siteConfig'][20][184]);  //加载中，请稍候
                t.removeClass("disabled").html(langData['siteConfig'][11][19]);//立即发布
                $("#verifycode").click();
            }
        });


    });


})
function addTag(obj) {
	var tag = obj.val();
	if (tag != '') {
		var i = 0;
		$(".tag").each(function() {
			if ($(this).text() == tag + "×") {
				$(this).addClass("tag-warning");
				setTimeout("removeWarning()", 400);
				i++;
			}
		})
		obj.val('');
		if (i > 0) { //说明有重复
			return false;
		}
		$("#tag_shop").before("<span class='tag' data-val='"+tag+"'>" + tag + "<button class='close' type='button'>×</button></span>"); //添加标签
	}
}

function removeWarning() {
    $(".tag-warning").removeClass("tag-warning");
}