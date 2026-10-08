$(function(){

  //添加标签
    var store_tags = $('#tags_res').val();
    if (store_tags) {
        var store_tagsArr = store_tags.split(',');
        var html = '';
        for (var i = 0; i < store_tagsArr.length; i++) {
            html += '<span class="tag" data-title="' + store_tagsArr[i] + '">' + store_tagsArr[i] +
                '<button class="close" type="button">×</button></span>';
        }
        $("#form-field-tags").before(html);
    }
    $(".tags_enter").blur(function () { //焦点失去触发 
        var txtvalue = $(this).val().trim();
        if (txtvalue != '') {
            addTag($(this));
            $(this).parents(".tags").css({
                "border-color": "#d5d5d5"
            })
        }
    }).keydown(function (event) {
        var key_code = event.keyCode;
        var txtvalue = $(this).val().trim();
        if (key_code == 13 && txtvalue != '') { //enter
            addTag($(this));
        }
        if (key_code == 32 && txtvalue != '') { //space
            addTag($(this));
        }
    });
    $(".close").live("click", function () {
        $(this).parent(".tag").remove();
    });
    $(".tags").click(function () {
        $(this).css({
            "border-color": "#f59942"
        });
        $('.tags_enter').focus();
    }).blur(function () {
        $(this).css({
            "border-color": "#d5d5d5"
        })
    })
    checkInfo = function (event, self) {
        if (event.keyCode == 13) {
            event.cancleBubble = true;
            event.returnValue = false;
            return false;
        }
    }

    function removeWarning() {
        $(".tag-warning").removeClass("tag-warning");
    }

    function addTag(obj) {
        var tag = obj.val();
        if (tag != '') {
            var i = 0;
            $(".tag").each(function () {
                if ($(this).text() == tag + "×") {
                    $(this).addClass("tag-warning");
                    setTimeout(removeWarning, 400);
                    i++;
                }
            })
            obj.val('');
            if (i > 0) { //说明有重复
                return false;
            }
            $("#form-field-tags").before("<span class='tag' data-title='" + tag + "'>" + tag +
                "<button class='close' type='button'>×</button></span>"); //添加标签
        }
    }

  $('#form').submit(function(e){
    e.preventDefault();
    var form = $(this),
        t = $('.door-submit'),
        nickname = $('#nickname'),
        photo = $('#photo'),
        profile = $('#profile'),
        tel = $('#tel'),
        tel = $('#tel');
    if(nickname.val() == ''){
      $.dialog.alert(langData['siteConfig'][27][49]);  //请填写名称
      return;
    }
    if(photo.val() == ''){
      $.dialog.alert(langData['siteConfig'][29][129]);   //请上传门店代表图
      return;
    }
    if(profile.val() == ''){
      $.dialog.alert(langData['siteConfig'][29][130]);  //请填写简介
      return;
    }
    if(tel.val() == ''){
      $.dialog.alert(langData['siteConfig'][30][9]);  //请填写电话号码
      return;
    }

    var tags = [];
    $('#tags .tag').each(function(){
      var t = $(this).attr('data-title');
      tags.push(t);
    })
    $('#tags_res').val(tags.join(','));

    t.attr('disabled', true);
    $.ajax({
      url: '/include/ajax.php?service=dating&action=updateProfile_hn',
      type: 'post',
      data: form.serialize(),
      dataType: 'json',
      success: function(data){
        t.attr('disabled', false);
        if(data && data.state == 100){
          $.dialog({
            title: langData['siteConfig'][22][72],    //提示信息
            icon: 'success.png',
            content: langData['siteConfig'][20][312],   //提示信息
            ok: function(){
              location.reload();
            }
          });
        }else{
          $.dialog.alert(data.info);
        }
      },
      error: function(){
        t.attr('disabled', false).val( langData['siteConfig'][6][151]);  //提交
        $.dialog.alert(langData['siteConfig'][6][203]);  //网络错误，请重试'
      }
    })

  })
})