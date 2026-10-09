<?php
/**
 * 微信推文助手
 *
 * @version        $Id: wechatAssistant.php 2022-2-15 下午17:43:31 $
 * @package        HuoNiao.Wechat
 * @copyright      Copyright (c) 2013 - 2022, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("wechatAssistant");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/wechat";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "wechatAssistant.html";


//获取数据
if($action == 'getData'){

	//筛选条件
	$where = '';
	
	//参数
	foreach(${$module} as $_k => $_v){
		${$_k} = $_v;
	}

	//分类信息
	if($module == 'info'){

        require_once(HUONIAOINC."/config/info.inc.php");

        $infoSharePic = $customSharePic;
        if(!$infoSharePic){
            $infoSharePic = $cfg_sharePic;
        }
        $infoSharePic = getFilePath($infoSharePic);

		$time = time();

		//不需要过期的
		$where .= " AND l.`valid` >= $time";

		//指定分站
		$cityid = (int)$cityid;
		if ($cityid) {
			$where .= getWrongCityFilter('l.`cityid`', $cityid);
		}

        //遍历分类
		$typeid = (int)$typeid;
        if (!empty($typeid)) {
            $typeArr = $dsql->getTypeList($typeid, "infotype");
            if ($typeArr) {
                global $arr_data;
                $arr_data = array();
                $lower    = arr_foreach($typeArr);
                $lower    = $typeid . "," . join(',', $lower);
            } else {
                $lower = $typeid;
            }
            $where .= " AND l.`typeid` in ($lower)";
        }

		//几天内
		$date = (int)$date;
		if($date){
			$time = time() - ($date * 86400);
			$where .= " AND l.`pubdate` > $time";
		}

		//属性
		if(isset($attr)){
			//推荐
			if (in_array('rec', $attr)) {
				$where .= " AND l.`rec` = 1";
			}

			//火急
			if (in_array('fire', $attr)) {
				$where .= " AND l.`fire` = 1";
			}

			//置顶
			if (in_array('top', $attr)) {
			    $where .= " AND l.`isbid` = 1";
			}

			//有阅读红包
			if (in_array('read', $attr)) {
			    $where .= " AND l.`readInfo` = 1";
			}

			//有分享红包
			if (in_array('share', $attr)) {
			    $where .= " AND l.`shareInfo` = 1";
			}
		}

		//指定会员
        if (!empty($userid)) {
            $where .= " AND l.`userid` IN ($userid)";
        }

		//指定信息
        if (!empty($ids)) {
            $where .= " AND l.`id` IN ($ids)";
        }

		$orderby = (int)$orderby;
        $order = " ORDER BY l.`isbid` DESC, l.`top` DESC, l.`fire` DESC, l.`rec` DESC, l.`weight` DESC, l.`id` DESC";

        //发布时间
        if ($orderby == 1) {
			$order = " ORDER BY l.`pubdate` DESC, l.`isbid` DESC, l.`top` DESC, l.`fire` DESC, l.`rec` DESC, l.`weight` DESC, l.`id` DESC";
            
        //浏览量
        } elseif ($orderby == 2) {
            $order = " ORDER BY l.`click` DESC, l.`isbid` DESC, l.`top` DESC, l.`fire` DESC, l.`rec` DESC, l.`weight` DESC, l.`id` DESC";
        }

		$pageType = (int)$pageType;

		//前多少条
		$pageSize = (int)$pageSize;
		if($pageType == 1){
			$page = 1;

		//指定页码
		}elseif($pageType == 2){
			$page = (int)$page;
		}

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

		$archives = $dsql->SetQuery("SELECT l.`id`,l.`editdate`,l.`share`, l.`titleRed`, l.`titleBlod`, l.`title`, l.`is_valid`, l.`typeid`, l.`price`, l.`video`, l.`longitude`, l.`latitude`,".$select." l.`color`, l.`pubdate`, l.`body`, l.`addr`, l.`click`, l.`areaCode`, l.`tel`, l.`teladdr`, l.`rec`, l.`fire`, l.`top`, l.`userid`, l.`arcrank`, l.`valid`, l.`isbid`, l.`bid_end`, l.`bid_price`, l.`price_switch`,l.`hasSetjili`,l.`readInfo`,l.`shareInfo`,l.`hongbaoPrice`, l.`hongbaoCount`, l.`desc`, l.`status`, l.`rewardPrice`, l.`rewardCount`,l.`address`,l.`addrArr`,l.`listpic`,l.`label` FROM `#@__infolist` as l  LEFT JOIN `#@__infopic` c  ON   c.`aid` = l.`id`  WHERE 1 = 1" . $where." AND l.`del` = 0 AND l.`arcrank` = 1 GROUP BY l.`id`");

        //总条数
        $sql = $dsql->SetQuery("SELECT COUNT(l.`id`) total FROM `#@__infolist` l WHERE 1 = 1".$where." AND l.`del` = 0 AND l.`arcrank` = 1");
        $ret = $dsql->dsqlOper($sql, "results");
		$totalCount = $ret[0]['total'];

        //总分页数
        $totalPage = ceil($totalCount / $pageSize);

        if ($totalCount == 0) die(json_encode(array("state" => 200, "info" => "当前筛选条件没有数据，请换个条件再试！")));//暂无数据！

        $pageinfo = array(
            "page" => $page,
            "pageSize" => $pageSize,
            "totalPage" => $totalPage,
            "totalCount" => $totalCount
        );

		$atpage = $pageSize * ($page - 1);
		
		//前多少条
		if($pageType == 1){
			$pageSize = (int)$count;
		}

		$where  = " LIMIT $atpage, $pageSize";
		
        $results = $dsql->dsqlOper($archives . $where1 . $order . $where, "results");

        if ($results) {

            $param = array(
                "service" => "info",
                "template" => "detail",
                "id" => "%id%"
            );
            $urlParam = getUrlPath($param);

            $now = GetMkTime(time());

            $tmpData = array();
            global $cfg_secureAccess;
            global $cfg_basehost;

            foreach ($results as $key => $val) {
                $list[$key]['id'] = $val['id'];
                $list[$key]["titleNew"] = strip_tags($val['body']);
                $list[$key]["titleNew"] = str_replace(array("\r\n", "\r", "\n","&nbsp;", "&zwnj;"), "", $list[$key]["titleNew"]);

                $hisid = $val['id'];

                //特色标签
                $label = array();
                $typeid = explode(",",$val['label']);
                $typeid= join(",", $typeid);
                if ($typeid){
                    $te = $dsql->SetQuery("SELECT * FROM `#@__infoitemtype` WHERE `id` IN (" . $typeid . ")");
                    $teseid = $dsql->dsqlOper($te, "results");
                    if ($teseid) {
                        foreach ($teseid as $k => $vv) {
                            $label[$k]['id'] = $vv['id'];
                            $label[$k]['name'] = $vv['name'];
                            $label[$k]['weight'] = $vv['weight'];
                        }
                    }
                }

                $list[$key]["label"] = $label;
                $list[$key]['share'] = $val['share'];             //分享数量
                $list[$key]['readInfo'] = $val['readInfo'];
                $list[$key]['shareInfo'] = $val['shareInfo'];
                $list[$key]['hongbaoCount'] = $val['hongbaoCount'];
                $list[$key]['hongbaoPrice'] = $val['hongbaoPrice'];
                $list[$key]['rewardPrice'] = $val['rewardPrice'];
                $list[$key]['rewardCount'] = $val['rewardCount'];
                
                $item = $dsql->SetQuery("SELECT `value` FROM  `#@__infotypeitem` i LEFT JOIN `#@__infoitem` m  ON  m.`iid` = i.`id` WHERE  m.`aid` = $hisid");
                $resultitem = $dsql->dsqlOper($item, "results");
                $arritem = array();
                foreach ($resultitem as $ke => $value) {
                    $arr = join(",",explode(",",$value['value']));
                    array_push($arritem,$arr);
                }

                $arritem = join(",",$arritem);
                $list[$key]['feature2']   = $arritem;
                $list[$key]['feature3']   = explode(",",$list[$key]['feature2']);

                global $data;
                $data = "";
                if(isset($tmpData['addrArr'][$val['addr']])){
                    $addrArr = $tmpData['addrArr'][$val['addr']];
                }else{
                    $addrArr = getParentArr("site_area", $val['addr']);
                    $tmpData['addrArr'][$val['addr']] = $addrArr;
                }
                $addrArr = array_reverse(parent_foreach($addrArr, "typename"));

                //数据库中的区域信息
                $_addrArr = str_replace('  ', ' ', $val['addrArr']);  //将两个空格换成一个空格

                $addrArr = $addrArr ? $addrArr : explode(' ', $_addrArr);
                $list[$key]['addrArr'] = join(" ", $addrArr);
                $list[$key]['address'] = $addrArr;
                $list[$key]['dizhi'] = $val['address'];
                $list[$key]['typeid'] = $val['typeid'];


                $typename = "";
                if(isset($tmpData['typename'][$val['typeid']])){
                    $typename = $tmpData['typename'][$val['typeid']];
                }else{
                    $archives = $dsql->SetQuery("SELECT `typename` FROM `#@__infotype` WHERE `id` = " . $val['typeid']);
                    $typename = getCache("info_type", $archives, 0, array("sign" => $val['typeid'], "name" => "typename"));
                    $tmpData['typename'][$val['typeid']] = $typename ? $typename : "";
                }
                $list[$key]['typename'] = $typename;

                $list[$key]['click'] = $val['click'];

                $list[$key]['pubdate']  = $val['pubdate'];
                $list[$key]['pubdate1'] = FloorTime(GetMkTime(time()) - $val['pubdate'], 3);

                $list[$key]['fire'] = $val['fire'];
                $list[$key]['rec']  = $val['rec'];
                $list[$key]['top']  = $val['top'];

                //图集信息
                $picArr = [];
                $archives = $dsql->SetQuery("SELECT `picPath` FROM `#@__infopic` WHERE `aid` = " . $val['id'] . " ORDER BY `id` ASC LIMIT 0, 6");
                $results  = $dsql->dsqlOper($archives, "results");
                if (!empty($results)) {
                    if (!empty($val['listpic'])){
                        $list[$key]['litpic'] = getFilePath($val['listpic']);
                    }else{
                        $list[$key]['litpic'] = getFilePath($results[0]["picPath"]);
                    }

                    foreach($results as $k=> $v){
                        $picArr[$k]['litpic'] = $v['picPath'] ? getFilePath($v['picPath']) : '';
                    }
                }
                $list[$key]["picArr"] = $picArr;

                $archives    = $dsql->SetQuery("SELECT `id` FROM `#@__member_collect` WHERE `module` = 'info' AND `action` = 'detail' AND `aid` = " . $val['id']);
                $collectnum  = $dsql->dsqlOper($archives, "totalCount");
                $list[$key]['collectnum'] = $collectnum;

                $list[$key]['isbid']   = $val['isbid'];
                $list[$key]['valid']   = $val['valid'];
                $list[$key]['url']     = str_replace("%id%", $val['id'], $urlParam);

                $archives = $dsql->SetQuery("SELECT COUNT(`id`) total FROM `#@__infopic` WHERE `aid` = " . $val['id']);
                $res      = $dsql->dsqlOper($archives, "results");
                $list[$key]['pcount'] = $res[0]['total'];

                $list[$key]['desc'] = cn_substrR(strip_tags($val['body']), 100);

                $archives = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__public_comment_all` WHERE `ischeck` = 1 AND `type` = 'info-detail' AND `aid` = " . $val['id'] . " AND `pid` = 0");
                $res                  = $dsql->dsqlOper($archives, "results");
                $list[$key]['common'] = $res[0]['total'];

                //会员信息
                $member = array(
                    'userid' => 0,
                    'nickname' => '',
                    'photo' => '',
                    'userType' => 0,
                    'emailCheck' => 0,
                    'phoneCheck' => 0,
                    'certifyState' => 0,
                    'phone' => '',
                );
                if($val['userid']){
                    $member = getMemberDetail($val['userid']);
                }

                $member = $member['userid'] ? array(
                    "id" => $member['userid'],
                    "nickname" => $member['nickname'],
                    "photo" => $member['photo'] ? $member['photo'] : $cfg_secureAccess.$cfg_basehost.'/static/images/noPhoto_100.jpg',
                    "userType" => $member['userType'],
                    "emailCheck" => $member['emailCheck'],
                    "phoneCheck" => $member['phoneCheck'],
                    "certifyState" => $member['certifyState'],
                    "phone" => $val['tel']
                ) : NULL;
                $list[$key]['member'] = $member ? $member : NULL;
				
				//描述信息
				$_info = array();
				if($member){
					array_push($_info, '联系人：' . $member['nickname']);
				}
				$tel = (int)$val['tel'];
				array_push($_info, (is_numeric($tel) ? (substr($tel, 0, 2) . '****' . substr($tel, -2)) : '****'));

				//代表图
				$litpic = '';
				if($picArr){
					$litpic = $picArr[0]['litpic'];
				}

                //没有图的用默认图
                if(!$litpic){
                    $litpic = $infoSharePic;
                }

				$list[$key]['qr'] = array(
					'h5' => $cfg_secureAccess . $cfg_basehost . '/include/qrcode.php?data=' . urlencode($list[$key]['url']),
					'wechat' => $cfg_secureAccess . $cfg_basehost . '/include/ajax.php?service=siteConfig&action=getWeixinQrPost&module=info&type=detail&from=assistant&aid='.$hisid.'&title='.$list[$key]['desc'].'&info='.join('，', $_info).'&imgUrl='.$litpic.'&redirect=' . urlencode($list[$key]['url']),
					'wxmini' => $cfg_secureAccess . $cfg_basehost . '/include/ajax.php?service=siteConfig&action=createWxMiniProgramScene&from=assistant&url='.urlencode($list[$key]['url']).'&wxpage=' . urlencode('/pages/packages/info/detail/detail?id=' . $hisid)
				);

            }

        }

        $data = array("pageInfo" => $pageinfo, "list" => $list);
		echo json_encode($data);
		

	}elseif($module == "shop"){  // 商城

        //指定分站
        $cityid = (int)$cityid;
        $where = '';
        if ($cityid) {

            $userSql = $dsql->SetQuery("SELECT `id` FROM `#@__shop_store` WHERE 1 = 1" . getWrongCityFilter('`cityid`', $cityid));
            $results = $dsql->dsqlOper($userSql, "results");
            if ($results){
                $sidArr = array();
                foreach ($results as $key => $value) {
                    $sidArr[$key] = $value['id'];
                }
                $where .= " AND (p.`store` in (".join(",",$sidArr).") )";
            }
        }

        //遍历分类
        $typeid = (int)$typeid;
        //遍历分类
        if (!empty($typeid)) {
            if ($dsql->getTypeList($typeid, "shop_type")) {
                global $arr_data;
                $arr_data = array();
                $lower    = arr_foreach($dsql->getTypeList($typeid, "shop_type"));
                $lower    = $typeid . "," . join(',', $lower);
            } else {
                $lower = $typeid;
            }
            $where .= " AND p.`type` in ($lower)";
        }

        //几天内
        $date = (int)$date;
        if($date){
            $time = time() - ($date * 86400);
            $where .= " AND p.`pubdate` > $time";
        }

        //本地团购//电商
        $shopstate = (int)$shopstate;
        if ($shopstate == 1){    //团购
            $where .= " AND p.`promotype` = $shopstate";

        }
        if ($shopstate == 2){    //电商
            $where .= " AND p.`promotype` = $shopstate";

        }

        //指定信息
        if (!empty($ids)) {
            $where .= " AND p.`id` IN ($ids)";
        }

        //指定会员
        if (!empty($userid)) {
//            $where .= " AND p.`store` IN ($storeid)";
            $userSql = $dsql->SetQuery("SELECT `id` FROM `#@__shop_store` WHERE `userid` = '$userid'");
            $results = $dsql->dsqlOper($userSql, "results");
            if ($results) {
                $sidArr = array();
                foreach ($results as $key => $value) {
                    $sidArr[$key] = $value['id'];
                }
                $where .= " AND (p.`store` in (".join(",",$sidArr).") )";
            }
        }


        $orderby = (int)$orderby;
        $order = " ORDER BY p.`sort` DESC, p.`id` DESC ";

        //发布时间
        if ($orderby == 1) {
            $order = " ORDER BY p.`pubdate` DESC ";

            //浏览量
        } elseif ($orderby == 2) {
            $order = " ORDER BY p.`click` DESC,p.`id` DESC ";
            //销量
        }elseif($orderby == 3){
            $order = " ORDER BY p.`sales` DESC, p.`sort` DESC, p.`id` DESC ";
        }

        $pageType = (int)$pageType;

        //前多少条
        $pageSize = (int)$pageSize;
        if($pageType == 1){
            $page = 1;

            //指定页码
        }elseif($pageType == 2){
            $page = (int)$page;
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;


        $archives = $dsql->SetQuery("SELECT p.`id`, p.`type`,p.`smallCount`,p.`packingCount`,p.`kstime`,p.`ketime`,p.`title`,p.`subtitle`, p.`store`, p.`mprice`, p.`price`, p.`sales`, p.`click`, p.`inventory`, p.`litpic`, p.`flag`, p.`btime`, p.`etime`, p.`state`, p.`pubdate`, p.`upshelftime`,  p.`specification`,p.`logistic`,p.`spePics`,p.`promotype`,p.`editdate`,p.`speFiled`,p.`speCustom` ,p.`floorprice`,p.`shangjia`,p.`fx_reward`,p.`typesales`,p.`availableweek`,p.`availabletime`,p.`pics` FROM `#@__shop_product` p WHERE 1 = 1 AND `state` = 1" . $where);

        //总条数
        $sql = $dsql->SetQuery("SELECT COUNT(p.`id`) total FROM `#@__shop_product` p WHERE 1 = 1".$where." AND `state` = 1");

        $ret = $dsql->dsqlOper($sql, "results");
        $totalCount = $ret[0]['total'];

        //总分页数
        $totalPage = ceil($totalCount / $pageSize);

        if ($totalCount == 0) die(json_encode(array("state" => 200, "info" => "当前筛选条件没有数据，请换个条件再试！")));//暂无数据！

        $pageinfo = array(
            "page" => $page,
            "pageSize" => $pageSize,
            "totalPage" => $totalPage,
            "totalCount" => $totalCount
        );

        $atpage = $pageSize * ($page - 1);

        //前多少条
        if($pageType == 1){
            $pageSize = (int)$count;
        }

        $where  = "LIMIT $atpage, $pageSize";
        $results = $dsql->dsqlOper($archives . $order . $where, "results");

        if ($results) {

            $param    = array(
                "service"  => "shop",
                "template" => "detail",
                "id"       => "%id%"
            );
            $urlParam = getUrlPath($param);

            $now = GetMkTime(time());

            $tmpData = array();
            global $cfg_secureAccess;
            global $cfg_basehost;

            foreach ($results as $key=>$val){
                $list[$key]['id']           = $val['id'];
                $list[$key]['title']        = $val['title'];
                $list[$key]['store']        = $val['store'];
                $list[$key]['price']        = $val['price'];
                $list[$key]['sales']        = $val['sales'];
                $list[$key]['mprice']       = $val['mprice'];
                $list[$key]['litpic']       = getFilePath($val['litpic']);
                $list[$key]['subtitle']     = $val['subtitle'];
                $list[$key]['shangjia']     = $val['shangjia'];
                $list[$key]['logistic']     = $val['logistic'];
                $list[$key]['inventory']    = $val['inventory'];
                $list[$key]['floorprice']   = $val['floorprice'];
                $list[$key]['smallCount']   = $val['smallCount'];
                $list[$key]['packingCount'] = $val['packingCount'];
                $list[$key]['editdate']     = $val['editdate'] ? $val['editdate'] : $val['pubdate'];
                $list[$key]['promotype']    = $val['promotype'];
//                $list[$key]['shopunit']     = $val['shopunit'];
                $list[$key]['typesales']    = $val['typesales'];
                //图集
                $pics    = $val['pics'];
                $picsArr = array();
                if (!empty($pics)) {
                    $pics = explode(',', $pics);
                    foreach ($pics as $k => $v) {
                        array_push($picsArr, getFilePath($v));
                    }
                }
                $list[$key]['imgGroup'] = $picsArr;
                //商家信息
                $sql = $dsql->SetQuery("SELECT `id`, `title`, `domaintype`, `addrid`,`lng`,`lat`,`userid`,`address`,`tel`,`logo` FROM `#@__shop_store` WHERE `id` = " . $val['store']);
                $res = $dsql->dsqlOper($sql, "results");
                if (!empty($res)) {
                    $list[$key]["storeTitle"] = $res[0]['title'];
                    $tel = $res[0]['tel'];
                    $param                    = array(
                        "service"  => "shop",
                        "template" => "store-detail",
                        "id"       => "%id%"
                    );
                    $storeurlParam            = getUrlPath($param);
                    $url                      = "";
                    $userid = $res[0]['userid'];
                    if ($res[0]['domaintype'] == 1) {
                        $domainInfo = getDomain('shop', 'shop_store', $res[0]['id']);
                        $url        = "http://" . $domainInfo['domain'];
                    } else {
                        $url = str_replace("%id%", $res[0]['id'], $storeurlParam);
                    }
                    $list[$key]['storeurl'] = $url;
                    global $data;
                    $data                  = "";
                    $addrName              = getParentArr("site_area", $res[0]['addrid']);
                    $addrName              = array_reverse(parent_foreach($addrName, "typename"));
                    $list[$key]['alladdr'] = $addrName;
                    $list[$key]['storeLogo'] = getFilePath($res[0]['logo']);
                    $list[$key]['userid'] = $userid;
                    $list[$key]['address'] = $res[0]['address'];
                    $list[$key]['addr']    = $addrName[0] . $addrName[1];
                }
                /*查看可用哪些券*/
                $nowtime = GetMkTime(time());
                $shopquansql = $dsql->SetQuery("SELECT `promotiotype`,`promotio` FROM `#@__shop_quan` WHERE  FIND_IN_SET('" . $val['id'] . "',`fid`) AND `sent` >0 AND `state` = 0 AND `ktime`<= '$nowtime' AND `etime`>= '$nowtime' ");
                $shopquanres = $dsql->dsqlOper($shopquansql, "results");

                $quanhave = $lijian = 0;
                if ($shopquanres && is_array($shopquanres)) {
                    $quanhave = 1;
                    $lijian   = $shopquanres[0]['promotiotype'] == 0 ? ($shopquanres[0]['promotio']) : ($val['mprice'] * $shopquanres[0]['promotio'] / 10);
                }
                $list[$key]["quanhave"] = $quanhave;
                $list[$key]["lijian"]   = $lijian;
                $list[$key]["quanlist"]   = $shopquanres;


                //评论数量
                $sql    = $dsql->SetQuery("SELECT c.`id` FROM `#@__public_comment_all` c LEFT JOIN `#@__shop_order` o ON o.`id` = c.`oid` WHERE o.`orderstate` = 3 AND c.`ischeck` = 1 AND c.`type` = 'shop-order' AND o.`store` = '" . $val['store'] . "' AND c.`pid` = 0");
                $rcount = $dsql->dsqlOper($sql, "totalCount");
                //好评率
                $sql     = $dsql->SetQuery("SELECT count(c.`id`) hpcount ,avg(c.`sco1`) s1, avg(c.`sco2`) s2, avg(c.`sco3`) s3 FROM `#@__public_comment_all` c LEFT JOIN `#@__shop_order` o ON o.`id` = c.`oid` WHERE o.`orderstate` = 3 AND c.`ischeck` = 1 AND c.`rating` = 1 AND c.`type` = 'shop-order' AND o.`store` = '" . $val['store'] . "' AND c.`pid` = 0");
                $res    = $dsql->dsqlOper($sql, "results");

                $score1  = $res[0]['s1'];  //分项1
                $score2  = $res[0]['s2'];  //分项2
                $score3  = $res[0]['s3'];  //分项3
                $hpcount = $res[0]['hpcount'];

                $list[0]['score1']      = number_format($score1, 1); /*描述相符*/
                $list[0]['score2']      = number_format($score2, 1); /*物流服务*/
                $list[0]['score3']      = number_format($score3, 1); /*服务态度*/

                $rating               = $hpcount > 0 ? ($hpcount / $rcount * 100) : 0;
                $list[0]['rating'] = ($rating > 0 ? sprintf("%.2f", $rating) : 0) . "%";
                $list[$key]['collectnum']        = $val['click'];

                $list[$key]['url']     = str_replace("%id%", $val['id'], $urlParam);
                $hisid = $val['id'];

                if($userid){
                    $member = getMemberDetail($userid);
                }

                $member = $member['userid'] ? array(
                    "id" => $member['userid'],
                    "nickname" => $member['nickname'],
                    "photo" => $member['photo'] ? $member['photo'] : $cfg_secureAccess.$cfg_basehost.'/static/images/noPhoto_100.jpg',
                    "userType" => $member['userType'],
                    "emailCheck" => $member['emailCheck'],
                    "phoneCheck" => $member['phoneCheck'],
                    "certifyState" => $member['certifyState'],
                    "phone" => $tel
                ) : NULL;
                $list[$key]['member'] = $member ? $member : NULL;

                //描述信息
                $_info = array();
                if($member){
                    array_push($_info, '联系人：' . $member['nickname']);
                }
                $tel = (int)$tel;
                array_push($_info, (is_numeric($tel) ? (substr($tel, 0, 2) . '****' . substr($tel, -2)) : '****'));


                //代表图
                $litpic = '';
                if($picsArr){
                    $litpic = $picsArr[0];
                }
                $list[$key]['qr'] = array(
                    'h5' => $cfg_secureAccess . $cfg_basehost . '/include/qrcode.php?data=' . urlencode($list[$key]['url']),
                    'wechat' => $cfg_secureAccess . $cfg_basehost . '/include/ajax.php?service=siteConfig&action=getWeixinQrPost&module=shop&type=detail&from=assistant&aid='.$hisid.'&title='.$list[$key]['title'].'&info='.join('，', $_info).'&imgUrl='.$litpic.'&redirect=' . urlencode($list[$key]['url']),
                    'wxmini' => $cfg_secureAccess . $cfg_basehost . '/include/ajax.php?service=siteConfig&action=createWxMiniProgramScene&from=assistant&url='. urlencode('/pages/packages/shop/detail/detail?id=' . $hisid)
                );
            }
        }
        $data = array("pageInfo" => $pageinfo, "list" => $list);
        echo json_encode($data);

    }else{ //招聘
        //指定分站
        $cityid = (int)$cityid;
        $where = " AND p.`state`=1 AND p.`del`=0 AND p.`off`=0 AND c.`state`=1";
        if ($cityid) {
            $where .= getWrongCityFilter('c.`cityid`', $cityid);
        }

        //遍历分类
        $typeid = (int)$typeid;
        //遍历分类
        if (!empty($typeid)) {
            if ($dsql->getTypeList($typeid, "job_type")) {
                global $arr_data;
                $arr_data = array();
                $lower    = arr_foreach($dsql->getTypeList($typeid, "job_type"));
                $lower    = $typeid . "," . join(',', $lower);
            } else {
                $lower = $typeid;
            }
            $where .= " AND p.`type` in ($lower)";
        }

        //几天内
        $date = (int)$date;
        if($date){
            $time = time() - ($date * 86400);
            $where .= " AND p.`pubdate` > $time";
        }

        //信息属性
        if(!empty($jobflagstate)){
            //置顶中
            if(in_array("1",$jobflagstate)){
                $where .= " and p.`is_topping`=1";
            }
            //刷新中
            if(in_array("2",$jobflagstate)){
                $where .= " and p.`is_refreshing`=1";
            }
        }

        //指定信息
        if (!empty($ids)) {
            $where .= " AND p.`id` IN ($ids)";
        }

        //指定会员
        if (!empty($companyid)) {
            $where .= " and c.`id` in($companyid)";
        }

        $orderby = (int)$orderby;
        $order = " ORDER BY p.`id` DESC ";

        //发布时间
        if ($orderby == 1) {
            $order = " ORDER BY p.`pubdate` DESC ";

            //浏览量
        } elseif ($orderby == 2) {
            $order = " ORDER BY p.`click` DESC,p.`id` DESC ";
        }

        $pageType = (int)$pageType;

        //前多少条
        $pageSize = (int)$pageSize;
        if($pageType == 1){
            $page = 1;

            //指定页码
        }elseif($pageType == 2){
            $page = (int)$page;
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;


        $archives = $dsql->SetQuery("select p.*,c.`title` 'ctitle',c.`welfare`,c.`logo`,c.`title` company from `#@__job_post` p left join `#@__job_company` c on p.`company`=c.`id` where 1=1" . $where);

        $totalCount = $dsql->getOne($dsql::SetQuery("select count(*) from `#@__job_post` p left join `#@__job_company` c on p.`company`=c.`id` where 1=1".$where));

        //总分页数
        $totalPage = ceil($totalCount / $pageSize);

        if ($totalCount == 0) die(json_encode(array("state" => 200, "info" => "当前筛选条件没有数据，请换个条件再试！")));//暂无数据！

        $pageinfo = array(
            "page" => $page,
            "pageSize" => $pageSize,
            "totalPage" => $totalPage,
            "totalCount" => $totalCount
        );

        $atpage = $pageSize * ($page - 1);

        //前多少条
        if($pageType == 1){
            $pageSize = (int)$count;
        }

        $where  = "LIMIT $atpage, $pageSize";
        $results = $dsql->dsqlOper($archives . $order . $where, "results");

        if ($results) {
            include_once HUONIAOROOT."/api/handlers/job.class.php";
            $job = new job();
            $param    = array(
                "service"  => "shop",
                "template" => "detail",
                "id"       => "%id%"
            );
            $urlParam = getUrlPath($param);

            $now = GetMkTime(time());

            $tmpData = array();
            global $cfg_secureAccess;
            global $cfg_basehost;

            foreach ($results as $key=>$val){
                $list[$key]['id']           = $val['id'];
                $list[$key]['title']        = $val['title'];
                $list[$key]['ctitle']        = $val['ctitle'];
                $urlParam = array(
                    "service"=>"job",
                    "template"=>"job",
                    "id"=>$val['id']
                );
                $list[$key]['postUrl'] = getUrlPath($urlParam);
                $list[$key]['addressDetail'] = $job->op_address(array("method"=>"query","id"=>$val["job_addr"]))[0];  //职位的地址
                $list[$key]['number']           = $val['number'];
                $list[$key]['claim']           = $val['claim'];
                $list[$key]['note']           = $val['note'];
                $urlParam = array(
                    "service"=>"job",
                    "template"=>"company",
                    "id"=>$val['company']
                );
                $list[$key]['companyUrl'] = getUrlPath($urlParam);
                $list[$key]['min_salary']           = $val['min_salary'];
                $list[$key]['max_salary']           = $val['max_salary'];


                $show_salary = "";
                $min_salary = $val['min_salary'];
                $max_salary = $val['max_salary'];
                if($val['salary_type']==1){
                    //两者大于千，且百位均为0
                    if($min_salary>=1000 && $max_salary>=1000 && $min_salary/100%10===0 && $max_salary/100%10===0){
                        //如果最小最大不超万，显示千
                        if($min_salary<10000 && $max_salary<10000){
                            if(floor($min_salary/1000)==floor($max_salary/1000)){
                                $show_salary = floor($min_salary/1000)."千";
                            }else{
                                $show_salary = floor($min_salary/1000)."千-".floor($max_salary/1000)."千";
                            }
                        }
                        //最小为千，最大为万，显示千-万
                        elseif($min_salary<10000 && $max_salary>=10000){
                            $smax_salary = sprintf("%.1f",$max_salary/1000);
                            if($smax_salary%10==0){
                                $smax_salary = (int)($smax_salary/10);
                            }else{
                                $smax_salary = $smax_salary/10;
                            }
                            $show_salary = floor($min_salary/1000)."千-".$smax_salary."万";
                        }
                        //两者均过万，显示万-万
                        else{
                            $smin_salary = sprintf("%.2f",$min_salary/1000);
                            $smax_salary = sprintf("%.2f",$max_salary/1000);
                            if($smin_salary%10==0){
                                $smin_salary = (int)($smin_salary/10);
                            }else{
                                $smin_salary = $smin_salary/10;
                            }
                            if($smax_salary%10==0){
                                $smax_salary = (int)($smax_salary/10);
                            }else{
                                $smax_salary = $smax_salary/10;
                            }
                            if($smin_salary==$smax_salary){
                                $show_salary = $smin_salary."万";
                            }else{
                                $show_salary = $smin_salary."-".$smax_salary."万";
                            }
                        }
                    }
                    //百位有数字，直接显示
                    else{
                        $show_salary = $min_salary."-".$max_salary;
                    }
                }else{
                    $show_salary = $min_salary."-".$max_salary."/小时";
                }

                //面议
                if($val['mianyi']){
                    $show_salary = '面议';
                }
                $list[$key]['show_salary'] = $show_salary;
                
                $list[$key]['dy_salary']           = $val['dy_salary'];
                $list[$key]['salary_type']           = $val['salary_type'];
                $list[$key]['educational']           = $val['educational'];
                $list[$key]['educational_name']           = $dsql->getOne($dsql::SetQuery("select `typename` from `#@__jobitem` where `id`=".$val['educational']));
                $list[$key]['experience']           = $val['experience'];
                $testExperience         = $dsql->getOne($dsql::SetQuery("select `typename` from `#@__jobitem` where `id`=".$val['experience']));
                $testExperience = $job->testExperience($testExperience);
                $testExperience = $testExperience['text'];
                $list[$key]['experience_name'] = $testExperience;
                $welfare = $val['welfare'];
                if($welfare){
                    $sql = $dsql->SetQuery("SELECT `typename` 'name' FROM `#@__jobitem` WHERE `id` in ({$val['welfare']})");
                    $welfare = $dsql->getArr($sql);
                }else{
                    $welfare = array();
                }
                $list[$key]['welfare'] = $welfare;

                $title = $list[$key]['title'] . ' ' . $show_salary;

                $list[$key]['qr'] = array(
                    'h5' => $cfg_secureAccess . $cfg_basehost . '/include/qrcode.php?data=' . urlencode($list[$key]['postUrl']),
                    'wechat' => $cfg_secureAccess . $cfg_basehost . '/include/ajax.php?service=siteConfig&action=getWeixinQrPost&module=shop&type=detail&from=assistant&aid='.$val['id'].'&title='.$title.'&info='.$val['company'].'&imgUrl='.getFilePath($val['logo']).'&redirect=' . urlencode($list[$key]['postUrl']),
                    'wxmini' => $cfg_secureAccess . $cfg_basehost . '/include/ajax.php?service=siteConfig&action=createWxMiniProgramScene&from=assistant&url=' . urlencode('/pages/packages/job/job/job?id=' . $val['id'])
                );
            }
        }
        $data = array("pageInfo" => $pageinfo, "list" => $list);
        echo json_encode($data);
    }
	die;

}


//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/clipboard.min.js',
		'admin/wechat/wechatAssistant.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	//所有分站城市
    $huoniaoTag->assign('cityList', json_encode($adminCityArr));

	//分类信息分类
	$huoniaoTag->assign('infoTypeListArr', json_encode($dsql->getTypeList(0, "infotype")));
	//商城分类
	$huoniaoTag->assign('shopTypeListArr', json_encode($dsql->getTypeList(0, "shop_type")));
	//招聘职业分类
	$huoniaoTag->assign('jobTypeListArr', json_encode($dsql->getTypeList(0, "job_type")));

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/siteConfig";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
