$(function () {
    let timeoutTimer = '';
    // 页面初始加载出来
    if (pageId) {
        let pageIdArr = pageId.split(',');
        for (let i = 0; i < pageIdArr.length; i++) {
            let item = pageIdArr[i];
            console.log(item);
            getTarget(item);
        }
    }
    // 楼层导航
    $('.f-item').click(function () {
        let element = $(this);
        let typeName = element.attr('data-type'); //定位元素的id
        let topHeight = $('.fixedwrap').innerHeight();//吸顶导航高度
        element.addClass('active').siblings().removeClass('active'); //样式修改
        $('html, body').animate({ //页面滚动
            scrollTop: $(`#${typeName}`).offset().top - topHeight
        }, 500);
    });
    // 对比功能
    let compareArr = []; //正在展示的数据
    $('.ic-name .item').delegate('.name img', 'click', function () { //删除对比元素
        for (let i = 0; i < $('.irl-item').length; i++) { //让隐藏的元素显示
            let element = $('.irl-item').eq(i);
            if (element.attr('data-id') == $(this).attr('data-id')) {
                element.show();
                break;
            }
        }
        let index = $(this).closest('.item').index();
        $('table tr').each(function () { //变量行
            let skip = $(this).attr('data-skip'); //无用行判断
            if (!skip) {
                let targetEle = $(this).find('td').eq(index); //这里+1是为了跳过首个单元格，首个单元格的内容是标题（固定）
                targetEle.html('')
            }
        });
        compareArr.splice(index - 1, 1, 'blank'); //记录数据清掉，标记为blank（因为是无序删除，所以这里需要一个空的标记）
        return false
    })
    async function getTarget(id) { //获取详情数据
        let data = {
            service: 'house',
            action: 'saleList',
            id: id
        };
        let result = await ajax(data, { dataType: 'json' });
        if (result.state == 100) {
            addCompare(result.info.list[0]);
        } else {
            popWarn(result.info);
        }
    }
    function addCompare(item) { //增加对比元素
        let blankIndex = compareArr.indexOf('blank'); //是否有被删除的元素（之前渲染了，后面删除了）
        if (blankIndex == -1) { //没有删除过，直接push
            compareArr.push(item);
        } else { //有删除过，修改首个blank
            compareArr[blankIndex] = item;
        }
        // 渲染
        $('table tr').each(function () { //变量行
            let skip = $(this).attr('data-skip'); //无用行判断
            if (!skip) {
                let elementName = $(this).attr('class');
                for (let i = 0; i < compareArr.length; i++) {
                    let item = compareArr[i];
                    if (item == 'blank') { //空状态直接跳过此次循环
                        continue;
                    }
                    let targetEle = $(this).find('td').eq(i + 1); //这里+1是为了跳过首个单元格，首个单元格的内容是标题（固定）
                    if (elementName == 'ic-name') { //楼盘名称特殊处理
                        targetEle.html(`
                        <a href="${item.url}" target="_blank">
                            <img src="${item.litpic}" class="picture" onerror="this.src='/static/images/404.jpg'">
                            <div class="name">
                                <span>${item.title}</span>
                                <img src="${templets_skin}images/closeCircle.png?v=${cfg_staticVersion}" data-id="${item.id}">
                            </div>
                            <div class="price">${item.price>0?`${Number(item.price)}万`:'面议'}</div>
                        </a>`);
                    } else { //其他直接改文本即可
                        let str = '';
                        if (elementName.includes('houseTypes')) { //户型
                            str = item.room;
                        } else if (elementName.includes('areas')) { //产权面积
                            str = `${Number(item.area)}${symbolArea}`;
                        } else if (elementName.includes('offers')) { //报价
                            str = item.price>0?`${Number(item.price)}万${symbolShort}`:'面议';
                        } else if (elementName.includes('unitPrices')) { //单价
                            str = `${Number(item.unitprice)}${symbolShort}/${symbolArea}`;
                        } else if (elementName.includes('equitys')) { //产权
                            str = item.rights_to == 1 ? '使用权房' : '产权房';
                        } else if (elementName.includes('decorations')) { //装修
                            str = item.zhuangxiu;
                        } else if (elementName.includes('types')) { //类型
                            str = item.protype;
                        } else if (elementName.includes('directions')) { //朝向
                            str = item.direction;
                        } else if (elementName.includes('elevator')) { //电梯
                            str = item.elevator == 1 ? '有' : '没有';
                        } else if (elementName.includes('floors')) { //楼层
                            str = `${item.bno}（共${item.floor}）`;
                        } else if (elementName.includes('finishs')) { //竣工时间
                            let date = new Date(item.opendate * 1000);
                            let year = date.getFullYear();
                            let month = date.getMonth() + 1;
                            let day = date.getDate();
                            str = `${year}年${month}月${day}日`;
                        } else if (elementName.includes('developers')) { //开发商
                            str = item.kfs;
                        } else if (elementName.includes('companys')) { //物业公司
                            str = item.property;
                        } else if (elementName.includes('plots')) { //容积率
                            str = Number(item.rongji);
                        } else if (elementName.includes('greens')) { //绿化
                            str = Number(item.green);
                        } else if (elementName.includes('schools')) { //学区学校
                            str = `${item.school.length}所学校`;
                        }
                        targetEle.html(str);
                    }
                }
            }
        });
    }
    function popWarn(info) { //弹窗提示
        $('.warnPop').text(info);
        $('.warnPop').css({ 'display': 'flex' });
        clearTimeout(timeoutTimer);
        timeoutTimer = setTimeout(res => {
            $('.warnPop').hide();
        }, 2000);
    }
})