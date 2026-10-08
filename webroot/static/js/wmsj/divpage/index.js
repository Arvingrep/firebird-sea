$(function(){

    $(".chzn-select").chosen();

    var adBody = $("#adBody").html();
    if(adBody != "" && adBody != undefined){
        $(".list-holder input").val(adBody);
        imgArray = adBody.split(",");
		var picList = [];
		for(var i = 0; i < imgArray.length; i++){
			var imgItem = imgArray[i].split("##");
			picList.push('<li class="pubitem clearfix" id="SWFUpload_1_0'+i+'">');
			picList.push('  <a class="li-move" href="javascript:;" title="'+langData['siteConfig'][23][42]+'">'+langData['siteConfig'][6][19]+'</a>');
			picList.push('  <a class="li-rm" href="javascript:;">×</a>');
			picList.push('  <div class="li-thumb" style="display:block;">');
			picList.push('    <div class="r-progress"><s></s></div>');
			picList.push('    <img data-val="'+imgItem[0]+'" src="'+cfg_attachment+imgItem[0]+'" data-url="'+cfg_attachment+imgItem[0]+'" />');
			picList.push('  </div>');
			picList.push('  <div class="li-input" style="display:block;"><input class="i-name" placeholder="'+langData['waimai'][6][100]+'" value="'+imgItem[1]+'" /><input class="i-link" placeholder="'+langData['waimai'][6][101]+'" value="'+imgItem[2]+'" /><input class="i-desc" placeholder="'+langData['waimai'][6][102]+'" value="'+imgItem[3]+'" /></div>');
			picList.push('</li>');
		}
		$("#listSection").html(picList.join(""));
		$(".deleteAllAtlas").show();
    }

    //提交
    $(".tjbtn").bind("click", function(){
        var t = $(this), parent = t.closest(".page-item"), data = parent.find("input, select, textarea").serialize();

        data += "&type="+type;

        t.attr("disabled", true);

        $.ajax({
            url: "index.php",
            type: "post",
            data: data,
            dataType: "json",
            success: function(res){
                if(res.state != 100){
                    $.dialog.alert(res.info);
                    t.attr("disabled", false);
                }else{
                    location.reload();
                }
            },
            error: function(){
                $.dialog.alert(langData['siteConfig'][20][253]);
                t.attr("disabled", false);
            }
        })


    });

});
