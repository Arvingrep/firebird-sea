$(function() {
          $('.btn-colorpicker').click(function(){
            var x = $(this),
                colse = x.closest('.dropdown-colorpicker');
            if (colse.hasClass('open')) {
              colse.removeClass('open');
            }else{
              colse.addClass("open");
            };
          })
          $('.colorpick-btn').click(function(){
            $('.dropdown-colorpicker').removeClass('open');
          })
          $('.btn-colorpicker').on('click',
          function() {
            var color = $(this).attr('data-color');
            $('.colorpick-btn').each(function() {
              if (color == $(this).attr('data-color')) {
                $(this).attr('class', 'colorpick-btn selected');
              } else {
                $(this).attr('class', 'colorpick-btn');
              }
            });
          });
          $('.colorpick-btn').on('click',
          function() {
            var color = $(this).attr('data-color');
            $('.btn-colorpicker').css('background-color', color);
            $('.btn-colorpicker').attr('data-color', color);
            $('#ErrandCategory_color').val(color);
          });

          	$('.deletefield').click(function(){
            	$(this).closest('.fieldblock').hide();
          	})
          	var experienceHtml = '<div class="xxfield fieldblock">(<span style="font-weight:bold;">'+langData['waimai'][1][153]+'</span>)&nbsp;&nbsp;'+langData['waimai'][1][154]+':<input type="text"style="width:80px;"class="name"name="field[name][]">&nbsp;&nbsp;&nbsp;&nbsp;'+langData['waimai'][1][155]+':<input type="text"style="width:300px;"class="content"name="field[content][]">&nbsp;&nbsp;&nbsp;&nbsp;'+langData['waimai'][1][156]+':<input type="text"style="width:50px;"value="0"class="content"name="field[sort][]"><inputtype="hidden"class="type"name="field[type][]"value="1"><div class="deletefield"title="'+langData['waimai'][6][154]+'">'+langData['siteConfig'][6][8]+'</div></div>';
            $("#fuwuneirong").delegate(".addxxfield", "click", function(){
              
              var t = $(this).closest("#fuwuneirong").find('#fieldcontent');
              var date1 = new Date().getTime();
              var date2 = new Date().getTime() + 1;
              var html = experienceHtml.replace("date11", date1).replace("date22", date2);
              var newexperience = $(html);
              newexperience.insertAfter(t);
              newexperience.slideDown(300);
            });
          	$("#fuwuneirong").delegate(".deletefield", "click", function(){
				var t = $(this).closest(".fieldblock");
						t.remove();
			});
         	var txfieldHtml = '<div id="hidetxfield"><div class="txfield fieldblock">(<span style="font-weight:bold;">'+langData['waimai'][1][157]+'('+langData['waimai'][6][188]+')</span>)&nbsp;&nbsp;'+langData['waimai'][1][154]+':<input type="text"style="width:80px;"class="name"name="field[name][]">&nbsp;&nbsp;&nbsp;&nbsp;'+langData['waimai'][1][158]+':<input type="text"style="width:300px;"class="content"name="field[content][]">&nbsp;&nbsp;&nbsp;&nbsp;'+langData['waimai'][1][156]+':<input type="text"style="width:50px;"value="0"class="content"name="field[sort][]"><input type="hidden"class="type"name="field[type][]"value="2"><div class="deletefield"title="'+langData['waimai'][6][154]+'">'+langData['siteConfig'][6][8]+'</div></div></div>';
            $("#fuwuneirong").delegate(".addtxfield", "click", function(){
              
              var t = $(this).closest("#fuwuneirong").find('#fieldcontent');
              var date1 = new Date().getTime();
              var date2 = new Date().getTime() + 1;
              var html = txfieldHtml.replace("date11", date1).replace("date22", date2);
              var newexperience = $(html);
              newexperience.insertAfter(t);
              newexperience.slideDown(300);
            });
            var tafieldHtml = '<div id="hidetafield"><div class="tafield fieldblock">(<span style="font-weight:bold;">'+langData['waimai'][1][157]+'('+langData['waimai'][6][187]+')</span>)&nbsp;&nbsp;'+langData['waimai'][1][154]+':<input type="text"style="width:80px;"class="name"name="field[name][]">&nbsp;&nbsp;&nbsp;&nbsp;'+langData['waimai'][1][158]+':<input type="text"style="width:300px;"class="content"name="field[content][]">&nbsp;&nbsp;&nbsp;&nbsp;'+langData['waimai'][1][156]+':<input type="text"style="width:50px;"value="0"class="content"name="field[sort][]"><input type="hidden"class="type"name="field[type][]"value="3"><div class="deletefield"title="'+langData['waimai'][6][154]+'">'+langData['siteConfig'][6][8]+'</div></div></div>';
            $("#fuwuneirong").delegate(".addtafield", "click", function(){
              
              var t = $(this).closest("#fuwuneirong").find('#fieldcontent');
              var date1 = new Date().getTime();
              var date2 = new Date().getTime() + 1;
              var html = tafieldHtml.replace("date11", date1).replace("date22", date2);
              var newexperience = $(html);
              newexperience.insertAfter(t);
              newexperience.slideDown(300);
            });

            
            var fatherblockHtml = '<div class="sonfieldblock fatherblock"><label>'+langData['siteConfig'][26][6]+':<input type="text"value=""name="nature[value][]"></label><label>'+langData['waimai'][6][189]+':<input type="text"value=""name="nature[price][]"></label><label>'+langData['siteConfig'][6][100]+'：<select name="nature[is_open][]"><option value="0">'+langData['siteConfig'][6][24]+'</option><option value="1">'+langData['siteConfig'][6][23]+'</option></select></label><div class="sondeletefield">'+langData['siteConfig'][6][8]+'</div></div>';
            $(".fatherblock").delegate(".addsonfield", "click", function(){
              
              var t = $(this).closest(".fatherblock");
              var date1 = new Date().getTime();
              var date2 = new Date().getTime() + 1;
              var html = fatherblockHtml.replace("date11", date1).replace("date22", date2);
              var newexperience = $(html);
              newexperience.insertAfter(t);
              newexperience.slideDown(300);
            });
            $("#gexingservice").delegate(".sondeletefield", "click", function(){
				 $(this).closest(".fatherblock").remove();
			});
        });
