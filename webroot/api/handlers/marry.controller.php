<?php

/**
 * huoniaoTag模板标签函数插件-婚嫁模块
 *
 * @param $params array 参数集
 * @return array
 */
function marry($params, $content = "", &$smarty = array(), &$repeat = array()){

	extract ($params);
	$service = "marry";
	if(empty($action)) return '';

	global $template;
	global $huoniaoTag;
	global $dsql;
	global $userLogin;
	global $cfg_basehost;
	global $cfg_secureAccess;

	$userid = $userLogin->getMemberID();

    if($action == "detail" || $action == "storeDetail" || $action == "store-detail" || $action == "plan-detail" || $action == "hotelmeallist" || $action == "plancaselist" || $action == "hotelmenu-detail" || $action == "planmeallist" || $action == "hotel_detail"){
		$detailHandels = new handlers($service, "storeDetail");
        $detailConfig  = $detailHandels->getHandle(array("id" => $id, "istype"=>$istype, "typeid"=>$typeid));
        $state = 0;
		if(is_array($detailConfig) && $detailConfig['state'] == 100){
			$detailConfig  = $detailConfig['info'];
			if(is_array($detailConfig)){    //print_R($detailConfig);exit;
				global $template;
				if($template != 'config'){
					detailCheckCity("marry", $detailConfig['id'], $detailConfig['cityid'], "store-detail");
				}

				if($action == "store-detail" || $action == "detail"){
					//更新浏览次数
					$sql = $dsql->SetQuery("UPDATE `#@__marry_store` SET `click` = `click` + 1 WHERE `id` = ".$id);
					$dsql->dsqlOper($sql, "results");
				}

				//输出详细信息
				foreach ($detailConfig as $key => $value) {
					$huoniaoTag->assign('detail_'.$key, $value);
				}
				$state = 1;
			}

            global $langData;
            if($typeid == 1){
                $typename = $langData['marry'][2][6];
                $type = 1;
            }elseif($typeid == 2){
                $typename = $langData['marry'][2][7];
                $type = 2;
            }elseif($typeid == 3){
                $typename = $langData['marry'][2][8];
                $type = 3;
            }elseif($typeid == 4){
                $typename = $langData['marry'][2][9];
                $type = 4;
            }elseif($typeid == 5){
                $typename = $langData['marry'][2][10];
                $type = 5;
            }elseif($typeid == 6){
                $typename = $langData['marry'][2][11];
                $type = 6;
            }elseif ($typeid == 7){
                $typename = $langData['marry'][2][16];
                $type = 7;
            }elseif ($typeid == 8){
                $typename = $langData['marry'][2][13];
                $type = 8;
            }elseif ($typeid == 9){
                $typename = $langData['marry'][2][14];
                $type = 9;
            }elseif ($typeid == 10){
                $typename = $langData['marry'][2][15];
                $type = 10;
            }


            $huoniaoTag->assign('typename', $typename);
			$huoniaoTag->assign('type', $type);//套餐类型
            $huoniaoTag->assign('storeState', $state);
            $huoniaoTag->assign('storeId', $id);
			$huoniaoTag->assign('typeid', $typeid ? $typeid : 0);//商家
			$huoniaoTag->assign('istype', $istype ? $istype : 1);//1：婚宴酒店;2、婚礼策划;3、婚宴套餐;
			$huoniaoTag->assign('businessid', $businessid ? $businessid : 1);//商家


        }else{
			if($action == "store-detail"){
                $errortitle = '抱歉,店铺正在审核中';
                header("location:".$cfg_secureAccess.$cfg_basehost."/error.html?msg=$errortitle");

            }
		}
	}elseif($action == "fabu"){

		if($type == "field"){//婚宴场地
			$act = "hotelfieldDetail";
		}elseif($type == "menu"){//婚宴菜单
			$act = "hotelmenuDetail";
		}elseif($type == "host"){//主持人
			$act = "hostDetail";
		}elseif($type == "rental"){//婚车
			$act = "rentalDetail";
		}elseif($type == "case"){//案例
			$act = "plancaseDetail";
		}elseif($type == "meal"){//套餐
			$act = "planmealDetail";
		}
        $typeid = htmlspecialchars(RemoveXSS($_REQUEST['typeid']));

        $huoniaoTag->assign('typeid',$typeid);

        if($id){
			$detailHandels = new handlers($service, $act);
			$detailConfig  = $detailHandels->getHandle(array("id"=>$id,"typeid"=>$typeid));
			if(is_array($detailConfig) && $detailConfig['state'] == 100){
				$detailConfig  = $detailConfig['info'];
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
	}elseif($action == "comment"){
		$type = $type ? (int)$type : 0;

        $param = array(
            'id' => $id,
            'typeid' => $type
        );

		if(empty($type)){
			$act = 'storeDetail';
            $param = $id;
		}elseif($type == 1 || $type == 2 || $type == 3 || $type == 4 || $type == 5 || $type == 6 || $type == 9){
			$act = 'planmealDetail';
		}elseif($type == 7){
			$act = 'hostDetail';  //主持人
		}elseif($type == 8){
			$act = 'hotelfieldDetail';  //酒店场地详情
		}elseif($type == 10){
			$act = 'rentalDetail';  //婚车
		}

		$detailHandels = new handlers($service, $act);
		$detailConfig  = $detailHandels->getHandle($param);
		if(is_array($detailConfig) && $detailConfig['state'] == 100){
			$detailConfig  = $detailConfig['info'];
			if(is_array($detailConfig)){//print_R($detailConfig);exit;
				//输出详细信息
				foreach ($detailConfig as $key => $value) {
					$huoniaoTag->assign('detail_'.$key, $value);
				}
			}
		}else{
			header("location:".$cfg_secureAccess.$cfg_basehost."/404.html?v=1");
		}

		$huoniaoTag->assign('type', $type);

	}elseif($action == "comdetail"){
		$id   = (int)$id;
		$type = $type ? (int)$type : 0;
		$huoniaoTag->assign('type', $type);

        $detailHandels = new handlers("member", "commentDetail");
        $detail  = $detailHandels->getHandle(array("id" => $id));
        if(is_array($detail) && $detail['state'] == 100){
            $detail  = $detail['info'];
            foreach ($detail as $key => $value) {
                $huoniaoTag->assign('detail_'.$key, $value);
            }
        }else{
            $param = array(
				"service" => "marry",
			);
			header("location:".getUrlPath($param));
			die;
        }
    }elseif($action == "hotelfield-detail"){//场地详情
		$detailHandels = new handlers($service, "hotelfieldDetail");
		$detailConfig  = $detailHandels->getHandle($id);
		if(is_array($detailConfig) && $detailConfig['state'] == 100){
			$detailConfig  = $detailConfig['info'];
			if(is_array($detailConfig)){//print_R($detailConfig);exit;

				//更新浏览次数
				$sql = $dsql->SetQuery("UPDATE `#@__marry_hotelfield` SET `click` = `click` + 1 WHERE `id` = ".$id);
				$dsql->dsqlOper($sql, "results");

				//输出详细信息
				foreach ($detailConfig as $key => $value) {
					$huoniaoTag->assign('detail_'.$key, $value);
				}

			}
			$huoniaoTag->assign('hotelfieldId', $id);

		}else{
			header("location:".$cfg_secureAccess.$cfg_basehost."/404.html?v=1");
		}
	}elseif($action == "host-detail"){//主持人详情
		$detailHandels = new handlers($service, "hostDetail");
		$detailConfig  = $detailHandels->getHandle($id);
		if(is_array($detailConfig) && $detailConfig['state'] == 100){
			$detailConfig  = $detailConfig['info'];
			if(is_array($detailConfig)){//print_R($detailConfig);exit;

				//更新浏览次数
				$sql = $dsql->SetQuery("UPDATE `#@__marry_host` SET `click` = `click` + 1 WHERE `id` = ".$id);
				$dsql->dsqlOper($sql, "results");

				//输出详细信息
				foreach ($detailConfig as $key => $value) {
					$huoniaoTag->assign('detail_'.$key, $value);
				}

			}
			$huoniaoTag->assign('hostId', $id);

		}else{
			header("location:".$cfg_secureAccess.$cfg_basehost."/404.html?v=1");
		}
	}elseif($action == "rental-detail"){//婚车详情
		$detailHandels = new handlers($service, "rentalDetail");
		$detailConfig  = $detailHandels->getHandle($id);
		if(is_array($detailConfig) && $detailConfig['state'] == 100){
			$detailConfig  = $detailConfig['info'];
			if(is_array($detailConfig)){//print_R($detailConfig);exit;

				//更新浏览次数
				$sql = $dsql->SetQuery("UPDATE `#@__marry_weddingcar` SET `click` = `click` + 1 WHERE `id` = ".$id);
				$dsql->dsqlOper($sql, "results");

				//输出详细信息
				foreach ($detailConfig as $key => $value) {
					$huoniaoTag->assign('detail_'.$key, $value);
				}

			}
			$huoniaoTag->assign('rentalId', $id);

		}else{
			header("location:".$cfg_secureAccess.$cfg_basehost."/404.html?v=1");
		}
	}elseif($action == "plancase-detail"){//商家案例详情
		$detailHandels = new handlers($service, "plancaseDetail");
		$detailConfig  = $detailHandels->getHandle($id);
		if(is_array($detailConfig) && $detailConfig['state'] == 100){
			$detailConfig  = $detailConfig['info'];
			if(is_array($detailConfig)){//print_R($detailConfig);exit;

				//更新浏览次数
				$sql = $dsql->SetQuery("UPDATE `#@__marry_plancase` SET `click` = `click` + 1 WHERE `id` = ".$id);
				$dsql->dsqlOper($sql, "results");

				//输出详细信息
				foreach ($detailConfig as $key => $value) {
					$huoniaoTag->assign('detail_'.$key, $value);
				}

			}
			$huoniaoTag->assign('plancaseId', $id);

		}else{
			header("location:".$cfg_secureAccess.$cfg_basehost."/404.html?v=1");
		}


	}elseif($action == "planmeal-detail"){//套餐详情

		$detailHandels = new handlers($service, "planmealDetail");
		$detailConfig  = $detailHandels->getHandle(array("id" => $id, "istype"=>$istype, "typeid"=>$typeid, "businessid"=>$businessid));
		if(is_array($detailConfig) && $detailConfig['state'] == 100){
			$detailConfig  = $detailConfig['info'];
			if(is_array($detailConfig)){//print_R($detailConfig);exit;

				//更新浏览次数
				$sql = $dsql->SetQuery("UPDATE `#@__marry_planmeal` SET `click` = `click` + 1 WHERE `id` = ".$id);
				$dsql->dsqlOper($sql, "results");

				//输出详细信息
				foreach ($detailConfig as $key => $value) {
					$huoniaoTag->assign('detail_'.$key, $value);
				}

			}
			$huoniaoTag->assign('plancaseId', $id);
			$huoniaoTag->assign('typeid', $typeid);

			$huoniaoTag->assign('istype', $istype);
			$huoniaoTag->assign('businessid', $businessid);


		}else{
			header("location:".$cfg_secureAccess.$cfg_basehost."/404.html?v=1");
		}
	}elseif($action == "planpro_detail"){  //店铺详情
        $detailHandels = new handlers($service, "storeDetail");
        $detailConfig  = $detailHandels->getHandle(array("id" => $id, "istype"=>$istype, "typeid"=>$typeid, "businessid"=>$businessid));
        if(is_array($detailConfig) && $detailConfig['state'] == 100) {
            $detailConfig = $detailConfig['info'];
            if (is_array($detailConfig)) {//print_R($detailConfig);exit;

                //更新浏览次数
                $sql = $dsql->SetQuery("UPDATE `#@__marry_planmeal` SET `click` = `click` + 1 WHERE `id` = " . $id);
                $dsql->dsqlOper($sql, "results");

                //输出详细信息
                foreach ($detailConfig as $key => $value) {
                    $huoniaoTag->assign('detail_' . $key, $value);
                }

            }
            $huoniaoTag->assign('plancaseId', $id);
            $huoniaoTag->assign('typeid', $typeid);

            $huoniaoTag->assign('istype', $istype);
        }
    }

    elseif($action == "hotellist"){
        $huoniaoTag->assign('price', $price);
        $huoniaoTag->assign('orderby', (int)$orderby);
        $huoniaoTag->assign('addrid', (int)$addrid);
        $huoniaoTag->assign('typeid', (int)$type);
        $huoniaoTag->assign('id', $id);


    }elseif ($action =="search_list"){
        $page = $pageSize = $where = "";

//        $where .= " AND `title` like '%$keywords%'";
//
//        $archives = $dsql->SetQuery("SELECT `id`, `title`, `userid`, `company`, `pics`, `tag`, `price`, `type`, `click`, `pubdate`, `state` FROM `#@__marry_planmeal` WHERE 1 = 1".$where);
//        $results = $dsql->dsqlOper($archives, "results");

//        $count = count($results);

        $huoniaoTag->assign('countkeywords', $count);
        $huoniaoTag->assign('contype', $contype);

        $huoniaoTag->assign('keywords', $keywords);
    }

    elseif ($action == "storelist"){
        global $langData;
        if($typeid == 1){
            $typename = $langData['marry'][2][6];
            $type = 1;
        }elseif($typeid == 2){
            $typename = $langData['marry'][2][7];
            $type = 2;
        }elseif($typeid == 3){
            $typename = $langData['marry'][2][8];
            $type = 3;
        }elseif($typeid == 4){
            $typename = $langData['marry'][2][9];
            $type = 4;
        }elseif($typeid == 5){
            $typename = $langData['marry'][2][10];
            $type = 5;
        }elseif($typeid == 6){
            $typename = $langData['marry'][2][11];
            $type = 6;
        }elseif ($typeid == 7){
            $typename = $langData['marry'][2][16];
            $type = 7;
        }elseif ($typeid == 8){
            $typename = $langData['marry'][2][13];
            $type = 8;
        }elseif ($typeid == 9){
            $typename = $langData['marry'][2][14];
            $type = 9;
        }elseif ($typeid == 10){
            $typename = $langData['marry'][2][15];
            $type = 10;
        }
        $huoniaoTag->assign('typeid', $typeid);
        $huoniaoTag->assign('car', $car);
        $huoniaoTag->assign('addrid', $addrid);
        $huoniaoTag->assign('business', $business);
        $huoniaoTag->assign('orderby', $orderby);
        $huoniaoTag->assign('filter', $filter);

        $huoniaoTag->assign('style', $style);
        $huoniaoTag->assign('color', $color);
        $huoniaoTag->assign('hoststyle', $hoststyle);
        $huoniaoTag->assign('video', $video);
        $huoniaoTag->assign('vstyle', $vstyle);
        $huoniaoTag->assign('scene', $scene);
        $huoniaoTag->assign('pstyle', $pstyle);
        $huoniaoTag->assign('photostyle', $photostyle);
        $huoniaoTag->assign('material', $material);
        $huoniaoTag->assign('jewelry', $jewelry);
        $huoniaoTag->assign('makeup', $makeup);
        $huoniaoTag->assign('wedding', $wedding);

        $huoniaoTag->assign('typename', $typename);
        $huoniaoTag->assign('type', $type);

        $addrid = $business ? $business : $addrid;
        if(!empty($addrid)){
            global $data;
            $data = "";
            $addrArr = getParentArr("site_area", $addrid);
            $addrArr = array_reverse(parent_foreach($addrArr, "typename"));
            $community_seotitle = join("", $addrArr);

        }
        $price = htmlspecialchars(RemoveXSS($_REQUEST['price']));
        if(!empty($price)){
            $priceArr = explode(",", $price);
            if(empty($priceArr[0])){
                $loupan_seotitle .= ($priceArr[1] >= 10 ? $priceArr[1]/10 . "万" : $priceArr[1] . "千") . "以下";
            }elseif(empty($priceArr[1])){
                $loupan_seotitle .= ($priceArr[0] >= 10 ? $priceArr[0]/10 . "万" : $priceArr[0] . "千") . "以上";
            }elseif(!empty($priceArr[0]) && !empty($priceArr[1])){
                $loupan_seotitle .= ($priceArr[0] >= 10 ? $priceArr[0]/10 . "万" : $priceArr[0] . "千")."-".($priceArr[1] >= 10 ? $priceArr[1]/10 . "万" : $priceArr[1] . "千");
            }
        }
        $huoniaoTag->assign('price', $price);
        $huoniaoTag->assign('priceArr', $priceArr);


    }
    elseif($action == "list"){
		$huoniaoTag->assign('typeid', $typeid);
        $huoniaoTag->assign('car', $car);
        $huoniaoTag->assign('addrid', $addrid);
        $huoniaoTag->assign('business', $business);
        $huoniaoTag->assign('orderby', $orderby);

        $huoniaoTag->assign('style', $style);
        $huoniaoTag->assign('color', $color);
        $huoniaoTag->assign('hoststyle', $hoststyle);
        $huoniaoTag->assign('video', $video);
        $huoniaoTag->assign('vstyle', $vstyle);
        $huoniaoTag->assign('scene', $scene);
        $huoniaoTag->assign('pstyle', $pstyle);
        $huoniaoTag->assign('photostyle', $photostyle);
        $huoniaoTag->assign('material', $material);
        $huoniaoTag->assign('jewelry', $jewelry);
        $huoniaoTag->assign('makeup', $makeup);
        $huoniaoTag->assign('wedding', $wedding);
        $huoniaoTag->assign('classification', $classification);

        $addrid = $business ? $business : $addrid;
        if(!empty($addrid)){
            global $data;
            $data = "";
            $addrArr = getParentArr("site_area", $addrid);
            $addrArr = array_reverse(parent_foreach($addrArr, "typename"));
            $community_seotitle = join("", $addrArr);

        }
        $price = htmlspecialchars(RemoveXSS($_REQUEST['price']));
        if(!empty($price)){
            $priceArr = explode(",", $price);
            if(empty($priceArr[0])){
                $loupan_seotitle .= ($priceArr[1] >= 10 ? $priceArr[1]/10 . "万" : $priceArr[1] . "千") . "以下";
            }elseif(empty($priceArr[1])){
                $loupan_seotitle .= ($priceArr[0] >= 10 ? $priceArr[0]/10 . "万" : $priceArr[0] . "千") . "以上";
            }elseif(!empty($priceArr[0]) && !empty($priceArr[1])){
                $loupan_seotitle .= ($priceArr[0] >= 10 ? $priceArr[0]/10 . "万" : $priceArr[0] . "千")."-".($priceArr[1] >= 10 ? $priceArr[1]/10 . "万" : $priceArr[1] . "千");
            }
        }
        $huoniaoTag->assign('price', $price);
        $huoniaoTag->assign('priceArr', $priceArr);



        global $langData;
		if($typeid == 1){
			$typename = $langData['marry'][2][6];
			$type = 1;
		}elseif($typeid == 2){
			$typename = $langData['marry'][2][7];
			$type = 2;
		}elseif($typeid == 3){
			$typename = $langData['marry'][2][8];
			$type = 3;
		}elseif($typeid == 4){
			$typename = $langData['marry'][2][9];
			$type = 4;
		}elseif($typeid == 5){
			$typename = $langData['marry'][2][10];
			$type = 5;
		}elseif($typeid == 6){
			$typename = $langData['marry'][2][11];
			$type = 6;
		}elseif ($typeid == 7){
            $typename = $langData['marry'][2][16];
            $type = 7;
        }elseif ($typeid == 8){
            $typename = $langData['marry'][2][13];
            $type = 8;
        }elseif ($typeid == 9){
            $typename = $langData['marry'][2][14];
            $type = 9;
        }elseif ($typeid == 10){
            $typename = $langData['marry'][2][15];
            $type = 10;
        }

        //婚纱摄影套餐类型
        $archives = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 22 ORDER BY `weight` ASC");
        $results = $dsql->dsqlOper($archives, "results");
        $list = array();
        foreach($results as $value){
            $list[$value['id']] = $value['typename'];
        }
        $huoniaoTag->assign('planmealstylelist', $list);
        //摄像跟拍类型
        $sx_archives = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 58 ORDER BY `weight` ASC");
        $sx_results = $dsql->dsqlOper($sx_archives, "results");
        $sx_list = array();
        foreach($sx_results as $value){
            $sx_list[$value['id']] = $value['typename'];
        }
        $huoniaoTag->assign('sx_list', $sx_list);
        //颜色
        $ys_archives = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 97 ORDER BY `weight` ASC");
        $ys_results = $dsql->dsqlOper($ys_archives, "results");
        $ys_list = array();
        foreach($ys_results as $value){
            $ys_list[$value['id']] = $value['typename'];
        }
        $huoniaoTag->assign('ys_list', $ys_list);
        //摄像跟拍风格
        $sxfg_archives = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 61 ORDER BY `weight` ASC");
        $sxfg_archives_results = $dsql->dsqlOper($sxfg_archives, "results");
        $sxfg_archives_list = array();
        foreach($sxfg_archives_results as $value){
            $sxfg_archives_list[$value['id']] = $value['typename'];
        }
        $huoniaoTag->assign('sxfg_archives_list', $sxfg_archives_list);

        //租婚车类型
        $hc_archives = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 12 ORDER BY `weight` ASC");
        $hc_archives_results = $dsql->dsqlOper($hc_archives, "results");
        $hc_archives_list = array();
        foreach($hc_archives_results as $value){
            $hc_archives_list[$value['id']] = $value['typename'];
        }
        $huoniaoTag->assign('hc_archives_list', $hc_archives_list);

        //婚纱摄影-场景
        $cj_archives = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 25 ORDER BY `weight` ASC");
        $cj_results = $dsql->dsqlOper($cj_archives, "results");
        $cj_archives_list = array();
        foreach($cj_results as $value){
            $cj_archives_list[$value['id']] = $value['typename'];
        }
        $huoniaoTag->assign('cj_archives_list', $cj_archives_list);
        //婚纱摄影-风格
        $cj_archives = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 25 ORDER BY `weight` ASC");
        $cj_results = $dsql->dsqlOper($cj_archives, "results");
        $cj_archives_list = array();
        foreach($cj_results as $value){
            $cj_archives_list[$value['id']] = $value['typename'];
        }
        $huoniaoTag->assign('cj_archives_list', $cj_archives_list);

        //摄影跟拍-类型
        $gp_archives = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 79 ORDER BY `weight` ASC");
        $gp_results = $dsql->dsqlOper($gp_archives, "results");
        $gp_archives_list = array();
        foreach($gp_results as $value){
            $gp_archives_list[$value['id']] = $value['typename'];
        }
        $huoniaoTag->assign('gp_archives_list', $gp_archives_list);

        //摄影跟拍-风格
        $gpfg_archives = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 81 ORDER BY `weight` ASC");
        $gpfg_results = $dsql->dsqlOper($gpfg_archives, "results");
        $gpfg_archives_list = array();
        foreach($gpfg_results as $value){
            $gpfg_archives_list[$value['id']] = $value['typename'];
        }
        $huoniaoTag->assign('gpfg_archives_list', $gpfg_archives_list);


        //婚礼主持-风格
        $zc_archives = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 6 ORDER BY `weight` ASC");
        $zc_results = $dsql->dsqlOper($zc_archives, "results");
        $zc_archives_list = array();
        foreach($zc_results as $value){
            $zc_archives_list[$value['id']] = $value['typename'];
        }
        $huoniaoTag->assign('zc_archives_list', $zc_archives_list);

        //婚礼类别
        $lb_archives = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 94 ORDER BY `weight` ASC");
        $lb_results = $dsql->dsqlOper($lb_archives, "results");
        $lb_archives_list = array();
        foreach($lb_results as $value){
            $lb_archives_list[$value['id']] = $value['typename'];
        }
        $huoniaoTag->assign('lb_archives_list', $lb_archives_list);

        //珠宝首饰-材质
        $zbcz_archives = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 70 ORDER BY `weight` ASC");
        $zbcz_results = $dsql->dsqlOper($zbcz_archives, "results");
        $zbcz_archives_list = array();
        foreach($zbcz_results as $value){
            $zbcz_archives_list[$value['id']] = $value['typename'];
        }
        $huoniaoTag->assign('zbcz_archives_list', $zbcz_archives_list);

        //珠宝首饰-类型
        $zblx_archives = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 73 ORDER BY `weight` ASC");
        $zblx_results = $dsql->dsqlOper($zblx_archives, "results");
        $zblx_archives_list = array();
        foreach($zblx_results as $value){
            $zblx_archives_list[$value['id']] = $value['typename'];
        }
        $huoniaoTag->assign('zblx_archives_list', $zblx_archives_list);



        $huoniaoTag->assign('typename', $typename);
		$huoniaoTag->assign('type', $type);
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
