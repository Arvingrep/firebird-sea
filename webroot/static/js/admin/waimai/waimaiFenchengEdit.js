$(function(){

    var sizes = ["", 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101];

    function biliInit(group){

        $(".table .help-block").each(function(i){

            var obj = $(this),
                g = obj.closest(".widget-box"),
                sjInp = obj.parent().next("input"),
                sjCon = obj.prev("span"),
                ptInp = obj.parent().siblings("input[name!='']"),
                ptCon = ptInp.prev("td").children("span");

                sjCon.addClass("sssssss")

            if(obj.hasClass("batch_slider")){
                return;
            }

            if(group){

                if(group != g.index()+1){
                    return;
                }

                var _sjval = parseInt(g.find(".batch_set").text()),
                    _ptval = 100 - _sjval;
                sjInp.val(g.find(".batch_set").text());
                sjCon.text(_sjval);
                sjInp.val(_sjval);
                ptCon.text(_ptval);
                ptInp.val(_ptval);
            }

            var sjval = sjInp.val(),
                ptval = ptInp.val();

            if(group && group != g.index()+1){
                return;
            }

            obj.css({
                "width": "200px",
                "margin-left": "30px"
            }).slider({
                value: sjval,
                range: "min",
                min: 1,
                max: 101,
                step: 1,
                slide: function(event, ui) {
                    var sizing = sizes;
                    var val = parseInt(ui.value);
                    sjCon.text(sizing[val]).addClass("aaaaaaa");
                    sjInp.val(sizing[val]);
                    var val1 = parseInt(100 - sizing[val]);
                    ptCon.text(val1);
                    ptInp.val(val1);
                }
            });
        })

    }

    

    $(".batch_slider").css({
        "width": "200px",
        "margin-left": "170px",
        "margin-top": "20px"
    }).slider({
        value: 0,
        range: "min",
        min: 1,
        max: 101,
        step: 1,
        slide: function(event, ui) {
            var group = $(this).closest(".widget-box"),
                gindex = group.index()+1,
                batch_set = group.find(".batch_set");
            var sizing = sizes;
            var val = parseInt(ui.value);
            var val1 = parseInt(100 - sizing[val]);

            // batch_set(sizing[val]);
            batch_set.text(sizing[val])

            console.log(gindex)
            biliInit(gindex);

        }
    })

    biliInit();

    
    $("#food-form").submit(function(e){
        e.preventDefault();
        var form = $(this), btn = form.find(".submit"), url = form.attr("action");

        $.ajax({
            url: url,
            type: 'post',
            data: form.serialize(),
            dataType: 'json',
            success: function(data){
                if(data && data.state == 100){
                   $.dialog({
                        title: '提醒',
                        icon: 'success.png',
                        content: '保存成功！',
                        ok: function(){
                        }
                    });
                }else{
                    $.dialog.alert(data.info);
                    btn.attr("disabled", false);
                }
            },
            error: function(){
                $.dialog.alert('网络错误，请重试');
                btn.attr("disabled", false);
            }
        })

    })

});
