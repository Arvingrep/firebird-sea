var ue = UE.getEditor('body', {'enterTag': ''});



$(function(){



    // 设置tab切换

    $('.tt li').click(function(){

        var  u = $(this);

        var index = u.index();

        $('.tab-content .tt_1').eq(index).addClass('active');

        $('.tab-content .tt_1').eq(index).siblings().removeClass('active');

        u.addClass('active');

        u.siblings('li').removeClass('active');

    })



    $('.yy li').click(function(){

      var  u = $(this);

      var index = u.index();

      $('.tab-content .yy_1').eq(index).addClass('active');

      $('.tab-content .yy_1').eq(index).siblings().removeClass('active');

      u.addClass('active');

      u.siblings('li').removeClass('active');

    })



    $('[data-rel="tooltip"]').tooltip();

    $('[data-rel="popover"]').popover();

    $('.chooseTime').timepicker($.extend($.datepicker.regional['zh-cn'], {'timeFormat':'hh:mm','hour':'09','minute':'40'}));



      jQuery('#StatisticsForm_beginDate').datepicker(jQuery.extend({

          showMonthAfterYear: false

      },

      jQuery.datepicker.regional['zh_cn'], {

          'showSecond': true,

          'changeMonth': true,

          'changeYear': true,

          'tabularLevel': null,

          'yearRange': '2013:' + (new Date().getFullYear() + 10),

          'minDate': new Date(2013, 1, 1, 00, 00, 00),

          'timeFormat': 'hh:mm:ss',

          'dateFormat': 'yy-mm-dd',

          'timeText': langData['siteConfig'][19][384],

          'hourText': langData['waimai'][6][124],

          'minuteText': langData['waimai'][6][125],

          'secondText': langData['waimai'][6][126],

          'currentText': langData['waimai'][6][127],

          'closeText': langData['siteConfig'][6][15],

          'showOn': 'focus'

      }));

      jQuery('#StatisticsForm_endDate').datepicker(jQuery.extend({

          showMonthAfterYear: false

      },

      jQuery.datepicker.regional['zh_cn'], {

          'showSecond': true,

          'changeMonth': true,

          'changeYear': true,

          'tabularLevel': null,

          'yearRange': '2013:' + (new Date().getFullYear() + 10),

          'minDate': new Date(2013, 1, 1, 00, 00, 00),

          'timeFormat': 'hh:mm:ss',

          'dateFormat': 'yy-mm-dd',

          'timeText': langData['siteConfig'][19][384],

          'hourText': langData['waimai'][6][124],

          'minuteText': langData['waimai'][6][125],

          'secondText': langData['waimai'][6][126],

          'currentText': langData['waimai'][6][127],

          'closeText': langData['siteConfig'][6][15],

          'showOn': 'focus'

      }));





      var tagenum = 100;

      $('body').delegate('.deletefield', 'click',function(){

          $(this).parents('.fatherblock').remove();

      });

      $('body').delegate('.sondeletefield', 'click',function(){

          $(this).parent('.fatherblock').remove();

      });


      $('#addpricenature').on('click',function(){

          var lenght = $('.natureblock').length;
            let selectHtml = []
            for(let i = 1;i<=100;i++){
                selectHtml.push('<option value="'+i+'" '+ (i == 1 ? `selected="selected"` : ``) +'>'+ i +'</option>')
            }
          if(lenght>9){

              $.dialog.alert(langData['siteConfig'][27][81]);

          }
          var string = '<div class="natureblock fatherblock"><div class="fieldblock">';

          string += '<label>属性名: <input type="text" name="nature['+tagenum+'][name]" value="" style="width:80px;"/></label>';

          string += '<label>属性值最多可选数: <select name="nature['+tagenum+'][maxchoose]" class="maxchoose" style="width:80px;"> '+ selectHtml.join('') +' </select> </label>';

          string += '<div class="deletefield" style="" title="'+langData['siteConfig'][26][5]+'"> '+langData['siteConfig'][6][8]+' </div>';

          string += '<div class="addsonfield" title="'+langData['siteConfig'][19][498]+'" onclick="addsonnaturepriceblock(this,'+tagenum+');"> '+langData['siteConfig'][19][498]+' </div>';

          string += '</div></div>';

          $('#natureblocklist').append(string);

          tagenum++;

      });





});




$("#food-form").submit(function(e){
    e.eventPreventDefault();
});



//表单提交

function checkFrom(form){



    var form = $("#food-form"), action = form.attr("action"), data = form.serialize();

    var btn = $("#submitBtn");



    ue.sync();



    btn.attr("disabled", true);



    $.ajax({

        url: action,

        type: "post",

        data: data,

        dataType: "json",

        success: function(res){

            if(res.state == 100){

                location.href = "waimaiFoodList.php?sid="+sid;

            }else{

                $.dialog.alert(res.info);

                btn.attr("disabled", false);

            }

        },

        error: function(){

            $.dialog.alert(langData['siteConfig'][20][253]);

            btn.attr("disabled", false);

        }

    })


    return false;


}





function addsonnaturepriceblock(obj,key){

    var string = '<div class="sonfieldblock fatherblock">';
        string += `<div class="food_img" title="上传图片"> <img src="" class="hide" alt=""> <input type="file" accept="images/*" class="fileInp"> <input type="hidden" value="" name="nature[${key}][pic][]" class="pic"> </div>`;
        string += '<label>'+langData['siteConfig'][26][6]+': <input type="text" value="" name="nature['+key+'][value][]"/></label> ';

        string += '<label class="priceAdd">'+langData['siteConfig'][19][428]+': <span>加 <input type="text" value="0" name="nature['+key+'][price][]"/>'+echoCurrency("short")+'</span></label>';

        string += '<div class="sondeletefield">'+langData['siteConfig'][6][8]+'</div>';

        string += '</div>	';

        $(obj).parents('.natureblock').append(string);

}


$("body").on('change','.fileInp',function(){
    let t = $(this)
    let file = event.target['files'][0]            
    if (window.FileReader) {
        var reader = new FileReader();
        reader.readAsDataURL(file); 
        reader.onload = function(e) {
            var formData = new FormData();
            let tempPath = this.result;
            t.closest('.food_img').find('img').removeClass('hide').attr('src',tempPath)
            formData.append("Filedata", file);
            formData.append("name", file.name);
            formData.append("lastModifiedDate", file.lastModifiedDate);
            formData.append("size", file.size);
            uploadImg(formData,t)
            
        }
    } 
})

 /**
 * 逐个上传图片
 * @param {object} data 上传图片所需的formdata格式的数据
 * @param {string} dom  点击上传的input
 * */ 
 function uploadImg(data,dom){
    $.ajax({
        accepts:{},
        url: '/include/upload.inc.php?mod=siteConfig&type=atlas&filetype=image',
        data: data,
        type: "POST",
        processData: false, // 使数据不做处理
        contentType: false,
        dataType: "json",
        success: function (data) {
            if(data.state == 'SUCCESS'){
                let imgPath = data.turl
                dom.closest('.food_img').find('img').removeClass('hide').attr('src',imgPath)
                dom.closest('.food_img').find('input[type="hidden"]').val(imgPath)
            }else{
                alert('图片上传失败，请稍后重试');
            }
        },
        error: function () { }
    });
}