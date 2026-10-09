<?php
/**
 * 分站城市管理
 *
 * @version        $Id: siteCity.php 2018-01-11 下午14:46:24 $
 * @package        HuoNiao.siteConfig
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("siteCity");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/siteConfig";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "siteCity.html";


//开通城市
if($dopost == "add"){

	if(empty($cid)) die('{"state": 200, "info": "请选择所属城市"}');
	if($type === "") die('{"state": 200, "info": "请选择域名类型"}');
	if(empty($domain)) die('{"state": 200, "info": "请输入要绑定的域名"}');

	//查询是否已经开通
	$sql = $dsql->SetQuery("SELECT * FROM `#@__site_city` WHERE `cid` = ".$cid);
	$count = $dsql->dsqlOper($sql, "totalCount");
	if($count > 0) die('{"state": 200, "info": "您选择的城市已经开通，无需再次开通"}');

	//验证域名是否被使用
	if(!operaDomain('check', $domain, "siteConfig", 'city'))
	die('{"state": 200, "info": '.json_encode("域名已被占用，请重试！").'}');

    //子级信息
    $son = 0;
    $siteConfigHandlers = new handlers("siteConfig", "siteCityById");
    $siteConfigConfig   = $siteConfigHandlers->getHandle(array('tab' => 'site_area', 'id' => $cid));
    if($siteConfigConfig && $siteConfigConfig['state'] == 100){
        foreach ($siteConfigConfig['info'] as $ii){
            if($ii['is_site']){
                $son ++;
            }
            $son += $ii['son'];
        }
    }

    //父级信息
    $parent = array();
    $siteConfigHandlers = new handlers("siteConfig", "getPublicParentInfo");
    $siteConfigConfig   = $siteConfigHandlers->getHandle(array('tab' => 'site_area', 'id' => $cid));
    if($siteConfigConfig && $siteConfigConfig['state'] == 100){
        $parent = $siteConfigConfig['info'];
    }
    $parent = serialize($parent);

	//新增
	$sql = $dsql->SetQuery("INSERT INTO `#@__site_city` (`cid`, `type`, `config`, `son`, `parent`) VALUE ('$cid', '$type', '', '$son', '$parent')");
	$lid = $dsql->dsqlOper($sql, "lastid");

	if(is_numeric($lid)){

        adminLog("开通城市分站", $domain . '=>' . $cid);
        
		//域名操作
		operaDomain('update', $domain, 'siteConfig', "city", $cid);

        //更新缓存
        updateMemory();

		echo '{"state": 100, "info": "开通成功！"}';
	}else{
		die('{"state": 200, "info": "开通失败"}');
	}

	die;


//批量开通
}elseif($dopost == 'bulk'){

	$level = (int)$level;
	if(!$level && !$ids) die('{"state": 200, "info": "请选择要开通的分站类型和城市"}');

    $totalCount = $success = $already = $occupy = $error = 0;

    //批量添加某一级数的城市，查询指定级别的数据
    if(!$ids){
        $sql = $dsql->SetQuery("SELECT `id`, `pinyin` FROM `#@__site_area` WHERE `level` = $level ORDER BY `weight` DESC");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret && is_array($ret)){

            $totalCount = count($ret);

            foreach($ret as $key => $val){

                $cid = $val['id'];
                $pinyin = trim(str_replace('_', '', $val['pinyin']));

                //查询是否已经开通
                $sql = $dsql->SetQuery("SELECT count(*) totalCount FROM `#@__site_city` WHERE `cid` = ".$cid);
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret[0]['totalCount'] == 0){

                    //验证域名是否被使用
                    if(operaDomain('check', $pinyin, "siteConfig", 'city')){

                        //子级信息
                        $son = 0;
                        $siteConfigHandlers = new handlers("siteConfig", "siteCityById");
                        $siteConfigConfig   = $siteConfigHandlers->getHandle(array('tab' => 'site_area', 'id' => $cid));
                        if($siteConfigConfig && $siteConfigConfig['state'] == 100){
                            foreach ($siteConfigConfig['info'] as $ii){
                                if($ii['is_site']){
                                    $son ++;
                                }
                                $son += $ii['son'];
                            }
                        }

                        //父级信息
                        $parent = array();
                        $siteConfigHandlers = new handlers("siteConfig", "getPublicParentInfo");
                        $siteConfigConfig   = $siteConfigHandlers->getHandle(array('tab' => 'site_area', 'id' => $cid));
                        if($siteConfigConfig && $siteConfigConfig['state'] == 100){
                            $parent = $siteConfigConfig['info'];
                        }
                        $parent = serialize($parent);

                        //新增
                        $sql = $dsql->SetQuery("INSERT INTO `#@__site_city` (`cid`, `type`, `config`, `son`, `parent`) VALUE ('$cid', '2', '', '$son', '$parent')");
                        $lid = $dsql->dsqlOper($sql, "lastid");

                        if(is_numeric($lid)){
                            //域名操作
                            operaDomain('update', $pinyin, 'siteConfig', "city", $cid);
                            $success++;
                        }else{
                            $error++;
                        }

                    }else{
                        $occupy++;
                    }

                }else{
                    $already++;
                }       

            }

            adminLog("批量开通城市分站", $level);

            //更新缓存
            updateMemory();

            $str = array('需要开通的总数为：' . $totalCount . '个');
            
            if($already){
                array_push($str, '已经开通过：' . $already . '个');
            }
            if($occupy){
                array_push($str, '域名被占用：' . $occupy . '个');
            }
            if($error){
                array_push($str, '开通失败：' . $error . '个');
            }

            array_push($str, '开通成功：' . $success . '个');

            echo '{"state": 100, "info": "'.join('<br />', $str).'"}';

        }else{
            die('{"state": 200, "info": "没有需要开通的城市数据"}');
        }

    //批量添加指定城市
    }else{

        $sql = $dsql->SetQuery("SELECT `id`, `pinyin` FROM `#@__site_area` WHERE `id` IN ($ids) ORDER BY `weight` DESC");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret && is_array($ret)){

            $totalCount = count($ret);

            foreach($ret as $key => $val){

                $cid = $val['id'];
                $pinyin = trim(str_replace('_', '', $val['pinyin']));

                //查询是否已经开通
                $sql = $dsql->SetQuery("SELECT count(*) totalCount FROM `#@__site_city` WHERE `cid` = ".$cid);
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret[0]['totalCount'] == 0){

                    //验证域名是否被使用
                    if(operaDomain('check', $pinyin, "siteConfig", 'city')){

                        //子级信息
                        $son = 0;
                        $siteConfigHandlers = new handlers("siteConfig", "siteCityById");
                        $siteConfigConfig   = $siteConfigHandlers->getHandle(array('tab' => 'site_area', 'id' => $cid));
                        if($siteConfigConfig && $siteConfigConfig['state'] == 100){
                            foreach ($siteConfigConfig['info'] as $ii){
                                if($ii['is_site']){
                                    $son ++;
                                }
                                $son += $ii['son'];
                            }
                        }

                        //父级信息
                        $parent = array();
                        $siteConfigHandlers = new handlers("siteConfig", "getPublicParentInfo");
                        $siteConfigConfig   = $siteConfigHandlers->getHandle(array('tab' => 'site_area', 'id' => $cid));
                        if($siteConfigConfig && $siteConfigConfig['state'] == 100){
                            $parent = $siteConfigConfig['info'];
                        }
                        $parent = serialize($parent);

                        //新增
                        $sql = $dsql->SetQuery("INSERT INTO `#@__site_city` (`cid`, `type`, `config`, `son`, `parent`) VALUE ('$cid', '2', '', '$son', '$parent')");
                        $lid = $dsql->dsqlOper($sql, "lastid");

                        if(is_numeric($lid)){
                            //域名操作
                            operaDomain('update', $pinyin, 'siteConfig', "city", $cid);
                            $success++;
                        }else{
                            $error++;
                        }

                    }else{
                        $occupy++;
                    }

                }else{
                    $already++;
                }       

            }

            adminLog("批量开通城市分站", $ids);

            //更新缓存
            updateMemory();

            $str = array('需要开通的总数为：' . $totalCount . '个');
            
            if($already){
                array_push($str, '已经开通过：' . $already . '个');
            }
            if($occupy){
                array_push($str, '域名被占用：' . $occupy . '个');
            }
            if($error){
                array_push($str, '开通失败：' . $error . '个');
            }

            array_push($str, '开通成功：' . $success . '个');

            echo '{"state": 100, "info": "'.join('<br />', $str).'"}';

        }else{
            die('{"state": 200, "info": "没有需要开通的城市数据"}');
        }

    }
	die;

//更新
}elseif($dopost == "update"){

	if(empty($id)) die('{"state": 200, "info": "Error"}');
	if($type === "") die('{"state": 200, "info": "请选择域名类型"}');
	// if(empty($domain)) die('{"state": 200, "info": "请输入要绑定的域名"}');

	$sql = $dsql->SetQuery("SELECT c.`cid`, a.`pinyin` FROM `#@__site_city` c LEFT JOIN `#@__site_area` a ON a.`id` = c.`cid` WHERE c.`cid` = $id");
	$ret = $dsql->dsqlOper($sql, "results");
	if($ret){

		$cid = $ret[0]['cid'];
        $pinyin = trim(str_replace('_', '', $ret[0]['pinyin']));

        $domain = $domain ? $domain : $pinyin;  //如果没指定域名，默认用城市的拼音

		//验证域名是否被使用
		if(!operaDomain('check', $domain, "siteConfig", 'city', $cid))
		die('{"state": 200, "info": '.json_encode("域名【".$domain."】已被占用，请换个域名重新保存！").', "domain": "'.$domain.'"}');

        adminLog("更新城市分站", $domain . '=>' . $cid);

		//域名操作
		operaDomain('update', $domain, 'siteConfig', "city", $cid);

        //子级信息
        $son = 0;
        $siteConfigHandlers = new handlers("siteConfig", "siteCityById");
        $siteConfigConfig   = $siteConfigHandlers->getHandle(array('tab' => 'site_area', 'id' => $cid));
        if($siteConfigConfig && $siteConfigConfig['state'] == 100){
            foreach ($siteConfigConfig['info'] as $ii){
                if($ii['is_site']){
                    $son ++;
                }
                $son += $ii['son'];
            }
        }

        //父级信息
        $parent = array();
        $siteConfigHandlers = new handlers("siteConfig", "getPublicParentInfo");
        $siteConfigConfig   = $siteConfigHandlers->getHandle(array('tab' => 'site_area', 'id' => $cid));
        if($siteConfigConfig && $siteConfigConfig['state'] == 100){
            $parent = $siteConfigConfig['info'];
        }
        $parent = serialize($parent);

		$sql = $dsql->SetQuery("UPDATE `#@__site_city` SET `type` = '$type', `son` = '$son', `parent` = '$parent' WHERE `cid` = ".$id);
		$dsql->dsqlOper($sql, "update");

        //更新缓存
        // updateMemory();


		echo '{"state": 100, "info": "修改成功！"}';
		die;
	}else{
		echo '{"state": 100, "info": "城市信息获取失败！"}';
		die;
	}


//删除
}elseif($dopost == "del"){

	if(empty($id)) die('{"state": 200, "info": "Error"}');

	$ids = explode(',', $id);

	if($ids){
		foreach ($ids as $key => $id) {
			$sql = $dsql->SetQuery("SELECT `cid` FROM `#@__site_city` WHERE `id` = $id");
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){

				$cid = $ret[0]['cid'];

				$archives = $dsql->SetQuery("DELETE FROM `#@__site_city` WHERE `id` = ".$id);
				$dsql->dsqlOper($archives, "update");

				//删除域名配置
				$archives = $dsql->SetQuery("DELETE FROM `#@__domain` WHERE `module` = 'siteConfig' AND `part` = 'city' AND `iid` = ".$cid);
				$dsql->dsqlOper($archives, "update");

                adminLog("删除城市分站", $cid);

			}else{
				die('{"state": 200, "info": "Error"}');
			}
		}

		//更新缓存
		updateMemory();

		echo '{"state": 100, "info": "删除成功！"}';
		die;

	}else{
		die('{"state": 200, "info": "Error"}');
	}


//清空
}elseif($dopost == "clean"){

    $archives = $dsql->SetQuery("DELETE FROM `#@__site_city`");
    $dsql->dsqlOper($archives, "update");

    //删除域名配置
    $archives = $dsql->SetQuery("DELETE FROM `#@__domain` WHERE `module` = 'siteConfig' AND `part` = 'city'");
    $dsql->dsqlOper($archives, "update");

    adminLog("清空城市分站", "");

    //更新缓存
    updateMemory();

    echo '{"state": 100, "info": "清空成功！"}';
    die;


//启用/停用
}elseif($dopost == "status"){

	if(empty($id)) die('{"state": 200, "info": "Error"}');

	$ids = explode(',', $id);
	$state = (int)$state;

	$archives = $dsql->SetQuery("UPDATE `#@__site_city` SET `state` = '$state' WHERE `id` IN ($id)");
	$ret = $dsql->dsqlOper($archives, "update");
	if($ret == 'ok'){

        adminLog("更新城市分站状态", $id . '=>' . $state);

		//更新缓存
		updateMemory();

		echo '{"state": 100, "info": "操作成功！"}';
		die;
	}else{
		die('{"state": 200, "info": "操作失败"}');
	}


//设置默认城市
}elseif($dopost == "setDefaultCity"){

	if(empty($type) || empty($cid)) die('{"state": 200, "info": "Error"}');

	$sql = $dsql->SetQuery("UPDATE `#@__site_city` SET `defaultcity` = 0");
	$dsql->dsqlOper($sql, "update");

	//设置默认城市
	if($type == 'set'){
		$sql = $dsql->SetQuery("UPDATE `#@__site_city` SET `defaultcity` = 1 WHERE `cid` = $cid");
		$dsql->dsqlOper($sql, "update");
	}

    adminLog("设置默认城市分站", $type . '=>' . $cid);

    //更新缓存
    updateMemory();

	echo '{"state": 100, "info": "设置成功！"}';die;

//设置热门城市
}elseif($dopost == "hot"){

	if(empty($id)) die('{"state": 200, "info": "Error"}');

	$sql = $dsql->SetQuery("SELECT `cid` FROM `#@__site_city` WHERE `cid` = $id");
	$ret = $dsql->dsqlOper($sql, "results");
	if($ret){

		$cid = $ret[0]['cid'];
		$state = empty($state) ? 0 : $state;

		$archives = $dsql->SetQuery("UPDATE `#@__site_city` SET `hot` = '$state' WHERE `cid` = ".$id);
		$dsql->dsqlOper($archives, "update");

        adminLog("设置热门城市分站", $state . '=>' . $cid);

        //更新缓存
        updateMemory();

		echo '{"state": 100, "info": "修改成功！"}';
		die;
	}else{
		die('{"state": 200, "info": "Error"}');
	}

}



//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'admin/siteConfig/siteCity.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	//获取模块域名配置数据
	$domainArr = array();
    $cityCount = 0;  //正常状态的城市数量
	global $cfg_basehost;

	$sql = $dsql->SetQuery("SELECT c.*, a.`typename`, a.`id` aid FROM `#@__site_city` c LEFT JOIN `#@__site_area` a ON a.`id` = c.`cid` WHERE a.`id` != '' ORDER BY c.`state` DESC, c.`hot` DESC, a.`id`");
	$result = $dsql->dsqlOper($sql, "results");
	if($result){
		foreach ($result as $key => $value) {

			$domainInfo = getDomain('siteConfig', 'city', $value['cid']);
			$domainArr[] = array(
				"id" => $value['id'],
				"aid" => $value['aid'],
				"name" => $value['typename'],
				"type" => $value['type'],
				"default" => $value['defaultcity'],
				"typeName" => getDomainTypeName($value['type']),
				"domain" => $domainInfo['domain'],
				"hot" => $value['hot'],
				"state" => $value['state'],
			);

			if($value['state'] == 1){
				$cityCount++;
			}

		}
	}
	$huoniaoTag->assign('domainCount', count($domainArr));
	$huoniaoTag->assign('cityCount', $cityCount);
	$huoniaoTag->assign('domainArr', json_encode($domainArr));

	//省
	$province = $dsql->getTypeList(0, "site_area", false);
	$huoniaoTag->assign('province', $province);

	$huoniaoTag->assign('basehost', $cfg_basehost);

	$huoniaoTag->assign('domaintype', array('0', '1', '2'));
	$huoniaoTag->assign('domaintypeNames',array('主域名', '子域名','子目录'));
	$huoniaoTag->assign('domaintypeChecked', 2);

    $huoniaoTag->assign('cfg_auto_location', (int)$cfg_auto_location);
    $huoniaoTag->assign('cfg_sameAddr_state', (int)$cfg_sameAddr_state);
    $huoniaoTag->assign('cfg_sameAddr_group', (int)$cfg_sameAddr_group);
    $huoniaoTag->assign('cfg_sameAddr_nearby', (int)$cfg_sameAddr_nearby ?: 60);

    $areaName_0 = $cfg_areaName_0 ?: '省份';
    $areaName_1 = $cfg_areaName_1 ?: '城市';
    $areaName_2 = $cfg_areaName_2 ?: '区县';
    $areaName_3 = $cfg_areaName_3 ?: '乡镇';

    $huoniaoTag->assign('areaName', array($areaName_0, $areaName_1, $areaName_2, $areaName_3));

    //统计四级分别有多少数据
    $level_1 = $level_2 = $level_3 = $level_4 = 0;
    $sql = $dsql->SetQuery("SELECT (SELECT count(*) FROM `#@__site_area` WHERE `level` = 1) level_1, (SELECT count(*) FROM `#@__site_area` WHERE `level` = 2) level_2, (SELECT count(*) FROM `#@__site_area` WHERE `level` = 3) level_3, (SELECT count(*) FROM `#@__site_area` WHERE `level` = 4) level_4 FROM `#@__site_area` LIMIT 1");
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        $level_1 = (int)$ret[0]['level_1'];
        $level_2 = (int)$ret[0]['level_2'];
        $level_3 = (int)$ret[0]['level_3'];
        $level_4 = (int)$ret[0]['level_4'];
    }
    $huoniaoTag->assign('level_1', $level_1);
    $huoniaoTag->assign('level_2', $level_2);
    $huoniaoTag->assign('level_3', $level_3);
    $huoniaoTag->assign('level_4', $level_4);


	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/siteConfig";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}


function getDomainTypeName($type){
	$typeName = "";
	switch ($type) {
		case 0:
			$typeName = "主域名";
			break;
		case 1:
			$typeName = "子域名";
			break;
		case 2:
			$typeName = "子目录";
			break;
	}
	return $typeName;
}


//更新缓存
function updateMemory(){
    global $HN_memory;

    //清除缓存
    $HN_memory->rm('site_city');
    unlinkFile(HUONIAOROOT . '/system_site_city.json');

    //重新生成缓存
    $handels = new handlers('siteConfig', 'siteCity');
    $handels->getHandle();

    //更新APP配置信息
    updateAppConfig();

}
