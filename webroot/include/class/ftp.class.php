<?php   if(!defined('HUONIAOINC')) exit("Request Error!");
/**
 * FTP远程上传类
 *
 * @version        $Id: ftp.class.php 2013-9-24 下午22:12:16 $
 * @package        HuoNiao.class
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

if(!defined('HUONIAOINC')) exit("Request Error!");

if(!defined('FTP_ERR_SERVER_DISABLED')) {
	define('FTP_ERR_SERVER_DISABLED', -100);
	define('FTP_ERR_CONFIG_OFF', -101);
	define('FTP_ERR_CONNECT_TO_SERVER', -102);
	define('FTP_ERR_USER_NO_LOGGIN', -103);
	define('FTP_ERR_CHDIR', -104);
	define('FTP_ERR_MKDIR', -105);
	define('FTP_ERR_SOURCE_READ', -106);
	define('FTP_ERR_TARGET_WRITE', -107);
}

class ftp{

	var $enabled = false;
	var $config = array();

	var $func;
	var $connectid;
	var $_error;

	function &instance($config = array()) {
		static $object;
		if(empty($object)) {
			$object = new ftp($config);
		}
		return $object;
	}

	function __construct($config = array()) {

		global $cfg_ftpState;
		global $cfg_ftpServer;
		global $cfg_ftpPort;
		global $cfg_ftpUser;
		global $cfg_ftpPwd;
		global $cfg_ftpDir;
		global $cfg_ftpUrl;
		global $cfg_ftpTimeout;
		global $cfg_ftpSSL;
		global $cfg_ftpPasv;

		$ftpConfig = array(
			"on" => $cfg_ftpState, //是否开启
			"host" => $cfg_ftpServer, //FTP服务器地址
			"port" => $cfg_ftpPort, //FTP服务器端口
			"username" => $cfg_ftpUser, //FTP帐号
			"password" => $cfg_ftpPwd,  //FTP密码
			"attachdir" => $cfg_ftpDir,  //FTP上传目录
			"attachurl" => $cfg_ftpUrl,  //远程附件地址
			"timeout" => $cfg_ftpTimeout,  //FTP超时
			"ssl" => $cfg_ftpSSL,  //启用SSL连接
			"pasv" => $cfg_ftpPasv  //被动模式连接
		);

		$this->set_error(0);
		$this->config = !$config ? $ftpConfig : $config;

		$this->enabled = false;
		if(empty($this->config['on']) || empty($this->config['host'])) {
			$this->set_error(FTP_ERR_CONFIG_OFF);
		} else {
			$this->func = $this->config['ssl'] && function_exists('ftp_ssl_connect') ? 'ftp_ssl_connect' : 'ftp_connect';
			if($this->func == 'ftp_connect' && !function_exists('ftp_connect')) {
				$this->set_error(FTP_ERR_SERVER_DISABLED);
			} else {
				$this->config['host'] = ftp::clear($this->config['host']);
				$this->config['port'] = intval($this->config['port']);
				$this->config['ssl'] = intval($this->config['ssl']);
				$this->config['username'] = ftp::clear($this->config['username']);
				$this->config['password'] = ftp::clear($this->config['password']);
				$this->config['timeout'] = intval($this->config['timeout']);
				$this->enabled = true;
			}
		}
	}

	function upload($source, $target) {
		if($this->error()) {
			return 0;
		}
		$old_dir = $this->ftp_pwd();
		$dirname = dirname($target);
		$filename = basename($target);
		if(!$this->ftp_chdir($dirname)) {
			if($this->ftp_mkdir($dirname)) {
				$this->ftp_chmod($dirname);
				if(!$this->ftp_chdir($dirname)) {
					$this->set_error(FTP_ERR_CHDIR);
				}
				$this->ftp_put('index.html', HUONIAOROOT.'/uploads/index.html', FTP_BINARY);
			} else {
				$this->set_error(FTP_ERR_MKDIR);
			}
		}

		$res = 0;
		if(!$this->error()) {
			if($fp = @fopen($source, 'a+')) {
				$res = $this->ftp_fput($filename, $fp, FTP_BINARY);
				@fclose($fp);

				$arr = explode('.', $source);
		        if(end($arr) != 'xls' && end($arr) != 'xlsx' && !strstr($source, 'house/community') && !strstr($source, "card") && !strstr($source, "photo")){
		            // 房产小区远程图片本地化上传会太慢，有时会失败，所以先不删除本地附件，待本地化成功后，将本地文件夹上传至OSS后可恢复此行 by gz 20190219
		            unlinkFile($source);
		        }
				// unlinkFile($source);
				!$res && $this->set_error(FTP_ERR_TARGET_WRITE);
			} else {
				$this->set_error(FTP_ERR_SOURCE_READ);
			}
		}

		$this->ftp_chdir($old_dir);

		return $res ? 1 : 0;
	}

	function connect() {
		if(!$this->enabled || empty($this->config)) {
			return 0;
		} else {
			return $this->ftp_connect(
				$this->config['host'],
				$this->config['username'],
				$this->config['password'],
				$this->config['attachdir'],
				$this->config['port'],
				$this->config['timeout'],
				$this->config['ssl'],
				$this->config['pasv']
				);
		}

	}

	function ftp_connect($ftphost, $username, $password, $ftppath, $ftpport = 21, $timeout = 30, $ftpssl = 0, $ftppasv = 0) {
		$res = 0;
		$fun = $this->func;
		$funid = @$fun($ftphost, $ftpport, 20);
		if(!$funid) return false;
		if($this->connectid = $funid) {
			$timeout && $this->set_option(FTP_TIMEOUT_SEC, $timeout);
			if($this->ftp_login($username, $password)) {
				$this->ftp_pasv($ftppasv);
				$this->ftp_mkdir($ftppath);  //如果指定目录不存在则自动创建该目录
				if($this->ftp_chdir($ftppath)) {
					$res = $this->connectid;
				} else {
					$this->set_error(FTP_ERR_CHDIR);
				}
			} else {
				$this->connectid = false;
				$this->set_error(FTP_ERR_USER_NO_LOGGIN);
			}

		} else {
			$this->set_error(FTP_ERR_CONNECT_TO_SERVER);
		}

		if($res > 0) {
			$this->set_error();
			$this->enabled = 1;
		} else {
			$this->enabled = 0;
			$this->ftp_close();
		}

		return $res;

	}

	function set_error($code = 0) {
		$this->_error = $code;
	}

	function error() {
		return $this->_error;
	}

	function clear($str) {
		return str_replace(array( "\n", "\r", '..'), '', $str);
	}


	function set_option($cmd, $value) {
		if(function_exists('ftp_set_option')) {
			return @ftp_set_option($this->connectid, $cmd, $value);
		}
	}

	function ftp_mkdir($directory) {
		$directory = ftp::clear($directory);
		$epath = explode('/', $directory);
		$dir = '';$comma = '';
		foreach($epath as $path) {
			$dir .= $comma.$path;
			$comma = '/';
			$return = @ftp_mkdir($this->connectid, $dir);
			$this->ftp_chmod($dir);
		}
		return $return;
	}

	function ftp_rmdir($directory) {
		$directory = ftp::clear($directory);
		return @ftp_rmdir($this->connectid, $directory);
	}

	function ftp_put($remote_file, $local_file, $mode = FTP_BINARY) {
		$remote_file = ftp::clear($remote_file);
		$local_file = ftp::clear($local_file);
		$mode = intval($mode);
		return @ftp_put($this->connectid, $remote_file, $local_file, $mode);
	}

	function ftp_fput($remote_file, $sourcefp, $mode = FTP_BINARY) {
		$remote_file = ftp::clear($remote_file);
		$mode = intval($mode);
		return @ftp_fput($this->connectid, $remote_file, $sourcefp, $mode);
	}

	function ftp_size($remote_file) {
		$remote_file = ftp::clear($remote_file);
		return @ftp_size($this->connectid, $remote_file);
	}

	function ftp_close() {
		return @ftp_close($this->connectid);
	}

	function ftp_delete($path) {
		$path = ftp::clear($path);
		return @ftp_delete($this->connectid, $path);
	}

	function ftp_get($local_file, $remote_file, $mode, $resumepos = 0) {
		$remote_file = ftp::clear($remote_file);
		$local_file = ftp::clear($local_file);
		$mode = intval($mode);
		$resumepos = intval($resumepos);
		return @ftp_get($this->connectid, $local_file, $remote_file, $mode, $resumepos);
	}

	function ftp_login($username, $password) {
		$username = $this->clear($username);
		$password = str_replace(array("\n", "\r"), array('', ''), $password);
		return @ftp_login($this->connectid, $username, $password);
	}

	function ftp_pasv($pasv) {
		return @ftp_pasv($this->connectid, $pasv ? true : false);
	}

	function ftp_chdir($directory) {
		$directory = ftp::clear($directory);
		return @ftp_chdir($this->connectid, $directory);
	}

	function ftp_site($cmd) {
		$cmd = ftp::clear($cmd);
		return @ftp_site($this->connectid, $cmd);
	}

	function ftp_chmod($filename, $mod = 0777) {
		$filename = ftp::clear($filename);
		if(function_exists('ftp_chmod')) {
			return @ftp_chmod($this->connectid, $mod, $filename);
		} else {
			return @ftp_site($this->connectid, 'CHMOD '.$mod.' '.$filename);
		}
	}

	function ftp_pwd() {
		return @ftp_pwd($this->connectid);
	}

}
