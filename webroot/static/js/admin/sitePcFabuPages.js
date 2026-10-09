let fabuDefault = [
    {
        "id": "23",
        "name": "房产门户",
        "icon": "/static/images/admin/nav/house.png",
        "code": "house",
        "bold": "0",
        "target": "0",
        "color": "",
        "wx": "1",
        "app": "0",
        "searchUrl": masterDomain + "/search-list.html?action=house&keywords=",
        "url": memberDomain + "/fabu-house",
        "title": "房产首页",
        "description": "房产描述",
        "logo": masterDomain + "/include/attachment.php?f=/siteConfig/logo/large/2023/10/12/16970984256035.png",
        "disabled": 0,
        "fabu": 1,
        "show": 1,
        "level": 1,
        "showLevel": 1,
        "level_disabeld": 0,
        "setStyle": {
            "name": "房产门户",
            "tStyle": {
                "fontWeight": 1,
                "fontSize": 18,
                "color": "#292C33"
            },
            "marginStyle": 2,
            "style": {
                "bgColor": "#FFF4EE",
                "color": "#FF7123",
                "subColor": "#9DA0A6"
            },
            "typeList": [
                {
                    "id": 1,
                    "show": 1,
                    "code": "zu",
                    "title": "出租房",
                    "typename": "出租房",
                    "link_title": "发布出租房",
                    "url": memberDomain + "/fabu-house-zu.html",
                    "icon": "/static/images/admin/fabuPage/zu.png",
                    "default": 1,
                    "subname": "",
                    "setStyle": {
                        "fontWeight": 0,
                        "fontSize": 14,
                        "color": "#FF7123",
                        "bgColor": "#FFF4EE",
                        "subColor": "#9DA0A6"
                    }
                },
                {
                    "id": 2,
                    "show": 1,
                    "code": "sale",
                    "title": "二手房",
                    "typename": "二手房",
                    "link_title": "发布二手房",
                    "url": memberDomain + "/fabu-house-sale.html",
                    "icon": "/static/images/admin/fabuPage/sale.png",
                    "default": 1,
                    "subname": "",
                    "setStyle": {
                        "fontWeight": 0,
                        "fontSize": 14,
                        "color": "#FF7123",
                        "bgColor": "#FFF4EE",
                        "subColor": "#9DA0A6"
                    }
                },
                {
                    "id": 3,
                    "show": 1,
                    "code": "cf",
                    "title": "厂房/仓库",
                    "typename": "厂房/仓库",
                    "link_title": "发布厂房/仓库",
                    "url": memberDomain + "/fabu-house-cf.html",
                    "icon": "/static/images/admin/fabuPage/cf.png",
                    "default": 1,
                    "subname": "",
                    "setStyle": {
                        "fontWeight": 0,
                        "fontSize": 14,
                        "color": "#FF7123",
                        "bgColor": "#FFF4EE",
                        "subColor": "#9DA0A6"
                    }
                },
                {
                    "id": 4,
                    "show": 1,
                    "code": "sp",
                    "title": "办公/商铺",
                    "typename": "办公/商铺",
                    "link_title": "发布办公/商铺",
                    "url": memberDomain + "/fabu-house-sp.html",
                    "icon": "/static/images/admin/fabuPage/sp.png",
                    "default": 1,
                    "subname": "",
                    "setStyle": {
                        "fontWeight": 0,
                        "fontSize": 14,
                        "color": "#FF7123",
                        "bgColor": "#FFF4EE",
                        "subColor": "#9DA0A6"
                    }
                },
                {
                    "id": 5,
                    "show": 1,
                    "code": "cw",
                    "title": "车位",
                    "typename": "车位",
                    "link_title": "发布车位",
                    "url": memberDomain + "/fabu-house-cw.html",
                    "icon": "/static/images/admin/fabuPage/cw.png",
                    "default": 1,
                    "subname": "",
                    "setStyle": {
                        "fontWeight": 0,
                        "fontSize": 14,
                        "color": "#FF7123",
                        "bgColor": "#FFF4EE",
                        "subColor": "#9DA0A6"
                    }
                },
                {
                    "id": 6,
                    "show": 1,
                    "code": "demand",
                    "title": "求租求购",
                    "typename": "求租求购",
                    "link_title": "发布求租求购",
                    "url": memberDomain + "/fabu-house-demand.html",
                    "icon": "/static/images/admin/fabuPage/demand.png",
                    "default": 1,
                    "subname": "",
                    "setStyle": {
                        "fontWeight": 0,
                        "fontSize": 14,
                        "color": "#FF7123",
                        "bgColor": "#FFF4EE",
                        "subColor": "#9DA0A6"
                    }
                }
            ]
        }
    },
    {
        "id": "42",
        "name": "招聘求职",
        "icon": "/static/images/admin/nav/job.png",
        "code": "job",
        "bold": "0",
        "target": "0",
        "color": "",
        "wx": "1",
        "app": "0",
        "searchUrl": masterDomain + "/search-list.html?action=job&keywords=",
        "url": memberDomain + "/fabu-job",
        "title": "招聘首页",
        "description": "招聘描述",
        "logo": masterDomain + "/include/attachment.php?f=/siteConfig/logo/large/2023/10/12/16970984256035.png",
        "disabled": 0,
        "fabu": 1,
        "show": 1,
        "level": 1,
        "showLevel": 1,
        "level_disabeld": 1,
        "setStyle": {
            "name": "求职招聘",
            "tStyle": {
                "fontWeight": 1,
                "fontSize": 18,
                "color": "#292C33"
            },
            "marginStyle": 2,
            "style": {
                "bgColor": "#F2F7FF",
                "color": "#3382FF",
                "subColor": "#9DA0A6"
            },
            "typeList": [
                {
                    "id": 1,
                    "code": "",
                    "title": "发布简历",
                    "typename": "发布简历",
                    "link_title": "发布简历",
                    "url": memberDomain + "/job-resume.html",
                    "icon": "/static/images/admin/fabuPage/job_01.png",
                    "default": 1,
                    "subname": "",
                    "setStyle": {
                        "fontWeight": 0,
                        "fontSize": 14,
                        "color": "#3382FF",
                        "bgColor": "#F2F7FF",
                        "subColor": "#9DA0A6"
                    }
                },
                {
                    "id": 2,
                    "code": "",
                    "url": masterDomain + "/supplier/job/add_post.html",
                    "title": "发布职位",
                    "typename": "发布职位",
                    "link_title": "发布职位",
                    "icon": "/static/images/admin/fabuPage/job_02.png",
                    "default": 1,
                    "subname": "",
                    "setStyle": {
                        "fontWeight": 0,
                        "fontSize": 14,
                        "color": "#3382FF",
                        "bgColor": "#F2F7FF",
                        "subColor": "#9DA0A6"
                    }
                },
                {
                    "id": 3,
                    "code": "",
                    "url": memberDomain + "/fabu_job_seek.html",
                    "title": "极速招聘/求职",
                    "typename": "极速招聘/求职",
                    "link_title": "发布极速招聘/求职",
                    "icon": "/static/images/admin/fabuPage/job_03.png",
                    "default": 1,
                    "subname": "",
                    "setStyle": {
                        "fontWeight": 0,
                        "fontSize": 14,
                        "color": "#3382FF",
                        "bgColor": "#F2F7FF",
                        "subColor": "#9DA0A6"
                    }
                }
            ]
        }
    },
    {
        "id": "18",
        "name": "分类信息",
        "icon": "/static/images/admin/nav/info.png",
        "code": "info",
        "bold": "0",
        "target": "0",
        "color": "",
        "wx": "1",
        "app": "0",
        "searchUrl": masterDomain + "/search-list.html?action=info&keywords=",
        "url": memberDomain + "/fabu-info",
        "title": "信息首页",
        "description": "信息描述",
        "logo": masterDomain + "/include/attachment.php?f=/siteConfig/logo/large/2023/10/12/16970984256035.png",
        "disabled": 0,
        "fabu": 1,
        "show": 1,
        "level": 1,
        "showLevel": 1,
        "level_disabeld": 1,
        "setStyle": {
            "name": "分类信息",
            "tStyle": {
                "fontWeight": 1,
                "fontSize": 18,
                "color": "#292C33"
            },
            "marginStyle": 1,
            "style": {
                "bgColor": "#F7F8FA",
                "color": "#737780",
                "subColor": "#9DA0A6"
            },
            "typeList": [
                {
                    "link_title": "分类信息-生活服务",
                    "id": 1,
                    "parentid": 0,
                    "typename": "生活服务",
                    "title": "生活服务",
                    "iconturl": "https://ihuoniao-uploads.oss-cn-hangzhou.aliyuncs.com/info/demo/icon/1.png?x-oss-process=image/resize,m_fill,w_4096,h_4096",
                    "icon": "",
                    "url": memberDomain + "/fabu-info?typeid=1",
                    "style": 0,
                    "searchall": 0,
                    "redirect": "",
                    "lower": 12,
                    "default": 1,
                    "subname": "",
                    "setStyle": {
                        "fontWeight": 0,
                        "fontSize": 14,
                        "color": "#737780",
                        "bgColor": "#F7F8FA",
                        "subColor": "#9DA0A6"
                    }
                },
                {
                    "link_title": "分类信息-二手闲置",
                    "id": 2,
                    "parentid": 0,
                    "typename": "二手闲置",
                    "title": "二手闲置",
                    "iconturl": "https://ihuoniao-uploads.oss-cn-hangzhou.aliyuncs.com/info/demo/icon/2.png?x-oss-process=image/resize,m_fill,w_4096,h_4096",
                    "icon": "",
                    "url": memberDomain + "/fabu-info?typeid=2",
                    "style": 0,
                    "searchall": 0,
                    "redirect": "",
                    "lower": 12,
                    "default": 1,
                    "subname": "",
                    "setStyle": {
                        "fontWeight": 0,
                        "fontSize": 14,
                        "color": "#737780",
                        "bgColor": "#F7F8FA",
                        "subColor": "#9DA0A6"
                    }
                },
                {
                    "link_title": "分类信息-招聘求职",
                    "id": 3,
                    "parentid": 0,
                    "typename": "招聘求职",
                    "title": "招聘求职",
                    "iconturl": "https://ihuoniao-uploads.oss-cn-hangzhou.aliyuncs.com/info/demo/icon/3.png?x-oss-process=image/resize,m_fill,w_4096,h_4096",
                    "icon": "",
                    "url": memberDomain + "/fabu-info?typeid=3",
                    "style": 0,
                    "searchall": 0,
                    "redirect": "",
                    "lower": 3,
                    "default": 1,
                    "subname": "",
                    "setStyle": {
                        "fontWeight": 0,
                        "fontSize": 14,
                        "color": "#737780",
                        "bgColor": "#F7F8FA",
                        "subColor": "#9DA0A6"
                    }
                },
                {
                    "link_title": "分类信息-租房买房",
                    "id": 4,
                    "parentid": 0,
                    "typename": "租房买房",
                    "title": "租房买房",
                    "iconturl": "https://ihuoniao-uploads.oss-cn-hangzhou.aliyuncs.com/info/demo/icon/4.png?x-oss-process=image/resize,m_fill,w_4096,h_4096",
                    "icon": "",
                    "url": memberDomain + "/fabu-info?typeid=4",
                    "style": 0,
                    "searchall": 0,
                    "redirect": "",
                    "lower": 3,
                    "default": 1,
                    "subname": "",
                    "setStyle": {
                        "fontWeight": 0,
                        "fontSize": 14,
                        "color": "#737780",
                        "bgColor": "#F7F8FA",
                        "subColor": "#9DA0A6"
                    }
                },
                {
                    "link_title": "分类信息-保姆月嫂",
                    "id": 5,
                    "parentid": 0,
                    "typename": "保姆月嫂",
                    "title": "保姆月嫂",
                    "iconturl": "https://ihuoniao-uploads.oss-cn-hangzhou.aliyuncs.com/info/demo/icon/5.png?x-oss-process=image/resize,m_fill,w_4096,h_4096",
                    "icon": "",
                    "url": memberDomain + "/fabu-info?typeid=5",
                    "style": 0,
                    "searchall": 0,
                    "redirect": "",
                    "lower": 8,
                    "default": 1,
                    "subname": "",
                    "setStyle": {
                        "fontWeight": 0,
                        "fontSize": 14,
                        "color": "#737780",
                        "bgColor": "#F7F8FA",
                        "subColor": "#9DA0A6"
                    }
                },
                {
                    "link_title": "分类信息-优惠团购",
                    "id": 6,
                    "parentid": 0,
                    "typename": "优惠团购",
                    "title": "优惠团购",
                    "iconturl": "https://ihuoniao-uploads.oss-cn-hangzhou.aliyuncs.com/info/demo/icon/6.png?x-oss-process=image/resize,m_fill,w_4096,h_4096",
                    "icon": "",
                    "url": memberDomain + "/fabu-info?typeid=6",
                    "style": 0,
                    "searchall": 0,
                    "redirect": "",
                    "lower": 8,
                    "default": 1,
                    "subname": "",
                    "setStyle": {
                        "fontWeight": 0,
                        "fontSize": 14,
                        "color": "#737780",
                        "bgColor": "#F7F8FA",
                        "subColor": "#9DA0A6"
                    }
                },
                {
                    "link_title": "分类信息-汽车生活",
                    "id": 7,
                    "parentid": 0,
                    "typename": "汽车生活",
                    "title": "汽车生活",
                    "iconturl": "https://ihuoniao-uploads.oss-cn-hangzhou.aliyuncs.com/info/demo/icon/7.png?x-oss-process=image/resize,m_fill,w_4096,h_4096",
                    "icon": "",
                    "url": memberDomain + "/fabu-info?typeid=7",
                    "style": 0,
                    "searchall": 0,
                    "redirect": "",
                    "lower": 7,
                    "default": 1,
                    "subname": "",
                    "setStyle": {
                        "fontWeight": 0,
                        "fontSize": 14,
                        "color": "#737780",
                        "bgColor": "#F7F8FA",
                        "subColor": "#9DA0A6"
                    }
                },
                {
                    "link_title": "分类信息-生意转让",
                    "id": 8,
                    "parentid": 0,
                    "typename": "生意转让",
                    "title": "生意转让",
                    "iconturl": "https://ihuoniao-uploads.oss-cn-hangzhou.aliyuncs.com/info/demo/icon/8.png?x-oss-process=image/resize,m_fill,w_4096,h_4096",
                    "icon": "",
                    "url": memberDomain + "/fabu-info?typeid=8",
                    "style": 0,
                    "searchall": 0,
                    "redirect": "",
                    "lower": 4,
                    "default": 1,
                    "subname": "",
                    "setStyle": {
                        "fontWeight": 0,
                        "fontSize": 14,
                        "color": "#737780",
                        "bgColor": "#F7F8FA",
                        "subColor": "#9DA0A6"
                    }
                },
                {
                    "link_title": "分类信息-商业服务",
                    "id": 9,
                    "parentid": 0,
                    "typename": "商业服务",
                    "title": "商业服务",
                    "iconturl": "https://ihuoniao-uploads.oss-cn-hangzhou.aliyuncs.com/info/demo/icon/9.png?x-oss-process=image/resize,m_fill,w_4096,h_4096",
                    "icon": "",
                    "url": memberDomain + "/fabu-info?typeid=9",
                    "style": 0,
                    "searchall": 0,
                    "redirect": "",
                    "lower": 8,
                    "default": 1,
                    "subname": "",
                    "setStyle": {
                        "fontWeight": 0,
                        "fontSize": 14,
                        "color": "#737780",
                        "bgColor": "#F7F8FA",
                        "subColor": "#9DA0A6"
                    }
                },
                {
                    "link_title": "分类信息-顺风车",
                    "id": 10,
                    "parentid": 0,
                    "typename": "顺风车",
                    "title": "顺风车",
                    "iconturl": "https://ihuoniao-uploads.oss-cn-hangzhou.aliyuncs.com/info/demo/icon/10.png?x-oss-process=image/resize,m_fill,w_4096,h_4096",
                    "icon": "",
                    "url": memberDomain + "/fabu-info?typeid=10",
                    "style": 0,
                    "searchall": 0,
                    "redirect": "",
                    "lower": 3,
                    "default": 1,
                    "subname": "",
                    "setStyle": {
                        "fontWeight": 0,
                        "fontSize": 14,
                        "color": "#737780",
                        "bgColor": "#F7F8FA",
                        "subColor": "#9DA0A6"
                    }
                },
                {
                    "link_title": "分类信息-批发采购",
                    "id": 98,
                    "parentid": 0,
                    "typename": "批发采购",
                    "title": "批发采购",
                    "iconturl": "https://ihuoniao-uploads.oss-cn-hangzhou.aliyuncs.com/info/demo/icon/98.png?x-oss-process=image/resize,m_fill,w_4096,h_4096",
                    "icon": "",
                    "url": memberDomain + "/fabu-info?typeid=98",
                    "style": 0,
                    "searchall": 0,
                    "redirect": "",
                    "lower": 8,
                    "default": 1,
                    "subname": "",
                    "setStyle": {
                        "fontWeight": 0,
                        "fontSize": 14,
                        "color": "#737780",
                        "bgColor": "#F7F8FA",
                        "subColor": "#9DA0A6"
                    }
                },
                {
                    "link_title": "分类信息-家居装修",
                    "id": 11,
                    "parentid": 0,
                    "typename": "家居装修",
                    "title": "家居装修",
                    "iconturl": "https://ihuoniao-uploads.oss-cn-hangzhou.aliyuncs.com/info/demo/icon/11.png?x-oss-process=image/resize,m_fill,w_4096,h_4096",
                    "icon": "",
                    "url": memberDomain + "/fabu-info?typeid=11",
                    "style": 0,
                    "searchall": 0,
                    "redirect": "",
                    "lower": 8,
                    "default": 1,
                    "subname": "",
                    "setStyle": {
                        "fontWeight": 0,
                        "fontSize": 14,
                        "color": "#737780",
                        "bgColor": "#F7F8FA",
                        "subColor": "#9DA0A6"
                    }
                },
                {
                    "link_title": "分类信息-保健养生",
                    "id": 13,
                    "parentid": 0,
                    "typename": "保健养生",
                    "title": "保健养生",
                    "iconturl": "https://ihuoniao-uploads.oss-cn-hangzhou.aliyuncs.com/info/demo/icon/13.png?x-oss-process=image/resize,m_fill,w_4096,h_4096",
                    "icon": "",
                    "url": memberDomain + "/fabu-info?typeid=13",
                    "style": 0,
                    "searchall": 0,
                    "redirect": "",
                    "lower": 4,
                    "default": 1,
                    "subname": "",
                    "setStyle": {
                        "fontWeight": 0,
                        "fontSize": 14,
                        "color": "#737780",
                        "bgColor": "#F7F8FA",
                        "subColor": "#9DA0A6"
                    }
                },
                {
                    "link_title": "分类信息-婚庆摄影",
                    "id": 12,
                    "parentid": 0,
                    "typename": "婚庆摄影",
                    "title": "婚庆摄影",
                    "iconturl": "https://ihuoniao-uploads.oss-cn-hangzhou.aliyuncs.com/info/demo/icon/12.png?x-oss-process=image/resize,m_fill,w_4096,h_4096",
                    "icon": "",
                    "url": memberDomain + "/fabu-info?typeid=12",
                    "style": 0,
                    "searchall": 0,
                    "redirect": "",
                    "lower": 8,
                    "default": 1,
                    "subname": "",
                    "setStyle": {
                        "fontWeight": 0,
                        "fontSize": 14,
                        "color": "#737780",
                        "bgColor": "#F7F8FA",
                        "subColor": "#9DA0A6"
                    }
                },
                {
                    "link_title": "分类信息-万能求助",
                    "id": 14,
                    "parentid": 0,
                    "typename": "万能求助",
                    "title": "万能求助",
                    "iconturl": "https://ihuoniao-uploads.oss-cn-hangzhou.aliyuncs.com/info/demo/icon/14.png?x-oss-process=image/resize,m_fill,w_4096,h_4096",
                    "icon": "",
                    "url": memberDomain + "/fabu-info?typeid=14",
                    "style": 0,
                    "searchall": 0,
                    "redirect": "",
                    "lower": 8,
                    "default": 1,
                    "subname": "",
                    "setStyle": {
                        "fontWeight": 0,
                        "fontSize": 14,
                        "color": "#737780",
                        "bgColor": "#F7F8FA",
                        "subColor": "#9DA0A6"
                    }
                },
                {
                    "link_title": "分类信息-一级外链",
                    "id": 123,
                    "parentid": 0,
                    "typename": "一级外链",
                    "title": "一级外链",
                    "iconturl": "https://ihuoniao-uploads.oss-cn-hangzhou.aliyuncs.com/info/adv/large/2022/03/11/16469931689040.png?x-oss-process=image/resize,m_fill,w_4096,h_4096",
                    "icon": "",
                    "url": memberDomain + "/fabu-info?typeid=123",
                    "style": 0,
                    "searchall": 0,
                    "redirect": "https://www.qq.com",
                    "default": 1,
                    "subname": "",
                    "setStyle": {
                        "fontWeight": 0,
                        "fontSize": 14,
                        "color": "#737780",
                        "bgColor": "#F7F8FA",
                        "subColor": "#9DA0A6"
                    }
                },
                {
                    "link_title": "分类信息-商家列表",
                    "id": 124,
                    "parentid": 0,
                    "typename": "商家列表",
                    "title": "商家列表",
                    "iconturl": "https://ihuoniao-uploads.oss-cn-hangzhou.aliyuncs.com/info/adv/large/2022/06/10/1654827016854.png?x-oss-process=image/resize,m_fill,w_4096,h_4096",
                    "icon": "",
                    "url": memberDomain + "/fabu-info?typeid=124",
                    "style": 0,
                    "searchall": 0,
                    "redirect": "https://ihuoniao.cn/sz/business/list.html?typeid=61",
                    "default": 1,
                    "subname": "",
                    "setStyle": {
                        "fontWeight": 0,
                        "fontSize": 14,
                        "color": "#737780",
                        "bgColor": "#F7F8FA",
                        "subColor": "#9DA0A6"
                    }
                }
            ]
        }
    },
    {
        "id": "78",
        "name": "顺风车",
        "icon": "/static/images/admin/nav/sfcar.png",
        "code": "sfcar",
        "bold": "0",
        "target": "0",
        "color": "",
        "wx": "1",
        "app": "0",
        "searchUrl": masterDomain + "/search-list.html?action=sfcar&keywords=",
        "url": memberDomain + "/fabu-sfcar",
        "title": "顺风车首页",
        "description": "顺风车描述22",
        "logo": masterDomain + "/include/attachment.php?f=/siteConfig/logo/large/2023/10/12/16970984256035.png",
        "disabled": 0,
        "fabu": 1,
        "show": 1,
        "level": 1,
        "showLevel": 1,
        "level_disabeld": 0,
        "setStyle": {
            "name": "顺风车",
            "tStyle": {
                "fontWeight": 1,
                "fontSize": 18,
                "color": "#292C33"
            },
            "marginStyle": 2,
            "style": {
                "bgColor": "#F2F5FF",
                "color": "#4772FF",
                "subColor": "#9DA0A6"
            },
            "typeList": [
                {
                    "id": 1,
                    "code": "",
                    "title": sfcar_displayConfig[1]['title'],
                    "link_title": "发布顺风车-" + sfcar_displayConfig[1]['title'],
                    "typename": sfcar_displayConfig[1]['title'],
                    "url": memberDomain + "/fabu-sfcar.html?type=1",
                    "icon": "/static/images/admin/fabuPage/sfcar_01.png",
                    "default": 1,
                    "subname": "",
                    "setStyle": {
                        "fontWeight": 0,
                        "fontSize": 14,
                        "color": "#4772FF",
                        "bgColor": "#F2F5FF",
                        "subColor": "#9DA0A6"
                    }
                },
                {
                    "id": 2,
                    "code": "",
                    "url": memberDomain + "/fabu-sfcar.html?type=0",
                    "title": sfcar_displayConfig[0]['title'],
                    "link_title": "发布顺风车-" + sfcar_displayConfig[0]['title'],
                    "typename": sfcar_displayConfig[0]['title'],
                    "icon": "/static/images/admin/fabuPage/sfcar_02.png",
                    "default": 1,
                    "subname": "",
                    "setStyle": {
                        "fontWeight": 0,
                        "fontSize": 14,
                        "color": "#4772FF",
                        "bgColor": "#F2F5FF",
                        "subColor": "#9DA0A6"
                    }
                },
                {
                    "id": 3,
                    "code": "",
                    "url": memberDomain + "/fabu-sfcar.html?type=1&startType=1",
                    "title": "天天发车",
                    "typename": "天天发车",
                    "link_title": "发布顺风车-天天发车",
                    "icon": "/static/images/admin/fabuPage/sfcar_03.png",
                    "default": 1,
                    "subname": "",
                    "setStyle": {
                        "fontWeight": 0,
                        "fontSize": 14,
                        "color": "#4772FF",
                        "bgColor": "#F2F5FF",
                        "subColor": "#9DA0A6"
                    }
                }
            ]
        }
    },
    {
        "id": 1716444653406,
        "code": [
            "article",
            "huodong",
            "tieba",
            "car",
            "live",
            "vote",
            "education",
            "pension"
        ],
        "setStyle": {
            "typeList": [
                {
                    "typename": "新闻投稿",
                    "link_title": "新闻投稿",
                    "subname": "资讯文章、本地新闻",
                    "default": 1,
                    "id": "17",
                    "name": "信息资讯",
                    "icon": "/static/images/admin/fabuPage/article.png",
                    "code": "article",
                    "bold": "0",
                    "target": "0",
                    "color": "",
                    "wx": "1",
                    "app": "0",
                    "searchUrl": masterDomain + "/search-list.html?action=article&keywords=",
                    "url": memberDomain + "/fabu-article",
                    "title": "苏州资讯",
                    "description": "资讯描述",
                    "logo": masterDomain + "/include/attachment.php?f=/siteConfig/logo/large/2023/10/12/16970984256035.png",
                    "disabled": 0,
                    "fabu": 1,
                    "show": 1,
                    "level": 0,
                    "showLevel": 0,
                    "level_disabeld": 0,
                    "setStyle": {
                        "fontWeight": 0,
                        "fontSize": 14,
                        "color": "#525866",
                        "bgColor": "#F5F7FA",
                        "subColor": "#9DA0A6"
                    }
                },
                {
                    "typename": "发活动",
                    "link_title": "发活动",
                    "subname": "同城活动、收费活动",
                    "default": 1,
                    "id": "52",
                    "name": "同城活动",
                    "icon": "/static/images/admin/fabuPage/huodong.png",
                    "code": "huodong",
                    "bold": "0",
                    "target": "0",
                    "color": "",
                    "wx": "1",
                    "app": "0",
                    "searchUrl": masterDomain + "/search-list.html?action=huodong&keywords=",
                    "url": masterDomain + "/sz/huodong/fabu.html",
                    "title": "活动标题",
                    "description": "活动描述",
                    "logo": masterDomain + "/include/attachment.php?f=/siteConfig/logo/large/2023/10/12/16970984256035.png",
                    "disabled": 0,
                    "fabu": 1,
                    "show": 1,
                    "level": 0,
                    "showLevel": 0,
                    "level_disabeld": 0,
                    "setStyle": {
                        "fontWeight": 0,
                        "fontSize": 14,
                        "color": "#525866",
                        "bgColor": "#F5F7FA",
                        "subColor": "#9DA0A6"
                    }
                },
                {
                    "typename": "发帖子",
                    "link_title": "发帖子",
                    "subname": "交流灌水、贴吧热议",
                    "default": 1,
                    "id": "49",
                    "name": "贴吧社区",
                    "icon": "/static/images/admin/fabuPage/tieba.png",
                    "code": "tieba",
                    "bold": "0",
                    "target": "0",
                    "color": "",
                    "wx": "1",
                    "app": "0",
                    "searchUrl": masterDomain + "/search-list.html?action=tieba&keywords=",
                    "url": fabu_tieba,
                    "title": "贴吧标题",
                    "description": "贴吧描述",
                    "logo": masterDomain + "/include/attachment.php?f=/siteConfig/logo/large/2023/10/12/16970984256035.png",
                    "disabled": 0,
                    "fabu": 1,
                    "show": 1,
                    "level": 0,
                    "showLevel": 0,
                    "level_disabeld": 0,
                    "setStyle": {
                        "fontWeight": 0,
                        "fontSize": 14,
                        "color": "#525866",
                        "bgColor": "#F5F7FA",
                        "subColor": "#9DA0A6"
                    }
                },
                {
                    "typename": "发布二手车",
                    "link_title": "发布二手车",
                    "subname": "个人二手车、委托卖车",
                    "default": 1,
                    "id": "68",
                    "name": "汽车门户",
                    "icon": "/static/images/admin/fabuPage/car.png",
                    "code": "car",
                    "bold": "0",
                    "target": "0",
                    "color": "",
                    "wx": "1",
                    "app": "0",
                    "searchUrl": masterDomain + "/search-list.html?action=car&keywords=",
                    "url": masterDomain + "/sz/car/sell.html",
                    "title": "汽车首页",
                    "description": "汽车描述",
                    "logo": masterDomain + "/include/attachment.php?f=/siteConfig/logo/large/2023/10/12/16970984256035.png",
                    "disabled": 0,
                    "fabu": 1,
                    "show": 1,
                    "level": 0,
                    "showLevel": 0,
                    "level_disabeld": 0,
                    "setStyle": {
                        "fontWeight": 0,
                        "fontSize": 14,
                        "color": "#525866",
                        "bgColor": "#F5F7FA",
                        "subColor": "#9DA0A6"
                    }
                },
                {
                    "typename": "发起直播",
                    "link_title": "发起直播",
                    "subname": "企业直播、互动带货",
                    "default": 1,
                    "id": "61",
                    "name": "视频直播",
                    "icon": "/static/images/admin/fabuPage/live.png",
                    "code": "live",
                    "bold": "0",
                    "target": "0",
                    "color": "",
                    "wx": "1",
                    "app": "0",
                    "searchUrl": masterDomain + "/search-list.html?action=live&keywords=",
                    "url": memberDomain + "/fabu-live",
                    "title": "苏州直播",
                    "description": "火鸟直播",
                    "logo": masterDomain + "/include/attachment.php?f=/siteConfig/logo/large/2023/10/12/16970984256035.png",
                    "disabled": 0,
                    "fabu": 1,
                    "show": 1,
                    "level": 0,
                    "showLevel": 0,
                    "level_disabeld": 0,
                    "setStyle": {
                        "fontWeight": 0,
                        "fontSize": 14,
                        "color": "#525866",
                        "bgColor": "#F5F7FA",
                        "subColor": "#9DA0A6"
                    }
                },
                {
                    "typename": "发起投票",
                    "link_title": "发起投票",
                    "subname": "快速发布、投票统计",
                    "default": 1,
                    "id": "59",
                    "name": "投票活动",
                    "icon": "/static/images/admin/fabuPage/vote.png",
                    "code": "vote",
                    "bold": "0",
                    "target": "0",
                    "color": "",
                    "wx": "1",
                    "app": "0",
                    "searchUrl": masterDomain + "/search-list.html?action=vote&keywords=",
                    "url": memberDomain + "/fabu-vote",
                    "title": "投票",
                    "description": "投票描述",
                    "logo": masterDomain + "/include/attachment.php?f=/siteConfig/logo/large/2023/10/12/16970984256035.png",
                    "disabled": 0,
                    "fabu": 1,
                    "show": 1,
                    "level": 0,
                    "showLevel": 0,
                    "level_disabeld": 0,
                    "setStyle": {
                        "fontWeight": 0,
                        "fontSize": 14,
                        "color": "#525866",
                        "bgColor": "#F5F7FA",
                        "subColor": "#9DA0A6"
                    }
                },
                {
                    "typename": "找家教",
                    "link_title": "发布求学留言",
                    "subname": "发布教学需求",
                    "default": 1,
                    "id": "73",
                    "name": "教育培训",
                    "icon": "/static/images/admin/fabuPage/education.png",
                    "code": "education",
                    "bold": "0",
                    "target": "0",
                    "color": "",
                    "wx": "0",
                    "app": "1",
                    "searchUrl": masterDomain + "/search-list.html?action=education&keywords=",
                    "url": memberDomain + "/fabu-education",
                    "title": "教育培训",
                    "description": "教育培训描述",
                    "logo": masterDomain + "/include/attachment.php?f=/siteConfig/logo/large/2023/10/12/16970984256035.png",
                    "disabled": 0,
                    "fabu": 1,
                    "show": 1,
                    "level": 0,
                    "showLevel": 0,
                    "level_disabeld": 0,
                    "setStyle": {
                        "fontWeight": 0,
                        "fontSize": 14,
                        "color": "#525866",
                        "bgColor": "#F5F7FA",
                        "subColor": "#9DA0A6"
                    }
                },
                {
                    "typename": "养老需求",
                    "link_title": "发布老人信息",
                    "subname": "发布养老信息、试住有礼",
                    "default": 1,
                    "id": "74",
                    "name": "养老机构",
                    "icon": "/static/images/admin/fabuPage/pension.png",
                    "code": "pension",
                    "bold": "0",
                    "target": "0",
                    "color": "",
                    "wx": "1",
                    "app": "0",
                    "searchUrl": masterDomain + "/search-list.html?action=pension&keywords=",
                    "url": memberDomain + "/fabu-pension-elderly.html",
                    "title": "养老机构",
                    "description": "养老机构描述",
                    "logo": masterDomain + "/include/attachment.php?f=/siteConfig/logo/large/2023/10/12/16970984256035.png",
                    "disabled": 0,
                    "fabu": 1,
                    "show": 1,
                    "level": 0,
                    "showLevel": 0,
                    "level_disabeld": 0,
                    "setStyle": {
                        "fontWeight": 0,
                        "fontSize": 14,
                        "color": "#525866",
                        "bgColor": "#F5F7FA",
                        "subColor": "#9DA0A6"
                    }
                }
            ],
            "name": "发布更多内容",
            "tStyle": {
                "fontWeight": 1,
                "fontSize": "16",
                "color": "#292C33"
            },
            "marginStyle": 3,
            "style": {
                "bgColor": "#F5F7FA",
                "color": "#525866",
                "subColor": "#9DA0A6"
            }
        }
    }
]
var fabuDefaultObj = {
    themeColor:'#07BF77', //标题 主题色
    fabuArr: JSON.parse(JSON.stringify(fabuDefault)),
}
new Vue({
    el:'#page',
    data:{
        loading:false,
        loadInfo:false,
        setColShow:false, //设置栏是否显示
        currModule:{}, //当前选中的模块
        currEditInd:null, //当前编辑的一级类目索引，
        currHoverInd:null, //当前鼠标上移

        currEditLower:null, //当前编辑的二级类名 为空则表示没有编辑二级
        currEditLowerInd:null, //当前编辑的二级类名索引 为空则表示没有编辑二级
        currHoverLowerInd:null, //当前编辑的二级类名索引 为空则表示没有编辑二级
        currEditTitle:false, //标题 正在编辑
        currHoverTitle:false, //标题鼠标上移
        currEditIcon:false, //图标正在编辑
        currHoverIcon:false, //图标鼠标上移

        steps:['选择分类','填写信息','发布成功'],
        formData: infoArr && infoArr.customChildren ? JSON.parse(JSON.stringify(infoArr.customChildren)) : JSON.parse(JSON.stringify(fabuDefaultObj)),
        colorPicker:false, //颜色选择器显隐状态
        popOver:{ //弹窗控制
            themeColor:false, // 主题色弹窗控制
            themeColorPicker:false,
            tStylePover:false,
            tStyleColor:false,
            tStyleColorPicker:false,

            styleColor:false, //字体色彩选择
            styleColorPicker:false, //字体色彩选择
            styleBgColor:false, //背景色彩选择
            styleBgColorPicker:false, //背景色彩选择
            styleSubColor:false, //副文本色彩选择
            styleSubColorPicker:false, //副文本色彩选择
        },
        siteModule:[], //模块
        // ,{ code:'xzl', title:'写字楼' , typename:'写字楼'}
        houseFabuList:[{ code:'zu', title:'出租房' , typename:'出租房' },{ code:'sale', title:'二手房' , typename:'二手房' },{ code:'cf', title:'厂房/仓库'  , typename:'厂房/仓库'},{ code:'sp', title:'办公/商铺'  , typename:'办公/商铺'},{ code:'cw', title:'车位'  , typename:'车位'},{ code:'demand', title:'求租求购'  , typename:'求租求购'}],
        fontArr:[14,18,20,22,24],
        editText:false, //编辑文本
        editLink:false, //编辑链接

        changeState:false,
        sortObj:{},
        setConH:60,
        inputData:'', //兼容输入框有正在输入中文
        focusInp:'',
        platformDefault:infoArr && infoArr.customChildren ? infoArr.customChildren.default : 0, //0 => 自定义  1 => 平台默认
        currChange:'', //存放之前设置的
        uploadIng:false,
        linkOn:false,
    },
    mounted(){
        const that = this;
        var localUrl = window.location.href;
        var location = localUrl.replace(masterDomain+'/','');
        var homeUrl = masterDomain+'/'+location.split('/')[0];
        $(".backHome").attr('href',homeUrl);
        that.getSiteModule();
        // console.log($(".set_pop").height())
        $(".topbarlink li").eq(0).find('a').css({'color':that.formData.themeColor})

        $('body').click(function(e){
            let popOver = $(".el-color-picker__panel.colorPickerPop");
            if(popOver.length){
                for(let i = 0; i < popOver.length; i++){
                    let currPop = $(".el-color-picker__panel.colorPickerPop")[i];
                    if(!$(currPop).is(':hidden')){  //表示有当前正在显示的
                        let classStr = $(currPop).attr('class')
                        classStr = classStr.replace('colorPickerPop','')
                        let classArr = classStr.split(' ');

                        let currParam = classArr.find(item => {
                            return item.indexOf('el-') == -1;
                        });
                        that.$set(that.popOver,currParam,false)
                        that.$set(that.popOver,currParam.replace('Picker',''),false)
                        break;
                    }
                }
            }

            if($(e.target).closest('.pover').length == 0){  //非弹窗 
                if(!$(e.target).is("input")){
                    that.currEditInd = null;
                    that.editText = false;
                    that.editLink = false;
                    console.log('改')
                }
            }
        })



        setTimeout(() => {
            that.changeSetPopHeight()
            that.initSort();
            that.initAllSortBtn();
            that.initColor()
        }, 300);
    },
    methods:{
        checkAddTypeList(){
            const that = this;
            let fabuArr = that.formData.fabuArr;
            let obj = fabuArr.find(item => {
                return item.code == 'info'
            })
            if(obj){
                that.getTypeList('info',1)
            }
        },
        // 修改主题色
        changeTheme(val,ind){
            const that = this;
            if(val){
                that.popOver.themeColor = (ind == 0)
            }else if(!that.popOver.themeColorPicker){
                that.popOver.themeColor = false;
            }
        },

        // dl鼠标上移
        dlHover(val,ind){
            const that = this;
            if(val){
                // 判断是否有色彩选择器正在显示
                let hasShow = false
                for(let item in that.popOver){
                    if(item.indexOf('Picker') > -1 && that.popOver[item]){
                        // 此判断 表示有色彩选择器在显示中
                        // console.log(item)
                        hasShow = true;
                        break;
                    }
                }
                if(!hasShow){
                    that.currHoverInd = ind;
                }else{
                    that.currHoverInd = null 
                }

                // 判断如果有pover正在显示 表示正在编辑某一项  鼠标上移时 有不同的需要隐藏
                // currEditInd,currEditLowerInd,currEditTitle,currEditIcon
                // if(!that.isBlank(that.currEditInd) && !that.isBlank(that.currHoverInd) ){
                //     if(that.currHoverInd != that.currEditInd && !that.editText){
                //         that.currEditInd = null;
                //         that.currEditTitle = false;
                //         that.currEditLowerInd = null;
                //         that.editLink = false
                //     }
                //     that.currEditIcon = false;
                // }

            }else{
                that.currHoverInd = null

            }

        
        },
        isBlank(data) {
            if (
                data == null ||
                data === 'null' ||
                data === '' ||
                data === undefined ||
                data === 'undefined' ||
                data === 'unknown'
            ) {
                return true
            } else {
                return false
            }
        },
        // dt鼠标上移
        dtHover(val,ind){
            const that = this;
            if(val){
                that.$nextTick(() => {
                    let hasShow = false
                    for(let item in that.popOver){
                        if(item.indexOf('Picker') > -1 && that.popOver[item]){
                            // 此判断 表示有色彩选择器在显示中
                            // console.log(item,1)
                            hasShow = true;
                            break;
                        }
                    }
                    if(!hasShow){
                        that.currHoverTitle = true
                    }else{
                        that.currHoverTitle = false
                    }

                    // if(!that.isBlank(that.currEditInd) && !that.isBlank(that.currHoverInd)){
                    //     if( that.currHoverInd != that.currEditInd){
                    //         that.currEditInd = null;
                    //         that.currEditTitle = false;
                    //     }
                    //     that.currEditLowerInd = null;
                    //     that.currEditIcon = false;
                    //     that.editLink = false
                    // }
                })
            }else{
                that.currHoverTitle = false
            }
        },

        // 二级按钮鼠标上移
        btnHover(val,ind){
            const that = this;
            if(val){
                let hasShow = false
                for(let item in that.popOver){
                    if(item.indexOf('Picker') > -1 && that.popOver[item]){
                        // 此判断 表示有色彩选择器在显示
                        // console.log(item,2)
                        hasShow = true;
                        break;
                    }
                }
                if(!hasShow){
                    that.currHoverLowerInd = ind
                }else{
                    that.currHoverLowerInd = null
                }
                // if(!that.isBlank(that.currEditInd) && !that.isBlank(that.currHoverInd)){
                //     // console.log(1)
                //     if( that.currHoverInd != that.currEditInd){
                //         // console.log(2)
                //         that.currEditInd = null;
                //         that.currEditLowerInd = null;
                //         that.currEditTitle = false;
                //         that.currEditIcon = false;
                //         that.editLink = false
                //         that.editText = false
                //     }else if(!that.isBlank(that.currEditLowerInd) && !that.isBlank(that.currHoverLowerInd) && that.currHoverLowerInd != that.currEditLowerInd && !that.editLink ){
                //         that.currEditLowerInd = null;
                //         that.currEditTitle = false;
                //         that.currEditIcon = false;
                //         that.editText = false;
                //     }
                // }
            }else{
                that.currHoverLowerInd = null;
            }
        },

        // 图标 鼠标上移
        iconHover(val,ind){
            const that = this;
            if(val){
                let hasShow = false
                for(let item in that.popOver){
                    if(item.indexOf('Picker') > -1 && that.popOver[item]){
                        // 此判断 表示有色彩选择器在显示中
                        // console.log(item,3)
                        hasShow = true;
                        break;
                    }
                }
                if(!hasShow && !that.currEditInd){
                    that.currHoverIcon = true
                }
            }else{
                that.currHoverIcon = false
            }
        },

        // 色彩选择器拖动 更改颜色
        activeChangeColor(color,obj,key){
            const that = this;
            color = that.colorHex(color);
            if(key == 'themeColor'){
                that.$set(obj,key,color)
                $(".topbarlink li").eq(0).find('a').css({'color':color})
            }else if(key){
                that.$set(obj,key,color)
            }
        },

        initColor(){
            const that = this;
            let el = document.getElementById('page');
            // document.getElementById('page').addEventListener('click',function(){
            //     console.log(this)
            // })
            // $('.colorChangeInp').each(function(){
            //     let el = $(this)[0]
            //     let color = $(this).attr('data-color')
            //     el.style.setProperty('--placeholder-color',color);
            //     // console.log(color)
            // })
        },

        // 色彩选择器点击确认
        colorPickerHide(val,key,ind,fb_ind){
            const that = this;
            // console.log(key)
            if(!val){
                // 表示重置此项
                let currObj = that.formData.fabuArr[ind];
                if(key.indexOf('tStyleColor') > -1){
                    let obj = that.formData.fabuArr[ind].setStyle.tStyle;
                    that.$set(obj,'color','#292C33')
                }else{
                    let param = ''
                    switch(key){
                        case 'styleColorPicker':
                            param = 'color';
                            break;
                        case 'styleSubColorPicker':
                            param = 'subColor';
                            break;
                        case 'styleBgColorPicker':
                            param = 'bgColor'
                            break;
                    }
                    if(that.isBlank(fb_ind)){
                        let code = currObj.code;
                        let color = ''
                        switch(param){
                            case 'color':
                                color = '#525866';
                                break;
                            case 'subColor':
                                color = '#f5f7fa';
                                break;
                            case 'bgColor':
                                color = '#9da0a6'
                                break;
                        } 
                        if(code && !Array.isArray(code)){
                            switch(code){
                                case 'house':
                                    if(param == 'color'){
                                        color = '#fff4ee'
                                    }else{
                                        color = '#ff7123'
                                    }
                                    break;
                                case 'job':
                                    if(param == 'color'){
                                        color = '#3382FF'
                                    }else{
                                        color = '#F2F7FF'
                                    }
                                    break;
                                case 'sfcar':
                                    if(param == 'color'){
                                        color = '#4772FF'
                                    }else{
                                        color = '#F2F5FF'
                                    }
                                    break;
                                case 'info':
                                    if(param == 'color'){
                                        color = '#737780'
                                    }else{
                                        color = '#F7F8FA'
                                    }
                                    break;
                            }
                        }
                        that.$nextTick(() => {
                            // console.log(currObj.setStyle,param,color)
                            that.$set(currObj.setStyle.style,param,color);
                            that.changAllItem(color,currObj.setStyle,param)
                        })
                    }else{
                        let obj = that.formData.fabuArr[ind].setStyle.typeList[fb_ind];
                        let color = that.formData.fabuArr[ind].setStyle.style[param]

                        that.$nextTick(() => {
                            that.$set(obj.setStyle,param,color);
                        })
                    }
                    
                    
                }
                
            }
            that.$set(that.popOver,key,false)
            let key_ = key.replace('Picker','');
            that.$set(that.popOver,key_,false)
        },

        // 改变所有项的颜色  
        changAllItem(color,obj,key){
            const that = this;
            color = that.colorHex(color);
            that.$set(obj['style'],key,color)
            let list = obj['typeList'];
            for(let i = 0; i < list.length; i++){
                that.$set(list[i].setStyle,key,color)
            }
        },

        colorHex: function (string) {
            if (/^(rgb|RGB)/.test(string)) {
                var aColor = string.replace(/(?:\(|\)|rgb|RGB)*/g, "").split(",");
                var strHex = "#";
                for (var i = 0; i < aColor.length; i++) {
                    var hex = Number(aColor[i]).toString(16);
                    // 修正：不足两位，补0
                    if (hex.length == 1) {
                        hex = "0" + hex
                    } else {
                        if (hex == "0") {
                            hex += hex;
                        }
                    }
                    strHex += hex;
                }
                
                if (strHex.length != 7) {
                    strHex = string;
                }
                return strHex;
            } else if (string.indexOf('#') > -1) {
                var aNum = string.replace(/#/, "").split("");
                if (aNum.length === 6) {
                    return string;
                } else if (aNum.length === 3) {
                    var numHex = "#";
                    for (var i = 0; i < aNum.length; i += 1) {
                        numHex += (aNum[i] + aNum[i]);
                    }
                    return numHex;
                }
            } else {
                return string;
            }
        },

        // 弹窗显隐
        clickFn(obj,key,type){
            const that = this;
            // 此处延时器如果删除则不能达到效果  原因不明
            if(type == 2){
                that.editCurrModule('currEditLowerInd')
            }else if(type == 1){
                that.editCurrModule('currEditInd')
            }
            for(let item in obj){
                if(item.indexOf('Picker') > -1 && item != (key + 'Picker')){
                    that.$set(obj,item,false)
                }
            }
            let val = obj[key + 'Picker']
            if(val){
                that.$set(obj,key + 'Picker',false)
            }else{
                that.$set(obj,key + 'Picker',true)
            }
            
        },

        // 设置模块  单个发布 {code:[],fabuArr:[]}
        choseMod(mod){
            const that = this;
            if(that.platformDefault){
                this.$message({
                    message: '如需修改请切换至自定义发布',
                    type: 'warning'
                  });
                return false
            }
            that.currModule = JSON.parse(JSON.stringify(mod));
            let code = mod.code;
            let hasInd = that.formData.fabuArr.findIndex(item => {
                return item.code == code || (Array.isArray(item.code) && item.code.indexOf(code) > -1);
            })
            let url = memberDomain + '/fabu-' + code;
            that.$nextTick(() => {
                that.changeSetPopHeight();
            })
            let colorSet = {
                bgColor:'#F7F8FA',
                color:'#737780',
            }
            switch(mod.code){
                case 'house':
                    colorSet = {
                        bgColor:'#FFF4EE',
                        color:'#FF7123',
                    };
                    break;
                case 'job':
                    colorSet = {
                        bgColor:'#F2F7FF',
                        color:'#3382FF',
                    };
                    break;
                case 'info':
                    colorSet = {
                        bgColor:'#F7F8FA',
                        color:'#737780',
                    };
                    break;
                case 'sfcar':
                    colorSet = {
                        bgColor:'#F2F5FF',
                        color:'#4772FF',
                    };
                    break;
            }
            if(hasInd <= -1){ //没添加过
                if(mod.showLevel){ //有二级分类
                    that.currModule['setStyle'] = {
                        name:mod.name,
                        tStyle:{
                            fontWeight:1, //是否加粗
                            fontSize:18,
                            color:'#292C33',
                        },
                        marginStyle:(mod.code == 'info' ? 1 : 2), //  1 => 密集  2 => 中等  3 => 疏松
                        style:{
                            ...JSON.parse(JSON.stringify(colorSet)),
                            subColor:'#9DA0A6',
                        }
                    }
                    that.formData.fabuArr.push(JSON.parse(JSON.stringify(that.currModule)))
                    that.currModule = that.formData.fabuArr[that.formData.fabuArr.length - 1]
                    that.getTypeList(code)
                    that.$nextTick(() => { // 初始化排序
                        that.initBtnSort(that.currModule.id)
                    })
                }else{
                    let iconUr = ['article','huodong','tieba','car','live','vote','education','pension'].includes(mod.code) ? '/static/images/admin/fabuPage/' + mod.code + '.png' : ''
                    let setObj = {
                        icon:iconUr, //图标，
                        setStyle:{
                            fontWeight:0, //是否加粗
                            fontSize:14,
                            color:'#525866',
                            bgColor:'#F5F7FA',
                            subColor:'#9DA0A6', //副文本
                        }
                    }
                    let subname = '',link_title = that.currModule.name;
                    switch(mod.code){
                        case 'article':
                           
                            subname = '资讯文章、本地新闻';
                            break;
                        case 'huodong':
                            subname = '同城活动、收费活动';
                            break;
                        case 'tieba':
                            subname = '交流灌水、贴吧热议';
                            break;
                        case 'car':
                            subname = '个人二手车、委托卖车';
                            break;
                        case 'live':
                            subname = '企业直播、互动带货';
                            break;
                        case 'vote':
                            subname = '快速发布、投票统计';
                            break;
                        case 'education':
                            link_title = '发布求学留言'
                            subname = '发布教学需求';
                            break;
                        case 'pension':
                            link_title = '发布老人信息'
                            subname = '发布养老信息、试住有礼';
                            break;
                    }
                    that.currModule = {
                        typename:that.currModule.name,
                        link_title:link_title,
                        subname:subname,
                        default:1,
                        ...that.currModule,
                        ...setObj,
                    }
                    // 查找是否已经添加过"发布更多内容"
                    let moreObj = that.formData.fabuArr.find(item => {
                        return Array.isArray(item.code)
                    })
                    if(!moreObj){
                        let singleFabu = {
                            id:(new Date().valueOf()),
                            code:[code],
                            setStyle:{
                                typeList:[that.currModule],
                                name:'发布更多内容',
                                tStyle:{
                                    fontWeight:1, //是否加粗
                                    fontSize:16,
                                    color:'#292C33',
                                },
                                marginStyle:3, //  1 => 密集  2 => 中等  3 => 疏松
                                style:{
                                    bgColor:'#F5F7FA',
                                    color:'#525866',
                                    subColor:'#9DA0A6', //副文本
                                }
                            },
                        };
                        that.formData.fabuArr.push(singleFabu)
                        that.$nextTick(() => { // 初始化排序
                            that.initBtnSort(singleFabu.id)
                        })
                    }else{
                        moreObj.code.push(that.currModule.code)
                        moreObj.setStyle.typeList.push(that.currModule)
                        that.$set(that.formData,'fabuArr',that.formData.fabuArr)
                    }
                }
                
            }else{
                let codeArr = that.formData.fabuArr[hasInd].code
                if(Array.isArray(codeArr)){
                    let ind = that.formData.fabuArr[hasInd].setStyle.typeList.findIndex(item => {
                        return item.code == code
                    })
                    that.currModule = that.formData.fabuArr[hasInd].setStyle.typeList[ind]
                }else{
                    that.currModule = that.formData.fabuArr[hasInd]
                }
            }

        },

        // 获取模块
        getSiteModule(){
            const that = this;
            that.loading = true
            let fabuArr = ['tieba','article','info','house','job','huodong','pension','vote','live','car','education','sfcar'];
            let hasTypeArr = ['info','house','job','sfcar']; //二级分类
            $.ajax({
                url: '/include/ajax.php?service=siteConfig&action=siteModule&type=1',
                type: "GET",
                async: false,
                dataType: "jsonp",
                success: function (data) {
                    that.loading = false;
                    if(data.state == 100){
                        that.siteModule = data.info.map(mod => {
                            // if(mod.code == 'sfcar'){
                            //     console.log(mod)
                            // }
                            let fabu = fabuArr.includes(mod.code) ? 1 : 0; //表示是否有发布
                            let level = hasTypeArr.includes(mod.code) ? 1 : 0
                            let url = memberDomain + '/fabu-' + mod.code;
                            if(mod.code == 'huodong'){
                                url = fabu_huodong
                            }else if(mod.code == 'tieba'){
                                url = fabu_tieba
                            }else if(mod.code == 'pension'){
                                url = memberDomain + '/fabu-pension-elderly.html'
                            }else if(mod.code == 'car'){
                                url = carDomain;
                            }

                            return {
                                ...mod,
                                fabu:fabu,
                                show:1, //是否显示
                                level:level, //是否有二级分类
                                showLevel:(level ? 1 : 0), //是否显示二级分类  默认全部展开
                                level_disabeld: !['house','job','sfcar'].includes(mod.code) ? 1 : 0, //是否合并 
                                url:url
                            }
                        })
                        // console.log(that.siteModule)
                    }
                },
                error: function(){
                    // alert("登录失败！");
                    return false;
                }
            });
        },

        // 获取二级分类
        getTypeList(code){
            const that = this;
            let url =  memberDomain + '/fabu-' + code;
            let typeList = []; // 存放二级分类 => 主要是作为固定发布页
            // 测试 https://ihuoniao-uploads.oss-cn-hangzhou.aliyuncs.com/siteConfig/atlas/large/2024/05/21/17162718798577.png 
            let setObj = {
                icon:'', //图标，
                default:1, //表示非手动添加
                subname:'',
                setStyle:{
                    fontWeight:0, //是否加粗
                    fontSize:14,
                    color:'#737780',
                    bgColor:'#F7F8FA',
                    subColor:'#9DA0A6', //副文本
                }
            }
            switch(code){
                case 'info':
                case 'live':
                case 'article':
                    url =  memberDomain + '/fabu-' + code;
                    break;
                case 'sfcar':
                    setObj['icon'] = '/static/images/admin/fabuPage/sfcar_01.png';
                    setObj.setStyle.color = '#4772FF';
                    setObj.setStyle.bgColor = '#F2F5FF';
                    typeList.push({
                        id:1,
                        code:'',
                        title:'我是车主',
                        link_title:'发布顺风车-我是车主',
                        typename:'我是车主',
                        url: memberDomain + '/fabu-sfcar.html?type=1',
                        ...setObj
                    })
                    
                    setObj['icon'] = '/static/images/admin/fabuPage/sfcar_02.png'
                    typeList.push({
                        id:2,
                        code:'',
                        url: memberDomain + '/fabu-sfcar.html?type=0',
                        title:'我是乘客',
                        link_title:'发布顺风车-我是乘客',
                        typename:'我是乘客',
                        ...setObj
                    })
                    setObj['icon'] = '/static/images/admin/fabuPage/sfcar_03.png'
                    typeList.push({
                        id:3,
                        code:'',
                        url: memberDomain + '/fabu-sfcar.html?type=1&startType=1',
                        title:'天天发车',
                        typename:'天天发车',
                        link_title:'发布顺风车-天天发车',
                        ...setObj
                    })
                    
                    break;
                case 'houdong':
                    url = fabu_huodong;
                    break
                case 'job':
                    setObj['icon'] = '/static/images/admin/fabuPage/job_01.png'
                    setObj.setStyle.color = '#3382FF';
                    setObj.setStyle.bgColor = '#F2F7FF';
                    typeList.push({
                        id:1,
                        code:'',
                        title:'发布简历',
                        typename:'发布简历',
                        link_title:'发布简历',
                        url: memberDomain + '/job-resume.html',
                        ...setObj
                    })
                    setObj['icon'] = '/static/images/admin/fabuPage/job_02.png'
                    typeList.push({
                        id:2,
                        code:'',
                        url: fabu_post,
                        title:'发布职位',
                        typename:'发布职位',
                        link_title:'发布职位',
                        ...setObj
                    })
                    setObj['icon'] = '/static/images/admin/fabuPage/job_03.png'
                    typeList.push({
                        id:3,
                        code:'',
                        url: memberDomain +'/fabu_job_seek.html',
                        title:'极速招聘/求职',
                        link_title:'发布极速招聘/求职',
                        typename:'极速招聘/求职',
                        ...setObj
                    })
                    break;
                case 'house': //发布房产
                    setObj.setStyle.color = '#FF7123';
                    setObj.setStyle.bgColor = '#FFF4EE';
                    typeList = that.houseFabuList.map((item,ind) => {
                        setObj['icon'] = item.code == 'xzl' ? '':'/static/images/admin/fabuPage/'+item.code+'.png'
                        return {
                            id:(ind + 1),
                            show:1,
                            ...item,
                            link_title:'发布'+item.typename,
                            url:memberDomain + '/fabu-house-' + item.code + '.html',
                            ...setObj
                        }
                    })
                    break;
            }
            if(typeList.length){
                that.$set(that.currModule.setStyle,'typeList',typeList);
            }
            if(typeList.length) return false;
            that.loadInfo = true
            $.ajax({
                url: '/include/ajax.php?service='+ code +'&action=type',
                type: "GET",
                async: false,
                dataType: "jsonp",
                success: function (data) {
                    that.loadInfo = false
                    if(data.state == 100){
                        typeList = data.info.map(item => {
                            return {
                                link_title:that.currModule.name+ '-' + item.typename,
                                ...item,
                                url:url + '?typeid=' + item.id,
                                ...setObj
                            }
                        });
                        that.$set(that.currModule.setStyle,'typeList',typeList)
                    }
                },
                error: function(){
                    // alert("登录失败！");
                    return false;
                }
            });
        },

        
        editCurrModule(param){
            const that = this;
            if(that.uploadIng) return false;
            setTimeout(() => {
                that.uploadIng = false;
            },1000)

            // 先清除原始状态
            that.$set(that,'currEditTitle',false);
            that.$set(that,'currEditIcon',false);
            // if(that.currEditLowerInd != that.currHoverLowerInd || that.currEditInd != that.currHoverInd ){
            //     that.$set(that,'editLink',false);
            // }
            for(let item in that.popOver){
                if(item != 'tStylePover'){

                    that.$set(that.popOver,item,false)
                }
            }
            let hoverParam = param.replace('Edit','Hover')
            if(that.currHoverInd == null){
                // console.log('不需要清空1')
            }else{
                that.$set(that,'currEditInd',null,);
                if(param != 'currEditInd' && param != 'currEditTitle'){
                    if(that.currHoverLowerInd == null){
                        // console.log('不需要清空2')
                    }else{
                        that.$set(that,'currEditLowerInd',null,);
                        that.$set(that,'currEditLowerInd',that.currHoverLowerInd)
                    }
                }else{
                    that.$set(that,'currEditLowerInd',null,); 
                }
                that.$set(that,'currEditInd',that.currHoverInd)
            }
            if(that[hoverParam] == null){
                // console.log('不清空3')
            }else{
                that.$set(that,param,that[hoverParam])
            }

            // console.log(that.currEditInd,that.currEditLowerInd)
        },

        changeFontSize(fontSize){
            const that = this;
            let fontStyle = that.currModule.setStyle.tStyle
            fontStyle.fontSize = fontSize
            that.$set(that.currModule.setStyle,'tStyle',fontStyle)
        },

        // 删除
        delItem(ind,param){
            const that = this;
            that.editCurrModule(param)
            let formData = that.formData;
            let delObj = formData.fabuArr
            if(param == 'currEditInd'){
                delObj.splice(ind,1)
                that.$set(that.formData,'fabuArr',delObj)
                that.$set(that,'currEditInd',null)
            }else if(param == 'currEditLowerInd'){
                let lowerDelObj = delObj[that.currEditInd].setStyle.typeList;
                let hasDel = lowerDelObj.splice(ind,1)
                if(Array.isArray(delObj[that.currEditInd].code)){
                    let code = hasDel[0].code;
                    let code_ind = delObj[that.currEditInd].code.indexOf(code)
                    delObj[that.currEditInd].code.splice(code_ind,1)
                }
                that.$set(that.formData,'fabuArr',delObj)
                that.$set(that,'currEditLowerInd',null)
                that.$set(that,'currEditInd',null)
            }

        },

        // 图片上传成功
        iconUploadSuccess(response, file, fileList){
            const that = this;
            let ind = that.currEditInd == null ? that.currHoverInd : that.currEditInd,fb_ind = that.currEditLowerInd == null ?  that.currHoverLowerInd : that.currEditLowerInd;
            if(ind == null || fb_ind== null ) return false;
            let refArr = that.$refs['iconUp_' + ind + '_' + fb_ind]
            if(!refArr) return false; 
            for(let i = 0; i < refArr.length; i++){
                refArr[i].clearFiles(); //清除列表
            }
            let currMod = that.formData.fabuArr[ind]
            currFb = currMod.setStyle.typeList[fb_ind]
            currFb['icon'] = response.turl;
            that.$set(that.formData.fabuArr,ind,currMod)
            setTimeout(() => {
                that.uploadIng = false;
                
            }, 1000);
        },

        // 切换按钮的显示与隐藏
        checkBtnShow(ind){
            const that = this;
            let code = that.currModule.code ; //当前选择的模块
            let hasInd = that.formData.fabuArr.findIndex(item => {
                return item.code == code || item.code.indexOf(code) > -1;
            })
            let show = (ind == 0 ? 1 : 0) 
            that.currModule.show = show
            if(hasInd > -1 && !show){
                let currObj = that.formData.fabuArr[hasInd]
                let currCode = currObj.code;
                if(Array.isArray(currCode)){
                    let sind = currObj.setStyle.typeList.findIndex(item => {
                        return item.code == code;
                    })
                    currObj.setStyle.typeList.splice(sind,1);
                    let codeInd = currObj.code.indexOf(code);
                    currObj.code.splice(codeInd,1)
                }else{
                    that.formData.fabuArr.splice(hasInd,1)
                }
            }else{
                that.choseMod(that.currModule)
            }

        },

        // 新增按钮
        addBtn(ind){
            const that = this;
            let currObj = that.formData.fabuArr[ind];
            let addObj = {
                id:(new Date().valueOf()),
                typename:'',
                subname:'',
                title:'',
                icon:'', //图标，
                default:0, //表示非手动添加
                setStyle:{
                    fontWeight:0, //是否加粗
                    fontSize:14,
                    ...currObj.setStyle.style
                } 
            }
            let el = event.currentTarget;
            let ul = $(el).closest('.fb_ul')
            
            currObj.setStyle.typeList.push(addObj)
            that.$set(that.formData.fabuArr,ind,currObj)
            that.$nextTick(() => {
                that.currEditInd = ind;
                that.currEditLowerInd = currObj.setStyle.typeList.length - 1;
                that.editText = true;
                that.editLink = false;
                let li = ul.find('.fb_li').eq(that.currEditLowerInd)

                setTimeout(() => {
                    that.$nextTick(() => {
                        li.find('input.typename').focus()
                        
                    }) 
                }, 300);  
            })
        },

        // 重置组
        resetGroup(obj){
            const that = this;
            let code = obj.code;
            if(code){ //原有的
                let oTypeList = fabuDefault.find(item => {
                    return item.code == code || (Array.isArray(code) && Array.isArray(item.code))
                })
                if(oTypeList){
                    if(Array.isArray(code)){
                        that.$set(obj,'code',JSON.parse(JSON.stringify(oTypeList.code)))
                    }
                    that.$set(obj,'setStyle',JSON.parse(JSON.stringify(oTypeList.setStyle)))
                }
            }else{
                let tStyle = {
                    fontWeight:1, //是否加粗
                    fontSize:16,
                    color:'#737780',
                    bgColor:'#F7F8FA',
                }
                let allStyle = {
                    bgColor:'#F7F8FA',
                    color:'#525866',
                    subColor:'#9DA0A6', //副文本
                }
                let fontStyle = {
                    fontWeight:0, //是否加粗
                    fontSize:14,
                    bgColor:'#F7F8FA',
                    color:'#525866',
                    subColor:'#9DA0A6', //副文本
                }
                that.$set(obj.setStyle,'tStyle',tStyle)
                that.$set(obj.setStyle,'style',allStyle)
                for(let i = 0; i < obj.setStyle.typeList.length; i++){
                    that.$set(obj.setStyle.typeList,i,fontStyle)
                }
            }
        },

        //复制组
        copyGroup(obj){
            const that = this;
            let newObj = JSON.parse(JSON.stringify(obj))
            newObj['id'] = (new Date().valueOf())
            that.formData.fabuArr.push(newObj)
            that.$nextTick(() => { // 初始化排序
                that.initBtnSort(newObj['id'])
            })
        },

        // input框改变
        linkChange(e){
            const that = this;
            that.$set(that.formData.fabuArr,that.currEditInd,that.formData.fabuArr[that.currEditInd])
        },

        // 删除图标
        delIcon(item){
            const that = this;
            that.$set(item,'icon','');
            that.currEditIcon = false; 
            that.currHoverIcon = false; 
            that.currEditLowerInd = null;
            that.$set(that.formData.fabuArr,that.currEditInd,that.formData.fabuArr[that.currEditInd])
        },

        // 新增组
        addGroup(){
            const that = this;
            let newBtn = {
                id:(new Date().valueOf()),
                typename:'',
                subname:'',
                title:'',
                icon:'', //图标，
                default:0, //表示非手动添加
                setStyle:{
                    fontWeight:0, //是否加粗
                    fontSize:14,
                    bgColor:'#F7F8FA',
                    color:'#525866',
                    subColor:'#9DA0A6', //副文本
                } 
            }
            let newObj = {
                id:(new Date().valueOf()),
                code:'',
                setStyle:{
                    typeList:[newBtn],
                    name:'',
                    tStyle:{
                        fontWeight:1, //是否加粗
                        fontSize:16,
                        color:'#737780',
                        bgColor:'#F7F8FA',
                    },
                    marginStyle:2, //  1 => 密集  2 => 中等  3 => 疏松
                    style:{
                        bgColor:'#F7F8FA',
                        color:'#525866',
                        subColor:'#9DA0A6', //副文本
                    }
                },
            }
            that.formData.fabuArr.push(newObj)
            that.$nextTick(() => { // 初始化排序
                that.initBtnSort(newObj.id)
            })


        },

        // 修改类型
        changeMargin(margin,fblist){
            const that = this;
            // fblist.setStyle.marginStyle = margin
            that.$set(fblist.setStyle,'marginStyle',margin);
            let typeList = fblist.setStyle.typeList;
            let newTypeList = typeList;
            if(margin == 3){
                newTypeList = typeList.map((item) => {
                    item.setStyle['subColor'] = '#9DA0A6'
                    return{
                        subname:'',
                        ...item
                    }
                })
            }
        },

        initSort(){
            const that = this;
            // return false;
            var el1 = $('.fabuListBox')
            let sortable1 = Sortable.create(el1[0],{
                animate: 150,
                ghostClass:'placeholder',
                draggable:'.fabu_dl',
                // handle:'.fbList_title',
                filter:'.fb_li,.add_group,input',
                preventOnFilter: false, //  在触发过滤器`filter`的时候调用`event.preventDefault()
                onEnd: function(evt){
                    let nIndArr = this.toArray(); // 新的索引排序
                    let nFabuArr = []; // 存放新的发布按钮组
                    let fabuArr = JSON.parse(JSON.stringify(that.formData.fabuArr));
                    for(let i = 0; i < nIndArr.length; i++){
                        let ind = nIndArr[i]
                        nFabuArr.push(fabuArr[ind])
                    }
                    that.$nextTick(() => {
                        that.$set(that.formData,'fabuArr',JSON.parse(JSON.stringify(nFabuArr)))
                    })
                }
            })
        },

        // 初始化单个
        initBtnSort(id){
            const that = this;
            let el = $('.fabuListBox .sortUl[data-id="'+ id +'"]')
            that.$nextTick(() => {
                let sotrable = Sortable.create(el[0],{
                    animate: 150,
                    // forceFallback:true,
                    ghostClass:'placeholder',
                    draggable:'.sort_li',
                    dragoverBubble:true,
                    chosenClass: "sortable-chosen",  // 被选中项的css 类名
                    dragClass: "sortable-drag",  // 正在被拖拽中的css类名
                    // handle:'.fb_btn',
                    filter:'.add_btn,input',
                    preventOnFilter: false, //  在触发过滤器`filter`的时候调用`event.preventDefault()

                    // 开始拖拽的时候
                    onStart: function (/**Event*/evt) {
                        // console.log(evt.oldIndex);  // element index within parent
                    },
                    onEnd: function(evt){
                        let nIndArr = this.toArray(); // 新的索引排序
                        let ind = el.attr('data-ind')
                        let nFabuArr = []; // 存放新的发布按钮组
                        let fabuArr = JSON.parse(JSON.stringify(that.formData.fabuArr[ind].setStyle.typeList));
                        for(let i = 0; i < nIndArr.length; i++){
                            let ind = nIndArr[i]
                            nFabuArr.push(fabuArr[ind])
                        }
                        that.$nextTick(() => {
                            that.$set(that.formData.fabuArr[ind].setStyle,'typeList',JSON.parse(JSON.stringify(nFabuArr)))
                        })
                    }
                })
                that.$set(that.sortObj,id,sotrable)
            })

        },

        // 初始化所有
        initAllSortBtn(){
            const that = this;
            for(let i = 0; i < $('.fabuListBox .fabu_dl').length; i++){
                let ul =  $('.fabuListBox .fabu_dl').eq(i).find('.fb_ul');
                let li_len = ul.find('.fb_li:not(.add_btn)').length;
                if(li_len){
                    let id = ul.attr('data-id');
                    that.initBtnSort(id)
                }
            }
        },

        // 编辑文本
        toEditText(param){
            const that = this;
            // console.log(11)
            that.editCurrModule(param); //表明正在编辑
            that.$nextTick(() => {
                that.editText = true; // 编辑文本
                that.editLink = false; // 编辑文本
                console.log('改')
                that.$nextTick(() => {
                    let el = event.currentTarget;
                    let pover = $(el).closest('.pover');
                    if(pover.length){
                        that.$nextTick(() => {
                            let inp_par = pover.parent()
                            let inp = inp_par.find('input.editInp');
                            inp.eq(0).focus()
                        })
                    }else{
                        let type = $(event.target).attr('data-type')
                        if(!type){
                            if($(el).closest('.fbList_title')){
                                let par = $(el).closest('.fbList_title')
                                let inp = par.find('input.editInp');
                                    inp.eq(0).focus()
                            }else{
                                    let inp = par.find('input.editInp');
                                    inp.eq(0).focus()
                            }
                        }else{
                            let inp = $(el).find('input.' + type);
                            inp.eq(0).focus()
                        }

                    }
                });
            })
        },

        // 改变高度
        changeSetPopHeight(){
            const that = this;
            let height = $('.set_pop').height();
            that.setConH = height
            // console.log(height)
        },

        // 发布
        saveFabuCon(type){
            const that = this;
            let el = event.currentTarget;
            let str = type ? '&type=1' : ''
            var action = infoArr.customChildren == '' && infoArr.customConfig == '' ?'save':'edit';
            $(el).html(type ? '预览中...' : '保存中...')
            $(el).addClass('disabled')
            that.$set(that.formData,'default',that.platformDefault)
            let data_ = {
                customChildren: JSON.stringify(that.formData)
            }
            $.ajax({
                url: 'sitePcFabuPages.php?dopost=' + action + str,
                data: data_,
                type: "POST",
                dataType: "json",
                success: function (data) {
                    if (data.state == 100) {
                        optAction = false;
                        $(el).removeClass('disabled')
                        $(el).html(type ? '预览' : '保存')
                        if (str == '') {
                            $('.success_tip').addClass('show');
                            setTimeout(function () {
                                $('.success_tip').removeClass('show');
                            }, 3000)
                        }else{
                            window.open(memberDomain + '/publish.html?preview=1')
                            // 打开新页面
                        }
                    }
                },
                error: function () { }
            });
        },

        // 重置此项
        resetModule(code){
            const that = this;
            /**
             * 1.查找发布按钮是否存在
             * 2.存在就恢复成默认状态 ，不存在就添加
             * */ 
            console.log(11)
            let modDefault = fabuDefault.find(item => {
                return item.code == code || (Array.isArray(item.code) && item.code.indexOf(code) > -1);
            })

            if(modDefault){
                if(modDefault.code != code ){
                    modDefault = modDefault.setStyle.typeList.find(item => {
                        return item.code == code
                    })
                } 
            }

            let currFabuArr = that.formData.fabuArr;
            let hasInd =  currFabuArr.findIndex(item => {
                return item.code == code || (Array.isArray(item.code) && item.code.indexOf(code) > -1);
            })
            if(hasInd > -1){ // 已经存在  需要重置
                
                if(Array.isArray(currFabuArr[hasInd].code)){
                    let ind = currFabuArr[hasInd].setStyle.typeList.findIndex(item => {
                        return item.code == code
                    })
                    let code_ind = currFabuArr[hasInd].code.findIndex(item => {
                        return item == code
                    })
                    if(modDefault.showLevel){
                        currFabuArr[hasInd].code.splice(code_ind,1)
                        currFabuArr[hasInd].setStyle.typeList.splice(ind,1)
                    }else{
                        currFabuArr[hasInd].code.splice(code_ind,1,modDefault.code)
                        currFabuArr[hasInd].setStyle.typeList.splice(ind,1,modDefault)
                    }
                    
                }else{
                    currFabuArr.splice(hasInd,1,modDefault)
                }

                that.currModule = modDefault;
                that.choseMod(that.currModule)
            }else{ //不存在 需要添加
                that.choseMod(that.currModule)
            }
        },
        inputFocus(e){
            const that = this;
            if($(e.target).hasClass('typename')){
                that.focusInp = 'typename';
            }else if($(e.target).hasClass('subname')){
                that.focusInp = 'subname';
            }
        },
        inputChange(e){
            const that = this;
            that.inputData = e.data;
        },
        inputBlur(e){
            const that = this;
            that.inputData = '';
            that.focusInp = '';
        },

        // 切换平台默认
        changeDefault(type){
            const that = this;
            that.platformDefault = type;
            if(type){
                that.currChange = JSON.parse(JSON.stringify(that.formData))
                that.formData =JSON.parse(JSON.stringify(fabuDefaultObj))
            }else{
                if(!that.currChange){
                    that.currChange = JSON.parse(JSON.stringify(that.formData))
                }
                that.formData =JSON.parse(JSON.stringify(that.currChange))
            }

            $(".changeLayout").removeClass('fadeIn')
            let val = type ? 1 : 2
            $(".changeLayout[data-val='"+ val +"']").addClass('fadeIn')
            setTimeout(function(){
              $(".changeLayout[data-val='"+ val +"']").removeClass('fadeIn');
            },3000)
        },

        editPageTip(){
            const that = this;
            if(that.platformDefault){
                this.$message({
                    message: '如需修改请切换至自定义发布',
                    type: 'warning'
                  });
            }
        },

        // 修改二级分类
        changeLevelShow(ind){
            const that = this;
            let showLevel = ind == 0 ? 1 : 0; // 1 => 显示  0 => 隐藏
            const code = that.currModule.code;
            let currModInd = that.formData.fabuArr.findIndex(item => {
                return item.code == code || (Array.isArray(item.code) && item.code.indexOf(code) > -1)
            })
            that.currModule.showLevel = showLevel

            if(showLevel){ //需要显示
                let ind = that.formData.fabuArr[currModInd].setStyle.typeList.findIndex(item => {
                    return item.code == code;
                })
                let codeInd = that.formData.fabuArr[currModInd].code.indexOf(code)
                that.formData.fabuArr[currModInd].setStyle.typeList.splice(ind,1);
                that.formData.fabuArr[currModInd].code.splice(codeInd,1);
                that.choseMod(that.currModule)
            }else{ //需要隐藏
                let currMod_code = that.formData.fabuArr[currModInd]
                if(Array.isArray(currMod_code.code)){
                    let ind = currMod_code.setStyle.typeList.findIndex(item => {
                        return item.code == code
                    })
                    let code_ind = currMod_code.code.indexOf(code)
                    if(ind > -1){
                        currMod_code.setStyle.typeList.splice(ind,1)
                        currMod_code.code.splice(code_ind,1)
                        that.choseMod(that.currModule)
                    }
                }else{
                    that.formData.fabuArr.splice(currModInd,1)
                    that.choseMod(that.currModule)
                }
            }
        },

        // 链接
        showLink(item){
            const that = this;
            that.editLink = !that.editLink;
            that.editText = false
            let el = event.currentTarget
            
            setTimeout(() => {
                that.$nextTick(() => {
                    let className = 'linkSet_' + that.currEditInd + '_' + that.currEditLowerInd
                    let pop = $('.' + className)
                    if(that.editLink){
                        $(el).find('.linkSet input').focus()
                    }
                })
            }, 300);
        },

        linkInpFocus(){
            const that = this;
            that.editCurrModule('currEditLowerInd')
            that.editLink = true;
        },

        uploadBefore(){
            const that = this;
            that.uploadIng = true;
            that.currEditIcon = false
        },

        uploadImg(){
            const that = this;
            let el = event.currentTarget;
            console.log($(el).closest('.btn_icon').find('.icon-uploader').length)
            $(el).closest('.btn_icon').find('.icon-uploader .el-upload__input').click()
        },

        showTip(obj){
            if(obj.level_disabeld){
                this.$message({
                    message: '该模块发布必须选择分类',
                    type: 'error'
                  });
            }
        },

        linkHover(val,item){
            const that = this;
            let el = event.currentTarget
            that.linkOn = val
        },

        // changeUrlPath(url){
        //     const that = this;
        // },

        checkPopver(id){
            const that = this;
            let popOver = $(".el-color-picker__panel.colorPickerPop");
            let hasShow = false;
            if(popOver.length){
                for(let i = 0; i < popOver.length; i++){
                    let currPop = $(".el-color-picker__panel.colorPickerPop")[i];
                    let classStr = $(currPop).attr('class')
                    classStr = classStr.replace('colorPickerPop','')
                    let classArr = classStr.split(' ');

                    let currParam = classArr.find(item => {
                        return item.indexOf('el-') == -1;
                    })
                    if(!$(currPop).is(':hidden')){  //表示有当前正在显示的
                        that.$set(that.popOver,currParam,true)
                        that.$set(that.popOver,currParam.replace('Picker',''),true)
                        hasShow = true;
                        console.log(currParam,that.popOver[currParam])
                    }
                }
                
                if(!hasShow){
                    for(let item in that.popOver){
                        that.$set(that.popOver,item,false)
                    }
                }

            }
        }
    },

    watch:{
        editLink:function(val){
            console.log(1111 + '----' + val)
        }
    }
})