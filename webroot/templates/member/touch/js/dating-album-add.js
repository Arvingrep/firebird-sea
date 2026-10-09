$(function(){

	$("#submit").bind("click", function(){

	    var t = $(this);

	    if(t.hasClass("disabled")) return false;

	    var userid = $.cookie(cookiePre+"login_user");
			if(userid == null || userid == ""){
				location.href = "/login.html";
				return false;
			}

	    var imglist = [], imgli = $("#fileList li");
			if(imgli.length > 1){
				for(var i = 1; i < imgli.length; i++){
					var imgsrc = $("#fileList li:eq("+i+")").find("img").attr("data-val"), imgdes = '';
					imglist.push("img[]="+imgsrc+"|"+imgdes);
				}
			}

	    if(imglist.length == 0){
	    	alert(langData['siteConfig'][20][301]);
	    	return false;
	    }

	    t.addClass("disabled").val(langData['siteConfig'][7][9]+"...");

	    $.ajax({
				url: "/include/ajax.php?service=dating&action=uploadAlbum",
				data: imglist.join("&"),
				type: "POST",
				dataType: "json",
				success: function (data) {
					if(data && data.state == 100){
	          			t.html(langData['siteConfig'][6][39]);
						setTimeout(function(){
							location.href = url;
						}, 1000);
					}else{
						alert(langData['siteConfig'][20][302]);
						t.removeClass("disabled").html(langData['siteConfig'][6][27]);
					}
				},
				error: function(){
	        		alert(langData['siteConfig'][20][183]);
	        		t.removeClass("disabled").html(langData['siteConfig'][6][27]);
				}
			});

	});


})
