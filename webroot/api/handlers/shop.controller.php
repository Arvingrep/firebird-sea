<?php

/**
 * huoniaoTag模板标签函数插件-商城模块
 *
 * @param $params array 参数集
 * @return array
 */
function shop($params, $content = "", &$smarty = array(), &$repeat = array()){
	extract ($params);
	$service = "shop";
	if(empty($action)) return '';
	global $huoniaoTag;
	global $dsql;
	global $userLogin;
	global $cfg_secureAccess;
	global $cfg_basehost;
	global $langData;
    global $cfg_returnPoint_shop;
    global $cfg_shopFee;
    global $cfg_fenxiaoAmount;
    global $cfg_fenxiaoLevel;
    global  $installModuleArr;
    include HUONIAOINC . "/config/shop.inc.php";
    $fenXiao = (int)$customfenXiao;
    $shoppagetype = '';
    if (!empty($pagetype)){
        $shoppagetype = $pagetype;
    }else{
        $shoppagetype = $custom_huodongshoptypeopen;
    }
    global $cfg_fenxiaoState;
	$userid = $userLogin->getMemberID();
	$furl = urlencode($cfg_secureAccess.$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI']);
    //用户个人模块信息
    $shopstatus = 0;
   
    $memberPackage = $userLogin->getMemberPackage();
    $Sql = $dsql->SetQuery("SELECT `id`,`title`,`logo`,`state`,`shoptype` FROM `#@__shop_store` WHERE 1=1 AND `userid` = '$userid' ");
    $Res = $dsql->dsqlOper($Sql, "results");
    if ($Res) {
        if (is_array($memberPackage) && is_array($memberPackage['package']) && is_array($memberPackage['package']['listContent'])){
            if (in_array("shop",$memberPackage['package']['listContent'])){
                $shopstatus = 1;
            }
        }
    }

    $huoniaoTag->assign('pagetype', $shoppagetype);
    $huoniaoTag->assign('shopstatus', $shopstatus);
    $huoniaoTag->assign('custom_huodongopen', explode(',',$custom_huodongopen));
    $huoniaoTag->assign('installModuleArr', $installModuleArr);
    //以图搜图
	include(HUONIAOINC . '/config/shop.inc.php');
	if($imagesearch_AppID && $imagesearch_APIKey && $imagesearch_Secret){
		$huoniaoTag->assign("imagesearch", 1);
	}

//    $huoniaoTag->assign('action', $seo_title);
	//品牌库
	if($action == "brand"){

		$typeid = (int)$typeid;
		$huoniaoTag->assign("typeid", $typeid);

		//类型
		$seo_title = $langData['siteConfig'][16][47];  //商城
		if(!empty($typeid)){
			$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__shop_brandtype` WHERE `id` = $typeid");
			$res = $dsql->dsqlOper($sql, "results");
			if($res){
				$seo_title = $res[0]['typename'];
			}
		}
		$huoniaoTag->assign('seo_title', $seo_title);


	//品牌详细
	}elseif($action == "brand-detail"){

		$id = (int)$id;
		if($id){
			$sql = $dsql->SetQuery("SELECT `title` FROM `#@__shop_brand` WHERE `id` = $id");
			$res = $dsql->dsqlOper($sql, "results");
			if($res){

				//品牌名
				$seo_title = $res[0]['title'];
				$huoniaoTag->assign('id', $id);
				$huoniaoTag->assign('seo_title', $seo_title);

				//分类
				$typename = "";
				$typeid = (int)$typeid;
				$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__shop_type` WHERE `id` = $typeid");
				$res = $dsql->dsqlOper($sql, "results");
				if($res){
					$typename = $res[0]['typename'];
				}
				$huoniaoTag->assign('typeid', $typeid);
				$huoniaoTag->assign('typename', $typename);

				//分页
				$page = (int)$page;
				$atpage = $page == 0 ? 1 : $page;
				global $page;
				$page = $atpage;
				$huoniaoTag->assign('page', $page);

				//排序
				$orderby = (int)$orderby;
				$huoniaoTag->assign('orderby', $orderby);

			}else{
				header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
			}
		}else{
			header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
		}
		return;


	//商家店铺
	}elseif($action == "store"){

		$typeid   = (int)$typeid;
		$addrid   = (int)$addrid;
		$business = (int)$business;
		$orderby  = (int)$orderby;
		$page     = (int)$page;

		$huoniaoTag->assign('typeid', $typeid);
		$huoniaoTag->assign('image', $image ? getFilePath($image) : '');
		$huoniaoTag->assign('addrid', $addrid);
		$huoniaoTag->assign('business', $business);
		$huoniaoTag->assign('orderby', $orderby);
		$huoniaoTag->assign('page', $page);
		$huoniaoTag->assign('keywords', $keywords);


	//店铺详细
	}elseif($action == "store-detail" || $action == "storeDetail" || $action == "store-category"){


        //统计商城店速递到家
        require(HUONIAOINC . "/config/shop.inc.php");
        $dataShare = (int)$customDataShare;
        // if (!$dataShare) {
            // $cityid = getCityId($cityid);
            // if ($cityid) {
            //     $archive =$dsql->SetQuery("SELECT p.`id` FROM `#@__shop_product` p LEFT JOIN `#@__shop_store` s ON s.`id` = p.`store` WHERE 1 = 1 AND s.`state` = 1 AND !FIND_IN_SET('1',`typesales`) AND s.`cityid` = '$cityid' AND p.`store` = '$id' AND p.`state` = 1 ");
            // }
        // }else{
            $archive =$dsql->SetQuery("SELECT p.`id` FROM `#@__shop_product` p LEFT JOIN `#@__shop_store` s ON s.`id` = p.`store` WHERE 1 = 1 AND s.`state` = 1  AND !FIND_IN_SET('1',`typesales`) AND p.`store` = '$id' AND p.`state` = 1 ");
        // }
        $res = $dsql->dsqlOper($archive,"totalCount");
        $huoniaoTag->assign('totalExpress', $res);
        $detailHandels = new handlers($service, "storeDetail");
		$detailConfig  = $detailHandels->getHandle($id);
		$state = 0;
        $huoniaoTag->assign('all', (int)$all);
		if(is_array($detailConfig) && $detailConfig['state'] == 100){
			$detailConfig  = $detailConfig['info'];
			if(is_array($detailConfig)){

				global $template;
				if($template != 'config'){
					// detailCheckCity($service, $detailConfig['id'], $detailConfig['cityid'], "store-detail");
				}

				//更新浏览次数
                if($id){
                    $sql = $dsql->SetQuery("UPDATE `#@__shop_store` SET `click` = `click` + 1 WHERE `id` = ".$id);
                    $dsql->dsqlOper($sql, "results");
                }
				//输出详细信息
				foreach ($detailConfig as $key => $value) {
					$huoniaoTag->assign('detail_'.$key, $value);
				}
				$state = $detailConfig['state'];


				//分类
				$pid = $tid = $child = 0;
				$pname = $tname = "";
				$typeid = (int)$typeid;
				if($typeid){
					$sql = $dsql->SetQuery("SELECT `parentid`, `typename` FROM `#@__shop_category` WHERE `id` = $typeid");
					$res = $dsql->dsqlOper($sql, "results");
					if($res){
						//如果pid为0，代表当前ID就是一级
						if($res[0]['parentid'] == 0){
							$pid = $typeid;
							$pname = $res[0]['typename'];

							$sql = $dsql->SetQuery("SELECT `id` FROM `#@__shop_category` WHERE `parentid` = ".$pid);
							$child = $dsql->dsqlOper($sql, "totalCount");

						//如果pid不为0，代表当前ID为二级，需要查询一级分类名
						}else{
							$pid = $res[0]['parentid'];
							$tid = $typeid;
							$tname = $res[0]['typename'];
							$child = 1;

							$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__shop_category` WHERE `id` = ".$pid);
							$ret = $dsql->dsqlOper($sql, "results");
							if($ret){
								$pname = $ret[0]['typename'];
							}
						}
					}
				}
				$huoniaoTag->assign('typeid', $typeid);
				$huoniaoTag->assign('tid', $tid);     //二级ID
				$huoniaoTag->assign('tname', $tname); //二级名
				$huoniaoTag->assign('pid', $pid);     //一级ID
				$huoniaoTag->assign('pname', $pname); //一级名
				$huoniaoTag->assign('child', $child); //二级数量

				//分页
				$page = (int)$page;
				$atpage = $page == 0 ? 1 : $page;
				global $page;
				$page = $atpage;
				$huoniaoTag->assign('page', $page);

				//排序
				$orderby = (int)$orderby;
				$huoniaoTag->assign('orderby', $orderby);

				//关键字
				$huoniaoTag->assign('keywords', $keywords);

				//价格
				$priceArr = array();
				if(!empty($price)){
					$priceArr = explode(",", $_GET['price']);
					$priceArr[0] = (float)$priceArr[0];
					$priceArr[1] = (float)$priceArr[1];
				}
				$huoniaoTag->assign('price', $priceArr);

				// 查询商家是否缴纳保证金
				$authattr = array();
				$sql = $dsql->SetQuery("SELECT `authattr` FROM `#@__business_list` WHERE `uid` = ".$detailConfig['userid']);
				$res = $dsql->dsqlOper($sql, "results");
				if($res){
					$authattr = $res[0]['authattr'] ? explode(",", $res[0]['authattr']) : array();
				}
				$huoniaoTag->assign('business_authattr', $authattr);

			}
			$huoniaoTag->assign('storeState', $state);

		}else{
			$huoniaoTag->assign('storeState', '0');
			if($action == "store-detail"){
                $errortitle = '抱歉,店铺正在审核中';
                header("location:".$cfg_secureAccess.$cfg_basehost."/error.html?msg=$errortitle");

            }
		}
		return;


	//商品列表
	}elseif($action == "list"){

		$seo_title = array();

		//输出所有GET参数
        $pageParam = array();
		foreach($_GET as $key => $val){
            $key = htmlspecialchars(RemoveXSS(strip_tags($key)));
            $val = htmlspecialchars(RemoveXSS(strip_tags($val)));
            if($key!='price'){
                $val = (float)$val;
            }
			$huoniaoTag->assign($key, $val);
			if($key != "service" && $key != "template" && $key != "page"){
				array_push($pageParam, $key."=".$val);
			}
		}
		$huoniaoTag->assign("pageParam", join("&", $pageParam));
        

		//品牌名
		$brandName = "";
        $brand = (int)$brand;
		if($brand){
			$sql = $dsql->SetQuery("SELECT `title` FROM `#@__shop_brand` WHERE `id` = ".$brand);
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret && is_array($ret)){
				$brandName = $ret[0]['title'];
				array_push($seo_title, $brandName);
			}
		}
		$huoniaoTag->assign("brandName", $brandName);


		//子级分类
		$typeid = (int)$typeid;
		$huoniaoTag->assign("typeid", $typeid);
		$huoniaoTag->assign("typeArr", $dsql->getTypeList($typeid, "shop_type", 0));


		//所有父级集合
		global $data;
		$data = "";
		$typeArr = getParentArr("shop_type", $typeid);
		$typeNameArr = array_reverse(parent_foreach($typeArr, "typename"));
		$data = "";
		$typeIdArr = array_reverse(parent_foreach($typeArr, "id"));
		$huoniaoTag->assign("typeNameArr", $typeNameArr);
		$huoniaoTag->assign("typeIdArr", $typeIdArr);
		array_push($seo_title, join("-", $typeNameArr));

		//职位类型
		$typeName = "";
		if(!empty($typeid)){
			$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__shop_type` WHERE `id` = ".$typeid);
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$typeName = $ret[0]['typename'];
			}
		}
		$huoniaoTag->assign("typeName", $typeName);


		//属性
		$itemType = $itemVal = array();
		if(!empty($item)){
			$itemArr = explode(";", $item);
			foreach($itemArr as $key => $val){
				$vArr = explode(":", $val);
				array_push($itemType, $vArr[0]);
				array_push($itemVal, $vArr[1]);
			}
		}
		$huoniaoTag->assign("itemType", $itemType);
		$huoniaoTag->assign("itemVal", $itemVal);


		//规格
		$specificationType = $specificationVal = array();
		if(!empty($specification)){
			$specificationArr = explode(";", $specification);
			foreach($specificationArr as $key => $val){
				$vArr = explode(":", $val);
				array_push($specificationType, $vArr[0]);
				array_push($specificationVal, $vArr[1]);
			}
		}
		$huoniaoTag->assign("specificationType", $specificationType);
		$huoniaoTag->assign("specificationVal", $specificationVal);


		//分页
		$page = (int)$page;
		$atpage = $page == 0 ? 1 : $page;
		global $page;
		$page = $atpage;
		$huoniaoTag->assign('page', $page);

		//排序
		$orderby = (int)$orderby;
		$huoniaoTag->assign('orderby', $orderby);

		//关键字
		$huoniaoTag->assign('keywords', $keywords);

		//价格
		$priceArr = array();
		if(!empty($price)){
			$priceArr = explode(",", $_GET['price']);
			$priceArr[0] = (float)$priceArr[0];
			$priceArr[1] = (float)$priceArr[1];
		}
		$huoniaoTag->assign('price', $priceArr);

		//属性
		$flag = htmlspecialchars(RemoveXSS($_REQUEST['flag']));
		$flagArr = explode(",", $flag);
		$newFlag = array();
		foreach ($flagArr as $key => $value) {
			if($value !== ""){
				array_push($newFlag, (int)$value);
			}
		}
		$flag = join(",", $newFlag);
		$huoniaoTag->assign('flag', $flag);
		$huoniaoTag->assign('flagArr', $newFlag);

		$huoniaoTag->assign('seo_title', join("-", $seo_title));

		//以图搜图
		$huoniaoTag->assign('image', $image ? getFilePath($image) : '');


	//商品详情
	}elseif ($action == "detail" || $action == "comment_detail") {
        $detailHandels = new handlers($service, "detail");
        $detailConfig  = $detailHandels->getHandle($id);
        $huoniaoTag->assign('action', 'detail');
        if (is_array($detailConfig) && $detailConfig['state'] == 100) {
            $detailConfig = $detailConfig['info'];
            if (is_array($detailConfig)) {

                if($detailConfig['states'] != 0 ){

                    $hid = $detailConfig['hid'];
                    $clicksql = $dsql->SetQuery("UPDATE `#@__shop_huodongsign` SET `click` = `click` + 1 WHERE `id` = " . $hid);
                    $dsql->dsqlOper($clicksql, "update");

                }
                detailCheckCity($service, $detailConfig['id'], $detailConfig['store']['cityid'], $action);
    
                global $oper;
                if($oper != 'user'){
                    $archives = $dsql->SetQuery("SELECT p.`id` FROM `#@__shop_product` p LEFT JOIN `#@__shop_store` s ON s.`id` = p.`store` WHERE s.`state` = 1 AND p.`id` = " . $id);
                    $results  = $dsql->dsqlOper($archives, "results");
                    if (!$results) {
                        $errortitle = '抱歉,店铺正在审核中';
                        $huoniaoTag->assign('errortitle', $errortitle);
                        header("location:".$cfg_secureAccess.$cfg_basehost."/error.html?msg=$errortitle");
                    }
                }

                // $sql = $dsql->SetQuery("UPDATE `#@__shop_product` SET `click` = `click` + 1 WHERE `id` = " . $id);
                // $dsql->dsqlOper($sql, "update");

                $uid = $userLogin->getMemberID();
                // if ($uid > 0) {
                //     $uphistoryarr = array(
                //         'module'  => $service,
                //         'uid'     => $uid,
                //         'aid'     => $id,
                //         'fuid'    => '',
                //         'module2' => 'detail',
                //     );
                //     /*更新浏览足迹表   */
                //     updateHistoryClick($uphistoryarr);
                // }
                global $detailArr;
                $detailArr = $detailConfig;
                //输出详细信息
                foreach ($detailConfig as $key => $value) {
                    $huoniaoTag->assign('detail_' . $key, $value);
                }
                global $cfg_returnPointState;
                if ($cfg_returnPointState == 1) {
                    //消费返积分比例
                    $huoniaoTag->assign('cfg_returnPoint_shop', $cfg_returnPoint_shop / 100);
                }else{
                    $huoniaoTag->assign('cfg_returnPoint_shop', 0);
                }
                //查询当前用户是否为分销商
                $archives = $dsql->SetQuery("SELECT m.`id`, m.`mtype`, m.`username`, m.`nickname`, m.`from_uid`, m.`cityid`, m2.`username` recuser, m2.`nickname` recname, m2.`mtype` from_mtype, f.`state`, f.`pubdate` FROM `#@__member_fenxiao_user` f LEFT JOIN `#@__member` m  ON m.`id` = f.`uid` LEFT JOIN `#@__member` m2  ON m2.`id` = m.`from_uid` WHERE 1 = 1 AND m.`id` = $userid AND f.`state` = 1");
                $results  = $dsql->dsqlOper($archives, "results");
                global $cfg_fenxiaoType;
                include HUONIAOINC . "/config/settlement.inc.php";
                //分销佣金比列
                $cfg_fenxiaoFee_shop = 0;
                $fx_reward = $detailConfig['fx_reward'];
                if($cfg_fenxiaoLevel && $fenXiao && $cfg_fenxiaoState && $results && $fx_reward != '0') {
                    $level = unserialize($cfg_fenxiaoLevel);
                    $levelProportion = $level[0]['fee'];
                    $userinfo = $userLogin->getMemberInfo($uid);
                    $memberLevelAuth = getMemberLevelAuth($userinfo['level']);
                    $shopDiscount = $memberLevelAuth['shop'];               //  商城优惠
                    if($cfg_fenxiaoType) {                      //固定等级 分销商比例
                        $sql = $dsql->SetQuery("SELECT `level` FROM `#@__member_fenxiao_user` WHERE `uid` = $uid");
                        $ret = $dsql->dsqlOper($sql, "results");
                        if ($ret) {
                            $levelProportion = $level[$ret[0]['level']]['fee'];
                        }
                    }

                    global $cfg_fenxiaoSource;
                    $fenxiaoSource = (int)$cfg_fenxiaoSource;
                    global $cfg_shopFee;  //平台抽成

                    if($detailConfig['store']['shopFee'] > 0){
                        $cfg_shopFee = $detailConfig['store']['shopFee'];
                    }

                    //如果是平台承担，则计算佣金的底价以平台应得为准
                    $pingtai = 1;
                    if(!$fenxiaoSource){
                        $pingtai = $cfg_shopFee / 100;
                    }

                    //会员折扣不需要在这里计算，VIP会员分享给别人购买后，该会员得到的佣金不受会员商品折扣影响

                    if ($fx_reward) {
                        if (strstr($fx_reward, '%')) {
                        	// if (!empty($shopDiscount)) {
                            //     $cfg_fenxiaoFee_shop = $shopDiscount /10 *  (float)$fx_reward / 100 * $levelProportion / 100 * $pingtai;
                        	// }else{
                                $cfg_fenxiaoFee_shop =  (float)$fx_reward / 100 * $levelProportion / 100 * $pingtai;
                            // }
                        } else {
                        	// if (!empty($shopDiscount)) {
                            //     $cfg_fenxiaoFee_intshop = $shopDiscount /10 * $fx_reward * $levelProportion / 100;
                        	// }else{
                                $cfg_fenxiaoFee_intshop = $fx_reward * $levelProportion / 100;
                     	    // }
                            $huoniaoTag->assign('cfg_fenxiaoFee_intshop', sprintf("%.2f", $cfg_fenxiaoFee_intshop));
                        }
                    } else {

                    	// if (!empty($shopDiscount)) {
                    	//     $cfg_fenxiaoFee_shop = $shopDiscount /10 * $cfg_fenxiaoAmount / 100 * $levelProportion / 100 * $pingtai;
                    	// }else{
                    		$cfg_fenxiaoFee_shop =  $cfg_fenxiaoAmount / 100 * $levelProportion / 100 * $pingtai;
                    	// }

                    }
                }

                $huoniaoTag->assign('cfg_fenxiaoFee_shop', $cfg_fenxiaoFee_shop);  //比例不需要保留两位小数，否则会出现比例小时，前台不显示分享佣金
                global $customshopbargainingnomoney; /*未到底价是否可以下单*/
                global $customhuodongygtime; /*未到底价是否可以下单*/

                $huoniaoTag->assign('customshopbargainingnomoney', $customshopbargainingnomoney);
                $huoniaoTag->assign('customhuodongygtime', $customhuodongygtime);
            }
        } else {
            header("location:" . $cfg_secureAccess . $cfg_basehost . "/404.html");
        }
        return;

    }elseif($action == 'pintuan'){

        $now = GetMkTime(time());
        $where = '';
        $archives = $dsql->SetQuery(" SELECT p.`type` FROM `#@__shop_huodongsign` h LEFT JOIN `#@__shop_product` p ON h.`proid` = p.`id` LEFT JOIN `#@__shop_store` s ON p.`store` = s.`id` WHERE 1= 1 AND p.`state` = 1 AND h.`state` =1 AND h.`ktime`<= '$now' AND h.`etime` >= '$now' AND p.`state` = 1 AND h.`state` = 1 AND h.`huodongtype` =4 ");
        $res = $dsql->dsqlOper($archives, "results");
        $typearr = array();
        $typee = array();
        if (!empty($res)){
            foreach ($res as $kk=>$vv){
                array_push($typee,$vv['type']);
            }
            $untype = array_unique($typee);
            foreach ($untype as $key=>$value){
                $proType= getParentArr("shop_type", (int)$value);
                $typearr[$key]['id']       = $proType[1]['lower'][0]['id'];
                $typearr[$key]['parentid'] = $proType[1]['lower'][0]['parentid'];
                $typearr[$key]['typename'] = $proType[1]['lower'][0]['typename'];
                $typearr[$key]['weight']   = $proType[1]['lower'][0]['weight'];
            }
        }

        $count = array();
        foreach ($typearr as $key => &$_data) {
            $count[$key] = $_data['weight'];
        }
        unset($_data); // 释放引用变量

        // 按数量从多到少排序
        array_multisort($count, SORT_ASC, $typearr);
        
        $huoniaoTag->assign('typearr', $typearr);
    }elseif($action == 'store-express'){
        $detailHandels = new handlers($service, "storeDetail");
        $detailConfig  = $detailHandels->getHandle($id);
        if(is_array($detailConfig) && $detailConfig['state'] == 100){
            $detailConfig  = $detailConfig['info'];
            if(is_array($detailConfig)) {
                //输出详细信息
                foreach ($detailConfig as $key => $value) {
                    $huoniaoTag->assign('detail_' . $key, $value);
                }
            }
        }

    }elseif($action == "bargain_detail"){

        $uid = $userLogin->getMemberID();

        if ($uid == -1) {
            $furl     = urlencode('' . $cfg_secureAccess . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI']);
            header("location:" . $cfg_secureAccess . $cfg_basehost . "/login.html?furl=".$furl);
            die;
        }
        $detailHandels = new handlers($service, "bargaindetail");
        $detailConfig  = $detailHandels->getHandle($id);

        $huoniaoTag->assign('fromShare', $fromShare);

        global $customshopbargainingnomoney; /*未到底价是否可以下单*/

        global $customselfbargain;/*可不可以自己砍*/

        global $custom_shopKanjiaGuize;/*砍价规则*/

        $huoniaoTag->assign('customshopbargainingnomoney', $customshopbargainingnomoney);

        $huoniaoTag->assign('customselfbargain', $customselfbargain);
        $huoniaoTag->assign('custom_shopKanjiaGuize', $custom_shopKanjiaGuize);

        if (is_array($detailConfig) && $detailConfig['state'] == 100) {

            $detailConfig = $detailConfig['info'];

            if (is_array($detailConfig)) {

                //输出详细信息
                foreach ($detailConfig as $key => $value) {

                    $huoniaoTag->assign('detail_' . $key, $value);
                }


            }

        } else {

            header("location:" . $cfg_secureAccess . $cfg_basehost . "/404.html");

        }
        return;
	//购物车 && 确认订单
	}elseif($action == "cart" || $action == "confirm-order") {
        $huoniaoTag->assign('buytype', $buytype);
        $huoniaoTag->assign('pinid', (int)$pinid);
        $huoniaoTag->assign('hid', (int)$hid);
        $huoniaoTag->assign('directbuy', (int)$directbuy);
        $huoniaoTag->assign('confirmtype', (int)$confirmtype);
		$huoniaoTag->assign('frompage', (int)$frompage);
        $huoniaoTag->assign('frompage', (int)$frompage);
        unset($_GET['adsid'],$_GET['addressid']);
        $queryStr = http_build_query($_GET);
        $urlparam = urldecode($queryStr);
        $huoniaoTag->assign('urlParam', $urlparam);

        //代付开关
        include HUONIAOINC . '/config/shop.inc.php';
        $huoniaoTag->assign('peerpayState', $custompeerpay);
        $huoniaoTag->assign('peerpay', (int)$peerpay);
        $huoniaoTag->assign('customhuodongygtime', $customhuodongygtime);

        /*默认地址*/

        $useraddress    = new handlers('member', "address");
        $useraddressarr = $useraddress->getHandle();

        $addridarr = array();

        $addressid = 0;

        $lng = $lat = '';
        if (is_array($useraddressarr) && $useraddressarr['state'] == 100) {

            $useraddressarr = $useraddressarr['info'];
            foreach ($useraddressarr['list'] as $k => $v) {

                if($v['default'] == 1) {
                    $useraddressid = !empty($v['addrids']) ? explode(' ', $v['addrids']) : array ();
                    if ($useraddressid) {
                        array_push($addridarr, (int)$useraddressid[1]);
                    }
                    $addressid = $v['id'];
                    $lng       = $v['lng'];
                    $lat       = $v['lat'];
                    break;

                } else{
                    $useraddressid = !empty($v['addrids']) ? explode(' ', $v['addrids']) : array ();
                    if ($useraddressid) {
                        array_push($addridarr, (int)$useraddressid[1]);
                    }
                    $addressid = $v['id'];
                    $lng       = $v['lng'];
                    $lat       = $v['lat'];
                    break;
                }

            }

        }
        
        
        $userinfo = $userLogin->getMemberInfo();
        
        //会员优惠
        if($userinfo['level']){
            $sql = $dsql->SetQuery("SELECT `privilege` FROM `#@__member_level` WHERE `id` = " . $userinfo['level']);
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret && is_array($ret)) {
                $privilege = unserialize($ret[0]['privilege']);
            }
        }
    
        $adsid = (int)$adsid;
        $adsid = !$adsid ? $addressid : $adsid;
        $huoniaoTag->assign('adsid', (int)$adsid);
        if($adsid){

            $archives = $dsql->SetQuery("SELECT * FROM `#@__member_address` WHERE `uid` = $userid AND `id` = $adsid");
            $userAddr = $dsql->dsqlOper($archives, "results");

            if($userAddr && is_array($userAddr)){
                if(!$userAddr[0]['addrid'] == 0){
                    $addrName = getParentArr("site_area", $userAddr[0]['addrid']);
                    $addrIdArr = array_reverse(parent_foreach($addrName, "id"));

                    $logicityid = $addrIdArr[1];
                }
            }

            $addridarr = array('0'=>$logicityid);

            $huoniaoTag->assign('adsid', (int)$adsid);

            $addressid = $adsid;
            $lng       = $userAddr[0]['lng'];
            $lat       = $userAddr[0]['lat'];
            
            if($lng == '' || $lat == ''){
                echo '<script>alert("收货地址信息需要更新，请修改收货地址的定位后重新提交！"); window.history.go(-1);</script>';
                die;
            }
        }

        /*对于收货地址可用和不可用的*/
        $yesaddarr = $noaddarr =  array();

        if ($buytype == 'bargain') {

            $huoniaoTag->assign('bid', $bid);

            $detailHandels = new handlers($service, "bargainDetail");

            $detailConfig = $detailHandels->getHandle($bid);

            $proquantype = 0;

            if (is_array($detailConfig) && $detailConfig['state'] == 100) {

                $detailConfig = $detailConfig['info'];

                if (is_array($detailConfig)) {

                    $cartList = $auth_priceinfo = array();

                    $price  = $detailConfig['state'] ==2 ? $detailConfig['gmoney'] :$detailConfig['gnowmoney'];
                    $mprice = $price;
                    $count  = 1;
                    $volume = $detailConfig['goodsvolume'];
                    $weight = $detailConfig['goodsweight'];
                    $proid  = $detailConfig['proid'];

                    $proid = $proid . ',,1';

                    $prodetail = $detailConfig['prodetail'];
                    $logistic = (int)$prodetail['logisticId'];

                    $bearFreight          = 0;
                    $valuation            = 0;
                    $express_start        = 0;
                    $express_postage      = 0;
                    $express_plus         = 0;
                    $express_postageplus  = 0;
                    $preferentialStandard = 0;
                    $preferentialMoney    = 0;

                    $archives = $dsql->SetQuery("SELECT * FROM `#@__shop_logistictemplate` WHERE `id` = $logistic");
                    $ret      = $dsql->dsqlOper($archives, "results");

                    $addrid = 0;

                    $devspecification = $deliveryarea = array();
                    if (!empty($ret)) {
                        $devspecification = !empty($ret[0]['devspecification']) ? unserialize($ret[0]['devspecification']) : array();

                        if(empty($devspecification)){

                            $deliveryarea[0]['cityid']              = '';
                            $deliveryarea[0]['express_start']       = $ret[0]['express_start'] ? $ret[0]['express_start'] : 0;
                            $deliveryarea[0]['express_postage']     = $ret[0]['express_postage'];
                            $deliveryarea[0]['express_plus']        = $ret[0]['express_plus'];
                            $deliveryarea[0]['express_postageplus'] = $ret[0]['express_postageplus'];
                            $deliveryarea[0]['area']                = '默认全国';

                            $devspecification['deliveryarea']   = $deliveryarea;
                            $devspecification['valuation']      = $ret[0]['valuation'];
                        }

                        if(array_key_exists('nospecify',$devspecification) && $addridarr && $devspecification['opennospecify'] == 1){

                            $cityid = array_column($devspecification['nospecify'],"cityid");

                            $cityidarr = !empty($cityid) ? join(',',$cityid)  : '' ;


                            $nocityid = $cityidarr!='' ? explode(',',$cityidarr): array();

                            foreach ($addridarr as $a => $b){

                                if(!in_array($b,$nocityid)){

                                    array_push($yesaddarr,$b);

                                }else{
                                    array_push($noaddarr,$b);
                                }
                            }

                        }

                        $addrid = (int)$yesaddarr[0];
//                        if(!$addrid){
//                            echo '<script>alert("没有可配送地址"); window.history.go(-1);</script>';
//                            die;
//                        }
                    }
                    //
//                        $value                = $ret[0];
//                        $bearFreight          = $value["bearFreight"];
//                        $valuation            = $value["valuation"];
//                        $express_start        = $value["express_start"];
//                        $express_postage      = $value["express_postage"];
//                        $express_plus         = $value["express_plus"];
//                        $express_postageplus  = $value["express_postageplus"];
//                        $preferentialStandard = $value["preferentialStandard"];
//                        $preferentialMoney    = $value["preferentialMoney"];
//                    }
//
//                    $arr = array(
//                        'bearFreight'          => $bearFreight,
//                        'valuation'            => $valuation,
//                        'express_start'        => $express_start,
//                        'express_postage'      => $express_postage,
//                        'express_plus'         => $express_plus,
//                        'express_postageplus'  => $express_postageplus,
//                        'preferentialStandard' => $preferentialStandard,
//                        'preferentialMoney'    => $preferentialMoney,
//                    );

                    if ($userinfo['level']) {
                        $value = $privilege['shop'];
                        if ($value > 0 && $value < 10) {
                            // $price = $price * (1 - $value / 10);
                            $price = sprintf("%.2f",$price * ($value / 10));
                            array_push($auth_priceinfo, array(
                                "level"  => $userinfo['level'],
                                "type"   => "auth_shop",
                                "body"   => $userinfo['levelName'] . "特权-商品原价优惠",
                                "amount" => sprintf("%.2f", (($mprice - $price) * 1 ))
                            ));
                        }
                    }

                    $juli =  oldgetDistance($lng,$lat,$prodetail['store']['lng'],$prodetail['store']['lng'])/1000;
                    $logisticArr = getLogisticPrice($devspecification, $price, $count, $volume, $weight,$adsid,$prodetail['id'],$juli,1);
                    
                    $logistic = $logisticArr['logistic'];
                    $logistictype = $logisticArr['logistictype'];
            
                    if($prodetail['protype'] == 1){
                        $logistic = 0;
                    }

                    $data = array(
                        "id"               => $prodetail['id'],
                        "specation"        => $prodetail['specation'],
                        "specificationArr" => $prodetail['specificationArr'],
                        "allSpecification" => $prodetail['allSpecification'],
                        "pinSpecification" => $prodetail['pinSpecification'],
                        "count"            => 1,
                        "title"            => $prodetail['title'],
                        "thumb"            => $prodetail['litpic'],
                        "price"            => $price,
                        "mprice"           => $mprice,
                        "limit"            => $prodetail['limitcount'],
                        "inventor"         => $prodetail['inventor'],
                        "volume"           => $prodetail['volume'],
                        "weight"           => $prodetail['weight'],
                        "logistic"         => $prodetail['logistic'],
                        "logisticTemp"     => $prodetail['logisticTemp'],
                        "logisticNote"     => $prodetail['logisticNote'],
                        "url"              => $prodetail['url'],
                        "speInfo"          => $prodetail['speInfo'],
                        "logisticId"       => $prodetail['logisticId'],
                        "delivery"         => $prodetail['delivery'],
                        "state"            => $prodetail['state'],
                        "protypesales"     => $prodetail['protypesales'],
                        "smallCount"       => $prodetail['smallCount'],
                        "packingCount"     => $prodetail['packingCount'],
                        "shopunit"         => $prodetail['shopunit'],
                        "protype"          => $prodetail['protype'],
                        "is_tuikuan"       => $prodetail['is_tuikuan'],
                        'amount'           => sprintf("%.2f", (($mprice - $price) * 1)),

                    );
                    $i                            = 0;
                    $cartList[$i]['list']         = array($data);
                    $cartList[$i]['sid']          = $prodetail['store']['id'];
                    $cartList[$i]['distribution'] = $prodetail['store']['distribution'];
                    $cartList[$i]['express']      = $prodetail['store']['express'];
                    $cartList[$i]['store']        = $prodetail['store']['title'];
                    $cartList[$i]['domain']       = $prodetail['store']['domain'];
                    $cartList[$i]['qq']           = $prodetail['store']['qq'];
                    $cartList[$i]['address']      = $prodetail['store']['address'];
                    $cartList[$i]['tel']          = $prodetail['store']['tel'];
                    $cartList[$i]['lng']          = $prodetail['store']['lng'];
                    $cartList[$i]['lat']          = $prodetail['store']['lat'];
                    $cartList[$i]['logistic']     = $logistic;
                    $cartList[$i]['logistictype']     = $logistictype;

                    
                    
                    //合并计算运费
                    $orderLogisticArr  = calculationOrderLogistic($cartList,$addridarr,$addressid,array('returnType'=>1));
                    $orderLogistic = $orderLogisticArr['data'];
                    
                    $delivery_count = $userinfo['delivery_count'];
                    $needCount      = 1;
                    if (is_array($orderLogistic)) {
                        foreach ($orderLogistic as $key => $val) {
                            foreach ($cartList as $k => &$v) {
                                if(!$v) continue;
                                if ($v['sid'] == $key) {
        
                                    $val = is_numeric($val) && $val > 0 ? (float)$val : 0;
        
                                    //会员运费
                                    $logistic = $val;
        //                          if ($userinfo['level'] && $detailConfig[0]['states'] == 0) {
                                    if ($userinfo['level']) {
                                        $value = $privilege['delivery'];
        
                                        // if($logistic <= 0){
                                        // 	$needCountm
                                        // }
        
                                        if ($logistic > 0) {
                                            $ok = false;
                                            // 打折
                                            if ($value[0]['type'] == 'discount') {
                                                if ($value[0]['val'] > 0 && $value[0]['val'] < 10) {
                                                    $ok = true;
                                                }
                                                // 计次
                                            } elseif ($value[0]['type'] == 'count') {
                                                if ($value[0]['val'] == 0 || ($value[0]['val'] > 0 && $userinfo['delivery_count'] > 0)) {
                                                    $ok = true;
                                                }
                                            }
        
                                            if ($ok) {
                                                if ($value[0]['type'] == 'count') {
                                                    // $logistic = $val > 3 ? $val- 3 : $val;
                                                    // $needCount = count($cartList);
        
                                                    if ($delivery_count >= $needCount) {
                                                        $logistic = $logistic == 0 ? $logistic : $logistic - $val;
        
                                                        $delivery_count -= 1;
        
                                                    } else {
                                                        $logistic = $delivery_count == 0 ? $logistic : $logistic - $val;
                                                    }
        
                                                } else {
                                                    $logistic = $logistic - ($val * (1 - $value[0]['val'] / 10));
                                                }
        
        //                                        array_push($auth_priceinfo, array(
        //                                        "level"  => $userinfo['level'],
        //                                        "type"   => "auth_peisong",
        //                                        "body"   => $userinfo['levelName'] . "特权-配送费优惠",
        //                                        "amount" => sprintf("%.2f", ($val - $logistic))
        //                                    ));
                                                $v['lobady'] = $userinfo['levelName'] . "特权-配送费优惠";
                                                $v['lotype'] = "auth_peisong";
                                                $v['loamount'] = sprintf("%.2f", ($val - $logistic));;
                                            }
                                        }
        
                                    }
                                    
                                    $pcount = count($v['list']);
                                    // 会员优惠计入每个商品
                                    foreach ($v['list'] as $ke => $ve) {
                                        $av = sprintf("%.2f", $logistic / $pcount);
                                        $v['list'][$ke]['auth_peisong'] = $k + 1 < $pcount ? $av : ($logistic - $av * ($pcount - 1));
                                        if ($confirmtype == 0) {
                                            $logistic = 0;
                                        }
                                    }
                                    $cartList[$k]['logistic_errMsg'] = str_replace('订单金额未达到商家配送要求，', '', $orderLogisticError[$key]);
                                    $cartList[$k]['logistic'] = sprintf("%.2f", $logistic);
                                    $cartList[$k]['mlogistic'] = sprintf("%.2f", $logistic + $v['loamount']);
                                }
        
                            }
        
                        }
                    }
                    
                }
            }
            
        } else {

            if($buytype == 'pintuan'){
                if($pinid){
                    $hidsql = $dsql->SetQuery("SELECT `hid` FROM `#@__shop_tuanpin` WHERE `id` = '$pinid' AND `state` = 1");

                    $hidres = $dsql->dsqlOper($hidsql,"results");

                    if($hidres){

                        $huoniaoTag->assign('hid', (int)$hidres[0]['hid']);
                    }else{

                        header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
                    }
                }

            }
            $detailHandels = new handlers($service, "getCartList");
            $pros         = $_GET['pros'] ? $_GET['pros'] : $_POST['pros'];

            if($ordertype =='zjpay'){
                $huoniaoTag->assign('buytype', '');
            }
            $d            = $action == "confirm-order" ? $pros : "";  //区分购物车或确认下单页面


            if(!empty($d)){

                $pros = array();
                foreach ($d as $c=>$b){
                    $pros[$c] = $b;
                }
                /*切换地址需要用到商品信息*/
//                $huoniaoTag->assign('logitcpros', $d[0]);
                $huoniaoTag->assign('logitcpros', $pros);
            }

            if($action == "confirm-order" && $ordertype!=''){
                $d['ordertype'] = $ordertype;
                $d['addressid'] = $addressid;

            }

            /*传入地址id计算距离给配送模板使用*/

            if ($action == "confirm-order" && $addressid) {
                $d['addressid'] = $addressid;
            }

            $detailConfig = $detailHandels->getHandle($d);
            $cartList = $auth_priceinfo = array();
            $daodiancount = $daojiacount = 0;
            
            if (is_array($detailConfig) && $detailConfig['state'] == 100) {
                $detailConfig = $detailConfig['info'];
                if (is_array($detailConfig)) {

                    $i        = 0;
                    $delivery = true;
                    $proquantype = $procountnum = 0;
                    foreach ($detailConfig as $k => $v) {

                        //是否已经存在
                        $h = 0;
                        foreach ($cartList as $key => $value) {
                            if ($value['sid'] == $v['store']['id']) {
                                $h = 1;
                            }
                        }
                        $price = $v['price'];
                        
                        //会员价格
//                      if ($userinfo['level'] && $detailConfig[0]['states'] == 0) {
                        if ($userinfo['level'] && ($buytype == '' && ($v['states'] == 0 || $v['states'] == 3 || $v['states'] == 4)) && $v['states'] !=1 && $v['states'] != 2) {
                            $value = $privilege['shop'];
                            if ($value > 0 && $value < 10) {
                                // $price = $price * (1 - $value / 10);
                                $price = sprintf("%.2f",$price * ($value / 10));
                                array_push($auth_priceinfo, array(
                                    "level"  => $userinfo['level'],
                                    "type"   => "auth_shop",
                                    "body"   => $userinfo['levelName'] . "特权-商品原价优惠",
                                    "amount" => sprintf("%.2f", (($v['price'] - $price) * $v['count'] ))
                                ));
                            }
                        }
                        $archives = $dsql->SetQuery("SELECT * FROM `#@__shop_logistictemplate` WHERE `id` = ".(int)$v['logisticId']);
                        $ret      = $dsql->dsqlOper($archives, "results");

                        $addrid = 0;

                        $devspecification = $deliveryarea = array();
                        if ($ret) {
                            $devspecification = !empty($ret[0]['devspecification']) ? unserialize($ret[0]['devspecification']) : array();

                            if(empty($devspecification) && $ret){

                                $deliveryarea[0]['cityid']              = '';
                                $deliveryarea[0]['express_start']       = $ret[0]['express_start'];
                                $deliveryarea[0]['express_postage']     = $ret[0]['express_postage'];
                                $deliveryarea[0]['express_plus']        = $ret[0]['express_plus'];
                                $deliveryarea[0]['express_postageplus'] = $ret[0]['express_postageplus'];
                                $deliveryarea[0]['area']                = '默认全国';

                                $devspecification['deliveryarea']   = $deliveryarea;
                                $devspecification['valuation']      = $ret[0]['valuation'];
                            }

                            if(array_key_exists('nospecify',$devspecification) && $addridarr && $devspecification['opennospecify'] == 1){

                                $cityid = array_column($devspecification['nospecify'],"cityid");

                                $cityidarr = !empty($cityid) ? join(',',$cityid)  : '' ;


                                $nocityid = $cityidarr!='' ? explode(',',$cityidarr): array();

                                foreach ($addridarr as $a => $b){

                                    if(!in_array($b,$nocityid)){

                                        array_push($yesaddarr,$b);

                                    }else{
                                        array_push($noaddarr,$b);
                                    }
                                }

                            }

//                        if(!$addrid){
//                            echo '<script>alert("没有可配送地址"); window.history.go(-1);</script>';
//                            die;
//                        }
                        }

//                        if($v['protype'] == 1){
//                            $proquantype += 1;
//                        }
//                        $procountnum +=1;

                        $data = array(
                            "id"               => $v['id'],
                            "proid"            => $v['id'],
                            "specation"        => $v['specation'],
                            "specificationArr" => $v['specificationArr'],
                            "allSpecification" => $v['allSpecification'],
                            "pinSpecification" => $v['pinSpecification'],
                            "count"            => $count ? $count : $v['count'],
                            "title"            => $v['title'],
                            "thumb"            => $v['thumb'],
                            "price"            => $price,
                            "mprice"            => $v['price'],
                            "limit"            => $v['limitcount'],
                            "inventor"         => $v['inventor'],
                            "volume"           => $v['volume'],
                            "weight"           => $v['weight'],
                            "logistic"         => $v['logistic'],
                            "logistictype"     => $v['logistictype'],
                            "logisticTemp"     => $v['logisticTemp'],
                            "logisticNote"     => $v['logisticNote'],
                            "url"              => $v['url'],
                            "speInfo"          => $v['speInfo'],
                            "logisticId"       => $v['logisticId'],
                            "delivery"         => $v['delivery'],
                            "state"            => (int)$v['state'],
                            "protypesales"     => (int)$v['protypesales'],
                            "ygstates"         => $v['ygstates'],
                            "huodongstates"    => $v['huodongstates'],
                            "huodongprice"     => $v['huodongprice'],
                            "ktime"            => $v['ktime'],
                            "smallCount"       => $v['smallCount'],
                            "packingCount"     => $v['packingCount'],
                            "shopunit"         => $v['shopunit'],
                            "etime"            => $v['etime'],
                            "protype"          => $v['protype'],
                            'amount'           => sprintf("%.2f", (($v['price'] - $price) * $v['count'])),
                            'body'             => $userinfo['levelName'] . "特权-商品原价优惠",
                            'type'             =>"auth_shop",
                            'typesales'        => $v['typesales'] ? $v['typesales'] : 4,
                            'typesalesarr'     => $v['typesalesarr'] ? $v['typesalesarr'] : array("0"=>4),
                            'is_tuikuan'       => $v['is_tuikuan'],
                            'blogisticId'      => $v['blogisticId']
                        );
                        //如果不存在则新建一级
                        if (!$h) {
                            if ($v['store']) {
                                $cartList[$i]['sid']          = $v['store']['id'];
                                $cartList[$i]['distribution'] = $v['store']['distribution'];
                                $cartList[$i]['express']      = $v['store']['express'];
                                $cartList[$i]['store']        = $v['store']['title'];
                                $cartList[$i]['userstore']    = $v['store']['userid'];
                                $cartList[$i]['domain']       = $v['store']['domain'];
                                $cartList[$i]['qq']           = $v['store']['qq'];
                                $cartList[$i]['address']      = $v['store']['address'];
                                $cartList[$i]['lng']          = $v['store']['lng'];
                                $cartList[$i]['lat']          = $v['store']['lat'];
                                $cartList[$i]['tel']          = $v['store']['tel'];
                                $cartList[$i]['daodiancount'] = 0;
                                $cartList[$i]['daojiacount']  = 0;

                                $cartList[$i]['logistic']     = 0;
                                $cartList[$i]['logistic_errMsg']     = $v['logistic_errMsg'];

//                                if (!$v['store']['delivery']) {
//                                    $delivery = false;
//                                }
                                if ($v['store']['delivery'] !=1) {
                                    $delivery = false;
                                }

                            } else {
                                $cartList[$i]['sid']   = 0;
                                $cartList[$i]['store'] = $langData['shop'][4][37];  //官方直营
                            }
                            $cartList[$i]['list'] = array($data);

                            $i++;
                        } else {

                            //如果已存在则push
                            foreach ($cartList as $key => $value) {
                                if ($value['sid'] == $v['store']['id']) {
                                    array_push($cartList[$key]['list'], $data);
                                }
                            }

                        }

                    }

                    if($proquantype!=0 && $procountnum != $proquantype && $action == 'confirm-order'){

                        echo '<script>alert("订单中含有多种类型商品下单失败"); window.history.go(-1);</script>';
                        die;
                    }
                }
            }

            /*查询可用优惠券*/

            $nowtime = time();
            foreach ($cartList as $a => $b) {
                    $foodquanarr   = array();

                    /*不可用*/
                $noquansql = $dsql->SetQuery("SELECT `id`,`name`,`basic_price`,`promotiotype`,`quantype`,`etime`,`promotio`,`bear`,`qid`,'1' nousetype FROM `#@__shop_quanlist` WHERE `userid`  ='$userid' AND (`ktime` > '$nowtime' or `etime` < '$nowtime'  AND (`shopids` ='".$b['sid']."' OR `bear` !=1))");

                    $noquanres = $dsql->dsqlOper($noquansql,"results");

                    if(!empty($noquanres)){
                        $cartList[$a]['noquanarr'] = $noquanres;

                    }else{

                        $cartList[$a]['noquanarr'] = array();
                    }

                    $storeorderamount = array_sum(array_map(function ($product){

                        return sprintf('%.2f',$product['price']) * $product['count'];

                    },$b['list']));

                    /*店铺券*/
                    $storesql = $dsql->SetQuery("SELECT `id`,`name`,`basic_price`,`promotiotype`,`promotio`,`qid`,`quantype`,`etime`,`bear` FROM `#@__shop_quanlist` WHERE `state` = 0 AND `quantype` = 0 AND `userid`  ='$userid'  AND (`shopids` = '".$b['sid']."' or `bear` = 1)AND `ktime`<= '$nowtime' AND `etime`>= '$nowtime' AND `basic_price` <= '$storeorderamount'");
                    $storeres = $dsql->dsqlOper($storesql,"results");

                    if(!empty($storeres)){
                        $cartList[$a]['quanarr'] = $storeres;

                    }else{

                        $cartList[$a]['quanarr'] = array();
                    }

                    /*商品券*/

                    foreach ($b['list'] as $food => $fdv){

                        $foodsql = $dsql->SetQuery("SELECT `id`,`name`,`basic_price`,`promotiotype`,`promotio`,`qid`,`quantype`,`etime` FROM `#@__shop_quanlist` WHERE `state` = 0 AND `quantype` = 1 AND `userid`  ='$userid' AND FIND_IN_SET('".$fdv['id']."',`fid`)  AND `ktime`<= '$nowtime' AND `etime`>= '$nowtime'");
                        $foodres =  $dsql->dsqlOper($foodsql,"results");
                        $quanid = array();

                        $needmoney = 0;
                        if($foodres){
                            $needmoney += ($fdv['price'] * $fdv['count']);
                            if(!empty($foodquanarr)){

                                $quanid = array_column($foodquanarr,'id');
                            }
                            if(!in_array( $foodres[0]['id'],$quanid)){
                                $foodres[0]['needmoney'] = $needmoney;
                                array_push($foodquanarr,$foodres[0]);
                            }else{
                                $quankey = array_search($fdv['id'],$quanid);
                                $foodquanarr[$quankey]['needmoney']+=$needmoney;
                            }
                        }

                    }

                    foreach ($foodquanarr as $food => $foodv){
                        if($foodv['needmoney'] >= $foodv['basic_price'] ){

                            array_push($cartList[$a]['quanarr'],$foodv);

                        }else{
                            $foodv['nousetype'] = 2;
                            array_push($cartList[$a]['noquanarr'],$foodv);
                        }
                    }


    //                /*商品券可用*/
    //
    //                $keyongquanarr = !empty($foodquanarr) ? array_column($foodquanarr,"id")  : array();
    //
    //                foreach (){
    //
    //                }
                }
            //合并计算运费
            $orderLogisticArr  = calculationOrderLogistic($cartList,$addridarr,$addressid,array('returnType'=>1));
            $orderLogistic = $orderLogisticArr['data'];
            //覆盖错误信息列表，这里不需要显示，不注释掉会出现cartList结构错误（cartList[商家ID] => 错误信息）
            $orderLogisticError = $orderLogisticArr['error'];
            // foreach ($orderLogisticError as $errKey=>$errValue){
            //     if($errValue){
            //         $cartList[$errKey]['logistic_errMsg'] = $errValue;
            //     }
            // }
//            if($proquantype == $procountnum){
//
//                $orderLogistic = array('0'=>0);
//            }
            $delivery_count = $userinfo['delivery_count'];
            $needCount      = 1;
            if (is_array($orderLogistic)) {
                foreach ($orderLogistic as $key => $val) {
                    foreach ($cartList as $k => &$v) {
                        if(!$v) continue;
                        if ($v['sid'] == $key) {

                            $val = is_numeric($val) && $val > 0 ? (float)$val : 0;

                            //会员运费
                            $logistic = $val;
//                            if ($userinfo['level'] && $detailConfig[0]['states'] == 0) {
                            if ($userinfo['level']) {
                                $value = $privilege['delivery'];

                                // if($logistic <= 0){
                                // 	$needCountm
                                // }

                                if ($logistic > 0) {
                                    $ok = false;
                                    // 打折
                                    if ($value[0]['type'] == 'discount') {
                                        if ($value[0]['val'] > 0 && $value[0]['val'] < 10) {
                                            $ok = true;
                                        }
                                        // 计次
                                    } elseif ($value[0]['type'] == 'count') {
                                        if ($value[0]['val'] == 0 || ($value[0]['val'] > 0 && $userinfo['delivery_count'] > 0)) {
                                            $ok = true;
                                        }
                                    }

                                    if ($ok) {
                                        if ($value[0]['type'] == 'count') {
                                            // $logistic = $val > 3 ? $val- 3 : $val;
                                            // $needCount = count($cartList);

                                            if ($delivery_count >= $needCount) {
                                                $logistic = $logistic == 0 ? $logistic : $logistic - $val;

                                                $delivery_count -= 1;

                                            } else {
                                                $logistic = $delivery_count == 0 ? $logistic : $logistic - $val;
                                            }

                                        } else {
                                            $logistic = $logistic - ($val * (1 - $value[0]['val'] / 10));
                                        }

//                                        array_push($auth_priceinfo, array(
//                                        "level"  => $userinfo['level'],
//                                        "type"   => "auth_peisong",
//                                        "body"   => $userinfo['levelName'] . "特权-配送费优惠",
//                                        "amount" => sprintf("%.2f", ($val - $logistic))
//                                    ));
                                        $v['lobady'] = $userinfo['levelName'] . "特权-配送费优惠";
                                        $v['lotype'] = "auth_peisong";
                                        $v['loamount'] = sprintf("%.2f", ($val - $logistic));;
                                    }
                                }

                            }
                            $pcount = count($v['list']);
                            // 会员优惠计入每个商品
                            foreach ($v['list'] as $ke => $ve) {
                                $av = sprintf("%.2f", $logistic / $pcount);
                                $v['list'][$ke]['auth_peisong'] = $k + 1 < $pcount ? $av : ($logistic - $av * ($pcount - 1));
                                if ($confirmtype == 0) {
                                    $logistic = 0;
                                }
                            }
                            $cartList[$k]['logistic_errMsg'] = str_replace('订单金额未达到商家配送要求，', '', $orderLogisticError[$key]);
                            $cartList[$k]['logistic'] = sprintf("%.2f", $logistic);
                            $cartList[$k]['mlogistic'] = sprintf("%.2f", $logistic + $v['loamount']);
                        }

                    }

                }
            }
        }




        $countstore = $cartList ? array_unique(array_column($cartList,'sid')) :  array();

        //计算积分
        global $cfg_pointRatio;
        $logic = 0;
        $price = 0;

        $pointprice = 0;
        $alldaodiancount = $alldaojiacount = 0;
        if($cartList){
            foreach ($cartList as $kk=>&$vvv) {
                if(!$vvv) continue;
                $daodiancount = $daojiacount = 0;
                foreach ($vvv['list'] as $k=>$vv){
                    $pointprice += $vv['price'] * $vv['count'] + $vv['auth_peisong'];   //计算抵扣积分\
                    $price += $vv['price'] * $vv['count'];
                    if ($vv['typesalesarr']){
                        /*1到店消费 ,快递*/
                        if (in_array('1',$vv['typesalesarr'])) {

                            $daodiancount += 1;
                        }
                        if (in_array('4',$vv['typesalesarr']) || in_array('3',$vv['typesalesarr']) || in_array('2',$vv['typesalesarr']) ) {
                            $daojiacount  += 1;
                        }
                    }

                }
                $alldaodiancount += $daodiancount;
                $alldaojiacount  += $daojiacount;
                $vvv['daodiancount'] = $daodiancount;
                $vvv['daojiacount']  = $daojiacount;
            }
        }
        $pointprice = sprintf("%.2f",$price + $logic);
        $userinfo  = $userLogin->getMemberInfo();
        $userpoint = $userinfo['point'];
        $point_price = getJifen('shop', $pointprice);   //能抵扣多少钱
        $pricepoint  = $point_price * $cfg_pointRatio;      // 能转换多少积分
        if ($pricepoint >=  $userpoint) {
            $pricepoint = $userpoint;
        }
        $huoniaoTag->assign('countstore', count($countstore));
        $huoniaoTag->assign('alldaodiancount', $alldaodiancount);
        $huoniaoTag->assign('alldaojiacount', $alldaojiacount);
        $huoniaoTag->assign('cartList', $cartList);
        $huoniaoTag->assign('cartListjson', json_encode($cartList));
        $huoniaoTag->assign('huodongtype', $detailConfig[0]['states'] );
        $huoniaoTag->assign('logistic', $logistic);
        $huoniaoTag->assign('pricepoint', $pricepoint);
        $huoniaoTag->assign('privilege', $privilege);
        $huoniaoTag->assign('userinfo', $userinfo);
        $huoniaoTag->assign('delivery', $delivery);
        $huoniaoTag->assign('priceinfo', $auth_priceinfo);
        $huoniaoTag->assign('yesaddarr', $yesaddarr);
        $huoniaoTag->assign('noaddarr', $noaddarr);
        $huoniaoTag->assign('huodongstates', $detailConfig[0]['states']);

        // 会员特权
        $privilege = [];
        $today_amount = 0;
        $day = date('md');
        $userinfo = $userLogin->getMemberInfo();

        if($userinfo['level']){
            $sql = $dsql->SetQuery("SELECT * FROM `#@__member_level` WHERE `id` = ".$userinfo['level']);
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $privilege         = unserialize($ret[0]['privilege']);
                // if($privilege){
                // 	// foreach ($privilege as $key => $value) {}

                // 	// 生日当天享受折扣需要判断当天订单总金额
                // 	if(!empty($userinfo['birthday']) && $day == date("md", $userinfo['birthday']) && $privilege['birthday']['type'] && $privilege['birthday']['val']['discount'] > 0 && $privilege['birthday']['val']['discount'] < 10 && $privilege['birthday']['val']['limit']){
                // 		$today_amount = todayOrderAmount($userid);
                // 	}
                // }
            }
        }
        $huoniaoTag->assign('privilege', $privilege);

        //确认订单页面输出要下单的商品信息
        if ($action == "confirm-order") {

            if ($userid == -1) {
                header("location:" . $cfg_secureAccess . $cfg_basehost . "/login.html");
                die;
            }
            if ($buytype == 'bargain') {
                $pros[0] = $proid;
            }
            $ordertype = $pros['ordertype'] ? $pros['ordertype'] : $ordertype;

            if($ordertype!=''){
                unset($pros['ordertype']);
            }
            $huoniaoTag->assign('ordertype', $ordertype);
            $huoniaoTag->assign('confirmtype', (int)$confirmtype);
            $huoniaoTag->assign('frompage', (int)$frompage);
            $huoniaoTag->assign('pros', $pros ? join("|", $pros) : '');
            $huoniaoTag->assign('_token_', $pros ? join("|", $pros) : '');

        }
        return;

    }elseif($action == "dindan"){
        $archives = $dsql->SetQuery("SELECT `id`,`oid`,`proid`,`userid`,`pubdate`,`state`,`people`,`enddate`,`okdate`,`user` FROM `#@__shop_tuanpin`  WHERE `id` = '$id'");
        $results  = $dsql->dsqlOper($archives, "results");
        if ($results){
            $orderid = $results[0]['oid'];
            $param = array(
                "service"  => "member",
                "type"     => "user",
                "template" => "orderdetail",
                "module"   => "shop",
                "id"       => $orderid
            );
            $huoniaoTag->assign('orderUrl', getUrlPath($param));
        }



        $detailHandels = new handlers($service, "pinGroup");
        $detailConfig  = $detailHandels->getHandle($id);
        if(is_array($detailConfig) && $detailConfig['state'] == 100){
            $detailConfig  = $detailConfig['info'];
            if(is_array($detailConfig)){
                foreach ($detailConfig as $key => $value) {
                    $huoniaoTag->assign('detail_'.$key, $value);
                }
            }
        }else{
            header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
        }
        return;
	//支付页面
	}elseif($action == "pay"){

		global $userLogin;
		$userid = $userLogin->getMemberID();

        if($userid == -1 && !$peerpay){
			header('location:'.$cfg_secureAccess.$cfg_basehost.'/login.html?furl='.$furl);
			die;
		}

        //代付开关
        include HUONIAOINC . '/config/shop.inc.php';
        $huoniaoTag->assign('peerpayState', $custompeerpay);
        $huoniaoTag->assign('peerpay', (int)$peerpay);

		$RenrenCrypt = new RenrenCrypt();
        $ordernums = $RenrenCrypt->php_decrypt(base64_decode($ordernum));

        $userinfo = $userLogin->getMemberInfo();
		$cartList = $auth_priceinfo = array();

		//会员优惠
		$sql = $dsql->SetQuery("SELECT `privilege` FROM `#@__member_level` WHERE `id` = ".$userinfo['level']);
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret && is_array($ret)){
            $privilege = unserialize($ret[0]['privilege']);
        }
		if($ordernums){

			$sql = $dsql->SetQuery("SELECT * FROM `#@__shop_order` WHERE `ordernum` IN ('$ordernums')");
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){

				$huoniaoTag->assign('ordernum', $ordernums);
                $order = $ret[0];
                // $huoniaoTag->assign('logistic', $order['logistic']);

				$delivery = false;  //是否支持货到付款

                if($order['orderstate'] == 0){

					//店铺信息
					$store = array(
						"sid" => 0,
						"store" => $langData['shop'][4][37]  //官方直营
					);
					if($order['store'] != 0){
						$storeHandels = new handlers($service, "storeDetail");
						$storeConfig  = $storeHandels->getHandle($order['store']);
						if(is_array($storeConfig) && $storeConfig['state'] == 100){
							$storeConfig  = $storeConfig['info'];
							if(is_array($storeConfig)){
								$store = array(
									"sid" => $order['store'],
									"store" => $storeConfig['title'],
									"domain" => $storeConfig['domain'],
									"qq" => $storeConfig['qq'],
									"address" => $storeConfig['address'],
									"tel" => $storeConfig['tel'],
									"distribution" => $storeConfig['distribution'],
									"express" => $storeConfig['express']
								);

								if($storeConfig['delivery']){
									$delivery = true;
								}
							}
						}
					}
					$huoniaoTag->assign('store', $store);

					$huoniaoTag->assign('people', $order['people']);
					$huoniaoTag->assign('huodongtype', $order['huodongtype']);
					$huoniaoTag->assign('address', $order['address']);
					$huoniaoTag->assign('contact', $order['contact']);
					$huoniaoTag->assign('note', $order['note']);
					$huoniaoTag->assign('branchid', $order['branchid']);
					$huoniaoTag->assign('shipping', $order['shipping']);

					$list = array();
					$sql = $dsql->SetQuery("SELECT * FROM `#@__shop_order_product` WHERE `orderid` = ".$order['id']);
					$res = $dsql->dsqlOper($sql, "results");
					if($res){

						$p = 0;
						foreach ($res as $key => $value) {

							$detailHandels = new handlers($service, "detail");
							$detailConfig  = $detailHandels->getHandle($value['proid']);
							if(is_array($detailConfig) && $detailConfig['state'] == 100){
								$detailConfig  = $detailConfig['info'];
								if(is_array($detailConfig)){

									$list[$p]['id']        = $value['proid'];
									$list[$p]['specation'] = $value['specation'];

									$price = $value['price'];
//									if($userinfo['level']){
//										$_val = $privilege['shop'];
//					                    if($_val > 0 && $_val < 10){
//					                        $price = $price *  ($_val / 10);
//					                    }
//									}

                                    $price_ = $price;
                                    if($order['huodongtype'] !=0){
                                        $price_ = $detailConfig['huodongprice'];
                                    }


									$list[$p]['price']     = $price;
									$list[$p]['price_']    = $price_;
									$list[$p]['count']     = $value['count'];
									$list[$p]['logistic']  = $value['logistic'];
									$list[$p]['discount']  = $value['discount'];
									$list[$p]['title']     = $detailConfig['title'];
									$list[$p]['thumb']     = $detailConfig['litpic'];
									$list[$p]['url']       = $detailConfig['url'];
									$list[$p]['delivery']       = $detailConfig['delivery'];

									$p++;
								}
							}else{
								header('location:'.$cfg_secureAccess.$cfg_basehost.'/404.html');
								die;
							}

						}

					}else{
						header('location:'.$cfg_secureAccess.$cfg_basehost.'/404.html');
						die;
					}


					$totalAmount = $order['logistic'];
					foreach ($list as $key => $value) {
						$totalAmount += $value['price'] * $value['count'];
					}
					// 减去会员优惠
					$priceinfo = $order['priceinfo'];
					if($priceinfo){
						$priceinfo = unserialize($priceinfo);
						$huoniaoTag->assign('priceinfo', $priceinfo);
						foreach ($priceinfo as $key => $value) {
							$totalAmount -= $value['amount'];
						}
					}

                    //积分抵扣
                    global $cfg_pointRatio;
                    if ($order['point']){
                        $pointMoney   = $order['point'] / $cfg_pointRatio;              //积分转化人民币
                        $totalAmount -= $pointMoney;
                    }

                	//会员运费
					$userinfo['delivery_count'] = $userinfo['delivery_count'] < 0 ? 0 : $userinfo['delivery_count'];
					$delivery_count = $userinfo['delivery_count'];
					$needCount = 1;
                	$logistic = $order['logistic'];
                	if($userinfo['level']){
		                $value = $privilege['delivery'];

		                if($logistic > 0){
		                    $ok = false;
		                    // 打折
		                    if($value[0]['type'] == 'discount'){
		                        if($value[0]['val'] > 0 && $value[0]['val'] < 10){
		                            $ok = true;
		                        }
		                    // 计次
		                    }elseif($value[0]['type'] == 'count'){
		                        if($value[0]['val'] == 0 || ($value[0]['val'] > 0 && $userinfo['delivery_count'] > 0)){
		                            $ok = true;
		                        }
		                    }

		                    if($ok){
		                        if($value[0]['type'] == 'count'){

			                        if($delivery_count >= $needCount){
										$logistic =  $logistic == 0 ? $logistic : $logistic-$order['logistic'];

										$delivery_count-=1;

									}else{
										$logistic =  $logistic == 0 ? $logistic : $logistic-$order['logistic'];
									}

		                        }else{
		                            $logistic = $logistic-($order['logistic'] * (1 - $value[0]['val'] / 10));
		                        }
		                    }
		                }
                	}
//                	var_dump(number_format($totalAmount,2,'.',''));
                    $totalAmount = number_format($totalAmount,2,'.','');
					$huoniaoTag->assign('totalAmount', $totalAmount);
					$huoniaoTag->assign('product', $list);
					$huoniaoTag->assign('delivery', $delivery);
					$huoniaoTag->assign('logistic', $order['logistic']);

				//付过款的直接跳转到订单详情页
				}else{

					$param = array(
						"service"  => "member",
						"type"     => "user",
						"template" => "orderdetail",
						"module"   => "shop",
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




	//支付结果页面
	}elseif($action == "payreturn"){

		global $userLogin;
		$userid = $userLogin->getMemberID();

		if($userid == -1){
			header('location:'.$cfg_secureAccess.$cfg_basehost.'/login.html?furl='.$furl);
			die;
		}

		if(!empty($ordernum)){




			//根据支付订单号查询支付结果
			$archives = $dsql->SetQuery("SELECT `body`, `amount`, `state` FROM `#@__pay_log` WHERE `ordertype` = 'shop' AND `ordernum` = '$ordernum'");
			$payDetail  = $dsql->dsqlOper($archives, "results");
			if($payDetail){

				$state = $payDetail[0]['state'];

				if($state == 1){
					$orderListArr = array();
					$totalAmount = 0;
					$totalPoint = 0;
					$totalBalance = 0;
					$totalPayPrice = 0;
					$i = 0;
					$ids = explode(",", $payDetail[0]['body']);
					//查询订单号
                    if (count($ids) == 1){
                        //查询订单详细信息
                        $archives = $dsql->SetQuery("SELECT `id`, `store`, `address`, `people`, `contact`, `note`, `logistic`, `amount`,`balance`,`point`,`payprice`,`paytype`,`userid`,`peerpay` FROM `#@__shop_order` WHERE `ordernum` = '$ids[0]' AND (`userid` = $userid or `peerpay` = $userid)");
                        $detailOrder  = $dsql->dsqlOper($archives, "results");
                        if ($detailOrder){
                            $param = array(
                                "service"  => "member",
                                "type"     => "user",
                                "template" => "orderdetail",
                                "module"   => "shop",
                                "id"       => $detailOrder[0]['id']
                            );
                            $huoniaoTag->assign('orderUrl', getUrlPath($param));

                            $isPeerpay = 0;  //是否代付
                            if((int)$detailOrder[0]['peerpay'] == $userid){
                                $isPeerpay = 1;
                            }
                            $huoniaoTag->assign('isPeerpay', $isPeerpay);

                        }else{
                            header("location:".$cfg_secureAccess.$cfg_basehost);
                            die;
                        }
                    }else{
                        $paramorder = array(
                            "service"  => "member",
                            "type"     => "user",
                            "template" => "order",
                            "module"   => "shop"
                        );
                        $huoniaoTag->assign('orderUrl', getUrlPath($paramorder));
                    }
					if($detailOrder[0]['balance']){
							$totalPrice = $detailOrder[0]['balance'];
					}
					if($detailOrder[0]['payprice'] !='0'){
						$totalPrice = $detailOrder[0]['payprice'];
					}
					//查询订单详细信息
				    $archives = $dsql->SetQuery("SELECT `wechat_subscribe` FROM `#@__member` WHERE `id` =".$detailOrder[0]['userid']);
					$meminfo  = $dsql->dsqlOper($archives, "results");
					$wechat_subscribe = $meminfo[0]['wechat_subscribe'];			//	是否关注公众号
					$pay_namearr = array();
					if ($detailOrder[0]['balance'] != '') {
						array_push($pay_namearr, "余额支付");
					}

					if ($detailOrder[0]['point'] != '') {
						array_push($pay_namearr, "积分支付");
					}
					if ($detailOrder[0]['paytype']  == 'wxpay') {
						array_push($pay_namearr, "微信支付");
					}
					if ($detailOrder[0]['paytype'] == 'alipay') {
						array_push($pay_namearr, "支付宝支付");
					}


					if ($pay_namearr) {
						$pay_name = join(',', $pay_namearr);
					}

					foreach ($ids as $key => $value) {

						//查询订单详细信息
						$archives = $dsql->SetQuery("SELECT `id`, `store`, `address`, `people`, `contact`, `note`, `logistic`, `amount` FROM `#@__shop_order` WHERE `ordernum` = '$value' AND `userid` = $userid");
						$orderDetail  = $dsql->dsqlOper($archives, "results");
						if($orderDetail){
							$orderDetail = $orderDetail[0];

                            $totalPayPrice += $orderDetail['amount'];

							//查询订单商品
							$sql = $dsql->SetQuery("SELECT `proid`, `specation`, `price`, `count`, `logistic`, `discount`, `point`, `balance`, `payprice` FROM `#@__shop_order_product` WHERE `orderid` = ".$orderDetail['id']);
							$ret = $dsql->dsqlOper($sql, "results");
							if($ret){

								$orderListArr[$i]['orderid']  = $orderDetail['id'];
								$orderListArr[$i]['ordernum'] = $value;

								//店铺信息
								$storeHandels = new handlers($service, "storeDetail");
								$storeConfig  = $storeHandels->getHandle($orderDetail['store']);
								if(is_array($storeConfig) && $storeConfig['state'] == 100){
									$storeConfig  = $storeConfig['info'];
									if(is_array($storeConfig)){

										$orderListArr[$i]['store'] = array(
											"id"     => $storeConfig['id'],
											"title"  => $storeConfig['title'],
											"domain" => $storeConfig['domain'],
											"qq"     => $storeConfig['qq']
										);

									}else{
										$orderListArr[$i]['store'] = array(
											"id"     => 0,
											"title"  => $langData['shop'][4][37]  //官方直营
										);
									}
								}else{
									$orderListArr[$i]['store'] = array(
										"id"     => 0,
										"title"  => $langData['shop'][4][37]  //官方直营
									);
								}


								//订单配送信息
								$orderListArr[$i]['address'] = $orderDetail['address'];
								$orderListArr[$i]['people']  = $orderDetail['people'];
								$orderListArr[$i]['contact'] = $orderDetail['contact'];
								$orderListArr[$i]['note']    = $orderDetail['note'];
								$orderListArr[$i]['logistic']    = $orderDetail['logistic'];

								$proDetail = array();
								$p = 0;
								foreach($ret as $k => $v){

									//查询商品详细信息
									$detailHandels = new handlers($service, "detail");
									$detailConfig  = $detailHandels->getHandle($v['proid']);
									if(is_array($detailConfig) && $detailConfig['state'] == 100){
										$detailConfig  = $detailConfig['info'];
										if(is_array($detailConfig)){

											$proDetail[$p]['id']        = $detailConfig['id'];
											$proDetail[$p]['title']     = $detailConfig['title'];
											$proDetail[$p]['litpic']    = $detailConfig['litpic'];
											$proDetail[$p]['specation'] = $v['specation'];
											$proDetail[$p]['price']     = $v['price'];
											$proDetail[$p]['count']     = $v['count'];
											$proDetail[$p]['logistic']  = $v['logistic'];
											$proDetail[$p]['discount']  = $v['discount'];
											$proDetail[$p]['point']     = $v['point'];
											$proDetail[$p]['balance']   = $v['balance'];
											$proDetail[$p]['payprice']  = $v['payprice'];
											$p++;

											//单价 * 数量 + 运费 + 折扣
											$totalAmount += $v['price'] * $v['count'] + $v['logistic'] + $v['discount'];

											$totalPoint    += $v['point'];
											$totalBalance  += $v['balance'];
//											$totalPayPrice += $v['payprice'];

										}
									}
								}

								$orderListArr[$i]['product'] = $proDetail;
								$i++;

							}

						}
					}
					
					$huoniaoTag->assign('payname', $pay_name);
					$huoniaoTag->assign('totalPrice', $totalPrice);
					$huoniaoTag->assign('wechat_subscribe', $wechat_subscribe);
					$huoniaoTag->assign('orderListArr', $orderListArr);
					$huoniaoTag->assign('totalPoint', $totalPoint);
					$huoniaoTag->assign('totalBalance', sprintf("%.2f", $totalBalance));
					$huoniaoTag->assign('totalPayPrice', sprintf("%.2f", $totalPayPrice));
				}

				$huoniaoTag->assign('state', $state);


			//支付订单不存在
			}else{
				header("location:".$cfg_secureAccess.$cfg_basehost);
				die;
			}

		}else{
			header("location:".$cfg_secureAccess.$cfg_basehost);
			die;
		}


	//商城资讯列表
	}elseif($action == "news"){

		//分类
		$pid = $tid = $child = 0;
		$pname = $tname = "";
		$typeid = (int)$typeid;
		if($typeid){
			$sql = $dsql->SetQuery("SELECT `parentid`, `typename` FROM `#@__shop_news_type` WHERE `id` = $typeid");
			$res = $dsql->dsqlOper($sql, "results");
			if($res){
				//如果pid为0，代表当前ID就是一级
				if($res[0]['parentid'] == 0){
					$pid = $typeid;
					$pname = $res[0]['typename'];

					$sql = $dsql->SetQuery("SELECT `id` FROM `#@__shop_news_type` WHERE `parentid` = ".$pid);
					$child = $dsql->dsqlOper($sql, "totalCount");

				//如果pid不为0，代表当前ID为二级，需要查询一级分类名
				}else{
					$pid = $res[0]['parentid'];
					$tid = $typeid;
					$tname = $res[0]['typename'];
					$child = 1;

					$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__shop_news_type` WHERE `id` = ".$pid);
					$ret = $dsql->dsqlOper($sql, "results");
					if($ret){
						$pname = $ret[0]['typename'];
					}
				}
			}
		}
		$huoniaoTag->assign('typeid', $typeid);
		$huoniaoTag->assign('tid', $tid);     //二级ID
		$huoniaoTag->assign('tname', $tname); //二级名
		$huoniaoTag->assign('pid', $pid);     //一级ID
		$huoniaoTag->assign('pname', $pname); //一级名
		$huoniaoTag->assign('child', $child); //二级数量


	//资讯详细
	}elseif($action == "news-detail") {

        $detailHandels = new handlers($service, "newsDetail");
        $detailConfig  = $detailHandels->getHandle($id);

        if (is_array($detailConfig) && $detailConfig['state'] == 100) {
            $detailConfig = $detailConfig['info'];
            if (is_array($detailConfig)) {

                //更新浏览次数
                $sql = $dsql->SetQuery("UPDATE `#@__shop_news` SET `click` = `click` + 1 WHERE `id` = " . $id);
                $dsql->dsqlOper($sql, "results");
                detailCheckCity($service, $detailConfig['id'], $detailConfig['cityid'], $action);

                $uid = $userLogin->getMemberID();
                if ($uid > 0) {
                    $uphistoryarr = array(
                        'module'  => $service,
                        'uid'     => $uid,
                        'aid'     => $id,
                        'fuid'    => '',
                        'module2' => 'newsDetail',
                    );
                    /*更新浏览足迹表   */
                    updateHistoryClick($uphistoryarr);
                }
                //输出详细信息
                foreach ($detailConfig as $key => $value) {
                    $huoniaoTag->assign('detail_' . $key, $value);
                }


            }

        } else {
            header("location:" . $cfg_secureAccess . $cfg_basehost . "/404.html");
        }
        return;


    //公告列表
    }elseif($action == "announcement"){

        if(!$page){
            global $reqUri;
            $pagePathArr = explode('-', $reqUri);
            $page = (int)$pagePathArr[1];
        }

        $huoniaoTag->assign('_page', (int)$page);


    //公告详细
    }elseif($action == "announcement-detail") {

        if(!$id){
            global $reqUri;
            $pagePathArr = explode('-', $reqUri);
            $id = (int)$pagePathArr[2];
        }
        
        $detailHandels = new handlers($service, "noticeDetail");
        $detailConfig  = $detailHandels->getHandle($id);

        if (is_array($detailConfig) && $detailConfig['state'] == 100) {
            $detailConfig = $detailConfig['info'];
            if (is_array($detailConfig)) {

                //输出详细信息
                foreach ($detailConfig as $key => $value) {
                    $huoniaoTag->assign('detail_' . $key, $value);
                }

            }

        } else {
            header("location:" . $cfg_secureAccess . $cfg_basehost . "/404.html");
        }
        return;

    }elseif($action =='quanDetail'){
        $detailHandels = new handlers($service, "quanDetail");
        $detailConfig  = $detailHandels->getHandle($id);

        $pageParam = array(
            '0'=>'id='.$id,
            '1'=>'orderby='.$orderby
            );

        $uid = $userLogin->getMemberID();

        if ($uid == -1) {
            $furl     = urlencode('' . $cfg_secureAccess . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI']);
            header("location:" . $cfg_secureAccess . $cfg_basehost . "/login.html?furl=".$furl);
            die;
        }

        $huoniaoTag->assign("pageParam", join("&", $pageParam));
        $huoniaoTag->assign("orderby", $orderby);
        $huoniaoTag->assign("id", $id);

        if (is_array($detailConfig) && $detailConfig['state'] == 100) {
            $detailConfig = $detailConfig['info'];
            if (is_array($detailConfig)) {
                foreach ($detailConfig as $key => $value) {
                    $huoniaoTag->assign('detail_' . $key, $value);
                }


            }

        } else {
            header("location:" . $cfg_secureAccess . $cfg_basehost . "/404.html");
        }
        return;
	//发布商品
	}elseif($action == "fabu"){

		//输出分类字段内容
		global $userLogin;
		$userid = $userLogin->getMemberID();

        $userinfo = $userLogin->getMemberInfo();

        $userid = $userinfo['is_staff'] ==1 ? $userinfo['companyuid'] : $userid;

		global $detailArr;

		if($type == "branch"){//分店
			$act = "storeBranchDetail";
			$id = $_GET['id'];
			if($id){
				$detailHandels = new handlers($service, $act);
				$detailConfig  = $detailHandels->getHandle($id);
				if(is_array($detailConfig) && $detailConfig['state'] == 100){
					$detailConfig  = $detailConfig['info'];//print_R($detailConfig);exit;
					if(is_array($detailConfig)){
						foreach ($detailConfig as $key => $value) {
							$huoniaoTag->assign('detail_'.$key, $value);
						}
					}
				}else{
					header('location:'.$cfg_secureAccess.$cfg_basehost.'/404.html');
					die;
				}
			}
			return;
		}


		if($userid != -1 && (!empty($typeid) || $detailArr)){

			$store = 0;
			$sql = $dsql->SetQuery("SELECT `id` FROM `#@__shop_store` WHERE `userid` = ".$userid);
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$store = $ret[0]['id'];
			}else{
				$param = array(
					"service" => "member",
					"template" => "config",
					"action" => "shop"
				);
				$shopUrl = getUrlPath($param);
				$back = 'window.location.href = "'.$shopUrl.'"';
				$infos = "请先开通商城店铺！";
				echo '<script>setTimeout(function(){alert("'.$infos.'");'.$back.'}, 500)</script>';
				die;
				//header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
				//die;
			}

			//修改信息
			if($detailArr){
				$id     = $detailArr['id'];
				$typeid = $typeid ? $typeid : $detailArr['type'];
				$brand  = $detailArr['brand'];
				$logistic = $detailArr['logisticId'];
				$property = $detailArr['propertyId'];
				$specifiList = $detailArr['specifiList'];
				$huoniaoTag->assign("typeid", $typeid);
				$huoniaoTag->assign("huodong", (int)$detailArr['huodong']);
			}

			//遍历所选分类名称，输出格式：分类名 > 分类名
			global $data;
			$data = "";
			$proType = getParentArr("shop_type", $typeid);
			$proType = array_reverse(parent_foreach($proType, "typename"));
			$huoniaoTag->assign('proType', join(" > ", $proType));

			//遍历所选分类ID
			global $data;
			$data = "";
			$proId = array_reverse(parent_foreach(getParentArr("shop_type", $typeid), "id"));
			$proId = array_slice($proId, 0, count($proType));
			//根据分类ID，获取分类属性值
			$itemid = 0;
			if(count($proId) > 0){
				foreach($proId as $key => $val){
					$archives = $dsql->SetQuery("SELECT * FROM `#@__shop_item` WHERE `type` = ".$val);
					$results = $dsql->dsqlOper($archives, "results");
					if($results){
						$itemid = $val;
					}
				}
			}

			$huoniaoTag->assign("itemid", $itemid);

			//品牌Array
			$brandOption = array();
			array_push($brandOption, '<option value="">'.$langData['siteConfig'][7][2].'</option>');  //请选择
			$archives = $dsql->SetQuery("SELECT * FROM `#@__shop_brandtype` ORDER BY `weight`");
			$results = $dsql->dsqlOper($archives, "results");
			if($results){
				foreach($results as $key => $val){
					$archives_ = $dsql->SetQuery("SELECT * FROM `#@__shop_brand` WHERE `type` = ".$val['id']." ORDER BY `weight`");
					$results_ = $dsql->dsqlOper($archives_, "results");
					$branditem = array();
					if($results_){
						foreach($results_ as $key_ => $val_){
							$selected = "";
							if($val_['id'] == $brand){
								$selected = " selected";
							}
							array_push($branditem, '<option value="'.$val_['id'].'"'.$selected.'>&nbsp;&nbsp;&nbsp;&nbsp;|--'.$val_['title'].'</option>');
						}
						if(!empty($branditem)){
							array_push($brandOption, '<optgroup label="|--'.$val["typename"].'">');
							array_push($brandOption, join("", $branditem));
							array_push($brandOption, '</optgroup>');
						}
					}
				}
			}
			$huoniaoTag->assign('brandOption', join("", $brandOption));

			//商品分类Array
			if($store){
				$ids = array();
				if($id != ""){
					$archives = $dsql->SetQuery("SELECT `category` FROM `#@__shop_product` WHERE `id` = ".$id);
					$results = $dsql->dsqlOper($archives, "results");
					if($results){
						$ids = explode(",", $results[0]['category']);
					}
				}
				$archives = $dsql->SetQuery("SELECT `id`, `typename` FROM `#@__shop_category` WHERE `type` = ".$store." AND `parentid` = 0 ORDER BY `weight`");
				$results = $dsql->dsqlOper($archives, "results");
				if($results){
					$cList = array('<option value="">'.$langData['shop'][4][69].'</option>');  //请选择,支持多选
					foreach($results as $key => $val){
						$selected = "";
						if(in_array($val['id'], $ids)){
							$selected = " selected";
						}
						$archives_ = $dsql->SetQuery("SELECT `id`, `typename` FROM `#@__shop_category` WHERE `parentid` = ".$val['id']." ORDER BY `weight`");
						$results_ = $dsql->dsqlOper($archives_, "results");
						if($results_){
							array_push($cList, '<optgroup label="|--'.$val['typename'].'" data-id="'.$val['id'].'"></optgroup>');
							foreach($results_ as $key_ => $val_){
								$selected = "";
								if(in_array($val_['id'], $ids)){
									$selected = " selected";
								}
								array_push($cList, '<option value="'.$val_['id'].'"'.$selected.' data-pid="'.$val['id'].'" data-id="'.$val_['id'].'">&nbsp;&nbsp;&nbsp;&nbsp;|--'.$val_['typename'].'</option>');
							}
						}else{
							array_push($cList, '<option value="'.$val['id'].'"'.$selected.' data-id="'.$val['id'].'">|--'.$val['typename'].'</option>');
						}
					}
					if(!empty($cList)){
						$huoniaoTag->assign('storeTypeOption', join("", $cList));
					}
				}
			}



			//运费模板Array
			$logisticOption = array();
			array_push($logisticOption, '<option value="0">'.$langData['shop'][4][72].'</option>');  //请选择运费模板
			$archives = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__shop_logistictemplate` WHERE `sid` = ".$store." ORDER BY `id` DESC");
			$results = $dsql->dsqlOper($archives, "results");
			if($results){
				foreach($results as $key => $val){
					$selected = "";
					if($val["id"] == $logistic){
						$selected = " selected";
					}
					array_push($logisticOption, '<option value="'.$val["id"].'"'.$selected.'>'.$val["title"].'</option>');
				}
			}
			$huoniaoTag->assign('logisticOption', join("", $logisticOption));
			$huoniaoTag->assign('proItemList', join("", getItemList($property, $itemid)));

			//根据分类ID，获取分类属性值
			$itemid1 = 0;
			if(count($proId) > 0){
				foreach($proId as $key => $val){
					$archives = $dsql->SetQuery("SELECT * FROM `#@__shop_type` WHERE `spe` != '' AND `id` = ".$val);
					$results = $dsql->dsqlOper($archives, "results");
					if($results){
						$itemid1 = $val;
					}
				}
			}

			$custom = array(
				'pic' => '',
				'filed' => '',
                'custom' => array(),
                'sysSpe' => array()
			);

			//自定义规格
			if($detailArr){
				$custom = array(
					'pic' => $detailArr['spePics'] ? unserialize($detailArr['spePics']) : '',
					'filed' => $detailArr['speFiled'] ? unserialize($detailArr['speFiled']) : '',
                    'custom' => $detailArr['speCustom'] ? unserialize($detailArr['speCustom']) : array(),
                    'sysSpe'=> $detailArr['sysspe'] ? json_decode($detailArr['sysspe'],true) : array()
				);
			}
            include_once(HUONIAOROOT."/api/handlers/shop.class.php");
            $shop = new shop();
            $speArr = $shop->getSpeList($id, $itemid1, $custom);
			$huoniaoTag->assign('specification', join("", $speArr['specification']));
			$huoniaoTag->assign('specifiVal', json_encode($speArr['specifiVal']));
            $parseSpeCustom = $detailArr['speCustom'] ? unserialize($detailArr['speCustom']) : array();
            $huoniaoTag->assign('specifiCustom', $parseSpeCustom);

		}


	//运费模板详细
	}elseif($action == "logisticDetail"){
		global $userLogin;
		$userid = $userLogin->getMemberID();
		if($userid == -1){
			header('location:'.$cfg_secureAccess.$cfg_basehost.'/login.html?furl='.$furl);
			die;
		}

		$sql = $dsql->SetQuery("SELECT `id` FROM `#@__shop_store` WHERE `userid` = ".$userid);
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){

			$sid = $ret[0]['id'];
			$archives = $dsql->SetQuery("SELECT * FROM `#@__shop_logistictemplate` WHERE `sid` = $sid AND `id` = ".$id);
			$results = $dsql->dsqlOper($archives, "results");
			if($results){
				$res = $results[0];

                $devspecification         = unserialize($res['devspecification']);
                $sid                      = $res['sid'];
                $cityid                   = $res['cityid'];
                $title                    = $res['title'];
                $note                     = $res['note'];
                $express_postage          = (float)$res['express_postage'];
                $preferentialMoney        = (float)$res['preferentialMoney'];
                $logistype                = (int)$res['logistype'];
                $express_juli              = (int)$res['express_juli'];
                $delivery_fee_mode        = (int)$res['delivery_fee_mode'];
                $basicprice               = (float)$res['basicprice'];
                $range_delivery_fee_value = $res['range_delivery_fee_value'];

                $openFree                 = (int)$res['openFree'];

                $bearFreight          = $devspecification ? $devspecification['bearFreight'] : 0;
                $valuation            = $devspecification ? $devspecification['valuation'] : 0;
                $freeArea             = $devspecification ? $devspecification['openspecify'] : 0;
                $opennospecify        = $devspecification ? $devspecification['opennospecify'] : 0;


                $deliveryarea           = $devspecification ? $devspecification['deliveryarea'] : array();

                if(empty($devspecification)){
                    $deliveryarea = array();
                    $deliveryarea[0]['cityid']              = '';
                    $deliveryarea[0]['express_start']       = $res['express_start'];
                    $deliveryarea[0]['express_postage']     = $res['express_postage'];
                    $deliveryarea[0]['express_plus']        = $res['express_plus'];
                    $deliveryarea[0]['express_postageplus'] = $res['express_postageplus'];
                    $deliveryarea[0]['area']                = '默认全国';

                    $valuation                              = $res['valuation'];

                }

                $nospecify              = $devspecification ? $devspecification['nospecify'] : array();

                $specify                = $devspecification ? $devspecification['specify'] : array();


                if($nospecify){

                    $nospecify = $nospecify[0]['area'];
                }

//


				$huoniaoTag->assign('cityid', $cityid);
				$huoniaoTag->assign('title', $title);
				$huoniaoTag->assign('note', $note);
				$huoniaoTag->assign('bearFreight', $bearFreight);
				$huoniaoTag->assign('valuation', $valuation);
				$huoniaoTag->assign('freeArea', $freeArea);
				$huoniaoTag->assign('opennospecify', $opennospecify);
//				echo "<pre>";
				$huoniaoTag->assign('deliveryarea', json_encode($deliveryarea));
				$huoniaoTag->assign('nospecify', json_encode($nospecify));
				$huoniaoTag->assign('specify', json_encode($specify));
                $huoniaoTag->assign('express_postage', $express_postage);
                $huoniaoTag->assign('preferentialMoney', $preferentialMoney);
                $huoniaoTag->assign('logistype', $logistype);
                $huoniaoTag->assign('express_juli', $express_juli);
                $huoniaoTag->assign('delivery_fee_mode', $delivery_fee_mode);
                $huoniaoTag->assign('basicprice', $basicprice);
                $huoniaoTag->assign('openFree', $openFree);
                $huoniaoTag->assign('range_delivery_fee_value', $range_delivery_fee_value);
                $huoniaoTag->assign('range_delivery_fee_valuearr', $range_delivery_fee_value !='' ? unserialize($range_delivery_fee_value) : array ());
				switch ($valuation) {
					case 0:
						$valuationTxt = $langData['siteConfig'][21][10];  //件
						break;
					case 1:
						$valuationTxt = "kg";
						break;
					case 2:
						$valuationTxt = "m³";
						break;
				}
				$huoniaoTag->assign('valuationTxt', $valuationTxt);

			}


		}else{
			header('location:'.$cfg_secureAccess.$cfg_basehost.'/404.html');
			die;
		}

	} elseif ($action == 'search_list') {
        global $customtuanTag ;
        $tagarr = explode("|",$customtuanTag);

        $pid = (int)$pid;
        $hottuan = (int)$hottuan;
        $typeid = (int)$typeid;
        $ctype = (int)$ctype;

        if($stype == 'shop' && !isMobile()){
            $ctype = 3;
            $stype = '';
        }
        
        $huoniaoTag->assign('tagarr', $tagarr);
        $huoniaoTag->assign('pid', $pid);
        $huoniaoTag->assign('hottuan', $hottuan);
        $huoniaoTag->assign('typeid', $typeid);
        $huoniaoTag->assign('stype', $stype ? $stype : '');
        $huoniaoTag->assign('ctype', $ctype);
        $huoniaoTag->assign('keywords', $keywords);
        $typename    = '';
        if ($typeid){
                $archives    = $dsql->SetQuery("SELECT `typename` FROM `#@__shop_type` WHERE `id` = " . $typeid);
                $typeResults = $dsql->dsqlOper($archives, "results");
                if ($typeResults) {
                    $typename = $typeResults[0]['typename'];
                }
            }
        //遍历所选分类ID
        global $data;
        $data    = "";
        $proType = getParentArr("shop_type", $typeid);
        $huoniaoTag->assign('typename', $proType[0]['typename']);
        $huoniaoTag->assign('parentid', (int)$proType[0]['parentid']);
    } elseif ($action == 'search_image') {
        //以图搜图
        $huoniaoTag->assign('image', $image ? getFilePath($image) : '');

        if ($image) {
            $detailHandels = new handlers('shop','searchByImage');
            $detailConfig  = $detailHandels->getHandle(array('url' => getFilePath($image)));
            if(is_array($detailConfig) && $detailConfig['state'] == 100) {
                $detailConfig = $detailConfig['info'];

                require(HUONIAOINC . "/config/shop.inc.php");
                $dataShare = (int)$customDataShare;

                if (!$dataShare) {
                    $cityid = getCityId($cityid);
                    if ($cityid) {
                        $where .= " AND s.`cityid` = " . $cityid;
                    }
                }

                /*临时表*/
                $temSql = $dsql->SetQuery(" drop table if exists temp_tb; CREATE TEMPORARY TABLE temp_tb(pid int not null default 0)");

                $temRes = $dsql->dsqlOper($temSql,"update");

                $sql = '';
                foreach ($detailConfig as $v){
                    $sql.='('.$v.'),';
                }
                $sql = rtrim($sql,",");
                $teminsersql = $dsql->SetQuery("INSERT INTO temp_tb (`pid`) values $sql");
                $teminserRes = $dsql->dsqlOper($teminsersql,"update");

                $Sql = $dsql->SetQuery("SELECT t.`id`,t.`typename` FROM temp_tb LEFT JOIN `#@__shop_product` p ON temp_tb.`pid` = p.`id` LEFT JOIN `huoniao_shop_store` s ON s.`id` = p.`store` LEFT JOIN `#@__shop_type` t ON p.`type` = t.`id` WHERE 1=1 AND s.`state` = 1 $where GROUP BY p.`type`");
                $Res = $dsql->dsqlOper($Sql, "results");

                $huoniaoTag->assign('fenlei', $Res ? $Res : array());
            }
        }

    } elseif ($action == 'address_shop' || $action == 'address_add') {

	    $logitcpros  = explode('|',$logitcpros);
        $huoniaoTag->assign('logitcpros', $logitcpros);
        $huoniaoTag->assign('confirmtype', $confirmtype);
        $huoniaoTag->assign('addressid', (int)$addressid);
        unset($_GET['adsid'],$_GET['addressid']);
        $queryStr = http_build_query($_GET);
        $urlparam = urldecode($queryStr);
        $huoniaoTag->assign('urlParam', $urlparam);

        if ($action == 'address_add' && $addressid) {

            $archives = $dsql->SetQuery("SELECT * FROM `#@__member_address` WHERE `id` = '$addressid'");

            $res      = $dsql->dsqlOper($archives,"results");

            if (!$res) {
                header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
            }

            $huoniaoTag->assign('adddetail', $res ? $res[0] : array());

        }
    } elseif ($action == 'store-quality') {

        $Sql = $dsql->SetQuery("SELECT `authattrparam`,`authattrtype` FROM `#@__shop_store` WHERE 1=1 AND `id` = '$storeid'");
        $Res = $dsql->dsqlOper($Sql, "results");

        if ($Res) {
            $authattrparam = $Res[0]['authattrparam'] ? json_decode($Res[0]['authattrparam'],true) : array() ;

            $authattrtype  = $Res[0]['authattrtype'] ? explode(',',$Res[0]['authattrtype']) : array() ;

            $datas = array();
            $Sql = $dsql->SetQuery("SELECT `id`,`typename` FROM `#@__shop_authattr` WHERE 1=1 ORDER BY `weight` ASC ");
	        $Ress = $dsql->dsqlOper($Sql, "results");
            if($Ress){
                foreach($Ress as $key => $val){
                    if($authattrparam){
                        foreach($authattrparam as $k => $v){
                            if($key == $k){
                                array_push($datas, array(
                                    'id' => $v['id'],
                                    'typename' => $val['typename'],
                                    'image' => $v['image']
                                ));
                            }
                        }
                    }
                }
            }

            $huoniaoTag->assign('authattrparam', $datas);
            $huoniaoTag->assign('authattrtype', $authattrtype);
        } else {
            header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
        }
    }




	if(empty($smarty)) return;

	if(!isset($return))
		$return = 'row'; //返回的变量数组名

	//注册一个block的索引，照顾smarty的版本
    if(method_exists($smarty, 'get_template_vars')){
        $_bindex = $smarty->get_template_vars('_bindex');
    }else{
        $_bindex = $smarty->getVariable('_bindex')->value;
    }

    if(!$_bindex){
        $_bindex = array();
    }

    if($return){
        if(!isset($_bindex[$return])){
            $_bindex[$return] = 1;
        }else{
            $_bindex[$return] ++;
        }
    }

    $smarty->assign('_bindex', $_bindex);

	//对象$smarty上注册一个数组以供block使用
	if(!isset($smarty->block_data)){
		$smarty->block_data = array();
	}

	//得一个本区块的专属数据存储空间
	$dataindex = md5(__FUNCTION__.md5(serialize($params)));
	$dataindex = substr($dataindex, 0, 16);

	//使用$smarty->block_data[$dataindex]来存储
	if(!$smarty->block_data[$dataindex]){
		//取得指定动作名
		$moduleHandels = new handlers($service, $action);

		$param = $params;
		$moduleReturn  = $moduleHandels->getHandle($param);

		//只返回数据统计信息
		if($pageData == 1){
			if(!is_array($moduleReturn) || $moduleReturn['state'] != 100){
				$pageInfo_ = array("totalCount" => 0, "gray" => 0, "audit" => 0, "refuse" => 0);
			}else{
				$moduleReturn  = $moduleReturn['info'];  //返回数据
				$pageInfo_ = $moduleReturn['pageInfo'];
			}
			$smarty->block_data[$dataindex] = array($pageInfo_);

		//指定数据
		}elseif(!empty($get)){
			$retArr = $moduleReturn['state'] == 100 ? $moduleReturn['info'][$get] : "";
			$retArr = is_array($retArr) ? $retArr : array();
			$smarty->block_data[$dataindex] = $retArr;

		//正常返回
		}else{

			global $pageInfo;
			if(!is_array($moduleReturn) || $moduleReturn['state'] != 100) {
				$pageInfo = array();
				$smarty->assign('pageInfo', $pageInfo);
				return '';
			}
			$moduleReturn  = $moduleReturn['info'];  //返回数据
			$pageInfo_ = $moduleReturn['pageInfo'];
			if($pageInfo_){
				//如果有分页数据则提取list键
				$moduleReturn  = $moduleReturn['list'];
				$pageInfo = $pageInfo_;
			}else{
				$pageInfo = array();
			}
			$smarty->assign('pageInfo', $pageInfo);
			$smarty->block_data[$dataindex] = $moduleReturn;  //存储数据

		}

	}

	//果没有数据，直接返回null,不必再执行了
	if(!$smarty->block_data[$dataindex]) {
		$repeat = false;
		return '';
	}

	//一条数据出栈，并把它指派给$return，重复执行开关置位1
	if(list($key, $item) = each($smarty->block_data[$dataindex])){
		$smarty->assign($return, $item);
		$repeat = true;
	}

	//如果已经到达最后，重置数组指针，重复执行开关置位0
	if(!$item) {
		reset($smarty->block_data[$dataindex]);
		$repeat = false;
	}

	//打印内容
	print $content;
}





//获取属性
function getItemList($property, $itemid){
	global $dsql;
	global $langData;
	//获取分类属性
	$proItemList = array();
	$propertyArr = array();
	$propertyIds = array();
	$propertyVal = array();
    $propertyCustome = array();
	if(!empty($property)){
		$propertyArr = explode("|", $property);
		foreach($propertyArr as $key => $val){
			$value = explode("#", $val);
            $_item_id = $value[0];
            //系统属性
            if(is_numeric($_item_id)){
                
                //确认属性是否存在
                $archives = $dsql->SetQuery("SELECT * FROM `#@__shop_item` WHERE `id` = ".$_item_id);
                $results = $dsql->dsqlOper($archives, "results");
                if($results){
                    array_push($propertyIds, $value[0]);
                    array_push($propertyVal, $value[1]);
                }
                else{
                    array_push($propertyCustome, $value);
                }
                
            }
            //自定义属性
            else{
                array_push($propertyCustome, $value);
            }
		}
	}
	if($itemid != 0){
		$archives = $dsql->SetQuery("SELECT * FROM `#@__shop_item` WHERE `type` = ".$itemid." AND `parentid` = 0 ORDER BY `weight`");
		$results = $dsql->dsqlOper($archives, "results");
		if($results){
			foreach($results as $key => $val){

				$id = $val['id'];
				$typeName = $val['typename'];
				$r = strstr($val['flag'], 'r');
				$w = strstr($val['flag'], 'w');
				$c = strstr($val['flag'], 'c');

				$archives_ = $dsql->SetQuery("SELECT * FROM `#@__shop_item` WHERE `parentid` = ".$val['id']." ORDER BY `weight`");
				$results_ = $dsql->dsqlOper($archives_, "results");

				if($results_){
					$listItem = array();
					$requri = $requri_ = $dtitle = $ctype = "";
					if($r){
						$requri = ' data-required="1"';
						$requri_ = '<font color="#f00">*</font>';
					}
					$properVal = array();
					if(!empty($propertyIds) && $_GET['typeid'] == ""){
						$found = array_search($id, $propertyIds);
						if(is_numeric($found)){
						    $properVal = $propertyVal[$found];
						}else{
						    $properVal = "";
						}
					}else{
						$properVal = "";
					}

					//可输入
					if($w){

						$ctype = "select";
						array_push($listItem, '<input type="text" class="inp" name="item'.$id.'" id="item'.$id.'" data-title="'.$langData['shop'][4][70].'" placeholder="'.$langData['shop'][4][71].'" data-regex="\S+" value="'.$properVal.'" autocomplete="off" />');  //请选择或直接输入     点击选择或直接输入内容
						if($r){
							array_push($listItem, '<span class="tip-inline"><s></s>'.$langData['shop'][4][70].'</span>');  //请选择或直接输入
							$dtitle = $langData['shop'][4][70];  //请选择或直接输入
						}
						array_push($listItem, '<div class="popup_key"><ul>');
						foreach($results_ as $key_ => $val_){
							array_push($listItem, '<li data-id="'.$val_['id'].'" title="'.$val_['typename'].'">'.$val_['typename'].'</li>');
						}
						array_push($listItem, '</ul></div>');

					//多选
					}elseif($c){

						$ctype = "checkbox";
						array_push($listItem, '<div class="checkbox" data-title="'.$langData['siteConfig'][7][2].'">');  //请选择

						$properVal = array();
						if(!empty($propertyIds) && $_GET['typeid'] == ""){
							$found = array_search($id, $propertyIds);
							if(isset($found)){
								$properVal = explode(",", $propertyVal[$found]);
							}
						}
						foreach($results_ as $key_ => $val_){

							$checked = "";
							if(in_array($val_['id'], $properVal)){
								$checked = " checked";
							}
							array_push($listItem, '<label'.($checked ? ' class="curr"' : '').'><input type="checkbox" name="item'.$id.'[]" value="'.$val_['id'].'"'.$requri.$checked.' />'.$val_['typename'].'</label>');
						}
						if($r){
							array_push($listItem, '<span class="tip-inline"><s></s>'.$langData['siteConfig'][7][2].'</span>');  //请选择
							$dtitle = $langData['siteConfig'][7][2];  //请选择
						}

						array_push($listItem, '</div>');

					//下拉菜单
					}else{
						$ctype = "radio";
						array_push($listItem, '<div class="radio" data-title="'.$langData['siteConfig'][7][2].'">');  //请选择
						foreach($results_ as $key_ => $val_){
							$selected = "";
							if($val_['id'] == $properVal){
								$selected = " class='curr'";
							}
							array_push($listItem, '<span data-id="'.$val_['id'].'"'.$selected.'>'.$val_['typename'].'</span>');
						}
						array_push($listItem, '<input type="hidden" name="item'.$id.'" id="item'.$id.'" value="'.$properVal.'">');
						if($r){
							array_push($listItem, '</div><span class="tip-inline"><s></s>'.$langData['siteConfig'][7][2].'</span>');  //请选择
							$dtitle = $langData['siteConfig'][7][2];  //请选择
						}
					}

					if(!empty($listItem)){
						array_push($proItemList, '<dl'.$requri.' data-title="'.$dtitle.'" data-type="'.$ctype.'" class="fn-clear"><dt>'.$requri_.''.$typeName.'：</dt>');
						array_push($proItemList, '<dd>'.join("", $listItem).'</dd>');
						array_push($proItemList, '</dl>');
					}

				}
			}
		}
	}

    //自定义属性
    if($propertyCustome){
        foreach($propertyCustome as $_k => $_v){
            array_push($proItemList, '<dl class="clearfix cusItem" data-type="select"><dt><input type="text" class="inp" name="cusItemKey[]" placeholder="请输入参数名" data-regex="\S+" value="'.$_v[0].'" /></dt>');
            array_push($proItemList, '<dd style="position:static;"><input type="text" class="inp" name="cusItemVal[]" placeholder="请输入参数值" data-regex="\S+" value="'.$_v[1].'" /><a style="float: none; vertical-align: middle; margin-left: 5px;" href="javascript:;" class="icon-trash">删除</a></dd>');
            array_push($proItemList, '</dl>');
        }
    }

	return $proItemList;
}

//获取规格
function getSpeList($specifiList, $itemid, $config = array()){
	global $dsql;
	//获取分类规格
	$specification = array();
	$specifiArr = array();
	$specifiIds = array();
	$specifiVal = array();

	//规格自定义图片
	$spePics = array();
	if($config['pic']){
		$spePics = $config['pic'];
	}

	//已有规格自定义字段
	$speFiled = array();
	if($config['filed']){
		$speFiled = $config['filed'];
	}

	if(!empty($specifiList) && $_GET['typeid'] == ""){
        $specifiArr = json_decode($specifiList,true) ?? array();
        foreach($specifiArr as $key => $val){
            $ids = $val['speids'];
            $ids = is_string($ids) ? array($ids) : $ids;
            foreach($ids as $key_ => $val_){
                if(!in_array($val_, $specifiIds)){
                    array_push($specifiIds, $val_);
                }
            }
            array_push($specifiVal, join("#",array($val['mprice'],$val['price'],$val['stock'])));
        }
        print_r($specifiIds);die;
	}

	$spePicPx = 0;

	if($itemid != 0){
		$archives = $dsql->SetQuery("SELECT `spe` FROM `#@__shop_type` WHERE `id` = ".$itemid);
		$results = $dsql->dsqlOper($archives, "results");
		if($results && !empty($results[0]['spe'])){
			$spe = explode(",", $results[0]['spe']);
			foreach($spe as $key => $val){
				$archives_1 = $dsql->SetQuery("SELECT `id`, `typename` FROM `#@__shop_specification` WHERE `id` = ".$val . " ORDER BY `weight` ASC");
				$results_1 = $dsql->dsqlOper($archives_1, "results");
				if($results_1){
					$speItem = array();
					$speCustomItem = array();
					foreach($results_1 as $key_1 => $val_1){

						//自定义字段
						$speList = $speFiled[$val_1['id']];
						if($speFiled && $speList){
							foreach ($speList as $k_s => $v_s) {
								$val_s = str_replace('custom_'.$val_1['id'].'_', '', $v_s);

								if($results_1[0]['typename']=="颜色"){

									$imgurl = '';
									if($spePics){
										$imgurl = $spePics[$spePicPx];
										$spePicPx++;
									}

									$img = $imgurl ? "<img src='".getFilePath($imgurl)."' data-url='".$imgurl."'>" : "";
									$hide1 = $imgurl ? "fn-hide" : "";
									$hide2 = $imgurl ? "" : "fn-hide";

									array_push($speCustomItem, '<div class="self_inp color_inp fn-clear"><input class="fn-hide" checked="checked" type="checkbox" name="speCustom'.$val.'[]" title="'.$val_s.'" value="custom_'.$val.'_'.$val_s.'"><input type="text" class="inp" size="12" value="'.$val_s.'"><i class="del_inp"></i><div class="img_box">'.$img.'</div><div class="upimg filePicker1 '.$hide1.'" id="filePicker_'.$v_s.'">选择图片</div><div class="del_img '.$hide2.'">删除图片</div><input class="spePic" type="hidden" name="speCustomPic'.$val.'[]" value="'.$imgurl.'" /></div>');
								}else{
									array_push($speCustomItem, '<div class="self_inp fn-clear"><input class="fn-hide" checked="checked" type="checkbox" name="speCustom'.$val.'[]" title="'.$val_s.'" value="custom_'.$val.'_'.$val_s.'"><input type="text" class="inp"  size="22" value="'.$val_s.'" /><i class="del_inp"></i></div>');
								}
							}
						}

						//系统默认字段
						$archives_2 = $dsql->SetQuery("SELECT `id`, `typename` FROM `#@__shop_specification` WHERE `parentid` = ".$val_1['id']." ORDER BY `weight` ASC");
						$results_2 = $dsql->dsqlOper($archives_2, "results");
						if($results_2){
							foreach($results_2 as $key_2 => $val_2){
								$checked = "";
								if(in_array($val_2['id'], $specifiIds)){
									$checked = " checked";
								}
								if($results_1[0]['typename']=="颜色"){

									$imgurl = '';
									if($spePics){
										$imgurl = $spePics[$spePicPx];
										$spePicPx++;
									}

									$img = $imgurl ? "<img src='".getFilePath($imgurl)."' data-url='".$imgurl."'>" : "";
									$hide1 = $imgurl ? "fn-hide" : "";
									$hide2 = $imgurl ? "" : "fn-hide";

									array_push($speItem, '<li><label><input type="checkbox" name="spe'.$val.'[]" title="'.$val_2['typename'].'" value="'.$val_2['id'].'" '.$checked.' /><span class="readonly">'.$val_2['typename'].'</span></label><div class="img_box">'.$img.'</div><div class="upimg filePicker1 '.$hide1.'" id="filePicker_'.$val_2['id'].'" data-type="des"  data-count="1" data-size="" data-imglist="">选择图片</div><div class="del_img '.$hide2.'">删除图片</div><input class="spePic" type="hidden" name="spePic'.$val.'[]" value="'.$imgurl.'" /></li>');
								}else{
									array_push($speItem, '<label><input type="checkbox" name="spe'.$val.'[]" title="'.$val_2['typename'].'" value="'.$val_2['id'].'"'.$checked.' />'.$val_2['typename'].'</label>');
								}

							}
						}
					}
					if($speItem){
						array_push($specification, '<dl class="fn-clear'.($results_1[0]['typename']=="颜色"?' colorObj' : '').'"><dt><label>'.$results_1[0]['typename'].'：</label></dt>');
						array_push($specification,'<dd class="fn-clear" data-title="'.$results_1[0]['typename'].'" data-id="'.$results_1[0]['id'].'">');


						if($results_1[0]['typename']=="颜色"){
							array_push($specification,'<div class="self_add fn-clear"><div class="fn-left color_div"><input type="text" name="selfinp" class="inp"  size="12" maxlength="50" data-title="请输入自定义值" placeholder="请输入自定义值" value=""><div class="img_box"></div><div class="upimg filePicker1" id="filePicker_0"  data-type="des"  data-count="1" data-size="" data-imglist="">选择图片</div><div class="del_img fn-hide">删除图片</div></div><button type="button" class="sure_add">+添加</button>');
							array_push($specification,'<span class="tip-inline" style="display:inline-block;"><s></s>图片推荐尺寸：800*800</span></div>');
							array_push($specification,'<div class="self_box fn-clear">'.join('', $speCustomItem).'</div>');
							array_push($specification,'<div class="color_box checkbox"><ul class="fn-clear">'.join("", $speItem).'</ul></div>');
						}else{
							array_push($specification,'<div class="self_add fn-clear"><input type="text" name="selfinp" class="inp"  size="22" maxlength="50" data-title="请输入自定义值" placeholder="请输入自定义值" value=""><button type="button" class="sure_add">+添加</button>');
							array_push($specification,'</div>');
							array_push($specification,'<div class="self_box fn-clear">'.join('', $speCustomItem).'</div>');
							array_push($specification,'<div class="checkbox otherbox fn-clear">'.join("", $speItem).'</div>');
						}

						array_push($specification,'</dd>');
						//array_push($specification, '<dd data-title="'.$results_1[0]['typename'].'" data-id="'.$results_1[0]['id'].'"><div class="fn-clear checkbox">'.join("", $speItem).'</div></dd>');
						array_push($specification, '</dl>');
					}
				}
			}
		}
	}
	return array("specifiVal" => $specifiVal, "specification" => $specification);
}
