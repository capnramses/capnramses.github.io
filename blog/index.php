<!DOCTYPE html>
<html>
<head>
<title>Anton's Research Ramblings</title>
<link rel="stylesheet" type="text/css" href="../greysans.css">
<link href='https://fonts.googleapis.com/css?family=Arvo:400,700' rel='stylesheet' type='text/css'>
<link href='https://fonts.googleapis.com/css?family=Source+Code+Pro' rel='stylesheet' type='text/css'>

<script type="text/javascript">

  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-38287357-1']);
  _gaq.push(['_setDomainName', 'antongerdelan.net']);
  _gaq.push(['_trackPageview']);

  (function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();

</script>

<script>
function get_string_from_URL (url) {
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open ("GET", url, false);
	xmlhttp.send ();
	return xmlhttp.responseText;
}

function pop_content (file, element_name) {
	var path = "posts/" + file;
	var str = get_string_from_URL (path);
	var content_td = document.getElementById (element_name);
	var perma_url = "http://antongerdelan.net/blog/?post=" + file;
	var perma_str = "<small>permalink: <a href=\""+perma_url+"\">"+perma_url+"</a></small><br />";
	content_td.innerHTML = "<div class=\"blog\">" + str + perma_str + "</div>";
	return false;
}
</script>
<!- for Dre to try out the tools. google `webmaster` and gosquared ->
<meta name="google-site-verification" content="HfKbyGGqFOx9KsCQZX-3Fs_GtZlgOaB0KWbXd2tChGg" />
<script>
!function(g,s,q,r,d){r=g[r]=g[r]||function(){(r.q=r.q||[]).push(arguments)};d=s.createElement(q);q=s.getElementsByTagName(q)[0];
d.src='//d1l6p2sc9645hc.cloudfront.net/tracker.js';q.parentNode.
insertBefore(d,q)}(window,document,'script','_gs');
_gs('GSN-803464-M');
</script>
</head>
<body>
<p><a href="../">[home]</a></p>

<h1>Anton's Research Ramblings</h1>

<?php
//$content = file_get_contents ($content_file);
print "<div class=\"postcontent\" valign=\"top\" id=\"content_id\">";
// display the content of default post
$param_post = $_GET['post'];
// allow ?post=2014_01_06
$len = strlen ($param_post);
if ($len >= 10) {
	$content_file = $param_post;
}
print "
<div class=\"sidepanel\" id=\"sidepanel_id\">
";
// read all the posts from index file
$blatest = true;
$content_file = "";
$dir = "posts";
$files = scandir ($dir, 1);
$arrayLength = count($files);
for ($i = 0; $i < $arrayLength - 2; $i++) {
	$fn = $files[$i];
	$content_name = "post_id";
	echo "<a href=\"#\" onclick=\"return pop_content('$fn', '$content_name');\">$fn<br /><br />";
	if ($blatest) {
		$blatest = false;
		$content_file = "$fn";
	}
}
print "</div><div id=\"post_id\">";

//print $content;
$content_name = "post_id";
print "</div></div><script>pop_content (\"$content_file\", '$content_name');</script>";
?>
</body>
</html>
