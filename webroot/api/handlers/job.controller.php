<?php

/**
 * huoniaoTag模板标签函数插件-招聘模块
 *
 * @param $params array 参数集
 * @return array
 */
function job($params, $content = "", &$smarty = array(), &$repeat = array()){
    extract ($params);
	$service = "job";
	if(empty($action)) return '';

	global $huoniaoTag;
	global $dsql;
	global $userLogin;
	global $cfg_secureAccess;
	global $cfg_basehost;

	$userid = $userLogin->getMemberID();

	//注册企业的cid（如果存在，则不为0）
    $sql = $dsql::SetQuery("select `id` from `#@__job_company` where `userid`=$userid");
    $cid = (int)$dsql->getOne($sql) ?: 0;
    $time = time();
    $huoniaoTag->assign("job_cid",$cid);

    $detailHandels = new handlers($service, "config");
    $detailConfig  = $detailHandels->getHandle();
    $huoniaoTag->assign("jobConfig",$detailConfig['info']);

    //查询是否有简历
    if($userid>0){
        $sql = $dsql::SetQuery("select count(*) from `#@__job_resume` where `userid`=".$userid);
        $huoniaoTag->assign("hasResume",$dsql->getOne($sql)>0 ? 1 : 0);
    }else{
        $huoniaoTag->assign("hasResume",0);
    }
    //招聘首页
    if($action=="index"){
        //移动端
        if(isApp()){
            global $cfg_privatenumberState;
            global $cfg_payPhoneState;
            global $huoniaoTag;
            $huoniaoTag->assign("cfg_privatenumberState",$cfg_privatenumberState);
            $huoniaoTag->assign("cfg_payPhoneState",$cfg_payPhoneState);
        }
        //pc端
        else{
            //如果登录了，注册求职身份的标签
            if($userid>0){
                $detailHandels = new handlers($service, "homePcQiuzhiData");
                $detailConfig  = $detailHandels->getHandle();
                if($detailConfig['state']!=200){
                    foreach ($detailConfig['info'] as $itemKey => $itemVal){
                        $huoniaoTag->assign($itemKey,$itemVal);
                    }
                }
                //收藏职位统计
                $sql = $dsql::SetQuery("SELECT count(`aid`) FROM `#@__member_collect` c,`#@__job_post` p WHERE c.`module` = 'job' AND (c.`action` = 'job' or c.`action` = 'company') AND c.`userid` = '$userid' AND p.`id`=c.`aid`");
                $collectJobCount = (int)$dsql->getOne($sql);
                $huoniaoTag->assign("collectCount",$collectJobCount);
                //投递统计
                $sql = $dsql::SetQuery("select count(*) from `#@__job_delivery` d left join `#@__job_invitation` i on (d.`id`=i.`did` and i.`date`>=unix_timestamp(current_timestamp) and i.`state` in (1,2,5)) where d.`userid` = $userid");
                $deliveryCount = (int)$dsql->getOne($sql);
                $huoniaoTag->assign("deliveryCount",$deliveryCount);
                //面试统计
                $invitationList = (int)$dsql->getOne($dsql::SetQuery("select count(*) from `#@__job_invitation` where `userid`=$userid and `state`=1 and `date`>=unix_timestamp(current_timestamp)"));
                $huoniaoTag->assign("interviewCount",$invitationList);
            }
        }

    }
    //公司列表
    elseif($action=="company-list"){

        $huoniaoTag->assign('keyword', $keyword);
        $huoniaoTag->assign('addrid', (int)$addrid);
        $huoniaoTag->assign('industry', (int)$industry);
        $huoniaoTag->assign('gnature', (int)$gnature);
        $huoniaoTag->assign('scale', (int)$scale);
        $huoniaoTag->assign('famous', (int)$famous);
        $huoniaoTag->assign('page', (int)$page);
    }
	//公司详细
	elseif($action =="jobposter" || $action == "pmodules" || $action == "company-detail" || $action == "company-album" || $action == "company-job" || $action == "company-salary" || $action == "storeDetail") {

		if($action == "company-detail"){
			$detailHandels = new handlers($service, "companyDetail");
			$detailConfig  = $detailHandels->getHandle(array("id"=>$id));
			$aid = $id;
			if(is_array($detailConfig) && $detailConfig['state'] == 100){
				$detailConfig  = $detailConfig['info'];
				if(is_array($detailConfig)){

					//输出详细信息
					foreach ($detailConfig as $key => $value) {
						$huoniaoTag->assign('detail_'.$key, $value);
					}

				}

			}else{
				header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
			}
		}

		if($action == "jobposter"){//海报
			$detailHandels = new handlers($service, "post");
			$param['company'] = $id;
			$detailConfig  = $detailHandels->getHandle($param);

			if(is_array($detailConfig) && $detailConfig['state'] == 100){
				$detailConfig  = $detailConfig['info'];
				if(is_array($detailConfig)){
					detailCheckCity($service, $detailConfig['id'], $detailConfig['cityid'], $action);

					$jobs = array();
					foreach ($detailConfig['list'] as $k => $value) {
						$jobs[$k]['jname'] = $value['title'];
						$jobs[$k]['jaddr'] = $value['addr'][1] . $value['addr'][2];
						$jobs[$k]['jexpr'] = $value['experience'] ? $value['experience'] : '';
						$jobs[$k]['jedu']  = $value['educational'] ? $value['educational'] : '';
						$jobs[$k]['money'] = $value['salary'] ? $value['salary'] : '';
					}
					$huoniaoTag->assign('jobs', json_encode($jobs));

				}

			}else{
				header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
			}
		}

		$detailHandels = new handlers($service, "companyDetail");
		$detailConfig  = $detailHandels->getHandle(array("id"=>$id));
		$state = 0;

		if(is_array($detailConfig) && $detailConfig['state'] == 100){
			$detailConfig  = $detailConfig['info'];
			if(is_array($detailConfig)){
				// 如果是职位详情，会员中心公司配置，不再验证城市
				if($action != "job" && $action != "storeDetail"){
					detailCheckCity($service, $detailConfig['id'], $detailConfig['cityid'], $action);
				}
				//输出详细信息
				foreach ($detailConfig as $key => $value) {
					$huoniaoTag->assign('detail_'.$key, $value);
				}
				$state = 1;

			}

			//海报ID
			$huoniaoTag->assign('posterid', $posterid ? $posterid < 10 ? '0' . $posterid : $posterid : 1);

		}else{
			if($action != "storeDetail"){
                $errortitle = '抱歉,店铺正在审核中';
                header("location:".$cfg_secureAccess.$cfg_basehost."/error.html?msg=$errortitle");

            }
		}
		$huoniaoTag->assign('storeState', $state);


		require(HUONIAOINC."/config/job.inc.php");

		if($customUpload == 1){
			$huoniaoTag->assign('thumbSize', $custom_thumbSize);
			$huoniaoTag->assign('thumbType', "*.".str_replace("|", ";*.", $custom_thumbType));
			$huoniaoTag->assign('atlasSize', $custom_atlasSize);
			$huoniaoTag->assign('atlasType', "*.".str_replace("|", ";*.", $custom_atlasType));
		}

		$huoniaoTag->assign('atlasMax', (int)$custom_gs_atlasMax);
		return;
	}
	//职位详情
    elseif($action=="job"){
        $detailHandels = new handlers($service, "postDetailAll");
        $detailConfig  = $detailHandels->getHandle(array("id"=>$id));
        $aid = $id;
        if(is_array($detailConfig) && $detailConfig['state'] == 100){
            $detailConfig  = $detailConfig['info'];
            if(is_array($detailConfig)){

                //会员权限
                global $oper;
                if($oper == 'user'){
                    $uid = $userLogin->getMemberID();
                    if($uid > 0 && $detailConfig['company']['userid'] != $uid){
                        header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
                        die;
                    }
                }

                detailCheckCity($service, $detailConfig['id'], $detailConfig['cityid'], $action);
                //输出详细信息
                foreach ($detailConfig as $key => $value) {
                    $huoniaoTag->assign('job_'.$key, $value);
                }

            }
        }else{
            header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
        }
    }
	//简历详细
	elseif($action == "resume-detail"){

        $huoniaoTag->assign('preview', (int)$preview);

	    //如果商家登录了，尝试设置已读
	    if($cid){
            $pid = $_GET['pid'];
            if($pid){
	            $sql = $dsql::SetQuery("update `#@__job_delivery` set `read`=1,`read_time`=$time where `rid`=$id and `cid`=$cid and `pid`=$pid");
                $dsql->update($sql);
            }
        }
		$detailHandels = new handlers($service, "resumeDetail");
		$detailConfig  = $detailHandels->getHandle($id);

		if(is_array($detailConfig) && $detailConfig['state'] == 100){
			$detailConfig  = $detailConfig['info'];
			if(is_array($detailConfig)){
				detailCheckCity($service, $detailConfig['id'], $detailConfig['cityid'], $action);
				$uid = $detailConfig['userid'];
                $huoniaoTag->assign("resumeDetail",$detailConfig);
				//输出详细信息
				foreach ($detailConfig as $key => $value) {
					$huoniaoTag->assign('detail_'.$key, $value);
				}
            }
		}else{

            if(isset($detailConfig['info'])){

                ShowMsg($detailConfig['info'], getUrlPath(array('service' => 'job')));
                die;

            }else{
			    header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
            }
		}
		return;
	}
	//招聘会列表
	elseif($action == "zhaopinhui"){

		//输出所有GET参数
		$pageParam = array();
		foreach($_GET as $key => $val){
            $key = htmlspecialchars(RemoveXSS($val));
			$huoniaoTag->assign($key, htmlspecialchars(RemoveXSS($val)));
			if($key != "service" && $key != "template" && $key != "page"){
                if($key == 'type'){
                    $val = (int)$val;
                }
				array_push($pageParam, $key."=".htmlspecialchars(RemoveXSS($val)));
			}
		}
		$huoniaoTag->assign("pageParam", join("&", $pageParam));

		//区域列表
        $sql = $dsql::SetQuery("select `value` from `#@__job_option` where `name`='fair_addrs'");
        $addrs = $dsql->getOne($sql) ?: '';
        $addrs_name = array();
        if($addrs){
            $sql = $dsql::SetQuery("select `typename` from `#@__site_area` where `id` in($addrs)");
            $addrs_name = $dsql->getArr($sql);
        }
        $addrs = json_decode("[".$addrs."]",true);
        $huoniaoTag->assign("addrs",$addrs);
        $huoniaoTag->assign("addrs_name",$addrs_name);
		//区域
		$addrName = "";
		if(!empty($addr)){
			$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__site_area` WHERE `id` = ".$addr);
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$addrName = $ret[0]['typename'];
			}
		}
		$huoniaoTag->assign("addrName", $addrName);

		//场馆
		$centerName = "";
		if(!empty($center)){
			$sql = $dsql->SetQuery("SELECT `title` FROM `#@__job_fairs_center` WHERE `id` = ".$center);
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$centerName = $ret[0]['title'];
			}
		}
		$huoniaoTag->assign("centerName", $centerName);

		//分页
		$page = (int)$page;
		$atpage = $page == 0 ? 1 : $page;
		global $page;
		$page = $atpage;
		$huoniaoTag->assign('page', $page);

		$huoniaoTag->assign('type', (int)$type);
        $huoniaoTag->assign('addrid', (int)$addrid);

	}
	//招聘会详细
	elseif($action == "zhaopinhui-detail"){

        $huoniaoTag->assign("keyword", $keyword);

		$detailHandels = new handlers($service, "fairsDetail");
		$detailConfig  = $detailHandels->getHandle($id);

		if(is_array($detailConfig) && $detailConfig['state'] == 100){
			$detailConfig  = $detailConfig['info'];
			if(is_array($detailConfig)){
				detailCheckCity($service, $detailConfig['id'], $detailConfig['fairs']['cityid'], $action);

				//输出详细信息
				foreach ($detailConfig as $key => $value) {
					$huoniaoTag->assign('detail_'.$key, $value);
				}

			}

		}else{
			header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
		}
		return;


	}
    //招聘会场馆图
    elseif($action == "displayimg"){

        $huoniaoTag->assign("start", $start);
        $huoniaoTag->assign("end", $end);
        $huoniaoTag->assign("title", $title);
        $huoniaoTag->assign("tel", $tel);
        $huoniaoTag->assign("imgsrc", $imgsrc);

    }
    //普工
    elseif($action == "general-detailzg"){

        $huoniaoTag->assign("id", (int)$id);

        global $cfg_privatenumberState;
        global $cfg_payPhoneState;
        global $huoniaoTag;
        $huoniaoTag->assign("cfg_privatenumberState",$cfg_privatenumberState);
        $huoniaoTag->assign("cfg_payPhoneState",$cfg_payPhoneState);
        $id = $id ?? ( $_GET['id'] ? (int)$_GET['id'] : 0 );
        $detailHandels = new handlers($service, "pgDetail");
        $detailConfig  = $detailHandels->getHandle(array("id"=>$id));
        if(is_array($detailConfig) && $detailConfig['state'] == 100){
            //输出详细信息
            $detailConfig = $detailConfig['info'];
            foreach ($detailConfig as $key => $value) {
                $huoniaoTag->assign('detail_'.$key, $value);
            }
            $clickHandlers = new handlers($service, "addClickHistory");
            $clickHandlers->getHandle(array("type"=>"pg","aid"=>$id));
        }else{
            header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
        }
        return;
    }
    elseif($action=="job-list"){

        $huoniaoTag->assign('keyword', $keyword);
        $huoniaoTag->assign('addrid', (int)$addrid);
        $huoniaoTag->assign('educational', (int)$educational);
        $huoniaoTag->assign('max_salary', (float)$max_salary);
        $huoniaoTag->assign('min_salary', (float)$min_salary);
        $huoniaoTag->assign('industry', (int)$industry);
        $huoniaoTag->assign('gnature', (int)$gnature);
        $huoniaoTag->assign('scale', (int)$scale);
        $huoniaoTag->assign('experience', (int)$experience);
        $huoniaoTag->assign('type', (int)$type);
        $huoniaoTag->assign('orderby', (int)$orderby);
        $huoniaoTag->assign('page', (int)$page);

        $detailHandels = new handlers($service, "getItem");
        $detailConfig  = $detailHandels->getHandle(array("name"=>"education,experience"));
        if(is_array($detailConfig) && $detailConfig['state'] == 100){
            $detailConfig = $detailConfig['info'];
            $huoniaoTag->assign("jobItems",$detailConfig);
        }
    }
    elseif($action=="general"){

        $huoniaoTag->assign('type', (int)$type);
        $huoniaoTag->assign('addrid', (int)$addrid);
        $huoniaoTag->assign('welfare', (int)$welfare);
        $huoniaoTag->assign('min_salary', (float)$min_salary);
        $huoniaoTag->assign('max_salary', (float)$max_salary);
        $huoniaoTag->assign('keyword', $keyword);
        $huoniaoTag->assign('education', (int)$education);
        $huoniaoTag->assign('minexp', (int)$minexp);
        $huoniaoTag->assign('maxexp', (int)$maxexp);
        $huoniaoTag->assign('sex', (int)$sex);
        $huoniaoTag->assign('minage', (int)$minage);
        $huoniaoTag->assign('maxage', (int)$maxage);
        $huoniaoTag->assign('pubdate', (int)$pubdate);
        $huoniaoTag->assign('stype', (int)$stype);
        $huoniaoTag->assign('sname', $sname);
        $huoniaoTag->assign('order', (int)$order);
        $huoniaoTag->assign('orderby', (int)$orderby);
        $huoniaoTag->assign('page', (int)$page);

        global $cfg_privatenumberState;
        global $cfg_payPhoneState;
        global $huoniaoTag;
        $huoniaoTag->assign("cfg_privatenumberState",$cfg_privatenumberState);
        $huoniaoTag->assign("cfg_payPhoneState",$cfg_payPhoneState);
        $detailHandels = new handlers($service, "getItem");
        $detailConfig  = $detailHandels->getHandle(array("name"=>"pgwelfare"));
        if(is_array($detailConfig) && $detailConfig['state'] == 100){
            $detailConfig = $detailConfig['info'];
            $huoniaoTag->assign("jobItems",$detailConfig);
        }
    }
    elseif($action=="partjob"){

        $huoniaoTag->assign('keyword', $keyword);
        $huoniaoTag->assign('addrid', (int)$addrid);
        $huoniaoTag->assign('educational', (int)$educational);
        $huoniaoTag->assign('max_salary', (float)$max_salary);
        $huoniaoTag->assign('min_salary', (float)$min_salary);
        $huoniaoTag->assign('industry', (int)$industry);
        $huoniaoTag->assign('gnature', (int)$gnature);
        $huoniaoTag->assign('scale', (int)$scale);
        $huoniaoTag->assign('salary_type', (int)$salary_type);
        $huoniaoTag->assign('experience', (int)$experience);
        $huoniaoTag->assign('type', (int)$type);
        $huoniaoTag->assign('orderby', (int)$orderby);
        $huoniaoTag->assign('page', (int)$page);
        $huoniaoTag->assign('min_salary', (float)$min_salary);
        $huoniaoTag->assign('max_salary', (float)$max_salary);

        $detailHandels = new handlers($service, "getItem");
        $detailConfig  = $detailHandels->getHandle(array("name"=>"education,experience"));
        if(is_array($detailConfig) && $detailConfig['state'] == 100){
            $detailConfig = $detailConfig['info'];
            $huoniaoTag->assign("jobItems",$detailConfig);
        }
    }
    elseif($action=="school"){

        $huoniaoTag->assign('keyword', $keyword);
        $huoniaoTag->assign('addrid', (int)$addrid);
        $huoniaoTag->assign('educational', (int)$educational);
        $huoniaoTag->assign('max_salary', (float)$max_salary);
        $huoniaoTag->assign('min_salary', (float)$min_salary);
        $huoniaoTag->assign('industry', (int)$industry);
        $huoniaoTag->assign('gnature', (int)$gnature);
        $huoniaoTag->assign('scale', (int)$scale);
        $huoniaoTag->assign('experience', (int)$experience);
        $huoniaoTag->assign('type', (int)$type);
        $huoniaoTag->assign('orderby', (int)$orderby);
        $huoniaoTag->assign('page', (int)$page);
        $huoniaoTag->assign('min_salary', (float)$min_salary);
        $huoniaoTag->assign('max_salary', (float)$max_salary);

        $detailHandels = new handlers($service, "getItem");
        $detailConfig  = $detailHandels->getHandle(array("name"=>"education"));
        if(is_array($detailConfig) && $detailConfig['state'] == 100){
            $detailConfig = $detailConfig['info'];
            $huoniaoTag->assign("jobItems",$detailConfig);
        }
    }
    elseif($action=="talent"){

        $huoniaoTag->assign('keyword', $keyword);
        $huoniaoTag->assign('key', $key);
        $huoniaoTag->assign('education', (int)$education);
        $huoniaoTag->assign('work_jy', (int)$work_jy);
        $huoniaoTag->assign('min_age', (int)$min_age);
        $huoniaoTag->assign('max_age', (int)$max_age);
        $huoniaoTag->assign('startWork', (int)$startWork);
        $huoniaoTag->assign('order', (int)$order);
        $huoniaoTag->assign('orderby', (int)$orderby);
        $huoniaoTag->assign('page', (int)$page);
        $huoniaoTag->assign('min_salary', (float)$min_salary);
        $huoniaoTag->assign('max_salary', (float)$max_salary);
        
        $detailHandels = new handlers($service, "getItem");
        $detailConfig  = $detailHandels->getHandle(array("name"=>"education,experience,startWork"));
        if(is_array($detailConfig) && $detailConfig['state'] == 100){
            $detailConfig = $detailConfig['info'];
            $huoniaoTag->assign("jobItems",$detailConfig);
        }
    }
    //求职
    elseif($action == "general-detailqz"){

        $huoniaoTag->assign("id", (int)$id);

        global $cfg_privatenumberState;
        global $cfg_payPhoneState;
        global $huoniaoTag;
        $huoniaoTag->assign("cfg_privatenumberState",$cfg_privatenumberState);
        $huoniaoTag->assign("cfg_payPhoneState",$cfg_payPhoneState);
        $id = $id ?? ( $_GET['id'] ? (int)$_GET['id'] : 0 );
        $detailHandels = new handlers($service, "qzDetail");
        $detailConfig  = $detailHandels->getHandle(array("id"=>$id));
        if(is_array($detailConfig) && $detailConfig['state'] == 100){
            $detailConfig = $detailConfig['info'];
            //输出详细信息
            foreach ($detailConfig as $key => $value) {
                $huoniaoTag->assign('detail_'.$key, $value);
            }
            $clickHandlers = new handlers($service, "addClickHistory");
            $clickHandlers->getHandle(array("type"=>"qz","aid"=>$id));
        }else{
            header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
        }
        return;
    }
    //资讯
    elseif($action == "news"){
        $typeid = (int)$typeid;
        $huoniaoTag->assign("typeid", $typeid);

        //判断是否有二级
        $hasChild = 0;
        if($typeid){
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__job_newstype` WHERE `parentid` = $typeid");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $hasChild = 1;
            }
        }
        $huoniaoTag->assign("hasChild", $hasChild);

        $second = (int)$second;
        $typeid = $second ? $second : $typeid;
        $huoniaoTag->assign("second", $second);
        $typeName = "";
        if(!empty($typeid)){
            $sql = $dsql->SetQuery("SELECT `typename` FROM `#@__job_newstype` WHERE `id` = ".$typeid);
            $ret = getCache("job_newstype", $sql, 0, array("name" => "typename", "sign" => $typeid));
            if($ret){
                $typeName = $ret;
            }
        }
        $huoniaoTag->assign("typeName", $typeName);



        $huoniaoTag->assign("title", htmlspecialchars(RemoveXSS($title)));


        //资讯详细
    }elseif($action == "news-detail"){

        $detailHandels = new handlers($service, "newsDetail");
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
                if($moduleReturn['list']){
				    $moduleReturn  = $moduleReturn['list'];
                }
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
