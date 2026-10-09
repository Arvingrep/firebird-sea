$(function(){

    //地图标注
    var init = {
        popshow: function() {
            var src = "/api/map/mark.php?mod=business",
                address = $("#address").val(),
                lng = $("#lng").val(),
                lat = $("#lat").val();
            if(address != ""){
                src = src + "&address="+address;
            }
            if(lng != "" && lat != ""){
                src = src + "&lnglat="+lng+','+lat;
            }
            $("#markPopMap").after($('<div id="shadowlayer" style="display:block"></div>'));
            $("#markDitu").attr("src", src);
            $("#markPopMap").show();
        },
        pophide: function() {
            $("#shadowlayer").remove();
            $("#markDitu").attr("src", "");
            $("#markPopMap").hide();
        }
    };

    $(".map-pop .pop-close, #cloPop").bind("click", function(){
        init.pophide();
    });

    $("#mark").bind("click", function(){
        init.popshow();
    });

    $("#okPop").bind("click", function(){
        var doc = $(window.parent.frames["markDitu"].document),
            lng = doc.find("#lng").val(),
            lat = doc.find("#lat").val(),
            address = doc.find("#addr").val();
        $("#lng").val(lng);
        $("#lat").val(lat);
        if($("#address").val() == ""){
            $("#address").val(address).blur();
        }
        init.pophide();
    });





	 //时间
	var selectDate = function(el, func){
		WdatePicker({
			el: el,
			isShowClear: false,
			isShowOK: false,
			isShowToday: false,
			qsEnabled: false,
			dateFmt: 'HH:mm',
			onpicked: function(dp){
				$("input[name='openStart']").parent().siblings(".tip-inline").removeClass().addClass("tip-inline success").html("<s></s>");
			}
		});
	}
	$(".timelist").on('focus','input.startime',function(){
		$(".timelist input").removeAttr('id')
		$(this).attr('id','openStart')
		selectDate("openStart");
	});
	$(".timelist").on('focus','input.stoptime',function(){
		$(".timelist input").removeAttr('id')
		$(this).attr('id','openEnd')
		selectDate("openEnd");
	})

	$(".addtime").click(function(){
		var t = $(this);
		$(".timelist input").removeAttr('id');
		var tlen = $(".timelist .input-append").length
		t.before('<div class="input-append input-prepend"><input type="text" class="startime" name="limit_time['+tlen+'][start]" class="inp"  size="5" maxlength="5" autocomplete="off" value="00:00"><span class="add-aft">到</span><input type="text" class="stoptime" name="limit_time['+tlen+'][stop]" class="inp" size="5" maxlength="5" autocomplete="off" value="23:00"><s class="del_time"></s></div>')

	});

    $('body').delegate('.del_time','click',function(){
        var t = $(this);
        t.closest('.input-prepend').remove();
    })
    getEditor("body");

    $('.radio span').bind('click', function(){
        var t = $(this);
        t.addClass('curr').siblings('span').removeClass('curr');
        t.siblings('input').val(t.data('id'));
        $('#qj_0, #qj_1').hide();
        $('#qj_' + t.data('id')).show();
    })


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


    $('#fabuForm').submit(function(e){
        e.preventDefault();

        if($('.uploadVideo').find('video').size() > 0) {
            $('#video').val($('.uploadVideo').find('video').attr('data-val'));
        }

        if($('#qj_type').val() == 0) {
            var qj_pics = [];
            $('.qj360').find('img').each(function(){
               var t = $(this), val = t.attr('data-val');
               qj_pics.push(val);
            });
            $('#qj_pics').val(qj_pics.join(','));
        }

        var tags = [];
        $('.tags').find('.tag').each(function(){
            var t = $(this), val = t.attr('data-val');
            tags.push(val);
        })
        $('#tag_shop').val(tags.join('|'));

		var times = [];
		$('.timelist').find('.input-append').each(function(){
		    var t = $(this);
			var os = t.find('input.startime').val();
			var oe = t.find('input.stoptime').val()
		    times.push(os+'-'+oe);
		})
		opentime = times.join(',')


        var addrid = $('.addrBtn').attr('data-id'), ids = $('.addrBtn').attr('data-ids'), cityid = 0;
        addrid = addrid === undefined ? 0 : addrid;
        cityid = ids === undefined ? 0 : ids.split(' ')[0];
        $('#addrid').val(addrid);
        $('#cityid').val(cityid);

        $('#submit').attr('disabled', true).html(langData['siteConfig'][7][9]+'...');   //保存中

        $.ajax({
            url: "/include/ajax.php?service=business&action=updateStoreConfig",
            type: "POST",
            data: $('#fabuForm').serialize()+'&opentimes='+opentime,
            dataType: "jsonp",
            success: function (data) {
                if(data && data.state == 100){
                    alert(langData['siteConfig'][6][39]);   //保存成功
                    location.reload();
                }else{
                    alert(data.info);
                    $('#submit').attr('disabled', false).html(langData['siteConfig'][6][200]);  //重新保存
                }
            },
            error: function(){
                alert(langData['siteConfig'][6][201]);//网络错误，保存失败，请稍候重试！
                $('#submit').attr('disabled', false).html(langData['siteConfig'][6][200]);//重新保存
            }
        });

    });



})


function getEditor(id){
    ue = UE.getEditor(id, {toolbars: [['fullscreen', 'undo', 'redo', '|', 'fontfamily', 'fontsize', '|', 'forecolor', 'bold', 'italic', 'underline', '|', 'justifyleft', 'justifycenter', 'justifyright', 'justifyjustify', '|', 'insertorderedlist', 'insertunorderedlist', '|', 'simpleupload', 'insertimage', 'insertvideo', 'attachment', 'insertframe', 'wordimage', 'inserttable', '|', 'link', 'unlink']], initialStyle:'p{line-height:1.5em; font-size:13px; font-family:microsoft yahei;}'});
    ue.on("focus", function() {ue.container.style.borderColor = "#999"});
    ue.on("blur", function() {ue.container.style.borderColor = ""})
}


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
