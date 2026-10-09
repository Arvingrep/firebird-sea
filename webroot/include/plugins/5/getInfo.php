<?php
require_once('../../common.inc.php');
require_once 'service/ImagesService.php';

//登录验证
if($userLogin->getUserID()==-1 && $v != 'editor'){
  $ret = json_encode(array(
    "state" => "101",
    "info" => "管理员信息读取失败或登录超时，请重新登录网站后台，登录成功后，再使用此功能！"
  ));
  if($callback){
  	echo $callback."(".$ret.")";
  }else{
  	echo $ret;
  }
  die;
}

if($v == 'editor' && $userLogin->getUserID()==-1 && $userLogin->getMemberID()==-1){
  $ret = json_encode(array(
    "state" => "101",
    "info" => "请登录后使用！"
  ));
  if($callback){
  	echo $callback."(".$ret.")";
  }else{
  	echo $ret;
  }
  die;
}

class Readability {
    // 保存判定结果的标记位名称
    const ATTR_CONTENT_SCORE = "contentScore";

    // DOM 解析类目前只支持 UTF-8 编码
    const DOM_DEFAULT_CHARSET = "utf-8";

    // 当判定失败时显示的内容
    const MESSAGE_CAN_NOT_GET = "Readability was unable to parse this page for content.";

    // DOM 解析类（PHP5 已内置）
    protected $DOM = null;

    // 需要解析的源代码
    protected $source = "";

    // 章节的父元素列表
    private $parentNodes = array();

    // 需要删除的标签
    // Note: added extra tags from https://github.com/ridcully
    private $junkTags = Array("style", "form", "iframe", "script", "button", "input", "textarea",
                                "noscript", "select", "option", "object", "applet", "basefont",
                                "bgsound", "blink", "canvas", "command", "menu", "nav", "datalist",
                                "embed", "frame", "frameset", "keygen", "label", "marquee", "link");

    // 需要删除的属性
    private $junkAttrs = Array("style", "class", "onclick", "onmouseover", "align", "border", "margin");


    /**
     * 构造函数
     *      @param $input_char 字符串的编码。默认 utf-8，可以省略
     */
    function __construct($url = '') {

        if(empty($url)) {
          $data = array(
            "state" => "101",
            "info" => "要转载的网址读取失败！"
          );
          if($callback){
            echo $callback."(".json_encode($data).")";
          }else{
            echo json_encode($data);
          }
          die;
        }

        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_HEADER, 0);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($curl, CURLOPT_TIMEOUT, 30);

        //添加请求头
        $headers = [
            'User-Agent:' . $_SERVER['HTTP_USER_AGENT']
        ];
        curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);

        $source = curl_exec($curl);
        curl_close($curl);

        if(empty($source)) {
          if(empty($url)) {
            $data = array(
              "state" => "101",
              "info" => "信息采集失败！"
            );
            if($callback){
              echo $callback."(".json_encode($data).")";
            }else{
              echo json_encode($data);
            }
            die;
          }
        }

        //取编码
        $input_char = mb_detect_encoding($source, array('UTF-8', "GB2312", "GBK"));
        $input_char = $input_char != 'UTF-8' && $input_char != 'GB2312' && $input_char != 'GBK' ? 'GBK' : $input_char;

        $this->url = $url;
        $this->source = $source;

		//微信公众号文章单独获取
		if(!strstr($this->url, 'mp.weixin.qq.com')){

	        // DOM 解析类只能处理 UTF-8 格式的字符
	        $source = mb_convert_encoding($source, 'HTML-ENTITIES', $input_char);

	        // 预处理 HTML 标签，剔除冗余的标签等
	        $source = $this->preparSource($source);

	        // 生成 DOM 解析类
	        $this->DOM = new DOMDocument('1.0', $input_char);
	        try {
	            //libxml_use_internal_errors(true);
	            // 会有些错误信息，不过不要紧 :^)
	            if (!@$this->DOM->loadHTML('<?xml encoding="'.Readability::DOM_DEFAULT_CHARSET.'">'.$source)) {
	                throw new Exception("Parse HTML Error!");
	            }

	            foreach ($this->DOM->childNodes as $item) {
	                if ($item->nodeType == XML_PI_NODE) {
	                    $this->DOM->removeChild($item); // remove hack
	                }
	            }

	            // insert proper
	            $this->DOM->encoding = Readability::DOM_DEFAULT_CHARSET;
	        } catch (Exception $e) {
	            // ...
	        }

		}

    }


    /**
     * 预处理 HTML 标签，使其能够准确被 DOM 解析类处理
     *
     * @return String
     */
    private function preparSource($string) {
        // 剔除多余的 HTML 编码标记，避免解析出错
        preg_match("/charset=([\w|\-]+);?/", $string, $match);
        if (isset($match[1])) {
            $string = preg_replace("/charset=([\w|\-]+);?/", "", $string, 1);
        }

        // Replace all doubled-up <BR> tags with <P> tags, and remove fonts.
        $string = preg_replace("/<br\/?>[ \r\n\s]*<br\/?>/i", "</p><p>", $string);
        $string = preg_replace("/<\/?font[^>]*>/i", "", $string);

        // @see https://github.com/feelinglucky/php-readability/issues/7
        //   - from http://stackoverflow.com/questions/7130867/remove-script-tag-from-html-content
        $string = preg_replace("#<script(.*?)>(.*?)</script>#is", "", $string);

        return trim($string);
    }


    /**
     * 删除 DOM 元素中所有的 $TagName 标签
     *
     * @return DOMDocument
     */
    private function removeJunkTag($RootNode, $TagName) {

        $Tags = $RootNode->getElementsByTagName($TagName);

        //Note: always index 0, because removing a tag removes it from the results as well.
        while($Tag = $Tags->item(0)){
            $parentNode = $Tag->parentNode;
            $parentNode->removeChild($Tag);
        }

        return $RootNode;

    }

    /**
     * 删除元素中所有不需要的属性
     */
    private function removeJunkAttr($RootNode, $Attr) {
        $Tags = $RootNode->getElementsByTagName("*");

        $i = 0;
        while($Tag = $Tags->item($i++)) {
            $Tag->removeAttribute($Attr);
        }

        return $RootNode;
    }

    /**
     * 根据评分获取页面主要内容的盒模型
     *      判定算法来自：http://code.google.com/p/arc90labs-readability/
     *      这里由郑晓博客转发
     * @return DOMNode
     */
    private function getTopBox() {
        // 获得页面所有的章节
        $allParagraphs = $this->DOM->getElementsByTagName("p");

        // Study all the paragraphs and find the chunk that has the best score.
        // A score is determined by things like: Number of <p>'s, commas, special classes, etc.
        $i = 0;
        while($paragraph = $allParagraphs->item($i++)) {
            $parentNode   = $paragraph->parentNode;
            $contentScore = intval($parentNode->getAttribute(Readability::ATTR_CONTENT_SCORE));
            $className    = $parentNode->getAttribute("class");
            $id           = $parentNode->getAttribute("id");

            // Look for a special classname
            if (preg_match("/(comment|meta|footer|footnote)/i", $className)) {
                $contentScore -= 50;
            } else if(preg_match(
                "/((^|\\s)(post|hentry|entry[-]?(content|text|body)?|article[-]?(content|text|body)?)(\\s|$))/i",
                $className)) {
                $contentScore += 25;
            }

            // Look for a special ID
            if (preg_match("/(comment|meta|footer|footnote)/i", $id)) {
                $contentScore -= 50;
            } else if (preg_match(
                "/^(post|hentry|entry[-]?(content|text|body)?|article[-]?(content|text|body)?)$/i",
                $id)) {
                $contentScore += 25;
            }

            // Add a point for the paragraph found
            // Add points for any commas within this paragraph
            if (strlen($paragraph->nodeValue) > 10) {
                $contentScore += strlen($paragraph->nodeValue);
            }

            // 保存父元素的判定得分
            $parentNode->setAttribute(Readability::ATTR_CONTENT_SCORE, $contentScore);

            // 保存章节的父元素，以便下次快速获取
            array_push($this->parentNodes, $parentNode);
        }

        $topBox = null;

        // Assignment from index for performance.
        //     See http://www.peachpit.com/articles/article.aspx?p=31567&seqNum=5
        for ($i = 0, $len = sizeof($this->parentNodes); $i < $len; $i++) {
            $parentNode      = $this->parentNodes[$i];
            $contentScore    = intval($parentNode->getAttribute(Readability::ATTR_CONTENT_SCORE));
            $orgContentScore = intval($topBox ? $topBox->getAttribute(Readability::ATTR_CONTENT_SCORE) : 0);

            if ($contentScore && $contentScore > $orgContentScore) {
                $topBox = $parentNode;
            }
        }

        // 此时，$topBox 应为已经判定后的页面内容主元素
        return $topBox;
    }


    /**
     * 获取 HTML 页面标题
     *
     * @return array
     */
    public function getTitle() {
        $split_point = ' - ';
        $split_pointArr = array('|', '_', '-');
        $titleNodes = $this->DOM->getElementsByTagName("title");

        if ($titleNodes->length && $titleNode = $titleNodes->item(0)) {
            // @see http://stackoverflow.com/questions/717328/how-to-explode-string-right-to-left
            $title  = trim($titleNode->nodeValue);

            foreach ($split_pointArr as $key => $value) {
              if(strstr($title, $value)){
                $split_point = $value;
              }
            }

            $result = array_map('strrev', explode($split_point, strrev($title)));
            $result_ = $result;
            return array(
              "title" => sizeof($result) > 1 ? array_pop($result_) : $title,
              "source" => sizeof($result) > 1 ? $result[0] : ""
            );
        }

        return null;
    }


    /**
     * Get Leading Image Url
     *
     * @return String
     */
    public function getLeadImageUrl($node) {
        $images = $node->getElementsByTagName("img");

        if ($images->length && $leadImage = $images->item(0)) {
            return $leadImage->getAttribute("src");
        }

        return null;
    }


    /**
     * 获取页面的主要内容（Readability 以后的内容）
     *
     * @return Array
     */
    public function getContent() {

		//微信公众号文章单独获取
		if(strstr($this->url, 'mp.weixin.qq.com')){

			preg_match_all("/id=\"js_content\"(.*)>(.*)<\/div>(.*)<script/iUs", $this->source, $content, PREG_PATTERN_ORDER);
			$content = trim($content[2][0]);

			$content = str_replace("data-croporisrc", "data-cropori", $content);
			$content = str_replace("data-src", "src", $content);
			$content = str_replace("preview.html", "player.html", $content);

			$imgService = new ImagesService($content);
			$newsHtmlNew = $imgService->getNewsContent();
			$content = !$newsHtmlNew ? $content : $newsHtmlNew;

			// 多个数据，以数组的形式返回
	        return Array(
	            'state' => 100,
	            'url' => $this->url,
	            'litpic' => '',
	            'title' => '',
	            'source' => '',
	            'keywords' => '',
	            'description' => '',
	            'content' => $content
	        );

		//普通文章
		}else{

	        if (!$this->DOM) return false;

	        // 获取页面标题
	        $ContentTitleArr = $this->getTitle();
	        $ContentTitle = $ContentTitleArr['title'];

	        // 来源
	        $ContentSource = $ContentTitleArr['source'];

	        // 获取页面主内容
	        $ContentBox = $this->getTopBox();

	        //Check if we found a suitable top-box.
	        if($ContentBox === null){
	            // throw new RuntimeException(Readability::MESSAGE_CAN_NOT_GET);
	            return array(
	              "state" => "101",
	              "info" => "要转载的网站内容解析失败！"
	            );
	        }

	        // 复制内容到新的 DOMDocument
	        $Target = new DOMDocument;
	        $Target->appendChild($Target->importNode($ContentBox, true));

	        // 删除不需要的标签
	        foreach ($this->junkTags as $tag) {
	            $Target = $this->removeJunkTag($Target, $tag);
	        }

	        // 删除不需要的属性
	        foreach ($this->junkAttrs as $attr) {
	            $Target = $this->removeJunkAttr($Target, $attr);
	        }

	        $content = mb_convert_encoding($Target->saveHTML(), Readability::DOM_DEFAULT_CHARSET, "HTML-ENTITIES");

			$imgService = new ImagesService($content);
			$newsHtmlNew = $imgService->getNewsContent();
			$content = !$newsHtmlNew ? $content : $newsHtmlNew;

	        //提取关键词、描述
	        $keywords = $description = "";
	  		$return = AnalyseHtmlBody(html2text($content), $description, $keywords, $ContentTitle);

	        // 多个数据，以数组的形式返回
	        return Array(
	            'state' => 100,
	            'url' => $this->url,
	            'litpic' => $this->getLeadImageUrl($Target),
	            'title' => $ContentTitle ? trim($ContentTitle) : '',
	            'source' => $ContentSource ? trim($ContentSource) : '',
	            'keywords' => trim($keywords),
	            'description' => trim($description),
	            'content' => $content
	        );
		}

    }

    function __destruct() { }
}


$c = new Readability($_POST['url']);
$data = $c->getContent();

if($callback){
  echo $callback."(".json_encode($data).")";
}else{
  echo json_encode($data);
}
