<?php  if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 字符串插件
 *
 * @version        $Id: string.class.php 2013-7-7 上午10:33:36 $
 * @package        HuoNiao.class
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

//拼音的缓冲数组
$pinyins = Array();

/**
 *  中文截取，支持多编码
 *  如果是request的内容，必须使用这个函数
 *
 * @access    public
 * @param     string  $str  需要截取的字符串
 * @param     int  $slen  截取的长度
 * @return    string
 */
if (!function_exists('cn_substrR')){
    function cn_substrR($str,$slen){
		$returnstr = '';
		$i = 0;
		$n = 0;
		$str_length = mb_strlen($str); //字符串的字节数
		while (($n < $slen) and($i <= $str_length)) {
			$temp_str = mb_substr($str, $i, 1);
			$ascnum = Ord($temp_str); //得到字符串中第$i位字符的ascii码
			if ($ascnum >= 224) //如果ASCII位高与224，
			{
				$returnstr = $returnstr.mb_substr($str, $i, 1); //根据UTF-8编码规范，将3个连续的字符计为单个字符
				$i = $i + 1; //实际Byte计为3
				$n++; //字串长度计1
			}
			elseif($ascnum >= 192) //如果ASCII位高与192，
			{
				$returnstr = $returnstr.mb_substr($str, $i, 1); //根据UTF-8编码规范，将2个连续的字符计为单个字符
				$i = $i + 1; //实际Byte计为2
				$n++; //字串长度计1
			}
			elseif($ascnum >= 65 && $ascnum <= 90) //如果是大写字母，
			{
				$returnstr = $returnstr.mb_substr($str, $i, 1);
				$i = $i + 1; //实际的Byte数仍计1个
				$n++; //但考虑整体美观，大写字母计成一个高位字符
			} else //其他情况下，包括小写字母和半角标点符号，
			{
                $returnstr = $returnstr.mb_substr($str, $i, 1);
                $i = $i + 1; //实际的Byte数计1个
                $n = $n + 0.5; //小写字母和半角标点等与半个高位字符宽...
			}
		}
		if ($str_length > $slen) {
			$returnstr = $returnstr; //超过长度时在尾处加上省略号
		}
		return $returnstr;
    }
}

/**
 *  HTML转换为文本
 *
 * @param    string  $str 需要转换的字符串
 * @param    string  $r   如果$r=0直接返回内容,否则需要使用反斜线引用字符串
 * @return   string
 */
if (!function_exists('Html2Text')){
    function Html2Text($str,$r=0){
        if($r==0){
            return SpHtml2Text($str);
        }else{
            $str = SpHtml2Text(stripslashes($str));
            return addslashes($str);
        }
    }
}

function SpHtml2Text($str){
	$str = preg_replace("/<sty(.*)\\/style>|<scr(.*)\\/script>|<!--(.*)-->/isU","",$str);
	$alltext = "";
	$start = 1;
	for($i=0;$i<strlen($str);$i++){
		if($start==0 && $str[$i]==">"){
			$start = 1;
		}else if($start==1){
			if($str[$i]=="<"){
				$start = 0;
				$alltext .= " ";
			}else if(ord($str[$i])>31){
				$alltext .= $str[$i];
			}
		}
	}
	$alltext = str_replace("　"," ",$alltext);
	$alltext = preg_replace("/&([^;&]*)(;|&)/","",$alltext);
	$alltext = preg_replace("/[ ]+/s"," ",$alltext);
	return $alltext;
}


/**
 *  文本转HTML
 *
 * @param    string  $txt 需要转换的文本内容
 * @return   string
 */
if (!function_exists('Text2Html')){
    function Text2Html($txt){
        $txt = str_replace("  ", "　", $txt);
        $txt = str_replace("<", "&lt;", $txt);
        $txt = str_replace(">", "&gt;", $txt);
        $txt = preg_replace("/[\r\n]{1,}/isU", "<br/>\r\n", $txt);
        return $txt;
    }
}

/**
 *  获取半角字符
 *
 * @param     string  $fnum  数字字符串
 * @return    string
 */
if (!function_exists('GetAlabNum')){
    function GetAlabNum($fnum){
        $nums = array("０","１","２","３","４","５","６","７","８","９");
        //$fnums = "0123456789";
        $fnums = array("0","1","2","3","4","5","6","7","8","9");
        $fnum = str_replace($nums, $fnums, $fnum);
        $fnum = preg_replace("/[^0-9\.-]/", '', $fnum);
        if($fnum==''){
            $fnum=0;
        }
        return $fnum;
    }
}

/**
 *  获取拼音以gbk编码为准
 *
 * @access    public
 * @param     string  $str     字符串信息
 * @param     int     $ishead  是否取头字母
 * @param     int     $isclose 是否关闭字符串资源
 * @return    string
 */
if (!function_exists('GetPinyin')){
    function GetPinyin($str, $ishead=0, $isclose=1){
        global $cfg_soft_lang;
        if($cfg_soft_lang=='utf-8'){
            return SpGetPinyin(utf82gb($str), $ishead, $isclose);
        }else{
            return SpGetPinyin($str, $ishead, $isclose);
        }
    }
}

/**
 *  获取拼音信息
 *
 * @access    public
 * @param     string  $str  字符串
 * @param     int  $ishead  是否为首字母
 * @param     int  $isclose  解析后是否释放资源
 * @return    string
 */
function SpGetPinyin($str, $ishead=0, $isclose=1){
    global $pinyins;
    $restr = '';
    $str = trim($str);
    $slen = strlen($str);
    if($slen < 2){
        return $str;
    }
    if(@count($pinyins) == 0){
        $fp = fopen(HUONIAOINC.'/data/pinyin.dat', 'r');
        while(!feof($fp)){
            $line = trim(fgets($fp));
            $pinyins[$line[0].$line[1]] = substr($line, 3, strlen($line)-3);
        }
        fclose($fp);
    }
    for($i=0; $i<$slen; $i++){
        if(ord($str[$i])>0x80){
            $c = $str[$i].$str[$i+1];
            $i++;
            if(isset($pinyins[$c])){
                if($ishead==0){
                    $restr .= $pinyins[$c];
                }else{
                    $restr .= $pinyins[$c][0];
                }
            }else{
                $restr .= "_";
            }
        }else if(preg_match("/[a-z0-9]/i", $str[$i])){
            $restr .= $str[$i];
        }else{
            $restr .= "_";
        }
    }
    if($isclose==0){
        unset($pinyins);
    }
    return strtolower($restr);
}


/**
 *  将实体html代码转换成标准html代码（兼容php4）
 *
 * @access    public
 * @param     string  $str     字符串信息
 * @param     long    $options  替换的字符集
 * @return    string
 */

if (!function_exists('htmlspecialchars_decode')){
	function htmlspecialchars_decode($str, $options=ENT_COMPAT) {
		$trans = get_html_translation_table(HTML_SPECIALCHARS, $options);

		$decode = array();
		foreach ($trans AS $char=>$entity) {
			$decode[$entity] = $char;
		}

		$str = strtr($str, $decode);
		return $str;
	}
}

if (!function_exists('ubb')){
	function ubb($Text) {
		$Text=trim($Text);
		//$Text=htmlspecialchars($Text);
		//$Text=ereg_replace("\n","<br>",$Text);
		$Text=preg_replace("/\\t/is","  ",$Text);
		$Text=preg_replace("/\[hr\]/is","<hr>",$Text);
		$Text=preg_replace("/\[separator\]/is","<br/>",$Text);
		$Text=preg_replace("/\[h1\](.+?)\[\/h1\]/is","<h1>\\1</h1>",$Text);
		$Text=preg_replace("/\[h2\](.+?)\[\/h2\]/is","<h2>\\1</h2>",$Text);
		$Text=preg_replace("/\[h3\](.+?)\[\/h3\]/is","<h3>\\1</h3>",$Text);
		$Text=preg_replace("/\[h4\](.+?)\[\/h4\]/is","<h4>\\1</h4>",$Text);
		$Text=preg_replace("/\[h5\](.+?)\[\/h5\]/is","<h5>\\1</h5>",$Text);
		$Text=preg_replace("/\[h6\](.+?)\[\/h6\]/is","<h6>\\1</h6>",$Text);
		$Text=preg_replace("/\[center\](.+?)\[\/center\]/is","<center>\\1</center>",$Text);
		//$Text=preg_replace("/\[url=([^\[]*)\](.+?)\[\/url\]/is","<a href=\\1 target='_blank'>\\2</a>",$Text);
		$Text=preg_replace("/\[url\](.+?)\[\/url\]/is","<a href=\"\\1\" target='_blank'>\\1</a>",$Text);
		$Text=preg_replace("/\[url=(http:\/\/.+?)\](.+?)\[\/url\]/is","<a href='\\1' target='_blank'>\\2</a>",$Text);
		$Text=preg_replace("/\[url=(.+?)\](.+?)\[\/url\]/is","<a href=\\1>\\2</a>",$Text);
		$Text=preg_replace("/\[img\](.+?)\[\/img\]/is","<img src=\\1>",$Text);
		$Text=preg_replace("/\[img\s(.+?)\](.+?)\[\/img\]/is","<img \\1 src=\\2>",$Text);
		$Text=preg_replace("/\[color=(.+?)\](.+?)\[\/color\]/is","<font color=\\1>\\2</font>",$Text);
		$Text=preg_replace("/\[colorTxt\](.+?)\[\/colorTxt\]/eis","color_txt('\\1')",$Text);
		$Text=preg_replace("/\[style=(.+?)\](.+?)\[\/style\]/is","<div class='\\1'>\\2</div>",$Text);
		$Text=preg_replace("/\[size=(.+?)\](.+?)\[\/size\]/is","<font size=\\1>\\2</font>",$Text);
		$Text=preg_replace("/\[sup\](.+?)\[\/sup\]/is","<sup>\\1</sup>",$Text);
		$Text=preg_replace("/\[sub\](.+?)\[\/sub\]/is","<sub>\\1</sub>",$Text);
		$Text=preg_replace("/\[pre\](.+?)\[\/pre\]/is","<pre>\\1</pre>",$Text);
		$Text=preg_replace("/\[emot\](.+?)\[\/emot\]/eis","emot('\\1')",$Text);
		$Text=preg_replace("/\[email\](.+?)\[\/email\]/is","<a href='mailto:\\1'>\\1</a>",$Text);
		$Text=preg_replace("/\[i\](.+?)\[\/i\]/is","<i>\\1</i>",$Text);
		$Text=preg_replace("/\[u\](.+?)\[\/u\]/is","<u>\\1</u>",$Text);
		$Text=preg_replace("/\[b\](.+?)\[\/b\]/is","<b>\\1</b>",$Text);
		$Text=preg_replace("/\[quote\](.+?)\[\/quote\]/is","<blockquote>引用:<div style='border:1px solid silver;background:#EFFFDF;color:#393939;padding:5px' >\\1</div></blockquote>", $Text);
		$Text=preg_replace("/\[sig\](.+?)\[\/sig\]/is","<div style='text-align: left; color: darkgreen; margin-left: 5%'><br><br>--------------------------<br>\\1<br>--------------------------</div>", $Text);
		return $Text;
	}
}


/**
 *  文档自动分页
 *
 * @access    public
 * @param     string  $mybody  内容
 * @param     string  $spsize  分页大小
 * @param     string  $sptag  分页标记
 * @return    string
 */
function SpLongBody($mybody, $spsize, $sptag){
    if(strlen($mybody) < $spsize){
        return $mybody;
    }
    $mybody = stripslashes($mybody);
    $bds = explode('<', $mybody);
    $npageBody = '';
    $istable = 0;
    $mybody = '';
    foreach($bds as $i=>$k){
        if($i==0){
            $npageBody .= $bds[$i]; continue;
        }
        $bds[$i] = "<".$bds[$i];
        if(strlen($bds[$i])>6){
            $tname = substr($bds[$i],1,5);
            if(strtolower($tname)=='table'){
                $istable++;
            }else if(strtolower($tname)=='/tabl'){
                $istable--;
            }
            if($istable>0){
                $npageBody .= $bds[$i]; continue;
            }else{
                $npageBody .= $bds[$i];
            }
        }else{
            $npageBody .= $bds[$i];
        }
        if(strlen($npageBody)>$spsize){
            $mybody .= $npageBody.$sptag;
            $npageBody = '';
        }
    }
    if($npageBody!=''){
        $mybody .= $npageBody;
    }
    return addslashes($mybody);
}

/**
 * 处理HTML文本
 * 自动获取关键字、描述
 *
 * @access    public
 * @param     string  $body  内容
 * @param     string  $litpic  缩略图
 * @return    string
 */
function AnalyseHtmlBody($body, &$description, &$keywords, $title = ''){
    global $cfg_soft_lang;
    $body = stripslashes($body);

    //自动获取关键词
    if(empty($keywords)){

        if(!empty($title) && !empty($body)){
          global $cfg_nlp_AppID;
          global $cfg_nlp_APIKey;
          global $cfg_nlp_Secret;

          if($cfg_nlp_AppID && $cfg_nlp_APIKey && $cfg_nlp_Secret){
            //百度AI 自然语言处理 文章标签  https://ai.baidu.com/tech/nlp/doctagger
            require_once(HUONIAOINC."/class/AipNlp.class.php");
            $client = new AipNlp($cfg_nlp_AppID, $cfg_nlp_APIKey, $cfg_nlp_Secret);

            // 调用文章标签
            $res = $client->keyword($title, htmlentities(strip_tags($body)));
            if(is_array($res) && !$res['error_code']){
              $items = $res['items'];
              $keywordsArr = array();
              $i = 0;
              foreach ($items as $key => $value) {
                //只取前10个关键词
                if($i < 10){
                  array_push($keywordsArr, $value['tag']);
                }
                $i++;
              }
              $keywords = join(' ', $keywordsArr);
            }
          }
        }

        //如果上面没有取到则使用系统默认提供的方法
        if(empty($keywords)){
          require_once(HUONIAOINC."/class/splitword.class.php");
          $sp = new splitword($cfg_soft_lang, $cfg_soft_lang);
          $sp->SetSource($title, $cfg_soft_lang, $cfg_soft_lang);
          $sp->StartAnalysis();
          $titleindexs = preg_replace("/_huoniao_page_break_tag_/",'',$sp->GetFinallyIndex());
          $sp->SetSource(Html2Text($body), $cfg_soft_lang, $cfg_soft_lang);
          $sp->StartAnalysis();
          $allindexs = preg_replace("/_huoniao_page_break_tag_/",'',$sp->GetFinallyIndex());

          if(is_array($allindexs) && is_array($titleindexs)){
              foreach($titleindexs as $k => $v){
                  if(strlen($keywords.$k) >= 40){
                      break;
                  }else{
                      if(strlen($k) <= 2) continue;
                      $keywords .= $k.' ';
                  }
              }
              foreach($allindexs as $k => $v){
                  if(strlen($keywords.$k) >= 40){
                      break;
                  }else if(!in_array($k,$titleindexs)){
                      if(strlen($k) <= 2) continue;
                      $keywords .= $k.' ';
                  }
              }

              $keywords = substr($keywords, 0, -1);
          }
        }

    }

    //自动摘要
    if(empty($description)){
        $description = cn_substrR(html2text($body), 150);
        $description = trim(preg_replace('/_huoniao_page_break_tag_/','',$description));
        $description = addslashes($description);
    }

    $body = addslashes($body);
    return $body;
}

/**
 * 处理HTML文本
 * 删除非站外链接、自动获取缩略图
 *
 * @access    public
 * @param     string  $body  内容
 * @param     string  $litpic  缩略图
 * @return    string
 */
function AnalyseHtmlBodyLinkLitpic($body, &$litpic){
    global $dellink, $autolitpic, $title, $cfg_soft_lang;
    $body = stripslashes($body);

    $body = str_replace('!important', '', $body);

    //删除非站内链接
    if($dellink == 1){
        $allow_urls = array($_SERVER['HTTP_HOST']);
        //读取允许的超链接设置
        if(file_exists(HUONIAODATA."/admin/allowurl.txt")){
            $allow_urls = array_merge($allow_urls, file(HUONIAODATA."/admin/allowurl.txt"));
        }
        $body = Replace_Links($body, $allow_urls);
    }

    //自动获取缩略图
    if($autolitpic == 1 && $litpic == ''){
        $litpic = GetDDImgFromBody($body);
    }

    return $body;
}



/**
 *  删除非站内链接
 *
 * @access    public
 * @param     string  $body  内容
 * @param     array  $allow_urls  允许的超链接
 * @return    string
 */
function Replace_Links(&$body, $allow_urls=array()){
    $host_rule = join('|', $allow_urls);
    $host_rule = preg_replace("#[\n\r]#", '', $host_rule);
    $host_rule = str_replace('.', "\\.", $host_rule);
    $host_rule = str_replace('/', "\\/", $host_rule);
    $arr = '';
    preg_match_all("#<a([^>]*)>(.*)<\/a>#iU", $body, $arr);
    if(is_array($arr[0])){
        $rparr = array();
        $tgarr = array();
        foreach($arr[0] as $i=>$v){
            if($host_rule != '' && preg_match('#'.$host_rule.'#i', $arr[1][$i])){
                continue;
            }else{
                $rparr[] = $v;
                $tgarr[] = $arr[2][$i];
            }
        }
        if(!empty($rparr)){
            $body = str_replace($rparr, $tgarr, $body);
        }
    }
    $arr = $rparr = $tgarr = '';
    return $body;
}


/**
 *  取第一个图片为缩略图
 *
 * @access    public
 * @param     string  $body  文档内容
 * @return    string
 */
function GetDDImgFromBody(&$body){
    $litpic = '';
    preg_match_all("/(<img.+src=[\"|'| ]?.+)(.+[\"|'| ])/isU", $body, $img_array);
    $img_array = array_unique($img_array[2]);
    if(count($img_array) > 0){
        $picname = preg_replace("/[\"|'| ]{1,}/", '', $img_array[0]);
        if(preg_match("#attachment.php#", $picname)) {
          $arr = explode('/include/attachment.php?f=', $picname);
          $litpic = $arr[1];
        }else{
          $litpic = $picname;
        }
        // else $litpic = GetDDImage('ddfirst', $picname, 1);
    }
    return $litpic;
}


/**
 *  删除字符串中的emoji字符
 *
 * @access    public
 * @param     string  $body  文档内容
 * @return    string
 */
function removeEmojiChar($str){
    $mbLen = mb_strlen($str);
    
    $strArr = [];
    for ($i = 0; $i < $mbLen; $i++) {
        $mbSubstr = mb_substr($str, $i, 1, 'utf-8');
        if (strlen($mbSubstr) >= 4) {
            continue;
        }
        $strArr[] = $mbSubstr;
    }
    
    return implode('', $strArr);
}