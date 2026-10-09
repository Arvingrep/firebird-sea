<?php
/**
 * 管理广告
 *
 * @version        $Id: advList.php 2013-7-7 上午10:33:36 $
 * @package        HuoNiao.Adv
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql  = new dsql($dbo);
$tpl   = dirname(__FILE__)."/../templates/siteConfig";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "advList.html";
$dir = HUONIAOROOT."/templates/".$action;

$tab = "adv";

if($action){
    checkPurview("advList".$action);
}else{
    checkPurview("advListsiteConfig");
}

$dopost = $_REQUEST['dopost'];  //有的接口用了delete等xss关键字，导致下方判断出错，这里强制获取

if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	$where = "";

	if($sKeyword != ""){
		$where .= " AND `title` like '%$sKeyword%'";
	}
	if($sType != ""){
		if(!$type){
			if($dsql->getTypeList($sType, $tab."type")){
				$lower = arr_foreach($dsql->getTypeList($sType, $tab."type"));
				$lower = $sType.",".join(',',$lower);
			}else{
				$lower = $sType;
			}
			$where .= " AND `typeid` in ($lower)";
		}else{
			$where .= " AND `template` = '$sType'";
		}
	}

	if(!empty($sCity)){
		$where .= " AND `cityid` = $sCity";
	}

	$where .= " order by `weight` desc, `id` desc, `pubdate` desc";

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."list` WHERE `model` = '".$action."' AND `type` = ".$type);

	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT `id`, `model`, `class`, `template`, `typeid`, `cityid`, `title`, `weight`, `starttime`, `endtime`, `state`, `weight` FROM `#@__".$tab."list` WHERE `model` = '".$action."' AND `type` = ".$type.$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];

			switch($value["class"]){
				case 1:
					$list[$key]["class"] = "普通广告";
					break;
				case 2:
					$list[$key]["class"] = "多图广告";
					break;
				case 3:
					$list[$key]["class"] = "拉伸广告";
					break;
				case 4:
					$list[$key]["class"] = "对联广告";
					break;
				case 5:
					$list[$key]["class"] = "节日广告";
					break;
				case 6:
					$list[$key]["class"] = "弹窗公告";
					break;
			}


			if($type){
				$list[$key]["typeid"] = 0;
				$list[$key]["type"] = "无";

				$floders = listDir($dir);
				$skins = array();
				if(!empty($floders)){

					foreach($floders as $k => $floder){
						$config = $dir.'/'.$floder.'/config.xml';
						if(file_exists($config)){
							//解析xml配置文件
							$xml = new DOMDocument();
							libxml_disable_entity_loader(false);
							$xml->load($config);
							$data = $xml->getElementsByTagName('Data')->item(0);
							$tplname = $data->getElementsByTagName("tplname")->item(0)->nodeValue;

							$floderName = $floder;
							if($value['template'] == $floderName){
								$list[$key]["typeid"] = $floderName;
								$list[$key]["type"] = $tplname;
							}
						}
					}

				}
			}else{
				//分类
				$typeSql = $dsql->SetQuery("SELECT `typename` FROM `#@__".$tab."type` WHERE `id` = ". $value["typeid"]);
				$typename = $dsql->getTypeName($typeSql);
                if($typename){
                    $list[$key]["typeid"] = $value["typeid"];
                    $list[$key]["type"] = $typename[0]['typename'];
                }else{
                    $list[$key]["typeid"] = 0;
                    $list[$key]["type"] = '无';
                }
			}

			$list[$key]["title"] = $value["title"];
			$list[$key]["sort"] = $value["weight"];
			$list[$key]["start"] = $value["starttime"] == 0 ? "不限制" : date('Y-m-d', $value["starttime"]);
			$list[$key]["end"] = $value["endtime"] == 0 ? "不限制" : date('Y-m-d', $value["endtime"]);
			$list[$key]["state"] = $value["state"];
		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}, "adList": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").'}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").'}';
	}
	die;

//预览
}elseif($dopost == "preview"){

	if(!empty($id)){
		include_once(HUONIAOINC."/class/myad.class.php");
		$param = array(
			'id' => $id
		);
		$handler = true;
		echo '<script type="text/javascript" src="'.$cfg_staticPath.'/js/core/jquery-1.8.3.min.js"></script>';
		$ad = getMyAd($param);
		echo $ad;die;
	}

//删除
}elseif($dopost == "del"){
	if($id != ""  && $userType != 3){

		$each = explode(",", $id);
		$error = array();
		$title = array();
		foreach($each as $val){

			$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."list` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "results");

			array_push($title, $results[0]['title']);

			//删除表
			$archives = $dsql->SetQuery("DELETE FROM `#@__".$tab."list` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}else{
				//删除城市分站广告
				$archives = $dsql->SetQuery("DELETE FROM `#@__advlist_city` WHERE `aid` = ".$val);
				$dsql->dsqlOper($archives, "update");
			}
		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("删除广告信息", $tab."=>".join(", ", $title));
			echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
		}
		die;
	}
	die;

//更新状态
}elseif($dopost == "updateState"){
	if($userType != 3){
		$each = explode(",", $id);
		$error = array();
		foreach($each as $val){
			$archives = $dsql->SetQuery("UPDATE `#@__".$tab."list` SET `state` = ".$state." WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}
		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("更新广告状态", $id."=>".$state);
			echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
		}
	}else{
		echo '{"state": 200, "info": '.json_encode("您没有操作的权限！").'}';
	}
	die;

//一键删除重复广告位
}elseif($dopost == "deleteRepeat"){

    //查询指定模块的
    if($action){
        $sql = $dsql->SetQuery("SELECT c.`id` FROM (SELECT * FROM `#@__advlist` WHERE `model` = '$action' ORDER BY `id` DESC LIMIT 99999999) c GROUP BY c.`title`");
    }
    //查询所有模块的
    else{
        $sql = $dsql->SetQuery("SELECT c.`id` FROM (SELECT * FROM `#@__advlist` ORDER BY `id` DESC LIMIT 99999999) c GROUP BY c.`title`");
    }
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        $ids = array();
        foreach ($ret as $key => $value) {
            array_push($ids, $value['id']);
        }

        if($ids){
            $idsArr = join(',', $ids);

            //删除指定模块的
            if($action){
                $sql = $dsql->SetQuery("DELETE FROM `#@__advlist` WHERE `model` = '$action' AND `id` NOT IN ($idsArr)");
            }
            //删除所有模块的
            else{
                $sql = $dsql->SetQuery("DELETE FROM `#@__advlist` WHERE `id` NOT IN ($idsArr)");
            }

            $dsql->dsqlOper($sql, "update");
        }
    }
    
    adminLog("清理重复广告位", $action);
    echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
    die;

}

//导入默认数据
else if($dopost == "importDefaultData"){
    $importRes = array("state"=>100,"info"=>"操作成功");

    $defaultData = getDefaultData();

    //获取指定模块的数据
    if($action){
        $data = $defaultData[$action];
    }else{
        $data = flattenArray($defaultData);
    }

    if($data){
        foreach ($data as $sqlItem){
            $sqlItem = $dsql::SetQuery($sqlItem);
            $dsql->update($sqlItem);
        }
    }

    adminLog("导入默认数据", "系统广告_" . $action);
    echo json_encode($importRes);
    die;
}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/bootstrap-datetimepicker.min.js',
		// 'ui/jquery-ui-selectable.js',
		'ui/clipboard.min.js',
		'ui/jquery-smartMenu.js',
		'admin/siteConfig/advList.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('action', $action);
	$huoniaoTag->assign('type', (int)$type);

	if($type){
		$floders = listDir($dir);
		$skins = array();
		if(!empty($floders)){
			$i = 0;
			foreach($floders as $key => $floder){
				$config = $dir.'/'.$floder.'/config.xml';
				if(file_exists($config)){
					//解析xml配置文件
					$xml = new DOMDocument();
					libxml_disable_entity_loader(false);
					$xml->load($config);
					$data = $xml->getElementsByTagName('Data')->item(0);
					$tplname = $data->getElementsByTagName("tplname")->item(0)->nodeValue;
					$copyright = $data->getElementsByTagName("copyright")->item(0)->nodeValue;

					$skins[$i]['tplname'] = $tplname;
					$skins[$i]['directory'] = $floder;
					$i++;
				}
			}
		}
		$huoniaoTag->assign('typeListArr', json_encode($skins));
	}else{
		$huoniaoTag->assign('typeListArr', json_encode(getAdvTypeList(0, $action, $tab)));
	}

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/siteConfig";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}

//获取分类列表
function getAdvTypeList($id, $model, $tab){
	global $dsql;
	$sql = $dsql->SetQuery("SELECT `id`, `parentid`, `typename` FROM `#@__".$tab."type` WHERE `parentid` = $id AND `model` = '$model' ORDER BY `weight`");
	$results = $dsql->dsqlOper($sql, "results");
	if($results){//如果有子类
		foreach($results as $key => $value){
			$results[$key]["lower"] = getAdvTypeList($value['id'], $model, $tab);
		}
		return $results;
	}else{
		return "";
	}
}


function getDefaultData(){
    $_defaultData = array(
        "article" => array(
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("article", "0", "1", "新闻资讯_模板八_电脑端_专题首页_广告一", "pic$$https://ihuoniao.cn/include/attachment.php?f=Qkd0VE5nUmpCalFGTWxNdw==$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("article", "0", "2", "新闻资讯_模板三_移动端_头条幻灯", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/article/atlas/large/2024/02/01/17067519163857.png##火鸟资讯-更简单高效的智慧资讯平台######0||https://ihuoniao.cn/include/attachment.php?f=VUQ5Vk1BVmlWVzBCTjFBMA==##曹禺大师话剧《雷雨》走进苏州######0||https://ihuoniao.cn/include/attachment.php?f=VkR0UU5WY3dEallQT1ZZOA==##柏林电影节##https://ihuoniao.cn/sz/article?type=11####0||https://ihuoniao.cn/include/attachment.php?f=WHpCWE1nUmpBam9HTUZZeA==##我和我的祖国######0||https://ihuoniao.cn/include/attachment.php?f=WGpFR1l3SmxWVzBDTkZReA==##壮阔东方潮 奋进新时代######0||https://ihuoniao.cn/include/attachment.php?f=QUc4QVpWVXlBRGhSWjFNNA==##代表委员之声######0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("article", "0", "2", "新闻资讯_移动端_专题幻灯", "0$$0$$Vnp0ZE1WTTlCVHdDTjFJMA==##代表委员之声######0||https://ihuoniao.cn/include/attachment.php?f=QUd4VFB3SnNCVHhSWkZBeA==##我和我的祖国######0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("article", "0", "2", "新闻资讯_APP_头条幻灯", "0$$0$$QkdoU1BnSnRBVEFBT1FWbA==##曹禺大师话剧《雷雨》走进苏州##https://www.baidu.com####1||https://ihuoniao.cn/include/attachment.php?f=VXo5UlBWWTVBak1BT1ZVMA==##我和我的祖国######0||https://ihuoniao.cn/include/attachment.php?f=VVQxZE1WUTdEejRPTjFjeA==##壮阔东方潮 奋进新时代######0||https://ihuoniao.cn/include/attachment.php?f=QUd4VU9GTThEejRHUHdWaQ==##代表委员之声######0||https://ihuoniao.cn/include/attachment.php?f=VXo4SGExNHhBeklFUFFaaQ==##柏林电影节######0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("article", "0", "2", "新闻资讯_APP_专题幻灯", "0$$0$$WGpKU1BnVnFVMklET2xBMQ==##代表委员之声######0||https://ihuoniao.cn/include/attachment.php?f=VUR3Q2JsVTZVbU1GUEZBNg==##我和我的祖国######0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("article", "0", "1", "资讯移动端信息流广告", "code$${
         \"TencentGDT\":{
             \"h5\": {\"app_id\":\"1203685091\",\"placement_id\":\"1006915636675575\"},
             \"android\": {\"app_id\":\"1203684865\",\"placement_id\":\"3036414645660678\"},
             \"wxmini\": \"adunit-650c7e3623fc76ad\",
             \"dymini\": \"lwm48zt3u1mh71z3mv\"
          }
      }$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("article", "0", "2", "新闻资讯_模板四_移动端_头条幻灯", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/task/logo/large/2023/05/23/16848069574474.jpg##大好河山######0||https://ihuoniao.cn/include/attachment.php?f=/article/atlas/large/2023/08/21/16926039405749.jpg##其疾如风######0||https://ihuoniao.cn/include/attachment.php?f=/article/atlas/large/2023/08/07/16913791671122.jpg##其徐如林######0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("article", "0", "2", "新闻资讯_模板四_移动端_专题幻灯", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/article/atlas/large/2023/08/21/16926039405749.jpg####www.baidu.com####0||https://ihuoniao.cn/include/attachment.php?f=/article/atlas/large/2023/08/07/16913791671122.jpg########0||https://ihuoniao.cn/include/attachment.php?f=/job/atlas/large/2023/05/19/16844783543777.jpg########0||https://ihuoniao.cn/include/attachment.php?f=/article/atlas/large/2023/11/17/1700204896841.png########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("article", "0", "2", "新闻资讯_模板四_小程序_头条幻灯", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/article/atlas/large/2024/02/02/17068674072525.png##火鸟资讯-更简单高效的智慧资讯平台######0||https://ihuoniao.cn/include/attachment.php?f=/article/atlas/large/2024/02/04/17070129683452.png##柏林电影节##https://ihuoniao.cn/sz/article?type=11####0||https://ihuoniao.cn/include/attachment.php?f=/article/atlas/large/2024/02/04/17070131931094.png##曹禺大师话剧《雷雨》走进苏州######0||https://ihuoniao.cn/include/attachment.php?f=/article/atlas/large/2024/02/04/17070131939437.png##我和我的祖国######0||https://ihuoniao.cn/include/attachment.php?f=/article/atlas/large/2024/02/04/17070131942356.png##壮阔东方潮 奋进新时代######0||https://ihuoniao.cn/include/attachment.php?f=/article/atlas/large/2024/02/04/17070131948209.png##代表委员之声######0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("article", "0", "2", "新闻资讯_模板四_小程序_专题幻灯", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/job/atlas/large/2023/05/19/16844783543777.jpg########0||https://ihuoniao.cn/include/attachment.php?f=/article/atlas/large/2023/08/21/16926039405749.jpg########0||https://ihuoniao.cn/include/attachment.php?f=/article/atlas/large/2023/08/07/16913791671122.jpg########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("article", "0", "2", "新闻资讯_模板四_抖音小程序_头条幻灯", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/task/logo/large/2023/05/23/16848069574474.jpg##风景依旧######0||https://ihuoniao.cn/include/attachment.php?f=/article/atlas/large/2023/08/21/16926039405749.jpg########0||https://ihuoniao.cn/include/attachment.php?f=/article/atlas/large/2023/08/07/16913791671122.jpg########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("article", "0", "2", "新闻资讯_模板四_抖音小程序_专题幻灯", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/job/atlas/large/2023/05/19/16844783543777.jpg##风林火山######0||https://ihuoniao.cn/include/attachment.php?f=/article/atlas/large/2023/08/21/16926039405749.jpg########0||https://ihuoniao.cn/include/attachment.php?f=/article/atlas/large/2023/08/07/16913791671122.jpg########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("article", "0", "1", "新闻资讯_模板八_电脑端_首页_广告一", "pic$$https://ihuoniao.cn/include/attachment.php?f=/article/advthumb/large/2024/02/19/17083382737191.png$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("article", "0", "1", "资讯移动端详情页内容广告", "code$${
         \"TencentGDT\":{
             \"h5\": {\"app_id\":\"1203685091\",\"placement_id\":\"7077076415552488\"},
             \"android\": {\"app_id\":\"1203684865\",\"placement_id\":\"1047591623355113\"},
             \"wxmini\": \"adunit-047ca84f8d069d83\",
             \"dymini\": \"3ykno8wh2a0wu00cuz\"
          }
      }$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("article", "0", "1", "新闻资讯_模板八_电脑端_头条_广告一", "pic$$https://ihuoniao.cn/include/attachment.php?f=/article/advthumb/large/2024/02/18/17082268169654.png$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("article", "0", "1", "新闻资讯_模板八_电脑端_首页_广告三", "pic$$https://ihuoniao.cn/include/attachment.php?f=/article/advthumb/large/2024/02/18/1708226832990.png$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("article", "0", "1", "新闻资讯_模板八_电脑端_首页_广告四", "pic$$https://ihuoniao.cn/include/attachment.php?f=/article/advthumb/large/2024/02/18/17082268637494.png$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("article", "0", "1", "新闻资讯_模板八_电脑端_图片_广告一", "pic$$https://ihuoniao.cn/include/attachment.php?f=/article/advthumb/large/2024/02/18/17082268169654.png$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("article", "0", "1", "新闻资讯_模板八_电脑端_新闻详情页_广告一", "pic$$https://ihuoniao.cn/include/attachment.php?f=/article/advthumb/large/2024/02/18/17082268169654.png$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("article", "0", "1", "新闻资讯_模板八_电脑端_首页_广告二", "pic$$https://ihuoniao.cn/include/attachment.php?f=/article/advthumb/large/2024/02/19/17083380874432.png$$$$$$0$$0$$0", "1", "50");'
        ),
        "awardlegou" => array(
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("awardlegou", "0", "1", "有奖乐购_模板一_移动端_广告一", "pic$$https://ihuoniao.cn/include/attachment.php?f=QTI4QWJ3VnRCREZTYXdGcQ==$$$$$$0$$0$$0", "1", "50");'
        ),
        "business" => array(
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("business", "0", "2", "商家_模板四_电脑端_广告一", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/business/atlas/large/2024/02/27/17090174539978.png########0||https://ihuoniao.cn/include/attachment.php?f=QkdnSGFRVnNCekpUWWxBdw==########0||https://ihuoniao.cn/include/attachment.php?f=VlRsWE9RTnFBRFVDTXdKag==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("business", "0", "2", "商家_模板四_电脑端_广告二", "0$$0$$QldrQmIxUTlWbU5UWWxReQ==########0||https://ihuoniao.cn/include/attachment.php?f=QUd4UVBsYytCeklDTTF3Nw==########0||https://ihuoniao.cn/include/attachment.php?f=Vnp0ZE0xUTlCak1QUGx3NA==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("business", "0", "1", "商家_模板四_电脑端_广告三", "pic$$https://ihuoniao.cn/include/attachment.php?f=/business/advthumb/large/2024/02/27/1709022391682.png$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("business", "0", "2", "商家_模板四_电脑端_广告四", "0$$0$$Vnp0U1BGWS9BellQUGdGcg==########0||https://ihuoniao.cn/include/attachment.php?f=QldsU1BGSTdCak1ITmxNNA==########0||https://ihuoniao.cn/include/attachment.php?f=VlRrRmF3TnFVV1FCTTFZMA==########0||https://ihuoniao.cn/include/attachment.php?f=VmpwVFBRZHVBelpTWUZZMQ==########0||https://ihuoniao.cn/include/attachment.php?f=QjJzSGFWSTdBamNITlFCZw==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("business", "0", "1", "商家_模板四_电脑端_广告五", "pic$$https://ihuoniao.cn/include/attachment.php?f=/business/advthumb/large/2024/02/27/17090168127431.png$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("business", "0", "1", "商家_模板四_电脑端_广告六", "pic$$https://ihuoniao.cn/include/attachment.php?f=/business/advthumb/large/2024/02/27/17090164894811.png$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("business", "0", "2", "APP_商家_首页_广告一", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/business/atlas/large/2021/09/27/16327066784915.png########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("business", "0", "2", "APP_商家_首页_广告二", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/business/atlas/large/2021/09/27/1632721192645.png########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("business", "0", "2", "APP_商家_首页_广告三", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/business/atlas/large/2021/09/27/16327212654277.png########0||https://ihuoniao.cn/include/attachment.php?f=/business/atlas/large/2021/09/27/1632721270498.png########0||https://ihuoniao.cn/include/attachment.php?f=/business/atlas/large/2021/09/27/1632721273822.png########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("business", "0", "2", "APP_商家_首页_广告四", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/business/atlas/large/2021/09/27/16327213445838.png########0||https://ihuoniao.cn/include/attachment.php?f=/business/atlas/large/2021/09/27/16327213491796.png########0||https://ihuoniao.cn/include/attachment.php?f=/business/atlas/large/2021/09/27/16327213531615.png########0||https://ihuoniao.cn/include/attachment.php?f=/business/atlas/large/2021/09/27/16327213564905.png########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("business", "0", "2", "APP_商家_首页_广告五", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/business/atlas/large/2021/09/27/16327214023248.png########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("business", "0", "1", "商家_模板三_移动端_买单结果", "pic$$https://ihuoniao.cn/include/attachment.php?f=/business/advthumb/large/2022/04/20/16504254262771.png$$$$$$0$$0$$0", "1", "50");'
        ),
        "car" => array(
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("car", "0", "2", "汽车_模板一_移动端_广告一", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/car/atlas/large/2024/01/31/17066945092354.png########0||https://ihuoniao.cn/include/attachment.php?f=/car/atlas/large/2024/02/02/17068608882132.png########0||https://ihuoniao.cn/include/attachment.php?f=VWoxV013SnBBREFHTUZVdw==########0||https://ihuoniao.cn/include/attachment.php?f=VXp3SFlsVStCRFFFTWdkdA==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("car", "0", "2", "汽车_模板一_移动端_广告二", "0$$0$$VmprRllBQnJEendDTmxBeA==########0||https://ihuoniao.cn/include/attachment.php?f=/car/atlas/large/2023/12/05/17017724211846.png####https://ihuoniao.cn/sz/car/scrap.html####0||https://ihuoniao.cn/include/attachment.php?f=VmpsV00xQTdWbVVFTUYwNg==########0||https://ihuoniao.cn/include/attachment.php?f=QUc4R1kxSTVWbVZWWVZFMQ==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("car", "0", "2", "二手车_模板二_电脑端_广告一", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/car/atlas/large/2024/01/31/17066944742620.png########0||https://ihuoniao.cn/include/attachment.php?f=QUd3Q2JsUTRCRE5WYkZFNw==########0||https://ihuoniao.cn/include/attachment.php?f=WHpNQmJRVnBCekJVYlFKbg==########0||https://ihuoniao.cn/include/attachment.php?f=VkRnQmJWTS9WbUZVYlZBMA==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("car", "0", "1", "二手车_模板二_电脑端_广告二", "pic$$https://ihuoniao.cn/include/attachment.php?f=/car/advthumb/large/2024/02/02/17068510821455.png$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("car", "0", "1", "二手车_模板二_电脑端_广告三", "pic$$https://ihuoniao.cn/include/attachment.php?f=/car/advthumb/large/2024/02/02/17068511558762.png$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("car", "0", "1", "二手车列表_模板二_电脑端_广告一", "pic$$https://ihuoniao.cn/include/attachment.php?f=/car/advthumb/large/2024/02/02/17068511558762.png$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("car", "0", "1", "二手车列表_模板二_电脑端_广告二", "pic$$https://ihuoniao.cn/include/attachment.php?f=QTI5WE93TnZBRFlGTlZFNg==$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("car", "0", "1", "二手车列表_模板二_电脑端_广告三", "pic$$https://ihuoniao.cn/include/attachment.php?f=QTI4Q2JsTS9EemtPUDFBeg==$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("car", "0", "2", "二手车_模板二_电脑端_广告四", "0$$0$$QUd4Y01GOHpBelZUWVFGaQ==##超级工程港珠澳大桥！世界瞩目的首批次通车######0||https://ihuoniao.cn/include/attachment.php?f=VlRsUlBRZHJCekZSWTFVeQ==##大天窗才过瘾！3万起搞定夏日郊游神器######0||https://ihuoniao.cn/include/attachment.php?f=VmpwVk9WRTlBelVHTkFGbA==##比BBA还便宜的车，却能让你赚足了面子######0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("car", "0", "2", "二手车资讯列表_模板二_电脑端_广告一", "0$$0$$VkRoVU9BSnVBalFFTUZBdw==##所有的灵感  都代表了与时俱进######0||https://ihuoniao.cn/include/attachment.php?f=QkdnRmFRQnNBVGRTWmxJeg==##慧眼独步，这般考究######0||https://ihuoniao.cn/include/attachment.php?f=QldrR2FnVnBVV2NHTWxVeg==##所有的互动  都传递了心有灵犀######0||https://ihuoniao.cn/include/attachment.php?f=VVQxZE1RZHJCVE1GTjF3OA==##赋予运动豪华属性，海外试驾全新宝马8系敞篷版######0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("car", "0", "2", "APP_汽车_首页_广告一", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/car/atlas/large/2024/01/31/17066945092354.png########0||https://ihuoniao.cn/include/attachment.php?f=/car/atlas/large/2024/02/02/17068608882132.png########0||https://ihuoniao.cn/include/attachment.php?f=VkRnQ2FnTnVVMlJSWjFFdw==########0||https://ihuoniao.cn/include/attachment.php?f=QUd4V1BsNHpEemhSWjFBMg==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("car", "0", "2", "APP_汽车_首页_广告三", "0$$0$$WHpOU09sNHpVMlVHTjFRKw==##我要买车##https://ihuoniao.cn/car/list.html####1||https://ihuoniao.cn/include/attachment.php?f=QldrQ2FsQTlWR0lBTVFKcA==##我要卖车##https://ihuoniao.cn/car/sell.html####1||https://ihuoniao.cn/include/attachment.php?f=VlRsY05GUTVBelZSWUZ3NQ==##线下门店##https://ihuoniao.cn/car/store.html####1||https://ihuoniao.cn/include/attachment.php?f=QldsVE8xSS9BVGRTWXdCaw==##个人车主##https://ihuoniao.cn/car/list.html?usertype=0####1||https://ihuoniao.cn/include/attachment.php?f=VWo0Q2FnVm9CVE1QUFFaaw==##汽车资讯##https://ihuoniao.cn/car/news.html####1", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("car", "0", "2", "APP_汽车_首页_广告四", "0$$0$$QW01VVBGOHlEamdBTWdCag==####https://ihuoniao.cn/car/list.html\"####1||https://ihuoniao.cn/include/attachment.php?f=VVQwQmFWSS9EemtITlZjMw==####https://ihuoniao.cn/u/enter_car.html####1", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("car", "0", "2", "APP_汽车_首页_广告二", "0$$0$$VnpzRmJWWTdCakJWWjFBeA==########0||https://ihuoniao.cn/include/attachment.php?f=/car/atlas/large/2023/12/05/17017724211846.png####https://ihuoniao.cn/sz/car/scrap.html####1||https://ihuoniao.cn/include/attachment.php?f=VXo4RmJWQTlCVE1BTWdGbQ==########0||https://ihuoniao.cn/include/attachment.php?f=QUd3RmJWRThVV2RWWjEwNQ==########0", "1", "50");'
        ),
        "dating" => array(
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("dating", "0", "2", "大图幻灯", "1920$$415$$https://ihuoniao.cn/include/attachment.php?f=/dating/atlas/large/2018/02/06/15179036959127.jpg##免费阅读所有来信####||https://ihuoniao.cn/include/attachment.php?f=/dating/atlas/large/2018/02/06/15179037037612.jpg##幸福是主动追求####||https://ihuoniao.cn/include/attachment.php?f=/dating/atlas/large/2018/02/06/15179037098222.jpg##优质实体店####", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("dating", "0", "1", "谁看过我下面", "pic$$https://ihuoniao.cn/include/attachment.php?f=/adv_default/dating/14647535786670.jpg$$$$111$$290$$120", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("dating", "0", "1", "精彩活动下面", "pic$$https://ihuoniao.cn/include/attachment.php?f=/adv_default/dating/14647566103070.jpg$$$$2222$$290$$120", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("dating", "0", "2", "通栏幻灯", "1920$$270$$https://ihuoniao.cn/include/attachment.php?f=/dating/atlas/large/2018/02/06/15179038922558.jpg######", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("dating", "0", "1", "交友电脑端_模板二_情感课堂__广告1-1", "pic$$https://ihuoniao.cn/include/attachment.php?f=VlRvQmJ3Tm9EanNPUFZRMA==$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("dating", "0", "2", "互动交友_模板一_移动端_头条幻灯", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/dating/atlas/large/2024/02/18/17082242919183.png########0||https://ihuoniao.cn/include/attachment.php?f=WHpOWE9RSnBWR2NFTXdCZw==########0||https://ihuoniao.cn/include/attachment.php?f=WGpJQ2JGTTRVV0lFTTF3Lw==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("dating", "0", "2", "交友_移动端_红娘团队_banneraaa", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/dating/atlas/large/2024/02/18/1708224441789.png########0", "1", "50");'
        ),
        "education" => array(
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("education", "0", "2", "教育培训_模板一_移动端_广告一", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/education/atlas/large/2024/02/02/17068465802479.png########0||https://ihuoniao.cn/include/attachment.php?f=QW00QmJWQStBVGxUYWdaaA==########0||https://ihuoniao.cn/include/attachment.php?f=WHpNRmFWNHdBanBVYlZVeA==########0||https://ihuoniao.cn/include/attachment.php?f=WGpJQWJBUnFEallGUEZJMw==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("education", "0", "2", "教育培训_模板一_移动端_广告二", "0$$0$$VXo5ZE1WVTdWbThDTzF3Kw==########0||https://ihuoniao.cn/include/attachment.php?f=VUR3QmJRUnFCVHhUYWxFeQ==########0||https://ihuoniao.cn/include/attachment.php?f=VVQxV09nTnREellQTmdGaA==########0||https://ihuoniao.cn/include/attachment.php?f=VmpvQmJWTTlCejVXYndkbQ==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("education", "0", "2", "教育_模板二_电脑端_广告一", "0$$0$$QTI5Vk9WRTlBRGNDTjEwMg==########0||https://ihuoniao.cn/include/attachment.php?f=/education/atlas/large/2024/02/02/17068465079517.png########0||https://ihuoniao.cn/include/attachment.php?f=WGpKVFB3TnZEamtETmxZeQ==########0||https://ihuoniao.cn/include/attachment.php?f=QUd3SGFBTnJEanNBTlZVMA==########0||https://ihuoniao.cn/include/attachment.php?f=QW00QWIxRTVWR0VBTlFWag==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("education", "0", "2", "教育_模板二_电脑端_广告二", "0$$0$$QldrRmFWRTlBalVHTUFGag==########0||https://ihuoniao.cn/include/attachment.php?f=QkdnQmJRZHJBVFlDTkFWbQ==########0||https://ihuoniao.cn/include/attachment.php?f=VlRsVU9GYzdWbUZSWjFNeg==########0||https://ihuoniao.cn/include/attachment.php?f=VVQwQmJWWTZCekJVWWdCaA==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("education", "0", "2", "教育_模板二_电脑端_广告三", "0$$0$$VmpwY01BSnVCVElETkFCaQ==########0||https://ihuoniao.cn/include/attachment.php?f=VVQxY01GQThBVFlETkZFeQ==########0||https://ihuoniao.cn/include/attachment.php?f=VnpzR2FnSnVCRE1CTmdkbg==########0||https://ihuoniao.cn/include/attachment.php?f=VVQwSGExSStVbVVGTWdkbQ==########0||https://ihuoniao.cn/include/attachment.php?f=VWo1V09nSnVBRGNHTVZVeg==########0||https://ihuoniao.cn/include/attachment.php?f=QjJzRmFWVTVVV1lQT0ZNMA==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("education", "0", "2", "教育详情_模板二_电脑端_广告一", "0$$0$$VWo1Vk9WNHlBelJUWkFKbQ==########0||https://ihuoniao.cn/include/attachment.php?f=VkRoU1BsOHpVMlFQT0ZjeQ==########0||https://ihuoniao.cn/include/attachment.php?f=WHpOWE8xYzdCVElPT1Facw==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("education", "0", "2", "教育列表_模板二_电脑端_广告一", "0$$0$$VkRoUlBWSStBRGNFTTEwMg==########0||https://ihuoniao.cn/include/attachment.php?f=Vnp0V09sQThCakVCT1FKZw==########0||https://ihuoniao.cn/include/attachment.php?f=QTI5UVBBSnVEemdHUGxJeA==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("education", "0", "1", "教育_模板二_电脑端_广告七", "pic$$https://ihuoniao.cn/include/attachment.php?f=QjJ0UVBGRTlWR05WYlFGaA==$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("education", "0", "1", "教育_模板二_电脑端_广告八", "pic$$https://ihuoniao.cn/include/attachment.php?f=VUR4Vk9WWTZBRGRSYVZRMQ==$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("education", "0", "2", "教育_模板二_电脑端_广告四", "0$$0$$WGpJQWJBUm9EamtCT1ZJNA==########0||https://ihuoniao.cn/include/attachment.php?f=VXo4QWJGTS9VV1pWYlZ3Mw==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("education", "0", "1", "教育_模板二_电脑端_广告五", "pic$$https://ihuoniao.cn/include/attachment.php?f=VWo1UVBGQThWR05TYWxjeg==$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("education", "0", "1", "教育_模板二_电脑端_广告六", "pic$$https://ihuoniao.cn/include/attachment.php?f=Vnp0V09sYzdWV0lET3dWZw==$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("education", "0", "2", "APP_教育_首页_广告一", "0$$0$$Vnp0U09sNHpWbU1ITUZFMg==########0||https://ihuoniao.cn/include/attachment.php?f=QUd4V1BsQTlEem9GTWdkag==########0||https://ihuoniao.cn/include/attachment.php?f=VmpvQ2FsRThCeklHTVFGaw==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("education", "0", "2", "APP_教育_首页_广告二", "0$$0$$VXo5WFB3TnVEanNBTndacw==########0||https://ihuoniao.cn/include/attachment.php?f=VlRrQmFWWTdWR0ZWWWxBNw==########0||https://ihuoniao.cn/include/attachment.php?f=VXo4Q2FnSnZCVEJVYkZRMg==########0||https://ihuoniao.cn/include/attachment.php?f=VWo0QmFWRThWR0VETzFJeA==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("education", "0", "2", "APP_教育_首页_广告三", "0$$0$$VmpwWFB3Vm9VbVlITmxjMQ==####https://ihuoniao.cn/education/store.html####0||https://ihuoniao.cn/include/attachment.php?f=VWo1Uk9RSnZCREFQUGdkaw==####https://ihuoniao.cn/education/tutor.html####0||https://ihuoniao.cn/include/attachment.php?f=Vnp0Y05BVm9EanBUWWdWbA==####https://ihuoniao.cn/education/word.html####0", "1", "50");'
        ),
        "homemaking" => array(
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("homemaking", "0", "2", "家政信息_模板一_移动端_广告一", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/homemaking/atlas/large/2024/02/01/17067796531362.png########0||https://ihuoniao.cn/include/attachment.php?f=/homemaking/atlas/large/2024/02/01/17067804525791.png########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("homemaking", "0", "2", "家政信息_模板一_移动端_广告二", "0$$0$$VXp3RllBTnJBVElHUGdGbQ==########0||https://ihuoniao.cn/include/attachment.php?f=QldwVU1RQm9EajFTYWxjeA==########0||https://ihuoniao.cn/include/attachment.php?f=QUc5ZE9BTnJVMkFETzFFMQ==########0||https://ihuoniao.cn/include/attachment.php?f=VkR0Uk5GODNWR2NGUFZZeg==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("homemaking", "0", "2", "家政_模板二_电脑端_广告一", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/homemaking/atlas/large/2024/02/01/17067805531996.png########0||https://ihuoniao.cn/include/attachment.php?f=VmpwV09BQnBEem9FTUFCZw==####https://ihuoniao.cn/sz/homemaking/nanny.html####0||https://ihuoniao.cn/include/attachment.php?f=VkRnQ2JBTnFVV1JXWWx3Lw==####https://ihuoniao.cn/sz/homemaking/list.html?addrid=&business=&type=1&typeid=&homemakingtype=&price=&keywords=####0||https://ihuoniao.cn/include/attachment.php?f=VWo0Q2JGRTRCak1ETndkbA==####https://ihuoniao.cn/sz/homemaking/list.html####0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("homemaking", "0", "1", "家政_模板二_电脑端_广告二", "pic$$https://ihuoniao.cn/include/attachment.php?f=VXo5WE9WQTVCak5TWmdKbg==$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("homemaking", "0", "1", "家政_模板二_电脑端_广告三", "pic$$https://ihuoniao.cn/include/attachment.php?f=WHpOZE0xTTZBVFFPT2xjdw==$$https://ihuoniao.cn/sz/homemaking/nanny.html$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("homemaking", "0", "2", "APP_家政_首页_广告一", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/homemaking/atlas/large/2021/08/23/16296869352988.png########0||https://ihuoniao.cn/include/attachment.php?f=/homemaking/atlas/large/2021/08/23/16296869424442.png########0||https://ihuoniao.cn/include/attachment.php?f=/homemaking/atlas/large/2021/08/23/1629686946847.png########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("homemaking", "0", "2", "APP_家政_首页_广告二", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/homemaking/atlas/large/2021/08/23/16296870033336.png####https://ihuoniao.cn/b/fabu-homemaking.html####1||https://ihuoniao.cn/include/attachment.php?f=/homemaking/atlas/large/2021/08/23/16296870064270.png####https://ihuoniao.cn/b/config-homemaking.html####1", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("homemaking", "0", "2", "APP_家政_首页_广告三", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/homemaking/atlas/large/2021/08/23/1629687035209.png########0||https://ihuoniao.cn/include/attachment.php?f=/homemaking/atlas/large/2021/08/23/16296870394880.png########0||https://ihuoniao.cn/include/attachment.php?f=/homemaking/atlas/large/2021/08/23/16296873632487.png########0||https://ihuoniao.cn/include/attachment.php?f=/homemaking/atlas/large/2021/08/23/16296873693877.png########0", "1", "50");'
        ),
        "house" => array(
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("house", "0", "1", "房产_模板六_电脑端_广告二", "pic$$https://ihuoniao.cn/include/attachment.php?f=/house/advthumb/large/2024/01/31/17066922568563.png$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("house", "0", "2", "房产_模板二_移动端_广告一", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/house/atlas/large/2024/01/31/17066912669744.png########0||https://ihuoniao.cn/include/attachment.php?f=/house/atlas/large/2024/01/31/17066912665843.png########0||https://ihuoniao.cn/include/attachment.php?f=/house/atlas/large/2024/01/31/17066912662317.png########0||https://ihuoniao.cn/include/attachment.php?f=/house/atlas/large/2024/01/31/17066917912794.png####https://ihuoniao.cn/house/news.html####0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("house", "0", "1", "房产_模板七_电脑端_广告一", "pic$$https://ihuoniao.cn/include/attachment.php?f=WHpBR2FGWS9WV1ZWYkZ3NQ==$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("house", "0", "1", "房产_模板七_电脑端_广告二", "pic$$https://ihuoniao.cn/include/attachment.php?f=VlRvQWJsNDNVMk1GUEZZOA==$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("house", "0", "1", "房产_模板七_电脑端_广告四", "pic$$https://ihuoniao.cn/include/attachment.php?f=WHpCY01sTTZBekJUWTFNeA==$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("house", "0", "1", "房产_模板七_电脑端_广告三", "pic$$https://ihuoniao.cn/include/attachment.php?f=QldvQWJsUTlWbVVFTkFabA==$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("house", "0", "1", "房产_模板七_电脑端_广告五", "pic$$https://ihuoniao.cn/include/attachment.php?f=VlRwUlAxSTdWbVZVWkZjMw==$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("house", "0", "2", "APP_房产_首页_广告二", "0$$0$$VVQ1WE1sODNCVHdCT1FWaA==########0||https://ihuoniao.cn/include/attachment.php?f=VkR0VU1RUnNVbXNFUEZjeQ==########0||https://ihuoniao.cn/include/attachment.php?f=VlRwVU1RQm9CVHhVYkZVLw==########0||https://ihuoniao.cn/include/attachment.php?f=VUQ5VE5sNDJCVHdDT2xjOA==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("house", "0", "2", "APP_房产_首页_广告一", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/house/atlas/large/2024/01/31/17066912669744.png########0||https://ihuoniao.cn/include/attachment.php?f=/house/atlas/large/2024/01/31/17066912665843.png########0||https://ihuoniao.cn/include/attachment.php?f=/house/atlas/large/2024/01/31/17066912662317.png########0||https://ihuoniao.cn/include/attachment.php?f=/house/atlas/large/2024/01/31/17066917912794.png########0||https://ihuoniao.cn/include/attachment.php?f=VUQ5Vk1BUnRCRFJSWmdWaA==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("house", "0", "2", "房产_模板一_电脑端_广告十五", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/house/atlas/large/2021/08/20/1629450460270.jpg##景枫华座######0||https://ihuoniao.cn/include/attachment.php?f=/house/atlas/large/2021/08/20/16294504617579.jpg##景枫华座######0||https://ihuoniao.cn/include/attachment.php?f=/house/atlas/large/2021/08/20/16294504685160.jpg##景枫华座######0||https://ihuoniao.cn/include/attachment.php?f=/house/atlas/large/2021/08/20/16294504698965.jpg##景枫华座######0||https://ihuoniao.cn/include/attachment.php?f=/house/atlas/large/2021/08/20/1629450468715.jpg##景枫华座######0||https://ihuoniao.cn/include/attachment.php?f=/house/atlas/large/2021/08/20/16294504789997.jpg##景枫华座######0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("house", "0", "2", "房产_模板六_电脑端_广告一", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/house/atlas/large/2024/01/31/17066736842325.png########0||https://ihuoniao.cn/include/attachment.php?f=/house/atlas/large/2024/01/31/1706673685642.png########0||https://ihuoniao.cn/include/attachment.php?f=/house/atlas/large/2024/01/31/17066736852942.png########0||https://ihuoniao.cn/include/attachment.php?f=/house/atlas/large/2024/02/02/17068596447487.png########0||https://ihuoniao.cn/include/attachment.php?f=/house/atlas/large/2024/02/02/17068596459430.png########0||https://ihuoniao.cn/include/attachment.php?f=/house/atlas/large/2024/02/02/17068596453029.png########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("house", "0", "1", "房产_模板六_电脑端_中介公司", "pic$$https://ihuoniao.cn/include/attachment.php?f=/house/advthumb/large/2024/02/22/1708589700704.png$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("house", "0", "1", "房产信息_模板六_电脑端_广告一", "pic$$https://ihuoniao.cn/include/attachment.php?f=/house/advthumb/large/2024/01/31/17066922568563.png$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("house", "0", "1", "房产_模板六_电脑端_广告_2-1", "pic$$https://ihuoniao.cn/include/attachment.php?f=/house/advthumb/large/2024/02/22/17085929146707.png$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("house", "0", "1", "房产_模板六_电脑端_广告_2-2", "pic$$https://ihuoniao.cn/include/attachment.php?f=/house/advthumb/large/2024/02/22/17085960466633.png$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("house", "0", "1", "房产_模板六_电脑端_广告_3-1", "pic$$https://ihuoniao.cn/include/attachment.php?f=/house/advthumb/large/2024/02/22/17085960687202.png$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("house", "0", "1", "房产_模板六_电脑端_广告_3-2", "pic$$https://ihuoniao.cn/include/attachment.php?f=/house/advthumb/large/2024/02/22/17085961337677.png$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("house", "0", "1", "房产_模板六_电脑端_广告_4-1", "pic$$https://ihuoniao.cn/include/attachment.php?f=/house/advthumb/large/2024/02/22/17085961721361.png$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("house", "0", "1", "房产_模板六_电脑端_广告_4-2", "pic$$https://ihuoniao.cn/include/attachment.php?f=/house/advthumb/large/2024/02/22/17085961996406.png$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("house", "0", "1", "房产_模板六_电脑端_广告_5-1", "pic$$https://ihuoniao.cn/include/attachment.php?f=/house/advthumb/large/2024/02/22/17085962343341.png$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("house", "0", "1", "房产_模板六_电脑端_广告_5-2", "pic$$https://ihuoniao.cn/include/attachment.php?f=/house/advthumb/large/2024/02/22/17085962604947.png$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("house", "0", "1", "房产信息_模板六_电脑端_广告二", "pic$$https://ihuoniao.cn/include/attachment.php?f=/house/advthumb/large/2024/02/22/17085972833824.png$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("house", "0", "1", "房产信息_模板六_电脑端_广告三", "pic$$https://ihuoniao.cn/include/attachment.php?f=/house/advthumb/large/2024/02/22/17085973005987.png$$$$$$0$$0$$0", "1", "50");'
        ),
        "huangye" => array(
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("huangye", "0", "2", "便民黄页_模板二_移动端_广告一", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/huangye/atlas/large/2022/04/11/16496621083544.jpg########0", "1", "50");'
        ),
        "huodong" => array(
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("huodong", "0", "2", "活动_模板二_移动端_广告二", "0$$0$$WHpNSGFWWXdCalFFTmdkcw==########0||https://ihuoniao.cn/include/attachment.php?f=QTI5VU9sUXlWbVJSWWxFeg==########0||https://ihuoniao.cn/include/attachment.php?f=QkdoZE0xVXpVV05WWmxjMA==########0||https://ihuoniao.cn/include/attachment.php?f=QUd4VU9nTmxBakFGTmdabQ==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("huodong", "0", "1", "活动_模板三_电脑端_广告二", "pic$$https://ihuoniao.cn/include/attachment.php?f=/huodong/advthumb/large/2024/02/01/17067818288714.png$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("huodong", "0", "1", "活动_模板三_电脑端_广告三", "pic$$https://ihuoniao.cn/include/attachment.php?f=VmpwU1BBTmxVbUFETUFkaA==$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("huodong", "0", "2", "活动_模板二_移动端_广告一", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/huodong/atlas/large/2024/02/01/17067812361800.png########0||https://ihuoniao.cn/include/attachment.php?f=QkdoWE9WODVBVE1BT0FWbQ==####miniprogram://pages/redirect/index?url=openxcx_wxef115b359ebec794####0||https://ihuoniao.cn/include/attachment.php?f=QW01ZE13Qm1VbUJXYmxBeA==########0||https://ihuoniao.cn/include/attachment.php?f=QjJzQmIxRTNWR1lIUHdGaA==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("huodong", "0", "2", "活动_模板三_电脑端_广告一", "0$$0$$VUR4Y01nUmlWR1pVYkFKaw==########0||https://ihuoniao.cn/include/attachment.php?f=https://ihuoniao.cn/include/attachment.php?f=/huodong/atlas/large/2024/02/01/17067817327214.png########0||VWo1U1BGWXdEandFUEZFMQ==########0||https://ihuoniao.cn/include/attachment.php?f=VXo5Y01sODVVbUJXYmwwNg==########0||https://ihuoniao.cn/include/attachment.php?f=VlRsUlAxODVCelZSYVZjeQ==########0||https://ihuoniao.cn/include/attachment.php?f=VlRsUVBsUXlWR1lETzFNNQ==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("huodong", "0", "2", "APP_活动_首页_广告一", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/huodong/atlas/large/2024/02/02/17068669298302.png########0||https://ihuoniao.cn/include/attachment.php?f=/huodong/atlas/large/2024/02/02/17068668389265.png########0||https://ihuoniao.cn/include/attachment.php?f=/huodong/atlas/large/2024/02/02/17068668388932.png########0||https://ihuoniao.cn/include/attachment.php?f=/huodong/atlas/large/2024/02/02/17068668382129.png########0||https://ihuoniao.cn/include/attachment.php?f=/huodong/atlas/large/2024/02/02/17068668392520.png########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("huodong", "0", "2", "APP_活动_首页_广告二", "0$$0$$WGpKY05BTnZBRElHTWdWZw==########0||https://ihuoniao.cn/include/attachment.php?f=VWo0RmJRTnZWR1lPT2dacw==########0||https://ihuoniao.cn/include/attachment.php?f=VWo0QmFWUTRBakFETjFFNg==########0||https://ihuoniao.cn/include/attachment.php?f=VVQwQmFRVnBCelZUWmdaaw==########0", "1", "50");'
        ),
        "image" => array(
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("image", "0", "2", "图说新闻_模板一_电脑端_广告一", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/image/atlas/large/2018/02/06/15179062933161.jpg##沈阳某整形医院年会现场####||https://ihuoniao.cn/include/attachment.php?f=/image/atlas/large/2018/02/06/15179063136541.jpg##男子因女友被抢习武未成 隐居山洞做道士####||https://ihuoniao.cn/include/attachment.php?f=/image/atlas/large/2018/02/06/15179063239891.jpg##辣眼睛!韩男团穿金色紧身衣跳有氧体操####||https://ihuoniao.cn/include/attachment.php?f=/image/atlas/large/2018/02/06/15179063326381.jpg##黄晓明升级当爸 贴心送记者老婆饼####", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("image", "0", "1", "图说新闻_模板一_电脑端_广告六", "code$$
      <li>
          <a href=\"#\">
              <span>萌宠</span>
          </a>
      </li>
      <li>
          <a href=\"#\">
              <span>
                  诱惑<i></i>
              </span>
          </a>
      </li>
      <li class=\"row2\">
          <a href=\"#\">
              <span>
                  动态图<i></i>
              </span>
          </a>
      </li>
      <li>
          <a href=\"#\">
              <span>无法直视</span>
          </a>
      </li>
      <li>
          <a href=\"#\">
              <span>大写的污</span>
          </a>
      </li>
      <li>
          <a href=\"#\">
              <span>恶搞</span>
          </a>
      </li>
      <li>
          <a href=\"#\">
              <span>囧途</span>
          </a>
      </li>
      <li class=\"row2\">
          <a href=\"#\">
              <span>汽车</span>
          </a>
      </li>
      <li>
          <a href=\"#\">
              <span>萌萌哒</span>
          </a>
      </li>
      <li>
          <a href=\"#\">
              <span>动漫图片</span>
          </a>
      </li>
      <li>
          <a href=\"#\">
              <span>性感美女</span>
          </a>
      </li>
      <li>
          <a href=\"#\">
              <span>小清新</span>
          </a>
      </li>
      $$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("image", "0", "2", "图说新闻_模板一_移动端_广告一", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/live/atlas/large/2023/03/10/1678436376625.png########0||https://ihuoniao.cn/include/attachment.php?f=/live/atlas/large/2023/03/10/16784363846081.png########0", "1", "50");'
        ),
        "info" => array(
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("info", "0", "2", "APP_分类信息_幻灯", "0$$0$$QW0xZE9BZHVWbU1BT1YwNA==########0||https://ihuoniao.cn/include/attachment.php?f=VmprR1kxWS9Eem9HUDFNMA==########0||https://ihuoniao.cn/include/attachment.php?f=VmpsVE5nQnBBRFZWYkZVeA==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("info", "0", "2", "APP_分类信息_发布入驻", "0$$0$$QUd4VFBRZHBEejBGTndkaw==####https://ihuoniao.cn/u/info.html####0||https://ihuoniao.cn/include/attachment.php?f=WHpOVk8xNHdVMkVDTUZ3OA==####https://ihuoniao.cn/u/enter.html#join####0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("info", "0", "2", "APP_分类信息_三图", "0$$0$$VVQxV09GYzVVbUFBTWxZdw==########0||https://ihuoniao.cn/include/attachment.php?f=QUd3QmIxTTlCRFpSWUFKbw==########0||https://ihuoniao.cn/include/attachment.php?f=QUd4U1BBTnREejFUWWdGcQ==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("info", "0", "1", "APP_分类信息_最新入驻下方", "pic$$https://ihuoniao.cn/include/attachment.php?f=QkdoUVBsVTdWR1lDTTEwNw==$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("info", "0", "2", "APP_分类信息_首页_广告一", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/info/atlas/large/2024/02/01/17067828958.png########0||https://ihuoniao.cn/include/attachment.php?f=/info/atlas/large/2024/02/01/17067828953515.png########0||https://ihuoniao.cn/include/attachment.php?f=/info/atlas/large/2021/12/20/16399955343486.png########0||https://ihuoniao.cn/include/attachment.php?f=/info/atlas/large/2021/12/20/16399955333731.png####https://ihuoniao.cn/info/category.html####0||https://ihuoniao.cn/include/attachment.php?f=/info/atlas/large/2021/12/20/1639995594563.jpg########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("info", "0", "2", "APP_分类信息_首页_广告二", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/info/atlas/large/2021/12/20/16399947754047.png####https://ihuoniao.cn/b####0||https://ihuoniao.cn/include/attachment.php?f=/info/atlas/large/2021/12/20/16399949274077.png####https://ihuoniao.cn/u/info.html?appTitle####0||https://ihuoniao.cn/include/attachment.php?f=/info/atlas/large/2021/12/20/16399949335169.png####https://ihuoniao.cn/u/qiandao.html####0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("info", "0", "2", "二手信息_模板十一_电脑端_广告一", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/info/atlas/large/2024/02/01/17067826063258.png########0||https://ihuoniao.cn/include/attachment.php?f=/info/atlas/large/2024/02/01/17067826065423.png########0||https://ihuoniao.cn/include/attachment.php?f=/info/atlas/large/2021/11/30/16382506823782.png########0||https://ihuoniao.cn/include/attachment.php?f=/info/atlas/large/2021/11/30/16382518542622.png########0||https://ihuoniao.cn/include/attachment.php?f=/info/atlas/large/2021/11/30/16382518249048.png########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("info", "0", "2", "二手信息_模板十一_电脑端_广告二", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/info/atlas/large/2021/11/30/16382507554952.png########0||https://ihuoniao.cn/include/attachment.php?f=/info/atlas/large/2021/11/30/16382507586348.png########0||https://ihuoniao.cn/include/attachment.php?f=/info/atlas/large/2021/11/30/16382507603233.png########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("info", "0", "2", "二手信息_模板四_移动端_广告一", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/info/atlas/large/2024/02/01/17067828958.png########0||https://ihuoniao.cn/include/attachment.php?f=/info/atlas/large/2024/02/01/17067828953515.png########0||https://ihuoniao.cn/include/attachment.php?f=/info/atlas/large/2021/11/30/16382509028919.png########0||https://ihuoniao.cn/include/attachment.php?f=/info/atlas/large/2021/11/30/16382509029626.png####https://ihuoniao.cn/info/category.html####0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("info", "0", "1", "二手信息_模板十一_电脑端_广告五", "pic$$https://ihuoniao.cn/include/attachment.php?f=/info/advthumb/large/2021/11/30/1638250923705.gif$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("info", "0", "1", "二手信息_模板十一_电脑端_广告三", "pic$$https://ihuoniao.cn/include/attachment.php?f=/info/advthumb/large/2024/02/18/17082279607601.png$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("info", "0", "2", "二手信息_模板四_移动端_广告二", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/info/atlas/large/2021/11/30/16382509705762.png####https://ihuoniao.cn/b/?currentPageOpen=1 &amp;module=info####0||https://ihuoniao.cn/include/attachment.php?f=/info/atlas/large/2021/11/30/16382509714443.png####https://ihuoniao.cn/u/qiandao.html####0||https://ihuoniao.cn/include/attachment.php?f=/info/atlas/large/2021/12/20/16399948821160.png####https://ihuoniao.cn/u/fabu-info.html####0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("info", "0", "1", "分类信息移动端信息流广告", "code$${
         \"TencentGDT\":{
             \"h5\": {\"app_id\":\"1203685091\",\"placement_id\":\"1006915636675575\"},
             \"android\": {\"app_id\":\"1203684865\",\"placement_id\":\"3036414645660678\"},
             \"wxmini\": \"adunit-650c7e3623fc76ad\",
             \"dymini\": \"lwm48zt3u1mh71z3mv\"
          }
      }$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("info", "0", "1", "分类信息移动端详情页内容广告", "code$${
         \"TencentGDT\":{
             \"h5\": {\"app_id\":\"1203685091\",\"placement_id\":\"7077076415552488\"},
             \"android\": {\"app_id\":\"1203684865\",\"placement_id\":\"1047591623355113\"},
             \"wxmini\": \"adunit-047ca84f8d069d83\",
             \"dymini\": \"3ykno8wh2a0wu00cuz\"
          }
      }$$0", "1", "50");'
        ),
        "integral" => array(
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("integral", "0", "2", "积分商城_模板一_电脑端_广告一", "0$$0$$VXp0VU1WRTlEemM9######||https://ihuoniao.cn/include/attachment.php?f=/integral/atlas/large/2018/02/06/15179097706567.png######", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("integral", "0", "2", "积分商城_模板一_电脑端_广告二", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/integral/atlas/large/2018/02/06/15179098731609.png######||https://ihuoniao.cn/include/attachment.php?f=/integral/atlas/large/2018/02/06/15179098753254.png######||https://ihuoniao.cn/include/attachment.php?f=/integral/atlas/large/2018/02/06/151790987633.png######", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("integral", "0", "2", "积分商城_模板一_分类广告2", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/integral/atlas/large/2018/02/06/15179101612546.png######||https://ihuoniao.cn/include/attachment.php?f=/integral/atlas/large/2018/02/06/1517910163470.png######", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("integral", "0", "2", "积分商城_模板一_分类广告7", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/integral/atlas/large/2018/02/06/15179101787183.png######||https://ihuoniao.cn/include/attachment.php?f=/integral/atlas/large/2018/02/06/15179101807596.png######", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("integral", "0", "2", "积分商城_模板一_分类广告11", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/integral/atlas/large/2018/02/06/15179101958869.png######||https://ihuoniao.cn/include/attachment.php?f=/integral/atlas/large/2018/02/06/1517910197298.png######", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("integral", "0", "2", "积分商城_模板二_移动端_广告一", "0$$0$$WHpCWE9WUThEejBETWwwOA==########0||https://ihuoniao.cn/include/attachment.php?f=Qkd0VU9nVnRCVGRWWkZBMg==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("integral", "0", "2", "积分商城_模板一_分类广告15", "0$$0$$WGpJR2FsOHhCelZUYXdWZw==########0||https://ihuoniao.cn/include/attachment.php?f=VlRrQmJWSThEanhUYTFBNg==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("integral", "0", "2", "积分商城_模板一_分类广告19", "0$$0$$VmpvQmJWYzVCelVDT2wwMg==########0||https://ihuoniao.cn/include/attachment.php?f=WHpOUlBWSThBekVET2daaw==########0", "1", "50");'
        ),
        "job" => array(
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("job", "0", "2", "招聘求职_模板八_电脑端_广告七", "0$$0$$https://upload.ihuoniao.cn//job/default/16808592198938.png########1", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("job", "0", "2", "招聘求职_模板八_电脑端_广告六", "0$$0$$https://upload.ihuoniao.cn//job/default/16808591396600.png####https://www.kumanyun.com####1", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("job", "0", "2", "招聘求职_模板八_电脑端_广告五", "0$$0$$https://upload.ihuoniao.cn//job/default/16808590984998.png########1", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("job", "0", "2", "招聘求职_模板八_电脑端_广告四", "0$$0$$https://upload.ihuoniao.cn//job/default/16808589938908.png########1||https://upload.ihuoniao.cn//job/default/16808589938908.png########1||https://upload.ihuoniao.cn//job/default/16808589938908.png########1||https://upload.ihuoniao.cn//job/default/16808589938908.png########1||https://upload.ihuoniao.cn//job/default/16808589938908.png########1||https://upload.ihuoniao.cn//job/default/16808589938908.png########1", "0", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("job", "0", "2", "招聘求职_模板八_电脑端_广告三", "0$$0$$https://upload.ihuoniao.cn//job/default/168085878321.png########1||https://upload.ihuoniao.cn//job/default/168085878321.png########1", "0", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("job", "0", "2", "招聘求职_模板八_电脑端_广告二", "0$$0$$https://upload.ihuoniao.cn//job/default/16808587425681.png########1", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("job", "0", "2", "招聘求职_模板八_电脑端_广告一", "0$$0$$https://upload.ihuoniao.cn//job/default/16808609171532.png####https://www.kumanyun.com####1||https://ihuoniao.cn/include/attachment.php?f=/job/atlas/large/2024/01/31/1706695419926.png########0||https://ihuoniao.cn/include/attachment.php?f=/job/atlas/large/2024/02/18/17082270906985.png########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("job", "0", "2", "招聘求职_模板二_APP_普工_广告二", "0$$0$$https://upload.ihuoniao.cn//job/default/1680859703228.png####/u/fabu_worker_seek.html####1||https://upload.ihuoniao.cn//job/default/16808597082332.png####/u/fabu_post_seek.html####1", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("job", "0", "2", "招聘求职_模板二_APP_普工_广告一", "0$$0$$https://upload.ihuoniao.cn//job/default/16808596783622.png########1", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("job", "0", "2", "招聘求职_模板二_APP_广告三", "0$$0$$https://upload.ihuoniao.cn//job/default/1680863149165.png##最新职位##https://ihuoniao.cn/job/postlist?appPage=job&appPath=job-list####1||https://upload.ihuoniao.cn//job/default/16808630894798.png##招聘会##/job/zhaopinhui.html?appPage=job&appPath=zhaopinhui####1||https://upload.ihuoniao.cn//job/default/16808630891030.png##兼职/日结##/job/postlist?appPage=job&appPath=job-list&positionNatureIds=2####1||https://upload.ihuoniao.cn//job/default/16808630898169.png##校招实习##/job/postlist?appPage=job&appPath=job-list&positionNatureIds=3####1||https://upload.ihuoniao.cn//job/default/16808630894331.png##活跃招聘官##/job/company-list?appPage=job&appPath=company-list&orderby=2####1||https://ihuoniao.cn/include/attachment.php?f=/job/atlas/large/2023/05/22/16847254152091.png##资讯##https://ihuoniao.cn/job/news?appPage=job&appPath=news####1||https://ihuoniao.cn/include/attachment.php?f=/job/atlas/large/2023/05/31/16854981691008.png##资讯详情##https://ihuoniao.cn/job/news-detail?id=6784&appFullScreen=1&appPage=job&appPath=news-detail&appPathId=6784####1||https://ihuoniao.cn/include/attachment.php?f=/job/atlas/large/2023/05/31/16854982657775.png##现场招聘会##https://ihuoniao.cn/job/zhaopinhui?id=3&type=1&appFullScreen=1&appPage=job&appPath=zhaopinhui-detail&appPathId=3####1||https://ihuoniao.cn/include/attachment.php?f=/job/atlas/large/2023/05/31/16854985155440.png##网络招聘会##https://ihuoniao.cn/job/zhaopinhui?id=5&type=2&appFullScreen=1&appPage=job&appPath=zhaopinhui-detail&appPathId=5####1", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("job", "0", "2", "招聘求职_模板二_APP_广告二", "0$$0$$https://upload.ihuoniao.cn//job/default/16808595671988.png####https://www.kumanyun.com####1||https://ihuoniao.cn/include/attachment.php?f=/job/atlas/large/2024/01/31/1706695466585.png########0||https://ihuoniao.cn/include/attachment.php?f=/job/atlas/large/2024/01/31/1706695466446.png########0||https://upload.ihuoniao.cn//job/default/16808595672666.png####/u/job-resume.html####1||https://ihuoniao.cn/include/attachment.php?f=/job/atlas/large/2023/04/21/1682046529729.png####https://ihuoniao.cn/job/news?appFullScreen####0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("job", "0", "2", "招聘求职_模板二_APP_广告一", "0$$0$$https://upload.ihuoniao.cn//job/default/16808594448047.png####/job/postlist?appPage=job&appPath=job-list&orderby=2####1||https://upload.ihuoniao.cn//job/default/16808594796107.png####/job/postlist?appPage=job&appPath=job-list&listNearby=1####1", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("job", "0", "2", "招聘求职_会员中心_移动端_广告一", "0$$0$$https://upload.ihuoniao.cn//job/default/16808621977456.png####/supplier/job####1", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("job", "0", "2", "招聘求职_模板四_移动端_普工专区_轮播广告", "0$$0$$https://upload.ihuoniao.cn//job/default/16808596783622.png########1", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("job", "0", "2", "招聘求职_模板四_移动端_职场资讯2", "0$$0$$https://upload.ihuoniao.cn//job/default/16808602192020.png########1||https://upload.ihuoniao.cn//job/default/16808602193474.png########1", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("job", "0", "2", "招聘求职_模板四_移动端_职场资讯1", "0$$0$$https://upload.ihuoniao.cn//job/default/16808591396600.png####https://www.kumanyun.com####1", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("job", "0", "2", "招聘求职_模板四_移动端_广告三", "0$$0$$https://upload.ihuoniao.cn//job/default/1680863149165.png##最新职位##/job/job-list?orderby=3####1||https://upload.ihuoniao.cn//job/default/16808630894798.png##招聘会##/job/zhaopinhui####1||https://upload.ihuoniao.cn//job/default/16808630891030.png##兼职/日结##/job/job-list?nature=2####1||https://upload.ihuoniao.cn//job/default/16808630898169.png##校招实习##/job/job-list?nature=3####1||https://upload.ihuoniao.cn//job/default/16808630894331.png##活跃招聘官##/job/company-list?orderby=2####1", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("job", "0", "2", "招聘求职_模板四_移动端_广告二", "0$$0$$https://upload.ihuoniao.cn//job/default/16808595671988.png####https://ihuoniao.cn/job/company?id=18####1||https://ihuoniao.cn/include/attachment.php?f=/job/atlas/large/2024/01/31/1706695466585.png########0||https://ihuoniao.cn/include/attachment.php?f=/job/atlas/large/2024/01/31/1706695466446.png########0||https://upload.ihuoniao.cn//job/default/16808595672666.png####/u/job-resume.html####1||https://ihuoniao.cn/include/attachment.php?f=/job/atlas/large/2023/04/21/1682046529729.png####https://ihuoniao.cn/sz/job/news.html####0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("job", "0", "2", "招聘求职_模板四_移动端_广告一", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/job/atlas/large/2023/09/21/1695282150634.png####/job/job-list?orderby=2####0||https://upload.ihuoniao.cn//job/default/16808594796107.png####/job/job-list?near=1####1", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("job", "0", "2", "招聘求职_模板八_电脑端_广告八", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/job/atlas/large/2023/04/13/16813740032113.png##火鸟门户系统##https://www.kumanyun.com####1", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("job", "0", "2", "招聘求职_模板四_移动端_普工专区", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/job/advthumb/large/2023/04/14/16814628588728.png####https://ihuoniao.cn/u/fabu_worker_seek.html####1||https://ihuoniao.cn/include/attachment.php?f=/job/atlas/large/2023/04/14/16814628879788.png####https://ihuoniao.cn/u/fabu_post_seek.html####1", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("job", "0", "2", "招聘求职_模板二_APP_职场资讯1", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/job/atlas/large/2023/05/23/16848203309831.png####https://www.kumanyun.com####0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("job", "0", "2", "招聘求职_模板二_APP_职场资讯2", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/job/atlas/large/2023/05/23/1684820351280.png########1||https://ihuoniao.cn/include/attachment.php?f=/job/atlas/large/2023/05/23/16848203519403.png########1", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("job", "0", "2", "招聘求职_小程序_广告一", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/job/atlas/large/2023/09/21/1695282150634.png####/pages/packages/job/jobList/jobList?orderby=2####0||https://ihuoniao.cn/include/attachment.php?f=/job/atlas/large/2024/03/29/17117048823217.png####/pages/packages/job/jobList/jobList?near=1####0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("job", "0", "2", "招聘求职_小程序_广告二", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/job/atlas/large/2024/03/29/1711705161825.png####/pages/packages/job/company/company?id=18####0||https://ihuoniao.cn/include/attachment.php?f=/job/atlas/large/2024/01/31/1706695466585.png########0||https://ihuoniao.cn/include/attachment.php?f=/job/atlas/large/2024/01/31/1706695466446.png########0||https://ihuoniao.cn/include/attachment.php?f=/job/atlas/large/2024/03/29/1711705233740.png####/u/job-resume.html?appFullScreen=1####0||https://ihuoniao.cn/include/attachment.php?f=/job/atlas/large/2023/04/21/1682046529729.png####/pages/packages/job/news/news?appFullScreen=1####0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("job", "0", "2", "招聘求职_小程序_广告三", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/job/atlas/large/2024/04/01/17119612158073.png##最新职位##/pages/packages/job/jobList/jobList?orderby=3####0||https://ihuoniao.cn/include/attachment.php?f=/job/atlas/large/2024/04/01/17119613226643.png##招聘会##/pages/packages/job/zhaopinhui/zhaopinhui####0||https://ihuoniao.cn/include/attachment.php?f=/job/atlas/large/2024/04/01/17119613831361.png##兼职/日结##/pages/packages/job/jobList/jobList?nature=2####0||https://ihuoniao.cn/include/attachment.php?f=/job/atlas/large/2024/04/01/17119614425115.png##校招/实习##/pages/packages/job/jobList/jobList?nature=3####0||https://ihuoniao.cn/include/attachment.php?f=/job/atlas/large/2024/04/01/17119614839454.png##活跃招聘官##/pages/packages/job/companyList/companyList?orderby=2&appFullScreen=1####0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("job", "0", "2", "招聘求职_小程序_普工专区", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/job/advthumb/large/2023/04/14/16814628588728.png####https://ihuoniao.cn/u/fabu_worker_seek.html####0||https://ihuoniao.cn/include/attachment.php?f=/job/atlas/large/2023/04/14/16814628879788.png####https://ihuoniao.cn/u/fabu_post_seek.html####0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("job", "0", "2", "招聘求职_小程序_普工专区_轮播广告", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/job/atlas/large/2024/04/01/17119621088758.png########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("job", "0", "2", "招聘求职_小程序_职场资讯1", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/job/atlas/large/2023/05/23/16848203309831.png####https://www.kumanyun.com####0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("job", "0", "2", "招聘求职_小程序_职场资讯2", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/job/atlas/large/2023/05/23/1684820351280.png########0||https://ihuoniao.cn/include/attachment.php?f=/job/atlas/large/2023/05/23/16848203519403.png########0", "1", "50");'
        ),
        "live" => array(
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("live", "0", "2", "直播_模板二_移动端_广告一", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/live/atlas/large/2024/02/01/1706759678719.png########0||https://ihuoniao.cn/include/attachment.php?f=VnpoZE1GRTJEem9HTVFkag==########0||https://ihuoniao.cn/include/attachment.php?f=VVQ0QWJRZGdEanRUWkFGaw==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("live", "0", "2", "直播_模板二_电脑端_广告一", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/live/atlas/large/2024/02/01/17067641873007.png########0||https://ihuoniao.cn/include/attachment.php?f=QTJ4WE1sNDVWR2NPT1FWZw==########0||https://ihuoniao.cn/include/attachment.php?f=VlRvR1kxTTBVMkJVWXdWaQ==########0||https://ihuoniao.cn/include/attachment.php?f=/live/atlas/large/2024/02/18/17082286558261.png########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("live", "0", "1", "直播_模板二_电脑端_广告二", "pic$$https://ihuoniao.cn/include/attachment.php?f=WGpGV013ZGdVV0pTWlZNNQ==$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("live", "0", "1", "直播_模板二_电脑端_广告三", "pic$$https://ihuoniao.cn/include/attachment.php?f=WGpFQ1oxNDVWbVVQT0ZFNg==$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("live", "0", "2", "直播_模板二_电脑端_广告四", "0$$0$$VXp3R1kxNDVVbUZTYWxRMg==########0||https://ihuoniao.cn/include/attachment.php?f=Qkd0VU1RUmpWbVZUYTFZMg==########0||https://ihuoniao.cn/include/attachment.php?f=VWoxUk5BQm5VbUVBT0Fkaw==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("live", "0", "2", "直播_模板二_电脑端_广告五", "0$$0$$VmprQVpRTmtBRElITVZFMw==########0||https://ihuoniao.cn/include/attachment.php?f=VVQ1Y09WTTBBRElFTWxJeQ==########0||https://ihuoniao.cn/include/attachment.php?f=VlRvSFlsTTBWbVFGTXdabg==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("live", "0", "2", "直播_模板三_移动端_广告一", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/live/atlas/large/2024/02/01/17067591348551.png########0||https://ihuoniao.cn/include/attachment.php?f=/live/atlas/large/2023/03/10/1678436376625.png########0||https://ihuoniao.cn/include/attachment.php?f=/live/atlas/large/2023/03/10/16784363846081.png########0", "1", "50");'
        ),
        "marry" => array(
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("marry", "0", "2", "婚嫁信息_模板一_移动端_广告一", "0$$0$$VmpsVk1BTnFVbUZTYTFFeA==########0||https://ihuoniao.cn/include/attachment.php?f=QW0wRllGUTlCalZWYkFWaw==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("marry", "0", "2", "婚嫁信息_模板一_移动端_广告二", "0$$0$$QTJ3SFlnTnFEendGUEZNMQ==########0||https://ihuoniao.cn/include/attachment.php?f=QW0xZE9GRTRBVEpSYUYwNQ==########0||https://ihuoniao.cn/include/attachment.php?f=QTJ4WE1sUTlCalZXYndaaA==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("marry", "0", "2", "婚嫁_模板二_电脑端_广告一", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/marry/atlas/large/2024/02/07/17072700114947.png########0||https://ihuoniao.cn/include/attachment.php?f=/marry/atlas/large/2024/02/07/17072700118144.png########0||https://ihuoniao.cn/include/attachment.php?f=/marry/atlas/large/2024/02/07/17072700113739.png########0||https://ihuoniao.cn/include/attachment.php?f=/marry/atlas/large/2024/02/07/17072700122409.png########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("marry", "0", "2", "婚嫁_模板二_电脑端_广告二", "0$$0$$QTI5ZE1sTTFCajVVWlFkbg==########0||https://ihuoniao.cn/include/attachment.php?f=QUd3QmJsRTNVbXBTWTF3OQ==########0||https://ihuoniao.cn/include/attachment.php?f=QldsUVB3SmtVbW9QUGdkaA==########0||https://ihuoniao.cn/include/attachment.php?f=VXo5WE9GQTJCajVTWXdKbA==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("marry", "0", "1", "婚嫁_模板二_电脑端_广告三", "pic$$https://ihuoniao.cn/include/attachment.php?f=QUd3RmFsVXpVMnRXWndCaw==$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("marry", "0", "1", "婚嫁_模板二_电脑端_广告四", "pic$$https://ihuoniao.cn/include/attachment.php?f=VUR4VFBBZGhBanBUWVFGaQ==$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("marry", "0", "1", "婚嫁_模板二_电脑端_广告五", "pic$$https://ihuoniao.cn/include/attachment.php?f=QTI5V09WQTJVV2xTWUFKaw==$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("marry", "0", "2", "婚嫁_模板二_电脑端_列表_广告一", "0$$0$$Vnp0Vk9nQm1BenRUWVZBMw==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("marry", "0", "1", "婚嫁_模板二_电脑端_列表_广告二", "pic$$https://ihuoniao.cn/include/attachment.php?f=WHpNRmFnVmpEallPUEFWaA==$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("marry", "0", "1", "婚嫁_模板二_电脑端_商品列表_广告一", "pic$$https://ihuoniao.cn/include/attachment.php?f=VVQwQWIxSTBEalpVWVZjOQ==$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("marry", "0", "1", "婚嫁_模板二_电脑端_商家列表_广告一", "pic$$https://ihuoniao.cn/include/attachment.php?f=VlRsVk9sODVWVzBGTTFJdw==$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("marry", "0", "2", "APP_婚嫁_首页_广告二", "0$$0$$Vnp0VVBGYzZCelZVWlFGaQ==########0||https://ihuoniao.cn/include/attachment.php?f=WGpKVlBWNHpVMkVBTVFCZw==########0||https://ihuoniao.cn/include/attachment.php?f=VWo1Y05BVm9CRFpTWXdkbQ==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("marry", "0", "2", "APP_婚嫁_首页_广告一", "0$$0$$QW00SGIxNHpCalJXWjFNMQ==########0||https://ihuoniao.cn/include/attachment.php?f=QjJzQ2FsTStWbVFPUDFJMQ==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("marry", "0", "2", "APP_婚嫁_首页_广告三", "0$$0$$VVQxVE8xTStBamNBTUZVMg==####https://ihuoniao.cn/b/marry.html####0||https://ihuoniao.cn/include/attachment.php?f=VnpzSGIxVTRWR0VBTUFkbg==####https://ihuoniao.cn/b####0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("marry", "0", "2", "婚嫁信息_模板一_移动端_广告三", "0$$0$$VXo5U09nZHFWR1lPTndkcw==####https://ihuoniao.cn/b/marry.html####0||https://ihuoniao.cn/include/attachment.php?f=QldsVE8xTStBelpSWVZFeg==####https://ihuoniao.cn/b####0", "1", "50");'
        ),
        "paimai" => array(
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("paimai", "0", "2", "拍卖_模板一_电脑端_广告一", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/paimai/atlas/large/2022/06/23/16559529968066.png########0||https://ihuoniao.cn/include/attachment.php?f=/paimai/atlas/large/2022/06/23/16559530121102.png########0||https://ihuoniao.cn/include/attachment.php?f=/paimai/atlas/large/2022/06/23/16559530272908.png########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("paimai", "0", "2", "拍卖_模板一_移动端_广告一", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/paimai/atlas/large/2022/06/23/16559605429299.png########0||https://ihuoniao.cn/include/attachment.php?f=/paimai/atlas/large/2022/06/23/16559605587622.png########0", "1", "50");'
        ),
        "pension" => array(
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("pension", "0", "2", "养老_模板一_电脑端_广告一", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/pension/atlas/large/2024/02/18/17082235788141.png########0||https://ihuoniao.cn/include/attachment.php?f=VmpwVk9RUm9BVElETVZJeg==########0||https://ihuoniao.cn/include/attachment.php?f=Vnp0VU9BUm9BekFPUEZBMg==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("pension", "0", "2", "养老_模板一_电脑端_广告二", "0$$0$$QUd3R2FnUm9WbVVGTkZFMw==########0||https://ihuoniao.cn/include/attachment.php?f=QTI5VFAxNHlWV1pXWndWaQ==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("pension", "0", "2", "教育机构_模板一_移动端_广告二", "0$$0$$QldsVU9GQThVMkFITmxJNQ==########0||https://ihuoniao.cn/include/attachment.php?f=QldrSGF3SnVEajFSWTFNeA==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("pension", "0", "2", "教育机构_模板一_移动端_广告三", "0$$0$$VVQxVFAxTS9EajBCTXdkbg==########0||https://ihuoniao.cn/include/attachment.php?f=QjJzR2FnZHJCRGRWWjFJeA==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("pension", "0", "2", "养老机构_模板一_移动端_广告一", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/pension/atlas/large/2024/02/18/17082236364694.png########0||https://ihuoniao.cn/include/attachment.php?f=QjJzQ2JnSnVBakVFTmdaaQ==########0||https://ihuoniao.cn/include/attachment.php?f=WHpNSGExYzdCVFlHTkZFMg==########0", "1", "50");'
        ),
        "quanjing" => array(
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("quanjing", "0", "2", "全景_模板一_电脑端_广告一", "0$$0$$WHpBQ2JBTnRBRE1PT2dCZw==########0||https://ihuoniao.cn/include/attachment.php?f=VXp3SGFWUTZBVElFTUZVMA==########0", "1", "50");'
        ),
        "renovation" => array(
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("renovation", "0", "2", "装修_模板三_电脑端_广告一", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/renovation/atlas/large/2024/02/02/17068559101526.png########0||https://ihuoniao.cn/include/attachment.php?f=WGpJRmFsYzdVMkVCTVYwNQ==########0||https://ihuoniao.cn/include/attachment.php?f=VXo4Q2JWSStCalJVYkFWaw==########0||https://ihuoniao.cn/include/attachment.php?f=VmpwVk9nUm9CRFlCT1FCag==########0||https://ihuoniao.cn/include/attachment.php?f=VUR3QmJnZHJCalFFUEZRMA==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("renovation", "0", "2", "装修_模板三_电脑端_广告二", "0$$0$$QW01U1BWYzdCRFpVWkFWZw==########0||https://ihuoniao.cn/include/attachment.php?f=VmpwV09WYzdBakFFTkZNNA==########0||https://ihuoniao.cn/include/attachment.php?f=QW01VFBBSnVEandHTmxZOA==########0||https://ihuoniao.cn/include/attachment.php?f=QW01UVAxWTZVbUFITmdWbg==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("renovation", "0", "1", "装修_模板三_电脑端_广告三", "pic$$https://ihuoniao.cn/include/attachment.php?f=/renovation/advthumb/large/2024/02/02/17068560857641.png$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("renovation", "0", "1", "装修_模板三_电脑端_广告四", "pic$$https://ihuoniao.cn/include/attachment.php?f=/renovation/advthumb/large/2024/02/02/17068561139344.png$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("renovation", "0", "1", "装修_模板三_电脑端_广告五", "pic$$https://ihuoniao.cn/include/attachment.php?f=/renovation/advthumb/large/2024/02/02/17068561469823.png$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("renovation", "0", "1", "装修_模板三_电脑端_广告六", "pic$$https://ihuoniao.cn/include/attachment.php?f=QUd4ZE1sOHpBekVQUGxBMg==$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("renovation", "0", "1", "装修_模板三_电脑端_广告七", "pic$$https://ihuoniao.cn/include/attachment.php?f=VVQxY00xNHlVV05XWjFjdw==$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("renovation", "0", "1", "装修_模板三_电脑端_广告八", "pic$$https://ihuoniao.cn/include/attachment.php?f=VXo5WE9BTnZCalFPUHdKbQ==$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("renovation", "0", "1", "装修_模板三_电脑端_广告九", "pic$$https://ihuoniao.cn/include/attachment.php?f=VmpwU1BRSnVCVGNDTTFJMw==$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("renovation", "0", "2", "装修_模板三_电脑端_公司主页广告一", "0$$0$$VVQxVFBGWTZCelVETWdGcg==########0||https://ihuoniao.cn/include/attachment.php?f=VkRnRmFnVnBEejBGTkFWdQ==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("renovation", "0", "2", "装修_模板三_电脑端_设计师主页广告一", "0$$0$$QW01UVAxSStBVE1PT3dGag==########0||https://ihuoniao.cn/include/attachment.php?f=VkRnQWIxQThWR1lFTVFGaQ==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("renovation", "0", "2", "装修_模板三_电脑端_工长主页广告一", "0$$0$$VVQxY00xYzdWV2RWWTFReA==########0||https://ihuoniao.cn/include/attachment.php?f=QldrQ2JWQThBRElFTWxFNw==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("renovation", "0", "2", "装修_模板三_电脑端_装修攻略广告一", "0$$0$$VWo1UlBnUm9EandGTWx3NA==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("renovation", "0", "1", "装修_模板三_电脑端_装修攻略广告2", "pic$$https://ihuoniao.cn/include/attachment.php?f=VXo4Q2JWUTRCRFlPT1ZNMg==$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("renovation", "0", "1", "装修_模板三_电脑端_装修攻略广告3", "pic$$https://ihuoniao.cn/include/attachment.php?f=WHpOVFBGOHpVMkVETkZNNQ==$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("renovation", "0", "2", "装修_模板二_移动端_公司详情广告一", "0$$0$$QUd3QmJsQThVMkZTYXdGag==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("renovation", "0", "2", "装修_模板二_移动端_广告一", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/renovation/atlas/large/2024/02/01/17067585732172.png########0||https://ihuoniao.cn/include/attachment.php?f=VXo5V09WSStCVGRTYWdKbA==########0||https://ihuoniao.cn/include/attachment.php?f=QUd4ZE1nVnBBekVGUFZReQ==########0||https://ihuoniao.cn/include/attachment.php?f=WGpJQmJsYzdVbUJSYVFKbQ==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("renovation", "0", "2", "装修_模板二_移动端_广告二", "0$$0$$Vnp0VFBGQThCRFpTYWdWZw==########0||https://ihuoniao.cn/include/attachment.php?f=VkRnQ2JWRTlVbUJXYmdKbw==########0||https://ihuoniao.cn/include/attachment.php?f=QkdoUlBsSStWV2NFUEFCcg==########0", "1", "50");'
        ),
        "sfcar" => array(
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("sfcar", "0", "1", "顺风车_模板一_电脑端_广告一", "pic$$https://ihuoniao.cn/include/attachment.php?f=/sfcar/advthumb/large/2024/02/20/17083965207866.png$$https://ihuoniao.cn/u/fabu-sfcar.html$$$$1920$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("sfcar", "0", "1", "顺风车_模板一_电脑端_列表广告一", "pic$$https://ihuoniao.cn/include/attachment.php?f=/sfcar/advthumb/large/2023/02/23/16771367502320.png$$https://ihuoniao.cn/u/fabu-sfcar.html$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("sfcar", "0", "1", "顺风车_模板一_电脑端_详情广告一", "pic$$https://ihuoniao.cn/include/attachment.php?f=/sfcar/advthumb/large/2023/02/23/16771367502320.png$$https://ihuoniao.cn/u/fabu-sfcar.html$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("sfcar", "0", "2", "顺风车_模板一_移动端_广告一", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/sfcar/atlas/large/2024/02/20/17083971265751.png####https://ihuoniao.cn/u/fabu-sfcar.html####0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("sfcar", "0", "2", "APP_顺风车_首页_广告一", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/sfcar/atlas/large/2024/02/20/17083971265751.png####https://ihuoniao.cn/u/fabu-sfcar.html####0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("sfcar", "0", "1", "顺风车移动端信息流广告", "code$${
         \"TencentGDT\":{
             \"h5\": {\"app_id\":\"1203685091\",\"placement_id\":\"1006915636675575\"},
             \"android\": {\"app_id\":\"1203684865\",\"placement_id\":\"3036414645660678\"},
             \"wxmini\": \"adunit-650c7e3623fc76ad\",
             \"dymini\": \"lwm48zt3u1mh71z3mv\"
          }
      }$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("sfcar", "0", "1", "顺风车移动端详情页内容广告", "code$${
         \"TencentGDT\":{
             \"h5\": {\"app_id\":\"1203685091\",\"placement_id\":\"7077076415552488\"},
             \"android\": {\"app_id\":\"1203684865\",\"placement_id\":\"1047591623355113\"},
             \"wxmini\": \"adunit-047ca84f8d069d83\",
             \"dymini\": \"3ykno8wh2a0wu00cuz\"
          }
      }$$0", "1", "50");'
        ),
        "shop" => array(
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("shop", "0", "2", "APP_在线商城_首页_广告一", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/shop/atlas/large/2022/04/01/16487847057736.png########0||https://ihuoniao.cn/include/attachment.php?f=/shop/atlas/large/2022/04/01/16487847041503.png########0||https://ihuoniao.cn/include/attachment.php?f=/shop/atlas/large/2022/04/01/16487847048302.png########0||https://ihuoniao.cn/include/attachment.php?f=/shop/atlas/large/2022/04/01/16487847051173.png########0||https://ihuoniao.cn/include/attachment.php?f=/shop/atlas/large/2022/04/01/1648784706660.png########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("shop", "0", "1", "APP_在线商城_首页_广告二", "pic$$https://ihuoniao.cn/include/attachment.php?f=/shop/advthumb/large/2022/04/01/16487847255661.png$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("shop", "0", "2", "APP_在线商城_首页_广告三", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/shop/atlas/large/2022/05/10/16521607299076.png####https://ihuoniao.cn/shop/getQuan.html####1||https://ihuoniao.cn/include/attachment.php?f=/shop/atlas/large/2022/05/10/16521608014647.png####https://ihuoniao.cn/shop/store_map.html?appPage=shop&appPath=mapToStore####1||https://ihuoniao.cn/include/attachment.php?f=/shop/atlas/large/2022/05/10/165216081687.png####https://ihuoniao.cn/shop/search_list.html?stype=shop&appPage=shop&appPath=recStore####1", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("shop", "0", "2", "商城_模板四_移动端_广告一", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/shop/atlas/large/2024/01/31/17066940583579.png########0||https://ihuoniao.cn/include/attachment.php?f=/shop/atlas/large/2024/01/31/17066940586765.png########0||https://ihuoniao.cn/include/attachment.php?f=/shop/atlas/large/2024/01/31/17066940588710.png########0||https://ihuoniao.cn/include/attachment.php?f=/shop/atlas/large/2022/04/21/16505364883720.png########0||https://ihuoniao.cn/include/attachment.php?f=/shop/atlas/large/2022/04/21/16505234233234.png########0||https://ihuoniao.cn/include/attachment.php?f=/shop/atlas/large/2022/04/21/16505234677776.png########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("shop", "0", "1", "商城_模板四_移动端_广告二", "pic$$https://ihuoniao.cn/include/attachment.php?f=/shop/advthumb/large/2022/04/21/16505365809481.png$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("shop", "0", "2", "商城_模板三_电脑端_广告二", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/shop/atlas/large/2024/01/31/17066933047533.png########0||https://ihuoniao.cn/include/attachment.php?f=/shop/atlas/large/2024/02/02/17068446416691.png########0||https://ihuoniao.cn/include/attachment.php?f=/shop/atlas/large/2024/01/31/17066933043076.png########0||https://ihuoniao.cn/include/attachment.php?f=/shop/atlas/large/2023/12/07/17019434833893.png########1", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("shop", "0", "2", "商城_模板三_电脑端_广告三", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/shop/atlas/large/2024/02/02/17068445222990.png########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("shop", "0", "1", "商城_模板三_电脑端_广告四", "pic$$https://ihuoniao.cn/include/attachment.php?f=/shop/advthumb/large/2024/02/02/17068442975929.png$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("shop", "0", "1", "商城_模板四_电脑端_抢购广告一", "pic$$https://ihuoniao.cn/include/attachment.php?f=/shop/advthumb/large/2022/05/19/16529395777261.png$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("shop", "0", "1", "商城_模板四_移动端_抢购广告一", "pic$$https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2023/06/27/1687834650934.png$$$$$$0$$0$$0", "1", "50");'
        ),
        "siteConfig" => array(
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "1", "电脑端登录", "pic$$https://ihuoniao.cn/include/attachment.php?f=QjJoUlAxQTRVV0ZSYVZVMg==$$$$$$1920$$560$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "1", "首页_模板十_电脑端_广告一", "pic$$https://ihuoniao.cn/include/attachment.php?f=/siteConfig/advthumb/large/2022/02/28/16460371015216.jpg$$$$$$0$$0$$0", "0", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "2", "首页_模板十一_电脑端_广告四", "1200$$https://ihuoniao.cn/include/attachment.php?f=100$$VkRzQWJsVTdVbUFQT0ZNMw==##18岁的国旗护卫队  对国旗的信念已经坚持了18年##http://aipai.sina.com.cn/activity_album/detail/416828/#p=1####1||https://ihuoniao.cn/include/attachment.php?f=QUc5UVBsWTRWbVJWWlFKaA==##少林寺僧人组团收麦 师傅教洋弟子割麦##miniprogram://pages/redirect/index?url=openxcx_wxef115b359ebec794####0||https://ihuoniao.cn/include/attachment.php?f=QW0xWE9WVTdWR1lHTmxRMA==##墨西哥1:0力克德国 进球引发墨西哥城地震##http://news.163.com/photoview/00AO0001/2294336.html####1", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "1", "首页_模板十一_电脑端_广告三", "pic$$https://ihuoniao.cn/include/attachment.php?f=QW01ZE1nTnJBRGtET3dKbw==$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "1", "首页_模板十_电脑端_广告五", "pic$$https://ihuoniao.cn/include/attachment.php?f=/siteConfig/advthumb/large/2022/03/30/16486375067492.png$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "1", "首页_模板十一_电脑端_广告六", "pic$$https://ihuoniao.cn/include/attachment.php?f=QW0wQ2JBVnJBVE5XWmdWdg==$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "1", "首页_模板十一_电脑端_广告一", "pic$$https://ihuoniao.cn/include/attachment.php?f=QldwUlB3UnZEemdCTXdKbQ==$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "1", "首页_模板十一_电脑端_广告九", "pic$$https://ihuoniao.cn/include/attachment.php?f=VWowSGFWRS9BekZUWXdkaQ==$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "1", "首页_模板十一_电脑端_广告十", "pic$$https://ihuoniao.cn/include/attachment.php?f=VnpoV09GVTdCalJSWVFWdQ==$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "1", "首页_模板十一_电脑端_广告八", "pic$$https://ihuoniao.cn/include/attachment.php?f=QldwY01sVTVCek1DTVFadA==$$$$$$1200$$100$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "1", "首页_模板十一_电脑端_广告十一", "pic$$https://ihuoniao.cn/include/attachment.php?f=VnpoY01sQThVV1VQT3dKZw==$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "1", "首页_模板十一_电脑端_广告十二", "pic$$https://ihuoniao.cn/include/attachment.php?f=VUQ4R2FGQThCVEVITXdWbQ==$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "2", "首页_模板十一_电脑端_广告五", "0$$https://ihuoniao.cn/include/attachment.php?f=155$$VlRwZE13Um9CREFGTVFCaA==########0||https://ihuoniao.cn/include/attachment.php?f=WGpGVU9sVTVEenRUWndWag==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "2", "首页_模板十一_电脑端_广告七", "0$$0$$VlRwWE9WUTRBVFVET2xNdw==########0||https://ihuoniao.cn/include/attachment.php?f=QTJ4VFBWSStCREJXYjFRMA==########0||https://ihuoniao.cn/include/attachment.php?f=VUQ5UlB3Um9EanBUYWxVMw==########0||https://ihuoniao.cn/include/attachment.php?f=VXp3QmJ3VnBVV1VFUFZjMg==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "2", "首页_模板十一_电脑端_广告二", "844$$https://ihuoniao.cn/include/attachment.php?f=84$$Qkd0UlAxQThWbTRHTWx3Mg==########0||https://ihuoniao.cn/include/attachment.php?f=QTJ3SGFWRTlVbXBSWlZNNA==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "2", "首页_模板十_电脑端_广告三", "0$$0$$WGpKVE8xQStVbUlHTmdkag==##点击进入官网了解更多产品信息｛咨询 | 价格 | 联系｝##https://www.kumanyun.com/##点击进入官网了解更多产品信息##0||https://ihuoniao.cn/include/attachment.php?f=WHpCV013TnBBelFQTjFBdw==##3月26日探索乡村乐趣活动强势热度报名中####3月26日##0||https://ihuoniao.cn/include/attachment.php?f=VlRrQWFGTTlEem9DTjFNMw==##点击进入官网了解更多产品信息｛咨询 | 价格 | 联系｝##https://www.kumanyun.com/####0||https://ihuoniao.cn/include/attachment.php?f=QTJ3RllGVS9CRE5WYlZBMQ==##商家入驻-超强平台虚位以待##https://ihuoniao.cn/business####0||https://ihuoniao.cn/include/attachment.php?f=WHpNQWFGQStCVEFDTjFVdw==##点击进入官网了解更多产品信息｛咨询 | 价格 | 联系｝##https://www.kumanyun.com/####0||https://ihuoniao.cn/include/attachment.php?f=QTJ3SFlsYzlVV1lQTjFFeQ==##第三届大型企业招聘会-寻找不平凡的你##https://ihuoniao.cn/sz/job/zhaopinhui.html####0||https://ihuoniao.cn/include/attachment.php?f=VWo0SGJ3ZHBEanNBTlZJNA==####https://www.kumanyun.com/####0||https://ihuoniao.cn/include/attachment.php?f=VWoxVU1RSm9WV0lIUHdkaA==##七月夏日烧烤季商家汇聚精彩互动##https://ihuoniao.cn/sz/business/detail-16.html####0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "1", "首页_模板十_电脑端_广告二", "pic$$https://ihuoniao.cn/include/attachment.php?f=/siteConfig/advthumb/large/2022/03/30/16486376869713.png$$$$$$0$$0$$0", "0", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "1", "首页_模板十_电脑端_广告四", "pic$$https://ihuoniao.cn/include/attachment.php?f=/siteConfig/advthumb/large/2022/03/30/16486374737791.png$$$$$$0$$0$$0", "0", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "1", "首页_模板十_电脑端_广告六", "pic$$https://ihuoniao.cn/include/attachment.php?f=/siteConfig/advthumb/large/2022/03/30/16486375461458.png$$$$$$0$$0$$0", "0", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "2", "APP_首页_模板二_广告一", "0$$0$$VkR0V09BTnBBRGxWWWdGbQ==########0||https://ihuoniao.cn/include/attachment.php?f=QW0wSGFRVnZCajhITUZBMA==########0||https://ihuoniao.cn/include/attachment.php?f=QldwZE9GRTRVMm9ITUFKaA==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "2", "APP_首页_模板二_广告二", "0$$0$$QUc5UVBnVnZVV2dCTmdadA==########0||https://ihuoniao.cn/include/attachment.php?f=VUQ4QmIxUStWRzBGTWxZeg==########0||https://ihuoniao.cn/include/attachment.php?f=VVQwQ2IxODJBRGNDTkFWbQ==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "2", "APP_首页_模板二_广告三", "0$$0$$WGpGY01nQnFWRzFSYVZBeQ==########0||https://ihuoniao.cn/include/attachment.php?f=WGpFSGFRTnBBanRUYTEwOQ==########0||https://ihuoniao.cn/include/attachment.php?f=VXp3QmIxQTZWV3hUYTFNdw==########0||https://ihuoniao.cn/include/attachment.php?f=VVQ1WE9WTTVBRGxWYlZRMQ==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "1", "APP_首页_模板二_广告四", "pic$$https://ihuoniao.cn/include/attachment.php?f=QW0wQlpBQnRBRGdPTzFZdw==$$https://ihuoniao.cn/sz/shop$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "1", "APP_首页_模板二_广告五", "pic$$https://ihuoniao.cn/include/attachment.php?f=VUQ5Uk5BZHFWbTVSWkZJMQ==$$https://ihuoniao.cn/dating$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "2", "APP_首页_模板二_广告六", "0$$0$$VmpsVU1RUnBVbXBVWVFCaw==##本地商家##https://ihuoniao.cn/sz/business####0||https://ihuoniao.cn/include/attachment.php?f=VnpoVU1WOHlVV2tPTzFVdw==##本地服务##https://ihuoniao.cn/sz/huangye####0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "2", "APP_首页_模板二_广告七", "0$$0$$VkRzR1l3TnVCajVSWkZJNQ==##招聘会##https://ihuoniao.cn/sz/job/zhaopinhui.html?appPage=job&appPath=zhaopinhui####0||https://ihuoniao.cn/include/attachment.php?f=VkRzQ1p3QnRCRHdQT2xFNw==##找企业##https://ihuoniao.cn/sz/job/company.html?appPage=job&appPath=company-list####0||https://ihuoniao.cn/include/attachment.php?f=VmpsVk1GVTREemRSWndWbg==##找人才##https://ihuoniao.cn/sz/job/resume.html####0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "1", "APP_首页_模板二_广告八", "pic$$https://ihuoniao.cn/include/attachment.php?f=WHpCV013TnVBVGxTWkZjMA==$$https://ihuoniao.cn/sz/renovation$$装修模块$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "2", "APP_首页_模板二_广告九", "0$$0$$VkRzQVpWODFCellITmdGcg==########0||https://ihuoniao.cn/include/attachment.php?f=QW0wSFlsWThBeklFTlYwNA==########0||https://ihuoniao.cn/include/attachment.php?f=QldwVk1BTnBCRFVPUHdCcg==########0||https://ihuoniao.cn/include/attachment.php?f=QTJ4Uk5BVnZBVEJSWTEwLw==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "2", "APP_首页_模板二_栏目下方四个按钮", "0$$0$$QUc5Y09WYzZVbW9FTVZVMw==##签到##https://ihuoniao.cn/u/qiandao.html####1||https://ihuoniao.cn/include/attachment.php?f=VWoxUk5BZHFVV2tDTjFFeA==##订单管理##https://ihuoniao.cn/u/order.html####1||https://ihuoniao.cn/include/attachment.php?f=QjJnRllBSnZVbXBVWVFkbQ==##发布管理##https://ihuoniao.cn/u/manage.html####1||https://ihuoniao.cn/include/attachment.php?f=QkdoVU9nSnZEemdETlZ3Ng==##我的口袋##https://ihuoniao.cn/u/pocket.html####1", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "2", "首页_模板四_移动端_广告三", "0$$0$$QW01U1BBUnRWbVJSWmxJeA==####https://ihuoniao.cn/sz/tuan####0||https://ihuoniao.cn/include/attachment.php?f=VVQwSGFWYytCalFPT1ZZMg==####https://ihuoniao.cn/sz/waimai####0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "2", "首页_模板四_移动端_广告四", "0$$0$$VkRoZE13TnFWV2NETlZRdw==########0||https://ihuoniao.cn/include/attachment.php?f=VXo5UlAxUTlVV01DTkFGbQ==########0||https://ihuoniao.cn/include/attachment.php?f=VmpwVU9sWS9VbUFQT1ZZeg==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "2", "首页_模板四_移动端_广告一", "0$$0$$VWo1U09sWTRBREZSWjFNeQ==####https://www.kumanyun.com/####0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "1", "首页_模板四_移动端_广告二", "pic$$https://ihuoniao.cn/include/attachment.php?f=VmpvSGFWYytBVE1BTndaaw==$$https://ihuoniao.cn/u/qiandao.html$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "2", "商家_模板三_移动端_广告一", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2024/02/27/1709015390107.png########0||https://ihuoniao.cn/include/attachment.php?f=QUd4UlAxYytCVGNFUEZ3Nw==####https://ihuoniao.cn/business/list.html?typeid=55####0||https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2023/06/27/16878346255531.png########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "1", "商家_模板三_移动端_广告二", "pic$$https://ihuoniao.cn/include/attachment.php?f=QUd3QmJ3VnNEanhTYWdaaQ==$$$$$$0$$0$$0", "0", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "2", "商家_模板三_移动端_广告三", "0$$0$$VlRrQmIxTTZEandCT1ZJMw==########0||https://ihuoniao.cn/include/attachment.php?f=WHpOU1BGODJCalJUYXdKbw==########0||https://ihuoniao.cn/include/attachment.php?f=WHpOWE9RQnBEejFTYWxjOA==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "2", "商家_模板三_移动端_广告四", "0$$0$$QTI4RmExSTdBVE5WYkZRMg==########0||https://ihuoniao.cn/include/attachment.php?f=VnpzSGFRTnFEejBET2x3OQ==########0||https://ihuoniao.cn/include/attachment.php?f=VWo0RmF3SnJCalFFUFFKaA==########0||https://ihuoniao.cn/include/attachment.php?f=VUR4WE9WNDNEandET2dkbg==########0", "0", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "2", "商家_模板三_移动端_广告五", "0$$0$$WHpOZE13TnFBREpTYTFJMA==########0", "0", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "2", "App首页_模板三_广告一", "0$$0$$WGpKVlBWVTdEejVXWUZ3NQ==####https://www.kumanyun.com/####0||https://ihuoniao.cn/include/attachment.php?f=VXo5ZE1nSnNVV0pXWUZZeQ==####https://ihuoniao.cn/sz/zhuanti/detail-12.html####0||https://ihuoniao.cn/include/attachment.php?f=QW00QWFBUnFVbWRVWWxjMw==####https://www.kumanyun.com/####0||https://ihuoniao.cn/include/attachment.php?f=VnpzSGFGQStWbVVITVZVdw==####miniProgramLive_11####0||https://ihuoniao.cn/include/attachment.php?f=WHpOWFB3ZHBWR0VITVFkbQ==####https://www.kumanyun.com/####0||https://ihuoniao.cn/include/attachment.php?f=QTI4QWIxVTdEendFTWdGcQ==####https://www.kumanyun.com/####0||https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2023/10/30/16986286828793.gif########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "1", "App首页_模板三_广告二", "pic$$https://ihuoniao.cn/include/attachment.php?f=QkdoUlBsTTlBRE1PT1ZJdw==$$https://ihuoniao.cn/u/qiandao.html$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "2", "App首页_模板三_广告三", "0$$0$$VXo5VU93VnJWR2RUWkYwKw==####https://ihuoniao.cn/tuan?appTitle&appPage=tuan####0||https://ihuoniao.cn/include/attachment.php?f=VUR4Vk9sOHhVMkFCTmdabQ==####https://ihuoniao.cn/waimai?appTitle&appPage=waimai####0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "2", "App首页_模板三_广告四", "0$$0$$QUd3SGFGWTRBakZXWVZJeg==####https://ihuoniao.cn/about-1.html####0||https://ihuoniao.cn/include/attachment.php?f=QW01VU8xYzVCelJVWXdCbQ==####https://www.zhihu.com/####0||https://ihuoniao.cn/include/attachment.php?f=VkRoVk9sOHhCelFQT0Zjdw==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "2", "首页_模板五_移动端_广告一", "0$$0$$VmpvSGFGUThEalpVWUZNdw==##购买咨询##https://www.kumanyun.com/contact.html####0||https://ihuoniao.cn/include/attachment.php?f=VXo5VFBGODNBVGxSWVYwOA==########0||https://ihuoniao.cn/include/attachment.php?f=QTI4QmFRUnFBRFZTWndGcQ==##购买咨询##https://www.kumanyun.com/contact.html####0||https://ihuoniao.cn/include/attachment.php?f=QldrRmFnZHZCVDBITjFZdw==########0||https://ihuoniao.cn/include/attachment.php?f=VlRrQWFBQnVVbWNGTXdKZw==##购买咨询##https://www.kumanyun.com/contact.html####0||https://ihuoniao.cn/include/attachment.php?f=Vnp0UlBsNDJEallDTWxVeQ==####miniprogram://pages/redirect/index?url=openxcx_wx69ddba7937827c3a####0||https://ihuoniao.cn/include/attachment.php?f=QUd4V1BsOHhBamNDTkZFeQ==##购买咨询##https://www.kumanyun.com/contact.html####0||https://ihuoniao.cn/include/attachment.php?f=VUR3R2FWODNBVGxUWTF3NA==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "2", "首页_模板五_移动端_广告三", "0$$0$$VXo5VU93QnFCREJVWTFNdw==####wxMiniprogram://gh_3cf62f4f1d52/wxbb58374cdce267a6####0||https://ihuoniao.cn/include/attachment.php?f=QldsVk9sSTRWbUlGTWdWbA==########0||https://ihuoniao.cn/include/attachment.php?f=VXo4RmFsUStCVEZVWXdWaw==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "6", "系统公告", "
      <p style=\"text-align: center;\">
          <span style=\"font-size: 16px; color: rgb(12, 12, 12);\">
              <strong>
                  <span style=\"font-size: 16px;\">本站非实际运营网站，所载全部信息内容均仅作为软件系统功能测试之用，切勿当真！若有侵权，请即时联系：0512-67581578</span>
              </strong>
          </span>
      </p>
      <p>
          <strong>
              <span style=\"font-size: 20px; color: rgb(0, 176, 240);\">
                  <br/>
              </span>
          </strong>
      </p>
      <p style=\"text-align: center;\">
          <strong>
              <span style=\"font-size: 20px; color: rgb(0, 176, 240);\">【火鸟门户系统采购咨询】</span>
          </strong>
      </p>
      <p>
          <strong>
              <span style=\"font-size: 20px; color: rgb(0, 176, 240);\">
                  <br/>
              </span>
          </strong>
      </p>
      <p style=\"text-align: center;\">
          <span style=\"font-size: 16px; background-color: rgb(255, 255, 0);\">免费升级最新版本</span>
          <span style=\"font-size: 16px;\">
              ，
              <strong>
                  <span style=\"font-size: 16px; color: rgb(255, 0, 0);\">PHP代码开源</span>
              </strong>
          </span>
      </p>
      <p style=\"text-align: center;\">
          <span style=\"font-size: 16px;\">多城市分站、多语言、频道自定义开关</span>
      </p>
      <p style=\"text-align: center;\">
          <span style=\"background-color: rgb(255, 0, 0); color: rgb(255, 255, 255);\">
              <strong>
                  <span style=\"background-color: rgb(255, 0, 0); font-size: 16px;\">微信H5、小程序、APP、WAP、PC五端同步</span>
              </strong>
          </span>
      </p>
      <p>
          <strong>
              <span style=\"font-size: 16px;\">
                  <br/>
              </span>
          </strong>
      </p>
      <p style=\"text-align: center;\">
          <strong>
              <span style=\"font-size: 16px;\">QQ/微信：</span>
          </strong>
          <span style=\"text-decoration: none;\">
              <strong>
                  <span style=\"text-decoration: none; font-size: 16px;\">
                      <a href=\"tencent://Message/?Uin=9481731\" target=\"_blank\">9481731</a>
                  </span>
              </strong>
          </span>
      </p>
      <p style=\"text-align: center;\">
          <strong>
              <span style=\"font-size: 16px;\">电话：18913166888</span>
          </strong>
      </p>
      $$https://ihuoniao.cn/about-7.html", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "1", "首页_模板十一_电脑端_广告A", "pic$$https://ihuoniao.cn/include/attachment.php?f=VUR4Uk9WOHdWR01QT1ZjOQ==$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "2", "APP首页_模板四_广告一", "0$$0$$VkRnQmFRSnVWR1VQT1FabA==########0||https://ihuoniao.cn/include/attachment.php?f=VWo1Y05GUTRWbWNGTTFNeg==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "1", "APP首页_模板四_广告二", "pic$$https://ihuoniao.cn/include/attachment.php?f=VlRsU09sNHlBak1GTTFZeA==$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "2", "首页_模板六_移动端_广告一", "0$$0$$VkRnQmFWQThVMklPT0FkbQ==####https://ihuoniao.cn/sz/waimai/list.html?typeid=16####0||https://ihuoniao.cn/include/attachment.php?f=QTI5Uk9RQnNCRFVITVZBMg==####https://ihuoniao.cn/sz/waimai/list.html?typeid=14####0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "1", "首页_模板六_移动端_广告二", "pic$$https://ihuoniao.cn/include/attachment.php?f=QjJzQmFRVnBBak5TWkYwNQ==$$https://ihuoniao.cn/sz/waimai/youhui_list.html$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "2", "首页_模板五_移动端_广告一_百度小程序", "0$$0$$VlRsVE8xQThCalJSWkFkaw==########0||https://ihuoniao.cn/include/attachment.php?f=QTI4Q2FnTnZBRElHTXdWbA==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "2", "电话本插件_广告一", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2021/08/19/16293443651019.png########0||https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2021/08/19/16293443651437.png########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "2", "首页_模板七_移动端_广告一", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2021/09/13/1631506645222.png########0||https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2021/09/13/16315067364087.png########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "2", "首页_模板七_移动端_广告二", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2021/09/13/16315067598898.png########0||https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2021/09/13/16315067613075.png########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "2", "APP首页_模板五_广告一", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2021/09/13/16315068223811.png########0||https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2021/09/13/16315068316840.png########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "2", "APP首页_模板五_广告二", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2021/09/13/16315068515501.png########0||https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2021/09/13/16315068547879.png########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "5", "2023全国两会", "70$$https://ihuoniao.cn/include/attachment.php?f=/siteConfig/holidayadv/large/2024/02/06/17072130708901.png$$https://baike.baidu.com/activity/knowledge?pageKey=glDve8ak-1&cdVersion=0.1.18&channel=baike_pcbjdt", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "2", "首页_模板五_移动端_广告二", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2021/12/03/16385185711204.jpg########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "2", "首页_模板八_移动端_频道广告", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2022/01/04/16412728908765.png##热门话题##https://ihuoniao.cn/sz/circle/topic_detail-11.html####0||https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2022/01/04/16412745725935.gif##商业##https://ihuoniao.cn/sz/article/detail-101.html####0||https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2022/01/04/16412746381784.gif##游戏新闻##https://ihuoniao.cn/sz/article/detail-905.html####0||https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2022/01/04/16412746521868.gif##楼市##https://ihuoniao.cn/sz/article/detail-112.html####0||https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2022/01/04/16412746665331.gif##园林##https://ihuoniao.cn/sz/article/detail-114.html####0||https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2022/01/04/16412746801511.gif##时代楷模##https://ihuoniao.cn/sz/article/zt_detail-62.html####0||https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2022/01/04/16412747017970.gif##独特视角：带你领略不一样的南宋##https://ihuoniao.cn/sz/article/zt_detail-9.html####0||https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2022/01/04/16412747529238.gif##健康##https://ihuoniao.cn/sz/article/detail-122.html####0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "2", "首页_模板八_移动端_广告一", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2022/01/04/16412633455400.png####https://ihuoniao.cn/sz/tuan/pintuan.html####0||https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2022/01/04/16412635983280.png####https://ihuoniao.cn/sz/waimai####0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "1", "首页_模板八_移动端_广告二", "pic$$https://ihuoniao.cn/include/attachment.php?f=/siteConfig/advthumb/large/2022/01/04/16412637138539.png$$https://ihuoniao.cn/u/qiandao.html$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "2", "首页_模板八_移动端_精选服务", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2022/01/04/16412737625206.png########0||https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2022/01/04/1641273761831.png########0||https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2022/01/04/16412737627139.png########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "2", "首页_模板八_移动端_幻灯片", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2022/01/04/16412731359205.png####https://ihuoniao.cn/sz/waimai####0||https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2022/01/04/16412733787205.png####https://ihuoniao.cn/sz/waimai####0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "2", "APP_首页_模板六_移动端_广告一", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2022/01/04/16412760933088.png########0||https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2022/01/04/16412761104116.png########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "2", "APP_首页_模板六_移动端_幻灯片", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2022/01/04/16412761795226.png########0||https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2022/01/04/16412761662611.png########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "1", "APP_首页_模板六_移动端_广告二", "pic$$https://ihuoniao.cn/include/attachment.php?f=/siteConfig/advthumb/large/2022/01/10/16418037963400.png$$https://ihuoniao.cn/u/qiandao.html$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "6", "APP_系统公告", "
      <p style=\"text-align: center;\">
          <span style=\"font-size: 12px;\">本站非实际运营网站，所载全部信息内容均仅作为软件系统功能测试之用，切勿当真！若有侵权，请即时联系：0512-67581578</span>
      </p>
      <p>
          <br/>
      </p>
      <p style=\"white-space: normal; text-align: center;\">
          <span style=\"font-size: 14px; background-color: rgb(255, 255, 0);\">免费升级最新版本/</span>
          <strong style=\"font-size: 14px;\">
              <span style=\"color: rgb(255, 0, 0);\">PHP代码开源</span>
          </strong>
          <br/>
      </p>
      <p style=\"white-space: normal; text-align: center;\">
          <span style=\"background-color: rgb(255, 0, 0); color: rgb(255, 255, 255); font-size: 14px;\">微信/小程序/APP/WAP/PC五端同步</span>
      </p>
      <p style=\"white-space: normal; text-align: center;\">
          <span style=\"font-size: 14px;\">
              <strong>QQ/微信：</strong>
              <strong>9481731</strong>
          </span>
      </p>
      <p style=\"white-space: normal; text-align: center;\">
          <span style=\"font-size: 14px;\">
              <strong>咨询电话：</strong>
              <strong>18913166888</strong>
          </span>
      </p>
      <p>
          <br/>
      </p>
      $$https://ihuoniao.cn/about-7.html", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "2", "首页_模板一_小程序_广告一", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2022/05/18/16528624906722.png####https://www.kumanyun.com/contact.html####0||https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2022/05/18/16528533428063.png####miniprogram://pages/packages/info/index/index####0||https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2022/05/18/16528624987775.png####https://www.kumanyun.com/contact.html####0||https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2022/05/18/16528538118722.png####wxMiniprogram://gh_35ab979fd4f6/wx1cc70b43e2af1811####0||https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2022/05/18/16528538169935.png########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "2", "首页_模板一_小程序_广告三", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2022/05/19/16529381729467.png####https://ihuoniao.cn/tuan####0||https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2022/05/19/16529381724615.png####miniprogram://pages/waimai/index####0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "2", "首页_模板一_小程序_广告四", "20$$20$$https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2022/05/19/16529498643776.png########0||https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2022/05/19/1652949863651.png########0||https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2022/05/19/16529498649001.png########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "2", "首页_模板一_小程序_广告五", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2022/05/19/16529504248186.png##超市##https://ihuoniao.cn/114_list.html?directory=超市####0||https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2022/05/19/16529504283069.png##医院##https://ihuoniao.cn/114_list.html?directory=医院####0||https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2022/05/19/16529504318061.png##公交站##https://ihuoniao.cn/114_list.html?directory=公交站####0||https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2022/05/19/16529504369796.png##书店##https://ihuoniao.cn/114_list.html?directory=书店####0||https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2022/05/19/16529504396136.png##体育馆##https://ihuoniao.cn/114_list.html?directory=体育馆####0||https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2022/05/19/16529504426830.png##营业厅##https://ihuoniao.cn/114_list.html?directory=营业厅####0||https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2022/05/19/16529504449132.png##加油站##https://ihuoniao.cn/114_list.html?directory=加油站####0||https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2022/05/19/16529504532747.png##公安局##https://ihuoniao.cn/114_list.html?directory=公安局####0||https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2022/05/19/16529504579097.png##停车场##https://ihuoniao.cn/114_list.html?directory=停车场####0||https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2022/05/19/16529504606389.png##全部##https://ihuoniao.cn/114_list.html?directory=全部####0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "2", "首页_模板二_小程序_广告三", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2022/08/04/16596069245935.png####https://ihuoniao.cn/circle?appTitle####0||https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2022/08/04/16596069234059.png########0||https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2022/08/04/1659606923166.png########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "2", "首页_模板二_小程序_广告一", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2022/08/10/16601099305765.png####https://www.kumanyun.com/contact.html####0||https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2022/08/10/16601099524658.png####miniprogram://pages/info/index####0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "1", "首页_模板二_小程序_广告二", "pic$$https://ihuoniao.cn/include/attachment.php?f=/siteConfig/advthumb/large/2022/08/10/16601100412790.png$$https://ihuoniao.cn/u/qiandao.html$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "2", "首页_模板九_移动端_广告一", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2022/12/19/16714276121191.png########0||https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2022/12/19/16714276164441.png########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "2", "首页_模板一_抖音小程序_广告一", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2023/06/27/16878346169831.png########0||https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2023/06/27/16878346255531.png########0||https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2023/06/27/1687834650934.png########0||https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2023/06/27/16878346503698.png########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "1", "首页_模板一_抖音小程序_广告二", "pic$$https://ihuoniao.cn/include/attachment.php?f=/siteConfig/advthumb/large/2023/06/27/16878347248852.png$$https://ihuoniao.cn/u/qiandao.html$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "2", "首页_模板一_抖音小程序_广告三", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2023/06/27/16878347651451.png####miniprogram://pages/packages/tuan/index/index####0||https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2023/06/27/1687834765622.png####https://ihuoniao.cn/waimai####0", "0", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "2", "首页_模板一_抖音小程序_广告四", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2023/06/27/16878348247799.png########0||https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2023/06/27/16878348248142.png########0||https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2023/06/27/16878348244449.png########0", "0", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "2", "首页_模板一_抖音小程序_广告五", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2023/06/27/16878348522591.png##超市##https://ihuoniao.cn/114_list.html?directory=超市####0||https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2023/06/27/1687834852255.png##医院##https://ihuoniao.cn/114_list.html?directory=医院####0||https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2023/06/27/1687834852519.png##公交站##https://ihuoniao.cn/114_list.html?directory=公交站####0||https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2023/06/27/16878348522330.png##书店##https://ihuoniao.cn/114_list.html?directory=书店####0||https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2023/06/27/16878348526005.png##体育馆##https://ihuoniao.cn/114_list.html?directory=体育馆####0||https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2023/06/27/16878348526261.png##营业厅##https://ihuoniao.cn/114_list.html?directory=营业厅####0||https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2023/06/27/16878348521756.png##加油站##https://ihuoniao.cn/114_list.html?directory=加油站####0||https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2023/06/27/16878348539550.png##公安局##https://ihuoniao.cn/114_list.html?directory=公安局####0||https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2023/06/27/16878348534304.png##停车场##https://ihuoniao.cn/114_list.html?directory=停车场####0||https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2023/06/27/1687834853731.png##全部##https://ihuoniao.cn/114_list.html?directory=全部####0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "2", "首页_模板二_抖音小程序_广告一", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2023/06/27/16878346255531.png####miniprogram://pages/packages/info/index/index####0||https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2023/06/27/16878346169831.png####https://www.kumanyun.com/contact.html####0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "1", "首页_模板二_抖音小程序_广告二", "pic$$https://ihuoniao.cn/include/attachment.php?f=/siteConfig/advthumb/large/2023/06/30/16880933472784.png$$https://ihuoniao.cn/u/qiandao.html$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "2", "首页_模板二_抖音小程序_广告三", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2023/06/27/1687834650934.png########0||https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2023/06/27/16878346503698.png########0||https://ihuoniao.cn/include/attachment.php?f=/siteConfig/atlas/large/2023/06/27/16878348247799.png########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("siteConfig", "0", "1", "首页_模板一_小程序_广告二", "pic$$https://ihuoniao.cn/include/attachment.php?f=/siteConfig/advthumb/large/2023/06/30/16880933472784.png$$https://ihuoniao.cn/u/qiandao.html$$$$0$$0$$0", "1", "50");'
        ),
        "special" => array(
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("special", "0", "2", "拖拽专题_模板一_电脑端_广告一", "1180$$300$$https://ihuoniao.cn/include/attachment.php?f=/special/atlas/large/2018/02/06/15179115347758.jpg##摄影之路当爱好变成职业 你能坚持下来吗？####||https://ihuoniao.cn/include/attachment.php?f=/special/atlas/large/2018/02/06/15179115562616.jpg##Chinajoy 2016 5大主播全景直播####", "1", "50");'
        ),
        "task" => array(
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("task", "0", "2", "任务悬赏_小程序端_模板一_首页_广告一", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/task/atlas/large/2022/10/26/16667691013782.png##短债优等生 闲钱好去处##https://bbs.kumanyun.com1####0||https://ihuoniao.cn/include/attachment.php?f=/task/atlas/large/2022/10/26/16667691213400.png##朝朝宝新户赢好礼##https://www.qq.com####0||https://ihuoniao.cn/include/attachment.php?f=/task/atlas/large/2022/10/26/1666769127970.png##生活缴费抽大奖##https://www.kumanyun.com####0||https://ihuoniao.cn/include/attachment.php?f=/task/atlas/large/2022/10/26/16667691336208.png##美好生活季 缴费见面礼##https://help.kumanyun.com####0||https://ihuoniao.cn/include/attachment.php?f=/task/atlas/large/2022/10/26/16667691391526.png##你的工资不止这么简单##https://bbs.kumanyun.com####0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("task", "0", "2", "任务悬赏_小程序端_模板一_商家中心_广告一", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/task/atlas/large/2022/10/26/16667692593794.png##3折限时钜惠##https://www.baidu.com##闪电贷降价了##0||https://ihuoniao.cn/include/attachment.php?f=/task/atlas/large/2022/10/26/16667692645997.png##便民服务月月礼##https://www.qq.com##抽6299元苹果手机##0||https://ihuoniao.cn/include/attachment.php?f=/task/atlas/large/2022/10/26/16667692639630.png##千万粉丝福利放送##https://www.kumanyun.com##最高赢100万微克黄金红包##0||https://ihuoniao.cn/include/attachment.php?f=/task/atlas/large/2022/10/26/16667692631726.png##233333份红包正在派发##https://bbs.kumanyun.com##爱您宠粉节 8月火热来袭##0||https://ihuoniao.cn/include/attachment.php?f=/task/atlas/large/2022/10/26/16667692643458.png##保本小雪球 安全好选择##https://help.kumanyun.com##潜在最高收益5.38%##0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("task", "0", "1", "任务悬赏_小程序端_模板一_推广中心_广告一", "pic$$https://ihuoniao.cn/include/attachment.php?f=/task/advthumb/large/2022/10/26/16667693357874.png$$###$$商家推广中心$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("task", "0", "1", "任务悬赏_小程序端_模板一_极速审核_广告一", "pic$$https://ihuoniao.cn/include/attachment.php?f=/task/advthumb/large/2022/10/26/16667693618769.png$$$$$$0$$0$$0", "1", "50");'
        ),
        "tieba" => array(
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("tieba", "0", "2", "贴吧社区_模板三_电脑端_广告一", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/tieba/atlas/large/2024/02/18/17082265634548.png########0||https://ihuoniao.cn/include/attachment.php?f=VXp3RmExWTlVV1pSWVZBMw==########0||https://ihuoniao.cn/include/attachment.php?f=VnpnQ2JBZHNBRGNFTlZBMg==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("tieba", "0", "1", "贴吧社区_模板三_电脑端_广告二", "pic$$https://ihuoniao.cn/include/attachment.php?f=QTJ3SGFWWTlBelFPUGdKbQ==$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("tieba", "0", "2", "贴吧社区_模板三_电脑端_广告三", "0$$0$$VUQ5UlAxODBBalZUWWx3Lw==########0||https://ihuoniao.cn/include/attachment.php?f=WHpCZE13Tm9WR01QUGdaaw==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("tieba", "0", "1", "贴吧社区_模板三_电脑端_广告四", "pic$$https://ihuoniao.cn/include/attachment.php?f=WHpCUVBsQTdBalZVWmdGaA==$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("tieba", "0", "2", "APP_贴吧_幻灯", "0$$0$$VUQ5UU5RVnNBemRVWkZ3Nw==########0||https://ihuoniao.cn/include/attachment.php?f=VUQ5U04xYytCVEVHTmdCaw==########0||https://ihuoniao.cn/include/attachment.php?f=VmpsY09WTTZCek1ETTFVeg==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("tieba", "0", "1", "贴吧移动端信息流广告", "code$${
         \"TencentGDT\":{
             \"h5\": {\"app_id\":\"1203685091\",\"placement_id\":\"1006915636675575\"},
             \"android\": {\"app_id\":\"1203684865\",\"placement_id\":\"3036414645660678\"},
             \"wxmini\": \"adunit-650c7e3623fc76ad\",
             \"dymini\": \"lwm48zt3u1mh71z3mv\"
          }
      }$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("tieba", "0", "1", "贴吧移动端详情页内容广告", "code$${
         \"TencentGDT\":{
             \"h5\": {\"app_id\":\"1203685091\",\"placement_id\":\"7077076415552488\"},
             \"android\": {\"app_id\":\"1203684865\",\"placement_id\":\"1047591623355113\"},
             \"wxmini\": \"adunit-047ca84f8d069d83\",
             \"dymini\": \"3ykno8wh2a0wu00cuz\"
          }
      }$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("tieba", "0", "2", "贴吧社区_模板二_移动端_广告一", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/tieba/atlas/large/2024/02/01/17067653078055.png########0||https://ihuoniao.cn/include/attachment.php?f=VXp4Vk93TnJCelVETWdkaQ==########0||https://ihuoniao.cn/include/attachment.php?f=VkR0V09BTnJEandHTjFFNw==########0", "1", "50");'
        ),
        "travel" => array(
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("travel", "0", "2", "旅游信息_模板一_移动端_广告一", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/travel/atlas/large/2024/02/18/17082191074932.png########0||https://ihuoniao.cn/include/attachment.php?f=VXp3QlpBVmpEamtDT2xJeg==########0||https://ihuoniao.cn/include/attachment.php?f=QTJ3QVpWY3hVMlJXYmdkbg==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("travel", "0", "2", "旅游信息_模板一_移动端_广告二", "0$$0$$VVQ1Uk5GUXlWbUVCT1FKaw==########0||https://ihuoniao.cn/include/attachment.php?f=QTJ3RllGSTBWbUVETzFBMw==########0||https://ihuoniao.cn/include/attachment.php?f=VVQ1ZE9GODVEamtBT0ZBMA==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("travel", "0", "1", "旅游_模板二_电脑端_广告三", "pic$$https://ihuoniao.cn/include/attachment.php?f=QkdoU1BGVThWbVFPT2dkZw==$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("travel", "0", "2", "旅游_模板二_电脑端_广告一", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/travel/atlas/large/2024/02/18/17082192078440.png########0||https://ihuoniao.cn/include/attachment.php?f=QldsVk93SnJWbVJUWUZVKw==########0||https://ihuoniao.cn/include/attachment.php?f=VmpwU1BGVThCRFlDTVZBNg==########0||https://ihuoniao.cn/include/attachment.php?f=QUd3QmIxWS9BakFPUDFRLw==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("travel", "0", "2", "旅游_模板二_电脑端_广告二", "0$$0$$QjJzR2FBSnJVMkVGTjEwKw==########0||https://ihuoniao.cn/include/attachment.php?f=QkdoUVBsUTlWR1pUWVZNeg==########0||https://ihuoniao.cn/include/attachment.php?f=VUR4V09BSnJWV2RUWVFkbQ==########0||https://ihuoniao.cn/include/attachment.php?f=VkRoWE9WRTRCalFGTjFjeA==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("travel", "0", "1", "旅游_模板二_电脑端_广告四", "pic$$https://ihuoniao.cn/include/attachment.php?f=VWo1Y01sQTVCalFCTlZFMQ==$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("travel", "0", "1", "旅游旅行社列表_模板二_电脑端_广告一", "pic$$https://ihuoniao.cn/include/attachment.php?f=VVQxWE9WQTVCalFPUEFkdA==$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("travel", "0", "1", "旅游酒店列表_模板二_电脑端_广告一", "pic$$https://ihuoniao.cn/include/attachment.php?f=WGpKUlAxQTVWV2NGTmdGag==$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("travel", "0", "1", "旅游一日游列表_模板二_电脑端_广告一", "pic$$https://ihuoniao.cn/include/attachment.php?f=VVQwQmJ3UnRCVGRSWWxNdw==$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("travel", "0", "1", "旅游跟团游列表_模板二_电脑端_广告一", "pic$$https://ihuoniao.cn/include/attachment.php?f=QkdoVk8xVThCelVHTlZVMQ==$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("travel", "0", "1", "旅游签证首页_模板二_电脑端_广告一", "pic$$https://ihuoniao.cn/include/attachment.php?f=VVQxV09GVThWR1pXWlFGZw==$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("travel", "0", "1", "旅游攻略列表_模板二_电脑端_广告一", "pic$$https://ihuoniao.cn/include/attachment.php?f=VXo5U1BGYytWbVJWWmdaZw==$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("travel", "0", "2", "APP_旅游_首页_广告一", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/travel/atlas/large/2024/02/18/17082191074932.png########0||https://ihuoniao.cn/include/attachment.php?f=QjJzQmFWOHlBREZVWWdWZw==########0||https://ihuoniao.cn/include/attachment.php?f=QUd4Uk9RSnZBak5XWUFkdA==########0||https://ihuoniao.cn/include/attachment.php?f=QUd4VVBBZHFCVFFBTmxZOQ==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("travel", "0", "2", "APP_旅游_首页_广告二", "0$$0$$WGpKVE93Vm9BREVDTlZNeA==########0||https://ihuoniao.cn/include/attachment.php?f=QldrR2JnUnBBVEJVWXdCag==########0||https://ihuoniao.cn/include/attachment.php?f=VnpzR2JnZHFCamNHTVFCcQ==########0", "1", "50");'
        ),
        "tuan" => array(
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("tuan", "0", "2", "团购秒杀_模板三_电脑端_广告一", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/tuan/atlas/large/2024/02/02/17068533762208.png########0||https://ihuoniao.cn/include/attachment.php?f=VnpnQ2JGUThCRGNPT2xBeg==########0||https://ihuoniao.cn/include/attachment.php?f=/article/atlas/large/2023/11/17/1700204896841.png########0||https://ihuoniao.cn/include/attachment.php?f=/tuan/atlas/large/2024/02/02/17068533852446.png########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("tuan", "0", "1", "团购秒杀_模板三_电脑端_广告二", "pic$$https://ihuoniao.cn/include/attachment.php?f=VXp4UVBnUnNWbVZSWlZNeQ==$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("tuan", "0", "1", "团购秒杀_模板三_电脑端_广告三", "pic$$https://ihuoniao.cn/include/attachment.php?f=/tuan/advthumb/large/2024/02/02/17068540864078.png$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("tuan", "0", "1", "团购秒杀_模板三_电脑端_广告四", "pic$$https://ihuoniao.cn/include/attachment.php?f=/tuan/advthumb/large/2024/02/02/17068542194012.png$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("tuan", "0", "1", "团购秒杀_模板三_电脑端_广告五", "pic$$https://ihuoniao.cn/include/attachment.php?f=/tuan/advthumb/large/2024/02/02/17068542563531.png$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("tuan", "0", "2", "团购秒杀_APP_幻灯广告", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/tuan/atlas/large/2024/02/01/17067556625618.png########0||https://ihuoniao.cn/include/attachment.php?f=QTI5VU9sQTVVMnRWWlZNeg==########0||https://ihuoniao.cn/include/attachment.php?f=VnpzQmIxRTRVV2tFTkZNdw==####https://www.baidu.com####0||https://ihuoniao.cn/include/attachment.php?f=WHpOZE0xODJCRHdGTlFKag==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("tuan", "0", "1", "团购秒杀_APP_首页广告一", "pic$$https://ihuoniao.cn/include/attachment.php?f=QldsU1BGYytEelpSYUZJMQ==$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("tuan", "0", "2", "团购秒杀_APP_首页广告二", "0$$0$$VkRnSGFRSnJBenBTYTF3NQ==####https://ihuoniao.cn/tuan/mapshop.html####0||https://ihuoniao.cn/include/attachment.php?f=VUR3Q2JBUnRBem9HUHdkdA==####https://ihuoniao.cn/u/enter_contrast.html####0||https://ihuoniao.cn/include/attachment.php?f=QTI4R2FGODJVV2hVYlZjeg==####https://ihuoniao.cn/u/qiandao.html####0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("tuan", "0", "2", "团购秒杀_APP_导航链接", "0$$0$$VlRsWE9WODJCajVSWWxNMQ==##限时秒杀##https://ihuoniao.cn/tuan/secKill.html####0||https://ihuoniao.cn/include/attachment.php?f=QTI5Y01nUnRCRHhSWWwwNQ==##拼团优惠##https://ihuoniao.cn/tuan/pintuan.html####1||https://ihuoniao.cn/include/attachment.php?f=VUR4U1BBZHVBRGdFTjFjdw==##发现好店##https://ihuoniao.cn/tuan/haodian.html####1||https://ihuoniao.cn/include/attachment.php?f=WHpNQ2JGUTlWVzBETUYwMw==##代金券##https://ihuoniao.cn/tuan/voucher.html####1||https://ihuoniao.cn/include/attachment.php?f=QTI5UVBnSnJWVzBETUFKbg==##热门商圈##https://ihuoniao.cn/tuan/shangquan.html####1", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("tuan", "0", "2", "团购_模板三_移动端_广告一", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/tuan/atlas/large/2024/02/01/17067556625618.png########0||https://ihuoniao.cn/include/attachment.php?f=WHpOU1BGRTNBak1GTmdKbA==########0||https://ihuoniao.cn/include/attachment.php?f=QkdnR2FGY3hCamNGTmxBMg==########0||https://ihuoniao.cn/include/attachment.php?f=WHpNSGFRZGhEejVVWjEwNQ==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("tuan", "0", "1", "团购_模板三_移动端_广告二", "pic$$https://ihuoniao.cn/include/attachment.php?f=WHpOUlAxSTBBREZXWlFCbA==$$https://ihuoniao.cn/tuan$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("tuan", "0", "2", "团购_模板三_移动端_广告三", "0$$0$$VXo5VU9sUXlCRFVHTlZNNQ==####https://ihuoniao.cn/tuan/mapshop.html####0||https://ihuoniao.cn/include/attachment.php?f=VXo4SGFRVmpCRFVFTndCcg==####https://ihuoniao.cn/u/enter_contrast.html####0||https://ihuoniao.cn/include/attachment.php?f=VVQwQWJsY3hCVFJWWVZJdw==####https://ihuoniao.cn/u/qiandao.html####0", "1", "50");'
        ),
        "video" => array(
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("video", "0", "2", "视频_模板一_电脑端_广告一", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/video/atlas/large/2018/02/06/1517908447706.jpg########0||https://ihuoniao.cn/include/attachment.php?f=/video/atlas/large/2018/02/06/15179084545123.jpg########0||https://ihuoniao.cn/include/attachment.php?f=/video/atlas/large/2018/02/06/15179084598425.jpg########0||https://ihuoniao.cn/include/attachment.php?f=/video/atlas/large/2018/02/06/15179084631488.jpg########0||https://ihuoniao.cn/include/attachment.php?f=/video/atlas/large/2018/02/06/15179084676256.jpg########0||https://ihuoniao.cn/include/attachment.php?f=/video/atlas/large/2018/02/06/15179084729488.jpg########0||https://ihuoniao.cn/include/attachment.php?f=/video/atlas/large/2018/02/06/15179084766928.jpg########0||https://ihuoniao.cn/include/attachment.php?f=/video/atlas/large/2018/02/06/151790848284.jpg########0||https://ihuoniao.cn/include/attachment.php?f=/video/atlas/large/2018/02/06/15179084875812.jpg########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("video", "0", "2", "视频_模板三_移动端_广告一", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/video/atlas/large/2022/02/25/16457816813421.png########0", "1", "50");'
        ),
        "vote" => array(
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("vote", "0", "2", "投票_模板二_移动端_广告一", "0$$0$$QUc5Vk93UnNEandDTWxZOA==########0||https://ihuoniao.cn/include/attachment.php?f=WGpGUVBsUThWbVJSWUZFeA==########0", "1", "50");'
        ),
        "waimai" => array(
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("waimai", "0", "2", "APP_外卖_首页_广告一", "0$$0$$VVQ1VU1WRTNCallHTXdKaQ==########0||https://ihuoniao.cn/include/attachment.php?f=WHpBQVpRUmlWR1FDTjEwOA==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("waimai", "0", "2", "APP_外卖_首页_广告二", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/waimai/atlas/large/2023/03/10/16784361604202.png####https://ihuoniao.cn/sz/waimai/shop-3.html####0||https://ihuoniao.cn/include/attachment.php?f=/waimai/atlas/large/2023/03/10/16784361729103.png########0||https://ihuoniao.cn/include/attachment.php?f=/waimai/atlas/large/2023/03/10/16784361819036.png########0||https://ihuoniao.cn/include/attachment.php?f=/waimai/atlas/large/2023/03/10/16784361906772.png########0||https://ihuoniao.cn/include/attachment.php?f=/waimai/atlas/large/2023/03/10/16784361983707.png########0||https://ihuoniao.cn/include/attachment.php?f=/waimai/atlas/large/2023/03/10/16784362061207.png########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("waimai", "0", "2", "APP_外卖_首页_广告三", "0$$0$$WHpCUU5WY3hCRFFITVFGag==########0||https://ihuoniao.cn/include/attachment.php?f=VWoxV00xTTFBREFFTWdGaQ==########0||https://ihuoniao.cn/include/attachment.php?f=QldvR1kxTTFBREJVWWdCZw==########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("waimai", "0", "2", "美食外卖_模板二_移动端_广告一", "0$$0$$VXo4Q2JnQnFCREVBTlZ3Ng==####https://ihuoniao.cn/sz/waimai/shop-10.html####0||https://ihuoniao.cn/include/attachment.php?f=VlRsV09nUnVCekpWWUFWaw==####https://ihuoniao.cn/sz/waimai/shop-8.html####0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("waimai", "0", "1", "美食外卖_模板二_移动端_广告二", "pic$$https://ihuoniao.cn/include/attachment.php?f=VkRnR2FsYzlBVFJXWUZBMA==$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("waimai", "0", "1", "美食外卖_模板二_移动端_广告三", "pic$$https://ihuoniao.cn/include/attachment.php?f=VkRnQmJWWThWV0JSWndKcA==$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("waimai", "0", "1", "美食外卖_模板二_移动端_广告四", "pic$$https://ihuoniao.cn/include/attachment.php?f=VWo0QWJBVnZCREZTWlFCaQ==$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("waimai", "0", "1", "美食外卖_模板二_移动端_广告五", "pic$$https://ihuoniao.cn/include/attachment.php?f=VlRsVFAxNDBVV1JWWWwwKw==$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("waimai", "0", "1", "美食外卖_模板二_移动端_广告六", "pic$$https://ihuoniao.cn/include/attachment.php?f=QTI4QWJBTnBVbWNFTXdkbg==$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("waimai", "0", "1", "美食外卖_模板二_移动端_广告七", "pic$$https://ihuoniao.cn/include/attachment.php?f=VnpzSGExQTZCVEFQT0ZVMA==$$$$$$0$$0$$0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("waimai", "0", "2", "外卖_模板二_移动端_广告九", "0$$0$$QldrQWIxVXpEemxSWkZFdw==####https://ihuoniao.cn/sz/waimai/getQuan.html####0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("waimai", "0", "1", "美食外卖_模板二_移动端_领券中心", "pic$$https://ihuoniao.cn/include/attachment.php?f=/waimai/advthumb/large/2022/01/25/16431033688725.png$$https://ihuoniao.cn/waimai/getQuan.html$$$$0$$0$$1", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("waimai", "0", "2", "APP_外卖_首页_广告四", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/waimai/atlas/large/2022/02/10/1644483786380.png####https://ihuoniao.cn/####0||https://ihuoniao.cn/include/attachment.php?f=/waimai/atlas/large/2022/02/10/16444841699790.png####https://ihuoniao.cn/####0||https://ihuoniao.cn/include/attachment.php?f=/waimai/atlas/large/2022/02/10/16444841721224.png####https://ihuoniao.cn/####0||https://ihuoniao.cn/include/attachment.php?f=/shop/atlas/large/2023/08/22/16926675295411.png########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("waimai", "0", "2", "美食外卖_模板二_移动端_优惠专区", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/waimai/atlas/large/2022/02/23/16456016946291.png########0||https://ihuoniao.cn/include/attachment.php?f=/waimai/atlas/large/2022/02/23/16456016951997.png########0||https://ihuoniao.cn/include/attachment.php?f=/waimai/atlas/large/2022/02/23/16456016931874.png########0||https://ihuoniao.cn/include/attachment.php?f=/waimai/atlas/large/2022/02/23/16456016959845.png########0||https://ihuoniao.cn/include/attachment.php?f=/waimai/atlas/large/2022/02/23/16456017326749.png########0||https://ihuoniao.cn/include/attachment.php?f=/waimai/atlas/large/2022/02/23/16456017336682.png########0", "1", "50");',
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("waimai", "0", "2", "美食外卖_跑腿_移动端_广告一", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/waimai/atlas/large/2023/12/05/1701764547671.jpg####https://mp.weixin.qq.com/s/2779H1u8b0Scxzp5_ICdVQ####0||https://ihuoniao.cn/include/attachment.php?f=/waimai/atlas/large/2022/07/11/16575061636515.png########0||https://ihuoniao.cn/include/attachment.php?f=/waimai/atlas/large/2022/07/11/1657506164281.png####https://mp.weixin.qq.com/s/2779H1u8b0Scxzp5_ICdVQ####0||https://ihuoniao.cn/include/attachment.php?f=/waimai/atlas/large/2022/07/11/16575061658387.png########0", "1", "50");'
        ),
        "website" => array(
              'INSERT INTO `#@__advlist` (`model`, `type`, `class`, `title`, `body`, `state`, `weight`) VALUES ("website", "0", "2", "自助建站_模板一_电脑端_广告一", "0$$0$$https://ihuoniao.cn/include/attachment.php?f=/website/atlas/large/2018/02/06/15179116449501.jpg######||https://ihuoniao.cn/include/attachment.php?f=/website/atlas/large/2018/02/06/15179116482660.jpg######||https://ihuoniao.cn/include/attachment.php?f=/website/atlas/large/2018/02/06/15179116591834.jpg######", "1", "50");'
        )
    );
    return $_defaultData;
}


//将二维数组转化为一维数组
function flattenArray($array){
    return array_reduce($array, function($carry, $subArray){
        return array_merge($carry, $subArray);
    }, []);
}