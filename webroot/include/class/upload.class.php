<?php if (!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 上传处理插件
 *
 * @version        $Id: upload.class.php 2013-7-7 上午10:33:36 $
 * @package        HuoNiao.class
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

class upload
{
    private $fileField;            //文件域名
    private $file;                 //文件上传对象
    private $config;               //配置信息
    private $oriName;              //原始文件名
    private $fileName;             //新文件名
    private $fullName;             //完整文件名,即从当前配置目录开始的URL
    private $fileSize;             //文件大小
    private $fileType;             //文件类型
    private $fileMd5;              //文件唯一值
    private $fileData;             //已经存在的文件数据
    private $stateInfo;            //上传状态信息,
    private $lockFile;             //分片上传临时文件
    private $stateMap = array(    //上传状态映射表，国际化用户需考虑此处数据的国际化
        "SUCCESS",                //上传成功标记，在UEditor中内不可改变，否则flash判断会出错
        "文件大小超出 upload_max_filesize 限制",
        "文件大小超出 MAX_FILE_SIZE 限制",
        "文件未被完整上传",
        "没有文件被上传",
        "上传文件为空",
        "POST" => "文件大小超出 post_max_size 限制",
        "SIZE" => "文件大小超出网站限制",
        "TYPE" => "不允许的文件类型",
        "DIR" => "目录创建失败",
        "IO" => "输入输出错误",
        "UNKNOWN" => "未知错误",
        "MOVE" => "文件保存时出错"
    );

    /**
     * 构造函数
     * @param string $fileField 表单名称
     * @param array $config  配置项
     * @param bool $base64  是否解析base64编码，可省略。若开启，则$fileField代表的是base64编码的字符串表单名
     */
    public function __construct($fileField, $config, $base64 = false, $remote = false)
    {
        $this->fileField = $fileField;
        $this->config = $config;
        $this->stateInfo = $this->stateMap[0];
        if (!$remote) {
            $this->upFile($base64);
        }
    }

    /**
     * 上传文件的主处理方法
     * @param $base64
     * @return mixed
     */
    private function upFile($base64)
    {
        global $dsql;
        global $cfg_fastUpload;  //极速上传

        //处理base64上传
        if (strstr($base64, "base64")) {
            $content = $_POST[$this->fileField];
            $this->base64ToImage($content, $base64);
            return;
        }

        //处理普通上传
        $file = $this->file = $_FILES[$this->fileField];
        if (!$file) {
            $this->stateInfo = $this->getStateInfo(5);
            return;
        }
        if ($this->file['error']) {
            $this->stateInfo = $this->getStateInfo($file['error']);
            return;
        }
        if (!is_uploaded_file($file['tmp_name'])) {
            $this->stateInfo = $this->getStateInfo("UNKNOWN");
            return;
        }

        $this->oriName = $file['name'];
        $this->fileSize = $file['size'];
        $this->fileType = $this->getFileExt();

        $fileMd5 = md5_file($file["tmp_name"]);
        $this->fileMd5 = $fileMd5;

        $fastUpload = (int)$cfg_fastUpload;

        //查询是否上传过，如果已经上传过，直接返回
        if($this->config["fileType"]!="certificate" && !isset($_REQUEST['chunks']) && $fastUpload){
            $sql = $dsql->SetQuery("SELECT * FROM `#@__attachment` WHERE `md5` = '$fileMd5' ORDER BY `id` DESC");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $data = $ret[0];
                if(strstr($data['path'], "certificate")===false){
                    if(self::remoteFileExists(getFilePath($data['id'], false))){
                        $this->fileName = basename($data['path']);
                        $this->fullName = $data['path'];
                        $this->fileData = $data;
                        $this->stateInfo = 'REPEAT';
                        return;
                    }
                }
            }
        }

        if (!$this->checkSize()) {
            $this->stateInfo = $this->getStateInfo("SIZE");
            return;
        }
        if (!$this->checkType()) {
            $this->stateInfo = $this->getStateInfo("TYPE");
            return;
        }

        $targetDir = $this->getFolderTmp();
        $uploadDir = $this->getFolder();

        $this->fullName = $this->config["fileType"] == 'favicon' ? $this->config["savePath"] . '/favicon.ico' : $uploadDir . '/' . $this->getName();
        if ($this->stateInfo == $this->stateMap[0]) {

            // 分片上传
            $chunk = isset($_REQUEST["chunk"]) ? intval($_REQUEST["chunk"]) : 0;
            $chunks = isset($_REQUEST["chunks"]) ? intval($_REQUEST["chunks"]) : 1;

            $filePath = $targetDir . '/' . $this->oriName . $this->fileType;
            $uploadPath = $this->fullName;

            if ($chunks > 1) {
                $cleanupTargetDir = true; // Remove old files
                $maxFileAge = 5 * 3600; // Temp file age in seconds

                // Remove old temp files
                if ($cleanupTargetDir) {
                    if (!is_dir($targetDir) || !$dir = opendir($targetDir)) {
                        $this->stateInfo = $this->getStateInfo("DIR");
                        return;
                    }

                    while (($file_ = readdir($dir)) !== false) {
                        $tmpfilePath = $targetDir . DIRECTORY_SEPARATOR . $file_;

                        // If temp file is current file proceed to the next
                        if ($tmpfilePath == "{$filePath}_{$chunk}.part" || $tmpfilePath == "{$filePath}_{$chunk}.parttmp") {
                            continue;
                        }

                        // Remove temp file if it is older than the max age and is not the current file
                        if (preg_match('/\.(part|parttmp)$/', $file_) && (@filemtime($tmpfilePath) < time() - $maxFileAge)) {
                            unlinkFile($tmpfilePath);
                        }
                    }
                    closedir($dir);
                }

                // Open temp file
                if (!$out = @fopen("{$filePath}_{$chunk}.parttmp", "wb")) {
                    die('{"jsonrpc" : "2.0", "error" : {"code": 102, "message": "Failed to open output stream."}, "id" : "id"}');
                }

                if (!empty($file)) {
                    if ($file["error"]) {
                        die('{"jsonrpc" : "2.0", "error" : {"code": 103, "message": "Failed to move uploaded file."}, "id" : "id"}');
                    }

                    // Read binary input stream and append it to temp file
                    if (!$in = @fopen($file["tmp_name"], "rb")) {
                        die('{"jsonrpc" : "2.0", "error" : {"code": 104, "message": "Failed to open input stream."}, "id" : "id"}');
                    }
                } else {
                    if (!$in = @fopen("php://input", "rb")) {
                        die('{"jsonrpc" : "2.0", "error" : {"code": 105, "message": "Failed to open input stream."}, "id" : "id"}');
                    }
                }

                while ($buff = fread($in, 4096)) {
                    fwrite($out, $buff);
                }

                @fclose($out);
                @fclose($in);

                rename("{$filePath}_{$chunk}.parttmp", "{$filePath}_{$chunk}.part");

                $index = 0;
                $done = true;
                for ($index = 0; $index < $chunks; $index++) {  // 2,3同时到达，1-5都存在，则会两次done，并上传2个文件
                    if (!file_exists("{$filePath}_{$index}.part")) {
                        $done = false;
                        break;
                    }
                }
                if ($done) {
                    if (!$out = @fopen($uploadPath, "wb")) {
                        die('{"jsonrpc" : "2.0", "error" : {"code": 106, "message": "Failed to open output stream."}, "id" : "id"}');
                    }


                    if (flock($out, LOCK_EX)) {

                        $lockFile = "{$filePath}_lock.part";
                        $this->lockFile = $lockFile;
                        $fp = fopen($lockFile, "w+");
                        if (flock($fp,LOCK_EX)) {

                            if(!file_exists("{$filePath}_0.part")){
                                unlinkFile($uploadPath);
                                $thumbRes = array("state"=>"文件未被完整上传");
                                die(json_encode($thumbRes,256));
                            }

                            for ($index = 0; $index < $chunks; $index++) {
                                if (!$in = @fopen("{$filePath}_{$index}.part", "rb")) {
                                    break;
                                }

                                while ($buff = fread($in, 4096)) {
                                    fwrite($out, $buff);
                                }

                                @fclose($in);
                                unlinkFile("{$filePath}_{$index}.part");
                            }
                            //合并后的md5
                            $fileMd5 = md5_file($uploadPath);
                            $this->fileMd5 = $fileMd5;
                            $this->fileSize = filesize($uploadPath);

                            //查询是否上传过，如果已经上传过，直接返回
                            if($this->config["fileType"]!="certificate" && $fastUpload){
                                $sql = $dsql->SetQuery("SELECT * FROM `#@__attachment` WHERE `md5` = '$fileMd5' ORDER BY `id` DESC");
                                $ret = $dsql->dsqlOper($sql, "results");
                                if ($ret) {
                                    $data = $ret[0];
                                    if(strstr($data['path'], "certificate")===false){
                                        if(self::remoteFileExists(getFilePath($data['id'], false))){
                                            $this->fileName = basename($data['path']);
                                            $this->fullName = $data['path'];
                                            $this->fileData = $data;
                                            $this->stateInfo = 'REPEAT';
                                            unlinkFile($uploadPath);
                                            return;
                                        }
                                    }
                                }
                            }
                            @flock($fp, LOCK_UN);
                        }
                        @fclose($fp);

                        @flock($out, LOCK_UN);
                    }
                    @fclose($out);
                } else {
                    $this->stateInfo = $this->stateMap[3];
                }

                //普通上传
            } else {
                if (!move_uploaded_file($file["tmp_name"], HUONIAOROOT . str_replace("..", "", $this->fullName))) {
                    $this->stateInfo = $this->getStateInfo("MOVE");
                }
            }
        }
    }

    /**
     * 处理base64编码的图片上传
     * @param $base64Data
     * @return mixed
     */
    private function base64ToImage($base64Data, $base64)
    {
        $img = base64_decode($base64Data);
        if (strstr($base64, "|")) {
            global $cfg_uploadDir;
            $arr = explode("|", $base64);
            $this->fullName = ".." . $cfg_uploadDir . $arr[1];
            $this->oriName = $arr[1];
        } else {
            $this->fileName = time() . rand(1, 10000) . ".png";
            $this->fullName = $this->getFolder() . '/' . $this->fileName;
        }
        if (!file_put_contents($this->fullName, $img)) {
            $this->stateInfo = $this->getStateInfo("IO");
            return;
        }
        $this->oriName = $this->fileName;
        $this->fileSize = strlen($img);
        $this->fileType = ".png";
    }

    /**
     * 获取当前上传成功文件的各项信息
     * @return array
     */
    public function getFileInfo()
    {
        return array(
            "originalName" => $this->oriName,
            "name" => $this->fileName,
            "url" => $this->fullName,
            "size" => $this->fileSize,
            "type" => $this->fileType,
            "md5" => $this->fileMd5,
            "data" => $this->fileData,
            "state" => $this->stateInfo,
            "lockFile" => $this->lockFile
        );
    }

    /**
     * 上传错误检查
     * @param $errCode
     * @return string
     */
    private function getStateInfo($errCode)
    {
        return !$this->stateMap[$errCode] ? $this->stateMap["UNKNOWN"] : $this->stateMap[$errCode];
    }

    /**
     * 重命名文件
     * @return string
     */
    private function getName()
    {
        return $this->fileName = time() . rand(1, 10000) . $this->getFileExt();
    }

    /**
     * 文件类型检测
     * @return bool
     */
    private function checkType()
    {
        return in_array(str_replace(".", "", $this->getFileExt()), $this->config["allowFiles"]);
    }

    /**
     * 文件大小检测
     * @return bool
     */
    private function  checkSize()
    {
        return $this->fileSize < ($this->config["maxSize"] * 1024);
    }

    /**
     * 获取文件扩展名
     * @return string
     */
    private function getFileExt()
    {

        //安卓微信端上传的文件，使用文件功能上传时，文件名没有后缀，全称就是“微信”，这里做了兼容
        return $this->file["name"] == '微信' && $this->config['fileType'] == 'video' ? '.mp4' : strtolower(strrchr($this->file["name"], '.'));
    }

    /**
     * 按照日期自动创建存储文件夹
     * @return string
     */
    private function getFolder($path = "")
    {
        if ($path != "") {
            $pathStr = $path;
        } else {
            $pathStr = $this->config["savePath"] . "/large";  //默认原图
        }
        if (strrchr($pathStr, "/") != "/") {
            $pathStr .= "/";
        }
        $pathStr .= date("Y") . "/" . date("m") . "/" . date("d");
        if (!file_exists($pathStr)) {
            //echo $pathStr;die;
            if (!@mkdir($pathStr, 0777, true)) {
                return false;
            }
        }
        return $pathStr;
    }

    /**
     * 按照日期自动创建临时存储文件夹
     * @return string
     */
    private function getFolderTmp($path = "")
    {
        if ($path != "") {
            $pathStr = $path;
        } else {
            $pathStr = $this->config["savePath"] . "/large";  //默认原图
        }
        if (strrchr($pathStr, "/") != "/") {
            $pathStr .= "/";
        }
        $pathStr .= date("Y") . "/" . date("m") . "/" . date("d") . "/tmp";
        if (!file_exists($pathStr)) {
            //echo $pathStr;die;
            if (!@mkdir($pathStr, 0777, true)) {
                return false;
            }
        }
        return $pathStr;
    }

    // 获取图片信息
    private function getImgInfo()
    {
        global $cfg_uploadDir;
        $rootPath = explode($cfg_uploadDir, $this->fullName);
        $photoPath = ".." . $cfg_uploadDir . $rootPath[1];  // 获取文件路径
        $imageInfo = @getimagesize($photoPath);       // 获取文件大小
        $imgInfo["width"] = $imageInfo[0];       // 获取文件宽度
        $imgInfo["height"] = $imageInfo[1];      // 获取文件高度
        $imgInfo["type"] = $imageInfo[2];        // 获取文件类型
        $imgInfo["name"] = $this->fileName;     // 获取文件名称
        return $imgInfo;
    }

    /**
     * 生成缩略图
     * @param string $width   要生成的图片宽度
     * @param string $height  要生成的图片高度
     * @param string $folder  生成图片的存放位置
     * @param string $quality 生成图片的质量
     *
     * $cfg_photoCutType: 适应大小方式
     *	'force': 把图片强制变形成 $width X $height 大小
     *	'scale': 按比例在安全框 $width X $height 内缩放图片, 输出缩放后图像大小 不完全等于 $width X $height
     *	'scale_fill': 按比例在安全框 $width X $height 内缩放图片，安全框内没有像素的地方填充色, 使用此参数时可设置背景填充色 $bg_color = array(255,255,255)(红,绿,蓝, 透明度) 透明度(0不透明-127完全透明))
     *	其它: 智能模式 缩放图像并载取图像的中间部分 $width X $height 像素大小
     *	$fit = 'force','scale','scale_fill' 时： 输出完整图像
     * $cfg_photoCutPostion = 图像方位值 时, 输出指定位置截取的部分图像
     *	字母与图像的对应关系如下:
     *	north_west   north   north_east
     *
     *	west         center        east
     *
     *	south_west   south   south_east
     *
     */
    public function smallImg($width, $height, $folder, $quality, $remote = false)
    {
        global $cfg_photoCutType;
        global $cfg_photoCutPostion;
        $cfg_photoCutType = !empty($cfg_photoCutType) ? $cfg_photoCutType : "scale_width";
        $cfg_photoCutPostion = !empty($cfg_photoCutPostion) ? $cfg_photoCutPostion : "center";

        $smallWidth = $newWidth = $width;
        $smallHeight = $newHeight = $height;
        $src_x = 0;
        $src_y = 0;
        $dest_x = 0;
        $dest_y = 0;

        if ($remote) {
            $imgInfo = $remote['imgInfo'];
            $photo = $remote['fullName']; //获得图片源
            $savePath = $remote['savePath'];
        } else {
            $imgInfo = $this->getImgInfo();
            $photo = $this->fullName; //获得图片源
            $savePath = $this->config["savePath"];
        }

        if ($imgInfo["type"] == 1) {
            $img   = imagecreatefromgif($photo);
            $img_t = ".gif";
        } elseif ($imgInfo["type"] == 2) {
            $img   = imagecreatefromjpeg($photo);
            $img_t = ".jpg";
        } elseif ($imgInfo["type"] == 3) {
            $img   = imagecreatefrompng($photo);
            $img_t = ".png";
        } else {
            $img   = "";
            $img_t = "";
        }
        $newName = $imgInfo["name"];
        if (empty($img)) return False;
        $srcW = $imgInfo["width"];
        $srcH = $imgInfo["height"];

        switch ($cfg_photoCutType) {
            case 'force':
                break;
            case 'scale':
                $newSize = resizeImage($imgInfo['width'], $imgInfo['height'], $width, $height);
                if ($newSize) {
                    $smallWidth = $newWidth = $newSize['width'];
                    $smallHeight = $newHeight = $newSize['height'];
                } else {
                    $smallWidth = $newWidth = $imgInfo['width'];
                    $smallHeight = $newHeight = $imgInfo['height'];
                }
                break;
            case 'scale_fill':
                if ($imgInfo["width"] * $height > $imgInfo["height"] * $width) {
                    $smallHeight = intval($imgInfo["height"] * $width / $imgInfo["width"]);
                    $dest_y = intval(($height - $smallHeight) / 2);
                } else {
                    $smallWidth = intval($imgInfo["width"] * $height / $imgInfo["height"]);
                    $dest_x = intval(($width - $smallWidth) / 2);
                }
                break;
            default:
                if ($imgInfo["width"] * $height > $imgInfo["height"] * $width) {
                    $srcW = $width * $imgInfo["height"] / $height;
                } else {
                    $srcH = $height * $imgInfo["width"] / $width;
                }

                switch ($cfg_photoCutPostion) {
                    case 'north_west':
                        $src_x = 0;
                        $src_y = 0;
                        break;
                    case 'north':
                        $src_x = intval(($imgInfo["width"] - $srcW) / 2);
                        $src_y = 0;
                        break;
                    case 'north_east':
                        $src_x = $imgInfo["width"] - $srcW;
                        $src_y = 0;
                        break;
                    case 'west':
                        $src_x = 0;
                        $src_y = intval(($imgInfo["height"] - $srcH) / 2);
                        break;
                    case 'center':
                        $src_x = intval(($imgInfo["width"] - $srcW) / 2);
                        $src_y = intval(($imgInfo["height"] - $srcH) / 2);
                        break;
                    case 'east':
                        $src_x = $imgInfo["width"] - $srcW;
                        $src_y = intval(($imgInfo["height"] - $srcH) / 2);
                        break;
                    case 'south_west':
                        $src_x = 0;
                        $src_y = $imgInfo["height"] - $srcH;
                        break;
                    case 'south':
                        $src_x = intval(($imgInfo["width"] - $srcW) / 2);
                        $src_y = $imgInfo["height"] - $srcH;
                        break;
                    case 'south_east':
                        $src_x = $imgInfo["width"] - $srcW;
                        $src_y = $imgInfo["height"] - $srcH;
                        break;
                    default:
                        $src_x = intval(($imgInfo["width"] - $srcW) / 2);
                        $src_y = intval(($imgInfo["height"] - $srcH) / 2);
                }

                break;
        }
        if (function_exists("imagecreatetruecolor")) {
            $newImg = imagecreatetruecolor($newWidth, $newHeight);
            $background = imagecolorallocate($newImg, 255, 255, 255);
            imagefill($newImg, 0, 0, $background);
            ImageCopyResampled($newImg, $img, $dest_x, $dest_y, $src_x, $src_y, $smallWidth, $smallHeight, $srcW, $srcH);
        } else {
            $newImg = imagecreatetruecolor($newWidth, $newHeight);
            ImageCopyResized($newImg, $img, $dest_x, $dest_y, $src_x, $src_y, $smallWidth, $smallHeight, $srcW, $srcH);
        }
        $smallFolder = $this->getFolder($savePath . "/" . $folder);
        if (file_exists($smallFolder . "/" . $newName)) unlinkFile($smallFolder . "/" . $newName);
        ImageJpeg($newImg, $smallFolder . "/" . $newName, $quality);
        ImageDestroy($newImg);
        ImageDestroy($img);
        return $smallFolder . "/" . $newName;
    }

    /**
     * 生成水印图片
     */
    public function waterMark($markConfig, $remote = false)
    {
        $waterMarkWidth = $markConfig["waterMarkWidth"];
        $waterMarkHeight = $markConfig["waterMarkHeight"];
        $waterMarkPostion = $markConfig["waterMarkPostion"];
        $waterMarkType = $markConfig["waterMarkType"];
        $waterMarkText = $markConfig["waterMarkText"];
        $markFontfamily = $markConfig["markFontfamily"];
        $markFontsize = $markConfig["markFontsize"];
        $markFontColor = $markConfig["markFontColor"];
        $markFile = $markConfig["markFile"];
        $markPadding = $markConfig["markPadding"];
        $markTransparent = $markConfig["markTransparent"];
        $markQuality = $markConfig["markQuality"];

        if ($remote) {
            $imgInfo = $remote['imgInfo'];
            $photo = $remote['fullName']; //获得图片源
            $savePath = $remote['savePath'];
        } else {
            $imgInfo = $this->getImgInfo();
            $photo = $this->fullName; //获得图片源
            $savePath = $this->config["savePath"];
        }

        // $imgInfo = $this->getImgInfo();
        // $photo = $this->fullName;
        //$text = iconv("GB2312","UTF-8",$waterMarkText);
        $text = $waterMarkText;
        switch ($imgInfo["type"]) {
            case 1:
                $img   = imagecreatefromgif($photo);
                $img_t = ".gif";
                break;
            case 2:
                $img   = imagecreatefromjpeg($photo);
                $img_t = ".jpg";
                break;
            case 3:
                $img   = imagecreatefrompng($photo);
                $img_t = ".png";
                break;
            default:
                $this->stateInfo = "不支持的图片文件类型！";
                return false;
        }
        $newName = $imgInfo["name"];
        if (empty($img)) return False;
        $width  = $imgInfo["width"];
        $height = $imgInfo["height"];

        //原图如果增加水印，会增加原图大小，尺寸大于1500*1500的，这里做强制缩放到1500以内
        //$width_ = $width;
        //$width = $width_ > 1500 ? 1500 : $width;
        //$height = $width_ > 1500 ? 1500 / $width_ * $height : $height;

        if (function_exists("imagecreatetruecolor")) {
            $newImg = @imagecreatetruecolor($width, $height);
            $background = imagecolorallocate($newImg, 255, 255, 255);
            imagefill($newImg, 0, 0, $background);
            ImageCopyResampled($newImg, $img, 0, 0, 0, 0, $width, $height, $imgInfo["width"], $imgInfo["height"]);
        } else {
            $newImg = imagecreate($width, $height);
            ImageCopyResized($newImg, $img, 0, 0, 0, 0, $width, $height, $imgInfo["width"], $imgInfo["height"]);
        }

        if (($width < $waterMarkWidth && $waterMarkWidth != 0) || ($height < $waterMarkHeight && $waterMarkHeight != 0) || $imgInfo["type"] == 1) {
            return;  //水印图片大于图片文件，或者gif图片，则不增加水印
        }

        if ($waterMarkType == 1) { //文本水印

            //计算文本宽高
            function calculateTextBox($text, $fontFile, $markFontsize, $fontAngle)
            {
                $rect = imagettfbbox($markFontsize, $fontAngle, $fontFile, $text);
                $minX = min(array($rect[0], $rect[2], $rect[4], $rect[6]));
                $maxX = max(array($rect[0], $rect[2], $rect[4], $rect[6]));
                $minY = min(array($rect[1], $rect[3], $rect[5], $rect[7]));
                $maxY = max(array($rect[1], $rect[3], $rect[5], $rect[7]));

                return array(
                    "left"   => abs($minX) - 1,
                    "top"    => abs($minY) - 1,
                    "width"  => $maxX - $minX,
                    "height" => $maxY - $minY,
                    "box"    => $rect
                );
            }

            $the_box = calculateTextBox($text, HUONIAOINC . "/data/fonts/" . $markFontfamily, $markFontsize, 0);  // 水印文字, 字体文件, 字体大小, 垂直角度 ————获取水印文字宽高！

            //判断水印位置
            if ($waterMarkPostion == 0) {
                //随机
                $mark_x = rand(0, ($width - $the_box["width"]));
                $mark_y = rand(0, ($height - $the_box["height"]));
            } elseif ($waterMarkPostion == 1) {
                //左上角
                $mark_x = $the_box["left"] + $markPadding;
                $mark_y = $the_box["top"] + $markPadding;
            } elseif ($waterMarkPostion == 2) {
                //顶端居中
                $mark_x = $the_box["left"] - $markPadding + ($width / 2) - ($the_box["width"] / 2);
                $mark_y = $the_box["top"] + $markPadding;
            } elseif ($waterMarkPostion == 3) {
                //右上角
                $mark_x = $the_box["left"] - $markPadding + $width - $the_box["width"];
                $mark_y = $mark_y = $the_box["top"] + $markPadding;
            } elseif ($waterMarkPostion == 4) {
                //左居中
                $mark_x = $the_box["left"] + $markPadding;
                $mark_y = $the_box["top"] - $markPadding + ($height / 2) - ($the_box["height"] / 2);
            } elseif ($waterMarkPostion == 5) {
                //居中
                $mark_x = $the_box["left"] - $markPadding + ($width / 2) - ($the_box["width"] / 2);
                $mark_y = $the_box["top"] - $markPadding + ($height / 2) - ($the_box["height"] / 2);
            } elseif ($waterMarkPostion == 6) {
                //右居中
                $mark_x = $the_box["left"] - $markPadding + $width - $the_box["width"];
                $mark_y = $the_box["top"] - $markPadding + ($height / 2) - ($the_box["height"] / 2);
            } elseif ($waterMarkPostion == 7) {
                //左下角
                $mark_x = $the_box["left"] + $markPadding;
                $mark_y = $the_box["top"] - $markPadding + $height - $the_box["height"];
            } elseif ($waterMarkPostion == 8) {
                //底端居中
                $mark_x = $the_box["left"] - $markPadding + ($width / 2) - ($the_box["width"] / 2);
                $mark_y = $the_box["top"] - $markPadding + $height - $the_box["height"];
            } elseif ($waterMarkPostion == 9) {
                //右下角
                $mark_x = $the_box["left"] - $markPadding + $width - $the_box["width"];
                $mark_y = $the_box["top"] - $markPadding + $height - $the_box["height"];
            } else {
                //随机
                $mark_x = rand(0, ($width - $the_box["width"]));
                $mark_y = rand(0, ($height - $the_box["height"]));
            }

            //将 十六进制 转 RGB
            if (!empty($markFontColor) && (strlen($markFontColor) == 7)) {
                $R = hexdec(substr($markFontColor, 1, 2));
                $G = hexdec(substr($markFontColor, 3, 2));
                $B = hexdec(substr($markFontColor, 5));
            } else {
                $this->stateInfo = "水印文字颜色格式不正确！";
                return;
            }

            $font_color = imagecolorclosestalpha($newImg, $R, $G, $B, 100 - $markTransparent); //字体颜色

            //平铺，多个水平铺满
            if($waterMarkPostion == 10){

                $angle = 22.5;

                //密集度优化问题
                $ppboxh = $the_box["height"];
                $ppboxw = $the_box["width"];
                if(mb_strlen($text)<=5){
                    $ppboxh += 140;
                    $ppboxw += 100;
                }
                elseif(mb_strlen($text)>10){
                    $ppboxh += 40;
                    $ppboxw += 20;
                }
                else{
                    $ppboxh += 80;
                    $ppboxw += 40;
                }

                $ycount = (int)($height/$ppboxh)+10;  //防止边缘位置铺不到，多铺一点
                $xcount = (int)($width/$ppboxw)+10;

                for($ii=0;$ii<$ycount;$ii++){
                    for ($jj=0;$jj<$xcount;$jj++){
                        $xrand = 50 * ($jj);  //右上角往左下角铺
                        $mark_y = ($jj-1) * ($ppboxh+100) + 40;     // y大
                        $mark_x = ($ii-1) * ($ppboxw+80) - $xrand;  // x小
                        ImageTTFText($newImg, $markFontsize, $angle, $mark_x, $mark_y, $font_color, HUONIAOINC . "/data/fonts/" . $markFontfamily, $text);  //水印文字 (图像文件, 字体大小, 垂直角度, 左边距离, 底边距离, 字体颜色, 字体, 编码)
                    }
                }

            }
            //其他，均为单个
            else{
                ImageTTFText($newImg, $markFontsize, 0, $mark_x, $mark_y, $font_color, HUONIAOINC . "/data/fonts/" . $markFontfamily, $text);  //水印文字 (图像文件, 字体大小, 垂直角度, 左边距离, 底边距离, 字体颜色, 字体, 编码)
            }

        } else {

            $water_info = getimagesize(HUONIAOINC . "/data/mark/" . $markFile);
            $water_w = $water_info[0];
            $water_h = $water_info[1];

            if ($width < $water_w || $height < $water_h) {
                return;  //水印图片大于图片文件
            }

            switch ($waterMarkPostion) {
                case 0: //随机
                    $posX = rand(0, ($width - $water_w));
                    $posY = rand(0, ($height - $water_h));
                    break;
                case 1: //左上角
                    $posX = $markPadding;
                    $posY = $markPadding;
                    break;
                case 2: //顶端居中
                    $posX = ($width - $water_w) / 2;
                    $posY = $markPadding;
                    break;
                case 3: //右上角
                    $posX = $width - $water_w - $markPadding;
                    $posY = $markPadding;
                    break;
                case 4: //左居中
                    $posX = $markPadding;
                    $posY = ($height - $water_h) / 2;
                    break;
                case 5: //居中
                    $posX = ($width - $water_w) / 2;
                    $posY = ($height - $water_h) / 2;
                    break;
                case 6: //右居中
                    $posX = $width - $water_w - $markPadding;
                    $posY = ($height - $water_h) / 2;
                    break;
                case 7: //左下角
                    $posX = $markPadding;
                    $posY = $height - $water_h - $markPadding;
                    break;
                case 8: //底端居中
                    $posX = ($width - $water_w) / 2;
                    $posY = $height - $water_h - $markPadding;
                    break;
                case 9: //右下角
                    $posX = $width - $water_w - $markPadding;
                    $posY = $height - $water_h - $markPadding;
                    break;
                default: //随机
                    $posX = rand(0, ($width - $water_w));
                    $posY = rand(0, ($height - $water_h));
                    break;
            }


            //设定图像的混色模式
            imagealphablending($newImg, true);

            if ($waterMarkType == 2) { //png格式水印

                //平铺水印
                if($waterMarkPostion == 10){
                    $ppboxh = $water_h + 100;  //图片高度
                    $ppboxw = $water_w + 100;  //图片宽度

                    $ycount = (int)($height/$ppboxh)+10;  //防止边缘位置铺不到，多铺一点
                    $xcount = (int)($width/$ppboxw)+10;

                    for($ii=0;$ii<$ycount;$ii++){
                        for ($jj=0;$jj<$xcount;$jj++){
                            $xrand = (int)($ppboxw/3 + 20) * ($jj); //左上角往右上角铺
                            $posX = ($jj) * ($ppboxh + 80);  // x大
                            $posY = ($ii) * $ppboxw - $xrand + 30;  // y 小

                            imagecopy($newImg, imagecreatefrompng(HUONIAOINC . "/data/mark/" . $markFile), $posX, $posY, 0, 0, $water_w, $water_h);
                        }
                    }
                }
                //单个水印
                else{
                    //imagecopy不能加透明度，要用imagecopymerge，参数基本相同，要用imagecopymerge最后多的一个参数是透明度
//                    imagecopymerge($newImg, imagecreatefrompng(HUONIAOINC . "/data/mark/" . $markFile), $posX, $posY, 0, 0, $water_w, $water_h,$markTransparent);
                    imagecopy($newImg, imagecreatefrompng(HUONIAOINC . "/data/mark/" . $markFile), $posX, $posY, 0, 0, $water_w, $water_h);
                }

            } elseif ($waterMarkType == 3) { //gif格式水印
                imagecopymerge($newImg, imagecreatefromgif(HUONIAOINC . "/data/mark/" . $markFile), $posX, $posY, 0, 0, $water_w, $water_h, $markTransparent);
            }
        }

        $watermark = $this->getFolder($savePath . "/large");
        if (file_exists($watermark . "/" . $newName)) unlinkFile($watermark . "/" . $newName);
        @ImageJpeg($newImg, $watermark . "/" . $newName, $markQuality);

        ImageDestroy($newImg);
        ImageDestroy($img);
    }

    // 判断文件是否存在
    public static function remoteFileExists($url){
        $curl = curl_init($url);
        curl_setopt($curl, CURLOPT_NOBODY, true);
        curl_setopt($curl, CURLOPT_TIMEOUT, 2);
        $result = curl_exec($curl);
        $ret = false;
        if ($result !== false) {
            $statusCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
            if ($statusCode == 200 || $statusCode == 302) {
                $ret = true;
            }
        }
        curl_close($curl);
        return $ret;
    }
}
