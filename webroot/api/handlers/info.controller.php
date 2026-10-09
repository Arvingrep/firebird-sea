<?php

/**
 * huoniaoTag模板标签函数插件-信息模块
 *
 * @param $params array 参数集
 * @return array
 */
function info($params, $content = "", &$smarty = array(), &$repeat = array())
{
    extract($params);
    $service = "info";
    if (empty($action)) return '';
    global $huoniaoTag;
    global $cfg_secureAccess;
    global $cfg_basehost;
    global $dsql;
	global $userLogin;
	global $cfg_returnPoint_info;
	global $siteCityInfo;


    //首页数据统计
    if($action == 'index'){
        //数据共享
        require(HUONIAOINC."/config/info.inc.php");
        $dataShare = (int)$customDataShare;
        
        $cityWhere = '';
        if(!$dataShare){
            $cityid  = $siteCityInfo['cityid'];
            $cityWhere = " AND `cityid` = " . $cityid;
        }

        //总浏览量
        $hisarchive = $dsql->SetQuery("SELECT sum(`click`)id FROM `#@__infolist` WHERE `del` = 0" . $cityWhere);
        $resulthis = $dsql->dsqlOper($hisarchive, "results");
        $histroyCount = $resulthis[0]['id'];                //总浏览量
        //信息总量
        $infoarchive = $dsql->SetQuery("SELECT count(`id`)id FROM `#@__infolist` WHERE `waitpay` = 0 AND `del` = 0" . $cityWhere);
        $resultinfo = $dsql->dsqlOper($infoarchive, "results");
        $infoCount = $resultinfo[0]['id'];                //信息总量
        //入驻商家
        $infostore = $dsql->SetQuery("SELECT count(`id`)id FROM `#@__business_list`  WHERE 1 = 1  AND `state` !=3 AND `state` !=4" . $cityWhere);
        $resultstore = $dsql->dsqlOper($infostore, "results");
        
        $storeCount = $resultstore[0]['id'];                //入驻商家
        $huoniaoTag->assign('histroyCount', $histroyCount);
        $huoniaoTag->assign('infoCount', $infoCount);
        $huoniaoTag->assign('storeCount', $storeCount);

    }

    //获取指定分类详细信息
    if ($action == "list" || $action == "category") {
        include(HUONIAOROOT . "/include/config/info.inc.php");
        $userid = $userLogin->getMemberID();
        $userinfo = $userLogin->getMemberInfo($userid);

        $memberLevelAuth = getMemberLevelAuth($userinfo['level']);
        if ($userinfo['userType'] == 2){
            if ($memberLevelAuth['info'] > (int)$cfg_qymember){
                $infoCount = $memberLevelAuth['info'];
            }else{
                $infoCount = (int)$cfg_qymember;
            }
        }else{
            $infoCount       = (int)$memberLevelAuth['info'];
        }
        //本周
        $today = GetMkTime(date('Y-m-d',(time()-((date('w',time())==0?7:date('w',time()))-1)*24*3600)));
        $tomorrow = $today + 604800;

//        $sql      = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__infolist` WHERE `userid` = $userid AND `pubdate` >= $today AND `pubdate` < $tomorrow AND `alonepay` = 0 AND `waitpay` = 0");
        $sql      = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__infolist` WHERE `userid` = $userid AND `pubdate` >= $today AND `pubdate` < $tomorrow");
        $ret      = $dsql->dsqlOper($sql, "results");
        $alreadyFabu = $ret[0]['total'];
        $infoCount -= $alreadyFabu;
        if ($cfg_isvalid == '1'){               //是否设置永久有效期
            $valid = unserialize($cfg_valid);                    //永久有效期
        }else{
            $valid = '';
        }
        $info = unserialize($cfg_info_Smart);                //有效期
        $info_smart ='a:2:{i:0;a:5:{s:5:"times";i:0;s:3:"day";i:3;s:7:"daytime";i:259200;s:7:"dayText";s:3:"天";s:5:"price";d:5;}i:1;a:5:{s:5:"times";i:0;s:3:"day";i:7;s:7:"daytime";i:604800;s:7:"dayText";s:3:"天";s:5:"price";d:10;}}';  //默认 有效期

        //普通会员默认有效时长
        $cfg_defaultvalid = unserialize($cfg_defaultvalid);
        $cfgdefaultvalid = 'a:1:{i:0;a:2:{s:3:"day";i:1;s:7:"daytime";i:86400;}}';   //默认
        $huoniaoTag->assign('cfg_defaultvalid', $cfg_defaultvalid ? $cfg_defaultvalid : unserialize($cfgdefaultvalid));
        //vip会员默认有效时长
        $cfg_membervalid = unserialize($cfg_membervalid);
        $cfgmembervalid = 'a:1:{i:0;a:2:{s:3:"day";i:7;s:7:"daytime";i:604800;}}';

        $huoniaoTag->assign('cfg_membervalid', $cfg_membervalid ? $cfg_membervalid : unserialize($cfgmembervalid));
        //企业会员每周发布条数
        $huoniaoTag->assign('cfg_qymember', (int)$cfg_qymember ? (int)$cfg_qymember : 0);
        //企业会员默认有效时长
        $cfg_qymembervalid = unserialize($cfg_qymembervalid);
        $cfgqymembervalid = 'a:1:{i:0;a:2:{s:3:"day";i:1;s:7:"daytime";i:86400;}}';
        $huoniaoTag->assign('cfg_qymembervalid', $cfg_qymembervalid ? $cfg_qymembervalid : unserialize($cfgqymembervalid));
        //信息
        global  $cfg_fabuAmount;
        $fabuAmount = $cfg_fabuAmount ? unserialize($cfg_fabuAmount) : array();
        $amount = $fabuAmount["info"];          //发布的钱
        $label = array();

        
        //免费时长
        $freeValidDay = 0;

        //企业会员
        if ($userinfo['userType'] == 2){
            $freeValidDay = array('day' => $cfg_qymembervalid[0]['day'], 'time' => $cfg_qymembervalid[0]['day'] * 86400);
        }
        //VIP会员
        elseif($userinfo['level']){
            $freeValidDay = array('day' => $memberLevelAuth['infoday'], 'time' => $memberLevelAuth['infoday'] * 86400);
        }
        //普通会员
        else{
            $freeValidDay = array('day' => (int)$fabuAmount['infoday'], 'time' => (int)$fabuAmount['infoday'] * 86400);
        }
        $huoniaoTag->assign('freeValidDay', $freeValidDay);


        $typeid = (int)$typeid;

        //修改信息时，url中没有typeid，需要根据信息id查询出typeid
        $_id = (int)$_REQUEST['id'];
        if(!$typeid && $_id){
            $sql = $dsql->SetQuery("SELECT `typeid` FROM `#@__infolist` WHERE `id` = $_id");
            $typeid = (int)$dsql->getOne($sql);
        }

        if($typeid){
            $listHandels = new handlers($service, "typeDetail");
            $listConfig  = $listHandels->getHandle($typeid);
            if (is_array($listConfig) && $listConfig['state'] == 100) {
                $listConfig = $listConfig['info'];
                if (is_array($listConfig)) {
                    $listConfig = $listConfig[0];
                    foreach ($listConfig as $key => $value) {
                        $huoniaoTag->assign('list_' . $key, $value);

                        //为类是跳转链接的，直接跳走
                        if($key == 'redirect' && $value != ''){
                            header('location:' . $value);
                            die;
                        }
                    }

                    //分类高级设置

                    //延长有效期
                    //关闭延长有效期
                    if($listConfig['validSwitch'] == 0){
                        $info = array();
                        $info_smart = 'a:0:{}';
                    }
                    //自定义规则
                    elseif($listConfig['validConfig']){
                        $info = $listConfig['validRule'];
                    }
                }
            }
            //面包屑
            global $data;
            $data    = "";
            $typeArr = getParentArr("infotype", $typeid);
            $typeArr = array_reverse(parent_foreach($typeArr, "typename"));

            global $data;
            $data    = "";
            $typeIds = getParentArr("infotype", $typeid);
            $typeIds = array_reverse(parent_foreach($typeIds, "id"));

            $crumbs = array();
            foreach ($typeArr as $key => $value) {
                $param    = array(
                    "service" => $service,
                    "template" => "list",
                    "typeid" => $typeIds[$key],
                    "addrid" => (int)$addrid,
                );
                $url      = getUrlPath($param);
                $crumbs[] = '<a href="' . $url . '">' . $value . '</a>';
            }
            $huoniaoTag->assign('list_crumbs', join("<s></s>", $crumbs));
            //特色标签
            $te = $dsql->SetQuery("SELECT * FROM `#@__infoitemtype` WHERE `tid` = " . $typeid . "");
            $teseid = $dsql->dsqlOper($te, "results");
            if ($teseid) {
                foreach ($teseid as $k => $vv) {
                    $label[$k]['id'] = $vv['id'];
                    $label[$k]['name'] = $vv['name'];
                    $label[$k]['weight'] = $vv['weight'];
                }
            }

        }



        if($addrid){
			$addrid = (int)$addrid;
            global $data;
            $data   = "";
            $addrArr = getParentArr("site_area", $addrid);
            $addrArr = array_reverse(parent_foreach($addrArr, "typename"));
            $addrname = $addrArr[count($addrArr)-1];
            $huoniaoTag->assign('addrname', $addrname);

            global $data;
            global $siteCityInfo;
            $data    = "";
            $addrIds = getParentArr("site_area", $addrid);
            $addrIds = array_reverse(parent_foreach($addrIds, "id"));

            //数据共享
    		require(HUONIAOINC."/config/info.inc.php");
    		$dataShare = (int)$customDataShare;

            $plus = 1;
    		if($dataShare){
                $plus = 0;
            }
            $addrIds = array_slice($addrIds, array_search($siteCityInfo['cityid'], $addrIds) + $plus);
            $huoniaoTag->assign('addrIds', $addrIds);
        }

        if($addrid1){
			$addrid1 = (int)$addrid1;
            global $data;
            $data   = "";
            $addrArr = getParentArr("site_area", $addrid1);
            $addrArr = array_reverse(parent_foreach($addrArr, "typename"));
            $addrname = $addrArr[count($addrArr)-1];
            $huoniaoTag->assign('addrname1', $addrname);
        }

        $item = str_replace("\\", '', $_REQUEST['item']);
        if($item){
            $itemArr = array();
            $itemList = json_decode($item, true);
            if(is_array($itemList)){
                foreach ($itemList as $key => $value) {
                    $itemArr[$value['id']] = $value['value'];
                }

                $item = urlencode($item);
                $huoniaoTag->assign('item', $item);
                $huoniaoTag->assign('itemArr', $itemArr);
            }else{
                $huoniaoTag->assign('item', '');
            }
        }


        $huoniaoTag->assign('nature', (int)$nature);

        $price_section = $_GET['price_section'];
        $price_sectionArr = explode(',', $price_section);
        $min_price = (int)$price_sectionArr[0];
        $max_price = (int)$price_sectionArr[1];
        $huoniaoTag->assign('price_section', $min_price || $max_price ? ($min_price.','.$max_price) : '');
        $huoniaoTag->assign('min_price', $min_price);
        $huoniaoTag->assign('max_price', $max_price);

        $huoniaoTag->assign('keywords', $keywords);
        $huoniaoTag->assign('typeid', (int)$typeid);
        $huoniaoTag->assign('addrid', (int)$addrid);
        $huoniaoTag->assign('addrid1', (int)$addrid1);
        $huoniaoTag->assign('typeIds', $typeIds);
        $huoniaoTag->assign('fire', (int)$fire);
        $huoniaoTag->assign('rec', (int)$rec);
        $huoniaoTag->assign('typename', $typeArr ? $typeArr[count($typeArr)-1] : '');
        $huoniaoTag->assign('orderby', RemoveXSS($orderby));
        $huoniaoTag->assign('page', (int)$page);
        $huoniaoTag->assign('info', $info ? $info : unserialize($info_smart));
        $huoniaoTag->assign('infoCount', $infoCount);
        $huoniaoTag->assign('label', $label);
        $huoniaoTag->assign('fabuamount', $amount);
        $huoniaoTag->assign('cfg_valid', $valid);
        return;

        //获取指定ID的详细信息
    } elseif ($action == "detail" || $action == "comment") {
        $act = 'detail';
        if($type){
            $act = 'storeDetail';
        }
        include(HUONIAOROOT . "/include/config/info.inc.php");
        include(HUONIAOROOT . "/include/config/siteConfig.inc.php");
        //获取上传附件
        if ($customFtp == '0'){           //系统默认
            $huoniaoTag->assign('cfg_ftpType', $cfg_ftpType);
        }else{
          $huoniaoTag->assign('cfg_ftpType', $custom_ftpType);
        }
        $ftpName = array('普通FTP模式','阿里云OSS','七牛云','华为云OBS','腾讯云COS');
        $huoniaoTag->assign('ftpName', $ftpName);
        $detailHandels = new handlers($service, $act);
        $id = (int)$id;
        $detailConfig  = $detailHandels->getHandle($id);
        $type = $type ? (int)$type : 0;
		$huoniaoTag->assign('type', $type);
		//消费返积分比例
        $huoniaoTag->assign('cfg_returnPoint_info',$cfg_returnPoint_info);

        $info = unserialize($cfg_info_Smart);                //有效期
        $info_smart ='a:2:{i:0;a:5:{s:5:"times";i:0;s:3:"day";i:3;s:7:"daytime";i:259200;s:7:"dayText";s:3:"天";s:5:"price";d:5;}i:1;a:5:{s:5:"times";i:0;s:3:"day";i:7;s:7:"daytime";i:604800;s:7:"dayText";s:3:"天";s:5:"price";d:10;}}';  //默认 有效期
        $cfg_valid = unserialize($cfg_valid);
        $cfgvalid = 'a:1:{i:0;a:3:{s:3:"day";i:3650;s:7:"daytime";i:315360000;s:5:"price";d:1;}}';
        $cfg_defaultvalid = unserialize($cfg_defaultvalid);
        $cfgdefaultvalid = 'a:1:{i:0;a:2:{s:3:"day";i:1;s:7:"daytime";i:86400;}}';   //默认

        $huoniaoTag->assign('info', $info ? $info : unserialize($info_smart));
        //永久有效期
        $huoniaoTag->assign('cfg_valid', $cfg_valid ? $cfg_valid : unserialize($cfgvalid));
        //默认有效期
        $huoniaoTag->assign('cfg_defaultvalid', $cfg_defaultvalid ?$cfg_defaultvalid : unserialize($cfgdefaultvalid));
        $cfg_defaultvalid;
        $status = explode(',',$custom_excitation);
        $bao     =$status[1];
        if ($bao > 0){
            $bao = 'true';
            $huoniaoTag->assign('bao', $bao);
        }

        if (is_array($detailConfig) && $detailConfig['state'] == 100) {
            $detailConfig = $detailConfig['info'];
            if (is_array($detailConfig)) {

				// 如果是会员中心修改页面，验证是否是发布人
				if($realServer == "member"){
					$uid = $userLogin->getMemberID();
					if($uid > 0 && $detailConfig['userid'] != $uid){
						header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
						die;
					}
				}

                $huoniaoTag->assign('detail_info_video_pic', $detailConfig['imglist'] ? $detailConfig['imglist'][0]['path'] : '' );
                $huoniaoTag->assign('is_video', $detailConfig['video']);
                $userid = $detailConfig['member']['userid'];
                if($userid){
                    //查询是不是商家
                    $sql = $dsql->SetQuery("SELECT l.`id` FROM  `#@__member` m LEFT JOIN  `#@__business_list` l ON l.`uid` = m.`id`  WHERE l.`uid` = $userid  AND m.`state` = 1 AND l.`state` != 3 AND l.`state` != 4 LIMIT 1");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if(!empty($ret)){
                        $huoniaoTag->assign('is_shop', 1);
                        $huoniaoTag->assign('shop_id', $ret[0]['id']);
                        $huoniaoTag->assign('shop_wechat', getFilePath(explode(',', $ret[0]['wechat_pic'])[0]));
                        $huoniaoTag->assign('shop_addr', $ret[0]['address']);
                        $param    = array(
                            "service" => "info",
                            "template" => "business",
                            "id" => $ret[0]['id']
                        );
                        $urlParam = getUrlPath($param);
                        $huoniaoTag->assign('shop_url', $urlParam);
                        $huoniaoTag->assign('sjid',$ret[0]['id']);
                        $lnglat_1 = join(',', array_reverse(explode(',', $ret[0]['lnglat'])));

                        $addr_url = "https://api.map.baidu.com/marker?location={$lnglat_1}&title={$detailConfig['member']['company']}&content={$ret[0]['address']}&output=html";
                        $huoniaoTag->assign('addr_url_map', $addr_url);

                    }else{
                        $huoniaoTag->assign('is_shop', 0);
                    }
                }else{
                    $huoniaoTag->assign('is_shop', 0);
                }

                detailCheckCity($service, $detailConfig['id'], $detailConfig['cityid'], $action);
                $huoniaoTag->assign('detail_info', $detailConfig);
                //获取分类信息
                $listHandels = new handlers($service, "typeDetail");
                $listConfig  = $listHandels->getHandle($detailConfig['typeid']);
                if (is_array($listConfig) && $listConfig['state'] == 100) {
                    $listConfig = $listConfig['info'];
                    if (is_array($listConfig)) {
                        foreach ($listConfig[0] as $key => $value) {
                            $huoniaoTag->assign('list_' . $key, $value);
                        }

                        //延长有效期自定义
                        if($listConfig[0]['validConfig'] == 1){
                            $info = $listConfig[0]['validRule'];
                            $huoniaoTag->assign('info', $info);
                        }
                    }
                }

                //面包屑
                global $data;
                $data    = "";
                $typeArr = getParentArr("infotype", $detailConfig['typeid']);
                $typeArr = array_reverse(parent_foreach($typeArr, "typename"));
                global $data;
                $data    = "";
                $typeIds = getParentArr("infotype", $detailConfig['typeid']);
                $typeIds = array_reverse(parent_foreach($typeIds, "id"));
                $crumb = array();
                $crumbs = array();
                foreach ($typeArr as $key => $value) {

                    $param    = array(
                        "service" => $service,
                        "template" => "list",
                        "id" => $typeIds[$key]
                    );
                    $url      = getUrlPath($param);
                    $crumbs[] = '<a href="' . $url . '" target="_blank">' . $value . '</a>';
                    $crumb[$key]['id'] = $typeIds[$key];
                    $crumb[$key]['typename'] =$value;
                }
                $huoniaoTag->assign('list_crumbs', join(" &raquo; ", $crumbs));
                $huoniaoTag->assign('crumb', $crumb);

                //输出详细信息
                foreach ($detailConfig as $key => $value) {
                    $huoniaoTag->assign('detail_' . $key, $value);
                }

                $body = $detailConfig['body'];
                $huoniaoTag->assign('detail_body', str_replace("</p>_huoniao_page_break_tag_<p>", "", $body));

                // //更新阅读次数
                // $sql = $dsql->SetQuery("UPDATE `#@__" . $service . "list` SET `click` = `click` + 1 WHERE `arcrank` = 1 AND `id` = " . $id);
                // $dsql->dsqlOper($sql, "update");

                // $uid = $userLogin->getMemberID();
                // if($uid >0 ) {
                //     $uphistoryarr = array(
                //         'module'    => $service,
                //         'uid'       => $uid,
                //         'aid'       => $id,
                //         'fuid'      => '',
                //         'module2'   => 'detail',
                //     );
                //     /*更新浏览足迹表   */
                //     updateHistoryClick($uphistoryarr);
                // }

            }
        } else {
            header("location:" . $cfg_secureAccess.$cfg_basehost . "/404.html");
        }
        return;


        //会员首页
    } elseif ($action == "store") {

        $huoniaoTag->assign('id', $id);
        $huoniaoTag->assign('member', getMemberDetail($id));

        //获取商家共发布多少条信息
        $archives = $dsql->SetQuery("SELECT `id` FROM `#@__infolist` WHERE `arcrank` = 1 AND `userid` = " . $id);
        $results2 = $dsql->dsqlOper($archives, "totalCount");
        $huoniaoTag->assign('storeCount', $results2);
        return;


        //号码发布记录
    } elseif ($action == "mobilehistory") {

        if ($data) {
            $RenrenCrypt = new RenrenCrypt();
            $tel         = $RenrenCrypt->php_decrypt(base64_decode($data));

            $huoniaoTag->assign('data', $data);
            $huoniaoTag->assign('tel', $tel);
            $huoniaoTag->assign('telAddr', getTelAddr($tel));

            //获取手机号码共发布多少条信息
            global $dsql;
            $archives = $dsql->SetQuery("SELECT `id` FROM `#@__infolist` WHERE `tel` = '" . $tel . "' AND `arcrank` = 1");
            $results2 = $dsql->dsqlOper($archives, "totalCount");
            $huoniaoTag->assign('telCount', $results2);

        } else {
            header("location:" . $cfg_secureAccess.$cfg_basehost . "/404.html");
        }
        return;


        //发布信息
    } elseif ($action == "payreturn") {
        global $dsql;
        global $userLogin;
        $userid = $userLogin->getMemberID();
        if (!$ordernum && !$id) {
            
    		require(HUONIAOINC."/config/info.inc.php");

            //如果是电脑端或者移动端老模板，则跳转到发布管理页面
            if(!isMobile() || (isMobile() && $customTouchTemplate != 'skin5')){
                $param = array(
                    "service"  => "member",
                    "type"     => "user",
                    "template" => "manage-info",
                    "param" => "currentPageOpen=1",
                );
                header("location:" . getUrlPath($param));
                die;
            }

        } else {

            $param = array(
                "service"  => "member",
                "type"     => "user",
                "template" => "manage-info",
                "param" => "currentPageOpen=1",
            );
            header("location:" . getUrlPath($param));
            die;
            
        }

    } elseif ($action == "homepage") {

        if(empty($id)){
            header("location:" . $cfg_secureAccess.$cfg_basehost . "/404.html");
            die;
        }
        //个人发布主页
        global $dsql;
        global $userLogin;
        $uid      = $userLogin->getMemberID();
        $userinfo = getMemberDetail($id);
        $days     = FloorTime(time() - (strtotime($userinfo['regtime'])) , 3);
        $mons     = (int)($days / 30);

        if($uid < 0){
            $userinfo['phone'] = preg_replace('/(1[3456789]{1}[0-9])[0-9]{4}([0-9]{4})/is',"$1****$2", $userinfo['phone']);
        }

        $huoniaoTag->assign('userInfo_', $userinfo);
        $huoniaoTag->assign('mons', $mons);
        $param  = array(
            "service" => "info",
            "template" => "homepage",
            "id" => $id
        );
        $action = getUrlPath($param);
        $huoniaoTag->assign('action', $action);
        //发布信息
//        $keywords    = $_GET['keywords'] ? $_GET['keywords'] : '';
        $listHandels = new handlers('info', "getUserHomeList");
        $listConfig  = $listHandels->getHandle(array('userid' => $id, 'keywords' => $keywords));
        if (is_array($listConfig) && $listConfig['state'] == 100) {
            $list = $listConfig['info'];
            $huoniaoTag->assign('list', $list);
            $sql      = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__infolist` WHERE `is_valid` = 0 AND `waitpay` = 0 AND `arcrank` = 1 AND `userid` = $id");
            $list_count     = $dsql->dsqlOper($sql, "results");
            $huoniaoTag->assign('list_count', $list_count[0]['total']);
            $clicks  = 0;
            $commons = 0;

            $sql = $dsql->SetQuery("SELECT COUNT(`id`) total FROM `#@__site_followmap` WHERE `temp` = 'info' AND `userid_b` = " . $list[0]['userid']);
            $total = getCache("info", $sql, 300, array("name" => "total"));
            $huoniaoTag->assign('fensi', $total);

            $sql = $dsql->SetQuery("SELECT COUNT(`id`) total FROM `#@__site_followmap` WHERE `temp` = 'info' AND `userid` = " . $list[0]['userid']);
            $total = getCache("info", $sql, 300, array("name" => "total"));
            $huoniaoTag->assign('guanzhu', $total);

            foreach ($list as $item) {
                $clicks  += $item['click'];
                $commons += $item['common'];
            }
            $huoniaoTag->assign('clicks', $clicks);
            $huoniaoTag->assign('commons', $commons);

            //是否关注
            $userLoginid = $userLogin->getMemberID();
            $sql = "SELECT `id` FROM `#@__site_followmap` WHERE `temp` ='info' AND `userid` = $userLoginid AND `userid_b` = " . $list[0]['userid'];
            $sql = $dsql->SetQuery($sql);
            $is_foll = $dsql->dsqlOper($sql, "results");
            $huoniaoTag->assign('is_follow', $is_foll ? 1 : 0);


        }

    } elseif ($action == 'business') {
        //商家主页
        global $dsql;
        global $userLogin;
        $userid = $userLogin->getMemberID();
        $sql = "UPDATE `#@__infoshop` SET `click` = `click`+1 WHERE `id` = $id";
        $sql = $dsql->SetQuery($sql);
        $dsql->dsqlOper($sql, "update");
        $shopid = $id;
        $huoniaoTag->assign('detail_id', $shopid);
        $listHandels = new handlers('info', "getStoreDetail");
        $listConfig  = $listHandels->getHandle(array('id' => $shopid));

        if($listConfig['state'] != 100){
            header("location:".$cfg_secureAccess.$cfg_basehost."/404.html?msg=info-business");
            die;
        }

        $uid = (int)$listConfig['info']['memberInfo']['userid'];
        //商户发布不同分类的信息统计
//        $archives  = $dsql->SetQuery("SELECT `uid` FROM `#@__business_list` WHERE `uid` = $uid");
//        $uidresult = $dsql->dsqlOper($archives,'results');
//        $uid = $uidresult[0]['uid'];
        $now   = GetMkTime(time());
        $infoarchive  = $dsql->SetQuery("SELECT `typeid`,count(`typeid`)counttype FROM `#@__infolist` WHERE `userid` = $uid AND `arcrank` = 1 AND `waitpay` = 0 AND `cityid` != 0 AND `valid` > ".$now." AND `valid` <> 0 AND `valid` > ".$now."  AND `del` = 0 GROUP BY `typeid`");
        $inforesult = $dsql->dsqlOper($infoarchive,'results');
        $typeArr= array();
        foreach ($inforesult as $key => $value ){
            $name             = $dsql->SetQuery("SELECT `typename` FROM `#@__infotype` WHERE `id` = " .$value['typeid']);
            $typenames              = $dsql->dsqlOper($name, "results");
            if (!empty($typenames)){
                $typeArr[$key]['typename'] = $typenames[0]['typename'];
                $typeArr[$key]['counttype'] = $value['counttype'];
                $typeArr[$key]['typeid'] = $value['typeid'];

            }

        }
        $desctype  = array_column($typeArr,'counttype');
        array_multisort($desctype,SORT_ASC,$typeArr);
        $huoniaoTag->assign('typeArr', array_reverse($typeArr));
        if (is_array($listConfig) && $listConfig['state'] == 100) {
            $info = $listConfig['info'];
//            foreach ($info as  $item) {
                $huoniaoTag->assign('detail_', $info);
//            }
//            foreach ($info['lnglat'] as $k => $v){
//                $info['lnglat'][$k] = trim($v);
//            }
//            $info['lnglat'] =$info['lng'];
            $lng = $info['lng'];
            $lat = $info['lat'];
            $lnglat_1 = implode(',',array($lng, $lat));
//            $lnglat_1 = join(',', array_reverse($info['lnglat']));

            $addr_url = "https://api.map.baidu.com/marker?location={$lnglat_1}&title={$info['titlenew']}&content={$info['address']}&output=html";

            $huoniaoTag->assign('addr_url_map', $addr_url);
            $listHandels_ = new handlers('info', "ilist_v2");
            $listConfig_  = $listHandels_->getHandle(array('uid' => $uid));
            if (is_array($listConfig_) && $listConfig_['state'] == 100) {
                $huoniaoTag->assign('pinfos_sum_count', $listConfig_['info']['pageInfo']['totalCount']);
            }else{
                $huoniaoTag->assign('pinfos_sum_count', 0);
            }
            //会员的粉丝

             $follow     = $dsql->SetQuery("SELECT count(f.`id`)follow  FROM `#@__member_follow` f LEFT JOIN `#@__member` m1 ON m1.`id` = f.`tid` WHERE f.`fid` = {$uid} AND m1.id != '' AND m1.`mtype`!=0 ");
            $resfollow     = $dsql->dsqlOper($follow, "results");
            $infoDetail["follow"]   = $resfollow[0]['follow'];
            $huoniaoTag->assign('follow', $infoDetail["follow"]);
            //关注
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__member_follow` WHERE `tid` = $userid AND `fid` = " . $uid);
            // $sql = "SELECT `id` FROM `#@__site_followmap` WHERE `temp` = 'info' AND `userid` = $userLoginid AND `userid_b` = {$result['uid']}";
            $sql = $dsql->SetQuery($sql);
            $is_foll = $dsql->dsqlOper($sql, "results");
            $infoDetail['is_follow']  = $is_foll ? 1 : 0;
            $huoniaoTag->assign('is_follow', $infoDetail['is_follow']);

            // 统计已发布信息数量
            // $sql = $dsql->SetQuery("SELECT COUNT(`id`) total FROM `#@__infolist` WHERE `userid` = ".$info['uid']." AND `state` = 1");
            // $total = getCache("info", $sql, 300, array("name" => "total"));
            // $huoniaoTag->assign('pinfos_sum_count', $total);


        }

        //验证是否已经收藏
        $params  = array(
            "module" => "info",
            "temp" => "business",
            "type" => "add",
            "id" => $id,
            "check" => 1
        );
        $collect = checkIsCollect($params);
        $huoniaoTag->assign('collect', $collect == "has" ? 1 : 0);

        $huoniaoTag->assign('page', (int)$page);
		$uid = $userLogin->getMemberID();
		if($uid >0) {
		    $uphistoryarr = array(
		        'module'    => $service,
		        'uid'       => $uid,
		        'aid'       => $id,
		        'fuid'      => '',
		        'module2'   => 'storeDetail',
		    );
		    /*更新浏览足迹表   */
		    updateHistoryClick($uphistoryarr);
		}

    }elseif($action == 'confirm'){
        //够买页面
        global $dsql;
        global $userLogin;
        global $cfg_secureAccess;
        global $cfg_basehost;
        $uid = $userLogin->getMemberID();
        if($uid == -1){
            header("location:" . $cfg_secureAccess.$cfg_basehost . "/login.html");exit;
            die;
        }
        $buyInfo = new handlers('info', "detail");
        $buyInfos  = $buyInfo->getHandle(array('id' => $id));
        if (is_array($buyInfos) && $buyInfos['state'] == 100) {
            $buyInfos = $buyInfos['info'];
            foreach ($buyInfos as $key=>$item){
                $huoniaoTag->assign('detail_' . $key, $item);
            }


        }else{
            header("location:" . $cfg_secureAccess.$cfg_basehost . "/404.html");
        }

    }elseif($action == 'pay'){
        global $dsql;
        global $userLogin;
        $uid = $userLogin->getMemberID();
        if($uid == -1){
            header("location:" . $cfg_secureAccess.$cfg_basehost . "/login.html");exit;
            die;
        }
        $RenrenCrypt = new RenrenCrypt();
        $ordernums = $RenrenCrypt->php_decrypt(base64_decode($ordernum));
        if($ordernums){
            $sql = $dsql->SetQuery("SELECT * FROM `#@__info_order` WHERE `ordernum` = '$ordernums'");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $huoniaoTag->assign('ordernum', $ordernums);
                $order = $ret[0];
                if($order['orderstate'] == 0){
                    $price = $order['price'];
                    $huoniaoTag->assign('price', $price);

                    $huoniaoTag->assign('people', $order['people']);
					$huoniaoTag->assign('address', $order['address']);
					$huoniaoTag->assign('contact', $order['contact']);
					$huoniaoTag->assign('note', $order['note']);
                    $huoniaoTag->assign('logistic', $order['logistic']);

                    $buyInfo = new handlers('info', "detail");
                    $buyInfos  = $buyInfo->getHandle(array('id' => $order['prod']));
                    if (is_array($buyInfos) && $buyInfos['state'] == 100) {
                        $buyInfos = $buyInfos['info'];
                        foreach ($buyInfos as $key=>$item){
                            $huoniaoTag->assign('detail_' . $key, $item);
                        }
                    }else{
                        header("location:" . $cfg_secureAccess.$cfg_basehost . "/404.html");
                    }
                }else{
                    $param = array(
						"service"  => "member",
						"type"     => "user",
						"template" => "orderdetail",
						"module"   => "info",
						"id"       => $order['id']
					);

					header('location:'.getUrlPath($param));
					die;
                }

            }else{
                header('location:'.$cfg_secureAccess.$cfg_basehost.'/404.html');
				die;
            }
        }else{
            header('location:'.$cfg_secureAccess.$cfg_basehost.'/404.html');
			die;
        }

    }
    elseif($action == "storeDetail"){
        $detailHandels = new handlers($service, "storeDetail");
        $detailConfig  = $detailHandels->getHandle($uid);
        $state = 0;

        global $template;

        if(is_array($detailConfig) && $detailConfig['state'] == 100){
            $detailConfig  = $detailConfig['info'];
            if(is_array($detailConfig)){

                if($template != 'config'){
                    detailCheckCity($service, $detailConfig['id'], $detailConfig['cityid'], $action);
                }

                //输出详细信息
                foreach ($detailConfig as $key => $value) {
                    $huoniaoTag->assign('detail_'.$key, $value);
                }
                $state = 1;

                $uid = $userLogin->getMemberID();
                if($uid >0) {
                    $uphistoryarr = array(
                        'module'    => $service,
                        'uid'       => $uid,
                        'aid'       => $id,
                        'fuid'      => '',
                        'module2'   => 'storeDetail',
                    );
                    /*更新浏览足迹表   */
                    updateHistoryClick($uphistoryarr);
                }

            }

        }else{

            if($template != 'config'){
                header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
                die;
            }
        }
        $huoniaoTag->assign('storeState', $state);
        return;


    }elseif ($action == "store_list"){

        if($list_id){
            $listHandels = new handlers($service, "typeDetail");
            $listConfig  = $listHandels->getHandle($list_id);
            if (is_array($listConfig) && $listConfig['state'] == 100) {
                $listConfig = $listConfig['info'];
                if (is_array($listConfig)) {
                    foreach ($listConfig[0] as $key => $value) {
                        $huoniaoTag->assign('list_' . $key, $value);
                    }
                }
            }

            //面包屑
            global $data;
            $data    = "";
            $typeArr = getParentArr("infotype", $list_id);
            $typeArr = array_reverse(parent_foreach($typeArr, "typename"));

            global $data;
            $data    = "";
            $typeIds = getParentArr("infotype", $list_id);
            $typeIds = array_reverse(parent_foreach($typeIds, "id"));

            $crumbs = array();
            foreach ($typeArr as $key => $value) {
                $param    = array(
                    "service" => $service,
                    "template" => "store_list",
                    "list_id" => $typeIds[$key],
                    "addr_id" => (int)$addr_id,
                );
                $url      = getUrlPath($param);
                $crumbs[] = '<a href="' . $url . '">' . $value . '</a>';
            }
            $huoniaoTag->assign('list_crumbs', join("<s></s>", $crumbs));
        }

        if($addr_id){
            global $data;
            $data   = "";
            $addrArr = getParentArr("site_area", $addr_id);
            $addrArr = array_reverse(parent_foreach($addrArr, "typename"));
            $addrname = !empty($addrArr[3]) ? $addrArr[3] : $addrArr[2];
            $huoniaoTag->assign('addrname', $addrname);

            global $data;
            global $siteCityInfo;
            $data    = "";
            $addrIds = getParentArr("site_area", $addr_id);
            $addrIds = array_reverse(parent_foreach($addrIds, "id"));
            $addrIds = array_slice($addrIds, array_search($siteCityInfo['cityid'], $addrIds) + 1);
            $huoniaoTag->assign('addrIds', $addrIds);
        }

        $huoniaoTag->assign('keywords', $keywords);
        $huoniaoTag->assign('list_id', (int)$list_id);
        $huoniaoTag->assign('addrid', (int)$addr_id);
        $huoniaoTag->assign('typeIds', $typeIds);
        $huoniaoTag->assign('typename', $typeArr ? $typeArr[count($typeArr)-1] : '');
        $huoniaoTag->assign('orderby', (int)$orderby);
        $huoniaoTag->assign('page', (int)$page);

    }elseif($action == "comdetail"){
        $id   = (int)$id;
		$type = $type ? (int)$type : 0;
        $huoniaoTag->assign('type', $type);
        /* $act = 'commentDetail';
        if($type){
            $act = 'shopcommentDetail';


        } */
        $act = 'commentDetail';

        $detailHandels = new handlers("member", $act);
        $detail  = $detailHandels->getHandle(array("id" => $id));
        if(is_array($detail) && $detail['state'] == 100){
            $detail  = $detail['info'];
            foreach ($detail as $key => $value) {
                $huoniaoTag->assign('detail_'.$key, $value);
            }
            if($type){
                $infoshopHandels = new handlers($service, "storeDetail");
                $infoshopConfig  = $infoshopHandels->getHandle($detail['aid']);
                if(is_array($infoshopConfig) && $infoshopConfig['state'] == 100){
                    $infodetail  = $infoshopConfig['info'];
                    $huoniaoTag->assign('detail_info', $infodetail);
                }
            }else{
                $infoListHandels = new handlers($service, "detail");
                $infoListConfig  = $infoListHandels->getHandle($detail['aid']);
                if(is_array($infoListConfig) && $infoListConfig['state'] == 100){
                    $infodetail  = $infoListConfig['info'];
                    $huoniaoTag->assign('detail_info', $infodetail);
                }
            }
        }else{
            $param = array(
				"service" => "info",
			);
			header("location:".getUrlPath($param));
			die;
        }
    }


    global $template;
    if (empty($smarty)) return;

    if (!isset($return))
        $return = 'row'; //返回的变量数组名

    //注册一个block的索引，照顾smarty的版本
    if (method_exists($smarty, 'get_template_vars')) {
        $_bindex = $smarty->get_template_vars('_bindex');
    } else {
        $_bindex = $smarty->getVariable('_bindex')->value;
    }

    if (!$_bindex) {
        $_bindex = array();
    }

    if ($return) {
        if (!isset($_bindex[$return])) {
            $_bindex[$return] = 1;
        } else {
            $_bindex[$return]++;
        }
    }

    $smarty->assign('_bindex', $_bindex);

    //对象$smarty上注册一个数组以供block使用
    if (!isset($smarty->block_data)) {
        $smarty->block_data = array();
    }

    //得一个本区块的专属数据存储空间
    $dataindex = md5(__FUNCTION__ . md5(serialize($params)));
    $dataindex = substr($dataindex, 0, 16);

    //使用$smarty->block_data[$dataindex]来存储
    if (!$smarty->block_data[$dataindex]) {
        //取得指定动作名
        $moduleHandels = new handlers($service, $action);

        $param = $params;

        //获取分类
        if ($action == "type" || $action == "addr") {
            $param['son'] = $son ? $son : 0;

            //信息列表
        } elseif ($action == "ilist") {
            //如果是列表页面，则获取地址栏传过来的typeid
            if ($template == "list" && !$typeid) {
                global $typeid;
                $params['typeid'] = $typeid;
            }

        }

        $moduleReturn = $moduleHandels->getHandle($param);

        //只返回数据统计信息
        if ($pageData == 1) {
            if (!is_array($moduleReturn) || $moduleReturn['state'] != 100) {
                $pageInfo_ = array("totalCount" => 0, "gray" => 0, "audit" => 0, "refuse" => 0, "expire" => 0);
            } else {
                $moduleReturn = $moduleReturn['info'];  //返回数据
                $pageInfo_    = $moduleReturn['pageInfo'];
            }
            $smarty->block_data[$dataindex] = array($pageInfo_);

            //正常返回
        } else {

            if (!is_array($moduleReturn) || $moduleReturn['state'] != 100) return '';
            $moduleReturn = $moduleReturn['info'];  //返回数据
            $pageInfo_    = $moduleReturn['pageInfo'];
            if ($pageInfo_) {
                //如果有分页数据则提取list键
                $moduleReturn = $moduleReturn['list'];
                //把pageInfo定义为global变量
                global $pageInfo;
                $pageInfo = $pageInfo_;
                $smarty->assign('pageInfo', $pageInfo);
            }

            $smarty->block_data[$dataindex] = $moduleReturn;  //存储数据

        }
    }

    //果没有数据，直接返回null,不必再执行了
    if (!$smarty->block_data[$dataindex]) {
        $repeat = false;
        return '';
    }

    //一条数据出栈，并把它指派给$return，重复执行开关置位1
    if (list($key, $item) = each($smarty->block_data[$dataindex])) {
        $smarty->assign($return, $item);
        $repeat = true;
    }

    //如果已经到达最后，重置数组指针，重复执行开关置位0
    if (!$item) {
        reset($smarty->block_data[$dataindex]);
        $repeat = false;
    }

    //打印内容
    print $content;
}
