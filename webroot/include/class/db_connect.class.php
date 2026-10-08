<?php   if(!defined('HUONIAOINC')) exit("Request Error!");
/**
 * 数据库类
 * 说明:系统底层数据库核心类
 *
 * @version        $Id: db_connect.class.php 2013-7-7 上午10:33:36 $
 * @package        HuoNiao.class
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

class db_connect{
	/**
	 * 保存数据库对象
	 *
	 * @var object数据库对象
	 */
	protected $db;

	/**
	 * 检查数据库对象，若不存在则生成一个
	 *
	 * @param object $dbo数据库对象
	 */
	protected function __construct($dbo=NULL){
		$db = NULL;
		if(is_object($db)){
			$this->db = $db;
		}else{
			$dbPort = $GLOBALS['DB_PORT'] ? $GLOBALS['DB_PORT'] : 3306;
			$dsn = "mysql:host=".$GLOBALS['DB_HOST'].";port=".$dbPort.";dbname=".$GLOBALS['DB_NAME'];
			try{
				$_opts_values = array(PDO::ATTR_PERSISTENT=>true,PDO::ATTR_ERRMODE=>2,PDO::MYSQL_ATTR_INIT_COMMAND=>'SET NAMES utf8mb4');
				$this->db = new PDO($dsn, $GLOBALS['DB_USER'], $GLOBALS['DB_PASS'], $_opts_values);
			}catch(Exception $e){
				//如果连接失败，输出错误
				if (HUONIAOBUG === TRUE){
					die($e->getMessage());
				}else{
					die('<center><br /><br />数据库链接失败，请检查配置信息！<br /><br />Database link failed. Check configuration information!</center>');
				}
			}
		}
	}

    //设置SQL语句，会自动把SQL语句里的#@__替换为$this->dbPrefix(在配置文件中为$cfg_dbprefix)
    static function SetQuery($sql,$dbParam=array()){
        global $_G;
        $md5SqlQueryKey = base64_encode("sqlQuery_" . $sql);

        if(isset($_G[$md5SqlQueryKey])){
            return $_G[$md5SqlQueryKey];
        }

        $prefix = "#@__";
        $sql = trim(str_replace($prefix,$GLOBALS['DB_PREFIX'],$sql));
        $exp = explode(" ", $sql);
        $sql = CheckSql($sql, $exp[0]);
        if(!empty($dbParam)){  //参数替换，特别是字符串，一键加addslashes。by zfh
            $sql .= " ";
            foreach ($dbParam as $k => $v) {
                if (is_string($v)){
                    $v = addslashes($v);
                    $v = "'$v'";
                }
                else{
                    $v = (string)$v; //不能是复杂类型如数组对象
                }
                if(preg_match("/:$k\W/",$sql,$matches)){
                    $w = substr($matches[0],-1);
                    $sql = preg_replace("/:$k\W/", $v.$w, $sql, 1);
                }
            }
            $sql = substr($sql, 0, -1);
        }
        $_G[$md5SqlQueryKey] = $sql;
        return $sql;
    }

}

//SQL语句过滤程序，由80sec提供，这里作了适当的修改
if (!function_exists('CheckSql')){
    function CheckSql($db_string, $querytype='select'){

        global $_G;

        $md5Db_string = base64_encode($db_string);
        //重复的SQL只检测一次
        if(isset($_G[$md5Db_string]) != NULL){
            return $db_string;
        }

        $clean = '';
        $error='';
        $old_pos = 0;
        $pos = -1;
        $log_file = HUONIAODATA.'/checkSql_safe.txt';
        $userIP = GetIP();
        $getUrl = GetCurUrl();

        //如果是普通查询语句，直接过滤一些特殊语法
        if($querytype=='select'){
            $notallow1 = "[^0-9a-z@\._-]{1,}(union|sleep|benchmark|load_file|outfile)[^0-9a-z@\.-]{1,}";

            //$notallow2 = "--|/\*";
            if(preg_match("/".$notallow1."/i", $db_string)){

                //初始化日志
                require_once HUONIAOROOT."/api/handlers/log.php";
                $_checkSqlLog= new CLogFileHandler(HUONIAOROOT . '/log/checkSql_safe/' . date('Y-m-d').'.log', true);
                $_checkSqlLog->DEBUG("IP:" . $userIP);
                $_checkSqlLog->DEBUG("SQL:" . $db_string);
                $_checkSqlLog->DEBUG("ERROR:SelectBreak");
                
                // fputs(fopen($log_file,'a+'),"$userIP||$getUrl||$db_string||SelectBreak\r\n");
                exit("<font size='5' color='red'>Safe Alert: Request Error step 1 !</font>");
            }
        }

        //完整的SQL检查
        while (TRUE){
            $pos = strpos($db_string, '\'', $pos + 1);
            if ($pos === FALSE){
                break;
            }
            $clean .= substr($db_string, $old_pos, $pos - $old_pos);
            while (TRUE){
                $pos1 = strpos($db_string, '\'', $pos + 1);
                $pos2 = strpos($db_string, '\\', $pos + 1);
                if ($pos1 === FALSE){
                    break;
                }elseif ($pos2 == FALSE || $pos2 > $pos1){
                    $pos = $pos1;
                    break;
                }
                $pos = $pos2 + 1;
            }
            $clean .= '$s$';
            $old_pos = $pos + 1;
        }
        $clean .= substr($db_string, $old_pos);
        $clean = trim(strtolower(preg_replace(array('~\s+~s' ), array(' '), $clean)));

        //老版本的Mysql并不支持union，常用的程序里也不使用union，但是一些黑客使用它，所以检查它
        if (strpos($clean, 'union') !== FALSE && preg_match('~(^|[^a-z])union($|[^[a-z])~s', $clean) != 0){
            // $fail = TRUE;
            // $error="union detect";
        }

        //发布版本的程序可能比较少包括--,#这样的注释，但是黑客经常使用它们
        elseif (strpos($clean, '/*') > 2 || strpos($clean, '--') !== FALSE || strpos($clean, '#') !== FALSE){
            // $fail = TRUE;
            // $error="comment detect";
        }

        //这些函数不会被使用，但是黑客会用它来操作文件，down掉数据库
        elseif (strpos($clean, 'sleep') !== FALSE && preg_match('~(^|[^a-z])sleep($|[^[a-z])~s', $clean) != 0){
            $fail = TRUE;
            $error="slown down detect";
        }
        elseif (strpos($clean, 'benchmark') !== FALSE && preg_match('~(^|[^a-z])benchmark($|[^[a-z])~s', $clean) != 0){
            $fail = TRUE;
            $error="slown down detect";
        }
        elseif (strpos($clean, 'load_file') !== FALSE && preg_match('~(^|[^a-z])load_file($|[^[a-z])~s', $clean) != 0){
            $fail = TRUE;
            $error="file fun detect";
        }elseif (strpos($clean, 'into outfile') !== FALSE && preg_match('~(^|[^a-z])into\s+outfile($|[^[a-z])~s', $clean) != 0){
            $fail = TRUE;
            $error="file fun detect";
        }

        //老版本的MYSQL不支持子查询，我们的程序里可能也用得少，但是黑客可以使用它来查询数据库敏感信息
        // elseif (preg_match('~\([^)]*?select~s', $clean) != 0){
        //     $fail = TRUE;
        //     $error="sub select detect";
        // }

        if (!empty($fail)){

            //初始化日志
            require_once HUONIAOROOT."/api/handlers/log.php";
            $_checkSqlLog= new CLogFileHandler(HUONIAOROOT . '/log/checkSql_safe/' . date('Y-m-d').'.log', true);
            $_checkSqlLog->DEBUG("IP:" . $userIP);
            $_checkSqlLog->DEBUG("SQL:" . $db_string);
            $_checkSqlLog->DEBUG("ERROR:" . $error);

            // fputs(fopen($log_file,'a+'),"$userIP||$getUrl||$db_string||$error\r\n");
            exit("<font size='5' color='red'>Safe Alert: Request Error step 2!</font>");
        }else{
            $_G[$md5Db_string] = 1;
            return $db_string;
        }
    }
}
