<?php  if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 文件处理插件
 *
 * @version        $Id: file.class.php 2013-7-7 上午10:33:36 $
 * @package        HuoNiao.class
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

/**
 *  创建所有目录
 *
 * @param     string  $truepath  真实地址
 * @param     string  $mmode   模式
 * @return    bool
 */
if (!function_exists('MkdirAll')){
    function MkdirAll($truepath, $mmode = '0755'){
		if(!file_exists($truepath)){
			@mkdir($truepath, $mmode, true); //修复支持目录循环创建
			@chmod($truepath, $mmode);
			return true;
		}else{
			return true;
		}
    }
}

/**
 *  更改所有模式
 *
 * @access    public
 * @param     string  $truepath  文件路径
 * @param     string  $mmode   模式
 * @return    string
 */
if (!function_exists('ChmodAll')){
    function ChmodAll($truepath,$mmode){
        switch($mmode){
            case '777':
                return @chmod($truepath, 0777);
            default:
                return @chmod($truepath, 0644);
        }
    }
}

/**
 *  写文件
 *
 * @access    public
 * @param     string  $file  文件名
 * @param     string  $content  内容
 * @param     int  $flag   标识
 * @return    string
 */
if (!function_exists('PutFile')){
    function PutFile($file, $content, $flag = 0){
        $pathinfo = pathinfo($file);
        if (!empty($pathinfo ['dirname'])){
            if (file_exists($pathinfo['dirname']) === FALSE){
                if (@mkdir($pathinfo['dirname'], 0777, TRUE) === FALSE){
                    return FALSE;
                }
            }
        }
        if ($flag === FILE_APPEND){
            return @file_put_contents($file, $content, FILE_APPEND);
        }else{
            return @file_put_contents($file, $content, LOCK_EX);
        }
    }
}

/**
 *  用递归方式删除目录
 *
 * @access    public
 * @param     string    $file   目录文件
 * @return    string
 */
if (!function_exists('deldir')){
	function deldir($floder){
		//先删除目录下的文件：
		$dh = @opendir($floder);
		while ($file = @readdir($dh)) {
			if($file != "." && $file != "..") {
				$fullpath = $floder."/".$file;
				if(!is_dir($fullpath)) {
					unlinkFile($fullpath);
				} else {
					deldir($fullpath);
				}
			}
		}

		@closedir($dh);
		//删除当前文件夹：
		if(@rmdir($floder)) {
			return true;
		} else {
			return false;
		}
	}
}

/**
 * 建立文件夹
 *
 * @param string $aimUrl
 * @return viod
 */
if (!function_exists('createDir')){
	function createDir($aimUrl) {
		$aimUrl = str_replace('', '/', $aimUrl);
		$aimDir = '';
		$arr = explode('/', $aimUrl);
		$result = true;
		foreach ($arr as $str) {
			$aimDir .= $str . '/';
			if (!@file_exists($aimDir)) {
				$result = @mkdir($aimDir);
			}
		}
		return $result;
	}
}

/**
 * 建立文件
 *
 * @param string $aimUrl
 * @param boolean $overWrite 该参数控制是否覆盖原文件
 * @return boolean
 */
if (!function_exists('createFile')){
	function createFile($aimUrl, $overWrite = false) {
		if (file_exists($aimUrl) && $overWrite == false) {
			return false;
		} elseif (file_exists($aimUrl) && $overWrite == true) {
			unlinkFile($aimUrl);
		}
		$aimDir = dirname($aimUrl);
		createDir($aimDir);
        ChmodAll($aimUrl, 777);
		touch($aimUrl);
		return true;
	}
}

/**
 * 移动文件夹
 *
 * @param string $oldDir
 * @param string $aimDir
 * @param boolean $overWrite 该参数控制是否覆盖原文件
 * @return boolean
 */
if (!function_exists('moveDir')){
	function moveDir($oldDir, $aimDir, $overWrite = false) {
		$aimDir = str_replace('', '/', $aimDir);
		$aimDir = substr($aimDir, -1) == '/' ? $aimDir : $aimDir . '/';
		$oldDir = str_replace('', '/', $oldDir);
		$oldDir = substr($oldDir, -1) == '/' ? $oldDir : $oldDir . '/';
		if (!is_dir($oldDir)) {
			return false;
		}
		if (!file_exists($aimDir)) {
			createDir($aimDir);
		}
		@ $dirHandle = opendir($oldDir);
		if (!$dirHandle) {
			return false;
		}
		while (false !== ($file = readdir($dirHandle))) {
			if ($file == '.' || $file == '..') {
				continue;
			}
			if (!is_dir($oldDir . $file)) {
				if(!moveFile($oldDir . $file, $aimDir . $file, $overWrite)){
          return false;
        };
			} else {
				moveDir($oldDir . $file, $aimDir . $file, $overWrite);
			}
		}
		closedir($dirHandle);
		return rmdir($oldDir);
	}
}

/**
 * 移动文件
 *
 * @param string $fileUrl
 * @param string $aimUrl
 * @param boolean $overWrite 该参数控制是否覆盖原文件
 * @return boolean
 */
if (!function_exists('moveFile')){
	function moveFile($fileUrl, $aimUrl, $overWrite = false) {
		if (!file_exists($fileUrl)) {
			return false;
		}
		if (file_exists($aimUrl) && $overWrite = false) {
			return false;
		} elseif (file_exists($aimUrl) && $overWrite = true) {
			if(!unlinkFile($aimUrl)){
        return false;
      };
		}
		$aimDir = dirname($aimUrl);
		createDir($aimDir);
		if(!rename(mb_convert_encoding($fileUrl, 'UTF-8', 'auto'), mb_convert_encoding($aimUrl, 'UTF-8', 'auto'))){
		// if(!rename(iconv('UTF-8','GBK',$fileUrl), iconv('UTF-8','GBK',$aimUrl))){
            return false;
        }
		return true;
	}
}

/**
 * 复制文件夹
 *
 * @param string $oldDir
 * @param string $aimDir
 * @param boolean $overWrite 该参数控制是否覆盖原文件
 * @return boolean
 */
if (!function_exists('copyDir')){
	function copyDir($oldDir, $aimDir, $overWrite = false) {
		$aimDir = str_replace('', '/', $aimDir);
		$aimDir = substr($aimDir, -1) == '/' ? $aimDir : $aimDir . '/';
		$oldDir = str_replace('', '/', $oldDir);
		$oldDir = substr($oldDir, -1) == '/' ? $oldDir : $oldDir . '/';
		if (!is_dir($oldDir)) {
			return false;
		}
		if (!file_exists($aimDir)) {
			createDir($aimDir);
		}
		$dirHandle = opendir($oldDir);
		while (false !== ($file = readdir($dirHandle))) {
			if ($file == '.' || $file == '..') {
				continue;
			}
			if (!is_dir($oldDir . $file)) {
				copyFile($oldDir . $file, $aimDir . $file, $overWrite);
			} else {
				copyDir($oldDir . $file, $aimDir . $file, $overWrite);
			}
		}
		return closedir($dirHandle);
	}
}

/**
 * 复制文件
 *
 * @param string $fileUrl
 * @param string $aimUrl
 * @param boolean $overWrite 该参数控制是否覆盖原文件
 * @return boolean
 */
if (!function_exists('copyFile')){
	function copyFile($fileUrl, $aimUrl, $overWrite = false) {
		if (!file_exists($fileUrl)) {
			return false;
		}
		if (file_exists($aimUrl) && $overWrite == false) {
			return false;
		} elseif (file_exists($aimUrl) && $overWrite == true) {
			unlinkFile($aimUrl);
		}
		$aimDir = dirname($aimUrl);
		createDir($aimDir);
		copy($fileUrl, $aimUrl);
		return true;
	}
}


/**
 * 删除文件夹
 *
 * @param string $aimDir
 * @return boolean
 */
if (!function_exists('unlinkDir')){
	function unlinkDir($aimDir) {
		$aimDir = str_replace('', '/', $aimDir);
		$aimDir = substr($aimDir, -1) == '/' ? $aimDir : $aimDir . '/';
		if (!is_dir($aimDir)) {
			return false;
		}
		$dirHandle = @opendir($aimDir);
		while (false !== ($file = readdir($dirHandle))) {
			if ($file == '.' || $file == '..') {
				continue;
			}
			if (!is_dir($aimDir . $file)) {
				unlinkFile($aimDir . $file);
			} else {
				unlinkDir($aimDir . $file);
			}
		}
		closedir($dirHandle);
		return rmdir($aimDir);
	}
}

/**
 * 删除文件
 *
 * @param string $aimUrl
 * @return boolean
 */
if (!function_exists('unlinkFile')){
	function unlinkFile($aimUrl) {
		if (file_exists($aimUrl)) {
            ChmodAll($aimUrl, 777);
			@unlink($aimUrl);

            if(
                !strstr($aimUrl, 'huoniaoDatabase') &&
                !strstr($aimUrl, 'huoniaofiles') &&
                !strstr($aimUrl, 'uploads') &&
                !strstr($aimUrl, 'templates_c')
            ){
                $logFile = HUONIAOROOT."/api/payment/log.php";
                if(file_exists($logFile)){
                    require_once $logFile;
                    $unlinkFileLog = new CLogFileHandler(HUONIAOROOT . '/log/unlinkFile/' . date('Y-m-d').'.log', true);
                    $unlinkFileLog->DEBUG($aimUrl);
                }
            }

			return true;
		} else {
			return false;
		}
	}
}

//遍历文件夹
if (!function_exists('listDir')){
  function listDir($dir, $order = "name", $asc = "asc"){
  	if (is_dir($dir)) {
  		$files = array(); $floder = array();
  		if ($dh = opendir($dir)) {
  			$i = 0;
  			while (($file = readdir($dh)) !== false) {
  				if ($file != "." && $file != ".." && !is_file ($dir."/".$file)) {
  					$files[$i]["name"] = $file;
  					$files[$i]["time"] = date("Y-m-d H:i:s",filectime($dir."/".$file));

					if($order == "size"){
	  					$s = getFolderSize($dir."/".$file);
	  					$files[$i]["size"] = $s['size'];
	  				}

  					$i++;
  				}
  			}
  		}
  		closedir($dh);

  		if(!empty($files)){
  			foreach($files as $k=>$v){
  				$time[$k] = $v['time'];
  				$name[$k] = $v['name'];
  				$size[$k] = $v['size'];
  			}

  			$sort = SORT_ASC;
  			if($asc == "desc"){
  				$sort = SORT_DESC;
  			}

  			if($order == "time"){
  				if($asc == "desc")
  				array_multisort($time,$sort,SORT_STRING, $files);//按时间排序
  			}elseif($order == "name"){
  				array_multisort($name,$sort,SORT_STRING, $files);//按名字排序
  			}elseif($order == "size"){
  				array_multisort($size,$sort,SORT_NUMERIC, $files);//按大小排序
  			}

  			foreach($files as $key => $val){
  				$floder[] = $val['name'];
  			}
  		}
  		return $floder;
  	}
  }
}

//获取文件列表
if (!function_exists('listFile')){
  function listFile($dir) {
  	$fileArray[]=NULL;
  	if (false != ($handle = opendir ( $dir ))) {
  		$i=0;
  		while ( false !== ($file = readdir ( $handle )) ) {
  			//去掉"“.”、“..”以及带“.xxx”后缀的文件
  			if ($file != "." && $file != ".."&&strpos($file,".")) {
  				// $fileArray[$i] = iconv('GBK', 'UTF-8', $file);
                $fileArray[$i] = mb_convert_encoding($file, 'UTF-8', 'auto');
  				if($i==100){
  					break;
  				}
  				$i++;
  			}
  		}
  		//关闭句柄
  		closedir ( $handle );
  	}
  	return $fileArray;
  }
}

//统计文件夹的相关信息
//统计目录数
//格式化输出目录大小 单位：Bytes，KB，MB，GB
if (!function_exists('getFolderSize')){
  function getFolderSize($path){
  	$totalsize = 0;
  	$totalcount = 0;
    if (!file_exists($path) || !is_dir($path)) {
        return 0;
    }
  	if ($handle = opendir ($path)){
  		while (false !== ($file = readdir($handle))){
  			$nextpath = $path . '/' . $file;
  			if ($file != '.' && $file != '..' && !is_link ($nextpath)){
  				if (is_dir($nextpath)){
  					$result = getFolderSize($nextpath);
  					$totalsize += $result['size'];
  					$totalcount += $result['count'];
  				}elseif (is_file ($nextpath)){
  					$totalsize += filesize ($nextpath);
  					$totalcount++;
  				}
  			}
  		}
  	}
  	closedir ($handle);
  	$total['size'] = $totalsize;
  	$total['count'] = $totalcount;
  	return $total;
  }
}

//字节转换为MB、GB、TB
if (!function_exists('sizeformat')){
  function sizeformat($bytesize){
  	$i=0;

  	//当$bytesize 大于是1024字节时，开始循环，当循环到第4次时跳出；
  	while(abs($bytesize)>=1024){
  		$bytesize=$bytesize/1024;
  		$i++;
  		if($i==4)break;
  	}

  	//将Bytes,KB,MB,GB,TB定义成一维数组；

  	$units= array("B","KB","MB","GB","TB");
  	$newsize=round($bytesize,2);
  	return("$newsize $units[$i]");
  }
}

//获取文件内容
if (!function_exists('file_get')){
    function file_get($filename) {
        $rec = @file_get_contents($filename);
        if($rec) return $rec;
        if(substr($filename, 0, 8) == 'https://') return file_get('http://'.substr($filename, 8));
        return '';
    }
}

//获取文件扩展名
if (!function_exists('file_ext')){
    function file_ext($filename) {
        if(strpos($filename, '.') === false) return '';
        $ext = strtolower(trim(substr(strrchr($filename, '.'), 1)));
        return preg_match("/^[a-z0-9]{1,10}$/", $ext) ? $ext : '';
    }
}