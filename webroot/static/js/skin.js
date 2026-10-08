$(function(){

  //获取URL参数
  function GetQueryString(name){
    var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if(r!=null)return  unescape(r[2]); return null;
  }

  var mod = $("#skinObj").data("val"), skin = GetQueryString("skin"), currentHost = masterDomain.replace("http://", "").replace("www.", ""), pathname = location.pathname;
  mod = mod.replace(masterDomain+"/", "").replace(currentHost, "").replace("http://", "").replace(".", "");
  mod = mod == '' ? 'siteConfig' : mod;

  var modArr = mod.split('/');
  mod = modArr[modArr.length-1];

  pathname = pathname.replace(mod, "");

  var laststr = pathname.substr(pathname.length-5);

  //只有首页需要切换模板
  if(laststr != ".html"){

    $.ajax({
			url: masterDomain+"/skin.php?module="+mod,
			type: "GET",
			dataType: "jsonp",
			success: function (data) {

        if(data){

          //引入模板
          var style = document.createElement('link');
          style.href = masterDomain+'/static/css/skin.css';
          style.rel = 'stylesheet';
          style.type = 'text/css';
          document.getElementsByTagName('head').item(0).appendChild(style);

          var skinHtml = [];
          skinHtml.push('<a href="javascript:;" id="changeSkinBtn" title="'+langData['siteConfig'][38][27]+'"></a>');//点击切换模板
          skinHtml.push('<div id="changeSkinPopup">');
          skinHtml.push('<a href="javascript:;" id="closeSkinBtn" title="'+langData['siteConfig'][6][15]+'"><s>&times;</s></a>');//关闭
          skinHtml.push('<ul class="skin-body fn-clear">');

          for(var i = 0; i < data.length; i++){
            var curr = "";
            if(skin == data[i].directory || (skin == null && i == 0)){
              curr = ' class="curr"';
            }
            mod = mod == 'siteConfig' ? '' : mod;
            skinHtml.push('<li'+curr+'><a href="?skin='+data[i].directory+'"><img src="'+masterDomain+'/'+data[i].preview+'" /><p>'+data[i].tplname+'</p></a></li>');
          }

          skinHtml.push('<li class="last"><strong>'+langData['siteConfig'][38][28]+'<br />'+langData['siteConfig'][19][825]+'</strong></li>');//更多风格  敬请期待
          skinHtml.push('</ul>');
          skinHtml.push('</div>');

          $("body").append(skinHtml.join(""));
          $("#changeSkinBtn").bind("click", function(){
            $(this).hide();
            $("#changeSkinPopup").stop().removeClass().addClass("skin-show").show();
          });

          $("#closeSkinBtn").bind("click", function(){
            $("#changeSkinBtn").fadeIn();
            $("#changeSkinPopup").stop().removeClass().addClass("skin-hide");
            setTimeout(function(){
              $("#changeSkinPopup").hide();
            }, 200);
          });

        }

      }
    });



    // setTimeout(function(){
    //   $("body").find("#changeSkinPopup").show();
    // }, 200);

  }




});
