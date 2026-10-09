$(function(){

    //搜索
	$("#searchBtn").bind("click", function(){
		var keyword = $("#keyword").val(), typeList = [], l=domainArr.length, addType = '';
        $("#list tr").removeClass("light");
		if(keyword == "") {
			$("#keyword").focus(); return false;
		}
		for(var i = 0; i < l; i++){
			(function(){
				var jsonArray =arguments[0];
				if(jsonArray["name"].indexOf(keyword) > -1 || jsonArray["domain"].indexOf(keyword) > -1){
					$(".tr_"+jsonArray["id"]).addClass("light");
				}
			})(domainArr[i]);
		}
		//定位第一个
		if($('#list .light').length > 0){
			$(document).scrollTop(Number($('#list .light:first').offset().top - 50));
		}else{
            $.dialog.tips("没有找到相关数据", 3, 'error.png');
        }
	});

	//搜索回车提交
    $("#keyword").keyup(function (e) {
        if (!e) {
            var e = window.event;
        }
        if (e.keyCode) {
            code = e.keyCode;
        }
        else if (e.which) {
            code = e.which;
        }
        if (code === 13) {
            $("#searchBtn").click();
        }
    });

	var init = {
		//选中样式切换
		funTrStyle: function(){
			var trLength = $("#list tbody tr").length, checkLength = $("#list tbody tr.selected").length;
			if(trLength == checkLength){
				$("#selectBtn .check").removeClass("checked").addClass("checked");
			}else{
				$("#selectBtn .check").removeClass("checked");
			}
		}
	};

	var isOper = false;

	//拼接列表
	if(domainArr.length > 0){
		var list = [];
		for(var i = 0; i < domainArr.length; i++){
			list.push('<tr class="tr_'+domainArr[i].id+'" data-id="'+domainArr[i].aid+'" data-lid="'+domainArr[i].id+'" data-name="'+domainArr[i].name+'" data-type="'+domainArr[i].type+'" data-domain="'+domainArr[i].domain+'">');
			list.push('<td class="row3"><span class="check"></span></td>');
			list.push('<td class="row5">'+domainArr[i].aid+'</td>');
			list.push('<td class="row17 left"><strong>'+domainArr[i].name+'</strong><label style="display:inline-block; margin-left:10px;"><input type="checkbox" class="hot" value="1"'+(domainArr[i].hot == 1 ? ' checked' : '')+'>热门</label></td>');
			list.push('<td class="row10 left">'+getSelect(domainArr[i].type)+'</td>');
			list.push('<td class="row25 left">'+getInput(domainArr[i].type, domainArr[i].domain)+'</td>');

			var def = '设为默认城市';
			if(domainArr[i].default == 1){
				def = '<font color="#ff0000">取消默认城市</font>';
			}

			list.push('<td class="row40 left"><a href="javascript:;" class="link save">保存</a>&nbsp;&nbsp;|&nbsp;&nbsp;<a href="javascript:;" class="link delete">删除</a>&nbsp;&nbsp;|&nbsp;&nbsp;<a href="javascript:;" class="link default">'+def+'</a>&nbsp;&nbsp;|&nbsp;&nbsp;<a href="javascript:;" class="link advanced">高级设置</a>&nbsp;&nbsp;|&nbsp;&nbsp;<a href="javascript:;" class="link status" data-status="'+domainArr[i].state+'">'+(domainArr[i].state == 1 ? '停用' : '<font color="#ff0000">启用</font>')+'</a></td>');
			list.push('</tr>');
		}
		$("#list tbody").html(list.join(""));
	}else{
		$("#list tbody td").html('请先开通城市！');
	}

	//类型切换改变域名规则
	$("#list").delegate("select", "change", function(){
		var t = $(this), par = t.closest("tr"), id = t.find("option:selected").val(), domain = par.attr("data-domain");
		par.find("td:eq(4)").html(getInput(id, domain));
	});

	//批量修改
	$(".operBtn a").bind("click", function(){
		var id = parseInt($(this).attr("data-id"));
		if(id < 3){
			$("#list").find("tr").each(function(){
				$(this).find("select option:eq("+(id)+")").attr("selected", true);
				$(this).find("select").change();
			});
		}else{
			//启用
			if(id == 3){

				var ids = [];
				$('#list').find('.selected').each(function(){
					ids.push($(this).attr('data-lid'));
				});

				if(ids.length > 0){
					$.dialog.confirm("确定要启用吗？", function(){
						huoniao.showTip("loading", "正在启用，请稍候...");
						huoniao.operaJson("siteCity.php?dopost=status&state=1", "id="+ids.join(','), function(data){
							if(data.state != 100){
								$.dialog.alert(data.info);
							}else{
			                    huoniao.showTip("success", "启用成功！");
								setTimeout(function(){
									location.reload();
								}, 1000);
							}
						});
					});
				}

			//停用
			}else if(id == 4){

				var ids = [];
				$('#list').find('.selected').each(function(){
					ids.push($(this).attr('data-lid'));
				});

				if(ids.length > 0){
					$.dialog.confirm("确定要停用吗？", function(){
						huoniao.showTip("loading", "正在停用，请稍候...");
						huoniao.operaJson("siteCity.php?dopost=status&state=0", "id="+ids.join(','), function(data){
							if(data.state != 100){
								$.dialog.alert(data.info);
							}else{
			                    huoniao.showTip("success", "停用成功！");
								setTimeout(function(){
									location.reload();
								}, 1000);
							}
						});
					});
				}

			//删除
			}else if(id == 5){

				var ids = [];
				$('#list').find('.selected').each(function(){
					ids.push($(this).attr('data-lid'));
				});

				if(ids.length > 0){
					$.dialog.confirm("删除前请确认该分站下的会员、模块数据等是否已清理完毕，如果没有清理将会产生数据残留，影响后续的操作！<br />确定后将不可以恢复，请谨慎操作！！！确定要删除吗？", function(){
						huoniao.showTip("loading", "正在删除，请稍候...");
						huoniao.operaJson("siteCity.php?dopost=del", "id="+ids.join(','), function(data){
							if(data.state != 100){
								$.dialog.alert(data.info);
							}else{
			                    huoniao.showTip("success", "删除成功！");
								setTimeout(function(){
									huoniao.hideTip();
								}, 2000);
								$('#list').find('.selected').remove();
							}
						});
					});
				}

            //清空
            }else if(id == 6){
    
                $.dialog.confirm("清空前请确认所有分站下的会员、模块数据等是否已清理完毕，如果没有清理将会产生数据残留，影响后续的操作！<br />确定后将不可以恢复，请谨慎操作！！！确定要清空吗？", function(){
                    huoniao.showTip("loading", "正在清空，请稍候...");
                    huoniao.operaJson("siteCity.php?dopost=clean", "", function(data){
                        if(data.state != 100){
                            $.dialog.alert(data.info);
                        }else{
                            huoniao.showTip("success", "清空成功！");
                            setTimeout(function(){
                                huoniao.hideTip();
                                location.reload();
                            }, 2000);
                            $('#list').find('.selected').remove();
                        }
                    });
                });

			}
		}

	});


    //自定义配置
    $('#customConfigBtn').bind('click', function(){
        $.dialog({
            fixed: true,
            title: '自定义配置',
            content: $("#editForm").html(),
            width: 460,
            ok: function(){

                huoniao.showTip("loading", "保存中...");

                var auto_location = self.parent.$('input[name=auto_location]:checked').val(),
                    state = self.parent.$('input[name=state]:checked').val(),
                    group = self.parent.$('input[name=group]:checked').val(),
                    nearby = self.parent.$('input[name=nearby]').val();
                 
                huoniao.operaJson("siteConfig.php?action=sameAddr", "&addr_state="+state+"&addr_group="+group+"&addr_nearby="+nearby+"&auto_location="+auto_location+"&token="+token, function(data){
                    $.get("siteClearCache.php?action=do");
                    huoniao.showTip("success", "保存成功", "auto");
                    location.reload();
                });

            },
            cancel: true
        });
        self.parent.$('.statusTips').tooltip();
    });

	//全部保存
    var saveAllDataLength = 0;
    var saveAllInterval;
    var saveAllDataGroup = [];
    var isRunning = 0;
	$(".btn-save").bind("click", function(){
	    var t = $(this);
		$.dialog.confirm('确定要修改吗？', function(){

		    //重复区域
            if(t.attr('id') == 'save'){

                var state = $('input[name=state]:checked').val(),
                group = $('input[name=group]:checked').val(),
                nearby = $('input[name=nearby]').val(),
                    title = $.trim($('#tit').val());
                if(state == '' || state == undefined || state == null){
                    $.dialog.alert('请选择状态');
                    return false;
                }
                huoniao.operaJson("siteConfig.php?action=sameAddr", "&addr_state="+state+"&addr_group="+group+"&addr_nearby="+nearby+"&token="+token, function(data){
                    $.get("siteClearCache.php?action=do");
                    huoniao.showTip("success", "保存成功", "auto");
                });


            }else {

                if(saveAllInterval){
                    clearInterval(saveAllInterval);
                }

                //保存
                var saveBtnArr = [];
                $("#list").find("tr").each(function () {
                    saveBtnArr.push($(this).find('.save'));
                });

                saveAllDataLength = saveBtnArr.length;

                //分组执行，每秒执行5个，如果一次执行所有，会卡死
                saveAllDataGroup = dataGroup(saveBtnArr);

                //先执行前5条
                if(saveAllDataGroup){
                    var btns = saveAllDataGroup[0];
                    if(btns){
                        isRunning = 5;
                        saveAllDataGroup.splice(0, 1);
                        btns.forEach(function(t){
                            t.click();
                        });
                    }else{
                        return;
                    }
                }

            }

		});
	});

    //数据分组函数（每组5条）
    function dataGroup(data) {
        var result = [];
        var groupItem;
        for (var i = 0; i < data.length; i++) {
            if (i % 5 == 0) {
                groupItem != null && result.push(groupItem);
                groupItem = [];
            }
            groupItem.push(data[i]);
        }
        result.push(groupItem);
        return result;
    }

	//全选、不选
	$("#selectBtn a").bind("click", function(){
		var id = $(this).attr("data-id");
		if(id == 1){
			$("#selectBtn .check").addClass("checked");
			$("#list tr").removeClass("selected").addClass("selected");
		}else{
			$("#selectBtn .check").removeClass("checked");
			$("#list tr").removeClass("selected");
		}
	});

	//单选
	$("#list tbody").delegate("tr", "click", function(event){
		var isCheck = $(this), checkLength = $("#list tbody tr.selected").length;
		if(event.target.className.indexOf("check") > -1) {
			if(isCheck.hasClass("selected")){
				isCheck.removeClass("selected");
			}else{
				isCheck.addClass("selected");
			}
		}else if(event.target.className.indexOf("link") > -1) {
			$("#list tr").removeClass("selected");
			isCheck.addClass("selected");
		}else{
			if(checkLength > 1){
				$("#list tr").removeClass("selected");
				isCheck.addClass("selected");
			}else{
				if(isCheck.hasClass("selected")){
					isCheck.removeClass("selected");
				}else{
					$("#list tr").removeClass("selected");
					isCheck.addClass("selected");
				}
			}
		}

		init.funTrStyle();
	});

	//保存
    var failData = [];
	$("#list").delegate(".save", "click", function(){
		var t = $(this), par = t.closest("tr"), type = par.find("select option:selected").val(), domain = par.find("input[type=text]").val();
		var id = par.attr("data-id"), oType = par.attr("data-type"), oDomain = par.attr("data-domain");

		//判断是否有变化
		// if(oType == type && oDomain == domain) return false;

		if(t.html() != "保存" && t.html() != "保存失败，点击重试！") return false;
		t.html("<img src='/static/images/loadgray.gif' style='width: auto; height: auto;' />");

		var data = [];
		data.push("id="+id);
		data.push("type="+type);
		data.push("domain="+domain);
		data.push("token="+token);

        //全部保存
        if(saveAllDataLength > 0){
            huoniao.showTip("loading", "保存中，剩余" + saveAllDataLength + "条");
        }

		huoniao.operaJson("siteCity.php?dopost=update", data.join("&"), function(data){
			huoniao.hideTip();
            if(saveAllDataLength == 1){
                huoniao.showTip("success", "所有分站数据保存成功！", "auto");
            }
            saveAllDataLength--;
            if(saveAllDataLength > 0){
                huoniao.showTip("loading", "保存中，剩余" + saveAllDataLength + "条");
            }

            //正在执行中的一组剩余数量
            if(isRunning){
                isRunning--;
            }

            //确保没有正在执行中的
            saveAllInterval = setInterval(function(){
                if(saveAllDataGroup && isRunning == 0){
                    var btns = saveAllDataGroup[0];
                    if(btns){
                        isRunning = 5;
                        saveAllDataGroup.splice(0, 1);
                        btns.forEach(function(t){
                            t.click();
                        });
                    }else{
                        clearInterval(saveAllInterval);
                    }
                }
            }, 1000);

			if(data.state != 100){
				t.html("保存").removeClass().addClass("save refuse");

                //批量保存的，等都保存完成后，再一次性给出失败的数据
                if(data.info.indexOf('已被占用') > -1 && (failData || saveAllDataGroup.length == 0)){
                    failData.push(data.domain);
                    if(saveAllDataGroup.length == 0 && failData.length > 0){
                        $.dialog.alert('以下域名：<br />' + failData.join('<br />') + '<br />已被占用，请换个域名重新保存！');
                    }
                }else{
				    $.dialog.alert(data.info);
                }
				// setTimeout(function(){
				// 	t.html("保存").addClass("link save");
				// }, 2000);
			}else{
                // $.get("siteClearCache.php?action=do");
				par.attr("data-domain", domain);
				par.attr("data-type", type);
				t.html("<span class='text-success'>保存</span>").removeClass();
				setTimeout(function(){
					t.html("保存").addClass("link save");
				}, 2000);

                //批量保存的，等都保存完成后，再一次性给出失败的数据
                if(failData || saveAllDataGroup.length == 0){
                    if(saveAllDataGroup.length == 0 && failData.length > 0){
                        $.dialog.alert('以下域名：<br />' + failData.join('<br />') + '已被占用，请换个域名重新保存！');
                    }
                }
			}
		});

	});

	//删除
	$("#list").delegate(".delete", "click", function(){
		var t = $(this), par = t.closest("tr"), id = par.attr("data-lid");

		if(t.html() != "删除") return false;

		$.dialog.confirm("删除前请确认该分站下的会员、模块数据等是否已清理完毕，如果没有清理将会产生数据残留，影响后续的操作！<br />确定后将不可以恢复，请谨慎操作！！！确定要删除吗？", function(){
			t.html("<img src='/static/images/loadgray.gif' style='width: auto; height: auto;' />");
			huoniao.operaJson("siteCity.php?dopost=del", "id="+id, function(data){
				if(data.state != 100){
					t.html("删除").removeClass().addClass("save refuse");
					$.dialog.alert(data.info);
					setTimeout(function(){
						t.html("删除").addClass("link save");
					}, 2000);
				}else{
                    $.get("siteClearCache.php?action=do");
					par.remove();
				}
			});
		});
	});

	//启用/停用
	$("#list").delegate(".status", "click", function(){
		var t = $(this), par = t.closest("tr"), id = par.attr("data-lid"), status = parseInt(t.attr('data-status'));

		var tit = status == 0 ? '启用' : '停用';
		var state = status == 0 ? 1 : 0;

		$.dialog.confirm("确定要"+tit+"吗？", function(){
			huoniao.showTip("loading", "正在"+tit+"，请稍候...");
			huoniao.operaJson("siteCity.php?dopost=status&state="+state, "id="+id, function(data){
				if(data.state != 100){
					$.dialog.alert(data.info);
				}else{
					huoniao.showTip("success", tit+"成功！");
					setTimeout(function(){
						location.reload();
					}, 1000);
				}
			});
		});

	});

	//商圈
	$("#list").delegate(".business", "click", function(){
		var t = $(this), tr = t.closest("tr"), name = tr.data("name"), id = tr.data("id");
		parent.addPage("siteCityBusiness"+id, "siteConfig", name+"商圈", "siteConfig/siteCityBusiness.php?cid="+id);
	});

    //高级设置
    $("#list").delegate(".advanced", "click", function(){
        var t = $(this), tr = t.closest("tr"), name = tr.data("name"), id = tr.data("id");
        parent.addPage("siteCityAdvanced"+id, "siteConfig", name+"分站设置", "siteConfig/siteCityAdvanced.php?cid="+id);
    });


	//默认城市
	$(".list").delegate(".default", "click", function(){
		var t = $(this), id = t.closest("tr").attr("data-id"), type = 'set';
		if(t.text() == '取消默认城市'){
			type = 'clear';
		}
		huoniao.operaJson("siteCity.php?dopost=setDefaultCity", "&type="+type+"&cid="+id+"&token="+token, function(data){
            $.get("siteClearCache.php?action=do");
			location.reload();
		});

	});


	//开通城市
	$(".btn-primary").bind("click", function(){
		$.dialog({
			fixed: true,
			title: '开通分站城市',
			content: $("#addCity").html(),
			width: 750,
			init: function(){

				parent.$("#pBtn").change(function(){
					var id = $(this).val(), pinyin = $(this).find("option:selected").data("pinyin");
					if(id != 0 && id != ""){
						parent.$("#domain").val(pinyin);
						getCity(id);
					}else{
						parent.$("#cBtn").html('<option value="0">--'+areaName_1+'--</option>');
						parent.$("#xBtn").html('<option value="0">--'+areaName_2+'--</option>');
						parent.$("#tBtn").html('<option value="0">--'+areaName_3+'--</option>');
					}
				});

				parent.$("#cBtn").change(function(){
					var id = $(this).val(), pinyin = $(this).find("option:selected").data("pinyin");
					if(id != 0 && id != ""){
						parent.$("#domain").val(pinyin);
						getCounty(id);
					}else{
						parent.$("#xBtn").html('<option value="0">--'+areaName_2+'--</option>');
						parent.$("#tBtn").html('<option value="0">--'+areaName_3+'--</option>');
					}
				});

				parent.$("#xBtn").change(function(){
					var id = $(this).val(), pinyin = $(this).find("option:selected").data("pinyin");
					if(id != 0 && id != ""){
						parent.$("#domain").val(pinyin);
						getTown(id);
					}else{
						parent.$("#xBtn").html('<option value="0">--'+areaName_2+'--</option>');
						parent.$("#tBtn").html('<option value="0">--'+areaName_3+'--</option>');
					}
				});

				parent.$("#tBtn").change(function(){
					var id = $(this).val(), pinyin = $(this).find("option:selected").data("pinyin");
					if(id != 0 && id != ""){
						parent.$("#domain").val(pinyin);
					}else{
						parent.$("#xBtn").html('<option value="0">--'+areaName_3+'--</option>');
					}
				});


				//开启、关闭交互
				parent.$("input[name=domaintype]").bind("click", function(){
					var t = $(this), input = parent.$("#domain");
					if(t.val() == 0){
						input.removeClass().addClass("input-large");
						input.prev(".add-on").html("http://");
						input.next(".add-on").hide();
					}else if(t.val() == 1){
						input.removeClass().addClass("input-mini");
						input.prev(".add-on").html("http://");
						input.next(".add-on").html("."+subdomain.replace('www.', '')).show();
					}else{
						input.removeClass().addClass("input-mini");
						input.prev(".add-on").html("http://"+subdomain+"/");
						input.next(".add-on").hide();
					}
				});

                var pop = this;

                //确认开通
                parent.$('#kaitongCity').bind('click', function(){
                    var cid = 0, tBtn = parent.$("#tBtn").val(), xBtn = parent.$("#xBtn").val(), cBtn = parent.$("#cBtn").val(), pBtn = parent.$("#pBtn").val(),
						type = parent.$("input[name=domaintype]:checked").val(),
						domain = $.trim(parent.$("#domain").val());
                    if(tBtn != "" && tBtn != 0){
                        cid = tBtn;
                    }else if(xBtn != "" && xBtn != 0){
                        cid = xBtn;
                    }else if(cBtn != "" && cBtn != 0){
                        cid = cBtn;
                    }else if(pBtn != "" && pBtn != 0){
                        cid = pBtn;
                    }

                    if(cid == 0){
                        alert("请选择要开通的城市！");
                        return false;
                    }

                    if(domain == ""){
                        alert("请输入要绑定的域名");
                        return false;
                    }

                    var data = [],
                    t = this;
                    data.push("cid="+cid);
                    data.push("type="+type);
                    data.push("domain="+domain);

                    huoniao.operaJson("siteCity.php?dopost=add", data.join("&"), function(data){
                        if(data && data['state'] == 100){
                            pop.close();
                            $.get("siteClearCache.php?action=do");
                            
                            $.dialog({
                                title: '开通成功',
                                icon: 'success.png',
                                content: data.info,
                                ok: function(){
                                    location.reload();
                                },
                                close: function(){
                                    location.reload();
                                }
                            });

                        }else{
                            alert(data.info);
                        }
                    });
                });


                //批量添加
                parent.$('.bulkAdd').find('button').bind('click', function(){
                    var t = $(this), level = parseInt(t.attr('data-level'));

                    if(confirm('确认要批量开通吗？\r\n开通过程会比较慢，如果请求超时可以多重试几次！')){
                        pop.close();
                        $.dialog.tips('开通中，请稍等...', 600, 'loading.gif');

                        huoniao.operaJson("siteCity.php?dopost=bulk", "level=" + level, function(data){
                            if(data && data['state'] == 100){
                                $.get("siteClearCache.php?action=do");
                                $.dialog.tips('开通成功', 1, 'success.png');
                                
                                $.dialog({
                                    title: '操作成功',
                                    icon: 'success.png',
                                    content: data.info,
                                    ok: function(){
                                        location.reload();
                                    },
                                    close: function(){
                                        location.reload();
                                    }
                                });
                            }else{
                                alert(data.info);
                                location.reload();
                            }
                        });
                    }

                });


                //选中省、市、区、乡镇
                parent.$("#p1").change(function(){
					var id = $(this).val();
					if(id != 0 && id != "" && id.length == 1){
						getCity(id[0], true);
					}else{
						parent.$("#p2").html('<option value="0" disabled>--'+areaName_1+'--</option>');
						parent.$("#p3").html('<option value="0" disabled>--'+areaName_2+'--</option>');
						parent.$("#p4").html('<option value="0" disabled>--'+areaName_3+'--</option>');
					}
				});
                parent.$("#p2").change(function(){
					var id = $(this).val();
					if(id != 0 && id != "" && id.length == 1){
						getCounty(id[0], true);
					}else{
						parent.$("#p3").html('<option value="0" disabled>--'+areaName_2+'--</option>');
						parent.$("#p4").html('<option value="0" disabled>--'+areaName_3+'--</option>');
					}
				});
                parent.$("#p3").change(function(){
					var id = $(this).val();
					if(id != 0 && id != "" && id.length == 1){
						getTown(id[0], true);
					}else{
						parent.$("#p4").html('<option value="0" disabled>--'+areaName_3+'--</option>');
					}
				});

			},
			ok: function(){

                var pop = this;
				var p1 = parent.$('#p1').val(), p2 = parent.$('#p2').val(), p3 = parent.$('#p3').val(), p4 = parent.$('#p4').val();
                
                var ids = [];
                if(p4 != null){
                    ids = p4;
                }else if(p3 != null){
                    ids = p3;
                }else if(p2 != null){
                    ids = p2;
                }else if(p1 != null){
                    ids = p1;
                }

                console.log(ids);

                if(!ids){
                    alert('请选择要开通的城市！');
                }

                if(confirm('确认要批量开通吗？')){
                    pop.close();
                    $.dialog.tips('开通中，请稍等...', 600, 'loading.gif');

                    huoniao.operaJson("siteCity.php?dopost=bulk", "ids=" + ids.join(','), function(data){
                        if(data && data['state'] == 100){
                            $.get("siteClearCache.php?action=do");
                            $.dialog.tips('开通成功', 1, 'success.png');
                            
                            $.dialog({
                                title: '操作成功',
                                icon: 'success.png',
                                content: data.info,
                                ok: function(){
                                    location.reload();
                                },
                                close: function(){
                                    location.reload();
                                }
                            });
                        }else{
                            alert(data.info);
                            location.reload();
                        }
                    });
                }
                return false;

			}
		});
	});

	//热门
	$("#list").delegate(".hot", "click", function(){
		var t = $(this), par = t.closest("tr"), id = par.attr("data-id"), state = t.is(":checked") ? 1 : 0;

		huoniao.operaJson("siteCity.php?dopost=hot", "id="+id+"&state="+state, function(data){
			if(data.state != 100){
				huoniao.showTip("error", data.info, "auto");
			}else{
                $.get("siteClearCache.php?action=do");
				huoniao.showTip("success", data.info, "auto");
			}
		});
	})


	function getCity(id, bulk){
		huoniao.operaJson("siteSubway.php?dopost=getCity", "id="+id, function(data){
			if(data){
				var li = [];
				for(var i = 0; i < data.length; i++){
					li.push('<option value="'+data[i].id+'" data-pinyin="'+data[i].pinyin+'">'+data[i].typename+'</option>');
				}
                if(!bulk){
                    parent.$("#cBtn").html('<option value="0">--'+areaName_1+'--</option>'+li.join(""));
                    parent.$("#xBtn").html('<option value="0">--'+areaName_2+'--</option>');
                    parent.$("#tBtn").html('<option value="0">--'+areaName_3+'--</option>');
                }else{
                    parent.$("#p2").html('<option value="0" disabled>--'+areaName_1+'--</option>' + li.join(''));
                    parent.$("#p3").html('<option value="0" disabled>--'+areaName_2+'--</option>');
                    parent.$("#p4").html('<option value="0" disabled>--'+areaName_3+'--</option>');
                }
			}else{
                if(!bulk){
                    parent.$("#cBtn").html('<option value="0">--'+areaName_1+'--</option>');
                    parent.$("#xBtn").html('<option value="0">--'+areaName_2+'--</option>');
                    parent.$("#tBtn").html('<option value="0">--'+areaName_3+'--</option>');
                }else{
                    parent.$("#p2").html('<option value="0" disabled>--'+areaName_1+'--</option>');
                    parent.$("#p3").html('<option value="0" disabled>--'+areaName_2+'--</option>');
                    parent.$("#p4").html('<option value="0" disabled>--'+areaName_3+'--</option>');
                }
			}
		});
	}


	function getCounty(id, bulk){
		huoniao.operaJson("siteSubway.php?dopost=getCity", "id="+id, function(data){
			if(data){
				var li = [];
				for(var i = 0; i < data.length; i++){
					li.push('<option value="'+data[i].id+'" data-pinyin="'+data[i].pinyin+'">'+data[i].typename+'</option>');

                    if(!bulk){
                        parent.$("#xBtn").html('<option value="0">--'+areaName_2+'--</option>'+li.join(""));
                        parent.$("#tBtn").html('<option value="0">--'+areaName_3+'--</option>');
                    }else{
                        parent.$("#p3").html('<option value="0" disabled>--'+areaName_2+'--</option>'+li.join(""));
                        parent.$("#p4").html('<option value="0" disabled>--'+areaName_3+'--</option>');
                    }
				}
			}
		});
	}


	function getTown(id, bulk){
		huoniao.operaJson("siteSubway.php?dopost=getCity", "id="+id, function(data){
			if(data){
				var li = [];
				for(var i = 0; i < data.length; i++){
					li.push('<option value="'+data[i].id+'" data-pinyin="'+data[i].pinyin+'">'+data[i].typename+'</option>');

                    if(!bulk){
					    parent.$("#tBtn").html('<option value="0">--'+areaName_3+'--</option>'+li.join(""));
                    }else{
                        parent.$("#p4").html('<option value="0" disabled>--'+areaName_3+'--</option>'+li.join(""));
                    }
				}
			}
		});
	}


	//域名类型
	function getSelect(id){
		var l = [];
		l.push('<select class="input-small">');
		l.push('<option value="0"'+(id == 0 ? 'selected' : "")+'>主域名</option>');
		l.push('<option value="1"'+(id == 1 ? 'selected' : "")+'>子域名</option>');
		l.push('<option value="2"'+(id == 2 ? 'selected' : "")+'>子目录</option>');
		l.push('</select>');
		return l.join("");
	}

	//域名配置表单
	function getInput(id, name){
		var i = [];
		i.push('<div class="input-prepend input-append" style="margin:0;">');

		//主域名
		if(id == 0){
			i.push('<span class="add-on">http://</span>');
			i.push('<input class="input-large" type="text" value="'+name+'">');

		//子域名
		}else if(id == 1){
			i.push('<span class="add-on">http://</span>');
			i.push('<input class="input-small" type="text" value="'+name+'">');
			i.push('<span class="add-on">.'+subdomain.replace('www.', '')+'</span>');

		//子目录
		}else if(id == 2){
			i.push('<span class="add-on">http://'+subdomain+'/</span>');
			i.push('<input class="input-small" type="text" value="'+name+'">');
		}
		return i.join("");
	}

});
