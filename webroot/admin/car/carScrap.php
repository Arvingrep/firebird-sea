<?php
/**
 * 汽车报废管理
 *
 * @version        $Id: carScrap.php 2023-11-14 下午17:14:28 $
 * @package        HuoNiao.Car
 * @copyright      Copyright (c) 2013 - 2023, HuoNiao, Inc.
 * @link           http://www.huoniao.co/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("carScrap");
$dsql = new dsql($dbo);
$userLogin = new userLogin($dbo);
$tpl = dirname(__FILE__)."/../templates/car";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "carScrap.html";

$db = "car_scrap";

// 回复
if($dopost == 'reply'){
	$id = (int)$id;
    $state = (int)$state;
    $sql = $dsql->SetQuery("UPDATE `#@__car_scrap` SET `state` = $state, `note` = '$note' WHERE `id` = $id");
    $ret = $dsql->dsqlOper($sql, "update");
    if($ret == "ok"){
        echo '{"state":100,"info":'.json_encode("处理成功").'}';
    }else{
        echo '{"state":200,"info":'.json_encode("处理失败").'}';
    }
	die;

}elseif($dopost == "getDetail"){

	if($id){
		$sql = $dsql->SetQuery("SELECT * FROM `#@__car_scrap` WHERE `id` = $id");
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){
			$data = array();
			$ret = $ret[0];
			foreach ($ret as $k => $v) {
				if($k == "pubdate"){
					$v = $v ? date("Y-m-d H:i:s", $v) : "";
				}
				$data[$k] = $v;
			}

			$imgList = array();
			if($ret['pics']){
				$img = explode(",", $ret['pics']);
				foreach ($img as $k => $v) {
					$imgList[] = getFilePath($v);
				}
			}
			$data['imgList'] = $imgList;

            $data['status'] = $ret['state'];

			$uid = $ret['uid'];
            if($uid){
                $sql = $dsql->SetQuery("SELECT `username`, `nickname` FROM `#@__member` WHERE `id` = $uid");
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){
                    $username = $ret[0]['nickname'] ?: $ret[0]['username'];
                }else{
                    $username = "未知";
                }
            }else{
                $username = '游客';
            }

			$data['state'] = 100;
			$data['username'] = $username;


			echo json_encode($data);
		}else{
			echo '{"state": 200, "info": '.json_encode("信息获取失败！").'}';
		}
	}else{
		echo '{"state": 200, "info": '.json_encode("没有指定信息id").'}';
	}
	die;

//删除信息
}elseif($dopost == "del"){
	if($id != ""){
		$archives = $dsql->SetQuery("DELETE FROM `#@__".$db."` WHERE `id` IN (".$id.")");
		$results = $dsql->dsqlOper($archives, "update");
		if($results == "ok"){
			echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
		}else{
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}
	}else{
		echo '{"state": 200, "info": '.json_encode("没有选择任何信息").'}';
	}
	die;

}elseif($dopost == 'getList'){

	$where = "";

	if($sKeyword != ""){
		$isId = false;
		if(substr($sKeyword, 0, 1) == '#'){
			$id = substr($sKeyword, 1);
			if(is_numeric($id)){
				$isId = true;
				$where .= " AND `uid` = $id";
			}
		}else{
			$where .= " AND (`name` LIKE '%$sKeyword%' OR `phone` LIKE '%$sKeyword%' OR `title` LIKE '%$sKeyword%' OR `note` LIKE '%$sKeyword%')";
		}
	}

	if($start != ""){
		$where .= " AND `pubdate` >= ". GetMkTime($start);
	}

	if($end != ""){
		$where .= " AND `pubdate` <= ". GetMkTime($end . ' 23:59:59');
	}

	if($state != ''){
		$where .= " AND `state` = $state";
	}

	$list = array();

	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	$archives = $dsql->SetQuery("SELECT * FROM `#@__car_scrap` WHERE 1 = 1");
	//总条数
	$totalCount = $dsql->dsqlOper($archives, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);
	//未处理
	$totalGray = $dsql->dsqlOper($archives." AND `state` = 0", "totalCount");
	//已处理
	$normal = $dsql->dsqlOper($archives." AND `state` = 1", "totalCount");

	$atpage = $pagestep*($page-1);
	$where .= " ORDER BY `id` DESC LIMIT $atpage, $pagestep";

	$results  = $dsql->dsqlOper($archives.$where, "results");
	if($results){
		foreach ($results as $key => $value) {
			$uid = $value['uid'];
            if($uid){
                $sql = $dsql->SetQuery("SELECT `username`, `nickname` FROM `#@__member` WHERE `id` = $uid");
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){
                    $username = $ret[0]['nickname'] ?: $ret[0]['username'];
                }else{
                    $username = "未知";
                }
            }else{
                $username = '游客';
            }

			foreach ($value as $k => $v) {
				if($k == "pubdate"){
					$v = $v ? date("Y-m-d H:i:s", $v) : "";
				}
				$list[$key][$k] = $v;
			}

			$list[$key]['username'] = $username;
		}

		echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "normal": '.$normal.'}, "list": '.json_encode($list).'}';
	}else{
		echo '{"state": 101, "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "normal": '.$normal.'}, "info": '.json_encode("暂无相关信息").'}';
	}

	die;

}



//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/bootstrap-datetimepicker.min.js',
		'admin/car/carScrap.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
	$huoniaoTag->assign('notice', $notice);

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/car";  //设置编译目录
	$huoniaoTag->display($templates);

}else{
	echo $templates."模板文件未找到！";
}
