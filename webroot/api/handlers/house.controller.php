<?php

/**
 * huoniaoTag模板标签函数插件-房产模块
 *
 * @param $params array 参数集
 * @return array
 */
function house($params, $content = "", &$smarty = array(), &$repeat = array()){
	extract($params);
	$service = "house";
	if(empty($action)) return '';

	global $huoniaoTag;
	global $dsql;
	global $cfg_secureAccess;
	global $cfg_basehost;
	global $userLogin;

	//当前运营城市
	require(HUONIAOINC."/config/house.inc.php");
	$customFabuCheckPhone = (int)$customFabuCheckPhone;
	$huoniaoTag->assign('customFabuCheckPhone', $customFabuCheckPhone);

	$houseCityName = "";
	if($customSubwayCity){
		$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__site_area` WHERE `id` = $customSubwayCity");
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){
			$houseCityName = $ret[0]['typename'];
		}
		$huoniaoTag->assign('houseCityid', $customSubwayCity);
		$huoniaoTag->assign('houseCityName', $houseCityName);

		global $data;
		$data = "";
		$areaName = getParentArr("site_area", $customSubwayCity);
		$areaName = array_reverse(parent_foreach($areaName, "typename"));
		$cityname = join(" ", $areaName);
		$huoniaoTag->assign('houseCityNameArr', $cityname);
	}

	if($action == "index"){
		$totaldata = array();
		global $siteCityInfo;
		// 在售楼盘数量
		$cityid = $siteCityInfo['cityid'];
		$sql = $dsql->SetQuery("SELECT COUNT(`id`) count FROM `#@__house_loupan` WHERE `cityid` = $cityid AND `state` = 1 AND `salestate` = 1");
		$res = $dsql->dsqlOper($sql, "results");
		$totaldata['onsale_loupan'] = $res ? $res[0]['count'] : 0;

		// 二手房数量
		$sql = $dsql->SetQuery("SELECT COUNT(`id`) count FROM `#@__house_sale` WHERE `cityid` = $cityid AND `state` = 1 AND `waitpay` = 0");
		$res = $dsql->dsqlOper($sql, "results");
		$totaldata['sale'] = $res ? $res[0]['count'] : 0;

		// 出租房数量
		$sql = $dsql->SetQuery("SELECT COUNT(`id`) count FROM `#@__house_zu` WHERE `cityid` = $cityid AND `state` = 1 AND `waitpay` = 0");
		$res = $dsql->dsqlOper($sql, "results");
		$totaldata['zu'] = $res ? $res[0]['count'] : 0;

		// 中介公司数量
		$sql = $dsql->SetQuery("SELECT COUNT(`id`) count FROM `#@__house_zjcom` WHERE `cityid` = $cityid AND `state` = 1 AND `store_switch` = 1");
		$res = $dsql->dsqlOper($sql, "results");
		$totaldata['zjcom'] = $res ? $res[0]['count'] : 0;

		$huoniaoTag->assign('totaldata', $totaldata);
	}

    if($action == "search_index" || $action == "search_list"){
        $huoniaoTag->assign("stypeid",$stypeid);
        $huoniaoTag->assign("keywords",$keywords);
        $huoniaoTag->assign("schoolnature",$schoolnature);
        $huoniaoTag->assign("schooltype",$schooltype);
        //区域
        $huoniaoTag->assign('addrid', $addrid);
        $huoniaoTag->assign('business', $business);

        if($addrid == 0 && $business != 0){
            $sql = $dsql->SetQuery("SELECT `parentid` FROM `#@__site_area` WHERE `id` = ".$business);
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $huoniaoTag->assign('addrid', $ret[0]['parentid']);
            }
        }
    }

    if($action == "slist"){
        $huoniaoTag->assign("sid",$sid);
        $huoniaoTag->assign("sname",$sname);
    }

	//楼盘列表
	if($action == "loupan"){
		$loupan_seotitle = "";
		//伪静态URL参数分解
		//loupan-addrid-business-subway-station-price-typeid-salestate-times-zhuangxiu-buildtype-keywords-feature-page.html
		$data = $_GET['data'];
		if(!empty($data)){
			$data = explode("-", $data);

			$addrid    = (int)$data[0];
			$business  = (int)$data[1];
			$subway    = (int)$data[2];
			$station   = (int)$data[3];
			$price     = convertArrToStrWithComma(RemoveXSS($data[4]));
			$typeid    = (int)$data[5];
			$salestate = RemoveXSS($data[6]);
			$times     = RemoveXSS($data[7]);
			$zhuangxiu = (int)$data[8];
			$buildtype = RemoveXSS($data[9]);
			$tuandate  = RemoveXSS($data[10]);
			$filter    = RemoveXSS($data[11]);
			$keywords  = RemoveXSS($data[12]);
			$feature   = $feature ? (int)$feature : (int)$data[13];
			$page      = (int)$data[14];

		}


		//区域
		$huoniaoTag->assign('addrid', $addrid);
		$huoniaoTag->assign('business', $business);
		if($addrid == 0 && $business != 0){
			$sql = $dsql->SetQuery("SELECT `parentid` FROM `#@__site_area` WHERE `id` = ".$business);
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$huoniaoTag->assign('addrid', $ret[0]['parentid']);
			}
		}


		$addrid = $business ? $business : $addrid;
		if(!empty($addrid)){
			global $data;
			$data = "";
			$addrArr = getParentArr("site_area", $addrid);
			$addrArr = array_reverse(parent_foreach($addrArr, "typename"));
			$loupan_seotitle = join("", $addrArr);
		}
		//地铁
		$huoniaoTag->assign('subway', $subway);
		$huoniaoTag->assign('station', $station);

		if(!empty($subway)){
			$sql = $dsql->SetQuery("SELECT `title` FROM `#@__site_subway` WHERE `id` = ".$subway);
			$results = $dsql->dsqlOper($sql, "results");
			if($results){
				$list_typename = $results[0]['title'];
				$loupan_seotitle = $list_typename;
			}
		}
		if(!empty($station)){
			$sql = $dsql->SetQuery("SELECT `title` FROM `#@__site_subway_station` WHERE `id` = ".$station);
			$results = $dsql->dsqlOper($sql, "results");
			if($results){
				$list_typename = $results[0]['title'];
				$loupan_seotitle .= $list_typename;
			}
		}


		//单价
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


		//类型
		if(!empty($typeid)){
			$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__houseitem` WHERE `id` = $typeid");
			$typename = getCache("house_item", $sql, 0, array("name" => "typename", "sign" => $typeid));
			if($typename){
				$loupan_seotitle .= $typename;
			}
		}
		$huoniaoTag->assign('typeid', $typeid);


		//销售状态
		switch ($salestate) {
			case "0":
				$salestatename = "待售";
				break;
			case "1":
				$salestatename = "在售";
				break;
			case "2":
				$salestatename = "尾盘";
				break;
			case "3":
				$salestatename = "售完";
				break;
			case "":
				$salestatename = "销售状态";
				break;
			default:
				$salestatename = "销售状态";
				break;
		}
		$huoniaoTag->assign('salestate', $salestate);
		$huoniaoTag->assign('salestatename', $salestatename);
		if($salestate != ""){
			$loupan_seotitle .= $salestatename;
		}


		//开盘时间
		switch ($times) {
			case 'today':
				$timesname = "今日开盘";
				break;
			case 'tomorrow':
				$timesname = "明日开盘";
				break;
			case 'yesterday':
				$timesname = "昨日开盘";
				break;
			case 'tmonth':
				$timesname = "本月开盘";
				break;
			case 'nmonth':
				$timesname = "下月开盘";
				break;
			case 'lmonth':
				$timesname = "上月开盘";
				break;
			default:
				$timesname = "开盘时间";
				break;
		}
		$huoniaoTag->assign('times', $times);
		$huoniaoTag->assign('timesname', $timesname);
		if(!empty($times)){
			$loupan_seotitle .= $timesname;
		}


		//装修
		$zhuangxiuname = "装修情况";
		if(!empty($zhuangxiu)){
			$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__houseitem` WHERE `id` = $zhuangxiu");
			$typename = getCache("house_item", $sql, 0, array("name" => "typename", "sign" => $zhuangxiu));
			if($typename){
				$loupan_seotitle .= $typename;
				$zhuangxiuname = $typename;
			}
		}
		$huoniaoTag->assign('zhuangxiu', $zhuangxiu);
		$huoniaoTag->assign('zhuangxiuname', $zhuangxiuname);

		//特色
		$featurename = "楼盘特色";
		if(!empty($feature)){
			$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__houseitem` WHERE `id` = $feature");
			$typename = getCache("house_item", $sql, 0, array("name" => "typename", "sign" => $feature));
			if($typename){
				$loupan_seotitle .= $typename;
				$featurename = $typename;
			}
		}
		$huoniaoTag->assign('feature', $feature);
		$huoniaoTag->assign('featurename', $featurename);


		//建筑类型
		if(!empty($buildtype)){
			$loupan_seotitle .= $buildtype;
		}
		$huoniaoTag->assign('buildtype', $buildtype);


		//开团时间
		switch ($tuandate) {
			case 'today':
				$tuandatename = "今日开团";
				break;
			case 'tomorrow':
				$tuandatename = "明日开团";
				break;
			case 'yesterday':
				$tuandatename = "昨日开团";
				break;
			case 'tmonth':
				$tuandatename = "本月开团";
				break;
			case 'nmonth':
				$tuandatename = "下月开团";
				break;
			case 'lmonth':
				$tuandatename = "上月开团";
				break;
			default:
				$tuandatename = "开团时间";
				break;
		}
		$huoniaoTag->assign('tuandate', $tuandate);
		$huoniaoTag->assign('tuandatename', $tuandatename);
		if(!empty($tuandate)){
			$loupan_seotitle .= $tuandatename;
		}


		//筛选
		$filterArr = explode(",", $filter);
		$newFilter = array();
		foreach ($filterArr as $key => $value) {
			if(!empty($value)){
				array_push($newFilter, $value);
			}
		}
		$filter = join(",", $newFilter);
		if(!empty($filter)){
			$filterName = "";
			if(in_array("tuan", $newFilter)){
				$filterName = "团购";
			}elseif(in_array("hot", $newFilter)){
				$filterName = "热销";
			}elseif(in_array("rec", $newFilter)){
				$filterName = "推荐";
			}
			$loupan_seotitle .= $filterName;
		}
		$huoniaoTag->assign('filter', $filter);
		$huoniaoTag->assign('filterArr', $newFilter);


		//关键字
		$huoniaoTag->assign('keywords', $keywords);

		//视频
        $huoniaoTag->assign('video', (int)$video);

		//全景
        $huoniaoTag->assign('qj', (int)$qj);

		//沙盘
        $huoniaoTag->assign('shapan', (int)$shapan);

		//分页
		$atpage = $page == 0 ? 1 : $page;
		global $page;
		$page = $atpage;

		$huoniaoTag->assign('page', $page);

		$huoniaoTag->assign('from', $from);
		$huoniaoTag->assign('orderby', $orderby);
		$huoniaoTag->assign('loupan_seotitle', $loupan_seotitle);

		$huoniaoTag->assign('tuan', (int)$tuan);

		return;


	//地图找房
	}elseif($action == "map"){

		$huoniaoTag->assign('keywords', $keywords);


	//楼盘详细信息
	}elseif($action == "loupan-detail" ||
					$action == "loupan-info" ||
					$action == "loupan-gw" ||
                    $action == "loupan-hx" ||
					$action == "loupan-hx-detail" ||
					$action == "loupan-album" ||
					$action == "loupan-album-detail" ||
					$action == "loupan-qj" ||
					$action == "loupan-qj-detail" ||
					$action == "loupan-news" ||
					$action == "loupan-news-detail" ||
					$action == "loupan-video" ||
					$action == "loupan-video-detail" ||
					$action == "loupan-adviser"
	){

		$detailHandels = new handlers($service, "loupanDetail");
		$detailConfig  = $detailHandels->getHandle($id);

		if(is_array($detailConfig) && $detailConfig['state'] == 100){
			$detailConfig  = $detailConfig['info'];
			if(is_array($detailConfig)){
				detailCheckCity($service, $detailConfig['id'], $detailConfig['cityid'], $action);
				//输出详细信息
				foreach ($detailConfig as $key => $value) {
					$huoniaoTag->assign('detail_'.$key, $value);
				}

				//更新阅读次数
				global $dsql;
				$sql = $dsql->SetQuery("UPDATE `#@__".$service."_loupan` SET `views` = `views` + 1 WHERE `id` = ".$id);
				$dsql->dsqlOper($sql, "update");
                $uid = $userLogin->getMemberID();
                if($uid >0) {
                    $uphistoryarr = array(
                        'module'    => 'house',
                        'uid'       => $uid,
                        'aid'       => $id,
                        'fuid'      => 0,
                        'module2'   => 'loupanDetail',
                    );
                    /*更新浏览足迹表   */
                    updateHistoryClick($uphistoryarr);
                }

				//浏览记录
				$loupanHistory = array();
				$loupanHistoryCookie = GetCookie("house_loupan_history");
				if(!empty($loupanHistoryCookie)){
					$loupanHistory = explode(",", $loupanHistoryCookie);

					$key = array_search($id, $loupanHistory);
					if($key !== false){
						array_splice($loupanHistory, $key, 1);
					}

					array_unshift($loupanHistory, $id);

					//最多保存10个楼盘
					if(count($loupanHistory) > 10){
						array_pop($loupanHistory);
					}
				}else{
					$loupanHistory[] = $id;
				}

				//保存一月的浏览历史
				global $cfg_cookiePath;
				PutCookie("house_loupan_history", join(",", $loupanHistory), 1 * 60 * 60 * 24 * 30, $cfg_cookiePath);


				//如果是户型页面，输出页面传递的room值
				if($action == "loupan-hx"){
					$room = (int)$room;
					$huoniaoTag->assign('room', $room);
				}

				//户型详情页，输出户型详细信息
				if($action == "loupan-hx-detail"){
					if(empty($aid)){
						header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
						die;
					}

					$detailHandels = new handlers($service, "apartmentDetail");
					$detailConfig  = $detailHandels->getHandle($aid);

					if(is_array($detailConfig) && $detailConfig['state'] == 100){
						$detailConfig  = $detailConfig['info'];
						if(is_array($detailConfig)){
							//输出详细信息
							foreach ($detailConfig as $key => $value) {
								$huoniaoTag->assign('hx_'.$key, $value);
							}
						}
					}
				}


				//如果是相册页面，输出页面传递的album值
				if($action == "loupan-album"){
					$album = (int)$album;
					$huoniaoTag->assign('album', $album);
				}

				//相册详情页，输出户型详细信息
				if($action == "loupan-album-detail"){
					if(empty($aid)){
						header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
						die;
					}

					$page = (int)$page;
					$huoniaoTag->assign('atpage', $page);

					$detailHandels = new handlers($service, "albumList");
					$detailConfig  = $detailHandels->getHandle(array("act" => "loupan", "loupanid" => $id, "id" => $aid));

					if(is_array($detailConfig) && $detailConfig['state'] == 100){
						$detailConfig  = $detailConfig['info'];
						if(is_array($detailConfig)){
							$huoniaoTag->assign("album", $detailConfig['list'][0]);
						}
					}
				}

				//全景看房详情页，输出全景详细信息
				if($action == "loupan-qj-detail"){
					if(empty($aid)){
						header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
						die;
					}

					$detailHandels = new handlers($service, "loupanQjDetail");
					$detailConfig  = $detailHandels->getHandle($aid);

					if(is_array($detailConfig) && $detailConfig['state'] == 100){
						$detailConfig  = $detailConfig['info'];
						if(is_array($detailConfig)){

							//更新浏览次数
							global $dsql;
							$sql = $dsql->SetQuery("UPDATE `#@__".$service."_360qj` SET `click` = `click` + 1 WHERE `id` = ".$aid);
							$dsql->dsqlOper($sql, "update");

							//输出详细信息
							foreach ($detailConfig as $key => $value) {
								$huoniaoTag->assign('qj_'.$key, $value);
							}
						}
					}
				}

				//动态详情页，输出详细信息
				if($action == "loupan-news-detail"){
					if(empty($aid)){
						header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
						die;
					}

					//更新阅读次数
                    global $dsql;
                    $sql = $dsql->SetQuery("UPDATE `#@__house_loupannews` SET `click` = `click` + 1 WHERE `id` = ".$aid);
                    $dsql->dsqlOper($sql, "update");

					$detailHandels = new handlers($service, "loupanNewsDetail");
					$detailConfig  = $detailHandels->getHandle($aid);

					if(is_array($detailConfig) && $detailConfig['state'] == 100){
						$detailConfig  = $detailConfig['info'];
						if(is_array($detailConfig)){
							//输出详细信息
							foreach ($detailConfig[0] as $key => $value) {
								$huoniaoTag->assign('news_'.$key, $value);
							}
						}
					}
				}

				//视频看房详情页，输出全景详细信息
				if($action == "loupan-video-detail"){
					if(empty($aid)){
						header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
						die;
					}

					$detailHandels = new handlers($service, "loupanVideoDetail");
					$detailConfig  = $detailHandels->getHandle($aid);

					if(is_array($detailConfig) && $detailConfig['state'] == 100){
						$detailConfig  = $detailConfig['info'];
						if(is_array($detailConfig)){
							//更新浏览次数
							global $dsql;
							$sql = $dsql->SetQuery("UPDATE `#@__".$service."_loupanvideo` SET `click` = `click` + 1 WHERE `id` = ".$aid);
							$dsql->dsqlOper($sql, "update");

							//输出详细信息
							foreach ($detailConfig as $key => $value) {
								$huoniaoTag->assign('video_'.$key, $value);
							}
						}
					}
				}



			}
		}else{
			header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
		}
		return;



	//小区列表
	}elseif($action == "community"){

		$community_seotitle = "";

		//伪静态URL参数分解
		//community-addrid-business-subway-station-price-typeid-tags-keywords-page.html
		$data = $_GET['data'];
		if(!empty($data)){

			$data = explode("-", $data);

			$addrid    = (int)$data[0];
			$business  = (int)$data[1];
			$subway    = (int)$data[2];
			$station   = (int)$data[3];
			$price     = convertArrToStrWithComma(RemoveXSS($data[4]));
			$typeid    = (int)$data[5];
			$tags      = RemoveXSS($data[6]);
			$keywords  = RemoveXSS($data[7]);
			$page      = (int)$data[8];

		}


		//区域
		$huoniaoTag->assign('addrid', $addrid);
		$huoniaoTag->assign('business', $business);

		if($addrid == 0 && $business != 0){
			$sql = $dsql->SetQuery("SELECT `parentid` FROM `#@__site_area` WHERE `id` = ".$business);
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$huoniaoTag->assign('addrid', $ret[0]['parentid']);
			}
		}


		$addrid = $business ? $business : $addrid;
		if(!empty($addrid)){
			global $data;
			$data = "";
			$addrArr = getParentArr("site_area", $addrid);
			$addrArr = array_reverse(parent_foreach($addrArr, "typename"));
			$community_seotitle = join("", $addrArr);
		}


		//地铁
		$huoniaoTag->assign('subway', $subway);
		$huoniaoTag->assign('station', $station);

		if(!empty($subway)){
			$sql = $dsql->SetQuery("SELECT `title` FROM `#@__site_subway` WHERE `id` = ".$subway);
			$results = $dsql->dsqlOper($sql, "results");
			if($results){
				$list_typename = $results[0]['title'];
				$community_seotitle = $list_typename;
			}
		}
		if(!empty($station)){
			$sql = $dsql->SetQuery("SELECT `title` FROM `#@__site_subway_station` WHERE `id` = ".$station);
			$results = $dsql->dsqlOper($sql, "results");
			if($results){
				$list_typename = $results[0]['title'];
				$community_seotitle .= $list_typename;
			}
		}


		//单价
		if(!empty($price)){
			$priceArr = explode(",", $price);
			if(empty($priceArr[0])){
				$community_seotitle .= ($priceArr[1] >= 10 ? $priceArr[1]/10 . "万" : $priceArr[1] . "千") . "以下";
			}elseif(empty($priceArr[1])){
				$community_seotitle .= ($priceArr[0] >= 10 ? $priceArr[0]/10 . "万" : $priceArr[0] . "千") . "以上";
			}elseif(!empty($priceArr[0]) && !empty($priceArr[1])){
				$community_seotitle .= ($priceArr[0] >= 10 ? $priceArr[0]/10 . "万" : $priceArr[0] . "千")."-".($priceArr[1] >= 10 ? $priceArr[1]/10 . "万" : $priceArr[1] . "千");
			}
		}

		$huoniaoTag->assign('price', $price);
		$huoniaoTag->assign('priceArr', $priceArr);


		//类型
		if(!empty($typeid)){
			$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__houseitem` WHERE `id` = $typeid");
			$typename = getCache("house_item", $sql, 0, array("name" => "typename", "sign" => $typeid));
			if($typename){
				$community_seotitle .= $typename;
			}
		}
		$huoniaoTag->assign('typeid', $typeid);


		//类型
		if(!empty($tags)){
			$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__houseitem` WHERE `id` = $tags");
			$typename = getCache("house_item", $sql, 0, array("name" => "typename", "sign" => $tags));
			if($typename){
				$community_seotitle .= $typename;
			}
		}
		$huoniaoTag->assign('tags', $tags);


		//关键字
		$huoniaoTag->assign('keywords', $keywords);

		//分页
		$atpage = $page == 0 ? 1 : $page;
		global $page;
		$page = $atpage;

		$huoniaoTag->assign('page', $page);

		//楼龄
        //对数据安全过滤
        $buildage = $_GET['buildage'];
        if($buildage){
            $buildageArr = explode(",", $buildage);
            if($buildageArr){
                $buildage0 = (int)$buildageArr[0];
                $buildage1 = (int)$buildageArr[1];
                $buildage = $buildage0.",".$buildage1;
            }
        }
		$huoniaoTag->assign('buildage', $buildage);
		//热门小区
		$huoniaoTag->assign('hot', $hot);

		$huoniaoTag->assign('from', $from);
		$huoniaoTag->assign('orderby', $orderby);
		$huoniaoTag->assign('community_seotitle', $community_seotitle);

		return;



	//小区详细信息
	}elseif(
		$action == "community-detail" ||
		$action == "community-hx" ||
		$action == "community-hx-detail" ||
		$action == "community-album" ||
		$action == "community-album-detail" ||
		$action == "community-sale" ||
		$action == "community-zu" ||
		$action == "community-xzl" ||
		$action == "community-sp" ||
		$action == "community-cf"
	){

		$detailHandels = new handlers($service, "communityDetail");
		$detailConfig  = $detailHandels->getHandle($id);

		if(is_array($detailConfig) && $detailConfig['state'] == 100){
			$detailConfig  = $detailConfig['info'];
			if(is_array($detailConfig)){
				detailCheckCity($service, $detailConfig['id'], $detailConfig['cityid'], $action);
				//输出详细信息
				foreach ($detailConfig as $key => $value) {
					$huoniaoTag->assign('detail_'.$key, $value);
				}

				//如果是户型页面，输出页面传递的room值
				if($action == "community-hx"){
					$room = (int)$room;
					$huoniaoTag->assign('room', $room);
				}

				//户型详情页，输出户型详细信息
				if($action == "community-hx-detail"){
					if(empty($aid)){
						header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
						die;
					}

					$detailHandels = new handlers($service, "apartmentDetail");
					$detailConfig  = $detailHandels->getHandle($aid);

					if(is_array($detailConfig) && $detailConfig['state'] == 100){
						$detailConfig  = $detailConfig['info'];
						if(is_array($detailConfig)){
							//输出详细信息
							foreach ($detailConfig as $key => $value) {
								$huoniaoTag->assign('hx_'.$key, $value);
							}
						}
					}
				}


				//如果是相册页面，输出页面传递的album值
				if($action == "community-album"){
					$album = (int)$album;
					$huoniaoTag->assign('album', $album);
				}

				//相册详情页，输出户型详细信息
				if($action == "community-album-detail"){
					if(empty($aid)){
						header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
						die;
					}

					$page = (int)$page;
					$huoniaoTag->assign('atpage', $page);

					$detailHandels = new handlers($service, "albumList");
					$detailConfig  = $detailHandels->getHandle(array("act" => "community", "loupanid" => $id, "id" => $aid));

					if(is_array($detailConfig) && $detailConfig['state'] == 100){
						$detailConfig  = $detailConfig['info'];
						if(is_array($detailConfig)){
							$huoniaoTag->assign("album", $detailConfig['list'][0]);
						}
					}
				}

				//更新浏览次数
				global $dsql;
				$sql = $dsql->SetQuery("UPDATE `#@__house_community` SET `click` = `click` + 1 WHERE `id` = ".$id);
				$dsql->dsqlOper($sql, "update");

			}
		}else{
			header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
		}
		return;



	//求租/求购列表
    }elseif($action == "demand"){

		//伪静态URL参数分解
		//demand-addrid-business-type-act-keywords-page.html
		$data = $_GET['data'];
		$type = '';
		if(!empty($data)){

			$data = explode("-", $data);

			$addrid    = (int)$data[0];
			$business  = (int)$data[1];
			$type      = RemoveXSS($data[2]);
			$act       = RemoveXSS($data[3]);
			$keywords  = RemoveXSS($data[4]);
			$page      = (int)$data[5];

		}

		if($type !== ''){
			$type = (int)$type;
		}


		//区域
		$huoniaoTag->assign('addrid', $addrid);
		$huoniaoTag->assign('business', $business);

		if($addrid == 0 && $business != 0){
			$sql = $dsql->SetQuery("SELECT `parentid` FROM `#@__site_area` WHERE `id` = ".$business);
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$huoniaoTag->assign('addrid', $ret[0]['parentid']);
			}
		}


		$addrid = $business ? $business : $addrid;
		if(!empty($addrid)){
			global $data;
			$data = "";
			$addrArr = getParentArr("site_area", $addrid);
			$addrArr = array_reverse(parent_foreach($addrArr, "typename"));
			$addrname = $addrArr;
		}

		$huoniaoTag->assign('type', $type);

		$actname = '';
		switch ($act) {
			case 1:
				$actname = '新房';
				break;
			case 2:
				$actname = '二手房';
				break;
			case 3:
				$actname = '出租房';
				break;
			case 4:
				$actname = '写字楼';
				break;
			case 5:
				$actname = '商铺';
				break;
			case 6:
				$actname = '厂房/仓库';
				break;
		}
		$huoniaoTag->assign('act', $act);
		$huoniaoTag->assign('actname', $actname);
		$huoniaoTag->assign('keywords', $keywords);
		$huoniaoTag->assign('typeid', $typeid);

		//分页
		$atpage = $page == 0 ? 1 : $page;
		global $page;
		$page = $atpage;
		$huoniaoTag->assign('page', $page);
		$huoniaoTag->assign('orderby', (int)$orderby);


	//二手房列表
    }elseif($action == "sale"){

		$sale_seotitle = "";

		//伪静态URL参数分解
		//sale-addrid-business-subway-station-price-area-room-direction-buildage-floor-zhuangxiu-flags-keywords-page.html
		$data = $_GET['data'];
		if(!empty($data)){

			$data = explode("-", $data);

			$addrid    = (int)$data[0];
			$business  = (int)$data[1];
			$subway    = (int)$data[2];
			$station   = (int)$data[3];
			$price     = convertArrToStrWithComma(RemoveXSS($data[4]));
			$area      = RemoveXSS($data[5]);
			$room      = RemoveXSS($data[6]);
			$direction = RemoveXSS($data[7]);
			$buildage  = RemoveXSS($data[8]);
			$floor     = RemoveXSS($data[9]);
			$zhuangxiu = RemoveXSS($data[10]);
			$flags     = RemoveXSS($data[11]);
			$keywords  = RemoveXSS($data[12]);
			$type  	   = RemoveXSS($data[13]);
			$page      = (int)$data[14];

		}


		//区域
		$huoniaoTag->assign('addrid', $addrid);
		$huoniaoTag->assign('business', $business);

		if($addrid == 0 && $business != 0){
			$sql = $dsql->SetQuery("SELECT `parentid` FROM `#@__site_area` WHERE `id` = ".$business);
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$huoniaoTag->assign('addrid', $ret[0]['parentid']);
			}
		}


		$addrid = $business ? $business : $addrid;
		if(!empty($addrid)){
			global $data;
			$data = "";
			$addrArr = getParentArr("site_area", $addrid);
			$addrArr = array_reverse(parent_foreach($addrArr, "typename"));
			$sale_seotitle = join("", $addrArr);
		}


		//地铁
		$huoniaoTag->assign('subway', $subway);
		$huoniaoTag->assign('station', $station);

		if(!empty($subway)){
			$sql = $dsql->SetQuery("SELECT `title` FROM `#@__site_subway` WHERE `id` = ".$subway);
			$results = $dsql->dsqlOper($sql, "results");
			if($results){
				$list_typename = $results[0]['title'];
				$sale_seotitle = $list_typename;
			}
		}
		if(!empty($station)){
			$sql = $dsql->SetQuery("SELECT `title` FROM `#@__site_subway_station` WHERE `id` = ".$station);
			$results = $dsql->dsqlOper($sql, "results");
			if($results){
				$list_typename = $results[0]['title'];
				$sale_seotitle .= $list_typename;
			}
		}


		//单价
		if(!empty($price)){
			$priceArr = explode(",", $price);
			if(empty($priceArr[0])){
				$sale_seotitle .= $priceArr[1] . "万以下";
			}elseif(empty($priceArr[1])){
				$sale_seotitle .= $priceArr[0] . "万以上";
			}elseif(!empty($priceArr[0]) && !empty($priceArr[1])){
				$sale_seotitle .= $priceArr[0] . "万-" . $priceArr[1] . "万";
			}
		}
		$huoniaoTag->assign('price', $price);
		$huoniaoTag->assign('priceArr', $priceArr);


		//面积
		if(!empty($area)){
			$areaArr = explode(",", $area);
			if(empty($areaArr[0])){
				$sale_seotitle .= $areaArr[1] . "㎡以下";
			}elseif(empty($areaArr[1])){
				$sale_seotitle .= $areaArr[0] . "㎡以上";
			}elseif(!empty($areaArr[0]) && !empty($areaArr[1])){
				$sale_seotitle .= $areaArr[0] . "㎡-" . $areaArr[1] . "㎡";
			}
		}
		$huoniaoTag->assign('area', $area);
		$huoniaoTag->assign('areaArr', $areaArr);


		//户型
		if($room === "0"){
			$sale_seotitle .= "五居室以上";
		}elseif(!empty($room)){
			$sale_seotitle .= numberDaxie(array("number" => $room))."居室";
		}
		$huoniaoTag->assign('room', $room);


		//朝向
		if(!empty($direction)){
			$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__houseitem` WHERE `id` = $direction");
			$typename = getCache("house_item", $sql, 0, array("name" => "typename", "sign" => $direction));
			if($typename){
				$sale_seotitle .= "朝".$typename;
				$huoniaoTag->assign('directionName', "朝".$typename);
			}
		}
		$huoniaoTag->assign('direction', $direction);


		//楼龄
		if(!empty($buildage)){
			$buildageArr = explode(",", $buildage);
			if(empty($buildageArr[0])){
				$sale_seotitle .= $buildageArr[1] . "年以内";
				$huoniaoTag->assign('buildageName', $buildageArr[1] . "年以内");
			}elseif(empty($buildageArr[1])){
				$sale_seotitle .= $buildageArr[0] . "年以上";
				$huoniaoTag->assign('buildageName', $buildageArr[1] . "年以上");
			}elseif(!empty($buildageArr[0]) && !empty($buildageArr[1])){
				$sale_seotitle .= $buildageArr[0] . "-" . $buildageArr[1] . "年";
				$huoniaoTag->assign('buildageName', $buildageArr[0] . "-" . $buildageArr[1] . "年");
			}
		}
		$huoniaoTag->assign('buildage', $buildage);


		//楼层
		if(!empty($floor)){
			$floorArr = explode(",", $floor);
			if(empty($floorArr[0])){
				$sale_seotitle .= $floorArr[1] . "层以下";
				$huoniaoTag->assign('floorName', $floorArr[1] . "层以下");
			}elseif(empty($floorArr[1])){
				$sale_seotitle .= $floorArr[0] . "层以上";
				$huoniaoTag->assign('floorName', $floorArr[0] . "层以上");
			}elseif(!empty($floorArr[0]) && !empty($floorArr[1])){
				$sale_seotitle .= $floorArr[0] . "-" . $floorArr[1] . "层";
				$huoniaoTag->assign('floorName', $floorArr[0] . "-" . $floorArr[1] . "层");
			}
		}
		$huoniaoTag->assign('floor', $floor);


		//装修
		if(!empty($zhuangxiu)){
			$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__houseitem` WHERE `id` = $zhuangxiu");
			$typename = getCache("house_item", $sql, 0, array("name" => "typename", "sign" => $zhuangxiu));
			if($typename){
				$sale_seotitle .= $typename;
				$huoniaoTag->assign('zhuangxiuName', $typename);
			}
		}
		$huoniaoTag->assign('zhuangxiu', $zhuangxiu);


		//附加属性
		$flagArr = explode(",", $flags);
		$newFlag = array();
		foreach ($flagArr as $key => $value) {
			if($value !== ""){
				array_push($newFlag, $value);
			}
		}
		$flag = join(",", $newFlag);
		if($flag !== ""){
			$flagName = "";
			if(in_array("0", $newFlag)){
				$flagName = "急售";
			}elseif(in_array("1", $newFlag)){
				$flagName = "免税";
			}elseif(in_array("2", $newFlag)){
				$flagName = "地铁";
			}elseif(in_array("3", $newFlag)){
				$flagName = "校区房";
			}elseif(in_array("4", $newFlag)){
				$flagName = "满五年";
			}elseif(in_array("5", $newFlag)){
				$flagName = "推荐";
			}
			$loupan_seotitle .= $flagName;
		}
		$huoniaoTag->assign('flags', $flags);
		$huoniaoTag->assign('flagArr', $newFlag);
		//视频
        	$huoniaoTag->assign('video', (int)$video);
        	//全景
        	$huoniaoTag->assign('qj', (int)$qj);


		//关键字
		$huoniaoTag->assign('keywords', $keywords);

		// 类型
		$huoniaoTag->assign('type', $type);

		//分页
		$atpage = $page == 0 ? 1 : $page;
		global $page;
		$page = $atpage;

		$huoniaoTag->assign('page', $page);

		$huoniaoTag->assign('from', $from);
		$huoniaoTag->assign('orderby', $orderby);
		$huoniaoTag->assign('sale_seotitle', $sale_seotitle);

		$huoniaoTag->assign('community', (int)$community);
		$huoniaoTag->assign('comid', (int)$comid);

		return;



	//求租求购详细信息
	}elseif($action == "demand-detail"){

		$detailHandels = new handlers($service, "demandDetail");
		$detailConfig  = $detailHandels->getHandle($id);

		if(is_array($detailConfig) && $detailConfig['state'] == 100){
			$detailConfig  = $detailConfig['info'];
			if(is_array($detailConfig)){
				detailCheckCity($service, $detailConfig['id'], $detailConfig['cityid'], $action);
				//输出详细信息
				foreach ($detailConfig as $key => $value) {
					$huoniaoTag->assign('detail_'.$key, $value);
				}
			}
		}else{
			header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
		}
		return;



        //二手房详细信息
    }elseif($action == "sale-detail"){

        $detailHandels = new handlers($service, "saleDetail");
        $detailConfig  = $detailHandels->getHandle($id);

        if(is_array($detailConfig) && $detailConfig['state'] == 100){
            $detailConfig  = $detailConfig['info'];
            if(is_array($detailConfig)){
                detailCheckCity($service, $detailConfig['id'], $detailConfig['cityid'], $action);
                //输出详细信息
                foreach ($detailConfig as $key => $value) {
                    $huoniaoTag->assign('detail_'.$key, $value);
                }

                //更新浏览次数
                global $dsql;
                $sql = $dsql->SetQuery("UPDATE `#@__house_sale` SET `click` = `click` + 1 WHERE `id` = ".$id);
                $dsql->dsqlOper($sql, "update");

                $uid = $userLogin->getMemberID();
                if($uid >0 && $uid!=$detailConfig['user']['uid']) {
                    $uphistoryarr = array(
                        'module'    => 'house',
                        'uid'       => $uid,
                        'aid'       => $id,
                        'fuid'      => $detailConfig['user']['uid'],
                        'module2'   => 'saleDetail',
                    );
                    /*更新浏览足迹表   */
                    updateHistoryClick($uphistoryarr);
                }

            }
        }else{
            header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
        }
        return;



	//出租房列表
	}elseif($action == "zu"){

		$zu_seotitle = "";

		//伪静态URL参数分解
		//zu-addrid-business-subway-station-price-room-zhuangxiu-rentype-type-keywords-page.html
		$data = $_GET['data'];
		if(!empty($data)){

			$data = explode("-", $data);

			$addrid    = (int)$data[0];
			$business  = (int)$data[1];
			$subway    = (int)$data[2];
			$station   = (int)$data[3];
			$price     = convertArrToStrWithComma(RemoveXSS($data[4]));
			$room      = RemoveXSS($data[5]);
			$zhuangxiu = RemoveXSS($data[6]);
			$rentype   = (int)$data[7];
			$type      = (int)$data[8];
			$keywords  = RemoveXSS($data[9]);
			$page      = (int)$data[10];

		}


		//区域
		$huoniaoTag->assign('addrid', $addrid);
		$huoniaoTag->assign('business', $business);

		if($addrid == 0 && $business != 0){
			$sql = $dsql->SetQuery("SELECT `parentid` FROM `#@__site_area` WHERE `id` = ".$business);
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$huoniaoTag->assign('addrid', $ret[0]['parentid']);
			}
		}


		$addrid = $business ? $business : $addrid;
		if(!empty($addrid)){
			global $data;
			$data = "";
			$addrArr = getParentArr("site_area", $addrid);
			$addrArr = array_reverse(parent_foreach($addrArr, "typename"));
			$zu_seotitle = join("", $addrArr);
		}


		//地铁
		$huoniaoTag->assign('subway', $subway);
		$huoniaoTag->assign('station', $station);

		if(!empty($subway)){
			$sql = $dsql->SetQuery("SELECT `title` FROM `#@__site_subway` WHERE `id` = ".$subway);
			$results = $dsql->dsqlOper($sql, "results");
			if($results){
				$list_typename = $results[0]['title'];
				$zu_seotitle = $list_typename;
			}
		}
		if(!empty($station)){
			$sql = $dsql->SetQuery("SELECT `title` FROM `#@__site_subway_station` WHERE `id` = ".$station);
			$results = $dsql->dsqlOper($sql, "results");
			if($results){
				$list_typename = $results[0]['title'];
				$zu_seotitle .= $list_typename;
			}
		}

		$currency = echoCurrency(array("type" => "short"));

		//租金
		if(!empty($price)){
			$priceArr = explode(",", $price);
			if(empty($priceArr[0])){
				$zu_seotitle .= $priceArr[1] . "00{$currency}以下";
			}elseif(empty($priceArr[1])){
				$zu_seotitle .= $priceArr[0] . "00{$currency}以上";
			}elseif(!empty($priceArr[0]) && !empty($priceArr[1])){
				$zu_seotitle .= $priceArr[0] . "00-" . $priceArr[1] . "00{$currency}";
			}
		}
		$huoniaoTag->assign('price', $price);
		 $huoniaoTag->assign('priceArr', $priceArr);

		//户型
		if($room == '0'){
			$zu_seotitle .= "五居室以上";
		}elseif(!empty($room)){
			$zu_seotitle .= numberDaxie(array("number" => $room))."居室";
		}
		$huoniaoTag->assign('room', $room);

		//装修
		if(!empty($zhuangxiu)){
			$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__houseitem` WHERE `id` = $zhuangxiu");
			$typename = getCache("house_item", $sql, 0, array("name" => "typename", "sign" => $zhuangxiu));
			if($typename){
				$zu_seotitle .= $typename;
				$huoniaoTag->assign('zhuangxiuName', $typename);
			}
		}
		$huoniaoTag->assign('zhuangxiu', $zhuangxiu);


		//类型
		if(!empty($rentype)){
			if($rentype == '1'){
				$zu_seotitle .= "整租";
			}elseif($rentype == '2'){
				$zu_seotitle .= "合租";
			}
		}
		$huoniaoTag->assign('rentype', $rentype);


		//发布人类型
		if(!empty($type)){
			if($type == '1'){
				$zu_seotitle .= "个人房源";
			}elseif($type == '2'){
				$zu_seotitle .= "中介房源";
			}
		}
		$huoniaoTag->assign('type', $type);
	        //视频
	        $huoniaoTag->assign('video', (int)$video);
	        //全景
	        $huoniaoTag->assign('qj', (int)$qj);

		//关键字
		$huoniaoTag->assign('keywords', $keywords);

		//分页
		$atpage = $page == 0 ? 1 : $page;
		global $page;
		$page = $atpage;

		$huoniaoTag->assign('page', $page);

		$huoniaoTag->assign('from', $from);
		$huoniaoTag->assign('orderby', $orderby);
		$huoniaoTag->assign('zu_seotitle', $zu_seotitle);

		$huoniaoTag->assign('community', (int)$community);
        $huoniaoTag->assign('comid', (int)$comid);

		return;



	//出租房详细信息
	}elseif($action == "zu-detail"){

		$detailHandels = new handlers($service, "zuDetail");
		$detailConfig  = $detailHandels->getHandle($id);

		if(is_array($detailConfig) && $detailConfig['state'] == 100){
			$detailConfig  = $detailConfig['info'];
			if(is_array($detailConfig)){
				detailCheckCity($service, $detailConfig['id'], $detailConfig['cityid'], $action);
				//输出详细信息
				foreach ($detailConfig as $key => $value) {
					$huoniaoTag->assign('detail_'.$key, $value);
				}

				//更新浏览次数
				global $dsql;
				$sql = $dsql->SetQuery("UPDATE `#@__house_zu` SET `click` = `click` + 1 WHERE `id` = ".$id);
				$dsql->dsqlOper($sql, "update");
                $uid = $userLogin->getMemberID();
                if($uid >0 && $uid!=$detailConfig['user']['uid']) {
                    $uphistoryarr = array(
                        'module'    => 'house',
                        'uid'       => $uid,
                        'aid'       => $id,
                        'fuid'      => $detailConfig['user']['uid'],
                        'module2'   => 'zuDetail',
                    );
                    /*更新浏览足迹表   */
                    updateHistoryClick($uphistoryarr);
                }
			}
		}else{
			header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
		}
		return;



	//写字楼列表
	}elseif($action == "xzl"){

		$xzl_seotitle = "";

		//伪静态URL参数分解
		//xzl-type-addrid-business-area-price-protype-usertype-keywords-page.html
		$data = $_GET['data'];
		if(!empty($data)){
			$data = explode("-", $data);
			$type     = RemoveXSS($data[0]);
			$addrid   = (int)$data[1];
			$business = (int)$data[2];
			$area     = RemoveXSS($data[3]);
			$price    = convertArrToStrWithComma(RemoveXSS($data[4]));
			$protype  = RemoveXSS($data[5]);
			$usertype = RemoveXSS($data[6]);
			$keywords = RemoveXSS($data[7]);
			$page     = (int)$data[8];
		}

		$type = $type;
		$pageType = $type == 1 ? "出售" : "出租";

		$huoniaoTag->assign('type', $type);
		$huoniaoTag->assign('pageType', $pageType);

		//区域
		$huoniaoTag->assign('addrid', $addrid);
		$huoniaoTag->assign('business', $business);

		if($addrid == 0 && $business != 0){
			$sql = $dsql->SetQuery("SELECT `parentid` FROM `#@__site_area` WHERE `id` = ".$business);
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$huoniaoTag->assign('addrid', $ret[0]['parentid']);
			}
		}


		$addrid = $business ? $business : $addrid;
		if(!empty($addrid)){
			global $data;
			$data = "";
			$addrArr = getParentArr("site_area", $addrid);
			$addrArr = array_reverse(parent_foreach($addrArr, "typename"));
			$xzl_seotitle = join("", $addrArr);
		}


		//面积
		if(!empty($area)){
			$areaArr = explode(",", $area);
			if(empty($areaArr[0])){
				$xzl_seotitle .= $areaArr[1] . "平米以下";
			}elseif(empty($areaArr[1])){
				$xzl_seotitle .= $areaArr[0] . "平米以上";
			}elseif(!empty($areaArr[0]) && !empty($areaArr[1])){
				$xzl_seotitle .= $areaArr[0] . "-" . $areaArr[1] . "平米";
			}
		}
		$huoniaoTag->assign('area', $area);
		$huoniaoTag->assign('areaArr', $areaArr);

		$currency = echoCurrency(array("type" => "short"));

		//价格
		if(!empty($price)){
			$priceArr = explode(",", $price);
			$mu = $type == 1 ? 10000 : 1;
			$mt = $type == 1 ? "万" : "{$currency}/平米•月";
			if(empty($priceArr[0])){
				$xzl_seotitle .= $priceArr[1] * $mu . $mt . "以下";
			}elseif(empty($priceArr[1])){
				$xzl_seotitle .= $priceArr[0] * $mu . $mt . "以上";
			}elseif(!empty($priceArr[0]) && !empty($priceArr[1])){
				$xzl_seotitle .= $priceArr[0] * $mu . "-" . $priceArr[1] * $mu . $mt;
			}
		}
		$huoniaoTag->assign('price', $price);
		$huoniaoTag->assign('priceArr', $priceArr);

		//类型
		if(!empty($protype)){
			$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__houseitem` WHERE `id` = $protype");
			$typename = getCache("house_item", $sql, 0, array("name" => "typename", "sign" => $protype));
			if($typename){
				$xzl_seotitle .= $typename;
				$huoniaoTag->assign('protypeName', $typename);
			}
		}
		$huoniaoTag->assign('protype', $protype);

		//发布人类型
		if($usertype !== ""){
			if($usertype == '0'){
				$xzl_seotitle .= "个人房源";
			}elseif($usertype == '1'){
				$xzl_seotitle .= "中介房源";
			}
		}
		$huoniaoTag->assign('usertype', $usertype);

		//关键字
		$huoniaoTag->assign('keywords', $keywords);

		$huoniaoTag->assign('comid', (int)$comid);
		//视频
	        $huoniaoTag->assign('video', (int)$video);
	        //全景
	        $huoniaoTag->assign('qj', (int)$qj);

		//分页
		$atpage = $page == 0 ? 1 : $page;
		global $page;
		$page = $atpage;

		$huoniaoTag->assign('page', $page);
		$huoniaoTag->assign('orderby', $orderby);
		$huoniaoTag->assign('xzl_seotitle', $xzl_seotitle);

		$house = new house(array("type" => "xzl", "dopost" => "check_hasloupan"));
		$res = $house->checkLoupan();
		$huoniaoTag->assign('loupan_xzl_id', $res ? (int)$res : 0);


		$huoniaoTag->assign('pricetype', (int)$pricetype);
		$huoniaoTag->assign('config', (int)$config);
		$huoniaoTag->assign('qj', (int)$qj);
		$huoniaoTag->assign('video', (int)$video);

		return;



	//写字楼房源详细信息
	}elseif($action == "xzl-detail"){

		$detailHandels = new handlers($service, "xzlDetail");
		$detailConfig  = $detailHandels->getHandle($id);

		if(is_array($detailConfig) && $detailConfig['state'] == 100){
			$detailConfig  = $detailConfig['info'];
			if(is_array($detailConfig)){
				detailCheckCity($service, $detailConfig['id'], $detailConfig['cityid'], $action);
				//输出详细信息
				foreach ($detailConfig as $key => $value) {
					$huoniaoTag->assign('detail_'.$key, $value);
				}

				//更新浏览次数
				global $dsql;
				$sql = $dsql->SetQuery("UPDATE `#@__house_xzl` SET `click` = `click` + 1 WHERE `id` = ".$id);
				$dsql->dsqlOper($sql, "update");
				$uid = $userLogin->getMemberID();
                if($uid >0 && $uid!=$detailConfig['user']['uid']) {
                    $uphistoryarr = array(
                        'module'    => 'house',
                        'uid'       => $uid,
                        'aid'       => $id,
                        'fuid'      => $detailConfig['user']['uid'],
                        'module2'   => 'xzlDetail',
                    );
                    /*更新浏览足迹表   */
                    updateHistoryClick($uphistoryarr);
                }
			}
		}else{
			header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
		}
		return;



	//商铺列表
	}elseif($action == "sp"){

		$sp_seotitle = "";

		//伪静态URL参数分解
		//sp-type-addrid-business-area-price-protype-industry-usertype-keywords-page.html
		$data = $_GET['data'];
		if(!empty($data)){
			$data = explode("-", $data);
			$type     = RemoveXSS($data[0]);
			$addrid   = (int)$data[1];
			$business = (int)$data[2];
			$area     = RemoveXSS($data[3]);
			$price    = convertArrToStrWithComma(RemoveXSS($data[4]));
			$protype  = RemoveXSS($data[5]);
			$industry = RemoveXSS($data[6]);
			$usertype = RemoveXSS($data[7]);
			$keywords = RemoveXSS($data[8]);
			$page     = (int)$data[9];
		}

		$type = $type;
		$pageType = $type == 1 ? "出售" : ($type == 2 ? "转让" : "出租");

		$huoniaoTag->assign('type', $type);
		$huoniaoTag->assign('pageType', $pageType);

		//区域
		$huoniaoTag->assign('addrid', $addrid);
		$huoniaoTag->assign('business', $business);

		if($addrid == 0 && $business != 0){
			$sql = $dsql->SetQuery("SELECT `parentid` FROM `#@__site_area` WHERE `id` = ".$business);
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$huoniaoTag->assign('addrid', $ret[0]['parentid']);
			}
		}


		$addrid = $business ? $business : $addrid;
		if(!empty($addrid)){
			global $data;
			$data = "";
			$addrArr = getParentArr("site_area", $addrid);
			$addrArr = array_reverse(parent_foreach($addrArr, "typename"));
			$sp_seotitle = join("", $addrArr);
		}


		//面积
		if(!empty($area)){
			$areaArr = explode(",", $area);
			if(empty($areaArr[0])){
				$sp_seotitle .= $areaArr[1] . "平米以下";
			}elseif(empty($areaArr[1])){
				$sp_seotitle .= $areaArr[0] . "平米以上";
			}elseif(!empty($areaArr[0]) && !empty($areaArr[1])){
				$sp_seotitle .= $areaArr[0] . "-" . $areaArr[1] . "平米";
			}
		}
		$huoniaoTag->assign('area', $area);
		//面积
        	$huoniaoTag->assign('areaArr', $areaArr);


		$currency = echoCurrency(array("type" => "short"));

		//价格
		if(!empty($price)){
			$priceArr = explode(",", $price);
			$mu = $type == 1 ? 1 : 1000;
			$mt = $type == 1 ? "万" : "{$currency}/月";
			if(empty($priceArr[0])){
				$sp_seotitle .= $priceArr[1] * $mu . $mt . "以下";
			}elseif(empty($priceArr[1])){
				$sp_seotitle .= $priceArr[0] * $mu . $mt . "以上";
			}elseif(!empty($priceArr[0]) && !empty($priceArr[1])){
				$sp_seotitle .= $priceArr[0] * $mu . "-" . $priceArr[1] * $mu . $mt;
			}
		}
		$huoniaoTag->assign('price', $price);

		//类型
		if(!empty($protype)){
			$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__houseitem` WHERE `id` = $protype");
			$typename = getCache("house_item", $sql, 0, array("name" => "typename", "sign" => $protype));
			if($typename){
				$sp_seotitle .= $typename;
				$huoniaoTag->assign('protypeName', $typename);
			}
		}
		$huoniaoTag->assign('protype', $protype);

		//行业
		if(!empty($industry)){
			$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__house_industry` WHERE `id` = $industry");
			$typename = getCache("house_industry", $sql, 0, array("name" => "typename", "sign" => $industry));
			if($typename){
				$sp_seotitle .= $typename;
				$huoniaoTag->assign('industryName', $typename);
			}
		}
		$huoniaoTag->assign('industry', $industry);

		//发布人类型
		if($usertype !== ""){
			if($usertype == '0'){
				$sp_seotitle .= "个人房源";
			}elseif($usertype == '1'){
				$sp_seotitle .= "中介房源";
			}
		}
		$huoniaoTag->assign('usertype', $usertype);

		//关键字
		$huoniaoTag->assign('keywords', $keywords);
		//视频
	        $huoniaoTag->assign('video', (int)$video);
	        //全景
	        $huoniaoTag->assign('qj', (int)$qj);
	        //价格
	        $huoniaoTag->assign('priceArr', $priceArr);
	        //单价、总价
	        $pricetype = (int)$pricetype;
	        $pricetype = $pricetype != 2 ? 1 : 2;
	        $huoniaoTag->assign('pricetype', $pricetype);

		$huoniaoTag->assign('comid', (int)$comid);

		//分页
		$atpage = $page == 0 ? 1 : $page;
		global $page;
		$page = $atpage;

		$huoniaoTag->assign('page', $page);
		$huoniaoTag->assign('orderby', $orderby);
		$huoniaoTag->assign('sp_seotitle', $sp_seotitle);

		$house = new house(array("type" => "sp", "dopost" => "check_hasloupan"));
		$res = $house->checkLoupan();
		$huoniaoTag->assign('loupan_sp_id', $res ? (int)$res : 0);

		return;



	//商铺房源详细信息
	}elseif($action == "sp-detail"){

		$detailHandels = new handlers($service, "spDetail");
		$detailConfig  = $detailHandels->getHandle($id);

		if(is_array($detailConfig) && $detailConfig['state'] == 100){
			$detailConfig  = $detailConfig['info'];
			if(is_array($detailConfig)){
				detailCheckCity($service, $detailConfig['id'], $detailConfig['cityid'], $action);
				//输出详细信息
				foreach ($detailConfig as $key => $value) {
					$huoniaoTag->assign('detail_'.$key, $value);
				}

				//更新浏览次数
				global $dsql;
				$sql = $dsql->SetQuery("UPDATE `#@__house_sp` SET `click` = `click` + 1 WHERE `id` = ".$id);
				$dsql->dsqlOper($sql, "update");
                $uid = $userLogin->getMemberID();
                if($uid >0 && $uid!=$detailConfig['user']['uid']) {
                    $uphistoryarr = array(
                        'module'    => 'house',
                        'uid'       => $uid,
                        'aid'       => $id,
                        'fuid'      => $detailConfig['user']['uid'],
                        'module2'   => 'spDetail',
                    );
                    /*更新浏览足迹表   */
                    updateHistoryClick($uphistoryarr);
                }
			}
		}else{
			header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
		}
		return;



	//厂房列表
	}elseif($action == "cf"){

		$cf_seotitle = "";

		//伪静态URL参数分解
		//cf-type-addrid-business-area-price-protype-usertype-keywords-page.html
		$data = $_GET['data'];
		if(!empty($data)){
			$data = explode("-", $data);
			$type     = RemoveXSS($data[0]);
			$addrid   = (int)$data[1];
			$business = (int)$data[2];
			$area     = RemoveXSS($data[3]);
			$price    = convertArrToStrWithComma(RemoveXSS($data[4]));
			$protype  = RemoveXSS($data[5]);
			$usertype = RemoveXSS($data[6]);
			$keywords = RemoveXSS($data[7]);
			$page     = (int)$data[8];
		}

		$type = $type;
		$pageType = $type == 2 ? "出售" : ($type == 1 ? "转让" : "出租");

		$huoniaoTag->assign('type', $type);
		$huoniaoTag->assign('pageType', $pageType);

		//区域
		$huoniaoTag->assign('addrid', $addrid);
		$huoniaoTag->assign('business', $business);

		if($addrid == 0 && $business != 0){
			$sql = $dsql->SetQuery("SELECT `parentid` FROM `#@__site_area` WHERE `id` = ".$business);
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$huoniaoTag->assign('addrid', $ret[0]['parentid']);
			}
		}


		$addrid = $business ? $business : $addrid;
		if(!empty($addrid)){
			global $data;
			$data = "";
			$addrArr = getParentArr("site_area", $addrid);
			$addrArr = array_reverse(parent_foreach($addrArr, "typename"));
			$cf_seotitle = join("", $addrArr);
		}


		//面积
		if(!empty($area)){
			$areaArr = explode(",", $area);
			if(empty($areaArr[0])){
				$cf_seotitle .= $areaArr[1] . "平米以下";
			}elseif(empty($areaArr[1])){
				$cf_seotitle .= $areaArr[0] . "平米以上";
			}elseif(!empty($areaArr[0]) && !empty($areaArr[1])){
				$cf_seotitle .= $areaArr[0] . "-" . $areaArr[1] . "平米";
			}
		}
		$huoniaoTag->assign('area', $area);
	        //面积
	        $huoniaoTag->assign('areaArr', $areaArr);

		$currency = echoCurrency(array("type" => "short"));

		//价格
		if(!empty($price)){
			$priceArr = explode(",", $price);
			$mu = $type == 2 ? 1 : 1000;
			$mt = $type == 2 ? "万" : "{$currency}/月";
			if(empty($priceArr[0])){
				$cf_seotitle .= $priceArr[1] * $mu . $mt . "以下";
			}elseif(empty($priceArr[1])){
				$cf_seotitle .= $priceArr[0] * $mu . $mt . "以上";
			}elseif(!empty($priceArr[0]) && !empty($priceArr[1])){
				$cf_seotitle .= $priceArr[0] * $mu . "-" . $priceArr[1] * $mu . $mt;
			}
		}
		$huoniaoTag->assign('price', $price);
		$huoniaoTag->assign('priceArr', $priceArr);
		//单价、总价
		$pricetype = (int)$pricetype;
	        $pricetype = $pricetype != 2 ? 1 : 2;
	        $huoniaoTag->assign('pricetype', (int)$pricetype);

		//类型
		if(!empty($protype)){
			$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__houseitem` WHERE `id` = $protype");
			$typename = getCache("house_item", $sql, 0, array("name" => "typename", "sign" => $protype));
			if($typename){
				$cf_seotitle .= $typename;
				$huoniaoTag->assign('protypeName', $typename);
			}
		}
		$huoniaoTag->assign('protype', $protype);

		//发布人类型
		if($usertype !== ""){
			if($usertype == '0'){
				$cf_seotitle .= "个人房源";
			}elseif($usertype == '1'){
				$cf_seotitle .= "中介房源";
			}
		}
		$huoniaoTag->assign('usertype', $usertype);

		//关键字
		$huoniaoTag->assign('keywords', $keywords);
		//视频
	        $huoniaoTag->assign('video', (int)$video);
	        //全景
	        $huoniaoTag->assign('qj', (int)$qj);

		//分页
		$atpage = $page == 0 ? 1 : $page;
		global $page;
		$page = $atpage;

		$huoniaoTag->assign('page', $page);
		$huoniaoTag->assign('orderby', $orderby);
		$huoniaoTag->assign('cf_seotitle', $cf_seotitle);
		$huoniaoTag->assign('comid', (int)$comid);
		return;



	//厂房房源详细信息
	}elseif($action == "cf-detail"){

		$detailHandels = new handlers($service, "cfDetail");
		$detailConfig  = $detailHandels->getHandle($id);

		if(is_array($detailConfig) && $detailConfig['state'] == 100){
			$detailConfig  = $detailConfig['info'];
			if(is_array($detailConfig)){
				detailCheckCity($service, $detailConfig['id'], $detailConfig['cityid'], $action);
				//输出详细信息
				foreach ($detailConfig as $key => $value) {
					$huoniaoTag->assign('detail_'.$key, $value);
				}

				//更新浏览次数
				global $dsql;
				$sql = $dsql->SetQuery("UPDATE `#@__house_cf` SET `click` = `click` + 1 WHERE `id` = ".$id);
				$dsql->dsqlOper($sql, "update");
                $uid = $userLogin->getMemberID();
                if($uid >0 && $uid!=$detailConfig['user']['uid']) {
                    $uphistoryarr = array(
                        'module'    => 'house',
                        'uid'       => $uid,
                        'aid'       => $id,
                        'fuid'      => $detailConfig['user']['uid'],
                        'module2'   => 'cfDetail',
                    );
                    /*更新浏览足迹表   */
                    updateHistoryClick($uphistoryarr);
                }
			}
		}else{
			header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
		}
		return;


	}elseif($action == "cw"){
		$sp_seotitle = "";

		//伪静态URL参数分解
		//sp-type-addrid-business-area-price-protype-industry-usertype-keywords-page.html
		$data = $_GET['data'];
		if(!empty($data)){
			$data = explode("-", $data);
			$type     = RemoveXSS($data[0]);
			$addrid   = (int)$data[1];
			$business = (int)$data[2];
			$price    = convertArrToStrWithComma(RemoveXSS($data[3]));
			$usertype = RemoveXSS($data[4]);
			$keywords = RemoveXSS($data[5]);
			$page     = (int)$data[6];
		}

		$type = $type;
		$pageType = $type == 1 ? "出售" : ($type == 2 ? "转让" : "出租");

		$huoniaoTag->assign('type', $type);
		$huoniaoTag->assign('pageType', $pageType);

		//区域
		$huoniaoTag->assign('addrid', $addrid);
		$huoniaoTag->assign('business', $business);

		if($addrid == 0 && $business != 0){
			$sql = $dsql->SetQuery("SELECT `parentid` FROM `#@__site_area` WHERE `id` = ".$business);
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$huoniaoTag->assign('addrid', $ret[0]['parentid']);
			}
		}


		$addrid = $business ? $business : $addrid;
		if(!empty($addrid)){
			global $data;
			$data = "";
			$addrArr = getParentArr("site_area", $addrid);
			$addrArr = array_reverse(parent_foreach($addrArr, "typename"));
			$sp_seotitle = join("", $addrArr);
		}


		$currency = echoCurrency(array("type" => "short"));

		//价格
		if(!empty($price)){
			$priceArr = explode(",", $price);
			$mu = $type == 1 ? 1 : 1000;
			$mt = $type == 1 ? "万" : "{$currency}/月";
			if(empty($priceArr[0])){
				$sp_seotitle .= $priceArr[1] * $mu . $mt . "以下";
			}elseif(empty($priceArr[1])){
				$sp_seotitle .= $priceArr[0] * $mu . $mt . "以上";
			}elseif(!empty($priceArr[0]) && !empty($priceArr[1])){
				$sp_seotitle .= $priceArr[0] * $mu . "-" . $priceArr[1] * $mu . $mt;
			}
		}
		$huoniaoTag->assign('price', $price);
		//价格
       		$huoniaoTag->assign('priceArr', $priceArr);

		//发布人类型
		if($usertype !== ""){
			if($usertype == '0'){
				$sp_seotitle .= "个人房源";
			}elseif($usertype == '1'){
				$sp_seotitle .= "中介房源";
			}
		}
		$huoniaoTag->assign('usertype', $usertype);

		//关键字
		$huoniaoTag->assign('keywords', $keywords);
		//视频
	        $huoniaoTag->assign('video', (int)$video);
	        //全景
	        $huoniaoTag->assign('qj', (int)$qj);
	        //面积
		$huoniaoTag->assign('area', htmlspecialchars(RemoveXSS($_GET['area'])));
		$huoniaoTag->assign('areaArr', htmlspecialchars(RemoveXSS($_GET['area'])) ? explode(',', htmlspecialchars(RemoveXSS($_GET['area']))) : array());

		//分页
		$atpage = $page == 0 ? 1 : $page;
		global $page;
		$page = $atpage;

		$huoniaoTag->assign('page', $page);
		$huoniaoTag->assign('orderby', $orderby);
		$huoniaoTag->assign('sp_seotitle', $sp_seotitle);
		$huoniaoTag->assign('comid', (int)$comid);

		return;

	//车位房源详细信息
	}elseif($action == "cw-detail"){

		$detailHandels = new handlers($service, "cwDetail");
		$detailConfig  = $detailHandels->getHandle($id);

		if(is_array($detailConfig) && $detailConfig['state'] == 100){
			$detailConfig  = $detailConfig['info'];
			if(is_array($detailConfig)){
				detailCheckCity($service, $detailConfig['id'], $detailConfig['cityid'], $action);
				//输出详细信息
				foreach ($detailConfig as $key => $value) {
					$huoniaoTag->assign('detail_'.$key, $value);
				}

				//更新浏览次数
				global $dsql;
				$sql = $dsql->SetQuery("UPDATE `#@__house_cw` SET `click` = `click` + 1 WHERE `id` = ".$id);
				$dsql->dsqlOper($sql, "update");
                $uid = $userLogin->getMemberID();
                if($uid >0 && $uid!=$detailConfig['user']['uid']) {
                    $uphistoryarr = array(
                        'module'    => 'house',
                        'uid'       => $uid,
                        'aid'       => $id,
                        'fuid'      => $detailConfig['user']['uid'],
                        'module2'   => 'cwDetail',
                    );
                    /*更新浏览足迹表   */
                    updateHistoryClick($uphistoryarr);
                }

			}
		}else{
			header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
		}
		return;

	//中介公司
	}elseif($action == "store"){

		global $page;
		$page = $_GET['data'];

		$huoniaoTag->assign('page', (int)$page);
		$huoniaoTag->assign('keywords', $keywords);

		$huoniaoTag->assign('addrid', (int)$addrid);
		$huoniaoTag->assign('business', (int)$business);
		$huoniaoTag->assign('orderby', (int)$orderby);




	//店铺详细
	}elseif($action == "store-detail" || $action == "storeDetail"){

		$huoniaoTag->assign('tpl', $tpl);

		$detailHandels = new handlers($service, "zjComDetail");
		$detailConfig  = $detailHandels->getHandle($id);
		$state = 0;
		if(is_array($detailConfig) && $detailConfig['state'] == 100){
			$detailConfig  = $detailConfig['info'];
			if(is_array($detailConfig)){

				global $template;
				if($template != 'config'){
					detailCheckCity("house", $detailConfig['id'], $detailConfig['cityid'], "store-detail");
				}

				//更新浏览次数
                if($id){
                    $sql = $dsql->SetQuery("UPDATE `#@__house_zjcom` SET `click` = `click` + 1 WHERE `id` = ".$id);
                    $dsql->dsqlOper($sql, "results");
                }

				//输出详细信息
				foreach ($detailConfig as $key => $value) {
					$huoniaoTag->assign('detail_'.$key, $value);
				}
				$state = 1;

			}
			$huoniaoTag->assign('storeState', $state);
			$huoniaoTag->assign('storeId', $id);

		}else{
			if($action == "store-detail"){
                 $errortitle = '抱歉,店铺正在审核中';
           header("location:".$cfg_secureAccess.$cfg_basehost."/error.html?msg=$errortitle");

			}
		}

		// 二手房
		if($tpl == "sale"){

			$seotitle = "";
			//伪静态URL参数分解
			//sale-addrid-business-subway-station-price-area-room-direction-buildage-floor-zhuangxiu-flags-keywords-page.html
			$data = $_GET['data'];
			if(!empty($data)){

				$data = explode("-", $data);

				$addrid    = (int)$data[0];
				$business  = (int)$data[1];
				$subway    = (int)$data[2];
				$station   = (int)$data[3];
				$price     = convertArrToStrWithComma(RemoveXSS($data[4]));
				$area      = RemoveXSS($data[5]);
				$room      = RemoveXSS($data[6]);
				$direction = RemoveXSS($data[7]);
				$buildage  = RemoveXSS($data[8]);
				$floor     = RemoveXSS($data[9]);
				$zhuangxiu = RemoveXSS($data[10]);
				$flags     = RemoveXSS($data[11]);
				$keywords  = RemoveXSS($data[12]);
				$page      = (int)$data[13];

			}


			//区域
			$huoniaoTag->assign('addrid', $addrid);
			$huoniaoTag->assign('business', $business);

			if($addrid == 0 && $business != 0){
				$sql = $dsql->SetQuery("SELECT `parentid` FROM `#@__site_area` WHERE `id` = ".$business);
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){
					$huoniaoTag->assign('addrid', $ret[0]['parentid']);
				}
			}


			$addrid = $business ? $business : $addrid;
			if(!empty($addrid)){
				global $data;
				$data = "";
				$addrArr = getParentArr("site_area", $addrid);
				$addrArr = array_reverse(parent_foreach($addrArr, "typename"));
				$sale_seotitle = join("", $addrArr);
			}


			//地铁
			$huoniaoTag->assign('subway', $subway);
			$huoniaoTag->assign('station', $station);

			if(!empty($subway)){
				$sql = $dsql->SetQuery("SELECT `title` FROM `#@__site_subway` WHERE `id` = ".$subway);
				$results = $dsql->dsqlOper($sql, "results");
				if($results){
					$list_typename = $results[0]['title'];
					$sale_seotitle = $list_typename;
				}
			}
			if(!empty($station)){
				$sql = $dsql->SetQuery("SELECT `title` FROM `#@__site_subway_station` WHERE `id` = ".$station);
				$results = $dsql->dsqlOper($sql, "results");
				if($results){
					$list_typename = $results[0]['title'];
					$sale_seotitle .= $list_typename;
				}
			}


			//单价
			if(!empty($price)){
				$priceArr = explode(",", $price);
				if(empty($priceArr[0])){
					$sale_seotitle .= $priceArr[1] . "万以下";
				}elseif(empty($priceArr[1])){
					$sale_seotitle .= $priceArr[0] . "万以上";
				}elseif(!empty($priceArr[0]) && !empty($priceArr[1])){
					$sale_seotitle .= $priceArr[0] . "万-" . $priceArr[1] . "万";
				}
			}
			$huoniaoTag->assign('price', $price);


			//面积
			if(!empty($area)){
				$areaArr = explode(",", $area);
				if(empty($areaArr[0])){
					$sale_seotitle .= $areaArr[1] . "㎡以下";
				}elseif(empty($areaArr[1])){
					$sale_seotitle .= $areaArr[0] . "㎡以上";
				}elseif(!empty($areaArr[0]) && !empty($areaArr[1])){
					$sale_seotitle .= $areaArr[0] . "㎡-" . $areaArr[1] . "㎡";
				}
			}
			$huoniaoTag->assign('area', $area);


			//户型
			if($room === "0"){
				$sale_seotitle .= "五居室以上";
			}elseif(!empty($room)){
				$sale_seotitle .= numberDaxie(array("number" => $room))."居室";
			}
			$huoniaoTag->assign('room', $room);


			//朝向
			if(!empty($direction)){
				$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__houseitem` WHERE `id` = $direction");
				$typename = getCache("house_item", $sql, 0, array("name" => "typename", "sign" => $direction));
				if($typename){
					$sale_seotitle .= "朝".$typename;
					$huoniaoTag->assign('directionName', "朝".$typename);
				}
			}
			$huoniaoTag->assign('direction', $direction);


			//楼龄
			if(!empty($buildage)){
				$buildageArr = explode(",", $buildage);
				if(empty($buildageArr[0])){
					$sale_seotitle .= $buildageArr[1] . "年以内";
					$huoniaoTag->assign('buildageName', $buildageArr[1] . "年以内");
				}elseif(empty($buildageArr[1])){
					$sale_seotitle .= $buildageArr[0] . "年以上";
					$huoniaoTag->assign('buildageName', $buildageArr[1] . "年以上");
				}elseif(!empty($buildageArr[0]) && !empty($buildageArr[1])){
					$sale_seotitle .= $buildageArr[0] . "-" . $buildageArr[1] . "年";
					$huoniaoTag->assign('buildageName', $buildageArr[0] . "-" . $buildageArr[1] . "年");
				}
			}
			$huoniaoTag->assign('buildage', $buildage);


			//楼层
			if(!empty($floor)){
				$floorArr = explode(",", $floor);
				if(empty($floorArr[0])){
					$sale_seotitle .= $floorArr[1] . "层以下";
					$huoniaoTag->assign('floorName', $floorArr[1] . "层以下");
				}elseif(empty($floorArr[1])){
					$sale_seotitle .= $floorArr[0] . "层以上";
					$huoniaoTag->assign('floorName', $floorArr[0] . "层以上");
				}elseif(!empty($floorArr[0]) && !empty($floorArr[1])){
					$sale_seotitle .= $floorArr[0] . "-" . $floorArr[1] . "层";
					$huoniaoTag->assign('floorName', $floorArr[0] . "-" . $floorArr[1] . "层");
				}
			}
			$huoniaoTag->assign('floor', $floor);


			//装修
			if(!empty($zhuangxiu)){
				$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__houseitem` WHERE `id` = $zhuangxiu");
				$typename = getCache("house_item", $sql, 0, array("name" => "typename", "sign" => $zhuangxiu));
				if($typename){
					$sale_seotitle .= $typename;
					$huoniaoTag->assign('zhuangxiuName', $typename);
				}
			}
			$huoniaoTag->assign('zhuangxiu', $zhuangxiu);


			//附加属性
			$flagArr = explode(",", $flags);
			$newFlag = array();
			foreach ($flagArr as $key => $value) {
				if($value !== ""){
					array_push($newFlag, $value);
				}
			}
			$flag = join(",", $newFlag);
			if($flag !== ""){
				$flagName = "";
				if(in_array("0", $newFlag)){
					$flagName = "急售";
				}elseif(in_array("1", $newFlag)){
					$flagName = "免税";
				}elseif(in_array("2", $newFlag)){
					$flagName = "地铁";
				}elseif(in_array("3", $newFlag)){
					$flagName = "校区房";
				}elseif(in_array("4", $newFlag)){
					$flagName = "满五年";
				}elseif(in_array("5", $newFlag)){
					$flagName = "推荐";
				}
				$loupan_seotitle .= $flagName;
			}
			$huoniaoTag->assign('flags', $flags);
			$huoniaoTag->assign('flagArr', $newFlag);


			//关键字
			$huoniaoTag->assign('keywords', $keywords);

			//分页
			$atpage = $page == 0 ? 1 : $page;
			global $page;
			$page = $atpage;

			$huoniaoTag->assign('page', $page);

			$huoniaoTag->assign('from', $from);
			$huoniaoTag->assign('orderby', $orderby);
			$huoniaoTag->assign('sale_seotitle', $sale_seotitle);

			$huoniaoTag->assign('community', (int)$community);
            $huoniaoTag->assign('comid', (int)$comid);

		}

		// 租房
		elseif($tpl == "zu"){

			$seotitle = "";

			//伪静态URL参数分解
			//zu-addrid-business-subway-station-price-room-zhuangxiu-rentype-type-keywords-page.html
			$data = $_GET['data'];
			if(!empty($data)){

				$data = explode("-", $data);

				$addrid    = (int)$data[0];
				$business  = (int)$data[1];
				$subway    = (int)$data[2];
				$station   = (int)$data[3];
				$price     = convertArrToStrWithComma(RemoveXSS($data[4]));
				$room      = RemoveXSS($data[5]);
				$zhuangxiu = RemoveXSS($data[6]);
				$rentype   = (int)$data[7];
				$type      = (int)$data[8];
				$keywords  = RemoveXSS($data[9]);
				$page      = (int)$data[10];

			}


			//区域
			$huoniaoTag->assign('addrid', $addrid);
			$huoniaoTag->assign('business', $business);

			if($addrid == 0 && $business != 0){
				$sql = $dsql->SetQuery("SELECT `parentid` FROM `#@__site_area` WHERE `id` = ".$business);
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){
					$huoniaoTag->assign('addrid', $ret[0]['parentid']);
				}
			}


			$addrid = $business ? $business : $addrid;
			if(!empty($addrid)){
				global $data;
				$data = "";
				$addrArr = getParentArr("site_area", $addrid);
				$addrArr = array_reverse(parent_foreach($addrArr, "typename"));
				$zu_seotitle = join("", $addrArr);
			}


			//地铁
			$huoniaoTag->assign('subway', $subway);
			$huoniaoTag->assign('station', $station);

			if(!empty($subway)){
				$sql = $dsql->SetQuery("SELECT `title` FROM `#@__site_subway` WHERE `id` = ".$subway);
				$results = $dsql->dsqlOper($sql, "results");
				if($results){
					$list_typename = $results[0]['title'];
					$zu_seotitle = $list_typename;
				}
			}
			if(!empty($station)){
				$sql = $dsql->SetQuery("SELECT `title` FROM `#@__site_subway_station` WHERE `id` = ".$station);
				$results = $dsql->dsqlOper($sql, "results");
				if($results){
					$list_typename = $results[0]['title'];
					$zu_seotitle .= $list_typename;
				}
			}


			$currency = echoCurrency(array("type" => "short"));

			//租金
			if(!empty($price)){
				$priceArr = explode(",", $price);
				if(empty($priceArr[0])){
					$zu_seotitle .= $priceArr[1] . "00{$currency}以下";
				}elseif(empty($priceArr[1])){
					$zu_seotitle .= $priceArr[0] . "00{$currency}以上";
				}elseif(!empty($priceArr[0]) && !empty($priceArr[1])){
					$zu_seotitle .= $priceArr[0] . "00-" . $priceArr[1] . "00{$currency}";
				}
			}
			$huoniaoTag->assign('price', $price);

			//户型
			if($room == '0'){
				$zu_seotitle .= "五居室以上";
			}elseif(!empty($room)){
				$zu_seotitle .= numberDaxie(array("number" => $room))."居室";
			}
			$huoniaoTag->assign('room', $room);

			//装修
			if(!empty($zhuangxiu)){
				$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__houseitem` WHERE `id` = $zhuangxiu");
				$typename = getCache("house_item", $sql, 0, array("name" => "typename", "sign" => $zhuangxiu));
				if($typename){
					$zu_seotitle .= $typename;
					$huoniaoTag->assign('zhuangxiuName', $typename);
				}
			}
			$huoniaoTag->assign('zhuangxiu', $zhuangxiu);


			//类型
			if(!empty($rentype)){
				if($rentype == '1'){
					$zu_seotitle .= "整租";
				}elseif($rentype == '2'){
					$zu_seotitle .= "合租";
				}
			}
			$huoniaoTag->assign('rentype', $rentype);


			//发布人类型
			if(!empty($type)){
				if($type == '1'){
					$zu_seotitle .= "个人房源";
				}elseif($type == '2'){
					$zu_seotitle .= "中介房源";
				}
			}
			$huoniaoTag->assign('type', $type);


			//关键字
			$huoniaoTag->assign('keywords', $keywords);

			//分页
			$atpage = $page == 0 ? 1 : $page;
			global $page;
			$page = $atpage;

			$huoniaoTag->assign('page', $page);
			$huoniaoTag->assign('from', $from);
			$huoniaoTag->assign('orderby', $orderby);
			$huoniaoTag->assign('zu_seotitle', $zu_seotitle);

			$huoniaoTag->assign('community', (int)$community);
            $huoniaoTag->assign('comid', (int)$comid);

		}

		// 经纪人
		elseif($tpl == "broker"){

			$data = $_GET['data'];
			if(!empty($data)){
				$data = explode("-", $data);
				$page      = (int)$data[0];
			}

			//分页
			$atpage = $page == 0 ? 1 : $page;
			global $page;
			$page = $atpage;

			$huoniaoTag->assign('page', $page);

			if($addrid == 0 && $business != 0){
				$sql = $dsql->SetQuery("SELECT `parentid` FROM `#@__site_area` WHERE `id` = ".$business);
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){
					$huoniaoTag->assign('addrid', $ret[0]['parentid']);
				}
			}


			$addrid = $business ? $business : $addrid;
			if(!empty($addrid)){
				global $data;
				$data = "";
				$addrArr = getParentArr("site_area", $addrid);
				$addrArr = array_reverse(parent_foreach($addrArr, "typename"));
				$seotitle = join("", $addrArr);
			}

			$huoniaoTag->assign('seotitle', $seotitle);
			$huoniaoTag->assign('comid', (int)$comid);

		}
		return;



	//经纪人
	}elseif($action == "broker"){
        if(isset($keywords)){
            $huoniaoTag->assign('keywords', $keywords);
        }

		//区域
		$huoniaoTag->assign('addrid', (int)$addrid);
		$huoniaoTag->assign('business', (int)$business);

		if($addrid == 0 && $business != 0){
			$sql = $dsql->SetQuery("SELECT `parentid` FROM `#@__site_area` WHERE `id` = ".$business);
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$huoniaoTag->assign('addrid', $ret[0]['parentid']);
			}
		}


		$addrid = $business ? $business : $addrid;
		if(!empty($addrid)){
			global $data;
			$data = "";
			$addrArr = getParentArr("site_area", $addrid);
			$addrArr = array_reverse(parent_foreach($addrArr, "typename"));
			$broker_seotitle = join("", $addrArr);
		}

		$huoniaoTag->assign('broker_seotitle', $broker_seotitle);
		$huoniaoTag->assign('comid', (int)$comid);
        	$huoniaoTag->assign('orderby', (int)$orderby);


	//经纪人详细信息
	}elseif($action == "broker-detail"){

		$huoniaoTag->assign('tpl', $tpl);

		$detailHandels = new handlers($service, "zjUserList");
		$detailConfig  = $detailHandels->getHandle(array("userid" => $id, "u" => $u));

		if(is_array($detailConfig) && $detailConfig['state'] == 100){
			$detailConfig  = $detailConfig['info'];
			if(is_array($detailConfig)){

				global $template;
				if(stripos($action, 'config-house') !== false ){
					detailCheckCity($service, $detailConfig['list'][0]['id'], $detailConfig['list'][0]['cityid'], $action);
				}

				//输出详细信息
				foreach ($detailConfig['list'][0] as $key => $value) {
					$huoniaoTag->assign('detail_'.$key, $value);
				}

				$sql = $dsql->SetQuery("UPDATE `#@__house_zjuser` SET `click` = `click` + 1 WHERE `id` = $id");
				$dsql->dsqlOper($sql, "update");
			}
		}else{
		    $errortitle = '抱歉,经纪人正在审核中';
            header("location:".$cfg_secureAccess.$cfg_basehost."/error.html?msg=$errortitle");

        }
		return;



	//资讯
	}elseif($action == "news" || $action == "news-list"){

		//分类
		$typeid = (int)$typeid;
		$pid = 0;
		$news_seotitle = "房产资讯";

		if($typeid != 0){
			$sql = $dsql->SetQuery("SELECT `parentid` FROM `#@__house_newstype` WHERE `id` = ".$typeid);
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$pid = $ret[0]['parentid'];
			}
		}
		$huoniaoTag->assign('typeid', $typeid);
		$huoniaoTag->assign('pid', $pid);
        $huoniaoTag->assign('keywords', $keywords);

		if(!empty($typeid)){
			global $data;
			$data = "";
			$typeArr = getParentArr("house_newstype", $typeid);
			$typeArr = array_reverse(parent_foreach($typeArr, "typename"));
			$news_seotitle = join("", $typeArr);
		}

		$huoniaoTag->assign('news_seotitle', $news_seotitle);


	//资讯详细信息
	}elseif($action == "news-detail"){

		$detailHandels = new handlers($service, "newsDetail");
		$detailConfig  = $detailHandels->getHandle($id);

		if(is_array($detailConfig) && $detailConfig['state'] == 100){
			$detailConfig  = $detailConfig['info'];
			if(is_array($detailConfig)){

				detailCheckCity("house", $detailConfig['id'], $detailConfig['cityid'], "news-detail");

                //更新阅读次数
                global $dsql;
                $sql = $dsql->SetQuery("UPDATE `#@__house_news` SET `click` = `click` + 1 WHERE `id` = ".$id);
                $dsql->dsqlOper($sql, "update");

				//输出详细信息
				foreach ($detailConfig as $key => $value) {
					$huoniaoTag->assign('detail_'.$key, $value);
				}

			}
		}else{
			header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
		}
		return;


	//问答
	}elseif($action == "faq"){

		$huoniaoTag->assign("typeid", (int)$typeid);
		$huoniaoTag->assign("keywords", $keywords);

		$typeName = "";
		if(!empty($typeid)){
			$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__house_faqtype` WHERE `id` = ".$typeid);
			$typeName = getCache("house_faqtype", $sql, 0, array("name" => "typename", "sign" => $typeid));
		}
		$huoniaoTag->assign("typeName", $typeName);
		$huoniaoTag->assign("keywords", $keywords);


	//问答详细
	}elseif($action == "faq-detail"){

		$detailHandels = new handlers($service, "faqDetail");
		$detailConfig  = $detailHandels->getHandle($id);

		if(is_array($detailConfig) && $detailConfig['state'] == 100){
			$detailConfig  = $detailConfig['info'];
			if(is_array($detailConfig)){

				//输出详细信息
				foreach ($detailConfig as $key => $value) {
					$huoniaoTag->assign('detail_'.$key, $value);
				}

				//更新浏览次数
				$sql = $dsql->SetQuery("UPDATE `#@__house_faq` SET `click` = `click` + 1 WHERE `id` = ".$id);
				$dsql->dsqlOper($sql, "results");

			}

		}else{
			header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
		}
		return;


	//获取指定ID的详细信息
	}elseif($action == "detail"){

		$detail = $type;
		//求租、求购
		if($type == "demand" || $type == "qzu" || $type == "qgou"){
			$detail = "demand";
		}

		$detailHandels = new handlers($service, $detail."Detail");
		$detailConfig  = $detailHandels->getHandle($id);

		if(is_array($detailConfig) && $detailConfig['state'] == 100){
			$detailConfig  = $detailConfig['info'];
			if(is_array($detailConfig)){

				// 如果是会员中心修改页面，验证是否是发布人
				$check = true;
				if($realServer == "member"){
					$uid = $userLogin->getMemberID();
					if($uid > 0){
						if($detail != "demand"){
							$sql = $dsql->SetQuery("SELECT `id`, `meal` FROM `#@__house_zjuser` WHERE `userid` = $uid");
							$ret = $dsql->dsqlOper($sql, "results");
							if($ret){
								$uid = $ret[0]['id'];
							}
						}
						if($detailConfig['userid'] != $uid){
							$check = false;
						}
					}
				}
				if(!$check){
					header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
					die;
				}

				//输出详细信息
				foreach ($detailConfig as $key => $value) {
					$huoniaoTag->assign('detail_'.$key, $value);
				}

			}
		}else{
			header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
		}
		return;


	//付款结果页面
	}elseif($action == "payreturn"){
		global $dsql;

		if(!empty($ordernum)){

			//根据支付订单号查询支付结果

			if(empty($ordertype)){
				$sql = $dsql->SetQuery("SELECT `body` FROM `#@__pay_log` WHERE `ordertype` = 'house' AND `ordernum` = '$ordernum'");
				$res = $dsql->dsqlOper($sql, "results");
				if($res){
					$body = $res[0]['body'];
					$body = unserialize($body);
					if($body !== false) $ordertype = $body['type'];
				}
			}

			$huoniaoTag->assign('ordertype', $ordertype);

			if($ordertype == "buymeal"){
				$sql = $dsql->SetQuery("SELECT * FROM `#@__house_zjuser_order` WHERE `ordernum` = '$ordernum'");
				$payDetail = $dsql->dsqlOper($sql, "results");
				if($payDetail){
					$huoniaoTag->assign('state', $payDetail[0]['state']);
					$huoniaoTag->assign('date', $payDetail[0]['paydate']);
				}else{
					$huoniaoTag->assign('state', 0);
				}
				return;
			}

			$archives = $dsql->SetQuery("SELECT r.`ordernum`, r.`part`, r.`aid`, r.`start`, r.`end`, r.`price`, r.`state` FROM `#@__pay_log` l LEFT JOIN `#@__member_bid` r ON r.`ordernum` = l.`body` WHERE r.`module` = 'house' AND l.`ordernum` = '$ordernum'");
			$payDetail  = $dsql->dsqlOper($archives, "results");
			if($payDetail){

				$part = $payDetail[0]['part'];

				$title = "";
				$sql = $dsql->SetQuery("SELECT `title` FROM `#@__house_".$part."` WHERE `id` = ".$payDetail[0]['aid']);
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){
					$title = $ret[0]['title'];
				}

				$param = array(
					"service"     => "house",
					"template"    => $part."-detail",
					"id"          => $payDetail[0]['aid']
				);
				$url = getUrlPath($param);

				$huoniaoTag->assign('state', $payDetail[0]['state']);
				$huoniaoTag->assign('ordernum', $payDetail[0]['ordernum']);
				$huoniaoTag->assign('title', $title);
				$huoniaoTag->assign('url', $url);
				$huoniaoTag->assign('date', $payDetail[0]['start']);
				$huoniaoTag->assign('end', $payDetail[0]['end']);
				$huoniaoTag->assign('price', $payDetail[0]['price']);

				$amount = ($payDetail[0]['end'] - $payDetail[0]['end']) / 24 / 3600 * $payDetail[0]['price'];
				$huoniaoTag->assign('amount', sprintf("%.2f", $amount));

			//支付订单不存在
			}else{
				$huoniaoTag->assign('state', 0);
			}



		}else{
			header("location:".$cfg_secureAccess.$cfg_basehost);
			die;
		}

	}elseif ($action=="kan"){//看房团
        global $dsql;

        $times = time();
        //楼盘看房图个数
        $sql = $dsql->SetQuery("SELECT count(`id`) as count FROM `#@__house_loupan` WHERE `tuan`=1 AND tuanend>'$times'");
        $totalCount = $dsql->dsqlOper($sql, "results");
        $totalCount = $totalCount[0]['count'];
        $huoniaoTag->assign('totalCount', $totalCount);

    // 移动端预约页面
    }elseif($action == "yuyue"){
		if(empty($type) || empty($id)){
			$param = array("service" => "house");
			$url = getUrlPath($param);
			header("location:".$url);
			die;
		}
		$huoniaoTag->assign('type', $type);
		$huoniaoTag->assign('id', $id);

	 // 移动端委托页面
    }elseif($action == "weituo"){
		if(empty($type) || empty($id)){
			$param = array("service" => "house");
			$url = getUrlPath($param);
			header("location:".$url);
			die;
		}
		$huoniaoTag->assign('type', $type);
		$huoniaoTag->assign('id', $id);
	// 支付页面
    }elseif($action == "pay"){
    	$param = array("service" => "house");

    	$uid = $userLogin->getMemberID();
    	if($uid < 0){
    		header("location:".getUrlPath($param));
    		die;
    	}
    	$sql = $dsql->SetQuery("SELECT `id` FROM `#@__house_zjuser` WHERE `userid` = $uid");
    	$res = $dsql->dsqlOper($sql, "results");
    	$did = $res ? $res[0]['id'] : 0;

    	if(empty($ordernum) || empty($ordertype)){
    		header("location:".getUrlPath($param));
    		die;
    	}
    	if($ordertype == "paymeal"){
    		$sql = $dsql->SetQuery("SELECT `totalprice`, `state` FROM `#@__house_zjuser_order` WHERE `ordernum` = '$ordernum' AND `zjuid` = $did");
    		$res = $dsql->dsqlOper($sql, "results");
    		if(!$res){
    			header("location:/404.html");
    			die;
    		}
    		if($res[0]['state'] == 1){
    			$param['template'] = 'payreturn';
    			$param['ordernum'] = $ordernum;
    			header("location:".getUrlPath($param));
    			die;
    		}
        	$paramsHtml = "<input type=\"hidden\" name=\"ordertype\" value=\"{$ordertype}\" />";
	        $paramsHtml .= "<input type=\"hidden\" name=\"final\" value=\"1\" />";  // 最终支付
	        $huoniaoTag->assign('paramsHtml', $paramsHtml);
    		$huoniaoTag->assign('ordernum', $ordernum);
        	$huoniaoTag->assign('totalAmount', $res[0]['totalprice']);
    	}
    }elseif($action =="school_detail"){
        global $cfg_cookiePath;
        //浏览记录
        $schoolHistory = array();
        $schoolHistoryCookie = GetCookie("house_releaseschool_history");
        if(!empty($schoolHistoryCookie)){
            $schoolHistory = explode(",", $schoolHistoryCookie);

            $key = array_search($id, $schoolHistory);
            if($key !== false){
                array_splice($schoolHistory, $key, 1);
            }

            array_unshift($schoolHistory, $id);

            //最多保存10个楼盘
            if(count($schoolHistory) > 10){
                array_pop($schoolHistory);
            }
        }else{
            $schoolHistory[] = $id;
        }
        PutCookie("house_releaseschool_history", join(",", $schoolHistory), 1 * 60 * 60 * 24 * 30, $cfg_cookiePath);

        $detailHandels = new handlers($service, "schoolDetail");
        $detailConfig  = $detailHandels->getHandle($id);
        $huoniaoTag->assign('id',$id);
        if(is_array($detailConfig) && $detailConfig['state'] == 100) {
            $detailConfig = $detailConfig['info'];
            //输出详细信息
            foreach ($detailConfig as $key => $value) {
                $huoniaoTag->assign('detail_'.$key, $value);
            }

            //更新浏览次数
            global $dsql;
            $sql = $dsql->SetQuery("UPDATE `#@__house_releaseschool` SET `click` = `click` + 1 WHERE `id` = ".$id);
            $dsql->dsqlOper($sql, "update");
        }else{
            header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
        }
    }elseif($action =="comment"){
        $huoniaoTag->assign('id', $id);

    }elseif($action == "nearbysale"){
        $data = $_GET['data'];
        if($data){

            $data = explode("-", $data);
//            var_dump($data);die;
            $schoolid  = (int)$data[0];
            $business  = (int)$data[1];
            $subway    = (int)$data[2];
            $station   = (int)$data[3];
            $price     = convertArrToStrWithComma(RemoveXSS($data[4]));
            $area      = RemoveXSS($data[5]);
            $room      = RemoveXSS($data[6]);
            $direction = RemoveXSS($data[7]);
            $buildage  = RemoveXSS($data[8]);
            $floor     = RemoveXSS($data[9]);
            $zhuangxiu = RemoveXSS($data[10]);
            $flags     = RemoveXSS($data[11]);
            $keywords  = RemoveXSS($data[12]);
            $type  	   = RemoveXSS($data[13]);
            $page      = (int)$data[14];
        }

        if($schoolid){
            $huoniaoTag->assign('id', $schoolid);
        }else{
            $huoniaoTag->assign('id', $id);
            $schoolid = $id;
        }

        $schoolname = '';
        if($schoolid){
            $schoolnamesql = $dsql->SetQuery("SELECT `title` FROM `#@__house_releaseschool` WHERE  `id` = ".$schoolid);
            $schoolnameres = $dsql->dsqlOper($schoolnamesql,"results");
            $schoolname = $schoolnameres[0] ? $schoolnameres[0]['title'] : '' ;
        }
        $huoniaoTag->assign('schoolname', $schoolname);
        
        if(!empty($station)){
            $sql = $dsql->SetQuery("SELECT `title` FROM `#@__site_subway_station` WHERE `id` = ".$station);
            $results = $dsql->dsqlOper($sql, "results");
            if($results){
                $list_typename = $results[0]['title'];
                $sale_seotitle .= $list_typename;
            }
        }


        //单价
        if(!empty($price)){
            $priceArr = explode(",", $price);
            if(empty($priceArr[0])){
                $sale_seotitle .= $priceArr[1] . "万以下";
            }elseif(empty($priceArr[1])){
                $sale_seotitle .= $priceArr[0] . "万以上";
            }elseif(!empty($priceArr[0]) && !empty($priceArr[1])){
                $sale_seotitle .= $priceArr[0] . "万-" . $priceArr[1] . "万";
            }
        }
        $huoniaoTag->assign('price', $price);
        $huoniaoTag->assign('priceArr', $priceArr);


        //面积
        if(!empty($area)){
            $areaArr = explode(",", $area);
            if(empty($areaArr[0])){
                $sale_seotitle .= $areaArr[1] . "㎡以下";
            }elseif(empty($areaArr[1])){
                $sale_seotitle .= $areaArr[0] . "㎡以上";
            }elseif(!empty($areaArr[0]) && !empty($areaArr[1])){
                $sale_seotitle .= $areaArr[0] . "㎡-" . $areaArr[1] . "㎡";
            }
        }
        $huoniaoTag->assign('area', $area);
        $huoniaoTag->assign('areaArr', $areaArr);


        //户型
        if($room === "0"){
            $sale_seotitle .= "五居室以上";
        }elseif(!empty($room)){
            $sale_seotitle .= numberDaxie(array("number" => $room))."居室";
        }
        $huoniaoTag->assign('room', $room);


        //朝向
        if(!empty($direction)){
            $sql = $dsql->SetQuery("SELECT `typename` FROM `#@__houseitem` WHERE `id` = $direction");
            $typename = getCache("house_item", $sql, 0, array("name" => "typename", "sign" => $direction));
            if($typename){
                $sale_seotitle .= "朝".$typename;
                $huoniaoTag->assign('directionName', "朝".$typename);
            }
        }
        $huoniaoTag->assign('direction', $direction);


        //楼龄
        if(!empty($buildage)){
            $buildageArr = explode(",", $buildage);
            if(empty($buildageArr[0])){
                $sale_seotitle .= $buildageArr[1] . "年以内";
                $huoniaoTag->assign('buildageName', $buildageArr[1] . "年以内");
            }elseif(empty($buildageArr[1])){
                $sale_seotitle .= $buildageArr[0] . "年以上";
                $huoniaoTag->assign('buildageName', $buildageArr[1] . "年以上");
            }elseif(!empty($buildageArr[0]) && !empty($buildageArr[1])){
                $sale_seotitle .= $buildageArr[0] . "-" . $buildageArr[1] . "年";
                $huoniaoTag->assign('buildageName', $buildageArr[0] . "-" . $buildageArr[1] . "年");
            }
        }
        $huoniaoTag->assign('buildage', $buildage);


        //楼层
        if(!empty($floor)){
            $floorArr = explode(",", $floor);
            if(empty($floorArr[0])){
                $sale_seotitle .= $floorArr[1] . "层以下";
                $huoniaoTag->assign('floorName', $floorArr[1] . "层以下");
            }elseif(empty($floorArr[1])){
                $sale_seotitle .= $floorArr[0] . "层以上";
                $huoniaoTag->assign('floorName', $floorArr[0] . "层以上");
            }elseif(!empty($floorArr[0]) && !empty($floorArr[1])){
                $sale_seotitle .= $floorArr[0] . "-" . $floorArr[1] . "层";
                $huoniaoTag->assign('floorName', $floorArr[0] . "-" . $floorArr[1] . "层");
            }
        }
        $huoniaoTag->assign('floor', $floor);


        //装修
        if(!empty($zhuangxiu)){
            $sql = $dsql->SetQuery("SELECT `typename` FROM `#@__houseitem` WHERE `id` = $zhuangxiu");
            $typename = getCache("house_item", $sql, 0, array("name" => "typename", "sign" => $zhuangxiu));
            if($typename){
                $sale_seotitle .= $typename;
                $huoniaoTag->assign('zhuangxiuName', $typename);
            }
        }
        $huoniaoTag->assign('zhuangxiu', $zhuangxiu);


        //附加属性
        $flagArr = explode(",", $flags);
        $newFlag = array();
        foreach ($flagArr as $key => $value) {
            if($value !== ""){
                array_push($newFlag, $value);
            }
        }
        $flag = join(",", $newFlag);
        if($flag !== ""){
            $flagName = "";
            if(in_array("0", $newFlag)){
                $flagName = "急售";
            }elseif(in_array("1", $newFlag)){
                $flagName = "免税";
            }elseif(in_array("2", $newFlag)){
                $flagName = "地铁";
            }elseif(in_array("3", $newFlag)){
                $flagName = "校区房";
            }elseif(in_array("4", $newFlag)){
                $flagName = "满五年";
            }elseif(in_array("5", $newFlag)){
                $flagName = "推荐";
            }
            $loupan_seotitle .= $flagName;
        }
        $huoniaoTag->assign('flags', $flags);
        $huoniaoTag->assign('flagArr', $newFlag);
        //视频
        $huoniaoTag->assign('video', (int)$video);
        //全景
        $huoniaoTag->assign('qj', (int)$qj);


        //关键字
        $huoniaoTag->assign('keywords', $keywords);

        // 类型
        $huoniaoTag->assign('type', $type);

        //分页
        $atpage = $page == 0 ? 1 : $page;
        global $page;
        $page = $atpage;

        $huoniaoTag->assign('page', $page);

        $huoniaoTag->assign('from', $from);
        $huoniaoTag->assign('orderby', $orderby);
        $huoniaoTag->assign('sale_seotitle', $sale_seotitle);

        $huoniaoTag->assign('community', (int)$community);
        $huoniaoTag->assign('comid', (int)$comid);

    }


	$huoniaoTag->assign('do', $do);


	global $template;
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
				$repeat = false;
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
