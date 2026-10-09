$(function(){






    //地图标注
	var init = {
		popshow: function() {
			var src = "/api/map/mark.php?mod=shop",
					address = $("#address").val(),
					lnglat = $("#lnglat").val();
			if(address != ""){
				src = src + "&address="+address;
			}
			if(lnglat != ""){
				src = src + "&lnglat="+lnglat;
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
		$("#lnglat").val(lng+","+lat);
		if($("#address").val() == ""){
			$("#address").val(address).blur();
		}
		init.pophide();
	});


    $("#fabuForm").submit(function(e){
        e.preventDefault();
        return false;
    });
    $("#submit").click(function(){
        
        var t = $(this);
        if(t.hasClass('disabled')) return false;
        t.addClass('disabled');
        var form = $("#fabuForm");
        var idStr  = '';
        if(id){
            idStr = '&id='+id;
        }
        $.ajax({
            url:'/include/ajax.php?service=paimai&action=storeConfig' + idStr,
            type:'post',
            data:form.serialize(),
            dataType:'json',
            success:function(data){
                t.removeClass('disabled');
                if(data.state == 100){
                    $.dialog.alert(data.info);
                }else{
                    $.dialog.alert(data.info);
                    
                }
            },
            error:function(err){
                t.removeClass('disabled');
                $.dialog.alert(err.info);
            }
        })
    })
})