<?php
/**
 * 管理网站地区
 *
 * @version        $Id: siteAddr.php 2015-10-24 上午9:26:10 $
 * @package        HuoNiao.Config
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("siteAddr");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/siteConfig";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "siteAddr.html";

$db = "site_area";

//修改分类
if($dopost == "updateType"){

	$value = $_REQUEST['value'];

	if($id != ""){
		$archives = $dsql->SetQuery("SELECT * FROM `#@__$db` WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "results");

		if(!empty($results)){

			if($action == "single"){

				//天气代码
				if($type == "weather_code"){
					if($results[0]['weather_code'] != $value){
						$archives = $dsql->SetQuery("UPDATE `#@__$db` SET `weather_code` = '$value' WHERE `id` = ".$id);
						$results = $dsql->dsqlOper($archives, "update");
					}else{
						die('{"state": 101, "info": '.json_encode('无变化！').'}');
					}

				//名称
				}else if($type == "name"){
					if($value == "") die('{"state": 101, "info": '.json_encode('请输入内容').'}');
					if($results[0]['typename'] != $value){
						$pinyin = GetPinyin($value);
						$archives = $dsql->SetQuery("UPDATE `#@__$db` SET `typename` = '$value', `pinyin` = '$pinyin' WHERE `id` = ".$id);
						$results = $dsql->dsqlOper($archives, "update");
					}else{
						die('{"state": 101, "info": '.json_encode('无变化！').'}');
					}
				}else if($type == "pinyin") {
                    if ($results[0]['pinyin'] != $value) {
                        $archives = $dsql->SetQuery("UPDATE `#@__$db` SET `pinyin` = '$value' WHERE `id` = " . $id);
                        $results = $dsql->dsqlOper($archives, "update");
                    } else {
                        die('{"state": 101, "info": ' . json_encode('无变化！') . '}');
                    }
				}else if($type == "longitude") {
                    if ($results[0]['longitude'] != $value) {
                        $archives = $dsql->SetQuery("UPDATE `#@__$db` SET `longitude` = '$value' WHERE `id` = " . $id);
                        $results = $dsql->dsqlOper($archives, "update");
                    } else {
                        die('{"state": 101, "info": ' . json_encode('无变化！') . '}');
                    }
                }else{
                    if($results[0]['latitude'] != $value){
                        $archives = $dsql->SetQuery("UPDATE `#@__$db` SET `latitude` = '$value' WHERE `id` = ".$id);
                        $results = $dsql->dsqlOper($archives, "update");
                    }else{
                        die('{"state": 101, "info": '.json_encode('无变化！').'}');
                    }
                }


			}else{
				//天气代码
				if($type == "weather_code"){
					$archives = $dsql->SetQuery("UPDATE `#@__$db` SET `weather_code` = '$value' WHERE `id` = ".$id);

				//名称
				}else if($type == "name"){
					if($value == "") die('{"state": 101, "info": '.json_encode('请输入内容').'}');
					$value  = cn_substrR($value,30);
					$pinyin = GetPinyin($value);
					$archives = $dsql->SetQuery("UPDATE `#@__$db` SET `typename` = '$value', `pinyin` = '$pinyin' WHERE `id` = ".$id);

                //拼音
				}else if($type == "pinyin") {
                    $archives = $dsql->SetQuery("UPDATE `#@__$db` SET `pinyin` = '$value' WHERE `id` = " . $id);

                //经度
                }else if($type == "longitude") {
                    $archives = $dsql->SetQuery("UPDATE `#@__$db` SET `longitude` = '$value' WHERE `id` = " . $id);

                //纬度
                }else{
                    $archives = $dsql->SetQuery("UPDATE `#@__$db` SET `latitude` = '$value' WHERE `id` = ".$id);
                }
				$results  = $dsql->dsqlOper($archives, "update");
			}

			if($results != "ok"){
				die('{"state": 101, "info": '.json_encode('修改失败，请重试！').'}');
			}else{
				$title = $type == "weather_code" ? "城市天气ID" : "";
				adminLog("修改网站地区".$title, $value);
				die('{"state": 100, "info": '.json_encode('修改成功！').'}');
			}

		}else{
			die('{"state": 101, "info": '.json_encode('要修改的信息不存在或已删除！').'}');
		}
	}
	die;

//删除分类
}else if($dopost == "del"){
	if($id != ""){

		$idsArr = array();
		$idexp = explode(",", $id);

		//获取所有子级
		foreach ($idexp as $k => $id) {
			$childArr = $dsql->getTypeList($id, $db, 1);
			if(is_array($childArr)){
				global $data;
				$data = "";
				$idsArr = array_merge($idsArr, array_reverse(parent_foreach($childArr, "id")));
			}
			$idsArr[] = $id;
		}

		$archives = $dsql->SetQuery("DELETE FROM `#@__$db` WHERE `id` in (".join(",", $idsArr).")");
		$dsql->dsqlOper($archives, "update");

		$archives = $dsql->SetQuery("DELETE FROM `#@__domain` WHERE `iid` in (".join(",", $idsArr).")");
		$dsql->dsqlOper($archives, "update");

		$archives = $dsql->SetQuery("DELETE FROM `#@__site_city` WHERE `cid` in (".join(",", $idsArr).")");
		$dsql->dsqlOper($archives, "update");

		adminLog("删除网站地区", join(",", $idsArr));
		die('{"state": 100, "info": '.json_encode('删除成功！').'}');

	}
	die;

//更新信息分类
}else if($dopost == "typeAjax"){
	$data = str_replace("\\", '', $_POST['data']);
	if($data != ""){
		$json = json_decode($data);

		$json = objtoarr($json);

		$parentid = 0;
		$level = 1;
		if(!empty($vid)){
			$parentid = $vid;
			$level = 6;
        }elseif(!empty($tid)){
			$parentid = $tid;
			$level = 5;
        }elseif(!empty($did)){
			$parentid = $did;
			$level = 4;
		}elseif(!empty($cid)){
			$parentid = $cid;
			$level = 3;
		}elseif(!empty($pid)){
			$parentid = $pid;
			$level = 2;
		}

		$json = typeOpera($json, $parentid, $db, $level);
		echo $json;
	}
	die;
}

//导入默认数据
elseif($dopost == 'import'){

    $auth = (int)GetCookie('importDefaultArea');
    if(!$auth){
        ShowMsg('请通过后台网站地区设置页面点击导入！', '', 1);
        die;
    }

    //导入默认数据
    if (isset($_GET['import']) && $_GET['import'] == 1) {
        // ----------- 批量导入JSON到site_area -----------
        set_time_limit(0);
        header('Content-Type: application/json; charset=utf-8');
    
        $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
        $pagesize = 1000;
        $jsonFile = HUONIAOINC . '/data/default_area_data.json';
    
        if (!file_exists($jsonFile)) {
            echo json_encode(['error' => '数据文件不存在']);
            exit;
        }

        //坐标转换
        $Coordinate = new Coordinate();

        //系统目前在用的地图平台，1:google 2:baidu 4:amap 5:tmap
        global $cfg_map;
    
        $data = json_decode(file_get_contents($jsonFile), true);
        $total = count($data);
    
        // 第一次导入时清空表并重置自增
        if ($page == 1) {
            $sql = $dsql->SetQuery("TRUNCATE TABLE `#@__site_area`");
            $dsql->dsqlOper($sql, "update");

            //删除域名和分站表中城市分站的数据
            $archives = $dsql->SetQuery("DELETE FROM `#@__domain` WHERE `part` = 'city'");
            $dsql->dsqlOper($archives, "update");

            $archives = $dsql->SetQuery("DELETE FROM `#@__site_city`");
            $dsql->dsqlOper($archives, "update");
        }
    
        $start = ($page - 1) * $pagesize;
        $batch = array_slice($data, $start, $pagesize);
    
        if (empty($batch)) {

            //删除cookie
            PutCookie('importDefaultArea', 0);
            adminLog("导入网站地区默认数据");

            echo json_encode([
                'total' => $total,
                'imported' => $total,
                'remaining' => 0,
                'done' => true
            ]);
            exit;
        }
    
        // 批量插入
        $values = [];
        foreach ($batch as $row) {
            // $row 是索引数组，按顺序插入
            $row = array_map('addslashes', $row);

            $lng = (float)$row[7];
            $lat = (float)$row[8];
            
            //默认是百度坐标，如果系统用的就是百度地图，则不需要转换
            if($cfg_map != 2){

                //google用的WGS-84
                if($cfg_map == 1){
                    $_coord = $Coordinate->bd09ToWgs84($lng, $lat);
                }
                //amap用的GCJ-02
                elseif($cfg_map == 4){
                    $_coord = $Coordinate->bd09ToGcj02($lng, $lat);
                }
                //tmap可以用WGS-84
                elseif($cfg_map == 5){
                    $_coord = $Coordinate->bd09ToWgs84($lng, $lat);
                }

                $lng = $_coord['lon'];
                $lat = $_coord['lat'];

            }

            $values[] = "(
                '{$row[0]}',
                '{$row[1]}',
                '{$row[2]}',
                '{$row[3]}',
                '{$row[4]}',
                '{$row[5]}',
                '{$row[6]}',
                '{$lng}',
                '{$lat}'
            )";
        }
        $sql = $dsql->SetQuery("INSERT INTO `#@__site_area` 
            (id, parentid, typename, weight, pinyin, level, weather_code, longitude, latitude)
            VALUES " . implode(',', $values));
        $dsql->dsqlOper($sql, "results");
    
        $imported = min($start + $pagesize, $total);
        $remaining = $total - $imported;

        //删除cookie
        if($imported >= $total){
            PutCookie('importDefaultArea', 0);
            adminLog("导入网站地区默认数据");
        }
    
        echo json_encode([
            'total' => $total,
            'imported' => $imported,
            'remaining' => $remaining,
            'done' => $imported >= $total
        ]);
        exit;
    }

?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>导入全国地区默认数据</title>
    <style>
        body {
            background: #f7f7f7;
            font-family: "Microsoft YaHei", Arial, sans-serif;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 480px;
            margin: 60px auto 0 auto;
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 12px rgba(0,0,0,0.08);
            padding: 32px 28px 50px 28px;
        }
        h2 {
            text-align: center;
            color: #333;
            margin-bottom: 28px;
            font-weight: 600;
        }
        #status {
            font-size: 18px;
            color: #444;
            background: #f2f6fc;
            border-radius: 6px;
            padding: 18px 16px;
            margin-top: 18px;
            min-height: 40px;
            box-sizing: border-box;
            text-align: center;
            transition: background 0.3s;
        }
        #status.success {
            background: #e6ffed;
            color: #1a7f37;
            border: 1px solid #b7eb8f;
        }
        .progress-bar {
            width: 100%;
            background: #e9ecef;
            border-radius: 6px;
            margin: 18px 0 0 0;
            height: 18px;
            overflow: hidden;
            position: relative;
        }
        .progress-bar-inner {
            height: 100%;
            background: linear-gradient(90deg, #409eff 0%, #66b1ff 100%);
            width: 0;
            transition: width 0.4s;
            position: absolute;
            left: 0; top: 0;
        }
        .progress-bar-text {
            position: absolute;
            width: 100%;
            height: 100%;
            left: 0; top: 0;
            text-align: center;
            line-height: 18px;
            font-size: 14px;
            color: #333;
            font-weight: bold;
            pointer-events: none;
            z-index: 2;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>正在导入全国地区默认数据</h2>
        <div id="status">准备导入，请稍候...</div>
        <div class="progress-bar">
            <div class="progress-bar-inner" id="progressBar"></div>
            <div class="progress-bar-text" id="progressText">0%</div>
        </div>
    </div>
    <script>
    let page = 1;
    let total = 0;
    let imported = 0;
    function importBatch() {
        fetch('?dopost=import&import=1&page=' + page)
            .then(response => response.json())
            .then(data => {
                total = data.total;
                imported = data.imported;
                let percent = total > 0 ? Math.round(imported / total * 100) : 0;
                document.getElementById('status').innerHTML = 
                    `总数：<b>${data.total}</b>，已导入：<b>${data.imported}</b>，剩余：<b>${data.remaining}</b>`;
                document.getElementById('progressBar').style.width = percent + "%";
                document.getElementById('progressText').innerText = percent + "%";
                if (data.done) {
                    document.getElementById('status').innerHTML += "<br><span style='color:#1a7f37;font-weight:bold;'>导入完成！</span>";
                    document.getElementById('status').classList.add('success');
                    document.getElementById('progressBar').style.background = "linear-gradient(90deg, #67c23a 0%, #b7eb8f 100%)";
                } else {
                    page++;
                    setTimeout(importBatch, 500); // 递归调用，继续下一批
                }
            });
    }
    importBatch();
    </script>
</body>
</html>
<?php
die;
}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/jquery.dragsort-0.5.1.min.js',
		'ui/jquery-ui-sortable.js',
		'admin/siteConfig/siteAddr.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('action', $action);

    $areaName_0 = $cfg_areaName_0 ?: '省份';
    $areaName_1 = $cfg_areaName_1 ?: '城市';
    $areaName_2 = $cfg_areaName_2 ?: '区县';
    $areaName_3 = $cfg_areaName_3 ?: '乡镇';
    $areaName_4 = $cfg_areaName_4 ?: '村庄';
    $areaName_5 = $cfg_areaName_5 ?: '自定义';

    $huoniaoTag->assign('areaName', array($areaName_0, $areaName_1, $areaName_2, $areaName_3, $areaName_4, $areaName_5));


	//省
	$province = $dsql->getTypeList(0, $db, false);
	$huoniaoTag->assign('province', $province);
	$listArr = $province;

	$pid = (int)$pid;
	$pname = "--$areaName_0--";
	$huoniaoTag->assign('pid', $pid);
	if($pid){
		$archives = $dsql->SetQuery("SELECT `typename` FROM `#@__$db` WHERE `id` = ".$pid);
		$results = $dsql->dsqlOper($archives, "results");
		if($results){
			$pname = $results[0]['typename'];
		}

		//市
		$city = $dsql->getTypeList($pid, $db, false);
		$huoniaoTag->assign('city', $city);
		$listArr = $city;
	}
	$huoniaoTag->assign('pname', $pname);


	//市
	$cid = (int)$cid;
	$cname = "--$areaName_1--";
	if($cid){
		$archives = $dsql->SetQuery("SELECT `typename` FROM `#@__$db` WHERE `id` = ".$cid);
		$results = $dsql->dsqlOper($archives, "results");
		if($results){
			$cname = $results[0]['typename'];
		}

		//州县
		$district = $dsql->getTypeList($cid, $db, false);
		$huoniaoTag->assign('district', $district);
		$listArr = $district;
	}
	$huoniaoTag->assign('cid', $cid);
	$huoniaoTag->assign('cname', $cname);


	//区县
	$did = (int)$did;
	$dname = "--$areaName_2--";
	if($did){
		$archives = $dsql->SetQuery("SELECT `typename` FROM `#@__$db` WHERE `id` = ".$did);
		$results = $dsql->dsqlOper($archives, "results");
		if($results){
			$dname = $results[0]['typename'];
		}

		//城镇
		$town = $dsql->getTypeList($did, $db, false);
		$huoniaoTag->assign('town', $town);
		$listArr = $town;
	}
	$huoniaoTag->assign('did', $did);
	$huoniaoTag->assign('dname', $dname);


	//乡镇
	$tid = (int)$tid;
	$tname = "--$areaName_3--";
	if($tid){
		$archives = $dsql->SetQuery("SELECT `typename` FROM `#@__$db` WHERE `id` = ".$tid);
		$results = $dsql->dsqlOper($archives, "results");
		if($results){
			$tname = $results[0]['typename'];
		}

		//自定义
		$village = $dsql->getTypeList($tid, $db, false);
		$huoniaoTag->assign('village', $village);
		$listArr = $village;
	}
	$huoniaoTag->assign('tid', $tid);
	$huoniaoTag->assign('tname', $tname);


	//村庄
	$vid = (int)$vid;
	$vname = "--$areaName_4--";
	if($vid){
		$archives = $dsql->SetQuery("SELECT `typename` FROM `#@__$db` WHERE `id` = ".$vid);
		$results = $dsql->dsqlOper($archives, "results");
		if($results){
			$vname = $results[0]['typename'];
		}

		//自定义
		$custom = $dsql->getTypeList($vid, $db, false);
		$listArr = $custom;
	}
	$huoniaoTag->assign('vid', $vid);
	$huoniaoTag->assign('vname', $vname);

	$huoniaoTag->assign('typeListArr', json_encode($listArr));


	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/siteConfig";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}



function typeOpera($arr, $pid = 0, $db, $level){
	global $dsql;

	if (!is_array($arr) && $arr != NULL) {
		return '{"state": 200, "info": "保存失败！"}';
	}
	for($i = 0; $i < count($arr); $i++){
		$id = $arr[$i]["id"];
		$name = $arr[$i]["name"];
		$pinyin = $arr[$i]["pinyin"];
		$weather = $arr[$i]["weather"];
		$pinyin = $pinyin ? $pinyin : GetPinyin($name);
        $longitude = $arr[$i]["longitude"];
        $latitude = $arr[$i]["latitude"];

		//如果ID为空则向数据库插入下级分类
		if($id == "" || $id == 0){
			$archives = $dsql->SetQuery("INSERT INTO `#@__".$db."` (`parentid`, `typename`, `pinyin`, `level`, `weather_code`, `weight`, `longitude`, `latitude`) VALUES ('$pid', '$name', '$pinyin', '$level', '$weather', '$i', '$longitude', '$latitude')");
			$id = $dsql->dsqlOper($archives, "lastid");

			adminLog("添加网站地区", $name);
		}
		//其它为数据库已存在的分类需要验证名称或天气ID是否有改动，如果有改动则UPDATE
		else{
			$archives = $dsql->SetQuery("SELECT `typename`, `weather_code`, `weight`, `longitude`, `latitude` FROM `#@__".$db."` WHERE `id` = ".$id);
			$results = $dsql->dsqlOper($archives, "results");
			if(!empty($results)){
				//验证名称
				if($results[0]["typename"] != $name || $results[0]["pinyin"] != $pinyin){
					$archives = $dsql->SetQuery("UPDATE `#@__".$db."` SET `typename` = '$name', `pinyin` = '$pinyin' WHERE `id` = ".$id);
					$dsql->dsqlOper($archives, "update");

					adminLog("修改网站地区名称", $name);
				}
				//验证分类名
				if($results[0]["weather_code"] != $weather){
					$archives = $dsql->SetQuery("UPDATE `#@__".$db."` SET `weather_code` = '$weather' WHERE `id` = ".$id);
					$dsql->dsqlOper($archives, "update");

					adminLog("修改网站地区城市天气ID", $name."=>".$weather);
				}

                //验证分类名
                if(($results[0]["longitude"] != $longitude) || ($results[0]["latitude"] != $latitude)){
                    $archives = $dsql->SetQuery("UPDATE `#@__".$db."` SET `longitude` = '$longitude', `latitude` = '$latitude' WHERE `id` = ".$id);
                    $dsql->dsqlOper($archives, "update");

                    adminLog("修改网站地区经纬度", $name."=>".$weather);
                }

				//验证排序
				if($results[0]["weight"] != $i){
					$archives = $dsql->SetQuery("UPDATE `#@__".$db."` SET `weight` = '$i' WHERE `id` = ".$id);
					$dsql->dsqlOper($archives, "update");

					adminLog("修改网站地区排序", $name."=>".$i);
				}


			}
		}
	}
	return '{"state": 100, "info": "保存成功！"}';
}
