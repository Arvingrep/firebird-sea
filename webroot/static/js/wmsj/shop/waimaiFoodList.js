$(function(){

    $(document).on('click','#foodList_c0_all',function() {

        var checked=this.checked;

        $("input[name='selectorderlist\[\]']:enabled").each(function() {this.checked=checked;});

    });

    $(document).on('click', "input[name='selectorderlist\[\]']", function() {

        $('#foodList_c0_all').prop('checked', $("input[name='selectorderlist\[\]']").length==$("input[name='selectorderlist\[\]']:checked").length);

    });



    $("#typeid").change(function(){

        $(this).closest("form").submit();

    });


    //库存状态

    $(".stockStatusSwitch input").bind("click", function(){

        var input = $(this), id = input.data("id"), val = input.is(":checked") ? 1 : 0;

        $.ajax({

            url: "waimaiFoodList.php",

            type: "post",

            data: {action: "updateStockStatus", id: id, val: val},

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



    //商品状态

    $(".foodStatusSwitch input").bind("click", function(){

        var input = $(this), id = input.data("id"), val = input.is(":checked") ? 1 : 0;

        $.ajax({

            url: "waimaiFoodList.php",

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



    //自定义属性状态

    $(".natureStatusSwitch input").bind("click", function(){

        var input = $(this), id = input.data("id"), val = input.is(":checked") ? 1 : 0;

        $.ajax({

            url: "waimaiFoodList.php",

            type: "post",

            data: {action: "updateNatureStatus", id: id, val: val},

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



    //删除

    $(".del").bind("click", function(){

        var t = $(this), tr = t.closest("tr"), id = t.data("id");



        $.dialog.confirm(langData['waimai'][6][128], function(){

            $.ajax({

                url: "waimaiFoodList.php",

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



    $("#deleteSelect").bind("click", function(){

        var data = new Array();

        $("input[name='selectorderlist\[\]']:enabled").each(function (){

            if(this.checked == true){

                data.push(this.value);

            }

        });

        if(data.length > 0){



            $.dialog.confirm(langData['waimai'][6][128], function(){

                $.ajax({

                    url: "waimaiFoodList.php",

                    type: "post",

                    data: {action: "delete", id: data.join(",")},

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

            return false;



        }else{

            $.dialog.alert(langData['waimai'][6][129]);

            return false;

        }

    })


    //上传

    function mysub(){
        var data = [];
        data['mod'] = "waimai";
        data['type'] = "file";

        $.dialog.tips(langData['waimai'][6][130]+'...',600,'loading.gif');

        $.ajaxFileUpload({

            url: "/include/upload.inc.php",

            fileElementId: "Filedata",

            dataType: "json",

            data: data,

            success: function(m, l) {
                if (m.state == "SUCCESS") {
                    var url = m.url;
                    $.ajax({

                        url: "waimaiFoodList.php",

                        data: {

                            "sid": sid,

                            "action": "import",

                            "file": url

                        },

                        type: "post",

                        dataType: "json",

                        success: function(data){

                            if(data.state == 100){

                                location.reload();

                            }else{

                                $.dialog.tips(data.info, 1, 'error.png', function(){});

                            }

                        },

                        error: function(){

                            $.dialog.tips(langData['waimai'][6][131], 1, 'error.png', function(){});

                        }

                    });



                } else {
                    $.dialog.tips(langData['waimai'][6][132], 1, 'error.png', function(){});

                }

            },

            error: function() {

                $.dialog.tips(langData['siteConfig'][20][531], 1, 'error.png', function(){});

            }

        });



    }



    $("#Filedata").bind("change", function(){

        if ($(this).val() == '') return;

        mysub();

    });

})
