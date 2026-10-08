<?php

/**
 * huoniaoTag模板标签函数插件-商家模块
 *
 * @param $params array 参数集
 * @return array
 */
function business($params, $content = "", &$smarty = array(), &$repeat = array()){
	extract ($params);
	$service = "business";
	if(empty($action)) return '';
	global $huoniaoTag;
	global $dsql;
	global $userLogin;
	global $cfg_secureAccess;
	global $cfg_basehost;
	global $langData;

	//商品列表
	if($action == "list"){

		$seo_title = array();

		$_GET['addrid'] = (int)$_GET['addrid'];
		$_GET['typeid'] = (int)$_GET['typeid'];

		//输出所有GET参数
		$pageParam = array();
		foreach($_GET as $key => $val){
            $key = RemoveXSS($key);
            $key = $key ? htmlspecialchars($key) : $key;
            $val = RemoveXSS($val);
            $val = $val && is_string($val) ? htmlspecialchars($val) : $val;
			$huoniaoTag->assign($key, $val);
			if($key != "service" && $key != "template" && $key != "page"){
				array_push($pageParam, $key."=".$val);
			}
		}
		$huoniaoTag->assign("pageParam", join("&", $pageParam));

		//所有父级集合
		global $data;
		$data = "";
		$addrArr = getParentArr("business_addr", $addrid);
		$addrNameArr = array_reverse(parent_foreach($addrArr, "typename"));
		$data = "";
		$addrIdArr = array_reverse(parent_foreach($addrArr, "id"));
		$huoniaoTag->assign("addrNameArr", $addrNameArr);
		$huoniaoTag->assign("addrIdArr", $addrIdArr);
		if($addrNameArr){
			array_push($seo_title, join("-", $addrNameArr));
		}

		//所有父级集合
		global $data;
		$data = "";
		$typeArr = getParentArr("business_type", $typeid);
		$typeNameArr = array_reverse(parent_foreach($typeArr, "typename"));
		$data = "";
		$typeIdArr = array_reverse(parent_foreach($typeArr, "id"));
		$huoniaoTag->assign("typeNameArr", $typeNameArr);
		$huoniaoTag->assign("typeIdArr", $typeIdArr);
		if($typeNameArr){
			array_push($seo_title, join("-", $typeNameArr));
		}

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

		//排序
		$huoniaoTag->assign('orderby', $orderby);

		//seo标题
		$huoniaoTag->assign('seo_title', join("-", $seo_title));

		//类型
		$huoniaoTag->assign('typem', $typem);

	//搜索
	}elseif($action == "search-list2"){

		$huoniaoTag->assign('keywords', htmlspecialchars(RemoveXSS($keywords)));

	//获取指定ID的商铺详细
	}elseif(
		$action == "storeDetail" ||
		$action == "detail" ||
		$action == "info" ||
		$action == "intro" ||
		$action == "news" ||
		$action == "newsd" ||
		$action == "albums" ||
		$action == "albumsd" ||
		$action == "panor" ||
		$action == "panord" ||
		$action == "video" ||
		$action == "videod" ||
		$action == "live" ||
		$action == "tieba" ||
		$action == "vote" ||
		$action == "custom" ||
		$action == "huodong" ||
		$action == "tuan" ||
		$action == "shop" ||
		$action == "circle" ||
		$action == "house-sale" ||
		$action == "house-zu" ||
		$action == "job" ||
		$action == "waimai" ||
		$action == "comment" ||
		$action == "commtlist" ||
        $action == "fabu" ||
        $action == "qj"
	){

		$detailid = $uid ? $uid : $id;

		//动态详细
		if($action == "newsd") {

            if (!empty($id)) {

                $detailHandels = new handlers($service, "news_detail");
                $detailConfig = $detailHandels->getHandle($id);
                if (is_array($detailConfig) && $detailConfig['state'] == 100) {
                    $detailConfig = $detailConfig['info'];
                    if (is_array($detailConfig)) {
                        //输出详细信息
                        foreach ($detailConfig as $key => $value) {
                            $huoniaoTag->assign('newsd_' . $key, $value);
                        }
                    }

                    $detailid = $detailConfig['bid'];

                    //更新浏览次数
                    $sql = $dsql->SetQuery("UPDATE `#@__business_news` SET `click` = `click` + 1 WHERE `id` = $id");
                    $dsql->dsqlOper($sql, "update");

                } else {
                    header("location:" . $cfg_secureAccess . $cfg_basehost . "/404.html?4");
                }

            } else {
                header("location:" . $cfg_secureAccess . $cfg_basehost . "/404.html?3");
            }



        }elseif($action == "fabu"){
            global $dirDomain;
            $urlParam = array('service' => 'member');
            $before = getUrlPath($urlParam).'/';
            //判断是会员中心还是商家主页
            if (strstr($dirDomain,$before) != false){

                //输出分类字段内容
                global $userLogin;
                $userid = $userLogin->getMemberID();

                if($userid != -1){

                    $storeid = 0;
                    $parentTypeid = 0;
                    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__business_list` WHERE `state` = 1 AND `uid` = ".$userid);
                    $ret = $dsql->dsqlOper($sql, "results");
                    if($ret){
                        $storeid = $detailid = $ret[0]['id'];
                    }

                    $huoniaoTag->assign('storeid', $storeid);

                    //修改信息
                    if($id){

                        $detailHandels = new handlers($service, $act."Detail");
                        $detailConfig  = $detailHandels->getHandle($id);
                        if(is_array($detailConfig) && $detailConfig['state'] == 100){
                            $detailConfig  = $detailConfig['info'];
                            if(is_array($detailConfig)){

                                if($storeid != $detailConfig['uid'] && $act !='staff'){
                                    header('location:'.$cfg_secureAccess.$cfg_basehost.'/404.html');
                                    die;
                                }
                                foreach ($detailConfig as $key => $value) {
                                    if ($key=='uid'){
                                        $key = 'staffuid';
                                    }
                                    if ($key=='phone'){
                                        $key = 'staffphone';
                                    }
                                    $huoniaoTag->assign('detail_'.$key, $value);
                                    $huoniaoTag->assign($act.'_'.$key, $value);
                                }
                                return;
                            }
                        }else{
                            header('location:'.$cfg_secureAccess.$cfg_basehost.'/404.html');
                            die;
                        }

                    }

                }
            }else {
                $typeid = $id;        //分类id
                $bid = (int)$bid;
                //商户发布不同分类的信息统计
                $archives = $dsql->SetQuery("SELECT `uid` FROM `#@__business_list`  WHERE `id` = $bid AND `state` = 1");
                $uidresult = $dsql->dsqlOper($archives, 'results');
                if (!$uidresult) {
                    $errortitle = '抱歉,店铺正在审核中';
                    $huoniaoTag->assign('errortitle', $errortitle);
                    header("location:" . $cfg_secureAccess . $cfg_basehost . "/error.html?msg=$errortitle");
                }
                $uid = (int)$uidresult[0]['uid'];
                $typeArr = array();
                $now = GetMkTime(time());
                if($uid){
                    $infoarchive = $dsql->SetQuery("SELECT `typeid`,count(`typeid`)counttype FROM `#@__infolist` WHERE `userid` = $uid AND `valid` > " . $now . " AND `valid` <> 0 AND `del` = 0 AND `arcrank` = 1 GROUP BY `typeid`");
                    $inforesult = $dsql->dsqlOper($infoarchive, 'results');
                    foreach ($inforesult as $key => $value) {
                        $name = $dsql->SetQuery("SELECT `typename` FROM `#@__infotype` WHERE `id` = " . $value['typeid']);
                        $typenames = $dsql->dsqlOper($name, "results");
                        if (!empty($typenames)) {
                            $typeArr[$key]['typename'] = $typenames[0]['typename'];
                            $typeArr[$key]['counttype'] = $value['counttype'];
                            $typeArr[$key]['typeid'] = $value['typeid'];
                        }
                    }
                }
                $huoniaoTag->assign('typeArr', $typeArr);
                $huoniaoTag->assign('typeid', $typeid);
            }
		//相册详细
		}elseif($action == "albumsd"){

			if(!empty($id)){

				$detailHandels = new handlers($service, "albums_detail");
				$detailConfig  = $detailHandels->getHandle($id);
				if(is_array($detailConfig) && $detailConfig['state'] == 100){
					$detailConfig  = $detailConfig['info'];
					if(is_array($detailConfig)){
						//输出详细信息
						foreach ($detailConfig as $key => $value) {
							$huoniaoTag->assign('albumsd_'.$key, $value);
						}
					}

					$detailid = $detailConfig['bid'];

				}else{
					header("location:".$cfg_secureAccess.$cfg_basehost."/404.html?6");
				}

			}else{
				header("location:".$cfg_secureAccess.$cfg_basehost."/404.html?5");
			}

		//视频详细
		}elseif($action == "videod"){

			if(!empty($id)){

				$detailHandels = new handlers($service, "video_detail");
				$detailConfig  = $detailHandels->getHandle($id);
				if(is_array($detailConfig) && $detailConfig['state'] == 100){
					$detailConfig  = $detailConfig['info'];
					if(is_array($detailConfig)){
						//输出详细信息
						foreach ($detailConfig as $key => $value) {
							$huoniaoTag->assign('videod_'.$key, $value);
						}
					}

					$detailid = $detailConfig['bid'];

					//更新浏览次数
					$sql = $dsql->SetQuery("UPDATE `#@__business_video` SET `click` = `click` + 1 WHERE `id` = $id");
					$dsql->dsqlOper($sql, "update");

				}else{
					header("location:".$cfg_secureAccess.$cfg_basehost."/404.html?6");
				}

			}else{
				header("location:".$cfg_secureAccess.$cfg_basehost."/404.html?5");
			}

		//全景详细
		}elseif($action == "panord"){

			if(!empty($id)){

				$detailHandels = new handlers($service, "panor_detail");
				$detailConfig  = $detailHandels->getHandle($id);
				if(is_array($detailConfig) && $detailConfig['state'] == 100){
					$detailConfig  = $detailConfig['info'];
					if(is_array($detailConfig)){
						//输出详细信息
						foreach ($detailConfig as $key => $value) {
							$huoniaoTag->assign('panord_'.$key, $value);
						}
					}

					$detailid = $detailConfig['bid'];

					//更新浏览次数
					$sql = $dsql->SetQuery("UPDATE `#@__business_panor` SET `click` = `click` + 1 WHERE `id` = $id");
					$dsql->dsqlOper($sql, "update");

				}else{
					header("location:".$cfg_secureAccess.$cfg_basehost."/404.html?6");
				}

			}else{
				header("location:".$cfg_secureAccess.$cfg_basehost."/404.html?5");
			}

		}


		if($bid && $action != "storeDetail" && $action != "detail" && $action != "newsd" && $action != "albumsd" && $action != "videod" && $action != "panord"){
			$detailid = $bid;
		}

		// if(empty($detailid)){
		// 	header("location:".$cfg_secureAccess.$cfg_basehost."/404.html?a1");
		// 	die;
		// }
		$detailHandels = new handlers($service, "storeDetail");
		$detailConfig  = $detailHandels->getHandle($detailid);
		$state = 0;

		if(is_array($detailConfig) && $detailConfig['state'] == 100){
			$detailConfig  = $detailConfig['info'];
			if(is_array($detailConfig)){

				// $type = $detailConfig['type'];
				// $bind_module = $detailConfig['bind_module'];
				// if($bind_module != ""){

				// }

                //判断商家特权，如果都过期，则跳转到错误页面
                if(!$detailConfig['pstate']){
                    $errortitle = '店铺特权已到期！';
                    $huoniaoTag->assign('errortitle', $errortitle);
                    header("location:".$cfg_secureAccess.$cfg_basehost."/error.html?msg=$errortitle");
                    die;
                }

				//输出详细信息
				foreach ($detailConfig as $key => $value) {
					$huoniaoTag->assign('detail_'.$key, $value);
				}
				$state = 1;


				//介绍
				if($action == "intro"){

					//介绍ID为空时取第一个
					$huoniaoTag->assign('id', (int)$id);

					$id = 0;
					if(empty($id)){
							$sql = $dsql->SetQuery("SELECT `id`, `title`, `body`, `click`, `pubdate` FROM `#@__business_about` WHERE `uid` = ".$detailConfig['id']." ORDER BY `weight` DESC, `id` ASC");
							$ret = $dsql->dsqlOper($sql, "results");
							if($ret){
								$data = $ret[0];
								$id = $data['id'];
								$huoniaoTag->assign('intro_id', $data['id']);
								$huoniaoTag->assign('intro_title', $data['title']);
								$huoniaoTag->assign('intro_body', $data['body']);
								$huoniaoTag->assign('intro_click', $data['click']);
								$huoniaoTag->assign('intro_pubdate', $data['pubdate']);
								$huoniaoTag->assign('ret', $ret);
							}

					//取指定ID的介绍
					}else{
						$detailHandels = new handlers($service, "introDetail");
						$detailConfig  = $detailHandels->getHandle($id);
						if(is_array($detailConfig) && $detailConfig['state'] == 100){
							$detailConfig  = $detailConfig['info'];
							if(is_array($detailConfig)){
								//输出详细信息
								foreach ($detailConfig as $key => $value) {
									$huoniaoTag->assign('intro_'.$key, $value);
								}
							}
						}
					}

					//更新浏览次数
					$sql = $dsql->SetQuery("UPDATE `#@__business_about` SET `click` = `click` + 1 WHERE `id` = $id");
					$dsql->dsqlOper($sql, "update");


				//自定义菜单
				}elseif($action == 'custom'){

					//介绍ID为空时取第一个
					$detailHandels = new handlers($service, "getStoreCustomMenu");
					$detailConfig  = $detailHandels->getHandle(array('id' => $bid));
					if(is_array($detailConfig) && $detailConfig['state'] == 100){
						$detailConfig  = $detailConfig['info'];
						if(is_array($detailConfig)){
							//输出详细信息
							foreach ($detailConfig as $key => $value) {
								if($value['id'] == $aid){
									$huoniaoTag->assign('custom_id', $value['id']);
									$huoniaoTag->assign('custom_title', $value['title']);
									$huoniaoTag->assign('custom_body', $value['body']);

									if($value['jump'] == 1){
										header('location:' . $value['url']);
										die;
									}
								}
							}
						}
					}

				//动态
				}elseif($action == "news"){

					$typename = $langData['siteConfig'][18][36];  //商家动态
					if(!empty($id)){
						$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__business_news_type` WHERE `uid` = ".$detailConfig['id']." AND `id` = $id");
						$ret = $dsql->dsqlOper($sql, "results");
						if($ret){
							$typename = $ret[0]['typename'];
						}
					}

					$huoniaoTag->assign("id", (int)$id);
					$huoniaoTag->assign("typeid", (int)$typeid);
					$huoniaoTag->assign("news_typename", $typename);


				//相册
				}elseif($action == "albums"){

					$typename = $langData['siteConfig'][18][37];  //商家相册
					if(!empty($id)){
						$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__business_albums_type` WHERE `uid` = ".$detailConfig['id']." AND `id` = $id");
						$ret = $dsql->dsqlOper($sql, "results");
						if($ret){
							$typename = $ret[0]['typename'];
						}
					}

					$huoniaoTag->assign("id", (int)$id);
					$huoniaoTag->assign("albums_typename", $typename);


				//团购
				}elseif($action == "tuan"){

					if(!$detailConfig['store']['tuan']){
						header("location:".$cfg_secureAccess.$cfg_basehost."/404.html?11");
					}


				//商城
				}elseif($action == "shop"){

					if(!$detailConfig['store']['shop']){
						header("location:".$cfg_secureAccess.$cfg_basehost."/404.html?22");
					}


				//房产
				}elseif($action == "house-sale" || $action == "house-zu"){

					if(!$detailConfig['store']['house']){
						header("location:".$cfg_secureAccess.$cfg_basehost."/404.html?22");
					}


				//招聘
				}elseif($action == "job"){

					if(!$detailConfig['store']['job']){
						header("location:".$cfg_secureAccess.$cfg_basehost."/404.html?22");
					}

				}


				if($action == "detail" && $detailid){
					// 浏览量+1
					$sql = $dsql->SetQuery("UPDATE `#@__business_list` SET `click` = `click` + 1 WHERE `id` = $detailid");
					$dsql->dsqlOper($sql, "update");
                    $uid = $userLogin->getMemberID();
                    if($uid >0 && $uid!=$detailConfig['uid']) {
                        $uphistoryarr = array(
                            'module'    => $service,
                            'uid'       => $uid,
                            'aid'       => $id,
                            'fuid'      => $detailConfig['uid'],
                            'module2'   => 'storeDetail',
                        );
                        /*更新浏览足迹表   */
                        updateHistoryClick($uphistoryarr);
                    }
					if (!empty($desk)) {
						$huoniaoTag->assign('desk',$desk);
					}
				}

			}
		}else{
			if($id){
			    $errortitle = '抱歉,店铺正在审核中';
                $huoniaoTag->assign('errortitle', $errortitle);
                header("location:".$cfg_secureAccess.$cfg_basehost."/error.html?msg=$errortitle");


            }
		}
		$huoniaoTag->assign('storeState', $state);

		return;

	//买单页面
	}elseif($action == "diancan" || $action == "diancan-detail" || $action == "diancan-cart" || $action == "diancan-table" || $action == "dingzuo" || $action == "dingzuo-online" || $action == "dingzuo-time_choice" || $action == "dingzuo-results" || $action == "paidui" || $action == "paidui-results" || $action == "maidan" || $action == "maidan-explain"){

		$uid = $userLogin->getMemberID();
		if($uid < 1 && $action != "maidan"){
			$furl = $cfg_secureAccess.$cfg_basehost.$_SERVER['REQUEST_URI'];
			header('location:'.$cfg_secureAccess.$cfg_basehost.'/login.html?furl=' . $furl);
			die;
		}

		$detail = "";

		$type = explode("-", $action)[0];


		// 点餐商品详情页
		if($action == "diancan-detail"){

			//获取信息内容
	        $sql = $dsql->SetQuery("SELECT * FROM `#@__business_diancan_list` WHERE `id` = $fid");
	        $ret = $dsql->dsqlOper($sql, "results");
	        if($ret){

	        	$huoniaoTag->assign('id', $fid);

	            foreach ($ret[0] as $key => $value) {

	                //商品属性
	                if($key == "nature"){
	                    $value = unserialize($value);
	                }

	                //图片
	                if($key == "pics"){
	                    $value = !empty($value) ? explode(",", $value) : array();
	                }

					//标签，表字段从label变更成了tag，前端还是用的label，这里重置为label
					if($key == "tag"){
						$key = "label";
					}

	                $huoniaoTag->assign("food_".$key, $value);
	            }

	        }else{
	        	header('location:'.$cfg_secureAccess.$cfg_basehost.'/404.html');
				die;
	        }

		// 订座提交页面
		}elseif($action == "dingzuo-online"){
			$huoniaoTag->assign("date", empty($date) ? date("Y-m-d", time()) : $date);

		// 订座结果页，查询订单状态及商家id
		}elseif($action == "dingzuo-results"){
			$uid = $userLogin->getMemberID();
			if($uid == -1){
				header('location:'.$cfg_secureAccess.$cfg_basehost.'/404.html');
				die;
			}
			$sql = $dsql->SetQuery("SELECT * FROM `#@__business_dingzuo_order` WHERE `ordernum` = '$ordernum' AND `uid` = $uid");
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$bid = $ret[0]['sid'];
				$order = array();
				foreach ($ret[0] as $key => $value) {

					if($key == "tableid"){
						//字段名称从table变更成了tableid，但是前端还在使用table，这里重置为table
						$key = 'table';

						if($ret[0]['baofang'] == 1){
							$value = $langData['siteConfig'][19][695];  //包房
						}else{
							$sql = $dsql->SetQuery("SELECT `typename`, `parentid` FROM `#@__business_dingzuo_table` WHERE `id` = $value");
							$ret = $dsql->dsqlOper($sql, "results");
							if($ret){
								$value = $ret[0]['typename'];

								$sql = $dsql->SetQuery("SELECT `typename`, `parentid` FROM `#@__business_dingzuo_table` WHERE `id` = ".$ret[0]['parentid']);
								$ret = $dsql->dsqlOper($sql, "results");
								if($ret){
									$value = $ret[0]['typename']." ".$value;
								}
							}else{
								$value = $langData['siteConfig'][21][221];  //未指定
							}
						}
					}
					$order[$key] = $value;
				}
				$huoniaoTag->assign("order", $order);
			}else{
				header('location:'.$cfg_secureAccess.$cfg_basehost.'/404.html');
				die;
			}

		// 排队结果页
		}elseif($action == "paidui-results"){
			$uid = $userLogin->getMemberID();
			if($uid == -1){
				header('location:'.$cfg_secureAccess.$cfg_basehost.'/404.html');
				die;
			}
			$sql = $dsql->SetQuery("SELECT * FROM `#@__business_paidui_order` WHERE `ordernum` = '$ordernum' AND `uid` = $uid");
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$id      = $ret[0]['id'];
				$tabtype = $ret[0]['type'];
				$bid     = $ret[0]['sid'];
				$order   = array();
				foreach ($ret[0] as $key => $value) {
					// 桌位类型
					if($key == "type"){
						$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__business_dingzuo_table` WHERE `id` = $value");
						$ret = $dsql->dsqlOper($sql, "results");
						if($ret){
							$value = $ret[0]['typename'];
						}
					}

					//字段名称从table变更成了tablenum，前端还是用的table，这里重置用table
					if($key == 'tablenum'){
						$key = 'table';
					}
					$order[$key] = $value;
				}

				// 前面排队人数
				$sql = $dsql->SetQuery("SELECT `id` FROM `#@__business_paidui_order` WHERE `sid` = $bid AND `state` = 0 AND `type` = $tabtype AND `id` < $id");
				$before = $dsql->dsqlOper($sql, "totalCount");

				$order['before'] = $before;

				$huoniaoTag->assign("order", $order);
			}else{
				header('location:'.$cfg_secureAccess.$cfg_basehost.'/404.html');
				die;
			}
		}
		$params = array("shopid" => $bid, "type" => $type);
		$moduleHandels = new handlers($service, "serviceConfig");
		$moduleReturn  = $moduleHandels->getHandle($params);
		if(is_array($moduleReturn) && $moduleReturn['state'] == 100){
			if (isset($_REQUEST['desk'])) {
				$moduleReturn['info']['desk'] = htmlspecialchars(RemoveXSS($_REQUEST['desk']));
			}
			$detail = $moduleReturn['info'];
			$huoniaoTag->assign("detail", $detail);
		}else{
			header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
			die;
		}



	//支付页面
	}elseif($action == "pay"){
		global $userLogin;

		if($ordernum){

			$sql = $dsql->SetQuery("SELECT * FROM `#@__business_maidan_order` WHERE `ordernum` = '$ordernum'");
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){

				$order = $ret[0];
				$huoniaoTag->assign('ordernum', $ordernum);
				$huoniaoTag->assign('order', $order);

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

		if(!empty($ordernum)){

			//根据支付订单号查询支付结果
			$archives = $dsql->SetQuery("SELECT o.`amount`,o.`amount_alone`,o.`payamount`,o.`youhui_value`,o.`paydate`,o.`paytype`, o.`state`, o.`uid` guessid, l.`id` sid, l.`title` storename FROM `#@__business_maidan_order` o LEFT JOIN `#@__business_list` l ON o.`sid`=l.`id` WHERE `ordernum` = '$ordernum'");

			$payDetail  = $dsql->dsqlOper($archives, "results");
			if($payDetail){

				$state = $payDetail[0]['state'];
				$uid = $payDetail[0]['guessid'];
				$storename = $payDetail[0]['storename'];
				$sid = $payDetail[0]['sid'];
				$amount = $payDetail[0]['amount']; // 总金额
                $amount_alone = $payDetail[0]['amount_alone'];  // 不参与优惠金额
                $payamount = $payDetail[0]['payamount'];  // 实付金额
                $youhui_value = $payDetail[0]['youhui_value']; // 商家设定的优惠折扣，数字值 10实际表示优惠10%，也就是打9折
                //  优惠金额 = 不优惠时应付金额-实际金额
                $youhui_money = $amount - $payamount;
                // 优惠折扣，几折 = (100-设定优惠值/)10
                $youhui_ze = (100-$youhui_value)/10;

                $paydate = date("Y-m-d H:i:s",$payDetail[0]['paydate']);  // 支付时间
                $paytypename = getPaymentName($payDetail[0]['paytype']); // 支付方式

				if($uid != $userid){
					header("location:".$cfg_secureAccess.$cfg_basehost);
					die;
				}

                $huoniaoTag->assign('state', $state);  // 如果不为1，则说明未成功
                $huoniaoTag->assign('uid', $uid);
                $huoniaoTag->assign('sid',$sid);
                $huoniaoTag->assign('storename',$storename);
                $huoniaoTag->assign('amount',$amount);
                $huoniaoTag->assign('youhui_money',$youhui_money);
                $huoniaoTag->assign("youhui_value",$youhui_value);
                $huoniaoTag->assign("youhui_ze",$youhui_ze);
                $huoniaoTag->assign('amount_alone',$amount_alone);
                $huoniaoTag->assign('payamount',$payamount);
                $huoniaoTag->assign('ordernum',$ordernum);
                $huoniaoTag->assign('paydate',$paydate);
                $huoniaoTag->assign('paytype',$paytypename);

			//支付订单不存在
			}else{
				header("location:".$cfg_secureAccess.$cfg_basehost);
				die;
			}

		}else{
			header("location:".$cfg_secureAccess.$cfg_basehost);
			die;
		}

	// 评论详情
	}elseif($action == "comdetail"){
		$id = $id ? $id : $bid;
		$id = (int)$id;

		$comment = new member(array("id" => $id));
		$detail = $comment->commentDetail();
		if($detail){
			$huoniaoTag->assign('detail', $detail);
		}else{
			$param = array(
				"service" => "business",
			);
			header("location:".getUrlPath($param));
			die;
		}
	// 全部评论
	}elseif($action == "allComment"){
		$type = empty($type) ? "business" : $type;
		$aid = $type == "business" ? $bid : $id;
		$aid = (int)$aid;
		$oid = (int)$oid;

		$huoniaoTag->assign('type', $type);
		$huoniaoTag->assign('aid', $aid);
		$huoniaoTag->assign('oid', $oid);
	}elseif($action=="notices"){
		//分页
		$page = (int)$page;
		$huoniaoTag->assign('page', $page);
	}elseif($action=="noticesdetail"){

		$detailHandels = new handlers($service, "noticeDetail");
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

	// 探店详情
	}elseif($action == "discovery_detail"){
		$detailHandels = new handlers($service, "discoveryDetail");
		$detailConfig  = $detailHandels->getHandle(array("id" => $id));

		if(is_array($detailConfig) && $detailConfig['state'] == 100){
			$detailConfig  = $detailConfig['info'];
			if(is_array($detailConfig)){

				detailCheckCity($service, $detailConfig['id'], $detailConfig['cityid'], $action);

				//输出详细信息
				foreach ($detailConfig as $key => $value) {
					$huoniaoTag->assign('detail_'.$key, $value);
				}

				// 浏览次数+1
				$sql = $dsql->SetQuery("UPDATE `#@__business_discoverylist` SET `click` = `click` + 1 WHERE `id` = $id");
				$dsql->dsqlOper($sql, "update");

			}

		}else{
			header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
		}
		return;

	}

	// 返回探店插入的店铺信息代码
	if($do == "detailHtml"){
		echo "aaaa";
		return;
	}



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

		//获取分类
		if($action == "type" || $action == "addr"){
			$param['son'] = $son ? $son : 0;

		//信息列表
		}elseif($action == "alist"){
			//如果是列表页面，则获取地址栏传过来的typeid
			if($template == "list" && !$typeid){
				global $typeid;
			}
			!empty($typeid) ? $param['typeid'] = $typeid : "";

		}

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

		//正常返回
		}else{

			if(!is_array($moduleReturn) || $moduleReturn['state'] != 100) return '';
			$moduleReturn  = $moduleReturn['info'];  //返回数据
			$pageInfo_ = $moduleReturn['pageInfo'];
			if($pageInfo_){
				//如果有分页数据则提取list键
				$moduleReturn  = $moduleReturn['list'];
				//把pageInfo定义为global变量
				global $pageInfo;
				$pageInfo = $pageInfo_;
				$smarty->assign('pageInfo', $pageInfo);
			}

			$smarty->block_data[$dataindex] = $moduleReturn;  //存储数据

		}
	}

	//果没有数据，直接返回null,不必再执行了
	if(!$smarty->block_data[$dataindex]) {
		$repeat = false;
		return '';
	}

	if($action=="type"){
		//print_r($smarty->block_data[$dataindex]);die;
	}

	//一条数据出栈，并把它指派给$return，重复执行开关置位1
	if(list($key, $item) = each($smarty->block_data[$dataindex])){
		if($action == "type"){
			//print_r($item);die;
		}
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
