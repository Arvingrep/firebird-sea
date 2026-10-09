<?php
/**
 * 添加招聘企业
 *
 * @version        $Id: jobCompanyAdd.php 2014-3-17 上午09:07:10 $
 * @package        HuoNiao.Job
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/job";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "jobCompanyAdd.html";

$admin = $userLogin->getUserID();

$tab = "job_company";
$dopost = $dopost ? $dopost : "save";        //操作类型 save添加 edit修改
if($dopost == "edit"){
	$pagetitle = "修改招聘企业";
	
    //判断当前要修改的企业是否归登录管理员所有
    $sql = $dsql->SetQuery("SELECT `admin` FROM `#@__".$tab."` WHERE `id` = '$id'");
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        //归当前管理员的话，不需要验证权限
        if($ret[0]['admin'] == $admin){

        }else{
            checkPurview("jobCompanyEdit");
        }
    }else{
        checkPurview("jobCompanyEdit");
    }


}else{
	$pagetitle = "添加招聘企业";
	checkPurview("jobCompanyAdd");
}

if(empty($domaintype)) $domaintype = 0;
if(empty($domainexp)) $domainexp = 0;
$domainexp = empty($domainexp) ? 0 : GetMkTime($domainexp);
if(empty($userid)) $userid = 0;
$weight = (int)$weight;
if(empty($state)) $state = 0;
if(!empty($property)) $property = join(",", $property);
if(!empty($welfare)) $welfare = join(",", $welfare);

if($_POST['submit'] == "提交"){

	if(empty($postcode)) $postcode = 0;

	if($token == "") die('token传递失败！');
	//二次验证
	if(empty($title)){
		echo '{"state": 200, "info": "请输入公司名称！"}';
		exit();
	}

	if($domaintype != 0){
		if(empty($domain)){
			echo '{"state": 200, "info": "请输入要绑定的域名！"}';
			exit();
		}

		//验证域名是否被使用
		if(!operaDomain('check', $domain, 'job', $tab, $id, GetMkTime($domainexp)))
		die('{"state": 200, "info": '.json_encode("域名已被占用，请重试！").'}');
	}

	if(empty($nature)){
		echo '{"state": 200, "info": "请选择公司性质！"}';
		exit();
	}

	if(empty($scale)){
		echo '{"state": 200, "info": "请选择公司规模！"}';
		exit();
	}

	if(empty($industry)){
		echo '{"state": 200, "info": "请选择经营行业！"}';
		exit();
	}

	if(empty($litpic)){
		echo '{"state": 200, "info": "请上传logo！"}';
		exit();
	}

	if($userid == 0 && trim($user) == ''){
		echo '{"state": 200, "info": "请选择会员名"}';
		exit();
	}
	if($userid == 0){
		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `username` = '".$user."'");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if(!$userResult){
			echo '{"state": 200, "info": "会员不存在，请在联想列表中选择"}';
			exit();
		}
		$userid = $userResult[0]['id'];
	}else{
		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `id` = ".$userid);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if(!$userResult){
			echo '{"state": 200, "info": "会员不存在，请在联想列表中选择"}';
			exit();
		}
	}

	if(empty($people)){
		echo '{"state": 200, "info": "请输入联系人！"}';
		exit();
	}

	if(empty($contact)){
		echo '{"state": 200, "info": "请输入联系电话！"}';
		exit();
	}

	if(trim($addrid) == ""){
		echo '{"state": 200, "info": "请选择区域板块"}';
		exit();
	}

	if(empty($address)){
		echo '{"state": 200, "info": "请输入公司地址！"}';
		exit();
	}

	//检测是否已经注册
	if($dopost == "save"){

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE `title` = '".$title."'");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo '{"state": 200, "info": "公司名称已被注册，不可以重复添加！"}';
			exit();
		}

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE `userid` = '".$userid."'");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo '{"state": 200, "info": "此会员已授权管理其它公司，一个会员不可以管理多个公司！"}';
			exit();
		}

	}else{

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE `title` = '".$title."' AND `id` != ". $id);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo '{"state": 200, "info": "公司名称已被注册，不可以重复添加！"}';
			exit();
		}

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE `userid` = '".$userid."' AND `id` != ". $id);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo '{"state": 200, "info": "此会员已授权管理其它公司，一个会员不可以管理多个公司！"}';
			exit();
		}
	}

}

if($dopost == "save" && $submit == "提交"){
	//保存到表
    $lnglatArr = explode(",",$lnglat);
    $lng = $lnglatArr[0];
    $lat = $lnglatArr[1];
    if(empty($full_name)){
        die(json_encode(array('state'=>200,'info'=>'请填写企业全称')));
    }
    //查询工商信息
    $gs = getEnterpriseBusinessData($full_name);
    if($gs['error_code']==50002){
        $enterprise_type = $gs['result']['regType'];
        $enterprise_establish = strtotime($gs['result']['regDate']);
        $enterprise_people = $gs['result']['faRen'];
        $enterprise_money = (int)$gs['result']['regMoney'];
        $enterprise_code = $gs['result']['creditCode'];
//        die(json_encode(array("state"=>200,'info'=>"工商信息查询失败，请确认企业全称")));
    }else{
        $enterprise_type = "";
        $enterprise_establish = "";
        $enterprise_people = "";
        $enterprise_money = "";
        $enterprise_code = "";
    }

    //保存到数据库中
    include HUONIAOINC . "/config/job.inc.php";
    $customFree_jobs = (int)$customFree_jobs;
    $customFree_job_resume_down = (int)$customFree_job_resume_down;
    $customFree_job_refresh = (int)$customFree_job_refresh;
    $customFree_job_top = (int)$customFree_job_top;
    $famous = (int)$famous;

    $httpLength = strlen("http://");
    $httpSLength = strlen("https://");
    if(substr($site,0,$httpLength) == "http://"){
        $site = substr($site,$httpLength);
    }
    if(substr($site,0,$httpSLength) == "https://"){
        $site = substr($site,$httpSLength);
    }

    $refuse = $state == 2 ? $refuse : '';
	$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`cityid`, `title`, `nature`, `scale`, `industry`, `logo`, `userid`, `people`, `contact`, `addrid`, `address`, `lng`, `lat`, `site`, `body`, `pics`, `weight`, `state`, `refuse`, `pubdate`, `welfare`,`property`,`full_name`,`enterprise_type`,`enterprise_establish`,`enterprise_money`,`enterprise_people`,`enterprise_code`,`package_job`,`package_resume`,`package_refresh`,`package_top`,`famous`) VALUES ('$cityid', '$title', '$nature', '$scale', '$industry', '".addslashes($litpic)."', '$userid', '$people', '$contact', '$addrid', '$address', '$lng', '$lat',  '$site', '$body', '$pics', '$weight', '$state', '$refuse', '".GetMkTime(time())."', '$welfare','$property','$full_name','$enterprise_type','$enterprise_establish','$enterprise_money','$enterprise_people','$enterprise_code',$customFree_jobs,$customFree_job_resume_down,$customFree_job_refresh,$customFree_job_top,'$famous') ");
//	echo $archives;die;
	$aid = $dsql->dsqlOper($archives, "lastid");
	if(is_numeric($aid)){
		//域名操作
		operaDomain('update', $domain, 'job', $tab, $aid, GetMkTime($domainexp), $domaintip);

		$param = array(
			"service"  => "job",
			"template" => "company",
			"id"       => $aid
		);
		$url = getUrlPath($param);

        //冗余地址
        $sql = $dsql->update($dsql::SetQuery("insert into `#@__job_address`(`company`,`addrid`,`address`,`lng`,`lat`,`type`) values($aid,$addrid,'$address','$lng','$lat',1)"));
        $dsql->update($sql);

		if($state == 1){
			updateCache("job_company_list", 300);
			clearCache("job_company_list", "key");
			clearCache("job_company_total", "key");
		}
		adminLog("添加招聘企业", $title);
        dataAsync("job",$aid,"company");  // 求职招聘-企业-新增
		echo '{"state": 100, "url": "'.$url.'"}';
	}else{
		echo '{"state": 200, "info": '.json_encode("保存到数据库失败！").'}';
	}
	die;
}elseif($dopost == "edit"){

	if($submit == "提交"){
		$sql = $dsql->SetQuery("SELECT `state`,`changeContent`,`changeState` FROM `#@__".$tab."` WHERE `id` = ".$id);
		$res = $dsql->dsqlOper($sql, "results");
		$state_ = $res[0]['state'];
        $lnglatArr = explode(",",$lnglat);
        $lng = $lnglatArr[0];
        $lat = $lnglatArr[1];
        //start 修改审批
        $changeAppend = "";
        if($res[0]['changeContent'] && $res[0]['changeState']){
            $changeContent = $res[0]['changeContent'] ? json_decode($res[0]['changeContent'],true) : array('title'=>array(),'logo'=>array(),'full_name'=>array(),'business_license'=>array());
            //处理title
            if($changeTitle==1){
                $title = $changeContent['title']['new'];
                $ifexistsql = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE `title` = '".$title."'");
                $ifexistsqlRes = $dsql->dsqlOper($ifexistsql, "results");
                if($ifexistsqlRes){
                    die(json_encode(array('state'=>200,'info'=>'公司名称已被注册，审核变更无法通过')));
                }
                $changeContent['title'] = array();
            }else{
                if($changeContent['title']){
                    if(empty($changeTitleRefuse)){
                        die(json_encode(array('state'=>200,'info'=>'请审核公司名称变更')));
                    }
                    $changeContent['title']['refuse'] = $changeTitleRefuse;
                }
            }
            //处理logo
            if($changeLogo==1){
                $litpic = $changeContent['logo']['new'];
                $changeContent['logo'] = array();
            }else{
                if($changeContent['logo']){
                    if(empty($changeLogoRefuse)){
                        die(json_encode(array('state'=>200,'info'=>'请审核公司logo变更')));
                    }
                    $changeContent['logo']['refuse'] = $changeLogoRefuse;
                }
            }
            //营业执照
            if($changeBusinessLicense==1){
                $business_license = $changeContent['business_license']['new'];
                $changeContent['business_license'] = array();
            }else{
                if($changeContent['business_license']){
                    if(empty($changeBusinessLicenseRefuse)){
                        die(json_encode(array('state'=>200,'info'=>'请审核营业执照变更')));
                    }
                    $changeContent['business_license']['refuse'] = $changeBusinessLicenseRefuse;
                }
            }
            //企业全称
            if($changeFullName==1){
                $full_name = $changeContent['full_name']['new'];
                $changeContent['full_name'] = array();
            }else{
                if($changeContent['full_name']){
                    if(empty($changeFullNameRefuse)){
                        die(json_encode(array('state'=>200,'info'=>'请审核公司全称变更')));
                    }
                    $changeContent['full_name']['refuse'] = $changeFullNameRefuse;
                }
            }
            $changeAppend = ",`changeState`=0,`changeContent`='".json_encode($changeContent,JSON_UNESCAPED_UNICODE)."'";
        }
        //修改审批 end
		//保存到表
        $refuse = $state == 2 ? $refuse : '';
        $famous = (int)$famous;

        $httpLength = strlen("http://");
        $httpSLength = strlen("https://");
        if(substr($site,0,$httpLength) == "http://"){
            $site = substr($site,$httpLength);
        }
        if(substr($site,0,$httpSLength) == "https://"){
            $site = substr($site,$httpSLength);
        }
        
        $enterprise_establish = GetMkTime($enterprise_establish);
		$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `cityid` = '$cityid', `title` = '$title', `nature` = '$nature', `scale` = '$scale', `industry` = '$industry', `logo` = '$litpic', `userid` = '$userid', `people` = '$people', `contact` = '$contact', `addrid` = '$addrid', `address` = '$address', `lng` = '$lng',`lat`='$lat',  `site` = '$site', `body` = '$body', `pics` = '$pics', `weight` = '$weight', `state` = '$state', `refuse` = '$refuse', `welfare` = '$welfare', `property`='$property',`full_name`='$full_name',`enterprise_type`='$enterprise_type',`enterprise_establish`='$enterprise_establish',`enterprise_money`='$enterprise_money',`enterprise_people`='$enterprise_people',`enterprise_code`='$enterprise_code',`business_license`='$business_license',`certification`=$certification,`package_job`=$package_job,`package_resume`=$package_resume,`package_refresh`=$package_refresh,`package_top`=$package_top,`promotion`=$promotion,`famous`='$famous'  $changeAppend WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		if($results == "ok"){
			//域名操作
			operaDomain('update', $domain, 'job', $tab, $id, GetMkTime($domainexp), $domaintip);

			$param = array(
				"service"  => "job",
				"template" => "company",
				"id"       => $id
			);
			$url = getUrlPath($param);

			// 清除缓存
			checkCache("job_company_list", $id);
			clearCache("job_company_detail", $id);
			if(($state != 1 && $state_ == 1)|| ($state == 1 && $state_ != 1)){
				clearCache("job_company_total", "key");
				if($state == 1){
					clearCache("job_company_list", "key");
				}
			}
            //把addr冗余到job_address表
            $job_addrid = (int)$dsql->getOne($dsql::SetQuery("select `id` from `#@__job_address` where `type`=1 and `company`=".$id));
            $dsql->update($dsql::SetQuery("update `#@__job_address` set `addrid`=$addrid,`address`='$address',`lng`='$lng',`lat`='$lat' where `id`=$job_addrid"));

            dataAsync("job",$id,"company");  // 求职招聘-企业-更新信息
			adminLog("修改招聘企业", $title);
			echo '{"state": 100, "info": '.json_encode('修改成功！').', "url": "'.$url.'"}';
		}else{
			echo '{"state": 200, "info": '.json_encode('修改失败！').'}';
		}
		die;
	}

	if(!empty($id)){

		//主表信息
		$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "results");

		if(!empty($results)){

			$title       = $results[0]['title'];
			$domaintype  = $results[0]['domaintype'];

			//获取域名信息
			$domainexp   = $domainInfo['expires'];
			$domaintip   = $domainInfo['note'];

			$nature      = $results[0]['nature'];
			$scale       = $results[0]['scale'];
			$industry    = $results[0]['industry'];
			$logo        = $results[0]['logo'];
			$userid      = $results[0]['userid'];
			$people      = $results[0]['people'];
			$contact     = $results[0]['contact'];
			$addrid      = $results[0]['addrid'];
			$address     = $results[0]['address'];
			$lnglat      = $results[0]['lng'].",".$results[0]['lat'];
			$postcode    = $results[0]['postcode'];
			$site        = $results[0]['site'] ? "https://".$results[0]['site'] : "";
			$body        = $results[0]['body'];
			$pics        = $results[0]['pics'];
			$weight      = $results[0]['weight'];
			$state       = $results[0]['state'];
			$refuse      = $results[0]['refuse'];
			$promotion       = $results[0]['promotion'];
			$package_job       = $results[0]['package_job'];
			$package_resume       = $results[0]['package_resume'];
			$package_refresh       = $results[0]['package_refresh'];
			$package_top       = $results[0]['package_top'];
			$certification       = $results[0]['certification'];
            $cityid       = $results[0]['cityid'];
            $welfare       = $results[0]['welfare'];
            $property       = $results[0]['property'];
            $famous       = $results[0]['famous'];
            $business_license       = $results[0]['business_license'];
            $enterprise_people       = $results[0]['enterprise_people'];
            $enterprise_type       = $results[0]['enterprise_type'];
            $full_name       = $results[0]['full_name'];
            $enterprise_establish       = $results[0]['enterprise_establish'];
            $enterprise_money       = $results[0]['enterprise_money'];
            $enterprise_code       = $results[0]['enterprise_code'];
            $changeState       = $results[0]['changeState'];
            $changeContent       = $results[0]['changeContent'];

		}else{
			ShowMsg('要修改的信息不存在或已删除！', "-1");
			die;
		}

	}else{
		ShowMsg('要修改的信息参数传递失败，请联系管理员！', "-1");
		die;
	}

}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/jquery.dragsort-0.5.1.min.js',
		'ui/bootstrap-datetimepicker.min.js',
		'publicUpload.js',
		'publicAddr.js',
		'admin/job/jobCompanyAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('dopost', $dopost);
	$huoniaoTag->assign('pagetitle', $pagetitle);
	require_once(HUONIAOINC."/config/job.inc.php");
	global $cfg_basehost;
	global $customChannelDomain;
	global $customUpload;
	if($customUpload == 1){
		global $custom_thumbSize;
		global $custom_thumbType;
		global $custom_atlasSize;
		global $custom_atlasType;
		$huoniaoTag->assign('thumbSize', $custom_thumbSize);
		$huoniaoTag->assign('thumbType', "*.".str_replace("|", ";*.", $custom_thumbType));
		$huoniaoTag->assign('atlasSize', $custom_atlasSize);
		$huoniaoTag->assign('atlasType', "*.".str_replace("|", ";*.", $custom_atlasType));
	}
	$huoniaoTag->assign('mapCity', $cfg_mapCity);
	$huoniaoTag->assign('basehost', $cfg_basehost);

	//获取域名信息
	$domainInfo = getDomain('job', 'config');
	$huoniaoTag->assign('subdomain', $domainInfo['domain']);

	$huoniaoTag->assign('id', $id);

	$huoniaoTag->assign('title', $title);

	global $customSubDomain;
	$huoniaoTag->assign('customSubDomain', $customSubDomain);
	if($customSubDomain != 2){
		$huoniaoTag->assign('domaintype', array('0', '1', '2'));
		$huoniaoTag->assign('domaintypeNames',array('默认','绑定主域名','绑定子域名'));
	}else{
		$huoniaoTag->assign('domaintype', array('0', '1'));
		$huoniaoTag->assign('domaintypeNames',array('默认','绑定主域名'));
	}
	if($customSubDomain == 2 && $domaintype == 2) $domaintype = 0;

	$huoniaoTag->assign('domaintypeChecked', $domaintype == "" ? 0 : $domaintype);
	$huoniaoTag->assign('domain', $domain);
	$huoniaoTag->assign('domainexp', $domainexp == 0 ? "" : date("Y-m-d H:i:s", $domainexp));
	$huoniaoTag->assign('domaintip', $domaintip);

	//公司性质
	$archives = $dsql->SetQuery("SELECT * FROM `#@__jobitem` WHERE `parentid` = 5 ORDER BY `weight` ASC");
	$results = $dsql->dsqlOper($archives, "results");
	$list = array(0 => '请选择');
	foreach($results as $value){
		$list[$value['id']] = $value['typename'];
	}
	$huoniaoTag->assign('natureList', $list);
	$huoniaoTag->assign('nature', $nature == "" ? 0 : $nature);

	//公司规模
	$archives = $dsql->SetQuery("SELECT * FROM `#@__jobitem` WHERE `parentid` = 6 ORDER BY `weight` ASC");
	$results = $dsql->dsqlOper($archives, "results");
	$list = array(0 => '请选择');
	foreach($results as $value){
		$list[$value['id']] = $value['typename'];
	}
	$huoniaoTag->assign('scaleList', $list);
	$huoniaoTag->assign('scale', $scale == "" ? 0 : $scale);

	//经营行业
	$huoniaoTag->assign('industry', $industry == "" ? 0 : $industry);
	$huoniaoTag->assign('industryListArr', json_encode($dsql->getTypeList(0, "job_industry")));

	$huoniaoTag->assign('litpic', $logo);

	$huoniaoTag->assign('userid', $userid);
	$userSql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = ". $userid);
	$username = $dsql->getTypeName($userSql);
	$huoniaoTag->assign('username', $username[0]['username']);

	$huoniaoTag->assign('people', $people);
	$huoniaoTag->assign('contact', $contact);

	//区域
	$huoniaoTag->assign('addrListArr', json_encode($dsql->getTypeList(0, "jobaddr")));
	$huoniaoTag->assign('addrid', $addrid == "" ? 0 : $addrid);

	$huoniaoTag->assign('address', $address);
	$huoniaoTag->assign('lnglat', $lnglat);
	$huoniaoTag->assign('postcode', empty($postcode) ? "" : $postcode);
	$huoniaoTag->assign('site', $site);
	$huoniaoTag->assign('body', $body);

	$huoniaoTag->assign('picsList', '[]');
	if(!empty($pics)){
		$picsArr = array();
		$pics = explode("###", $pics);
		foreach ($pics as $key => $value) {
			$val = explode("||", $value);
			$picsArr[$key] = $val;
		}
		$huoniaoTag->assign('picsList', json_encode($picsArr));
	}

	$huoniaoTag->assign('weight', $weight);

    $huoniaoTag->assign('cityid', $cityid);
    $huoniaoTag->assign('package_job', $package_job);
    $huoniaoTag->assign('package_resume', $package_resume);
    $huoniaoTag->assign('package_refresh', $package_refresh);
    $huoniaoTag->assign('package_top', $package_top);

	//显示状态
	$huoniaoTag->assign('stateopt', array('0', '1', '2'));
	$huoniaoTag->assign('statenames',array('待审核','已审核','审核拒绝'));
	$huoniaoTag->assign('state', $state == "" ? 1 : $state);
    $huoniaoTag->assign('refuse', $refuse);

    $huoniaoTag->assign('promotionName',array('不推广','推广'));
    $huoniaoTag->assign('promotionValue',array('0','1'));
    $huoniaoTag->assign('promotion', $promotion);

	//审核状态
    $huoniaoTag->assign('cerState', array('0', '1'));
    $huoniaoTag->assign('cerNames',array('待认证','认证通过'));
    $huoniaoTag->assign('cerCheck', $certification);

	//属性
    $archives = $dsql->SetQuery("SELECT * FROM `#@__jobitem` WHERE `parentid` = 8 ORDER BY `weight` ASC");
    $results = $dsql->dsqlOper($archives, "results");
    $propertyVal = array_column($results,'id');
	$huoniaoTag->assign('propertyVal',$propertyVal);
    $propertyList = array_column($results,'typename');
	$huoniaoTag->assign('propertyList',$propertyList);
	$huoniaoTag->assign('property', !empty($property) ? explode(",", $property) : "");

    $huoniaoTag->assign('famous', (int)$famous);

	//公司福利
    $archives = $dsql->SetQuery("SELECT * FROM `#@__jobitem` WHERE `parentid` = 7 ORDER BY `weight` ASC");
    $results = $dsql->dsqlOper($archives, "results");
    $welfareKeys = array_column($results,'id');
    $huoniaoTag->assign('welfareKeys', $welfareKeys);
    $welfareList = array_column($results,'typename');
    $huoniaoTag->assign('welfareList', $welfareList);
    $huoniaoTag->assign('welfare', !empty($welfare) ? explode(",",$welfare) : "");

    $huoniaoTag->assign('business_license', $business_license);
    $huoniaoTag->assign('enterprise_people', $enterprise_people);
    $huoniaoTag->assign('enterprise_type', $enterprise_type);
    $huoniaoTag->assign('full_name', $full_name);
    $huoniaoTag->assign('enterprise_establish', $enterprise_establish ? date('Y-m-d', $enterprise_establish) : '');
    $huoniaoTag->assign('full_name', $full_name);
    $huoniaoTag->assign('enterprise_money', $enterprise_money);
    $huoniaoTag->assign('enterprise_code', $enterprise_code);
    $huoniaoTag->assign('changeState', $changeState);
    $huoniaoTag->assign('changeContent', $changeContent ? json_decode($changeContent,true) : array());

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/job";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
