$(function() {

          	$('body').delegate(".deletefield", "click", function(){
            	$(this).closest('.fatherblock').hide();
          	})
            $('body').delegate(".sondeletefield", "click", function(){
            	$(this).closest('.fatherblock').hide();
          	})
          	var experienceHtml = '<div class="xxfield fieldblock">(<span style="font-weight:bold;">'+langData['waimai'][1][153]+'</span>)&nbsp;&nbsp;'+langData['waimai'][1][154]+':<input type="text"style="width:80px;"class="name"name="field[name][]">&nbsp;&nbsp;&nbsp;&nbsp;'+langData['waimai'][1][155]+':<input type="text"style="width:300px;"class="content"name="field[content][]">&nbsp;&nbsp;&nbsp;&nbsp;'+langData['waimai'][1][156]+':<input type="text"style="width:50px;"value="0"class="content"name="field[sort][]"><inputtype="hidden"class="type"name="field[type][]"value="1"><div class="deletefield"title="'+langData['waimai'][6][154]+'">'+langData['siteConfig'][6][8]+'</div></div>';
            $("#options").delegate(".addxxfield", "click", function(){

              var t = $(this).closest("#options").find('#fieldcontent');
              var date1 = new Date().getTime();
              var date2 = new Date().getTime() + 1;
              var html = experienceHtml.replace("date11", date1).replace("date22", date2);
              var newexperience = $(html);
              newexperience.insertAfter(t);
              newexperience.slideDown(300);
            });
         	var txfieldHtml = '<div id="hidetxfield"><div class="txfield fieldblock">(<span style="font-weight:bold;">'+langData['waimai'][1][157]+'</span>)&nbsp;&nbsp;'+langData['waimai'][1][154]+':<input type="text"style="width:80px;"class="name"name="field[name][]">&nbsp;&nbsp;&nbsp;&nbsp;'+langData['waimai'][1][158]+':<input type="text"style="width:300px;"class="content"name="field[content][]">&nbsp;&nbsp;&nbsp;&nbsp;'+langData['waimai'][1][156]+':<input type="text"style="width:50px;"value="0"class="content"name="field[sort][]"><input type="hidden"class="type"name="field[type][]"value="2"><div class="deletefield"title="'+langData['waimai'][6][154]+'">'+langData['siteConfig'][6][8]+'</div></div></div>';
            $("#options").delegate(".addtxfield", "click", function(){

              var t = $(this).closest("#options").find('#fieldcontent');
              var date1 = new Date().getTime();
              var date2 = new Date().getTime() + 1;
              var html = txfieldHtml.replace("date11", date1).replace("date22", date2);
              var newexperience = $(html);
              newexperience.insertAfter(t);
              newexperience.slideDown(300);
            });



            var addse = '<div class="selfdefine selfdefineblock">'+langData['waimai'][1][191]+':<select class="selfdefine-type"name="selfdefine[type][]"><option value="content">'+langData['siteConfig'][19][1]+'</option><option value="link">'+langData['waimai'][6][70]+'</option></select>&nbsp;&nbsp;&nbsp;&nbsp;<span class="selfdefine_name">'+langData['waimai'][1][192]+':</span><input type="text"style="width:80px;"class="name"name="selfdefine[name][]">&nbsp;&nbsp;&nbsp;&nbsp;<span class="selfdefine_value">'+langData['waimai'][1][155]+':</span><input type="text"style="width:300px;"class="content"name="selfdefine[content][]"><div class="deleteselfdefine"title="'+langData['waimai'][6][61]+'">'+langData['siteConfig'][6][8]+'</div></div>';
            $("#selfdefine").delegate(".addselfdefine", "click", function(){

              var t = $(this).closest(".addse");
              var date1 = new Date().getTime();
              var date2 = new Date().getTime() + 1;
              var html = addse.replace("date11", date1).replace("date22", date2);
              var newexperience = $(html);
              newexperience.insertAfter(t);
              newexperience.slideDown(300);
            });
            $("#selfdefine").delegate(".deleteselfdefine", "click", function(){
               $(this).closest(".selfdefineblock").remove();
            });


          var lievf = '<div class="rangedeliveryfee rangedeliveryfeeblock ">'+langData['waimai'][6][60]+'&nbsp;<input type="text"style="width:80px;"class="name"name="rangedeliveryfee[start][]"value="0">&nbsp;'+langData['waimai'][6][155]+'&nbsp;<input type="text"style="width:80px;"class="name"name="rangedeliveryfee[stop][]"value="0">&nbsp;'+langData['waimai'][2][27]+'，'+langData['waimai'][2][24]+'&nbsp;<input type="text"style="width:80px;"class="content"name="rangedeliveryfee[value][]"value="0">&nbsp;'+echoCurrency('short')+'，'+langData['waimai'][2][23]+'&nbsp;<input type="text"style="width:80px;"class="content"name="rangedeliveryfee[minvalue][]"value="0">&nbsp;'+echoCurrency('short')+'<div class="deleterangedeliveryfee"title="'+langData['waimai'][6][61]+'">'+langData['siteConfig'][6][8]+'</div></div>';
            $("#deliveryfee").delegate(".addrangedeliveryfee", "click", function(){

              var t = $(this).closest(".lievf");
              var date1 = new Date().getTime();
              var date2 = new Date().getTime() + 1;
              var html = lievf.replace("date11", date1).replace("date22", date2);
              var newexperience = $(html);
              newexperience.insertAfter(t);
              newexperience.slideDown(300);
            });
            $("#deliveryfee").delegate(".deleterangedeliveryfee", "click", function(){
               $(this).closest(".rangedeliveryfeeblock").remove();
            });


            var shuxing = '<div class="natureblock fatherblock"><div class="fieldblock"><input type="hidden"value="1"name="nature[100][type]"><label>'+langData['siteConfig'][19][496]+':<input type="text"name="nature[100][name]"value=""style="width:80px;"></label><div class="deletefield"style=""title="'+langData['siteConfig'][26][5]+'">'+langData['siteConfig'][6][8]+'</div><div class="addsonfield"title="'+langData['siteConfig'][19][498]+'"onclick="addsonnaturepriceblock(this,100);">'+langData['siteConfig'][19][498]+'</div><label>'+langData['siteConfig'][19][497]+'<select name="nature[100][maxchoose]"><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option><option value="9">9</option><option value="10">10</option><option value="11">11</option><option value="12">12</option><option value="13">13</option><option value="14">14</option><option value="15">15</option><option value="16">16</option><option value="17">17</option><option value="18">18</option><option value="19">19</option><option value="20">20</option></select></label></div></div>';
            $(".widget-box").delegate("#addpricenature", "click", function(){

              var t = $(this).closest(".shuxing");
              var date1 = new Date().getTime();
              var date2 = new Date().getTime() + 1;
              var html = shuxing.replace("date11", date1).replace("date22", date2);
              var newexperience = $(html);
              newexperience.insertAfter(t);
              newexperience.slideDown(300);
            });

        });
