<?php
/**
 * 手机底部导航
 *
 * @version        $Id: siteFooterBtn.php 2020-07-02 下午14:07:23 $
 * @package        HuoNiao.siteConfig
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("siteFooterBtn");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/siteConfig";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "siteFooterBtn.html";

//系统模块
$moduleArr = array();
$sql = $dsql->SetQuery("SELECT `title`, `subject`, `name` FROM `#@__site_module` WHERE `state` = 0 AND `type` = 0 ORDER BY `weight`, `id`");
$result = $dsql->dsqlOper($sql, "results");
if($result){
    foreach ($result as $key => $value) {
        if(!empty($value['name']) && $value['name'] != 'special' && $value['name'] != 'website'){
            $moduleArr[] = array(
                "name" => $value['name'],
                "title" => $value['subject'] ? $value['subject'] : $value['title']
            );

            //跑腿
            // if($value['name'] == 'waimai'){
            // 	$moduleArr[] = array(
            //         "name" => "paotui",
            //         "title" => "外卖跑腿"
            //     );
            // }
        }
    }
}


//保存
if($dopost == 'save'){

	//查询当前配置
	$data = array();
	$sql = $dsql->SetQuery("SELECT * FROM `#@__app_config` LIMIT 1");
	$ret = $dsql->dsqlOper($sql, "results");
	if($ret){
		$_data = $ret[0];
		$data = $_data['customBottomButton'] ? unserialize($_data['customBottomButton']) : array();
	}

	$buttonArr = array();
	if($bottomButton){
		foreach ($bottomButton['name'] as $key => $val) {
			$name   = $val;
			$icon   = $bottomButton['icon'][$key];
			$icon_h = $bottomButton['icon_h'][$key];
			$url    = $bottomButton['url'][$key];
			$miniPath = $bottomButton['miniPath'][$key];
			$fabu   = $bottomButton['fabu'][$key] ? $bottomButton['fabu'][$key] : 0;
			$message = $bottomButton['message'][$key] ? $bottomButton['message'][$key] : 0;
			$code   = $bottomButton['code'][$key];
			if($name){
				array_push($buttonArr, array(
					'name'   => $name,
					'icon'   => $icon,
					'icon_h' => $icon_h,
					'url'    => $url,
					'miniPath' => ($platform == 'wxmini' || $platform == 'dymini') && strstr($url, '/pages/') ? $url : '',
					'fabu'   => $fabu,
					'message' => $message,
					'code'   => $code
				));
			}
		}
	}

    //复制其他终端的配置
    //复制H5端的配置，将其他终端的数据删除掉
    if($resetType == 'h5'){
        $buttonArr = $data[$action];
    }
    //复制其他终端的数据
    elseif($resetType != ''){
        $buttonArr = $data[$resetType][$action];
    }
    //重置指定模块的数据
    elseif(!$bottomButton && $resetType == ''){
        
        $handels = new handlers('siteConfig', 'touchHomePageFooter');
        $return = $handels->getHandle(array('version' => '2.0', 'module' => $action, 'platform' => $platform, 'default' => 1));
        if($return['state'] == 100){
            $buttonArr = $return['info'];
        }

    }

    if($platform){
        $data[$platform][$action] = $buttonArr;
    }else{
        $data[$action] = $buttonArr;
    }

	$customBottomButton = serialize($data);

	$sql = $dsql->SetQuery("SELECT `android_download` FROM `#@__app_config`");
	$ret = $dsql->dsqlOper($sql, "totalCount");
	if($ret){
	    $sql = $dsql->SetQuery("UPDATE `#@__app_config` SET `customBottomButton` = '$customBottomButton'");
	}else{
		$sql = $dsql->SetQuery("INSERT INTO `#@__app_config` (`customBottomButton`) VALUES ('$customBottomButton')");
	}
    $ret = $dsql->dsqlOper($sql, "update");
    if($ret == 'ok'){
        updateAppConfig();  //更新APP配置文件
		adminLog("修改手机底部导航", $action . ($platform ? '(' . $platform . ')' : ''));
        echo json_encode(array(
            'state' => 100,
            'info' => '配置成功！'
        ));
    }else{
        echo json_encode(array(
            'state' => 200,
            'info' => $ret
        ));
    }
    die;

//重置所有模块链接
}elseif($dopost == 'reset'){
    
    $data = array();
    $sql = $dsql->SetQuery("SELECT * FROM `#@__app_config` LIMIT 1");
    $ret = $dsql->dsqlOper($sql, "results");
    if ($ret) {
        $data = $ret[0]['customBottomButton'] ? unserialize($ret[0]['customBottomButton']) : array();
    }

    //重置指定终端
    $resetState = 0;
    if($platform){
        $data[$platform] = array();

        //复制H5端的配置，将其他终端的数据删除掉
        if($resetType == 'h5'){
            $dataTemp = $data;
            unset($dataTemp['app']);
            unset($dataTemp['wxmini']);
            unset($dataTemp['dynini']);
            $_data = $dataTemp;
        }
        //复制其他终端的数据
        elseif($resetType != ''){
            $_data = $data[$resetType];
        }
        //重置当前终端的数据
        elseif($resetType == ''){
            $resetState = 1;
        }
        $data[$platform] = $_data;
    }
    //重置h5端所有数据
    else{
        $resetState = 1;

        //把非h5端的数据删除掉
        if($data){
            foreach($data as $key => $val){
                if($key != 'app' && $key != 'wxmini' && $key != 'dymini'){
                    unset($data[$key]);
                }
            }
        }
    }

    //获取重置后的数据，此处用于获取系统默认数据
    if($resetState){

        array_unshift($moduleArr, array(
            'name' => 'business',
            'title' => '商家'
        ));
        array_unshift($moduleArr, array(
            'name' => 'siteConfig',
            'title' => '首页'
        ));

        $_data = array();

        $handels = new handlers('siteConfig', 'touchHomePageFooter');
        foreach($moduleArr as $key => $val){
            $return = $handels->getHandle(array('version' => '2.0', 'module' => $val['name'], 'platform' => $platform, 'default' => 1));
            if($return['state'] == 100){
                $buttonArr = $return['info'];
                $_data[$val['name']] = $buttonArr;
            }
        }

        if($platform){
            $data[$platform] = $_data;
        }else{

            $data = array_merge($data, $_data);
        }

    }

    $customBottomButton = serialize($data);

	$sql = $dsql->SetQuery("SELECT `id` FROM `#@__app_config`");
	$ret = $dsql->dsqlOper($sql, "totalCount");
	if($ret){
	    $sql = $dsql->SetQuery("UPDATE `#@__app_config` SET `customBottomButton` = '$customBottomButton'");
	}else{
		$sql = $dsql->SetQuery("INSERT INTO `#@__app_config` (`customBottomButton`) VALUES ('$customBottomButton')");
	}
    $ret = $dsql->dsqlOper($sql, "update");
    if($ret == 'ok'){
		adminLog("重置手机底部导航", $platform . '=>' . $action . '=>' . $resetType);
        echo json_encode(array(
            'state' => 100,
            'info' => '重置成功！'
        ));
    }else{
        echo json_encode(array(
            'state' => 200,
            'info' => $ret
        ));
    }
    die;

}


//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
        'ui/jquery.dragsort-0.5.1.min.js',
        'publicUpload.js',
		'admin/siteConfig/siteFooterBtn.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('cid', (int)$cid);
    $huoniaoTag->assign('moduleArr', $moduleArr);
    $huoniaoTag->assign('action', $action ? $action : 'siteConfig');

    //配置
    $huoniaoTag->assign('config', $configArr);

	//APP模板风格
	$dir = "../../static/images/admin/platform";
    $floders = listDir($dir);
    $skins = array();
    $floders = listDir($dir . '/app');
    $skins = array();
    if (!empty($floders)) {
        $i = 0;
        foreach ($floders as $key => $floder) {
            $config = $dir . '/app/' . $floder . '/config.xml';
            if (file_exists($config)) {
                //解析xml配置文件
                $xml = new DOMDocument();
                libxml_disable_entity_loader(false);
                $xml->load($config);
                $data = $xml->getElementsByTagName('Data')->item(0);
                $tplname = $data->getElementsByTagName("tplname")->item(0)->nodeValue;
                $copyright = $data->getElementsByTagName("copyright")->item(0)->nodeValue;

                if(!strstr($floder, '__') && !strstr($floder, 'skin')) {
                    $skins[$i]['tplname'] = $tplname;
                    $skins[$i]['directory'] = $floder;
                    $skins[$i]['copyright'] = $copyright;
                    $i++;
                }

				if($floder == 'article'){
					$skins[$i]['tplname'] = '&nbsp;&nbsp;├资讯媒体号';
                    $skins[$i]['directory'] = 'article_media';
                    $skins[$i]['copyright'] = '酷曼软件';
					$i++;
				}

				if($floder == 'circle'){
					$skins[$i]['tplname'] = '&nbsp;&nbsp;├圈子话题';
                    $skins[$i]['directory'] = 'circle_topic';
                    $skins[$i]['copyright'] = '酷曼软件';
					$i++;
				}

				if($floder == 'shop'){
					$skins[$i]['tplname'] = '&nbsp;&nbsp;├商城分类';
                    $skins[$i]['directory'] = 'shop_category';
                    $skins[$i]['copyright'] = '酷曼软件';
					$i++;
				}
            }
        }
    }

	array_push($skins, array(
		'tplname' => '快捷发布',
		'directory' => 'fabu',
		'copyright' => '酷曼软件'
	));

	array_push($skins, array(
		'tplname' => '用户中心',
		'directory' => 'user_center',
		'copyright' => '酷曼软件'
	));
	
    $huoniaoTag->assign('touchTplList', $skins);

	//查询当前配置
	$customBottomButton = array();
	$handels = new handlers('siteConfig', 'touchHomePageFooter');
	$return = $handels->getHandle(array('version' => '2.0', 'module' => $action, 'platform' => $platform));
	if($return['state'] == 100){
		$customBottomButton = $return['info'];
	}
	$huoniaoTag->assign('customBottomButton', $customBottomButton);

	$huoniaoTag->assign('platform', $platform);  //终端

    
    //判断系统终端
	$huoniaoTag->assign('has_android', verifyTerminalState('android'));
	$huoniaoTag->assign('has_ios', verifyTerminalState('ios'));
	$huoniaoTag->assign('has_harmony', verifyTerminalState('harmony'));
	$huoniaoTag->assign('has_wxmini', verifyTerminalState('wxmini'));
	$huoniaoTag->assign('has_dymini', verifyTerminalState('dymini'));


	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/siteConfig";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
