<?php
/**
 * 数据库备份/还原
 *
 * @version        $Id: dbData.php 2013-11-27 下午16:10:02 $
 * @package        HuoNiao.DB
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
if($action != "dorevert"){
	checkPurview("dbData");
}
$dsql = new dsql($dbo);
$tpl  = dirname(__FILE__)."/../templates/siteConfig";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "dbData.html";
$bkdir     = HUONIAODATA.'/backup/';

//跳转到一下页的JS
$gotojs = "\r\nfunction GotoNextPage(){
    document.gonext."."submit();
}"."\r\nset"."Timeout('GotoNextPage()',500);";

$dojs = "<script language='javascript'>$gotojs\r\n</script>";

$action = $_GET['action'];

//获取数据表
if($action == "getTables"){
	echo json_encode($dsql->getTables());die;

//数据库优化
}elseif($action == "opimize"){
	$tables = $_POST['tables'];
	$err = array();
	if($tables != ""){
		foreach($tables as $tab => $tbname){
			if(!$dsql->optimizeTables($tbname)){
				array_push($err, $tbname);
			};
		}

		if(!empty($err)){
			echo '{"state": 100, "info": '.json_encode('所选数据表优化完成，其中：'.join(",", $err).' 优化失败！').'}';
		}else{
			echo '{"state": 100, "info": '.json_encode('所选数据表优化成功！').'}';
		}
	}
	die;

//数据库修复
}elseif($action == "repair"){
	$tables = $_POST['tables'];
	$err = array();
	if($tables != ""){
		foreach($tables as $tab => $tbname){
			if(!$dsql->repairTables($tbname)){
				array_push($err, $tbname);
			};
		}

		if(!empty($err)){
			echo '{"state": 100, "info": '.json_encode('所选数据表修复完成，其中：'.join(",", $err).' 优化失败！').'}';
		}else{
			echo '{"state": 100, "info": '.json_encode('所选数据表修复成功！').'}';
		}
	}
	die;

//数据库备份
}elseif($action == "dodata"){
    ini_set('memory_limit', '1024M');
  
	$tablearr = $_POST['tables'];
	$isstruct = $_POST['isstruct'];
	$startpos = $_POST['startpos'];
	$nowtable = $_POST['nowtable'];
	$fsize    = $_POST['fsize'];
	$strlength = (int)$_POST['strlength'];
	$dirname  = $_POST['dirname'];
	$volume   = $_POST['volume'];

	if(empty($tablearr)){
        ShowMsg('你没选中任何表！', 'dbData.php?action=data');
        exit();
    }

	if(is_array($tablearr)){
		$tablearr = join(",", $tablearr);
	}

    //初始化使用到的变量
    $tables = explode(',', $tablearr);
    if(!isset($isstruct)){
        $isstruct = 0;
    }
    if(!isset($startpos)){
        $startpos = 0;
    }
    if(!isset($volume)){
        $volume = 1;
    }
    if(empty($nowtable)){
        $nowtable = '';
    }
    if(empty($fsize)){
        $fsize = 2048;
    }
    $fsizeb = $fsize * 1000;
	if(empty($dirname)){
        $dirname = date('ymd_') . create_check_code(6);
    }

    //第一页的操作
    if($nowtable==''){
        $tmsg = '';

		if(!mkdir($bkdir.$dirname, 0777, true)){
			ShowMsg('备份文件夹创建失败，请检查备份文件夹是否有写入权限！', '', 1);
        	exit();
		}

        if($isstruct==1){
            $bkfile = $bkdir.$dirname."/table.sql";
            $fp = fopen($bkfile, "w");
            foreach($tables as $t){
                fwrite($fp, "DROP TABLE IF EXISTS `$t`;\r\n");

				$results = $dsql->dsqlOper("SHOW CREATE TABLE ".$GLOBALS['DB_NAME'].".".$t, "results", "NUM");
				$row = $results[0];

                //去除AUTO_INCREMENT
                $row[1] = preg_replace("#AUTO_INCREMENT=([0-9]{1,})[ \r\n\t]{1,}#i", "", $row[1]);

				$eng1 = "#ENGINE=MyISAM DEFAULT CHARSET={$GLOBALS['DB_CHARSET']}#i";

				$tableStruct = preg_replace("/TYPE=MyISAM/", $eng1, $row[1]);

                fwrite($fp,''.$tableStruct.";\r\n\r\n");

            }
            fclose($fp);
            $tmsg .= "备份数据表结构信息完成...<br />";
        }
        $tmsg .= "<font color='red'>正在进行数据备份的初始化工作，请稍后...</font>";
        $doneForm  = "<form name='gonext' method='post' action='dbData.php?action=dodata'>\r\n";
        $doneForm .= "  <input type='hidden' name='isstruct' value='$isstruct' />\r\n";
        $doneForm .= "  <input type='hidden' name='fsize' value='$fsize' />\r\n";
        $doneForm .= "  <input type='hidden' name='tables' value='$tablearr' />\r\n";
        $doneForm .= "  <input type='hidden' name='nowtable' value='{$tables[0]}' />\r\n";
        $doneForm .= "  <input type='hidden' name='startpos' value='0' />\r\n";
        $doneForm .= "  <input type='hidden' name='dirname' value='$dirname' />\r\n";
		$doneForm .= "  <input type='hidden' name='volume' value='$volume' />\r\n</form>\r\n{$dojs}";
        PutInfo($tmsg, $doneForm);
        exit();

	//执行分页备份
    }else{
		$j = 0;
		$fs = array();
		$bakStr = '';

		//分析表里的字段信息
		$intable = "INSERT INTO `$nowtable` VALUES(";
		$status = $dsql->getTableFields($nowtable);
		foreach($status as $key => $r){
			$fs[$j] = $r;
			$j++;
        }
		$fsd = $j-1;

		//读取表的内容
		$m = 0;
		$bakfilename = $bkdir.$dirname."/".$dirname."-".$volume.".sql";
		$results = $dsql->dsqlOper("SELECT * FROM `$nowtable` ", "results");
		foreach($results as $key => $row2){
			if($m < $startpos){
				$m++;
				continue;
			}

            //检测数据是否达到规定大小
						//$files = (int)@filesize($bakfilename);
            if($strlength + strlen($bakStr) + 500 >= ($fsizeb * ($volume + 1))){
            		$volume++;

                $fp = fopen($bakfilename,"a");
                fwrite($fp,$bakStr);
                fclose($fp);


				$nbfb = 0;
				for($i=0; $i<count($tables); $i++){
					if($tables[$i] == $nowtable){
						$nbfb = $i;
						break;
					}
				}

                $tmsg  = "<div class='progress progress-striped active' style='width:400px; margin:10px auto;'><div class='bar' style='width: ".round(($nbfb/count($tables))*100)."%;'>".$nbfb."/".count($tables)."</div></div>\r\n";
				$tmsg .= "<font color='green'>完成到{$m}条记录的备份，继续备份：{$nowtable}</font>\r\n";
                $doneForm  = "<form name='gonext' method='post' action='dbData.php?action=dodata'>\r\n";
                $doneForm .= "  <input type='hidden' name='isstruct' value='$isstruct' />\r\n";
                $doneForm .= "  <input type='hidden' name='fsize' value='$fsize' />\r\n";
                $doneForm .= "  <input type='hidden' name='tables' value='$tablearr' />\r\n";
                $doneForm .= "  <input type='hidden' name='nowtable' value='$nowtable' />\r\n";
                $doneForm .= "  <input type='hidden' name='startpos' value='$m' />\r\n";
        $doneForm .= "  <input type='hidden' name='strlength' value='".($strlength+strlen($bakStr))."'>\r\n";
				$doneForm .= "  <input type='hidden' name='dirname' value='$dirname' />\r\n";
				$doneForm .= "  <input type='hidden' name='volume' value='$volume' />\r\n</form>\r\n{$dojs}";
                PutInfo($tmsg,$doneForm);
                exit();
            }

            //正常情况
            $line = $intable;
            for($j=0; $j<=$fsd; $j++){
                if($j < $fsd){
                    $line .= "'".RpLine(addslashes($row2[$fs[$j]]))."',";
                }else{
                    $line .= "'".RpLine(addslashes($row2[$fs[$j]]))."');\r\n";
                }
            }
            $m++;
            $bakStr .= $line;
        }

        //如果数据比卷设置值小
        if($bakStr!=''){
            $fp = fopen($bakfilename,"a");
            fwrite($fp,$bakStr);
            fclose($fp);
        }

		$nbfb = 0;
        for($i=0; $i<count($tables); $i++){
            if($tables[$i] == $nowtable){
                if(isset($tables[$i+1])){
                    $nowtable = $tables[$i+1];
                    $startpos = 0;
					//$volume = 1;
					$nbfb = $i;
                    break;
                }else{
					adminLog("备份数据库", $dirname);
					ShowMsg('完成所有数据备份！', 'dbData.php?action=data');
                    exit();
                }
            }
        }

		$tmsg  = "<div class='progress progress-striped active' style='width:400px; margin:10px auto;'><div class='bar' style='width: ".round(($nbfb/count($tables))*100)."%;'>".$nbfb."/".count($tables)."</div></div>\r\n";
        $tmsg .= "<font color='green'>完成到{$m}条记录的备份，继续备份：{$nowtable}</font>\r\n";
        $doneForm  = "<form name='gonext' method='post' action='dbData.php?action=dodata'>\r\n";
        $doneForm .= "  <input type='hidden' name='isstruct' value='$isstruct' />\r\n";
        $doneForm .= "  <input type='hidden' name='fsize' value='$fsize' />\r\n";
        $doneForm .= "  <input type='hidden' name='tables' value='$tablearr' />\r\n";
        $doneForm .= "  <input type='hidden' name='nowtable' value='$nowtable' />\r\n";
        $doneForm .= "  <input type='hidden' name='startpos' value='$startpos'>\r\n";
        $doneForm .= "  <input type='hidden' name='strlength' value='".($strlength+strlen($bakStr))."'>\r\n";
		$doneForm .= "  <input type='hidden' name='dirname' value='$dirname' />\r\n";
		$doneForm .= "  <input type='hidden' name='volume' value='$volume' />\r\n</form>\r\n{$dojs}";
        PutInfo($tmsg,$doneForm);
        exit();
    }
    //分页备份代码结束

//加载备份列表
}elseif($action == "getrevert"){
	$floder = array();
	foreach(listDir($bkdir, "time") as $key => $dir){
		$volume = 0;
		$type = "数据";
		foreach(listFile($bkdir.$dir) as $v => $file){
			if(strpos($file, "table.sql") !== false){
				$type = "数据 和 结构";
			}
			if(strpos($file, $dir) !== false){
				$volume++;
			}
			$juan = str_replace(".sql", "", str_replace($dir."-", "", $file));
			$floder[$key]['file'][$v]['name'] = $file;
			$floder[$key]['file'][$v]['type'] = $juan == "table" ? "结构" : "数据";
			$floder[$key]['file'][$v]['size'] = sizeFormat(filesize($bkdir.$dir."/".$file));
			$floder[$key]['file'][$v]['date'] = date('Y-m-d H:i:s', filectime($bkdir.$dir."/".$file));
			$floder[$key]['file'][$v]['volume'] = $juan == "table" ? "" : $juan;

		}
		$info = getFolderSize($bkdir.$dir);
		$floder[$key]['name'] = $dir;
		$floder[$key]['type'] = $type;
		$floder[$key]['size'] = sizeFormat($info['size']);
		$floder[$key]['volume'] = $volume;
		$floder[$key]['date'] = date('Y-m-d H:i:s', filectime($bkdir.$dir));
	}
	echo json_encode($floder);
	die;

//删除备份
}elseif($action == "delRevert"){
	if(empty($_POST['floder'])){
		echo '{"state": 200, "info": '.json_encode("请选择要删除的备份文件！").'}';
        exit();
	}
	$floder = explode(",", $_POST['floder']);
	$err = array();
	foreach($floder as $key => $f){
		if(!deldir($bkdir.$f)){
			array_push($err, $f);
		};
	}
	if(!empty($err)){
		echo '{"state": 200, "info": '.json_encode(join(",", $err)."<br />删除失败，请检查权限或文件夹是否存在！").'}';
	}else{
		echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
	}
	adminLog("删除备份数据库", $_POST['floder']);
	die;

//数据库还原
}elseif($action == "dorevert"){
	$floder = $_POST['floder'];
	if($floder == "") die;
	if(strpos($floder, ".sql") === false){
		$files = array();
		foreach(listFile($bkdir.$floder) as $v => $file){
			if(strpos($file, "table.sql") !== false){
				$structfile = $bkdir.$floder."/table.sql";
			}else{
				array_push($files, $file);
			}
		}
		$bakfiles = join(",", $files);
	}else{
		$bakfiles = $floder;
	}

	if($bakfiles==''){
        ShowMsg('没指定任何要还原的文件!', 'dbData.php?action=revert');
        exit();
    }
    $bakfilesTmp = $bakfiles;
    $bakfiles = explode(',', $bakfiles);

    if(empty($structfile)){
        $structfile = "";
    }
    if(empty($startgo)){
        $startgo = 0;
    }
    if($startgo == 0 && $structfile != ''){
        $tbdata = '';
        $fp = fopen("$structfile", 'r');
        while(!feof($fp)){
            $tbdata .= fgets($fp, 1024);
        }
        fclose($fp);
        $querys = explode(';', $tbdata);

        foreach($querys as $q){
			$dsql->dsqlOper(trim($q).';', "update");
        }
        $tmsg = "<font color='red'>完成数据表信息还原，准备还原数据...</font>\r\n";
        $doneForm  = "<form name='gonext' method='post' action='dbData.php?action=dorevert'>\r\n";
        $doneForm .= "  <input type='hidden' name='startgo' value='1' />\r\n";
        $doneForm .= "  <input type='hidden' name='floder' value='$bakfilesTmp' />\r\n</form>\r\n{$dojs}";
        PutInfo($tmsg, $doneForm);
        exit();

    }else{
        $nowfile = $bakfiles[0];
        $bakfilesTmp = preg_replace("#".$nowfile."[,]{0,1}#", "", $bakfilesTmp);
        $oknum = 0;
        if( filesize($bkdir.substr($floder, 0, 13)."/$nowfile") > 0 ){
            $fp = fopen($bkdir.substr($floder, 0, 13)."/$nowfile", 'r');
            while(!feof($fp)){
                $line = trim(fgets($fp, 512*1024));
                if($line=="") continue;
                if($dsql->dsqlOper($line, "update")) $oknum++;
            }
            fclose($fp);
        }
        if($bakfilesTmp==""){
			adminLog("还原数据库", substr($floder, 0, 13));
            ShowMsg('成功还原所有的文件的数据!', 'dbData.php?action=revert');
            exit();
        }

		$nbfb = explode(".", $nowfile);
		$nbfb = explode("-", $nbfb[0]);
		$nbfb = (int)$nbfb[1];

		$tfiles = count($bakfiles);
		$tfiles = $bakfiles[$tfiles-1];
		$tfiles = explode(".", $tfiles);
		$tfiles = explode("-", $tfiles[0]);
		$tfiles = (int)$tfiles[1];

		$tmsg  = "<div class='progress progress-striped active' style='width:400px; margin:10px auto;'><div class='bar' style='width: ".round(($nbfb/$tfiles)*100)."%;'>".$nbfb."/".$tfiles."</div></div>\r\n";
        $tmsg .= "<font color='green'>成功还原{$nowfile}的{$oknum}条记录</font><br/>正在准备还原其它数据...\r\n";
        $doneForm  = "<form name='gonext' method='post' action='dbData.php?action=dorevert'>\r\n";
        $doneForm .= "  <input type='hidden' name='startgo' value='1' />\r\n";
        $doneForm .= "  <input type='hidden' name='floder' value='$bakfilesTmp' />\r\n</form>\r\n{$dojs}";
        PutInfo($tmsg, $doneForm);
        exit();
    }
}

function PutInfo($msg1,$msg2){
	$htmlhead  = "<html>\r\n<head>\r\n<title>温馨提示</title>\r\n";
	$htmlhead .= "<meta http-equiv=\"Content-Type\" content=\"text/html; charset=".$GLOBALS['cfg_soft_lang']."\" />\r\n";
	$htmlhead .= "<link rel='stylesheet' rel='stylesheet' href='".HUONIAOADMIN."/../static/css/admin/bootstrap.css?v=4' />";
	$htmlhead .= "<link rel='stylesheet' rel='stylesheet' href='".HUONIAOADMIN."/../static/css/admin/common.css?v=1111' />";
    $htmlhead .= "<base target='_self'/>\r\n</head>\r\n<body>\r\n";
    $htmlfoot  = "</body>\r\n</html>";
	$rmsg  = "<div class='s-tip'><div class='s-tip-head'><h1>".$GLOBALS['cfg_soft_enname']." 提示：</h1></div>\r\n";
    $rmsg .= "<div class='s-tip-body'>".str_replace("\"","“",$msg1)."\r\n".$msg2."\r\n";
    $msginfo = $htmlhead.$rmsg.$htmlfoot;
    echo $msginfo;
}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/jquery-ui-selectable.js',
		'admin/siteConfig/dbData.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$dirname = date('ymd_') . create_check_code(6);
	$huoniaoTag->assign('dirname', $dirname);


	//获取所有频道
	$handler = true;
	$moduleArr = array();
	$config_path = HUONIAOINC."/config/";

	$sql = $dsql->SetQuery("SELECT `title`, `subject`, `name` FROM `#@__site_module` WHERE `state` = 0 AND `type` = 0 ORDER BY `weight`, `id`");
	$result = $dsql->dsqlOper($sql, "results");
	if($result){
		foreach ($result as $key => $value) {
			if(!empty($value['name'])){
				$moduleArr[] = array(
					"name" => $value['name'],
					"title" => $value['subject'] ? $value['subject'] : $value['subject']
				);
			}
		}
	}
	$huoniaoTag->assign('moduleArr', $moduleArr);

	$huoniaoTag->assign('action', ($action == "" ? "data" : $action));
	$huoniaoTag->assign('DB_PREFIX', $DB_PREFIX);
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/siteConfig";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
