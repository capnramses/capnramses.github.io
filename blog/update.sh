#!/bin/bash
cd posts
for unformatted in *; do
	opf="../formatted/$unformatted.html";
	rm $opf -f
	
	echo "<!DOCTYPE html><html><head><meta charset=\"UTF-8\">" >> $opf;
	echo "<title>Anton's Research Ramblings - $unformatted</title>" >> $opf;
	echo "<link rel=\"stylesheet\" type="text/css" href=\"..\..\greysans.css\">" >> $opf;
	echo "<link href=\"https://fonts.googleapis.com/css?family=Ubuntu\" rel=\"stylesheet\"> " >> $opf;
	echo "<link href='https://fonts.googleapis.com/css?family=Source+Code+Pro' rel='stylesheet' type='text/css'>" >> $opf;
	echo "</head><body>" >> $opf;
	
	echo "<a href=\"../index.html\">[index]</a>" >> $opf;
	echo "<h1>Anton's Research Ramblings</h1>" >> $opf;
	
	cat $unformatted >> $opf;
	
	##
	## add disqus message board to footer
	## TODO -- could add in the page url var here
	##
	echo "<div id="disqus_thread"></div>" >> $opf;
	echo "<script>" >> $opf;
	echo "(function() { // DON'T EDIT BELOW THIS LINE" >> $opf;
	echo "	  var d = document, s = d.createElement('script');" >> $opf;
	echo "	  s.src = '//https-capnramses-github-io.disqus.com/embed.js';" >> $opf;
	echo "	  s.setAttribute('data-timestamp', +new Date());" >> $opf;
	echo "	  (d.head || d.body).appendChild(s);" >> $opf;
	echo "})();" >> $opf;
	echo "</script>" >> $opf;
	echo "<noscript>Please enable JavaScript to view the <a href="https://disqus.com/?ref_noscript">comments powered by Disqus.</a></noscript>" >> $opf;

	echo "<script id=\"dsq-count-scr\" src=\"//https-capnramses-github-io.disqus.com/count.js\" async></script>" >> $opf;
	
	echo "</body></html>" >> $opf;
done;
cd ..

###
### index page
###
opf="index.html";
rm $opf -f
echo "<!DOCTYPE html><html><head><meta charset=\"UTF-8\">" >> $opf;
echo "<title>Anton's Research Ramblings - $unformatted</title>" >> $opf;
echo "<link rel=\"stylesheet\" type="text/css" href=\"..\greysans.css\">" >> $opf;
echo "<link href=\"https://fonts.googleapis.com/css?family=Ubuntu\" rel=\"stylesheet\"> " >> $opf;
echo "<link href='https://fonts.googleapis.com/css?family=Source+Code+Pro' rel='stylesheet' type='text/css'>" >> $opf;
echo "</head><body>" >> $opf;

echo "<a href=\"../index.html\">[index]</a>" >> $opf;
echo "<h1>Anton's Research Ramblings</h1><h2>Latest Posts:</h2>" >> $opf;

#
# append first header and paragraph from latest posts
#

cd posts
opf="../index.html";
i=0;
for unformatted in `ls * | sort -r`; do
	
	cat $unformatted | head -n 12 >> $opf;
	
	echo "<br /><br /><a href="formatted/$unformatted.html">[<i>read more...</i>]</a><br /><br />" >> $opf
	
	i=$(($i+1))
	if [ "$i" -gt 4 ]
	then
		break
	fi
done;
echo "<h2>Archive Index</h2>" >> $opf

#
# print archive index
#
#reverse date order
cd ../formatted;
i=0;
for filename in `ls * | sort -r`; do
	i=$(($i+1))
	if [ "$i" -le 5 ]
	then
		continue;
	fi
	echo "<a href="formatted/$filename">$filename</a><br /><br />" >> $opf
done;
cd ..;
opf="index.html";
echo "</body></html>" >> $opf;

#
# fix any relative paths to image folder
#
gnu-sed -i s@../images/@images/@g $opf
