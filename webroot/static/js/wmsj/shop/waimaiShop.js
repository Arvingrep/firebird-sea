$(function(){



    //新增店铺

    $("#addNew").bind("click", function(){

        var href = $(this).attr("href");



		try {

			event.preventDefault();

			parent.addPage("waimaiShopAdd", "waimai", langData['waimai'][6][148], "waimai/"+href);

		} catch(e) {}

    });



    //同步店铺

    $("#syncShop").bind("click", function(){

        var href = $(this).attr("href");



        try {

            event.preventDefault();

            parent.addPage("waimaiShopSync", "waimai", langData['waimai'][6][149], "waimai/"+href);

        } catch(e) {}

    });



    //商品管理

    /*$(".food").bind("click", function(){

        var href = $(this).attr("href"), id = $(this).data("id"), shopname = $(this).data("shopname");



		try {

			event.preventDefault();

			parent.addPage("waimaiShopFood" + id, "waimai", "商品-"+shopname, "waimai/"+href);

		} catch(e) {}

    });*/



    //商品分类管理

    /*$(".foodtype").bind("click", function(){

        var href = $(this).attr("href"), id = $(this).data("id"), shopname = $(this).data("shopname");



		try {

			event.preventDefault();

			parent.addPage("waimaiShopFoodType" + id, "waimai", "商品分类-"+shopname, "waimai/"+href);

		} catch(e) {}

    });*/



    //修改店铺

    /*$(".edit").bind("click", function(){

        var href = $(this).attr("href"), id = $(this).data("id"), shopname = $(this).data("shopname");



		try {

			event.preventDefault();

			parent.addPage("waimaiShopEdit" + id, "waimai", "修改店铺-"+shopname, "waimai/"+href);

		} catch(e) {}

    });*/







    //店铺状态

    $(".statusSwitch input").bind("click", function(){

        var input = $(this), id = input.data("id"), val = input.is(":checked") ? 1 : 0;

        $.ajax({

            url: "",

            type: "post",

            data: {action: "updateStatus", id: id, val: val},

            dataType: "json",

            success: function(res){

                if(res.state != 100){

                    $.dialog.alert(res.info);

                }

            },

            error: function(){

                $.dialog.alert(langData['siteConfig'][20][253]);

            }

        })

    });



    //微信下单状态

    $(".orderValidSwitch input").bind("click", function(){

        var input = $(this), id = input.data("id"), val = input.is(":checked") ? 1 : 0;

        $.ajax({

            url: "",

            type: "post",

            data: {action: "updateValid", id: id, val: val},

            dataType: "json",

            success: function(res){

                if(res.state != 100){

                    $.dialog.alert(res.info);

                }

            },

            error: function(){

                $.dialog.alert(langData['siteConfig'][20][253]);

            }

        })

    });


    //支持预订下单状态

    $(".reservestatusSwitch input").bind("click", function(){

        var input = $(this), id = input.data("id"), val = input.is(":checked") ? 1 : 0;

        $.ajax({

            url: "",

            type: "post",

            data: {action: "updateReservestatus", id: id, val: val},

            dataType: "json",

            success: function(res){

                if(res.state != 100){

                    $.dialog.alert(res.info);

                }

            },

            error: function(){

                $.dialog.alert(langData['siteConfig'][20][253]);

            }

        })

    });





    // 店铺管理页面中店铺连接查看,二维码查看

    $('.shopurl').click(function(){

      var t = $(this), url = t.closest("tr").data("url");

      $(".seeurl").html(url);

      if ($('.meng').hasClass('aa')) {

        $('.meng').removeClass('aa');

        $('.disk').hide();

      }else{

        $('.meng').addClass('aa');

        $('.disk').show();

      };

    })

    $('.order_true').click(function(){

      $('.meng').addClass('aa');

    })





    $('.shopticket').click(function(){

      var t = $(this), url = t.closest("tr").data("url");

      $("#seeticket").html('<img src="/include/qrcode.php?data='+url+'" />');

      if ($('.feng').hasClass('aa')) {

        $('.feng').removeClass('aa');

        $('.disk').hide();

      }else{

        $('.feng').addClass('aa');

        $('.disk').show();

      };

    })

    $('.order_true').click(function(){

      $('.feng').addClass('aa');

    })





    //删除

    $(".del").bind("click", function(){

        var t = $(this), tr = t.closest("tr"), id = t.data("id");



        $.dialog.confirm(langData['waimai'][6][150], function(){

            $.ajax({

                url: "",

                type: "post",

                data: {action: "delete", id: id},

                dataType: "json",

                success: function(res){

                    if(res.state != 100){

                        $.dialog.alert(res.info);

                    }else{

                        location.reload();

                    }

                },

                error: function(){

                    $.dialog.alert(langData['siteConfig'][20][253]);

                }

            })

        })



    });





    // 快速编辑

    $(".fastedit").blur(function(){

        var t = $(this), id = t.closest("tr").attr("data-id"), val = $.trim(t.text()), val_ = $.trim(t.attr("data-val")), type = $.trim(t.attr("class").replace("fastedit", ""));



        if(val == "") return;



        if(type == "sort"){

            val = parseInt(val);

            if(isNaN(val)){

                t.text(val_);

                huoniao.showTip("error", langData['waimai'][6][151], "auto");

                return;

            }else{

                t.text(val);

            }

        }



        if(val == val_){

            huoniao.showTip("success", langData['waimai'][6][152], "auto");

            return;

        }



        $.ajax({

            url: "",

            type: "post",

            data: {action: "fastedit", id: id, type: type, val: val},

            dataType: "json",

            success: function(res){

                if(res.state == 100){

                    huoniao.showTip("success", langData['siteConfig'][20][229], "auto");

                    t.attr("data-val", val);

                }else{

                    t.text(val_);

                    huoniao.showTip("error", res.info, "auto");

                }

            },

            error: function(){

                t.text(val_);

                huoniao.showTip("error", langData['waimai'][6][153], "auto");

            }

        })

    })





});

