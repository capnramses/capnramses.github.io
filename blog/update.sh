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

	echo "</body></html>" >> $opf;
done;
cd ..

###
### index page
###
#opf="index.html";
#rm $opf -f
#echo "<!DOCTYPE html><html><head><meta charset=\"UTF-8\">" >> $opf;
#echo "<title>Anton's Research Ramblings - $unformatted</title>" >> $opf;
#echo "<link rel=\"stylesheet\" type="text/css" href=\"..\greysans.css\">" >> $opf;
#echo "<link href=\"https://fonts.googleapis.com/css?family=Ubuntu\" rel=\"stylesheet\"> " >> $opf;
#echo "<link href='https://fonts.googleapis.com/css?family=Source+Code+Pro' rel='stylesheet' type='text/css'>" >> $opf;
#echo "</head><body>" >> $opf;

#echo "<a href=\"../index.html\">[index]</a>" >> $opf;
#echo "<h1>Anton's Research Ramblings</h1><h2>Latest Posts:</h2>" >> $opf;

#
# append first header and paragraph from latest posts
#

#cd posts
#opf="../index.html";
#i=0;
#for unformatted in `ls * | sort -r`; do
	
#	cat $unformatted | head -n 12 >> $opf;
	
#	echo "<br /><br /><a href="formatted/$unformatted.html">[<i>read more...</i>]</a><br /><br />" >> $opf
	
#	i=$(($i+1))
#	if [ "$i" -gt 4 ]
#	then
#		break
#	fi
#done;
#echo "<h2>Archive Index</h2>" >> $opf

#
# print archive index
#
#reverse date order
#cd ../formatted;
#i=0;
#for filename in `ls * | sort -r`; do
#	i=$(($i+1))
#	if [ "$i" -le 5 ]
#	then
#		continue;
#	fi
#	echo "<a href="formatted/$filename">$filename</a><br /><br />" >> $opf
#done;
#cd ..;
#opf="index.html";
#echo "</body></html>" >> $opf;

#
# fix any relative paths to image folder
# gsed is gnu-sed on mac after installing with brew
#gsed -i s@../images/@images/@g $opf
#sed -i s@../images/@images/@g $opf
